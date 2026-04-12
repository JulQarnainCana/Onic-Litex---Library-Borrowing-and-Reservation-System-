const Book = require("../models/Book");

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

module.exports = {
  getBooks,
  addBook,
  deleteBook
};