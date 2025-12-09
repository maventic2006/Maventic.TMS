import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  X, 
  AlertCircle, 
  FileSpreadsheet, 
  ChevronLeft, 
  ChevronRight,
  Info,
  Download,
  Search,
  Filter
} from "lucide-react";
import Modal from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import { 
  fetchVehicleBatchErrors,
  closeVehicleErrorDetailsModal,
  downloadVehicleErrorReport
} from "../../../redux/slices/vehicleBulkUploadSlice";

/**
 * Vehicle Error Details Modal Component
 * Displays detailed validation errors for a batch with pagination
 */
const VehicleErrorDetailsModal = () => {
  const dispatch = useDispatch();
  const {
    isErrorDetailsOpen,
    currentBatch,
    errorDetails,
    errorPagination,
    errorSummary,
    isFetchingErrors,
    isDownloadingErrorReport,
    error
  } = useSelector((state) => state.vehicleBulkUpload);

  const [currentPage, setCurrentPage] = useState(1);
  const [filterSheet, setFilterSheet] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch error details when modal opens
  useEffect(() => {
    if (isErrorDetailsOpen && currentBatch?.batch_id) {
      dispatch(fetchVehicleBatchErrors({ 
        batchId: currentBatch.batch_id, 
        page: currentPage, 
        limit: 50 
      }));
    }
  }, [isErrorDetailsOpen, currentBatch?.batch_id, currentPage, dispatch]);

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Handle close
  const handleClose = () => {
    setCurrentPage(1);
    setFilterSheet("all");
    setSearchTerm("");
    dispatch(closeVehicleErrorDetailsModal());
  };

  // Handle download error report
  const handleDownloadErrorReport = () => {
    if (currentBatch?.batch_id) {
      dispatch(downloadVehicleErrorReport(currentBatch.batch_id));
    }
  };

  // Filter errors by sheet if specified - Add null checks
  const filteredErrors = (errorDetails || []).filter(error => {
    if (filterSheet !== "all" && error.sheet !== filterSheet) {
      return false;
    }
    if (searchTerm && !error.errors.some(err => 
      err.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      err.field?.toLowerCase().includes(searchTerm.toLowerCase())
    )) {
      return false;
    }
    return true;
  });

  // Get unique sheet names for filter - Add null check
  const sheetNames = [...new Set((errorDetails || []).map(error => error.sheet))];

  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical": return "text-red-600";
      case "high": return "text-orange-600";
      case "medium": return "text-yellow-600";
      case "low": return "text-blue-600";
      default: return "text-gray-600";
    }
  };

  return (
    <Modal
      isOpen={isErrorDetailsOpen}
      onClose={handleClose}
      title={`Error Details - ${currentBatch?.file_name || "Batch"}`}
      size="6xl"
    >
      <div className="p-6">
        {/* Header with summary stats */}
        {errorSummary && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold text-red-800">Error Summary</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-red-600 font-medium">Total Errors:</span>
                <span className="ml-2 text-red-800">{errorSummary.totalErrors}</span>
              </div>
              <div>
                <span className="text-orange-600 font-medium">Failed Records:</span>
                <span className="ml-2 text-orange-800">{errorSummary.failedRecords}</span>
              </div>
              <div>
                <span className="text-yellow-600 font-medium">Sheets:</span>
                <span className="ml-2 text-yellow-800">{errorSummary.sheetsWithErrors}</span>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Most Common:</span>
                <span className="ml-2 text-blue-800">{errorSummary.mostCommonError}</span>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter Controls */}
        <div className="mb-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search errors by field or message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {sheetNames.length > 1 && (
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filterSheet}
                onChange={(e) => setFilterSheet(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Sheets</option>
                {sheetNames.map(sheet => (
                  <option key={sheet} value={sheet}>{sheet}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Error List */}
        <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
          {isFetchingErrors ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading error details...</span>
            </div>
          ) : filteredErrors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Info className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No error details available</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredErrors.map((errorDetail, index) => (
                <div key={index} className="p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-gray-800">
                      Row {errorDetail.row_number} 
                      {errorDetail.sheet && (
                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {errorDetail.sheet}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {errorDetail.errors.length} error{errorDetail.errors.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    {errorDetail.errors.map((error, errorIndex) => (
                      <div key={errorIndex} className="flex items-start gap-2 text-sm">
                        <AlertCircle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${getSeverityColor(error.severity)}`} />
                        <div className="flex-1">
                          <span className="font-medium text-gray-700">{error.field}:</span>
                          <span className="ml-2 text-gray-600">{error.message}</span>
                          {error.expected && (
                            <div className="mt-1 text-xs text-gray-500">
                              Expected: {error.expected}
                            </div>
                          )}
                          {error.received && (
                            <div className="text-xs text-gray-500">
                              Received: {error.received}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {errorPagination && errorPagination.totalPages > 1 && (
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {((errorPagination.page - 1) * errorPagination.limit) + 1} to{' '}
              {Math.min(errorPagination.page * errorPagination.limit, errorPagination.total)} of{' '}
              {errorPagination.total} errors
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(errorPagination.page - 1)}
                disabled={errorPagination.page <= 1 || isFetchingErrors}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <span className="flex items-center px-3 py-1 text-sm text-gray-600">
                Page {errorPagination.page} of {errorPagination.totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(errorPagination.page + 1)}
                disabled={errorPagination.page >= errorPagination.totalPages || isFetchingErrors}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between">
          <Button
            variant="outline"
            onClick={handleDownloadErrorReport}
            disabled={isDownloadingErrorReport}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isDownloadingErrorReport ? "Downloading..." : "Download Error Report"}
          </Button>
          
          <Button onClick={handleClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default VehicleErrorDetailsModal;
