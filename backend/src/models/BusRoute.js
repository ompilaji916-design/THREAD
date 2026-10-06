import mongoose from "mongoose";
const { Schema } = mongoose;

const BusRouteSchema = new Schema({
  routeName: { type: String, required: true },
  stops: [{ name: String, lat: Number, lng: Number, etaMinutes: Number }],
  currentLat: { type: Number, default: null },
  currentLng: { type: Number, default: null },
  seatOccupancy: { type: String, enum: ["Low", "Medium", "Full"], default: "Low" },
  delayMinutes: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

export const BusRoute = mongoose.model("BusRoute", BusRouteSchema);
