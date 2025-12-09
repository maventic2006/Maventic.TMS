import { motion } from 'framer-motion';
import { CheckCircle, XCircle, RotateCcw, Calendar, User, FileText, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ApprovalStatusPill from './ApprovalStatusPill';

/**
 * ApprovalListTable Component
 * 
 * Displays approval requests in a table with action buttons.
 * Features:
 * - Row-level Approve/Reject/Send Back buttons
 * - Conditional remarks display
 * - Loading and empty states
 * - Smooth animations with stagger effect
 * - Accessible design
 * 
 * @param {Array} approvals - Array of approval objects
 * @param {boolean} isLoading - Loading state
 * @param {function} onApprove - Approve button callback (receives approvalId)
 * @param {function} onReject - Reject button callback (receives approvalId)
 * @param {function} onSendBack - Send back button callback (receives approvalId)
 * @param {boolean} isApproving - Approve action loading state
 * @param {boolean} isRejecting - Reject action loading state
 * @param {boolean} isSendingBack - Send back action loading state
 */
const ApprovalListTable = ({
  approvals = [],
  isLoading,
  onApprove,
  onReject,
  onSendBack,
  isApproving,
  isRejecting,
  isSendingBack
}) => {
  const navigate = useNavigate();

  // Get navigation path based on entity type and entity ID
  const getNavigationPath = (entityType, entityId) => {
    if (!entityType || !entityId) return null;

    const entityTypeMap = {
      'Transporter Admin': `/transporter/${entityId}`, // Navigate to transporter details
      'Consignor Admin': `/consignor/details/${entityId}`,     // Navigate to consignor details  
      'Driver User': `/driver/${entityId}`,            // Navigate to driver details
      'Vehicle Owner': `/vehicle/${entityId}`,         // Navigate to vehicle details
      'Warehouse Admin': `/warehouse/${entityId}`      // Navigate to warehouse details
    };

    return entityTypeMap[entityType] || null;
  };

  // Handle click on Request ID to navigate to details page
  const handleEntityNavigation = (entityType, entityId) => {
    const path = getNavigationPath(entityType, entityId);
    if (path) {
      navigate(path);
    } else {
      console.warn('No navigation path found for:', entityType, entityId);
    }
  };
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading approvals...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!approvals || approvals.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm overflow-hidden"
      >
        <div className="p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Approvals Found</h3>
          <p className="text-gray-600">
            There are no approval requests matching your current filters.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Table Header */}
          <thead className="bg-[#0D1A33] border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                Request Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                Entity ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                Created On
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                Requestor
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                Remarks
              </th>
              <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-gray-200">
            {approvals.map((approval, index) => (
              <motion.tr
                key={approval.approvalId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className="hover:bg-gray-50 transition-colors"
              >
                {/* Request Type */}
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">
                      {approval.requestType || 'N/A'}
                    </span>
                  </div>
                </td>

                {/* Entity ID - Clickable for navigation to entity details page */}
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleEntityNavigation(approval.entityType, approval.entityId)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-mono underline transition-colors duration-200 flex items-center group"
                    title={`View ${approval.entityType} details for ${approval.entityId || approval.requestId}`}
                  >
                    <span className="mr-1">{approval.entityId || approval.requestId || 'N/A'}</span>
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </td>

                {/* Created On */}
                <td className="px-6 py-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    {formatDate(approval.requestCreatedOn)}
                  </div>
                </td>

                {/* Requestor */}
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-gray-400 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {approval.requestorName || 'Unknown'}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {approval.requestorId || 'N/A'}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  <ApprovalStatusPill status={approval.status} />
                </td>

                {/* Remarks (conditional) */}
                <td className="px-6 py-4">
                  {approval.remarks ? (
                    <div className="text-sm text-gray-600 max-w-xs truncate" title={approval.remarks}>
                      {approval.remarks}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400 italic">No remarks</span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  {approval.status === 'PENDING' ? (
                    <div className="flex items-center justify-center space-x-2">
                      {/* Approve Button */}
                      <button
                        onClick={() => onApprove?.(approval.approvalId)}
                        disabled={isApproving || isRejecting || isSendingBack}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Approve"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>

                      {/* Reject Button */}
                      <button
                        onClick={() => onReject?.(approval.approvalId)}
                        disabled={isApproving || isRejecting || isSendingBack}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Reject"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>

                      {/* Send Back Button */}
                      <button
                        onClick={() => onSendBack?.(approval.approvalId)}
                        disabled={isApproving || isRejecting || isSendingBack}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Send Back"
                      >
                        <RotateCcw className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      {approval.status === 'Approve' && (
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Completed
                        </span>
                      )}
                      {approval.status === 'Sent Back' && (
                        <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          Rejected
                        </span>
                      )}
                      {!['Approve', 'Sent Back'].includes(approval.status) && (
                        <span className="text-xs text-gray-400 italic">
                          No actions available
                        </span>
                      )}
                    </div>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApprovalListTable;
