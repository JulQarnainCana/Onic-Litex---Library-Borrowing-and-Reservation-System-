const express = require("express");
const router = express.Router();

const { getBooks, addBook, updateBook, deleteBook, getSavedBooks, saveBook, removeSavedBook } = require("../controllers/bookController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/", getBooks);
router.get("/saved", protect, getSavedBooks);
router.post("/:id/save", protect, saveBook);
router.delete("/:id/save", protect, removeSavedBook);
router.post("/", protect, adminOnly, addBook);
router.put("/:id", protect, adminOnly, updateBook);
router.delete("/:id", protect, adminOnly, deleteBook);

module.exports = router;
