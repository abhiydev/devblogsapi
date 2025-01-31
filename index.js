const express = require("express");
const mongoose = require("mongoose");
const env = require("dotenv");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const { v4: uuidv4 } = require('uuid');  // Import UUID to generate unique filenames

const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");
const commentRoute = require("./routes/comments");
const postRoute = require("./routes/post");

env.config();
const app = express();
const PORT = process.env.PORT || 8000;

// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true, // Enable cookies & authentication headers
};
app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(cookieParser());

// Static file serving (Serving directly from the "server/images" folder)
app.use("/images", express.static(path.join(__dirname, "images")));

// Routes
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/comments", commentRoute);

// Multer storage configuration (Save files to the "server/images" folder with unique filenames)
const storage = multer.diskStorage({
  destination: (req, file, fn) => {
    const uploadPath = path.join(__dirname, "images");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    fn(null, uploadPath);
  },
  filename: (req, file, fn) => {
    const uniqueName = file.originalname;  // Generate unique file name
    fn(null, uniqueName);  // Set the filename for the uploaded file
  },
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true); // Accept image files
  } else {
    cb(new Error("Only image files are allowed"), false); // Reject non-image files
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// Image upload route
app.post("/api/upload", upload.single("img"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  // Construct the file path for the uploaded image
  const filePath = `/images/${req.file.filename}`;  // Image URL path to be stored in DB
  console.log("File uploaded to:", filePath); // Debugging output

  // Return the file path in the response
  res.status(200).json({ message: "Image uploaded successfully", filename: filePath });
});

// Global error handler for multer errors
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  } else if (err) {
    return res.status(500).json({ message: "Something went wrong", details: err.message });
  }
});

// MongoDB Connection & Server Start
const ConnectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("DB Connected");
    app.listen(PORT, () => console.log(`Server started at port: ${PORT}`));
  } catch (error) {
    console.log("Error connecting DB", error);
    process.exit(1); // Stop server if DB connection fails
  }
};

ConnectDB();