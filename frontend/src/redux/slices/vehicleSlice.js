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
    vehicleId: backendData.vehicleId,
    registrationNumber: backendData.registrationNumber,
    vehicleType: backendData.vehicleType,
    make: backendData.make,
    model: backendData.model,
    year: backendData.year,
    fuelType: backendData.fuelType,
    transmission: backendData.transmissionType,
    engineNumber: backendData.engineNumber || null,
    chassisNumber: backendData.vin,
    status: backendData.status,
    ownership: backendData.ownershipName || "N/A",
    ownerName: backendData.ownershipName,
    transporterId: null, // Not in current backend response
    transporterName: null, // Not in current backend response
    gpsEnabled: backendData.gpsEnabled,
    gpsDeviceId: backendData.gpsIMEI,
    currentDriver: null, // Not in current backend response
    capacity: {
      weight: parseFloat(backendData.gvw) || 0,
      unit: "TON",
    },
    createdAt: backendData.createdAt,
    createdBy: backendData.created_by || "N/A",
    blacklistStatus: backendData.blacklistStatus,
    vehicleCondition: backendData.vehicleCondition,
    towingCapacity: backendData.towingCapacity,
    fuelCapacity: backendData.fuelCapacity,
    leasingFlag: backendData.leasingFlag,
    registrationState: backendData.registrationState,
    engineTypeId: backendData.engineTypeId,
    emissionStandard: backendData.emissionStandard,
    bodyType: backendData.bodyType,
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
      const transformedVehicles = (response.data.data || []).map(
        transformVehicleData
      );

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
  console.log("🔄 transformVehicleDetails - Processing vehicle data");

  const basic = backendData?.basicInformation || {};
  const specs = backendData?.specifications || {};
  const capacity = backendData?.capacityDetails || {};
  const ownershipRecords = backendData?.ownershipDetails || [];
  const maintenanceRecords = backendData?.maintenanceHistory || [];
  const serviceFreqRecords = backendData?.serviceFrequency || [];

  console.log(
    "✅ Extracting nested data sections - basic info:",
    basic.make,
    basic.model
  );

  // For backward compatibility, get the first record of each array for legacy fields
  const ownership = ownershipRecords[0] || {};
  const maintenance = maintenanceRecords[0] || {};
  const serviceFreq = serviceFreqRecords[0] || {};

  const result = {
    // Vehicle ID and Status
    vehicleId: backendData.vehicleId,
    status: backendData.status,
    blacklistStatus: backendData.blacklistStatus === 1,

    // Basic Information - all fields mapped for form prefill with proper data type conversion
    make: basic.make || "",
    model: basic.model || "",
    vin: basic.vin || "",
    chassisNumber: basic.vin || "",
    registrationNumber: basic.registrationNumber || "",
    vehicleType: basic.vehicleTypeDescription || basic.vehicleType || "", // Use description for display, ID as fallback
    vehicleTypeId: basic.vehicleType || "", // Keep original ID for form operations
    vehicleTypeDescription: basic.vehicleTypeDescription || "",
    // Additional safety field to ensure we always have the ID available
    vehicleTypeIdSafe: (() => {
      // Ensure we always return a proper ID, never a description
      const id = basic.vehicleType || "";
      // If it's longer than 10 chars, it might be a description - map it back
      if (id.length > 10) {
        const descToIdMap = {
          "HCV - Heavy Commercial Vehicle": "VT001",
          "MCV - Medium Commercial Vehicle": "VT002",
          "LCV - Light Commercial Vehicle": "VT003",
          "TRAILER - Trailer": "VT004",
          "CONTAINER - Container": "VT005",
          "TANKER - Tanker": "VT006",
          "REFRIGERATED - Refrigerated Vehicle": "VT007",
          "FLATBED - Flatbed": "VT008",
        };
        return descToIdMap[id] || "";
      }
      return id;
    })(), // Execute immediately
    vehicleCategory: basic.vehicleCategory || "",
    year:
      parseInt(basic.year) ||
      (basic.manufacturingMonthYear
        ? new Date(basic.manufacturingMonthYear).getFullYear()
        : new Date().getFullYear()),
    manufacturingMonthYear: basic.manufacturingMonthYear || "",
    color: basic.color || "",
    roadTax: parseFloat(basic.roadTax) || 0,
    fitnessUpto: basic.fitnessUpto || "",
    taxUpto: basic.taxUpto || "",

    // GPS & Tracking
    gpsIMEI: basic.gpsIMEI,
    gpsDeviceId: basic.gpsIMEI,
    gpsEnabled: basic.gpsEnabled === 1 || basic.gpsActive === 1,
    gpsActive: basic.gpsActive,
    gpsProvider: basic.gpsProvider || "",
    imeiNumber: basic.gpsIMEI || basic.imeiNumber || "",
    simNumber: basic.simNumber || "",
    lastGpsUpdate: basic.lastGpsUpdate || "",

    // Usage & Operation
    usageType: basic.usageType || "",
    leasingFlag: basic.leasingFlag === 1,
    leasedFrom: basic.leasedFrom || "",
    leaseStartDate: basic.leaseStartDate || "",
    leaseEndDate: basic.leaseEndDate || "",
    avgRunningSpeed: parseFloat(basic.avgRunningSpeed) || 0,
    maxRunningSpeed: parseFloat(basic.maxRunningSpeed) || 0,
    safetyInspectionDate: basic.safetyInspectionDate || "",
    taxesAndFees: parseFloat(basic.taxesAndFees) || 0,
    vehicleRegisteredAtCountry: basic.vehicleRegisteredAtCountry || "",
    vehicleRegisteredAtState:
      basic.vehicleRegisteredAtState || basic.vehicleRegisteredAt || "",
    currentDriver: basic.currentDriver || "",
    transporterId: basic.transporterId || "",
    transporterName: basic.transporterName || "",
    mileage: parseFloat(basic.mileage) || 0,
    currentOdometer: parseFloat(basic.currentOdometer) || 0,
    averageKmPerDay: parseFloat(basic.averageKmPerDay) || 0,
    currentLocation: basic.currentLocation || "",

    // Additional operational fields for view tabs
    updatedBy: backendData.updatedBy || backendData.createdBy || "",
    gpsDeviceId: basic.gpsIMEI || basic.gpsDeviceId || "",
    imeiNumber: basic.gpsIMEI || basic.imeiNumber || "",
    simNumber: basic.simNumber || "",
    lastGpsUpdate: basic.lastGpsUpdate || "",

    // Specifications - all fields mapped for form prefill with proper data type conversion
    engineType: specs.engineType || "",
    engineNumber: specs.engineNumber || "",
    fuelType: specs.fuelType || "",
    fuelTankCapacity: parseFloat(specs.fuelTankCapacity) || 0,
    transmission: specs.transmission || "",
    noOfGears: parseInt(specs.noOfGears) || 0, // Not in DB, defaults to 0
    numberOfGears: parseInt(specs.noOfGears) || 0, // Alias for view tab compatibility
    wheelbase: parseFloat(specs.wheelbase) || 0, // Not in DB, defaults to 0
    noOfAxles: parseInt(specs.noOfAxles) || 0, // Not in DB, defaults to 0
    numberOfAxles: parseInt(specs.noOfAxles) || 0, // Alias for view tab compatibility
    emissionStandard: specs.emissionStandard || "",
    financer: specs.financer || "",
    suspensionType: specs.suspensionType || "",
    bodyTypeDescription: specs.bodyTypeDescription || "",
    vehicleClass: specs.vehicleClass || "",

    // Additional specs fields for view tabs compatibility
    maxPower: specs.maxPower || "",
    maxTorque: specs.maxTorque || "",
    numberOfCylinders: specs.numberOfCylinders || "",
    valvesPerCylinder: specs.valvesPerCylinder || "",
    fuelSystem: specs.fuelSystem || "",
    aspirationType: specs.aspirationType || "",
    emissionLevel: specs.emissionLevel || "",
    pucValidUntil: specs.pucValidUntil || "",
    driveType: specs.driveType || "",
    gearRatio: specs.gearRatio || "",
    differentialType: specs.differentialType || "",
    clutchType: specs.clutchType || "",
    frontSuspension: specs.frontSuspension || "",
    rearSuspension: specs.rearSuspension || "",
    frontBrakeType: specs.frontBrakeType || "",
    rearBrakeType: specs.rearBrakeType || "",
    brakeAssist: specs.brakeAssist || "",
    absAvailable: specs.absAvailable || false,
    wheelType: specs.wheelType || "",

    // Capacity Details - all fields mapped for form prefill with proper data type conversion
    unloadingWeight: parseFloat(capacity.unloadingWeight) || 0,
    unladenWeight:
      parseFloat(capacity.unladenWeight || capacity.unloadingWeight) || 0,
    gvw: parseFloat(capacity.gvw) || 0,
    grossVehicleWeight: parseFloat(capacity.gvw) || 0,
    payloadCapacity: parseFloat(capacity.payloadCapacity) || 0,
    loadingCapacityVolume:
      parseFloat(capacity.loadingCapacityVolume || capacity.volumeCapacity) ||
      0,
    loadingCapacityUnit: capacity.loadingCapacityUnit || "CBM",
    volumeCapacity: parseFloat(capacity.volumeCapacity) || 0,
    cargoWidth: parseFloat(capacity.cargoWidth) || 0,
    cargoHeight: parseFloat(capacity.cargoHeight) || 0,
    cargoLength: parseFloat(capacity.cargoLength) || 0,
    doorType: capacity.doorType || "", // Not in DB, defaults to empty
    noOfPallets: parseInt(capacity.noOfPallets) || 0, // Not in DB, defaults to 0
    numberOfPallets: parseInt(capacity.noOfPallets) || 0, // Alias for view tab compatibility
    towingCapacity: parseFloat(capacity.towingCapacity) || 0,
    tireLoadRating: capacity.tireLoadRating || "",
    vehicleCondition: capacity.vehicleCondition || "",
    seatingCapacity: parseInt(capacity.seatingCapacity) || 0,
    fuelCapacity:
      parseFloat(capacity.fuelTankCapacity || specs.fuelTankCapacity) || 0,
    capacity: {
      weight: parseFloat(capacity.gvw) || 0,
      unit: "TON",
    },

    // Additional capacity fields for view tabs compatibility
    kerbWeight: capacity.kerbWeight || 0,
    maxLadenWeight: capacity.maxLadenWeight || 0,
    cargoVolume: capacity.volumeCapacity || 0,
    cargoVolumeCubicFeet: capacity.cargoVolumeCubicFeet || 0,
    loadingPlatformHeight: capacity.loadingPlatformHeight || 0,
    doorWidth: capacity.doorWidth || 0,
    doorHeight: capacity.doorHeight || 0,
    overallLength: capacity.overallLength || 0,
    overallWidth: capacity.overallWidth || 0,
    overallHeight: capacity.overallHeight || 0,
    groundClearance: capacity.groundClearance || 0,
    trackWidthFront: capacity.trackWidthFront || 0,
    trackWidthRear: capacity.trackWidthRear || 0,
    numberOfDoors: capacity.numberOfDoors || 0,
    numberOfWheels: capacity.numberOfWheels || 0,
    tailLiftAvailable: capacity.tailLiftAvailable || false,
    tailLiftCapacity: capacity.tailLiftCapacity || 0,
    temperatureControl: capacity.temperatureControl || false,
    minTemperature: capacity.minTemperature || 0,
    maxTemperature: capacity.maxTemperature || 0,
    reeferUnitType: capacity.reeferUnitType || "",

    // Ownership Details - single object for form (first record from array)
    ownerId: ownership.ownerId,
    ownershipName: ownership.ownershipName,
    ownerName: ownership.ownershipName,
    ownership: ownership.ownershipName || "N/A",
    registrationDate: ownership.registrationDate,
    registrationUpto: ownership.registrationUpto,
    rcExpiryDate: ownership.registrationUpto,
    rcBookNumber: basic.rcBookNumber || ownership.rcBookNumber || "",
    insurancePolicyNumber: basic.insurancePolicyNumber || "",
    insuranceExpiryDate: basic.insuranceExpiryDate || "",
    registrationState:
      ownership.stateCode || basic.vehicleRegisteredAtState || "", // Add this mapping
    validFrom: ownership.validFrom || "",
    validTo: ownership.validTo || "",
    purchaseDate: ownership.purchaseDate,
    purchasePrice: parseFloat(ownership.saleAmount) || 0,
    ownerSrNumber: ownership.ownerSrNumber || "",
    stateCode: ownership.stateCode || "",
    registrationState: ownership.stateCode || "",
    rtoCode: ownership.rtoCode || "",
    presentAddressId: ownership.presentAddressId || "",
    permanentAddressId: ownership.permanentAddressId || "",
    saleAmount: parseFloat(ownership.saleAmount) || 0,
    contactNumber: ownership.contactNumber || "",
    email: ownership.email || "",

    // Maintenance History - single object for form (first record from array)
    vehicleMaintenanceId: maintenance.vehicleMaintenanceId,
    serviceDate: maintenance.serviceDate,
    lastServiceDate: maintenance.serviceDate,
    serviceRemark: maintenance.serviceRemark,
    maintenanceNotes: maintenance.serviceRemark || "",
    upcomingServiceDate: maintenance.upcomingServiceDate,
    nextServiceDate: maintenance.upcomingServiceDate,
    nextServiceDue: maintenance.upcomingServiceDate || "",
    typeOfService: maintenance.typeOfService || "",
    serviceExpense: parseFloat(maintenance.serviceExpense) || 0,
    totalServiceExpense: parseFloat(maintenance.serviceExpense) || 0,
    lastInspectionDate: maintenance.lastInspectionDate || "",

    // Service Frequency - single object for form (first record from array)
    sequenceNumber: serviceFreq.sequenceNumber || "",
    timePeriod: serviceFreq.timePeriod || "",
    serviceIntervalMonths: parseInt(serviceFreq.timePeriod) || 6,
    kmDrove: parseInt(serviceFreq.kmDrove) || 0,
    serviceIntervalKM: parseInt(serviceFreq.kmDrove) || 0,

    // Documents
    documents: backendData.documents || [],

    // Array data for view tabs (NEW - for accordion display)
    ownershipDetails: ownershipRecords.map((record) => ({
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
    maintenanceHistory: maintenanceRecords.map((record) => ({
      vehicleMaintenanceId: record.vehicleMaintenanceId,
      serviceDate: record.serviceDate,
      serviceRemark: record.serviceRemark,
      upcomingServiceDate: record.upcomingServiceDate,
      typeOfService: record.typeOfService,
      serviceExpense: record.serviceExpense,
    })),
    serviceFrequency: serviceFreqRecords.map((record) => ({
      sequenceNumber: record.sequenceNumber,
      timePeriod: record.timePeriod,
      kmDrove: record.kmDrove,
    })),

    // Timestamps
    createdAt: backendData.createdAt,
    createdBy: backendData.createdBy,
    updatedAt: backendData.updatedAt,

    // User Approval Status (NEW - for vehicle owner user approval flow)
    userApprovalStatus: backendData.userApprovalStatus || null,
  };

  console.log("✅ transformVehicleDetails - Output data:", result);
  return result;
};

export const fetchVehicleById = createAsyncThunk(
  "vehicle/fetchVehicleById",
  async (vehicleId, { rejectWithValue }) => {
    try {
      console.log("🚗 Fetching vehicle by ID:", vehicleId);

      const response = await vehicleAPI.getVehicleById(vehicleId);

      console.log("✅ Vehicle details fetched successfully:", response.data);
      console.log("🔍 Data structure check - response.data:", response.data);
      console.log(
        "🔍 Data structure check - response.data.data:",
        response.data.data
      );

      // Based on the backend response structure: { success: true, data: { vehicleId, basicInformation, ... } }
      const vehicleData = response.data.data;
      console.log("🔍 Using vehicle data:", vehicleData);

      // Transform nested backend structure to flat frontend format
      const transformedData = transformVehicleDetails(vehicleData);

      console.log("✅ Vehicle details transformed:", transformedData);

      return transformedData;
    } catch (error) {
      console.error("❌ Error fetching vehicle details:", error);
      return rejectWithValue({
        code:
          error.response?.data?.code || error.response?.status === 404
            ? "NOT_FOUND"
            : "FETCH_ERROR",
        message:
          error.response?.data?.message || "Failed to fetch vehicle details",
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

// ==================== DRAFT WORKFLOW THUNKS ====================

/**
 * Save vehicle as draft
 * Creates a new draft record with minimal validation (registration number only)
 */
export const saveVehicleAsDraft = createAsyncThunk(
  "vehicle/saveAsDraft",
  async (vehicleData, { rejectWithValue }) => {
    try {
      console.log("🚗 Saving vehicle as draft:", vehicleData);

      const response = await vehicleAPI.saveVehicleAsDraft(vehicleData);

      console.log("✅ Vehicle draft saved successfully:", response.data);

      return {
        success: response.data.success,
        vehicleId: response.data.data?.vehicleId,
        status: response.data.data?.status,
        message: response.data.message || "Vehicle saved as draft successfully",
      };
    } catch (error) {
      console.error("❌ Error saving vehicle draft:", error);

      // Extract field-specific error information for better user feedback
      const errorResponse = error.response?.data;

      return rejectWithValue({
        code:
          errorResponse?.error?.code ||
          errorResponse?.code ||
          "DRAFT_SAVE_ERROR",
        message:
          errorResponse?.message ||
          errorResponse?.error?.message ||
          "Failed to save vehicle as draft",
        field: errorResponse?.field || null, // Include field for UI highlighting
        errors: errorResponse?.errors || [],
      });
    }
  }
);

/**
 * Update existing vehicle draft
 * No validation, only allows updating drafts created by current user
 */
export const updateVehicleDraft = createAsyncThunk(
  "vehicle/updateDraft",
  async ({ vehicleId, vehicleData }, { rejectWithValue }) => {
    try {
      console.log("🚗 Updating vehicle draft:", vehicleId, vehicleData);

      const response = await vehicleAPI.updateVehicleDraft(
        vehicleId,
        vehicleData
      );

      console.log("✅ Vehicle draft updated successfully:", response.data);

      return {
        success: response.data.success,
        vehicleId: response.data.data?.vehicleId,
        status: response.data.data?.status,
        message: response.data.message || "Vehicle draft updated successfully",
      };
    } catch (error) {
      console.error("❌ Error updating vehicle draft:", error);
      return rejectWithValue({
        code: error.response?.data?.error?.code || "DRAFT_UPDATE_ERROR",
        message:
          error.response?.data?.error?.message ||
          "Failed to update vehicle draft",
        errors: error.response?.data?.errors || [],
      });
    }
  }
);

/**
 * Submit vehicle from draft to PENDING status
 * Performs full validation and changes status from DRAFT to PENDING
 * Only allows submitting drafts created by current user
 */
export const submitVehicleFromDraft = createAsyncThunk(
  "vehicle/submitFromDraft",
  async ({ vehicleId, vehicleData }, { rejectWithValue }) => {
    try {
      console.log(
        "🚗 Submitting vehicle draft for approval:",
        vehicleId,
        vehicleData
      );

      const response = await vehicleAPI.submitVehicleDraft(
        vehicleId,
        vehicleData
      );

      console.log("✅ Vehicle draft submitted successfully:", response.data);

      return {
        success: response.data.success,
        vehicleId: response.data.data?.vehicleId,
        status: response.data.data?.status,
        message:
          response.data.message ||
          "Vehicle submitted for approval successfully",
      };
    } catch (error) {
      console.error("❌ Error submitting vehicle draft:", error);

      // Extract field-specific error information for better user feedback
      const errorResponse = error.response?.data;

      return rejectWithValue({
        code:
          errorResponse?.error?.code ||
          errorResponse?.code ||
          "SUBMIT_DRAFT_ERROR",
        message:
          errorResponse?.message ||
          errorResponse?.error?.message ||
          "Failed to submit vehicle for approval",
        field: errorResponse?.field || null, // Include field for UI highlighting
        errors: errorResponse?.errors || [],
      });
    }
  }
);

/**
 * Delete vehicle draft
 * Hard delete - removes all vehicle records permanently
 * Only allows deleting drafts created by current user
 */
export const deleteVehicleDraft = createAsyncThunk(
  "vehicle/deleteDraft",
  async (vehicleId, { rejectWithValue }) => {
    try {
      console.log("🚗 Deleting vehicle draft:", vehicleId);

      const response = await vehicleAPI.deleteVehicleDraft(vehicleId);

      console.log("✅ Vehicle draft deleted successfully:", response.data);

      return {
        vehicleId,
        message: response.data.message || "Vehicle draft deleted successfully",
      };
    } catch (error) {
      console.error("❌ Error deleting vehicle draft:", error);
      return rejectWithValue({
        code: error.response?.data?.error?.code || "DRAFT_DELETE_ERROR",
        message:
          error.response?.data?.error?.message ||
          "Failed to delete vehicle draft",
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
    // Draft workflow loading states
    isSavingDraft: false,
    isUpdatingDraft: false,
    isDeletingDraft: false,
    isSubmittingDraft: false,
    draftError: null,
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
    resetPaginationToFirstPage: (state) => {
      state.pagination.page = 1;
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
        // Replace with fresh data from server (clears any stale flags)
        state.currentVehicle = {
          ...action.payload,
          _lastFetched: new Date().toISOString(),
        };
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
      })
      // Save vehicle as draft
      .addCase(saveVehicleAsDraft.pending, (state) => {
        state.isSavingDraft = true;
        state.draftError = null;
      })
      .addCase(saveVehicleAsDraft.fulfilled, (state, action) => {
        state.isSavingDraft = false;
        state.successMessage = action.payload.message;
      })
      .addCase(saveVehicleAsDraft.rejected, (state, action) => {
        state.isSavingDraft = false;
        state.draftError = action.payload;
      })
      // Update vehicle draft
      .addCase(updateVehicleDraft.pending, (state) => {
        state.isUpdatingDraft = true;
        state.draftError = null;
      })
      .addCase(updateVehicleDraft.fulfilled, (state, action) => {
        state.isUpdatingDraft = false;
        state.successMessage = action.payload.message;
        // Keep current vehicle data but mark as potentially stale
        // The VehicleDetailsPage will call fetchVehicleById to get fresh data
        if (state.currentVehicle?.vehicleId === action.payload.vehicleId) {
          state.currentVehicle = {
            ...state.currentVehicle,
            status: action.payload.status,
            // Add a flag to indicate this data might be stale
            _isStale: true,
          };
        }
      })
      .addCase(updateVehicleDraft.rejected, (state, action) => {
        state.isUpdatingDraft = false;
        state.draftError = action.payload;
      })
      // Submit vehicle from draft
      .addCase(submitVehicleFromDraft.pending, (state) => {
        state.isSubmittingDraft = true;
        state.draftError = null;
      })
      .addCase(submitVehicleFromDraft.fulfilled, (state, action) => {
        state.isSubmittingDraft = false;
        state.successMessage = action.payload.message;
        // Update current vehicle status to PENDING
        if (state.currentVehicle?.vehicleId === action.payload.vehicleId) {
          state.currentVehicle = { ...state.currentVehicle, status: "PENDING" };
        }
      })
      .addCase(submitVehicleFromDraft.rejected, (state, action) => {
        state.isSubmittingDraft = false;
        state.draftError = action.payload;
      })
      // Delete vehicle draft
      .addCase(deleteVehicleDraft.pending, (state) => {
        state.isDeletingDraft = true;
        state.draftError = null;
      })
      .addCase(deleteVehicleDraft.fulfilled, (state, action) => {
        state.isDeletingDraft = false;
        state.successMessage = action.payload.message;
        // Remove from vehicles list
        state.vehicles = state.vehicles.filter(
          (v) => v.vehicleId !== action.payload.vehicleId
        );
        // Clear current vehicle if it was deleted
        if (state.currentVehicle?.vehicleId === action.payload.vehicleId) {
          state.currentVehicle = null;
        }
      })
      .addCase(deleteVehicleDraft.rejected, (state, action) => {
        state.isDeletingDraft = false;
        state.draftError = action.payload;
      });
  },
});

export const { clearError, clearSuccessMessage, clearCurrentVehicle, resetPaginationToFirstPage } =
  vehicleSlice.actions;

// Export the transform function for use in components
export { transformVehicleDetails };

export default vehicleSlice.reducer;
