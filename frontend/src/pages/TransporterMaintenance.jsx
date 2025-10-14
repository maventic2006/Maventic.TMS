import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import TopActionBar from '../components/transporter/TopActionBar';
import TransporterFilterPanel from '../components/transporter/TransporterFilterPanel';
import TransporterListTable from '../components/transporter/TransporterListTable';
import PaginationBar from '../components/transporter/PaginationBar';
import { generateMockTransporters } from '../services/transporterService';

// Use mock data for development - replace with API calls in production
const mockTransporters = generateMockTransporters(174); // Updated to match screenshot count

// Main Transporter Maintenance Component
const TransporterMaintenance = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  const [filters, setFilters] = useState({
    transporterId: '',
    tan: '',
    tinPan: '',
    vatGst: '',
    status: '',
    transportMode: []
  });

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText, filters]);

  // Filter and search logic
  const filteredTransporters = useMemo(() => {
    let filtered = [...mockTransporters];

    // Apply filters
    if (filters.transporterId) {
      filtered = filtered.filter(t => 
        t.id.toLowerCase().includes(filters.transporterId.toLowerCase())
      );
    }
    if (filters.tan) {
      filtered = filtered.filter(t => 
        t.tan && t.tan.toLowerCase().includes(filters.tan.toLowerCase())
      );
    }
    if (filters.tinPan) {
      filtered = filtered.filter(t => 
        t.tinPan && t.tinPan.toLowerCase().includes(filters.tinPan.toLowerCase())
      );
    }
    if (filters.vatGst) {
      filtered = filtered.filter(t => 
        t.vatGst && t.vatGst.toLowerCase().includes(filters.vatGst.toLowerCase())
      );
    }
    if (filters.status) {
      filtered = filtered.filter(t => t.status === filters.status);
    }
    if (filters.transportMode.length > 0) {
      filtered = filtered.filter(t => 
        filters.transportMode.some(mode => t.transportMode.includes(mode))
      );
    }

    // Apply search
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(t =>
        t.id.toLowerCase().includes(searchLower) ||
        t.businessName.toLowerCase().includes(searchLower) ||
        t.address.toLowerCase().includes(searchLower) ||
        t.mobileNumber.includes(searchLower) ||
        t.emailId.toLowerCase().includes(searchLower) ||
        t.tinPan.toLowerCase().includes(searchLower) ||
        t.vatGst.toLowerCase().includes(searchLower) ||
        t.createdBy.toLowerCase().includes(searchLower) ||
        t.approver.toLowerCase().includes(searchLower) ||
        (t.tan && t.tan.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [searchText, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredTransporters.length / itemsPerPage);
  const paginatedTransporters = filteredTransporters.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
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
    <div className="min-h-screen bg-gradient-to-br from-primary-background via-gray-50 to-blue-50/30 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <TopActionBar 
          onCreateNew={handleCreateNew}
          onLogout={handleLogout}
          onBack={handleBack}
          totalCount={mockTransporters.length}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          searchText={searchText}
          onSearchChange={handleSearchChange}
        />

        <TransporterFilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          showFilters={showFilters}
        />

        <TransporterListTable
          transporters={paginatedTransporters}
          loading={loading}
          onTransporterClick={handleTransporterClick}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredTransporters.length}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          filteredCount={filteredTransporters.length}
        />
      </div>
    </div>
  );
};

export default TransporterMaintenance;