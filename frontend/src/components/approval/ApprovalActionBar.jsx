import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Clock, MessageSquare, X } from "lucide-react";
import { approveUser, rejectUser } from "../../redux/slices/approvalSlice";
import { addToast } from "../../redux/slices/uiSlice";
import { TOAST_TYPES } from "../../utils/constants";

/**
 * ApprovalActionBar Component
 * Displays approval status and action buttons (Approve/Reject) for Transporter Admin users
 * Only visible to Product Owners who did NOT create the transporter
 */
const ApprovalActionBar = ({ userApprovalStatus, transporterId, onRefreshData }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { isApproving, isRejecting } = useSelector((state) => state.approval);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectRemarks, setRejectRemarks] = useState("");

  // If no user approval status, don't render anything
  if (!userApprovalStatus) {
    return null;
  }

  const {
    userId,
    userStatus,
    currentApprovalStatus,
    pendingWith,
    pendingWithUserId,
  } = userApprovalStatus;

  // Check if current user is the assigned approver
  const isAssignedApprover = user?.user_id === pendingWithUserId;

  // Only show approval actions if status is pending and user is assigned approver
  const showApprovalActions =
    currentApprovalStatus === "Pending for Approval" && isAssignedApprover;

  // Determine status badge color and icon
  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending for Approval":
        return {
          color: "bg-yellow-100 text-yellow-800 border-yellow-300",
          icon: Clock,
          text: "Pending Approval",
        };
      case "Active":
      case "Approve":
        return {
          color: "bg-green-100 text-green-800 border-green-300",
          icon: CheckCircle,
          text: "Approved",
        };
      case "Sent Back":
        return {
          color: "bg-red-100 text-red-800 border-red-300",
          icon: XCircle,
          text: "Rejected",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-300",
          icon: Clock,
          text: status,
        };
    }
  };

  const statusBadge = getStatusBadge(currentApprovalStatus);
  const StatusIcon = statusBadge.icon;

  // Handle Approve Action
  const handleApprove = async () => {
    try {
      const result = await dispatch(
        approveUser({ userId, remarks: "Approved by Product Owner" })
      ).unwrap();

      dispatch(
        addToast({
          type: TOAST_TYPES.SUCCESS,
          message: "User approved successfully",
        })
      );

      // Refresh data to show updated status (instead of page reload)
      if (onRefreshData) {
        onRefreshData();
      }
    } catch (error) {
      dispatch(
        addToast({
          type: TOAST_TYPES.ERROR,
          message: error || "Failed to approve user",
        })
      );
    }
  };

  // Handle Reject Action
  const handleReject = async () => {
    if (!rejectRemarks.trim()) {
      dispatch(
        addToast({
          type: TOAST_TYPES.ERROR,
          message: "Please provide remarks for rejection",
        })
      );
      return;
    }

    try {
      const result = await dispatch(
        rejectUser({ userId, remarks: rejectRemarks })
      ).unwrap();

      dispatch(
        addToast({
          type: TOAST_TYPES.SUCCESS,
          message: "User rejected successfully",
        })
      );

      setShowRejectModal(false);
      setRejectRemarks("");

      // Refresh data to show updated status (instead of page reload)
      if (onRefreshData) {
        onRefreshData();
      }
    } catch (error) {
      dispatch(
        addToast({
          type: TOAST_TYPES.ERROR,
          message: error || "Failed to reject user",
        })
      );
    }
  };

  return (
    <>
      {/* Approval Status Badge and Actions */}
      <div className="flex items-center gap-3">
        {/* Status Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-medium text-sm ${statusBadge.color}`}
        >
          <StatusIcon className="w-4 h-4" />
          <span>{statusBadge.text}</span>
        </motion.div>

        {/* Pending With Info (only if pending) */}
        {currentApprovalStatus === "Pending for Approval" && pendingWith && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="text-sm text-blue-100/80"
          >
            Pending with:{" "}
            <span className="font-semibold text-white">{pendingWith}</span>
          </motion.div>
        )}

        {/* Approval Action Buttons (only if user is assigned approver) */}
        {showApprovalActions && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="flex items-center gap-2"
          >
            {/* Approve Button */}
            <button
              onClick={handleApprove}
              disabled={isApproving}
              className="group inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#10B981] to-[#059669] text-white rounded-xl font-medium text-sm hover:from-[#059669] hover:to-[#10B981] transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isApproving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                  Approve User
                </>
              )}
            </button>

            {/* Reject Button */}
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={isRejecting}
              className="group inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#EF4444] to-[#DC2626] text-white rounded-xl font-medium text-sm hover:from-[#DC2626] hover:to-[#EF4444] transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isRejecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                  Reject User
                </>
              )}
            </button>
          </motion.div>
        )}
      </div>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowRejectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-[#EF4444] to-[#DC2626] px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-6 h-6 text-white" />
                  <h3 className="text-lg font-bold text-white">
                    Reject User Approval
                  </h3>
                </div>
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                <p className="text-sm text-gray-600">
                  Please provide a reason for rejecting this user. This will be
                  sent to the creator for review.
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Remarks <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={rejectRemarks}
                    onChange={(e) => setRejectRemarks(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#EF4444] focus:outline-none transition-colors resize-none"
                    placeholder="Enter reason for rejection..."
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectRemarks("");
                  }}
                  className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectRemarks.trim() || isRejecting}
                  className="px-5 py-2 bg-gradient-to-r from-[#EF4444] to-[#DC2626] text-white rounded-xl font-medium text-sm hover:from-[#DC2626] hover:to-[#EF4444] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRejecting ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ApprovalActionBar;
