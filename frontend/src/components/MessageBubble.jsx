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
  const {socket} = useAuthStore()
  const {markMessageRead ,setunreadCountZero,deleteMessage,updateMessage} = useChatStore()
 

  const isImage = message.contentType === "image";
  const isVideo = message.contentType === "video";
  const isText = message.contentType === "text";


  useEffect(() => {
  if (!bubbleRef.current) return;
  if (isOwn) return; // Only mark incoming messages as read
  if (message.messageStatus === "read") return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          markMessageRead(message._id);
        }
      });
    },
    { threshold: 0.6 } // 60% visible
  );

  observer.observe(bubbleRef.current);

  return () => {
    if (bubbleRef.current) {
      observer.unobserve(bubbleRef.current);
    }
  };
}, [message._id, message.messageStatus]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  useEffect(() => {
    if(socket){
      setunreadCountZero()
    }
  }, [socket])
  

  const handleEdit = () => {
    setIsEditing(true);
    setEditText(message.content);
    setIsMenuOpen(false);
  };

  const handleSaveEdit = async () => {
    setIsEditing(false);
    await updateMessage(message._id,editText)
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

  const hadleDeleteMessage = (messageId)=>{
     try {
      deleteMessage(messageId)
     }finally{
      setIsMenuOpen(false)
     }
  }

  return (
    <div
        ref={bubbleRef}
      className={`flex ${isOwn ? "justify-end" : "justify-start"} animate-message-in`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => !isMenuOpen && setIsHovered(false)}
    >
      <div
        className={`relative flex items-start gap-1 w-full min-w-0 ${
          isOwn ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {/* Message bubble */}
        <div
          className={`min-w-0 max-w-[75%] md:max-w-[60%] break-words rounded-lg px-3 py-2 shadow-sm ${
            isOwn
              ? "bg-bubble-outgoing text-bubble-outgoing-foreground rounded-br-sm"
              : "bg-bubble-incoming text-bubble-incoming-foreground rounded-bl-sm"
          }`}
        >
          {/* Image message */}
          {isImage && (
            <div className="mb-1">
              <img
                src={message.imageOrVideoUrl}
                alt="Shared image"
                className="rounded-md max-w-full h-auto"
                loading="lazy"
              />
              {message.content && (
                <p className="mt-2 text-sm">{message.content}</p>
              )}
            </div>
          )}

          {/* Video message */}
          {isVideo && (
            <div className="mb-1">
              <video
                src={message.imageOrVideoUrl}
                controls
                className="rounded-md max-w-full h-auto"
              />
              {message.content && (
                <p className="mt-2 text-sm">{message.content}</p>
              )}
            </div>
          )}

          {/* Text message - with editing support */}
          {isText &&
            (isEditing ? (
              <div className="min-w-[200px]">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full p-2 text-sm rounded-md border border-border bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                  rows={2}
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleSaveEdit}
                    className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1 text-xs bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm whitespace-pre-wrap break-words">
                {message.content}
                {message.isEdited && (
                  <span className="text-[10px] text-muted-foreground ml-1">
                    (edited)
                  </span>
                )}
              </p>
            ))}

          {/* Time and status */}
          {!isEditing && (
            <div
              className={`flex items-center gap-1 mt-1 ${
                isOwn ? "justify-end" : "justify-start"
              }`}
            >
              <span className="text-[10px] text-muted-foreground">
                {formatMessageTime(message.createdAt)}
              </span>
              {isOwn && <MessageStatus status={message.messageStatus} />}
            </div>
          )}
        </div>

        {/* 3-dot menu */}
        {(isHovered || isMenuOpen) && !isEditing && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 rounded-full hover:bg-muted/50 transition-colors flex-shrink-0"
              aria-label="Message options"
            >
              <MoreVertical className="w-4 h-4 text-muted-foreground" />
            </button>

            {isMenuOpen && (
              <div
                className={`relative bottom-full mb-1 ${isOwn ? "right-0" : "left-0"} w-40 p-1 bg-popover border border-border rounded-md shadow-md z-50`}
              >
                <div className="flex flex-col">
                  {/* Edit option - only for own text messages */}
                  {isOwn && isText && (
                    <button
                      onClick={handleEdit}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit message
                    </button>
                  )}
                  {/* Delete option - for all messages */}
                  <button
                    onClick={() => hadleDeleteMessage(message._id)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete message
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
