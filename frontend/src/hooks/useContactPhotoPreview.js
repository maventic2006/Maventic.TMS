/**
 * Shared Contact Photo Preview Hook
 * Uses View Mode's preview logic (api.get + arraybuffer to blob URL)
 * Works with both backend field names and frontend field names
 * 
 * SUPPORTS TWO SCENARIOS:
 * 1. NEW PHOTO UPLOADS (Create Mode) - Preview from File object
 * 2. BACKEND PHOTOS (Edit/View Mode) - Fetch from API
 */

import { useState } from "react";
import api from "../utils/api";

export const useContactPhotoPreview = () => {
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Preview contact photo
   * Supports BOTH:
   * 1. Newly uploaded photos during creation (File object preview)
   * 2. Existing backend photos (API fetch with contact_id)
   * 
   * @param {Object} contact - Contact object
   * @param {string} customerId - Customer ID (optional for new uploads)
   */
  const handlePreviewPhoto = async (contact, customerId) => {
    setIsLoading(true);
    setError(null);

    try {
      // ============================================================================
      // SCENARIO 1: NEW PHOTO UPLOAD (Create Mode) - Preview from File object
      // ============================================================================
      const uploadedFile = contact.photo; // File object from <input type="file">
      
      if (uploadedFile instanceof File) {
        console.log(`í³¸ [useContactPhotoPreview] NEW PHOTO UPLOAD - Previewing from File object:`, uploadedFile.name);
        
        // Read the file using FileReader
        const reader = new FileReader();
        
        return new Promise((resolve, reject) => {
          reader.onload = (e) => {
            const fileData = e.target.result; // data URL format: "data:image/jpeg;base64,..."
            
            // Extract base64 part (remove "data:image/jpeg;base64," prefix)
            const base64String = fileData.split(',')[1] || fileData;
            
            setPreviewPhoto({
              fileName: contact.name || contact.contact_name || "Contact Photo",
              fileType: uploadedFile.type || "image/jpeg",
              fileData: base64String,
            });
            
            setIsLoading(false);
            resolve();
          };
          
          reader.onerror = (error) => {
            console.error("[useContactPhotoPreview] FileReader error:", error);
            setError("Failed to read uploaded photo");
            setIsLoading(false);
            reject(error);
          };
          
          reader.readAsDataURL(uploadedFile);
        });
      }
      
      // ============================================================================
      // SCENARIO 2: BACKEND PHOTO (Edit/View Mode) - Fetch from API
      // ============================================================================
      const contactId = contact.contact_id || contact._backend_contact_id;
      const contactPhoto = contact.contact_photo || contact.photo;
      
      const effectiveCustomerId = 
        customerId || 
        contact._backend_customer_id || 
        contact.customer_id;
      
      if (!contactId) {
        console.error("âŒ Contact ID not found and no photo upload:", contact);
        throw new Error("Contact ID is missing and no photo uploaded. Cannot preview photo.");
      }
      
      if (!effectiveCustomerId) {
        console.error("âŒ Customer ID not found:", contact);
        throw new Error("Customer ID is missing. Cannot preview photo.");
      }
      
      if (!contactPhoto) {
        console.warn("âš ï¸ No contact photo available");
        throw new Error("No photo available for this contact.");
      }
      
      console.log(`í³¸ [useContactPhotoPreview] BACKEND PHOTO - Fetching from API for contact: ${contactId}, customer: ${effectiveCustomerId}`);
      
      // âœ… VIEW MODE PATTERN: Use axios instance with proper authentication
      const response = await api.get(
        `/consignors/${effectiveCustomerId}/contacts/${contactId}/photo`,
        { responseType: "arraybuffer" }
      );

      // âœ… VIEW MODE PATTERN: Convert arraybuffer to base64
      const base64String = btoa(
        new Uint8Array(response.data).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );
      
      const contentType = response.headers["content-type"] || "image/jpeg";

      setPreviewPhoto({
        fileName: contact.name || contact.contact_name || "Contact Photo",
        fileType: contentType,
        fileData: base64String,
      });

      setIsLoading(false);
    } catch (error) {
      console.error("[useContactPhotoPreview] Error fetching contact photo for preview:", error);
      setError("Failed to load contact photo for preview");
      setIsLoading(false);
      alert("Failed to load contact photo for preview. Please check if the photo was uploaded correctly.");
    }
  };

  /**
   * Download contact photo
   * @param {Object} contact - Contact object
   * @param {string} customerId - Customer ID
   */
  const handleDownloadPhoto = async (contact, customerId) => {
    try {
      const contactId = contact.contact_id || contact._backend_contact_id;
      const fileName = contact.name || contact.contact_name || "contact_photo";
      
      const effectiveCustomerId = 
        customerId || 
        contact._backend_customer_id || 
        contact.customer_id;

      if (!contactId) {
        console.error("âŒ Contact ID not found:", contact);
        throw new Error("Contact ID is missing. Cannot download photo.");
      }
      
      if (!effectiveCustomerId) {
        console.error("âŒ Customer ID not found:", contact);
        throw new Error("Customer ID is missing. Cannot download photo.");
      }
      
      console.log(`í³¸ [useContactPhotoPreview] Downloading photo for contact: ${contactId}`);
      
      // âœ… VIEW MODE PATTERN: Use axios instance with proper authentication
      const response = await api.get(
        `/consignors/${effectiveCustomerId}/contacts/${contactId}/photo`,
        { responseType: 'blob' }
      );

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${fileName}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("[useContactPhotoPreview] Error downloading contact photo:", error);
      alert("Failed to download contact photo");
    }
  };

  /**
   * Close preview modal
   */
  const closePreview = () => {
    setPreviewPhoto(null);
    setError(null);
  };

  return {
    previewPhoto,
    isLoading,
    error,
    handlePreviewPhoto,
    handleDownloadPhoto,
    closePreview,
  };
};

export default useContactPhotoPreview;
