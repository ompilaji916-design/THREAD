import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { listSemesters, saveSemester, deleteSemester } from "../controllers/cgpaController.js";

const router = Router();
router.use(requireAuth);
router.get("/", listSemesters);
router.post("/semester", saveSemester);
router.delete("/semester/:id", deleteSemester);

export default router;
