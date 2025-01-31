const express = require("express");
const router = express.Router();
const Posts = require("../models/Post.js");
const User = require("../models/User.js");
const verifyToken = require("../verifyToken.js");

const BASE_URL = "http://localhost:8000/images"; // Base URL for image access

// Post creation route to save posts along with image URL
router.post("/create", verifyToken, async (req, res) => {
  try {
    const { title, desc, categories, photo } = req.body;
    const userId = req.userId; // Assuming verifyToken middleware sets req.userId

    if (!title || !desc) {
      return res.status(400).json({ error: "Title and description are required." });
    }

    const photoPath = photo ? `${BASE_URL}/${photo}` : "";  // Construct the correct URL for the photo

    const newPost = new Posts({
      title,
      desc,
      userId,
      username: userId.username,
      categories,
      photo: photoPath,  // Save the photo URL in the DB
    });

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create post", details: error.message });
  }
});

// ✅ Update a post (only the owner can update)
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Ensure only the owner can update the post
    if (post.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized action." });
    }

    let updatedPostData = { ...req.body };

    // If there's a new photo, handle the file upload
    if (req.body.photo) {
      const photoPath = `${BASE_URL}/${req.body.photo}`;
      updatedPostData.photo = photoPath;  // Update the photo URL
    }

    const updatedPost = await Posts.findByIdAndUpdate(req.params.id, { $set: updatedPostData }, { new: true });
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: "Error updating post", error: error.message });
  }
});


// ✅ Delete a post (only the owner can delete)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Ensure only the owner can delete the post
    if (post.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized action." });
    }

    await Posts.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting post", error: error.message });
  }
});

// ✅ Get a specific post by ID (includes user details)
router.get("/:id", async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id).populate("userId", "username"); // Populate only the username field
    if (!post) return res.status(404).json({ message: "Post not found" });

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: "Error fetching post", error: error.message });
  }
});

// ✅ Get all posts with search functionality
router.get("/", async (req, res) => {
  try {
    const searchFilter = req.query.search
      ? { title: { $regex: req.query.search, $options: "i" } }
      : {};
    const posts = await Posts.find(searchFilter)
      .sort({ createdAt: -1 })
      .populate("userId", "username"); // Populate only the username field
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts", error: error.message });
  }
});

// ✅ Get posts by user ID
router.get("/user/:userId", async (req, res) => {
  try {
    const posts = await Posts.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user posts", error: error.message });
  }
});

module.exports = router;
