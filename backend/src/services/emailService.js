import nodemailer from "nodemailer";

// Reusable branded HTML wrapper for every email THREAD sends
function wrapHtml(title, bodyHtml) {
  return `
  <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;background:#F4F5F7;padding:24px;">
    <div style="background:#4F46E5;padding:20px 24px;border-radius:12px 12px 0 0;">
      <h1 style="color:#fff;margin:0;font-size:20px;">THREAD</h1>
      <p style="color:#E0E7FF;margin:4px 0 0;font-size:13px;">Student Life Operating System</p>
    </div>
    <div style="background:#fff;padding:24px;border-radius:0 0 12px 12px;border:1px solid #E5E7EB;border-top:none;">
      <h2 style="color:#111827;font-size:18px;margin-top:0;">${title}</h2>
      ${bodyHtml}
    </div>
    <p style="text-align:center;color:#9CA3AF;font-size:12px;margin-top:16px;">
      Stop Struggling. Start THREADing. — sent automatically by THREAD
    </p>
  </div>`;
}

let transporter = null;
function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  return transporter;
}

// Fire-and-forget: NEVER blocks or throws into the caller's request/response cycle
export function sendEmailAsync(to, subject, title, bodyHtml) {
  const t = getTransporter();
  if (!t) {
    console.log(`[email skipped - no EMAIL_USER/PASS configured] To: ${to} | Subject: ${subject}`);
    return;
  }
  t.sendMail({
    from: `"THREAD" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: wrapHtml(title, bodyHtml),
  }).catch((err) => console.error("Email send failed (non-blocking):", err.message));
}

// The 7 automated email triggers
export const Emails = {
  welcome: (user) => sendEmailAsync(user.email, "Welcome to THREAD!", `Welcome, ${user.name}!`,
    `<p>You just joined THREAD with <b>50 XP</b>. Explore Attendance, Assignments, CGPA, AI tools, and more from your dashboard.</p>`),

  loginAlert: (user) => sendEmailAsync(user.email, "New login to your THREAD account", "New Login Detected",
    `<p>Hi ${user.name}, your account was just logged into. If this wasn't you, please change your password.</p>`),

  attendanceWarning: (user, subject) => sendEmailAsync(user.email, `Attendance Warning: ${subject.name}`, "Attendance Below 75%",
    `<p>Your attendance in <b>${subject.name}</b> has dropped below 75% (${subject.attendedClasses}/${subject.totalClasses}). Attend your next classes to recover.</p>`),

  assignmentReminder: (user, assignment) => sendEmailAsync(user.email, `Reminder: ${assignment.title} due soon`, "Assignment Due in 48 Hours",
    `<p><b>${assignment.title}</b> (${assignment.subject}) is due on ${new Date(assignment.deadline).toLocaleString()}.</p>`),

  badgeEarned: (user, badgeName) => sendEmailAsync(user.email, `You earned the "${badgeName}" badge!`, "New Badge Unlocked",
    `<p>Congrats ${user.name}! You just earned the <b>${badgeName}</b> badge on THREAD.</p>`),

  weeklyReport: (user, stats) => sendEmailAsync(user.email, "Your THREAD weekly report", "Weekly Report",
    `<p>XP this week: <b>${stats.xpGained || 0}</b><br/>Current streak: <b>${user.loginStreak}</b> days<br/>Total XP: <b>${user.xp}</b></p>`),

  verifyEmail: (user, rawToken) => {
    const link = `${process.env.CLIENT_URL || "http://localhost:5173"}/verify-email/${rawToken}`;
    sendEmailAsync(user.email, "Verify your THREAD email", "Verify Your Email",
      `<p>Hi ${user.name}, please confirm this is your email address:</p><p><a href="${link}" style="color:#006C49;font-weight:600;">Verify my email</a></p><p style="font-size:13px;color:#6B7280;">This link expires in 24 hours. If you didn't create a THREAD account, you can ignore this email.</p>`);
  },

  passwordReset: (user, rawToken) => {
    const link = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password/${rawToken}`;
    sendEmailAsync(user.email, "Reset your THREAD password", "Password Reset Requested",
      `<p>Hi ${user.name}, click below to set a new password:</p><p><a href="${link}" style="color:#006C49;font-weight:600;">Reset my password</a></p><p style="font-size:13px;color:#6B7280;">This link expires in 30 minutes. If you didn't request this, you can safely ignore this email — your password won't change.</p>`);
  },

  sosAlert: (contactEmail, user, location) => sendEmailAsync(contactEmail, `SOS Alert from ${user.name}`, "SafeWalk SOS Triggered",
    `<p><b>${user.name}</b> triggered an SOS during a SafeWalk session. Last known context: ${location || "not specified"}. Please reach out immediately.</p>`),
};
