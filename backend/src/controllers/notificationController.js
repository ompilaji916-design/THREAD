import { Notification } from "../models/Notification.js";

export async function listNotifications(req, res) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const items = await Notification.find({ userId: req.user.userId })
    .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
  const unreadCount = await Notification.countDocuments({ userId: req.user.userId, isRead: false });
  res.json({ success: true, data: { items, unreadCount, page } });
}

export async function markRead(req, res) {
  await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user.userId }, { isRead: true });
  res.json({ success: true, message: "Marked as read" });
}

export async function markAllRead(req, res) {
  await Notification.updateMany({ userId: req.user.userId, isRead: false }, { isRead: true });
  res.json({ success: true, message: "All marked as read" });
}
