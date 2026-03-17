import Conversation from "../models/Conversation.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadFiletoClodinary } from "../config/clodinaryConfig.js";
import { response } from "../utils/responseHandler.js";
import Message from "../models/Message.js";

export const sendMessage = asyncHandler(async (req, res) => {
  const senderId = req.user._id;
  const { conversationId, content } = req.body;
  const file = req.file;

  if (!conversationId) {
    return response(res, 400, "conversationId is required");
  }

  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    return response(res, 404, "Conversation not found");
  }

  // ✅ Check sender is part of conversation
  const isMember = conversation.participants.some(
    (id) => id.toString() === senderId.toString()
  );

  if (!isMember) {
    return response(res, 403, "You are not part of this conversation");
  }

  // ✅ Check announcement mode / permission
  if (conversation.type === "group") {
    const isAdmin = conversation.admins.some(
      (id) => id.toString() === senderId.toString()
    );

    if (conversation.announcementMode?.enabled && !isAdmin) {
      return response(res, 403, "Only admins can send messages");
    }

    if (
      conversation.memberPermissions &&
      conversation.memberPermissions.sendMessage === false &&
      !isAdmin
    ) {
      return response(res, 403, "You are not allowed to send messages");
    }
  }

  let imageOrVideoUrl = null;
  let contentType = null;

  // ✅ Handle file upload
  if (file) {
    const uploadfile = await uploadFiletoClodinary(file);

    if (!uploadfile.secure_url) {
      return response(res, 400, "Failed to upload media");
    }

    imageOrVideoUrl = uploadfile.secure_url;

    if (file.mimetype.startsWith("video")) {
      contentType = "video";
    } else if (file.mimetype.startsWith("image")) {
      contentType = "image";
    } else {
      return response(res, 400, "Unsupported file type");
    }
  } 
  // ✅ Handle text
  else if (content && content.trim()) {
    contentType = "text";
  } 
  else {
    return response(res, 400, "Message content is required");
  }

  // ✅ Create message
  const message = await Message.create({
    conversation: conversationId,
    sender: senderId,
    content,
    contentType,
    imageOrVideoUrl,
    messageStatus: "sent",
  });

  // ✅ Update last message
  conversation.lastMessage = message._id;

  // ✅ Update unread count (group logic)
  if (conversation.type === "group") {
    conversation.unreadCount = (conversation.unreadCount || 0) + 1;
  }

  await conversation.save();

  // ✅ Populate message
  const populatedMessage = await Message.findById(message._id)
    .populate("sender", "username profilePicture")
    .lean();

  // ✅ Socket emit
  if (req.io) {
    // Send to all participants except sender
    conversation.participants.forEach((participantId) => {
      if (participantId.toString() !== senderId.toString()) {
        const socketId = req.socketUserMap?.get(participantId.toString());

        if (socketId) {
          req.io.to(socketId).emit("receive_message", populatedMessage);
        }
      }
    });
  }

  return response(res, 201, "Message sent successfully", populatedMessage);
});
export const getMessages = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { conversationId } = req.params;

  const conversation = await Conversation.findOne({ _id: conversationId });

  if (!conversation) {
    return response(res, 404, "Conversation Not Found");
  }

  if (!conversation.participants.includes(userId)) {
    return response(res, 400, "you not authorized to access the Messages");
  }

  const message = await Message.find({ conversation: conversationId })
    .populate("sender", "username profilePicture")
    .populate("receiver", "username profilePicture")
    .sort({ createdAt: 1 });

  await Message.updateMany(
    {
      conversation: conversationId,
      receiver: userId,
      messageStatus: { $in: ["send", "delivered"] },
    },
    { $set: { messageStatus: "read" } },
  );

  conversation.unreadCount = 0;
  await conversation.save();

  return response(res, 200, "get message successfullu", message);
});

export const markasRead = asyncHandler(async (req, res) => {
  const { messageId } = req.body;
  const userId = req.user._id;

  const message = await Message.findOne({
    _id: { $in: messageId },
    receiver: userId,
  });

  if (!message) {
    return response(res, 404, "message not found");
  }

  await Message.updateMany(
    { _id: { $in: messageId }, receiver: userId },
    { $set: { messageStatus: "read" } },
  );
  let updatedMessage = null;
  if (req.io && req.soketUserMap) {
    for (const message of message) {
      const senderSocketId = req.soketUserMap.get(
        message.sender._id.toString(),
      );
      updatedMessage = {
        _id: message._id,
        messageStatus: "read",
      };
      req.io.to(senderSocketId).emit("mark_read", updatedMessage);
    }
  }

  return response(res, 200, "mark ans read message", message);
});

export const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user._id;

  const message = await Message.findOne({ _id: messageId });

  if (!message) {
    return response(res, 404, "you dont have delete the message");
  }

  // if (message.sender.toString() !== userId.toString()) {
  //   return response(res, 400, "Not Authorized to delete the message");
  // }
   let id
   if(userId.toString() === message.receiver.toString()){
     id = message.sender.toString()
   }else if(userId.toString() === message.sender.toString()){
    id = message.receiver.toString()
   }
   
   await message.deleteOne();

  if (req.io && req.socketUserMap) {
    const receiversocketId = req.socketUserMap.get(id);
    req.io.to(receiversocketId).emit("message_deleted", {messageId});
  }

  return response(res, 200, "delete message successfully");
});

export const editMessage = asyncHandler(async (req,res)=>{
  const userId = req.user._id;
  const {messageId} = req.params
  const {content} = req.body;

  if(!messageId){
    return response(res,400,"MessageId Is Require!")
  }

  const message = await Message.findOne({_id:messageId})

  if(!message){
    return response(res,404,"Message Not Found")
  }

  if(userId.toString() !== message.sender.toString()){
   return response(res, 400, "Not Authorized to delete the message");
  }

  message.content = content;

  await message.save()
  
  if(req.io && req.socketUserMap){
    const socketReceiverId = req.socketUserMap.get(message.receiver.toString())

    req.io.to(socketReceiverId).emit("message_update",{messageId,content})
  }

  return response(res,200,"Message Update Successfully")
})

export const sendPoll = asyncHandler(async (req, res) => {
  const senderId = req.user._id;
  const { conversationId, question, options, anonymous } = req.body;

  if (!conversationId || !question || !options || options.length < 2) {
    return response(res, 400, "All fields are required (min 2 options)");
  }

  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    return response(res, 404, "Conversation not found");
  }

  const isMember = conversation.participants.some(
    (id) => id.toString() === senderId.toString()
  );

  if (!isMember) {
    return response(res, 403, "You are not part of this conversation");
  }

  if (conversation.type === "group") {
    const isAdmin = conversation.admins.some(
      (id) => id.toString() === senderId.toString()
    );

    if (conversation.announcementMode?.enabled && !isAdmin) {
      return response(res, 403, "Only admins can send messages");
    }
  }

  const formattedOptions = options.map((opt) => ({
    text: opt,
    votes: [],
  }));

  const message = await Message.create({
    conversation: conversationId,
    sender: senderId,
    contentType: "poll",
    poll: {
      question,
      options: formattedOptions,
      anonymous: !!anonymous,
    },
    messageStatus: "sent",
  });

  conversation.lastMessage = message._id;
  await conversation.save();

  const populatedMessage = await Message.findById(message._id)
    .populate("sender", "username profilePicture")
    .lean();
    
  if (req.io) {
    conversation.participants.forEach((participantId) => {
      if (participantId.toString() !== senderId.toString()) {
        const socketId = req.socketUserMap?.get(participantId.toString());

        if (socketId) {
          req.io.to(socketId).emit("receive_message", populatedMessage);
        }
      }
    });
  }

  return response(res, 201, "Poll created successfully", populatedMessage);
});
