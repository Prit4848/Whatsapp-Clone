import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
{
  phoneNumber: { type: String, unique: true, sparse: true },

  username: String,

  email: {
    type: String,
    lowercase: true,
    unique: true
  },
  emailOtp: {
  type: String
},
emailOtpExpiry: {
  type: Date
},

  profilePicture: String,

  about: {
    type: String,
    default: "Hey there! I am using chat."
  },

  lastSeen: Date,

  isOnline: {
    type: Boolean,
    default: false
  },

  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  }],

  contacts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  }],

  deviceTokens: [String],

  role: {
    type: String,
    enum: ["user","admin"],
    default: "user"
  }

},
{ timestamps: true }
);

const User = mongoose.model("user",userSchema)
export default User;
