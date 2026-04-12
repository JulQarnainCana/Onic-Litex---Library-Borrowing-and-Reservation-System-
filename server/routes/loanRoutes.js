const express = require("express");
const router = express.Router();


const {
  borrowBook,
  getLoans,
  getMyLoans,
  getMyHistory,
  returnBook
} = require("../controllers/loanController");

// Kunin ang middlewares natin
const { protect, adminOnly } = require("../middleware/authMiddleware");

// ==========================
//        USER ROUTES
// ==========================

router.post("/borrow", protect, borrowBook);


router.get("/my-loans", protect, getMyLoans);


router.get("/my-history", protect, getMyHistory);

// ==========================
//       ADMIN ROUTES
// ==========================
// Ang frontend natin ay tumatawag sa GET /api/loans
router.get("/", protect, adminOnly, getLoans);


router.put("/return/:id", protect, adminOnly, returnBook);

module.exports = router;