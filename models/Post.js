const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    photo: {
      type: String,
      default: "", 
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to User model
      required: true,
    },
    categories: {
      type: [String],
      default: ["tech"],
    },
  },
  { timestamps: true }
);

// When fetching the posts, use populate to get the username
PostSchema.pre("find", function () {
  this.populate("userId", "username"); // Populate the username from the User model
});

module.exports = mongoose.model("Post", PostSchema);
