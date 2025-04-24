import { useState, useEffect, useRef } from "react";
import { PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Link, useNavigate, useLocation } from "react-router-dom";
import IMAGES from "@/assets/images/image";
import { verifyOtp, resendOtp } from "@/services/auth.service";
import { toast } from "sonner";
import { setUser } from "@/features/auth/authSlice";
import { useDispatch } from "react-redux";
export const OtpVerificationPage = () => {
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(''));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const dispatch = useDispatch();
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));
  useEffect(() => {
    if (!email) {
      navigate("/register");
      toast.error("Please register first");
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  const handleChange = (index: number, value: string) => {
    if (value && !/^\d+$/.test(value)) return;
    
    const newOtpValues = [...otpValues];
    
    if (value.length > 1) {
      const pastedValues = value.split('').slice(0, 6);
      const newValues = [...otpValues];
      
      pastedValues.forEach((digit, idx) => {
        if (index + idx < 6) {
          newValues[index + idx] = digit;
        }
      });
      
      setOtpValues(newValues);
      
      const nextIndex = Math.min(index + pastedValues.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    newOtpValues[index] = value;
    setOtpValues(newOtpValues);
    
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {

    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };


  const handlePaste = (e: React.ClipboardEvent, index: number) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');

    const digits = pastedData.match(/\d/g);
    if (!digits) return;
    
    const newOtpValues = [...otpValues];
    digits.forEach((digit, idx) => {
      if (index + idx < 6) {
        newOtpValues[index + idx] = digit;
      }
    });
    
    setOtpValues(newOtpValues);
    
    const nextEmptyIndex = newOtpValues.findIndex(val => val === '');
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const otp = otpValues.join('');
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }
    
    try {
      setIsSubmitting(true);
     const response =  await verifyOtp(email, otp);
      toast.success("OTP verified successfully!");
      
      const {  firstName, lastName, phone, id, preferences ,dob,profileImage ,} = response.user;
      dispatch(setUser({ email, firstName, lastName, phone, id, preferences , dob, profileImage}));
      navigate("/dashboard");
    } catch (err: any) {
      console.error(err);
      toast.error("OTP verification failed", {
        description: err.response?.data?.message || "Invalid OTP. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await resendOtp(email);
      toast.success("OTP has been resent to your email");
      setCountdown(60);
      setCanResend(false);

      setOtpValues(Array(6).fill(''));
      inputRefs.current[0]?.focus();
      
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to resend OTP", {
        description: err.response?.data?.message || "Something went wrong.",
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <div className="hidden md:flex md:w-1/2 lg:w-2.5/5 bg-black relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/30 z-10"></div>
          <img 
            src={IMAGES.reflectionImage}
            alt="Workspace with laptop" 
            className="w-full h-full object-cover object-center"
          />
        </div>
        <div className="relative z-10 flex flex-col justify-between h-full w-full p-8">
          <Link to="/" className="flex items-center">
            <PenTool className="h-10 w-10 text-white mr-3" />
            <span className="text-3xl font-bold text-white">Wordly</span>
          </Link>
          <div className="max-w-4xl text-start ml-10 mb-100">
            <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold mb-6 text-white">
              <span className="text-red-600">Verify</span> your account.
            </h1>
            <p className="text-xl text-gray-300">
              One step away from discovering ideas that matter to you.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full md:w-1/2 lg:w-2.5/5 flex flex-col">
        <div className="flex justify-between items-center p-2">
          <div className="md:hidden flex items-center">
            <PenTool className="h-8 w-8 mr-2" />
            <span className="text-2xl font-bold">Wordly</span>
          </div>
          <div className="ml-auto">
            <ModeToggle />
          </div>
        </div>

        <div className="flex-grow flex flex-col justify-center items-center px-6 py-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Verify Your Email</h2>
              <p className="text-muted-foreground">
                We've sent a verification code to <span className="font-medium">{email}</span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="otp-input-0" className="block text-sm font-medium">
                  Enter 6-digit Code
                </label>
                <div className="flex justify-between gap-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Input
                      key={index}
                      id={`otp-input-${index}`}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6} 
                      value={otpValues[index]}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={(e) => handlePaste(e, index)}
                      ref={(ref) => { inputRefs.current[index] = ref; }} 
                      className="w-12 h-12 text-center text-xl font-medium"
                    />
                  ))}
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base" 
                disabled={isSubmitting || otpValues.join('').length !== 6}
              >
                {isSubmitting ? "Verifying..." : "Verify OTP"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                Didn't receive the code?{" "}
                {canResend ? (
                  <button
                    onClick={handleResendOtp}
                    className="text-primary font-medium hover:underline"
                  >
                    Resend OTP
                  </button>
                ) : (
                  <span>Resend in {countdown}s</span>
                )}
              </p>
            </div>
            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                Back to{" "}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpVerificationPage;