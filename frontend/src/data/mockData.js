// Mock users data
export const users = [
  {
    id: "1",
    name: "John Doe",
    phone: "+1234567890",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    status: "online",
    lastSeen: null,
  },
  {
    id: "2",
    name: "Sarah Wilson",
    phone: "+1234567891",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    status: "online",
    lastSeen: null,
  },
  {
    id: "3",
    name: "Mike Johnson",
    phone: "+1234567892",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    status: "offline",
    lastSeen: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
  },
  {
    id: "4",
    name: "Emily Davis",
    phone: "+1234567893",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    status: "offline",
    lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
  {
    id: "5",
    name: "Alex Chen",
    phone: "+1234567894",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    status: "online",
    lastSeen: null,
  },
  {
    id: "6",
    name: "Lisa Thompson",
    phone: "+1234567895",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
    status: "offline",
    lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
];

// Current logged-in user
export const currentUser = {
  id: "current",
  name: "You",
  phone: "+1987654321",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face",
  status: "online",
  lastSeen: null,
};

// Mock chats data
export const chats = [
  {
    id: "chat1",
    participants: ["current", "2"],
    lastMessage: {
      id: "msg1",
      text: "Hey! How are you doing?",
      senderId: "2",
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
      status: "read",
    },
    unreadCount: 0,
  },
  {
    id: "chat2",
    participants: ["current", "3"],
    lastMessage: {
      id: "msg2",
      text: "Let's meet tomorrow at 3 PM",
      senderId: "current",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
      status: "delivered",
    },
    unreadCount: 0,
  },
  {
    id: "chat3",
    participants: ["current", "4"],
    lastMessage: {
      id: "msg3",
      text: "Thanks for the help!",
      senderId: "4",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      status: "read",
    },
    unreadCount: 2,
  },
  {
    id: "chat4",
    participants: ["current", "5"],
    lastMessage: {
      id: "msg4",
      text: "Check out this photo 📸",
      senderId: "5",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
      status: "read",
    },
    unreadCount: 1,
  },
  {
    id: "chat5",
    participants: ["current", "6"],
    lastMessage: {
      id: "msg5",
      text: "See you next week!",
      senderId: "current",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      status: "read",
    },
    unreadCount: 0,
  },
];

// Mock messages data
export const messages = {
  chat1: [
    {
      id: "m1",
      chatId: "chat1",
      senderId: "2",
      type: "text",
      content: "Hi there! 👋",
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      status: "read",
    },
    {
      id: "m2",
      chatId: "chat1",
      senderId: "current",
      type: "text",
      content: "Hey Sarah! Good to hear from you",
      timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
      status: "read",
    },
    {
      id: "m3",
      chatId: "chat1",
      senderId: "2",
      type: "text",
      content: "I wanted to ask you about the project we discussed last week",
      timestamp: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
      status: "read",
    },
    {
      id: "m4",
      chatId: "chat1",
      senderId: "current",
      type: "text",
      content: "Sure! What do you need to know?",
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      status: "read",
    },
    {
      id: "m5",
      chatId: "chat1",
      senderId: "2",
      type: "image",
      content: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop",
      caption: "Here's the design mockup",
      timestamp: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
      status: "read",
    },
    {
      id: "m6",
      chatId: "chat1",
      senderId: "current",
      type: "text",
      content: "Wow, this looks amazing! Great work 🎉",
      timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      status: "read",
    },
    {
      id: "m7",
      chatId: "chat1",
      senderId: "2",
      type: "text",
      content: "Thanks! I spent a lot of time on it",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      status: "read",
    },
    {
      id: "m8",
      chatId: "chat1",
      senderId: "2",
      type: "text",
      content: "Hey! How are you doing?",
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      status: "read",
    },
  ],
  chat2: [
    {
      id: "m9",
      chatId: "chat2",
      senderId: "3",
      type: "text",
      content: "Are you free tomorrow?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      status: "read",
    },
    {
      id: "m10",
      chatId: "chat2",
      senderId: "current",
      type: "text",
      content: "Yes, I should be available in the afternoon",
      timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
      status: "read",
    },
    {
      id: "m11",
      chatId: "chat2",
      senderId: "3",
      type: "text",
      content: "Perfect! Want to grab coffee?",
      timestamp: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
      status: "read",
    },
    {
      id: "m12",
      chatId: "chat2",
      senderId: "current",
      type: "text",
      content: "Let's meet tomorrow at 3 PM",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      status: "delivered",
    },
  ],
  chat3: [
    {
      id: "m13",
      chatId: "chat3",
      senderId: "current",
      type: "text",
      content: "I can help you with that issue",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      status: "read",
    },
    {
      id: "m14",
      chatId: "chat3",
      senderId: "4",
      type: "text",
      content: "That would be great!",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.5).toISOString(),
      status: "read",
    },
    {
      id: "m15",
      chatId: "chat3",
      senderId: "4",
      type: "text",
      content: "Thanks for the help!",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      status: "read",
    },
  ],
  chat4: [
    {
      id: "m16",
      chatId: "chat4",
      senderId: "5",
      type: "image",
      content: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
      caption: "Check out this photo 📸",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      status: "read",
    },
  ],
  chat5: [
    {
      id: "m17",
      chatId: "chat5",
      senderId: "6",
      type: "text",
      content: "Have a great weekend!",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(),
      status: "read",
    },
    {
      id: "m18",
      chatId: "chat5",
      senderId: "current",
      type: "text",
      content: "See you next week!",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      status: "read",
    },
  ],
};

// Helper to get user by ID
export const getUserById = (id) => {
  if (id === "current") return currentUser;
  return users.find((user) => user.id === id);
};

// Helper to get chat partner (other participant)
export const getChatPartner = (chat) => {
  const partnerId = chat.participants.find((id) => id !== "current");
  return getUserById(partnerId);
};
