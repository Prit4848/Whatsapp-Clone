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
  isCreateChat:false,

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

    const chats = response.data.data.conversations.map((chat) => ({
      _id: chat._id,
      participants: chat.participants.map((user) =>
        user._id === currentUser._id ? "current" : user
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


  createChat:async (participant)=>{
    set({isCreateChat:true})
   try {
     const currentUser = useAuthStore.getState().authUser;
       const response = await axiosInstance.post("/conversation/",{participant:participant})
       console.log(response);
       const createdConversationresponse = response.data.data.conversation
        console.log( response.data.data.conversation);
        
       const createdConversation ={
        _id:createdConversationresponse._id,
        participants:createdConversationresponse.map((i)=> i === currentUser._id ? "current":i),
        lastMessage: {
        content: createdConversationresponse.lastMessage?.content || null,
        createdAt: createdConversationresponse.lastMessage?.createdAt || null,
        sender: createdConversationresponse.lastMessage?.sender || null,
        messageStatus: createdConversationresponse.lastMessage?.messageStatus || null,
      },
        createdAt: createdConversationresponse.lastMessage.createdAt,
        updatedAt: createdConversationresponse.lastMessage.createdAt,
       }

       set((state)=>({
        chats:[...state.chats,createdConversation]
       }));

   } catch (error) {
     const errorMessage = error.response.data.messages || error.messages || "Something Went Wrong Please Try Again ";
      console.log(errorMessage);
   }finally{
     set({isCreateChat:false})
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
      showChatList: !get().isMobileView,
    });
  },

  clearActiveChat: () => {
    set({ activeChat: null, showChatList: true });
  },

  sendMessage:async (message) => {
    try {
       const currentUser = useAuthStore.getState().authUser;
       const {activeChat,chats} = get() 
       const chat = chats.find((c)=> c._id === activeChat)
       const receiver = chat.participants.find((i)=> i !== "current")
       const payload = {
        senderId: currentUser._id,
        receiverId: receiver._id,
        content: message,
        messageStatus: "sent",
       }
      const response = await axiosInstance.post('/message/send-message',payload)
      const msg =response?.data?.data
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
      }
      
      set((state) => ({
        messages: [...state.messages, receiverMessage],
      }));
    } catch (error) {
      const errorMessage = error.respone.data.message || error.message
      toast.error(`${errorMessage}`)
    }
  },

 receiveMessage: () => {
  const { socket } = useAuthStore.getState();
  if (!socket) return;

  socket.off("receive_message"); 
  console.log(socket);
  
  socket.on("receive_message", (newMessage) => {
    console.log("Received:", newMessage);

    set((state) => ({
      messages: [...state.messages, newMessage],
    }));
  });
},

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
