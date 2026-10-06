import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../models/User.js";
import { Emails } from "../services/emailService.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes
const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function makeToken(user) {
  return jwt.sign(
    { userId: user._id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function makeRawAndHashedToken() {
  const raw = crypto.randomBytes(32).toString("hex");
  const hashed = crypto.createHash("sha256").update(raw).digest("hex");
  return { raw, hashed };
}

// A simple, real password policy: 8+ chars, at least one letter and one number.
// Not asking for special characters — that just pushes people toward "Password1!" which isn't meaningfully stronger.
function isStrongPassword(pw) {
  return typeof pw === "string" && pw.length >= 8 && /[a-zA-Z]/.test(pw) && /[0-9]/.test(pw);
}

// Returns +1 if last login was yesterday, 1 if gap or first login, or current streak if today
function computeStreak(lastLoginDate, currentStreak) {
  if (!lastLoginDate) return 1;
  const last = new Date(lastLoginDate);
  const now = new Date();
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((startOfDay(now) - startOfDay(last)) / 86400000);
  if (diffDays === 0) return currentStreak; // already logged in today
  if (diffDays === 1) return currentStreak + 1; // consecutive day
  return 1; // gap — reset
}

export async function signup(req, res) {
  try {
    const { name, email, password, college, branch, year } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: "Name, email, and password are required", code: "MISSING_FIELDS" });
    }
    if (!isStrongPassword(password)) {
      return res.status(400).json({ success: false, error: "Password must be at least 8 characters and include a letter and a number", code: "WEAK_PASSWORD" });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, error: "An account with this email already exists", code: "EMAIL_EXISTS" });
    }
    const hashed = await bcrypt.hash(password, 12);
    const { raw: verifyRaw, hashed: verifyHashed } = makeRawAndHashedToken();

    const user = await User.create({
      name, email, password: hashed, college, branch, year,
      xp: 50, loginStreak: 1, lastLoginDate: new Date(),
      emailVerificationToken: verifyHashed,
      emailVerificationExpires: new Date(Date.now() + VERIFY_TOKEN_TTL_MS),
    });

    const token = makeToken(user);
    Emails.welcome(user);
    Emails.verifyEmail(user, verifyRaw);

    return res.status(201).json({ success: true, data: { token, user }, message: "Welcome to THREAD! +50 XP for joining. Check your email to verify your account." });
  } catch (err) {
    console.error("Auth error (signup):", err.message);
    return res.status(500).json({ success: false, error: "Something went wrong", code: "SERVER_ERROR" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    // need +password and the lockout fields since they're select:false in the schema
    const user = await User.findOne({ email: (email || "").toLowerCase() })
      .select("+password +failedLoginAttempts +lockUntil");

    if (!user) {
      return res.status(401).json({ success: false, error: "No account with this email", code: "NO_ACCOUNT" });
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockUntil - new Date()) / 60000);
      return res.status(423).json({
        success: false,
        error: `Too many failed attempts. Try again in ${minutesLeft} minute${minutesLeft === 1 ? "" : "s"}.`,
        code: "ACCOUNT_LOCKED",
      });
    }

    const match = await bcrypt.compare(password || "", user.password);
    if (!match) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
        user.failedLoginAttempts = 0;
        await user.save();
        return res.status(423).json({ success: false, error: "Too many failed attempts. Account locked for 15 minutes.", code: "ACCOUNT_LOCKED" });
      }
      await user.save();
      return res.status(401).json({ success: false, error: "Incorrect password", code: "BAD_PASSWORD" });
    }

    // Successful login — clear any lockout state
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    user.loginStreak = computeStreak(user.lastLoginDate, user.loginStreak);
    user.lastLoginDate = new Date();
    await user.save();

    const token = makeToken(user);
    return res.status(200).json({ success: true, data: { token, user }, message: "Logged in" });
  } catch (err) {
    console.error("Auth error (login):", err.message);
    return res.status(500).json({ success: false, error: "Something went wrong", code: "SERVER_ERROR" });
  }
}

export async function me(req, res) {
  const user = await User.findById(req.user.userId);
  if (!user) return res.status(404).json({ success: false, error: "User not found", code: "NOT_FOUND" });
  return res.status(200).json({ success: true, data: { user } });
}

// ---- Email verification ----
export async function verifyEmail(req, res) {
  try {
    const { token } = req.params;
    const hashed = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      emailVerificationToken: hashed,
      emailVerificationExpires: { $gt: new Date() },
    }).select("+emailVerificationToken +emailVerificationExpires");

    if (!user) {
      return res.status(400).json({ success: false, error: "This verification link is invalid or has expired", code: "BAD_TOKEN" });
    }
    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();
    return res.json({ success: true, message: "Email verified!" });
  } catch (err) {
    console.error("Auth error (verifyEmail):", err.message);
    return res.status(500).json({ success: false, error: "Something went wrong", code: "SERVER_ERROR" });
  }
}

export async function resendVerification(req, res) {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, error: "User not found", code: "NOT_FOUND" });
    if (user.emailVerified) return res.json({ success: true, message: "Your email is already verified" });

    const { raw, hashed } = makeRawAndHashedToken();
    user.emailVerificationToken = hashed;
    user.emailVerificationExpires = new Date(Date.now() + VERIFY_TOKEN_TTL_MS);
    await user.save();
    Emails.verifyEmail(user, raw);
    return res.json({ success: true, message: "Verification email sent" });
  } catch (err) {
    console.error("Auth error (resendVerification):", err.message);
    return res.status(500).json({ success: false, error: "Something went wrong", code: "SERVER_ERROR" });
  }
}

// ---- Forgot / reset password ----
// Always returns the same success message whether or not the email exists,
// so this endpoint can't be used to check which emails have accounts.
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: "Email is required", code: "MISSING_FIELDS" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      const { raw, hashed } = makeRawAndHashedToken();
      user.resetPasswordToken = hashed;
      user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
      await user.save();
      Emails.passwordReset(user, raw);
    }
    return res.json({ success: true, message: "If an account exists with that email, a reset link has been sent." });
  } catch (err) {
    console.error("Auth error (forgotPassword):", err.message);
    return res.status(500).json({ success: false, error: "Something went wrong", code: "SERVER_ERROR" });
  }
}

export async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ success: false, error: "Token and new password are required", code: "MISSING_FIELDS" });
    if (!isStrongPassword(password)) {
      return res.status(400).json({ success: false, error: "Password must be at least 8 characters and include a letter and a number", code: "WEAK_PASSWORD" });
    }

    const hashed = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: new Date() },
    }).select("+resetPasswordToken +resetPasswordExpires +failedLoginAttempts +lockUntil");

    if (!user) {
      return res.status(400).json({ success: false, error: "This reset link is invalid or has expired", code: "BAD_TOKEN" });
    }

    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    return res.json({ success: true, message: "Password reset. You can log in now." });
  } catch (err) {
    console.error("Auth error (resetPassword):", err.message);
    return res.status(500).json({ success: false, error: "Something went wrong", code: "SERVER_ERROR" });
  }
}
