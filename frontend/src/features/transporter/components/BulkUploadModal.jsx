import React, { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Upload, Download, FileSpreadsheet, X, CheckCircle, AlertCircle, Info, Loader2 } from "lucide-react";
import Modal from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import {
  downloadTemplate,
  uploadTransporterBulk,
  closeModal,
  resetUploadState,
  openHistoryModal,
} from "../../../redux/slices/bulkUploadSlice";
import socketService from "../../../services/socketService";

const BulkUploadModal = () => {
  const dispatch = useDispatch();
  const {
    isModalOpen,
    isUploading,
    uploadProgress,
    currentBatch,
    validationResults,
    progressLogs,
    isDownloadingTemplate,
    error,
  } = useSelector((state) => state.bulkUpload);

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

  const handleClose = useCallback(() => {
    setSelectedFile(null);
    dispatch(resetUploadState());
    dispatch(closeModal());
  }, [dispatch]);

  const handleDownloadTemplate = useCallback(() => {
    dispatch(downloadTemplate());
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
      dispatch(uploadTransporterBulk(selectedFile));
    }
  }, [selectedFile, dispatch]);

  const handleViewHistory = useCallback(() => {
    dispatch(openHistoryModal());
  }, [dispatch]);

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

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

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
      title="Bulk Upload Transporters"
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
            <li>Fill in transporter details across all 5 sheets</li>
            <li>Use Transporter_Ref_ID to link related data</li>
            <li>Upload the completed file (max 10MB, .xlsx/.xls only)</li>
            <li>Monitor progress in real-time</li>
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
                    id="file-upload-input"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => document.getElementById('file-upload-input').click()}
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

        {/* Progress Bar */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">Uploading & Processing...</span>
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
            <h4 className="font-semibold text-gray-900">Progress Log</h4>
            <div className="max-h-60 overflow-y-auto space-y-2 bg-gray-50 rounded-lg p-4">
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
        {validationResults && (
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Validation Summary</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {validationResults.valid || 0}
                  </p>
                  <p className="text-sm text-green-700">Valid Records</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">
                    {validationResults.invalid || 0}
                  </p>
                  <p className="text-sm text-red-700">Invalid Records</p>
                </div>
              </div>
            </div>

            {validationResults.invalid > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <h4 className="font-semibold text-yellow-900">
                    Validation Errors Detected
                  </h4>
                </div>
                <p className="text-sm text-yellow-800 mb-3">
                  {validationResults.invalid} record(s) have validation errors. Download the
                  error report to view details and fix the issues.
                </p>
                <Button
                  variant="outline"
                  className="border-yellow-600 text-yellow-700 hover:bg-yellow-100"
                  onClick={() => {
                    // Download error report - will implement after creating the endpoint
                    window.open(
                      `/api/bulk-upload/error-report/${currentBatch?.batch_id}`,
                      "_blank"
                    );
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Error Report
                </Button>
              </div>
            )}

            {validationResults.valid > 0 && validationResults.invalid === 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-green-900">Success!</h4>
                    <p className="text-sm text-green-800">
                      All {validationResults.valid} transporter(s) have been validated and
                      will be created.
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

export default BulkUploadModal;
