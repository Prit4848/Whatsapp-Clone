import { useState, useEffect, useRef } from "react";
import { X, Search, Users, User, ChevronRight, Check } from "lucide-react";
import { useUserStore } from "../store/useUserStore";
import { useChatStore } from "../store/useChatStore";
import Avatar from "./Avatar";
import AppLoader from "./Loader";

const CreateChatModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("direct"); // "direct" or "group"
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState("");

  const modalRef = useRef(null);
  const {
    allUsers,
    setAllUsers,
    getUserStatus,
    setAllUsersForGroup,
    AllUsersForGroup,
  } = useUserStore();
  const { isCreateChat, createChat,createGroupChat } = useChatStore(); // Assuming createChat handles both or you have createGroup

  useEffect(() => {
    if (isOpen) {
      setAllUsers();
      setAllUsersForGroup();
    }
  }, [isOpen]);

  const filteredUsers = allUsers?.filter((user) => {
    return user.username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredUsersForGroup = AllUsersForGroup?.filter((user) => {
    return user.username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleSelectUser = (user) => {
    createChat(user._id);
    onClose();
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };
 console.log(selectedUsers);
  const handleCreateGroup = () => {
    if (selectedUsers.length < 1 || !groupName) return;
   const payload = {
           name: groupName,
           participants: selectedUsers,
         };
    createGroupChat(payload)
    
    onClose();
  };

  if (!isOpen) return null;
  if (isCreateChat) return <AppLoader />;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="w-full max-w-md mx-4 bg-card rounded-xl shadow-xl overflow-hidden max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 border border-border"
      >
        {/* Header */}
        <header className="px-4 pt-4 pb-2 bg-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">New Message</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-muted rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Tab Switcher */}
          <div className="flex p-1 bg-muted rounded-lg mb-2">
            <button
              onClick={() => setActiveTab("direct")}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === "direct" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <User className="w-4 h-4" /> Direct
            </button>
            <button
              onClick={() => setActiveTab("group")}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === "group" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Users className="w-4 h-4" /> Group
            </button>
          </div>
        </header>

        {/* Group Name Input (Only shows in Group Tab) */}
        {activeTab === "group" && (
          <div className="px-4 py-2 border-b border-border">
            <input
              type="text"
              placeholder="Group Name..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full bg-transparent text-sm focus:outline-none py-1 border-b border-primary/30 focus:border-primary"
            />
          </div>
        )}

        {/* Search */}
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === "direct"
                  ? "Search contacts..."
                  : "Add participants..."
              }
              className="w-full pl-10 pr-4 py-2 bg-muted/50 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary/40"
            />
          </div>
        </div>

        {/* User List */}
        {activeTab === "group" ? (
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredUsersForGroup?.length > 0 ? (
              filteredUsersForGroup.map((user) => (
                <div
                  key={user._id}
                  onClick={() =>
                    activeTab === "direct"
                      ? handleSelectUser(user)
                      : toggleUserSelection(user._id)
                  }
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors group"
                >
                  <div className="relative">
                    <Avatar
                      src={user.profilePicture}
                      alt={user.username}
                      size="md"
                      showStatus
                      isOnline={getUserStatus(user._id)}
                    />
                    {activeTab === "group" &&
                      selectedUsers.includes(user._id) && (
                        <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-0.5 border-2 border-card">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                  </div>

                  <div className="flex-1 text-left">
                    <h3 className="font-medium text-sm text-foreground">
                      {user.username}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email || user.phoneNumber}
                    </p>
                  </div>

                  {activeTab === "direct" && (
                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-muted-foreground text-sm">
                No contacts found
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredUsers?.length > 0 ? (
              filteredUsers.map((user) => (
                <div
                  key={user._id}
                  onClick={() =>
                    activeTab === "direct"
                      ? handleSelectUser(user)
                      : toggleUserSelection(user._id)
                  }
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors group"
                >
                  <div className="relative">
                    <Avatar
                      src={user.profilePicture}
                      alt={user.username}
                      size="md"
                      showStatus
                      isOnline={getUserStatus(user._id)}
                    />
                    {activeTab === "group" &&
                      selectedUsers.includes(user._id) && (
                        <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-0.5 border-2 border-card">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                  </div>

                  <div className="flex-1 text-left">
                    <h3 className="font-medium text-sm text-foreground">
                      {user.username}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email || user.phoneNumber}
                    </p>
                  </div>

                  {activeTab === "direct" && (
                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-muted-foreground text-sm">
                No contacts found
              </div>
            )}
          </div>
        )}

        {/* Footer for Group Creation */}
        {activeTab === "group" && (
          <footer className="p-4 bg-card border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {selectedUsers.length} users selected
            </span>
            <button
              disabled={selectedUsers.length < 1 || !groupName}
              onClick={handleCreateGroup}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
            >
              Create Group
            </button>
          </footer>
        )}
      </div>
    </div>
  );
};

export default CreateChatModal;
