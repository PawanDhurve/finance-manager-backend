const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const passport = require("passport");
const User = require("../models/userModel");
const router = express.Router();
const nodemailer = require("nodemailer");
const verifyToken = require("../middleware/authMiddleware");

console.log("✅ Auth.js loaded and routes are active");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Standard Signup
router.post("/signup", async (req, res) => {
  console.log("✅ Signup Route Hit");
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    const user = new User({ name, email, password });
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Standard Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Logout
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logout successful" });
});

// Social Login Routes
const socialAuthHandler = (provider) => [
  passport.authenticate(provider, { scope: ["profile", "email"] }),
  (req, res) => {
    res.redirect(`http://localhost:3000/dashboard?token=${req.user.token}`);
  },
];

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport.authenticate("google", { session: false }), (req, res) => {
  res.redirect(`http://localhost:3000/dashboard?token=${req.user.token}`);
});

router.get("/facebook", passport.authenticate("facebook", { scope: ["email"] }));
router.get("/facebook/callback", passport.authenticate("facebook", { session: false }), (req, res) => {
  res.redirect(`http://localhost:3000/dashboard?token=${req.user.token}`);
});

router.get("/linkedin", passport.authenticate("linkedin", { scope: ["r_emailaddress", "r_liteprofile"] }));
router.get("/linkedin/callback", passport.authenticate("linkedin", { session: false }), (req, res) => {
  res.redirect(`http://localhost:3000/dashboard?token=${req.user.token}`);
});

router.get("/twitter", passport.authenticate("twitter"));
router.get("/twitter/callback", passport.authenticate("twitter", { session: false }), (req, res) => {
  res.redirect(`http://localhost:3000/dashboard?token=${req.user.token}`);
});

router.get("/protected", verifyToken, (req, res) => {
  res.json({ message: "You have access!", user: req.user });
});

console.log("📌 Registered Auth Routes:");
router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(`${r.route.stack[0].method.toUpperCase()} ${r.route.path}`);
  }
});

module.exports = router;
