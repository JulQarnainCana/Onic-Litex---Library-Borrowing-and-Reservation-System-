const Loan = require("../models/Loan");
const Book = require("../models/Book");
const User = require("../models/User");

// @desc    Borrow a book
// @route   POST /api/loans/borrow
const borrowBook = async (req, res) => {
  try {
    const { bookId } = req.body;
    // Kinukuha ang user ID mula sa auth token
    const userId = req.user._id || req.user.id;

    if (!bookId) {
      return res.status(400).json({ message: "bookId is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (book.availableCopies < 1) {
      return res.status(400).json({ message: "No available copies for this book" });
    }

   
    const existingLoan = await Loan.findOne({
      user: userId,
      book: bookId,
      status: "borrowed"
    });

    if (existingLoan) {
      return res.status(400).json({
        message: "You already borrowed this book and have not returned it yet"
      });
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    const loan = await Loan.create({
      user: userId,
      book: bookId,
      status: "borrowed",
      borrowDate: new Date(),
      dueDate
    });

    book.availableCopies -= 1;
    await book.save();

    const populatedLoan = await Loan.findById(loan._id)
      .populate("user", "name email role")
      .populate("book", "title author isbn image");

    res.status(201).json({
      message: "Book borrowed successfully",
      loan: populatedLoan
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all loans
// @route   GET /api/loans
const getLoans = async (req, res) => {
  try {
    const loans = await Loan.find()
      .populate("user", "name email role")
      .populate("book", "title author isbn image")
      .sort({ createdAt: -1 });

    res.status(200).json(loans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user's active loans
// @route   GET /api/loans/my-loans
const getMyLoans = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const loans = await Loan.find({
      user: userId,
      status: "borrowed"
    })
      .populate("book", "title author isbn image")
      .sort({ createdAt: -1 });

    res.status(200).json(loans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user's returned books history
// @route   GET /api/loans/my-history
const getMyHistory = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const history = await Loan.find({
      user: userId,
      status: "returned"
    })
      .populate("book", "title author isbn image")
      .sort({ returnDate: -1 });

    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Return a book
// @route   PUT /api/loans/return/:id
const returnBook = async (req, res) => {
  try {
    const { id } = req.params;

    const loan = await Loan.findById(id);
    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    if (loan.status === "returned") {
      return res.status(400).json({ message: "Book is already returned" });
    }

    const book = await Book.findById(loan.book);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    loan.status = "returned";
    loan.returnDate = new Date();
    await loan.save();

    book.availableCopies += 1;
    await book.save();

    const updatedLoan = await Loan.findById(loan._id)
      .populate("user", "name email role")
      .populate("book", "title author isbn image");

    res.status(200).json({
      message: "Book returned successfully",
      loan: updatedLoan
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  borrowBook,
  getLoans,
  getMyLoans,
  getMyHistory,
  returnBook
};