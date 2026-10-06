import mongoose from "mongoose";
const { Schema } = mongoose;

const InternshipSchema = new Schema({
  postedBy: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  company: { type: String, required: true },
  role: { type: String, required: true },
  description: { type: String, default: "" },
  deadline: { type: Date, required: true },
  requiredSkills: [{ type: String }],
  applicants: [{ type: Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

export const Internship = mongoose.model("Internship", InternshipSchema);
