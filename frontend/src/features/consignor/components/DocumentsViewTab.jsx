import React from "react";
import {
  FileText,
  Calendar,
  CheckCircle,
  AlertCircle,
  XCircle,
  Download,
  Eye,
} from "lucide-react";

const DocumentsViewTab = ({ consignor }) => {
  const documents = consignor?.documents || [];

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
    if (isExpired(document.valid_to)) {
      return {
        label: "Expired",
        className: "bg-red-100 text-red-700",
        icon: XCircle,
      };
    } else if (isExpiringSoon(document.valid_to)) {
      return {
        label: "Expiring Soon",
        className: "bg-yellow-100 text-yellow-700",
        icon: AlertCircle,
      };
    } else if (document.status === "ACTIVE") {
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
                        {document.document_type || "Unknown Document"}
                      </h4>
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${statusBadge.className}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusBadge.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {document.document_number || "No document number"}
                    </p>
                  </div>
                </div>

                {/* Document Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  {/* Document ID */}
                  {document.document_id && (
                    <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
                      <label className="text-xs font-semibold text-[#4A5568] uppercase tracking-wide block mb-2">
                        Document ID
                      </label>
                      <p className="text-sm font-medium text-[#0D1A33]">
                        {document.document_id}
                      </p>
                    </div>
                  )}

                  {/* Document Type ID */}
                  {document.document_type_id && (
                    <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
                      <label className="text-xs font-semibold text-[#4A5568] uppercase tracking-wide block mb-2">
                        Type ID
                      </label>
                      <p className="text-sm font-medium text-[#0D1A33]">
                        {document.document_type_id}
                      </p>
                    </div>
                  )}

                  {/* Valid From */}
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
                    <label className="text-xs font-semibold text-[#4A5568] uppercase tracking-wide mb-2 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Valid From
                    </label>
                    <p className="text-sm font-medium text-[#0D1A33]">
                      {formatDate(document.valid_from)}
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
                        isExpired(document.valid_to)
                          ? "text-red-600 font-semibold"
                          : isExpiringSoon(document.valid_to)
                          ? "text-yellow-600 font-semibold"
                          : "text-[#0D1A33]"
                      }`}
                    >
                      {formatDate(document.valid_to)}
                    </p>
                  </div>
                </div>

                {/* Document Validity Status */}
                {document.valid_to && (
                  <div
                    className={`p-3 rounded-lg border flex items-center gap-2 mb-4 ${
                      isExpired(document.valid_to)
                        ? "bg-red-50 border-red-200"
                        : isExpiringSoon(document.valid_to)
                        ? "bg-yellow-50 border-yellow-200"
                        : "bg-green-50 border-green-200"
                    }`}
                  >
                    {isExpired(document.valid_to) ? (
                      <>
                        <XCircle className="w-4.5 h-4.5 text-red-600" />
                        <span className="text-sm text-red-700">
                          This document has expired on{" "}
                          {formatDate(document.valid_to)}
                        </span>
                      </>
                    ) : isExpiringSoon(document.valid_to) ? (
                      <>
                        <AlertCircle className="w-4.5 h-4.5 text-yellow-600" />
                        <span className="text-sm text-yellow-700">
                          This document will expire on{" "}
                          {formatDate(document.valid_to)} (within 30 days)
                        </span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4.5 h-4.5 text-green-600" />
                        <span className="text-sm text-green-700">
                          Document is valid until{" "}
                          {formatDate(document.valid_to)}
                        </span>
                      </>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    onClick={async () => {
                      try {
                        const apiUrl =
                          import.meta.env.VITE_API_URL ||
                          "http://localhost:5000";
                        const url = `${apiUrl}/api/consignors/${consignor.customer_id}/documents/${document.document_unique_id}/download`;
                        window.open(url, "_blank");
                      } catch (error) {
                        console.error("Error viewing document:", error);
                        alert("Failed to view document");
                      }
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Document
                  </button>
                  <button
                    className="flex items-center px-4 py-2 bg-transparent text-blue-600 border border-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
                    onClick={async () => {
                      try {
                        const apiUrl =
                          import.meta.env.VITE_API_URL ||
                          "http://localhost:5000";
                        const response = await fetch(
                          `${apiUrl}/api/consignors/${consignor.customer_id}/documents/${document.document_unique_id}/download`,
                          { credentials: "include" }
                        );

                        if (!response.ok) {
                          throw new Error(
                            `HTTP error! status: ${response.status}`
                          );
                        }

                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = document.document_number || "document";
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url);
                      } catch (error) {
                        console.error("Error downloading document:", error);
                        alert("Failed to download document");
                      }
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DocumentsViewTab;
