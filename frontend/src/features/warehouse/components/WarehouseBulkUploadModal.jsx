import React, { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Upload,
  Download,
  FileSpreadsheet,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  Loader2,
} from "lucide-react";
import Modal from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import {
  downloadWarehouseBulkTemplate,
  uploadWarehouseBulk,
  closeBulkUploadModal,
  resetBulkUploadState,
  openBulkUploadHistory,
  fetchWarehouseBulkStatus,
} from "../../../redux/slices/warehouseSlice";

const WarehouseBulkUploadModal = () => {
  const dispatch = useDispatch();
  const { bulkUpload } = useSelector((state) => state.warehouse);
  const {
    isModalOpen,
    isUploading,
    isDownloadingTemplate,
    currentBatch,
    statusCounts,
  } = bulkUpload;

  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [statusPolling, setStatusPolling] = useState(null);

  // Poll for batch status if we have a current batch
  useEffect(() => {
    if (currentBatch?.batchId && currentBatch?.status === "processing") {
      const interval = setInterval(() => {
        dispatch(fetchWarehouseBulkStatus(currentBatch.batchId));
      }, 2000); // Poll every 2 seconds

      setStatusPolling(interval);

      return () => {
        if (interval) clearInterval(interval);
      };
    } else {
      if (statusPolling) {
        clearInterval(statusPolling);
        setStatusPolling(null);
      }
    }
  }, [currentBatch?.batchId, currentBatch?.status, dispatch]);

  const handleClose = useCallback(() => {
    setSelectedFile(null);
    if (statusPolling) clearInterval(statusPolling);
    dispatch(resetBulkUploadState());
    dispatch(closeBulkUploadModal());
  }, [dispatch, statusPolling]);

  const handleDownloadTemplate = useCallback(() => {
    dispatch(downloadWarehouseBulkTemplate());
  }, [dispatch]);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ];
      if (!validTypes.includes(file.type)) {
        alert("Please select a valid Excel file (.xlsx or .xls)");
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }

      setSelectedFile(file);
    }
  }, []);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ];
      if (!validTypes.includes(file.type)) {
        alert("Please select a valid Excel file (.xlsx or .xls)");
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }

      setSelectedFile(file);
    }
  }, []);

  const handleUpload = useCallback(() => {
    if (selectedFile) {
      dispatch(uploadWarehouseBulk(selectedFile));
      setSelectedFile(null);
    }
  }, [selectedFile, dispatch]);

  const handleViewHistory = useCallback(() => {
    dispatch(openBulkUploadHistory());
  }, [dispatch]);

  const footer = (
    <>
      <Button variant="outline" onClick={handleViewHistory}>
        View History
      </Button>
      <Button variant="outline" onClick={handleClose}>
        Close
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={handleClose}
      title="Bulk Upload Warehouses"
      size="lg"
      footer={footer}
    >
      <div className="space-y-6">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
            <Info className="h-5 w-5 mr-2" />
            Instructions
          </h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Download the Excel template using the button below</li>
            <li>Fill in warehouse details across all 3 sheets</li>
            <li>Use Warehouse_Name1 to link related data</li>
            <li>Upload the completed file (max 10MB, .xlsx/.xls only)</li>
            <li>Monitor processing status in real-time</li>
          </ol>
        </div>

        {/* Download Template Button */}
        <div>
          <Button
            onClick={handleDownloadTemplate}
            disabled={isDownloadingTemplate}
            loading={isDownloadingTemplate}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Excel Template
          </Button>
        </div>

        {/* File Upload Area */}
        {!isUploading && !currentBatch && (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-orange-500 bg-orange-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="space-y-4">
                <FileSpreadsheet className="h-16 w-16 text-green-500 mx-auto" />
                <div>
                  <p className="font-semibold text-gray-900">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={handleUpload}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedFile(null)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-16 w-16 text-gray-400 mx-auto" />
                <div>
                  <p className="font-semibold text-gray-900">
                    Drag and drop your Excel file here
                  </p>
                  <p className="text-sm text-gray-500">or</p>
                </div>
                <div>
                  <input
                    type="file"
                    id="warehouse-file-upload-input"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() =>
                      document
                        .getElementById("warehouse-file-upload-input")
                        .click()
                    }
                  >
                    Browse Files
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Maximum file size: 10MB. Accepted formats: .xlsx, .xls
                </p>
              </div>
            )}
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">Uploading...</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full animate-pulse" />
            </div>
          </div>
        )}

        {/* Processing Status */}
        {currentBatch && currentBatch.status === "processing" && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
              <h4 className="font-semibold text-blue-900">Processing...</h4>
            </div>
            <p className="text-sm text-blue-800">
              Your file is being processed. This may take a few moments.
            </p>
          </div>
        )}

        {/* Validation Results */}
        {currentBatch && currentBatch.status === "completed" && (
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">
                Processing Summary
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {currentBatch.totalCreated || 0}
                  </p>
                  <p className="text-sm text-green-700">Created</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">
                    {currentBatch.invalidCount || 0}
                  </p>
                  <p className="text-sm text-red-700">Failed</p>
                </div>
              </div>
            </div>

            {currentBatch.invalidCount > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <h4 className="font-semibold text-yellow-900">
                    Validation Errors Detected
                  </h4>
                </div>
                <p className="text-sm text-yellow-800 mb-3">
                  {currentBatch.invalidCount} record(s) have validation errors.
                  Download the error report to view details and fix the issues.
                </p>
                <Button
                  variant="outline"
                  className="border-yellow-600 text-yellow-700 hover:bg-yellow-100"
                  onClick={() => {
                    window.open(
                      `/api/warehouse-bulk-upload/error-report/${currentBatch.batchId}`,
                      "_blank"
                    );
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Error Report
                </Button>
              </div>
            )}

            {currentBatch.totalCreated > 0 &&
              currentBatch.invalidCount === 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <h4 className="font-semibold text-green-900">Success!</h4>
                      <p className="text-sm text-green-800">
                        All {currentBatch.totalCreated} warehouse(s) have been
                        created successfully.
                      </p>
                    </div>
                  </div>
                </div>
              )}
          </div>
        )}

        {/* Error Display */}
        {currentBatch && currentBatch.status === "failed" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <h4 className="font-semibold text-red-900">
                  Processing Failed
                </h4>
                <p className="text-sm text-red-800">
                  An error occurred while processing your file. Please try
                  again.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default WarehouseBulkUploadModal;
