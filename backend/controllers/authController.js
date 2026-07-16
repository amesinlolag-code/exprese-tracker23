import asyncHandler from "express-async-handler";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { levelFromXp, rankFromLevel, xpProgress, nextRankInfo } from "../utils/gamification.js";

const googleClient = process.env.GOOGLE_CLIENT_ID ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID) : null;

const buildStatus = (user) => {
  const progress = xpProgress(user.xp);
  return {
    xp: user.xp,
    level: progress.level,
    rank: rankFromLevel(progress.level),
    xpIntoLevel: progress.current,
    xpForNextLevel: progress.target,
    nextRank: nextRankInfo(progress.level),
    streak: user.streak,
  };
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please provide name, email and password");
  }

  const userExists = await User.findOne({ email: email.toLowerCase() });
  if (userExists) {
    res.status(400);
    throw new Error("An account with this email already exists");
  }

  const user = await User.create({ name, email, password });
  generateToken(res, user._id);

  res.status(201).json({
    ...user.toSafeObject(),
    status: buildStatus(user),
  });
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide email and password");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);
    res.json({
      ...user.toSafeObject(),
      status: buildStatus(user),
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("jwt", "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out successfully" });
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  res.json({
    ...user.toSafeObject(),
    status: buildStatus(user),
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.name = req.body.name || user.name;
  if (req.body.email) user.email = req.body.email.toLowerCase();
  if (req.body.password) user.password = req.body.password;
  if (typeof req.body.monthlyBudget === "number") user.monthlyBudget = req.body.monthlyBudget;

  const updatedUser = await user.save();
  res.json({
    ...updatedUser.toSafeObject(),
    status: buildStatus(updatedUser),
  });
});

// @desc    Sign in / sign up with a Google ID token
// @route   POST /api/auth/google
// @access  Public
const googleAuth = asyncHandler(async (req, res) => {
  if (!googleClient) {
    res.status(500);
    throw new Error("Google sign-in is not configured on this server");
  }

  const { credential } = req.body;
  if (!credential) {
    res.status(400);
    throw new Error("Missing Google credential");
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (err) {
    res.status(401);
    throw new Error("Invalid Google credential");
  }

  const { sub: googleId, email, name, picture } = payload;

  let user = await User.findOne({ $or: [{ googleId }, { email: email.toLowerCase() }] });

  if (user) {
    // Link the Google account to an existing email/password account if needed
    if (!user.googleId) {
      user.googleId = googleId;
      if (!user.avatarUrl) user.avatarUrl = picture || "";
      await user.save();
    }
  } else {
    user = await User.create({
      name: name || email.split("@")[0],
      email: email.toLowerCase(),
      googleId,
      avatarUrl: picture || "",
    });
  }

  generateToken(res, user._id);
  res.status(200).json({
    ...user.toSafeObject(),
    status: buildStatus(user),
  });
});

export { registerUser, loginUser, logoutUser, googleAuth, getProfile, updateProfile, buildStatus };
