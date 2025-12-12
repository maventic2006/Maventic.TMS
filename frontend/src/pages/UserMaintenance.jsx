import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import TMSHeader from "../components/layout/TMSHeader";
import { getPageTheme } from "../theme.config";
import TopActionBar from "../components/user/TopActionBar";
import UserFilterPanel from "../components/user/UserFilterPanel";
import UserListTable from "../components/user/UserListTable";
import PaginationBar from "../components/user/PaginationBar";
import UserApplicationAccessModal from "../components/user/UserApplicationAccessModal";
import UserCreateModal from "../components/user/UserCreateModal";
import {
  fetchUsers,
  resetPaginationToFirstPage,
  setCurrentPage
} from "../redux/slices/userSlice";
import { addToast } from "../redux/slices/uiSlice";
import { TOAST_TYPES } from "../utils/constants";
import { AlertTriangle } from 'lucide-react';
import api from "../utils/api";

// Fuzzy search utility function
const fuzzySearch = (searchText, users) => {
  if (!searchText || searchText.trim() === "") {
    return users;
  }

  const searchLower = searchText.toLowerCase().trim();

  return users.filter((user) => {
    // Search across multiple fields
    const searchableFields = [
      user.userId,
      user.fullName,
      user.firstName,
      user.lastName,
      user.email,
      user.mobileNumber,
      user.userType,
      user.status,
    ];

    // Check if any field contains the search text (case-insensitive partial match)
    return searchableFields.some((field) => {
      if (field === null || field === undefined) return false;
      return String(field).toLowerCase().includes(searchLower);
    });
  });
};

// Main User Maintenance Component
const UserMaintenance = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = getPageTheme("list");
  const [searchParams, setSearchParams] = useSearchParams();

  // Redux state
  const { users, pagination, isFetching, error } = useSelector(
    (state) => state.user
  );

  // Local state
  const [searchText, setSearchText] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Modal state
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userApplicationAccess, setUserApplicationAccess] = useState([]);
  const [availableApplications, setAvailableApplications] = useState([]);
  const [isLoadingAccess, setIsLoadingAccess] = useState(false);
  const [accessError, setAccessError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // ✅ Helper: Read filters from URL query parameters
  const getFiltersFromURL = useCallback(() => {
    return {
      userTypeId: searchParams.get("userTypeId") || "",
      // Default to ACTIVE unless explicitly specified
      status: searchParams.get("status") || "Active",
      fromDate: searchParams.get("fromDate") || "",
      toDate: searchParams.get("toDate") || "",
    };
  }, [searchParams]);

  // ✅ Initialize filters from URL on mount
  const [filters, setFilters] = useState(() => getFiltersFromURL());
  const [appliedFilters, setAppliedFilters] = useState(() =>
    getFiltersFromURL()
  );

  // ✅ Sync URL params back to filter state when searchParams change
  useEffect(() => {
    const urlFilters = getFiltersFromURL();
    setFilters(urlFilters);
    setAppliedFilters(urlFilters);
  }, [searchParams]);

  // Single useEffect for data fetching
  useEffect(() => {
    // Don't fetch if already fetching to prevent multiple simultaneous calls
    if (isFetching) return;

    const params = {
      page: pagination.currentPage,
      limit: pagination.limit,
      // Respect explicit status filter; default to ACTIVE
      status: appliedFilters.status || "ACTIVE",
      ...appliedFilters,
    };

    // Fetch users and handle errors gracefully
    dispatch(fetchUsers(params)).unwrap().catch((err) => {
      console.error("Failed to fetch users:", err);
      // Don't show toast on initial load to avoid annoying users
      // The error state will show in the UI
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, pagination.currentPage, pagination.limit, JSON.stringify(appliedFilters)]);

  // Handle search text change
  const handleSearchChange = (value) => {
    setSearchText(value);
  };

  // Handle filter change
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Apply filters
  const handleApplyFilters = () => {
    // Update URL query params
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "" && (!Array.isArray(value) || value.length > 0)) {
        if (Array.isArray(value)) {
          params.set(key, value.join(","));
        } else {
          params.set(key, value);
        }
      }
    });
    setSearchParams(params);

    // Update applied filters state
    setAppliedFilters(filters);

    // Reset to first page
    dispatch(resetPaginationToFirstPage());

    // Close filter panel
    setShowFilters(false);

    dispatch(
      addToast({
        type: TOAST_TYPES.INFO,
        message: "Filters applied successfully",
      })
    );
  };

  // Reset filters
  const handleResetFilters = () => {
    const emptyFilters = {
      userTypeId: "",
      // maintain default to show active users only
      status: "ACTIVE",
      fromDate: "",
      toDate: "",
    };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setSearchParams({});
    dispatch(resetPaginationToFirstPage());

    dispatch(
      addToast({
        type: TOAST_TYPES.INFO,
        message: "Filters cleared",
      })
    );
  };

  // Apply fuzzy search on users and ensure only ACTIVE users are shown
  const filteredUsers = useMemo(() => {
    const searchResults = fuzzySearch(searchText, users);
    // Ensure only users with active status are displayed by default
    return searchResults.filter((u) => {
      try {
        const isActiveFlag = !!u.isActive || !!u.active;
        const statusFlag = String(u.status || "").toUpperCase() === "ACTIVE";
        return isActiveFlag || statusFlag;
      } catch (err) {
        return false;
      }
    });
  }, [searchText, users]);

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    return Object.values(appliedFilters).filter((value) => {
      if (Array.isArray(value)) return value.length > 0;
      return value && value !== "";
    }).length;
  }, [appliedFilters]);

  // Handle page change
  const handlePageChange = (newPage) => {
    dispatch(setCurrentPage(newPage));
  };

  // Navigation handlers - open modal instead of page navigation
  const handleCreateUser = () => {
    setShowCreateModal(true);
  };

  // Handle row click - open modal instead of navigation
  const handleRowClick = async (userId) => {
    const user = users.find(u => u.userId === userId);
    if (!user) return;
    
    setSelectedUser(user);
    setShowAccessModal(true);
    
    // Fetch user's application access and available applications
    await Promise.all([
      fetchUserApplicationAccess(userId),
      fetchAvailableApplications()
    ]);
  };

  // Fetch user's application access
  const fetchUserApplicationAccess = async (userId) => {
    setIsLoadingAccess(true);
    setAccessError(null);
    try {
      const response = await api.get(`/users/${userId}/application-access`);
      if (response.data.success) {
        setUserApplicationAccess(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching user application access:', error, error?.response?.data, error?.response?.status);
      const status = error?.response?.status;
      const msg = error.response?.data?.message || error.message || 'Failed to load user application access';
      if (status === 404) {
        // User doesn't have role assigned — treat gracefully
        setUserApplicationAccess([]);
        setAccessError('User has no role assigned. Please assign a role before granting application access.');
      } else {
        setAccessError(msg);
      }
    } finally {
      setIsLoadingAccess(false);
    }
  };

  // Fetch available applications
  const fetchAvailableApplications = async () => {
    try {
      const response = await api.get('/users/applications');
      if (response.data.success) {
        setAvailableApplications(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching available applications:', error);
      const msg = error.response?.data?.message || error.message || 'Failed to load available applications';
      // set access error because modal depends on both; show generic inline error
      setAccessError(msg);
    }
  };

  // Grant application access
  const handleGrantAccess = async (userId, applicationId) => {
    try {
      // Guard: only allow when user is active
      const targetUser = users.find((u) => u.userId === userId);
      if (!targetUser || !targetUser.isActive && !targetUser.active) {
        const msg = 'Cannot grant application access: User is not active';
        setAccessError(msg);
        dispatch(addToast({ type: TOAST_TYPES.ERROR, message: msg }));
        return;
      }
      const response = await api.post(`/users/${userId}/application-access`, {
        applicationId,
        accessControlId: 'AC_DEFAULT'
      });
      
      if (response.data.success) {
        dispatch(addToast({
          type: TOAST_TYPES.SUCCESS,
          message: 'Application access granted successfully'
        }));
        // Refresh the access list
        await fetchUserApplicationAccess(userId);
        // Also refresh available apps
        await fetchAvailableApplications();
        setAccessError(null);
      }
    } catch (error) {
      console.error('Error granting application access:', error);
      const status = error?.response?.status;
      const msg = error.response?.data?.message || error.message || 'Failed to grant application access';
      if (status === 403) {
        setAccessError(msg || 'Cannot grant application access: User not active');
      } else {
        setAccessError(msg);
      }
      dispatch(addToast({type: TOAST_TYPES.ERROR, message: msg}));
    }
  };

  // Revoke application access
  const handleRevokeAccess = async (accessId) => {
    try {
      const response = await api.delete(`/users/application-access/${accessId}`);
      
      if (response.data.success) {
        dispatch(addToast({ type: TOAST_TYPES.SUCCESS, message: 'Application access revoked successfully' }));
        // Refresh the access list
        if (selectedUser) {
          await fetchUserApplicationAccess(selectedUser.userId);
        }
        // refresh apps
        await fetchAvailableApplications();
        setAccessError(null);
      }
    } catch (error) {
      console.error('Error revoking application access:', error);
      const msg = error.response?.data?.message || error.message || 'Failed to revoke application access';
      setAccessError(msg);
      dispatch(addToast({type: TOAST_TYPES.ERROR, message: msg}));
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowAccessModal(false);
    setSelectedUser(null);
    setUserApplicationAccess([]);
  };

  // Create User Modal handlers
  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleCreateSuccess = (createdUser) => {
    // Refresh user list
    dispatch(fetchUsers({
      page: pagination.currentPage,
      limit: pagination.limit,
      status: appliedFilters.status || 'ACTIVE',
      ...appliedFilters,
    }));
    // Close modal
    setShowCreateModal(false);
  };

  // ✅ Add graceful error handling (BEFORE the main return statement)
  if (error && !isFetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#F8FAFC] to-[#F1F5F9]">
        <TMSHeader theme={theme} />
        
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto p-8">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {error.code === "NETWORK_ERROR" 
                ? "Unable to Connect" 
                : error.code === "ENDPOINT_NOT_FOUND"
                ? "Endpoint Not Available"
                : "Error Loading Users"}
            </h2>
            <p className="text-gray-600 mb-6">
              {error.message || "Failed to load user data"}
            </p>
            
            {/* Action buttons */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition-colors"
              >
                Retry
              </button>
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Go Back
              </button>
            </div>

            {/* Development hint */}
            {(error.code === "NETWORK_ERROR" || error.code === "ENDPOINT_NOT_FOUND") && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
                <p className="text-sm text-yellow-800">
                  <strong>Developer Note:</strong> Ensure the backend server is running on port 5000 
                  and the <code className="bg-yellow-100 px-1 rounded">/api/users</code> endpoint is configured.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#F8FAFC] to-[#F1F5F9]">
      <TMSHeader title="User Maintenance" />

      <div className="max-w-[1600px] mx-auto p-6">
        {/* Top Action Bar */}
        <TopActionBar
          totalCount={pagination.totalCount}
          onCreateClick={handleCreateUser}
          onFilterToggle={() => setShowFilters(!showFilters)}
          showFilters={showFilters}
          filterCount={activeFilterCount}
          searchText={searchText}
          onSearchChange={handleSearchChange}
        />

        {/* Filter Panel */}
        {showFilters && (
          <UserFilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
          />
        )}

        {/* Error State */}
        {error && !isFetching && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-yellow-800 text-sm font-medium mb-2">
                  ⚠️ Unable to load users
                </p>
                <p className="text-yellow-700 text-xs">
                  {error.message || "The user management endpoint may not be available yet. Please ensure the backend server is running with the latest API endpoints."}
                </p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="ml-4 px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* User List Table */}
        <UserListTable
          users={filteredUsers}
          isLoading={isFetching}
          onRowClick={handleRowClick}
        />

        {/* Pagination */}
        <PaginationBar
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalCount={pagination.totalCount}
          limit={pagination.limit}
          onPageChange={handlePageChange}
        />
      </div>

      {/* User Application Access Modal */}
      <UserApplicationAccessModal
        isOpen={showAccessModal}
        onClose={handleCloseModal}
        user={selectedUser}
        userApplicationAccess={userApplicationAccess}
        availableApplications={availableApplications}
        onRevokeAccess={handleRevokeAccess}
        onGrantAccess={handleGrantAccess}
        isLoading={isLoadingAccess}
        error={accessError}
        onRetry={() => selectedUser && fetchUserApplicationAccess(selectedUser.userId)}
      />

      {/* Create User Modal */}
      <UserCreateModal
        isOpen={showCreateModal}
        onClose={handleCloseCreateModal}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default UserMaintenance;
