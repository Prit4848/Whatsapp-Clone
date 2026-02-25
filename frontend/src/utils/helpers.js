import { format, isToday, isYesterday, isThisWeek } from "date-fns";

export const formatMessageTime = (timestamp) => {
  const date = new Date(timestamp);
  return format(date, "h:mm a");
};

export const formatChatTime = (timestamp) => {
  if(!timestamp) return "";
  const date = new Date(timestamp);
  
  if (isToday(date)) {
    return format(date, "h:mm a");
  }
  
  if (isYesterday(date)) {
    return "Yesterday";
  }
  
  if (isThisWeek(date)) {
    return format(date, "EEEE");
  }
  
  return format(date, "MM/dd/yyyy");
};

export const formatLastSeen = (timestamp) => {
  if (!timestamp) return "online";
  
  const date = new Date(timestamp);
  
  if (isToday(date)) {
    return `last seen today at ${format(date, "h:mm a")}`;
  }
  
  if (isYesterday(date)) {
    return `last seen yesterday at ${format(date, "h:mm a")}`;
  }
  
  return `last seen ${format(date, "dd/MM/yyyy")}`;
};

export const truncateText = (text, maxLength = 50) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

export const generateId = () => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const formatStatusTime = (timestamp) => {
  if (!timestamp) return "";

  const date = new Date(timestamp);
  const now = new Date();

  const diffInSeconds = Math.floor((now - date) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);

  // Just now
  if (diffInSeconds < 60) {
    return "Just now";
  }

  // Minutes ago
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min${diffInMinutes > 1 ? "s" : ""} ago`;
  }

  // Hours ago (today)
  if (diffInHours < 24 && isToday(date)) {
    return `${diffInHours} hr${diffInHours > 1 ? "s" : ""} ago`;
  }

  // Yesterday
  if (isYesterday(date)) {
    return `Yesterday at ${format(date, "h:mm a")}`;
  }

  // Older
  return format(date, "dd MMM yyyy, h:mm a");
};
