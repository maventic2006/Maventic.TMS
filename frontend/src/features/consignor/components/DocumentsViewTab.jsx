import React, { useState } from "react";
import {
  FileText,
  Calendar,
  CheckCircle,
  AlertCircle,
  XCircle,
  Download,
  Eye,
  X,
} from "lucide-react";
import api from "../../../utils/api";

const DocumentsViewTab = ({ consignor }) => {
  const documents = consignor?.documents || [];
  const [previewDocument, setPreviewDocument] = useState(null);
  const [loadingDocument, setLoadingDocument] = useState(null);

  // Check if document is expired
  const isExpired = (validTo) => {
    if (!validTo) return false;
    return new Date(validTo) < new Date();
  };

  // Check if document is expiring soon (within 30 days)
  const isExpiringSoon = (validTo) => {
    if (!validTo) return false;
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const validToDate = new Date(validTo);
    return validToDate > new Date() && validToDate <= thirtyDaysFromNow;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get document status badge
  const getDocumentStatusBadge = (document) => {
    if (isExpired(document.validTo)) {
      return {
        label: "Expired",
        className: "bg-red-100 text-red-700",
        icon: XCircle,
      };
    } else if (isExpiringSoon(document.validTo)) {
      return {
        label: "Expiring Soon",
        className: "bg-yellow-100 text-yellow-700",
        icon: AlertCircle,
      };
    } else if (document.status === true || document.status === "ACTIVE") {
      return {
        label: "Active",
        className: "bg-green-100 text-green-700",
        icon: CheckCircle,
      };
    } else {
      return {
        label: document.status || "Unknown",
        className: "bg-gray-100 text-gray-700",
        icon: AlertCircle,
      };
    }
  };

  // Handle view document
  const handleViewDocument = async (documentUniqueId, fileName, fileType) => {
    try {
      setLoadingDocument(documentUniqueId);
      const response = await api.get(
        `/consignors/${consignor.customer_id}/documents/${documentUniqueId}/download`,
        { responseType: "blob" }
      );

      // Create blob URL for preview
      const blob = new Blob([response.data], { type: fileType });
      const blobUrl = window.URL.createObjectURL(blob);

      setPreviewDocument({
        documentUniqueId,
        fileName,
        fileType,
        blobUrl,
      });
    } catch (error) {
      console.error("Error viewing document:", error);
      alert("Failed to load document. Please try again.");
    } finally {
      setLoadingDocument(null);
    }
  };

  // Handle download document
  const handleDownloadDocument = async (
    documentUniqueId,
    fileName,
    fileType
  ) => {
    try {
      setLoadingDocument(documentUniqueId);
      const response = await api.get(
        `/consignors/${consignor.customer_id}/documents/${documentUniqueId}/download`,
        { responseType: "blob" }
      );

      // Create download link
      const blob = new Blob([response.data], { type: fileType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || "document";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading document:", error);
      alert("Failed to download document. Please try again.");
    } finally {
      setLoadingDocument(null);
    }
  };

  // Close preview modal
  const closePreview = () => {
    if (previewDocument?.blobUrl) {
      window.URL.revokeObjectURL(previewDocument.blobUrl);
    }
    setPreviewDocument(null);
  };

  return (
    <div className="p-6">
      {/* Documents List */}
      {documents.length === 0 ? (
        <div className="bg-gradient-to-r from-gray-50/50 to-slate-50/50 rounded-2xl p-12 text-center border border-gray-100/50">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-sm font-medium text-gray-600 mb-2">
            No documents found
          </p>
          <p className="text-xs text-gray-500">
            Document information will appear here once uploaded
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {documents.map((document, index) => {
            const statusBadge = getDocumentStatusBadge(document);
            const StatusIcon = statusBadge.icon;
            const hasFile = document.documentId && document.fileName;

            return (
              <div
                key={index}
                className="bg-gradient-to-r from-orange-50/50 to-amber-50/50 rounded-2xl p-6 border border-orange-100/50"
              >
                {/* Document Header */}
                <div className="flex items-center gap-4 mb-6">
                  {/* Document Icon */}
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>

                  {/* Document Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-base font-semibold text-gray-800">
                        {document.documentTypeName || "Unknown Document"}
                      </h4>
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${statusBadge.className}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusBadge.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {document.documentNumber || "No document number"}
                    </p>
                  </div>
                </div>

                {/* Document Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  {/* Document Type ID */}
                  {/* {document.documentType && (
                    <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
                      <label className="text-xs font-semibold text-[#4A5568] uppercase tracking-wide block mb-2">
                        Type ID
                      </label>
                      <p className="text-sm font-medium text-[#0D1A33]">
                        {document.documentType}
                      </p>
                    </div>
                  )} */}

                  {/* Valid From */}
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
                    <label className="text-xs font-semibold text-[#4A5568] uppercase tracking-wide mb-2 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Valid From
                    </label>
                    <p className="text-sm font-medium text-[#0D1A33]">
                      {formatDate(document.validFrom)}
                    </p>
                  </div>

                  {/* Valid To */}
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
                    <label className="text-xs font-semibold text-[#4A5568] uppercase tracking-wide mb-2 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Valid To
                    </label>
                    <p
                      className={`text-sm font-medium ${
                        isExpired(document.validTo)
                          ? "text-red-600 font-semibold"
                          : isExpiringSoon(document.validTo)
                          ? "text-yellow-600 font-semibold"
                          : "text-[#0D1A33]"
                      }`}
                    >
                      {formatDate(document.validTo)}
                    </p>
                  </div>

                  {/* File Name (if uploaded) */}
                  {hasFile && (
                    <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
                      <label className="text-xs font-semibold text-[#4A5568] uppercase tracking-wide block mb-2">
                        File Name
                      </label>
                      <p className="text-sm font-medium text-[#0D1A33] truncate">
                        {document.fileName}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons - Only show if file is uploaded */}
                {hasFile && (
                  <div className="flex gap-3">
                    <button
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() =>
                        handleViewDocument(
                          document.documentUniqueId,
                          document.fileName,
                          document.fileType
                        )
                      }
                      disabled={loadingDocument === document.documentUniqueId}
                    >
                      {loadingDocument === document.documentUniqueId ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Loading...
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-2" />
                          View Document
                        </>
                      )}
                    </button>
                    <button
                      className="flex items-center px-4 py-2 bg-transparent text-blue-600 border border-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() =>
                        handleDownloadDocument(
                          document.documentUniqueId,
                          document.fileName,
                          document.fileType
                        )
                      }
                      disabled={loadingDocument === document.documentUniqueId}
                    >
                      {loadingDocument === document.documentUniqueId ? (
                        <>
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                          Loading...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* No file message */}
                {/* {!hasFile && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Document metadata only - No file uploaded yet
                    </p>
                  </div>
                )} */}
              </div>
            );
          })}
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDocument && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {previewDocument.fileName}
                </h3>
                <p className="text-sm text-gray-600">
                  {previewDocument.fileType}
                </p>
              </div>
              <button
                onClick={closePreview}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-6">
              {previewDocument.fileType?.includes("image") ? (
                <img
                  src={previewDocument.blobUrl}
                  alt={previewDocument.fileName}
                  className="max-w-full h-auto mx-auto"
                />
              ) : previewDocument.fileType?.includes("pdf") ? (
                <iframe
                  src={previewDocument.blobUrl}
                  className="w-full h-[70vh] border-0"
                  title={previewDocument.fileName}
                />
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Preview not available for this file type
                  </p>
                  <button
                    onClick={() =>
                      handleDownloadDocument(
                        previewDocument.documentUniqueId,
                        previewDocument.fileName,
                        previewDocument.fileType
                      )
                    }
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download File
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsViewTab;
