import React, { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Upload, Download, FileSpreadsheet, X, CheckCircle, AlertCircle, Info, Loader2, Truck, Eye } from "lucide-react";
import Modal from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import {
  downloadVehicleTemplate,
  uploadVehicleBulk,
  closeVehicleBulkUploadModal,
  resetVehicleUploadState,
  openVehicleHistoryModal,
  downloadVehicleErrorReport,
  updateVehicleProgress,
  updateVehicleBatchStatus,
  handleVehicleBatchComplete,
  handleVehicleBatchError,
  fetchVehicleBatchStatus,
  openVehicleErrorDetailsModal,
} from "../../../redux/slices/vehicleBulkUploadSlice";
import socketService from "../../../services/socketService";
import VehicleErrorDetailsModal from "./VehicleErrorDetailsModal";

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
    isDownloadingTemplate,
    isDownloadingErrorReport,
    error,
    progressLogs,
  } = useSelector((state) => state.vehicleBulkUpload);

  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Connect to Socket.IO when modal opens
  useEffect(() => {
    if (isModalOpen) {
      socketService.connect();
    }
  }, [isModalOpen]);

  // Join batch room and listen to Socket.IO events when batch is created
  useEffect(() => {
    if (currentBatch?.batch_id) {
      const batchId = currentBatch.batch_id;
      
      // Join batch room
      socketService.joinBatchRoom(batchId);
      
      // Listen to progress events
      const handleProgress = (data) => {
        if (data.batchId === batchId) {
          dispatch(updateVehicleProgress({
            progress: data.progress,
            message: data.message,
            type: data.type
          }));
        }
      };
      
      // Listen to batch completion
      const handleComplete = (data) => {
        if (data.batchId === batchId) {
          dispatch(handleVehicleBatchComplete(data));
        }
      };
      
      // Listen to errors
      const handleError = (data) => {
        if (data.batchId === batchId) {
          dispatch(handleVehicleBatchError(data));
        }
      };
      
      // Register event listeners
      socketService.on('vehicleBulkUploadProgress', handleProgress);
      socketService.on('vehicleBulkUploadComplete', handleComplete);
      socketService.on('vehicleBulkUploadError', handleError);
      
      // Fallback polling mechanism (ONLY if Socket.IO connection fails)
      let pollingInterval = null;
      
      // Check Socket.IO connection status after a short delay
      setTimeout(() => {
        const isSocketConnected = socketService.isConnected;
        console.log('🔌 Socket.IO connection status:', isSocketConnected);
        
        // Only enable polling if Socket.IO is NOT connected AND batch is processing
        if (!isSocketConnected && (isUploading || currentBatch?.status === 'processing')) {
          console.log('⚠️ Socket.IO not connected - enabling polling fallback');
          pollingInterval = setInterval(() => {
            dispatch(fetchVehicleBatchStatus(batchId));
          }, 3000); // Poll every 3 seconds
        } else if (isSocketConnected) {
          console.log('✅ Socket.IO connected - polling disabled');
        }
      }, 1000); // Wait 1 second for Socket.IO connection to establish
      
      // Cleanup on unmount or batch change
      return () => {
        socketService.off('vehicleBulkUploadProgress', handleProgress);
        socketService.off('vehicleBulkUploadComplete', handleComplete);
        socketService.off('vehicleBulkUploadError', handleError);
        socketService.leaveBatchRoom(batchId);
        
        if (pollingInterval) {
          clearInterval(pollingInterval);
        }
      };
    }
  }, [currentBatch?.batch_id, isUploading, dispatch]);

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

  // View error details handler
  const handleViewErrorDetails = useCallback(() => {
    if (currentBatch?.batch_id) {
      dispatch(openVehicleErrorDetailsModal());
    }
  }, [currentBatch, dispatch]);

  // Modal footer
  const footer = (
    <>
      <Button variant="outline" onClick={handleViewHistory}>
        View History
      </Button>
      {/* View Error Details Button - Show when there are validation errors */}
      {validationResults && validationResults.invalid > 0 && currentBatch?.batch_id && (
        <Button 
          variant="outline" 
          onClick={handleViewErrorDetails}
          className="flex items-center gap-2"
        >
          <Eye className="h-4 w-4" />
          View Error Details
        </Button>
      )}
      {/* Download Error Report Button - Show when there are validation errors */}
      {validationResults && validationResults.invalid > 0 && currentBatch?.batch_id && (
        <Button 
          variant="outline" 
          onClick={handleDownloadErrorReport}
          disabled={isDownloadingErrorReport}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          {isDownloadingErrorReport ? "Downloading..." : "Download Report"}
        </Button>
      )}
      <Button variant="outline" onClick={handleClose}>
        Close
      </Button>
    </>
  );

  return (
    <>
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

        {/* Progress Bar - Only show during upload */}
        {isUploading && (
          <div className="space-y-4">
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

            {/* Real-time Processing Log */}
            {progressLogs && progressLogs.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Live Processing Log
                </h4>
                <div className="max-h-32 overflow-y-auto space-y-1 scrollbar-thin">
                  {progressLogs.slice(-10).map((log, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <div className="flex-shrink-0 mt-1">
                        {log.type === 'success' && (
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        )}
                        {log.type === 'error' && (
                          <AlertCircle className="h-3 w-3 text-red-600" />
                        )}
                        {log.type === 'warning' && (
                          <AlertCircle className="h-3 w-3 text-yellow-600" />
                        )}
                        {log.type === 'info' && (
                          <Info className="h-3 w-3 text-blue-600" />
                        )}
                      </div>
                      <span 
                        className={`flex-1 ${
                          log.type === 'success' ? 'text-green-800' :
                          log.type === 'error' ? 'text-red-800' :
                          log.type === 'warning' ? 'text-yellow-800' :
                          'text-gray-700'
                        }`}
                      >
                        {log.message}
                      </span>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
                {progressLogs.length > 10 && (
                  <div className="text-xs text-gray-500 text-center mt-2 pt-2 border-t border-gray-200">
                    Showing last 10 of {progressLogs.length} log entries
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Processing Status - Show during upload with partial results */}
        {currentBatch && currentBatch.status === 'processing' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 shadow-sm">
              <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2 text-lg">
                <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                Batch Processing In Progress
              </h4>
              
              <div className="mb-4">
                <p className="text-sm text-blue-700 mb-3">
                  <strong>Batch ID:</strong> {currentBatch.batch_id}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg border border-blue-300">
                    <p className="text-2xl font-bold text-blue-600">
                      {currentBatch.processed_rows || 0}/{currentBatch.total_rows || 0}
                    </p>
                    <p className="text-sm font-medium text-blue-700 mt-1">Rows Processed</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border border-blue-300">
                    <p className="text-2xl font-bold text-blue-600">
                      {validationResults ? (validationResults.valid + validationResults.invalid) : 0}
                    </p>
                    <p className="text-sm font-medium text-blue-700 mt-1">Vehicles Validated</p>
                  </div>
                </div>
              </div>

              {validationResults && (validationResults.valid > 0 || validationResults.invalid > 0) && (
                <div className="border-t border-blue-200 pt-4">
                  <h5 className="font-semibold text-blue-800 mb-3 text-sm uppercase tracking-wide">
                    Current Validation Status
                  </h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-xl font-bold text-green-600">
                        {validationResults.valid || 0}
                      </p>
                      <p className="text-sm font-medium text-green-700">Valid</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-xl font-bold text-red-600">
                        {validationResults.invalid || 0}
                      </p>
                      <p className="text-sm font-medium text-red-700">Invalid</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Validation Results */}
        {validationResults && currentBatch?.status === 'completed' && (
          <div className="space-y-4">
            {/* Main Results Summary */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
                Batch Processing Complete
              </h4>
              
              {/* Validation Summary */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">
                  <strong>Batch ID:</strong> {currentBatch.batch_id}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
                    <p className="text-3xl font-bold text-green-600">
                      {validationResults.valid || 0}
                    </p>
                    <p className="text-sm font-medium text-green-700 mt-1">Valid Vehicles</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg border-2 border-red-200">
                    <p className="text-3xl font-bold text-red-600">
                      {validationResults.invalid || 0}
                    </p>
                    <p className="text-sm font-medium text-red-700 mt-1">Invalid Vehicles</p>
                  </div>
                </div>
              </div>

              {/* Database Creation Summary */}
              {currentBatch?.total_created !== undefined && (
                <div className="border-t border-gray-200 pt-4">
                  <h5 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">
                    Database Creation Status
                  </h5>
                  <div className="space-y-2">
                    {/* Successfully Created */}
                    {currentBatch.total_created > 0 && (
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">
                            Successfully Created in Database
                          </span>
                        </div>
                        <span className="text-xl font-bold text-blue-600">
                          {currentBatch.total_created}
                        </span>
                      </div>
                    )}
                    
                    {/* Creation Failed */}
                    {currentBatch.total_creation_failed > 0 && (
                      <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-orange-600" />
                          <span className="text-sm font-medium text-orange-900">
                            Failed to Create (Database Error)
                          </span>
                        </div>
                        <span className="text-xl font-bold text-orange-600">
                          {currentBatch.total_creation_failed}
                        </span>
                      </div>
                    )}
                    
                    {/* No Creation Attempted */}
                    {validationResults.valid > 0 && currentBatch.total_created === 0 && currentBatch.total_creation_failed === 0 && (
                      <div className="flex items-center justify-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <Info className="h-5 w-5 text-gray-500 mr-2" />
                        <span className="text-sm text-gray-600">
                          Waiting for database creation...
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Error Report Download Section */}
            {validationResults.invalid > 0 && currentBatch?.error_report_path && (
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                  <h4 className="font-semibold text-yellow-900 text-lg">
                    Validation Errors Detected
                  </h4>
                </div>
                <p className="text-sm text-yellow-900 mb-4 leading-relaxed">
                  <strong>{validationResults.invalid} vehicle(s)</strong> have validation errors and were not created in the database. 
                  Download the error report to view detailed error messages with highlighted cells in Excel format.
                </p>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-yellow-600 text-yellow-800 hover:bg-yellow-100 font-semibold"
                  onClick={handleDownloadErrorReport}
                  disabled={isDownloadingErrorReport}
                  loading={isDownloadingErrorReport}
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download Error Report (Excel)
                </Button>
              </div>
            )}

            {/* Complete Success Message */}
            {validationResults.valid > 0 && 
             validationResults.invalid === 0 && 
             currentBatch?.total_created > 0 && 
             currentBatch?.total_creation_failed === 0 && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-7 w-7 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-green-900 text-lg mb-2">
                      🎉 Perfect Upload! All Vehicles Created Successfully
                    </h4>
                    <p className="text-sm text-green-800 leading-relaxed">
                      <strong>{currentBatch.total_created} vehicle(s)</strong> have been successfully validated and created in the database. 
                      All data has been stored and is now available in the vehicle list.
                    </p>
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <p className="text-xs text-green-700 flex items-center gap-1">
                        <Info className="h-4 w-4" />
                        <span>You can now close this dialog and view your vehicles in the main list.</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Partial Success Message */}
            {validationResults.valid > 0 && 
             validationResults.invalid > 0 && 
             currentBatch?.total_created > 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-lg p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <Info className="h-7 w-7 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-blue-900 text-lg mb-2">
                      Partial Success - Some Vehicles Created
                    </h4>
                    <p className="text-sm text-blue-800 leading-relaxed">
                      <strong>{currentBatch.total_created} out of {validationResults.valid} valid vehicle(s)</strong> have been successfully 
                      created in the database. Download the error report to fix issues with the remaining {validationResults.invalid} vehicle(s).
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Complete Failure Message */}
            {validationResults.valid === 0 && validationResults.invalid > 0 && (
              <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-300 rounded-lg p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-7 w-7 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-red-900 text-lg mb-2">
                      Upload Failed - No Valid Vehicles Found
                    </h4>
                    <p className="text-sm text-red-800 leading-relaxed mb-3">
                      All <strong>{validationResults.invalid} vehicle(s)</strong> in your upload have validation errors. 
                      No data has been stored in the database.
                    </p>
                    <p className="text-xs text-red-700 bg-red-100 rounded px-2 py-1 inline-block">
                      💡 Tip: Download the error report to see exactly what needs to be fixed.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Failed Batch Status */}
        {currentBatch && currentBatch.status === 'failed' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-7 w-7 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-bold text-red-900 text-lg mb-2">
                  Batch Processing Failed
                </h4>
                <p className="text-sm text-red-800 mb-3">
                  <strong>Batch ID:</strong> {currentBatch.batch_id}
                </p>
                <p className="text-sm text-red-800 leading-relaxed">
                  The batch processing encountered an error and could not be completed. 
                  {currentBatch.processing_notes && (
                    <>
                      <br /><strong>Error Details:</strong> {currentBatch.processing_notes}
                    </>
                  )}
                </p>
                <div className="mt-4 p-3 bg-red-100 rounded-lg">
                  <p className="text-sm text-red-700">
                    💡 <strong>Next Steps:</strong> Please check your Excel file format and try uploading again. 
                    Contact support if the issue persists.
                  </p>
                </div>
              </div>
            </div>
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
      
      {/* Vehicle Error Details Modal */}
      <VehicleErrorDetailsModal />
    </>
  );
};

export default VehicleBulkUploadModal;
