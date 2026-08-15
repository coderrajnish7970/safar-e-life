const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/find", protect, async (req, res) => {
  try {
    const email = req.query.email;

    if (!email) {
      return res.status(400).json({ message: "email query param is required" });
    }

    const user = await User.findOne({ email: email }).select("_id name email");

    if (!user) {
      return res.status(404).json({ message: "No user found with that email" });
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const emailTrimmed = String(email).trim().toLowerCase();
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(emailTrimmed)) {
      return res.status(400).json({
        message: "Please enter a valid email address (e.g. name@gmail.com)",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    const existingUser = await User.findOne({ email: emailTrimmed });
    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered. Please sign in instead.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name: name.trim(),
      email: emailTrimmed,
      password: hashedPassword,
    });

    const jwtSecret =
      process.env.JWT_SECRET || "splitsmart_super_secret_key_change_later";
    const token = jwt.sign({ userId: newUser._id }, jwtSecret, {
      expiresIn: "7d",
    });

    res.status(201).json({
      message: "User created successfully",
      token,
      user: { id: newUser._id, name: newUser.name, email: newUser.email },
    });
  } catch (err) {
    res.status(400).json({ message: err.message || "Could not create account" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const emailTrimmed = String(email).trim().toLowerCase();

    const user = await User.findOne({ email: emailTrimmed });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const jwtSecret =
      process.env.JWT_SECRET || "splitsmart_super_secret_key_change_later";
    const token = jwt.sign({ userId: user._id }, jwtSecret, {
      expiresIn: "7d",
    });

    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(400).json({ message: err.message || "Could not log in" });
  }
});

// TEST PROTECTED ROUTE
router.get("/profile", protect, async (req, res) => {
  res.json({ message: "You are authenticated", userId: req.user.id });
});

module.exports = router;