const Book = require("../models/Book");
const User = require("../models/User");

// GET BOOKS WITH FILTERS AND SEARCH
const getBooks = async (req, res) => {
  try {
    const { genre, search } = req.query;
    let query = {};

    // Filter by Genre (para sa Buttons)
    if (genre && genre !== "All") {
      query.genre = genre;
    }

    // Search by Title or Author (para sa Search Bar)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } }
      ];
    }

    const books = await Book.find(query).sort({ createdAt: -1 });
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADD BOOK (SINGLE OR MULTIPLE)
const addBook = async (req, res) => {
  try {
    const data = req.body;

    // Handle Array of Books
    if (Array.isArray(data)) {
      if (data.length === 0) {
        return res.status(400).json({ message: "Books array is empty" });
      }

      for (const book of data) {
        const { title, author, isbn, description, image, genre, copies } = book;

        if (!title || !author || !isbn || !description || !image || !genre || !copies) {
          return res.status(400).json({
            message: "Each book must have title, author, isbn, description, image, genre, and copies"
          });
        }

        if (Number(copies) < 1) {
          return res.status(400).json({
            message: `Copies must be at least 1 for ISBN: ${isbn}`
          });
        }
      }

      const isbns = data.map((book) => book.isbn);
      const existingBooks = await Book.find({ isbn: { $in: isbns } });

      if (existingBooks.length > 0) {
        return res.status(400).json({
          message: "Some books already exist",
          existingISBNs: existingBooks.map((book) => book.isbn)
        });
      }

      const booksToInsert = data.map((book) => ({
        ...book,
        copies: Number(book.copies),
        availableCopies: Number(book.copies)
      }));

      const insertedBooks = await Book.insertMany(booksToInsert);

      return res.status(201).json({
        message: "Books added successfully",
        count: insertedBooks.length,
        books: insertedBooks
      });
    }

    // Handle Single Book
    const { title, author, isbn, description, image, genre, copies } = data;

    if (!title || !author || !isbn || !description || !image || !genre || !copies) {
      return res.status(400).json({
        message: "Please fill in all required fields including genre"
      });
    }

    const existingBook = await Book.findOne({ isbn });
    if (existingBook) {
      return res.status(400).json({ message: "Book already exists" });
    }

    const parsedCopies = Number(copies);
    if (isNaN(parsedCopies) || parsedCopies < 1) {
      return res.status(400).json({ message: "Copies must be at least 1" });
    }

    const book = await Book.create({
      title,
      author,
      isbn,
      description,
      image,
      genre,
      copies: parsedCopies,
      availableCopies: parsedCopies
    });

    return res.status(201).json({
      message: "Book added successfully",
      book
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE BOOK
const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    await book.deleteOne();
    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, isbn, description, image, genre, copies } = req.body;

    if (!title || !author || !isbn || !description || !image || !genre || !copies) {
      return res.status(400).json({
        message: "Please fill in all required fields including genre"
      });
    }

    const parsedCopies = Number(copies);
    if (isNaN(parsedCopies) || parsedCopies < 1) {
      return res.status(400).json({ message: "Copies must be at least 1" });
    }

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    const duplicateBook = await Book.findOne({ isbn, _id: { $ne: id } });
    if (duplicateBook) {
      return res.status(400).json({ message: "Another book already uses this ISBN" });
    }

    const borrowedCopies = Math.max((book.copies || 0) - (book.availableCopies || 0), 0);
    if (parsedCopies < borrowedCopies) {
      return res.status(400).json({
        message: `Copies cannot be less than ${borrowedCopies} because some copies are currently borrowed`
      });
    }

    book.title = title.trim();
    book.author = author.trim();
    book.isbn = isbn.trim();
    book.description = description.trim();
    book.image = image.trim();
    book.genre = genre;
    book.copies = parsedCopies;
    book.availableCopies = parsedCopies - borrowedCopies;

    await book.save();

    res.status(200).json({
      message: "Book updated successfully",
      book
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSavedBooks = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("savedBooks.book");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const savedBooks = user.savedBooks
      .filter((entry) => entry.book)
      .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))
      .map((entry) => ({
        _id: entry.book._id,
        title: entry.book.title,
        author: entry.book.author,
        image: entry.book.image,
        genre: entry.book.genre,
        description: entry.book.description,
        isbn: entry.book.isbn,
        availableCopies: entry.book.availableCopies,
        savedAt: entry.savedAt
      }));

    res.status(200).json(savedBooks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const saveBook = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const alreadySaved = user.savedBooks.some((entry) => String(entry.book) === id);
    if (alreadySaved) {
      return res.status(400).json({ message: "Book already saved" });
    }

    user.savedBooks.unshift({ book: id, savedAt: new Date() });
    await user.save();

    res.status(201).json({ message: "Book saved successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeSavedBook = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const originalLength = user.savedBooks.length;
    user.savedBooks = user.savedBooks.filter((entry) => String(entry.book) !== id);

    if (user.savedBooks.length === originalLength) {
      return res.status(404).json({ message: "Saved book not found" });
    }

    await user.save();
    res.status(200).json({ message: "Book removed from saved list" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getBooks,
  addBook,
  updateBook,
  deleteBook,
  getSavedBooks,
  saveBook,
  removeSavedBook
};
