import mongoose from "mongoose";

const statusSchema = new mongoose.Schema(
{
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },

  content: String,

  contentType: {
    type: String,
    enum: ["text","image","video"]
  },

  statusUrl: String,

  viewers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  }],

  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user"
    },
    emoji: String
  }],

  privacy: {
    type: String,
    enum: ["public","contacts","closeFriends"],
    default: "contacts"
  },

  expiredAt: {
    type: Date,
    required: true
  }

},
{ timestamps: true }
);

const Status = mongoose.model("status", statusSchema);
export default Status;