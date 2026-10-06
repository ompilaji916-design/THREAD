import mongoose from "mongoose";
const { Schema } = mongoose;

const BillSplitSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  people: [{ name: String, share: Number, paid: { type: Boolean, default: false } }],
}, { timestamps: true });

export const BillSplit = mongoose.model("BillSplit", BillSplitSchema);
