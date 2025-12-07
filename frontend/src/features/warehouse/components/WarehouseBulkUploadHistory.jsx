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
} from "lucide-react";
import Modal from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import {
  fetchWarehouseBulkHistory,
  downloadWarehouseBulkErrorReport,
  closeBulkUploadHistory,
} from "../../../redux/slices/warehouseSlice";

const WarehouseBulkUploadHistory = () => {
  const dispatch = useDispatch();
  const { bulkUpload } = useSelector((state) => state.warehouse);
  const { isHistoryModalOpen, batches, pagination } = bulkUpload;

  useEffect(() => {
    if (isHistoryModalOpen) {
      dispatch(fetchWarehouseBulkHistory({ page: 1, limit: 10 }));
    }
  }, [isHistoryModalOpen, dispatch]);

  const handleClose = useCallback(() => {
    dispatch(closeBulkUploadHistory());
  }, [dispatch]);

  const handleDownloadError = useCallback(
    (batchId) => {
      dispatch(downloadWarehouseBulkErrorReport(batchId));
    },
    [dispatch]
  );

  const handlePageChange = useCallback(
    (page) => {
      dispatch(fetchWarehouseBulkHistory({ page, limit: 10 }));
    },
    [dispatch]
  );

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
      validation_errors: {
        icon: AlertCircle,
        text: "Validation Errors",
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const footer = (
    <Button variant="outline" onClick={handleClose}>
      Close
    </Button>
  );

  return (
    <Modal
      isOpen={isHistoryModalOpen}
      onClose={handleClose}
      title="Warehouse Bulk Upload History"
      size="xl"
      footer={footer}
    >
      {batches.length === 0 ? (
        <div className="text-center py-12">
          <FileSpreadsheet className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">No upload history found</p>
          <p className="text-sm text-gray-500 mt-2">
            Your warehouse bulk upload history will appear here
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
                    Records
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
                {batches.map((batch) => (
                  <tr
                    key={batch.batchId}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-900">
                        {batch.batchId}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4 text-green-600" />
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
                          <span className="text-green-600 font-medium">
                            {batch.totalCreated || 0}
                          </span>
                          <span className="text-gray-400">created</span>
                        </div>
                        {batch.invalidCount > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-red-600 font-medium">
                              {batch.invalidCount}
                            </span>
                            <span className="text-gray-400">invalid</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {formatDate(batch.uploadedTimestamp)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {batch.invalidCount > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadError(batch.batchId)}
                          className="text-xs"
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

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.pages} ({pagination.total}{" "}
                total)
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
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

export default WarehouseBulkUploadHistory;
