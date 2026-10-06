import mongoose from "mongoose";
const { Schema } = mongoose;

const ExpenseSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  amount: { type: Number, required: true },
  category: {
    type: String,
    enum: ["Food", "Transport", "Shopping", "College", "Recharge", "Outings", "Emergency", "Health", "Hostel", "Other"],
    required: true,
  },
  note: { type: String, default: "" },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

export const Expense = mongoose.model("Expense", ExpenseSchema);
