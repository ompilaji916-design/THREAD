import mongoose from "mongoose";
const { Schema } = mongoose;

const ClassSlotSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  day: { type: String, enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], required: true },
  startTime: { type: String, required: true }, // "09:00"
  endTime: { type: String, required: true },
  subject: { type: String, required: true },
  type: { type: String, enum: ["Lecture", "Lab", "Tutorial", "Seminar"], default: "Lecture" },
  room: { type: String, default: "" },
}, { timestamps: true });

export const ClassSlot = mongoose.model("ClassSlot", ClassSlotSchema);
