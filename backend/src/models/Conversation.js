import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "message" },
    unreadCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

conversationSchema.index({participants:1})
const Conversation = mongoose.model("conversation", conversationSchema);
export default Conversation;
