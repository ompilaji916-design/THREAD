import mongoose from "mongoose";
const { Schema } = mongoose;

const DoubtHistorySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  question: { type: String, required: true },
  language: { type: String, default: "C" },
  simpleExplanation: String,
  realWorldAnalogy: String,
  codeExample: String,
  stepByStep: String,
  rememberThis: String,
  commonMistakes: String,
  aiGenerated: { type: Boolean, default: true },
}, { timestamps: true });

export const DoubtHistory = mongoose.model("DoubtHistory", DoubtHistorySchema);
