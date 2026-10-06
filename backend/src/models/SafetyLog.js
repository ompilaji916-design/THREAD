import mongoose from "mongoose";
const { Schema } = mongoose;

const SafetyLogSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  locationDescription: { type: String, default: "" },
  durationMinutes: { type: Number, required: true },
  status: { type: String, enum: ["Active", "Safe", "SOS", "Expired"], default: "Active" },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date, default: null },
}, { timestamps: true });

export const SafetyLog = mongoose.model("SafetyLog", SafetyLogSchema);
