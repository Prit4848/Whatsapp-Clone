import { create } from "zustand";
import axiosInstance from "../services/axiosInstance";
import toast from "react-hot-toast";
import { useChatStore } from "./useChatStore";

export const useUserStore = create((set) => ({
  allUsers: null,

  setAllUsers: async () => {
    try {
      const response = await axiosInstance.get("/user/users");
      set({ allUsers: response.data.data });
    } catch (error) {
      const errorMessage = error.response.data.message || error.message;
      toast.error(`${errorMessage}`);
    }
  },

  getUserStatus: (id) => {
    const { onlineUsers } = useChatStore.getState();
    return onlineUsers.get(id)?.isOnline || false;
  },

  getlastSeen: (id) => {
    const { onlineUsers } = useChatStore.getState();
    return onlineUsers.get(id)?.lastSeen || null;
  },
}));