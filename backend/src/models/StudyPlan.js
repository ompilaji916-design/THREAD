import mongoose from "mongoose";
const { Schema } = mongoose;

const StudyPlanSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  examName: { type: String, required: true },
  examDate: { type: Date, required: true },
  subjects: [{ name: String, difficulty: { type: String, enum: ["Easy", "Medium", "Hard"] } }],
  dailyHours: { type: Number, default: 2 },
  prepLevel: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], default: "Beginner" },
  days: [{
    date: String,
    tasks: [{ text: String, done: { type: Boolean, default: false } }],
    isRevision: { type: Boolean, default: false },
  }],
}, { timestamps: true });

export const StudyPlan = mongoose.model("StudyPlan", StudyPlanSchema);
