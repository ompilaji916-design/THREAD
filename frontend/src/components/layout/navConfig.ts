import {
  LayoutDashboard, CalendarCheck, Calculator, ListTodo, CalendarDays, BookOpen,
  Mail, FileText, HelpCircle, Target, Megaphone, Wrench, ShoppingBag, Wallet,
  Smile, ShieldAlert, Briefcase, Code2, Puzzle, Trophy, User,
  MessageSquareWarning, Bus, PackageSearch, BedDouble, Users, Flame,
} from "lucide-react";

export interface NavItem {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", path: "/app", icon: LayoutDashboard },
    ],
  },
  {
    title: "Academic",
    items: [
      { label: "Attendance", path: "/app/attendance", icon: CalendarCheck },
      { label: "CGPA Calculator", path: "/app/cgpa", icon: Calculator },
      { label: "Assignments", path: "/app/assignments", icon: ListTodo },
      { label: "Timetable", path: "/app/timetable", icon: CalendarDays },
      { label: "Learning THREAD", path: "/app/learning-thread", icon: BookOpen },
    ],
  },
  {
    title: "AI Tools",
    items: [
      { label: "AI Email Assistant", path: "/app/ai/email", icon: Mail },
      { label: "AI Resume Builder", path: "/app/ai/resume", icon: FileText },
      { label: "AI Doubt Solver", path: "/app/ai/doubt", icon: HelpCircle },
      { label: "AI Study Planner", path: "/app/ai/study-planner", icon: Target },
    ],
  },
  {
    title: "Campus",
    items: [
      { label: "CampusMate", path: "/app/campus/notices", icon: Megaphone },
      { label: "Hostel HelpDesk", path: "/app/campus/hostel", icon: Wrench },
      { label: "Marketplace", path: "/app/campus/marketplace", icon: ShoppingBag },
      { label: "Complaint Portal", path: "/app/campus/complaints", icon: MessageSquareWarning },
      { label: "Bus Tracking", path: "/app/campus/bus", icon: Bus },
      { label: "Lost & Found", path: "/app/campus/lost-found", icon: PackageSearch },
      { label: "Room Allocation", path: "/app/campus/room-allocation", icon: BedDouble },
      { label: "Skill Exchange", path: "/app/campus/skill-exchange", icon: Users },
    ],
  },
  {
    title: "Finance & Life",
    items: [
      { label: "PocketGuard", path: "/app/finance", icon: Wallet },
      { label: "Mood Tracker", path: "/app/mood", icon: Smile },
      { label: "SafeWalk", path: "/app/safewalk", icon: ShieldAlert },
      { label: "Productivity Hub", path: "/app/productivity", icon: Flame },
    ],
  },
  {
    title: "Career & Game",
    items: [
      { label: "Internships", path: "/app/internships", icon: Briefcase },
      { label: "Daily Challenge", path: "/app/daily-challenge", icon: Code2 },
      { label: "MysteryLearn", path: "/app/mystery-learn", icon: Puzzle },
      { label: "Leaderboard", path: "/app/leaderboard", icon: Trophy },
    ],
  },
  { title: "You", items: [{ label: "Profile", path: "/app/profile", icon: User }] },
];

// The 5 modules shown in the mobile bottom nav
export const MOBILE_NAV: NavItem[] = [
  { label: "Home", path: "/app", icon: LayoutDashboard },
  { label: "Attendance", path: "/app/attendance", icon: CalendarCheck },
  { label: "Tasks", path: "/app/assignments", icon: ListTodo },
  { label: "AI", path: "/app/ai/doubt", icon: HelpCircle },
  { label: "Profile", path: "/app/profile", icon: User },
];
