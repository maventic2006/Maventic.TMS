/**
 * Shared Contact Photo Preview Hook
 * Uses View Mode's preview logic (api.get + arraybuffer to blob URL)
 * Works with both backend field names and frontend field names
 */

import { useState, useEffect } from "react";
import api from "../utils/api";

export const useContactPhotoPreview = (customerId, contacts = []) => {
  const [contactPhotos, setContactPhotos] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch contact photos with authentication (View Mode pattern)
  useEffect(() => {
    const fetchContactPhotos = async () => {
      if (!customerId || !contacts.length) return;

      setIsLoading(true);
      setError(null);
      const photoUrls = {};

      for (const contact of contacts) {
        // Support both backend and frontend field name patterns
        const contactId = contact.contact_id || contact._backend_contact_id;
        const contactPhoto = contact.contact_photo || contact.photo;

        if (contactPhoto && contactId) {
          try {
            console.log(`Ì≥∏ [useContactPhotoPreview] Fetching photo for contact: ${contactId}, customer: ${customerId}`);
            
            // ‚úÖ VIEW MODE PATTERN: Use axios instance with proper authentication
            const response = await api.get(
              `/consignors/${customerId}/contacts/${contactId}/photo`,
              { responseType: "arraybuffer" }
            );

            // ‚úÖ VIEW MODE PATTERN: Convert arraybuffer to blob and create object URL
            const blob = new Blob([response.data], {
              type: response.headers["content-type"] || "image/jpeg",
            });
            photoUrls[contactId] = URL.createObjectURL(blob);
          } catch (error) {
            console.error(
              `[useContactPhotoPreview] Failed to load photo for contact ${contactId}:`,
              error
            );
          }
        }
      }

      setContactPhotos(photoUrls);
      setIsLoading(false);
    };

    fetchContactPhotos();

    // Cleanup: Revoke object URLs when component unmounts
    return () => {
      Object.values(contactPhotos).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [customerId, contacts]);

  /**
   * Preview contact photo in modal
   * @param {Object} contact - Contact object
   */
  const handlePreviewContactPhoto = (contact) => {
    const contactId = contact.contact_id || contact._backend_contact_id;
    const photoUrl = contactPhotos[contactId];
    
    if (photoUrl) {
      return {
        fileName: contact.name || contact.contact_name || "Contact Photo",
        fileType: "image/jpeg",
        fileData: photoUrl, // Object URL from blob
        isObjectUrl: true, // Flag to indicate this is an object URL, not base64
      };
    }
    
    return null;
  };

  /**
   * Download contact photo
   * @param {Object} contact - Contact object
   */
  const handleDownloadContactPhoto = async (contact) => {
    try {
      const contactId = contact.contact_id || contact._backend_contact_id;
      const fileName = contact.name || contact.contact_name || "contact_photo";

      if (!contactId) {
        console.error("‚ùå Contact ID not found:", contact);
        throw new Error("Contact ID is missing. Cannot download photo.");
      }
      
      console.log(`Ì≥• [useContactPhotoPreview] Downloading photo for contact: ${contactId}`);
      
      // ‚úÖ VIEW MODE PATTERN: Use axios instance with proper authentication
      const response = await api.get(
        `/consignors/${customerId}/contacts/${contactId}/photo`,
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

  return {
    contactPhotos,
    isLoading,
    error,
    handlePreviewContactPhoto,
    handleDownloadContactPhoto,
  };
};

export default useContactPhotoPreview;
