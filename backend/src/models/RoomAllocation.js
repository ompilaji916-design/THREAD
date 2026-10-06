import mongoose from "mongoose";
const { Schema } = mongoose;

const RoomAllocationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  preferences: {
    floor: { type: String, default: "Any" },
    acType: { type: String, enum: ["AC", "Non-AC", "Any"], default: "Any" },
    sleepSchedule: { type: String, enum: ["Early", "Late"], default: "Early" },
    cleanliness: { type: String, enum: ["Very Tidy", "Average", "Relaxed"], default: "Average" },
  },
  allocatedRoom: { type: String, default: null },
  roommates: [{ type: Schema.Types.ObjectId, ref: "User" }],
  status: { type: String, enum: ["Waitlisted", "Allocated"], default: "Waitlisted" },
}, { timestamps: true });

export const RoomAllocation = mongoose.model("RoomAllocation", RoomAllocationSchema);
