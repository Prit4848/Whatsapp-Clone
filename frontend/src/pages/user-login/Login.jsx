import { useState } from "react";
import { MessageCircleDashed } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [error, setError] = useState("");
  const { loginWithGoogle } = useAuthStore();

  const handleGoogleSuccess = async (credentialResponse) => {
      await loginWithGoogle(credentialResponse.credential);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm bg-card rounded-xl shadow-lg p-6 border border-border">
          <form className="space-y-4">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary flex items-center justify-center">
              <MessageCircleDashed className="w-10 h-10 text-primary-foreground" />
            </div>
            
            <h1 className="text-lg font-semibold text-foreground mb-4 text-center">
              Sign In
            </h1>

            {/* 4. Google Login Section */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">SOCIAL</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google Login Failed")}
                theme="filled_blue"
                shape="pill"
                width="100%"
              />
            </div>
             {error && <p className="text-sm text-destructive font-medium">{error}</p>}
          </form>
      </div>
    </div>
  );
};

export default Login;