const express = require("express");
const router = express.Router();
const {
  createReservation,
  getReservations,
  cancelReservation,
  fulfillReservation,
  getMyReservations
} = require("../controllers/reservationController");


const { protect, adminOnly } = require("../middleware/authMiddleware");

// USER ROUTES

router.post("/", protect, createReservation);
router.put("/cancel/:id", protect, cancelReservation);
router.get("/me", protect, getMyReservations);

// ADMIN ROUTES
router.get("/", protect, adminOnly, getReservations);
router.put("/fulfill/:id", protect, adminOnly, fulfillReservation);

module.exports = router;