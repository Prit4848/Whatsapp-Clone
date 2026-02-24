import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "conversation",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    content: { type: String },
    imageOrVideoUrl: { type: String },
    contentType: { type: String },
  reactions: [
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    emoji: {
      type: String,
      required: true,
    },
  },
],
    messageStatus: { type: String, default: "send" },
  },
  { timestamps: true },
);

const Message = mongoose.model("message",messageSchema)
export default Message;
