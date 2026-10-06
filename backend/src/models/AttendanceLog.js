import mongoose from "mongoose";
const { Schema } = mongoose;

const AttendanceLogSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true, index: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  status: { type: String, enum: ["attended", "bunked", "cancelled"], required: true },
}, { timestamps: true });

AttendanceLogSchema.index({ userId: 1, subjectId: 1, date: 1 }, { unique: true });

export const AttendanceLog = mongoose.model("AttendanceLog", AttendanceLogSchema);
