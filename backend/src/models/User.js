import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    phoneNumber: { type: String, unique: true, sparse: true },
    username: { type: String },

    email: {
      type: String,
      lowercase: true,
      unique: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email address!`,
      },
    },
    googleId: { type: String, unique: true, sparse: true },
    authProvider: { type: String, enum: ["local", "google"], default: "local" },
    isEmailVerified: { type: Boolean, default: false },

    profilePicture: { type: String },
    isVarified: { type: Boolean, default: false },
    emailOtp: { type: String },
    emailOtpExpiry: { type: String },
    profilePicture: { type: String },
    about: { type: String },
    lastSeen: { type: String },
    isOnline: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    agreed: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const User = mongoose.model("user", userSchema);
export default User;
