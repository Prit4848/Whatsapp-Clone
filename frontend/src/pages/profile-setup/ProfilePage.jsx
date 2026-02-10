import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Camera, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {useChatStore} from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { currentUser } = useChatStore();
  const { authUser, ProfileSetup } = useAuthStore();
  const initialAbout = authUser?.about
    ? authUser.about
    : "Hey there! I'm using this chat app.";
  const [username, setUsername] = useState(authUser.username);
  const [about, setAbout] = useState(initialAbout);
  const [imagePreview, setImagePreview] = useState(authUser.profilePicture);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const fileInputRef = useRef(null);
  const nameInputRef = useRef(null);
  const aboutInputRef = useRef(null);

  useEffect(() => {
    if (authUser) {
      setUsername(authUser.username || "");
      setAbout(authUser.about || "Hey there! I'm using this chat app.");
      setImagePreview(authUser.profilePicture);
    }
  }, [authUser]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result); // UI preview
      setSelectedImage(file); // store for API
    };

    reader.readAsDataURL(file);
  };

  const handleBackAndSave = async () => {
    if (selectedImage) {
      const payload = {
        media: selectedImage,
        agreed: true,
      };
      await ProfileSetup(payload);
      setSelectedImage(null);
    }
  };

  const handleNameEdit = () => {
    setIsEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 0);
  };

  const handleNameSave = () => {
    const payload = {
      username,
      agreed: true,
    };
    ProfileSetup(payload);
    setIsEditingName(false);
  };

  const handleAboutEdit = () => {
    setIsEditingAbout(true);
    setTimeout(() => aboutInputRef.current?.focus(), 0);
  };

  const handleAboutSave = () => {
    const payload = {
      about,
      agreed: true,
    };
    ProfileSetup(payload);
    setIsEditingAbout(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center gap-4 px-4 py-3 bg-card border-b border-border">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors text-foreground"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Profile</h1>
      </header>

      <div className="max-w-lg mx-auto p-4 space-y-6">
        {/* Profile Image */}
        <div className="flex flex-col items-center py-6">
          <button
            type="button"
            onClick={handleImageClick}
            className="relative w-32 h-32 rounded-full overflow-hidden group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
          >
            <img
              src={imagePreview}
              alt="Profile"
              className="w-full h-full object-cover bg-muted"
            />
            {/* Camera overlay */}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          {selectedImage && (
            <>
              <button
                onClick={handleBackAndSave}
                className="p-2 mt-2 rounded-full hover:bg-muted transition-colors text-foreground text-primary"
                aria-label="Save profile photo"
              >
                <Check className="w-7 h-7" />
              </button>

              <p className="text-xs text-primary mt-2">
                Tap check to save profile photo
              </p>
            </>
          )}
        </div>

        {/* Username Section */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs text-primary font-medium uppercase tracking-wide">
              Your Name
            </p>
          </div>
          <div className="px-4 py-3 flex items-center justify-between gap-3">
            {isEditingName ? (
              <>
                <input
                  ref={nameInputRef}
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="flex-1 bg-transparent text-foreground focus:outline-none"
                  onKeyDown={(e) => e.key === "Enter" && handleNameSave()}
                />
                <button
                  onClick={handleNameSave}
                  className="p-2 rounded-full hover:bg-muted transition-colors text-primary"
                  aria-label="Save name"
                >
                  <Check className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button
                onClick={handleNameEdit}
                className="flex-1 text-left text-foreground hover:text-primary transition-colors"
              >
                {username || "Add your name"}
              </button>
            )}
          </div>
          <p className="px-4 pb-3 text-xs text-muted-foreground">
            This is not your username. This name will be visible to your
            contacts.
          </p>
        </div>

        {/* About Section */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs text-primary font-medium uppercase tracking-wide">
              About
            </p>
          </div>
          <div className="px-4 py-3 flex items-start justify-between gap-3">
            {isEditingAbout ? (
              <>
                <textarea
                  ref={aboutInputRef}
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  rows={3}
                  maxLength={139}
                  className="flex-1 bg-transparent text-foreground focus:outline-none resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAboutSave();
                    }
                  }}
                />
                <button
                  onClick={handleAboutSave}
                  className="p-2 rounded-full hover:bg-muted transition-colors text-primary"
                  aria-label="Save about"
                >
                  <Check className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button
                onClick={handleAboutEdit}
                className="flex-1 text-left text-foreground hover:text-primary transition-colors"
              >
                {about || "Add about"}
              </button>
            )}
          </div>
          <p className="px-4 pb-3 text-xs text-muted-foreground">
            {about.length}/139 characters
          </p>
        </div>

        {/* Phone Section (Read-only) */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs text-primary font-medium uppercase tracking-wide">
              {authUser.phoneNumber ? "Phone" : "email"}
            </p>
          </div>
          <div className="px-4 py-3">
            {authUser.phoneNumber ? (
              <p className="text-foreground">{authUser.phoneNumber}</p>
            ) : (
              <p className="text-foreground">{authUser.email}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
