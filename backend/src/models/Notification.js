import mongoose from "mongoose";
const { Schema } = mongoose;

const NotificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  type: { type: String, required: true }, // e.g. 'upvote', 'attendance_warning', 'badge_earned'
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String, default: "" },
  isRead: { type: Boolean, default: false, index: true },
  priority: { type: String, enum: ["normal", "high"], default: "normal" },
}, { timestamps: true });

export const Notification = mongoose.model("Notification", NotificationSchema);
