import mongoose from "mongoose";
const { Schema } = mongoose;

const SkillExchangeSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  skillsToTeach: [{ type: String }],
  skillsToLearn: [{ type: String }],
  credits: { type: Number, default: 5 },
  availability: [{ day: String, time: String }],
  sessionsTaught: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
}, { timestamps: true });

export const SkillExchange = mongoose.model("SkillExchange", SkillExchangeSchema);
