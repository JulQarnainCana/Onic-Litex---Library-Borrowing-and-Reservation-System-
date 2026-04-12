const Reservation = require("../models/Reservation");
const Book = require("../models/Book");
const User = require("../models/User");
const Loan = require("../models/Loan"); // Import para sa conflict check

const createReservation = async (req, res) => {
  try {
    const { userId, bookId } = req.body;

   
    if (!userId || !bookId) {
      return res.status(400).json({ message: "userId and bookId are required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });

    // 2. CONFLICT PREVENTION: Bawal i-reserve kung available pa ang kopya
    if (book.availableCopies > 0) {
      return res.status(400).json({
        message: "Book is available. You can borrow it instead of reserving."
      });
    }


    const activeLoan = await Loan.findOne({
      user: userId,
      book: bookId,
      status: "borrowed" 
    });

    if (activeLoan) {
      return res.status(400).json({
        message: "You currently have this book on loan. Return it first before reserving."
      });
    }

    
    const existingReservation = await Reservation.findOne({
      user: userId,
      book: bookId,
      status: "pending"
    });

    if (existingReservation) {
      return res.status(400).json({
        message: "You already have a pending reservation for this book"
      });
    }

   
    const reservation = await Reservation.create({
      user: userId,
      book: bookId
    });

    const populatedReservation = await Reservation.findById(reservation._id)
      .populate("user", "name email role")
      .populate("book", "title author isbn image");

    res.status(201).json({
      message: "Reservation created successfully",
      reservation: populatedReservation
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate("user", "name email role")
      .populate("book", "title author isbn image")
      .sort({ createdAt: -1 });
    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await Reservation.findById(id);
    if (!reservation) return res.status(404).json({ message: "Reservation not found" });

    if (reservation.status === "cancelled") return res.status(400).json({ message: "Reservation is already cancelled" });
    if (reservation.status === "fulfilled") return res.status(400).json({ message: "Fulfilled reservation cannot be cancelled" });

    reservation.status = "cancelled";
    await reservation.save();

    const updated = await Reservation.findById(reservation._id).populate("user", "name").populate("book", "title");
    res.status(200).json({ message: "Reservation cancelled successfully", reservation: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const fulfillReservation = async (req, res) => {
  try {
    const { id } = req.params;
    
   
    const reservation = await Reservation.findById(id);
    if (!reservation) return res.status(404).json({ message: "Reservation not found" });

    
    if (reservation.status !== "pending") {
      return res.status(400).json({ message: `Cannot fulfill reservation with status: ${reservation.status}` });
    }

    
    const book = await Book.findById(reservation.book);
    if (!book || book.availableCopies < 1) {
      return res.status(400).json({ message: "No available copies to fulfill this reservation" });
    }

    
    reservation.status = "fulfilled";
    await reservation.save();

    
    book.availableCopies -= 1;
    await book.save();

    
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); 

    await Loan.create({
      user: reservation.user,
      book: reservation.book,
      dueDate: dueDate,
      status: "borrowed" 
    });

    const updated = await Reservation.findById(reservation._id)
      .populate("user", "name")
      .populate("book", "title");

    res.status(200).json({ 
      message: "Reservation fulfilled and book successfully moved to loans", 
      reservation: updated 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyReservations = async (req, res) => {
  try {
   
    console.log("Token Payload (req.user):", req.user); 
    const userId = req.user.id || req.user._id; 

    if (!userId) {
      return res.status(400).json({ message: "User ID not found in token" });
    }

    const reservations = await Reservation.find({ user: userId })
      .populate("book", "title author")
      .sort({ createdAt: -1 });

    res.status(200).json(reservations);
  } catch (error) {
    console.error("Error in getMyReservations:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReservation,
  getReservations,
  cancelReservation,
  fulfillReservation,
  getMyReservations
};