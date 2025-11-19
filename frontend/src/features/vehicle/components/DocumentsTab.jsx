import React, { useState } from "react";
import { FileText, Upload, Eye, Trash2, Download, Check, X, AlertCircle } from "lucide-react";
import { useSelector } from "react-redux";
import { Button } from "../../../components/ui/Button";
import DocumentUploadModal from "./DocumentUploadModal";

const DocumentsTab = ({ formData, setFormData, errors = {} }) => {
  const { masterData } = useSelector((state) => state.vehicle);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);

  const documents = formData.documents || [];

  // Document type options from master data (centralized in backend)
  const documentTypes = masterData.documentTypes || [];
  
  // Debug logging
  console.log('📄 DocumentsTab - masterData:', masterData);
  console.log('📄 DocumentsTab - documentTypes:', documentTypes);
  console.log('📄 DocumentsTab - mandatory count:', documentTypes.filter(dt => dt.isMandatory).length);

  // Handle adding documents from modal
  const handleDocumentsAdd = (newDocuments) => {
    const updatedDocuments = [...documents, ...newDocuments];
    setFormData((prev) => ({
      ...prev,
      documents: updatedDocuments,
    }));
  };

  // Handle removing a document
  const handleRemoveDocument = (index) => {
    const updatedDocuments = documents.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      documents: updatedDocuments,
    }));
  };

  // Handle document preview
  const handlePreview = (doc) => {
    setPreviewDocument(doc);
  };

  // Handle document download
  const handleDownload = (doc) => {
    const blob = base64ToBlob(doc.fileData, doc.fileType);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Helper function to convert base64 to Blob
  const base64ToBlob = (base64, contentType) => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  };

  // Get document type label
  const getDocumentTypeLabel = (value) => {
    const docType = documentTypes.find((dt) => dt.value === value);
    return docType ? docType.label : value;
  };

  // Get file icon based on type
  const getFileIcon = (fileType) => {
    if (fileType.startsWith("image/")) {
      return "🖼️";
    } else if (fileType === "application/pdf") {
      return "📄";
    } else {
      return "📎";
    }
  };

  return (
    <div className="space-y-5">
      {/* Header with Upload Button */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-[#10B981]" />
          <h3 className="text-lg font-semibold text-gray-900">Vehicle Documents</h3>
          {documents.length > 0 && (
            <span className="px-2 py-1 bg-[#10B981] text-white text-xs font-medium rounded-full">
              {documents.length}
            </span>
          )}
        </div>
        <Button
          type="button"
          onClick={() => setIsUploadModalOpen(true)}
          className="bg-[#10B981] hover:bg-[#059669] text-white"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Documents
        </Button>
      </div>

      {/* Mandatory Documents Checklist */}
      {documentTypes.filter(dt => dt.isMandatory).length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Required Documents</h4>
          <div className="grid grid-cols-2 gap-2">
            {documentTypes
              .filter(dt => dt.isMandatory)
              .map(docType => {
                const isUploaded = documents.some(doc => doc.documentType === docType.value);
                return (
                  <div key={docType.value} className="flex items-center gap-2">
                    {isUploaded ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm ${isUploaded ? 'text-green-700' : 'text-gray-700'}`}>
                      {docType.label}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Validation Error Message */}
      {errors.documents && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-red-900 mb-1">Missing Required Documents</h4>
            <p className="text-sm text-red-700">{errors.documents}</p>
          </div>
        </div>
      )}

      {/* Documents Table */}
      {documents.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium mb-2">No documents uploaded yet</p>
          <p className="text-sm text-gray-500 mb-4">
            Click the "Upload Documents" button to add vehicle documents
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsUploadModalOpen(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Your First Document
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valid From
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valid To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Premium Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.map((doc, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{getFileIcon(doc.fileType)}</span>
                        <span>{getDocumentTypeLabel(doc.documentType)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {doc.fileName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {doc.referenceNumber || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {doc.documentProvider || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {doc.validFrom ? new Date(doc.validFrom).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {doc.validTo ? new Date(doc.validTo).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {doc.premiumAmount > 0 ? `$${doc.premiumAmount.toFixed(2)}` : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => handlePreview(doc)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Preview"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownload(doc)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveDocument(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Validation Error Summary */}
      {errors && typeof errors === "string" && (
        <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-700 flex items-center gap-2">
            {errors}
          </p>
        </div>
      )}

      {errors && errors._general && (
        <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-700 flex items-center gap-2">
            {errors._general}
          </p>
        </div>
      )}

      {/* Guidelines - Bottom Info Panel */}
      <div className="mt-6 bg-blue-50/50 border border-blue-200/50 rounded-lg p-3">
        <h4 className="text-xs font-semibold text-blue-900 mb-2">
          Document Guidelines:
        </h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Document Type, Valid From, Valid To, and Remarks are mandatory fields</li>
          <li>• Reference Number format: Policy/Permit Number (e.g., DDNP/50/1314/4345)</li>
          <li>• Document Provider: Specify insurance provider name or issuing authority</li>
          <li>• Coverage Type: Applicable specifically for insurance documents</li>
          <li>• Premium Amount: Enter the premium or fee amount for insurance/permits</li>
          <li>• Ensure validity dates are monitored to maintain compliance</li>
          <li>• Supported file formats: PDF, JPG, PNG, GIF, DOC, DOCX (Max size: 5MB per file)</li>
          <li>• You can upload multiple documents at once using the upload modal</li>
        </ul>
      </div>

      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSave={handleDocumentsAdd}
        existingDocuments={documents}
      />

      {/* Preview Modal */}
      {previewDocument && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setPreviewDocument(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Preview: {previewDocument.fileName}
              </h3>
              <button
                onClick={() => setPreviewDocument(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-2xl text-gray-600">×</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4">
              <div className="flex justify-center items-center bg-gray-100 rounded-lg p-4 min-h-[400px]">
                {previewDocument.fileType.startsWith("image/") ? (
                  <img
                    src={`data:${previewDocument.fileType};base64,${previewDocument.fileData}`}
                    alt={previewDocument.fileName}
                    className="max-w-full max-h-[600px] object-contain"
                  />
                ) : previewDocument.fileType === "application/pdf" ? (
                  <iframe
                    src={`data:application/pdf;base64,${previewDocument.fileData}`}
                    className="w-full h-[600px] border-0"
                    title={previewDocument.fileName}
                  />
                ) : (
                  <div className="text-center">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Preview not available for this file type</p>
                    <p className="text-sm text-gray-500 mt-2">{previewDocument.fileName}</p>
                    <Button
                      type="button"
                      onClick={() => handleDownload(previewDocument)}
                      className="mt-4"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download File
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsTab;