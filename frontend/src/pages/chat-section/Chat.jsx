import { useEffect } from "react";
import useChatStore from "../../store/useChatStore";
import ChatSidebar from "../../components/ChatSidebar";
import ChatWindow from "../../components/ChatWindow";

const Chat = () => {
  const { isMobileView, activeChat, setMobileView } = useChatStore();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setMobileView(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setMobileView]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar - hidden on mobile when viewing chat */}
      <div
        className={`${
          isMobileView
            ? activeChat
              ? "hidden"
              : "w-full"
            : "w-[350px] lg:w-[400px] flex-shrink-0"
        } h-full`}
      >
        <ChatSidebar />
      </div>

      {/* Chat Window - hidden on mobile when viewing chat list */}
      <div
        className={`${
          isMobileView
            ? activeChat
              ? "w-full"
              : "hidden"
            : "flex-1"
        } h-full`}
      >
        <ChatWindow />
      </div>
    </div>
  );
};

export default Chat;
