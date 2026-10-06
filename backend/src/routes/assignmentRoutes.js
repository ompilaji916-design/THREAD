import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { listAssignments, createAssignment, updateAssignment, deleteAssignment, bulkUpdate } from "../controllers/assignmentController.js";

const router = Router();
router.use(requireAuth);
router.get("/", listAssignments);
router.post("/", createAssignment);
router.patch("/bulk", bulkUpdate);
router.patch("/:id", updateAssignment);
router.delete("/:id", deleteAssignment);

export default router;
