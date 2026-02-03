import { create } from "zustand";
import  axiosInstance  from "../services/axiosInstance";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? import.meta.env.VITE_BASE_URI : "/";

console.log("BASE_URL",BASE_URL);

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/user/profile");

      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },


  sendOtp: async (data) =>{
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/send-otp", data);
      toast.success(`${res.data.message}`);
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },


  verifyOtp: async (data) =>{
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/verify-otp", data);
      set({ authUser: res.data });
      toast.success(`${res.data.message}`);

      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      withCredentials:true
    });
    socket.connect();

    set({ socket: socket });

    socket.emit("user_connect",authUser._id);

    socket.emit("get_User_Status",{userId:authUser._id}, (response) => {
      const isOnline = response.isOnline;
      set((state) => ({
        onlineUsers: isOnline
        ? Array.from(new Set([...state.onlineUsers, response.userId]))
        : state.onlineUsers.filter((id) => id !== response.userId),
      }));
    });

  },
  disconnectSocket: () => {
    const socket = get().socket;
    if (socket?.connected) {
      socket.disconnect();
      set({ socket: null, onlineUsers: [], userStatusMap: {} });
    }
  },
}));