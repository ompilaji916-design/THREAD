import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { listComplaints, createComplaint, updateComplaintStatus, upvoteComplaint, commentComplaint } from "../controllers/complaintController.js";
import { listRoutes, updateBusLocation, createRoute } from "../controllers/busController.js";
import { listItems, createItem, resolveItem } from "../controllers/lostFoundController.js";
import { getMyAllocation, setPreferences, runAllocation } from "../controllers/roomAllocationController.js";
import { listProfiles, getMyProfile, updateProfile, completeSession } from "../controllers/skillExchangeController.js";

const router = Router();
router.use(requireAuth);

// Complaint Portal
router.get("/complaints", listComplaints);
router.post("/complaints", createComplaint);
router.patch("/complaints/:id/status", updateComplaintStatus);
router.post("/complaints/:id/upvote", upvoteComplaint);
router.post("/complaints/:id/comment", commentComplaint);

// Bus Tracking
router.get("/bus-routes", listRoutes);
router.post("/bus-routes", createRoute);
router.patch("/bus-routes/:id/location", updateBusLocation);

// Lost & Found
router.get("/lost-found", listItems);
router.post("/lost-found", createItem);
router.patch("/lost-found/:id/resolve", resolveItem);

// Room Allocation
router.get("/room-allocation/me", getMyAllocation);
router.put("/room-allocation/preferences", setPreferences);
router.post("/room-allocation/run", runAllocation);

// Skill Exchange
router.get("/skill-exchange", listProfiles);
router.get("/skill-exchange/me", getMyProfile);
router.put("/skill-exchange/me", updateProfile);
router.post("/skill-exchange/:teacherId/complete-session", completeSession);

export default router;
