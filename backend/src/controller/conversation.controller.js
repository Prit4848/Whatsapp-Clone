import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { response } from "../utils/responseHandler.js";

export const getConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const conversations = await Conversation.find({ participants: userId })
    .populate({
      path: "participants",
      select:
        "username profilePicture isOnline lastSeen phoneNumber phoneSuffix email isVarified",
      match: { isVarified: true },
    })
    .populate({
      path: "lastMessage",
      populate: {
        path: "sender receiver",
        select: "username profilePicture",
      },
    })
    .sort({ updatedAt: -1 })
    .lean();
  console.log(conversations);
  
  const formatedParticipant = conversations.map((conversation) => {
    const otherUser = conversation.participants.find(
      (user) => user._id !== userId,
    );

    return {
      ...conversation,
      otherUser,
    };
  });
  return response(res, 200, "get Conversations Successfully", {
    conversations: formatedParticipant,
  });
});

export const createConversation = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { participant } = req.body;

  if (!participant) {
    return response(res, 404, "All Fields Are Required");
  }

  const participants = [userId, participant].sort();

  const isExist = await Conversation.findOne({ participants });

  if (isExist) {
    return response(res, 400, "Conversation Alredy Exist");
  }
  let conversation;
  conversation = new Conversation({
    participants: participants,
  });
  await conversation.save();

  const populateconversation = await Conversation.findById(conversation._id)
    .populate("participants", "username profilePicture _id")
    .lean();

  const receiverId = conversation.participants.find((id) => !id.equals(userId));

  if (req.io && req.socketUserMap) {
    const receiverSocketId = req.socketUserMap.get(receiverId.toString());

    if (receiverSocketId) {
      req.io.to(receiverSocketId).emit("create_chat", {
        conversation: populateconversation,
      });
    }
  }

  return response(res, 200, "Conversation Create Succesfully!", {
    conversation: populateconversation,
  });
});

export const deleteChat = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user._id;

  if (!conversationId) {
    return response(res, 400, "Conversation Id is required");
  }

  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    return response(res, 404, "Conversation Not Found");
  }

  // Proper ObjectId check
  const isParticipant = conversation.participants.some((id) =>
    id.equals(userId),
  );

  if (!isParticipant) {
    return response(res, 403, "You are not allowed to delete this chat");
  }

  // Get receiver id properly
  const receiverId = conversation.participants.find((id) => !id.equals(userId));

  await Message.deleteMany({ conversation: conversationId });
  await Conversation.findByIdAndDelete(conversationId);

  // Emit socket event
  if (req.io && req.socketUserMap && receiverId) {
    const receiverSocketId = req.socketUserMap.get(receiverId.toString());

    if (receiverSocketId) {
      req.io.to(receiverSocketId).emit("delete_chat", {
        chatId: conversationId,
      });
    }
  }

  return response(res, 200, "Conversation Deleted Successfully");
});

export const clearChat = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { conversationId } = req.params;

  if (!conversationId) {
    return response(res, 400, "Conversation Id is required");
  }

  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    return response(res, 404, "Conversation Not Found");
  }

  const isParticipant = conversation.participants.some((id) =>
    id.equals(userId),
  );

  if (!isParticipant) {
    return response(res, 403, "You are not allowed to clear this chat");
  }

  const receiverId = conversation.participants.find((id) => !id.equals(userId));

  await Message.deleteMany({ conversation: conversationId });

  if (req.io && req.socketUserMap && receiverId) {
    const receiverSocketId = req.socketUserMap.get(receiverId.toString());

    if (receiverSocketId) {
      req.io.to(receiverSocketId).emit("clear_chat", {
        chatId: conversationId,
      });
    }
  }

  return response(res, 200, "Chat Cleared Successfully");
});
