import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchWarehouses,
  setFilters,
  clearFilters,
  setFilteredWarehouses,
} from "../redux/slices/warehouseSlice";
import TopActionBar from "../components/warehouse/TopActionBar";
import WarehouseFilterPanel from "../components/warehouse/WarehouseFilterPanel";
import WarehouseListTable from "../components/warehouse/WarehouseListTable";
import PaginationBar from "../components/warehouse/PaginationBar";

const WarehouseMaintenance = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const {
    warehouses,
    filteredWarehouses,
    loading,
    error,
    pagination,
    filters,
  } = useSelector((state) => state.warehouse);

  // Local state
  const [showFilters, setShowFilters] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [appliedFilters, setAppliedFilters] = useState(filters);

  // Fetch warehouses on mount
  useEffect(() => {
    dispatch(fetchWarehouses({ page: 1, limit: 25 }));
  }, [dispatch]);

  // Fuzzy search function - client-side instant filtering
  const performFuzzySearch = useMemo(() => {
    if (!searchText.trim()) {
      return warehouses;
    }

    const searchLower = searchText.toLowerCase();
    return warehouses.filter((warehouse) => {
      const searchableFields = [
        warehouse.warehouse_id,
        warehouse.warehouse_name_1,
        warehouse.warehouse_type_name,
        warehouse.city,
        warehouse.state,
        warehouse.country,
        warehouse.created_by,
        warehouse.status,
      ];

      return searchableFields.some((field) =>
        field?.toString().toLowerCase().includes(searchLower)
      );
    });
  }, [warehouses, searchText]);

  // Apply filters function
  const applyFilters = () => {
    let filtered = [...warehouses];

    // Apply warehouse ID filter
    if (appliedFilters.warehouseId) {
      filtered = filtered.filter((w) =>
        w.warehouse_id
          ?.toLowerCase()
          .includes(appliedFilters.warehouseId.toLowerCase())
      );
    }

    // Apply warehouse name filter
    if (appliedFilters.warehouseName) {
      filtered = filtered.filter((w) =>
        w.warehouse_name_1
          ?.toLowerCase()
          .includes(appliedFilters.warehouseName.toLowerCase())
      );
    }

    // Apply status filter
    if (appliedFilters.status) {
      filtered = filtered.filter(
        (w) => w.status?.toUpperCase() === appliedFilters.status.toUpperCase()
      );
    }

    // Apply weighBridge filter
    if (appliedFilters.weighBridge !== null) {
      filtered = filtered.filter(
        (w) => w.weigh_bridge === appliedFilters.weighBridge
      );
    }

    // Apply virtualYardIn filter
    if (appliedFilters.virtualYardIn !== null) {
      filtered = filtered.filter(
        (w) => w.virtual_yard_in === appliedFilters.virtualYardIn
      );
    }

    // Apply geoFencing filter
    if (appliedFilters.geoFencing !== null) {
      filtered = filtered.filter(
        (w) => w.geo_fencing === appliedFilters.geoFencing
      );
    }

    dispatch(setFilteredWarehouses(filtered));
  };

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setAppliedFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle apply filters button
  const handleApplyFilters = () => {
    dispatch(setFilters(appliedFilters));
    applyFilters();
  };

  // Handle clear filters
  const handleClearFilters = () => {
    const clearedFilters = {
      warehouseId: "",
      warehouseName: "",
      weighBridge: null,
      virtualYardIn: null,
      geoFencing: null,
      status: "",
    };
    setAppliedFilters(clearedFilters);
    dispatch(clearFilters());
    dispatch(setFilteredWarehouses(warehouses));
  };

  // Handle search change - instant client-side filtering
  const handleSearchChange = (value) => {
    setSearchText(value);
  };

  // Get final filtered warehouses (search + filters)
  const finalFilteredWarehouses = useMemo(() => {
    const searchFiltered = performFuzzySearch;
    return searchFiltered;
  }, [performFuzzySearch]);

  // Pagination calculations
  const currentPage = pagination.page;
  const itemsPerPage = pagination.limit;
  const totalItems = finalFilteredWarehouses.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get current page items
  const currentPageWarehouses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return finalFilteredWarehouses.slice(startIndex, endIndex);
  }, [finalFilteredWarehouses, currentPage, itemsPerPage]);

  // Handle page change
  const handlePageChange = (page) => {
    dispatch(fetchWarehouses({ page, limit: itemsPerPage }));
  };

  // Handle warehouse click
  const handleWarehouseClick = (warehouseId) => {
    navigate(`/warehouse/${warehouseId}`);
  };

  // Handle create new warehouse
  const handleCreateNew = () => {
    navigate("/warehouse/create");
  };

  // Handle back button
  const handleBack = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-[1800px] mx-auto">
        {/* Top Action Bar */}
        <TopActionBar
          onCreateNew={handleCreateNew}
          totalCount={finalFilteredWarehouses.length}
          onBack={handleBack}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          searchText={searchText}
          onSearchChange={handleSearchChange}
        />

        {/* Filter Panel */}
        <WarehouseFilterPanel
          filters={appliedFilters}
          onFilterChange={handleFilterChange}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
          showFilters={showFilters}
        />

        {/* Warehouse List Table */}
        <WarehouseListTable
          warehouses={currentPageWarehouses}
          loading={loading}
          onWarehouseClick={handleWarehouseClick}
          filteredCount={finalFilteredWarehouses.length}
          searchText={searchText}
          onSearchChange={handleSearchChange}
        />

        {/* Pagination */}
        {!loading && finalFilteredWarehouses.length > 0 && (
          <PaginationBar
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default WarehouseMaintenance;
