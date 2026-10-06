import mongoose from "mongoose";
const { Schema } = mongoose;

const NoticeSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, enum: ["General", "Event", "Academic", "Emergency"], default: "General" },
  priority: { type: String, enum: ["Low", "Normal", "High", "Emergency"], default: "Normal" },
  reactions: [{ type: Schema.Types.ObjectId, ref: "User" }],
  isEvent: { type: Boolean, default: false },
  eventDate: { type: Date, default: null },
  rsvps: [{ type: Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

export const Notice = mongoose.model("Notice", NoticeSchema);
