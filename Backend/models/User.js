const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["member", "admin"],
      default: "member"
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    },
    savedBooks: [
      {
        book: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Book",
          required: true
        },
        savedAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

userSchema.index({ _id: 1, "savedBooks.book": 1 });

module.exports = mongoose.model("User", userSchema);
