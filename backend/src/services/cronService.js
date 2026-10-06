import cron from "node-cron";
import { Assignment } from "../models/Assignment.js";
import { User } from "../models/User.js";
import { Notification } from "../models/Notification.js";
import { notify } from "./notificationService.js";
import { Emails } from "./emailService.js";

// Hourly: find assignments due within 48h that haven't been reminded yet
function startAssignmentReminderJob() {
  cron.schedule("0 * * * *", async () => {
    try {
      const in48h = new Date(Date.now() + 48 * 60 * 60 * 1000);
      const due = await Assignment.find({
        deadline: { $lte: in48h, $gte: new Date() },
        reminderSent: false,
        archived: false,
        status: { $ne: "Done" },
      }).populate("userId");

      for (const a of due) {
        if (!a.userId) continue;
        await notify(a.userId._id, {
          type: "assignment_due",
          title: "Assignment due soon",
          message: `${a.title} is due within 48 hours.`,
        });
        Emails.assignmentReminder(a.userId, a);
        a.reminderSent = true;
        await a.save();
      }
    } catch (err) {
      console.error("Assignment reminder cron failed (will retry next run):", err.message);
    }
  });
}

// Weekly: Sunday 8 AM report
function startWeeklyReportJob() {
  cron.schedule("0 8 * * 0", async () => {
    try {
      const users = await User.find({ isActive: true });
      for (const u of users) {
        Emails.weeklyReport(u, { xpGained: 0 });
      }
    } catch (err) {
      console.error("Weekly report cron failed:", err.message);
    }
  });
}

export function startCronJobs() {
  startAssignmentReminderJob();
  startWeeklyReportJob();
  console.log("Cron jobs scheduled: hourly assignment reminders, weekly Sunday reports.");
}
