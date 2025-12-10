import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import TMSHeader from "../components/layout/TMSHeader";
import { getPageTheme } from "../theme.config";
import TopActionBar from "../components/transporter/TopActionBar";
import TransporterFilterPanel from "../components/transporter/TransporterFilterPanel";
import TransporterListTable from "../components/transporter/TransporterListTable";
import PaginationBar from "../components/transporter/PaginationBar";
import {
  fetchTransporters,
  fetchTransporterStatusCounts,
  deleteTransporterDraft,
  resetPaginationToFirstPage,
} from "../redux/slices/transporterSlice";
import { addToast, TOAST_TYPES } from "../redux/slices/uiSlice";

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
      ...(transporter.transportMode || []),
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
  const theme = getPageTheme("list");
  const [searchParams, setSearchParams] = useSearchParams();

  // Redux state
  const {
    transporters,
    pagination,
    isFetching,
    error,
    statusCounts,
    statusCountsLoading,
  } = useSelector((state) => state.transporter);

  // Local state
  const [searchText, setSearchText] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // ✅ Helper: Read filters from URL query parameters
  const getFiltersFromURL = useCallback(() => {
    return {
      transporterId: searchParams.get("transporterId") || "",
      tan: searchParams.get("tan") || "",
      tinPan: searchParams.get("tinPan") || "",
      vatGst: searchParams.get("vatGst") || "",
      status: searchParams.get("status") || "",
      createdOnStart: searchParams.get("createdOnStart") || "",
      createdOnEnd: searchParams.get("createdOnEnd") || "",
      activeFromDate: searchParams.get("activeFromDate") || "",
      activeToDate: searchParams.get("activeToDate") || "",
      transportMode: searchParams.get("transportMode")
        ? searchParams.get("transportMode").split(",")
        : [],
    };
  }, [searchParams]);

  // ✅ Initialize filters from URL on mount
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
      if (appliedFilters.createdOnStart) {
        params.createdOnStart = appliedFilters.createdOnStart;
      }
      if (appliedFilters.createdOnEnd) {
        params.createdOnEnd = appliedFilters.createdOnEnd;
      }
      if (appliedFilters.activeFromDate) {
        params.activeFromDate = appliedFilters.activeFromDate;
      }
      if (appliedFilters.activeToDate) {
        params.activeToDate = appliedFilters.activeToDate;
      }

      dispatch(fetchTransporters(params));
    };

    fetchData();
  }, [dispatch, appliedFilters, pagination.page]);

  // Fetch status counts on mount and when data changes
  useEffect(() => {
    dispatch(fetchTransporterStatusCounts());
  }, [dispatch, transporters]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const handleApplyFilters = useCallback(() => {
    // Apply filters by copying current filter state to appliedFilters
    setAppliedFilters({ ...filters });

    // ✅ Sync filters to URL query parameters
    const params = new URLSearchParams();
    if (filters.transporterId)
      params.set("transporterId", filters.transporterId);
    if (filters.tan) params.set("tan", filters.tan);
    if (filters.tinPan) params.set("tinPan", filters.tinPan);
    if (filters.vatGst) params.set("vatGst", filters.vatGst);
    if (filters.status) params.set("status", filters.status);
    if (filters.createdOnStart)
      params.set("createdOnStart", filters.createdOnStart);
    if (filters.createdOnEnd) params.set("createdOnEnd", filters.createdOnEnd);
    if (filters.transportMode.length > 0) {
      params.set("transportMode", filters.transportMode.join(","));
    }
    if (filters.activeFromDate) {
      params.set("activeFromDate", filters.activeFromDate);
    }
    if (filters.activeToDate) {
      params.set("activeToDate", filters.activeToDate);
    }

    setSearchParams(params);

    // Reset pagination to page 1 when applying new filters
    dispatch(resetPaginationToFirstPage());
  }, [filters, dispatch, setSearchParams]);

  const handleClearFilters = useCallback(() => {
    // Clear both filter input state and applied filters
    const emptyFilters = {
      transporterId: "",
      tan: "",
      tinPan: "",
      vatGst: "",
      status: "",
      createdOnStart: "",
      createdOnEnd: "",
      transportMode: [],
      activeFromDate: "",
      activeToDate: "",
    };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);

    // ✅ Clear URL query parameters
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
  const filteredTransporters = useMemo(() => {
    return fuzzySearch(searchText, transporters);
  }, [searchText, transporters]);

  const handleTransporterClick = useCallback(
    (transporterId) => {
      navigate(`/transporter/${transporterId}`);
    },
    [navigate]
  );

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

  const handlePageChange = useCallback(
    (page) => {
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
      if (appliedFilters.createdOnStart) {
        params.createdOnStart = appliedFilters.createdOnStart;
      }
      if (appliedFilters.createdOnEnd) {
        params.createdOnEnd = appliedFilters.createdOnEnd;
      }

      dispatch(fetchTransporters(params));
    },
    [dispatch, pagination.limit, appliedFilters]
  );

  const handleDeleteDraft = useCallback(
    async (transporterId) => {
      if (
        window.confirm(
          "Are you sure you want to delete this draft? This action cannot be undone."
        )
      ) {
        try {
          await dispatch(deleteTransporterDraft(transporterId)).unwrap();
          dispatch(
            addToast({
              type: TOAST_TYPES.SUCCESS,
              message: "Draft deleted successfully",
              duration: 3000,
            })
          );
          // Refresh the list
          dispatch(
            fetchTransporters({
              page: pagination.page,
              limit: pagination.limit || 25,
            })
          );
        } catch (error) {
          dispatch(
            addToast({
              type: TOAST_TYPES.ERROR,
              message: "Failed to delete draft",
              details: [error.message || "An error occurred"],
              duration: 5000,
            })
          );
        }
      }
    },
    [dispatch, pagination.page, pagination.limit]
  );

  const handleToggleFilters = useCallback(() => {
    setShowFilters(!showFilters);
  }, [showFilters]);

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <TMSHeader theme={theme} />
      <div className="px-4 py-1 lg:px-6 lg:py-1">
        <div className="max-w-7xl mx-auto space-y-0">
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
            onDeleteDraft={handleDeleteDraft}
            currentPage={pagination.page}
            totalPages={pagination.pages}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
            onPageChange={handlePageChange}
            filteredCount={filteredTransporters.length}
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
              <p className="font-semibold text-sm">
                Error loading transporters:
              </p>
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

export default TransporterMaintenance;
