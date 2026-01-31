import {Server} from 'socket.io'
import User from '../models/User.js'
import Message from '../models/Message.js'

const OnlineUsers = new Map()

const typingUsers = new Map()

const initializeSocket = (server)=>{
    const io = new Server(server,{
        cors:{
            origin:process.env.FRONTEND_URL,
            credentials:true,
            methods:['GET','POST','PUT','DELETE','OPTIONS']
        },
        pingTimeout:60000 //DISCONETCT INTERVAL OF USER AFTER 60s
    })

    io.on("connection",(socket)=>{
        console.log('User Connected:',`${socket.id}`);
        let userId = null;

        socket.on("user_connect", async (connectingUser) => {
          try {
            userId = connectingUser;
            OnlineUsers.set(userId, socket.id);
            await User.findByIdAndUpdate(userId, {
              isOnline: true,
              lastSeen: new Date(),
            });

            io.emit("User_Status", { userId, isOnline: true });
          } catch (error) {
            console.error("Error Handling User Connection", error.message);
          }
        });

        socket.on("get_User_Status", (requestedUserId, callback) => {
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
            const senderSocketId = OnlineUsers(senderId);
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

        socket.on("typing_start", (conversationId, receverId) => {
          if (!userId || !conversationId || !receverId) return;

          if (!typingUsers.has(userId)) typingUsers.set(userId, {});

          typingUsers[conversationId] = true;

          //clear existing timeout
          if (typingUsers[`${conversationId}_timeout`]) {
            clearTimeout(typingUsers[`${conversationId}_timeout`]);
          }

          //auto-stop after 3s
          typingUsers[`${conversationId}_timeout`] = setTimeout(() => {
            typingUsers[conversationId] = false;
            socket.to(receverId).emit(
              "user_typing",
              {
                userId,
                conversationId,
                isTyping: true,
              },
              3000,
            );
          });
        });

        socket.on("typing_stop", (conversationId, receverId) => {
          if (!userId || !conversationId || !receverId) return;

          if (!typingUsers.has(userId)) typingUsers.set(userId, {});

          typingUsers[conversationId] = false;

          if (typingUsers[`${conversationId}_timeout`]) {
            clearTimeout(typingUsers[`${conversationId}_timeout`]);
            delete typingUsers[`${conversationId}_timeout`];
          }
          typingUsers[conversationId] = false;
          socket.to(receverId).emit("user_typing", {
            userId,
            conversationId,
            isTyping: false,
          });
        });

        socket.on(
          "add_reaction",
          async ({ messageId, emoji, reactionUserId }) => {
            try {
              const message = await Message.findById(messageId);

              if (!message) return;

              const existingIndex = message.reactions.findIndex(
                (r) => r.user.toString() === reactionUserId,
              );

              if (existingIndex > -1) {
                const existing = message.reactions(existingIndex);
                if (existing.emoji === emoji) {
                  message.reactions.splice(existingIndex, 1);
                } else {
                  message.reactions[existingIndex].emoji = emoji;
                }
              } else {
                message.reactions.push({ user: reactionUserId, emoji });
              }

              await message.save();

              const popolateMessage = await Message.findOne({
                _id: message._id,
              })
                .populate("sender", "username profilePicture")
                .populate("receiver", "username profilePicture")
                .populate("reactions.user", "username");

              const reactionUpdated = {
                messageId,
                reactions: popolateMessage.reactions,
              };

              const senderSocket = OnlineUsers.get(
                popolateMessage.sender._id.toString(),
              );
              const receiverSocket = OnlineUsers.get(
                popolateMessage.receiver._id.toString(),
              );

              if (senderSocket)
                io.to(senderSocket).emit("reaction_update", reactionUpdated);
              if (receiverSocket)
                io.to(receiverSocket).emit("rection_update", reactionUpdated);
            } catch (error) {
              console.log("Error handle rections", error.message);
            }
          },
        );

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

        io.soketUserMap = OnlineUsers

        return io  
    })
}

export default initializeSocket;