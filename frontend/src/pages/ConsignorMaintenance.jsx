import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import TMSHeader from "../components/layout/TMSHeader";
import { getPageTheme } from "../theme.config";
import TopActionBar from "../components/consignor/TopActionBar";
import ConsignorFilterPanel from "../components/consignor/ConsignorFilterPanel";
import ConsignorListTable from "../components/consignor/ConsignorListTable";
import PaginationBar from "../components/consignor/PaginationBar";
import {
  fetchConsignors,
  setFilters as setReduxFilters,
  clearFilters,
  deleteConsignorDraft,
} from "../redux/slices/consignorSlice";
import { addToast } from "../redux/slices/uiSlice";
import { TOAST_TYPES } from "../utils/constants";

const ConsignorMaintenance = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = getPageTheme("list");

  // Redux state
  const { consignors, pagination, filters, isFetching, error, masterData } =
    useSelector((state) => state.consignor);

  // Local state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchText, setSearchText] = useState(""); // Fuzzy search state
  const [localFilters, setLocalFilters] = useState({
    customerId: "",
    customerName: "",
    industryType: "",
    status: "",
    createdOnStart: "",
    createdOnEnd: "",
    status: "",
  });
  const [appliedFilters, setAppliedFilters] = useState({
    customerId: "",
    customerName: "",
    industryType: "",
    status: "",
    createdOnStart: "",
    createdOnEnd: "",
    status: "",
  });

  // Fetch consignors on component mount
  useEffect(() => {
    dispatch(fetchConsignors({ page: 1, limit: 25 }));
  }, [dispatch]);

  // Fetch consignors when APPLIED filters or pagination change
  useEffect(() => {
    // Build filter object with mapped parameter names
    const filterParams = {};

    // Map frontend field names to backend parameter names
    if (appliedFilters.customerId) {
      filterParams.customer_id = appliedFilters.customerId;
    }
    if (appliedFilters.customerName) {
      filterParams.search = appliedFilters.customerName;
    }
    if (appliedFilters.industryType) {
      filterParams.industry_type = appliedFilters.industryType;
    }
    if (appliedFilters.status) {
      filterParams.status = appliedFilters.status;
    }
    if (appliedFilters.createdOnStart) {
      filterParams.createdOnStart = appliedFilters.createdOnStart;
    }
    if (appliedFilters.createdOnEnd) {
      filterParams.createdOnEnd = appliedFilters.createdOnEnd;
    }

    // Redux thunk expects { page, limit, filters }
    dispatch(
      fetchConsignors({
        page: pagination.page,
        limit: pagination.limit || 25,
        filters: filterParams,
      })
    );
  }, [dispatch, appliedFilters, pagination.page, pagination.limit]);

  // Handle filter changes (only updates local state, not applied)
  const handleFilterChange = useCallback((newFilters) => {
    setLocalFilters(newFilters);
  }, []);

  // Handle apply filters - this actually triggers the API call
  const handleApplyFilters = useCallback(() => {
    // Copy local filters to applied filters
    setAppliedFilters({ ...localFilters });
    // Also update Redux for consistency
    dispatch(setReduxFilters(localFilters));
  }, [localFilters, dispatch]);

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    const emptyFilters = {
      customerId: "",
      customerName: "",
      industryType: "",
      status: "",
      createdOnStart: "",
      createdOnEnd: "",
    };
    setLocalFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    dispatch(clearFilters());
  }, [dispatch]);

  // Handle page change
  const handlePageChange = useCallback(
    (page) => {
      // Build filter object with mapped parameter names
      const filterParams = {};
      if (appliedFilters.customerId)
        filterParams.customer_id = appliedFilters.customerId;
      if (appliedFilters.customerName)
        filterParams.search = appliedFilters.customerName;
      if (appliedFilters.industryType)
        filterParams.industry_type = appliedFilters.industryType;
      if (appliedFilters.status) filterParams.status = appliedFilters.status;
      if (appliedFilters.createdOnStart) {
        filterParams.createdOnStart = appliedFilters.createdOnStart;
      }
      if (appliedFilters.createdOnEnd) {
        filterParams.createdOnEnd = appliedFilters.createdOnEnd;
      }

      dispatch(
        fetchConsignors({
          page,
          limit: pagination.limit || 25,
          filters: filterParams,
        })
      );
    },
    [dispatch, appliedFilters, pagination.limit]
  );

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Build filter object with mapped parameter names
      const filterParams = {};
      if (appliedFilters.customerId)
        filterParams.customer_id = appliedFilters.customerId;
      if (appliedFilters.customerName)
        filterParams.search = appliedFilters.customerName;
      if (appliedFilters.industryType)
        filterParams.industry_type = appliedFilters.industryType;
      if (appliedFilters.status) filterParams.status = appliedFilters.status;
      if (appliedFilters.createdOnStart) {
        filterParams.createdOnStart = appliedFilters.createdOnStart;
      }
      if (appliedFilters.createdOnEnd) {
        filterParams.createdOnEnd = appliedFilters.createdOnEnd;
      }

      await dispatch(
        fetchConsignors({
          page: pagination.page,
          limit: pagination.limit || 25,
          filters: filterParams,
        })
      ).unwrap();
    } catch (error) {
      console.error("Error refreshing consignors:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [dispatch, appliedFilters, pagination.page, pagination.limit]);

  // Handle create new consignor - matches vehicle pattern exactly
  const handleCreateNew = useCallback(() => {
    navigate("/consignor/create");
  }, [navigate]);

  // Handle back to portal
  const handleBack = useCallback(() => {
    navigate("/tms-portal");
  }, [navigate]);

  // Handle toggle filters
  const handleToggleFilters = useCallback(() => {
    setShowFilters((prev) => !prev);
  }, []);

  // Handle delete draft
  const handleDeleteDraft = useCallback(
    async (customerId) => {
      if (
        window.confirm(
          "Are you sure you want to delete this draft? This action cannot be undone."
        )
      ) {
        try {
          await dispatch(deleteConsignorDraft(customerId)).unwrap();
          dispatch(
            addToast({
              type: TOAST_TYPES.SUCCESS,
              message: "Draft deleted successfully",
              duration: 3000,
            })
          );
          // Refresh the list
          const filterParams = {};
          if (appliedFilters.customerId)
            filterParams.customer_id = appliedFilters.customerId;
          if (appliedFilters.customerName)
            filterParams.search = appliedFilters.customerName;
          if (appliedFilters.industryType)
            filterParams.industry_type = appliedFilters.industryType;
          if (appliedFilters.status)
            filterParams.status = appliedFilters.status;
          if (appliedFilters.createdOnStart) {
            filterParams.createdOnStart = appliedFilters.createdOnStart;
          }
          if (appliedFilters.createdOnEnd) {
            filterParams.createdOnEnd = appliedFilters.createdOnEnd;
          }

          dispatch(
            fetchConsignors({
              page: pagination.page,
              limit: pagination.limit || 25,
              filters: filterParams,
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
    [dispatch, pagination.page, pagination.limit, appliedFilters]
  );

  // Handle fuzzy search - client-side filtering on visible table fields only
  const handleSearchChange = useCallback((value) => {
    setSearchText(value);
  }, []);

  // Apply fuzzy search to filter consignors based on visible table fields
  const filteredConsignors = React.useMemo(() => {
    if (!searchText.trim()) {
      return consignors; // Return all consignors if no search text
    }

    const searchLower = searchText.toLowerCase();

    return consignors.filter((consignor) => {
      // Search in visible table fields only:
      // 1. Customer ID
      // 2. Customer Name
      // 3. Industry Type
      // 4. Currency
      // 5. Payment Term
      // 6. Status

      const searchableFields = [
        consignor.customer_id,
        consignor.customer_name,
        consignor.industry_type,
        consignor.currency_type,
        consignor.payment_term,
        consignor.status,
      ];

      // Check if any field contains the search text
      return searchableFields.some((field) =>
        field?.toString().toLowerCase().includes(searchLower)
      );
    });
  }, [consignors, searchText]);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: theme.colors.primary.background,
      }}
    >
      {/* Header */}
      <TMSHeader />
      <div className="px-4 py-1 lg:px-6 lg:py-1">
        {/* Main Content */}
        <div className="max-w-7xl mx-auto space-y-0">
          {/* Top Action Bar */}
          <TopActionBar
            onCreateNew={handleCreateNew}
            totalCount={pagination.total}
            onBack={handleBack}
            showFilters={showFilters}
            onToggleFilters={handleToggleFilters}
          />

          {/* Filter Panel */}
          <ConsignorFilterPanel
            filters={localFilters}
            onFilterChange={handleFilterChange}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
            showFilters={showFilters}
          />

          {/* Error Message */}
          {error && (
            <div
              style={{
                marginTop: "20px",
                padding: "16px",
                backgroundColor: theme.colors.status.error + "20",
                borderRadius: "12px",
                border: `1px solid ${theme.colors.status.error}`,
              }}
            >
              <p
                style={{
                  fontSize: "14px",
                  color: theme.colors.status.error,
                  margin: 0,
                }}
              >
                <strong>Error:</strong> {error}
              </p>
            </div>
          )}

          {/* Consignor List Table */}
          <ConsignorListTable
            consignors={filteredConsignors}
            loading={isFetching}
            currentPage={pagination.page}
            totalPages={pagination.pages}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit || 25}
            onPageChange={handlePageChange}
            filteredCount={filteredConsignors.length}
            searchText={searchText}
            onSearchChange={handleSearchChange}
            onDeleteDraft={handleDeleteDraft}
          />

          {/* Pagination Bar */}
          {/* {!isFetching && consignors.length > 0 && (
          <div style={{ marginTop: "24px" }}>
            <PaginationBar
              currentPage={pagination.page}
              totalPages={pagination.pages}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit || 25}
              onPageChange={handlePageChange}
            />
          </div>
        )} */}

          {/* Summary Card */}
          {/* {!isFetching && consignors.length > 0 && (
          <div
            style={{
              marginTop: "24px",
              padding: "20px",
              backgroundColor: theme.colors.card.background,
              borderRadius: "12px",
              border: `1px solid ${theme.colors.card.border}`,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "13px",
                  color: theme.colors.text.secondary,
                  marginBottom: "4px",
                }}
              >
                Total Consignors
              </p>
              <p
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: theme.colors.text.primary,
                  margin: 0,
                }}
              >
                {pagination.total || 0}
              </p>
            </div>
            <div>
              <p
                style={{
                  fontSize: "13px",
                  color: theme.colors.text.secondary,
                  marginBottom: "4px",
                }}
              >
                Active Consignors
              </p>
              <p
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: theme.colors.status.success,
                  margin: 0,
                }}
              >
                {consignors.filter((c) => c.status === "ACTIVE").length}
              </p>
            </div>
            <div>
              <p
                style={{
                  fontSize: "13px",
                  color: theme.colors.text.secondary,
                  marginBottom: "4px",
                }}
              >
                Pending Approval
              </p>
              <p
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: theme.colors.status.warning,
                  margin: 0,
                }}
              >
                {consignors.filter((c) => c.status === "PENDING").length}
              </p>
            </div>
            <div>
              <p
                style={{
                  fontSize: "13px",
                  color: theme.colors.text.secondary,
                  marginBottom: "4px",
                }}
              >
                Inactive Consignors
              </p>
              <p
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: theme.colors.status.error,
                  margin: 0,
                }}
              >
                {consignors.filter((c) => c.status === "INACTIVE").length}
              </p>
            </div>
          </div>
        )} */}
        </div>
      </div>
    </div>
  );
};

export default ConsignorMaintenance;
