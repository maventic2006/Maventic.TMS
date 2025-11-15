/**
 * Consignor Service
 * API service layer for consignor management
 * Integrated with backend API
 */

import api from '../utils/api';

/**
 * Get all consignors with pagination and filters
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @param {object} filters - Filter object
 * @returns {Promise} - Consignors data
 */
export const getConsignors = async (page = 1, limit = 25, filters = {}) => {
  try {
    const params = {
      page,
      limit,
      ...filters
    };

    const response = await api.get('/consignors', { params });
    
    // Backend returns: { success: true, data: [...], meta: {...} }
    if (response.data.success) {
      return {
        data: response.data.data,
        ...response.data.meta
      };
    }
    
    throw new Error(response.data.error?.message || 'Failed to fetch consignors');
  } catch (error) {
    console.error('getConsignors error:', error);
    throw error.response?.data || error;
  }
};

/**
 * Get single consignor by ID
 * @param {string} customerId - Customer ID
 * @returns {Promise} - Consignor data
 */
export const getConsignorById = async (customerId) => {
  try {
    const response = await api.get('/consignors/' + customerId);
    
    // Backend returns: { success: true, data: { general: {...}, contacts: [...], organization: {...}, documents: [...] } }
    if (response.data.success) {
      return response.data.data;
    }
    
    throw new Error(response.data.error?.message || 'Failed to fetch consignor');
  } catch (error) {
    console.error('getConsignorById error:', error);
    throw error.response?.data || error;
  }
};

/**
 * Create new consignor with file uploads
 * @param {object} consignorData - Consignor data
 * @param {object} files - Files to upload (optional)
 * @returns {Promise} - Created consignor
 */
export const createConsignor = async (consignorData, files = {}) => {
  try {
    const formData = new FormData();
    
    // Add JSON payload
    formData.append('payload', JSON.stringify(consignorData));
    
    // Add files if provided
    Object.entries(files).forEach(([key, file]) => {
      if (file) {
        formData.append(key, file);
      }
    });

    const response = await api.post('/consignors', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    // Backend returns: { success: true, data: {...} }
    if (response.data.success) {
      return response.data.data;
    }
    
    throw new Error(response.data.error?.message || 'Failed to create consignor');
  } catch (error) {
    console.error('createConsignor error:', error);
    throw error.response?.data || error;
  }
};

/**
 * Update existing consignor
 * @param {string} customerId - Customer ID
 * @param {object} data - Updated data
 * @param {object} files - Files to upload (optional)
 * @returns {Promise} - Updated consignor
 */
export const updateConsignor = async (customerId, data, files = {}) => {
  try {
    const formData = new FormData();
    
    // Add JSON payload
    formData.append('payload', JSON.stringify(data));
    
    // Add files if provided
    Object.entries(files).forEach(([key, file]) => {
      if (file) {
        formData.append(key, file);
      }
    });

    const response = await api.put('/consignors/' + customerId, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    // Backend returns: { success: true, data: {...} }
    if (response.data.success) {
      return response.data.data;
    }
    
    throw new Error(response.data.error?.message || 'Failed to update consignor');
  } catch (error) {
    console.error('updateConsignor error:', error);
    throw error.response?.data || error;
  }
};

/**
 * Delete consignor (soft delete)
 * @param {string} customerId - Customer ID
 * @returns {Promise} - Deletion result
 */
export const deleteConsignor = async (customerId) => {
  try {
    const response = await api.delete('/consignors/' + customerId);
    
    // Backend returns: { success: true, data: {...} }
    if (response.data.success) {
      return response.data.data;
    }
    
    throw new Error(response.data.error?.message || 'Failed to delete consignor');
  } catch (error) {
    console.error('deleteConsignor error:', error);
    throw error.response?.data || error;
  }
};

/**
 * Get master data for dropdowns
 * @returns {Promise} - Master data (industries, currencies, document types, etc.)
 */
export const getMasterData = async () => {
  try {
    const response = await api.get('/consignors/master-data');
    
    console.log('🔍 Raw API response:', response.data);
    
    // Backend returns: { success: true, data: { industries: [...], currencies: [...], documentTypes: [...] } }
    if (response.data.success) {
      const backendData = response.data.data;
      
      console.log('🔍 Backend data:', backendData);
      console.log('🔍 Backend documentTypes:', backendData.documentTypes);
      
      // Transform backend format to frontend format
      const transformed = {
        industryTypes: backendData.industries.map(item => ({
          value: item.id,
          label: item.label
        })),
        currencyTypes: backendData.currencies.map(item => ({
          value: item.id,
          label: item.code + ' - ' + item.label,
          symbol: item.symbol
        })),
        paymentTerms: [
          { value: 'NET15', label: 'NET 15 Days' },
          { value: 'NET30', label: 'NET 30 Days' },
          { value: 'NET45', label: 'NET 45 Days' },
          { value: 'NET60', label: 'NET 60 Days' },
          { value: 'NET90', label: 'NET 90 Days' },
          { value: 'COD', label: 'Cash on Delivery' },
          { value: 'ADVANCE', label: 'Advance Payment' },
          { value: 'LC', label: 'Letter of Credit' }
        ],
        documentTypes: backendData.documentTypes || [],
        countries: [
          { value: 'IN', label: 'India' },
          { value: 'US', label: 'United States' },
          { value: 'GB', label: 'United Kingdom' },
          { value: 'DE', label: 'Germany' },
          { value: 'FR', label: 'France' },
          { value: 'CN', label: 'China' },
          { value: 'JP', label: 'Japan' },
          { value: 'AU', label: 'Australia' },
          { value: 'CA', label: 'Canada' },
          { value: 'SG', label: 'Singapore' }
        ]
      };
      
      console.log('🔍 Transformed data:', transformed);
      console.log('🔍 Transformed documentTypes:', transformed.documentTypes);
      
      return transformed;
    }
    
    throw new Error(response.data.error?.message || 'Failed to fetch master data');
  } catch (error) {
    console.error('getMasterData error:', error);
    throw error.response?.data || error;
  }
};

/**
 * Upload document for consignor
 * @param {string} customerId - Customer ID
 * @param {FormData} formData - Form data with file and metadata
 * @param {function} onProgress - Progress callback
 * @returns {Promise} - Upload result
 */
export const uploadDocument = async (customerId, formData, onProgress) => {
  try {
    const response = await api.post(
      '/consignors/' + customerId + '/documents',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        }
      }
    );
    
    if (response.data.success) {
      return response.data.data;
    }
    
    throw new Error(response.data.error?.message || 'Failed to upload document');
  } catch (error) {
    console.error('uploadDocument error:', error);
    throw error.response?.data || error;
  }
};

export default {
  getConsignors,
  getConsignorById,
  createConsignor,
  updateConsignor,
  deleteConsignor,
  getMasterData,
  uploadDocument
};
