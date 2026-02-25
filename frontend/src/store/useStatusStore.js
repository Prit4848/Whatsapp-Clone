import { create } from "zustand";
import axios from "axios";
import axiosInstance from "../services/axiosInstance";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useStatusStore = create((set, get) => ({
  // ───── STATE ─────
  statuses: [], // all statuses
  myStatuses: [], // logged-in user statuses
  userStatuses: {}, // grouped by userId
  activeStatus: null, // currently opened status
  isLoading: false,
  error: null,

  // ───── ACTIONS ─────

  // Fetch all statuses
  fetchStatuses: async () => {
    try {
      const currentUserId = useAuthStore.getState().authUser?._id;

      set({ isLoading: true });

      const res = await axiosInstance.get("/status/");
      const grouped = {};

      res.data.data.forEach((status) => {
        const userId = status.user?._id;

        if (!grouped[userId]) {
          grouped[userId] = {
            userId,
            username: status.user?.username,
            profilePicture: status.user?.profilePicture,
            lastUpdated: status.updatedAt,
            seen: status.viewer?.includes(currentUserId),
            count: 0,
            content: [],
          };
        }

        // Push status into content array
        grouped[userId].content.push({
          id: status._id,
          type: status.contentType,
          data: status.content,
          createdAt: status.createdAt,
          seen: status.viewer?.includes(currentUserId),
        });

        // Increase count
        grouped[userId].count += 1;

        // Update lastUpdated to latest
        if (
          new Date(status.updatedAt) > new Date(grouped[userId].lastUpdated)
        ) {
          grouped[userId].lastUpdated = status.updatedAt;
        }
      });

      // Convert object → array
      const statuses = Object.values(grouped);

      set({
        statuses,
        isLoading: false,
      });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },
  // Fetch my statuses
  fetchMyStatuses: async () => {
    try {
      const currentUserId = useAuthStore.getState().authUser?._id;
      const res = await axiosInstance.get("/status/me");

      const grouped = {};
       console.log( res.data.data);
       
      res.data.data.forEach((status) => {
        const userId = status.user?._id;

        if (!grouped[userId]) {
          grouped[userId] = {
            userId,
            username: status.user?.username,
            profilePicture: status.user?.profilePicture,
            lastUpdated: status.updatedAt,
            seen: status.viewer?.includes(currentUserId),
            count: 0,
            content: [],
          };
        }

        // Push status into content array
        grouped[userId].content.push({
          id: status._id,
          type: status.contentType,
          data: status.content,
          createdAt: status.createdAt,
          seen: status.viewer?.includes(currentUserId),
          viewers:
            status.viewer?.map((v) => ({
              _id: v._id,
              username: v.username,
              profilePicture: v.profilePicture,
            })) || [],
        });

        // Increase count
        grouped[userId].count += 1;

        // Update lastUpdated to latest
        if (
          new Date(status.updatedAt) > new Date(grouped[userId].lastUpdated)
        ) {
          grouped[userId].lastUpdated = status.updatedAt;
        }
      });
      const mystatus = Object.values(grouped)
      set({ myStatuses: mystatus });
    } catch (err) {
      set({ error: err.message });
    }
  },

  // Create status
  createStatus: async (data, file) => {
    try {
      console.log(data);
      const fortdata = new FormData();
      if (file) {
        fortdata.append("media", file);
      }

      const res = await axiosInstance.post(
        "/status/",
        { content: data, fortdata },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      set((state) => ({
        statuses: [res.data, ...state.statuses],
        myStatuses: [res.data, ...state.myStatuses],
      }));
    } catch (err) {
      const errorMessage = err.response.data.message || err.message;
      set({ error: errorMessage });
    }
  },

  // Delete status
  deleteStatus: async (statusId) => {
    try {
      await axios.delete(`/api/status/${statusId}`);

      set((state) => ({
        statuses: state.statuses.filter((s) => s._id !== statusId),
        myStatuses: state.myStatuses.filter((s) => s._id !== statusId),
      }));
    } catch (err) {
      set({ error: err.message });
    }
  },

  // Mark status as viewed
  markAsViewed: async (statusId) => {
    try {
      await axiosInstance.get(`/status/${statusId}/view`);
      
      // set((state) => ({
      //   statuses: state.statuses.map((status) =>
      //     status._id === statusId
      //       ? {
      //           ...status,
      //           viewer: [...status.viewer, "current"],
      //         }
      //       : status,
      //   ),
      // }));
    } catch (err) {
      set({ error: err.message });
    }
  },

  // Set active status (for viewer modal)
  setActiveStatus: (status) => set({ activeStatus: status }),

  // Clear active
  clearActiveStatus: () => set({ activeStatus: null }),
}));
