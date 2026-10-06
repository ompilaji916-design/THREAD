import mongoose from "mongoose";
const { Schema } = mongoose;

const AssignmentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, required: true },
  subject: { type: String, default: "" },
  deadline: { type: Date, required: true },
  priority: { type: String, enum: ["High", "Medium", "Low"], default: "Medium" },
  description: { type: String, default: "" },
  expectedMarks: { type: Number, default: null },
  status: { type: String, enum: ["Not Started", "Working", "Done"], default: "Not Started" },
  archived: { type: Boolean, default: false },
  reminderSent: { type: Boolean, default: false },
}, { timestamps: true });

export const Assignment = mongoose.model("Assignment", AssignmentSchema);
