import mongoose from "mongoose";
const { Schema } = mongoose;

const MilestoneSchema = new Schema({
  title: { type: String, required: true },
  done: { type: Boolean, default: false },
}, { _id: true });

const GoalSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  targetDate: { type: String, default: null }, // "YYYY-MM-DD"
  milestones: [MilestoneSchema],
  status: { type: String, enum: ["active", "completed", "abandoned"], default: "active" },
}, { timestamps: true });

GoalSchema.index({ userId: 1, status: 1 });

export const Goal = mongoose.model("Goal", GoalSchema);
