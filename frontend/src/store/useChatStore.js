import { create } from "zustand";
import { chats, messages, users, currentUser, getUserById } from "../data/mockData";

const useChatStore = create((set, get) => ({
  // Auth state - always authenticated for UI demo
  isAuthenticated: true,
  isProfileComplete: true,
  currentUser: currentUser,
  
  // Chat state
  chats: chats,
  activeChat: null,
  messages: messages,
  
  // Users state
  users: users,
  typingUsers: {},
  
  // UI state
  isMobileView: window.innerWidth < 768,
  showChatList: true,
  isLoading: false,
  
  // Empty placeholder actions (no functionality)
  login: () => {},
  verifyOtp: () => {},
  completeProfileSetup: () => {},
  logout: () => {},
  
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

export default useChatStore;
