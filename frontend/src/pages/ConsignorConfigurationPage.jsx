import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

// Import components - reuse configuration components with different props
import ConfigurationTopActionBar from "../components/configuration/ConfigurationTopActionBar";
import ConfigurationFilterPanel from "../components/configuration/ConfigurationFilterPanel";
import ConfigurationListTable from "../components/configuration/ConfigurationListTable";
import ConfigurationPaginationBar from "../components/configuration/ConfigurationPaginationBar";
import ConsignorConfigurationModal from "../components/configuration/ConsignorConfigurationModal";
// import TMSHeader from "../components/layout/TMSHeader";

// Import consignor configuration actions
import {
  fetchConsignorConfigurations,
  fetchConsignorConfigurationMetadata,
  fetchConsignorConfigurationData,
  createConsignorRecord,
  updateConsignorRecord,
  deleteConsignorRecord,
  clearErrors,
  clearData,
  clearMetadata,
  setCurrentPage
} from "../redux/slices/consignorConfigurationSlice";
import TMSHeader from "@/components/layout/TMSHeader";

// Fuzzy search utility function - Same as ConfigurationPage
const fuzzySearch = (searchText, data, metadata, appliedFilters = {}) => {
  if (!data) return [];
  
  console.log("🔍 fuzzySearch called with:");
  console.log("  - data length:", data.length);
  console.log("  - searchText:", searchText);
  console.log("  - appliedFilters:", appliedFilters);
  
  // First apply filters
  let filteredData = data.filter((record) => {
    for (const [filterKey, filterValue] of Object.entries(appliedFilters)) {
      if (!filterValue || filterValue === "") continue;
      
      const recordValue = record[filterKey];
      if (filterKey === "status") {
        // Case-insensitive status comparison
        if (recordValue?.toLowerCase() !== filterValue.toLowerCase()) {
          return false;
        }
      } else if (recordValue !== filterValue) {
        return false;
      }
    }
    return true;
  });

  console.log("🔍 After filters, data length:", filteredData.length);

  // Then apply search
  if (!searchText || searchText.trim() === "") {
    console.log("🔍 No search term, returning filtered data:", filteredData.length);
    return filteredData;
  }

  const searchLower = searchText.toLowerCase().trim();
  console.log("🔍 Applying search for:", searchLower);

  return filteredData.filter((record) => {
    // Search across all filterable fields
    if (metadata?.fields) {
      for (const [fieldName, fieldConfig] of Object.entries(metadata.fields)) {
        if (fieldConfig.filterable) {
          const value = record[fieldName];
          if (value && value.toString().toLowerCase().includes(searchLower)) {
            return true;
          }
        }
      }
    }
    
    // Fallback search across all string fields
    return Object.values(record).some(value => 
      value && value.toString().toLowerCase().includes(searchLower)
    );
  });
};

const ConsignorConfigurationPage = () => {
  const { configName } = useParams();
  console.log('✅ ConsignorConfigurationPage component rendered! configName:', configName);
  console.log('⚡ Component mounted at:', new Date().toISOString());
  console.log('🧭 Current window location:', window.location.pathname);
  console.log('🔧 URL params:', { configName });
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const {
    metadata,
    data,
    pagination,
    loading,
    error,
    isCreating,
    isUpdating,
    validationErrors
  } = useSelector(state => {
    console.log('🔍 ConsignorConfigurationPage state check:', {
      metadataExists: !!state.consignorConfiguration.metadata,
      dataCount: state.consignorConfiguration.data?.length || 0,
      loading: state.consignorConfiguration.loading,
      error: state.consignorConfiguration.error ? state.consignorConfiguration.error.substring(0, 100) + '...' : null,
      configName
    });
    return state.consignorConfiguration;
  });

  // Local state for UI
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterPanelVisible, setIsFilterPanelVisible] = useState(false);
  
  // Separate state for filter inputs and applied filters
  const [filters, setFilters] = useState({});
  const [appliedFilters, setAppliedFilters] = useState({});
  
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [toastMessage, setToastMessage] = useState('');
  
  // Modal states for CRUD operations
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Reset sortBy when configName changes to prevent wrong primary key usage
  useEffect(() => {
    console.log('🔄 ConfigName changed, resetting sortBy state:', configName);
    setSortBy(''); // Reset to use metadata.primaryKey
    setCurrentPage(1); // Reset to first page
  }, [configName]);

  // Fetch metadata on component mount
  useEffect(() => {
    if (configName && configName !== 'undefined') {
      console.log('🔄 Fetching consignor configuration metadata for:', configName);
      dispatch(fetchConsignorConfigurationMetadata(configName));
    }
  }, [dispatch, configName]);

  // Fetch data when dependencies change
  useEffect(() => {
    if (configName && metadata) {
      console.log('🔄 Fetching consignor configuration data for:', configName);
      
      const params = {
        page: currentPage,
        limit: 10,
        sortBy: sortBy || metadata.primaryKey,
        sortOrder,
        ...appliedFilters
      };

      console.log('📊 API params preparation:', {
        configName,
        currentSortBy: sortBy,
        metadataPrimaryKey: metadata.primaryKey,
        finalSortBy: sortBy || metadata.primaryKey,
        params
      });

      dispatch(fetchConsignorConfigurationData({ 
        configName, 
        params 
      }));
    }
  }, [dispatch, configName, metadata, currentPage, sortBy, sortOrder, appliedFilters]);

  // Apply client-side fuzzy search filtering with filters
  const filteredData = useMemo(() => {
    console.log("🔧 useMemo filteredData recalculating...");
    console.log("  - searchTerm:", searchTerm);
    console.log("  - data:", data);
    console.log("  - appliedFilters:", appliedFilters);
    
    const result = fuzzySearch(searchTerm, data, metadata, appliedFilters);
    console.log("  - result length:", result.length);
    return result;
  }, [searchTerm, data, metadata, appliedFilters]);

  // Clear errors on unmount
  useEffect(() => {
    return () => dispatch(clearErrors());
  }, [dispatch]);

  // Handle search
  const handleSearch = (searchValue) => {
    console.log("🔍 handleSearch called with:", searchValue);
    setSearchTerm(searchValue);
  };

  // Handle filters
  const handleFiltersChange = (newFilters) => {
    console.log("🔧 handleFiltersChange called with:", newFilters);
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    console.log("✅ handleApplyFilters called, setting appliedFilters:", filters);
    setAppliedFilters(filters);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    console.log("🔄 handleResetFilters called");
    setFilters({});
    setAppliedFilters({});
    setCurrentPage(1);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle back navigation
  const handleBack = () => {
    navigate('/consignor-configurations');
  };

  // Handle create (placeholder)
  const handleCreate = () => {
    console.log("Create new record for:", configName);
    setIsCreateModalOpen(true);
  };

  // Handle edit (placeholder)
  const handleEdit = (record) => {
    console.log("Edit record:", record);
    setSelectedRecord(record);
    setIsEditModalOpen(true);
  };

  // Handle delete (placeholder)
  const handleDelete = async (record) => {
    console.log("Delete record:", record);
    if (window.confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
      try {
        const result = await dispatch(deleteConsignorRecord({
          configName,
          id: record[metadata.primaryKey]
        }));

        if (result.type.endsWith('/fulfilled')) {
          setToastMessage('Record deleted successfully');
          // Clear toast after 3 seconds
          setTimeout(() => setToastMessage(''), 3000);
          // Refresh the data
          dispatch(fetchConsignorConfigurationData({ 
            configName, 
            params: {
              page: currentPage,
              limit: 10,
              sortBy: sortBy || metadata.primaryKey,
              sortOrder,
              ...appliedFilters
            }
          }));
        }
      } catch (error) {
        console.error('Delete error:', error);
        setToastMessage('Failed to delete record');
        setTimeout(() => setToastMessage(''), 3000);
      }
    }
  };

  // Handle successful create/edit operations
  const handleModalSuccess = () => {
    setToastMessage('Operation completed successfully');
    // Clear toast after 3 seconds
    setTimeout(() => setToastMessage(''), 3000);
    // Refresh the data
    dispatch(fetchConsignorConfigurationData({ 
      configName, 
      params: {
        page: currentPage,
        limit: 10,
        sortBy: sortBy || metadata.primaryKey,
        sortOrder,
        ...appliedFilters
      }
    }));
  };

  // Loading state
  if (loading && !metadata) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading consignor configuration...</div>
      </div>
    );
  }

  // Error state
  if (error && !metadata) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  // No metadata state
  if (!metadata) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">No configuration found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-0">
        <TMSHeader/>
      <div className="max-w-7xl mx-auto space-y-6 px-4 ">

        {/* Top Action Bar */}
        <ConfigurationTopActionBar
          onCreateNew={handleCreate}
          totalCount={filteredData.length}
          onBack={handleBack}
          showFilters={isFilterPanelVisible}
          onToggleFilters={() => setIsFilterPanelVisible(!isFilterPanelVisible)}
          searchText={searchTerm}
          onSearchChange={handleSearch}
          configurationName={`Consignor - ${metadata?.name}`}
        />

        {/* Filter Panel */}
        <ConfigurationFilterPanel
          isVisible={isFilterPanelVisible}
          onClose={() => setIsFilterPanelVisible(false)}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onApplyFilters={handleApplyFilters}
          onResetFilters={handleResetFilters}
          metadata={metadata}
        />

        {/* Main Content */}
        <ConfigurationListTable
          data={filteredData}
          metadata={metadata}
          loading={loading}
          error={error}
          searchText={searchTerm}
          onSearchChange={handleSearch}
          onEdit={handleEdit}
          onDelete={handleDelete}
          totalCount={filteredData.length}
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalRecords}
          itemsPerPage={pagination.limit}
          onPageChange={handlePageChange}
        />

        {/* Pagination Bar */}
        <ConfigurationPaginationBar
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalRecords}
          itemsPerPage={pagination.limit}
          onPageChange={handlePageChange}
          loading={loading}
        />

        {/* Create Modal */}
        <ConsignorConfigurationModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          mode="create"
          configName={configName}
          metadata={metadata}
          onSuccess={handleModalSuccess}
        />

        {/* Edit Modal */}
        <ConsignorConfigurationModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedRecord(null);
          }}
          mode="edit"
          configName={configName}
          metadata={metadata}
          record={selectedRecord}
          onSuccess={handleModalSuccess}
        />

        {/* Toast Notifications */}
        {toastMessage && (
          <div className="fixed bottom-4 right-4 z-50">
            <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
              {toastMessage}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsignorConfigurationPage;