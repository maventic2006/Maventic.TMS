import React from "react";
import { useSelector } from "react-redux";
import ApprovalActionBar from "../approval/ApprovalActionBar";

/**
 * WarehouseApprovalActionBar Component
 * Wrapper around generic ApprovalActionBar for warehouse-specific approval logic
 * Maps warehouse approval status to the format expected by ApprovalActionBar
 */
const WarehouseApprovalActionBar = ({ warehouseId }) => {
  const { userApprovalStatus } = useSelector((state) => state.warehouse);

  // If no user approval status, don't render anything
  if (!userApprovalStatus) {
    return null;
  }

  // Map warehouse approval status to expected format
  const mappedApprovalStatus = {
    userId: userApprovalStatus.userId,
    userStatus: userApprovalStatus.userStatus,
    currentApprovalStatus:
      userApprovalStatus.approvalStatus || userApprovalStatus.userStatus,
    pendingWith: userApprovalStatus.pendingWithName,
    pendingWithUserId: userApprovalStatus.pendingWithUserId,
    createdByUserId: userApprovalStatus.createdByUserId,
    createdByName: userApprovalStatus.createdByName,
  };

  return (
    <ApprovalActionBar
      userApprovalStatus={mappedApprovalStatus}
      transporterId={warehouseId} // Using same prop name for compatibility
    />
  );
};

export default WarehouseApprovalActionBar;
