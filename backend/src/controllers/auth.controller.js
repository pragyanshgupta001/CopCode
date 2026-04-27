import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/User.js";
import { v2 as cloudinary } from "cloudinary";

let isCloudinaryConfigured = false;
const ensureCloudinaryConfigured = () => {
  if (isCloudinaryConfigured) return;
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    throw new Error("Cloudinary environment variables are missing");
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  isCloudinaryConfigured = true;
};

// JWT cookie helper
const setTokenCookie = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.cookie("jwt", token, {
    httpOnly: true,
    sameSite: "strict",
    secure:   process.env.NODE_ENV === "production",
    maxAge:   7 * 24 * 60 * 60 * 1000,
  });
  return token;
};

const safeUser = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  email: user.email,
  profilePic: user.profilePic,
  dob: user.dob,
  education: user.education,
  description: user.description,
  createdAt: user.createdAt,
});

export const signup = async (req, res) => {
  try {
    const { fullName, email, password, dob } = req.body;

    if (!fullName || !email || !password || !dob)
      return res.status(400).json({ message: "All fields are required" });
    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    if (await User.findOne({ email }))
      return res.status(400).json({ message: "Email already in use" });

    const parsedDob = new Date(dob);
    if (Number.isNaN(parsedDob.getTime())) {
      return res.status(400).json({ message: "Invalid date of birth" });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user   = await User.create({ fullName, email, password: hashed, dob: parsedDob });

    setTokenCookie(res, user._id);
    return res.status(201).json({ user: safeUser(user) });

  } catch (err) {
    console.error("signup:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: "Invalid credentials" });

    setTokenCookie(res, user._id);
    return res.status(200).json({ user: safeUser(user) });

  } catch (err) {
    console.error("login:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = (req, res) => {
  res.clearCookie("jwt");
  return res.status(200).json({ message: "Logged out successfully" });
};

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -resetPasswordToken -resetPasswordExpires");
    if (!user) return res.status(401).json({ message: "User not found" });
    return res.status(200).json({ user: safeUser(user) });
  } catch (err) {
    console.error("checkAuth:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullName, dob, education, description } = req.body;
    const userId = req.user._id;

    const updates = {};
    if (fullName?.trim()) updates.fullName = fullName.trim();
    if (dob !== undefined) updates.dob = dob || null;
    if (education !== undefined) updates.education = education?.trim() || "";
    if (description !== undefined) updates.description = description?.trim() || "";

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password -resetPasswordToken -resetPasswordExpires");

    return res.status(200).json({ user: safeUser(user), message: "Profile updated" });

  } catch (err) {
    console.error("updateProfile:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const uploadProfilePic = async (req, res) => {
  try {
    ensureCloudinaryConfigured();

    const { image } = req.body;
    if (!image) return res.status(400).json({ message: "No image provided" });

    const userId = req.user._id;
    const user   = await User.findById(userId);

    if (user.profilePic) {
      const parts = user.profilePic.split("/");
      const pub  = parts[parts.length - 1].replace(/\.[^.]+$/, "");
      const folder = parts[parts.length - 2];
      try { await cloudinary.uploader.destroy(`${folder}/${pub}`); } catch { /* ignore */ }
    }

    const result = await cloudinary.uploader.upload(image, {
      folder: "copcode/profiles",
      transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
    });

    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: { profilePic: result.secure_url } },
      { new: true }
    ).select("-password");

    return res.status(200).json({
      user:       safeUser(updated),
      profilePic: result.secure_url,
      message:    "Profile picture updated",
    });

  } catch (err) {
    console.error("uploadProfilePic:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword)
      return res.status(400).json({ message: "Both passwords required" });
    if (newPassword.length < 6)
      return res.status(400).json({ message: "New password must be at least 6 characters" });

    const user = await User.findById(req.user._id);
    const ok   = await bcrypt.compare(oldPassword, user.password);
    if (!ok) return res.status(401).json({ message: "Old password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    return res.status(200).json({ message: "Password changed successfully" });

  } catch (err) {
    console.error("changePassword:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email, dob, newPassword } = req.body;
    if (!email || !dob || !newPassword) {
      return res.status(400).json({ message: "Email, DOB and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.dob) {
      return res.status(400).json({ message: "Date of birth is not set for this account" });
    }

    const inputDob = new Date(dob);
    if (Number.isNaN(inputDob.getTime())) {
      return res.status(400).json({ message: "Invalid date of birth" });
    }

    const normalizeDate = (d) => d.toISOString().slice(0, 10);
    if (normalizeDate(user.dob) !== normalizeDate(inputDob)) {
      return res.status(401).json({ message: "DOB verification failed" });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.status(200).json({ message: "Password changed successfully. Please log in." });

  } catch (err) {
    console.error("forgotPassword:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!token || !newPassword)
      return res.status(400).json({ message: "Token and new password required" });
    if (newPassword.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken:   hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Reset link is invalid or has expired" });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.status(200).json({ message: "Password reset successfully. You can now log in." });

  } catch (err) {
    console.error("resetPassword:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};
