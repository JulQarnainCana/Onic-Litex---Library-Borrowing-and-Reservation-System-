const express = require("express");
const router = express.Router();
const { getAdminStats, getAllUsers, updateUserStatus } = require("../controllers/adminController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// Dashboard Stats
router.get("/stats", protect, adminOnly, getAdminStats);

// User Management
router.get("/users", protect, adminOnly, getAllUsers);
router.patch("/users/:id/status", protect, adminOnly, updateUserStatus);

module.exports = router;