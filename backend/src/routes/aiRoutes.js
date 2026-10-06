import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { aiLimiter } from "../middleware/rateLimiters.js";
import {
  createEmail, listEmails, createResume, listResumes,
  askDoubt, doubtHistory, createStudyPlan, listStudyPlans, toggleTask,
} from "../controllers/aiController.js";

const router = Router();
router.use(requireAuth);
router.post("/email", aiLimiter, createEmail);
router.get("/email", listEmails);
router.post("/resume", aiLimiter, createResume);
router.get("/resume", listResumes);
router.post("/doubt", aiLimiter, askDoubt);
router.get("/doubt/history", doubtHistory);
router.post("/study-plan", aiLimiter, createStudyPlan);
router.get("/study-plan", listStudyPlans);
router.patch("/study-plan/task", toggleTask);

export default router;
