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

  initializeStatusSockets: () => {
    const { socket, authUser } = useAuthStore.getState();
    if (!socket || !authUser) return;

    socket.off("new_status");

    socket.on("new_status", (newStatus) => {

      set((state) => {
        const formattedStatus = {
          userId: newStatus.user._id,
          username: newStatus.user.username,
          profilePicture: newStatus.user.profilePicture,
          lastUpdated: newStatus.createdAt,
          seen: false,
          count: 1,
          content: [
            {
              id: newStatus._id,
              type: newStatus.contentType,
              data: newStatus.content,
              statusUrl: newStatus.statusUrl || null,
              createdAt: newStatus.createdAt,
              seen: false,
              viewers: [],
            },
          ],
        };

        const existingIndex = state.statuses.findIndex(
          (s) => s.userId === formattedStatus.userId,
        );

        // ✅ If user already exists
        if (existingIndex !== -1) {
          const updated = [...state.statuses];

          updated[existingIndex] = {
            ...updated[existingIndex],
            content: [
              formattedStatus.content[0],
              ...updated[existingIndex].content,
            ],
            count: updated[existingIndex].count + 1,
            lastUpdated: formattedStatus.lastUpdated,
            seen: false,
          };

          // 🔥 Move updated user to top (WhatsApp behavior)
          const updatedUser = updated.splice(existingIndex, 1)[0];
          updated.unshift(updatedUser);

          return { statuses: updated };
        }

        // ✅ If new user
        return {
          statuses: [formattedStatus, ...state.statuses],
        };
      });
    });

    socket.on("delete_status",(statusId)=>{
      set((state)=>({
        statuses:state.statuses.map((status)=>({
          ...status,
          content: status.content.filter((s) => s.id !== statusId),
        }))
      }))
    })
  },
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
          statusUrl:status.statusUrl,
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
          statusUrl: status.statusUrl,
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
      const mystatus = Object.values(grouped);
      set({ myStatuses: mystatus });
    } catch (err) {
      set({ error: err.message });
    }
  },

  // Create status
  createStatus: async (formData) => {
    try {
      const res = await axiosInstance.post("/status/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const apiData = res.data.data;

      set((state) => {
        const formattedStatus = {
          userId: apiData.user._id,
          username: apiData.user.username,
          profilePicture: apiData.user.profilePicture,
          lastUpdated: apiData.createdAt,
          seen: false,
          count: 1,
          content: [
            {
              id: apiData._id,
              type: apiData.contentType,
              data: apiData.content,
              createdAt: apiData.createdAt,
              statusUrl: apiData.statusUrl,
              seen: false,
              viewers: [],
            },
          ],
        };

        const existingIndex = state.myStatuses.findIndex(
          (s) => s.userId === formattedStatus.userId,
        );

        if (existingIndex !== -1) {
          const updated = [...state.myStatuses];

          updated[existingIndex] = {
            ...updated[existingIndex],
            content: [
              formattedStatus.content[0],
              ...updated[existingIndex].content,
            ],
            count: updated[existingIndex].count + 1,
            lastUpdated: formattedStatus.lastUpdated,
          };

          return { myStatuses: updated };
        }

        return {
          myStatuses: [formattedStatus, ...state.myStatuses],
        };
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      set({ error: errorMessage });
    }
  },

  // Delete status
  deleteStatus: async (statusId) => {
    try {
      await axiosInstance.delete(`/status/${statusId}/delete`);

      set((state) => ({
        myStatuses: state.myStatuses.map((status) => ({
          ...status,
          content: status.content.filter((s) => s.id !== statusId),
        })),
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
