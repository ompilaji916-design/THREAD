import rateLimit from "express-rate-limit";

export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { success: false, error: "AI rate limit reached (20/hour). Try again soon.", code: "AI_RATE_LIMIT" },
});
