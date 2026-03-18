import { useRef, useState, useMemo } from "react";
import { Mail, Phone, MessageCircleDashed } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import OtpVerification from "../../components/OtpVerification";
import countries from '../../utils/countriles';

import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [phoneSuffix, setPhoneSuffix] = useState("+91");
  const [step, setStep] = useState("input");
  const [error, setError] = useState("");
  
  // 2. Add 'loginWithGoogle' (Ensure this is defined in your useAuthStore)
  const { sendOtp, verifyOtp, isLoggingIn, loginWithGoogle } = useAuthStore();
  const countryData = useRef(countries);

  const activeMethod = useMemo(() => {
    if (email.trim().length > 0) return "email";
    if (phoneNumber.trim().length > 0) return "phone";
    return null;
  }, [email, phoneNumber]);

  const isValid = () => {
    if (activeMethod === "email") {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    if (activeMethod === "phone") {
      return phoneNumber.length >= 10;
    }
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isValid()) {
      setError(activeMethod === "email" ? "Enter a valid email" : "Enter a valid phone number");
      return;
    }

    const payload = activeMethod === "email" 
      ? { email: email.trim() } 
      : { phoneNumber, phoneSuffix };

      const res = await sendOtp(payload);

      if(res?.data?.status === "success"){
        setStep("otp");
      }
  };

  const handleOtpVerify = (otp) => {
    const data = activeMethod === "email"
      ? { email: email.trim(), otp: parseInt(otp) }
      : { phoneNumber, phoneSuffix, otp: parseInt(otp) };
    
    verifyOtp(data);
  };

  // 3. Handle Google Success
  const handleGoogleSuccess = async (credentialResponse) => {
      await loginWithGoogle(credentialResponse.credential);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm bg-card rounded-xl shadow-lg p-6 border border-border">
        {step === "input" ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary flex items-center justify-center">
              <MessageCircleDashed className="w-10 h-10 text-primary-foreground" />
            </div>
            
            <h1 className="text-lg font-semibold text-foreground mb-4 text-center">
              Sign In
            </h1>

            {/* Phone Input */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-muted-foreground">Phone Number</label>
              <div className="flex gap-2">
                <select
                  value={phoneSuffix}
                  onChange={(e) => setPhoneSuffix(e.target.value)}
                  disabled={isLoggingIn || !!email}
                  className="px-2 py-3 bg-muted rounded-lg text-foreground"
                >
                  {countryData.current.map((c) => (
                    <option key={`${c.alpha2}-${c.dialCode}`} value={c.dialCode}>
                      {c.alpha2} {c.dialCode}
                    </option>
                  ))}
                </select>
                <div className="relative flex-1">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value.replace(/\D/g, ""));
                      if(e.target.value) setEmail(""); 
                      setError("");
                    }}
                    placeholder="Phone number"
                    disabled={isLoggingIn || !!email}
                    className="w-full pl-11 pr-4 py-3 bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">OR</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-muted-foreground">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if(e.target.value) setPhoneNumber(""); 
                    setError("");
                  }}
                  placeholder="name@example.com"
                  disabled={isLoggingIn || !!phoneNumber}
                  className="w-full pl-11 pr-4 py-3 bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {error && <p className="text-sm text-destructive font-medium">{error}</p>}

            <button
              type="submit"
              disabled={isLoggingIn || !isValid()}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoggingIn ? "Processing..." : "Continue"}
            </button>

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
          </form>
        ) : (
          <OtpVerification
            inputType={activeMethod}
            inputValue={activeMethod === "email" ? email : phoneNumber}
            onBack={() => setStep("input")}
            onVerify={handleOtpVerify}
            isLoading={isLoggingIn}
            onReset={handleSubmit}
          />
        )}
      </div>
    </div>
  );
};

export default Login;