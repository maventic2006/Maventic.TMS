import React, { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Upload, Download, FileSpreadsheet, X, CheckCircle, AlertCircle, Info, Loader2, Truck } from "lucide-react";
import Modal from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import {
  downloadVehicleTemplate,
  uploadVehicleBulk,
  closeVehicleBulkUploadModal,
  resetVehicleUploadState,
  openVehicleHistoryModal,
  downloadVehicleErrorReport,
} from "../../../redux/slices/vehicleBulkUploadSlice";
import socketService from "../../../services/socketService";

/**
 * Vehicle Bulk Upload Modal Component
 * Handles bulk upload of vehicles with real-time progress tracking
 */
const VehicleBulkUploadModal = () => {
  const dispatch = useDispatch();
  const {
    isModalOpen,
    isUploading,
    uploadProgress,
    currentBatch,
    validationResults,
    progressLogs,
    isDownloadingTemplate,
    isDownloadingErrorReport,
    error,
  } = useSelector((state) => state.vehicleBulkUpload);

  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Connect to Socket.IO when modal opens
  useEffect(() => {
    if (isModalOpen) {
      socketService.connect();
    }
  }, [isModalOpen]);

  // Join batch room when batch is created
  useEffect(() => {
    if (currentBatch?.batch_id) {
      socketService.joinBatchRoom(currentBatch.batch_id);
    }

    return () => {
      if (currentBatch?.batch_id) {
        socketService.leaveBatchRoom(currentBatch.batch_id);
      }
    };
  }, [currentBatch?.batch_id]);

  // Close modal handler
  const handleClose = useCallback(() => {
    setSelectedFile(null);
    dispatch(resetVehicleUploadState());
    dispatch(closeVehicleBulkUploadModal());
  }, [dispatch]);

  // Download template handler
  const handleDownloadTemplate = useCallback(() => {
    dispatch(downloadVehicleTemplate());
  }, [dispatch]);

  // File change handler
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

  // Drag handlers
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

  // Upload handler
  const handleUpload = useCallback(() => {
    if (selectedFile) {
      dispatch(uploadVehicleBulk(selectedFile));
    }
  }, [selectedFile, dispatch]);

  // View history handler
  const handleViewHistory = useCallback(() => {
    dispatch(openVehicleHistoryModal());
  }, [dispatch]);

  // Download error report handler
  const handleDownloadErrorReport = useCallback(() => {
    if (currentBatch?.batch_id) {
      dispatch(downloadVehicleErrorReport(currentBatch.batch_id));
    }
  }, [currentBatch, dispatch]);

  // Get log icon based on type
  const getLogIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  // Get log color based on type
  const getLogColor = (type) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      default:
        return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  // Modal footer
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
      title={
        <div className="flex items-center gap-2">
          <Truck className="h-6 w-6 text-orange-600" />
          <span>Bulk Upload Vehicles</span>
        </div>
      }
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
            <li>Fill in vehicle details across all 5 sheets (Basic Info, Specifications, Capacity, Ownership, Documents)</li>
            <li>Use Vehicle_Ref_ID (VR001, VR002, etc.) to link related data</li>
            <li>Ensure VIN and GPS IMEI are unique across all vehicles</li>
            <li>Upload the completed file (max 10MB, .xlsx/.xls only)</li>
            <li>Monitor real-time progress (parsing, validation, creation)</li>
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
            Download Excel Template (5 Sheets)
          </Button>
        </div>

        {/* File Upload Area */}
        {!isUploading && !validationResults && (
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
                  <p className="font-semibold text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <div className="flex gap-3 justify-center">
                  <Button onClick={handleUpload} className="bg-orange-600 hover:bg-orange-700">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload & Process
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
                    id="vehicle-file-upload-input"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => document.getElementById('vehicle-file-upload-input').click()}
                  >
                    Browse Files
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Maximum file size: 10MB. Accepted formats: .xlsx, .xls<br />
                  Supports 500+ vehicles per batch
                </p>
              </div>
            )}
          </div>
        )}

        {/* Progress Bar */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">Processing Vehicle Batch...</span>
              <span className="text-gray-600">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-300 flex items-center justify-end"
                style={{ width: `${uploadProgress}%` }}
              >
                {uploadProgress > 10 && (
                  <Loader2 className="h-3 w-3 mr-1 text-white animate-spin" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Progress Logs */}
        {progressLogs.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-orange-600" />
              Live Processing Log
            </h4>
            <div className="max-h-60 overflow-y-auto space-y-2 bg-gray-50 rounded-lg p-4 border border-gray-200">
              {progressLogs.map((log, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-2 p-2 rounded border ${getLogColor(log.type)}`}
                >
                  {getLogIcon(log.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{log.message}</p>
                    <p className="text-xs opacity-75">{formatTime(log.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Validation Results */}
        {validationResults && currentBatch?.status === 'completed' && (
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Batch Processing Complete
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-2xl font-bold text-green-600">
                    {validationResults.valid || 0}
                  </p>
                  <p className="text-sm text-green-700">Valid Vehicles</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-2xl font-bold text-red-600">
                    {validationResults.invalid || 0}
                  </p>
                  <p className="text-sm text-red-700">Invalid Vehicles</p>
                </div>
              </div>
              {currentBatch?.total_created > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-800">Successfully Created:</span>
                    <span className="text-lg font-bold text-blue-600">{currentBatch.total_created}</span>
                  </div>
                  {currentBatch.total_creation_failed > 0 && (
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-red-800">Creation Failed:</span>
                      <span className="text-lg font-bold text-red-600">{currentBatch.total_creation_failed}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Error Report Download */}
            {validationResults.invalid > 0 && currentBatch?.error_report_path && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <h4 className="font-semibold text-yellow-900">
                    Validation Errors Detected
                  </h4>
                </div>
                <p className="text-sm text-yellow-800 mb-3">
                  {validationResults.invalid} vehicle(s) have validation errors. Download the
                  error report to view details with highlighted cells and fix the issues.
                </p>
                <Button
                  variant="outline"
                  className="border-yellow-600 text-yellow-700 hover:bg-yellow-100"
                  onClick={handleDownloadErrorReport}
                  disabled={isDownloadingErrorReport}
                  loading={isDownloadingErrorReport}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Error Report
                </Button>
              </div>
            )}

            {/* Success Message */}
            {validationResults.valid > 0 && validationResults.invalid === 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-green-900">Success!</h4>
                    <p className="text-sm text-green-800">
                      All {currentBatch?.total_created || validationResults.valid} vehicle(s) have been successfully created in the database.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <h4 className="font-semibold text-red-900">Error</h4>
                <p className="text-sm text-red-800">
                  {error.message || "An error occurred during upload"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default VehicleBulkUploadModal;
