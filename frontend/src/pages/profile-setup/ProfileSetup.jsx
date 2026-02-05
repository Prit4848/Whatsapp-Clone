import { useState, useRef, useMemo } from "react";
import { User, Camera, Check } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";

const AVATARS = [
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Mimi',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Jasper',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Luna',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Zoe',
];

const ProfileSetup = () => {
  const [username, setUsername] = useState("");
  const [profileImage, setProfileImage] = useState(AVATARS[0]); // Default to first avatar
  const [imagePreview, setImagePreview] = useState(AVATARS[0]);
  const [isLoading, setIsLoading] = useState({ uploading: false, saving: false });
  const [error, setError] = useState("");
  
  const fileInputRef = useRef(null);
  const { ProfileSetup: saveProfile } = useAuthStore();

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return setError("Image must be under 2MB");
      
      setIsLoading(prev => ({ ...prev, uploading: true }));
      setProfileImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setIsLoading(prev => ({ ...prev, uploading: false }));
        setError("");
      };
      reader.readAsDataURL(file);
    }
  };

  const selectAvatar = (url) => {
    setProfileImage(url);
    setImagePreview(url);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) return setError("Please enter your name");

    setIsLoading(prev => ({ ...prev, saving: true }));
    try {
      await saveProfile({ media: profileImage, username: username.trim() });
    } catch (err) {
      setError("Failed to update profile. Try again.");
    } finally {
      setIsLoading(prev => ({ ...prev, saving: false }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 animate-in fade-in duration-500">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-xl p-8 border border-border">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Complete Your Profile</h1>
          <p className="text-muted-foreground mt-2">How should the world see you?</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Main Preview & Upload */}
          <div className="flex flex-col items-center group">
            <div className="relative">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-primary/20 group-hover:border-primary transition-all duration-300 shadow-lg">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-md hover:scale-110 transition-transform"
                title="Upload from device"
              >
                <Camera size={18} />
              </button>
            </div>
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange} 
              className="hidden" 
            />
          </div>

       {/* Avatar Selection Grid */}
<div className="space-y-3">
  <label className="text-sm font-medium text-muted-foreground px-1">Choose an avatar</label>
  
  {/* Add 'no-scrollbar' here */}
  <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar px-1">
    {AVATARS.map((url) => (
      <button
        key={url}
        type="button"
        onClick={() => selectAvatar(url)}
        className={`relative flex-shrink-0 w-14 h-14 rounded-xl transition-all ${
          imagePreview === url 
          ? "ring-2 ring-primary ring-offset-2 ring-offset-card" 
          : "opacity-60 hover:opacity-100"
        }`}
      >
        <img src={url} alt="Avatar option" className="w-full h-full rounded-xl" />
      </button>
    ))}
  </div>
</div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground px-1">Display Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(""); }}
                  placeholder="e.g. John Doe"
                  className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-transparent focus:border-primary focus:bg-background rounded-xl text-foreground transition-all outline-none"
                  disabled={isLoading.saving}
                />
              </div>
            </div>

            {error && <p className="text-sm text-destructive text-center font-medium">{error}</p>}

            <button
              type="submit"
              disabled={!username.trim() || isLoading.saving || isLoading.uploading}
              className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading.saving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              ) : "Get Started"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;