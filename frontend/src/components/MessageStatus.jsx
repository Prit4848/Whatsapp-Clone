import { Check, CheckCheck } from "lucide-react";

const MessageStatus = ({ status }) => {
  if (status === "sent") {
    return <Check className="w-4 h-4 text-status-sent" />;
  }
  
  if (status === "delivered") {
    return <CheckCheck className="w-4 h-4 text-status-delivered" />;
  }
  
  if (status === "read") {
    return <CheckCheck className="w-4 h-4 text-status-read" />;
  }
  
  return null;
};

export default MessageStatus;
