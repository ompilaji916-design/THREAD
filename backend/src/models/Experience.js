import mongoose from "mongoose";
const { Schema } = mongoose;

const ExperienceSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, required: true },
  language: { type: String, default: "" },
  difficulty: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], default: "Beginner" },
  content: { type: String, required: true },
  mistakesMade: { type: String, default: "" },
  resourcesUsed: { type: String, default: "" },
  timeTaken: { type: String, default: "" },
  upvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  bookmarkedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

ExperienceSchema.index({ title: "text", content: "text" });

export const Experience = mongoose.model("Experience", ExperienceSchema);
