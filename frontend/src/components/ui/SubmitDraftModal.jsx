import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, CheckCircle, X, AlertCircle } from "lucide-react";
import { Button } from "./Button";

/**
 * SubmitDraftModal Component
 *
 * Modal dialog that appears when user tries to submit changes on a draft transporter.
 * Provides options to update draft (keep as draft) or submit for approval (change to PENDING).
 *
 * Features:
 * - Framer Motion animations (fade in, slide up)
 * - Loading state support
 * - Keyboard shortcuts (ESC to close)
 * - Backdrop click to close
 * - Accessible ARIA labels
 * - Theme-compliant styling
 * - Two action buttons: Update Draft (minimal validation) and Submit for Approval (full validation)
 *
 * Props:
 * @param {boolean} isOpen - Whether modal is visible
 * @param {function} onUpdateDraft - Called when user clicks \Update Draft\
 * @param {function} onSubmitForApproval - Called when user clicks \Submit for Approval\
 * @param {function} onCancel - Called when user closes modal (ESC, backdrop, X button)
 * @param {boolean} isLoading - Shows loading state on buttons
 * @param {string} title - Modal title (default: \Submit Changes\)
 * @param {string} message - Modal message
 *
 * Usage Example:
 * `javascript
 * <SubmitDraftModal
 * isOpen={showModal}
 * onUpdateDraft={handleUpdateDraft}
 * onSubmitForApproval={handleSubmitForApproval}
 * onCancel={() => setShowModal(false)}
 * isLoading={isLoading}
 * />
 * `
 */
const SubmitDraftModal = ({
  isOpen,
  onUpdateDraft,
  onSubmitForApproval,
  onCancel,
  isLoading = false,
  title = "Submit Changes",
  message = "Would you like to update the draft or submit it for approval?",
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
              aria-labelledby="submit-draft-modal-title"
              aria-describedby="submit-draft-modal-description"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between px-6 py-5 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2
                    id="submit-draft-modal-title"
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
                  id="submit-draft-modal-description"
                  className="text-base text-gray-700 leading-relaxed mb-4"
                >
                  {message}
                </p>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <Save className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-900">
                        Update Draft:
                      </span>{" "}
                      Save your changes with minimal validation. The transporter
                      will remain in draft status.
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-900">
                        Submit for Approval:
                      </span>{" "}
                      Complete validation will be performed. The transporter
                      status will change to PENDING for approval.
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer - Action Buttons */}
              <div className="flex items-center justify-end gap-3 px-6 py-5 bg-gray-50 rounded-b-2xl">
                {/* Update Draft Button */}
                <Button
                  variant="outline"
                  onClick={onUpdateDraft}
                  disabled={isLoading}
                  className="flex items-center gap-2 text-amber-600 border-amber-200 hover:bg-amber-50 hover:border-amber-300"
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
                        className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full"
                      />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Update Draft
                    </>
                  )}
                </Button>

                {/* Submit for Approval Button */}
                <Button
                  variant="primary"
                  onClick={onSubmitForApproval}
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
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Submit for Approval
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

export default SubmitDraftModal;
