import mongoose from "mongoose";
const { Schema } = mongoose;

const SemesterSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  semesterNumber: { type: Number, required: true },
  subjects: [{
    name: String,
    credits: Number,
    grade: { type: String, enum: ["O", "A+", "A", "B+", "B", "C", "F"] },
  }],
  sgpa: { type: Number, default: 0 },
}, { timestamps: true });

SemesterSchema.index({ userId: 1, semesterNumber: 1 }, { unique: true });

export const Semester = mongoose.model("Semester", SemesterSchema);
