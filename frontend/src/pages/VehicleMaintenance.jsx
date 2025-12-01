import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import TMSHeader from "../components/layout/TMSHeader";
import TopActionBar from "../components/vehicle/TopActionBar";
import VehicleFilterPanel from "../components/vehicle/VehicleFilterPanel";
import VehicleListTable from "../components/vehicle/VehicleListTable";
import VehicleBulkUploadModal from "../features/vehicle/components/VehicleBulkUploadModal";
import VehicleBulkUploadHistory from "../features/vehicle/components/VehicleBulkUploadHistory";
import {
  fetchVehicles,
  deleteVehicleDraft,
} from "../redux/slices/vehicleSlice";
import { openVehicleBulkUploadModal } from "../redux/slices/vehicleBulkUploadSlice";
import { addToast, TOAST_TYPES } from "../redux/slices/uiSlice";
import { getPageTheme } from "../theme.config";

// Enhanced fuzzy search utility with better field handling
const fuzzySearch = (searchText, vehicles) => {
  if (!searchText || searchText.trim() === "") {
    return vehicles || [];
  }

  if (!vehicles || !Array.isArray(vehicles)) {
    return [];
  }

  const searchLower = searchText.toLowerCase().trim();

  return vehicles.filter((vehicle) => {
    if (!vehicle || typeof vehicle !== "object") {
      return false;
    }

    // Define searchable fields based on actual transformed data structure
    const searchableFields = [
      vehicle.vehicleId,
      vehicle.registrationNumber,
      vehicle.vehicleType,
      vehicle.make,
      vehicle.model,
      vehicle.year?.toString(),
      vehicle.fuelType,
      vehicle.transmission,
      vehicle.status,
      vehicle.ownership,
      vehicle.ownerName,
      vehicle.vehicleCondition,
      vehicle.engineNumber,
      vehicle.chassisNumber, // Maps to vin from backend
      vehicle.gpsDeviceId, // Maps to gpsIMEI from backend
    ];

    return searchableFields.some((field) => {
      if (field === null || field === undefined || field === "N/A") {
        return false;
      }
      try {
        return String(field).toLowerCase().includes(searchLower);
      } catch (error) {
        console.warn("Fuzzy search field conversion error:", field, error);
        return false;
      }
    });
  });
};

const VehicleMaintenance = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const { vehicles, pagination, isFetching, error } = useSelector(
    (state) => state.vehicle
  );

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
    gpsEnabled: "",
    ownership: "",
    vehicleCondition: "",
    engineType: "",
    emissionStandard: "",
    bodyType: "",
    towingCapacityMin: "",
    towingCapacityMax: "",
    createdOnStart: "",
    createdOnEnd: "",
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
    gpsEnabled: "",
    ownership: "",
    vehicleCondition: "",
    engineType: "",
    emissionStandard: "",
    bodyType: "",
    towingCapacityMin: "",
    towingCapacityMax: "",
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
      if (appliedFilters.gpsEnabled) {
        params.gpsEnabled = appliedFilters.gpsEnabled;
      }
      if (appliedFilters.ownership) {
        params.ownership = appliedFilters.ownership;
      }
      if (appliedFilters.vehicleCondition) {
        params.vehicleCondition = appliedFilters.vehicleCondition;
      }
      if (appliedFilters.engineType) {
        params.engineType = appliedFilters.engineType;
      }
      if (appliedFilters.emissionStandard) {
        params.emissionStandard = appliedFilters.emissionStandard;
      }
      if (appliedFilters.bodyType) {
        params.bodyType = appliedFilters.bodyType;
      }
      if (appliedFilters.towingCapacityMin) {
        params.towingCapacityMin = appliedFilters.towingCapacityMin;
      }
      if (appliedFilters.towingCapacityMax) {
        params.towingCapacityMax = appliedFilters.towingCapacityMax;
      }
      if (appliedFilters.createdOnStart) {
        params.createdOnStart = appliedFilters.createdOnStart;
      }
      if (appliedFilters.createdOnEnd) {
        params.createdOnEnd = appliedFilters.createdOnEnd;
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
  }, [filters]);

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
      gpsEnabled: "",
      ownership: "",
      vehicleCondition: "",
      engineType: "",
      emissionStandard: "",
      bodyType: "",
      towingCapacityMin: "",
      towingCapacityMax: "",
      createdOnStart: "",
      createdOnEnd: "",
    };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
  }, []);

  const handleSearchChange = useCallback((text) => {
    setSearchText(text);
  }, []);

  const handlePageChange = useCallback(
    (page) => {
      // Build params using only appliedFilters
      const params = {
        page,
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
      if (appliedFilters.gpsEnabled) {
        params.gpsEnabled = appliedFilters.gpsEnabled;
      }
      if (appliedFilters.ownership) {
        params.ownership = appliedFilters.ownership;
      }
      if (appliedFilters.vehicleCondition) {
        params.vehicleCondition = appliedFilters.vehicleCondition;
      }
      if (appliedFilters.engineType) {
        params.engineType = appliedFilters.engineType;
      }
      if (appliedFilters.emissionStandard) {
        params.emissionStandard = appliedFilters.emissionStandard;
      }
      if (appliedFilters.bodyType) {
        params.bodyType = appliedFilters.bodyType;
      }
      if (appliedFilters.towingCapacityMin) {
        params.towingCapacityMin = appliedFilters.towingCapacityMin;
      }
      if (appliedFilters.towingCapacityMax) {
        params.towingCapacityMax = appliedFilters.towingCapacityMax;
      }

      dispatch(fetchVehicles(params));
    },
    [dispatch, appliedFilters]
  );

  const filteredVehicles = useMemo(() => {
    // Ensure we have valid vehicles array
    const vehicleArray = Array.isArray(vehicles) ? vehicles : [];

    if (!searchText || searchText.trim() === "") {
      return vehicleArray;
    }

    return fuzzySearch(searchText, vehicleArray);
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

  const handleBulkUpload = useCallback(() => {
    dispatch(openVehicleBulkUploadModal());
  }, [dispatch]);

  const handleDeleteDraft = useCallback(
    async (vehicleId) => {
      if (
        window.confirm(
          "Are you sure you want to delete this draft? This action cannot be undone."
        )
      ) {
        try {
          await dispatch(deleteVehicleDraft(vehicleId)).unwrap();

          dispatch(
            addToast({
              type: TOAST_TYPES.SUCCESS,
              message: "Draft deleted successfully",
              duration: 3000,
            })
          );

          // Refresh the vehicle list to remove the deleted item
          dispatch(
            fetchVehicles({
              page: pagination.page,
              limit: pagination.limit || 25,
              ...appliedFilters,
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

  const theme = getPageTheme("list");

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <TMSHeader theme={theme} />

      <div className="max-w-7xl mx-auto px-2 lg:px-6 space-y-4">
        <TopActionBar
          onCreateNew={handleCreateNew}
          onBulkUpload={handleBulkUpload}
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
          onDeleteDraft={handleDeleteDraft}
          // Pagination props (matching TransporterListTable)
          currentPage={pagination.page}
          totalPages={pagination.pages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={handlePageChange}
          // Count props
          filteredCount={filteredVehicles.length}
          // Search props
          searchText={searchText}
          onSearchChange={handleSearchChange}
        />

        {error && (
          <div
            className="bg-[#FEE2E2] border border-[#EF4444] rounded-xl p-6 text-[#EF4444]"
            style={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)" }}
          >
            <p className="font-semibold text-sm">Error loading vehicles:</p>
            <p className="text-sm mt-1">
              {error.message || "Something went wrong"}
            </p>
          </div>
        )}
      </div>

      {/* Bulk Upload Modals */}
      <VehicleBulkUploadModal />
      <VehicleBulkUploadHistory />
    </div>
  );
};

export default VehicleMaintenance;
