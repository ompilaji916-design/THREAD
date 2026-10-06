import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { logMood, moodTrend } from "../controllers/wellnessController.js";
import { startWalk, markSafe, triggerSOS, walkHistory, safetyTip } from "../controllers/safetyController.js";

const router = Router();
router.use(requireAuth);

router.post("/mood", logMood);
router.get("/mood/trend", moodTrend);

router.post("/safewalk/start", startWalk);
router.patch("/safewalk/:id/safe", markSafe);
router.patch("/safewalk/:id/sos", triggerSOS);
router.get("/safewalk/history", walkHistory);
router.get("/safewalk/tip", safetyTip);

export default router;
