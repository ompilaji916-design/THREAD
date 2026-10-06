import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import "./styles/globals.css";

import Landing from "./pages/auth/Landing";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";
import { AppLayout } from "./components/layout/AppLayout";

import Dashboard from "./pages/dashboard/Dashboard";
import Attendance from "./pages/academic/Attendance";
import CGPA from "./pages/academic/CGPA";
import Assignments from "./pages/academic/Assignments";
import Timetable from "./pages/academic/Timetable";
import LearningThread from "./pages/academic/LearningThread";

import AIEmail from "./pages/ai/AIEmail";
import AIResume from "./pages/ai/AIResume";
import AIDoubt from "./pages/ai/AIDoubt";
import AIStudyPlanner from "./pages/ai/AIStudyPlanner";

import CampusMate from "./pages/campus/CampusMate";
import Hostel from "./pages/campus/Hostel";
import Marketplace from "./pages/campus/Marketplace";
import Complaints from "./pages/campus/Complaints";
import BusTracking from "./pages/campus/BusTracking";
import LostFound from "./pages/campus/LostFound";
import RoomAllocation from "./pages/campus/RoomAllocation";
import SkillExchange from "./pages/campus/SkillExchange";

import Finance from "./pages/life/Finance";
import Mood from "./pages/life/Mood";
import SafeWalk from "./pages/life/SafeWalk";
import Productivity from "./pages/life/Productivity";

import Internships from "./pages/career/Internships";
import DailyChallenge from "./pages/career/DailyChallenge";
import MysteryLearn from "./pages/game/MysteryLearn";
import Leaderboard from "./pages/career/Leaderboard";

import Profile from "./pages/profile/Profile";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-center" toastOptions={{ style: { fontFamily: "Inter, sans-serif", fontSize: "14px" } }} />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />

          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="cgpa" element={<CGPA />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="timetable" element={<Timetable />} />
            <Route path="learning-thread" element={<LearningThread />} />

            <Route path="ai/email" element={<AIEmail />} />
            <Route path="ai/resume" element={<AIResume />} />
            <Route path="ai/doubt" element={<AIDoubt />} />
            <Route path="ai/study-planner" element={<AIStudyPlanner />} />

            <Route path="campus/notices" element={<CampusMate />} />
            <Route path="campus/hostel" element={<Hostel />} />
            <Route path="campus/marketplace" element={<Marketplace />} />
            <Route path="campus/complaints" element={<Complaints />} />
            <Route path="campus/bus" element={<BusTracking />} />
            <Route path="campus/lost-found" element={<LostFound />} />
            <Route path="campus/room-allocation" element={<RoomAllocation />} />
            <Route path="campus/skill-exchange" element={<SkillExchange />} />

            <Route path="finance" element={<Finance />} />
            <Route path="mood" element={<Mood />} />
            <Route path="safewalk" element={<SafeWalk />} />
            <Route path="productivity" element={<Productivity />} />

            <Route path="internships" element={<Internships />} />
            <Route path="daily-challenge" element={<DailyChallenge />} />
            <Route path="mystery-learn" element={<MysteryLearn />} />
            <Route path="leaderboard" element={<Leaderboard />} />

            <Route path="profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
