const express = require("express");
const router = express.Router();

const {
  borrowBook,
  getLoans,
  getMyLoans,
  getMyHistory,
  getMyNotifications,
  returnBook,
  markOverdueLoans,
  getOverdueLoans
} = require("../controllers/loanController");

// Kunin ang middlewares natin
const { protect, adminOnly } = require("../middleware/authMiddleware");

// ==========================
//        USER ROUTES
// ==========================

router.post("/borrow", protect, borrowBook);

router.get("/my-loans", protect, getMyLoans);

router.get("/my-history", protect, getMyHistory);

router.get("/my-notifications", protect, getMyNotifications);

// ==========================
//       ADMIN ROUTES
// ==========================

// Get all loans
router.get("/", protect, adminOnly, getLoans);

// Return a book
router.put("/return/:id", protect, adminOnly, returnBook);

// Overdue Routes (Admin only)
// POST /api/loans/mark-overdue  -> manually trigger overdue check (great for Postman testing)
router.post("/mark-overdue", protect, adminOnly, markOverdueLoans);

// GET /api/loans/overdue  -> view all overdue loans
router.get("/overdue", protect, adminOnly, getOverdueLoans);

module.exports = router;