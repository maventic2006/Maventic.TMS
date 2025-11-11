import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Clock, X } from "lucide-react";
import { getPageTheme, getComponentTheme } from "../../theme.config";

const SessionExpiryWarningModal = ({
  isOpen,
  onClose,
  onExtendSession,
  secondsRemaining,
}) => {
  const theme = getPageTheme("general");
  const buttonTheme = getComponentTheme("actionButton");

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md mx-4 rounded-xl shadow-lg"
            style={{ backgroundColor: theme.colors.card.background }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{
                borderColor: theme.colors.border.default,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="p-2 rounded-lg"
                  style={{
                    backgroundColor: "#FEF3C7",
                    color: "#F59E0B",
                  }}
                >
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h2
                  className="text-lg font-semibold"
                  style={{ color: theme.colors.text.primary }}
                >
                  Session Expiring Soon
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg transition-colors hover:opacity-70"
                style={{
                  color: theme.colors.text.secondary,
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              {/* Time Remaining Display */}
              <div className="flex flex-col items-center justify-center mb-6">
                <div
                  className="p-4 rounded-full mb-4"
                  style={{
                    backgroundColor: "#FEF3C7",
                  }}
                >
                  <Clock className="w-8 h-8" style={{ color: "#F59E0B" }} />
                </div>
                <p
                  className="text-sm text-center mb-2"
                  style={{ color: theme.colors.text.secondary }}
                >
                  Your session will expire in:
                </p>
                <div
                  className="text-4xl font-bold tabular-nums"
                  style={{ color: "#F59E0B" }}
                >
                  {String(minutes).padStart(2, "0")}:
                  {String(seconds).padStart(2, "0")}
                </div>
              </div>

              {/* Message */}
              <p
                className="text-sm text-center mb-6"
                style={{ color: theme.colors.text.secondary }}
              >
                Due to inactivity, you will be automatically logged out. Click
                "Stay Logged In" to continue your session.
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-lg font-medium transition-all hover:opacity-90"
                  style={{
                    backgroundColor: theme.colors.card.hover,
                    color: theme.colors.text.primary,
                    border: `1px solid ${theme.colors.border.default}`,
                  }}
                >
                  Logout Now
                </button>
                <button
                  onClick={onExtendSession}
                  className="flex-1 px-4 py-2.5 rounded-lg font-medium transition-all hover:opacity-90"
                  style={{
                    backgroundColor: buttonTheme.primary.background,
                    color: buttonTheme.primary.text,
                  }}
                >
                  Stay Logged In
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SessionExpiryWarningModal;
