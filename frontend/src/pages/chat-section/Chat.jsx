import {useChatStore} from "../../store/useChatStore";
import ChatSidebar from "../../components/ChatSidebar";
import ChatWindow from "../../components/ChatWindow";

const Chat = () => {
  const { isMobileView, activeChat } = useChatStore();

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
