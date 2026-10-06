import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  listNotices, createNotice, reactNotice, rsvpNotice,
  listHostelRequests, createHostelRequest, updateHostelRequest,
  listMarketItems, createMarketItem, toggleSaveItem, markSold,
} from "../controllers/campusController.js";

const router = Router();
router.use(requireAuth);

router.get("/notices", listNotices);
router.post("/notices", createNotice);
router.post("/notices/:id/react", reactNotice);
router.post("/notices/:id/rsvp", rsvpNotice);

router.get("/hostel-requests", listHostelRequests);
router.post("/hostel-requests", createHostelRequest);
router.patch("/hostel-requests/:id", updateHostelRequest);

router.get("/marketplace", listMarketItems);
router.post("/marketplace", createMarketItem);
router.post("/marketplace/:id/save", toggleSaveItem);
router.patch("/marketplace/:id/sold", markSold);

export default router;
