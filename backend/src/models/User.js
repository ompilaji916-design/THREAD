import mongoose from "mongoose";

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    // select:false means the password is never returned by default queries
    password: { type: String, required: true, minlength: 8, select: false },
    college: { type: String, trim: true, default: "" },
    branch: { type: String, trim: true, default: "" },
    year: { type: String, trim: true, default: "" },
    bio: { type: String, maxlength: 150, default: "" },
    skills: [{ type: String }],
    avatar: { type: String, default: "" },
    xp: { type: Number, default: 50, min: 0, index: -1 },
    loginStreak: { type: Number, default: 1, min: 0 },
    lastLoginDate: { type: Date, default: null },
    badges: [{ type: String }],
    emergencyContact: {
      name: { type: String, default: "" },
      phone: { type: String, default: "" },
    },
    isActive: { type: Boolean, default: true },

    // --- Account security ---
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false, default: null },
    emailVerificationExpires: { type: Date, select: false, default: null },
    resetPasswordToken: { type: String, select: false, default: null },
    resetPasswordExpires: { type: Date, select: false, default: null },
    failedLoginAttempts: { type: Number, default: 0, select: false },
    lockUntil: { type: Date, default: null, select: false },
  },
  { timestamps: true }
);

// Extra safety: strip password and security-sensitive fields from every serialized response
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.emailVerificationToken;
  delete obj.emailVerificationExpires;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  delete obj.failedLoginAttempts;
  delete obj.lockUntil;
  return obj;
};

export const User = mongoose.model("User", UserSchema);
