import { useState, useEffect } from "react";
import { Eye, EyeOff, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Link, useNavigate } from "react-router-dom";
import IMAGES from "@/assets/images/image";
import { getCategories, registerUser } from "@/services/auth.service";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterFormData, registerSchema } from "@/validations/registerSchema";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>(
    []
  );
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      dob: "",
      password: "",
      confirmPassword: "",
      preferences: [],
    },
  });
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories", error);
        toast.error("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsSubmitting(true);
      data.preferences = selectedPreferences;
      await registerUser(data);
      toast.success("Registration successful!", {
        description: "Please verify your email with the OTP we've sent.",
      });
      navigate("/verify-otp", { state: { email: data.email } });
    } catch (err: any) {
      console.error(err);
      toast.error("Registration failed", {
        description: err.response?.data?.message || "Something went wrong.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreferenceSelect = (preferenceId: string) => {
    let updatedPreferences;
    if (selectedPreferences.includes(preferenceId)) {
      updatedPreferences = selectedPreferences.filter(
        (p) => p !== preferenceId
      );
    } else {
      updatedPreferences = [...selectedPreferences, preferenceId];
    }
    setSelectedPreferences(updatedPreferences);
    setValue("preferences", updatedPreferences);
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
          <div className="max-w-4xl text-start ml-10 mb-106">
            <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold mb-6 text-white">
              <span className="text-red-600">Join</span> the community of
              knowledge seekers.
            </h1>
            <p className="text-xl text-gray-300">
              Start your journey to discover ideas that matter to you.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full md:w-1/2 lg:w-2.5/5 flex flex-col">
        <div className="flex justify-between items-center p-2">
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

        <div className="flex-grow flex flex-col justify-center items-center px-6 py-8 overflow-y-auto">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Create an account</h2>
              <p className="text-muted-foreground">
                Sign up to get started with Wordly
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium"
                  >
                    First Name
                  </label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    className={`w-full ${
                      errors.firstName ? "border-red-500" : ""
                    }`}
                    {...register("firstName")}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium"
                  >
                    Last Name
                  </label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    className={`w-full ${
                      errors.lastName ? "border-red-500" : ""
                    }`}
                    {...register("lastName")}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className={`w-full ${errors.email ? "border-red-500" : ""}`}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-sm font-medium">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(123) 456-7890"
                    className={`w-full ${errors.phone ? "border-red-500" : ""}`}
                    {...register("phone")}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="dob" className="block text-sm font-medium">
                    Date of Birth
                  </label>
                  <Controller
                    control={control}
                    name="dob"
                    render={({ field }) => (
                      <DatePicker
                        id="dob"
                        selected={field.value ? new Date(field.value) : null}
                        onChange={(date) =>
                          field.onChange(date?.toISOString() || "")
                        }
                        dateFormat="yyyy-MM-dd"
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                        placeholderText="Select your date of birth"
                        className={`w-full border rounded-md p-2 ${
                          errors.dob ? "border-red-500" : "border-input"
                        }`}
                        maxDate={new Date()}
                      />
                    )}
                  />
                  {errors.dob && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.dob.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Preferences section */}
              <div className="space-y-3">
                <label className="block text-sm font-medium mb-2">
                  Preferences (Select at least one)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    onValueChange={handlePreferenceSelect}
                    defaultValue=""
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select preferences" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem
                          key={category._id}
                          value={category._id}
                          className={
                            selectedPreferences.includes(category._id)
                              ? "bg-primary/20"
                              : ""
                          }
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex flex-wrap gap-2">
                    {selectedPreferences.map((prefId) => {
                      const category = categories.find((c) => c._id === prefId);
                      return (
                        <span
                          key={prefId}
                          className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm flex items-center"
                        >
                          {category?.name}
                          <button
                            type="button"
                            className="ml-1 text-primary hover:text-primary/80"
                            onClick={() => handlePreferenceSelect(prefId)}
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
                {errors.preferences && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.preferences.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`w-full pr-10 ${
                      errors.password ? "border-red-500" : ""
                    }`}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`w-full pr-10 ${
                      errors.confirmPassword ? "border-red-500" : ""
                    }`}
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating account..." : "Create account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary font-medium hover:underline"
                >
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

export default RegisterPage;
