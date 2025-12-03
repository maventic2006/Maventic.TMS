import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import TMSHeader from "../components/layout/TMSHeader";
import { getPageTheme } from "../theme.config";
import {
  fetchWarehouses,
  deleteWarehouseDraft,
  resetPaginationToFirstPage,
} from "../redux/slices/warehouseSlice"; // ✅ Add deleteWarehouseDraft
import { addToast } from "../redux/slices/uiSlice"; // ✅ Add toast for feedback
import { TOAST_TYPES } from "../utils/constants"; // ✅ Add toast constants
import TopActionBar from "../components/warehouse/TopActionBar";
import WarehouseFilterPanel from "../components/warehouse/WarehouseFilterPanel";
import WarehouseListTable from "../components/warehouse/WarehouseListTable";
import PaginationBar from "../components/warehouse/PaginationBar";

// Fuzzy search utility function
const fuzzySearch = (searchText, warehouses) => {
  if (!searchText || searchText.trim() === "") {
    return warehouses;
  }

  const searchLower = searchText.toLowerCase().trim();

  return warehouses.filter((warehouse) => {
    // Search across multiple fields
    const searchableFields = [
      warehouse.warehouse_id,
      warehouse.warehouse_name1,
      warehouse.warehouse_name2,
      warehouse.warehouse_type,
      warehouse.region,
      warehouse.zone,
      warehouse.created_by,
      warehouse.status,
    ];

    // Check if any field contains the search text (case-insensitive partial match)
    return searchableFields.some((field) => {
      if (field === null || field === undefined) return false;
      return String(field).toLowerCase().includes(searchLower);
    });
  });
};

// Main Warehouse Maintenance Component
const WarehouseMaintenance = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = getPageTheme("list");

  // Redux state
  const { warehouses, pagination, loading, error } = useSelector(
    (state) => state.warehouse
  );

  // Local state
  const [searchText, setSearchText] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Separate state for filter inputs and applied filters
  const [filters, setFilters] = useState({
    warehouseId: "",
    warehouseName: "",
    status: "",
    createdOnStart: "",
    createdOnEnd: "",
    weighBridge: null,
    virtualYardIn: null,
    fuelAvailability: null,
    geoFencing: null,
  });

  const [appliedFilters, setAppliedFilters] = useState({
    warehouseId: "",
    warehouseName: "",
    status: "",
    createdOnStart: "",
    createdOnEnd: "",
    weighBridge: null,
    virtualYardIn: null,
    fuelAvailability: null,
    geoFencing: null,
  });

  // Single useEffect for data fetching - prevents infinite loops
  useEffect(() => {
    // Prevent multiple simultaneous calls
    if (loading) return;
    
    const fetchData = () => {
      const params = {
        page: pagination.page || 1,
        limit: pagination.limit || 25,
      };

      // Only add applied filter parameters (not the typing state)
      if (appliedFilters.warehouseId) {
        params.warehouseId = appliedFilters.warehouseId;
      }
      if (appliedFilters.warehouseName) {
        params.warehouseName = appliedFilters.warehouseName;
      }
      if (appliedFilters.status) {
        params.status = appliedFilters.status;
      }
      if (appliedFilters.weighBridge !== null) {
        params.weighBridge = appliedFilters.weighBridge;
      }
      if (appliedFilters.virtualYardIn !== null) {
        params.virtualYardIn = appliedFilters.virtualYardIn;
      }
      if (appliedFilters.geoFencing !== null) {
        params.geoFencing = appliedFilters.geoFencing;
      }
      if (appliedFilters.fuelAvailability !== null) {
        params.fuelAvailability = appliedFilters.fuelAvailability;
      }
      if (appliedFilters.createdOnStart) {
        params.createdOnStart = appliedFilters.createdOnStart;
      }
      if (appliedFilters.createdOnEnd) {
        params.createdOnEnd = appliedFilters.createdOnEnd;
      }

      dispatch(fetchWarehouses(params));
    };

    fetchData();
  }, [dispatch, appliedFilters, pagination.page, pagination.limit]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const handleApplyFilters = useCallback(() => {
    // Apply filters by copying current filter state to appliedFilters
    // This will trigger the useEffect to fetch data with new filters
    // Also reset to page 1 when applying filters
    dispatch(resetPaginationToFirstPage());
    setAppliedFilters({ ...filters });
  }, [filters, dispatch]);

  const handleClearFilters = useCallback(() => {
    // Clear both filter input state and applied filters
    const emptyFilters = {
      warehouseId: "",
      warehouseName: "",
      status: "",
      createdOnStart: "",
      createdOnEnd: "",
      weighBridge: null,
      virtualYardIn: null,
      fuelAvailability: null,
      geoFencing: null,
    };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
  }, []);

  const handleSearchChange = useCallback((text) => {
    setSearchText(text);
  }, []);

  // Apply client-side fuzzy search filtering on backend results
  const filteredWarehouses = useMemo(() => {
    return fuzzySearch(searchText, warehouses);
  }, [searchText, warehouses]);

  const handleWarehouseClick = useCallback(
    (warehouseId) => {
      navigate(`/warehouse/${warehouseId}`);
    },
    [navigate]
  );

  const handleCreateNew = useCallback(() => {
    navigate("/warehouse/create");
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

      if (appliedFilters.warehouseId) {
        params.warehouseId = appliedFilters.warehouseId;
      }
      if (appliedFilters.warehouseName) {
        params.warehouseName = appliedFilters.warehouseName;
      }
      if (appliedFilters.status) {
        params.status = appliedFilters.status;
      }
      if (appliedFilters.weighBridge !== null) {
        params.weighBridge = appliedFilters.weighBridge;
      }
      if (appliedFilters.virtualYardIn !== null) {
        params.virtualYardIn = appliedFilters.virtualYardIn;
      }
      if (appliedFilters.fuelAvailability !== null) {
        params.fuelAvailability = appliedFilters.fuelAvailability;
      }
      if (appliedFilters.geoFencing !== null) {
        params.geoFencing = appliedFilters.geoFencing;
      }
      if (appliedFilters.createdOnStart) {
        params.createdOnStart = appliedFilters.createdOnStart;
      }
      if (appliedFilters.createdOnEnd) {
        params.createdOnEnd = appliedFilters.createdOnEnd;
      }

      dispatch(fetchWarehouses(params));
    },
    [dispatch, pagination.limit, appliedFilters]
  );

  const handleToggleFilters = useCallback(() => {
    setShowFilters(!showFilters);
  }, [showFilters]);

  // ✅ Delete draft handler (matching transporter pattern)
  const handleDeleteDraft = useCallback(
    async (warehouseId) => {
      if (
        window.confirm(
          "Are you sure you want to delete this draft? This action cannot be undone."
        )
      ) {
        try {
          await dispatch(deleteWarehouseDraft(warehouseId)).unwrap();

          dispatch(
            addToast({
              type: TOAST_TYPES.SUCCESS,
              message: "Draft deleted successfully",
              duration: 3000,
            })
          );

          // Rebuild filter params and refresh list
          const filterParams = {
            page: pagination.page,
            limit: pagination.limit,
          };

          if (appliedFilters.warehouseId) {
            filterParams.warehouseId = appliedFilters.warehouseId;
          }
          if (appliedFilters.warehouseName) {
            filterParams.warehouseName = appliedFilters.warehouseName;
          }
          if (appliedFilters.status) {
            filterParams.status = appliedFilters.status;
          }
          if (appliedFilters.weighBridge !== null) {
            filterParams.weighBridge = appliedFilters.weighBridge;
          }
          if (appliedFilters.virtualYardIn !== null) {
            filterParams.virtualYardIn = appliedFilters.virtualYardIn;
          }
          if (appliedFilters.fuelAvailability !== null) {
            filterParams.fuelAvailability = appliedFilters.fuelAvailability;
          }
          if (appliedFilters.geoFencing !== null) {
            filterParams.geoFencing = appliedFilters.geoFencing;
          }
          if (appliedFilters.createdOnStart) {
            filterParams.createdOnStart = appliedFilters.createdOnStart;
          }
          if (appliedFilters.createdOnEnd) {
            filterParams.createdOnEnd = appliedFilters.createdOnEnd;
          }

          dispatch(fetchWarehouses(filterParams));
        } catch (error) {
          dispatch(
            addToast({
              type: TOAST_TYPES.ERROR,
              message: error?.message || "Failed to delete draft",
              duration: 5000,
            })
          );
        }
      }
    },
    [dispatch, pagination.page, pagination.limit, appliedFilters]
  );

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <TMSHeader theme={theme} />
      <div className="px-4 py-1 lg:px-6 lg:py-1">
        <div className="max-w-7xl mx-auto space-y-0">
          <TopActionBar
            onCreateNew={handleCreateNew}
            totalCount={pagination.total || 0}
            onBack={handleBack}
            showFilters={showFilters}
            onToggleFilters={handleToggleFilters}
            searchText={searchText}
            onSearchChange={handleSearchChange}
          />

          <WarehouseFilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
            showFilters={showFilters}
          />

          <WarehouseListTable
            warehouses={filteredWarehouses}
            loading={loading}
            onWarehouseClick={handleWarehouseClick}
            onDeleteDraft={handleDeleteDraft} // ✅ Add delete draft handler
            currentPage={pagination.page || 1}
            totalPages={pagination.totalPages || 1}
            totalItems={pagination.total || 0}
            itemsPerPage={pagination.limit || 25}
            onPageChange={handlePageChange}
            filteredCount={filteredWarehouses.length}
            searchText={searchText}
            onSearchChange={handleSearchChange}
          />

          {error && (
            <div
              className="bg-[#FEE2E2] border border-[#EF4444] rounded-xl p-6 text-[#EF4444]"
              style={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)" }}
            >
              <p className="font-semibold text-sm">Error loading warehouses:</p>
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

export default WarehouseMaintenance;
