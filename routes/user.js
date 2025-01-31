const express = require("express");
const router = express.Router();
const User = require("../models/User.js");
const bcrypt = require("bcryptjs");
const Post = require("./post.js");
const Comments = require("./comments.js");
const verifyToken = require("../verifyToken.js");

// Update User
router.put("/:id", verifyToken, async function (req, res) {
  try {
    if (req.body.password) {  // Corrected typo here
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hashSync(req.body.password, salt); // Corrected typo here
    }

    const updateUser = await User.findByIdAndUpdate(  // Corrected User model reference
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.status(200).json(updateUser);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Delete User
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);  // Corrected to delete by ID

    await Post.deleteMany({ userId: req.params.id });
    await Comments.deleteMany({ userId: req.params.id });

    res.status(200).json('User deleted successfully');
  } catch (error) {
    res.status(500).json(error);
  }
});

// Get User
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);  // Corrected to use `req`
    const { password, ...info } = user._doc;  // Excluding password from the response
    res.status(200).json(info);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
