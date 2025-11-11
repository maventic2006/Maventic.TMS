import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { vehicleAPI } from "../../utils/api";

// Mock data for development (keeping for fallback)
const MOCK_VEHICLES = [
  {
    vehicleId: "VH001",
    registrationNumber: "MH12AB1234",
    vehicleType: "HCV",
    make: "Tata",
    model: "LPT 1918",
    year: 2022,
    fuelType: "DIESEL",
    transmission: "MANUAL",
    engineNumber: "ENG123456789",
    chassisNumber: "CHS987654321",
    status: "ACTIVE",
    ownership: "OWNED",
    ownerName: "ABC Transport Pvt Ltd",
    transporterId: "TR001",
    transporterName: "ABC Transport",
    gpsEnabled: true,
    gpsDeviceId: "GPS001",
    currentDriver: "John Doe",
    capacity: { weight: 18, unit: "TON" },
    createdAt: "2024-01-15",
    createdBy: "ADMIN001",
  },
  {
    vehicleId: "VH002",
    registrationNumber: "GJ01CD5678",
    vehicleType: "MCV",
    make: "Ashok Leyland",
    model: "Partner",
    year: 2021,
    fuelType: "DIESEL",
    transmission: "MANUAL",
    engineNumber: "ENG987654321",
    chassisNumber: "CHS123456789",
    status: "MAINTENANCE",
    ownership: "LEASED",
    ownerName: "XYZ Logistics",
    transporterId: "TR002",
    transporterName: "XYZ Logistics",
    gpsEnabled: true,
    gpsDeviceId: "GPS002",
    currentDriver: "Jane Smith",
    capacity: { weight: 8, unit: "TON" },
    createdAt: "2024-02-10",
    createdBy: "ADMIN001",
  },
  {
    vehicleId: "VH003",
    registrationNumber: "DL05EF9012",
    vehicleType: "LCV",
    make: "Mahindra",
    model: "Bolero Pickup",
    year: 2023,
    fuelType: "DIESEL",
    transmission: "MANUAL",
    engineNumber: "ENG456789123",
    chassisNumber: "CHS654321987",
    status: "ACTIVE",
    ownership: "OWNED",
    ownerName: "PQR Transport",
    transporterId: "TR003",
    transporterName: "PQR Transport",
    gpsEnabled: false,
    gpsDeviceId: null,
    currentDriver: "Raj Kumar",
    capacity: { weight: 1.5, unit: "TON" },
    createdAt: "2024-03-05",
    createdBy: "ADMIN002",
  },
  {
    vehicleId: "VH004",
    registrationNumber: "KA20GH3456",
    vehicleType: "TRAILER",
    make: "BharatBenz",
    model: "3123R",
    year: 2020,
    fuelType: "DIESEL",
    transmission: "AUTOMATIC",
    engineNumber: "ENG789123456",
    chassisNumber: "CHS321987654",
    status: "ACTIVE",
    ownership: "THIRD_PARTY",
    ownerName: "LMN Fleet Services",
    transporterId: "TR004",
    transporterName: "LMN Fleet",
    gpsEnabled: true,
    gpsDeviceId: "GPS004",
    currentDriver: "Amit Patel",
    capacity: { weight: 25, unit: "TON" },
    createdAt: "2024-01-20",
    createdBy: "ADMIN001",
  },
  {
    vehicleId: "VH005",
    registrationNumber: "TN22IJ7890",
    vehicleType: "REFRIGERATED",
    make: "Volvo",
    model: "FM440",
    year: 2022,
    fuelType: "DIESEL",
    transmission: "AUTOMATIC",
    engineNumber: "ENG321654987",
    chassisNumber: "CHS987321654",
    status: "ACTIVE",
    ownership: "LEASED",
    ownerName: "Cold Chain Logistics",
    transporterId: "TR005",
    transporterName: "Cold Chain",
    gpsEnabled: true,
    gpsDeviceId: "GPS005",
    currentDriver: "Suresh Reddy",
    capacity: { weight: 15, unit: "TON", volume: 45, volumeUnit: "CBM" },
    createdAt: "2024-02-15",
    createdBy: "ADMIN002",
  },
  {
    vehicleId: "VH006",
    registrationNumber: "UP32KL1234",
    vehicleType: "HCV",
    make: "Eicher",
    model: "Pro 6025",
    year: 2021,
    fuelType: "DIESEL",
    transmission: "MANUAL",
    engineNumber: "ENG654987321",
    chassisNumber: "CHS123987654",
    status: "BLACKLISTED",
    ownership: "OWNED",
    ownerName: "RST Transporters",
    transporterId: "TR006",
    transporterName: "RST Transporters",
    gpsEnabled: false,
    gpsDeviceId: null,
    currentDriver: null,
    capacity: { weight: 20, unit: "TON" },
    createdAt: "2024-01-10",
    createdBy: "ADMIN003",
    blacklistedReason: "Multiple Accidents",
    blacklistedDate: "2024-08-15",
  },
  {
    vehicleId: "VH007",
    registrationNumber: "HR26MN5678",
    vehicleType: "TANKER",
    make: "Tata",
    model: "Signa 4825.TK",
    year: 2023,
    fuelType: "DIESEL",
    transmission: "MANUAL",
    engineNumber: "ENG147258369",
    chassisNumber: "CHS369258147",
    status: "PENDING_APPROVAL",
    ownership: "RENTED",
    ownerName: "UVW Rentals",
    transporterId: "TR007",
    transporterName: "UVW Rentals",
    gpsEnabled: true,
    gpsDeviceId: "GPS007",
    currentDriver: "Ramesh Sharma",
    capacity: { volume: 15000, volumeUnit: "LITERS" },
    createdAt: "2024-10-20",
    createdBy: "ADMIN001",
  },
  {
    vehicleId: "VH008",
    registrationNumber: "RJ14OP9012",
    vehicleType: "CONTAINER",
    make: "Mercedes-Benz",
    model: "Actros 2546",
    year: 2022,
    fuelType: "DIESEL",
    transmission: "AUTOMATIC",
    engineNumber: "ENG963852741",
    chassisNumber: "CHS741852963",
    status: "ACTIVE",
    ownership: "OWNED",
    ownerName: "JKL Container Services",
    transporterId: "TR008",
    transporterName: "JKL Containers",
    gpsEnabled: true,
    gpsDeviceId: "GPS008",
    currentDriver: "Vijay Singh",
    capacity: { volume: 40, volumeUnit: "CFT" },
    createdAt: "2024-03-01",
    createdBy: "ADMIN002",
  },
  {
    vehicleId: "VH009",
    registrationNumber: "WB33QR3456",
    vehicleType: "FLATBED",
    make: "Ashok Leyland",
    model: "U-Truck 4825",
    year: 2020,
    fuelType: "DIESEL",
    transmission: "MANUAL",
    engineNumber: "ENG852741963",
    chassisNumber: "CHS963741852",
    status: "INACTIVE",
    ownership: "OWNED",
    ownerName: "MNO Logistics",
    transporterId: "TR009",
    transporterName: "MNO Logistics",
    gpsEnabled: false,
    gpsDeviceId: null,
    currentDriver: null,
    capacity: { weight: 16, unit: "TON" },
    createdAt: "2024-01-25",
    createdBy: "ADMIN003",
  },
  {
    vehicleId: "VH010",
    registrationNumber: "MP09ST7890",
    vehicleType: "LCV",
    make: "Tata",
    model: "Ace Gold",
    year: 2023,
    fuelType: "CNG",
    transmission: "MANUAL",
    engineNumber: "ENG789456123",
    chassisNumber: "CHS321654789",
    status: "ACTIVE",
    ownership: "LEASED",
    ownerName: "EFG Transport Co",
    transporterId: "TR010",
    transporterName: "EFG Transport",
    gpsEnabled: true,
    gpsDeviceId: "GPS010",
    currentDriver: "Arjun Verma",
    capacity: { weight: 0.75, unit: "TON" },
    createdAt: "2024-04-10",
    createdBy: "ADMIN001",
  },
];

// Async thunks (using real backend API)
// Transform backend vehicle data to frontend format
const transformVehicleData = (backendData) => {
  return {
    vehicleId: backendData.vehicle_id_code_hdr,
    registrationNumber: backendData.vehicle_registration_number || backendData.registration_number,
    vehicleType: backendData.vehicle_type_description || backendData.vehicle_type_id,
    make: backendData.maker_brand_description,
    model: backendData.maker_model,
    year: backendData.manufacturing_month_year ? new Date(backendData.manufacturing_month_year).getFullYear() : null,
    fuelType: backendData.fuel_type_id,
    transmission: backendData.transmission_type,
    engineNumber: backendData.engine_number || null,
    chassisNumber: backendData.vin_chassis_no,
    status: backendData.vehicle_status,
    ownership: backendData.ownership_name || 'N/A',
    ownerName: backendData.ownership_name,
    transporterId: null, // Not in current backend response
    transporterName: null, // Not in current backend response
    gpsEnabled: backendData.gps_tracker_active_flag === 1,
    gpsDeviceId: backendData.gps_tracker_imei_number,
    currentDriver: null, // Not in current backend response
    capacity: {
      weight: parseFloat(backendData.gross_vehicle_weight_kg) || 0,
      unit: 'TON'
    },
    createdAt: backendData.created_at,
    createdBy: backendData.created_by || 'N/A',
    blacklistStatus: backendData.blacklist_status === 1,
  };
};

export const fetchVehicles = createAsyncThunk(
  "vehicle/fetchVehicles",
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log("🚗 Fetching vehicles with params:", params);

      const response = await vehicleAPI.getVehicles(params);
      
      console.log("✅ Vehicles fetched successfully:", response.data);

      // Transform backend data to frontend format
      const transformedVehicles = (response.data.data || []).map(transformVehicleData);

      return {
        vehicles: transformedVehicles,
        pagination: response.data.pagination || {
          page: params.page || 1,
          limit: params.limit || 25,
          total: 0,
          pages: 0,
        },
      };
    } catch (error) {
      console.error("❌ Error fetching vehicles:", error);
      return rejectWithValue({
        code: error.response?.data?.code || "FETCH_ERROR",
        message: error.response?.data?.message || "Failed to fetch vehicles",
      });
    }
  }
);

// Transform detailed vehicle data from backend to flat frontend format
const transformVehicleDetails = (backendData) => {
  const basic = backendData.basicInformation || {};
  const specs = backendData.specifications || {};
  const capacity = backendData.capacityDetails || {};
  const ownershipRecords = backendData.ownershipDetails || [];
  const maintenanceRecords = backendData.maintenanceHistory || [];
  const serviceFreqRecords = backendData.serviceFrequency || [];
  
  // For backward compatibility, get the first record of each array for legacy fields
  const ownership = ownershipRecords[0] || {};
  const maintenance = maintenanceRecords[0] || {};
  const serviceFreq = serviceFreqRecords[0] || {};

  return {
    // Vehicle ID and Status
    vehicleId: backendData.vehicleId,
    status: backendData.status,
    blacklistStatus: backendData.blacklistStatus === 1,
    
    // Basic Information
    make: basic.make,
    model: basic.model,
    vin: basic.vin,
    chassisNumber: basic.vin,
    vehicleType: basic.vehicleTypeDescription || basic.vehicleType,
    vehicleCategory: basic.vehicleCategory,
    year: basic.manufacturingMonthYear ? new Date(basic.manufacturingMonthYear).getFullYear() : null,
    manufacturingMonthYear: basic.manufacturingMonthYear,
    
    // GPS & Tracking
    gpsIMEI: basic.gpsIMEI,
    gpsDeviceId: basic.gpsIMEI,
    gpsEnabled: basic.gpsActive === 1,
    gpsActive: basic.gpsActive,
    
    // Usage
    usageType: basic.usageType,
    leasingFlag: basic.leasingFlag === 1,
    avgRunningSpeed: basic.avgRunningSpeed,
    maxRunningSpeed: basic.maxRunningSpeed,
    safetyInspectionDate: basic.safetyInspectionDate,
    taxesAndFees: basic.taxesAndFees,
    
    // Specifications
    engineType: specs.engineType,
    engineNumber: specs.engineNumber,
    fuelType: specs.fuelType,
    transmission: specs.transmission,
    color: specs.color,
    emissionStandard: specs.emissionStandard,
    financer: specs.financer,
    suspensionType: specs.suspensionType,
    bodyTypeDescription: specs.bodyTypeDescription,
    
    // Capacity Details
    unloadingWeight: capacity.unloadingWeight,
    gvw: capacity.gvw,
    grossVehicleWeight: capacity.gvw,
    payloadCapacity: capacity.payloadCapacity,
    volumeCapacity: capacity.volumeCapacity,
    cargoWidth: capacity.cargoWidth,
    cargoHeight: capacity.cargoHeight,
    cargoLength: capacity.cargoLength,
    towingCapacity: capacity.towingCapacity,
    tireLoadRating: capacity.tireLoadRating,
    vehicleCondition: capacity.vehicleCondition,
    fuelTankCapacity: capacity.fuelTankCapacity,
    fuelCapacity: capacity.fuelTankCapacity,
    seatingCapacity: capacity.seatingCapacity,
    capacity: {
      weight: parseFloat(capacity.gvw) || 0,
      unit: 'TON'
    },
    
    // Ownership Details
    ownerId: ownership.ownerId,
    ownershipName: ownership.ownershipName,
    ownerName: ownership.ownershipName,
    ownership: ownership.ownershipName || 'N/A',
    registrationNumber: ownership.registrationNumber,
    registrationDate: ownership.registrationDate,
    registrationUpto: ownership.registrationUpto,
    rcExpiryDate: ownership.registrationUpto,
    purchaseDate: ownership.purchaseDate,
    ownerSrNumber: ownership.ownerSrNumber,
    stateCode: ownership.stateCode,
    registrationState: ownership.stateCode,
    rtoCode: ownership.rtoCode,
    presentAddressId: ownership.presentAddressId,
    permanentAddressId: ownership.permanentAddressId,
    saleAmount: ownership.saleAmount,
    
    // Maintenance History
    vehicleMaintenanceId: maintenance.vehicleMaintenanceId,
    serviceDate: maintenance.serviceDate,
    lastServiceDate: maintenance.serviceDate,
    serviceRemark: maintenance.serviceRemark,
    upcomingServiceDate: maintenance.upcomingServiceDate,
    nextServiceDate: maintenance.upcomingServiceDate,
    typeOfService: maintenance.typeOfService,
    serviceExpense: maintenance.serviceExpense,
    
    // Service Frequency
    sequenceNumber: serviceFreq.sequenceNumber,
    timePeriod: serviceFreq.timePeriod,
    kmDrove: serviceFreq.kmDrove,
    
    // Documents
    documents: backendData.documents || [],
    
    // Array data for view tabs (NEW - for accordion display)
    ownershipDetails: ownershipRecords.map(record => ({
      ownerId: record.ownerId,
      ownershipName: record.ownershipName,
      validFrom: record.validFrom,
      validTo: record.validTo,
      registrationNumber: record.registrationNumber,
      registrationDate: record.registrationDate,
      registrationUpto: record.registrationUpto,
      purchaseDate: record.purchaseDate,
      ownerSrNumber: record.ownerSrNumber,
      stateCode: record.stateCode,
      rtoCode: record.rtoCode,
      presentAddressId: record.presentAddressId,
      permanentAddressId: record.permanentAddressId,
      saleAmount: record.saleAmount,
    })),
    maintenanceHistory: maintenanceRecords.map(record => ({
      vehicleMaintenanceId: record.vehicleMaintenanceId,
      serviceDate: record.serviceDate,
      serviceRemark: record.serviceRemark,
      upcomingServiceDate: record.upcomingServiceDate,
      typeOfService: record.typeOfService,
      serviceExpense: record.serviceExpense,
    })),
    serviceFrequency: serviceFreqRecords.map(record => ({
      sequenceNumber: record.sequenceNumber,
      timePeriod: record.timePeriod,
      kmDrove: record.kmDrove,
    })),
    
    // Timestamps
    createdAt: backendData.createdAt,
    updatedAt: backendData.updatedAt,
  };
};

export const fetchVehicleById = createAsyncThunk(
  "vehicle/fetchVehicleById",
  async (vehicleId, { rejectWithValue }) => {
    try {
      console.log("🚗 Fetching vehicle by ID:", vehicleId);

      const response = await vehicleAPI.getVehicleById(vehicleId);
      
      console.log("✅ Vehicle details fetched successfully:", response.data);

      // Transform nested backend structure to flat frontend format
      const transformedData = transformVehicleDetails(response.data.data);
      
      console.log("✅ Vehicle details transformed:", transformedData);

      return transformedData;
    } catch (error) {
      console.error("❌ Error fetching vehicle details:", error);
      return rejectWithValue({
        code: error.response?.data?.code || error.response?.status === 404 ? "NOT_FOUND" : "FETCH_ERROR",
        message: error.response?.data?.message || "Failed to fetch vehicle details",
      });
    }
  }
);

export const createVehicle = createAsyncThunk(
  "vehicle/createVehicle",
  async (vehicleData, { rejectWithValue }) => {
    try {
      console.log("🚗 Creating vehicle with data:", vehicleData);

      const response = await vehicleAPI.createVehicle(vehicleData);
      
      console.log("✅ Vehicle created successfully:", response.data);

      return {
        success: response.data.success,
        vehicleId: response.data.data?.vehicleId,
        message: response.data.message || "Vehicle created successfully",
      };
    } catch (error) {
      console.error("❌ Error creating vehicle:", error);
      return rejectWithValue({
        code: error.response?.data?.code || "CREATE_ERROR",
        message: error.response?.data?.message || "Failed to create vehicle",
        errors: error.response?.data?.errors || [],
      });
    }
  }
);

export const updateVehicle = createAsyncThunk(
  "vehicle/updateVehicle",
  async ({ vehicleId, vehicleData }, { rejectWithValue }) => {
    try {
      console.log("🚗 Updating vehicle:", vehicleId, vehicleData);

      const response = await vehicleAPI.updateVehicle(vehicleId, vehicleData);
      
      console.log("✅ Vehicle updated successfully:", response.data);

      return {
        success: response.data.success,
        vehicleId: response.data.data?.vehicleId,
        message: response.data.message || "Vehicle updated successfully",
      };
    } catch (error) {
      console.error("❌ Error updating vehicle:", error);
      return rejectWithValue({
        code: error.response?.data?.code || "UPDATE_ERROR",
        message: error.response?.data?.message || "Failed to update vehicle",
        errors: error.response?.data?.errors || [],
      });
    }
  }
);

// Get master data
export const fetchMasterData = createAsyncThunk(
  "vehicle/fetchMasterData",
  async (_, { rejectWithValue }) => {
    try {
      console.log("🚗 Fetching vehicle master data");

      const response = await vehicleAPI.getMasterData();
      
      console.log("✅ Master data fetched successfully:", response.data);

      return response.data.data;
    } catch (error) {
      console.error("❌ Error fetching master data:", error);
      return rejectWithValue({
        code: error.response?.data?.code || "FETCH_ERROR",
        message: error.response?.data?.message || "Failed to fetch master data",
      });
    }
  }
);

// Vehicle slice
const vehicleSlice = createSlice({
  name: "vehicle",
  initialState: {
    vehicles: [],
    currentVehicle: null,
    masterData: {
      vehicleTypes: [],
      documentTypes: [],
      fuelTypes: [],
      transmissionTypes: [],
      emissionStandards: [],
      usageTypes: [],
      suspensionTypes: [],
      vehicleConditions: [],
      loadingCapacityUnits: [],
      doorTypes: [],
      coverageTypes: [], // ✅ Added coverage types
      engineTypes: [], // ✅ Added engine types (was missing)
    },
    pagination: {
      page: 1,
      limit: 25,
      total: 0,
      pages: 0,
    },
    isFetching: false,
    isCreating: false,
    isUpdating: false,
    isFetchingMasterData: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    clearCurrentVehicle: (state) => {
      state.currentVehicle = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch vehicles
      .addCase(fetchVehicles.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.isFetching = false;
        state.vehicles = action.payload.vehicles;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload;
      })
      // Fetch vehicle by ID
      .addCase(fetchVehicleById.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(fetchVehicleById.fulfilled, (state, action) => {
        state.isFetching = false;
        state.currentVehicle = action.payload;
      })
      .addCase(fetchVehicleById.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload;
      })
      // Create vehicle
      .addCase(createVehicle.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createVehicle.fulfilled, (state, action) => {
        state.isCreating = false;
        state.successMessage = action.payload.message;
        state.vehicles.unshift(action.payload.vehicle);
      })
      .addCase(createVehicle.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })
      // Update vehicle
      .addCase(updateVehicle.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateVehicle.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.successMessage = action.payload.message;
        // Refresh the current vehicle after update
        if (state.currentVehicle?.vehicleId === action.payload.vehicleId) {
          state.currentVehicle = { ...state.currentVehicle, ...action.payload };
        }
      })
      .addCase(updateVehicle.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      // Fetch master data
      .addCase(fetchMasterData.pending, (state) => {
        state.isFetchingMasterData = true;
        state.error = null;
      })
      .addCase(fetchMasterData.fulfilled, (state, action) => {
        state.isFetchingMasterData = false;
        state.masterData = action.payload;
      })
      .addCase(fetchMasterData.rejected, (state, action) => {
        state.isFetchingMasterData = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccessMessage, clearCurrentVehicle } =
  vehicleSlice.actions;

export default vehicleSlice.reducer;
