import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';

/**
 * RejectRemarksModal Component
 * 
 * Modal for capturing mandatory remarks when rejecting or sending back an approval request.
 * Features:
 * - Mandatory remarks validation (min 10 characters)
 * - Real-time character count
 * - Separate confirm actions for Reject vs Send Back
 * - Smooth animations with framer-motion
 * - Accessible keyboard navigation
 * 
 * @param {boolean} isOpen - Modal visibility state
 * @param {function} onClose - Close modal callback
 * @param {function} onConfirmReject - Reject action callback (receives remarks)
 * @param {function} onConfirmSendBack - Send back action callback (receives remarks)
 * @param {string} actionType - 'reject' or 'sendBack'
 * @param {boolean} isSubmitting - Loading state during API call
 */
const RejectRemarksModal = ({
  isOpen,
  onClose,
  onConfirmReject,
  onConfirmSendBack,
  actionType = 'reject',
  isSubmitting = false
}) => {
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');

  const MIN_REMARKS_LENGTH = 10;

  // Handle remarks change with validation
  const handleRemarksChange = (e) => {
    const value = e.target.value;
    setRemarks(value);

    // Clear error if user starts typing
    if (error && value.trim().length >= MIN_REMARKS_LENGTH) {
      setError('');
    }
  };

  // Validate remarks
  const validateRemarks = () => {
    const trimmedRemarks = remarks.trim();
    
    if (trimmedRemarks.length === 0) {
      setError('Remarks are required');
      return false;
    }

    if (trimmedRemarks.length < MIN_REMARKS_LENGTH) {
      setError(`Remarks must be at least ${MIN_REMARKS_LENGTH} characters`);
      return false;
    }

    return true;
  };

  // Handle confirm action
  const handleConfirm = () => {
    if (!validateRemarks()) {
      return;
    }

    const trimmedRemarks = remarks.trim();

    if (actionType === 'reject') {
      onConfirmReject?.(trimmedRemarks);
    } else if (actionType === 'sendBack') {
      onConfirmSendBack?.(trimmedRemarks);
    }

    // Reset on success (parent will close modal)
    handleClose();
  };

  // Handle close modal
  const handleClose = () => {
    if (!isSubmitting) {
      setRemarks('');
      setError('');
      onClose();
    }
  };

  // Handle Escape key
  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && !isSubmitting) {
      handleClose();
    }
  };

  const modalTitle = actionType === 'reject' ? 'Reject Request' : 'Send Back Request';
  const confirmButtonText = actionType === 'reject' ? 'Confirm Rejection' : 'Send Back';
  const confirmButtonColor = actionType === 'reject' ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onKeyDown={handleKeyDown}
          >
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 relative">
              {/* Close Button */}
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="flex items-start space-x-3 mb-4">
                <div className={`p-2 rounded-full ${actionType === 'reject' ? 'bg-red-100' : 'bg-yellow-100'}`}>
                  <AlertCircle className={`w-6 h-6 ${actionType === 'reject' ? 'text-red-600' : 'text-yellow-600'}`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{modalTitle}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Please provide a reason for this action. This will be visible to the requestor.
                  </p>
                </div>
              </div>

              {/* Remarks Textarea */}
              <div className="mb-4">
                <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-2">
                  Remarks <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="remarks"
                  value={remarks}
                  onChange={handleRemarksChange}
                  disabled={isSubmitting}
                  placeholder="Enter your remarks here (minimum 10 characters)..."
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none ${
                    error
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  } disabled:bg-gray-50 disabled:cursor-not-allowed`}
                />

                {/* Character Count */}
                <div className="flex items-center justify-between mt-2">
                  <div className="text-xs text-gray-500">
                    {remarks.trim().length} / {MIN_REMARKS_LENGTH} characters minimum
                  </div>
                  <div className={`text-xs ${remarks.trim().length >= MIN_REMARKS_LENGTH ? 'text-green-600' : 'text-gray-400'}`}>
                    {remarks.trim().length >= MIN_REMARKS_LENGTH ? ' Valid' : 'Required'}
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-600 mt-2 flex items-center"
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {error}
                  </motion.p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isSubmitting || remarks.trim().length < MIN_REMARKS_LENGTH}
                  className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed ${confirmButtonColor}`}
                >
                  {isSubmitting ? 'Processing...' : confirmButtonText}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default RejectRemarksModal;
