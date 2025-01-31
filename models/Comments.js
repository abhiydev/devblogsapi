const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId, // Use ObjectId for references
      required: true,
      ref: "Post", // Optional: references the "Post" model
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId, // Use ObjectId for references
      ref: "User", // Optional: references the "User" model
    },
  },
  { timestamps: true } // This will automatically add createdAt and updatedAt fields
);

module.exports = mongoose.model("Comment", CommentSchema);
