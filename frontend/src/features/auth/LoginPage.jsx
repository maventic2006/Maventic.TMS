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

  const from = location.state?.from?.pathname || "/dashboard";

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
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

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
        navigate(`/reset-password/${data.userId}`, { replace: true });
      } else {
        navigate(from, { replace: true });
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-emerald-500 mb-2">Welcome</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Sign In Tab */}
          <div className="mb-6">
            <div className="bg-emerald-500 text-white text-center py-3 rounded-lg font-medium">
              Sign In
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* User Id Field */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                User Id
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder="Enter your user id"
                  className="w-full pl-10 pr-4 py-3 bg-gray-300 border-0 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all duration-200"
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
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3 bg-gray-300 border-0 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all duration-200"
                  {...register("password")}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-500 hover:text-gray-700" />
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
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-yellow-400 text-white font-medium rounded-lg hover:from-emerald-600 hover:to-yellow-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                OR CONTINUE WITH
              </span>
            </div>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            className="w-full py-3 px-4 bg-gray-300 text-gray-900 font-medium rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-3"
          >
            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
              G
            </div>
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Demo Credentials:</p>
          <div className="space-y-1 text-xs text-gray-500">
            <p>
              <strong>Consignor:</strong> consignor / password123
            </p>
            <p>
              <strong>Transporter:</strong> transporter / password123
            </p>
            <p>
              <strong>Driver:</strong> driver / password123
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>
            &copy; 2025 Transportation Management System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
