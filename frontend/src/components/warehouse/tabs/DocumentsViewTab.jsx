import React, { useState } from "react";
import {
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  File,
  Download,
  Eye,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DocumentsViewTab = ({ warehouseData }) => {
  const [expandedSections, setExpandedSections] = useState({
    documents: true,
  });
  const [expandedDocuments, setExpandedDocuments] = useState({});
  const [previewDocument, setPreviewDocument] = useState(null);

  // Helper function to display value or N/A
  const displayValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return <span className="text-gray-500 italic">N/A</span>;
    }
    return <span className="text-[#0D1A33] font-medium">{value}</span>;
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "N/A";
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleDocument = (index) => {
    setExpandedDocuments((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handlePreviewDocument = (doc) => {
    if (doc.fileData && doc.fileType) {
      setPreviewDocument({
        fileName: doc.fileName || doc.documentType,
        fileType: doc.fileType,
        fileData: doc.fileData,
      });
    }
  };

  const handleDownloadDocument = (doc) => {
    if (doc.fileData && doc.fileType) {
      // Convert base64 to blob
      const byteCharacters = atob(doc.fileData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: doc.fileType });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download =
        doc.fileName ||
        `${doc.documentType}_${doc.documentNumber}.${
          doc.fileType.split("/")[1]
        }`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  };

  const closePreview = () => {
    setPreviewDocument(null);
  };

  const CollapsibleSection = ({ title, icon: Icon, sectionKey, children }) => {
    const isExpanded = expandedSections[sectionKey];

    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Icon className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
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
              <div className="px-6 py-4 border-t border-gray-200">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const documents = warehouseData?.documents || [];

  return (
    <div className="space-y-6 p-2">
      {/* Documents Section */}
      <CollapsibleSection
        title="Documents"
        icon={FileText}
        sectionKey="documents"
      >
        {documents && documents.length > 0 ? (
          <div className="space-y-4">
            {documents.map((doc, index) => {
              const isExpanded = expandedDocuments[index];

              return (
                <div
                  key={doc.documentUniqueId || index}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleDocument(index)}
                    className="w-full px-4 py-3 flex items-start justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">
                          {doc.documentType || "Document"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {doc.documentNumber || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.status ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-400" />
                      )}
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
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
                        <div className="px-4 py-4 border-t border-gray-200 bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-600 mb-1">
                                Document Type
                              </label>
                              {displayValue(doc.documentType)}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-600 mb-1">
                                Document Number
                              </label>
                              {displayValue(doc.documentNumber)}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-600 mb-1">
                                Valid From
                              </label>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                {displayValue(formatDate(doc.validFrom))}
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-600 mb-1">
                                Valid To
                              </label>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                {displayValue(formatDate(doc.validTo))}
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-600 mb-1">
                                File Name
                              </label>
                              <div className="flex items-center gap-2">
                                <File className="h-4 w-4 text-gray-400" />
                                {displayValue(doc.fileName)}
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-600 mb-1">
                                Status
                              </label>
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                  doc.status
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {doc.status ? "Active" : "Inactive"}
                              </span>
                            </div>

                            {doc.fileData && (
                              <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                  Document Actions
                                </label>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handlePreviewDocument(doc)}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#F5F7FA] hover:bg-[#E5E7EB] rounded-lg transition-colors text-sm font-medium text-[#0D1A33]"
                                  >
                                    <Eye className="h-4 w-4" />
                                    View
                                  </button>
                                  <button
                                    onClick={() => handleDownloadDocument(doc)}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#F5F7FA] hover:bg-[#E5E7EB] rounded-lg transition-colors text-sm font-medium text-[#0D1A33]"
                                  >
                                    <Download className="h-4 w-4" />
                                    Download
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No documents available</p>
            <p className="text-sm text-gray-400 mt-1">
              Document information will appear here once uploaded
            </p>
          </div>
        )}
      </CollapsibleSection>

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
