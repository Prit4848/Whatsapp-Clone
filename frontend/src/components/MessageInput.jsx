import { useRef, useState } from "react";
import { Send, Paperclip, Smile, Mic, X, Image, Video, File } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";

const EMOJI_CATEGORIES = {
  "😊 Smileys": ["😀","😃","😄","😁","😆","😅","😂","🤣","😊","😇","🙂","🙃","😉","😌","😍","🥰","😘","😗","😙","😚","😋","😛","😝","😜","🤪","🤨","🧐","🤓","😎","🥸","🤩","🥳","😏","😒","😞","😔","😟","😕","🙁","☹️","😣","😖","😫","😩","🥺","😢","😭","😤","😠","😡","🤬","🤯","😳","🥵","🥶","😱","😨","😰","😥","😓","🫣","🤗","🫡","🤔","🫠","🤭","🤫","🤥","😶","😑","😬","🙄","😯","😦","😧","😮","😲","🥱","😴","🤤","😪","😵","🫥","🤐","🥴","🤢","🤮","🤧","😷","🤒","🤕"],
  "👋 Gestures": ["👋","🤚","🖐","✋","🖖","👌","🤌","🤏","✌️","🤞","🫰","🤟","🤘","🤙","👈","👉","👆","🖕","👇","☝️","🫵","👍","👎","✊","👊","🤛","🤜","👏","🙌","🫶","👐","🤲","🤝","🙏","✍️","💅","🤳","💪","🦵","🦶","👂","🦻","👃","🫀","🫁","🧠","🦷","🦴","👀","👁","👅","👄","🫦"],
  "❤️ Hearts": ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❤️‍🔥","❤️‍🩹","❣️","💕","💞","💓","💗","💖","💘","💝","💟","☮️","✝️","☪️","🕉","✡️","🔯","🪯"],
  "🎉 Fun": ["🎉","🎊","🎈","🎁","🎀","🪅","🎆","🎇","🧨","✨","🎯","🎮","🕹","🎲","🧩","🃏","🎰","🎳","🏆","🥇","🥈","🥉","🏅","🎖","🎗","🎫","🎟","🎪","🎭","🎨","🖼","🎬","🎤","🎧","🎼","🎵","🎶","🎙","📻","🎷","🎸","🎹","🎺","🎻","🪗","🥁","🪘"],
  "🐶 Animals": ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🐔","🐧","🐦","🦆","🦅","🦉","🦇","🐺","🐗","🐴","🦄","🐝","🐛","🦋","🐌","🐞","🐜","🪲","🦟","🦗","🪳","🕷","🦂","🐢","🐍","🦎","🦖","🦕","🐙","🦑","🦐","🦞","🦀","🐡","🐠","🐟","🐬","🐳","🐋","🦈","🦭","🐊","🐅","🐆","🦓","🦍","🦧","🦣","🐘","🦛","🦏","🐪","🐫","🦒","🦘","🦬","🐃","🐂","🐄","🐎","🐖","🐏","🐑","🦙","🐐","🦌","🐕","🐩","🦮","🐕‍🦺","🐈","🐈‍⬛","🪶","🐓","🦃"],
  "🍕 Food": ["🍕","🍔","🌮","🌯","🍟","🍗","🥩","🥓","🍳","🥚","🧇","🥞","🧈","🥐","🍞","🥖","🥨","🧀","🥗","🥙","🫔","🥪","🥫","🍱","🍘","🍙","🍚","🍛","🍜","🍝","🍠","🍢","🍣","🍤","🍥","🥮","🍡","🥟","🥠","🥡","🍦","🍧","🍨","🍩","🍪","🎂","🍰","🧁","🥧","🍫","🍬","🍭","🍮","🍯","🍼","🥛","☕","🍵","🧃","🥤","🧋","🍶","🍺","🍻","🥂","🍷","🥃","🍸","🍹","🧉","🍾"],
};

const MessageInput = ({ chat }) => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeCategory, setActiveCategory] = useState(Object.keys(EMOJI_CATEGORIES)[0]);
  const [filePreview, setFilePreview] = useState(null); // { url, name, type }
  const { sendMessage, startTyping, stopTyping } = useChatStore();
  const isTypingtimeoutRef = useRef();
  const fileInputRef = useRef();
  const emojiPickerRef = useRef();
  const receiver = chat.participants.filter((c) => c !== "current");
  
  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      if (!message.trim() && !filePreview) return;
      sendMessage(message || "",filePreview?.file);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message;
      toast.error(`${errorMessage}`);
    } finally {
      setMessage("");
      setFilePreview(null);
    }
  };

  const handlestartTyping = (value) => {
    setMessage(value);
    if (value.trim) {
      startTyping(receiver[0]._id);
      if (isTypingtimeoutRef.current) clearTimeout(isTypingtimeoutRef.current);
      isTypingtimeoutRef.current = setTimeout(() => {
        stopTyping(receiver[0]._id);
      }, 3000);
    } else {
      stopTyping(receiver[0]._id);
    }
  };

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);

  setFilePreview({
    url,
    name: file.name,
    type: file.type,
    file, // 👈 THIS IS REQUIRED
  });

  e.target.value = "";
};


  const handleEmojiClick = (emoji) => {
    setMessage((prev) => prev + emoji);
  };

  const getFileIcon = (type) => {
    if (type.startsWith("image/")) return <Image className="w-4 h-4" />;
    if (type.startsWith("video/")) return <Video className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  return (
    <div className="relative">
      {/* File Preview Bar */}
      {filePreview && (
        <div className="flex items-center gap-2 px-3 py-2 bg-muted border-t border-border">
          {filePreview.type.startsWith("image/") ? (
            <img src={filePreview.url} alt="preview" className="h-10 w-10 rounded object-cover" />
          ) : (
            <div className="h-10 w-10 rounded bg-muted-foreground/10 flex items-center justify-center text-muted-foreground">
              {getFileIcon(filePreview.type)}
            </div>
          )}
          <span className="text-xs text-muted-foreground flex-1 truncate max-w-[200px]">
            {filePreview.name}
          </span>
          <button
            type="button"
            onClick={() => setFilePreview(null)}
            className="p-1 rounded-full hover:bg-muted-foreground/20 text-muted-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div
          ref={emojiPickerRef}
          className="absolute bottom-full left-0 mb-2 w-[320px] bg-popover border border-border/60 rounded-2xl shadow-xl z-50 overflow-hidden"
        >
          {/* Category Tabs */}
          <div className="flex overflow-x-auto border-b border-border/50 px-1 pt-1 scrollbar-hide gap-0.5">
            {Object.keys(EMOJI_CATEGORIES).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-2 py-1.5 text-base rounded-t-lg transition-colors ${
                  activeCategory === cat
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50"
                }`}
                title={cat.split(" ").slice(1).join(" ")}
              >
                {cat.split(" ")[0]}
              </button>
            ))}
          </div>

          {/* Emoji Grid */}
          <div className="grid grid-cols-8 gap-0.5 p-2 max-h-52 overflow-y-auto">
            {EMOJI_CATEGORIES[activeCategory].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmojiClick(emoji)}
                className="text-xl leading-none p-1.5 rounded-lg hover:bg-muted transition-colors hover:scale-110 transform"
                aria-label={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Row */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 p-3 bg-card border-t border-border"
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,.pdf,.doc,.docx,.txt"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Emoji button */}
        <button
          type="button"
          onClick={() => setShowEmojiPicker((v) => !v)}
          className={`p-2 rounded-full hover:bg-muted transition-colors ${
            showEmojiPicker ? "text-primary bg-muted" : "text-muted-foreground"
          }`}
          aria-label="Add emoji"
        >
          <Smile className="w-6 h-6" />
        </button>

        {/* Attachment button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground"
          aria-label="Attach file"
        >
          <Paperclip className="w-6 h-6" />
        </button>

        {/* Text input */}
        <div className="flex-1">
          <input
            type="text"
            value={message}
            onChange={(e) => handlestartTyping(e.target.value)}
            onFocus={() => setShowEmojiPicker(false)}
            placeholder="Type a message"
            className="w-full px-4 py-2.5 bg-muted rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
          />
        </div>

        {/* Send or Mic button */}
        {message.trim() || filePreview ? (
          <button
            type="submit"
            className="p-2.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        ) : (
          <button
            type="button"
            className="p-2.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            aria-label="Voice message"
          >
            <Mic className="w-5 h-5" />
          </button>
        )}
      </form>
    </div>
  );
};

export default MessageInput;