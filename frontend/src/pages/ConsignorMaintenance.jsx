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
} from "../redux/slices/consignorSlice";

const ConsignorMaintenance = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = getPageTheme("list");

  // Redux state
  const { consignors, pagination, filters, isFetching, error, masterData } = useSelector(
    (state) => state.consignor
  );

  // Local state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch consignors on component mount
  useEffect(() => {
    dispatch(fetchConsignors({ page: 1, limit: 25 }));
  }, [dispatch]);

  // Fetch consignors when filters or pagination change
  useEffect(() => {
    const params = {
      page: pagination.page,
      limit: pagination.limit || 25,
    };

    // Add filter parameters
    if (filters.customerId) {
      params.customerId = filters.customerId;
    }
    if (filters.customerName) {
      params.customerName = filters.customerName;
    }
    if (filters.industryType) {
      params.industryType = filters.industryType;
    }
    if (filters.status) {
      params.status = filters.status;
    }

    dispatch(fetchConsignors(params));
  }, [dispatch, filters, pagination.page, pagination.limit]);

  // Handle filter changes
  const handleFilterChange = useCallback(
    (newFilters) => {
      dispatch(setReduxFilters(newFilters));
    },
    [dispatch]
  );

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  // Handle page change
  const handlePageChange = useCallback(
    (page) => {
      dispatch(fetchConsignors({ ...filters, page, limit: pagination.limit || 25 }));
    },
    [dispatch, filters, pagination.limit]
  );

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await dispatch(
        fetchConsignors({
          ...filters,
          page: pagination.page,
          limit: pagination.limit || 25,
        })
      ).unwrap();
    } catch (error) {
      console.error("Error refreshing consignors:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [dispatch, filters, pagination.page, pagination.limit]);

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

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: theme.colors.primary.background,
      }}
    >
      {/* Header */}
      <TMSHeader />

      {/* Main Content */}
      <div
        style={{
          maxWidth: "1600px",
          margin: "0 auto",
          padding: "24px",
        }}
      >
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
          filters={filters}
          onFilterChange={handleFilterChange}
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
          consignors={consignors}
          loading={isFetching}
          currentPage={pagination.page}
          totalPages={pagination.pages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit || 25}
          onPageChange={handlePageChange}
          filteredCount={consignors.length}
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
  );
};

export default ConsignorMaintenance;
