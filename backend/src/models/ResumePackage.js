import mongoose from "mongoose";
const { Schema } = mongoose;

const ResumePackageSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  projectName: { type: String, required: true },
  projectDescription: { type: String, required: true },
  techStack: { type: String, default: "" },
  role: { type: String, default: "" },
  resumeBullets: [{ type: String }],
  linkedinPost: { type: String, default: "" },
  interviewAnswer: { type: String, default: "" },
  readme: { type: String, default: "" },
  coverLetter: { type: String, default: "" },
  atsKeywords: [{ type: String }],
  atsScore: { type: Number, default: 70 },
  skillsToAdd: [{ type: String }],
  aiGenerated: { type: Boolean, default: true },
}, { timestamps: true });

export const ResumePackage = mongoose.model("ResumePackage", ResumePackageSchema);
