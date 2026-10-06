import mongoose from "mongoose";
const { Schema } = mongoose;

const MarketItemSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, default: "Other" },
  condition: { type: String, enum: ["New", "Like New", "Good", "Fair"], default: "Good" },
  description: { type: String, default: "" },
  isSold: { type: Boolean, default: false },
  savedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

export const MarketItem = mongoose.model("MarketItem", MarketItemSchema);
