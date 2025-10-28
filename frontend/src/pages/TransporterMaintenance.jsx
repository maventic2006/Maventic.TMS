import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import Header from '../components/layout/Header';
import TopActionBar from '../components/transporter/TopActionBar';
import TransporterFilterPanel from '../components/transporter/TransporterFilterPanel';
import TransporterListTable from '../components/transporter/TransporterListTable';
import PaginationBar from '../components/transporter/PaginationBar';
import { transporterAPI } from '../utils/api';

// Main Transporter Maintenance Component
const TransporterMaintenance = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [transporters, setTransporters] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 25,
    total: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false
  });
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    transporterId: '',
    tan: '',
    tinPan: '',
    vatGst: '',
    status: '',
    transportMode: []
  });

  // Fetch transporters from API
  const fetchTransporters = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: pagination.per_page || 25,
        search: searchText,
        transporterId: filters.transporterId,
        status: filters.status,
        transportMode: filters.transportMode,
        sortBy: 'created_at',
        sortOrder: 'desc'
      };

      // Remove empty parameters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || (Array.isArray(params[key]) && params[key].length === 0)) {
          delete params[key];
        }
      });

      const response = await transporterAPI.getTransporters(params);
      
      if (response.data.success) {
        setTransporters(response.data.data);
        setPagination(response.data.pagination);
      } else {
        throw new Error(response.data.message || 'Failed to fetch transporters');
      }
    } catch (err) {
      console.error('Error fetching transporters:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch transporters');
      setTransporters([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount and when filters/search/page changes
  useEffect(() => {
    fetchTransporters();
  }, [currentPage, searchText, filters]);

  // Debounced search - reset to page 1 when search/filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText, filters]);

  // Error display component
  const ErrorDisplay = ({ error, onRetry }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="text-red-500 text-4xl">🚨</div>
        <h3 className="text-lg font-semibold text-red-800">Authentication Required</h3>
        <p className="text-red-600 mb-2">
          {error.includes('403') || error.includes('Forbidden') || error.includes('permissions') 
            ? "You need to log in to access transporters data. Use the 'Quick Login' button in the top-right corner." 
            : `Error loading transporters: ${error}`
          }
        </p>
        <div className="flex space-x-3">
          <button 
            onClick={onRetry}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  );

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSearchChange = (text) => {
    setSearchText(text);
  };

  const handleTransporterClick = (transporterId) => {
    navigate(`/transporter/${transporterId}`);
  };

  const handleCreateNew = () => {
    navigate('/transporter/create');
  };

  const handleLogout = () => {
    // Implement logout logic
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleBack = () => {
    navigate('/tms-portal');
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
      {/* Top Header */}
      <Header onLogout={handleLogout} />
      
      {/* Main Content */}
      <div className="p-3 sm:p-4 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          <TopActionBar 
            onCreateNew={handleCreateNew}
            onBack={handleBack}
            totalCount={pagination.total}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            searchText={searchText}
            onSearchChange={handleSearchChange}
          />        <TransporterFilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          showFilters={showFilters}
        />

        {error ? (
          <ErrorDisplay error={error} onRetry={fetchTransporters} />
        ) : (
          <TransporterListTable
            transporters={transporters}
            loading={loading}
            onTransporterClick={handleTransporterClick}
            currentPage={pagination.current_page}
            totalPages={pagination.total_pages}
            totalItems={pagination.total}
            itemsPerPage={pagination.per_page}
            onPageChange={handlePageChange}
            filteredCount={pagination.total}
            searchText={searchText}
            onSearchChange={handleSearchChange}
          />
        )}
        </div>
      </div>
    </div>
  );
};

export default TransporterMaintenance;