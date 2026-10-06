import mongoose from "mongoose";
const { Schema } = mongoose;

const HabitSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, required: true, trim: true },
  emoji: { type: String, default: "✅" },
  color: { type: String, default: "#006C49" },
  completions: [{ type: String }], // array of "YYYY-MM-DD" strings
  streak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  archived: { type: Boolean, default: false },
}, { timestamps: true });

HabitSchema.index({ userId: 1, archived: 1 });

export const Habit = mongoose.model("Habit", HabitSchema);
