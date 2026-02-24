import Conversation from "../models/Conversation.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadFiletoClodinary } from "../config/clodinaryConfig.js";
import { response } from "../utils/responseHandler.js";
import Message from "../models/Message.js";

export const sendMessage = asyncHandler(async (req, res) => {
  const { senderId, receiverId, content, messageStatus } = req.body;
  const participants = [senderId, receiverId].sort();
 console.log(req.body);
 
  let conversation = await Conversation.findOne({ participants });

  if (!conversation) {
    conversation = new Conversation({ participants });
    await conversation.save();
  }
  let imageOrVideoUrl = null;
  let contentType = null;
  const file = req.file;
  if (file) {
    const uploadfile = await uploadFiletoClodinary(file);

    if (!uploadfile.secure_url) {
      return response(res, 400, "failed to upload media");
    }

    imageOrVideoUrl = uploadfile.secure_url;

    if (file.mimetype.startsWith("video")) {
      contentType = "video";
    } else if (file.mimetype.startsWith("image")) {
      contentType = "image";
    } else {
      return response(res, "400", "Unsupported File Type");
    }
  } else if (content.trim()) {
    contentType = "text";
  } else {
    return response(res, 400, "message Content is require");
  }

  const message = new Message({
    conversation: conversation._id,
    sender: senderId,
    receiver: receiverId,
    imageOrVideoUrl,
    contentType,
    content,
    messageStatus,
  });
  console.log(message);
  
  await message.save();
  if (message.content) {
    conversation.lastMessage = message._id;
  }
  conversation.unreadCount += 1;
  await conversation.save();

  const popolateMessage = await Message.findOne({ _id: message._id })
    .populate({ path: "sender", select: "username profilePicture" })
    .populate({ path: "receiver", select: "username profilePicture" });
    
  if (req.io && req.socketUserMap) {
    const receiverSocketId = req.socketUserMap.get(receiverId);
    
    if (receiverSocketId) {
      req.io.to(receiverSocketId).emit("receive_message", popolateMessage);
      message.messageStatus = "delivered";
      await message.save();
    }
  }

  return response(res, 201, "Message Send Succesfully", popolateMessage);
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
   console.log(req.socketUserMap);
   
   console.log(id);
  if (req.io && req.socketUserMap) {
    const receiversocketId = req.socketUserMap.get(id);
    console.log(receiversocketId);
    
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
   console.log(req.socketUserMap);
   
  if(req.io && req.socketUserMap){
    const socketReceiverId = req.socketUserMap.get(message.receiver.toString())

    req.io.to(socketReceiverId).emit("message_update",{messageId,content})
  }

  return response(res,200,"Message Update Successfully")
})
