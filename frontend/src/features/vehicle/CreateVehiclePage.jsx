// import React, { useState, useEffect, useCallback, useMemo } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import {
//   ArrowLeft,
//   RefreshCw,
//   Save,
//   Upload,
//   AlertCircle,
//   Truck,
//   Gauge,
//   Package,
//   FileUser,
//   Wrench,
//   Calendar,
//   FileText,
// } from "lucide-react";

// import {
//   createVehicle,
//   clearError,
//   fetchMasterData,
//   saveVehicleAsDraft,
//   updateVehicleDraft,
// } from "../../redux/slices/vehicleSlice";
// import { addToast, openModal } from "../../redux/slices/uiSlice";
// import { TOAST_TYPES, ERROR_MESSAGES } from "../../utils/constants";
// import { getPageTheme } from "../../theme.config";
// import { useFormDirtyTracking } from "../../hooks/useFormDirtyTracking";
// import { useSaveAsDraft } from "../../hooks/useSaveAsDraft";
// import SaveAsDraftModal from "../../components/ui/SaveAsDraftModal";
// import TMSHeader from "../../components/layout/TMSHeader";

// // Import tab components
// import BasicInformationTab from "./components/BasicInformationTab";
// import SpecificationsTab from "./components/SpecificationsTab";
// import CapacityDetailsTab from "./components/CapacityDetailsTab";
// import OwnershipDetailsTab from "./components/OwnershipDetailsTab";
// import MaintenanceHistoryTab from "./components/MaintenanceHistoryTab";
// import ServiceFrequencyTab from "./components/ServiceFrequencyTab";
// import DocumentsTab from "./components/DocumentsTab";

// // Initial form data constant for dirty tracking
// const getInitialFormData = (userId = "ADMIN001") => ({
//   vehicleId: null,
//   basicInformation: {
//     registrationNumber: "",
//     vin: "",
//     vehicleType: "",
//     transporterId: "",
//     transporterName: "",
//     make: "",
//     model: "",
//     year: new Date().getFullYear(),
//     leasingFlag: false,
//     leasedFrom: "",
//     leaseStartDate: "",
//     leaseEndDate: "",
//     color: "",
//     mileage: 0,
//     gpsEnabled: false,
//     gpsIMEI: "",
//     gpsProvider: "",
//     currentDriver: "",
//     usageType: "",
//     vehicleRegisteredAtCountry: "",
//     vehicleRegisteredAtState: "",
//     avgRunningSpeed: "",
//     maxRunningSpeed: "",
//     taxesAndFees: "",
//   },
//   specifications: {
//     engineNumber: "",
//     fuelType: "",
//     fuelTankCapacity: 0,
//     transmission: "",
//     noOfGears: 0,
//     wheelbase: 0,
//     noOfAxles: 0,
//     emissionStandard: "",
//   },
//   capacityDetails: {
//     gvw: 0,
//     unladenWeight: 0,
//     payloadCapacity: 0,
//     loadingCapacityVolume: 0,
//     loadingCapacityUnit: "CBM",
//     cargoLength: 0,
//     cargoWidth: 0,
//     cargoHeight: 0,
//     doorType: "",
//     noOfPallets: 0,
//   },
//   ownershipDetails: [],
//   maintenanceHistory: [],
//   serviceFrequency: [],
//   documents: [],
//   status: "PENDING_APPROVAL",
//   createdBy: userId,
//   createdAt: new Date().toISOString(),
// });

// const CreateVehiclePage = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const theme = getPageTheme("general");

//   const { isCreating, isSavingDraft, error, vehicles, masterData } =
//     useSelector((state) => state.vehicle);
//   const { user } = useSelector((state) => state.auth);

//   const [activeTab, setActiveTab] = useState(0);
//   const [formData, setFormData] = useState(() =>
//     getInitialFormData(user?.userId)
//   );

//   const [validationErrors, setValidationErrors] = useState({});
//   const [tabErrors, setTabErrors] = useState({
//     0: false, // Basic Information
//     1: false, // Specifications
//     2: false, // Capacity Details
//     3: false, // Ownership Details
//     4: false, // Maintenance History
//     5: false, // Service Frequency
//     6: false, // Documents
//   });

//   const tabs = [
//     {
//       id: 0,
//       name: "Basic Information",
//       icon: Truck,
//       component: BasicInformationTab,
//     },
//     {
//       id: 1,
//       name: "Specifications",
//       icon: Gauge,
//       component: SpecificationsTab,
//     },
//     {
//       id: 2,
//       name: "Capacity Details",
//       icon: Package,
//       component: CapacityDetailsTab,
//     },
//     {
//       id: 3,
//       name: "Ownership Details",
//       icon: FileUser,
//       component: OwnershipDetailsTab,
//     },
//     {
//       id: 4,
//       name: "Maintenance History",
//       icon: Wrench,
//       component: MaintenanceHistoryTab,
//     },
//     {
//       id: 5,
//       name: "Service Frequency",
//       icon: Calendar,
//       component: ServiceFrequencyTab,
//     },
//     {
//       id: 6,
//       name: "Documents",
//       icon: FileText,
//       component: DocumentsTab,
//     },
//   ];

//   // Dirty tracking hook for unsaved changes
//   const initialFormData = getInitialFormData(user?.userId);
//   const { isDirty, currentData, setCurrentData, resetDirty } =
//     useFormDirtyTracking(initialFormData);

//   // Sync formData with dirty tracking
//   useEffect(() => {
//     setCurrentData(formData);
//   }, [formData, setCurrentData]);

//   const validateFuelTypeId = useCallback(
//     (fuelType) => {
//       try {
//         if (!fuelType) return "";

//         // If it's already a valid ID format (FT001-FT999), return as-is
//         if (/^FT\d{3}$/.test(fuelType)) {
//           return fuelType;
//         }

//         // If it's a label, map it to ID (fallback protection)
//         const fuelMapping = {
//           DIESEL: "FT001",
//           CNG: "FT002",
//           ELECTRIC: "FT003",
//           PETROL: "FT004",
//           GASOLINE: "FT004",
//         };

//         const mappedId = fuelMapping[fuelType.toUpperCase()];
//         if (mappedId) {
//           console.warn("⚠️  AUTO-CORRECTED: Converted fuel type label to ID:", {
//             label: fuelType,
//             id: mappedId,
//           });
//           dispatch(
//             addToast({
//               type: TOAST_TYPES.WARNING,
//               message: `Fuel type auto-corrected from "${fuelType}" to proper ID "${mappedId}"`,
//               duration: 3000,
//             })
//           );
//           return mappedId;
//         }

//         console.error("❌ INVALID fuel type:", fuelType);
//         dispatch(
//           addToast({
//             type: TOAST_TYPES.ERROR,
//             message: `Invalid fuel type: "${fuelType}". Please select a valid option.`,
//             duration: 5000,
//           })
//         );
//         return "";
//       } catch (error) {
//         console.error("❌ Error in fuel type validation:", error);
//         dispatch(
//           addToast({
//             type: TOAST_TYPES.ERROR,
//             message:
//               "Error validating fuel type. Please refresh and try again.",
//             duration: 5000,
//           })
//         );
//         return "";
//       }
//     },
//     [dispatch]
//   );

//   const transformFormDataForBackend = useCallback(
//     (frontendData) => {
//       try {
//         // Validate fuel type using the component-level function
//         // Helper function to format date to YYYY-MM-DD
//         const validatedFuelType = validateFuelTypeId(
//           frontendData.specifications?.fuelType
//         );
//         const formatDate = (dateStr) => {
//           if (!dateStr) return undefined;
//           if (dateStr instanceof Date)
//             return dateStr.toISOString().split("T")[0];
//           return dateStr;
//         };

//         // Helper function to convert year to YYYY-MM format
//         const convertYearToMonthYear = (year) => {
//           if (!year) return undefined;
//           return `${year}-01`; // Default to January
//         };

//         // Helper function to ensure we get the vehicle type ID, not description
//         const getVehicleTypeId = (data) => {
//           // Priority order: vehicleTypeIdSafe > vehicleTypeId > map from description > vehicleType
//           if (data.vehicleTypeIdSafe && data.vehicleTypeIdSafe.length <= 10) {
//             return data.vehicleTypeIdSafe;
//           }
//           if (data.vehicleTypeId && data.vehicleTypeId.length <= 10) {
//             return data.vehicleTypeId;
//           }
//           // If we have a description, try to map it back to ID
//           if (data.vehicleType) {
//             const descToIdMap = {
//               "HCV - Heavy Commercial Vehicle": "VT001",
//               "MCV - Medium Commercial Vehicle": "VT002",
//               "LCV - Light Commercial Vehicle": "VT003",
//               "TRAILER - Trailer": "VT004",
//               "CONTAINER - Container": "VT005",
//               "TANKER - Tanker": "VT006",
//               "REFRIGERATED - Refrigerated Vehicle": "VT007",
//               "FLATBED - Flatbed": "VT008",
//             };
//             const mappedId = descToIdMap[data.vehicleType];
//             if (mappedId) {
//               return mappedId;
//             }
//             // If it's already a short ID, use it
//             if (data.vehicleType.length <= 10) {
//               return data.vehicleType;
//             }
//           }
//           return "";
//         };

//         return {
//           basicInformation: {
//             vehicle_registration_number:
//               frontendData.basicInformation.registrationNumber || "",
//             maker_brand_description: frontendData.basicInformation.make || "",
//             maker_model: frontendData.basicInformation.model || "",
//             vin_chassis_no: frontendData.basicInformation.vin || "",
//             vehicle_type_id: getVehicleTypeId(frontendData.basicInformation),
//             vehicle_category:
//               frontendData.basicInformation.vehicleCategory || "",
//             manufacturing_month_year:
//               frontendData.basicInformation.manufacturingMonthYear ||
//               convertYearToMonthYear(frontendData.basicInformation.year),
//             vehicle_colour: frontendData.basicInformation.color || "",
//             gps_tracker_imei_number:
//               frontendData.basicInformation.gpsIMEI || "",
//             gps_tracker_active_flag:
//               frontendData.basicInformation.gpsEnabled || false,
//             gps_provider: frontendData.basicInformation.gpsProvider || "",
//             usage_type_id: frontendData.basicInformation.usageType || "UT001", // Default to Commercial Transport (UT001)
//             safety_inspection_date: formatDate(
//               frontendData.basicInformation.safetyInspectionDate
//             ),
//             taxes_and_fees: frontendData.basicInformation.taxesAndFees || 0,
//             mileage: frontendData.basicInformation.mileage || 0,
//             current_driver: frontendData.basicInformation.currentDriver || "",
//             transporter_id: frontendData.basicInformation.transporterId || "",
//             transporter_name:
//               frontendData.basicInformation.transporterName || "",
//             leasing_flag: frontendData.basicInformation.leasingFlag || false,
//             leased_from: frontendData.basicInformation.leasedFrom || "",
//             lease_start_date: formatDate(
//               frontendData.basicInformation.leaseStartDate
//             ),
//             lease_end_date: formatDate(
//               frontendData.basicInformation.leaseEndDate
//             ),
//             vehicle_registered_at_country:
//               frontendData.basicInformation.vehicleRegisteredAtCountry || "",
//             vehicle_registered_at_state:
//               frontendData.basicInformation.vehicleRegisteredAtState || "",
//             avg_running_speed:
//               frontendData.basicInformation.avgRunningSpeed || 0,
//             max_running_speed:
//               frontendData.basicInformation.maxRunningSpeed || 0,
//           },
//           specifications: {
//             engine_type_id: frontendData.specifications.engineType || "",
//             engine_number: frontendData.specifications.engineNumber || "",
//             fuel_type_id: validatedFuelType,
//             fuel_tank_capacity:
//               frontendData.specifications.fuelTankCapacity || 0,
//             transmission_type: frontendData.specifications.transmission || "",
//             financer: frontendData.specifications.financer || "",
//             suspension_type: frontendData.specifications.suspensionType || "",
//             emission_standard:
//               frontendData.specifications.emissionStandard || "",
//             wheelbase: frontendData.specifications.wheelbase || 0,
//             no_of_axles: frontendData.specifications.noOfAxles || 0,
//           },
//           capacityDetails: {
//             unloading_weight:
//               frontendData.capacityDetails.unladenWeight ||
//               frontendData.capacityDetails.unloadingWeight ||
//               0,
//             gross_vehicle_weight_kg:
//               frontendData.capacityDetails.gvw ||
//               frontendData.capacityDetails.grossVehicleWeight ||
//               0,
//             volume_capacity_cubic_meter:
//               frontendData.capacityDetails.loadingCapacityVolume ||
//               frontendData.capacityDetails.volumeCapacity ||
//               0,
//             towing_capacity: frontendData.capacityDetails.towingCapacity || 0,
//             tire_load_rating:
//               frontendData.capacityDetails.tireLoadRating || null,
//             vehicle_condition:
//               frontendData.capacityDetails.vehicleCondition || "GOOD",
//             fuel_tank_capacity:
//               frontendData.specifications.fuelTankCapacity ||
//               frontendData.capacityDetails.fuelTankCapacity ||
//               0,
//             seating_capacity: frontendData.capacityDetails.seatingCapacity || 0,
//             cargo_dimensions_length:
//               frontendData.capacityDetails.cargoLength || 0,
//             cargo_dimensions_width:
//               frontendData.capacityDetails.cargoWidth || 0,
//             cargo_dimensions_height:
//               frontendData.capacityDetails.cargoHeight || 0,
//           },
//           ownershipDetails: (() => {
//             // Handle both array and object formats
//             const ownership = Array.isArray(frontendData.ownershipDetails)
//               ? frontendData.ownershipDetails[0] || {}
//               : frontendData.ownershipDetails || {};

//             return {
//               ownershipName:
//                 ownership.ownershipName || ownership.ownerName || "",
//               registrationNumber:
//                 ownership.registrationNumber ||
//                 frontendData.basicInformation?.registrationNumber ||
//                 "",
//               registrationDate: formatDate(ownership.registrationDate),
//               registrationUpto: formatDate(ownership.registrationUpto),
//               validFrom: formatDate(ownership.validFrom),
//               validTo: formatDate(ownership.validTo),
//               purchaseDate: formatDate(ownership.purchaseDate),
//               saleAmount: ownership.saleAmount || ownership.purchasePrice || 0,
//               stateCode: ownership.stateCode || "",
//               rtoCode: ownership.rtoCode || "",
//               contactNumber: ownership.contactNumber || "",
//               email: ownership.email || "",
//             };
//           })(),
//           maintenanceHistory: (() => {
//             // Handle both array and object formats
//             const maintenance = Array.isArray(frontendData.maintenanceHistory)
//               ? frontendData.maintenanceHistory[0] || {}
//               : frontendData.maintenanceHistory || {};

//             return {
//               serviceDate:
//                 formatDate(
//                   maintenance.serviceDate || maintenance.lastServiceDate
//                 ) || new Date().toISOString().split("T")[0],
//               upcomingServiceDate:
//                 formatDate(
//                   maintenance.upcomingServiceDate || maintenance.nextServiceDue
//                 ) ||
//                 new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
//                   .toISOString()
//                   .split("T")[0],
//               typeOfService: maintenance.typeOfService || "",
//               serviceExpense:
//                 maintenance.serviceExpense ||
//                 maintenance.totalServiceExpense ||
//                 0,
//               serviceRemark:
//                 maintenance.serviceRemark || maintenance.maintenanceNotes || "",
//               lastInspectionDate: formatDate(maintenance.lastInspectionDate),
//             };
//           })(),
//           serviceFrequency: (() => {
//             // Handle both array and object formats
//             const serviceFreq = Array.isArray(frontendData.serviceFrequency)
//               ? frontendData.serviceFrequency[0] || {}
//               : frontendData.serviceFrequency || {};

//             return {
//               timePeriod: serviceFreq.timePeriod
//                 ? serviceFreq.timePeriod
//                 : serviceFreq.serviceIntervalMonths
//                 ? `${serviceFreq.serviceIntervalMonths} months`
//                 : "6 months",
//               kmDrove:
//                 serviceFreq.kmDrove || serviceFreq.serviceIntervalKM || 0,
//             };
//           })(),
//           documents: (frontendData.documents || [])
//             .map((doc) => ({
//               documentType: doc.documentType || "",
//               referenceNumber: doc.documentNumber || doc.referenceNumber || "",
//               vehicleMaintenanceId: doc.vehicleMaintenanceId || null,
//               permitCategory: doc.permitCategory || "",
//               permitCode: doc.permitCode || "",
//               documentProvider: doc.documentProvider || "",
//               coverageType: doc.coverageType || "",
//               premiumAmount: doc.premiumAmount || 0,
//               validFrom: formatDate(doc.issueDate || doc.validFrom),
//               validTo: formatDate(doc.expiryDate || doc.validTo),
//               remarks: doc.remarks || "Document uploaded",
//               // ✅ File upload data (base64 encoded from DocumentUploadModal)
//               fileName: doc.fileName || "",
//               fileType: doc.fileType || "",
//               fileData: doc.fileData || "", // Base64 encoded file string
//             }))
//             .filter((doc) => doc.documentType), // Only include documents with type
//         };
//       } catch (error) {
//         console.error("❌ Error transforming form data:", error);
//         dispatch(
//           addToast({
//             type: TOAST_TYPES.ERROR,
//             message:
//               "Error processing form data. Please check your inputs and try again.",
//             duration: 5000,
//           })
//         );
//         // Return a minimal valid structure to prevent complete failure
//         return {
//           basicInformation: {},
//           specifications: { fuel_type_id: "" },
//           capacityDetails: {},
//           ownershipDetails: {},
//           maintenanceHistory: {},
//           serviceFrequency: {},
//           documents: [],
//         };
//       }
//     },
//     [validateFuelTypeId]
//   );

//   // Save as draft hook integration - transform data before passing to hook
//   const transformedFormData = useMemo(() => {
//     if (!formData) return {};
//     return transformFormDataForBackend(formData);
//   }, [formData]);

//   const {
//     showModal: showDraftModal,
//     handleSaveDraft,
//     handleDiscard,
//     handleCancel: handleCancelDraft,
//     isLoading: isDraftLoading,
//     showSaveAsDraftModal,
//   } = useSaveAsDraft(
//     "vehicle",
//     transformedFormData, // Use transformed data instead of raw formData
//     isDirty,
//     null, // No recordId for create page
//     (data) => {
//       console.log("✅ Draft saved successfully:", data);
//       resetDirty(formData);
//       dispatch(
//         addToast({
//           type: TOAST_TYPES.SUCCESS,
//           message: "Vehicle draft saved successfully!",
//           duration: 3000,
//         })
//       );
//     },
//     (error) => {
//       console.error("❌ Error saving draft:", error);
//       dispatch(
//         addToast({
//           type: TOAST_TYPES.ERROR,
//           message: error?.message || "Failed to save draft",
//           duration: 5000,
//         })
//       );
//     }
//   );

//   // Browser navigation blocking (refresh/close)
//   useEffect(() => {
//     const handleBeforeUnload = (e) => {
//       if (isDirty) {
//         e.preventDefault();
//         e.returnValue = "";
//       }
//     };
//     window.addEventListener("beforeunload", handleBeforeUnload);
//     return () => window.removeEventListener("beforeunload", handleBeforeUnload);
//   }, [isDirty]);

//   // Clear any previous errors on mount
//   useEffect(() => {
//     dispatch(clearError());
//   }, [dispatch]);

//   // Fetch master data on mount
//   useEffect(() => {
//     dispatch(fetchMasterData());
//   }, [dispatch]);

//   const handleClear = () => {
//     if (
//       window.confirm(
//         "Are you sure you want to clear all data? This action cannot be undone."
//       )
//     ) {
//       const clearedData = getInitialFormData(user?.userId);
//       setFormData(clearedData);
//       resetDirty(clearedData);
//       setValidationErrors({});
//       setTabErrors({
//         0: false,
//         1: false,
//         2: false,
//         3: false,
//         4: false,
//         5: false,
//         6: false,
//       });
//       setActiveTab(0);
//     }
//   };

//   const validateAllTabs = () => {
//     const errors = {};
//     const errorMessages = [];

//     // Basic Information validation
//     if (!formData.basicInformation.registrationNumber?.trim()) {
//       errors.registrationNumber = "Registration number is required";
//       errorMessages.push("Registration number is required");
//     }
//     if (!formData.basicInformation.vehicleType) {
//       errors.vehicleType = "Vehicle type is required";
//       errorMessages.push("Vehicle type is required");
//     }
//     if (!formData.basicInformation.make?.trim()) {
//       errors.make = "Make is required";
//       errorMessages.push("Make is required");
//     }
//     if (!formData.basicInformation.model?.trim()) {
//       errors.model = "Model is required";
//       errorMessages.push("Model is required");
//     }
//     if (!formData.basicInformation.vin?.trim()) {
//       errors.vin = "VIN is required";
//       errorMessages.push("VIN is required");
//     } else if (formData.basicInformation.vin.length !== 17) {
//       errors.vin = "VIN must be exactly 17 characters";
//       errorMessages.push("VIN must be exactly 17 characters");
//     }
//     if (
//       !formData.basicInformation.year ||
//       formData.basicInformation.year < 1990
//     ) {
//       errors.year = "Valid year is required";
//       errorMessages.push("Valid year is required");
//     }

//     // Specifications validation
//     if (!formData.specifications.engineType) {
//       errors.engineType = "Engine type is required";
//       errorMessages.push("Engine type is required");
//     }
//     if (!formData.specifications.engineNumber?.trim()) {
//       errors.engineNumber = "Engine number is required";
//       errorMessages.push("Engine number is required");
//     }
//     if (!formData.specifications.fuelType) {
//       errors.fuelType = "Fuel type is required";
//       errorMessages.push("Fuel type is required");
//     }
//     if (!formData.specifications.transmission) {
//       errors.transmission = "Transmission type is required";
//       errorMessages.push("Transmission type is required");
//     }
//     if (!formData.specifications.suspensionType) {
//       errors.suspensionType = "Suspension type is required";
//       errorMessages.push("Suspension type is required");
//     }

//     // Capacity Details validation
//     if (!formData.capacityDetails.gvw || formData.capacityDetails.gvw <= 0) {
//       errors.gvw = "GVW is required and must be greater than 0";
//       errorMessages.push("GVW is required and must be greater than 0");
//     }
//     if (
//       !formData.capacityDetails.payloadCapacity ||
//       formData.capacityDetails.payloadCapacity <= 0
//     ) {
//       errors.payloadCapacity = "Payload capacity is required";
//       errorMessages.push("Payload capacity is required");
//     }
//     if (
//       !formData.capacityDetails.unladenWeight ||
//       formData.capacityDetails.unladenWeight <= 0
//     ) {
//       errors.unladenWeight = "Unladen weight is required";
//       errorMessages.push("Unladen weight is required");
//     }

//     // Ownership Details validation - check if array has at least one entry
//     if (!formData.ownershipDetails || formData.ownershipDetails.length === 0) {
//       errors.ownershipDetails = "At least one ownership record is required";
//       errorMessages.push("At least one ownership record is required");
//     } else {
//       // Validate each ownership record
//       formData.ownershipDetails.forEach((ownership, index) => {
//         if (!ownership.ownershipName?.trim()) {
//           errors[`ownershipDetails[${index}].ownershipName`] =
//             "Ownership name is required";
//           errorMessages.push(
//             `Ownership name is required for record ${index + 1}`
//           );
//         }
//         if (!ownership.registrationNumber?.trim()) {
//           errors[`ownershipDetails[${index}].registrationNumber`] =
//             "Registration number is required";
//           errorMessages.push(
//             `Registration number is required for record ${index + 1}`
//           );
//         }
//       });
//     }

//     // Determine which tabs have errors
//     const newTabErrors = {
//       0: !!(
//         errors.registrationNumber ||
//         errors.vehicleType ||
//         errors.make ||
//         errors.model ||
//         errors.vin ||
//         errors.year
//       ),
//       1: !!(
//         errors.engineType ||
//         errors.engineNumber ||
//         errors.fuelType ||
//         errors.transmission ||
//         errors.suspensionType
//       ),
//       2: !!(errors.gvw || errors.payloadCapacity || errors.unladenWeight),
//       3: !!(
//         errors.ownershipDetails ||
//         Object.keys(errors).some((key) => key.startsWith("ownershipDetails["))
//       ),
//       4: false, // Maintenance History - optional
//       5: false, // Service Frequency - optional
//       6: false, // Documents - will be updated if mandatory docs missing
//     };

//     // Validate mandatory documents
//     if (masterData.documentTypes && masterData.documentTypes.length > 0) {
//       const mandatoryDocTypes = masterData.documentTypes.filter(
//         (dt) => dt.isMandatory
//       );
//       const uploadedDocTypes = (formData.documents || []).map(
//         (doc) => doc.documentType
//       );

//       const missingMandatoryDocs = mandatoryDocTypes.filter(
//         (docType) => !uploadedDocTypes.includes(docType.value)
//       );

//       if (missingMandatoryDocs.length > 0) {
//         const missingDocNames = missingMandatoryDocs
//           .map((dt) => dt.label)
//           .join(", ");
//         errors.documents = `Missing mandatory documents: ${missingDocNames}`;
//         errorMessages.push(`Missing mandatory documents: ${missingDocNames}`);
//         newTabErrors[6] = true;
//       }
//     }

//     setTabErrors(newTabErrors);
//     setValidationErrors(errors);

//     // Find the first tab with errors and switch to it
//     if (Object.values(newTabErrors).some((hasError) => hasError)) {
//       const firstErrorTab = Object.keys(newTabErrors).find(
//         (tabId) => newTabErrors[tabId]
//       );
//       if (firstErrorTab !== undefined) {
//         setActiveTab(parseInt(firstErrorTab));
//       }
//     }

//     return { isValid: Object.keys(errors).length === 0, errorMessages };
//   };

//   /**
//    * Validate and convert fuel type to ensure proper ID format
//    * Returns the validated fuel type ID or shows error toast
//    */

//   /**
//    * Transform frontend formData to backend-compatible format
//    * Maps camelCase frontend fields to backend expected structure
//    */

//   const handleSubmit = async () => {
//     // Clear previous errors
//     setValidationErrors({});
//     setTabErrors({
//       0: false,
//       1: false,
//       2: false,
//       3: false,
//       4: false,
//       5: false,
//       6: false,
//     });

//     // Validate entire form
//     const { isValid, errorMessages } = validateAllTabs();

//     if (!isValid) {
//       // Get unique error messages (limit to first 5 for readability)
//       const uniqueErrors = [...new Set(errorMessages)].slice(0, 5);

//       // Show toast notification with error details
//       dispatch(
//         addToast({
//           type: TOAST_TYPES.ERROR,
//           message:
//             ERROR_MESSAGES.VALIDATION_ERROR ||
//             "Please fix validation errors before submitting",
//           details: uniqueErrors,
//           duration: 8000,
//         })
//       );

//       return;
//     }

//     try {
//       // Transform form data to backend format
//       const transformedData = transformFormDataForBackend(formData);

//       console.log("📤 Submitting vehicle data:", transformedData);

//       const result = await dispatch(createVehicle(transformedData)).unwrap();

//       console.log("✅ Vehicle created successfully:", result);

//       dispatch(
//         addToast({
//           type: TOAST_TYPES.SUCCESS,
//           message: `Vehicle ${result.vehicleId || ""} created successfully!`,
//           duration: 5000,
//         })
//       );

//       setTimeout(() => {
//         // Navigate to vehicle list or details page
//         if (result.vehicleId) {
//           navigate(`/vehicle/${result.vehicleId}`);
//         } else {
//           navigate("/vehicles");
//         }
//       }, 1500);
//     } catch (err) {
//       console.error("❌ Error creating vehicle:", err);

//       // Handle backend validation errors
//       let errorDetails = [];

//       if (err.errors && Array.isArray(err.errors)) {
//         // Backend returned validation errors array
//         errorDetails = err.errors.map((error) => {
//           if (error.field && error.message) {
//             return `${error.field}: ${error.message}`;
//           }
//           return error.message || error;
//         });
//       } else if (err.message) {
//         errorDetails = [err.message];
//       } else {
//         errorDetails = ["An unexpected error occurred"];
//       }

//       dispatch(
//         addToast({
//           type: TOAST_TYPES.ERROR,
//           message: err.message || "Failed to create vehicle",
//           details: errorDetails.slice(0, 5), // Limit to 5 errors for readability
//           duration: 8000,
//         })
//       );
//     }
//   };

//   // Back button handler with dirty check
//   const handleBackClick = () => {
//     if (isDirty) {
//       showSaveAsDraftModal("/vehicles");
//     } else {
//       navigate("/vehicles");
//     }
//   };

//   // Manual save as draft button handler
//   const handleSaveAsDraftClick = async () => {
//     if (!isDirty) {
//       dispatch(
//         addToast({
//           type: TOAST_TYPES.INFO,
//           message: "No changes to save",
//         })
//       );
//       return;
//     }

//     try {
//       // Transform frontend formData to backend format before saving draft
//       const transformedData = transformFormDataForBackend(formData);

//       const result = await dispatch(
//         saveVehicleAsDraft(transformedData)
//       ).unwrap();
//       dispatch(
//         addToast({
//           type: TOAST_TYPES.SUCCESS,
//           message: "Vehicle draft saved successfully!",
//         })
//       );
//       resetDirty(formData);

//       // Navigate to vehicle list after successful save (matching transporter pattern)
//       navigate("/vehicles");
//     } catch (error) {
//       console.error("❌ Save draft error:", error);

//       // Handle field-specific errors (GPS IMEI, Registration Number, VIN, etc.)
//       let errorMessage = error?.message || "Failed to save draft";
//       let errorDetails = [];

//       if (error.field) {
//         // Field-specific error (e.g., duplicate GPS IMEI)
//         errorDetails.push(`${error.field}: ${error.message}`);
//       } else if (error.errors && Array.isArray(error.errors)) {
//         // Multiple validation errors
//         errorDetails = error.errors.map((err) => {
//           if (typeof err === "string") return err;
//           if (err.field && err.message) return `${err.field}: ${err.message}`;
//           return err.message || err;
//         });
//       }

//       dispatch(
//         addToast({
//           type: TOAST_TYPES.ERROR,
//           message: errorMessage,
//           details: errorDetails.length > 0 ? errorDetails : undefined,
//           duration: 8000,
//         })
//       );
//     }
//   };

//   const handleBulkUpload = useCallback(() => {
//     dispatch(openModal());
//   }, [dispatch]);

//   return (
//     <div className="bg-gradient-to-br from-[#F5F7FA] via-[#F8FAFC] to-[#F1F5F9]">
//       <TMSHeader theme={theme} />

//       {/* Modern Header Bar with glassmorphism */}
//       <div className="bg-gradient-to-r from-[#0D1A33] via-[#1A2B47] to-[#0D1A33] px-6 py-4 shadow-xl relative overflow-hidden">
//         {/* Background decoration */}
//         <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-transparent to-blue-800/10"></div>
//         <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl"></div>
//         <div className="absolute -bottom-4 -left-4 w-40 h-40 bg-gradient-to-tr from-blue-400/10 to-transparent rounded-full blur-2xl"></div>

//         <div className="relative flex items-center justify-between">
//           <div className="flex items-center gap-4">
//             <button
//               onClick={handleBackClick}
//               className="group p-2 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-105 border border-white/20"
//             >
//               <ArrowLeft className="w-5 h-5 text-white group-hover:text-white transition-colors" />
//             </button>

//             <div className="space-y-1">
//               <h1 className="text-2xl font-bold text-white tracking-tight">
//                 Create New Vehicle
//               </h1>
//               <p className="text-blue-100/80 text-xs font-medium">
//                 Complete all sections to create a comprehensive vehicle profile
//               </p>
//             </div>
//           </div>

//           <div className="flex items-center gap-2">
//             <button
//               onClick={handleClear}
//               disabled={isCreating || isSavingDraft}
//               className="group inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl font-medium text-sm hover:bg-white/20 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
//             >
//               <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
//               Clear
//             </button>

//             <button
//               onClick={handleSaveAsDraftClick}
//               disabled={isCreating || isSavingDraft || !isDirty}
//               className="group inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl font-medium text-sm hover:bg-white/20 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
//             >
//               {isSavingDraft ? (
//                 <>
//                   <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                   Saving...
//                 </>
//               ) : (
//                 <>
//                   <Save className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
//                   Save as Draft
//                 </>
//               )}
//             </button>

//             <button
//               onClick={handleBulkUpload}
//               disabled={isCreating || isSavingDraft}
//               className="group inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl font-medium text-sm hover:bg-white/20 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
//             >
//               <Upload className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
//               Bulk Upload
//             </button>

//             <button
//               onClick={handleSubmit}
//               disabled={isCreating || isSavingDraft}
//               className="group inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#10B981] to-[#059669] text-white rounded-xl font-medium text-sm hover:from-[#059669] hover:to-[#10B981] transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
//             >
//               {isCreating ? (
//                 <>
//                   <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                   Creating...
//                 </>
//               ) : (
//                 <>
//                   <Save className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
//                   Submit
//                 </>
//               )}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Modern Tab Navigation with horizontally scrollable tabs (hidden scrollbar) */}
//       <div className="bg-gradient-to-r from-[#0D1A33] to-[#1A2B47] px-6 relative">
//         {/* Tab backdrop blur effect */}
//         <div className="absolute inset-0 bg-gradient-to-r from-[#0D1A33] to-[#1A2B47] backdrop-blur-sm"></div>

//         {/* Horizontally scrollable container with hidden scrollbar */}
//         <div className="relative overflow-x-auto overflow-y-hidden scrollbar-hide py-2">
//           <div className="flex space-x-2 min-w-max">
//             {tabs.map((tab) => {
//               const Icon = tab.icon;
//               const isActive = activeTab === tab.id;
//               const hasError = tabErrors[tab.id];

//               return (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActiveTab(tab.id)}
//                   className={`text-nowrap group relative px-5 py-2.5 font-medium text-xs rounded-t-xl transition-all duration-300 flex items-center gap-2 ${
//                     isActive
//                       ? "bg-gradient-to-br from-white via-white to-gray-50 text-[#0D1A33] shadow-lg transform -translate-y-1"
//                       : "bg-white/5 backdrop-blur-sm text-blue-100/80 hover:bg-white/10 hover:text-white border border-white/10 hover:border-white/20"
//                   }`}
//                 >
//                   {/* Active tab decoration */}
//                   {isActive && (
//                     <div className="absolute inset-x-0 -bottom-0 h-0.5 bg-gradient-to-r from-[#10B981] to-[#059669] rounded-t-full"></div>
//                   )}

//                   {/* Error indicator */}
//                   {hasError && (
//                     <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
//                       <AlertCircle className="w-2.5 h-2.5 text-white" />
//                     </div>
//                   )}

//                   <Icon
//                     className={`w-4 h-4 transition-all duration-300 ${
//                       isActive
//                         ? "text-[#10B981]"
//                         : hasError
//                         ? "text-red-300 group-hover:text-red-200"
//                         : "text-blue-200/70 group-hover:text-white"
//                     }`}
//                   />
//                   <span className="font-semibold">{tab.name}</span>

//                   {/* Hover glow effect */}
//                   {!isActive && (
//                     <div className="absolute inset-0 rounded-t-xl bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
//                   )}
//                 </button>
//               );
//             })}
//           </div>
//         </div>
//       </div>

//       {/* Modern Content Area */}
//       <div className="px-6 py-6">
//         {/* Enhanced Tab Content Container */}
//         <div className="relative">
//           {tabs.map((tab) => {
//             const TabComponent = tab.component;
//             const isActive = activeTab === tab.id;

//             return (
//               <div
//                 key={tab.id}
//                 className={`transition-all duration-500 ease-in-out ${
//                   isActive
//                     ? "block opacity-100 transform translate-y-0"
//                     : "hidden opacity-0 transform translate-y-4"
//                 }`}
//               >
//                 {/* Content wrapper with modern styling */}
//                 <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/40 overflow-hidden">
//                   {/* Tab content with reduced padding */}
//                   <div className="p-6">
//                     <TabComponent
//                       formData={formData}
//                       setFormData={(dataOrUpdater) => {
//                         if (typeof dataOrUpdater === "function") {
//                           const resultIfFull = dataOrUpdater(formData);
//                           const topKeys = [
//                             "basicInformation",
//                             "specifications",
//                             "capacityDetails",
//                             "ownershipDetails",
//                             "maintenanceHistory",
//                             "serviceFrequency",
//                             "documents",
//                           ];
//                           const isFullForm =
//                             resultIfFull &&
//                             typeof resultIfFull === "object" &&
//                             Object.keys(resultIfFull).some((k) =>
//                               topKeys.includes(k)
//                             );
//                           if (isFullForm) {
//                             setFormData(resultIfFull);
//                           } else {
//                             // assume updater wants to update the whole form (fallback)
//                             setFormData(resultIfFull);
//                           }
//                         } else {
//                           setFormData(dataOrUpdater);
//                         }
//                       }}
//                       errors={validationErrors}
//                       masterData={masterData}
//                     />
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {/* Save as Draft Modal */}
//       <SaveAsDraftModal
//         isOpen={showDraftModal}
//         onSaveDraft={handleSaveDraft}
//         onDiscard={handleDiscard}
//         onCancel={handleCancelDraft}
//         isLoading={isDraftLoading || isSavingDraft}
//         isUpdate={false}
//       />
//     </div>
//   );
// };

// export default CreateVehiclePage;


﻿import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  Save,
  Upload,
  AlertCircle,
  Truck,
  Gauge,
  Package,
  FileUser,
  Wrench,
  Calendar,
  FileText,
} from "lucide-react";

import {
  createVehicle,
  clearError,
  fetchMasterData,
  saveVehicleAsDraft,
  updateVehicleDraft,
} from "../../redux/slices/vehicleSlice";
import { addToast, openModal } from "../../redux/slices/uiSlice";
import { TOAST_TYPES, ERROR_MESSAGES } from "../../utils/constants";
import { getPageTheme } from "../../theme.config";
import { useFormDirtyTracking } from "../../hooks/useFormDirtyTracking";
import { useSaveAsDraft } from "../../hooks/useSaveAsDraft";
import SaveAsDraftModal from "../../components/ui/SaveAsDraftModal";
import TMSHeader from "../../components/layout/TMSHeader";

// Import tab components
import BasicInformationTab from "./components/BasicInformationTab";
import SpecificationsTab from "./components/SpecificationsTab";
import CapacityDetailsTab from "./components/CapacityDetailsTab";
import OwnershipDetailsTab from "./components/OwnershipDetailsTab";
import MaintenanceHistoryTab from "./components/MaintenanceHistoryTab";
import ServiceFrequencyTab from "./components/ServiceFrequencyTab";
import DocumentsTab from "./components/DocumentsTab";

// Initial form data constant for dirty tracking
const getInitialFormData = (userId = "ADMIN001") => ({
  vehicleId: null,
  basicInformation: {
    registrationNumber: "",
    vin: "",
    vehicleType: "",
    transporterId: "",
    transporterName: "",
    make: "",
    model: "",
    year: new Date().getFullYear(),
    leasingFlag: false,
    leasedFrom: "",
    leaseStartDate: "",
    leaseEndDate: "",
    color: "",
    mileage: 0,
    gpsEnabled: false,
    gpsIMEI: "",
    gpsProvider: "",
    currentDriver: "",
    usageType: "",
    vehicleRegisteredAtCountry: "",
    vehicleRegisteredAtState: "",
    avgRunningSpeed: "",
    maxRunningSpeed: "",
    taxesAndFees: "",
  },
  specifications: {
    engineNumber: "",
    fuelType: "",
    fuelTankCapacity: 0,
    transmission: "",
    noOfGears: 0,
    wheelbase: 0,
    noOfAxles: 0,
    emissionStandard: "",
  },
  capacityDetails: {
    gvw: 0,
    unladenWeight: 0,
    payloadCapacity: 0,
    loadingCapacityVolume: 0,
    loadingCapacityUnit: "CBM",
    cargoLength: 0,
    cargoWidth: 0,
    cargoHeight: 0,
    doorType: "",
    noOfPallets: 0,
  },
  ownershipDetails: [],
  maintenanceHistory: [],
  serviceFrequency: [],
  documents: [],
  status: "PENDING_APPROVAL",
  createdBy: userId,
  createdAt: new Date().toISOString(),
});

const CreateVehiclePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = getPageTheme("general");

  const { isCreating, isSavingDraft, error, vehicles, masterData } =
    useSelector((state) => state.vehicle);
  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState(() =>
    getInitialFormData(user?.userId)
  );

  const [validationErrors, setValidationErrors] = useState({});
  const [tabErrors, setTabErrors] = useState({
    0: false, // Basic Information
    1: false, // Specifications
    2: false, // Capacity Details
    3: false, // Ownership Details
    4: false, // Maintenance History
    5: false, // Service Frequency
    6: false, // Documents
  });

  const tabs = [
    {
      id: 0,
      name: "Basic Information",
      icon: Truck,
      component: BasicInformationTab,
    },
    {
      id: 1,
      name: "Specifications",
      icon: Gauge,
      component: SpecificationsTab,
    },
    {
      id: 2,
      name: "Capacity Details",
      icon: Package,
      component: CapacityDetailsTab,
    },
    {
      id: 3,
      name: "Ownership Details",
      icon: FileUser,
      component: OwnershipDetailsTab,
    },
    {
      id: 4,
      name: "Maintenance History",
      icon: Wrench,
      component: MaintenanceHistoryTab,
    },
    {
      id: 5,
      name: "Service Frequency",
      icon: Calendar,
      component: ServiceFrequencyTab,
    },
    {
      id: 6,
      name: "Documents",
      icon: FileText,
      component: DocumentsTab,
    },
  ];

  // Dirty tracking hook for unsaved changes
  const initialFormData = getInitialFormData(user?.userId);
  const { isDirty, currentData, setCurrentData, resetDirty } =
    useFormDirtyTracking(initialFormData);

  // Sync formData with dirty tracking
  useEffect(() => {
    setCurrentData(formData);
  }, [formData, setCurrentData]);

  const validateFuelTypeId = useCallback(
    (fuelType) => {
      try {
        if (!fuelType) return "";

        // If it's already a valid ID format (FT001-FT999), return as-is
        if (/^FT\d{3}$/.test(fuelType)) {
          return fuelType;
        }

        // If it's a label, map it to ID (fallback protection)
        const fuelMapping = {
          DIESEL: "FT001",
          CNG: "FT002",
          ELECTRIC: "FT003",
          PETROL: "FT004",
          GASOLINE: "FT004",
        };

        const mappedId = fuelMapping[fuelType.toUpperCase()];
        if (mappedId) {
          console.warn("⚠️  AUTO-CORRECTED: Converted fuel type label to ID:", {
            label: fuelType,
            id: mappedId,
          });
          dispatch(
            addToast({
              type: TOAST_TYPES.WARNING,
              message: `Fuel type auto-corrected from "${fuelType}" to proper ID "${mappedId}"`,
              duration: 3000,
            })
          );
          return mappedId;
        }

        console.error("❌ INVALID fuel type:", fuelType);
        dispatch(
          addToast({
            type: TOAST_TYPES.ERROR,
            message: `Invalid fuel type: "${fuelType}". Please select a valid option.`,
            duration: 5000,
          })
        );
        return "";
      } catch (error) {
        console.error("❌ Error in fuel type validation:", error);
        dispatch(
          addToast({
            type: TOAST_TYPES.ERROR,
            message:
              "Error validating fuel type. Please refresh and try again.",
            duration: 5000,
          })
        );
        return "";
      }
    },
    [dispatch]
  );

  const transformFormDataForBackend = useCallback(
    (frontendData) => {
      try {
        // Validate fuel type using the component-level function
        // Helper function to format date to YYYY-MM-DD
        const validatedFuelType = validateFuelTypeId(
          frontendData.specifications?.fuelType
        );
        const formatDate = (dateStr) => {
          if (!dateStr) return undefined;
          if (dateStr instanceof Date)
            return dateStr.toISOString().split("T")[0];
          return dateStr;
        };

        // Helper function to convert year to YYYY-MM format
        const convertYearToMonthYear = (year) => {
          if (!year) return undefined;
          return `${year}-01`; // Default to January
        };

        // Helper function to ensure we get the vehicle type ID, not description
        const getVehicleTypeId = (data) => {
          // Priority order: vehicleTypeIdSafe > vehicleTypeId > map from description > vehicleType
          if (data.vehicleTypeIdSafe && data.vehicleTypeIdSafe.length <= 10) {
            return data.vehicleTypeIdSafe;
          }
          if (data.vehicleTypeId && data.vehicleTypeId.length <= 10) {
            return data.vehicleTypeId;
          }
          // If we have a description, try to map it back to ID
          if (data.vehicleType) {
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
            const mappedId = descToIdMap[data.vehicleType];
            if (mappedId) {
              return mappedId;
            }
            // If it's already a short ID, use it
            if (data.vehicleType.length <= 10) {
              return data.vehicleType;
            }
          }
          return "";
        };

        return {
          basicInformation: {
            vehicle_registration_number:
              frontendData.basicInformation.registrationNumber || "",
            maker_brand_description: frontendData.basicInformation.make || "",
            maker_model: frontendData.basicInformation.model || "",
            vin_chassis_no: frontendData.basicInformation.vin || "",
            vehicle_type_id: getVehicleTypeId(frontendData.basicInformation),
            vehicle_category:
              frontendData.basicInformation.vehicleCategory || "",
            manufacturing_month_year:
              frontendData.basicInformation.manufacturingMonthYear ||
              convertYearToMonthYear(frontendData.basicInformation.year),
            vehicle_colour: frontendData.basicInformation.color || "",
            gps_tracker_imei_number:
              frontendData.basicInformation.gpsIMEI || "",
            gps_tracker_active_flag:
              frontendData.basicInformation.gpsEnabled || false,
            gps_provider: frontendData.basicInformation.gpsProvider || "",
            usage_type_id: frontendData.basicInformation.usageType || "UT001", // Default to Commercial Transport (UT001)
            safety_inspection_date: formatDate(
              frontendData.basicInformation.safetyInspectionDate
            ),
            taxes_and_fees: frontendData.basicInformation.taxesAndFees || 0,
            mileage: frontendData.basicInformation.mileage || 0,
            current_driver: frontendData.basicInformation.currentDriver || "",
            transporter_id: frontendData.basicInformation.transporterId || "",
            transporter_name:
              frontendData.basicInformation.transporterName || "",
            leasing_flag: frontendData.basicInformation.leasingFlag || false,
            leased_from: frontendData.basicInformation.leasedFrom || "",
            lease_start_date: formatDate(
              frontendData.basicInformation.leaseStartDate
            ),
            lease_end_date: formatDate(
              frontendData.basicInformation.leaseEndDate
            ),
            vehicle_registered_at_country:
              frontendData.basicInformation.vehicleRegisteredAtCountry || "",
            vehicle_registered_at_state:
              frontendData.basicInformation.vehicleRegisteredAtState || "",
            avg_running_speed:
              frontendData.basicInformation.avgRunningSpeed || 0,
            max_running_speed:
              frontendData.basicInformation.maxRunningSpeed || 0,
          },
          specifications: {
            engine_type_id: frontendData.specifications.engineType || "",
            engine_number: frontendData.specifications.engineNumber || "",
            fuel_type_id: validatedFuelType,
            fuel_tank_capacity:
              frontendData.specifications.fuelTankCapacity || 0,
            transmission_type: frontendData.specifications.transmission || "",
            financer: frontendData.specifications.financer || "",
            suspension_type: frontendData.specifications.suspensionType || "",
            emission_standard:
              frontendData.specifications.emissionStandard || "",
            wheelbase: frontendData.specifications.wheelbase || 0,
            no_of_axles: frontendData.specifications.noOfAxles || 0,
          },
          capacityDetails: {
            unloading_weight:
              frontendData.capacityDetails.unladenWeight ||
              frontendData.capacityDetails.unloadingWeight ||
              0,
            gross_vehicle_weight_kg:
              frontendData.capacityDetails.gvw ||
              frontendData.capacityDetails.grossVehicleWeight ||
              0,
            volume_capacity_cubic_meter:
              frontendData.capacityDetails.loadingCapacityVolume ||
              frontendData.capacityDetails.volumeCapacity ||
              0,
            towing_capacity: frontendData.capacityDetails.towingCapacity || 0,
            tire_load_rating:
              frontendData.capacityDetails.tireLoadRating || null,
            vehicle_condition:
              frontendData.capacityDetails.vehicleCondition || "GOOD",
            fuel_tank_capacity:
              frontendData.specifications.fuelTankCapacity ||
              frontendData.capacityDetails.fuelTankCapacity ||
              0,
            seating_capacity: frontendData.capacityDetails.seatingCapacity || 0,
            cargo_dimensions_length:
              frontendData.capacityDetails.cargoLength || 0,
            cargo_dimensions_width:
              frontendData.capacityDetails.cargoWidth || 0,
            cargo_dimensions_height:
              frontendData.capacityDetails.cargoHeight || 0,
          },
          ownershipDetails: (() => {
            // Handle both array and object formats
            const ownership = Array.isArray(frontendData.ownershipDetails)
              ? frontendData.ownershipDetails[0] || {}
              : frontendData.ownershipDetails || {};

            return {
              ownershipName:
                ownership.ownershipName || ownership.ownerName || "",
              registrationNumber:
                ownership.registrationNumber ||
                frontendData.basicInformation?.registrationNumber ||
                "",
              registrationDate: formatDate(ownership.registrationDate),
              registrationUpto: formatDate(ownership.registrationUpto),
              validFrom: formatDate(ownership.validFrom),
              validTo: formatDate(ownership.validTo),
              purchaseDate: formatDate(ownership.purchaseDate),
              saleAmount: ownership.saleAmount || ownership.purchasePrice || 0,
              stateCode: ownership.stateCode || "",
              rtoCode: ownership.rtoCode || "",
              contactNumber: ownership.contactNumber || "",
              email: ownership.email || "",
            };
          })(),
          maintenanceHistory: (() => {
            // Handle both array and object formats
            const maintenance = Array.isArray(frontendData.maintenanceHistory)
              ? frontendData.maintenanceHistory[0] || {}
              : frontendData.maintenanceHistory || {};

            return {
              serviceDate:
                formatDate(
                  maintenance.serviceDate || maintenance.lastServiceDate
                ) || new Date().toISOString().split("T")[0],
              upcomingServiceDate:
                formatDate(
                  maintenance.upcomingServiceDate || maintenance.nextServiceDue
                ) ||
                new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split("T")[0],
              typeOfService: maintenance.typeOfService || "",
              serviceExpense:
                maintenance.serviceExpense ||
                maintenance.totalServiceExpense ||
                0,
              serviceRemark:
                maintenance.serviceRemark || maintenance.maintenanceNotes || "",
              lastInspectionDate: formatDate(maintenance.lastInspectionDate),
            };
          })(),
          serviceFrequency: (() => {
            // Handle both array and object formats
            const serviceFreq = Array.isArray(frontendData.serviceFrequency)
              ? frontendData.serviceFrequency[0] || {}
              : frontendData.serviceFrequency || {};

            return {
              timePeriod: serviceFreq.timePeriod
                ? serviceFreq.timePeriod
                : serviceFreq.serviceIntervalMonths
                ? `${serviceFreq.serviceIntervalMonths} months`
                : "6 months",
              kmDrove:
                serviceFreq.kmDrove || serviceFreq.serviceIntervalKM || 0,
            };
          })(),
          documents: (frontendData.documents || [])
            .map((doc) => ({
              documentType: doc.documentType || "",
              referenceNumber: doc.documentNumber || doc.referenceNumber || "",
              vehicleMaintenanceId: doc.vehicleMaintenanceId || null,
              permitCategory: doc.permitCategory || "",
              permitCode: doc.permitCode || "",
              documentProvider: doc.documentProvider || "",
              coverageType: doc.coverageType || "",
              premiumAmount: doc.premiumAmount || 0,
              validFrom: formatDate(doc.issueDate || doc.validFrom),
              validTo: formatDate(doc.expiryDate || doc.validTo),
              remarks: doc.remarks || "Document uploaded",
              // ✅ File upload data (base64 encoded from DocumentUploadModal)
              fileName: doc.fileName || "",
              fileType: doc.fileType || "",
              fileData: doc.fileData || "", // Base64 encoded file string
            }))
            .filter((doc) => doc.documentType), // Only include documents with type
        };
      } catch (error) {
        console.error("❌ Error transforming form data:", error);
        dispatch(
          addToast({
            type: TOAST_TYPES.ERROR,
            message:
              "Error processing form data. Please check your inputs and try again.",
            duration: 5000,
          })
        );
        // Return a minimal valid structure to prevent complete failure
        return {
          basicInformation: {},
          specifications: { fuel_type_id: "" },
          capacityDetails: {},
          ownershipDetails: {},
          maintenanceHistory: {},
          serviceFrequency: {},
          documents: [],
        };
      }
    },
    [validateFuelTypeId]
  );

  // Save as draft hook integration - transform data before passing to hook
  const transformedFormData = useMemo(() => {
    if (!formData) return {};
    return transformFormDataForBackend(formData);
  }, [formData]);

  const {
    showModal: showDraftModal,
    handleSaveDraft,
    handleDiscard,
    handleCancel: handleCancelDraft,
    isLoading: isDraftLoading,
    showSaveAsDraftModal,
  } = useSaveAsDraft(
    "vehicle",
    transformedFormData, // Use transformed data instead of raw formData
    isDirty,
    null, // No recordId for create page
    (data) => {
      console.log("✅ Draft saved successfully:", data);
      resetDirty(formData);
      dispatch(
        addToast({
          type: TOAST_TYPES.SUCCESS,
          message: "Vehicle draft saved successfully!",
          duration: 3000,
        })
      );
    },
    (error) => {
      console.error("❌ Error saving draft:", error);
      dispatch(
        addToast({
          type: TOAST_TYPES.ERROR,
          message: error?.message || "Failed to save draft",
          duration: 5000,
        })
      );
    }
  );

  // Browser navigation blocking (refresh/close)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Clear any previous errors on mount
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Fetch master data on mount
  useEffect(() => {
    dispatch(fetchMasterData());
  }, [dispatch]);

  const handleClear = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all data? This action cannot be undone."
      )
    ) {
      const clearedData = getInitialFormData(user?.userId);
      setFormData(clearedData);
      resetDirty(clearedData);
      setValidationErrors({});
      setTabErrors({
        0: false,
        1: false,
        2: false,
        3: false,
        4: false,
        5: false,
        6: false,
      });
      setActiveTab(0);
    }
  };

  const validateAllTabs = () => {
    const errors = {};
    const errorMessages = [];

    // Basic Information validation
    if (!formData.basicInformation.registrationNumber?.trim()) {
      errors.registrationNumber = "Registration number is required";
      errorMessages.push("Registration number is required");
    }
    if (!formData.basicInformation.vehicleType) {
      errors.vehicleType = "Vehicle type is required";
      errorMessages.push("Vehicle type is required");
    }
    if (!formData.basicInformation.make?.trim()) {
      errors.make = "Make is required";
      errorMessages.push("Make is required");
    }
    if (!formData.basicInformation.model?.trim()) {
      errors.model = "Model is required";
      errorMessages.push("Model is required");
    }
    if (!formData.basicInformation.vin?.trim()) {
      errors.vin = "VIN is required";
      errorMessages.push("VIN is required");
    } else if (formData.basicInformation.vin.length !== 17) {
      errors.vin = "VIN must be exactly 17 characters";
      errorMessages.push("VIN must be exactly 17 characters");
    }
    if (
      !formData.basicInformation.year ||
      formData.basicInformation.year < 1990
    ) {
      errors.year = "Valid year is required";
      errorMessages.push("Valid year is required");
    }

    // Specifications validation
    if (!formData.specifications.engineType) {
      errors.engineType = "Engine type is required";
      errorMessages.push("Engine type is required");
    }
    if (!formData.specifications.engineNumber?.trim()) {
      errors.engineNumber = "Engine number is required";
      errorMessages.push("Engine number is required");
    }
    if (!formData.specifications.fuelType) {
      errors.fuelType = "Fuel type is required";
      errorMessages.push("Fuel type is required");
    }
    if (!formData.specifications.transmission) {
      errors.transmission = "Transmission type is required";
      errorMessages.push("Transmission type is required");
    }
    if (!formData.specifications.suspensionType) {
      errors.suspensionType = "Suspension type is required";
      errorMessages.push("Suspension type is required");
    }

    // Capacity Details validation
    if (!formData.capacityDetails.gvw || formData.capacityDetails.gvw <= 0) {
      errors.gvw = "GVW is required and must be greater than 0";
      errorMessages.push("GVW is required and must be greater than 0");
    }
    if (
      !formData.capacityDetails.payloadCapacity ||
      formData.capacityDetails.payloadCapacity <= 0
    ) {
      errors.payloadCapacity = "Payload capacity is required";
      errorMessages.push("Payload capacity is required");
    }
    if (
      !formData.capacityDetails.unladenWeight ||
      formData.capacityDetails.unladenWeight <= 0
    ) {
      errors.unladenWeight = "Unladen weight is required";
      errorMessages.push("Unladen weight is required");
    }

    // Ownership Details validation - check if array has at least one entry
    if (!formData.ownershipDetails || formData.ownershipDetails.length === 0) {
      errors.ownershipDetails = "At least one ownership record is required";
      errorMessages.push("At least one ownership record is required");
    } else {
      // Validate each ownership record
      formData.ownershipDetails.forEach((ownership, index) => {
        if (!ownership.ownershipName?.trim()) {
          errors[`ownershipDetails[${index}].ownershipName`] =
            "Ownership name is required";
          errorMessages.push(
            `Ownership name is required for record ${index + 1}`
          );
        }
        if (!ownership.registrationNumber?.trim()) {
          errors[`ownershipDetails[${index}].registrationNumber`] =
            "Registration number is required";
          errorMessages.push(
            `Registration number is required for record ${index + 1}`
          );
        }
      });
    }

    // Determine which tabs have errors
    const newTabErrors = {
      0: !!(
        errors.registrationNumber ||
        errors.vehicleType ||
        errors.make ||
        errors.model ||
        errors.vin ||
        errors.year
      ),
      1: !!(
        errors.engineType ||
        errors.engineNumber ||
        errors.fuelType ||
        errors.transmission ||
        errors.suspensionType
      ),
      2: !!(errors.gvw || errors.payloadCapacity || errors.unladenWeight),
      3: !!(
        errors.ownershipDetails ||
        Object.keys(errors).some((key) => key.startsWith("ownershipDetails["))
      ),
      4: false, // Maintenance History - optional
      5: false, // Service Frequency - optional
      6: false, // Documents - will be updated if mandatory docs missing
    };

    // Validate mandatory documents
    if (masterData.documentTypes && masterData.documentTypes.length > 0) {
      const mandatoryDocTypes = masterData.documentTypes.filter(
        (dt) => dt.isMandatory
      );
      const uploadedDocTypes = (formData.documents || []).map(
        (doc) => doc.documentType
      );

      const missingMandatoryDocs = mandatoryDocTypes.filter(
        (docType) => !uploadedDocTypes.includes(docType.value)
      );

      if (missingMandatoryDocs.length > 0) {
        const missingDocNames = missingMandatoryDocs
          .map((dt) => dt.label)
          .join(", ");
        errors.documents = `Missing mandatory documents: ${missingDocNames}`;
        errorMessages.push(`Missing mandatory documents: ${missingDocNames}`);
        newTabErrors[6] = true;
      }
    }

    setTabErrors(newTabErrors);
    setValidationErrors(errors);

    // Find the first tab with errors and switch to it
    if (Object.values(newTabErrors).some((hasError) => hasError)) {
      const firstErrorTab = Object.keys(newTabErrors).find(
        (tabId) => newTabErrors[tabId]
      );
      if (firstErrorTab !== undefined) {
        setActiveTab(parseInt(firstErrorTab));
      }
    }

    return { isValid: Object.keys(errors).length === 0, errorMessages };
  };

  /**
   * Validate and convert fuel type to ensure proper ID format
   * Returns the validated fuel type ID or shows error toast
   */

  /**
   * Transform frontend formData to backend-compatible format
   * Maps camelCase frontend fields to backend expected structure
   */

  const handleSubmit = async () => {
    // Clear previous errors
    setValidationErrors({});
    setTabErrors({
      0: false,
      1: false,
      2: false,
      3: false,
      4: false,
      5: false,
      6: false,
    });

    // Validate entire form
    const { isValid, errorMessages } = validateAllTabs();

    if (!isValid) {
      // Get unique error messages (limit to first 5 for readability)
      const uniqueErrors = [...new Set(errorMessages)].slice(0, 5);

      // Show toast notification with error details
      dispatch(
        addToast({
          type: TOAST_TYPES.ERROR,
          message:
            ERROR_MESSAGES.VALIDATION_ERROR ||
            "Please fix validation errors before submitting",
          details: uniqueErrors,
          duration: 8000,
        })
      );

      return;
    }

    try {
      // Transform form data to backend format
      const transformedData = transformFormDataForBackend(formData);

      console.log("📤 Submitting vehicle data:", transformedData);

      const result = await dispatch(createVehicle(transformedData)).unwrap();

      console.log("✅ Vehicle created successfully:", result);

      dispatch(
        addToast({
          type: TOAST_TYPES.SUCCESS,
          message: `Vehicle ${result.vehicleId || ""} created successfully!`,
          duration: 5000,
        })
      );

      setTimeout(() => {
        // Navigate to vehicle list or details page
        if (result.vehicleId) {
          navigate(`/vehicle/${result.vehicleId}`);
        } else {
          navigate("/vehicles");
        }
      }, 1500);
    } catch (err) {
      console.error("❌ Error creating vehicle:", err);

      // Handle backend validation errors
      let errorDetails = [];

      if (err.errors && Array.isArray(err.errors)) {
        // Backend returned validation errors array
        errorDetails = err.errors.map((error) => {
          if (error.field && error.message) {
            return `${error.field}: ${error.message}`;
          }
          return error.message || error;
        });
      } else if (err.message) {
        errorDetails = [err.message];
      } else {
        errorDetails = ["An unexpected error occurred"];
      }

      dispatch(
        addToast({
          type: TOAST_TYPES.ERROR,
          message: err.message || "Failed to create vehicle",
          details: errorDetails.slice(0, 5), // Limit to 5 errors for readability
          duration: 8000,
        })
      );
    }
  };

  // Back button handler with dirty check
  const handleBackClick = () => {
    if (isDirty) {
      showSaveAsDraftModal("/vehicles");
    } else {
      navigate("/vehicles");
    }
  };

  // Manual save as draft button handler
  const handleSaveAsDraftClick = async () => {
    if (!isDirty) {
      dispatch(
        addToast({
          type: TOAST_TYPES.INFO,
          message: "No changes to save",
        })
      );
      return;
    }

    try {
      // Transform frontend formData to backend format before saving draft
      const transformedData = transformFormDataForBackend(formData);

      const result = await dispatch(
        saveVehicleAsDraft(transformedData)
      ).unwrap();
      dispatch(
        addToast({
          type: TOAST_TYPES.SUCCESS,
          message: "Vehicle draft saved successfully!",
        })
      );
      resetDirty(formData);

      // Navigate to vehicle list after successful save (matching transporter pattern)
      navigate("/vehicles");
    } catch (error) {
      dispatch(
        addToast({
          type: TOAST_TYPES.ERROR,
          message: error?.message || "Failed to save draft",
        })
      );
    }
  };

  const handleBulkUpload = useCallback(() => {
    dispatch(openModal());
  }, [dispatch]);

  return (
    <div className="bg-gradient-to-br from-[#F5F7FA] via-[#F8FAFC] to-[#F1F5F9]">
      <TMSHeader theme={theme} />

      {/* Modern Header Bar with glassmorphism */}
      <div className="bg-gradient-to-r from-[#0D1A33] via-[#1A2B47] to-[#0D1A33] px-6 py-4 shadow-xl relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-transparent to-blue-800/10"></div>
        <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl"></div>
        <div className="absolute -bottom-4 -left-4 w-40 h-40 bg-gradient-to-tr from-blue-400/10 to-transparent rounded-full blur-2xl"></div>

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackClick}
              className="group p-2 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-105 border border-white/20"
            >
              <ArrowLeft className="w-5 h-5 text-white group-hover:text-white transition-colors" />
            </button>

            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Create New Vehicle
              </h1>
              <p className="text-blue-100/80 text-xs font-medium">
                Complete all sections to create a comprehensive vehicle profile
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClear}
              disabled={isCreating || isSavingDraft}
              className="group inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl font-medium text-sm hover:bg-white/20 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              Clear
            </button>

            <button
              onClick={handleSaveAsDraftClick}
              disabled={isCreating || isSavingDraft || !isDirty}
              className="group inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl font-medium text-sm hover:bg-white/20 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSavingDraft ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                  Save as Draft
                </>
              )}
            </button>

            <button
              onClick={handleBulkUpload}
              disabled={isCreating || isSavingDraft}
              className="group inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl font-medium text-sm hover:bg-white/20 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Upload className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
              Bulk Upload
            </button>

            <button
              onClick={handleSubmit}
              disabled={isCreating || isSavingDraft}
              className="group inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#10B981] to-[#059669] text-white rounded-xl font-medium text-sm hover:from-[#059669] hover:to-[#10B981] transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                  Submit
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modern Tab Navigation with horizontally scrollable tabs (hidden scrollbar) */}
      <div className="bg-gradient-to-r from-[#0D1A33] to-[#1A2B47] px-6 relative">
        {/* Tab backdrop blur effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D1A33] to-[#1A2B47] backdrop-blur-sm"></div>

        {/* Horizontally scrollable container with hidden scrollbar */}
        <div className="relative overflow-x-auto overflow-y-hidden scrollbar-hide py-2">
          <div className="flex space-x-2 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const hasError = tabErrors[tab.id];

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-nowrap group relative px-5 py-2.5 font-medium text-xs rounded-t-xl transition-all duration-300 flex items-center gap-2 ${
                    isActive
                      ? "bg-gradient-to-br from-white via-white to-gray-50 text-[#0D1A33] shadow-lg transform -translate-y-1"
                      : "bg-white/5 backdrop-blur-sm text-blue-100/80 hover:bg-white/10 hover:text-white border border-white/10 hover:border-white/20"
                  }`}
                >
                  {/* Active tab decoration */}
                  {isActive && (
                    <div className="absolute inset-x-0 -bottom-0 h-0.5 bg-gradient-to-r from-[#10B981] to-[#059669] rounded-t-full"></div>
                  )}

                  {/* Error indicator */}
                  {hasError && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                      <AlertCircle className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}

                  <Icon
                    className={`w-4 h-4 transition-all duration-300 ${
                      isActive
                        ? "text-[#10B981]"
                        : hasError
                        ? "text-red-300 group-hover:text-red-200"
                        : "text-blue-200/70 group-hover:text-white"
                    }`}
                  />
                  <span className="font-semibold">{tab.name}</span>

                  {/* Hover glow effect */}
                  {!isActive && (
                    <div className="absolute inset-0 rounded-t-xl bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modern Content Area */}
      <div className="px-6 py-6">
        {/* Enhanced Tab Content Container */}
        <div className="relative">
          {tabs.map((tab) => {
            const TabComponent = tab.component;
            const isActive = activeTab === tab.id;

            return (
              <div
                key={tab.id}
                className={`transition-all duration-500 ease-in-out ${
                  isActive
                    ? "block opacity-100 transform translate-y-0"
                    : "hidden opacity-0 transform translate-y-4"
                }`}
              >
                {/* Content wrapper with modern styling */}
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/40 overflow-hidden">
                  {/* Tab content with reduced padding */}
                  <div className="p-6">
                    <TabComponent
                      formData={formData}
                      setFormData={(dataOrUpdater) => {
                        if (typeof dataOrUpdater === "function") {
                          const resultIfFull = dataOrUpdater(formData);
                          const topKeys = [
                            "basicInformation",
                            "specifications",
                            "capacityDetails",
                            "ownershipDetails",
                            "maintenanceHistory",
                            "serviceFrequency",
                            "documents",
                          ];
                          const isFullForm =
                            resultIfFull &&
                            typeof resultIfFull === "object" &&
                            Object.keys(resultIfFull).some((k) =>
                              topKeys.includes(k)
                            );
                          if (isFullForm) {
                            setFormData(resultIfFull);
                          } else {
                            // assume updater wants to update the whole form (fallback)
                            setFormData(resultIfFull);
                          }
                        } else {
                          setFormData(dataOrUpdater);
                        }
                      }}
                      errors={validationErrors}
                      masterData={masterData}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save as Draft Modal */}
      <SaveAsDraftModal
        isOpen={showDraftModal}
        onSaveDraft={handleSaveDraft}
        onDiscard={handleDiscard}
        onCancel={handleCancelDraft}
        isLoading={isDraftLoading || isSavingDraft}
        isUpdate={false}
      />
    </div>
  );
};

export default CreateVehiclePage; 