import mongoose from "mongoose";
const { Schema } = mongoose;

const ChallengeAttemptSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  dayKey: { type: String, required: true }, // YYYY-MM-DD
  challengeIndex: { type: Number, required: true },
  status: { type: String, enum: ["solved", "viewed_solution", "attempted"], default: "attempted" },
  hintsUsed: { type: Number, default: 0 },
  xpAwarded: { type: Number, default: 0 },
}, { timestamps: true });

ChallengeAttemptSchema.index({ userId: 1, dayKey: 1 }, { unique: true });

export const ChallengeAttempt = mongoose.model("ChallengeAttempt", ChallengeAttemptSchema);
