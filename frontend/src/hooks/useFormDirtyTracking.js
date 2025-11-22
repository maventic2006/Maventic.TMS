import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useFormDirtyTracking Hook
 * 
 * Tracks whether a form has unsaved changes by comparing current form data
 * with the initial/saved state. Used to trigger save-as-draft prompts on navigation.
 * 
 * Features:
 * - Deep comparison of nested objects and arrays
 * - Automatic dirty state calculation
 * - Manual reset capability
 * - Optimized with useCallback and useRef
 * 
 * @param {object} initialFormData - Initial/saved form state
 * @returns {object} - { isDirty, currentData, setCurrentData, resetDirty }
 * 
 * Usage Example:
 * `javascript
 * const { isDirty, currentData, setCurrentData, resetDirty } = useFormDirtyTracking({
 *   businessName: '',
 *   addresses: [],
 * });
 * 
 * // Update form data
 * setCurrentData({ ...currentData, businessName: 'New Name' });
 * 
 * // Check if form is dirty
 * if (isDirty) {
 *   // Show save-as-draft modal
 * }
 * 
 * // Reset dirty state after save
 * resetDirty(savedData);
 * `
 */
export const useFormDirtyTracking = (initialFormData = {}) => {
  const [isDirty, setIsDirty] = useState(false);
  const [currentData, setCurrentData] = useState(initialFormData);
  const initialDataRef = useRef(initialFormData);

  /**
   * Deep comparison function for nested objects and arrays
   * @param {any} obj1 - First object to compare
   * @param {any} obj2 - Second object to compare
   * @returns {boolean} - True if objects are equal, false otherwise
   */
  const deepEqual = useCallback((obj1, obj2) => {
    // Handle primitives and null
    if (obj1 === obj2) return true;
    if (obj1 == null || obj2 == null) return false;
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;

    // Handle arrays
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
      if (obj1.length !== obj2.length) return false;
      return obj1.every((item, index) => deepEqual(item, obj2[index]));
    }

    // Handle objects
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    return keys1.every(key => deepEqual(obj1[key], obj2[key]));
  }, []);

  /**
   * Calculate dirty state whenever current data changes
   */
  useEffect(() => {
    const hasChanges = !deepEqual(initialDataRef.current, currentData);
    setIsDirty(hasChanges);
  }, [currentData, deepEqual]);

  /**
   * Reset dirty state with new initial data
   * Called after successful save/update
   * @param {object} newInitialData - New initial state (saved data)
   */
  const resetDirty = useCallback((newInitialData) => {
    initialDataRef.current = newInitialData || currentData;
    setCurrentData(newInitialData || currentData);
    setIsDirty(false);
  }, [currentData]);

  /**
   * Update current form data
   * Can be used directly or wrapped in a custom setter
   */
  const updateFormData = useCallback((newData) => {
    setCurrentData(newData);
  }, []);

  return {
    isDirty,              // Boolean - true if form has unsaved changes
    currentData,          // Current form state
    setCurrentData: updateFormData,  // Function to update form data
    resetDirty,           // Function to reset dirty state after save
    initialData: initialDataRef.current,  // Reference to initial data
  };
};

export default useFormDirtyTracking;
