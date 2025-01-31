const express = require("express");
const router = express.Router();
const User = require("../models/User.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Register
router.post("/register", async function (req, res) {
  try {
    const { username, email, password } = req.body;

    // Input validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    // Save the user to the database
    const savedUser = await newUser.save();
    res.status(200).json(savedUser);
  } catch (error) {
    console.error("Error registering:", error);
    res
      .status(500)
      .json({ error: "Registration failed", details: error.message });
  }
});

// Login Route
router.post("/login", async function (req, res) {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Compare passwords
    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Wrong password" });
    }

    // Sign a JWT token
    const token = jwt.sign(
      { _id: user._id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "3d" }
    );

    // Exclude password from response
    const { password, ...info } = user._doc;

    // Send token as part of the response
    res.status(200).json({ token, ...info });
    console.log(token)
  } catch (error) {
    console.log("Login Error:", error);
    res.status(500).json({ error: "Login failed", details: error });
  }
});

// Logout
router.get("/logout", async function (req, res) {
  try {
    res
      .clearCookie("token", { sameSite: "None", secure: true })
      .status(200)
      .send("User logged out successfully");
  } catch (error) {
    console.log("Error logging out:", error);
    res.status(500).json({ error: "Logout failed", details: error });
  }
});

// Refetch
router.get("/refetch", async function (req, res) {
  const token = req.cookies.token; // ✅ Reads cookie properly now

  if (!token) {
    return res.status(401).json({ error: "Token missing" });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      console.log("Error refetching:", err);
      return res.status(403).json({ error: "Token invalid", details: err });
    }

    // ✅ Fetch full user details from DB
    try {
      const user = await User.findById(decoded._id).select("-password");
      if (!user) return res.status(404).json({ error: "User not found" });
      
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ error: "Error fetching user", details: error });
    }
  });
});


module.exports = router;
