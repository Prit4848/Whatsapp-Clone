import mongoose from "mongoose";

const pollOptionSchema = new mongoose.Schema({
  option: String,
  voters: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }]
});

const messageSchema = new mongoose.Schema(
{
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "conversation",
    required: true
  },

  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true
  },

  content: String,

  messageType: {
    type: String,
    enum: ["text","image","video","file","poll","system"],
    default: "text"
  },

  mediaUrl: String,

  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "message"
  },

  poll: {
    question: String,
    options: [pollOptionSchema],
    anonymous: { type: Boolean, default: false }
  },

  reactions: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
      },
      emoji: String
    }
  ],

  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  }],

  edited: { type: Boolean, default: false },

  deletedForEveryone: { type: Boolean, default: false }

},
{ timestamps: true }
);

const Message =  mongoose.model("message", messageSchema);
export default Message;