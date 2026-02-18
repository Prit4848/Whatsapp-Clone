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
    clearChat,
    deleteChat,
  } = useChatStore();
  const { socket } = useAuthStore();

  const chat = chats.find((c) => c._id === activeChat);
  const partner = chat?.participants?.find((p) => p != "current") || [];
  const chatMessages = messages || [];
  const isTyping = typingUsers.get(activeChat)?.size > 0;
  const { getUserStatus } = useUserStore();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const [showProfilePic, setShowProfilePic] = useState(false);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [chatMessages.length, isTyping]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [activeChat]);

  useEffect(() => {
    if (socket) {
      receiveMessage();
    }
  }, [socket]);

  const handleClearChat = async () => {
    clearChat();
  };

  const handleDeleteChat = async () => {
    deleteChat();
  };

  if (!activeChat || !partner) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-chat-bg chat-pattern h-full">
        <div className="flex flex-col items-center gap-5 px-10 py-10 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/40 shadow-sm max-w-sm w-full mx-4 text-center">
          <div className="relative flex items-center justify-center">
            <div
              className="absolute w-28 h-28 rounded-full bg-primary/5 animate-ping"
              style={{ animationDuration: "3s" }}
            />
            <div className="absolute w-24 h-24 rounded-full bg-primary/8 border border-primary/10" />
            <div className="relative w-20 h-20 rounded-full bg-muted flex items-center justify-center shadow-inner">
              <svg
                viewBox="0 0 303 172"
                className="w-10 h-10 text-primary opacity-50"
                fill="currentColor"
              >
                <path d="M229.565 160.229c32.47-25.166 52.645-63.518 52.645-106.756C282.21 23.97 258.242 0 228.708 0H71.502C31.968 0 8 23.97 8 53.473c0 43.238 20.175 81.59 52.645 106.756a8.001 8.001 0 0 1-2.645 14.603H3c0 42.569 49.493 41.168 84.628 41.168h127.744c35.135 0 84.628 1.401 84.628-41.168h-55c-4.516 0-7.77-4.357-6.436-8.603a7.998 7.998 0 0 1 2.565-5.998h-7.564z" />
              </svg>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <h2 className="text-[18px] font-semibold text-foreground tracking-tight">
              WhatsApp Web
            </h2>
            <p className="text-muted-foreground text-[13px] leading-relaxed max-w-[220px] mx-auto">
              Select a conversation from the list to start messaging
            </p>
          </div>
          <div className="flex items-center gap-3 w-full px-2">
            <div className="flex-1 h-px bg-border/60" />
            <span className="text-[10px] text-muted-foreground/50 uppercase tracking-widest font-medium">
              end-to-end encrypted
            </span>
            <div className="flex-1 h-px bg-border/60" />
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-3.5 h-3.5 text-muted-foreground/40 -mt-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-chat-bg">

      {/* ── Chat Header ── */}
      <header className="flex items-center gap-3 px-3 py-2 bg-card/95 backdrop-blur-sm border-b border-border/60 shadow-sm">
        {/* Back button (mobile) */}
        {isMobileView && (
          <button
            onClick={clearActiveChat}
            className="w-9 h-9 flex items-center justify-center -ml-1 rounded-full hover:bg-muted transition-colors"
            aria-label="Back to chats"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
        )}

        {/* Avatar */}
        <button
          onClick={() => setShowProfilePic(true)}
          className="focus:outline-none flex-shrink-0 rounded-full ring-2 ring-transparent hover:ring-primary/20 transition-all duration-200"
        >
          <Avatar
            src={partner.profilePicture}
            alt={partner.username}
            size="md"
            isOnline={getUserStatus(partner._id)}
          />
        </button>

        {/* Name + status */}
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-[15px] text-foreground truncate leading-tight">
            {partner.username}
          </h2>
          <p className="text-[12px] text-muted-foreground truncate leading-tight">
            {isTyping ? (
              <span className="text-primary font-medium">typing…</span>
            ) : getUserStatus(partner._id) ? (
              <span className="text-emerald-500 font-medium">online</span>
            ) : (
              formatLastSeen(partner.lastSeen)
            )}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-0.5">
          <button
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Video call"
          >
            <Video className="w-[18px] h-[18px]" />
          </button>
          <button
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Voice call"
          >
            <Phone className="w-[18px] h-[18px]" />
          </button>

          {/* More menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu((prev) => !prev)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              aria-label="More options"
            >
              <MoreVertical className="w-[18px] h-[18px]" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-48 bg-popover border border-border/60 rounded-xl shadow-lg z-50 overflow-hidden py-1">
                <button
                  onClick={() => {
                    handleDeleteChat();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-destructive hover:bg-destructive/8 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Chat
                </button>
                <div className="mx-3 h-px bg-border/50" />
                <button
                  onClick={() => {
                    handleClearChat();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-foreground hover:bg-muted transition-colors"
                >
                  <Eraser className="w-3.5 h-3.5 text-muted-foreground" />
                  Clear Chat
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Messages Area ── */}
      <div
        ref={messagesContainerRef}
        className="flex-1 min-h-0 overflow-y-auto px-3 py-4 space-y-1 chat-pattern scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
      >
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
          <div className="flex items-end gap-2 pl-1 pt-1">
            <div className="bg-bubble-incoming rounded-2xl rounded-bl-[4px] shadow-sm px-1 py-1">
              <TypingIndicator />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Message Input ── */}
      <MessageInput chat={chat} />

      {/* ── Profile Picture Viewer ── */}
      {showProfilePic && (
        <PhotoProvider
          visible={showProfilePic}
          onClose={() => setShowProfilePic(false)}
          maskOpacity={1}
          speed={() => 300}
          overlayRender={() => (
            <div className="absolute top-0 left-0 w-full z-50">
              <div className="flex items-center gap-3 px-3 pt-10 pb-8 bg-gradient-to-b from-black/80 via-black/30 to-transparent">
                <button
                  onClick={() => setShowProfilePic(false)}
                  className="flex items-center justify-center w-9 h-9 text-white rounded-full transition-all duration-150 active:scale-90 hover:bg-white/15"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
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
                <div className="flex items-center gap-3">
                  <img
                    src={partner.profilePicture}
                    alt={partner.username}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-white/20"
                  />
                  <div className="flex flex-col leading-tight">
                    <span className="text-white text-[16px] font-semibold tracking-tight">
                      {partner.username}
                    </span>
                    <span className="text-white/50 text-[11px] font-medium tracking-wide uppercase">
                      {new Date().toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        >
          <PhotoView src={partner.profilePicture}>
            <img
              src={partner.profilePicture}
              alt={partner.username}
              className="hidden"
            />
          </PhotoView>
        </PhotoProvider>
      )}
    </div>
  );
};

export default ChatWindow;