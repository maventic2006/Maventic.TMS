import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, Eye, EyeOff, Check, X, CheckCircle } from "lucide-react";
import {
  resetPassword,
  logoutUser,
  clearError,
  setPasswordReset,
} from "../../redux/slices/authSlice";

// Password validation schema with industry standards
const passwordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/\d/, "Password must contain at least one number")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const ResetPasswordPage = () => {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasLowercase: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userId } = useParams();
  const { isLoading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword");
  const confirmPassword = watch("confirmPassword");

  // Real-time password validation
  useEffect(() => {
    if (newPassword) {
      setPasswordRequirements({
        minLength: newPassword.length >= 8,
        hasLowercase: /[a-z]/.test(newPassword),
        hasUppercase: /[A-Z]/.test(newPassword),
        hasNumber: /\d/.test(newPassword),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
      });
    }
  }, [newPassword]);

  // Clear errors on component mount
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Success modal countdown and redirect
  useEffect(() => {
    if (showSuccessModal && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (showSuccessModal && countdown === 0) {
      handleLogoutAndRedirect();
    }
  }, [showSuccessModal, countdown]);

  const onSubmit = async (data) => {
    try {
      await dispatch(
        resetPassword({
          userId: userId,
          newPassword: data.newPassword,
        })
      ).unwrap();

      // Mark password as reset and show success modal
      dispatch(setPasswordReset(true));
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Password reset error:", error);
    }
  };

  const handleLogoutAndRedirect = async () => {
    try {
      // Clear authentication state and navigate to login
      await dispatch(logoutUser());
      // Clear password reset flag for fresh login
      dispatch(setPasswordReset(false));
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/login", { replace: true });
    }
  };

  const getPasswordStrength = () => {
    const requirements = Object.values(passwordRequirements);
    const metRequirements = requirements.filter(Boolean).length;

    if (metRequirements < 2) return { text: "Weak", color: "text-red-500" };
    if (metRequirements < 4)
      return { text: "Medium", color: "text-yellow-500" };
    return { text: "Strong", color: "text-green-500" };
  };

  const isFormValid = () => {
    return (
      Object.values(passwordRequirements).every(Boolean) &&
      newPassword === confirmPassword &&
      newPassword.length > 0
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#0D1A33] rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#0D1A33] mb-2">
            Reset Password
          </h1>
          <p className="text-[#4A5568]">Create your new secure password</p>
        </div>

        {/* Reset Password Form */}
        <div className="bg-white rounded-xl shadow-[0px_2px_6px_rgba(0,0,0,0.05)] p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* New Password Field */}
            <div>
              <label className="block text-sm font-medium text-[#0D1A33] mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#4A5568]" />
                </div>
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  className="w-full pl-10 pr-12 py-3 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] focus:outline-none transition-all duration-200"
                  {...register("newPassword")}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-5 w-5 text-[#4A5568] hover:text-[#0D1A33]" />
                  ) : (
                    <Eye className="h-5 w-5 text-[#4A5568] hover:text-[#0D1A33]" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            {/* Password Requirements */}
            {newPassword && (
              <div className="bg-[#F5F7FA] rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-[#0D1A33]">
                    Password Strength:
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      getPasswordStrength().color
                    }`}
                  >
                    {getPasswordStrength().text}
                  </span>
                </div>
                <div className="space-y-2">
                  {[
                    { key: "minLength", text: "At least 8 characters" },
                    { key: "hasLowercase", text: "One lowercase letter" },
                    { key: "hasUppercase", text: "One uppercase letter" },
                    { key: "hasNumber", text: "One number" },
                    { key: "hasSpecialChar", text: "One special character" },
                  ].map(({ key, text }) => (
                    <div key={key} className="flex items-center space-x-2">
                      {passwordRequirements[key] ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-gray-400" />
                      )}
                      <span
                        className={`text-sm ${
                          passwordRequirements[key]
                            ? "text-green-600"
                            : "text-[#4A5568]"
                        }`}
                      >
                        {text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-[#0D1A33] mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#4A5568]" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:outline-none transition-all duration-200 ${
                    confirmPassword && newPassword === confirmPassword
                      ? "border-green-500 focus:border-green-500"
                      : confirmPassword && newPassword !== confirmPassword
                      ? "border-red-500 focus:border-red-500"
                      : "border-[#E5E7EB] focus:border-[#3B82F6]"
                  }`}
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-[#4A5568] hover:text-[#0D1A33]" />
                  ) : (
                    <Eye className="h-5 w-5 text-[#4A5568] hover:text-[#0D1A33]" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
              {confirmPassword && newPassword === confirmPassword && (
                <p className="mt-1 text-sm text-green-600 flex items-center">
                  <Check className="h-4 w-4 mr-1" />
                  Passwords match
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                {error}
              </div>
            )}

            {/* Reset Password Button */}
            <button
              type="submit"
              disabled={isLoading || !isFormValid()}
              className="w-full py-3 px-4 bg-[#FFA500] text-white font-medium rounded-lg hover:bg-[#FF8C00] focus:outline-none focus:ring-2 focus:ring-[#FFA500] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? "Resetting Password..." : "Reset Password"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-[#4A5568]">
          <p>
            &copy; 2025 Transportation Management System. All rights reserved.
          </p>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full animate-fadeIn">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-[#0D1A33] mb-2">
                Password Reset Successfully!
              </h2>
              <p className="text-[#4A5568] mb-6">
                You can now sign in with your new password
              </p>
              <p className="text-sm text-[#4A5568]">
                Redirecting to sign in page in{" "}
                <span className="font-semibold text-[#FFA500]">
                  {countdown}
                </span>
                ...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResetPasswordPage;
