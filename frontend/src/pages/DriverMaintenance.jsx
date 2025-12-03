import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import TMSHeader from "../components/layout/TMSHeader";
import { getPageTheme } from "../theme.config";
import { fetchDrivers, resetPaginationToFirstPage } from "../redux/slices/driverSlice";
import DriverTopActionBar from "../components/driver/DriverTopActionBar";
import DriverFilterPanel from "../components/driver/DriverFilterPanel";
import DriverListTable from "../components/driver/DriverListTable";

// Fuzzy search utility function
const fuzzySearch = (searchText, drivers) => {
  if (!searchText || searchText.trim() === "") {
    return drivers;
  }

  const searchLower = searchText.toLowerCase().trim();

  return drivers.filter((driver) => {
    // Search across multiple fields (using camelCase from API response)
    const searchableFields = [
      driver.id,
      driver.fullName,
      driver.phoneNumber,
      driver.emailId,
      driver.licenseNumbers,
      driver.country,
      driver.state,
      driver.city,
      driver.postalCode,
      driver.gender,
      driver.bloodGroup,
      driver.status,
      driver.avgRating?.toString(),
    ];

    // Check if any field contains the search text (case-insensitive partial match)
    return searchableFields.some((field) => {
      if (field === null || field === undefined) return false;
      return String(field).toLowerCase().includes(searchLower);
    });
  });
};

// Display helper function
const displayValue = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    value === "N/A"
  ) {
    return "N/A";
  }
  return value;
};

// Main Driver Maintenance Component
const DriverMaintenance = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = getPageTheme("list");

  // Redux state
  const { drivers, pagination, isFetching, error } = useSelector(
    (state) => state.driver
  );

  // Local state
  const [searchText, setSearchText] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    driverId: "",
    fullName: "",
    phoneNumber: "",
    licenseNumber: "",
    country: "",
    state: "",
    city: "",
    postalCode: "",
    status: "",
    gender: "",
    bloodGroup: "",
    avgRating: "",
    createdOnStart: "",
    createdOnEnd: "",
  });

  const [appliedFilters, setAppliedFilters] = useState({
    driverId: "",
    fullName: "",
    phoneNumber: "",
    licenseNumber: "",
    country: "",
    state: "",
    city: "",
    postalCode: "",
    status: "",
    gender: "",
    bloodGroup: "",
    avgRating: "",
    createdOnStart: "",
    createdOnEnd: "",
  });

  // Single useEffect for data fetching - prevents infinite loops
  useEffect(() => {
    // Prevent multiple simultaneous calls
    if (isFetching) return;
    
    const fetchData = () => {
      const params = {
        page: pagination.page || 1,
        limit: pagination.limit || 25,
      };

      // Add all applied filter parameters
      if (appliedFilters.driverId) params.driverId = appliedFilters.driverId;
      if (appliedFilters.fullName) params.fullName = appliedFilters.fullName;
      if (appliedFilters.phoneNumber)
        params.phoneNumber = appliedFilters.phoneNumber;
      if (appliedFilters.licenseNumber)
        params.licenseNumber = appliedFilters.licenseNumber;
      if (appliedFilters.country) params.country = appliedFilters.country;
      if (appliedFilters.state) params.state = appliedFilters.state;
      if (appliedFilters.city) params.city = appliedFilters.city;
      if (appliedFilters.postalCode)
        params.postalCode = appliedFilters.postalCode;
      if (appliedFilters.status) params.status = appliedFilters.status;
      if (appliedFilters.gender) params.gender = appliedFilters.gender;
      if (appliedFilters.bloodGroup)
        params.bloodGroup = appliedFilters.bloodGroup;
      if (appliedFilters.avgRating) params.avgRating = appliedFilters.avgRating;
      if (appliedFilters.createdOnStart)
        params.createdOnStart = appliedFilters.createdOnStart;
      if (appliedFilters.createdOnEnd)
        params.createdOnEnd = appliedFilters.createdOnEnd;

      dispatch(fetchDrivers(params));
    };

    fetchData();
  }, [dispatch, appliedFilters, pagination.page]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const handleApplyFilters = useCallback(() => {
    dispatch(resetPaginationToFirstPage());
    setAppliedFilters({ ...filters });
  }, [filters, dispatch]);

  const handleClearFilters = useCallback(() => {
    const emptyFilters = {
      driverId: "",
      fullName: "",
      phoneNumber: "",
      licenseNumber: "",
      country: "",
      state: "",
      city: "",
      postalCode: "",
      status: "",
      gender: "",
      bloodGroup: "",
      avgRating: "",
      createdOnStart: "",
      createdOnEnd: "",
    };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
  }, []);

  const handleSearchChange = useCallback((text) => {
    setSearchText(text);
  }, []);

  // Apply client-side fuzzy search filtering
  const filteredDrivers = useMemo(() => {
    return fuzzySearch(searchText, drivers);
  }, [searchText, drivers]);

  const handleDriverClick = useCallback(
    (driverId) => {
      navigate(`/driver/${driverId}`);
    },
    [navigate]
  );

  const handleCreateNew = useCallback(() => {
    navigate("/driver/create");
  }, [navigate]);

  const handleBack = useCallback(() => {
    navigate("/tms-portal");
  }, [navigate]);

  const handlePageChange = useCallback(
    (page) => {
      const params = {
        page,
        limit: pagination.limit || 25,
      };

      // Add all applied filters to page change
      if (appliedFilters.driverId) params.driverId = appliedFilters.driverId;
      if (appliedFilters.fullName) params.fullName = appliedFilters.fullName;
      if (appliedFilters.phoneNumber)
        params.phoneNumber = appliedFilters.phoneNumber;
      if (appliedFilters.licenseNumber)
        params.licenseNumber = appliedFilters.licenseNumber;
      if (appliedFilters.country) params.country = appliedFilters.country;
      if (appliedFilters.state) params.state = appliedFilters.state;
      if (appliedFilters.city) params.city = appliedFilters.city;
      if (appliedFilters.postalCode)
        params.postalCode = appliedFilters.postalCode;
      if (appliedFilters.status) params.status = appliedFilters.status;
      if (appliedFilters.gender) params.gender = appliedFilters.gender;
      if (appliedFilters.bloodGroup)
        params.bloodGroup = appliedFilters.bloodGroup;
      if (appliedFilters.avgRating) params.avgRating = appliedFilters.avgRating;
      if (appliedFilters.createdOnStart)
        params.createdOnStart = appliedFilters.createdOnStart;
      if (appliedFilters.createdOnEnd)
        params.createdOnEnd = appliedFilters.createdOnEnd;

      dispatch(fetchDrivers(params));
    },
    [dispatch, pagination.limit, appliedFilters]
  );

  const handleToggleFilters = useCallback(() => {
    setShowFilters(!showFilters);
  }, [showFilters]);

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <TMSHeader theme={theme} />
      <div className="px-4 py-1 lg:px-6 lg:py-1">
        <div className="max-w-7xl mx-auto space-y-0">
          <DriverTopActionBar
            onCreateNew={handleCreateNew}
            onBack={handleBack}
            totalCount={pagination.total || 0}
            showFilters={showFilters}
            onToggleFilters={handleToggleFilters}
          />

          <DriverFilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
            showFilters={showFilters}
          />

          <DriverListTable
            drivers={filteredDrivers}
            loading={isFetching}
            onDriverClick={handleDriverClick}
            currentPage={pagination.page}
            totalPages={pagination.pages}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
            onPageChange={handlePageChange}
            filteredCount={filteredDrivers.length}
            searchText={searchText}
            onSearchChange={handleSearchChange}
          />

          {error && (
            <div
              className="bg-[#FEE2E2] border border-[#EF4444] rounded-xl p-6 text-[#EF4444]"
              style={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)" }}
            >
              <p className="font-semibold text-sm">Error loading drivers:</p>
              <p className="text-sm mt-1">
                {error.message || "Something went wrong"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverMaintenance;
