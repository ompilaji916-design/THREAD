import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { listSlots, createSlot, updateSlot, deleteSlot } from "../controllers/timetableController.js";

const router = Router();
router.use(requireAuth);
router.get("/", listSlots);
router.post("/", createSlot);
router.patch("/:id", updateSlot);
router.delete("/:id", deleteSlot);

export default router;
