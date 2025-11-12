import React, { useState } from "react";
import {
  FileText,
  Upload,
  Calendar,
  AlertTriangle,
  CheckCircle,
  X,
  Plus,
  Shield,
  Building,
} from "lucide-react";

const DocumentsEditTab = ({
  formData,
  onInputChange,
  validationErrors = {},
}) => {
  const [uploadProgress, setUploadProgress] = useState({});

  // Helper function to get field error
  const getFieldError = (fieldPath) => {
    return validationErrors[fieldPath];
  };

  // Helper function to render input with error
  const renderInput = (
    name,
    label,
    type = "text",
    placeholder = "",
    icon = null,
    required = false
  ) => {
    const error = getFieldError(name);

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {icon && <span className="mr-2">{icon}</span>}
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative">
          <input
            type={type}
            name={name}
            value={formData[name] || ""}
            onChange={onInputChange}
            placeholder={placeholder}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              error
                ? "border-red-500 bg-red-50"
                : "border-gray-300 focus:border-blue-500"
            }`}
          />
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  };

  // Helper function to handle file upload
  const handleFileUpload = (documentType, file) => {
    if (!file) return;

    // Simulate upload progress
    setUploadProgress((prev) => ({ ...prev, [documentType]: 0 }));

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        const currentProgress = prev[documentType] || 0;
        if (currentProgress >= 100) {
          clearInterval(interval);
          return prev;
        }
        return { ...prev, [documentType]: currentProgress + 10 };
      });
    }, 100);

    // Simulate successful upload after 1 second
    setTimeout(() => {
      setUploadProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[documentType];
        return newProgress;
      });

      // Update form data with file information
      const event = {
        target: {
          name: `${documentType}_file`,
          value: file.name,
        },
      };
      onInputChange(event);
    }, 1000);
  };

  // Document types configuration
  const documentTypes = [
    {
      key: "license",
      label: "Warehouse License",
      numberField: "license_number",
      expiryField: "license_expiry",
      fileField: "license_file",
      icon: <Building className="h-4 w-4" />,
      required: true,
      description: "Official warehouse operating license",
    },
    {
      key: "fire_safety",
      label: "Fire Safety Certificate",
      numberField: "fire_safety_cert",
      expiryField: "fire_safety_expiry",
      fileField: "fire_safety_file",
      icon: <Shield className="h-4 w-4" />,
      required: true,
      description: "Fire safety compliance certificate",
    },
    {
      key: "environmental",
      label: "Environmental Clearance",
      numberField: "env_clearance_cert",
      expiryField: "env_clearance_expiry",
      fileField: "env_clearance_file",
      icon: <Shield className="h-4 w-4" />,
      required: false,
      description: "Environmental compliance certificate",
    },
    {
      key: "insurance",
      label: "Insurance Certificate",
      numberField: "insurance_cert",
      expiryField: "insurance_expiry",
      fileField: "insurance_file",
      icon: <Shield className="h-4 w-4" />,
      required: true,
      description: "Warehouse insurance coverage certificate",
    },
  ];

  // Helper function to get document status
  const getDocumentStatus = (expiryDate) => {
    if (!expiryDate) return { status: "unknown", color: "gray" };

    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return { status: "expired", color: "red" };
    } else if (daysUntilExpiry <= 30) {
      return { status: "expiring", color: "yellow" };
    } else {
      return { status: "valid", color: "green" };
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Document Upload Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Document Management
            </h3>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-8">
            {documentTypes.map((docType) => {
              const statusInfo = getDocumentStatus(
                formData[docType.expiryField]
              );
              const progress = uploadProgress[docType.key];

              return (
                <div
                  key={docType.key}
                  className="bg-gray-50 rounded-lg border border-gray-200 p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`p-2 rounded-lg ${
                        statusInfo.color === "green"
                          ? "bg-green-100"
                          : statusInfo.color === "yellow"
                          ? "bg-yellow-100"
                          : statusInfo.color === "red"
                          ? "bg-red-100"
                          : "bg-gray-100"
                      }`}
                    >
                      <span
                        className={`${
                          statusInfo.color === "green"
                            ? "text-green-600"
                            : statusInfo.color === "yellow"
                            ? "text-yellow-600"
                            : statusInfo.color === "red"
                            ? "text-red-600"
                            : "text-gray-600"
                        }`}
                      >
                        {docType.icon}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {docType.label}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {docType.description}
                      </p>
                    </div>
                    {docType.required && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                        Required
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Document Number */}
                    <div>
                      {renderInput(
                        docType.numberField,
                        "Document Number",
                        "text",
                        "Enter document number",
                        null,
                        docType.required
                      )}
                    </div>

                    {/* Expiry Date */}
                    <div>
                      {renderInput(
                        docType.expiryField,
                        "Expiry Date",
                        "date",
                        "",
                        <Calendar className="h-4 w-4 text-gray-400" />,
                        docType.required
                      )}
                      {formData[docType.expiryField] && (
                        <div className="mt-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              statusInfo.color === "green"
                                ? "bg-green-100 text-green-800"
                                : statusInfo.color === "yellow"
                                ? "bg-yellow-100 text-yellow-800"
                                : statusInfo.color === "red"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {statusInfo.status === "valid" && (
                              <CheckCircle className="h-3 w-3" />
                            )}
                            {statusInfo.status === "expiring" && (
                              <AlertTriangle className="h-3 w-3" />
                            )}
                            {statusInfo.status === "expired" && (
                              <AlertTriangle className="h-3 w-3" />
                            )}

                            {statusInfo.status === "valid" && "Valid"}
                            {statusInfo.status === "expiring" &&
                              "Expiring Soon"}
                            {statusInfo.status === "expired" && "Expired"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* File Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Document File
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={(e) =>
                            handleFileUpload(docType.key, e.target.files[0])
                          }
                          className="hidden"
                          id={`file-${docType.key}`}
                        />
                        <label
                          htmlFor={`file-${docType.key}`}
                          className="w-full flex items-center justify-center px-4 py-3 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                        >
                          <div className="text-center">
                            <Upload className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                            <span className="text-sm text-gray-600">
                              {formData[docType.fileField]
                                ? "Replace File"
                                : "Upload File"}
                            </span>
                          </div>
                        </label>

                        {progress !== undefined && (
                          <div className="mt-2">
                            <div className="bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Uploading... {progress}%
                            </p>
                          </div>
                        )}

                        {formData[docType.fileField] && (
                          <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span>{formData[docType.fileField]}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const event = {
                                  target: {
                                    name: docType.fileField,
                                    value: "",
                                  },
                                };
                                onInputChange(event);
                              }}
                              className="ml-auto text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Document Guidelines */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Document Requirements
            </h3>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">
                Supported Formats
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  PDF documents (preferred)
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-500" />
                  Image files (JPG, PNG)
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-500" />
                  Document files (DOC, DOCX)
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Requirements</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Maximum file size: 10MB
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Clear, readable documents
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Valid expiry dates
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Original or certified copies
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="p-1 bg-blue-100 rounded">
            <FileText className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-800 mb-1">
              Document Upload Guidelines
            </h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>
                • All required documents must be uploaded for warehouse approval
              </li>
              <li>• Ensure expiry dates are current and documents are valid</li>
              <li>• Upload clear, high-quality scans or photos of documents</li>
              <li>
                • Document numbers should match the physical documents exactly
              </li>
              <li>
                • Replace expired documents immediately to maintain compliance
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsEditTab;
