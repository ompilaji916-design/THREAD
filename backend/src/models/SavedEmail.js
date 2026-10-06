import mongoose from "mongoose";
const { Schema } = mongoose;

const SavedEmailSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  templateType: { type: String, required: true },
  tone: { type: String, enum: ["Formal", "Short", "Urgent"], default: "Formal" },
  prompt: { type: String, required: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  aiGenerated: { type: Boolean, default: true },
}, { timestamps: true });

export const SavedEmail = mongoose.model("SavedEmail", SavedEmailSchema);
