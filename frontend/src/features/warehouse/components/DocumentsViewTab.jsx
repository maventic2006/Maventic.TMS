import React, { useState } from "react";
import {
  FileText,
  Download,
  Eye,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../../utils/api";

const DocumentsViewTab = ({ warehouse }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [loadingDocument, setLoadingDocument] = useState(null);

  const documents = warehouse?.documents || [];

  const handleViewDocument = async (documentUniqueId, fileName, fileType) => {
    try {
      setLoadingDocument(documentUniqueId);
      const response = await api.get(`/warehouse/document/${documentUniqueId}`);

      if (response.data.success) {
        setPreviewDocument({
          fileName: response.data.data.fileName || fileName,
          fileType: response.data.data.fileType || fileType,
          fileData: response.data.data.fileData,
        });
      }
    } catch (error) {
      console.error("Error fetching document:", error);
      alert("Failed to load document. Please try again.");
    } finally {
      setLoadingDocument(null);
    }
  };

  const handleDownloadDocument = async (
    documentUniqueId,
    fileName,
    fileType
  ) => {
    try {
      setLoadingDocument(documentUniqueId);
      const response = await api.get(`/warehouse/document/${documentUniqueId}`);

      if (response.data.success) {
        const base64Data = response.data.data.fileData;
        const actualFileName = response.data.data.fileName || fileName;
        const actualFileType = response.data.data.fileType || fileType;

        // Convert base64 to blob
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: actualFileType });

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = actualFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error downloading document:", error);
      alert("Failed to download document. Please try again.");
    } finally {
      setLoadingDocument(null);
    }
  };

  const closePreview = () => {
    setPreviewDocument(null);
  };

  if (documents.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Documents
          </h3>
          <p className="text-sm text-gray-600">
            No documents have been uploaded for this warehouse yet.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        {/* Section Header - Collapsible */}
        <div
          className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-colors"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Document Information
              </h3>
              <p className="text-sm text-gray-600">
                {documents.length} document{documents.length !== 1 ? "s" : ""}{" "}
                uploaded
              </p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isCollapsed ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="w-5 h-5 text-gray-600" />
          </motion.div>
        </div>

        {/* Collapsible Content */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-6 space-y-4">
                {documents.map((document, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {document.documentType || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600">
                          Doc #: {document.documentNumber || "N/A"}
                        </p>
                        {document.fileName && (
                          <p className="text-xs text-blue-600 mt-1">
                            {document.fileName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {document.documentUniqueId && document.fileName && (
                        <>
                          <button
                            onClick={() =>
                              handleViewDocument(
                                document.documentUniqueId,
                                document.fileName,
                                document.fileType
                              )
                            }
                            disabled={
                              loadingDocument === document.documentUniqueId
                            }
                            className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loadingDocument === document.documentUniqueId ? (
                              <>
                                <div className="w-4 h-4 border-2 border-blue-800 border-t-transparent rounded-full animate-spin"></div>
                                <span>Loading...</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4" />
                                <span>View</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() =>
                              handleDownloadDocument(
                                document.documentUniqueId,
                                document.fileName,
                                document.fileType
                              )
                            }
                            disabled={
                              loadingDocument === document.documentUniqueId
                            }
                            className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loadingDocument === document.documentUniqueId ? (
                              <>
                                <div className="w-4 h-4 border-2 border-green-800 border-t-transparent rounded-full animate-spin"></div>
                                <span>Loading...</span>
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4" />
                                <span>Download</span>
                              </>
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewDocument && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
            onClick={closePreview}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">
                    {previewDocument.fileName}
                  </h3>
                </div>
                <button
                  onClick={closePreview}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
                {previewDocument.fileType?.startsWith("image/") ? (
                  <img
                    src={`data:${previewDocument.fileType};base64,${previewDocument.fileData}`}
                    alt={previewDocument.fileName}
                    className="max-w-full h-auto mx-auto"
                  />
                ) : previewDocument.fileType === "application/pdf" ? (
                  <iframe
                    src={`data:application/pdf;base64,${previewDocument.fileData}`}
                    className="w-full h-[70vh]"
                    title={previewDocument.fileName}
                  />
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      Preview not available for this file type
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Please download the file to view it
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DocumentsViewTab;
