/**
 * Shared Document Preview Hook
 * Uses View Mode's preview logic (api.get + btoa conversion)
 * Works with both backend field names and frontend field names
 * 
 * SUPPORTS TWO SCENARIOS:
 * 1. NEW FILE UPLOADS (Create Mode) - Preview from File object
 * 2. BACKEND DOCUMENTS (Edit Mode) - Fetch from API
 */

import { useState } from "react";
import api from "../utils/api";

export const useDocumentPreview = () => {
  const [previewDocument, setPreviewDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Preview document using View Mode's API call pattern
   * Supports BOTH:
   * 1. Existing backend documents (API fetch with document_unique_id)
   * 2. Newly uploaded files during creation (direct File object preview)
   * 
   * @param {Object} doc - Document object with either backend or frontend field names
   * @param {string} customerId - Customer ID
   */
  const handlePreviewDocument = async (doc, customerId) => {
    setIsLoading(true);
    setError(null);

    try {
      // ============================================================================
      // SCENARIO 1: NEW FILE UPLOAD (Create Mode) - Preview from File object
      // ============================================================================
      // Check if this is a newly uploaded file (has fileUpload or fileData)
      const uploadedFile = doc.fileUpload; // File object from <input type="file">
      const existingFileData = doc.fileData; // base64 string or data URL
      
      if (uploadedFile instanceof File) {
        console.log(`í³„ [useDocumentPreview] NEW FILE UPLOAD - Previewing from File object:`, uploadedFile.name);
        
        // Read the file using FileReader (for new uploads)
        const reader = new FileReader();
        
        return new Promise((resolve, reject) => {
          reader.onload = (e) => {
            const fileData = e.target.result; // data URL format: "data:image/png;base64,..."
            
            // Extract base64 part (remove "data:image/png;base64," prefix)
            const base64String = fileData.split(',')[1] || fileData;
            
            setPreviewDocument({
              fileName: doc.fileName || uploadedFile.name || "Document",
              fileType: uploadedFile.type || "application/octet-stream",
              fileData: base64String,
            });
            
            setIsLoading(false);
            resolve();
          };
          
          reader.onerror = (error) => {
            console.error("[useDocumentPreview] FileReader error:", error);
            setError("Failed to read uploaded file");
            setIsLoading(false);
            reject(error);
          };
          
          reader.readAsDataURL(uploadedFile);
        });
      }
      
      // Check if file data already exists (from ThemeTable Case 1)
      if (existingFileData && existingFileData.trim() !== "") {
        console.log(`í³„ [useDocumentPreview] EXISTING FILE DATA - Previewing from fileData property`);
        
        // Remove data URL prefix if present
        const base64String = existingFileData.includes(',') 
          ? existingFileData.split(',')[1] 
          : existingFileData;
        
        setPreviewDocument({
          fileName: doc.fileName || doc.file_name || "Document",
          fileType: doc.fileType || doc.file_type || "application/octet-stream",
          fileData: base64String,
        });
        
        setIsLoading(false);
        return;
      }
      
      // ============================================================================
      // SCENARIO 2: BACKEND DOCUMENT (Edit Mode) - Fetch from API
      // ============================================================================
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
        console.error("âŒ Document unique ID not found and no file upload:", doc);
        throw new Error("Document ID is missing and no file uploaded. Cannot preview document.");
      }

      if (!effectiveCustomerId) {
        console.error("âŒ Customer ID not found:", doc);
        throw new Error("Customer ID is missing. Cannot preview document.");
      }
      
      console.log(`í³„ [useDocumentPreview] BACKEND DOCUMENT - Fetching from API: ${documentId} for customer: ${effectiveCustomerId}`);
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
      alert("Failed to load document for preview. Please check if the file was uploaded correctly.");
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
      
      console.log(`í³„ [useDocumentPreview] Downloading document: ${documentId} for customer: ${effectiveCustomerId}`);
      
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

  /**
   * Close preview modal
   */
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
