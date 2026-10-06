import mongoose from "mongoose";
const { Schema } = mongoose;

const MoodLogSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  level: { type: Number, min: 1, max: 5, required: true }, // 1 terrible - 5 amazing
  note: { type: String, default: "" },
  tags: [{ type: String }],
  energy: { type: Number, min: 1, max: 10, default: 5 },
  sleepHours: { type: Number, default: 7 },
}, { timestamps: true });

MoodLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export const MoodLog = mongoose.model("MoodLog", MoodLogSchema);
