import mongoose from "mongoose";
const { Schema } = mongoose;

const LostFoundItemSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  type: { type: String, enum: ["lost", "found"], required: true },
  itemName: { type: String, required: true },
  description: { type: String, default: "" },
  category: { type: String, default: "Other" },
  location: { type: String, default: "" },
  date: { type: Date, default: Date.now },
  image: { type: String, default: "" },
  status: { type: String, enum: ["open", "matched", "resolved"], default: "open" },
  matchedWith: { type: Schema.Types.ObjectId, ref: "LostFoundItem", default: null },
}, { timestamps: true });

export const LostFoundItem = mongoose.model("LostFoundItem", LostFoundItemSchema);
