import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { loginUser, clearError } from "../../redux/slices/authSlice";

const loginSchema = z.object({
  userId: z.string().min(1, "Please enter your user id"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, error, isAuthenticated } = useSelector(
    (state) => state.auth
  );

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
      // Convert userId to email format for backend compatibility
      const loginData = {
        user_id: data.userId,
        password: data.password,
      };
      const result = await dispatch(loginUser(loginData)).unwrap();

      // Check if password reset is required
      if (result.requirePasswordReset) {
        // Navigate to reset password page
        navigate(`/reset-password/${data.userId}`, { replace: true });
      } else {
        // Password reset not required, navigate to TMS portal
        navigate("/tms-portal", { replace: true });
      }
    } catch (error) {
      // Error is handled by the redux slice
      console.error("Login error:", error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#0D1A33] mb-2">Welcome</h1>
          <p className="text-[#4A5568]">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-[0px_2px_6px_rgba(0,0,0,0.05)] p-8">
          {/* Sign In Tab */}
          <div className="mb-6">
            <div className="bg-[#0D1A33] text-white text-center py-3 rounded-lg font-medium">
              Sign In
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* User Id Field */}
            <div>
              <label className="block text-sm font-medium text-[#0D1A33] mb-2">
                User Id
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-[#4A5568]" />
                </div>
                <input
                  type="text"
                  placeholder="Enter your user id"
                  className="w-full pl-10 pr-4 py-3 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] focus:outline-none transition-all duration-200"
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
              <label className="block text-sm font-medium text-[#0D1A33] mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#4A5568]" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] focus:outline-none transition-all duration-200"
                  {...register("password")}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-[#4A5568] hover:text-[#0D1A33]" />
                  ) : (
                    <Eye className="h-5 w-5 text-[#4A5568] hover:text-[#0D1A33]" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
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
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#FFA500] text-white font-medium rounded-lg hover:bg-[#FF8C00] focus:outline-none focus:ring-2 focus:ring-[#FFA500] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E5E7EB]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-[#4A5568]">
                OR CONTINUE WITH
              </span>
            </div>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            className="w-full py-3 px-4 bg-white border border-[#E5E7EB] text-[#0D1A33] font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-3"
          >
            {/* Google Logo SVG */}
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

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-[#4A5568]">
          <p>
            &copy; 2025 Transportation Management System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
