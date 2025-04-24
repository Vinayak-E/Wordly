import { useState } from "react";
import { Eye, EyeOff, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Link, useNavigate } from "react-router-dom";
import IMAGES from "@/assets/images/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginUser } from "@/services/auth.service";
import { toast } from "sonner";
import { LoginFormData, loginSchema } from "@/validations/loginSchema";
import { useDispatch } from "react-redux";
import { setUser } from "@/features/auth/authSlice";

export const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate()
  const dispatch = useDispatch(); 
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true);
      const response = await loginUser(data); 
      console.log('Login response:', response);
      const { email, firstName, lastName, phone, id, preferences ,dob,profileImage} = response.user;
      dispatch(setUser({ email, firstName, lastName, phone, id, preferences , dob, profileImage}));
      toast.success("Login successful!", {
        description: "Welcome back to Wordly.",
      });
      navigate("/dashboard");
    } catch (err: any) {
      console.error(err);
      toast.error("Login failed", {
        description: err.response?.data?.message || "Invalid email or password.",
      });
    } finally {
      setIsSubmitting(false);
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
        <div className="relative z-10 flex flex-col justify-between h-full w-full p-10">
          <Link to="/" className="flex items-center">
            <PenTool className="h-10 w-10 text-white mr-3" />
            <span className="text-3xl font-bold text-white">Wordly</span>
          </Link>
          <div className="max-w-3xl text-start ml-10 mb-84">
            <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold mb-6 text-white">
            <span className="text-red-600">Reconnect</span> with ideas that shape your world.
            </h1>
            <p className="text-xl text-gray-300">
            Every word you read brings you closer to the world you want to know.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full md:w-1/2 lg:w-2.5/5 flex flex-col">
        <div className="flex justify-between items-center p-6">
        <Link to="/">
          <div className="md:hidden flex items-center">
            <PenTool className="h-8 w-8 mr-2" />
            <span className="text-2xl font-bold">Wordly</span>
          </div>
          </Link>
          <div className="ml-auto">
            <ModeToggle />
          </div>
        </div>

        <div className="flex-grow flex flex-col justify-center items-center px-6 py-12">
          <div className="w-full max-w-md">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-2">Welcome back</h2>
              <p className="text-muted-foreground">Sign in to continue to Wordly</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium">
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className={`w-full h-12 ${errors.email ? "border-red-500" : ""}`}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="block text-sm font-medium">
                    Password
                  </label>
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`w-full h-12 pr-10 ${errors.password ? "border-red-500" : ""}`}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full h-12 text-base" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/register" className="text-primary font-medium hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;