import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import draftService from "../utils/draftService";

/**
 * useSaveAsDraft Hook
 *
 * Manages save-as-draft functionality including modal state, API calls,
 * and navigation handling. Works with useFormDirtyTracking for complete
 * draft management.
 *
 * Features:
 * - Modal state management
 * - Draft save/update API integration
 * - Navigation control after save/discard
 * - Toast notifications
 * - Loading states
 * - Error handling
 *
 * @param {string} module - Module name (transporter, driver, warehouse, etc.)
 * @param {object} formData - Current form data to save
 * @param {boolean} isDirty - Whether form has unsaved changes
 * @param {string} recordId - Record ID for update mode (optional)
 * @param {function} onSuccess - Callback after successful save (optional)
 * @param {function} onError - Callback after error (optional)
 * @returns {object} - Modal controls and action handlers
 *
 * Usage Example:
 * `javascript
 * const {
 *   showModal,
 *   setShowModal,
 *   handleSaveDraft,
 *   handleDiscard,
 *   isLoading,
 *   setPendingNavigation,
 * } = useSaveAsDraft('transporter', formData, isDirty);
 *
 * // When user tries to navigate away
 * if (isDirty) {
 *   setPendingNavigation('/transporter');
 *   setShowModal(true);
 * }
 * `
 */
export const useSaveAsDraft = (
  module,
  formData,
  isDirty,
  recordId = null,
  onSuccess = null,
  onError = null
) => {
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handle save as draft action
   * Saves form data to backend and navigates to pending destination
   */
  const handleSaveDraft = useCallback(async () => {
    setIsLoading(true);

    try {
      let result;

      // Determine if this is create or update
      if (recordId) {
        // Update existing draft
        result = await draftService.updateDraft(module, recordId, formData);
      } else {
        // Create new draft
        result = await draftService.saveDraft(module, formData);
      }

      if (result.success) {
        // Show success toast
        if (window.showToast) {
          window.showToast({
            type: "success",
            message: recordId
              ? "Draft updated successfully"
              : "Draft saved successfully",
          });
        }

        // Call success callback if provided
        if (onSuccess) {
          onSuccess(result.data);
        }

        // Navigate to pending destination or default list page
        const destination = pendingNavigation || "/";
        navigate(destination);
      } else {
        // Handle error
        if (window.showToast) {
          window.showToast({
            type: "error",
            message: result.error?.message || "Failed to save draft",
          });
        }

        // Call error callback if provided
        if (onError) {
          onError(result.error);
        }
      }
    } catch (error) {
      console.error("[useSaveAsDraft] Unexpected error:", error);

      if (window.showToast) {
        window.showToast({
          type: "error",
          message: "An unexpected error occurred while saving draft",
        });
      }

      if (onError) {
        onError({ code: "UNEXPECTED_ERROR", message: error.message });
      }
    } finally {
      setIsLoading(false);
      setShowModal(false);
      setPendingNavigation(null);
    }
  }, [
    module,
    formData,
    recordId,
    pendingNavigation,
    navigate,
    onSuccess,
    onError,
  ]);

  /**
   * Handle discard changes action
   * Navigates away without saving
   */
  const handleDiscard = useCallback(() => {
    // Navigate to pending destination or default list page
    const destination = pendingNavigation || "/";
    navigate(destination);

    setShowModal(false);
    setPendingNavigation(null);
  }, [module, pendingNavigation, navigate]);

  /**
   * Handle cancel action
   * Closes modal and stays on current page
   */
  const handleCancel = useCallback(() => {
    setShowModal(false);
    setPendingNavigation(null);
  }, []);

  /**
   * Show save-as-draft modal with navigation destination
   * @param {string} destination - Where to navigate after save/discard
   */
  const showSaveAsDraftModal = useCallback((destination) => {
    setPendingNavigation(destination);
    setShowModal(true);
  }, []);

  return {
    // Modal state
    showModal,
    setShowModal,

    // Navigation state
    pendingNavigation,
    setPendingNavigation,

    // Action handlers
    handleSaveDraft,
    handleDiscard,
    handleCancel,

    // Helper function
    showSaveAsDraftModal,

    // Loading state
    isLoading,
  };
};

export default useSaveAsDraft;
