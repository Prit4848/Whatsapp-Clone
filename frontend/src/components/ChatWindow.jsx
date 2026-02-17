import { useEffect, useRef } from "react";
import {
  ArrowLeft,
  MoreVertical,
  Phone,
  Video,
  Trash2,
  Eraser,
} from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import Avatar from "./Avatar";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";
import { formatLastSeen } from "../utils/helpers";
import { useUserStore } from "../store/useUserStore";
import { useState } from "react";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";

const ChatWindow = () => {
  const messagesEndRef = useRef(null);
  const {
    activeChat,
    chats,
    messages,
    typingUsers,
    clearActiveChat,
    isMobileView,
    receiveMessage,
  } = useChatStore();
  const { socket } = useAuthStore();

  const chat = chats.find((c) => c._id === activeChat);
  const partner = chat?.participants?.find((p) => p != "current") || [];
  const chatMessages = messages || [];
  const isTyping = typingUsers.get(activeChat)?.size > 0;
  const { getUserStatus, } = useUserStore();
  const isCreator = chat ? chat.participants[0] === "current" : false;
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const [showProfilePic, setShowProfilePic] = useState(false);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isTyping]);
  useEffect(() => {
    if (socket) {
      receiveMessage();
    }
  }, [socket]);

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
        <button
          onClick={() => setShowProfilePic(true)}
          className="focus:outline-none"
        >
          <Avatar
            src={partner.profilePicture}
            alt={partner.username}
            size="md"
            isOnline={getUserStatus(partner._id)}
          />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="font-medium text-foreground truncate">
            {partner.username}
          </h2>
          <p className="text-xs text-muted-foreground truncate">
            {isTyping ? (
              <span className="text-primary">typing...</span>
            ) : getUserStatus(partner._id) ? (
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
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu((prev) => !prev)}
              className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground"
              aria-label="More options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-50 py-1">
                <button
                  onClick={() => {
                    // deleteChat(activeChat);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-muted transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Chat
                </button>
                {isCreator && (
                  <button
                    onClick={() => {
                      // clearChat(activeChat);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <Eraser className="w-4 h-4" />
                    Clear Chat
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-2 chat-pattern scrollbar-thin">
        {chatMessages.map((message) => (
          <MessageBubble
            key={message._id}
            message={message}
            isOwn={message.sender === "current"}
            value={chat}
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
      <MessageInput chat={chat} />

      {showProfilePic && (
        <PhotoProvider
          visible={showProfilePic}
          onClose={() => setShowProfilePic(false)}
          maskOpacity={1}
          speed={() => 300}
          overlayRender={() => (
            <div className="absolute top-0 left-0 w-full z-50 flex items-center justify-between p-2 bg-gradient-to-b from-black/70 via-black/40 to-transparent">
              <div className="flex items-center gap-2">
                {/* Back Button - Essential for WhatsApp feel */}
                <button
                  onClick={() => setShowProfilePic(false)}
                  className="p-2 text-white hover:bg-white/10 rounded-full transition-colors active:scale-90"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>

                <div className="flex flex-col">
                  <span className="text-white text-[17px] font-medium leading-tight">
                    {partner.username}
                  </span>
                  <span className="text-white/60 text-xs">
                    {new Date().toLocaleDateString()}{" "}
                    {/* Mimics the "date updated" feel */}
                  </span>
                </div>
              </div>
            </div>
          )}
        >
          <PhotoView src={partner.profilePicture}>
            <img
              src={partner.profilePicture}
              alt={partner.username}
              className="hidden" // Keeping it hidden so only the full-screen view shows
            />
          </PhotoView>
        </PhotoProvider>
      )}
    </div>
  );
};

export default ChatWindow;
