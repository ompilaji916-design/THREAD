import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { listInternships, createInternship, applyInternship } from "../controllers/internshipController.js";
import { getTodayChallenge, useHint, submitChallenge, revealSolution, challengeHistory } from "../controllers/challengeController.js";
import { User } from "../models/User.js";

const router = Router();
router.use(requireAuth);

router.get("/internships", listInternships);
router.post("/internships", createInternship);
router.post("/internships/:id/apply", applyInternship);

router.get("/daily-challenge/today", getTodayChallenge);
router.post("/daily-challenge/hint", useHint);
router.post("/daily-challenge/submit", submitChallenge);
router.post("/daily-challenge/reveal", revealSolution);
router.get("/daily-challenge/history", challengeHistory);

router.get("/leaderboard", async (req, res) => {
  const top = await User.find().sort({ xp: -1 }).limit(20).select("name xp college branch");
  const rank = await User.countDocuments({ xp: { $gt: (await User.findById(req.user.userId)).xp } }) + 1;
  res.json({ success: true, data: { top, yourRank: rank } });
});

export default router;
