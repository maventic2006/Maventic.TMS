/**
 * Shared Document Preview Hook
 * Uses View Mode's preview logic (api.get + btoa conversion)
 * Works with both backend field names and frontend field names
 */

import { useState } from "react";
import api from "../utils/api";

export const useDocumentPreview = () => {
  const [previewDocument, setPreviewDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Preview document using View Mode's API call pattern
   * @param {Object} doc - Document object with either backend or frontend field names
   * @param {string} customerId - Customer ID
   */
  const handlePreviewDocument = async (doc, customerId) => {
    setIsLoading(true);
    setError(null);

    try {
      // Support both backend and frontend field name patterns
      const documentId = 
        doc.documentUniqueId || 
        doc.document_unique_id || 
        doc._backend_document_unique_id;
      
      const effectiveCustomerId = 
        customerId || 
        doc._backend_customer_id || 
        doc.customer_id;
      
      const fileName = 
        doc.file_name || 
        doc.fileName || 
        doc.document_type || 
        doc.documentType || 
        "Document";

      if (!documentId) {
        console.error("âŒ Document unique ID not found:", doc);
        throw new Error("Document ID is missing. Cannot preview document.");
      }

      if (!effectiveCustomerId) {
        console.error("âŒ Customer ID not found:", doc);
        throw new Error("Customer ID is missing. Cannot preview document.");
      }
      
      console.log(`í³„ [useDocumentPreview] Previewing document: ${documentId} for customer: ${effectiveCustomerId}`);
      console.log('í³‹ [useDocumentPreview] Full document object:', doc);
      
      // âœ… VIEW MODE PATTERN: Use axios instance with proper authentication
      const response = await api.get(
        `/consignors/${effectiveCustomerId}/documents/${documentId}/download`,
        { 
          responseType: 'arraybuffer',
          timeout: 10000
        }
      );

      // âœ… VIEW MODE PATTERN: btoa conversion method (exact match)
      const base64String = btoa(
        new Uint8Array(response.data).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );

      // Get file type from response headers or determine from document
      const contentType = 
        response.headers['content-type'] || 
        doc.file_type || 
        doc.fileType ||
        "application/octet-stream";

      setPreviewDocument({
        fileName: fileName,
        fileType: contentType,
        fileData: base64String,
      });

      setIsLoading(false);
    } catch (error) {
      console.error("[useDocumentPreview] Error fetching document for preview:", error);
      setError("Failed to load document for preview");
      setIsLoading(false);
      alert("Failed to load document for preview");
    }
  };

  /**
   * Download document using View Mode's API call pattern
   * @param {Object} doc - Document object
   * @param {string} customerId - Customer ID
   */
  const handleDownloadDocument = async (doc, customerId) => {
    try {
      const documentId = 
        doc.documentUniqueId || 
        doc.document_unique_id || 
        doc._backend_document_unique_id;
      
      const effectiveCustomerId = 
        customerId || 
        doc._backend_customer_id || 
        doc.customer_id;

      const fileName = 
        doc.file_name || 
        doc.fileName || 
        doc.document_type || 
        doc.documentType || 
        "document";
      
      if (!documentId) {
        console.error("âŒ Document unique ID not found:", doc);
        throw new Error("Document ID is missing. Cannot download document.");
      }
      
      if (!effectiveCustomerId) {
        console.error("âŒ Customer ID not found:", doc);
        throw new Error("Customer ID is missing. Cannot download document.");
      }
      
      console.log(`í³¥ [useDocumentPreview] Downloading document: ${documentId} for customer: ${effectiveCustomerId}`);
      
      // âœ… VIEW MODE PATTERN: Use axios instance with proper authentication
      const response = await api.get(
        `/consignors/${effectiveCustomerId}/documents/${documentId}/download`,
        { responseType: 'blob' }
      );

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("[useDocumentPreview] Error downloading document:", error);
      alert("Failed to download document");
    }
  };

  const closePreview = () => {
    setPreviewDocument(null);
    setError(null);
  };

  return {
    previewDocument,
    isLoading,
    error,
    handlePreviewDocument,
    handleDownloadDocument,
    closePreview,
  };
};

export default useDocumentPreview;
