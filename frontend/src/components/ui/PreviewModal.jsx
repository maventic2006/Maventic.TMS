/**
 * Shared Preview Modal Component
 * Extracted from DocumentsViewTab - reusable across View and Edit modes
 * Handles document and photo previews
 */

import React, { useEffect } from "react";
import { FileText, X } from "lucide-react";

const PreviewModal = ({ previewDocument, onClose }) => {
  // ESC key support for modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (previewDocument) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [previewDocument, onClose]);

  if (!previewDocument) return null;

  // Check if this is an object URL (for contact photos) or base64 data
  const isObjectUrl = previewDocument.isObjectUrl || previewDocument.fileData?.startsWith("blob:");
  
  // Determine image source
  const imageSrc = isObjectUrl 
    ? previewDocument.fileData 
    : `data:${previewDocument.fileType};base64,${previewDocument.fileData}`;

  return (
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
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-auto p-4">
          {previewDocument.fileType?.startsWith("image/") ? (
            <img
              src={imageSrc}
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
            onClick={onClose}
            className="px-6 py-2.5 border border-[#E5E7EB] text-[#4A5568] rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
