import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  signup, login, me, verifyEmail, resendVerification, forgotPassword, resetPassword,
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Protect auth endpoints from brute force: 10 attempts / 15 min / IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: "Too many attempts. Please wait 15 minutes.", code: "RATE_LIMIT" },
});

// Tighter limit on password-reset requests specifically, so it can't be used to spam someone's inbox
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { success: false, error: "Too many reset requests. Please wait 15 minutes.", code: "RATE_LIMIT" },
});

router.post("/signup", authLimiter, signup);
router.post("/login", authLimiter, login);
router.get("/me", requireAuth, me);

router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", requireAuth, resendVerification);

router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);

export default router;
