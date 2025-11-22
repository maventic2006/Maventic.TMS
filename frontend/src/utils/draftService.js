import api from "./api";

/**
 * Draft Service - Reusable API wrapper for save-as-draft functionality
 *
 * This service provides a consistent interface for draft operations across all modules.
 * It supports transporter, driver, warehouse, consignor, and any future modules.
 *
 * Usage Example:
 * `javascript
 * import { draftService } from '@/utils/draftService';
 *
 * // Save draft
 * const result = await draftService.saveDraft('transporter', formData);
 *
 * // Update draft
 * await draftService.updateDraft('driver', 'DRV0001', updatedData);
 *
 * // Delete draft
 * await draftService.deleteDraft('warehouse', 'WH0001');
 * `
 */

/**
 * Save a new draft record
 * @param {string} module - Module name (e.g., 'transporter', 'driver', 'warehouse')
 * @param {object} data - Form data to save as draft
 * @returns {Promise<object>} Response with success status and generated ID
 */
export const saveDraft = async (module, data) => {
  try {
    const response = await api.post(`/${module}/save-draft`, data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error(`[draftService] Error saving  draft:`, error);
    return {
      success: false,
      error: error.response?.data?.error || {
        code: "DRAFT_SAVE_FAILED",
        message: error.message || "Failed to save draft",
      },
    };
  }
};

/**
 * Update an existing draft record
 * @param {string} module - Module name (e.g., 'transporter', 'driver', 'warehouse')
 * @param {string} id - Record ID (e.g., 'TR0001', 'DRV0001')
 * @param {object} data - Updated form data
 * @returns {Promise<object>} Response with success status
 */
export const updateDraft = async (module, id, data) => {
  try {
    const response = await api.put(`/${module}/update-draft/${id}`, data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error(`[draftService] Error updating  draft:`, error);

    // Handle ownership errors (403 Forbidden)
    if (error.response?.status === 403) {
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You can only update your own drafts",
        },
      };
    }

    // Handle invalid status errors (400 Bad Request)
    if (error.response?.status === 400) {
      return {
        success: false,
        error: {
          code: "INVALID_STATUS",
          message: "Only drafts can be updated via this endpoint",
        },
      };
    }

    return {
      success: false,
      error: error.response?.data?.error || {
        code: "DRAFT_UPDATE_FAILED",
        message: error.message || "Failed to update draft",
      },
    };
  }
};

/**
 * Delete a draft record (hard delete)
 * @param {string} module - Module name (e.g., 'transporter', 'driver', 'warehouse')
 * @param {string} id - Record ID (e.g., 'TR0001', 'DRV0001')
 * @returns {Promise<object>} Response with success status
 */
export const deleteDraft = async (module, id) => {
  try {
    const response = await api.delete(`/${module}/delete-draft/${id}`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error(`[draftService] Error deleting  draft:`, error);

    // Handle ownership errors (403 Forbidden)
    if (error.response?.status === 403) {
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You can only delete your own drafts",
        },
      };
    }

    return {
      success: false,
      error: error.response?.data?.error || {
        code: "DRAFT_DELETE_FAILED",
        message: error.message || "Failed to delete draft",
      },
    };
  }
};

/**
 * Default export - all draft service functions
 */
export default {
  saveDraft,
  updateDraft,
  deleteDraft,
};
