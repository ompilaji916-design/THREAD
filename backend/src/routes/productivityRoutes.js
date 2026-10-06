import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  listHabits, createHabit, toggleHabitToday, deleteHabit,
  listGoals, createGoal, toggleMilestone, deleteGoal,
  logFocusSession, focusStats,
} from "../controllers/productivityController.js";

const router = Router();
router.use(requireAuth);

router.get("/habits", listHabits);
router.post("/habits", createHabit);
router.patch("/habits/:id/toggle", toggleHabitToday);
router.delete("/habits/:id", deleteHabit);

router.get("/goals", listGoals);
router.post("/goals", createGoal);
router.patch("/goals/:id/milestones/:milestoneId/toggle", toggleMilestone);
router.delete("/goals/:id", deleteGoal);

router.post("/focus/sessions", logFocusSession);
router.get("/focus/stats", focusStats);

export default router;
