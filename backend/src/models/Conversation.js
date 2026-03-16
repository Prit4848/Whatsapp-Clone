import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
{
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],

  type: {
    type: String,
    enum: ["direct", "group", "community", "channel"],
    default: "direct"
  },

  groupName: String,
  groupDescription: String,
  groupAvatar: String,

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },

  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  }],

  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  }],

  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "message"
  },

  announcementOnly: {
    type: Boolean,
    default: false
  },

  memberPermissions: {
    sendMessage: { type: Boolean, default: true },
    editInfo: { type: Boolean, default: false }
  },

  unreadCount: {
    type: Map,
    of: Number
  }

},
{ timestamps: true }
);

conversationSchema.index({ participants: 1 });

const Conversation =  mongoose.model("conversation", conversationSchema);
export default Conversation;