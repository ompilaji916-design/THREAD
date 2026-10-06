import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  listExperiences, trending, createExperience, toggleUpvote, toggleBookmark, myBookmarks,
} from "../controllers/experienceController.js";

const router = Router();
router.use(requireAuth);
router.get("/", listExperiences);
router.get("/trending", trending);
router.get("/bookmarks", myBookmarks);
router.post("/", createExperience);
router.post("/:id/upvote", toggleUpvote);
router.post("/:id/bookmark", toggleBookmark);

export default router;
