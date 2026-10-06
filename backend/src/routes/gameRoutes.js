import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { listLevels, completeLevel } from "../controllers/gameController.js";

const router = Router();
router.use(requireAuth);
router.get("/levels", listLevels);
router.post("/complete", completeLevel);

export default router;
