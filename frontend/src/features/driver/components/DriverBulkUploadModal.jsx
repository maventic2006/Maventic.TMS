import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  X,
  Upload,
  Download,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { getPageTheme, getComponentTheme } from "../../../theme.config";
import {
  downloadDriverTemplate,
  uploadDriverBulk,
  fetchDriverBatchStatus,
  downloadDriverErrorReport,
} from "../../../redux/slices/driverSlice";

const DriverBulkUploadModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const theme = getPageTheme("general");
  const buttonTheme = getComponentTheme("actionButton");

  const { bulkUpload } = useSelector((state) => state.driver);
  const {
    isUploading,
    currentBatch,
    validationResults,
    isDownloadingTemplate,
    isDownloadingError,
  } = bulkUpload;

  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'uploading', 'success', 'error'

  // Monitor upload status from Redux
  useEffect(() => {
    if (isUploading) {
      setUploadStatus("uploading");
    } else if (currentBatch && currentBatch.status === "completed") {
      setUploadStatus("success");
    } else if (currentBatch && currentBatch.status === "failed") {
      setUploadStatus("error");
    }
  }, [isUploading, currentBatch]);

  // Calculate upload progress
  const uploadProgress = useMemo(() => {
    if (!uploadStatus) return 0;
    if (uploadStatus === "uploading") {
      if (currentBatch) {
        // If we have batch info, estimate based on status
        return currentBatch.status === "processing" ? 50 : 100;
      }
      return 30; // Initial upload progress
    }
    if (uploadStatus === "success") return 100;
    return 0;
  }, [uploadStatus, currentBatch]);

  // Handle file selection
  const handleFileSelect = useCallback((event) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ];

      if (
        validTypes.includes(file.type) ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls")
      ) {
        setSelectedFile(file);
        setUploadStatus(null);
        // Clear any previous validation results by resetting upload status
      } else {
        alert("Please select a valid Excel file (.xlsx or .xls)");
      }
    }
  }, []);

  // Handle drag and drop
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ];

      if (
        validTypes.includes(file.type) ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls")
      ) {
        setSelectedFile(file);
        setUploadStatus(null);
        setValidationResults(null);
      } else {
        alert("Please select a valid Excel file (.xlsx or .xls)");
      }
    }
  }, []);

  // Handle download template
  const handleDownloadTemplate = useCallback(() => {
    dispatch(downloadDriverTemplate());
  }, [dispatch]);

  // Handle file upload
  const handleUpload = useCallback(async () => {
    if (!selectedFile) {
      alert("Please select a file first");
      return;
    }

    setUploadStatus("uploading");

    // Dispatch upload action
    const result = await dispatch(uploadDriverBulk(selectedFile));

    if (uploadDriverBulk.fulfilled.match(result)) {
      // File uploaded successfully, now poll for status
      // Backend returns: {data: {batchId, status}}
      const batchId = result.payload.batchId;

      if (!batchId) {
        console.error("No batchId in response:", result.payload);
        setUploadStatus("error");
        return;
      }

      console.log("Upload successful, polling for batch:", batchId);

      // Poll for batch status every 2 seconds
      const pollInterval = setInterval(async () => {
        const statusResult = await dispatch(fetchDriverBatchStatus(batchId));

        if (fetchDriverBatchStatus.fulfilled.match(statusResult)) {
          const batch = statusResult.payload.batch;

          if (batch.status === "completed" || batch.status === "failed") {
            clearInterval(pollInterval);
            setUploadStatus(batch.status === "completed" ? "success" : "error");
          }
        }
      }, 2000);

      // Clear interval after 5 minutes (safety)
      setTimeout(() => clearInterval(pollInterval), 300000);
    } else {
      setUploadStatus("error");
    }
  }, [selectedFile, dispatch]);

  // Handle close
  const handleClose = useCallback(() => {
    setSelectedFile(null);
    setUploadStatus(null);
    onClose();
  }, [onClose]);

  // Reset state
  const handleReset = useCallback(() => {
    setSelectedFile(null);
    setUploadStatus(null);
  }, []);

  // Handle error report download
  const handleDownloadErrorReport = useCallback(() => {
    if (currentBatch && currentBatch.batch_id) {
      dispatch(downloadDriverErrorReport(currentBatch.batch_id));
    }
  }, [currentBatch, dispatch]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      {/* Modal Container */}
      <div
        className="relative w-full max-w-3xl rounded-2xl shadow-2xl"
        style={{
          backgroundColor: theme.colors.card.background,
          border: `1px solid ${theme.colors.card.border}`,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-1 border-b rounded-t-2xl"
          style={{
            backgroundColor: theme.colors.header.background,
            borderColor: theme.colors.card.border,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
            >
              <Upload
                className="w-5 h-5"
                style={{ color: theme.colors.header.text }}
              />
            </div>
            <div>
              <h2
                className="text-lg font-bold"
                style={{ color: theme.colors.header.text }}
              >
                Bulk Upload Drivers
              </h2>
              <p
                className="text-sm"
                style={{ color: "rgba(255, 255, 255, 0.7)" }}
              >
                Upload multiple drivers using Excel template
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg transition-all duration-200 hover:bg-white/10"
            style={{ color: theme.colors.header.text }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Download Template Section */}
          <div
            className="flex items-start gap-4 p-2 rounded-xl border"
            style={{
              backgroundColor: theme.colors.status.info.background,
              borderColor: theme.colors.status.info.border,
            }}
          >
            <div className="flex-shrink-0">
              <FileSpreadsheet
                className="w-6 h-6"
                style={{ color: theme.colors.status.info.text }}
              />
            </div>
            <div className="flex-1">
              <h3
                className="font-semibold mb-1"
                style={{ color: theme.colors.status.info.text }}
              >
                Step 1: Download Template
              </h3>
              <p
                className="text-xs mb-3"
                style={{ color: theme.colors.status.info.text }}
              >
                Download the Excel template with all required columns and sample
                data
              </p>
              <button
                onClick={handleDownloadTemplate}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-xs transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: buttonTheme.primary.background,
                  color: buttonTheme.primary.text,
                }}
              >
                <Download className="w-4 h-4" />
                Download Template
              </button>
            </div>
          </div>

          {/* Upload File Section */}
          <div>
            <h3
              className="font-semibold mb-3"
              style={{ color: theme.colors.text.primary }}
            >
              Step 2: Upload Filled Template
            </h3>

            {/* File Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className="relative border-2 border-dashed rounded-xl p-4 transition-all duration-200"
              style={{
                borderColor: isDragging
                  ? buttonTheme.primary.background
                  : theme.colors.card.border,
                backgroundColor: isDragging
                  ? "rgba(16, 185, 129, 0.05)"
                  : theme.colors.card.background,
              }}
            >
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <div
                    className="p-2 rounded-full"
                    style={{ backgroundColor: theme.colors.primary.background }}
                  >
                    <Upload
                      className="w-8 h-8"
                      style={{ color: buttonTheme.primary.background }}
                    />
                  </div>
                </div>

                <p
                  className="text-sm font-semibold mb-2"
                  style={{ color: theme.colors.text.primary }}
                >
                  {selectedFile
                    ? selectedFile.name
                    : "Drop Excel file here or click to browse"}
                </p>

                <p
                  className="text-xs"
                  style={{ color: theme.colors.text.secondary }}
                >
                  Supports .xlsx and .xls files (up to 10MB)
                </p>

                {selectedFile && (
                  <div
                    className="mt-2 inline-flex items-center gap-2 px-2 py-1 rounded-lg"
                    style={{
                      backgroundColor: theme.colors.status.success.background,
                    }}
                  >
                    <CheckCircle
                      className="w-4 h-4"
                      style={{ color: theme.colors.status.success.text }}
                    />
                    <span
                      className="text-xs font-medium"
                      style={{ color: theme.colors.status.success.text }}
                    >
                      File selected: {selectedFile.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Upload Progress */}
          {uploadStatus === "uploading" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span
                  className="text-xs font-medium"
                  style={{ color: theme.colors.text.primary }}
                >
                  Uploading and validating...
                </span>
                <span
                  className="text-xs font-semibold"
                  style={{ color: buttonTheme.primary.background }}
                >
                  {uploadProgress}%
                </span>
              </div>
              <div
                className="w-full h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: theme.colors.primary.background }}
              >
                <div
                  className="h-full transition-all duration-300 rounded-full"
                  style={{
                    backgroundColor: buttonTheme.primary.background,
                    width: `${uploadProgress}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Validation Results */}
          {validationResults && uploadStatus === "success" && (
            <div
              className="p-2 rounded-xl border"
              style={{
                backgroundColor: theme.colors.status.success.background,
                borderColor: theme.colors.status.success.border,
              }}
            >
              <h3
                className="font-semibold mb-3"
                style={{ color: theme.colors.status.success.text }}
              >
                Upload Complete
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div
                    className="text-2xl font-bold"
                    style={{ color: theme.colors.status.success.text }}
                  >
                    {validationResults.total}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: theme.colors.status.success.text }}
                  >
                    Total Records
                  </div>
                </div>
                <div className="text-center">
                  <div
                    className="text-lg font-bold"
                    style={{ color: theme.colors.status.approve.background }}
                  >
                    {validationResults.valid}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: theme.colors.text.secondary }}
                  >
                    Valid
                  </div>
                </div>
                <div className="text-center">
                  <div
                    className="text-lg font-bold"
                    style={{ color: theme.colors.status.error.text }}
                  >
                    {validationResults.invalid}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: theme.colors.text.secondary }}
                  >
                    Invalid
                  </div>
                </div>
              </div>

              {validationResults.invalid > 0 && (
                <div
                  className="mt-2 flex items-center gap-2 text-xs"
                  style={{ color: theme.colors.status.warning.text }}
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>Download error report to view validation issues</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-6 py-4 border-t rounded-b-2xl"
          style={{
            backgroundColor: theme.colors.primary.background,
            borderColor: theme.colors.card.border,
          }}
        >
          <div
            className="text-sm"
            style={{ color: theme.colors.text.secondary }}
          >
            {uploadStatus === "success" ? (
              <span
                className="flex items-center gap-2"
                style={{ color: theme.colors.status.success.text }}
              >
                <CheckCircle className="w-4 h-4" />
                Upload completed successfully
              </span>
            ) : uploadStatus === "uploading" ? (
              <span
                className="flex items-center gap-2"
                style={{ color: buttonTheme.primary.background }}
              >
                <Clock className="w-4 h-4 animate-spin" />
                Processing...
              </span>
            ) : (
              "Select a file to upload"
            )}
          </div>

          <div className="flex items-center gap-3">
            {uploadStatus === "success" && validationResults?.invalid > 0 && (
              <button
                onClick={handleDownloadErrorReport}
                disabled={isDownloadingError}
                className="px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: buttonTheme.secondary.background,
                  color: theme.colors.text.primary,
                  border: `1px solid ${theme.colors.card.border}`,
                }}
              >
                <Download className="w-4 h-4 inline mr-2" />
                {isDownloadingError ? "Downloading..." : "Download Errors"}
              </button>
            )}

            <button
              onClick={handleReset}
              disabled={uploadStatus === "uploading"}
              className="px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: buttonTheme.secondary.background,
                color: theme.colors.text.primary,
                border: `1px solid ${theme.colors.card.border}`,
              }}
            >
              Reset
            </button>

            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploadStatus === "uploading"}
              className="px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: buttonTheme.primary.background,
                color: buttonTheme.primary.text,
              }}
            >
              {uploadStatus === "uploading" ? "Uploading..." : "Upload File"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverBulkUploadModal;
