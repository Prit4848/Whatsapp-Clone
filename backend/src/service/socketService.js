import { Server } from "socket.io";
import User from "../models/User.js";
import Message from "../models/Message.js";

const OnlineUsers = new Map();

const typingUsers = new Map();

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || origin) {
          callback(null, true);
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User Connected:", `${socket.id}`);
    let userId = null;

    socket.on("user_connect", async (connectingUser) => {
      try {
        userId = connectingUser;
        OnlineUsers.set(userId, socket.id);
        await User.findByIdAndUpdate(userId, {
          isOnline: true,
          lastSeen: new Date(),
        });

        io.emit("User_Status", { userId, isOnline: true, lastSeen: null });
      } catch (error) {
        console.error("Error Handling User Connection", error.message);
      }
    });

    socket.on("get_user_status", (requestedUserId, callback) => {
      const isOnline = OnlineUsers.has(requestedUserId);
      callback({
        userId: requestedUserId,
        isOnline,
        lastSeen: isOnline ? new Date() : null,
      });
    });

    socket.on("send_message", (message) => {
      try {
        const receiverSocketId = OnlineUsers.get(message.recever?._id);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receive_message", message);
        }
      } catch (error) {
        console.error("Error Sneding Message", error.message);
        socket.emit("message_error", {
          error: "failed to send the message",
        });
      }
    });

    socket.on("message_read", async ({ messageIds, senderId }) => {
      try {
        await Message.updateMany(
          { _id: { $in: messageIds } },
          { $set: { messageStatus: "read" } },
        );

        const senderSocketId = OnlineUsers.get(senderId);

        if (senderSocketId) {
          messageIds.forEach((messageId) => {
            io.to(senderSocketId).emit("message_status_update", {
              messageId,
              messageStatus: "read",
            });
          });
        }
      } catch (error) {
        console.log("Error Updating Message", error.message);
      }
    });

    socket.on("typing_start", ({ conversationId, receiverId, userId }) => {
      if (!conversationId || !receiverId || !userId) return;

      const receiverSocketId = OnlineUsers.get(receiverId);
      console.log("send", receiverSocketId);
      if (!receiverSocketId) return;

      // Emit immediately
      io.to(receiverSocketId).emit("user_typing", {
        userId,
        conversationId,
        isTyping: true,
      });

      // Clear old timeout
      const timeoutKey = `${conversationId}_${userId}`;
      if (typingUsers.has(timeoutKey)) {
        clearTimeout(typingUsers.get(timeoutKey));
      }

      // Auto stop after 3 sec
      const timeout = setTimeout(() => {
        io.to(receiverSocketId).emit("user_typing", {
          userId,
          conversationId,
          isTyping: false,
        });

        typingUsers.delete(timeoutKey);
      }, 3000);

      typingUsers.set(timeoutKey, timeout);
    });

    socket.on("typing_stop", ({ conversationId, receiverId, userId }) => {
      if (!conversationId || !receiverId || !userId) return;

      const receiverSocketId = OnlineUsers.get(receiverId);
      if (!receiverSocketId) return;

      const timeoutKey = `${conversationId}_${userId}`;

      // Clear timeout if exists
      if (typingUsers.has(timeoutKey)) {
        clearTimeout(typingUsers.get(timeoutKey));
        typingUsers.delete(timeoutKey);
      }

      io.to(receiverSocketId).emit("user_typing", {
        userId,
        conversationId,
        isTyping: false,
      });
    });

    socket.on("add_reactions", async ({ messageId, emoji, reactionUserId }) => {
      try {
        const message = await Message.findOne({
          _id: messageId,
          "reactions.user": reactionUserId,
        });

        if (message) {
          const existingReaction = message.reactions.find(
            (r) => r.user.toString() === reactionUserId.toString(),
          );
          console.log(existingReaction);

          if (existingReaction.emoji === emoji) {
            // Remove reaction (toggle off)
            await Message.updateOne(
              { _id: messageId },
              { $pull: { reactions: { user: reactionUserId } } },
            );
          } else {
            // Replace emoji
            await Message.updateOne(
              { _id: messageId, "reactions.user": reactionUserId },
              { $set: { "reactions.$.emoji": emoji } },
            );
          }
        } else {
          // Add new reaction
          await Message.updateOne(
            { _id: messageId },
            { $push: { reactions: { user: reactionUserId, emoji } } },
          );
        }

        const updatedMessage = await Message.findById(messageId)
          .populate("sender", "username profilePicture _id")
          .populate("receiver", "username profilePicture _id")
          .populate("reactions.user", "username");

        const reactionUpdated = {
          messageId,
          reactions: updatedMessage.reactions,
        };

        const senderSocket = OnlineUsers.get(
          updatedMessage.sender._id.toString(),
        );

        const receiverSocket = OnlineUsers.get(
          updatedMessage.receiver._id.toString(),
        );

        if (senderSocket)
          io.to(senderSocket).emit("reaction_update", reactionUpdated);

        if (receiverSocket)
          io.to(receiverSocket).emit("reaction_update", reactionUpdated);
      } catch (error) {
        console.log("Error handle reactions", error.message);
      }
    });

    const handleDisconected = async () => {
      if (!userId) return;

      try {
        if (typingUsers.has(userId)) {
          const userTyping = typingUsers.get(userId);
          Object.keys(userTyping).forEach((key) => {
            if (key.endsWith(_timeout)) clearTimeout(userTyping(key));
          });
          typingUsers.delete(userId);
        }

        await User.findByIdAndUpdate(userId, {
          isOnline: false,
          lastSeen: new Date(),
        });

        io.emit("user_status", {
          userId,
          isOnline: false,
          lastSeen: new Date(),
        });

        socket.leave(userId);
        console.log(`user ${userId} disconected`);
      } catch (error) {
        console.error("error handling disconect", error.message);
      }
    };

    socket.on("disconect", handleDisconected);
  });
  io.socketUserMap = OnlineUsers;

  return io;
};

export default initializeSocket;
