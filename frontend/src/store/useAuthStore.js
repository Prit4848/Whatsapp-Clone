import { create } from "zustand";
import axiosInstance from "../services/axiosInstance";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

// const BASE_URL = "https://whatsapp-clone-c57y.onrender.com";
const BASE_URL = "http://localhost:4000";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isAuthenticated: false,
  isProfileComplete: false,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/user/profile", {
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      const user = res.data.data;
      set({
        authUser: user,
        isAuthenticated: true,
        isProfileComplete: user.profilePicture && user.username ? true : false,
      });
    } catch (error) {
      set({
        authUser: null,
        isAuthenticated: false,
      });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  sendOtp: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/send-otp", data);
      toast.success(`${res.data.message}`);
      return res;
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        "Email sending error please try again";
      toast.error(`${errorMessage}`);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  verifyOtp: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/verify-otp", data);
      if (res.data?.data?.token) {
        localStorage.setItem("token", res.data.data.token);
      }
      set({ authUser: res.data.data.user, isAuthenticated: true });
      toast.success(`${res.data.message}`);

      get().connectSocket();
    } catch (error) {
      const errorMessage = error.response.data.message || error.message;
      toast.error(errorMessage);
    } finally {
      set({ isLoggingIn: false });
    }
  },
  loginWithGoogle: async (idToken) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/google", { token: idToken });
      if (res.data.data?.token) {
        localStorage.setItem("token", res?.data?.data?.token);
      }
      set({ authUser: res?.data?.data?.user, isAuthenticated: true });
    } catch (error) {
      const errorMessage = error.response.data.data.message || error.message;
      toast.error(errorMessage);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.get("/auth/logout");
      localStorage.removeItem("token");
      set({ authUser: null, isAuthenticated: false });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      const errorMessage = error.response.data.message || error.message;
      toast.error(errorMessage);
    }
  },

  ProfileSetup: async (data) => {
    set({ isLoggingIn: true });
    try {
      const formData = new FormData();

      if (data.username) formData.append("username", data.username);
      if (data.about) formData.append("about", data.about);
      if (data.agreed) formData.append("agreed", data.agreed);

      if (data.media instanceof File) {
        formData.append("media", data.media);
      } else if (typeof data.media === "string" && data.media.trim() !== "") {
        formData.append("media", data.media);
      }
      await axiosInstance.put("/user/update-profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      set((state) => ({
        authUser: { ...state.authUser, ...data },
        isProfileComplete: true,
      }));

      toast.success("Profile updated successfully");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong please try again";
      toast.error(errorMessage);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong please try again";
      toast.error(errorMessage);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser || socket?.connected) return;

    const newSocket = io(BASE_URL, {
      transports: ["websocket"],
      withCredentials: true,
    });

    newSocket.connect();

    newSocket.emit("user_connect", authUser._id);

    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket?.connected) {
      socket.disconnect();
      socket.on("disconnect", (reason) => {
        console.log("Socket Disconnected", reason);
      });
      set({ socket: null, onlineUsers: [], userStatusMap: {} });
    }
  },
}));
