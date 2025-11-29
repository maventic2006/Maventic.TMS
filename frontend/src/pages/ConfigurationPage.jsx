import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';

// Import components
import { Layout } from '../components/layout/Layout';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Toast } from '../components/ui/Toast';
import TMSHeader from '@/components/layout/TMSHeader';

// Import configuration-specific components
import {
  ConfigurationTopActionBar,
  ConfigurationListTable,
  ConfigurationFilterPanel
} from '../components/configuration';

// Import configuration actions
import {
  fetchConfigurationMetadata,
  fetchConfigurationData,
  createRecord,
  updateRecord,
  deleteRecord,
  clearErrors,
  fetchDropdownOptions
} from '../redux/slices/configurationSlice';

// Fuzzy search utility function - Same as TransporterMaintenance
const fuzzySearch = (searchText, data, metadata, appliedFilters = {}) => {
  if (!data) return [];
  
  console.log("🔍 fuzzySearch called with:");
  console.log("  - data length:", data.length);
  console.log("  - searchText:", searchText);
  console.log("  - appliedFilters:", appliedFilters);
  
  // First apply filters
  let filteredData = data.filter((record) => {
    console.log("🔍 Checking record:", record);
    
    // Apply status filter
    if (appliedFilters.status && appliedFilters.status !== '') {
      console.log(`  - Status filter: ${appliedFilters.status} vs ${record.status}`);
      // Make status comparison case-insensitive
      const filterStatus = appliedFilters.status.toLowerCase();
      const recordStatus = (record.status || '').toLowerCase();
      if (recordStatus !== filterStatus) {
        console.log(`  - REJECTED by status filter (case-insensitive: ${filterStatus} vs ${recordStatus})`);
        return false;
      }
    }
    
    // Apply other field filters
    for (const [filterKey, filterValue] of Object.entries(appliedFilters)) {
      if (filterKey !== 'status' && filterValue && filterValue !== '') {
        const recordValue = record[filterKey];
        console.log(`  - Field filter ${filterKey}: ${filterValue} vs ${recordValue}`);
        if (!recordValue || !String(recordValue).toLowerCase().includes(String(filterValue).toLowerCase())) {
          console.log(`  - REJECTED by field filter ${filterKey}`);
          return false;
        }
      }
    }
    
    console.log(`  - ACCEPTED by filters`);
    return true;
  });

  console.log("🔍 After filters, data length:", filteredData.length);

  // Then apply search
  if (!searchText || searchText.trim() === "") {
    console.log("🔍 No search text, returning filtered data");
    return filteredData;
  }

  const searchLower = searchText.toLowerCase().trim();
  console.log("🔍 Applying search for:", searchLower);

  return filteredData.filter((record) => {
    // Get searchable fields from metadata
    const searchableFields = [];
    
    // Add all field values from the record
    if (metadata?.fields) {
      Object.keys(metadata.fields).forEach(fieldKey => {
        const fieldValue = record[fieldKey];
        if (fieldValue !== null && fieldValue !== undefined) {
          searchableFields.push(fieldValue);
        }
      });
    }
    
    // Also search in primary key field
    if (metadata?.primaryKey && record[metadata.primaryKey]) {
      searchableFields.push(record[metadata.primaryKey]);
    }

    // Check if any field contains the search text (case-insensitive partial match)
    return searchableFields.some((field) => {
      if (field === null || field === undefined) return false;
      return String(field).toLowerCase().includes(searchLower);
    });
  });
};

const ConfigurationPage = () => {
  const { configName } = useParams();
  console.log('✅ ConfigurationPage component rendered! configName:', configName);
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
    validationErrors,
    dropdownOptions
  } = useSelector(state => {
    console.log('🏪 Configuration Redux state full:', state.configuration);
    return state.configuration;
  });

  console.log('🔍 ConfigurationPage state check:', {
    metadataExists: !!metadata,
    dataCount: data?.length || 0,
    loading,
    error: error ? error.substring(0, 100) + '...' : null,
    configName
  });

  // Local state for UI
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterPanelVisible, setIsFilterPanelVisible] = useState(false);
  
  // Separate state for filter inputs and applied filters (like TransporterMaintenance)
  const [filters, setFilters] = useState({});
  // TEMP: Remove default status filter to debug data display issue
  const [appliedFilters, setAppliedFilters] = useState({});
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [formData, setFormData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState(''); // Empty string - let backend determine default sort field
  const [sortOrder, setSortOrder] = useState('desc');
  const [toastMessage, setToastMessage] = useState('');

  // Fetch metadata on component mount
  useEffect(() => {
    console.log('📡 useEffect for metadata - configName:', configName);
    if (configName) {
      console.log('🚀 Dispatching fetchConfigurationMetadata for:', configName);
      dispatch(fetchConfigurationMetadata(configName));
    }
  }, [dispatch, configName]);

  // Fetch dropdown options when metadata is loaded
  useEffect(() => {
    if (metadata?.fields) {
      // Fetch status options if not already loaded
      if (!dropdownOptions['status']) {
        dispatch(fetchDropdownOptions('status'));
      }
      
      // Fetch options for any select fields
      Object.entries(metadata.fields).forEach(([fieldName, fieldConfig]) => {
        if (fieldConfig.inputType === 'select' && !dropdownOptions[fieldName]) {
          // Try to fetch from database using the field name as type
          dispatch(fetchDropdownOptions(fieldName));
        }
      });
    }
  }, [metadata, dispatch, dropdownOptions]);

  // Fetch data when dependencies change (excluding searchTerm for client-side search)
  useEffect(() => {
    console.log('📡 useEffect for data - metadata exists:', !!metadata, 'configName:', configName);
    if (metadata && configName) {
      const params = {
        page: currentPage,
        limit: 10,
        // Remove search from server call - we'll do client-side fuzzy search
        sortBy,
        sortOrder,
        ...appliedFilters
      };
      console.log('🚀 Dispatching fetchConfigurationData with params:', params);
      console.log('🔗 API integration - fetching configuration data for', configName);
      dispatch(fetchConfigurationData({ configName, params }))
        .then((result) => {
          console.log('✅ Configuration data fetch result:', result);
          if (result.payload) {
            console.log('📊 Data received:', result.payload.data?.length, 'records');
            console.log('📄 Pagination info:', result.payload.pagination);
          }
        })
        .catch((error) => {
          console.error('❌ Configuration data fetch failed:', error);
        });
    }
  }, [dispatch, configName, metadata, currentPage, sortBy, sortOrder, appliedFilters]);

  // Apply client-side fuzzy search filtering with filters (same as TransporterMaintenance)
  const filteredData = useMemo(() => {
    console.log('🔍 filteredData computation triggered:');
    console.log('  - Raw data length:', data?.length || 0);
    console.log('  - Raw data sample:', data?.[0]);
    console.log('  - searchTerm:', searchTerm);
    console.log('  - appliedFilters:', appliedFilters);
    console.log('  - metadata exists:', !!metadata);
    
    const result = fuzzySearch(searchTerm, data || [], metadata, appliedFilters);
    console.log('  - Filtered result length:', result?.length || 0);
    console.log('  - Filtered result sample:', result?.[0]);
    
    return result;
  }, [searchTerm, data, metadata, appliedFilters]);

  // Clear errors on unmount
  useEffect(() => {
    return () => dispatch(clearErrors());
  }, [dispatch]);

  // Handle search
  const handleSearch = (searchValue) => {
    console.log('🔍 Search triggered with value:', searchValue);
    setSearchTerm(searchValue);
    setCurrentPage(1);
  };

  // Handle filters (same pattern as TransporterMaintenance)
  const handleFiltersChange = (newFilters) => {
    console.log('🔧 Filters changed:', newFilters);
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    console.log('✅ Applying filters:', filters);
    // Apply filters by copying current filter state to appliedFilters
    setAppliedFilters({ ...filters });
    setCurrentPage(1);
    setIsFilterPanelVisible(false);
  };

  const handleResetFilters = () => {
    console.log('🔄 Resetting filters');
    // Clear both filter input state and applied filters
    const emptyFilters = {};
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setCurrentPage(1);
  };

  // Handle sorting
  const handleSort = (field) => {
    console.log('🔄 Sort triggered for field:', field);
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    console.log('📄 Page change to:', page);
    setCurrentPage(page);
  };

  // Initialize form data
  const initializeFormData = (record = null) => {
    if (!metadata?.fields) return {};
    
    const initialData = {};
    Object.entries(metadata.fields).forEach(([fieldName, fieldConfig]) => {
      if (record) {
        initialData[fieldName] = record[fieldName] || '';
      } else {
        initialData[fieldName] = fieldConfig.default || '';
      }
    });
    return initialData;
  };

  // Handle create
  const handleCreate = () => {
    console.log('➕ Creating new record');
    setFormData(initializeFormData());
    setIsCreateModalOpen(true);
  };

  // Handle edit
  const handleEdit = (record) => {
    console.log('✏️ Editing record:', record);
    setSelectedRecord(record);
    setFormData(initializeFormData(record));
    setIsEditModalOpen(true);
  };

  // Handle delete
  const handleDelete = async (record) => {
    console.log('🗑️ Attempting to delete record:', record);
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        console.log('🚀 Dispatching delete action');
        const result = await dispatch(deleteRecord({
          configName,
          id: record[metadata.primaryKey]
        }));
        
        console.log('🗑️ Delete result:', result);
        if (result.type.endsWith('/fulfilled')) {
          setToastMessage('Record deleted successfully');
          console.log('✅ Record deleted successfully');
        }
      } catch (error) {
        console.error('❌ Delete error:', error);
      }
    }
  };

  // Handle form input change
  const handleInputChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  // Handle form submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (selectedRecord) {
        // Update existing record
        console.log('🔄 Updating record:', selectedRecord[metadata.primaryKey]);
        const result = await dispatch(updateRecord({
          configName,
          id: selectedRecord[metadata.primaryKey],
          data: formData
        }));
        
        console.log('🔄 Update result:', result);
        if (result.type.endsWith('/fulfilled')) {
          setToastMessage('Record updated successfully');
          setIsEditModalOpen(false);
          setSelectedRecord(null);
          setFormData({});
          // Refresh data
          dispatch(fetchConfigurationData({ configName, page: currentPage, limit: pagination?.limit || 10 }));
          console.log('✅ Record updated successfully');
        } else if (result.type.endsWith('/rejected')) {
          setToastMessage('Failed to update record. Please check the form.');
        }
      } else {
        // Create new record
        console.log('➕ Creating new record with data:', formData);
        const result = await dispatch(createRecord({
          configName,
          data: formData
        }));
        
        console.log('➕ Create result:', result);
        if (result.type.endsWith('/fulfilled')) {
          setToastMessage('Record created successfully');
          setIsCreateModalOpen(false);
          setFormData({});
          // Refresh data
          dispatch(fetchConfigurationData({ configName, page: currentPage, limit: pagination?.limit || 10 }));
          console.log('✅ Record created successfully');
        } else if (result.type.endsWith('/rejected')) {
          setToastMessage('Failed to create record. Please check the form.');
        }
      }
    } catch (error) {
      console.error('❌ Form submission error:', error);
      setToastMessage('An error occurred. Please try again.');
    }
  };

  // Render form field
  const renderFormField = (fieldName, fieldConfig) => {
    const value = formData[fieldName] || '';
    const fieldError = validationErrors?.find(err => err.field === fieldName)?.message;
    
    switch (fieldConfig.inputType || fieldConfig.type) {
      case 'select':
        // Use dynamic options from Redux if available, fallback to hardcoded options
        const selectOptions = dropdownOptions[fieldName] || 
          (fieldConfig.options?.map(opt => ({ value: opt, label: opt })) || []);
        
        return (
          <div key={fieldName} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {fieldConfig.label}
              {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                fieldError ? 'border-red-500' : 'border-gray-300'
              }`}
              value={value}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              required={fieldConfig.required}
            >
              <option value="">Select {fieldConfig.label}</option>
              {selectOptions.map((option) => (
                <option key={option.value || option} value={option.value || option}>
                  {option.label || option}
                </option>
              ))}
            </select>
            {fieldError && (
              <p className="text-red-500 text-xs mt-1">{fieldError}</p>
            )}
          </div>
        );
      
      case 'textarea':
        return (
          <div key={fieldName} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {fieldConfig.label}
              {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                fieldError ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={4}
              value={value}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              placeholder={`Enter ${fieldConfig.label.toLowerCase()}`}
              required={fieldConfig.required}
              maxLength={fieldConfig.maxLength}
            />
            {fieldError && (
              <p className="text-red-500 text-xs mt-1">{fieldError}</p>
            )}
          </div>
        );
      
      case 'switch':
      case 'boolean':
        return (
          <div key={fieldName} className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={value}
                onChange={(e) => handleInputChange(fieldName, e.target.checked)}
              />
              {fieldConfig.label}
            </label>
          </div>
        );
      
      default:
        return (
          <div key={fieldName} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {fieldConfig.label}
              {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type={fieldConfig.type === 'int' ? 'number' : 'text'}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                fieldError ? 'border-red-500' : 'border-gray-300'
              }`}
              value={value}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              placeholder={`Enter ${fieldConfig.label.toLowerCase()}`}
              required={fieldConfig.required}
              maxLength={fieldConfig.maxLength}
              disabled={fieldConfig.autoGenerate && !selectedRecord}
            />
            {fieldError && (
              <p className="text-red-500 text-xs mt-1">{fieldError}</p>
            )}
          </div>
        );
    }
  };

  // Loading state
  if (loading && !metadata) {
    console.log('⏳ ConfigurationPage - Showing loading state');
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <div className="ml-4 text-lg text-gray-600">Loading configuration...</div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error) {
    console.log('❌ ConfigurationPage - Showing error state:', error);
    return (
      <Layout>
        <div className="p-8 text-center">
          <div className="text-red-600 text-xl mb-4">Error Loading Configuration</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </Layout>
    );
  }

  // No metadata state
  if (!metadata) {
    console.log('⚠️ ConfigurationPage - Showing no metadata state');
    return (
      <Layout>
        <div className="p-8 text-center">
          <div className="text-gray-600 text-xl mb-4">Configuration not found</div>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </Layout>
    );
  }

  console.log('🎨 ConfigurationPage - Rendering main UI with metadata:', metadata.name);

  return (
    <Layout>
        <TMSHeader />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6 px-4"
      >
        {/* Top Action Bar */}
        <ConfigurationTopActionBar
          title={`${metadata.name} Configuration`}
          subtitle={metadata.description}
          onBack={() => navigate(-1)}
          onCreateNew={handleCreate}
          onToggleFilters={() => setIsFilterPanelVisible(!isFilterPanelVisible)}
          createButtonText="Add New Record"
          configurationName={metadata.name}
          totalCount={data?.length || 0}
          showFilters={isFilterPanelVisible}
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

        {/* List Table with Integrated Pagination */}
        <ConfigurationListTable
          data={filteredData || []}
          metadata={metadata}
          loading={loading}
          searchText={searchTerm}
          onSearchChange={handleSearch}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSort={handleSort}
          sortBy={sortBy}
          sortOrder={sortOrder}
          totalCount={data?.length || 0}
          currentPage={currentPage}
          totalPages={pagination?.totalPages || 1}
          totalItems={pagination?.totalRecords || 0}
          itemsPerPage={pagination?.limit || 10}
          onPageChange={handlePageChange}
        />

        {/* Create Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setFormData({});
            dispatch(clearErrors());
          }}
          title={`Create New ${metadata.name}`}
          size="lg"
        >
          <form onSubmit={handleFormSubmit}>
            {validationErrors && validationErrors.length > 0 && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm font-medium">Please fix the following errors:</p>
                <ul className="text-red-600 text-xs mt-1 list-disc list-inside">
                  {validationErrors.map((err, idx) => (
                    <li key={idx}>{err.message}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="max-h-96 overflow-y-auto px-1">
              {Object.entries(metadata.fields || {})
                .filter(([fieldName]) => {
                  // Exclude auto-generated primary key
                  if (fieldName === metadata.primaryKey && metadata.fields[fieldName]?.autoGenerate) {
                    return false;
                  }
                  // Exclude audit fields - these are auto-populated by backend
                  const auditFields = ['created_at', 'created_on', 'created_by', 'updated_at', 'updated_on', 'updated_by'];
                  if (auditFields.includes(fieldName)) {
                    return false;
                  }
                  return true;
                })
                .map(([fieldName, fieldConfig]) => renderFormField(fieldName, fieldConfig))
              }
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
              >
                {isCreating ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedRecord(null);
            setFormData({});
            dispatch(clearErrors());
          }}
          title={`Edit ${metadata.name}`}
          size="lg"
        >
          <form onSubmit={handleFormSubmit}>
            {validationErrors && validationErrors.length > 0 && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm font-medium">Please fix the following errors:</p>
                <ul className="text-red-600 text-xs mt-1 list-disc list-inside">
                  {validationErrors.map((err, idx) => (
                    <li key={idx}>{err.message}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="max-h-96 overflow-y-auto px-1">
              {Object.entries(metadata.fields || {})
                .filter(([fieldName]) => {
                  // Exclude primary key (not editable)
                  if (fieldName === metadata.primaryKey) {
                    return false;
                  }
                  // Exclude audit fields - these are auto-populated by backend
                  const auditFields = ['created_at', 'created_on', 'created_by', 'updated_at', 'updated_on', 'updated_by'];
                  if (auditFields.includes(fieldName)) {
                    return false;
                  }
                  return true;
                })
                .map(([fieldName, fieldConfig]) => renderFormField(fieldName, fieldConfig))
              }
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
              >
                {isUpdating ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </form>
        </Modal>
      </motion.div>

      {/* Toast notification */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setToastMessage('')}
        />
      )}
      </Layout>
  );
};

export default ConfigurationPage;