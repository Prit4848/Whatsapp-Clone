import { uploadFiletoClodinary } from "../config/clodinaryConfig.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { response } from "../utils/responseHandler.js";

export const getConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const conversations = await Conversation.find({
    participants: userId,
  })
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

  const formattedConversations = conversations.map((conversation) => {
    // DIRECT CHAT
    if (conversation.type === "direct") {
      const otherUser = conversation.participants.find(
        (user) => user && user._id.toString() !== userId.toString(),
      );

      return {
        _id: conversation._id,
        type: "direct",
        participants: conversation.participants,
        otherUser,
        lastMessage: conversation.lastMessage || null,
      };
    }

    // GROUP CHAT
    if (conversation.type === "group") {
      return {
        _id: conversation._id,
        type: "group",
        groupName: conversation.groupName,
        groupAvatar: conversation.avatar || null,
        participants: conversation.participants,
        lastMessage: conversation.lastMessage || null,
      };
    }
  });

  return response(res, 200, "Get conversations successfully", {
    conversations: formattedConversations,
  });
});

export const createConversation = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { participant } = req.body;

  if (!participant) {
    return response(res, 400, "Participant is required");
  }

  // Prevent self chat
  if (userId.toString() === participant.toString()) {
    return response(res, 400, "You cannot chat with yourself");
  }

  const participants = [userId.toString(), participant.toString()].sort();

  // Check existing conversation
  const isExist = await Conversation.findOne({
    participants: { $all: participants, $size: 2 },
    type: "direct",
  });

  if (isExist) {
    return response(res, 409, "Conversation already exists", {
      conversation: isExist,
    });
  }

  // Create conversation
  const conversation = await Conversation.create({
    participants,
    type: "direct",
  });

  // Populate
  const populatedConversation = await Conversation.findById(conversation._id)
    .populate("participants", "username profilePicture _id")
    .lean();

  // Get receiver
  const receiverId = participants.find((id) => id !== userId.toString());

  // Socket emit
  if (req.io && req.socketUserMap) {
    const receiverSocketId = req.socketUserMap.get(receiverId);

    if (receiverSocketId) {
      req.io.to(receiverSocketId).emit("create_chat", {
        conversation: populatedConversation,
      });
    }
  }

  return response(res, 201, "Conversation created successfully!", {
    conversation: populatedConversation,
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

export const createGroup = asyncHandler(async (req, res) => {
  const { name, participants } = req.body;
  const userId = req.user;

  if (!name || !participants || participants.length === 0) {
    return response(res, 400, "All Fields Are Required");
  }

  const nameExist = await Conversation.findOne({
    groupName: name,
  });

  if (nameExist) {
    return response(res, 409, "Name already exists in another chat");
  }

  const file = req.file;
  let avatar = "";

  if (file) {
    const uploadfile = await uploadFiletoClodinary(file);
    avatar = uploadfile.secure_url;
  }

  const allParticipants = [...new Set([...participants, userId])];

  const conversation = new Conversation({
    participants: allParticipants,
    type: "group",
    groupName: name,
    admins: [userId],
    avatar,
  });

  await conversation.save();

  return response(res, 201, "Group Created Successfully");
});

export const updateGroup = asyncHandler(async (req, res) => {
  const { name, description, participants } = req.body;
  const userId = req.user._id;

  const file = req.file;
  const { id: conversationId } = req.params;

  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    return response(res, 404, "Conversation Not Found");
  }

  // Ensure it's a group
  if (conversation.type !== "group") {
    return response(res, 400, "Not a group conversation");
  }

  // Admin check
  if (!conversation.admins.includes(userId.toString())) {
    return response(res, 403, "Only admins can update group");
  }

  // Check duplicate name (excluding current group)
  if (name) {
    const nameExist = await Conversation.findOne({
      groupName: name,
      _id: { $ne: conversationId },
    });

    if (nameExist) {
      return response(res, 409, "Name already exists in another chat");
    }

    conversation.groupName = name;
  }

  // Upload avatar
  if (file) {
    const uploadfile = await uploadFiletoClodinary(file);
    conversation.avatar = uploadfile.secure_url;
  }

  if (description) {
    conversation.groupDescription = description;
  }

  if (participants && participants.length > 0) {
    conversation.participants = [
      ...new Set([...conversation.participants, ...participants]),
    ];
  }

  await conversation.save();

  return response(res, 200, "Group updated successfully");
});

export const removeMemberFromGroup = asyncHandler(async (req, res) => {
  const userId = req.user._id; 
  const { memberId } = req.body;
  const { id: conversationId } = req.params;

  if (!memberId) {
    return response(res, 400, "MemberId is required");
  }

  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    return response(res, 404, "Conversation not found");
  }

  // Only group allowed
  if (conversation.type !== "group") {
    return response(res, 400, "This is not a group conversation");
  }

  // Admin check
  if (!conversation.admins.includes(userId)) {
    return response(res, 403, "Only admins can remove members");
  }

  // Check member exists
  if (!conversation.participants.includes(memberId)) {
    return response(res, 404, "Member not found in group");
  }

  // Prevent removing admin (optional rule)
  const isRemovingAdmin = conversation.admins.includes(memberId);

  if (isRemovingAdmin && conversation.admins.length === 1) {
    return response(res, 400, "Cannot remove the only admin");
  }

  // Remove member from participants
  conversation.participants = conversation.participants.filter(
    (id) => id.toString() !== memberId.toString(),
  );

  // Remove from admins if present
  conversation.admins = conversation.admins.filter(
    (id) => id.toString() !== memberId.toString(),
  );

  await conversation.save();

  if (req.io && req.socketUserMap) {
    const memberSocketId = req.socketUserMap.get(memberId.toString());

    if (memberSocketId) {
      req.io.to(memberSocketId).emit("removed_from_group", {
        conversationId,
      });
    }
  }

  return response(res, 200, "Member removed successfully", {
    conversationId,
    memberId,
  });
});

export const leaveGroup = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id: conversationId } = req.params;

  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    return response(res, 404, "Conversation not found");
  }

  if (conversation.type !== "group") {
    return response(res, 400, "This is not a group conversation");
  }

  const isMember = conversation.participants.some(
    (id) => id.toString() === userId.toString(),
  );

  if (!isMember) {
    return response(res, 403, "You are not a member of this group");
  }

  conversation.participants = conversation.participants.filter(
    (id) => id.toString() !== userId.toString(),
  );

  const isAdmin = conversation.admins.some(
    (id) => id.toString() === userId.toString(),
  );

  if (isAdmin) {
    conversation.admins = conversation.admins.filter(
      (id) => id.toString() !== userId.toString(),
    );

    if (
      conversation.admins.length === 0 &&
      conversation.participants.length > 0
    ) {
      conversation.admins.push(conversation.participants[0]);
    }
  }

  if (conversation.participants.length === 0) {
    await Conversation.findByIdAndDelete(conversationId);

    return response(res, 200, "Group deleted as no members left");
  }

  await conversation.save();

  if (req.io) {
    req.io.to(conversationId).emit("member_left", {
      conversationId,
      userId,
    });
  }

  return response(res, 200, "Left group successfully", {
    conversationId,
  });
});

export const makeAdmin = asyncHandler(async (req, res) => {
  const requesterId = req.user._id;
  const { id: conversationId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return response(res, 400, "userId is required");
  }

  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    return response(res, 404, "Conversation not found");
  }

  if (conversation.type !== "group") {
    return response(res, 400, "Only groups have admins");
  }

  const isAdmin = conversation.admins.some(
    (id) => id.toString() === requesterId.toString()
  );

  if (!isAdmin) {
    return response(res, 403, "Only admins can promote users");
  }

  const isParticipant = conversation.participants.some(
    (id) => id.toString() === userId.toString()
  );

  if (!isParticipant) {
    return response(res, 400, "User is not in this group");
  }

  const alreadyAdmin = conversation.admins.some(
    (id) => id.toString() === userId.toString()
  );

  if (alreadyAdmin) {
    return response(res, 400, "User is already an admin");
  }

  conversation.admins.push(userId);

  await conversation.save();

  if (req.io) {
    conversation.participants.forEach((participantId) => {
      const socketId = req.socketUserMap?.get(participantId.toString());

      if (socketId) {
        req.io.to(socketId).emit("admin_updated", {
          conversationId,
          userId,
          action: "promoted"
        });
      }
    });
  }

  return response(res, 200, "User promoted to admin", {
    conversationId,
    admins: conversation.admins
  });
});

export const removeAdmin = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id;
  const { userId } = req.body; // admin to remove
  const { id: conversationId } = req.params;

  if (!userId) {
    return response(res, 400, "userId is required");
  }

  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    return response(res, 404, "Conversation not found");
  }

  // Only group allowed
  if (conversation.type !== "group") {
    return response(res, 400, "This is not a group conversation");
  }

  // Check current user is admin
  const isCurrentUserAdmin = conversation.admins.some(
    (id) => id.toString() === currentUserId.toString(),
  );

  if (!isCurrentUserAdmin) {
    return response(res, 403, "Only admins can remove admin");
  }

  // Check target user is admin
  const isTargetAdmin = conversation.admins.some(
    (id) => id.toString() === userId.toString(),
  );

  if (!isTargetAdmin) {
    return response(res, 404, "User is not an admin");
  }

  // Optional: prevent removing yourself
  if (currentUserId.toString() === userId.toString()) {
    return response(res, 400, "You cannot remove yourself as admin");
  }

  // Prevent removing last admin
  if (conversation.admins.length === 1) {
    return response(res, 400, "Cannot remove the only admin");
  }

  // Remove admin
  conversation.admins = conversation.admins.filter(
    (id) => id.toString() !== userId.toString(),
  );

  await conversation.save();

  // 🔥 Optional: socket event
  if (req.io && req.socketUserMap) {
    const socketId = req.socketUserMap.get(userId.toString());

    if (socketId) {
      req.io.to(socketId).emit("removed_as_admin", {
        conversationId,
      });
    }
  }

  return response(res, 200, "Admin removed successfully", {
    conversationId,
    removedAdmin: userId,
  });
});

export const updateGroupPermissions = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id: conversationId } = req.params;
  const { sendMessage, editInfo } = req.body;

  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    return response(res, 404, "Conversation not found");
  }

  // Only group allowed
  if (conversation.type !== "group") {
    return response(res, 400, "This is not a group conversation");
  }

  // Admin check
  const isAdmin = conversation.admins.some(
    (id) => id.toString() === userId.toString(),
  );

  if (!isAdmin) {
    return response(res, 403, "Only admins can update permissions");
  }

  // Initialize if not exists
  if (!conversation.memberPermissions) {
    conversation.memberPermissions = {};
  }

  // Update only provided fields
  if (typeof sendMessage === "boolean") {
    conversation.memberPermissions.sendMessage = sendMessage;
  }

  if (typeof editInfo === "boolean") {
    conversation.memberPermissions.editInfo = editInfo;
  }

  await conversation.save();

  if (req.io) {
    req.io.to(conversationId).emit("permissions_updated", {
      conversationId,
      permissions: conversation.memberPermissions,
    });
  }

  return response(res, 200, "Permissions updated successfully", {
    conversationId,
    permissions: conversation.memberPermissions,
  });
});

export const setAnnouncementMode = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id: conversationId } = req.params;
  const { enabled } = req.body;

  if (typeof enabled !== "boolean") {
    return response(res, 400, "enabled must be boolean");
  }

  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    return response(res, 404, "Conversation not found");
  }

  // Only group allowed
  if (conversation.type !== "group") {
    return response(res, 400, "This is not a group conversation");
  }

  // Admin check
  const isAdmin = conversation.admins.some(
    (id) => id.toString() === userId.toString(),
  );

  if (!isAdmin) {
    return response(res, 403, "Only admins can change announcement mode");
  }

  // Initialize if needed
  if (!conversation.announcementMode) {
    conversation.announcementMode = { enabled: false };
  }

  conversation.announcementMode.enabled = enabled;

  // 🔥 Optional: sync with permissions
  // If enabled → only admins can send
  if (!conversation.memberPermissions) {
    conversation.memberPermissions = {};
  }

  if (enabled) {
    conversation.memberPermissions.sendMessage = false;
  } else {
    conversation.memberPermissions.sendMessage = true;
  }

  await conversation.save();

  // 🔥 Optional: real-time event
  if (req.io) {
    req.io.to(conversationId).emit("announcement_mode_updated", {
      conversationId,
      enabled,
    });
  }

  return response(res, 200, "Announcement mode updated", {
    conversationId,
    enabled,
  });
});
