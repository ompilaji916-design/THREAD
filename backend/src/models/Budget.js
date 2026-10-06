import mongoose from "mongoose";
const { Schema } = mongoose;

const BudgetSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  monthlyLimit: { type: Number, default: 0 },
  savingsGoal: { type: Number, default: 0 },
  categoryLimits: { type: Map, of: Number, default: {} },
  lastAlertLevel: { type: Number, default: 0 }, // 0=none,80=warned,100=exceeded
}, { timestamps: true });

export const Budget = mongoose.model("Budget", BudgetSchema);
