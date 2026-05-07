const Book = require("../models/Book");
const User = require("../models/User");
const Loan = require("../models/Loan");
const Reservation = require("../models/Reservation");

const getAdminStats = async (req, res) => {
  try {
    const [
      catalogBooks,
      registeredUsers,
      booksOnLoan,
      pendingReservations,
      overdueLoans,
      pendingVerification
    ] = await Promise.all([
      Book.countDocuments(),
      User.countDocuments({ role: "member" }),
      Loan.countDocuments({ status: "borrowed" }),
      Reservation.countDocuments({ status: "pending" }),
      Loan.countDocuments({ status: "overdue" }),
      User.countDocuments({ isVerified: false }) // Kung may verification logic ka
    ]);

    // Para sa active borrowers (unique users na may loan)
    const activeBorrowersList = await Loan.distinct("user", { status: "borrowed" });

    res.json({
      catalogBooks,
      registeredUsers,
      activeBorrowers: activeBorrowersList.length,
      booksOnLoan,
      pendingReservations,
      pendingMemberVerification: pendingVerification,
      overdueLoans,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAdminStats };