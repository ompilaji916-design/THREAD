import mongoose from "mongoose";
const { Schema } = mongoose;

const FocusSessionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  date: { type: String, required: true }, // "YYYY-MM-DD"
  task: { type: String, default: "Focus session" },
  durationMinutes: { type: Number, required: true },
}, { timestamps: true });

FocusSessionSchema.index({ userId: 1, date: 1 });

export const FocusSession = mongoose.model("FocusSession", FocusSessionSchema);
