import React, { useState, useRef } from "react";
import { X, Upload, FileText, Trash2, Eye, AlertCircle } from "lucide-react";
import { useSelector } from "react-redux";
import { Country } from "country-state-city";
import { StatusSelect } from "../../../components/ui/Select";

const DocumentUploadModal = ({ isOpen, onClose, onSave, existingDocuments = [] }) => {
  const { masterData } = useSelector((state) => state.vehicle);
  
  // Debug logging
  console.log('🔧 DocumentUploadModal - masterData:', masterData);
  console.log('🔧 DocumentUploadModal - documentTypes:', masterData?.documentTypes);
  
  const [documents, setDocuments] = useState([]);
  const [currentDocument, setCurrentDocument] = useState({
    documentType: "",
    referenceNumber: "",
    vehicleMaintenanceId: "",
    permitCategory: "",
    permitCode: "",
    documentProvider: "",
    coverageType: "",
    premiumAmount: 0,
    validFrom: "",
    validTo: "",
    remarks: "",
    fileName: "",
    fileType: "",
    fileData: "",
  });
  const [previewDocument, setPreviewDocument] = useState(null);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  // Get all countries from country-state-city package
  const allCountries = Country.getAllCountries();

  // Reset modal state when it opens/closes
  React.useEffect(() => {
    if (isOpen) {
      // Reset to clean state when modal opens
      setDocuments([]);
      setCurrentDocument({
        documentType: "",
        referenceNumber: "",
        vehicleMaintenanceId: "",
        permitCategory: "",
        permitCode: "",
        documentProvider: "",
        coverageType: "",
        premiumAmount: 0,
        validFrom: "",
        validTo: "",
        remarks: "",
        fileName: "",
        fileType: "",
        fileData: "",
      });
      setErrors({});
      setPreviewDocument(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validateDocument = () => {
    const newErrors = {};

    if (!currentDocument.documentType) {
      newErrors.documentType = "Document type is required";
    }

    // Get the selected document type configuration
    const selectedDocType = masterData.documentTypes?.find(
      dt => dt.value === currentDocument.documentType
    );

    // Conditionally validate expiry dates if document type requires it
    if (selectedDocType?.isExpiryRequired) {
      if (!currentDocument.validFrom) {
        newErrors.validFrom = "Valid from date is required for this document type";
      }

      if (!currentDocument.validTo) {
        newErrors.validTo = "Valid to date is required for this document type";
      }

      // Validate date range
      if (currentDocument.validFrom && currentDocument.validTo) {
        if (new Date(currentDocument.validTo) < new Date(currentDocument.validFrom)) {
          newErrors.validTo = "Valid to date must be after valid from date";
        }
      }
    }

    if (!currentDocument.remarks) {
      newErrors.remarks = "Remarks are required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validation
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (file.size > maxSize) {
      setErrors((prev) => ({ ...prev, file: "File size must be less than 5MB" }));
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        file: "Only JPEG, PNG, GIF, PDF, DOC, and DOCX files are allowed",
      }));
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = () => {
        setCurrentDocument((prev) => ({
          ...prev,
          fileName: file.name,
          fileType: file.type,
          fileData: reader.result.split(",")[1], // Base64 without prefix
        }));
        setErrors((prev) => ({ ...prev, file: null }));
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setErrors((prev) => ({ ...prev, file: "Error uploading file: " + error.message }));
    }
  };

  const handleAddDocument = () => {
    if (!validateDocument()) return;

    setDocuments((prev) => [...prev, currentDocument]);
    
    // Reset current document
    setCurrentDocument({
      documentType: "",
      referenceNumber: "",
      vehicleMaintenanceId: "",
      permitCategory: "",
      permitCode: "",
      documentProvider: "",
      coverageType: "",
      premiumAmount: 0,
      validFrom: "",
      validTo: "",
      remarks: "",
      fileName: "",
      fileType: "",
      fileData: "",
    });
    
    setErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveDocument = (index) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePreview = (doc) => {
    setPreviewDocument(doc);
  };

  const handleSave = () => {
    onSave(documents);
    onClose();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files[0];
    if (file) {
      const fakeEvent = { target: { files: [file] } };
      handleFileUpload(fakeEvent);
    }
  };

  return (
    <>
      {/* Main Upload Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col mx-4">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0D1A33] to-[#1e3a5f] text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6" />
              <h2 className="text-xl font-bold">Upload Vehicle Documents</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Form */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Document Details</h3>

                {/* Document Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Type <span className="text-red-500">*</span>
                  </label>
                  <StatusSelect
                    value={currentDocument.documentType}
                    onChange={(value) => {
                      // Find the selected document type to check if expiry is required
                      const selectedDocType = masterData.documentTypes?.find(dt => dt.value === value);
                      setCurrentDocument((prev) => ({ 
                        ...prev, 
                        documentType: value,
                        // Clear dates if expiry not required
                        ...(selectedDocType && !selectedDocType.isExpiryRequired && {
                          validFrom: '',
                          validTo: ''
                        })
                      }));
                    }}
                    options={[
                      { value: "", label: "Select Document Type" },
                      ...(masterData.documentTypes || []).map(docType => ({
                        ...docType,
                        label: docType.isMandatory 
                          ? `${docType.label} (Required)` 
                          : docType.label
                      }))
                    ]}
                    placeholder="Select Document Type"
                    className="w-full"
                  />
                  {errors.documentType && (
                    <p className="text-xs text-red-500 mt-1">{errors.documentType}</p>
                  )}
                </div>

                {/* Reference Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reference Number
                  </label>
                  <input
                    type="text"
                    value={currentDocument.referenceNumber}
                    onChange={(e) =>
                      setCurrentDocument((prev) => ({ ...prev, referenceNumber: e.target.value }))
                    }
                    placeholder="Policy/Permit Number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                  />
                </div>

                {/* Document Provider */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Provider
                  </label>
                  <input
                    type="text"
                    value={currentDocument.documentProvider}
                    onChange={(e) =>
                      setCurrentDocument((prev) => ({ ...prev, documentProvider: e.target.value }))
                    }
                    placeholder="Insurance Provider / RTO"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                  />
                </div>

                {/* Coverage Type & Premium Amount */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Coverage Type
                    </label>
                    <input
                      type="text"
                      value={currentDocument.coverageType}
                      onChange={(e) =>
                        setCurrentDocument((prev) => ({ ...prev, coverageType: e.target.value }))
                      }
                      placeholder="Full/Third Party/Comprehensive"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Premium Amount
                    </label>
                    <input
                      type="number"
                      value={currentDocument.premiumAmount}
                      onChange={(e) =>
                        setCurrentDocument((prev) => ({
                          ...prev,
                          premiumAmount: parseFloat(e.target.value) || 0,
                        }))
                      }
                      placeholder="5000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                    />
                  </div>
                </div>

                {/* Valid From & Valid To - Conditionally required based on document type */}
                {(() => {
                  const selectedDocType = masterData.documentTypes?.find(
                    dt => dt.value === currentDocument.documentType
                  );
                  const isExpiryRequired = selectedDocType?.isExpiryRequired || false;
                  
                  return (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Valid From {isExpiryRequired && <span className="text-red-500">*</span>}
                        </label>
                        <input
                          type="date"
                          value={currentDocument.validFrom}
                          onChange={(e) =>
                            setCurrentDocument((prev) => ({ ...prev, validFrom: e.target.value }))
                          }
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] ${
                            errors.validFrom ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                        {errors.validFrom && (
                          <p className="text-xs text-red-500 mt-1">{errors.validFrom}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Valid To {isExpiryRequired && <span className="text-red-500">*</span>}
                        </label>
                        <input
                          type="date"
                          value={currentDocument.validTo}
                          onChange={(e) =>
                            setCurrentDocument((prev) => ({ ...prev, validTo: e.target.value }))
                          }
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] ${
                            errors.validTo ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                        {errors.validTo && (
                          <p className="text-xs text-red-500 mt-1">{errors.validTo}</p>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Remarks */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remarks <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={currentDocument.remarks}
                    onChange={(e) =>
                      setCurrentDocument((prev) => ({ ...prev, remarks: e.target.value }))
                    }
                    placeholder="Enter remarks"
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] ${
                      errors.remarks ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.remarks && (
                    <p className="text-xs text-red-500 mt-1">{errors.remarks}</p>
                  )}
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload File
                  </label>
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#10B981] transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-1">
                      {currentDocument.fileName || "Click to upload or drag and drop"}
                    </p>
                    <p className="text-xs text-gray-400">PDF, JPG, PNG, GIF, DOC, DOCX (max 5MB)</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileUpload}
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
                    className="hidden"
                  />
                  {errors.file && (
                    <p className="text-xs text-red-500 mt-1">{errors.file}</p>
                  )}
                </div>

                {/* Add Document Button */}
                <button
                  onClick={handleAddDocument}
                  className="w-full bg-[#10B981] text-white py-3 rounded-lg font-medium hover:bg-[#059669] transition-colors flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Add Document to List
                </button>
              </div>

              {/* Right: Document List */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Uploaded Documents ({documents.length})
                </h3>

                {documents.length === 0 ? (
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-12 text-center">
                    <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No documents uploaded yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Fill the form and click "Add Document" to begin
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {documents.map((doc, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-[#10B981]" />
                            <div>
                              <p className="font-medium text-gray-800">
                                {masterData.documentTypes?.find((t) => t.value === doc.documentType)
                                  ?.label || doc.documentType}
                              </p>
                              <p className="text-xs text-gray-500">{doc.fileName || "No file"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {doc.fileData && (
                              <button
                                onClick={() => handlePreview(doc)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleRemoveDocument(index)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          {doc.referenceNumber && (
                            <p>
                              <span className="font-medium">Ref:</span> {doc.referenceNumber}
                            </p>
                          )}
                          {doc.documentProvider && (
                            <p>
                              <span className="font-medium">Provider:</span> {doc.documentProvider}
                            </p>
                          )}
                          <p>
                            <span className="font-medium">Valid:</span> {doc.validFrom} to{" "}
                            {doc.validTo}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <AlertCircle className="w-4 h-4" />
              <span>{documents.length} document(s) ready to save</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={documents.length === 0}
                className="px-6 py-2 bg-[#10B981] text-white rounded-lg font-medium hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save All Documents
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewDocument && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setPreviewDocument(null)}
          />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden mx-4">
            <div className="bg-[#0D1A33] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Document Preview</h3>
              <button
                onClick={() => setPreviewDocument(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 max-h-[calc(90vh-80px)] overflow-auto">
              {previewDocument.fileType?.startsWith("image/") ? (
                <img
                  src={`data:${previewDocument.fileType};base64,${previewDocument.fileData}`}
                  alt={previewDocument.fileName}
                  className="max-w-full h-auto mx-auto"
                />
              ) : previewDocument.fileType === "application/pdf" ? (
                <iframe
                  src={`data:application/pdf;base64,${previewDocument.fileData}`}
                  className="w-full h-[70vh] border-0"
                  title="PDF Preview"
                />
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-600">Preview not available for this file type</p>
                  <p className="text-sm text-gray-400 mt-1">{previewDocument.fileName}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DocumentUploadModal;
