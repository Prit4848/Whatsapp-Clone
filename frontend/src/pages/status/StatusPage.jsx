import { useState } from "react";
import { ArrowLeft, Plus, Trash2, RadioTower,ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import StatusRing from "../../components/Status/StatusRing";
import StatusAvatar from "../../components/Status/StatusAvatar";
import StatusCreatorModal from "../../components/Status/StatusCreatorModal";
import StatusViewer from "../../components/Status/StatusViewer";
import { useStatusStore } from "../../store/useStatusStore";
import {formatLastSeen} from "../../utils/helpers"

// ─── Mock status data ─────────────────────────────────────────────────────────
const MOCK_MY_STATUS = null;

const MOCK_RECENT_STATUSES = [
  { id: "1", username: "Alice", profilePicture: "", lastUpdated: "2 min ago", seen: false, count: 3, content: { type: "text", data: "Having a great day! 🎉" } },
  { id: "2", username: "Bob", profilePicture: "", lastUpdated: "15 min ago", seen: false, count: 1, content: { type: "image", data: "https://via.placeholder.com/500" } },
  { id: "3", username: "Carol", profilePicture: "", lastUpdated: "1 hr ago", seen: true, count: 2, content: { type: "video", data: "https://via.placeholder.com/500" } },
  { id: "4", username: "David", profilePicture: "", lastUpdated: "3 hr ago", seen: true, count: 1, content: { type: "text", data: "Check out my new post!" } },
];
// ─────────────────────────────────────────────────────────────────────────────

// const StatusRing = ({ seen, count = 1, size = 46 }) => {
//   const radius = (size - 4) / 2;
//   const circumference = 2 * Math.PI * radius;
//   const gap = count > 1 ? 4 : 0;
//   const segmentLength = count > 1 ? circumference / count - gap : circumference;

//   return (
//     <svg width={size} height={size} className="absolute top-0 left-0 -rotate-90">
//       {Array.from({ length: count }).map((_, i) => {
//         const offset = (circumference / count) * i;
//         return (
//           <circle
//             key={i}
//             cx={size / 2}
//             cy={size / 2}
//             r={radius}
//             fill="none"
//             strokeWidth="2.5"
//             stroke={seen ? "var(--color-muted-foreground, #9ca3af)" : "var(--color-primary, #25d366)"}
//             strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
//             strokeDashoffset={-offset}
//             strokeLinecap="round"
//           />
//         );
//       })}
//     </svg>
//   );
// };

// const StatusAvatar = ({ src, alt, seen, count, size = 46, onClick }) => (
//   <div
//     className="relative flex-shrink-0 cursor-pointer"
//     style={{ width: size, height: size }}
//     onClick={onClick}
//   >
//     <StatusRing seen={seen} count={count} size={size} />
//     <div className="absolute rounded-full overflow-hidden bg-muted" style={{ inset: 3 }}>
//       {src ? (
//         <img src={src} alt={alt} className="w-full h-full object-cover" />
//       ) : (
//         <div className="w-full h-full flex items-center justify-center text-muted-foreground font-semibold text-sm uppercase">
//           {alt?.[0] ?? "?"}
//         </div>
//       )}
//     </div>
//   </div>
// );

// ─── Status Creator Modal ───────────────────────────────────────────────────────
// const StatusCreatorModal = ({ isOpen, onClose, authUser, onStatusCreated }) => {
//   const [statusType, setStatusType] = useState("text"); // "text", "image", "video"
//   const [content, setContent] = useState("");
//   const [mediaPreview, setMediaPreview] = useState(null);
//   const [mediaFile, setMediaFile] = useState(null);

//   const handleMediaUpload = (e, type) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onload = (event) => {
//         setMediaPreview(event.target?.result);
//         setMediaFile(file);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleCreateStatus = () => {
//     if (!content.trim() && !mediaFile) {
//       alert("Please add some content to your status");
//       return;
//     }

//     const newStatus = {
//       id: Date.now().toString(),
//       username: authUser?.username,
//       profilePicture: authUser?.profilePicture || "",
//       lastUpdated: "just now",
//       seen: false,
//       count: 1,
//       content: {
//         type: statusType,
//         data: statusType === "text" ? content : mediaPreview,
//         description: content, // For media, this stores the optional caption
//       },
//     };

//     onStatusCreated(newStatus);
//     resetForm();
//     onClose();
//   };

//   const resetForm = () => {
//     setStatusType("text");
//     setContent("");
//     setMediaPreview(null);
//     setMediaFile(null);
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//       <div className="bg-card rounded-xl w-full max-w-md shadow-lg">
//         {/* Header */}
//         <div className="flex items-center justify-between px-5 py-4 border-b border-border">
//           <h2 className="text-lg font-semibold text-foreground">Create Status</h2>
//           <button
//             onClick={() => {
//               resetForm();
//               onClose();
//             }}
//             className="p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground"
//             aria-label="Close"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         {/* Content */}
//         <div className="p-5 space-y-4">
//           {/* Status type tabs */}
//           <div className="flex gap-2 bg-muted p-1 rounded-lg">
//             {[
//               { value: "text", label: "Text", icon: FileText },
//               { value: "image", label: "Image", icon: ImageIcon },
//               { value: "video", label: "Video", icon: Video },
//             ].map(({ value, label, icon: Icon }) => (
//               <button
//                 key={value}
//                 onClick={() => {
//                   setStatusType(value);
//                   setMediaPreview(null);
//                   setMediaFile(null);
//                 }}
//                 className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-colors ${
//                   statusType === value
//                     ? "bg-primary text-primary-foreground"
//                     : "text-muted-foreground hover:text-foreground"
//                 }`}
//               >
//                 <Icon className="w-4 h-4" />
//                 <span className="text-sm font-medium">{label}</span>
//               </button>
//             ))}
//           </div>

//           {/* User info */}
//           <div className="flex items-center gap-3 px-3 py-2 bg-muted rounded-lg">
//             <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
//               {authUser?.profilePicture ? (
//                 <img src={authUser.profilePicture} alt={authUser.username} className="w-full h-full object-cover" />
//               ) : (
//                 <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground text-xs font-semibold">
//                   {authUser?.username?.[0]?.toUpperCase() ?? "?"}
//                 </div>
//               )}
//             </div>
//             <div>
//               <p className="text-sm font-medium text-foreground">{authUser?.username}</p>
//               <p className="text-xs text-muted-foreground">Posting to your story</p>
//             </div>
//           </div>

//           {/* Content input based on type */}
//           {statusType === "text" && (
//             <textarea
//               value={content}
//               onChange={(e) => setContent(e.target.value)}
//               placeholder="What's on your mind?"
//               maxLength={280}
//               className="w-full px-3 py-2 rounded-lg border border-border bg-muted/30 text-foreground placeholder:text-muted-foreground resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary"
//             />
//           )}

//           {statusType === "image" && (
//             <div>
//               {mediaPreview ? (
//                 <div className="relative">
//                   <img src={mediaPreview} alt="Preview" className="w-full rounded-lg max-h-48 object-cover" />
//                   <button
//                     onClick={() => {
//                       setMediaPreview(null);
//                       setMediaFile(null);
//                     }}
//                     className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
//                     aria-label="Remove image"
//                   >
//                     <X className="w-4 h-4 text-white" />
//                   </button>
//                 </div>
//               ) : (
//                 <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
//                   <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
//                   <span className="text-sm font-medium text-foreground">Upload image</span>
//                   <span className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</span>
//                   <input
//                     type="file"
//                     accept="image/*"
//                     onChange={(e) => handleMediaUpload(e, "image")}
//                     className="hidden"
//                   />
//                 </label>
//               )}
//               {mediaPreview && (
//                 <textarea
//                   value={content}
//                   onChange={(e) => setContent(e.target.value)}
//                   placeholder="Add a caption (optional)"
//                   maxLength={280}
//                   className="w-full mt-3 px-3 py-2 rounded-lg border border-border bg-muted/30 text-foreground placeholder:text-muted-foreground resize-none h-16 focus:outline-none focus:ring-2 focus:ring-primary"
//                 />
//               )}
//             </div>
//           )}

//           {statusType === "video" && (
//             <div>
//               {mediaPreview ? (
//                 <div className="relative bg-black rounded-lg overflow-hidden">
//                   <video src={mediaPreview} className="w-full max-h-48 rounded-lg" controls />
//                   <button
//                     onClick={() => {
//                       setMediaPreview(null);
//                       setMediaFile(null);
//                     }}
//                     className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
//                     aria-label="Remove video"
//                   >
//                     <X className="w-4 h-4 text-white" />
//                   </button>
//                 </div>
//               ) : (
//                 <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
//                   <Video className="w-8 h-8 text-muted-foreground mb-2" />
//                   <span className="text-sm font-medium text-foreground">Upload video</span>
//                   <span className="text-xs text-muted-foreground mt-1">MP4, WebM up to 50MB</span>
//                   <input
//                     type="file"
//                     accept="video/*"
//                     onChange={(e) => handleMediaUpload(e, "video")}
//                     className="hidden"
//                   />
//                 </label>
//               )}
//               {mediaPreview && (
//                 <textarea
//                   value={content}
//                   onChange={(e) => setContent(e.target.value)}
//                   placeholder="Add a caption (optional)"
//                   maxLength={280}
//                   className="w-full mt-3 px-3 py-2 rounded-lg border border-border bg-muted/30 text-foreground placeholder:text-muted-foreground resize-none h-16 focus:outline-none focus:ring-2 focus:ring-primary"
//                 />
//               )}
//             </div>
//           )}

//           {/* Character count for text */}
//           {statusType === "text" && (
//             <p className="text-xs text-muted-foreground text-right">
//               {content.length}/280
//             </p>
//           )}
//         </div>

//         {/* Footer */}
//         <div className="flex gap-3 px-5 py-4 border-t border-border">
//           <button
//             onClick={() => {
//               resetForm();
//               onClose();
//             }}
//             className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors font-medium"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleCreateStatus}
//             className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium flex items-center justify-center gap-2"
//           >
//             <Send className="w-4 h-4" />
//             Post
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// ─── Status Viewer (right panel content) ─────────────────────────────────────
// const StatusViewer = ({ status }) => {
//   if (!status) {
//     return (
//       <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
//         <RadioTower className="w-14 h-14 text-muted-foreground opacity-40" />
//         <p className="text-base font-medium text-foreground">No status selected</p>
//         <p className="text-sm text-muted-foreground">
//           Tap a contact's status on the left to view it here
//         </p>
//       </div>
//     );
//   }

//   const renderContent = () => {
//     switch (status.content?.type) {
//       case "image":
//         return (
//           <div className="flex items-center justify-center bg-black rounded-xl h-full">
//             <img src={status.content.data} alt="Status" className="max-h-full max-w-full object-contain" />
//           </div>
//         );
//       case "video":
//         return (
//           <div className="flex items-center justify-center bg-black rounded-xl h-full">
//             <video src={status.content.data} className="max-h-full max-w-full object-contain" controls autoPlay />
//           </div>
//         );
//       case "text":
//       default:
//         return (
//           <div className="flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl h-full">
//             <div className="text-center px-6 max-w-md">
//               <p className="text-2xl font-bold text-foreground leading-relaxed">
//                 {status.content?.data}
//               </p>
//             </div>
//           </div>
//         );
//     }
//   };

//   return (
//     <div className="flex flex-col h-full">
//       {/* Viewer header */}
//       <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-card">
//         <StatusAvatar
//           src={status.profilePicture}
//           alt={status.username}
//           seen={status.seen}
//           count={status.count}
//           size={42}
//         />
//         <div className="flex-1 min-w-0">
//           <p className="text-sm font-semibold text-foreground">{status.username}</p>
//           <p className="text-xs text-muted-foreground">{status.lastUpdated}</p>
//         </div>
//       </div>

//       {/* Progress segments */}
//       <div className="flex gap-1 px-4 pt-3">
//         {Array.from({ length: status.count }).map((_, i) => (
//           <div
//             key={i}
//             className="h-0.5 flex-1 rounded-full"
//             style={{
//               background: i === 0 ? "var(--color-primary, #25d366)" : "var(--color-muted-foreground, #9ca3af)",
//               opacity: i === 0 ? 1 : 0.4,
//             }}
//           />
//         ))}
//       </div>

//       {/* Status content */}
//       <div className="flex-1 p-4 overflow-y-auto">{renderContent()}</div>

//       {/* Caption if exists */}
//       {status.content?.description && (
//         <div className="px-5 py-3 border-t border-border bg-card">
//           <p className="text-sm text-foreground">{status.content.description}</p>
//         </div>
//       )}
//     </div>
//   );
// };

// ─── Main Page ─────────────────────────────────────────────────────────────────
const StatusPage = () => {
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const {statuses,myStatuses} = useStatusStore()

  console.log(statuses,myStatuses);
  
  const [myStatus, setMyStatus] = useState(MOCK_MY_STATUS);
  // const [recentStatuses, setRecentStatuses] = useState(statuses);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [mobilePanel, setMobilePanel] = useState("left");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const recentStatuses = statuses || [];

  const recentUnseen = recentStatuses.filter((s) => !s.seen);
  const recentSeen = recentStatuses.filter((s) => s.seen);

  const handleAddStatus = () => setIsModalOpen(true);

  const handleStatusCreated = (newStatus) => {
    setMyStatus(newStatus);
    // Also add it to recent statuses for preview
    setRecentStatuses([newStatus, ...recentStatuses]);
  };

  const handleDeleteMyStatus = () => setMyStatus(null);

  const handleViewStatus = (status) => {
  setSelectedStatus({
    ...status,
    currentIndex: 0, // start from first story
  });

  setMobilePanel("right");
};

  const handleViewMyStatus = () => {
    if (myStatus) {
      setSelectedStatus(myStatus);
      setMobilePanel("right");
    }
  };

  return (
    <div className="flex h-screen bg-sidebar">
      <StatusCreatorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        authUser={authUser}
        onStatusCreated={handleStatusCreated}
      />

      {/* ══════════════════════════════════════════════
          LEFT PANEL — My status + contact list
      ══════════════════════════════════════════════ */}
      <div
        className={`
          flex flex-col border-r border-sidebar-border
          w-full md:w-[340px] lg:w-[380px] flex-shrink-0
          ${mobilePanel === "right" ? "hidden md:flex" : "flex"}
        `}
      >
        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-3 bg-card border-b border-border">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-semibold text-foreground">Status</h1>
        </header>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {/* ── My Status ──────────────────────────── */}
          <div className="px-4 pt-4 pb-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              My Status
            </p>
            <button
              onClick={myStatus ? handleViewMyStatus : handleAddStatus}
              className="w-full flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted transition-colors text-left"
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {myStatus && <StatusRing seen={false} count={myStatus.count ?? 1} size={46} />}
                <div className={`w-[46px] h-[46px] rounded-full overflow-hidden bg-muted flex items-center justify-center flex-shrink-0 ${myStatus ? "absolute top-0 left-0" : ""}`}>
                  {authUser?.profilePicture ? (
                    <img src={authUser.profilePicture} alt={authUser.username} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-muted-foreground font-semibold text-sm uppercase">
                      {authUser?.username?.[0] ?? "?"}
                    </span>
                  )}
                </div>
                {!myStatus && (
                  <button
                    onClick={(e) => {
                      <Plus className="w-3 h-3 text-primary-foreground" />
                      e.stopPropagation();
                      handleAddStatus();
                    }}
                    className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow"
                    aria-label="Add status"
                  >
                  </button>
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {myStatus ? "My status" : "Add status update"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {myStatus ? formatLastSeen(myStatus.lastUpdated) : "Tap to add a status update"}
                </p>
              </div>

              {/* Actions */}
              {myStatus && (
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={handleAddStatus}
                    className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground"
                    aria-label="Add more status"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDeleteMyStatus}
                    className="p-2 rounded-full hover:bg-muted transition-colors text-destructive"
                    aria-label="Delete status"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </button>
          </div>

          <div className="border-t border-border mx-4 my-2" />

          {/* ── Recent Updates ──────────────────────── */}
          {recentUnseen.length > 0 && (
            <div className="px-4 pb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Recent Updates
              </p>
              <div className="flex flex-col gap-1">
                {recentUnseen.map((status) => (
                  <button
                    key={status.id}
                    onClick={() => handleViewStatus(status)}
                    className={`flex items-center gap-3 w-full rounded-lg px-1 py-2 hover:bg-muted transition-colors text-left ${
                      selectedStatus?.id === status.id ? "bg-muted" : ""
                    }`}
                  >
                    <StatusAvatar src={status.profilePicture} alt={status.username} seen={false} count={status.count} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{status.username}</p>
                      <p className="text-xs text-muted-foreground">{formatLastSeen(status.lastUpdated)}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground md:hidden" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Viewed Updates ──────────────────────── */}
          {recentSeen.length > 0 && (
            <div className="px-4 pb-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Viewed Updates
              </p>
              <div className="flex flex-col gap-1">
                {recentSeen.map((status) => (
                  <button
                    key={status.id}
                    onClick={() => handleViewStatus(status)}
                    className={`flex items-center gap-3 w-full rounded-lg px-1 py-2 hover:bg-muted transition-colors text-left ${
                      selectedStatus?.id === status.id ? "bg-muted" : ""
                    }`}
                  >
                    <StatusAvatar src={status.profilePicture} alt={status.username} seen={true} count={status.count} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{status.username}</p>
                      <p className="text-xs text-muted-foreground">{formatLastSeen(status.lastUpdated)}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground md:hidden" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {recentUnseen.length === 0 && recentSeen.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <RadioTower className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No status updates</p>
              <p className="text-sm text-muted-foreground mt-1">
                Status updates from your contacts will appear here
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          RIGHT PANEL — Status Viewer
      ══════════════════════════════════════════════ */}
      <div
        className={`
          flex-1 flex flex-col bg-sidebar
          ${mobilePanel === "left" ? "hidden md:flex" : "flex"}
        `}
      >
        {/* Mobile: back button row */}
        <header className="flex items-center gap-3 px-4 py-3 bg-card border-b border-border md:hidden">
          <button
            onClick={() => setMobilePanel("left")}
            className="p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-semibold text-foreground">
            {selectedStatus ? selectedStatus.username : "Status"}
          </h1>
        </header>

        <StatusViewer status={selectedStatus} />
      </div>
    </div>
  );
};

export default StatusPage;