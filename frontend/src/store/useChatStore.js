import { create } from "zustand";
import {
  chats,
  messages,
  users,
  currentUser,
  getUserById,
} from "../data/mockData";
import axiosInstance from "../services/axiosInstance";
import { useAuthStore } from "../store/useAuthStore";
import { useUserStore } from "../store/useUserStore";

export const useChatStore = create((set, get) => ({
  // Auth state - always authenticated for UI demo
  isAuthenticated: true,
  isProfileComplete: true,
  currentUser: currentUser,

  // Chat state
  chats: [],
  activeChat: null,
  messages: [],

  // Users state
  users: users,
  typingUsers: {},

  // UI state
  isMobileView: window.innerWidth < 768,
  showChatList: true,
  isLoading: false,

  setAllChats: async () => {
    try {
      const currentUser = useAuthStore.getState().authUser;

      if (!currentUser) {
        console.log("User not ready");
        return;
      }
      const response = await axiosInstance.get("/conversation/");
      // console.log(
      //   response.data.data.conversations.map((chat, inx) => ({
      //     chat,
      //     // _id:inx,
      //     // participants:chat.participants.map((user)=>user._id === currentUser._id?"current":user._id),
      //     // lastMessage:chat.lastMessage.content,
      //     // createdAt:chat.lastMessage.createdAt,
      //     // updatedAt:chat.lastMessage.createdAt
      //   })),
      // );

      const chat = response.data.data.conversations.map((chat) => ({
        _id: chat._id,
        participants: chat.participants.map((user) =>
          user._id === currentUser._id ? "current" : user,
        ),
        lastMessage: {
          content: chat.lastMessage?.content,
          createdAt: chat.lastMessage?.createdAt,
          sender: chat.lastMessage?.sender,
          messageStatus: chat.lastMessage?.messageStatus,
        },
        createdAt: chat.lastMessage.createdAt,
        updatedAt: chat.lastMessage.createdAt,
      }));
      set({ chats: chat });
    } catch (error) {
      const errorMessage = error.response.data.messages || error.messages;
      console.log(errorMessage);
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
    console.error(
      error?.response?.data?.message || error.message
    );
  }
},


  setActiveChat: (chatId) => {
    set({
      activeChat: chatId,
      showChatList: !get().isMobileView,
    });
  },

  clearActiveChat: () => {
    set({ activeChat: null, showChatList: true });
  },

  
  sendMessage: () => {},
  deleteMessage: () => {},
  editMessage: () => {},
  setTyping: () => {},

  setMobileView: (isMobile) => {
    set({ isMobileView: isMobile });
  },

  toggleChatList: () => {
    set((state) => ({ showChatList: !state.showChatList }));
  },

  getUserById: (id) => getUserById(id),
}));
