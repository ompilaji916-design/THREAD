import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoSanitize from "express-mongo-sanitize";
import { createServer } from "http";
import { Server } from "socket.io";
import { connectDatabase } from "./src/config/database.js";
import { setIO } from "./src/services/socketService.js";
import { startCronJobs } from "./src/services/cronService.js";

import authRoutes from "./src/routes/authRoutes.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";
import attendanceRoutes from "./src/routes/attendanceRoutes.js";
import cgpaRoutes from "./src/routes/cgpaRoutes.js";
import assignmentRoutes from "./src/routes/assignmentRoutes.js";
import timetableRoutes from "./src/routes/timetableRoutes.js";
import experienceRoutes from "./src/routes/experienceRoutes.js";
import aiRoutes from "./src/routes/aiRoutes.js";
import campusRoutes from "./src/routes/campusRoutes.js";
import financeRoutes from "./src/routes/financeRoutes.js";
import lifeRoutes from "./src/routes/lifeRoutes.js";
import careerRoutes from "./src/routes/careerRoutes.js";
import gameRoutes from "./src/routes/gameRoutes.js";
import profileRoutes from "./src/routes/profileRoutes.js";
import newCampusRoutes from "./src/routes/newCampusRoutes.js";
import productivityRoutes from "./src/routes/productivityRoutes.js";

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const io = new Server(httpServer, { cors: { origin: CLIENT_URL, methods: ["GET", "POST"] } });
setIO(io);

app.use(helmet());
app.use(cors({ origin: CLIENT_URL }));
app.use(express.json({ limit: "5mb" }));
app.use(mongoSanitize()); // strips any $ or . operators from user input, blocking NoSQL injection
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/api/v1/health", (req, res) => {
  res.json({ success: true, message: "THREAD backend is running", uptime: process.uptime() });
});

// Foundation
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/profile", profileRoutes);

// Academic
app.use("/api/v1/attendance", attendanceRoutes);
app.use("/api/v1/cgpa", cgpaRoutes);
app.use("/api/v1/assignments", assignmentRoutes);
app.use("/api/v1/timetable", timetableRoutes);
app.use("/api/v1/learning-thread", experienceRoutes);

// AI
app.use("/api/v1/ai", aiRoutes);

// Campus
app.use("/api/v1/campus", campusRoutes);
app.use("/api/v1/campus", newCampusRoutes); // extended campus modules share the same prefix

// Finance & Life
app.use("/api/v1/finance", financeRoutes);
app.use("/api/v1/life", lifeRoutes);
app.use("/api/v1/productivity", productivityRoutes);

// Career & Game
app.use("/api/v1/career", careerRoutes);
app.use("/api/v1/game", gameRoutes);

// 404 handler for unknown API routes
app.use("/api/v1", (req, res) => {
  res.status(404).json({ success: false, error: "Route not found", code: "NOT_FOUND" });
});

// Global error handler — never leak stack traces in production
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, error: "Server error", code: "SERVER_ERROR" });
});

async function start() {
  await connectDatabase();
  startCronJobs();
  httpServer.listen(PORT, () => console.log(`THREAD backend on http://localhost:${PORT}`));
}

start();
