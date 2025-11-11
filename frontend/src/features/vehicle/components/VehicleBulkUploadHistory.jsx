import React, { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  FileSpreadsheet,
  AlertCircle,
  Truck,
} from "lucide-react";
import Modal from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import {
  fetchVehicleUploadHistory,
  downloadVehicleErrorReport,
  closeVehicleHistoryModal,
} from "../../../redux/slices/vehicleBulkUploadSlice";

/**
 * Vehicle Bulk Upload History Modal Component
 * Displays upload history with pagination
 */
const VehicleBulkUploadHistory = () => {
  const dispatch = useDispatch();
  const {
    isHistoryModalOpen,
    uploadHistory,
    historyPagination,
    isFetchingHistory,
    isDownloadingErrorReport,
  } = useSelector((state) => state.vehicleBulkUpload);

  // Fetch history when modal opens
  useEffect(() => {
    if (isHistoryModalOpen) {
      dispatch(fetchVehicleUploadHistory({ page: 1, limit: 10 }));
    }
  }, [isHistoryModalOpen, dispatch]);

  // Close modal handler
  const handleClose = useCallback(() => {
    dispatch(closeVehicleHistoryModal());
  }, [dispatch]);

  // Download error report handler
  const handleDownloadError = useCallback(
    (batchId) => {
      dispatch(downloadVehicleErrorReport(batchId));
    },
    [dispatch]
  );

  // Page change handler
  const handlePageChange = useCallback(
    (page) => {
      dispatch(fetchVehicleUploadHistory({ page, limit: 10 }));
    },
    [dispatch]
  );

  // Get status badge component
  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: {
        icon: CheckCircle,
        text: "Completed",
        className: "bg-green-100 text-green-800 border-green-200",
      },
      processing: {
        icon: Loader2,
        text: "Processing",
        className: "bg-blue-100 text-blue-800 border-blue-200",
      },
      failed: {
        icon: XCircle,
        text: "Failed",
        className: "bg-red-100 text-red-800 border-red-200",
      },
    };

    const config = statusConfig[status] || statusConfig.processing;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.className}`}
      >
        <Icon
          className={`h-3 w-3 ${status === "processing" ? "animate-spin" : ""}`}
        />
        {config.text}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Modal footer
  const footer = (
    <Button variant="outline" onClick={handleClose}>
      Close
    </Button>
  );

  return (
    <Modal
      isOpen={isHistoryModalOpen}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-2">
          <Truck className="h-6 w-6 text-orange-600" />
          <span>Vehicle Bulk Upload History</span>
        </div>
      }
      size="xl"
      footer={footer}
    >
      {isFetchingHistory ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
          <span className="ml-3 text-gray-600">Loading history...</span>
        </div>
      ) : uploadHistory.length === 0 ? (
        <div className="text-center py-12">
          <FileSpreadsheet className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">No upload history found</p>
          <p className="text-sm text-gray-500 mt-2">
            Your vehicle bulk upload history will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* History Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Batch ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Filename
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Vehicles
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Results
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Uploaded At
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {uploadHistory.map((batch) => (
                  <tr
                    key={batch.batch_id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-xs font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                        {batch.batch_id}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-900 truncate max-w-xs">
                          {batch.filename}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {getStatusBadge(batch.status)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="flex items-center gap-2">
                          <Truck className="h-3 w-3 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {batch.total_rows || 0}
                          </span>
                          <span className="text-gray-400">total</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm space-y-1">
                        {batch.total_valid > 0 && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span className="text-green-600 font-medium">
                              {batch.total_valid}
                            </span>
                            <span className="text-gray-400">valid</span>
                          </div>
                        )}
                        {batch.total_invalid > 0 && (
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-3 w-3 text-red-600" />
                            <span className="text-red-600 font-medium">
                              {batch.total_invalid}
                            </span>
                            <span className="text-gray-400">invalid</span>
                          </div>
                        )}
                        {batch.total_created > 0 && (
                          <div className="flex items-center gap-2">
                            <Truck className="h-3 w-3 text-blue-600" />
                            <span className="text-blue-600 font-medium">
                              {batch.total_created}
                            </span>
                            <span className="text-gray-400">created</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {formatDate(batch.upload_timestamp)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {batch.total_invalid > 0 && batch.error_report_path && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadError(batch.batch_id)}
                          disabled={isDownloadingErrorReport}
                          className="text-xs border-yellow-600 text-yellow-700 hover:bg-yellow-50"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Error Report
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Stats */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {uploadHistory.reduce((sum, batch) => sum + (batch.total_rows || 0), 0)}
                </p>
                <p className="text-xs text-gray-600 uppercase tracking-wide">Total Vehicles</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {uploadHistory.reduce((sum, batch) => sum + (batch.total_created || 0), 0)}
                </p>
                <p className="text-xs text-gray-600 uppercase tracking-wide">Successfully Created</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {uploadHistory.reduce((sum, batch) => sum + (batch.total_invalid || 0), 0)}
                </p>
                <p className="text-xs text-gray-600 uppercase tracking-wide">Invalid Records</p>
              </div>
            </div>
          </div>

          {/* Pagination */}
          {historyPagination.pages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Page {historyPagination.page} of {historyPagination.pages} (
                {historyPagination.total} batches)
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    handlePageChange(historyPagination.page - 1)
                  }
                  disabled={historyPagination.page === 1}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    handlePageChange(historyPagination.page + 1)
                  }
                  disabled={
                    historyPagination.page === historyPagination.pages
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default VehicleBulkUploadHistory;
