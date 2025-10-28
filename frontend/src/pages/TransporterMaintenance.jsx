import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import TopActionBar from "../components/transporter/TopActionBar";
import TransporterFilterPanel from "../components/transporter/TransporterFilterPanel";
import TransporterListTable from "../components/transporter/TransporterListTable";
import PaginationBar from "../components/transporter/PaginationBar";
import { fetchTransporters } from "../redux/slices/transporterSlice";

// Main Transporter Maintenance Component
const TransporterMaintenance = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const { transporters, pagination, isFetching, error } = useSelector(
    (state) => state.transporter
  );

  // Local state
  const [searchText, setSearchText] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    transporterId: "",
    tan: "",
    tinPan: "",
    vatGst: "",
    status: "",
    transportMode: [],
  });

  // Fetch transporters when component mounts or when filters/search change
  useEffect(() => {
    const fetchData = () => {
      const params = {
        page: pagination.page,
        limit: pagination.limit || 25,
      };

      // Add search parameter
      if (searchText) {
        params.search = searchText;
      }

      // Add filter parameters
      if (filters.transporterId) {
        params.transporterId = filters.transporterId;
      }
      if (filters.status) {
        params.status = filters.status;
      }
      if (filters.tinPan) {
        params.businessName = filters.tinPan; // API uses businessName for search
      }
      if (filters.vatGst) {
        params.state = filters.vatGst; // API uses state for search
      }
      if (filters.transportMode.length > 0) {
        params.transportMode = filters.transportMode.join(",");
      }

      dispatch(fetchTransporters(params));
    };

    // Debounce the API call
    const timer = setTimeout(fetchData, 300);
    return () => clearTimeout(timer);
  }, [dispatch, searchText, filters, pagination.page]);

  // Initial load
  useEffect(() => {
    dispatch(fetchTransporters({ page: 1, limit: 25 }));
  }, [dispatch]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSearchChange = (text) => {
    setSearchText(text);
  };

  const handleTransporterClick = (transporterId) => {
    navigate(`/transporter/${transporterId}`);
  };

  const handleCreateNew = () => {
    navigate("/transporter/create");
  };

  const handleLogout = () => {
    // Implement logout logic
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleBack = () => {
    navigate("/tms-portal");
  };

  const handlePageChange = (page) => {
    dispatch(
      fetchTransporters({
        page,
        limit: pagination.limit || 25,
        search: searchText,
        ...filters,
      })
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-background via-gray-50 to-blue-50/30 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <TopActionBar
          onCreateNew={handleCreateNew}
          onLogout={handleLogout}
          onBack={handleBack}
          totalCount={pagination.total || 0}
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
          transporters={transporters}
          loading={isFetching}
          onTransporterClick={handleTransporterClick}
          currentPage={pagination.page}
          totalPages={pagination.pages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={handlePageChange}
          filteredCount={pagination.total}
        />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <p className="font-medium">Error loading transporters:</p>
            <p className="text-sm">{error.message || "Something went wrong"}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransporterMaintenance;
