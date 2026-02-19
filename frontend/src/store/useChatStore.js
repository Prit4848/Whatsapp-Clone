import { create } from "zustand";
import {
  users,
  currentUser,
} from "../data/mockData";
import axiosInstance from "../services/axiosInstance";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

export const useChatStore = create((set, get) => ({
  // Auth state - always authenticated for UI demo
  isAuthenticated: true,
  isProfileComplete: true,
  currentUser: currentUser,

  // Chat state
  chats: [],
  activeChat: null,
  messages: [],
  isCreateChat: false,

  // Users state
  users: users,
  typingUsers: new Map(),
  onlineUsers: new Map(),

  // UI state
  isMobileView: window.innerWidth < 768,
  showChatList: true,
  isLoading: false,

  initializeSocketListeners: () => {
    const { socket, authUser } = useAuthStore.getState();
    if (!socket || !authUser) return;

    // Remove old listeners to prevent duplication
    socket.off("receive_message");
    socket.off("message_status_update");
    socket.off("message_deleted");
    socket.off("reactions_update");
    socket.off("user_typing");
    socket.off("user_status");

    // ===============================
    // RECEIVE MESSAGE
    // ===============================
    socket.on("receive_message", (newMessage) => {
      const mappedMessage = {
        _id: newMessage._id,
        conversation: newMessage.conversation,
        sender:
          newMessage.sender._id === authUser._id
            ? "current"
            : newMessage.sender._id,
        receiver:
          newMessage.receiver._id === authUser._id
            ? "current"
            : newMessage.receiver._id,
        content: newMessage.content,
        imageOrVideoUrl: newMessage.imageOrVideoUrl,
        contentType: newMessage.contentType,
        reactions: newMessage.reactions,
        messageStatus: newMessage.messageStatus,
        createdAt: newMessage.createdAt,
        updatedAt: newMessage.updatedAt,
      };

      set((state) => {
        const updatedChats = state.chats.map((chat) => {
          if (chat._id === newMessage.conversation) {
            return {
              ...chat,
              lastMessage: mappedMessage,
              unreadCount:
                mappedMessage.receiver === "current"
                  ? (chat.unreadCount || 0) + 1
                  : chat.unreadCount || 0,
            };
          }
          return chat;
        });

        return {
          messages: [...state.messages, mappedMessage],
          chats: updatedChats,
        };
      });
    });

    // ===============================
    // MESSAGE STATUS UPDATE
    // ===============================
    socket.on("message_status_update", ({ messageId, messageStatus }) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId ? { ...msg, messageStatus } : msg,
        ),
      }));
    });

    // ===============================
    // MESSAGE DELETED
    // ===============================
    socket.on("message_deleted", ({ messageId }) => {
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== messageId),
      }));
    });

    // ===============================
    // REACTIONS UPDATE
    // ===============================
    socket.on("reactions_update", ({ messageId, reactions }) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId ? { ...msg, reactions } : msg,
        ),
      }));
    });

    // ===============================
    // USER TYPING
    // ===============================
    socket.on("user_typing", ({ userId, conversationId, isTyping }) => {
      console.log("typing");

      set((state) => {
        const newTypingUsers = new Map(state.typingUsers);

        if (!newTypingUsers.has(conversationId)) {
          newTypingUsers.set(conversationId, new Set());
        }

        const typingSet = newTypingUsers.get(conversationId);

        if (isTyping) {
          typingSet.add(userId);
        } else {
          typingSet.delete(userId);
        }

        return { typingUsers: newTypingUsers };
      });
    });

    // ===============================
    // USER ONLINE / OFFLINE STATUS
    // ===============================
    socket.on("user_status", ({ userId, isOnline, lastSeen }) => {
      set((state) => {
        const newOnlineUsers = new Map(state.onlineUsers);
        newOnlineUsers.set(userId, { isOnline, lastSeen });
        return { onlineUsers: newOnlineUsers };
      });
    });

    socket.on("message_update", ({ messageId, content }) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId ? { ...msg, content } : msg,
        ),
      }));
    });

    socket.on("clear_chat", ({ chatId }) => {
      set((state) => ({
        messages: state.messages.filter((msg) => msg.conversation !== chatId),
      }));
    });

    socket.on("delete_chat", ({ chatId }) => {
      set((state) => ({
        chats: state.chats.filter((chat) => chat._id !== chatId),
      }));
      setTimeout(() => {
        window.location.reload();
      }, 500);
    });

    socket.on("create_chat", ({ conversation }) => {
      console.log("Received conversation:", conversation);

      const createdConversation = {
        _id: conversation._id,
        participants: conversation.participants.map((i) =>
          i === currentUser._id ? "current" : i,
        ),
        lastMessage: {
          content: conversation.lastMessage?.content || null,
          createdAt: conversation.lastMessage?.createdAt || null,
          sender: conversation.lastMessage?.sender || null,
          messageStatus: conversation.lastMessage?.messageStatus || null,
        },
        createdAt: conversation.lastMessage?.createdAt || new Date(),
        updatedAt: conversation.lastMessage?.createdAt || new Date(),
      };

      set((state) => ({
        chats: [...state.chats, createdConversation],
      }));
    });
  },

  setAllChats: async () => {
    try {
      const currentUser = useAuthStore.getState().authUser;

      if (!currentUser) {
        console.log("User not ready");
        return;
      }

      const response = await axiosInstance.get("/conversation/");

      const chats = response.data.data.conversations.map((chat) => ({
        _id: chat._id,
        participants: chat.participants.map((user) =>
          user._id === currentUser._id ? "current" : user,
        ),
        lastMessage: {
          content: chat.lastMessage?.content || null,
          createdAt: chat.lastMessage?.createdAt || null,
          sender: chat.lastMessage?.sender || null,
          messageStatus: chat.lastMessage?.messageStatus || null,
        },
        createdAt: chat.lastMessage?.createdAt || null,
        updatedAt: chat.lastMessage?.createdAt || null,
      }));

      set({ chats });
    } catch (error) {
      console.log("ERROR:", error.message);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Something Went Wrong Please Try Again";

      console.log(errorMessage);
    }
  },

  createChat: async (participant) => {
    set({ isCreateChat: true });
    try {
      const currentUser = useAuthStore.getState().authUser;
      const response = await axiosInstance.post("/conversation/", {
        participant: participant,
      });
      console.log(response);
      const createdConversationresponse = response.data.data.conversation;
      console.log(response.data.data.conversation);

      const createdConversation = {
        _id: createdConversationresponse._id,
        participants: createdConversationresponse.map((i) =>
          i === currentUser._id ? "current" : i,
        ),
        lastMessage: {
          content: createdConversationresponse.lastMessage?.content || null,
          createdAt: createdConversationresponse.lastMessage?.createdAt || null,
          sender: createdConversationresponse.lastMessage?.sender || null,
          messageStatus:
            createdConversationresponse.lastMessage?.messageStatus || null,
        },
        createdAt: createdConversationresponse.lastMessage.createdAt,
        updatedAt: createdConversationresponse.lastMessage.createdAt,
      };

      set((state) => ({
        chats: [...state.chats, createdConversation],
      }));
      set({ isCreateChat: false });
    } catch (error) {
      const errorMessage =
        error.response.data.messages ||
        error.messages ||
        "Something Went Wrong Please Try Again ";
      toast.error(`${errorMessage}`);
    } finally {
      set({ isCreateChat: false });
    }
  },

  setMessage: async () => {
    try {
      const { activeChat } = get();
      const currentUser = useAuthStore.getState().authUser;

      if (!activeChat || !currentUser) return;

      const response = await axiosInstance.get(`/message/${activeChat}`);

      const mappedMessages = response.data.data.map((msg) => ({
        _id: msg._id,
        conversation: msg.conversation,
        sender: msg.sender._id === currentUser._id ? "current" : msg.sender._id,
        receiver:
          msg.receiver._id === currentUser._id ? "current" : msg.receiver._id,
        content: msg.content,
        imageOrVideoUrl: msg.imageOrVideoUrl,
        contentType: msg.contentType,
        reactions: msg.reactions,
        messageStatus: msg.messageStatus,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt,
      }));

      set({ messages: mappedMessages });
    } catch (error) {
      console.error(error?.response?.data?.message || error.message);
    }
  },

  setActiveChat: (chatId) => {
    set({
      activeChat: chatId,
      showChatList: false, // always hide sidebar on mobile
    });
  },

  clearActiveChat: () => {
    set({
      activeChat: null,
      showChatList: true,
    });
  },

  sendMessage: async (message, file) => {
    try {
      const currentUser = useAuthStore.getState().authUser;
      const { activeChat, chats } = get();
      const chat = chats.find((c) => c._id === activeChat);
      const receiver = chat.participants.find((i) => i !== "current");
      console.log(currentUser, receiver);

      const formData = new FormData();

      formData.append("senderId", currentUser._id);
      formData.append("receiverId", receiver._id);
      formData.append("messageStatus", "sent");

      if (message?.trim()) {
        formData.append("content", message);
      }

      if (file) {
        formData.append("media", file);
      }

      console.log(formData.entries());

      const response = await axiosInstance.post(
        "/message/send-message",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      const msg = response?.data?.data;
      const receiverMessage = {
        _id: msg._id,
        conversation: msg.conversation,
        sender: msg.sender._id === currentUser._id ? "current" : msg.sender._id,
        receiver:
          msg.receiver._id === currentUser._id ? "current" : msg.receiver._id,
        content: msg.content,
        imageOrVideoUrl: msg.imageOrVideoUrl,
        contentType: msg.contentType,
        reactions: msg.reactions,
        messageStatus: msg.messageStatus,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt,
      };

      set((state) => ({
        messages: [...state.messages, receiverMessage],
      }));
    } catch (error) {
      const errorMessage = error.respone.data.message || error.message;
      toast.error(`${errorMessage}`);
    }
  },

  receiveMessage: () => {
    const { socket, authUser } = useAuthStore.getState();
    if (!socket) return;

    socket.off("receive_message");
    socket.on("receive_message", (newMessage) => {
      set((state) => {
        const updatedChats = state.chats.map((chat) => {
          if (chat._id === newMessage.conversation) {
            return {
              ...chat,
              lastMessage: newMessage,
              unreadCount:
                newMessage?.receiver?._id === authUser?._id
                  ? (chat.unreadCount || 0) + 1
                  : chat.unreadCount || 0,
            };
          }
          return chat;
        });

        return {
          messages: [...state.messages, newMessage],
          chats: updatedChats,
        };
      });
    });
  },

  markMessageRead: async (messageId) => {
    const { socket } = useAuthStore.getState();

    try {
      await axiosInstance.put("/message/read", {
        messageId: [messageId],
      });

      // Optimistic update
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId ? { ...msg, messageStatus: "read" } : msg,
        ),
      }));
      const message = get().messages.find((m) => m._id === messageId);
      socket?.emit("message_read", {
        messageIds: [messageId],
        senderId: message.sender, // important
      });
    } catch (error) {
      console.error(error?.response?.data?.message || error.message);
    }
  },

  deleteMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/message/${messageId}`);
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== messageId),
      }));
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  },
  updateMessage: async (messageId, content) => {
    try {
      await axiosInstance.put(`/message/${messageId}`, { content });

      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId ? { ...msg, content } : msg,
        ),
      }));
    } catch (error) {
      const errorMessage = error.response.data.message || error.message;
      toast.error(errorMessage);
    }
  },
  editMessage: () => {},
  addReactions: (messageId, emoji) => {
    const { socket, authUser } = useAuthStore.getState();
    if (socket && authUser) {
      socket.emit("add_reactions", {
        messageId,
        emoji,
        userId: authUser._id,
      });
    }
  },

  startTyping: (receiverId) => {
    const { socket, authUser } = useAuthStore.getState();
    const { activeChat } = get();
    if (!socket || !receiverId) return;
    console.log("start", receiverId);

    socket.emit("typing_start", {
      conversationId: activeChat,
      receiverId,
      userId: authUser._id,
    });
  },

  stopTyping: (receiverId) => {
    const { socket, authUser } = useAuthStore.getState();
    const userId = authUser._id;
    const { activeChat } = get();
    if (!socket || !receiverId) return;

    socket.emit("typing_stop", {
      conversationId: activeChat,
      receiverId,
      userId,
    });
  },

  isUserTyping: (userId) => {
    const { typingUsers, activeChat } = get();

    if (!activeChat || !typingUsers.has(activeChat) || !userId) {
      return false;
    }
    return typingUsers.get(activeChat).has(userId);
  },
  isUserOnline: (userId) => {
    const { authUser } = useAuthStore.getState();
    if (!authUser) return;
    const { onlineUsers } = get();
    return onlineUsers.get(userId)?.isOnline || false;
  },
  getUserLastseen: (userId) => {
    const { authUser } = useAuthStore.getState();
    if (!authUser) return;
    const { onlineUsers } = get();
    return onlineUsers.get(userId)?.lastSeen || null;
  },

  setunreadCountZero: () => {
    const { activeChat, chats } = get();
    const currentChat = chats.find((c) => activeChat === c._id);
    if (!currentChat) return;
    set((state) => {
      const currentChatupdate = state.chats.map((chat) => {
        if (currentChat._id === chat._id) {
          return {
            ...chat,
            unreadCount: 0,
          };
        }
        return chat;
      });
      return {
        chats: currentChatupdate,
      };
    });
  },
  updateUserStatus: (userId) => {
    const { socket } = useAuthStore.getState();
    if (!userId && !socket) return;
    socket.emit("get_user_status", userId, (response) => {
      set((state) => {
        const updateMap = new Map(state.onlineUsers);
        updateMap.set(response.userId, {
          isOnline: response.isOnline,
          lastSeen: response.lastSeen,
        });
        return {
          onlineUsers: updateMap,
        };
      });
    });
  },
  deleteChat: async () => {
    try {
      const { activeChat } = get();
      await axiosInstance.delete(`/conversation/${activeChat}`);
      set((state) => ({
        chats: state.chats.filter((chat) => chat._id !== activeChat),
        messages: [],
        activeChat: null,
      }));
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      const errorMessage = error.response.data.message || error.message;
      toast.error(errorMessage);
    }
  },
  clearChat: async () => {
    try {
      const { activeChat } = get();
      await axiosInstance.delete(`/conversation/${activeChat}/clear-chat`);
      set((state) => ({
        messages: state.messages.filter(
          (msg) => msg.conversation !== activeChat,
        ),
      }));
    } catch (error) {
      const errorMessage = error.response.data.message || error.message;
      toast.error(errorMessage);
    }
  },
  cleanup: () => {
    const { socket } = useAuthStore.getState();
    socket?.removeAllListeners();

    set({
      chats: [],
      activeChat: null,
      messages: [],
      typingUsers: new Map(),
      onlineUsers: new Map(),
    });
  },
  setMobileView: (isMobile) => {
    set({ isMobileView: isMobile });
  },

  toggleChatList: () => {
    set((state) => ({ showChatList: !state.showChatList }));
  },
}));
