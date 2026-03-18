import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    phoneNumber: { type: String, unique: true, sparse: true },
    phoneSuffix: { type: String },
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
    lastSeen: { type: String },
    isOnline: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    agreed: { type: Boolean, default: false },

    emailOtp: {
      type: String,
    },
    emailOtpExpiry: {
      type: Date,
    },

    profilePicture: String,

    about: {
      type: String,
      default: "Hey there! I am using chat.",
    },
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],

    contacts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],

    deviceTokens: [String],

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true },
);

const User = mongoose.model("user", userSchema);
export default User;
