import { useState, useEffect, useRef, use } from "react";
import { X, Search } from "lucide-react";
import { users } from "../data/mockData";
import { useUserStore } from "../store/useUserStore";
import Avatar from "./Avatar";

const CreateChatModal = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const modalRef = useRef(null);
  const {allUsers,setAllUsers} = useUserStore()

  useEffect(() => {
    setAllUsers()
  }, [isOpen])

  // Filter users based on search query
  const filteredUsers = allUsers?.filter((user) => {
    if (!searchQuery) return true;
    return user.username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleSelectUser = (user) => {
    // UI only - just close the modal
    onClose();
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        ref={modalRef}
        className="w-full max-w-md mx-4 bg-card rounded-xl shadow-xl overflow-hidden max-h-[80vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-foreground">New Chat</h2>
            <p className="text-sm text-muted-foreground">Select a contact</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Search */}
        <div className="p-3 bg-card border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts"
              className="w-full pl-10 pr-4 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
              autoFocus
            />
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <button
                key={user._id}
                onClick={() => handleSelectUser(user)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/50"
              >
                <Avatar
                  src={user.profilePicture}
                  alt={user.username}
                  size="md"
                  showStatus
                  isOnline={user.isOnline === true}
                />
                <div className="flex-1 text-left">
                  <h3 className="font-medium text-foreground">
                    {user.username}
                  </h3>
                  {user.email ? (
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {user.phoneNumber}
                    </p>
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <p className="text-muted-foreground">No contacts found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try a different search
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateChatModal;
