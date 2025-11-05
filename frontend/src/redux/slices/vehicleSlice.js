import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Mock data for development
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

// Async thunks (using mock data for Phase 1A-C)
export const fetchVehicles = createAsyncThunk(
  "vehicle/fetchVehicles",
  async (params = {}, { rejectWithValue }) => {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log(" Fetching vehicles with params:", params);

      let filtered = [...MOCK_VEHICLES];

      // Apply filters
      if (params.vehicleId) {
        filtered = filtered.filter((v) =>
          v.vehicleId.toLowerCase().includes(params.vehicleId.toLowerCase())
        );
      }
      if (params.status) {
        filtered = filtered.filter((v) => v.status === params.status);
      }
      if (params.vehicleType) {
        filtered = filtered.filter((v) => v.vehicleType === params.vehicleType);
      }
      if (params.ownership) {
        filtered = filtered.filter((v) => v.ownership === params.ownership);
      }
      if (params.transporterId) {
        filtered = filtered.filter((v) => v.transporterId === params.transporterId);
      }
      if (params.registrationNumber) {
        filtered = filtered.filter((v) =>
          v.registrationNumber
            .toLowerCase()
            .includes(params.registrationNumber.toLowerCase())
        );
      }

      // Pagination
      const page = params.page || 1;
      const limit = params.limit || 25;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedVehicles = filtered.slice(startIndex, endIndex);

      return {
        vehicles: paginatedVehicles,
        pagination: {
          page,
          limit,
          total: filtered.length,
          pages: Math.ceil(filtered.length / limit),
        },
      };
    } catch (error) {
      return rejectWithValue({
        code: "FETCH_ERROR",
        message: "Failed to fetch vehicles",
      });
    }
  }
);

export const fetchVehicleById = createAsyncThunk(
  "vehicle/fetchVehicleById",
  async (vehicleId, { rejectWithValue }) => {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      const vehicle = MOCK_VEHICLES.find((v) => v.vehicleId === vehicleId);

      if (!vehicle) {
        return rejectWithValue({
          code: "NOT_FOUND",
          message: "Vehicle not found",
        });
      }

      // Add additional details for details page
      const detailedVehicle = {
        ...vehicle,
        documents: [
          {
            documentType: "RC",
            documentNumber: "RC123456789",
            issuedDate: "2022-01-15",
            expiryDate: "2032-01-15",
            issuingAuthority: "RTO Mumbai",
          },
          {
            documentType: "INSURANCE",
            documentNumber: "INS987654321",
            issuedDate: "2024-01-01",
            expiryDate: "2025-01-01",
            issuingAuthority: "ABC Insurance",
          },
        ],
        maintenanceHistory: [
          {
            date: "2024-10-01",
            type: "ROUTINE",
            description: "Regular servicing",
            cost: 5000,
            serviceCenter: "ABC Service Center",
          },
          {
            date: "2024-07-15",
            type: "PREVENTIVE",
            description: "Oil change and filter replacement",
            cost: 3000,
            serviceCenter: "XYZ Auto Works",
          },
        ],
        gpsTracker: {
          deviceId: vehicle.gpsDeviceId,
          provider: "GPS Provider 1",
          installationDate: "2022-01-20",
          lastLocation: { lat: 19.076, lng: 72.8777, timestamp: "2024-11-03 14:30" },
        },
      };

      return detailedVehicle;
    } catch (error) {
      return rejectWithValue({
        code: "FETCH_ERROR",
        message: "Failed to fetch vehicle details",
      });
    }
  }
);

export const createVehicle = createAsyncThunk(
  "vehicle/createVehicle",
  async (vehicleData, { rejectWithValue }) => {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log(" Creating vehicle with data:", vehicleData);

      // Simulate success response
      const newVehicle = {
        ...vehicleData,
        vehicleId: `VH${String(MOCK_VEHICLES.length + 1).padStart(3, "0")}`,
        createdAt: new Date().toISOString().split("T")[0],
        createdBy: "ADMIN001",
        status: "PENDING_APPROVAL",
      };

      return {
        success: true,
        vehicle: newVehicle,
        message: "Vehicle created successfully",
      };
    } catch (error) {
      return rejectWithValue({
        code: "CREATE_ERROR",
        message: "Failed to create vehicle",
      });
    }
  }
);

export const updateVehicle = createAsyncThunk(
  "vehicle/updateVehicle",
  async ({ vehicleId, vehicleData }, { rejectWithValue }) => {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log(" Updating vehicle:", vehicleId, vehicleData);

      return {
        success: true,
        vehicle: { vehicleId, ...vehicleData },
        message: "Vehicle updated successfully",
      };
    } catch (error) {
      return rejectWithValue({
        code: "UPDATE_ERROR",
        message: "Failed to update vehicle",
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
    pagination: {
      page: 1,
      limit: 25,
      total: 0,
      pages: 0,
    },
    isFetching: false,
    isCreating: false,
    isUpdating: false,
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
        state.currentVehicle = action.payload.vehicle;
      })
      .addCase(updateVehicle.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccessMessage, clearCurrentVehicle } =
  vehicleSlice.actions;

export default vehicleSlice.reducer;
