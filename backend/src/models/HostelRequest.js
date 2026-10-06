import mongoose from "mongoose";
const { Schema } = mongoose;

const HostelRequestSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  type: { type: String, required: true }, // Electrical, Plumbing, Furniture, Wifi, Other
  description: { type: String, required: true },
  roomNumber: { type: String, required: true },
  priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
  status: { type: String, enum: ["Submitted", "In Progress", "Resolved"], default: "Submitted" },
  rating: { type: Number, min: 1, max: 5, default: null },
}, { timestamps: true });

export const HostelRequest = mongoose.model("HostelRequest", HostelRequestSchema);
