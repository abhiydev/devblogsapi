const express = require("express");
const router = express.Router();
const Comments = require("../models/Comments.js");
const verifyToken = require("../verifyToken.js");

// Create Comment
router.post("/create", verifyToken, async (req, res) => {
  try {
    const { text, author, postId, userId } = req.body;
    if (!text || !author || !postId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newComment = new Comments({
      comment: text, // Mapping 'text' from the request to 'comment' in schema
      author,
      postId,
      userId
    });

    const savedComment = await newComment.save();
    res.status(200).json(savedComment);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Update Comment
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const updatedComment = await Comments.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true });

    res.status(200).json(updatedComment);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Delete Comment
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        await Comments.findByIdAndDelete(req.params.id);
        res.status(200).json("Comment deleted");
    } catch (error) {
        res.status(500).json(error);
    }
});

// Get Comments by PostId
router.get('/post/:postId', async (req, res) => {
    try {
        const comments = await Comments.find({ postId: req.params.postId })
                                      .populate('postId')  // Optionally populate post data
                                      .populate('userId'); // Optionally populate user data
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json(error);
    }
});

module.exports = router;
