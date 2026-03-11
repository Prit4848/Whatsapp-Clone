import { useState, useEffect } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import OtpInput from "./OtpInput";
import { useAuthStore } from "../store/useAuthStore";

const OtpVerification = ({ 
  inputType, 
  inputValue, 
  onBack, 
  onVerify, 
  isLoading,
  onReset 
}) => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(300);
  const [canResend, setCanResend] = useState(false);

  const {sendOtp} = useAuthStore()

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  // Mask the destination
  const getMaskedDestination = () => {
    if (inputType === "email") {
      const [local, domain] = inputValue.split("@");
      if (local.length <= 2) {
        return `${local}@${domain}`;
      }
      return `${local.slice(0, 2)}${"•".repeat(local.length - 2)}@${domain}`;
    } else {
      // Phone number
      const digits = inputValue.replace(/\D/g, "");
      if (digits.length <= 4) {
        return `+91 ${digits}`;
      }
      return `+91 ${"•".repeat(digits.length - 4)}${digits.slice(-4)}`;
    }
  };

  const handleOtpChange = (value) => {
    setOtp(value);
    setError("");
  };

  const handleVerify = () => {
    if (otp.length !== 6) {
      setError("Please enter a complete 6-digit OTP");
      return;
    }
    onVerify(otp);
  };

  const handleResend = () => {
    if (!canResend) return;
     const payload = inputType === "email" 
      ? { email: inputValue.trim() } 
      : { phoneNumber:inputValue.match(/\d/g).join('').slice(-10), phoneSuffix:+91 };
    sendOtp(payload)
    setResendTimer(300);
    setCanResend(false);
    setOtp("");
    setError("");
    onReset()
    console.log("Resending OTP to:", inputValue);
  };

  const isOtpComplete = otp.length === 6;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm">Back</span>
      </button>

      {/* Title */}
      <div className="text-center">
        <h1 className="text-xl font-semibold text-foreground mb-2">
          Enter the OTP
        </h1>
        <p className="text-sm text-muted-foreground">
          OTP sent to {getMaskedDestination()}
        </p>
      </div>

      {/* OTP Input */}
      <div className="py-4">
        <OtpInput
          value={otp}
          onChange={handleOtpChange}
          length={6}
          disabled={isLoading}
          error={!!error}
        />
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}

      {/* Verify Button */}
      <button
        type="button"
        onClick={handleVerify}
        disabled={isLoading || !isOtpComplete}
        className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Verifying...
          </>
        ) : (
          "Verify OTP"
        )}
      </button>

      {/* Resend OTP */}
      <div className="text-center">
        {canResend ? (
          <button
            type="button"
            onClick={handleResend}
            className="text-sm text-primary hover:underline"
          >
            Resend OTP
          </button>
        ) : (
          <p className="text-sm text-muted-foreground">
            Resend OTP in{" "}
            <span className="font-medium text-foreground">
              {resendTimer}s
            </span>
          </p>
        )}
      </div>

      {/* Change destination */}
      <button
        type="button"
        onClick={onBack}
        className="w-full py-2 text-sm text-primary hover:underline"
      >
        Change {inputType === "email" ? "email" : "phone number"}
      </button>
    </div>
  );
};

export default OtpVerification;
