import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import TopActionBar from "../components/transporter/TopActionBar";
import TransporterFilterPanel from "../components/transporter/TransporterFilterPanel";
import TransporterListTable from "../components/transporter/TransporterListTable";
import PaginationBar from "../components/transporter/PaginationBar";
import { fetchTransporters } from "../redux/slices/transporterSlice";

// Fuzzy search utility function
const fuzzySearch = (searchText, transporters) => {
  if (!searchText || searchText.trim() === "") {
    return transporters;
  }

  const searchLower = searchText.toLowerCase().trim();
  
  return transporters.filter((transporter) => {
    // Search across multiple fields
    const searchableFields = [
      transporter.id,
      transporter.businessName,
      transporter.mobileNumber,
      transporter.emailId,
      transporter.tinPan,
      transporter.tan,
      transporter.vatGst,
      transporter.address,
      transporter.status,
      transporter.createdBy,
      ...(transporter.transportMode || [])
    ];

    // Check if any field contains the search text (case-insensitive partial match)
    return searchableFields.some((field) => {
      if (field === null || field === undefined) return false;
      return String(field).toLowerCase().includes(searchLower);
    });
  });
};

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

  // Separate state for filter inputs and applied filters
  const [filters, setFilters] = useState({
    transporterId: "",
    tan: "",
    tinPan: "",
    vatGst: "",
    status: "",
    transportMode: [],
  });

  const [appliedFilters, setAppliedFilters] = useState({
    transporterId: "",
    tan: "",
    tinPan: "",
    vatGst: "",
    status: "",
    transportMode: [],
  });

  // Fetch transporters when component mounts or when appliedFilters change (not on every keystroke)
  useEffect(() => {
    const fetchData = () => {
      const params = {
        page: pagination.page,
        limit: pagination.limit || 25,
      };

      // Only add applied filter parameters (not the typing state)
      if (appliedFilters.transporterId) {
        params.transporterId = appliedFilters.transporterId;
      }
      if (appliedFilters.status) {
        params.status = appliedFilters.status;
      }
      if (appliedFilters.tinPan) {
        params.businessName = appliedFilters.tinPan; // API uses businessName for search
      }
      if (appliedFilters.tan) {
        params.tan = appliedFilters.tan; // API uses tan for TAN number search
      }
      if (appliedFilters.vatGst) {
        params.vatGst = appliedFilters.vatGst; // API uses vatGst for VAT/GST number search
      }
      if (appliedFilters.transportMode.length > 0) {
        params.transportMode = appliedFilters.transportMode.join(",");
      }

      dispatch(fetchTransporters(params));
    };

    fetchData();
  }, [dispatch, appliedFilters, pagination.page]);

  // Initial load
  useEffect(() => {
    dispatch(fetchTransporters({ page: 1, limit: 25 }));
  }, [dispatch]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const handleApplyFilters = useCallback(() => {
    // Apply filters by copying current filter state to appliedFilters
    setAppliedFilters({ ...filters });
  }, [filters]);

  const handleClearFilters = useCallback(() => {
    // Clear both filter input state and applied filters
    const emptyFilters = {
      transporterId: "",
      tan: "",
      tinPan: "",
      vatGst: "",
      status: "",
      transportMode: [],
    };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
  }, []);

  const handleSearchChange = useCallback((text) => {
    setSearchText(text);
  }, []);

  // Apply client-side fuzzy search filtering
  const filteredTransporters = useMemo(() => {
    return fuzzySearch(searchText, transporters);
  }, [searchText, transporters]);

  const handleTransporterClick = useCallback((transporterId) => {
    navigate(`/transporter/${transporterId}`);
  }, [navigate]);

  const handleCreateNew = useCallback(() => {
    navigate("/transporter/create");
  }, [navigate]);

  const handleLogout = useCallback(() => {
    // Implement logout logic
    localStorage.removeItem("token");
    navigate("/login");
  }, [navigate]);

  const handleBack = useCallback(() => {
    navigate("/tms-portal");
  }, [navigate]);

  const handlePageChange = useCallback((page) => {
    // Build params using only appliedFilters (not search or unapplied filters)
    const params = {
      page,
      limit: pagination.limit || 25,
    };

    if (appliedFilters.transporterId) {
      params.transporterId = appliedFilters.transporterId;
    }
    if (appliedFilters.status) {
      params.status = appliedFilters.status;
    }
    if (appliedFilters.tinPan) {
      params.businessName = appliedFilters.tinPan;
    }
    if (appliedFilters.tan) {
      params.tan = appliedFilters.tan;
    }
    if (appliedFilters.vatGst) {
      params.vatGst = appliedFilters.vatGst;
    }
    if (appliedFilters.transportMode.length > 0) {
      params.transportMode = appliedFilters.transportMode.join(",");
    }

    dispatch(fetchTransporters(params));
  }, [dispatch, pagination.limit, appliedFilters]);

  const handleToggleFilters = useCallback(() => {
    setShowFilters(!showFilters);
  }, [showFilters]);

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <TopActionBar
          onCreateNew={handleCreateNew}
          onLogout={handleLogout}
          onBack={handleBack}
          totalCount={pagination.total || 0}
          showFilters={showFilters}
          onToggleFilters={handleToggleFilters}
          searchText={searchText}
          onSearchChange={handleSearchChange}
        />

        <TransporterFilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
          showFilters={showFilters}
        />

        <TransporterListTable
          transporters={filteredTransporters}
          loading={isFetching}
          onTransporterClick={handleTransporterClick}
          currentPage={pagination.page}
          totalPages={pagination.pages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={handlePageChange}
          filteredCount={filteredTransporters.length}
          searchText={searchText}
          onSearchChange={handleSearchChange}
        />

        {error && (
          <div className="bg-[#FEE2E2] border border-[#EF4444] rounded-xl p-6 text-[#EF4444]" style={{ boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.05)' }}>
            <p className="font-semibold text-sm">Error loading transporters:</p>
            <p className="text-sm mt-1">{error.message || "Something went wrong"}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransporterMaintenance;
