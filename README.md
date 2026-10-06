# THREAD — Student Life Operating System

**Stop Struggling. Start THREADing.**

A full MERN-stack "Student Life OS" covering academics, AI tools, campus life, finances, wellness,
safety, career, and gamification — all in one thread. Built from your Feature List, Module
Blueprint, and Mega Prompt documents.

## What's inside

- **Backend**: Node.js + Express + MongoDB (Mongoose), JWT auth, Socket.io real-time events,
  Nodemailer email automation, node-cron scheduled jobs, Google Gemini AI with automatic
  template fallback. 28 database models, ~30 route groups, 73 backend files.
- **Frontend**: React 18 + Vite + TypeScript (strict mode, 0 errors), Tailwind CSS flat design
  system, Zustand auth state, TanStack Query for data-fetching, Recharts for charts,
  Socket.io-client for live notifications. 53 frontend files, all 25 module pages wired up.

### Modules included (all 29)
Auth & Dashboard · Attendance · CGPA Calculator · Assignments · Timetable · Learning THREAD ·
AI Email Assistant · AI Resume Builder · AI Doubt Solver · AI Study Planner · CampusMate ·
Hostel HelpDesk · Marketplace · PocketGuard (finance) · Mood Tracker · SafeWalk ·
Productivity Hub (habits, focus timer, goals) · Internships ·
Daily Challenge · MysteryLearn · Leaderboard · Profile/XP/Badges/Notifications ·
Complaint Portal · Bus Tracking · Lost & Found · Room Allocation · Skill Exchange

## Getting started

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
# Leave MONGO_URI blank to auto-use an in-memory MongoDB for local testing,
# or paste a MongoDB Atlas connection string to persist data.
npm start
```
The backend starts on `http://localhost:5000`. Health check: `GET /api/v1/health`.

> **Note on the in-memory database**: `mongodb-memory-server` downloads a small MongoDB binary
> the first time it runs. This requires normal internet access (it was blocked only inside the
> sandboxed environment THREAD was built in — it will work fine on your machine). If you'd rather
> skip that download entirely, install MongoDB locally or use a free MongoDB Atlas cluster and
> paste its URI into `MONGO_URI`.

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
Opens on `http://localhost:5173`. It talks to the backend at `http://localhost:5000/api/v1` by
default — override with a `.env` file containing `VITE_API_URL=http://localhost:5000/api/v1`.

### 3. Optional: real AI + email
By default, every AI feature (Email Assistant, Resume Builder, Doubt Solver) works out of the box
using **built-in fallback templates** — no API key needed, nothing ever breaks. To get real
Gemini-generated answers instead, add a `GEMINI_API_KEY` to `backend/.env`. To send real emails
(welcome email, attendance warnings, assignment reminders, etc.) add `EMAIL_USER`/`EMAIL_PASS`
(a Gmail address + app password) to `backend/.env` — otherwise emails are just logged to the
console.

## How it was verified in this sandbox
- Every one of the 73 backend files was individually import-tested (module resolution, exports,
  wiring) — all passed.
- The full backend passed `node --check` syntax validation on every file.
- The full frontend passed `tsc --noEmit` in strict mode with **zero errors**, and a full
  production `vite build` completed successfully (2,518 modules bundled).
- Live end-to-end testing against a running MongoDB wasn't possible inside this sandbox (its
  network policy blocks the MongoDB binary download and there's no local mongod). Please run
  `npm start` in `backend/` on your own machine or deploy it — that's the one thing to verify
  yourself first.

## Before real students start using this

THREAD now includes a genuine security-hardening pass, built for a real (not hypothetical
enterprise-scale) launch:
- Account lockout after 5 failed logins (15-minute cooldown)
- Email verification on signup, with a resend option from your profile
- Forgot-password flow with a 30-minute expiring reset link sent by email
- Stronger password policy (8+ characters, a letter and a number)
- NoSQL injection protection on every request (`express-mongo-sanitize`)
- Request logging (`morgan`) so you can see real traffic once deployed
- Auth-specific rate limiting, with an even tighter limit on password-reset requests

To actually go live for Woxsen students, you still need to do a few things **outside the
code** — these are hosting/infrastructure choices, not something to build:
1. **A real MongoDB database.** Sign up for a free MongoDB Atlas cluster and put its
   connection string in `MONGO_URI`. Don't run on the in-memory database in production —
   it wipes on every restart.
2. **A real email account.** Set `EMAIL_USER` / `EMAIL_PASS` (a Gmail address + an
   [app password](https://myaccount.google.com/apppasswords)) so verification and
   password-reset emails actually send.
3. **A long, random `JWT_SECRET`.** Generate one with `openssl rand -hex 32` — don't ship
   the default.
4. **HTTPS.** Any reasonable host (Render, Railway, Vercel, etc.) gives you this
   automatically — you don't need to configure it yourself.
5. **Backups.** MongoDB Atlas handles this on paid tiers; on the free tier, just know your
   data isn't backed up automatically.

Deliberately *not* included, because they solve problems this app doesn't have yet:
Kubernetes, microservices, message queues, GraphQL, multi-region/multi-tenant
architecture, CDN, Redis caching. If THREAD ever has thousands of concurrent users, some
of these become worth revisiting — not before.

## Project structure
```
backend/
  server.js                 # Express + Socket.io + cron bootstrap
  src/
    config/database.js      # Mongo connection (Atlas or in-memory)
    models/                 # 28 Mongoose schemas
    controllers/            # Business logic per module
    routes/                 # Express routers, mounted in server.js
    services/                # xpService, badgeService, notificationService,
                             #   emailService, geminiService, socketService, cronService
    middleware/              # requireAuth, aiLimiter, rate limiting
frontend/
  src/
    main.tsx                # Router + React Query + Toaster setup
    pages/                  # One folder per module group (academic, ai, campus, life, career, game, profile)
    components/
      ui/                   # Button, Card, Input, Select, Modal, Badge, EmptyState, etc.
      layout/               # Sidebar, TopBar, MobileNav, AppLayout, XPBar, NotificationBell
    stores/authStore.ts      # Zustand auth state
    services/api.ts          # Axios instance with token + 401 interceptors
    services/socket.ts        # Socket.io client singleton
```

## What to try first
1. Sign up (get +50 XP instantly).
2. Add a subject in **Attendance** and mark yourself present/absent — watch the safe-bunk count
   update live.
3. Post something in **Learning THREAD** (+20 XP) and upvote it.
4. Try the **AI Doubt Solver** — ask any C/Python question.
5. Check the **Leaderboard** — XP updates in real time across tabs via Socket.io.

Enjoy building on it, Om — and good luck getting to that 40–50 LPA goal. 🚀
