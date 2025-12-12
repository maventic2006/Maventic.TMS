import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import TMSHeader from "../components/layout/TMSHeader";
import { getPageTheme } from "../theme.config";
import {
  fetchDrivers,
  fetchDriverStatusCounts,
  resetPaginationToFirstPage,
} from "../redux/slices/driverSlice";
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
  const [searchParams, setSearchParams] = useSearchParams();

  // Helper: Read filters from URL query parameters
  const getFiltersFromURL = useCallback(() => {
    return {
      driverId: searchParams.get("driverId") || "",
      fullName: searchParams.get("fullName") || "",
      phoneNumber: searchParams.get("phoneNumber") || "",
      licenseNumber: searchParams.get("licenseNumber") || "",
      country: searchParams.get("country") || "",
      state: searchParams.get("state") || "",
      city: searchParams.get("city") || "",
      postalCode: searchParams.get("postalCode") || "",
      status: searchParams.get("status") || "",
      gender: searchParams.get("gender") || "",
      bloodGroup: searchParams.get("bloodGroup") || "",
      avgRating: searchParams.get("avgRating") || "",
      createdOnStart: searchParams.get("createdOnStart") || "",
      createdOnEnd: searchParams.get("createdOnEnd") || "",
      licenseValidityDate: searchParams.get("licenseValidityDate") || "",
      transporterId: searchParams.get("transporterId") || "",
    };
  }, [searchParams]);

  // Redux state
  const {
    drivers,
    pagination,
    isFetching,
    error,
    statusCounts,
    statusCountsLoading,
  } = useSelector((state) => state.driver);

  // Local state
  const [searchText, setSearchText] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Filter state - initialize from URL on mount
  const [filters, setFilters] = useState(() => getFiltersFromURL());

  const [appliedFilters, setAppliedFilters] = useState(() =>
    getFiltersFromURL()
  );

  // ✅ Sync URL params back to filter state when searchParams change (e.g., browser back button)
  useEffect(() => {
    const urlFilters = getFiltersFromURL();
    setFilters(urlFilters);
    setAppliedFilters(urlFilters);
  }, [searchParams]); // Changed from getFiltersFromURL to searchParams to prevent infinite loop

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
      if (appliedFilters.licenseValidityDate)
        params.licenseValidityDate = appliedFilters.licenseValidityDate;
      if (appliedFilters.transporterId)
        params.transporterId = appliedFilters.transporterId;

      dispatch(fetchDrivers(params));
    };

    fetchData();
  }, [dispatch, appliedFilters, pagination.page]);

  // Fetch status counts on mount and when data changes
  useEffect(() => {
    dispatch(fetchDriverStatusCounts());
  }, [dispatch, drivers]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const handleApplyFilters = useCallback(() => {
    dispatch(resetPaginationToFirstPage());
    setAppliedFilters({ ...filters });

    // Sync filters to URL query parameters
    const params = new URLSearchParams();
    if (filters.driverId) params.set("driverId", filters.driverId);
    if (filters.fullName) params.set("fullName", filters.fullName);
    if (filters.phoneNumber) params.set("phoneNumber", filters.phoneNumber);
    if (filters.licenseNumber)
      params.set("licenseNumber", filters.licenseNumber);
    if (filters.country) params.set("country", filters.country);
    if (filters.state) params.set("state", filters.state);
    if (filters.city) params.set("city", filters.city);
    if (filters.postalCode) params.set("postalCode", filters.postalCode);
    if (filters.status) params.set("status", filters.status);
    if (filters.gender) params.set("gender", filters.gender);
    if (filters.bloodGroup) params.set("bloodGroup", filters.bloodGroup);
    if (filters.avgRating) params.set("avgRating", filters.avgRating);
    if (filters.createdOnStart)
      params.set("createdOnStart", filters.createdOnStart);
    if (filters.createdOnEnd) params.set("createdOnEnd", filters.createdOnEnd);
    if (filters.licenseValidityDate)
      params.set("licenseValidityDate", filters.licenseValidityDate);
    if (filters.transporterId)
      params.set("transporterId", filters.transporterId);

    setSearchParams(params);
  }, [filters, dispatch, setSearchParams]);

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
      licenseValidityDate: "",
      transporterId: "",
    };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);

    // Clear URL query parameters
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  const handleSearchChange = useCallback((text) => {
    setSearchText(text);
  }, []);

  // Handle status badge click - toggle filter
  const handleStatusClick = useCallback(
    (status) => {
      if (appliedFilters.status === status) {
        // Clear the status filter if same badge clicked
        const newFilters = { ...filters, status: "" };
        const newAppliedFilters = { ...appliedFilters, status: "" };

        setFilters(newFilters);
        setAppliedFilters(newAppliedFilters);

        // Update URL - remove status param
        const params = new URLSearchParams(searchParams);
        params.delete("status");
        setSearchParams(params);
      } else {
        // Apply new status filter
        const newFilters = { ...filters, status };
        const newAppliedFilters = { ...appliedFilters, status };

        setFilters(newFilters);
        setAppliedFilters(newAppliedFilters);

        // Update URL - set status param
        const params = new URLSearchParams(searchParams);
        params.set("status", status);
        setSearchParams(params);
      }
    },
    [filters, appliedFilters, searchParams, setSearchParams]
  );

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
      if (appliedFilters.licenseValidityDate)
        params.licenseValidityDate = appliedFilters.licenseValidityDate;

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
            statusCounts={statusCounts}
            statusCountsLoading={statusCountsLoading}
            selectedStatus={appliedFilters.status}
            onStatusClick={handleStatusClick}
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
