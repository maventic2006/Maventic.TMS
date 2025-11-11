import React, { useState } from "react";
import {
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  Hash,
  AlertTriangle,
  MapPin,
  ChevronDown,
  ChevronUp,
  Eye,
  Download,
  X as CloseIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Country, State } from "country-state-city";
import { getPageTheme } from "../../../theme.config";

const DocumentsViewTab = ({ driver }) => {
  const theme = getPageTheme("tab") || {};
  const documents = driver?.documents || [];
  const [expandedDocuments, setExpandedDocuments] = useState({});
  const [previewDocument, setPreviewDocument] = useState(null);

  const toggleDocument = (index) => {
    setExpandedDocuments((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const safeTheme = {
    colors: {
      text: {
        primary: theme.colors?.text?.primary || "#111827",
        secondary: theme.colors?.text?.secondary || "#6B7280",
      },
      status: {
        success: theme.colors?.status?.success || "#10B981",
        error: theme.colors?.status?.error || "#EF4444",
        warning: theme.colors?.status?.warning || "#F59E0B",
      },
      card: {
        background: theme.colors?.card?.background || "#FFFFFF",
        border: theme.colors?.card?.border || "#E5E7EB",
      },
    },
  };

  const getCountryName = (countryCode) => {
    if (!countryCode) return "N/A";
    const country = Country.getCountryByCode(countryCode);
    return country ? country.name : countryCode;
  };

  const getStateName = (countryCode, stateCode) => {
    if (!countryCode || !stateCode) return "N/A";
    const state = State.getStateByCodeAndCountry(stateCode, countryCode);
    return state ? state.name : stateCode;
  };

  const getStatusColor = (status) => {
    return status
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-red-100 text-red-800 border-red-200";
  };

  const getStatusIcon = (status) => {
    return status ? CheckCircle : XCircle;
  };

  const isDocumentExpired = (validTo) => {
    if (!validTo) return false;
    const today = new Date();
    const expiryDate = new Date(validTo);
    return expiryDate < today;
  };

  const isDocumentExpiringSoon = (validTo) => {
    if (!validTo) return false;
    const today = new Date();
    const expiryDate = new Date(validTo);
    const daysUntilExpiry = Math.ceil(
      (expiryDate - today) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handlePreview = (document) => {
    if (document.fileData) {
      setPreviewDocument(document);
    }
  };

  const handleDownload = (document) => {
    if (!document.fileData || !document.fileName) return;

    // Create a download link
    const link = document.createElement("a");
    link.href = document.fileData;
    link.download = document.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const closePreview = () => {
    setPreviewDocument(null);
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-500 mb-2">
          No Documents Found
        </h3>
        <p className="text-gray-400">
          No document information has been added yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-2">
      {documents.map((document, index) => {
        const StatusIcon = getStatusIcon(document.status);
        const isExpired = isDocumentExpired(document.validTo);
        const isExpiringSoon = isDocumentExpiringSoon(document.validTo);
        const isExpanded = expandedDocuments[index];

        return (
          <div
            key={document.documentId || index}
            className="border rounded-lg overflow-hidden shadow-sm"
            style={{
              borderColor: safeTheme.colors.card.border,
              backgroundColor: safeTheme.colors.card.background,
            }}
          >
            <button
              onClick={() => toggleDocument(index)}
              className="w-full px-6 py-4 flex items-start justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: safeTheme.colors.text.primary }}
                  >
                    {document.documentType || "N/A"}
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: safeTheme.colors.text.secondary }}
                  >
                    {document.documentNumber || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(
                    document.status
                  )}`}
                >
                  <StatusIcon className="w-3 h-3" />
                  {document.status ? "Active" : "Inactive"}
                </span>
                {isExpired && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium border border-red-200 bg-red-100 text-red-800 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Expired
                  </span>
                )}
                {!isExpired && isExpiringSoon && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium border border-orange-200 bg-orange-100 text-orange-800 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Expiring Soon
                  </span>
                )}
                {isExpanded ? (
                  <ChevronUp
                    className="h-5 w-5"
                    style={{ color: safeTheme.colors.text.secondary }}
                  />
                ) : (
                  <ChevronDown
                    className="h-5 w-5"
                    style={{ color: safeTheme.colors.text.secondary }}
                  />
                )}
              </div>
            </button>

            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div
                    className="px-6 py-4 border-t"
                    style={{ borderColor: safeTheme.colors.card.border }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Hash
                              className="w-4 h-4"
                              style={{ color: safeTheme.colors.text.secondary }}
                            />
                            <label
                              className="text-sm font-medium"
                              style={{ color: safeTheme.colors.text.secondary }}
                            >
                              Document Number
                            </label>
                          </div>
                          <p
                            className="text-sm font-medium"
                            style={{ color: safeTheme.colors.text.primary }}
                          >
                            {document.documentNumber || "N/A"}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin
                              className="w-4 h-4"
                              style={{ color: safeTheme.colors.text.secondary }}
                            />
                            <label
                              className="text-sm font-medium"
                              style={{ color: safeTheme.colors.text.secondary }}
                            >
                              Issuing Country
                            </label>
                          </div>
                          <p
                            className="text-sm font-medium"
                            style={{ color: safeTheme.colors.text.primary }}
                          >
                            {getCountryName(document.issuingCountry)}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin
                              className="w-4 h-4"
                              style={{ color: safeTheme.colors.text.secondary }}
                            />
                            <label
                              className="text-sm font-medium"
                              style={{ color: safeTheme.colors.text.secondary }}
                            >
                              Issuing State
                            </label>
                          </div>
                          <p
                            className="text-sm font-medium"
                            style={{ color: safeTheme.colors.text.primary }}
                          >
                            {getStateName(
                              document.issuingCountry,
                              document.issuingState
                            ) || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar
                              className="w-4 h-4"
                              style={{ color: safeTheme.colors.text.secondary }}
                            />
                            <label
                              className="text-sm font-medium"
                              style={{ color: safeTheme.colors.text.secondary }}
                            >
                              Valid From
                            </label>
                          </div>
                          <p
                            className="text-sm font-medium"
                            style={{ color: safeTheme.colors.text.primary }}
                          >
                            {formatDate(document.validFrom)}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar
                              className="w-4 h-4"
                              style={{ color: safeTheme.colors.text.secondary }}
                            />
                            <label
                              className="text-sm font-medium"
                              style={{ color: safeTheme.colors.text.secondary }}
                            >
                              Valid To
                            </label>
                          </div>
                          <p
                            className={`text-sm font-medium ${
                              isExpired
                                ? "text-red-600"
                                : isExpiringSoon
                                ? "text-orange-600"
                                : ""
                            }`}
                            style={
                              !isExpired && !isExpiringSoon
                                ? { color: safeTheme.colors.text.primary }
                                : {}
                            }
                          >
                            {formatDate(document.validTo)}
                          </p>
                        </div>

                        {document.remarks && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <FileText
                                className="w-4 h-4"
                                style={{
                                  color: safeTheme.colors.text.secondary,
                                }}
                              />
                              <label
                                className="text-sm font-medium"
                                style={{
                                  color: safeTheme.colors.text.secondary,
                                }}
                              >
                                Remarks
                              </label>
                            </div>
                            <p
                              className="text-sm font-medium"
                              style={{ color: safeTheme.colors.text.primary }}
                            >
                              {document.remarks}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Document File Section */}
                    {document.fileName && (
                      <div
                        className="mt-6 pt-6 border-t"
                        style={{ borderColor: safeTheme.colors.card.border }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                              <FileText className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">
                                {document.fileName}
                              </p>
                              <p className="text-sm text-gray-600">
                                {document.fileType || "Document"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handlePreview(document)}
                              className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </button>

                            <button
                              onClick={() => handleDownload(document)}
                              className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* Document Preview Modal */}
      {previewDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={closePreview}
          />

          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Document Preview
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {previewDocument.fileName}
                </p>
              </div>
              <button
                onClick={closePreview}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <CloseIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-auto p-6">
              {previewDocument.fileType === "application/pdf" ? (
                <iframe
                  src={previewDocument.fileData}
                  className="w-full h-full min-h-[600px]"
                  title="Document Preview"
                />
              ) : previewDocument.fileType?.startsWith("image/") ? (
                <img
                  src={previewDocument.fileData}
                  alt={previewDocument.fileName}
                  className="max-w-full h-auto mx-auto"
                />
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Preview not available for this file type
                  </p>
                  <button
                    onClick={() => handleDownload(previewDocument)}
                    className="mt-4 flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mx-auto"
                  >
                    <Download className="w-4 h-4" />
                    Download File
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => handleDownload(previewDocument)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={closePreview}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
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
