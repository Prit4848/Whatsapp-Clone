import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  RadioTower,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import StatusRing from "../../components/Status/StatusRing";
import StatusAvatar from "../../components/Status/StatusAvatar";
import StatusCreatorModal from "../../components/Status/StatusCreatorModal";
import StatusViewer from "../../components/Status/StatusViewer";
import { useStatusStore } from "../../store/useStatusStore";
import { formatStatusTime } from "../../utils/helpers";
import DeleteStatusModal from "../../components/Status/DeleteStatusModal";

// ─── Mock status data ─────────────────────────────────────────────────────────
const MOCK_MY_STATUS = null;

// ─── Main Page ─────────────────────────────────────────────────────────────────
const StatusPage = () => {
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const { statuses, myStatuses, deleteStatus } = useStatusStore();
  const [isOwn, setisOwn] = useState(false);
  const STORY_DURATION = 5000;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [myStatus, setMyStatus] = useState(MOCK_MY_STATUS);
  // const [recentStatuses, setRecentStatuses] = useState(statuses);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [mobilePanel, setMobilePanel] = useState("left");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const recentStatuses = statuses || [];

  const recentUnseen = recentStatuses.filter((s) => !s.seen);
  const recentSeen = recentStatuses.filter((s) => s.seen);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleAddStatus = () => setIsModalOpen(true);

  useEffect(() => {
    if (!myStatuses) return;

    setMyStatus(myStatuses);
  }, [myStatuses]);

  const handleStatusCreated = () => {
    setMyStatus(myStatuses);
    // Also add it to recent statuses for preview
    // setRecentStatuses([newStatus, ...recentStatuses]);
  };
  const handleDeleteMyStatus = () => setMyStatus(null);

  const hasMyStatus =
    Array.isArray(myStatus) &&
    myStatus.length > 0 &&
    myStatus[0]?.content?.length > 0;

  const handleViewStatus = (status) => {
    setSelectedStatus({
      ...status,
      currentIndex: 0, // start from first story
    });

    setMobilePanel("right");
  };
  console.log(myStatus);

  const handleViewMyStatus = () => {
    if (myStatuses) {
      setSelectedStatus(myStatuses[0]);
      setisOwn(true);
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
      {showDeleteModal && (
        <DeleteStatusModal
          status={myStatus}
          onClose={() => setShowDeleteModal(false)}
          onDelete={(storyId) => {
            deleteStatus(storyId); // call API
          }}
        />
      )}
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
          {/* ── My Status (WhatsApp Style) ──────────────────────────── */}
          <div className="px-4 pt-3 pb-2 border-b border-border/40">
            <button
              onClick={hasMyStatus ? handleViewMyStatus : handleAddStatus}
              className="w-full flex items-center gap-4 py-3 text-left hover:bg-muted/40 rounded-xl transition"
            >
              {/* Avatar Section */}
              <div className="relative w-[52px] h-[52px] flex items-center justify-center">
                {/* Status Ring (only if status exists) */}
                {hasMyStatus && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <StatusRing
                      seen={false}
                      count={myStatus[0].content.length}
                      size={52}
                    />
                  </div>
                )}

                {/* Profile Image */}
                <div className="w-[44px] h-[44px] rounded-full overflow-hidden bg-muted flex items-center justify-center z-10">
                  {authUser?.profilePicture ? (
                    <img
                      src={authUser.profilePicture}
                      alt={authUser.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-muted-foreground font-semibold text-base uppercase">
                      {authUser?.username?.[0] ?? "?"}
                    </span>
                  )}
                </div>

                {/* Add Badge (only if NO status) */}
                {!hasMyStatus && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddStatus();
                    }}
                    className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-background z-20 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </div>

              {/* Text Section */}
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-foreground">
                  My status
                </p>

                <p className="text-sm text-muted-foreground truncate">
                  {hasMyStatus
                    ? formatStatusTime(
                        myStatus[0].content[myStatus[0].content.length - 1]
                          ?.createdAt,
                      )
                    : "Tap to add status update"}
                </p>
              </div>

              {/* Add & Delete buttons (only if status exists) */}
              {hasMyStatus && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddStatus();
                    }}
                    className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center transition"
                  >
                    <Plus className="w-5 h-5 text-muted-foreground" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteModal(true);
                    }}
                    className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center transition"
                  >
                    <Trash2 className="w-5 h-5 text-muted-foreground" />
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
                    <StatusAvatar
                      src={status.profilePicture}
                      alt={status.username}
                      seen={status.seen}
                      count={status.content.length}
                      size={42}
                      duration={STORY_DURATION}
                      currentIndex={currentIndex}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {status.username}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatStatusTime(status.lastUpdated)}
                      </p>
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
                    <StatusAvatar
                      src={status.profilePicture}
                      alt={status.username}
                      seen={status.seen}
                      count={status.content.length}
                      size={42}
                      duration={STORY_DURATION}
                      currentIndex={currentIndex}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {status.username}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatStatusTime(status.lastUpdated)}
                      </p>
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

        <StatusViewer
          status={selectedStatus}
          onClose={() => {
            setSelectedStatus(null);
            setisOwn(false);
            setMobilePanel("left");
          }}
          isOwnStatus={isOwn}
        />
      </div>
    </div>
  );
};

export default StatusPage;
