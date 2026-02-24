import { ArrowLeft, Plus, Eye, Trash2, RadioTower, X, ChevronRight, Send, Image as ImageIcon, Video, FileText } from "lucide-react";
import StatusAvatar from "../../components/Status/StatusAvatar";
import { useState } from "react";
import { formatLastSeen } from "../../utils/helpers";

// ─── Status Viewer (right panel content) ─────────────────────────────────────
const StatusViewer = ({ status }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!status) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
        <RadioTower className="w-14 h-14 text-muted-foreground opacity-40" />
        <p className="text-base font-medium text-foreground">No status selected</p>
      </div>
    );
  }

  const currentStory = status.content[currentIndex];

  const nextStory = () => {
    if (currentIndex < status.content.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const prevStory = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const renderContent = () => {
    switch (currentStory?.type) {
      case "image":
        return (
          <img
            src={currentStory.data}
            className="max-h-full max-w-full object-contain"
          />
        );
      case "video":
        return (
          <video
            src={currentStory.data}
            className="max-h-full max-w-full object-contain"
            autoPlay
            controls
          />
        );
      default:
        return (
          <p className="text-2xl font-bold text-foreground">
            {currentStory?.data}
          </p>
        );
    }
  };

  return (
    <div className="flex flex-col h-full relative">

      {/* Click areas */}
      <div className="absolute left-0 top-0 w-1/2 h-full z-10" onClick={prevStory} />
      <div className="absolute right-0 top-0 w-1/2 h-full z-10" onClick={nextStory} />

      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-card">
        <StatusAvatar
          src={status.profilePicture}
          alt={status.username}
          seen={status.seen}
          count={status.count}
          size={42}
        />
        <div>
          <p className="text-sm font-semibold">{status.username}</p>
          <p className="text-xs text-muted-foreground">
            {formatLastSeen(currentStory.createdAt)}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1 px-4 pt-3">
        {status.content.map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full"
            style={{
              background:
                i <= currentIndex
                  ? "var(--color-primary)"
                  : "var(--color-muted-foreground)",
              opacity: i <= currentIndex ? 1 : 0.3,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4 bg-black text-white">
        {renderContent()}
      </div>
    </div>
  );
};

export default StatusViewer