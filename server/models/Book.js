const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    isbn: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    image: {
      type: String,
      required: true,
      trim: true
    },
    // Eto ang kailangan para sa buttons sa UI
    genre: {
      type: String,
      required: true,
      enum: ["Classic", "Dystopian", "Romance", "Adventure"],
      trim: true
    },
    copies: {
      type: Number,
      required: true,
      default: 1,
      min: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);