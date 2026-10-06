import mongoose from "mongoose";
const { Schema } = mongoose;

const ComplaintSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, default: "" },
  photo: { type: String, default: "" },
  priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
  status: { type: String, enum: ["Pending", "In Progress", "Resolved", "Closed"], default: "Pending" },
  isAnonymous: { type: Boolean, default: false },
  upvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  comments: [{ userId: { type: Schema.Types.ObjectId, ref: "User" }, text: String, createdAt: { type: Date, default: Date.now } }],
  slaDeadline: { type: Date, default: null },
  rating: { type: Number, min: 1, max: 5, default: null },
}, { timestamps: true });

export const Complaint = mongoose.model("Complaint", ComplaintSchema);
