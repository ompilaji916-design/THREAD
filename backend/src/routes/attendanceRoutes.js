import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  listSubjects, createSubject, updateSubject, deleteSubject, markAttendance, getSummary,
} from "../controllers/attendanceController.js";

const router = Router();
router.use(requireAuth);
router.get("/subjects", listSubjects);
router.post("/subjects", createSubject);
router.patch("/subjects/:id", updateSubject);
router.delete("/subjects/:id", deleteSubject);
router.post("/mark", markAttendance);
router.get("/summary", getSummary);

export default router;
