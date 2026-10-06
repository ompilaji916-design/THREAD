import mongoose from "mongoose";
const { Schema } = mongoose;

const GameProgressSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  level: { type: Number, required: true },
  completed: { type: Boolean, default: false },
  correctAnswers: { type: Number, default: 0 },
  timeTakenSeconds: { type: Number, default: null },
  xpAwarded: { type: Number, default: 0 },
}, { timestamps: true });

GameProgressSchema.index({ userId: 1, level: 1 }, { unique: true });

export const GameProgress = mongoose.model("GameProgress", GameProgressSchema);
