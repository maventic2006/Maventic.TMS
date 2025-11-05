import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import TMSHeader from "../components/layout/TMSHeader";
import TopActionBar from "../components/vehicle/TopActionBar";
import VehicleFilterPanel from "../components/vehicle/VehicleFilterPanel";
import VehicleListTable from "../components/vehicle/VehicleListTable";
import { fetchVehicles } from "../redux/slices/vehicleSlice";
import { getPageTheme } from "../theme.config";

// Fuzzy search utility
const fuzzySearch = (searchText, vehicles) => {
  if (!searchText || searchText.trim() === "") {
    return vehicles;
  }

  const searchLower = searchText.toLowerCase().trim();

  return vehicles.filter((vehicle) => {
    const searchableFields = [
      vehicle.vehicleId,
      vehicle.registrationNumber,
      vehicle.vehicleType,
      vehicle.make,
      vehicle.model,
      vehicle.year?.toString(),
      vehicle.status,
      vehicle.ownership,
      vehicle.transporterId,
      vehicle.transporterName,
      vehicle.ownerName,
      vehicle.currentDriver,
      vehicle.engineNumber,
      vehicle.chassisNumber,
    ];

    return searchableFields.some((field) => {
      if (field === null || field === undefined) return false;
      return String(field).toLowerCase().includes(searchLower);
    });
  });
};

const VehicleMaintenance = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const { vehicles, pagination, isFetching, error } = useSelector((state) => state.vehicle);

  // Local state
  const [searchText, setSearchText] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    registrationNumber: "",
    vehicleType: "",
    make: "",
    model: "",
    yearFrom: "",
    yearTo: "",
    status: "",
    registrationState: "",
    fuelType: "",
    leasingFlag: "",
    towingCapacityMin: "",
    towingCapacityMax: "",
  });

  const [appliedFilters, setAppliedFilters] = useState({
    registrationNumber: "",
    vehicleType: "",
    make: "",
    model: "",
    yearFrom: "",
    yearTo: "",
    status: "",
    registrationState: "",
    fuelType: "",
    leasingFlag: "",
    towingCapacityMin: "",
    towingCapacityMax: "",
  });

  // Initial load
  useEffect(() => {
    dispatch(fetchVehicles({ page: 1, limit: 25 }));
  }, [dispatch]);

  // Fetch when appliedFilters or page changes
  useEffect(() => {
    const fetchData = () => {
      const params = {
        page: pagination.page || 1,
        limit: 25,
      };

      if (appliedFilters.registrationNumber) {
        params.registrationNumber = appliedFilters.registrationNumber;
      }
      if (appliedFilters.vehicleType) {
        params.vehicleType = appliedFilters.vehicleType;
      }
      if (appliedFilters.make) {
        params.make = appliedFilters.make;
      }
      if (appliedFilters.model) {
        params.model = appliedFilters.model;
      }
      if (appliedFilters.yearFrom) {
        params.yearFrom = appliedFilters.yearFrom;
      }
      if (appliedFilters.yearTo) {
        params.yearTo = appliedFilters.yearTo;
      }
      if (appliedFilters.status) {
        params.status = appliedFilters.status;
      }
      if (appliedFilters.registrationState) {
        params.registrationState = appliedFilters.registrationState;
      }
      if (appliedFilters.fuelType) {
        params.fuelType = appliedFilters.fuelType;
      }
      if (appliedFilters.leasingFlag) {
        params.leasingFlag = appliedFilters.leasingFlag;
      }
      if (appliedFilters.towingCapacityMin) {
        params.towingCapacityMin = appliedFilters.towingCapacityMin;
      }
      if (appliedFilters.towingCapacityMax) {
        params.towingCapacityMax = appliedFilters.towingCapacityMax;
      }

      dispatch(fetchVehicles(params));
    };

    fetchData();
  }, [dispatch, appliedFilters, pagination.page]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleApplyFilters = useCallback(() => {
    setAppliedFilters({ ...filters });
    // Reset to page 1 when filters change
    dispatch(fetchVehicles({ ...filters, page: 1, limit: 25 }));
  }, [filters, dispatch]);

  const handleClearFilters = useCallback(() => {
    const emptyFilters = {
      registrationNumber: "",
      vehicleType: "",
      make: "",
      model: "",
      yearFrom: "",
      yearTo: "",
      status: "",
      registrationState: "",
      fuelType: "",
      leasingFlag: "",
      towingCapacityMin: "",
      towingCapacityMax: "",
    };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    // Reset to page 1 when clearing filters
    dispatch(fetchVehicles({ page: 1, limit: 25 }));
  }, [dispatch]);

  const handleSearchChange = useCallback((text) => {
    setSearchText(text);
  }, []);

  const handlePageChange = useCallback((page) => {
    const params = {
      page,
      limit: 25,
      ...appliedFilters,
    };
    dispatch(fetchVehicles(params));
  }, [dispatch, appliedFilters]);

  const filteredVehicles = useMemo(() => {
    return fuzzySearch(searchText, vehicles);
  }, [searchText, vehicles]);

  const handleVehicleClick = useCallback(
    (vehicleId) => {
      navigate(`/vehicle/${vehicleId}`);
    },
    [navigate]
  );

  const handleCreateNew = useCallback(() => {
    navigate("/vehicle/create");
  }, [navigate]);

  const handleBack = useCallback(() => {
    navigate("/tms-portal");
  }, [navigate]);

  const handleToggleFilters = useCallback(() => {
    setShowFilters(!showFilters);
  }, [showFilters]);

  const theme = getPageTheme("list");

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <TMSHeader theme={theme} />
      
      <div className="max-w-7xl mx-auto px-2 lg:px-6 space-y-4">
        <TopActionBar
          onCreateNew={handleCreateNew}
          onBack={handleBack}
          totalCount={pagination.total || 0}
          showFilters={showFilters}
          onToggleFilters={handleToggleFilters}
        />

        <VehicleFilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
          showFilters={showFilters}
        />

        <VehicleListTable
          vehicles={filteredVehicles}
          loading={isFetching}
          onVehicleClick={handleVehicleClick}
          filteredCount={filteredVehicles.length}
          searchText={searchText}
          onSearchChange={handleSearchChange}
          pagination={pagination}
          onPageChange={handlePageChange}
        />

        {error && (
          <div
            className="bg-[#FEE2E2] border border-[#EF4444] rounded-xl p-6 text-[#EF4444]"
            style={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)" }}
          >
            <p className="font-semibold text-sm">Error loading vehicles:</p>
            <p className="text-sm mt-1">{error.message || "Something went wrong"}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleMaintenance;
