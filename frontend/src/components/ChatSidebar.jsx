import { useState } from "react";
import { Search, MoreVertical, MessageCircle, User, LogOut } from "lucide-react";
import useChatStore from "../store/useChatStore";
import Avatar from "./Avatar";
import ChatItem from "./ChatItem";
import ChatListSkeleton from "./ChatListSkeleton";
import ThemeToggle from "./ThemeToggle";
import { getChatPartner } from "../data/mockData";
import {useAuthStore} from "../store/useAuthStore"

const ChatSidebar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { chats, currentUser, isLoading } = useChatStore();
  const {authUser,logout}=useAuthStore()

  // Filter chats based on search query
  const filteredChats = chats.filter((chat) => {
    if (!searchQuery) return true;
    const partner = getChatPartner(chat);
    return partner?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Sort chats by last message timestamp (most recent first)
  const sortedChats = [...filteredChats].sort((a, b) => {
    const timeA = new Date(a.lastMessage?.timestamp || 0).getTime();
    const timeB = new Date(b.lastMessage?.timestamp || 0).getTime();
    return timeB - timeA;
  });

  const handlelogout = ()=>{
   try {
      logout()
   } catch (error) {
     const errorMessage = error.response.data.message || error.message
      toast.error(errorMessage);
   }
  }

  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
        <Avatar
          src={authUser.profilePicture}
          alt={authUser.username}
          size="md"
        />
        
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground"
            aria-label="New chat"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground"
              aria-label="More options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-popover border border-border rounded-md shadow-md z-50">
                <button
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <button
                onClick={handlelogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Search */}
      <div className="p-2 bg-card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search or start new chat"
            className="w-full pl-10 pr-4 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {isLoading ? (
          <ChatListSkeleton />
        ) : sortedChats.length > 0 ? (
          sortedChats.map((chat) => (
            <ChatItem key={chat.id} chat={chat} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <MessageCircle className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No chats found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery ? "Try a different search" : "Start a conversation!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
