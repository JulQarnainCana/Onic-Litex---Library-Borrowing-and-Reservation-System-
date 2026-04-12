const express = require("express");
const router = express.Router();

const { getBooks, addBook, deleteBook } = require("../controllers/bookController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/", getBooks);
router.post("/", protect, adminOnly, addBook);
router.delete("/:id", protect, adminOnly, deleteBook);

module.exports = router;