import React, { useState, useEffect } from "react";
import {
  FileText,
  Calendar,
  Building,
  CheckCircle,
  XCircle,
  Upload,
  Plus,
  Download,
  Eye,
  Trash2,
  AlertTriangle,
  X,
} from "lucide-react";
import { CustomSelect } from "../../../components/ui/Select";
import { formatDate } from "../../../utils/helpers";
import api from "../../../utils/api";

const InfoField = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-xs font-semibold text-[#4A5568] uppercase tracking-wide">
      {label}
    </p>
    <p className="text-sm font-medium text-[#0D1A33]">{value || "N/A"}</p>
  </div>
);

const DocumentsViewTab = ({ consignor, isEditMode }) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [newDocument, setNewDocument] = useState({
    documentType: "",
    documentNumber: "",
    issuedDate: "",
    expiryDate: "",
    issuingAuthority: "",
    remarks: "",
  });

  if (isEditMode) {
    return (
      <div className="text-center py-12">
        <p className="text-[#4A5568]">Edit mode for Documents coming soon...</p>
      </div>
    );
  }

  const documents = consignor?.documents || [];

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.floor(
      (expiry - today) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUploadDocument = () => {
    // TODO: Implement API call to upload document
    console.log("Uploading document:", newDocument, selectedFile);
    setShowUploadModal(false);
    // Reset form
    setNewDocument({
      documentType: "",
      documentNumber: "",
      issuedDate: "",
      expiryDate: "",
      issuingAuthority: "",
      remarks: "",
    });
    setSelectedFile(null);
  };

  const handlePreviewDocument = async (doc) => {
    try {
      // Use documentUniqueId which is the correct field for document lookup
      // The backend service expects document_unique_id, not document_id
      const documentId = doc.documentUniqueId || doc.document_unique_id;
      
      if (!documentId) {
        console.error("❌ Document unique ID not found:", doc);
        alert("Document ID is missing. Cannot preview document.");
        return;
      }
      
      console.log(`📄 Previewing document: ${documentId} for customer: ${consignor.customer_id}`);
      console.log('📋 Full document object:', doc);
      
      // Use axios instance with proper authentication instead of fetch
      const response = await api.get(
        `/consignors/${consignor.customer_id}/documents/${documentId}/download`,
        { 
          responseType: 'arraybuffer',
          timeout: 10000
        }
      );

      const base64String = btoa(
        new Uint8Array(response.data).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );

      // Get file type from response headers or determine from file name
      const contentType = response.headers['content-type'] || 
        doc.file_type || "application/octet-stream";

      setPreviewDocument({
        fileName: doc.file_name || doc.document_type || "Document",
        fileType: contentType,
        fileData: base64String,
      });
    } catch (error) {
      console.error("Error fetching document for preview:", error);
      alert("Failed to load document for preview");
    }
  };

  const handleDownloadDocument = async (doc) => {
    try {
      // Use documentUniqueId which is the correct field for document lookup
      const documentId = doc.documentUniqueId || doc.document_unique_id;
      
      if (!documentId) {
        console.error("❌ Document unique ID not found:", doc);
        alert("Document ID is missing. Cannot download document.");
        return;
      }
      
      console.log(`📥 Downloading document: ${documentId} for customer: ${consignor.customer_id}`);
      console.log('📋 Full document object:', doc);
      
      // Use axios instance with proper authentication instead of fetch
      const response = await api.get(
        `/consignors/${consignor.customer_id}/documents/${documentId}/download`,
        { responseType: 'blob' }
      );

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = doc.file_name || 
        `${doc.document_type}_${doc.document_number}` ||
        "document";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading document:", error);
      alert("Failed to download document");
    }
  };

  const closePreview = () => {
    setPreviewDocument(null);
  };

  // ESC key support for modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        closePreview();
      }
    };

    if (previewDocument) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [previewDocument]);

  // Mock statistics
  const totalDocs = documents.length;
  const expiredDocs = documents.filter((doc) =>
    isExpired(doc.valid_to)
  ).length;
  const expiringSoonDocs = documents.filter((doc) =>
    isExpiringSoon(doc.valid_to)
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
        <div>
          <h3 className="text-lg font-bold text-[#0D1A33]">
            Consignor Documents
          </h3>
          <p className="text-sm text-[#4A5568] mt-1">
            Manage all consignor related documents and certificates
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg transition-all duration-200 text-sm font-semibold"
        >
          <Upload className="h-4 w-4" />
          Upload Document
        </button>
      </div>

      {/* Document Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#DBEAFE] rounded-lg p-4 border border-[#1D4ED8]">
          <p className="text-xs font-semibold text-[#1D4ED8] uppercase tracking-wide mb-1">
            Total Documents
          </p>
          <p className="text-2xl font-bold text-[#1D4ED8]">{totalDocs}</p>
        </div>
        <div className="bg-[#FEF3C7] rounded-lg p-4 border border-[#F59E0B]">
          <p className="text-xs font-semibold text-[#F59E0B] uppercase tracking-wide mb-1">
            Expiring Soon
          </p>
          <p className="text-2xl font-bold text-[#F59E0B]">
            {expiringSoonDocs}
          </p>
          <p className="text-xs text-[#F59E0B] mt-1">Within 30 days</p>
        </div>
        <div className="bg-[#FEE2E2] rounded-lg p-4 border border-[#EF4444]">
          <p className="text-xs font-semibold text-[#EF4444] uppercase tracking-wide mb-1">
            Expired
          </p>
          <p className="text-2xl font-bold text-[#EF4444]">{expiredDocs}</p>
          <p className="text-xs text-[#EF4444] mt-1">Requires renewal</p>
        </div>
      </div>

      {/* Documents List */}
      {documents.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-[#E5E7EB]">
          <FileText className="h-16 w-16 text-[#E5E7EB] mx-auto mb-4" />
          <p className="text-[#4A5568] font-medium">No documents found</p>
          <p className="text-sm text-[#4A5568] mt-2">
            Click "Upload Document" to add the first document
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {documents.map((doc, index) => {
            const expired = isExpired(doc.valid_to);
            const expiringSoon = isExpiringSoon(doc.valid_to);

            return (
              <div
                key={index}
                className="bg-white rounded-lg border border-[#E5E7EB] p-6 hover:shadow-md transition-all duration-200"
              >
                {/* Document Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#F3F4F6] rounded-lg">
                      <FileText className="h-5 w-5 text-[#6B7280]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#0D1A33] text-sm">
                        {doc.document_type || doc.documentType || "Untitled Document"}
                      </h4>
                      <p className="text-xs text-[#6B7280] mt-1">
                        {doc.document_number || doc.documentNumber || "No document number"}
                      </p>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  {expired ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                      <XCircle className="h-3 w-3" />
                      Expired
                    </span>
                  ) : expiringSoon ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                      <AlertTriangle className="h-3 w-3" />
                      Expiring Soon
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      <CheckCircle className="h-3 w-3" />
                      Active
                    </span>
                  )}
                </div>

                {/* Document Details */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <InfoField 
                    label="Valid From" 
                    value={doc.valid_from ? formatDate(doc.valid_from) : "Not specified"} 
                  />
                  <InfoField 
                    label="Valid To" 
                    value={doc.valid_to ? formatDate(doc.valid_to) : "Not specified"} 
                  />
                  <InfoField 
                    label="Country" 
                    value={doc.country || "Not specified"} 
                  />
                  <InfoField 
                    label="Status" 
                    value={doc.status || "Not specified"} 
                  />
                  <InfoField 
                    label="File Name" 
                    value={doc.file_name || "Not available"} 
                  />
                  <InfoField 
                    label="File Type" 
                    value={doc.file_type || "Not available"} 
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-4 border-t border-[#F3F4F6]">
                  <button
                    onClick={() => handlePreviewDocument(doc)}
                    className="flex items-center gap-2 px-3 py-1.5 text-[#6366F1] border border-[#6366F1] rounded-lg hover:bg-[#6366F1] hover:text-white transition-colors text-xs font-medium"
                  >
                    <Eye className="h-3 w-3" />
                    Preview
                  </button>
                  <button
                    onClick={() => handleDownloadDocument(doc)}
                    className="flex items-center gap-2 px-3 py-1.5 text-[#10B981] border border-[#10B981] rounded-lg hover:bg-[#10B981] hover:text-white transition-colors text-xs font-medium"
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </button>
                </div>

                {/* Remarks */}
                {doc.remarks && (
                  <div className="mt-4 p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                    <p className="text-xs font-semibold text-[#4A5568] uppercase tracking-wide mb-1">
                      Remarks
                    </p>
                    <p className="text-sm text-[#6B7280]">{doc.remarks}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB]">
              <h3 className="text-lg font-semibold text-[#0D1A33]">
                Upload New Document
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[#6B7280]" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-auto p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#4A5568] mb-2">
                    Document Type
                  </label>
                  <CustomSelect
                    value={newDocument.documentType}
                    onValueChange={(value) =>
                      setNewDocument({ ...newDocument, documentType: value })
                    }
                    placeholder="Select document type"
                  >
                    {/* TODO: Add actual document type options */}
                  </CustomSelect>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#4A5568] mb-2">
                    Document Number
                  </label>
                  <input
                    type="text"
                    value={newDocument.documentNumber}
                    onChange={(e) =>
                      setNewDocument({ ...newDocument, documentNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                    placeholder="Enter document number"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#4A5568] mb-2">
                      Issued Date
                    </label>
                    <input
                      type="date"
                      value={newDocument.issuedDate}
                      onChange={(e) =>
                        setNewDocument({ ...newDocument, issuedDate: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#4A5568] mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={newDocument.expiryDate}
                      onChange={(e) =>
                        setNewDocument({ ...newDocument, expiryDate: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4A5568] mb-2">
                    Issuing Authority
                  </label>
                  <input
                    type="text"
                    value={newDocument.issuingAuthority}
                    onChange={(e) =>
                      setNewDocument({ ...newDocument, issuingAuthority: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                    placeholder="Enter issuing authority"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4A5568] mb-2">
                    Upload File
                  </label>
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4A5568] mb-2">
                    Remarks (Optional)
                  </label>
                  <textarea
                    value={newDocument.remarks}
                    onChange={(e) =>
                      setNewDocument({ ...newDocument, remarks: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                    placeholder="Enter any additional remarks"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-[#E5E7EB] bg-[#F9FAFB]">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-6 py-2.5 border border-[#E5E7EB] text-[#4A5568] rounded-lg hover:bg-white transition-colors text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadDocument}
                className="px-6 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg transition-colors text-sm font-semibold"
              >
                Upload Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#E0E7FF] rounded-lg">
                  <FileText className="h-5 w-5 text-[#6366F1]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {previewDocument.fileName}
                </h3>
              </div>
              <button
                onClick={closePreview}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-auto p-4">
              {previewDocument.fileType?.startsWith("image/") ? (
                <img
                  src={`data:${previewDocument.fileType};base64,${previewDocument.fileData}`}
                  alt={previewDocument.fileName}
                  className="max-w-full h-auto mx-auto"
                />
              ) : previewDocument.fileType === "application/pdf" ? (
                <iframe
                  src={`data:application/pdf;base64,${previewDocument.fileData}`}
                  className="w-full h-[600px] border-0"
                  title={previewDocument.fileName}
                />
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Preview not available for this file type
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    You can still download the file
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
              <button
                onClick={closePreview}
                className="px-6 py-2.5 border border-[#E5E7EB] text-[#4A5568] rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsViewTab;
