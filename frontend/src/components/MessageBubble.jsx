import { useState, useRef, useEffect } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import MessageStatus from "./MessageStatus";
import { formatMessageTime } from "../utils/helpers";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const MessageBubble = ({ message, isOwn }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);
  const menuRef = useRef(null);
  const bubbleRef = useRef(null);
  const { socket } = useAuthStore();
  const { markMessageRead, setunreadCountZero, deleteMessage, updateMessage } = useChatStore();

  const isImage = message.contentType === "image";
  const isVideo = message.contentType === "video";
  const isText = message.contentType === "text";

  useEffect(() => {
    if (!bubbleRef.current) return;
    if (isOwn) return;
    if (message.messageStatus === "read") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) markMessageRead(message._id);
        });
      },
      { threshold: 0.6 }
    );

    observer.observe(bubbleRef.current);
    return () => {
      if (bubbleRef.current) observer.unobserve(bubbleRef.current);
    };
  }, [message._id, message.messageStatus]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target))
        setIsMenuOpen(false);
    };
    if (isMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  useEffect(() => {
    if (socket) setunreadCountZero();
  }, [socket]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditText(message.content);
    setIsMenuOpen(false);
  };

  const handleSaveEdit = async () => {
    setIsEditing(false);
    await updateMessage(message._id, editText);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditText(message.content);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const hadleDeleteMessage = (messageId) => {
    try {
      deleteMessage(messageId);
    } finally {
      setIsMenuOpen(false);
    }
  };

  return (
    <div
      ref={bubbleRef}
      className={`flex ${isOwn ? "justify-end" : "justify-start"} animate-message-in group px-1`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => !isMenuOpen && setIsHovered(false)}
    >
      <div
        className={`relative flex items-end gap-1.5 max-w-[78%] md:max-w-[62%] min-w-0 ${
          isOwn ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {/* 3-dot menu — sits outside bubble, vertically aligned to bottom */}
        <div
          className={`flex-shrink-0 transition-opacity duration-150 ${
            isHovered || isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          ref={menuRef}
        >
          {!isEditing && (
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-muted/70 transition-colors"
                aria-label="Message options"
              >
                <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
              </button>

              {isMenuOpen && (
                <div
                  className={`absolute bottom-full mb-1.5 ${
                    isOwn ? "right-0" : "left-0"
                  } w-44 bg-popover border border-border/60 rounded-xl shadow-lg z-50 overflow-hidden`}
                >
                  {isOwn && isText && (
                    <button
                      onClick={handleEdit}
                      className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-[13px] text-foreground hover:bg-muted/60 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                      Edit message
                    </button>
                  )}
                  {(isOwn && isText) && (
                    <div className="mx-3 h-px bg-border/50" />
                  )}
                  <button
                    onClick={() => hadleDeleteMessage(message._id)}
                    className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-[13px] text-destructive hover:bg-destructive/8 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete message
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Message bubble */}
        <div
          className={`min-w-0 break-words rounded-2xl px-3.5 py-2 shadow-sm ${
            isOwn
              ? "bg-bubble-outgoing text-bubble-outgoing-foreground rounded-br-[4px]"
              : "bg-bubble-incoming text-bubble-incoming-foreground rounded-bl-[4px]"
          }`}
        >
          {/* Image message */}
          {isImage && (
            <div className="mb-1">
              <img
                src={message.imageOrVideoUrl}
                alt="Shared image"
                className="rounded-xl max-w-full h-auto"
                loading="lazy"
              />
              {message.content && (
                <p className="mt-2 text-sm leading-relaxed">{message.content}</p>
              )}
            </div>
          )}

          {/* Video message */}
          {isVideo && (
            <div className="mb-1">
              <video
                src={message.imageOrVideoUrl}
                controls
                className="rounded-xl max-w-full h-auto"
              />
              {message.content && (
                <p className="mt-2 text-sm leading-relaxed">{message.content}</p>
              )}
            </div>
          )}

          {/* Text message */}
          {isText &&
            (isEditing ? (
              <div className="min-w-[220px]">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/25 transition-shadow"
                  rows={2}
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleSaveEdit}
                    className="px-3.5 py-1.5 text-[12px] font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-3.5 py-1.5 text-[12px] font-medium bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap break-words">
                {message.content}
                {message.isEdited && (
                  <span className="text-[10px] text-muted-foreground/70 ml-1.5 italic">
                    edited
                  </span>
                )}
              </p>
            ))}

          {/* Time + status row */}
          {!isEditing && (
            <div
              className={`flex items-center gap-1 mt-0.5 ${
                isOwn ? "justify-end" : "justify-start"
              }`}
            >
              <span className="text-[10px] text-muted-foreground/70 select-none">
                {formatMessageTime(message.createdAt)}
              </span>
              {isOwn && <MessageStatus status={message.messageStatus} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;