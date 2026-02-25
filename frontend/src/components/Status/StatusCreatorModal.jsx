import { useState } from "react";
import { Send, Image as ImageIcon, Video, FileText,X } from "lucide-react";
import {useStatusStore} from "../../store/useStatusStore"


const StatusCreatorModal = ({ isOpen, onClose, authUser, onStatusCreated }) => {
  const [statusType, setStatusType] = useState("text"); // "text", "image", "video"
  const [content, setContent] = useState("");
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaFile, setMediaFile] = useState(null);
  const {createStatus} = useStatusStore()

const handleMediaUpload = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Preview
  const previewUrl = URL.createObjectURL(file);

  setMediaPreview(previewUrl);
  setMediaFile(file);
};

const handleCreateStatus = async () => {
  if (!content?.trim() && !mediaFile) {
    alert("Please add some content to your status");
    return;
  }

  const formData = new FormData();

  if (content?.trim()) {
    formData.append("content", content.trim());
  }

  if (mediaFile) {
    formData.append("media", mediaFile);
  }

  await createStatus(formData);

  resetForm();
  onClose();
};
  const resetForm = () => {
    setStatusType("text");
    setContent("");
    setMediaPreview(null);
    setMediaFile(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl w-full max-w-md shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Create Status</h2>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Status type tabs */}
          <div className="flex gap-2 bg-muted p-1 rounded-lg">
            {[
              { value: "text", label: "Text", icon: FileText },
              { value: "image", label: "Image", icon: ImageIcon },
              { value: "video", label: "Video", icon: Video },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => {
                  setStatusType(value);
                  setMediaPreview(null);
                  setMediaFile(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-colors ${
                  statusType === value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>

          {/* User info */}
          <div className="flex items-center gap-3 px-3 py-2 bg-muted rounded-lg">
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
              {authUser?.profilePicture ? (
                <img src={authUser.profilePicture} alt={authUser.username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground text-xs font-semibold">
                  {authUser?.username?.[0]?.toUpperCase() ?? "?"}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{authUser?.username}</p>
              <p className="text-xs text-muted-foreground">Posting to your story</p>
            </div>
          </div>

          {/* Content input based on type */}
          {statusType === "text" && (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              maxLength={280}
              className="w-full px-3 py-2 rounded-lg border border-border bg-muted/30 text-foreground placeholder:text-muted-foreground resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          )}

          {statusType === "image" && (
            <div>
              {mediaPreview ? (
                <div className="relative">
                  <img src={mediaPreview} alt="Preview" className="w-full rounded-lg max-h-48 object-cover" />
                  <button
                    onClick={() => {
                      setMediaPreview(null);
                      setMediaFile(null);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                    aria-label="Remove image"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="text-sm font-medium text-foreground">Upload image</span>
                  <span className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMediaUpload}
                    className="hidden"
                  />
                </label>
              )}
              {mediaPreview && (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Add a caption (optional)"
                  maxLength={280}
                  className="w-full mt-3 px-3 py-2 rounded-lg border border-border bg-muted/30 text-foreground placeholder:text-muted-foreground resize-none h-16 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              )}
            </div>
          )}

          {statusType === "video" && (
            <div>
              {mediaPreview ? (
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video src={mediaPreview} className="w-full max-h-48 rounded-lg" controls />
                  <button
                    onClick={() => {
                      setMediaPreview(null);
                      setMediaFile(null);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                    aria-label="Remove video"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <Video className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="text-sm font-medium text-foreground">Upload video</span>
                  <span className="text-xs text-muted-foreground mt-1">MP4, WebM up to 50MB</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleMediaUpload}
                    className="hidden"
                  />
                </label>
              )}
              {mediaPreview && (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Add a caption (optional)"
                  maxLength={280}
                  className="w-full mt-3 px-3 py-2 rounded-lg border border-border bg-muted/30 text-foreground placeholder:text-muted-foreground resize-none h-16 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              )}
            </div>
          )}

          {/* Character count for text */}
          {statusType === "text" && (
            <p className="text-xs text-muted-foreground text-right">
              {content.length}/280
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-border">
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateStatus}
            className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            Post
          </button>
        </div>
      </div>
    </div>
  );
};


export default StatusCreatorModal;
