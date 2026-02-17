import { useRef, useState } from "react";
import { Send, Paperclip, Smile, Mic } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";

const MessageInput = ({chat}) => {
  const [message, setMessage] = useState("");
  const { sendMessage,startTyping,stopTyping} = useChatStore()
  const isTypingtimeoutRef = useRef()
  const receiver = chat.participants.filter((c)=> c!== "current")

  
  const handleSubmit = (e) => {
    e.preventDefault();
    // UI only - no functionality
    try {
       if (!message.trim()) return;
       sendMessage(message)
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message
      toast.error(`${errorMessage}`)
    }finally{
      setMessage('')
    }
  };

  const handlestartTyping = (value)=>{
    setMessage(value)
    if(value.trim){
      startTyping(receiver[0]._id)

       if(isTypingtimeoutRef.current){
        clearTimeout(isTypingtimeoutRef.current);
       }
      isTypingtimeoutRef.current = setTimeout(()=>{
       stopTyping(receiver[0]._id)
      },3000)
    }else{
      stopTyping(receiver[0]._id)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 p-3 bg-card border-t border-border"
    >
      {/* Emoji button */}
      <button
        type="button"
        className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground"
        aria-label="Add emoji"
      >
        <Smile className="w-6 h-6" />
      </button>

      {/* Attachment button */}
      <button
        type="button"
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
          placeholder="Type a message"
          className="w-full px-4 py-2.5 bg-muted rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
        />
      </div>

      {/* Send or Mic button */}
      {message.trim() ? (
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
  );
};

export default MessageInput;
