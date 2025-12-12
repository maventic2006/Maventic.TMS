// src/utils/api/users.js

// Use the same API base URL as the rest of the application
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  // Try multiple storage keys for tokens to be tolerant across dev helpers
  let token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
  try {
    const tms = JSON.parse(localStorage.getItem('tms_auth') || '{}');
    if (!token && tms?.token) token = tms.token;
    if (!token && tms?.authToken) token = tms.authToken;
  } catch (error) {
    // ignore parse errors
  }
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Fetch users with pagination
export const fetchUsers = async (page, size) => {
  try {
    const response = await fetch(`${API_BASE}/users?page=${page}&size=${size}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Create a new user
export const createUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Update an existing user
export const updateUser = async (userId, userData) => {
  try {
    const response = await fetch(`${API_BASE}/users/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Deactivate (soft delete) a user
export const deactivateUser = async (userId) => {
  try {
    const response = await fetch(`${API_BASE}/users/${userId}/deactivate`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error deactivating user:', error);
    throw error;
  }
};

// Fetch applications list for role assignment dropdown
export const fetchApplications = async () => {
  try {
    const response = await fetch(`${API_BASE}/users/applications/list`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching applications:', error);
    throw error;
  }
};

// Add role to a user
export const addUserRole = async (userId, roleData) => {
  try {
    const response = await fetch(`${API_BASE}/users/${userId}/roles`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(roleData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding user role:', error);
    throw error;
  }
};

// Get user roles
export const getUserRoles = async (userId) => {
  try {
    const response = await fetch(`${API_BASE}/users/${userId}/roles`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching user roles:', error);
    throw error;
  }
};

// Fetch master roles list for dropdown
export const fetchMasterRoles = async () => {
  try {
    const response = await fetch(`${API_BASE}/users/roles/master`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    console.debug('[users.api] fetchMasterRoles status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.debug('[users.api] fetchMasterRoles response:', result);
    return result.data;
  } catch (error) {
    console.error('Error fetching master roles:', error);
    throw error;
  }
};
