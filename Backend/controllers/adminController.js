const User = require("../models/User");
const Book = require("../models/Book");
const Loan = require("../models/Loan");
const Reservation = require("../models/Reservation");

// DASHBOARD STATS
exports.getAdminStats = async (req, res) => {
  try {
    // Auto-flag any loans where dueDate has passed but still marked "borrowed"
    await Loan.updateMany(
      { status: "borrowed", dueDate: { $lt: new Date() } },
      { $set: { status: "overdue" } }
    );

    const [
      catalogBooks,
      registeredUsers,
      booksOnLoan,
      pendingReservations,
      overdueLoans,
      pendingMemberVerification,
      activeBorrowersList
    ] = await Promise.all([
      Book.countDocuments(),
      User.countDocuments({ role: "member" }),
      Loan.countDocuments({ status: "borrowed" }),
      Reservation.countDocuments({ status: "pending" }),
      Loan.countDocuments({ status: "overdue" }),
      User.countDocuments({ role: "member", status: "inactive" }),
      Loan.distinct("user", { status: "borrowed" })
    ]);

    res.status(200).json({
      catalogBooks,
      registeredUsers,
      activeBorrowers: activeBorrowersList.length,
      booksOnLoan,
      pendingReservations,
      pendingMemberVerification,
      overdueLoans
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// USER MANAGEMENT
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const user = await User.findOneAndUpdate(
      { _id: id, role: { $ne: "admin" } },
      { status },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};
