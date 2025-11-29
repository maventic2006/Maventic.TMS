import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Trash2, X, AlertCircle } from "lucide-react";
import { Button } from "./Button";

/**
 * SaveAsDraftModal Component
 *
 * Modal dialog that appears when user tries to navigate away from a form
 * with unsaved changes. Provides options to save as draft or discard changes.
 *
 * Features:
 * - Framer Motion animations (fade in, slide up)
 * - Loading state support
 * - Keyboard shortcuts (ESC to close)
 * - Backdrop click to close
 * - Accessible ARIA labels
 * - Theme-compliant styling
 *
 * Props:
 * @param {boolean} isOpen - Whether modal is visible
 * @param {function} onSaveDraft - Called when user clicks "Save as Draft"
 * @param {function} onDiscard - Called when user clicks "Discard Changes"
 * @param {function} onCancel - Called when user closes modal (ESC, backdrop, X button)
 * @param {boolean} isLoading - Shows loading state on buttons
 * @param {string} title - Modal title (default: "Unsaved Changes")
 * @param {string} message - Modal message (default: standard message)
 * @param {boolean} isUpdate - Whether updating existing draft (changes button text)
 *
 * Usage Example:
 * `javascript
 * <SaveAsDraftModal
 *   isOpen={showModal}
 *   onSaveDraft={handleSaveDraft}
 *   onDiscard={handleDiscard}
 *   onCancel={() => setShowModal(false)}
 *   isLoading={isLoading}
 * />
 * `
 */
const SaveAsDraftModal = ({
  isOpen,
  onSaveDraft,
  onDiscard,
  onCancel,
  isLoading = false,
  title = "Unsaved Changes",
  message = "You have unsaved changes. Would you like to save them as a draft before leaving?",
  isUpdate = false,
}) => {
  // Handle ESC key press
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, isLoading, onCancel]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={!isLoading ? onCancel : undefined}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md"
              role="dialog"
              aria-modal="true"
              aria-labelledby="save-draft-modal-title"
              aria-describedby="save-draft-modal-description"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between px-6 py-5 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  </div>
                  <h2
                    id="save-draft-modal-title"
                    className="text-xl font-bold text-gray-900"
                  >
                    {title}
                  </h2>
                </div>
                <button
                  onClick={onCancel}
                  disabled={isLoading}
                  className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5">
                <p
                  id="save-draft-modal-description"
                  className="text-base text-gray-700 leading-relaxed"
                >
                  {message}
                </p>
              </div>

              {/* Footer - Action Buttons */}
              <div className="flex items-center justify-end gap-3 px-6 py-5 bg-gray-50 rounded-b-2xl">
                {/* Discard Changes Button */}
                <Button
                  variant="outline"
                  onClick={onDiscard}
                  disabled={isLoading}
                  className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                  Discard Changes
                </Button>

                {/* Save as Draft Button */}
                <Button
                  variant="primary"
                  onClick={onSaveDraft}
                  disabled={isLoading}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {isUpdate ? "Update Draft" : "Save as Draft"}
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SaveAsDraftModal;
