import { useEffect, useState } from "react";
import { RadioTower } from "lucide-react";
import StatusAvatar from "../../components/Status/StatusAvatar";
import { formatStatusTime } from "../../utils/helpers";
import { useStatusStore } from "../../store/useStatusStore";

const STORY_DURATION = 5000; // 5 seconds per story

const StatusViewer = ({ status, onClose, isOwnStatus }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showViewers, setShowViewers] = useState(false);
  const { markAsViewed } = useStatusStore();

  // Reset index when new status selected
  useEffect(() => {
    setCurrentIndex(0);
  }, [status?.id]);
  useEffect(() => {
    if (!status || isOwnStatus) return;

    const storyId = status.content[currentIndex]?.id;

    if (!storyId) return;
    markAsViewed(storyId);
  }, [currentIndex, status, isOwnStatus]);

  // Auto move story
  useEffect(() => {
    if (!status) return;

    const timer = setTimeout(() => {
      if (currentIndex < status.content.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        onClose(); // close after last story
      }
    }, STORY_DURATION);

    return () => clearTimeout(timer);
  }, [currentIndex, status, onClose]);

  if (!status) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
        <RadioTower className="w-14 h-14 text-muted-foreground opacity-40" />
        <p className="text-base font-medium text-foreground">
          No status selected
        </p>
      </div>
    );
  }

  const currentStory = status.content[currentIndex];

  const nextStory = () => {
    if (currentIndex < status.content.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const prevStory = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const renderContent = () => {
    if (!currentStory) return null;

    const isImage = currentStory.type === "image";
    const isVideo = currentStory.type === "video";
    const isText = currentStory.type === "text";
    const isMedia = isImage || isVideo;

    return (
      <div className="absolute inset-0 overflow-hidden">
        {/* ✅ MEDIA STORIES */}
        {isMedia && (
          <div className="relative w-full h-full bg-black flex items-center justify-center">
            {isImage && (
              <img
                src={currentStory.statusUrl}
                alt=""
                className="max-w-full max-h-full object-contain"
              />
            )}

            {isVideo && (
              <video
                src={currentStory.statusUrl}
                className="max-w-full max-h-full object-contain"
                autoPlay
                muted
                playsInline
              />
            )}

            {/* Caption for media */}
            {currentStory?.data && (
              <>
                <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-6 left-4 right-4 text-white text-center text-[16px]">
                  {currentStory.data}
                </div>
              </>
            )}
          </div>
        )}

        {/* ✅ TEXT STORY (WhatsApp Style) */}
        {isText && (
          <div className="w-full h-full flex items-center justify-center px-10 bg-[#1f2c34]">
            <p className="text-white text-3xl font-semibold text-center leading-relaxed break-words">
              {currentStory.data}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full relative bg-black text-white">
      {/* Click areas */}
      <div
        className="absolute left-0 top-0 w-1/2 h-full z-10"
        onClick={prevStory}
      />
      <div
        className="absolute right-0 top-0 w-1/2 h-full z-10"
        onClick={nextStory}
      />

      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-black/60 z-20">
        <StatusAvatar
          src={status.profilePicture}
          alt={status.username}
          seen={status.seen}
          count={status.content.length}
          size={42}
          duration={STORY_DURATION}
          currentIndex={currentIndex}
        />
        <div>
          <p className="text-sm font-semibold">{status.username}</p>
          <p className="text-xs opacity-70">
            {formatStatusTime(currentStory?.createdAt) || ""}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1 px-4 pt-2 z-20">
        {status.content.map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full"
            style={{
              background: i <= currentIndex ? "#25d366" : "#444",
            }}
          />
        ))}
      </div>
      {isOwnStatus &&
        currentStory?.viewers &&
        currentStory.viewers.length > 0 && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center z-30">
            <button
              onClick={() => setShowViewers(true)}
              className="
          group
          flex items-center gap-2
          px-5 py-2.5
          rounded-full
          bg-white/10
          backdrop-blur-md
          border border-white/10
          text-sm font-medium
          shadow-lg
          transition-all duration-200
          hover:bg-white/20
          active:scale-95
        "
            >
              <span className="text-base transition-transform group-hover:scale-110">
                👁
              </span>

              <span className="tracking-wide">
                {currentStory.viewers.length}
              </span>
            </button>
          </div>
        )}
      {/* Viewers Modal */}
      {showViewers && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop: Click to close */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowViewers(false)}
          />

          {/* The Popup Sheet */}
          <div className="relative bg-[#121b22] w-full max-h-[70%] rounded-t-2xl shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300">
            {/* Visual Handle for dragging feel */}
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mt-3 mb-1" />

            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-white/5">
              <h3 className="text-sm font-bold tracking-wide uppercase text-gray-400">
                Viewed by {currentStory?.viewers?.length || 0}
              </h3>
              <button
                onClick={() => setShowViewers(false)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <span className="text-xl">✕</span>
              </button>
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto p-2 pb-8 custom-scrollbar">
              {currentStory?.viewers?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 opacity-50">
                  <p className="text-sm italic">No views yet</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {currentStory.viewers.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl transition-all active:scale-95"
                    >
                      <div className="relative">
                        <img
                          src={user.profilePicture}
                          alt={user.username}
                          className="w-12 h-12 rounded-full object-cover border border-white/10"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{user.username}</p>
                        <p className="text-xs text-gray-400">Just now</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        {renderContent()}
      </div>
    </div>
  );
};

export default StatusViewer;
