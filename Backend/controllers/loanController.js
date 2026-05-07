const Loan = require("../models/Loan");
const Book = require("../models/Book");
const User = require("../models/User");
const Notification = require("../models/Notification");

// Max number of books a user can borrow at a time
const MAX_BORROW_LIMIT = 3;

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

    // Check if user has any overdue loans — block borrowing if yes
    const overdueLoans = await Loan.find({ user: userId, status: "overdue" });
    if (overdueLoans.length > 0) {
      return res.status(400).json({
        message: `You have ${overdueLoans.length} overdue book(s). Please return them before borrowing again.`
      });
    }

    // Check borrow limit (active borrowed + overdue count)
    const activeLoans = await Loan.countDocuments({
      user: userId,
      status: { $in: ["borrowed", "overdue"] }
    });
    if (activeLoans >= MAX_BORROW_LIMIT) {
      return res.status(400).json({
        message: `You have reached the maximum borrowing limit of ${MAX_BORROW_LIMIT} books. Please return a book first.`
      });
    }

    // Check if user already has this specific book borrowed
    const existingLoan = await Loan.findOne({
      user: userId,
      book: bookId,
      status: { $in: ["borrowed", "overdue"] }
    });

    if (existingLoan) {
      return res.status(400).json({
        message: "You already borrowed this book and have not returned it yet."
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

// @desc    Get current user's overdue loans (Notifications)
// @route   GET /api/loans/my-notifications
const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const now = new Date();

    // Auto-flag any missed ones on the fly for this user
    await Loan.updateMany(
      { user: userId, status: "borrowed", dueDate: { $lt: now } },
      { $set: { status: "overdue" } }
    );

    const overdueLoans = await Loan.find({
      user: userId,
      status: "overdue"
    })
      .populate("book", "title author isbn image");

    const regularNotifs = await Notification.find({ user: userId })
      .populate("book", "title author isbn image");

    const overdueNotifications = overdueLoans.map(loan => ({
      _id: "overdue_" + loan._id,
      message: "OVERDUE BOOK! Please return it immediately.",
      type: "overdue",
      book: loan.book,
      dueDate: loan.dueDate,
      createdAt: loan.dueDate 
    }));

    const combined = [...overdueNotifications, ...regularNotifs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json(combined);
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

    await Notification.create({
      user: loan.user,
      message: "Your borrowed book has been successfully returned.",
      type: "returned",
      book: loan.book
    });

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

// @desc    Mark all past-due borrowed loans as overdue
// @route   POST /api/loans/mark-overdue  (Admin only — also useful for Postman testing)
const markOverdueLoans = async (req, res) => {
  try {
    const now = new Date();

    // Find all loans that are still "borrowed" but their dueDate has passed
    const result = await Loan.updateMany(
      {
        status: "borrowed",
        dueDate: { $lt: now }
      },
      { $set: { status: "overdue" } }
    );

    res.status(200).json({
      message: `Overdue check complete. ${result.modifiedCount} loan(s) marked as overdue.`,
      markedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all overdue loans (Admin)
// @route   GET /api/loans/overdue
const getOverdueLoans = async (req, res) => {
  try {
    const now = new Date();

    // Also auto-flag any missed ones on the fly
    await Loan.updateMany(
      { status: "borrowed", dueDate: { $lt: now } },
      { $set: { status: "overdue" } }
    );

    const overdueLoans = await Loan.find({ status: "overdue" })
      .populate("user", "name email")
      .populate("book", "title author isbn")
      .sort({ dueDate: 1 });

    res.status(200).json({
      count: overdueLoans.length,
      loans: overdueLoans
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
  getMyNotifications,
  returnBook,
  markOverdueLoans,
  getOverdueLoans
};