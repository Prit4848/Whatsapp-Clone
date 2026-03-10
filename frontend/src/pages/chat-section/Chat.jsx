import { useEffect } from "react";
import {useChatStore} from "../../store/useChatStore";
import ChatSidebar from "../../components/ChatSidebar";
import ChatWindow from "../../components/ChatWindow";

const Chat = () => {
  const { isMobileView, activeChat, setMobileView } = useChatStore();

  // Handle window resize
 useEffect(() => {
  const mediaQuery = window.matchMedia("(max-width: 767px)");

  const handleChange = (e) => {
    setMobileView(e.matches);
  };

  // Set initial value
  setMobileView(mediaQuery.matches);

  mediaQuery.addEventListener("change", handleChange);

  return () => {
    mediaQuery.removeEventListener("change", handleChange);
  };
}, [setMobileView]);

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-background">
  
  {/* Sidebar */}
  <div
    className={`
      ${isMobileView 
        ? activeChat ? "hidden" : "w-full" 
        : "w-[350px] lg:w-[400px]"}
      h-full flex-shrink-0 min-h-0
    `}
  >
    <ChatSidebar />
  </div>

  {/* Chat Window */}
  <div
    className={`
      ${isMobileView 
        ? activeChat ? "w-full" : "hidden"
        : "flex-1"}
      h-full min-h-0
    `}
  >
    <ChatWindow />
  </div>

</div>

  );
};

export default Chat;
