import Avatar from "./Avatar";
import MessageStatus from "./MessageStatus";
import { formatChatTime, truncateText } from "../utils/helpers";
import { getChatPartner } from "../data/mockData";
import useChatStore from "../store/useChatStore";

const ChatItem = ({ chat }) => {
  const { activeChat, setActiveChat } = useChatStore();
  const partner = getChatPartner(chat);
  const isActive = activeChat === chat.id;
  const isOwnMessage = chat.lastMessage?.senderId === "current";

  return (
    <button
      onClick={() => setActiveChat(chat.id)}
      className={`w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors border-b border-border ${
        isActive ? "bg-muted" : ""
      }`}
    >
      <Avatar
        src={partner.avatar}
        alt={partner.name}
        size="lg"
        isOnline={partner.status === "online"}
      />

      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between mb-1">
          <span className="font-medium text-foreground truncate">
            {partner.name}
          </span>
          <span
            className={`text-xs flex-shrink-0 ${
              chat.unreadCount > 0 ? "text-primary font-medium" : "text-muted-foreground"
            }`}
          >
            {formatChatTime(chat.lastMessage?.timestamp)}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Message status for own messages */}
          {isOwnMessage && (
            <MessageStatus status={chat.lastMessage?.status} />
          )}
          
          <span className="text-sm text-muted-foreground truncate flex-1">
            {truncateText(chat.lastMessage?.text || "", 40)}
          </span>

          {/* Unread badge */}
          {chat.unreadCount > 0 && (
            <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center">
              {chat.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

export default ChatItem;
