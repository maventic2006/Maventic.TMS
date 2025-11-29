/**
 * Date Formatting Utilities
 * Provides consistent date formatting across the application
 */

/**
 * Format ISO date string to DD-MM-YYYY format
 * @param {string|Date} dateString - ISO date string or Date object
 * @returns {string} Formatted date string (DD-MM-YYYY) or 'N/A'
 */
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) return "N/A";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "N/A";
  }
};

/**
 * Format ISO datetime string to DD-MM-YYYY HH:mm format
 * @param {string|Date} dateString - ISO datetime string or Date object
 * @returns {string} Formatted datetime string (DD-MM-YYYY HH:mm) or 'N/A'
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) return "N/A";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}-${month}-${year} ${hours}:${minutes}`;
  } catch (error) {
    console.error("Error formatting datetime:", error);
    return "N/A";
  }
};

/**
 * Format date for input field (YYYY-MM-DD)
 * @param {string|Date} dateString - ISO date string or Date object
 * @returns {string} Formatted date string (YYYY-MM-DD) or empty string
 */
export const formatDateForInput = (dateString) => {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Error formatting date for input:", error);
    return "";
  }
};

/**
 * Format date with month name (e.g., "25 Nov 2025")
 * @param {string|Date} dateString - ISO date string or Date object
 * @returns {string} Formatted date string or 'N/A'
 */
export const formatDateWithMonth = (dateString) => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) return "N/A";

    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date with month:", error);
    return "N/A";
  }
};

/**
 * Check if a date string is valid
 * @param {string|Date} dateString - Date string to validate
 * @returns {boolean} True if valid date
 */
export const isValidDate = (dateString) => {
  if (!dateString) return false;

  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  } catch (error) {
    return false;
  }
};
