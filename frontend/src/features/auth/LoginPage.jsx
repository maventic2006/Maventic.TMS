import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Truck,
  BarChart3,
  MapPin,
  Shield,
  Users,
  CheckCircle,
} from "lucide-react";
import { loginUser, clearError } from "../../redux/slices/authSlice";
import maventic_logo from "../../assets/images/maventic_logo3.png";

const loginSchema = z.object({
  userId: z.string().min(1, "Please enter your user id"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { error, isAuthenticated } = useSelector((state) => state.auth);

  const from = location.state?.from?.pathname || "/tms-portal";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      userId: "",
      password: "",
    },
  });

  useEffect(() => {
    // If user is already authenticated, redirect to TMS portal
    if (isAuthenticated) {
      navigate("/tms-portal", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Clear any previous errors when component mounts
    dispatch(clearError());
  }, [dispatch]);

  const onSubmit = async (data) => {
    try {
      console.log("🔐 Login form submitted:", {
        userId: data.userId,
        hasPassword: !!data.password,
        formData: data,
      });

      // Convert userId to email format for backend compatibility
      const loginData = {
        user_id: data.userId,
        password: data.password,
      };

      console.log("📤 Dispatching loginUser action with:", {
        user_id: loginData.user_id,
      });

      const result = await dispatch(loginUser(loginData)).unwrap();
      console.log("✅ Login dispatch completed successfully:", result);

      // Check if password reset is required
      if (result.requirePasswordReset) {
        console.log("🔄 Password reset required, navigating to reset page");
        navigate(`/reset-password/${data.userId}`, { replace: true });
      } else {
        console.log("🏠 No password reset needed, navigating to TMS portal");
        navigate("/tms-portal", { replace: true });
      }
    } catch (error) {
      console.error("❌ Login failed:", error);
      // Error is already handled by the authSlice
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side */}
      <div className="hidden lg:flex flex-1 bg-[#0D1A33] text-white p-8 flex-col justify-center relative overflow-hidden">
        <div className="relative z-10 max-w-lg">
          {/* Maventic Logo */}
          {/* <div className="mb-6 flex justify-center">
            <img
              src={maventic_logo}
              alt="Maventic Logo"
              className="h-40 w-full object-contain mix-blend-multiply filter brightness-95"
            />
          </div> */}

          {/* Welcome Message */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-3">Welcome to TMS</h2>
            <p className="text-base text-gray-300 leading-relaxed">
              Streamline fleet management, optimize routes, and track shipments
              in real-time. Join 500+ companies revolutionizing logistics
              operations.
            </p>
          </div>

          {/* Features Card */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">
              Powerful Transportation Management Features
            </h3>

            {/* Feature Icons */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="w-10 h-10 bg-[#FFA500]/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Truck className="w-5 h-5 text-[#FFA500]" />
                </div>
                <span className="text-xs text-gray-300">Fleet Management</span>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-[#FFA500]/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <MapPin className="w-5 h-5 text-[#FFA500]" />
                </div>
                <span className="text-xs text-gray-300">
                  Route Optimization
                </span>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-[#FFA500]/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <BarChart3 className="w-5 h-5 text-[#FFA500]" />
                </div>
                <span className="text-xs text-gray-300">Analytics</span>
              </div>
            </div>

            {/* Benefits List */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#FFA500]" />
                <span className="text-sm">Real-time tracking & monitoring</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#FFA500]" />
                <span className="text-sm">Automated dispatch & routing</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#FFA500]" />
                <span className="text-sm">Comprehensive reporting</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex-1 bg-slate-50 flex items-center justify-center p-8 lg:p-12">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#FFA500]/20 to-orange-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl"></div>
        </div>
        <div className="w-full max-w-md relative z-10">
          {/* TMS Logo */}
          <div className="text-center mb-8">
            {/* <div className="text-3xl font-bold text-[#0D1A33] mb-2">TMS</div> */}
            <div className="mb-6 flex justify-center">
              <img
                src={maventic_logo}
                alt="Maventic Logo"
                className="h-20 w-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in</h1>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* User Id Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="johndesign@mail.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                           focus:ring-2 focus:ring-[#0D1A33] focus:border-[#0D1A33] 
                           focus:outline-none transition-all duration-200"
                  {...register("userId")}
                />
              </div>
              {errors.userId && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.userId.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg 
                           focus:ring-2 focus:ring-[#0D1A33] focus:border-[#0D1A33] 
                           focus:outline-none transition-all duration-200"
                  {...register("password")}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember me checkbox */}
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-[#0D1A33] focus:ring-[#0D1A33] border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-700"
              >
                Remember me
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                {error}
              </div>
            )}

            {/* Sign In Button */}
            <button
              type="submit"
              // disabled={isLoading}
              className="w-full py-3 px-4 bg-[#0D1A33] text-white font-medium rounded-lg 
                       hover:bg-[#1a2e4a] focus:outline-none focus:ring-2 focus:ring-[#0D1A33] 
                       focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed 
                       transition-all duration-200"
            >
              {/* {isLoading ? "Signing in..." : "Sign in"} */}
              Sign in
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 flex items-center justify-between text-sm">
            <span className="text-gray-600">Don't have an account?</span>
            <button className="text-[#0D1A33] hover:underline">Sign up</button>
          </div>
          <div className="mt-2">
            <button className="text-sm text-[#0D1A33] hover:underline">
              Forgot Password
            </button>
          </div>

          {/* Social Login */}
          <div className="mt-6">
            <button
              type="button"
              className="w-full py-3 px-4 bg-white border border-gray-300 text-gray-700 
                       font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 
                       focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 
                       flex items-center justify-center gap-3"
            >
              {/* Google Logo */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
