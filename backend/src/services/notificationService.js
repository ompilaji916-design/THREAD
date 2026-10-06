import { Notification } from "../models/Notification.js";
import { pushToUser } from "./socketService.js";

// Creates a notification in the DB AND pushes it live via Socket.io.
// Every module should call this instead of writing to Notification directly.
export async function notify(userId, { type, title, message, link = "", priority = "normal" }) {
  const notification = await Notification.create({ userId, type, title, message, link, priority });
  pushToUser(userId, "notification:new", notification);
  return notification;
}
