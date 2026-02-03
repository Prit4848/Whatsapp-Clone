import { useRef, useState } from "react";
import { Mail, MessageSquare, Phone } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import OtpVerification from "../../components/OtpVerification";
import countries from '../../utils/countriles'

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneSuffix, setPhoneSuffix] = useState("");
  const [email, setEmail] = useState("");
  const [step, setStep] = useState("input");
  const [error, setError] = useState("");
  const [activeMethod, setActiveMethod] = useState(null); 
  const { sendotp, verifyOtp, isLoading } = useAuthStore();
  const countryData = useRef(countries)

  // Validate phone number (at least 10 digits)
  const isValidPhone = (value) => {
    const digits = value.replace(/\D/g, "");
    return digits.length >= 10;
  };

  // Validate email
  const isValidEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  // Check if form is valid
  const isFormValid = () => {
    if (phoneNumber.trim() && isValidPhone(phoneNumber)) return true;
    if (email.trim() && isValidEmail(email)) return true;
    return false;
  };

  // Determine which method is being used
  const getActiveMethod = () => {
    if (phoneNumber.trim()) return "phone";
    if (email.trim()) return "email";
    return null;
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setPhoneNumber(value);
    if (value) setEmail(""); // Clear email when typing phone
    setError("");
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (value) setPhoneNumber("");
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const method = getActiveMethod();

    if (!method) {
      setError("Please enter your phone number or email");
      return;
    }

    if (method === "phone") {
      if (!isValidPhone(phoneNumber)) {
        setError("Please enter a valid phone number (at least 10 digits)");
        return;
      }
      const phoneData = {
        phoneNumber: phoneNumber.replace(/\D/g, ""),
        phoneSuffix: "+91",
      };
      
      setActiveMethod("phone");
    } else if (method === "email") {
      if (!isValidEmail(email)) {
        setError("Please enter a valid email address");
        return;
      }
      const emailData = {
        email: email.trim(),
      };

      setActiveMethod("email");
    }

    setStep("otp");
  };

  const handleOtpVerify = (otp) => {
    const verificationData =
      activeMethod === "email"
        ? { email: email.trim(), otp: parseInt(otp) }
        : {
            phoneNumber: phoneNumber.replace(/\D/g, ""),
            phoneSuffix: "+91",
            otp: parseInt(otp),
          };

    console.log("OTP Verification Data:", verificationData);
    verifyOtp(otp);
  };

  const handleBack = () => {
    setStep("input");
    setError("");
  };

  const getInputValue = () => {
    return activeMethod === "email" ? email : phoneNumber;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary flex items-center justify-center">
          <MessageSquare className="w-10 h-10 text-primary-foreground" />
        </div>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-sm bg-card rounded-xl shadow-lg p-6 border border-border">
        {step === "input" ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h1 className="text-lg font-semibold text-foreground mb-4 text-center">
                Enter your phone number or email
              </h1>

              {/* Phone Number Input */}
              <div className="mb-3">
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-muted-foreground mb-1.5"
                >
                  Phone Number
                </label>
                <div className="flex gap-2">
                  {/* Country Code Selector */}
                  <div className="relative">
                    <select
                      value={phoneSuffix}
                      onChange={(e) => setPhoneSuffix(e.target.value)}
                      disabled={isLoading || email.length > 0}
                      className="h-full px-3 py-3 bg-muted rounded-lg text-foreground
                   focus:outline-none focus:ring-2 focus:ring-primary
                   disabled:opacity-50 appearance-none pr-8"
                    >
                      {countryData.current.map((country) => {
                        return (
                          <option
                            key={country.dialCode}
                            value={country.dialCode}
                            className="bg-background text-foreground"
                          >
                            {country.alpha2} {country.dialCode}
                          </option>
                        );
                      })}
                    </select>

                    {/* Dropdown Arrow */}
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                      ▼
                    </span>
                  </div>

                  {/* Phone Input */}
                  <div className="relative flex-1">
                    <Phone
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                    />

                    <input
                      id="phone"
                      type="tel"
                      inputMode="numeric"
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      placeholder="Enter phone number"
                      className="w-full pl-11 pr-4 py-3 bg-muted rounded-lg text-foreground
                   focus:outline-none focus:ring-2 focus:ring-primary
                   placeholder:text-muted-foreground disabled:opacity-50"
                      disabled={isLoading || email.length > 0}
                      autoComplete="tel"
                    />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-border"></div>
                <span className="text-sm text-muted-foreground">or</span>
                <div className="flex-1 h-px bg-border"></div>
              </div>

              {/* Email Input */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-muted-foreground mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative flex-1">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                  />
                  <input
                    id="email"
                    type="email"
                    inputMode="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="Enter email address"
                    className="w-full pl-11 pr-4 py-3 bg-muted rounded-lg text-foreground
                   focus:outline-none focus:ring-2 focus:ring-primary
                   placeholder:text-muted-foreground disabled:opacity-50"
                    disabled={isLoading || phoneNumber.length > 0}
                    autoComplete="email"
                  />
                </div>
              </div>

              <p className="text-sm text-muted-foreground mt-3">
                We'll send you an OTP to verify
              </p>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={isLoading || !isFormValid()}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Sending..." : "Continue"}
            </button>
          </form>
        ) : (
          <OtpVerification
            inputType={activeMethod}
            inputValue={getInputValue()}
            onBack={handleBack}
            onVerify={handleOtpVerify}
            isLoading={isLoading}
          />
        )}
      </div>

      {/* Demo note */}
      <p className="mt-6 text-sm text-muted-foreground text-center">
        Demo: Enter any phone/email and any 6-digit OTP to continue
      </p>
    </div>
  );
};

export default Login;
