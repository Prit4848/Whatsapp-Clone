import { Trash2, X } from "lucide-react";
import { formatStatusTime } from "../../utils/helpers";

const DeleteStatusModal = ({ status, onClose, onDelete }) => {
  if (!status[0]) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">

    {/* Backdrop */}
    <div
      className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    />

    {/* Center Modal */}
    <div className="relative bg-[#121b22] w-[95%] max-w-md max-h-[80vh] rounded-2xl shadow-2xl flex flex-col border border-white/10 animate-in zoom-in-95 duration-200">

        {/* Handle */}
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mt-3 mb-2" />

        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-white/10">
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-400">
            My Status ({status[0]?.content?.length})
          </h3>

          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">

          {status[0]?.content?.length > 0 && status[0]?.content?.map((story) => (
            <div
              key={story.id}
              className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition"
            >
              
              {/* Preview */}
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-black flex items-center justify-center text-white text-xs">
                {story.type === "image" ? (
                  <img
                    src={story.statusUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : story.type === "video" ? (
                  <video
                    src={story.statusUrl}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-center px-1">
                    {story.data.slice(0, 20)}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <p className="text-sm font-medium capitalize">
                  {story.type}
                </p>
                <p className="text-xs text-gray-400">
                  {formatStatusTime(story.createdAt)}
                </p>
              </div>

              {/* Delete Button */}
              <button
                onClick={() => onDelete(story.id)}
                className="p-2 rounded-full hover:bg-red-500/20 text-red-500 transition"
              >
                <Trash2 className="w-5 h-5" />
              </button>

            </div>
          ))}

        </div>
      </div>
    </div>
  );
};

export default DeleteStatusModal;