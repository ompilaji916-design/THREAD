import mongoose from "mongoose";
const { Schema } = mongoose;

const SubjectSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  name: { type: String, required: true, trim: true },
  semester: { type: String, default: "" },
  color: { type: String, default: "#4F46E5" },
  totalClasses: { type: Number, default: 0 },
  attendedClasses: { type: Number, default: 0 },
  lastWarningEmailDate: { type: Date, default: null },
}, { timestamps: true });

SubjectSchema.index({ userId: 1, name: 1 }, { unique: true });

export const Subject = mongoose.model("Subject", SubjectSchema);
