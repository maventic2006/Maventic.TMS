import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import TMSHeader from '../components/layout/TMSHeader';
import ApprovalTopActionBar from '../components/approval/ApprovalTopActionBar';
import ApprovalFilterPanel from '../components/approval/ApprovalFilterPanel';
import ApprovalListTable from '../components/approval/ApprovalListTable';
import RejectRemarksModal from '../components/approval/RejectRemarksModal';
import { addToast } from '../redux/slices/uiSlice';
import { TOAST_TYPES } from '../utils/constants';
import { getPageTheme } from '../theme.config';
import {
  fetchApprovals,
  fetchApprovalMasterData,
  approveRequest,
  rejectRequest,
  sendBackRequest,
  setFilters,
  clearFilters,
  clearActionError
} from '../redux/slices/approvalSlice';

/**
 * SuperAdminApprovalList Page
 * 
 * Main page for Super Admin approval management.
 * Features:
 * - Approval list with filters (Request Type, Date Range, Status)
 * - Row-level action buttons (Approve, Reject, Send Back)
 * - Mandatory remarks validation for Reject/Send Back
 * - Auto-refresh after actions
 * - Toast notifications for success/error
 * - Consistent with Vehicle Maintenance design
 */
const SuperAdminApprovalList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux state
  const {
    approvals,
    masterData,
    pagination,
    filters,
    isFetching,
    isApproving,
    isRejecting,
    isSendingBack,
    actionError
  } = useSelector((state) => state.approval);

  // Local state
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedApprovalId, setSelectedApprovalId] = useState(null);
  const [modalActionType, setModalActionType] = useState('reject'); // 'reject' or 'sendBack'

  // Get theme
  const theme = getPageTheme('list');

  // Fetch data on mount and filter changes
  useEffect(() => {
    dispatch(fetchApprovalMasterData());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchApprovals({
      page: pagination.page,
      limit: pagination.limit,
      filters
    }));
  }, [dispatch, filters, pagination.page, pagination.limit]);

  // Handle action error
  useEffect(() => {
    if (actionError) {
      dispatch(addToast({
        type: TOAST_TYPES.ERROR,
        message: actionError
      }));
      dispatch(clearActionError());
    }
  }, [actionError, dispatch]);

  // Fetch approvals
  const handleFetchApprovals = () => {
    dispatch(fetchApprovals({
      page: pagination.page,
      limit: pagination.limit,
      filters
    }));
  };

  // Handle filter change
  const handleFilterChange = (newFilters) => {
    dispatch(setFilters(newFilters));
  };

  // Handle apply filters
  const handleApplyFilters = () => {
    handleFetchApprovals();
    dispatch(addToast({
      type: TOAST_TYPES.INFO,
      message: 'Filters applied'
    }));
  };

  // Handle clear filters
  const handleClearFilters = () => {
    dispatch(clearFilters());
    dispatch(addToast({
      type: TOAST_TYPES.INFO,
      message: 'Filters cleared'
    }));
  };

  // Handle toggle filters
  const handleToggleFilters = () => {
    setIsFiltersVisible(!isFiltersVisible);
  };

  // Handle refresh
  const handleRefresh = () => {
    handleFetchApprovals();
    dispatch(addToast({
      type: TOAST_TYPES.INFO,
      message: 'Data refreshed'
    }));
  };

  // Handle approve
  const handleApprove = async (approvalId) => {
    try {
      const result = await dispatch(approveRequest(approvalId)).unwrap();
      dispatch(addToast({
        type: TOAST_TYPES.SUCCESS,
        message: result.message || 'Request approved successfully'
      }));
      handleFetchApprovals(); // Refresh list
    } catch (error) {
      dispatch(addToast({
        type: TOAST_TYPES.ERROR,
        message: error.message || 'Failed to approve request'
      }));
    }
  };

  // Handle reject (open modal)
  const handleReject = (approvalId) => {
    setSelectedApprovalId(approvalId);
    setModalActionType('reject');
    setIsRejectModalOpen(true);
  };

  // Handle send back (open modal)
  const handleSendBack = (approvalId) => {
    setSelectedApprovalId(approvalId);
    setModalActionType('sendBack');
    setIsRejectModalOpen(true);
  };

  // Handle confirm reject (from modal)
  const handleConfirmReject = async (remarks) => {
    try {
      const result = await dispatch(rejectRequest({
        approvalId: selectedApprovalId,
        remarks
      })).unwrap();

      dispatch(addToast({
        type: TOAST_TYPES.SUCCESS,
        message: result.message || 'Request rejected successfully'
      }));
      setIsRejectModalOpen(false);
      handleFetchApprovals(); // Refresh list
    } catch (error) {
      dispatch(addToast({
        type: TOAST_TYPES.ERROR,
        message: error.message || 'Failed to reject request'
      }));
    }
  };

  // Handle confirm send back (from modal)
  const handleConfirmSendBack = async (remarks) => {
    try {
      const result = await dispatch(sendBackRequest({
        approvalId: selectedApprovalId,
        remarks
      })).unwrap();

      dispatch(addToast({
        type: TOAST_TYPES.SUCCESS,
        message: result.message || 'Request sent back successfully'
      }));
      setIsRejectModalOpen(false);
      handleFetchApprovals(); // Refresh list
    } catch (error) {
      dispatch(addToast({
        type: TOAST_TYPES.ERROR,
        message: error.message || 'Failed to send back request'
      }));
    }
  };

  // Handle close modal
  const handleCloseModal = () => {
    setIsRejectModalOpen(false);
    setSelectedApprovalId(null);
  };

  // Handle back navigation
  const handleBack = () => {
    navigate('/tms-portal');
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* TMS Header - Same as Vehicle Maintenance */}
      <TMSHeader theme={theme} />
      
      {/* Main Content Container - Same structure as Vehicle Maintenance */}
      <div className="max-w-7xl mx-auto px-2 lg:px-6 space-y-4">
        {/* Top Action Bar */}
        <ApprovalTopActionBar
          totalCount={pagination.total}
          isFiltersVisible={isFiltersVisible}
          onToggleFilters={handleToggleFilters}
          onRefresh={handleRefresh}
          isLoading={isFetching}
          onBack={handleBack}
        />

        {/* Filter Panel */}
        <ApprovalFilterPanel
          isVisible={isFiltersVisible}
          filters={filters}
          onFilterChange={handleFilterChange}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
          approvalTypes={masterData.approvalTypes}
        />

        {/* Approval List Table */}
        <ApprovalListTable
          approvals={approvals}
          isLoading={isFetching}
          onApprove={handleApprove}
          onReject={handleReject}
          onSendBack={handleSendBack}
          isApproving={isApproving}
          isRejecting={isRejecting}
          isSendingBack={isSendingBack}
        />

        {/* Error Display - Same as Vehicle Maintenance */}
        {actionError && (
          <div
            className="bg-[#FEE2E2] border border-[#EF4444] rounded-xl p-6 text-[#EF4444]"
            style={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)" }}
          >
            <p className="font-semibold text-sm">Error loading approvals:</p>
            <p className="text-sm mt-1">{actionError}</p>
          </div>
        )}
      </div>

      {/* Reject/Send Back Remarks Modal */}
      <RejectRemarksModal
        isOpen={isRejectModalOpen}
        onClose={handleCloseModal}
        onConfirmReject={handleConfirmReject}
        onConfirmSendBack={handleConfirmSendBack}
        actionType={modalActionType}
        isSubmitting={isRejecting || isSendingBack}
      />
    </div>
  );
};

export default SuperAdminApprovalList;
