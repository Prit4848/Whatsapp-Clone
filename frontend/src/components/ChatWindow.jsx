import { useEffect, useRef } from "react";
import { ArrowLeft, MoreVertical, Phone, Video } from "lucide-react";
import useChatStore from "../store/useChatStore";
import Avatar from "./Avatar";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";
import { formatLastSeen } from "../utils/helpers";
import { getChatPartner } from "../data/mockData";

const ChatWindow = () => {
  const messagesEndRef = useRef(null);
  const { 
    activeChat, 
    chats, 
    messages, 
    typingUsers, 
    clearActiveChat,
    isMobileView 
  } = useChatStore();

  const chat = chats.find((c) => c.id === activeChat);
  const partner = chat ? getChatPartner(chat) : null;
  const chatMessages = messages[activeChat] || [];
  const isTyping = typingUsers[activeChat];

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isTyping]);

  if (!activeChat || !partner) {
    return (
      <div className="flex-1 flex items-center justify-center bg-chat-bg chat-pattern">
        <div className="text-center p-8">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <svg
              viewBox="0 0 303 172"
              className="w-16 h-16 text-muted-foreground opacity-40"
              fill="currentColor"
            >
              <path d="M229.565 160.229c32.47-25.166 52.645-63.518 52.645-106.756C282.21 23.97 258.242 0 228.708 0H71.502C31.968 0 8 23.97 8 53.473c0 43.238 20.175 81.59 52.645 106.756a8.001 8.001 0 0 1-2.645 14.603H3c0 42.569 49.493 41.168 84.628 41.168h127.744c35.135 0 84.628 1.401 84.628-41.168h-55c-4.516 0-7.77-4.357-6.436-8.603a7.998 7.998 0 0 1 2.565-5.998h-7.564z" />
            </svg>
          </div>
          <h2 className="text-xl font-medium text-foreground mb-2">
            WhatsApp Web
          </h2>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            Select a chat to start messaging
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-chat-bg">
      {/* Chat Header */}
      <header className="flex items-center gap-3 px-4 py-2 bg-card border-b border-border">
        {/* Back button (mobile) */}
        {isMobileView && (
          <button
            onClick={clearActiveChat}
            className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Back to chats"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
        )}

        {/* User info */}
        <Avatar
          src={partner.avatar}
          alt={partner.name}
          size="md"
          isOnline={partner.status === "online"}
        />
        <div className="flex-1 min-w-0">
          <h2 className="font-medium text-foreground truncate">{partner.name}</h2>
          <p className="text-xs text-muted-foreground truncate">
            {isTyping ? (
              <span className="text-primary">typing...</span>
            ) : partner.status === "online" ? (
              "online"
            ) : (
              formatLastSeen(partner.lastSeen)
            )}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          <button
            className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground"
            aria-label="Video call"
          >
            <Video className="w-5 h-5" />
          </button>
          <button
            className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground"
            aria-label="Voice call"
          >
            <Phone className="w-5 h-5" />
          </button>
          <button
            className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground"
            aria-label="More options"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 chat-pattern scrollbar-thin">
        {chatMessages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.senderId === "current"}
          />
        ))}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2">
            <div className="bg-bubble-incoming rounded-lg rounded-bl-sm shadow-sm">
              <TypingIndicator />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput />
    </div>
  );
};

export default ChatWindow;
