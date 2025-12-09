import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchVehicleById,
  updateVehicle,
  fetchMasterData,
  updateVehicleDraft,
  submitVehicleFromDraft,
  deleteVehicleDraft,
  transformVehicleDetails,
} from "../../redux/slices/vehicleSlice";
import { showToast } from "../../redux/slices/uiSlice";
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  Truck,
  Settings,
  Package,
  Building,
  Wrench,
  FileText,
  BarChart3,
  AlertTriangle,
  Eye,
} from "lucide-react";
// theme helpers are available via getPageTheme
import { getPageTheme } from "../../theme.config";
import TMSHeader from "../../components/layout/TMSHeader";
import VehicleStatusPill from "../../components/vehicle/VehicleStatusPill";
import { CustomSelect } from "../../components/ui/Select";

// Import view tab components
import BasicInformationViewTab from "./components/BasicInformationViewTab";
import SpecificationsViewTab from "./components/SpecificationsViewTab";
import CapacityDetailsViewTab from "./components/CapacityDetailsViewTab";
import OwnershipDetailsViewTab from "./components/OwnershipDetailsViewTab";
import MaintenanceViewTab from "./components/MaintenanceViewTab";
import DocumentsViewTab from "./components/DocumentsViewTab";
import PerformanceDashboardViewTab from "./components/PerformanceDashboardViewTab";

// Import edit tab components
import BasicInformationTab from "./components/BasicInformationTab";
import SpecificationsTab from "./components/SpecificationsTab";
import CapacityDetailsTab from "./components/CapacityDetailsTab";
import OwnershipDetailsTab from "./components/OwnershipDetailsTab";
import MaintenanceHistoryTab from "./components/MaintenanceHistoryTab";
import ServiceFrequencyTab from "./components/ServiceFrequencyTab";
import DocumentsTab from "./components/DocumentsTab";

// Import approval component
import ApprovalActionBar from "../../components/approval/ApprovalActionBar";

// Import SubmitDraftModal for draft workflow
import SubmitDraftModal from "../../components/ui/SubmitDraftModal";

const VehicleDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const {
    currentVehicle,
    isFetching,
    isUpdating,
    isUpdatingDraft,
    isSubmittingDraft,
    isDeletingDraft,
    error,
    masterData,
  } = useSelector((state) => state.vehicle);

  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    basicInformation: {},
    specifications: {},
    capacityDetails: {},
    ownershipDetails: {},
    maintenanceHistory: {},
    serviceFrequency: {},
    documents: [],
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dataRefreshKey, setDataRefreshKey] = useState(0);

  // page theme helpers
  const theme = getPageTheme("tab");

  const tabs = [
    {
      id: 0,
      name: "Basic Information",
      icon: Truck,
      viewComponent: BasicInformationViewTab,
      editComponent: BasicInformationTab,
    },
    {
      id: 1,
      name: "Specifications",
      icon: Settings,
      viewComponent: SpecificationsViewTab,
      editComponent: SpecificationsTab,
    },
    {
      id: 2,
      name: "Capacity Details",
      icon: Package,
      viewComponent: CapacityDetailsViewTab,
      editComponent: CapacityDetailsTab,
    },
    {
      id: 3,
      name: "Ownership Details",
      icon: Building,
      viewComponent: OwnershipDetailsViewTab,
      editComponent: OwnershipDetailsTab,
    },
    {
      id: 4,
      name: "Maintenance & Service History",
      icon: Wrench,
      viewComponent: MaintenanceViewTab,
      editComponent: MaintenanceHistoryTab,
    },
    {
      id: 5,
      name: "Vehicle Service Frequency",
      icon: BarChart3,
      viewComponent: PerformanceDashboardViewTab,
      editComponent: ServiceFrequencyTab,
    },
    {
      id: 6,
      name: "Vehicle Documents",
      icon: FileText,
      viewComponent: DocumentsViewTab,
      editComponent: DocumentsTab,
    },
  ];

  // Load vehicle data
  useEffect(() => {
    if (id) {
      dispatch(fetchVehicleById(id));
      dispatch(fetchMasterData());
    }
  }, [id, dispatch]);

  // Refresh data function for approval actions
  const handleRefreshData = () => {
    if (id) {
      dispatch(fetchVehicleById(id));
    }
  };

  // Check if vehicle is a draft (handle both DRAFT and SAVE_AS_DRAFT status values)
  const isDraftVehicle =
    currentVehicle?.status === "DRAFT" ||
    currentVehicle?.status === "SAVE_AS_DRAFT";

  // Check if current user is the creator of this vehicle
  // Use String() to ensure type consistency in comparison
  const isCreator =
    currentVehicle?.createdBy &&
    user?.user_id &&
    String(currentVehicle.createdBy) === String(user.user_id);

  // Check if current user is an approver
  // Check both role and user_type_id for Product Owner detection
  const isApprover =
    user?.role === "Product Owner" ||
    user?.role === "admin" ||
    user?.user_type_id === "UT001"; // UT001 is Owner/Product Owner

  // 🔍 DEBUG: Log creator and approver checks
  console.log("🔍 EDIT BUTTON DEBUG - VEHICLE:");
  console.log("  Current User ID:", user?.user_id, typeof user?.user_id);
  console.log("  Current User Role:", user?.role);
  console.log("  Current User Type ID:", user?.user_type_id);
  console.log(
    "  Vehicle Created By:",
    currentVehicle?.createdBy,
    typeof currentVehicle?.createdBy
  );
  console.log(
    "  String Comparison:",
    String(currentVehicle?.createdBy),
    "===",
    String(user?.user_id)
  );
  console.log("  Is Creator:", isCreator);
  console.log("  Is Approver:", isApprover, "(role-based or UT001)");
  console.log("  Is Draft:", isDraftVehicle);
  console.log("  Status:", currentVehicle?.status);

  // ✅ PERMISSION LOGIC - Rejection/Resubmission Workflow
  // Determine if user can edit based on entity status and user role
  const canEdit = React.useMemo(() => {
    const status = currentVehicle?.status;

    console.log("🔍 CANEDIT CALCULATION - VEHICLE:");
    console.log("  Status:", status);
    console.log("  isDraftVehicle:", isDraftVehicle);
    console.log("  isCreator:", isCreator);
    console.log("  isApprover:", isApprover);

    // DRAFT: Only creator can edit
    if (isDraftVehicle) {
      console.log("  Result: DRAFT - returning isCreator:", isCreator);
      return isCreator;
    }

    // INACTIVE (rejected): Only creator can edit
    if (status === "INACTIVE") {
      console.log("  Result: INACTIVE - returning isCreator:", isCreator);
      return isCreator;
    }

    // PENDING: No one can edit (locked during approval)
    if (status === "PENDING") {
      console.log("  Result: PENDING - returning false");
      return false;
    }

    // ACTIVE: Only approvers can edit
    if (status === "ACTIVE") {
      console.log("  Result: ACTIVE - returning isApprover:", isApprover);
      return isApprover;
    }

    // Default: Allow edit
    console.log("  Result: DEFAULT - returning true");
    return true;
  }, [currentVehicle?.status, isCreator, isApprover, isDraftVehicle]);

  console.log("🔍 FINAL CANEDIT VALUE - VEHICLE:", canEdit);

  // Debug logging for approval data
  useEffect(() => {
    if (currentVehicle) {
      console.log("🔍 VehicleDetailsPage - Vehicle Data Loaded:");
      console.log("  Vehicle ID:", currentVehicle.vehicleId);
      console.log("  Status:", currentVehicle.status);
      console.log("  User Approval Status:", currentVehicle.userApprovalStatus);
      console.log(
        "  ✅ Remarks Available:",
        currentVehicle.userApprovalStatus?.remarks ? "YES" : "NO"
      );
      console.log(
        "  Remarks Content:",
        currentVehicle.userApprovalStatus?.remarks
      );
      console.log("  Current User:", user);
      console.log("  Full currentVehicle object:", currentVehicle);
    }
  }, [currentVehicle, user]);

  // currentVehicle is already transformed by fetchVehicleById thunk - no need to transform again
  const transformedVehicle = useMemo(() => {
    if (!currentVehicle) {
      console.log("🔄 No currentVehicle data available");
      return null;
    }
    console.log("🔄 Using already transformed vehicle data:", currentVehicle);
    console.log(
      "🔄 Vehicle status:",
      currentVehicle.status,
      "Update time:",
      currentVehicle.updated_at
    );
    return currentVehicle; // currentVehicle is already transformed by the Redux thunk
  }, [currentVehicle]);

  // Populate formData when vehicle data is available (for both draft and non-draft vehicles)
  // This ensures data is ready before entering edit mode
  useEffect(() => {
    if (transformedVehicle) {
      console.log(
        "🔍 Populating formData from transformedVehicle:",
        transformedVehicle
      );
      console.log(
        "🔍 Vehicle status:",
        transformedVehicle.status,
        "Draft status check:",
        isDraftVehicle,
        "Edit mode:",
        isEditMode
      );

      // Use transformedVehicle (already flattened) to populate form data
      // We need to restructure it into the nested format that the form components expect
      console.log("📊 About to populate formData with:");
      console.log(
        "📝 registrationNumber:",
        transformedVehicle.registrationNumber
      );
      console.log("📝 make:", transformedVehicle.make);
      console.log("📝 model:", transformedVehicle.model);
      console.log("📝 vin:", transformedVehicle.vin);

      setFormData({
        basicInformation: {
          registrationNumber: transformedVehicle.registrationNumber || "",
          vin: transformedVehicle.vin || "",
          vehicleType: transformedVehicle.vehicleType || "",
          transporterId: transformedVehicle.transporterId || "",
          transporterName: transformedVehicle.transporterName || "",
          make: transformedVehicle.make || "",
          model: transformedVehicle.model || "",
          year: transformedVehicle.year || new Date().getFullYear(),
          vehicleCategory: transformedVehicle.vehicleCategory || "",
          manufacturingMonthYear:
            transformedVehicle.manufacturingMonthYear || "",
          gpsIMEI: transformedVehicle.gpsIMEI || "",
          gpsActive: transformedVehicle.gpsActive || false,
          leasingFlag: transformedVehicle.leasingFlag || false,
          leasedFrom: transformedVehicle.leasedFrom || "",
          leaseStartDate: transformedVehicle.leaseStartDate || "",
          leaseEndDate: transformedVehicle.leaseEndDate || "",
          color: transformedVehicle.color || "",
          mileage: transformedVehicle.mileage || 0,
          gpsEnabled: transformedVehicle.gpsEnabled || false,
          gpsProvider: transformedVehicle.gpsProvider || "",
          currentDriver: transformedVehicle.currentDriver || "",
          usageType: transformedVehicle.usageType || "",
          vehicleRegisteredAtCountry:
            transformedVehicle.vehicleRegisteredAtCountry || "",
          vehicleRegisteredAtState:
            transformedVehicle.vehicleRegisteredAtState || "",
          avgRunningSpeed: transformedVehicle.avgRunningSpeed || "",
          maxRunningSpeed: transformedVehicle.maxRunningSpeed || "",
          safetyInspectionDate: transformedVehicle.safetyInspectionDate || "",
          taxesAndFees: transformedVehicle.taxesAndFees || "",
        },
        specifications: {
          engineNumber: transformedVehicle.engineNumber || "",
          engineType: transformedVehicle.engineType || "",
          fuelType: transformedVehicle.fuelType || "",
          fuelTankCapacity: transformedVehicle.fuelTankCapacity || 0,
          transmission: transformedVehicle.transmission || "",
          noOfGears: transformedVehicle.noOfGears || 0,
          wheelbase: transformedVehicle.wheelbase || 0,
          noOfAxles: transformedVehicle.noOfAxles || 0,
          emissionStandard: transformedVehicle.emissionStandard || "",
          financer: transformedVehicle.financer || "",
          suspensionType: transformedVehicle.suspensionType || "",
        },
        capacityDetails: {
          gvw: transformedVehicle.gvw || 0,
          unladenWeight: transformedVehicle.unladenWeight || 0,
          payloadCapacity: transformedVehicle.payloadCapacity || 0,
          loadingCapacityVolume: transformedVehicle.loadingCapacityVolume || 0,
          loadingCapacityUnit: transformedVehicle.loadingCapacityUnit || "CBM",
          cargoLength: transformedVehicle.cargoLength || 0,
          cargoWidth: transformedVehicle.cargoWidth || 0,
          cargoHeight: transformedVehicle.cargoHeight || 0,
          doorType: transformedVehicle.doorType || "",
          noOfPallets: transformedVehicle.noOfPallets || 0,
          seatingCapacity: transformedVehicle.seatingCapacity || 0,
          towingCapacity: transformedVehicle.towingCapacity || 0,
          vehicleCondition: transformedVehicle.vehicleCondition || "",
        },
        // Use array structure from transformed vehicle data
        ownershipDetails: transformedVehicle.ownershipDetails || [],
        maintenanceHistory: transformedVehicle.maintenanceHistory || [],
        serviceFrequency: transformedVehicle.serviceFrequency || [],
        documents: transformedVehicle.documents || [],
      });
      setValidationErrors({});
      setHasUnsavedChanges(false);
    }
  }, [transformedVehicle, isEditMode, isDraftVehicle]);

  const handleBack = () => {
    if (hasUnsavedChanges && isEditMode) {
      if (
        window.confirm(
          "You have unsaved changes. Are you sure you want to leave?"
        )
      ) {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  };

  const handleEditToggle = () => {
    if (isEditMode && hasUnsavedChanges) {
      if (
        window.confirm("You have unsaved changes. Do you want to discard them?")
      ) {
        setIsEditMode(false);
        setHasUnsavedChanges(false);
        setValidationErrors({});
      }
    } else {
      setIsEditMode(!isEditMode);
    }
  };

  const handleFormDataChange = (section, data) => {
    setFormData((prev) => ({
      ...prev,
      [section]: data,
    }));
    setHasUnsavedChanges(true);
  };

  // Transform frontend formData to backend format
  const transformFormDataForBackend = (frontendData) => {
    const formatDate = (dateStr) => {
      if (!dateStr) return undefined;
      if (dateStr instanceof Date) return dateStr.toISOString().split("T")[0];
      return dateStr;
    };

    const convertYearToMonthYear = (year) => {
      if (!year) return undefined;
      return `${year}-01`;
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
        vehicle_category: frontendData.basicInformation.vehicleCategory || "",
        manufacturing_month_year:
          frontendData.basicInformation.manufacturingMonthYear ||
          convertYearToMonthYear(frontendData.basicInformation.year),
        vehicle_colour: frontendData.basicInformation.color || "",
        gps_tracker_imei_number: frontendData.basicInformation.gpsIMEI || "",
        gps_tracker_active_flag:
          frontendData.basicInformation.gpsActive ||
          frontendData.basicInformation.gpsEnabled ||
          false,
        gps_provider: frontendData.basicInformation.gpsProvider || "",
        usage_type_id: frontendData.basicInformation.usageType || "UT001",
        safety_inspection_date: formatDate(
          frontendData.basicInformation.safetyInspectionDate
        ),
        taxes_and_fees: frontendData.basicInformation.taxesAndFees || 0,
        mileage: frontendData.basicInformation.mileage || 0,
        current_driver: frontendData.basicInformation.currentDriver || "",
        transporter_id: frontendData.basicInformation.transporterId || "",
        transporter_name: frontendData.basicInformation.transporterName || "",
        leasing_flag: frontendData.basicInformation.leasingFlag || false,
        leased_from: frontendData.basicInformation.leasedFrom || "",
        lease_start_date: formatDate(
          frontendData.basicInformation.leaseStartDate
        ),
        lease_end_date: formatDate(frontendData.basicInformation.leaseEndDate),
        vehicle_registered_at_country:
          frontendData.basicInformation.vehicleRegisteredAtCountry || "",
        vehicle_registered_at_state:
          frontendData.basicInformation.vehicleRegisteredAtState || "",
        avg_running_speed: frontendData.basicInformation.avgRunningSpeed || 0,
        max_running_speed: frontendData.basicInformation.maxRunningSpeed || 0,
        road_tax: frontendData.basicInformation.roadTax || 0,
        fitness_upto: formatDate(frontendData.basicInformation.fitnessUpto),
        tax_upto: formatDate(frontendData.basicInformation.taxUpto),
      },
      specifications: {
        engine_type_id: frontendData.specifications.engineType || "",
        engine_number: frontendData.specifications.engineNumber || "",
        fuel_type_id: frontendData.specifications.fuelType || "",
        fuel_tank_capacity: frontendData.specifications.fuelTankCapacity || 0,
        transmission_type: frontendData.specifications.transmission || "",
        financer: frontendData.specifications.financer || "",
        suspension_type: frontendData.specifications.suspensionType || "",
        emission_standard: frontendData.specifications.emissionStandard || "",
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
        tire_load_rating: frontendData.capacityDetails.tireLoadRating || null,
        vehicle_condition:
          frontendData.capacityDetails.vehicleCondition || "GOOD",
        fuel_tank_capacity:
          frontendData.specifications.fuelTankCapacity ||
          frontendData.capacityDetails.fuelTankCapacity ||
          0,
        seating_capacity: frontendData.capacityDetails.seatingCapacity || 0,
        cargo_dimensions_length: frontendData.capacityDetails.cargoLength || 0,
        cargo_dimensions_width: frontendData.capacityDetails.cargoWidth || 0,
        cargo_dimensions_height: frontendData.capacityDetails.cargoHeight || 0,
      },
      ownershipDetails: (() => {
        // Handle both array and object formats
        const ownership = Array.isArray(frontendData.ownershipDetails)
          ? frontendData.ownershipDetails[0] || {}
          : frontendData.ownershipDetails || {};

        return {
          ownershipName: ownership.ownershipName || ownership.ownerName || "",
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
            maintenance.serviceExpense || maintenance.totalServiceExpense || 0,
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
          kmDrove: serviceFreq.kmDrove || serviceFreq.serviceIntervalKM || 0,
        };
      })(),
      documents: (frontendData.documents || [])
        .map((doc) => {
          // Helper function to convert document type description back to ID
          const getDocumentTypeId = (documentTypeDescription) => {
            // If it's already a short ID code (e.g., DN001), return as-is
            if (/^DN\d{3}$/.test(documentTypeDescription)) {
              return documentTypeDescription;
            }

            // Map common document type descriptions to their ID codes
            const documentTypeMap = {
              "Vehicle Registration Certificate": "DN001",
              "Vehicle Insurance": "DN009",
              "PUC certificate": "DN010",
              "Fitness Certificate": "DN012",
              "Tax Certificate": "DN005",
              Permit: "DN006",
              "Driver License": "DN007",
              "Road Tax": "DN008",
              "Commercial Vehicle License": "DN011",
              "Pollution Certificate": "DN010", // Same as PUC
              "Insurance Policy": "DN009", // Same as Vehicle Insurance
              "Vehicle Permit": "DN006", // Same as Permit
            };

            // Check if we have a mapping for this description
            const mappedId = documentTypeMap[documentTypeDescription];
            if (mappedId) {
              return mappedId;
            }

            // If no mapping found, try to find it in master data
            // This requires access to masterData, but it might not be available here
            console.warn(
              "⚠️ Unknown document type description:",
              documentTypeDescription
            );

            // Return the original value as fallback
            return documentTypeDescription;
          };

          return {
            documentType: getDocumentTypeId(
              doc.documentType || doc.documentTypeId || ""
            ),
            referenceNumber: doc.documentNumber || doc.referenceNumber || "",
            vehicleMaintenanceId: doc.vehicleMaintenanceId || null,
            permitCategory: doc.permitCategory || "",
            permitCode: doc.permitCode || "",
            documentProvider:
              doc.documentProvider || doc.issuingAuthority || "",
            coverageType: doc.coverageType || "",
            premiumAmount: doc.premiumAmount || 0,
            validFrom: formatDate(doc.issueDate || doc.validFrom),
            validTo: formatDate(doc.expiryDate || doc.validTo),
            remarks: doc.remarks || "Document uploaded",
            fileName: doc.fileName || "",
            fileType: doc.fileType || "",
            fileData: doc.fileData || "",
          };
        })
        .filter((doc) => doc.documentType),
    };
  };

  const handleSaveChanges = async () => {
    // If this is a draft vehicle, show the submit modal
    if (isDraftVehicle) {
      setShowSubmitModal(true);
      return;
    }

    // For non-draft vehicles, proceed with normal update
    await handleNormalUpdate();
  };

  // Handle normal update (for non-draft vehicles)
  const handleNormalUpdate = async () => {
    try {
      // Clear previous errors
      setValidationErrors({});

      // ✅ RESUBMISSION LOGIC - If entity is INACTIVE (rejected), change status to PENDING
      const isResubmission = currentVehicle?.status === "INACTIVE";

      // Transform data for backend
      let transformedData = transformFormDataForBackend(formData);

      // If resubmitting, update the status to PENDING to restart approval workflow
      if (isResubmission) {
        transformedData = {
          ...transformedData,
          status: "PENDING", // Restart approval workflow
        };
      }

      console.log("🔍 RESUBMISSION CHECK - VEHICLE:");
      console.log("  Current Status:", currentVehicle?.status);
      console.log("  Is Resubmission:", isResubmission);
      console.log("  Final Status:", transformedData?.status);

      // Regular update (full validation)
      const resultAction = await dispatch(
        updateVehicle({
          vehicleId: id,
          vehicleData: transformedData,
        })
      );

      if (updateVehicle.fulfilled.match(resultAction)) {
        dispatch(
          showToast({
            message: isResubmission
              ? "Vehicle resubmitted for approval successfully! Status changed to PENDING."
              : "Vehicle updated successfully",
            type: "success",
          })
        );

        // Refresh vehicle data
        await dispatch(fetchVehicleById(id));

        // Exit edit mode
        setIsEditMode(false);
        setHasUnsavedChanges(false);
        setValidationErrors({});
      } else {
        const errorMessage =
          resultAction.payload?.message || "Failed to update vehicle";
        dispatch(
          showToast({
            message: errorMessage,
            type: "error",
          })
        );

        // Set validation errors if available
        if (resultAction.payload?.errors) {
          setValidationErrors(resultAction.payload.errors);
        }
      }
    } catch (error) {
      console.error("Error updating vehicle:", error);
      dispatch(
        showToast({
          message: "An unexpected error occurred",
          type: "error",
        })
      );
    }
  };

  // Handle update draft (minimal validation - called from modal)
  const handleUpdateDraft = async () => {
    setShowSubmitModal(false);

    try {
      // Clear previous errors
      setValidationErrors({});

      // Transform data for backend
      const transformedData = transformFormDataForBackend(formData);

      // Update draft (no validation)
      const resultAction = await dispatch(
        updateVehicleDraft({
          vehicleId: id,
          vehicleData: transformedData,
        })
      );

      if (updateVehicleDraft.fulfilled.match(resultAction)) {
        dispatch(
          showToast({
            message: "Draft updated successfully!",
            type: "success",
          })
        );

        // Refresh vehicle data to get updated content
        console.log("🔄 Refreshing vehicle data after draft update...");
        const refreshResult = await dispatch(fetchVehicleById(id));

        if (fetchVehicleById.fulfilled.match(refreshResult)) {
          console.log(
            "✅ Vehicle data refreshed successfully:",
            refreshResult.payload
          );
          // Force component re-render by updating the refresh key
          setDataRefreshKey((prev) => prev + 1);
        } else {
          console.error(
            "❌ Failed to refresh vehicle data:",
            refreshResult.payload
          );
        }

        // Exit edit mode
        setIsEditMode(false);
        setHasUnsavedChanges(false);
        setValidationErrors({});
      } else {
        const errorMessage =
          resultAction.payload?.message || "Failed to update draft";
        dispatch(
          showToast({
            message: errorMessage,
            type: "error",
          })
        );
      }
    } catch (error) {
      console.error("Error updating draft:", error);
      dispatch(
        showToast({
          message: "Failed to update draft. Please try again.",
          type: "error",
        })
      );
    }
  };

  // Submit draft for approval (DRAFT → PENDING) - called from modal
  const handleSubmitForApproval = async () => {
    setShowSubmitModal(false);

    try {
      setValidationErrors({});

      // Transform data for backend
      const transformedData = transformFormDataForBackend(formData);

      const resultAction = await dispatch(
        submitVehicleFromDraft({
          vehicleId: id,
          vehicleData: transformedData,
        })
      );

      if (submitVehicleFromDraft.fulfilled.match(resultAction)) {
        dispatch(
          showToast({
            message: "Vehicle submitted for approval successfully",
            type: "success",
          })
        );

        // Refresh vehicle data
        const submitRefreshResult = await dispatch(fetchVehicleById(id));
        if (fetchVehicleById.fulfilled.match(submitRefreshResult)) {
          // Force component re-render by updating the refresh key
          setDataRefreshKey((prev) => prev + 1);
        }

        // Exit edit mode
        setIsEditMode(false);
        setHasUnsavedChanges(false);
        setValidationErrors({});
      } else {
        const errorPayload = resultAction.payload;

        // Handle field-specific errors (GPS IMEI, Registration Number, VIN, etc.)
        let errorMessage =
          errorPayload?.message ||
          "Failed to submit vehicle for approval. Please try again.";
        let errorDetails = [];

        if (errorPayload?.field) {
          // Field-specific error (e.g., duplicate GPS IMEI)
          errorDetails.push(`${errorPayload.field}: ${errorPayload.message}`);
        } else if (errorPayload?.errors) {
          // Multiple validation errors
          errorDetails = errorPayload.errors.map((err) => {
            if (typeof err === "string") return err;
            if (err.field && err.message) return `${err.field}: ${err.message}`;
            return err.message || err;
          });
          setValidationErrors(errorPayload.errors);
        }

        dispatch(
          showToast({
            message: errorMessage,
            type: "error",
            details: errorDetails.length > 0 ? errorDetails : undefined,
            duration: 8000,
          })
        );

        // Stay in edit mode to fix errors if there are validation errors
        if (errorPayload?.errors || errorPayload?.field) {
          return;
        }
      }
    } catch (error) {
      console.error("Error submitting vehicle for approval:", error);
      dispatch(
        showToast({
          message: "An unexpected error occurred",
          type: "error",
        })
      );
    }
  };

  // Delete draft (hard delete)
  const handleDeleteDraft = async () => {
    try {
      const resultAction = await dispatch(deleteVehicleDraft(id));

      if (deleteVehicleDraft.fulfilled.match(resultAction)) {
        dispatch(
          showToast({
            message: "Vehicle draft deleted successfully",
            type: "success",
          })
        );

        // Close modal and navigate back to list
        setShowDeleteModal(false);
        navigate(-1);
      } else {
        const errorMessage =
          resultAction.payload?.message || "Failed to delete vehicle draft";
        dispatch(
          showToast({
            message: errorMessage,
            type: "error",
          })
        );
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error("Error deleting vehicle draft:", error);
      dispatch(
        showToast({
          message: "An unexpected error occurred",
          type: "error",
        })
      );
      setShowDeleteModal(false);
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const activeTabData = tabs[activeTab];
  const TabViewComponent = activeTabData?.viewComponent;
  const TabEditComponent = activeTabData?.editComponent;

  // Cancel edit handler: revert changes and exit edit mode
  const handleCancelEdit = () => {
    if (hasUnsavedChanges) {
      if (!window.confirm("Discard unsaved changes?")) return;
    }
    setIsEditMode(false);
    setHasUnsavedChanges(false);
    setValidationErrors({});
    // formData will be repopulated when edit mode is re-entered
  };

  // Documents change helper removed — DocumentsTab updates documents via setFormData prop

  // Loading state
  if (isFetching) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#6366F1] mx-auto mb-4"></div>
          <p className="text-[#4A5568] font-semibold">
            Loading vehicle details...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-md max-w-md">
          <AlertTriangle className="h-12 w-12 text-[#EF4444] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#0D1A33] text-center mb-2">
            Error Loading Vehicle
          </h2>
          <p className="text-[#4A5568] text-center mb-6">
            {error.message || "Failed to load vehicle details"}
          </p>
          <button
            onClick={handleBack}
            className="w-full px-4 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-colors"
          >
            Back to Vehicle List
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!currentVehicle) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="text-center">
          <Truck className="h-20 w-20 text-[#E5E7EB] mx-auto mb-4" />
          <p className="text-[#4A5568] font-semibold">Vehicle not found</p>
          <button
            onClick={handleBack}
            className="mt-4 px-6 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-colors"
          >
            Back to Vehicle List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#F8FAFC] to-[#F1F5F9]">
      <TMSHeader theme={theme} />

      {/* Modern Header Bar with glassmorphism - Transporter Style */}
      <div className="bg-gradient-to-r from-[#0D1A33] via-[#1A2B47] to-[#0D1A33] px-6 py-4 shadow-xl relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-transparent to-blue-800/10"></div>
        <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl"></div>
        <div className="absolute -bottom-4 -left-4 w-40 h-40 bg-gradient-to-tr from-blue-400/10 to-transparent rounded-full blur-2xl"></div>

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="group p-2 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-105 border border-white/20"
            >
              <ArrowLeft className="w-5 h-5 text-white group-hover:text-white transition-colors" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  {currentVehicle.vehicleId}
                </h1>
                <VehicleStatusPill status={currentVehicle.status} />
              </div>
              <div className="flex items-center gap-4 text-blue-100/80 text-xs">
                <span>{currentVehicle.registrationNumber}</span>
                <span>•</span>
                <span>
                  {currentVehicle.make} {currentVehicle.model}
                </span>
                <span>•</span>
                <span>{currentVehicle.year}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* User Approval Bar (if vehicle has pending approval) */}
            {currentVehicle.userApprovalStatus && (
              <ApprovalActionBar
                userApprovalStatus={currentVehicle.userApprovalStatus}
                entityId={id}
                onRefreshData={handleRefreshData}
              />
            )}

            {console.log("🔍 BUTTON RENDER CHECK - VEHICLE:", {
              isEditMode,
              canEdit,
              showButton: !isEditMode && canEdit,
            })}

            {isEditMode ? (
              <>
                <button
                  onClick={handleCancelEdit}
                  className="group inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl font-medium text-sm hover:bg-white/20 transition-all duration-300 hover:scale-105"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>

                <button
                  onClick={handleSaveChanges}
                  disabled={isUpdating || isUpdatingDraft}
                  className="group inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#10B981] to-[#059669] text-white rounded-xl font-medium text-sm hover:from-[#059669] hover:to-[#10B981] transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating || isUpdatingDraft ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                      {isDraftVehicle ? "Submit Changes" : "Save Changes"}
                    </>
                  )}
                </button>
              </>
            ) : (
              !isEditMode &&
              canEdit && (
                <>
                  {/* Edit button - only shown when user has permission */}
                  <button
                    onClick={handleEditToggle}
                    className="group inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#10B981] to-[#059669] text-white rounded-xl font-medium text-sm hover:from-[#059669] hover:to-[#10B981] transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-green-500/25"
                  >
                    <Edit className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                    {isDraftVehicle ? "Edit Draft" : "Edit Details"}
                  </button>
                </>
              )
            )}
          </div>
        </div>
      </div>

      {/* ✅ REJECTION REMARKS BANNER - Show when entity is rejected (INACTIVE) */}
      {currentVehicle?.status === "INACTIVE" &&
        currentVehicle?.userApprovalStatus?.remarks && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 mx-6 mt-4 rounded-lg shadow-sm">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-red-900 font-semibold text-lg mb-2 flex items-center gap-2">
                  Rejection Remarks
                  <span className="text-xs bg-red-100 px-2 py-1 rounded-full ml-2">
                    Entity Rejected
                  </span>
                </h4>
                <p className="text-red-800 whitespace-pre-wrap leading-relaxed">
                  {currentVehicle.userApprovalStatus.remarks}
                </p>
                {isCreator && !isEditMode && (
                  <div className="mt-4 text-sm text-red-700 bg-red-100 p-3 rounded-md">
                    <strong>Note:</strong> Please address the rejection remarks
                    above and click "Edit Details" to make the necessary
                    changes, then save to resubmit for approval.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      {/* Modern Tab Navigation with glassmorphism */}
      <div className="bg-gradient-to-r from-[#0D1A33] to-[#1A2B47] px-6 relative">
        {/* Tab backdrop blur effect */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>

        {/* Desktop Tabs */}
        <div
          className="relative hidden lg:flex space-x-2 p-2 overflow-x-auto"
          style={{
            scrollbarWidth: "none", // Firefox
            msOverflowStyle: "none", // IE/Edge
            WebkitOverflowScrolling: "touch",
          }}
        >
          <style>{`
            .relative.hidden.lg\\:flex::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`group relative px-6 py-4 font-medium text-sm rounded-t-2xl transition-all duration-300 flex items-center gap-3 whitespace-nowrap ${
                  isActive
                    ? "bg-gradient-to-br from-white via-white to-gray-50 text-[#0D1A33] shadow-lg transform -translate-y-1 scale-105"
                    : "bg-white/5 backdrop-blur-sm text-blue-100/80 hover:bg-white/10 hover:text-white border border-white/10 hover:border-white/20"
                }`}
              >
                {/* Active tab decoration */}
                {isActive && (
                  <div className="absolute inset-x-0 -bottom-0 h-1 bg-gradient-to-r from-[#10B981] to-[#059669] rounded-t-full"></div>
                )}

                <Icon
                  className={`w-5 h-5 transition-all duration-300 ${
                    isActive
                      ? "text-[#10B981] scale-110"
                      : "text-blue-200/70 group-hover:text-white group-hover:scale-105"
                  }`}
                />
                <span className="font-semibold tracking-wide">{tab.name}</span>

                {/* Mode indicator */}
                {isActive && (
                  <div className="ml-2">
                    {isEditMode ? (
                      <Edit className="w-3 h-3 text-orange-500" />
                    ) : (
                      <Eye className="w-3 h-3 text-green-500" />
                    )}
                  </div>
                )}

                {/* Hover glow effect */}
                {!isActive && (
                  <div className="absolute inset-0 rounded-t-2xl bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Mobile Dropdown */}
        <div className="lg:hidden p-4">
          <CustomSelect
            value={activeTab}
            onChange={(value) => handleTabChange(Number(value))}
            options={tabs.map((tab) => ({ value: tab.id, label: tab.name }))}
            placeholder="Select Tab"
            className="w-full"
          />
        </div>
      </div>

      {/* Modern Content Area */}
      <div className="px-0 py-0">
        {/* Enhanced Tab Content Container */}
        <div className="relative">
          {tabs.map((tab) => {
            const TabComponent = tab.viewComponent;
            const TabEditComponent = tab.editComponent;
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
                <div className="bg-white/60 backdrop-blur-sm rounded-b-3xl shadow-xl border border-white/40 overflow-hidden">
                  {/* Tab content */}
                  <div className="p-4">
                    {isEditMode && TabEditComponent
                      ? // Edit Mode - Render Edit Component
                        React.createElement(TabEditComponent, {
                          // Pass full formData structure - tabs expect full object
                          formData: formData,
                          // Accept either an updater function (which may expect full formData)
                          setFormData: (dataOrUpdater) => {
                            const sectionKey =
                              tab.id === 0
                                ? "basicInformation"
                                : tab.id === 1
                                ? "specifications"
                                : tab.id === 2
                                ? "capacityDetails"
                                : tab.id === 3
                                ? "ownershipDetails"
                                : tab.id === 4
                                ? "maintenanceHistory"
                                : tab.id === 5
                                ? "serviceFrequency"
                                : "documents";

                            if (typeof dataOrUpdater === "function") {
                              // First try invoking updater with full formData (common pattern used in other pages)
                              const resultIfFull = dataOrUpdater(formData);

                              // Heuristic: if result contains any of the known top-level keys, assume it's a full-form update
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
                                // Replace entire formData
                                setFormData(resultIfFull);
                                setHasUnsavedChanges(true);
                              } else {
                                // Otherwise treat updater as section-updater
                                const currentSectionData = formData[sectionKey];
                                const newSectionData =
                                  dataOrUpdater(currentSectionData);
                                handleFormDataChange(
                                  sectionKey,
                                  newSectionData
                                );
                              }
                            } else {
                              // Directly set section data
                              handleFormDataChange(sectionKey, dataOrUpdater);
                            }
                          },
                          errors: validationErrors,
                          masterData: masterData || {},
                        })
                      : // View Mode - Render View Component
                        TabComponent && (
                          <TabComponent
                            key={`${currentVehicle?.vehicleId}-${dataRefreshKey}`}
                            vehicle={currentVehicle || transformedVehicle}
                          />
                        )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Submit Changes Modal - Draft workflow (Update Draft or Submit for Approval) */}
      <SubmitDraftModal
        isOpen={showSubmitModal}
        onUpdateDraft={handleUpdateDraft}
        onSubmitForApproval={handleSubmitForApproval}
        onCancel={() => setShowSubmitModal(false)}
        isLoading={isUpdatingDraft || isSubmittingDraft}
        title="Submit Changes"
        message="Would you like to update the draft or submit it for approval?"
      />

      {/* Delete Draft Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
            <div className="mb-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-[#0D1A33] mb-2">
                Delete Draft
              </h3>
              <p className="text-[#4A5568] text-sm">
                Are you sure you want to delete this vehicle draft? This action
                cannot be undone and all vehicle data will be permanently
                removed.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeletingDraft}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDraft}
                disabled={isDeletingDraft}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-[#EF4444] to-[#DC2626] text-white rounded-xl font-medium hover:from-[#DC2626] hover:to-[#EF4444] transition-all shadow-lg hover:shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeletingDraft ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </span>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleDetailsPage;
