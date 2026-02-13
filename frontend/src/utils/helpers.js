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
