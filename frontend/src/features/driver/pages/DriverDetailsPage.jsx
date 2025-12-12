import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  User,
  Loader2,
  Edit,
  Save,
  X,
  FileText,
  Briefcase,
  AlertTriangle,
  Users,
  Car,
  Ban,
  AlertCircle,
  Eye,
  LayoutDashboard,
  Hash,
  Calendar,
} from "lucide-react";
import {
  fetchDriverById,
  updateDriver,
  fetchMasterData,
  clearError,
  updateDriverDraft,
  submitDriverFromDraft,
  deleteDriverDraft,
} from "../../../redux/slices/driverSlice";
import { addToast } from "../../../redux/slices/uiSlice";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import SubmitDraftModal from "../../../components/ui/SubmitDraftModal";
import { getPageTheme, getComponentTheme } from "../../../theme.config";
import { TOAST_TYPES, ERROR_MESSAGES } from "../../../utils/constants";
import {
  basicInfoSchema,
  addressSchema,
  documentSchema,
  historySchema,
  accidentViolationSchema,
  formatFieldName,
} from "../validation";
import ApprovalActionBar from "../../../components/approval/ApprovalActionBar";

// Import view tab components
// import DriverDashboardViewTab from "../components/DriverDashboardViewTab";
import BasicInfoViewTab from "../components/BasicInfoViewTab";
import DocumentsViewTab from "../components/DocumentsViewTab";
import HistoryViewTab from "../components/HistoryViewTab";
import AccidentViolationViewTab from "../components/AccidentViolationViewTab";
import TransporterMappingViewTab from "../components/TransporterMappingViewTab";
import VehicleMappingViewTab from "../components/VehicleMappingViewTab";
import BlacklistMappingViewTab from "../components/BlacklistMappingViewTab";

// Import edit tab components
import BasicInfoTab from "../components/BasicInfoTab";
import DocumentsTab from "../components/DocumentsTab";
import HistoryTab from "../components/HistoryTab";
import AccidentViolationTab from "../components/AccidentViolationTab";
import TransporterMappingTab from "../components/TransporterMappingTab";
import VehicleMappingTab from "../components/VehicleMappingTab";
import BlacklistMappingTab from "../components/BlacklistMappingTab";
import TMSHeader from "@/components/layout/TMSHeader";

const DriverDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const theme = getPageTheme("tab") || {};
  const actionButtonTheme = getComponentTheme("actionButton") || {};
  const tabButtonTheme = getComponentTheme("tabButton") || {};

  // Ensure theme objects have required structure with defaults
  const safeTheme = {
    colors: {
      primary: { background: theme.colors?.primary?.background || "#10B981" },
      card: {
        background: theme.colors?.card?.background || "#FFFFFF",
        border: theme.colors?.card?.border || "#E5E7EB",
      },
      text: {
        primary: theme.colors?.text?.primary || "#111827",
        secondary: theme.colors?.text?.secondary || "#6B7280",
      },
      status: {
        error: theme.colors?.status?.error || "#EF4444",
      },
    },
  };

  const safeActionButtonTheme = {
    primary: {
      background: actionButtonTheme.primary?.background || "#10B981",
      text: actionButtonTheme.primary?.text || "#FFFFFF",
      border: actionButtonTheme.primary?.border || "#10B981",
    },
    secondary: {
      background: actionButtonTheme.secondary?.background || "#F3F4F6",
      text: actionButtonTheme.secondary?.text || "#374151",
      border: actionButtonTheme.secondary?.border || "#D1D5DB",
    },
  };

  const safeTabButtonTheme = {
    active: {
      background: tabButtonTheme.active?.background || "#F0FDF4",
      text: tabButtonTheme.active?.text || "#10B981",
      border: tabButtonTheme.active?.border || "#10B981",
    },
    default: {
      background: tabButtonTheme.default?.background || "#FFFFFF",
      text: tabButtonTheme.default?.text || "#6B7280",
      border: tabButtonTheme.default?.border || "transparent",
    },
  };

  const { user, role } = useSelector((state) => state.auth);
  const {
    selectedDriver,
    isFetchingDetails,
    isUpdating,
    isUpdatingDraft,
    isSubmittingDraft,
    error,
    masterData,
  } = useSelector((state) => state.driver);

  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [editFormData, setEditFormData] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [tabErrors, setTabErrors] = useState({
    // 0: false, // Dashboard (view-only)
    0: false, // Basic Info
    1: false, // Documents
    2: false, // History
    3: false, // Accident & Violation
    4: false, // Transporter Mapping
    5: false, // Vehicle Mapping
    6: false, // Blacklist Mapping
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const tabs = [
    // {
    //   id: 0,
    //   name: "Dashboard",
    //   icon: LayoutDashboard,
    //   viewComponent: DriverDashboardViewTab,
    //   editComponent: null, // View-only tab
    // },
    {
      id: 0,
      name: "Basic Information",
      icon: User,
      viewComponent: BasicInfoViewTab,
      editComponent: BasicInfoTab,
    },
    {
      id: 1,
      name: "Documents",
      icon: FileText,
      viewComponent: DocumentsViewTab,
      editComponent: DocumentsTab,
    },
    {
      id: 2,
      name: "History Information",
      icon: Briefcase,
      viewComponent: HistoryViewTab,
      editComponent: HistoryTab,
    },
    {
      id: 3,
      name: "Accident & Violation",
      icon: AlertTriangle,
      viewComponent: AccidentViolationViewTab,
      editComponent: AccidentViolationTab,
    },
    {
      id: 4,
      name: "Transporter/Owner Mapping",
      icon: Users,
      viewComponent: TransporterMappingViewTab,
      editComponent: TransporterMappingTab,
    },
    {
      id: 5,
      name: "Vehicle Mapping",
      icon: Car,
      viewComponent: VehicleMappingViewTab,
      editComponent: VehicleMappingTab,
    },
    {
      id: 6,
      name: "Blacklist Mapping",
      icon: Ban,
      viewComponent: BlacklistMappingViewTab,
      editComponent: BlacklistMappingTab,
    },
  ];

  // Load driver data
  useEffect(() => {
    if (id) {
      dispatch(fetchDriverById(id));
      dispatch(fetchMasterData());
    }
  }, [id, dispatch]);

  // Clear editFormData when driver ID changes
  useEffect(() => {
    setEditFormData(null);
    setIsEditMode(false);
    setHasUnsavedChanges(false);
    setValidationErrors({});
  }, [id]);

  // Refresh data function for approval actions
  // const handleRefreshData = () => {
  //   if (id) {
  //     dispatch(fetchDriverById(id));
  //   }
  // };

  // Initialize edit form data when driver loads
  // ✅ FIX: Always initialize editFormData when entering edit mode, even if it already exists
  // This prevents null/stale data from breaking the UI
  useEffect(() => {
    if (selectedDriver && isEditMode) {
      // Helper function to sanitize data (convert null to undefined/empty string)
      const sanitizeAddress = (addr) => ({
        ...addr,
        district: addr.district || "",
        street1: addr.street1 || "",
        street2: addr.street2 || "",
        postalCode: addr.postalCode || "",
        isPrimary: Boolean(addr.isPrimary),
      });

      const sanitizeAccident = (acc) => ({
        ...acc,
        vehicleRegistrationNumber:
          acc.vehicleRegistrationNumber || acc.vehicleRegnNumber || "",
        description: acc.description || "",
      });

      setEditFormData({
        basicInfo: {
          fullName: selectedDriver.fullName || "",
          dateOfBirth: selectedDriver.dateOfBirth || "",
          gender: selectedDriver.gender || "",
          bloodGroup: selectedDriver.bloodGroup || "",
          phoneNumber: selectedDriver.phoneNumber || "",
          emailId: selectedDriver.emailId || "",
          emergencyContact: selectedDriver.emergencyContact || "",
          alternatePhoneNumber: selectedDriver.alternatePhoneNumber || "",
        },
        addresses: (selectedDriver.addresses || []).map(sanitizeAddress),
        documents: selectedDriver.documents || [],
        history: selectedDriver.history || [],
        accidents: (selectedDriver.accidents || []).map(sanitizeAccident),
        transporterMappings: selectedDriver.transporterMappings || [],
        vehicleMappings: selectedDriver.vehicleMappings || [],
        blacklistMappings: selectedDriver.blacklistMappings || [],
      });

      // 🔍 DEBUG: Log documents loaded into edit mode
      console.log("📋 ========================================");
      console.log("📋 FRONTEND - Documents loaded into edit mode:");
      console.log(
        "📋 Total documents:",
        (selectedDriver.documents || []).length
      );
      (selectedDriver.documents || []).forEach((doc, idx) => {
        console.log(`📋 Document ${idx}:`, {
          documentId: doc.documentId,
          documentType: doc.documentType,
          documentTypeId: doc.documentTypeId,
          documentNumber: doc.documentNumber,
          hasDocumentId: !!doc.documentId,
          documentIdType: typeof doc.documentId,
          fileData: doc.fileData ? `${doc.fileData.substring(0, 50)}...` : null,
          fileName: doc.fileName,
        });
      });
      console.log("📋 ========================================");
    }
  }, [selectedDriver, isEditMode]); // ✅ FIX: Removed !editFormData condition to always refresh when entering edit mode

  // Handle errors
  useEffect(() => {
    if (error && !isUpdating) {
      // Backend returned an error
      let errorMessage = "Failed to update driver";
      let errorDetails = [];

      if (typeof error === "object") {
        // Handle structured error response
        if (error.message) {
          errorMessage = error.message;
        }

        // Check if it's a validation error with field information
        if (error.code === "VALIDATION_ERROR" && error.field) {
          // Format field path to user-friendly text
          const fieldPath = error.field
            .replace(/\[(\d+)\]/g, " $1")
            .replace(/\./g, " - ");
          errorDetails.push(`${fieldPath}: ${error.message}`);
        }

        // Handle multiple validation errors if they exist in details array
        if (error.details && Array.isArray(error.details)) {
          errorDetails = error.details.map((detail) => {
            if (typeof detail === "string") {
              return detail;
            } else if (detail.field && detail.message) {
              const fieldPath = detail.field
                .replace(/\[(\d+)\]/g, " $1")
                .replace(/\./g, " - ");
              return `${fieldPath}: ${detail.message}`;
            } else if (detail.message) {
              return detail.message;
            }
            return "Validation error";
          });
        }
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      // Show error toast
      dispatch(
        addToast({
          type: TOAST_TYPES.ERROR,
          message: errorMessage,
          details: errorDetails.length > 0 ? errorDetails : null,
          duration: 8000,
        })
      );

      // Clear error after showing toast to prevent re-triggering
      dispatch(clearError());
    }
  }, [error, isUpdating, dispatch]);

  // Refresh data function for approval actions
  const handleRefreshData = () => {
    if (id) {
      dispatch(fetchDriverById(id));
    }
  };

  // Check if driver is a draft
  const isDraftDriver =
    selectedDriver?.status === "SAVE_AS_DRAFT" ||
    selectedDriver?.status === "DRAFT";

  // Check if current user is the creator of this driver
  // Use String() to ensure type consistency in comparison
  const isCreator =
    selectedDriver?.createdBy &&
    user?.user_id &&
    String(selectedDriver.createdBy) === String(user.user_id);

  // Check if current user is an approver
  // Check both role and user_type_id for Product Owner detection
  const isApprover =
    user?.role === "Product Owner" ||
    user?.role === "admin" ||
    user?.user_type_id === "UT001"; // UT001 is Owner/Product Owner

  // 🔍 DEBUG: Log creator and approver checks
  console.log("🔍 EDIT BUTTON DEBUG - DRIVER:");
  console.log("  Current User ID:", user?.user_id, typeof user?.user_id);
  console.log("  Current User Role:", user?.role);
  console.log("  Current User Type ID:", user?.user_type_id);
  console.log(
    "  Driver Created By:",
    selectedDriver?.createdBy,
    typeof selectedDriver?.createdBy
  );
  console.log(
    "  String Comparison:",
    String(selectedDriver?.createdBy),
    "===",
    String(user?.user_id)
  );
  console.log("  Is Creator:", isCreator);
  console.log("  Is Approver:", isApprover, "(role-based or UT001)");
  console.log("  Is Draft:", isDraftDriver);
  console.log("  Status:", selectedDriver?.status);

  // ✅ PERMISSION LOGIC - Rejection/Resubmission Workflow
  // Determine if user can edit based on entity status and user role
  const canEdit = React.useMemo(() => {
    const status = selectedDriver?.status;

    console.log("🔍 CANEDIT CALCULATION - DRIVER:");
    console.log("  Status:", status);
    console.log("  isDraftDriver:", isDraftDriver);
    console.log("  isCreator:", isCreator);
    console.log("  isApprover:", isApprover);

    // DRAFT: Only creator can edit
    if (isDraftDriver) {
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
  }, [selectedDriver?.status, isCreator, isApprover, isDraftDriver]);

  console.log("🔍 FINAL CANEDIT VALUE - DRIVER:", canEdit);

  // Debug logging for approval data
  useEffect(() => {
    if (selectedDriver) {
      console.log("🔍 DriverDetailsPage - Driver Data Loaded:");
      console.log("  Driver ID:", selectedDriver.driverId);
      console.log("  Status:", selectedDriver.status);
      console.log("  User Approval Status:", selectedDriver.userApprovalStatus);
      console.log(
        "  ✅ Remarks Available:",
        selectedDriver.userApprovalStatus?.remarks ? "YES" : "NO"
      );
      console.log(
        "  Remarks Content:",
        selectedDriver.userApprovalStatus?.remarks
      );
      console.log("  Current User:", user);
      console.log("  Full selectedDriver object:", selectedDriver);
    }
  }, [selectedDriver, user]);

  // Track unsaved changes
  useEffect(() => {
    if (editFormData && selectedDriver && isEditMode) {
      setHasUnsavedChanges(true);
    } else {
      setHasUnsavedChanges(false);
    }
  }, [editFormData, selectedDriver, isEditMode]);

  // Clear errors when switching tabs
  useEffect(() => {
    if (activeTab !== null) {
      dispatch(clearError());
    }
  }, [activeTab, isEditMode]);

  const handleBack = () => {
    navigate("/drivers");
  };

  const handleEditToggle = () => {
    if (isEditMode) {
      // Cancel edit - reset form data
      setEditFormData(null);
      setValidationErrors({});
      setTabErrors({
        0: false, // Basic Info
        1: false, // Documents
        2: false, // History
        3: false, // Accident & Violation
        4: false, // Transporter Mapping
        5: false, // Vehicle Mapping
        6: false, // Blacklist Mapping
      });
    }
    setIsEditMode(!isEditMode);
  };

  const handleFormDataChange = (section, data) => {
    setEditFormData((prev) => ({
      ...prev,
      [section]: data,
    }));
  };

  const handleValidationErrorsChange = (errors) => {
    setValidationErrors(errors);
  };

  const handleTabErrorChange = (tabId, hasError) => {
    setTabErrors((prev) => ({
      ...prev,
      [tabId]: hasError,
    }));
  };

  const handleSaveChanges = async () => {
    // If this is a draft driver, show the submit modal
    if (isDraftDriver) {
      setShowSubmitModal(true);
      return;
    }

    // For non-draft drivers, proceed with normal update
    await handleNormalUpdate();
  };

  // Handle update draft (minimal validation)
  const handleUpdateDraft = async () => {
    setShowSubmitModal(false);

    try {
      // Minimal validation - only full name and date of birth required
      if (
        !editFormData?.basicInfo?.fullName ||
        editFormData.basicInfo.fullName.trim().length < 2
      ) {
        dispatch(
          addToast({
            type: TOAST_TYPES.ERROR,
            message: "Full name is required (minimum 2 characters)",
          })
        );
        return;
      }

      if (!editFormData?.basicInfo?.dateOfBirth) {
        dispatch(
          addToast({
            type: TOAST_TYPES.ERROR,
            message: "Date of birth is required",
          })
        );
        return;
      }

      // Clear any previous errors
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
      dispatch(clearError());

      // Call the update draft API
      const result = await dispatch(
        updateDriverDraft({
          driverId: id,
          driverData: {
            basicInfo: editFormData.basicInfo,
            addresses: editFormData.addresses,
            documents: editFormData.documents,
            employmentHistory: editFormData.history,
            accidentsViolations: editFormData.accidents,
          },
        })
      ).unwrap();

      // Success - show toast notification
      dispatch(
        addToast({
          type: TOAST_TYPES.SUCCESS,
          message: "Draft updated successfully!",
        })
      );

      // Refresh the driver data
      await dispatch(fetchDriverById(id));

      // Switch to view mode
      setIsEditMode(false);
      setHasUnsavedChanges(false);
      setValidationErrors({});
    } catch (err) {
      console.error("Error updating draft:", err);
      dispatch(clearError());

      dispatch(
        addToast({
          type: TOAST_TYPES.ERROR,
          message: err.message || "Failed to update draft. Please try again.",
        })
      );
    }
  };

  // Handle submit for approval (full validation)
  const handleSubmitForApproval = async () => {
    setShowSubmitModal(false);

    try {
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
      dispatch(clearError());

      // Call the submit draft API (backend will handle all validations)
      const result = await dispatch(
        submitDriverFromDraft({
          driverId: id,
          driverData: {
            basicInfo: editFormData.basicInfo,
            addresses: editFormData.addresses,
            documents: editFormData.documents,
            employmentHistory: editFormData.history,
            accidentsViolations: editFormData.accidents,
          },
        })
      ).unwrap();

      // Success - show toast
      dispatch(
        addToast({
          type: TOAST_TYPES.SUCCESS,
          message:
            "Driver submitted for approval successfully! Status changed to PENDING.",
        })
      );

      // Navigate to driver list page after 1 second
      setTimeout(() => {
        navigate("/drivers");
      }, 1000);
    } catch (err) {
      console.error("Error submitting draft:", err);

      // Parse and display validation errors
      // Backend returns: { success: false, error: { code, message, field } }
      let errorMessage = "Failed to submit driver for approval";
      let errorDetails = [];

      if (err && typeof err === "object") {
        // Extract error from nested structure
        const error = err.error || err;

        if (error.message) {
          errorMessage = error.message;
        }

        // Handle validation error with field information
        if (error.code === "VALIDATION_ERROR" && error.field) {
          const fieldPath = error.field
            .replace(/\[(\d+)\]/g, " $1")
            .replace(/\./g, " - ");
          errorDetails.push(`${fieldPath}: ${error.message}`);
        }

        // Handle duplicate errors
        if (
          (error.code === "DUPLICATE_PHONE" ||
            error.code === "DUPLICATE_EMAIL" ||
            error.code === "DUPLICATE_DOCUMENT") &&
          error.field
        ) {
          const fieldPath = error.field
            .replace(/\[(\d+)\]/g, " $1")
            .replace(/\./g, " - ");
          errorDetails.push(`${fieldPath}: ${error.message}`);
        }

        // Add expectedFormats if available
        if (error.expectedFormats && Array.isArray(error.expectedFormats)) {
          errorDetails.push(...error.expectedFormats);
        }
      }

      dispatch(
        addToast({
          type: TOAST_TYPES.ERROR,
          message: errorMessage,
          details: errorDetails.length > 0 ? errorDetails : null,
          duration: 8000,
        })
      );
    }
  };

  // Handle normal update (for non-draft drivers)
  const handleNormalUpdate = async () => {
    // Validate form data
    const errors = {};
    const newTabErrors = { ...tabErrors };
    const allErrorMessages = []; // Collect all error messages

    // Validate Basic Info (Tab 0)
    try {
      basicInfoSchema.parse(editFormData.basicInfo);
      newTabErrors[0] = false;
    } catch (err) {
      errors.basicInfo = err.errors || [err];
      newTabErrors[0] = true;

      // Collect all errors from this section
      const errorArray = err.errors || [err];
      errorArray.forEach((error) => {
        const fieldName = formatFieldName(error.path?.[0] || "field");
        allErrorMessages.push(
          `Basic Information - ${fieldName}: ${error.message}`
        );
      });
    }

    // Validate Addresses (Tab 0 - same as Basic Info)
    if (editFormData.addresses && editFormData.addresses.length > 0) {
      editFormData.addresses.forEach((address, index) => {
        try {
          addressSchema.parse(address);
        } catch (err) {
          errors[`addresses[${index}]`] = err.errors || [err];
          newTabErrors[0] = true;

          // Collect all errors from this address
          const errorArray = err.errors || [err];
          errorArray.forEach((error) => {
            const fieldName = formatFieldName(error.path?.[0] || "field");
            allErrorMessages.push(
              `Address ${index + 1} - ${fieldName}: ${error.message}`
            );
          });
        }
      });
    }

    // Validate Documents (Tab 1)
    if (editFormData.documents && editFormData.documents.length > 0) {
      editFormData.documents.forEach((document, index) => {
        // Skip validation for completely empty documents
        // Check if document is truly empty (no documentType AND no documentNumber)
        const isCompletelyEmpty =
          (!document.documentType || document.documentType.trim() === "") &&
          (!document.documentNumber || document.documentNumber.trim() === "");

        if (isCompletelyEmpty) {
          return; // Skip completely empty document
        }

        // Create a copy of the document with resolved document type name
        const documentForValidation = { ...document };

        // If documentType is an ID (short code like DOC001), resolve it to name
        // This handles cases where documentType contains the ID instead of the name
        if (documentForValidation.documentType && masterData?.documentTypes) {
          const docTypeMatch = masterData.documentTypes.find(
            (dt) => dt.value === documentForValidation.documentType
          );
          if (docTypeMatch) {
            // Use the label (name) for validation instead of the value (ID)
            documentForValidation.documentType = docTypeMatch.label;
          }
        }

        // Debug logging for document validation
        console.log(`🔍 Validating Document ${index}:`, {
          original: document,
          forValidation: documentForValidation,
        });

        try {
          documentSchema.parse(documentForValidation);
          console.log(`✅ Document ${index} passed validation`);
        } catch (err) {
          console.error(`❌ Document ${index} validation failed:`, err);
          errors[`documents[${index}]`] = err.errors || [err];
          newTabErrors[1] = true;

          // Collect all errors from this document
          const errorArray = err.errors || [err];
          errorArray.forEach((error) => {
            // Handle different error formats
            let fieldName = "Field";
            let errorMessage = "Validation error";

            // Check if error has a path array
            if (
              error.path &&
              Array.isArray(error.path) &&
              error.path.length > 0
            ) {
              fieldName = formatFieldName(error.path[0]);
            }

            // Extract the actual error message - handle all possible formats
            if (typeof error === "string") {
              errorMessage = error;
            } else if (error.message) {
              if (typeof error.message === "string") {
                errorMessage = error.message;
              } else if (typeof error.message === "object") {
                // If message is still an object, extract the inner message
                errorMessage = error.message.message || "Validation error";
              }
            }

            // Only add if we have a clean error message (not a JSON string)
            if (
              !errorMessage.startsWith("[") &&
              !errorMessage.startsWith("{")
            ) {
              allErrorMessages.push(
                `Document ${index + 1} - ${fieldName}: ${errorMessage}`
              );
            }
          });
        }
      });
    }

    // Validate History (Tab 2)
    if (editFormData.history && editFormData.history.length > 0) {
      editFormData.history.forEach((hist, index) => {
        // Skip validation for empty history records (all fields are optional/empty)
        if (
          (!hist.employer || hist.employer.trim() === "") &&
          (!hist.employmentStatus || hist.employmentStatus.trim() === "") &&
          (!hist.fromDate || hist.fromDate.trim() === "") &&
          (!hist.toDate || hist.toDate.trim() === "") &&
          (!hist.jobTitle || hist.jobTitle.trim() === "")
        ) {
          return; // Skip this history record
        }

        try {
          historySchema.parse(hist);
        } catch (err) {
          errors[`history[${index}]`] = err.errors || [err];
          newTabErrors[2] = true;

          // Collect all errors from this history record
          const errorArray = err.errors || [err];
          errorArray.forEach((error) => {
            const fieldName = formatFieldName(error.path?.[0] || "field");
            allErrorMessages.push(
              `History ${index + 1} - ${fieldName}: ${error.message}`
            );
          });
        }
      });
    }

    // Validate Accidents (Tab 3)
    if (editFormData.accidents && editFormData.accidents.length > 0) {
      editFormData.accidents.forEach((accident, index) => {
        // Skip validation for empty accident records (no type and no date)
        if (
          (!accident.type || accident.type.trim() === "") &&
          (!accident.date || accident.date.trim() === "")
        ) {
          return; // Skip this accident record
        }

        try {
          accidentViolationSchema.parse(accident);
        } catch (err) {
          errors[`accidents[${index}]`] = err.errors || [err];
          newTabErrors[3] = true;

          // Collect all errors from this accident record
          const errorArray = err.errors || [err];
          errorArray.forEach((error) => {
            const fieldName = formatFieldName(error.path?.[0] || "field");
            allErrorMessages.push(
              `Accident/Violation ${index + 1} - ${fieldName}: ${error.message}`
            );
          });
        }
      });
    }

    // Update tab errors state
    setTabErrors(newTabErrors);
    setValidationErrors(errors);

    // Check if there are any errors
    const hasErrors = Object.keys(errors).length > 0;
    if (hasErrors) {
      // Debug logging to help identify validation issues
      console.log("🔍 Validation Errors Found:", errors);
      console.log("📋 All Error Messages:", allErrorMessages);
      console.log("📑 Tab Errors:", newTabErrors);

      // Get unique error messages (limit to first 10 for readability)
      const uniqueErrors = [...new Set(allErrorMessages)].slice(0, 10);

      dispatch(
        addToast({
          type: TOAST_TYPES.ERROR,
          message: ERROR_MESSAGES.VALIDATION_ERROR,
          details: uniqueErrors,
          duration: 8000,
        })
      );

      // Switch to the first tab with errors
      const firstErrorTab = Object.keys(newTabErrors).find(
        (key) => newTabErrors[key] === true
      );
      if (firstErrorTab) {
        setActiveTab(parseInt(firstErrorTab));
      }
      return;
    }

    // Filter out completely empty documents (no documentType AND no documentNumber)
    const filteredFormData = {
      ...editFormData,
      documents: (editFormData.documents || []).filter((doc) => {
        // Keep document if it has either documentType or documentNumber filled
        return (
          (doc.documentType && doc.documentType.trim() !== "") ||
          (doc.documentNumber && doc.documentNumber.trim() !== "")
        );
      }),
      // Filter out empty history records
      history: (editFormData.history || []).filter(
        (hist) => hist.employer || hist.jobTitle || hist.fromDate || hist.toDate
      ),
      // Filter out empty accidents
      accidents: (editFormData.accidents || []).filter(
        (acc) => acc.type && acc.date
      ),
    };

    // 🔍 DEBUG: Log documents being sent to backend
    console.log("📋 ========================================");
    console.log("📋 FRONTEND - Documents being sent to backend:");
    console.log("📋 Total documents:", filteredFormData.documents.length);
    filteredFormData.documents.forEach((doc, idx) => {
      console.log(`📋 Document ${idx}:`, {
        documentId: doc.documentId,
        documentType: doc.documentType,
        documentTypeId: doc.documentTypeId,
        documentNumber: doc.documentNumber,
        hasDocumentId: !!doc.documentId,
        documentIdType: typeof doc.documentId,
      });
    });
    console.log("📋 ========================================");

    // ✅ RESUBMISSION LOGIC - If entity is INACTIVE, change status to PENDING for resubmission
    const isResubmission = selectedDriver?.status === "INACTIVE";
    const updatedFormData = isResubmission
      ? {
          ...filteredFormData,
          basicInfo: {
            ...filteredFormData.basicInfo,
            status: "PENDING", // Restart approval workflow
          },
        }
      : filteredFormData;

    // Dispatch update action
    const result = await dispatch(
      updateDriver({
        driverId: id,
        driverData: updatedFormData,
      })
    );

    if (result.type.endsWith("/fulfilled")) {
      // Clear edit mode state first
      setIsEditMode(false);
      setEditFormData(null);
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

      // Reload driver data to reflect changes in UI
      await dispatch(fetchDriverById(id));

      // Show success toast after data is reloaded
      dispatch(
        addToast({
          type: "success",
          message: isResubmission
            ? "Driver resubmitted for approval successfully! Status changed to PENDING."
            : "Driver updated successfully",
        })
      );
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
      case "pending_approval":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "save_as_draft":
      case "draft":
        return "bg-blue-100 text-blue-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const ActiveTabComponent = isEditMode
    ? tabs[activeTab].editComponent
    : tabs[activeTab].viewComponent;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#F8FAFC] to-[#F1F5F9]">
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
              onClick={() => navigate(-1)}
              className="group p-2 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-105 border border-white/20"
            >
              <ArrowLeft className="w-5 h-5 text-white group-hover:text-white transition-colors" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  {selectedDriver?.fullName || "Driver Details"}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    selectedDriver?.status
                  )}`}
                >
                  {selectedDriver?.status || "UNKNOWN"}
                </span>
              </div>
              <div className="flex items-center gap-4 text-blue-100/80 text-xs">
                <div className="flex items-center gap-2">
                  <Hash className="w-3 h-3" />
                  <span>ID: {selectedDriver?.driverId || id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-3 h-3" />
                  <span>
                    Created by: {selectedDriver?.createdBy || "Unknown"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  <span>Created: {selectedDriver?.createdOn || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Approval Action Bar - shows approval status and actions */}
            {selectedDriver?.userApprovalStatus && (
              <ApprovalActionBar
                userApprovalStatus={selectedDriver.userApprovalStatus}
                entityId={selectedDriver.driverId}
                onRefreshData={handleRefreshData}
              />
            )}

            {/* Edit/Save/Cancel Buttons */}
            {console.log("🔍 BUTTON RENDER CHECK - DRIVER:", {
              isEditMode,
              canEdit,
              showButton: !isEditMode && canEdit,
            })}
            {isEditMode ? (
              <>
                <button
                  onClick={handleEditToggle}
                  className="group inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl font-medium text-sm hover:bg-white/20 transition-all duration-300 hover:scale-105"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>

                <button
                  onClick={handleSaveChanges}
                  disabled={isUpdating || isUpdatingDraft || isSubmittingDraft}
                  className="group inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#10B981] to-[#059669] text-white rounded-xl font-medium text-sm hover:from-[#059669] hover:to-[#10B981] transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isUpdating || isUpdatingDraft || isSubmittingDraft ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {isDraftDriver ? "Processing..." : "Saving..."}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                      {isDraftDriver ? "Submit Changes" : "Save Changes"}
                    </>
                  )}
                </button>
              </>
            ) : (
              canEdit && (
                <button
                  onClick={handleEditToggle}
                  className="group inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#10B981] to-[#059669] text-white rounded-xl font-medium text-sm hover:from-[#059669] hover:to-[#10B981] transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-green-500/25"
                >
                  <Edit className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                  {isDraftDriver ? "Edit Draft" : "Edit Details"}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* ✅ REJECTION REMARKS DISPLAY - Show for INACTIVE status */}
      {selectedDriver?.status === "INACTIVE" &&
        selectedDriver?.userApprovalStatus?.remarks && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 mx-6 mt-4 rounded-lg shadow-sm">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-red-900 font-semibold text-lg mb-2 flex items-center gap-2">
                  Rejection Remarks
                  <span className="text-xs font-normal text-red-700 bg-red-100 px-2 py-1 rounded-full">
                    Entity Rejected
                  </span>
                </h4>
                <p className="text-red-800 leading-relaxed whitespace-pre-wrap">
                  {selectedDriver.userApprovalStatus.remarks}
                </p>
                {isCreator && !isEditMode && (
                  <div className="mt-4 text-sm text-red-700 bg-red-100 p-3 rounded-md">
                    <strong>Note:</strong> Please address the rejection remarks
                    and click "Edit Details" to make changes, then save to
                    resubmit for approval.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      {/* Main Content Container */}
      <div className="px-6 py-4">
        <div className="space-y-4">
          {/* Loading State */}
          {isFetchingDetails && (
            <Card
              className="overflow-hidden border shadow-md"
              style={{
                backgroundColor: safeTheme.colors.card.background,
                borderColor: safeTheme.colors.card.border,
              }}
            >
              <div className="p-8 text-center">
                <Loader2
                  className="h-12 w-12 animate-spin mx-auto mb-4"
                  style={{ color: safeActionButtonTheme.primary.background }}
                />
                <p style={{ color: safeTheme.colors.text.secondary }}>
                  Loading driver details...
                </p>
              </div>
            </Card>
          )}

          {/* Error State */}
          {error && !isFetchingDetails && (
            <Card
              className="overflow-hidden border shadow-md"
              style={{
                backgroundColor: safeTheme.colors.card.background,
                borderColor: safeTheme.colors.card.border,
              }}
            >
              <div className="p-8 text-center">
                <User
                  className="h-24 w-24 mx-auto mb-4"
                  style={{ color: safeTheme.colors.status.error }}
                />
                <h2
                  className="text-2xl font-bold mb-2"
                  style={{ color: safeTheme.colors.status.error }}
                >
                  Error Loading Driver
                </h2>
                <p
                  style={{ color: safeTheme.colors.text.secondary }}
                  className="mb-4"
                >
                  {error?.message || "Something went wrong"}
                </p>
                <Button
                  onClick={handleBack}
                  style={{
                    backgroundColor: actionButtonTheme.primary.background,
                    color: actionButtonTheme.primary.text,
                  }}
                >
                  Back to Driver List
                </Button>
              </div>
            </Card>
          )}

          {/* Content */}
          {!isFetchingDetails && !error && selectedDriver && (
            <>
              {/* Tab Navigation - Matches Transporter Design */}
              <div className="bg-gradient-to-r from-[#0D1A33] to-[#1A2B47] px-4 rounded-t-2xl relative">
                {/* Tab backdrop blur effect */}
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-t-2xl"></div>

                <div className="relative flex flex-nowrap gap-2 py-2 scrollable-tabs px-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    const hasError = tabErrors[tab.id];

                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          // // Disable edit mode when switching to Dashboard tab (view-only)
                          // if (tab.id === 0) {
                          //   setIsEditMode(false);
                          // }
                        }}
                        className={`text-nowrap group relative px-6 py-4 font-medium text-sm rounded-t-2xl transition-all duration-300 flex items-center gap-3 ${
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
                        <span className="font-semibold tracking-wide">
                          {tab.name}
                        </span>

                        {/* Error indicator dot */}
                        {hasError && isEditMode && (
                          <div className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        )}

                        {/* Mode indicator (only show when no errors) */}
                        {isActive && !hasError && (
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
              </div>

              {/* Tab Content */}
              <div className="bg-white/60 backdrop-blur-sm rounded-b-3xl shadow-xl border border-white/40">
                <div className="p-4">
                  <ActiveTabComponent
                    driver={selectedDriver}
                    driverId={id}
                    formData={editFormData}
                    setFormData={setEditFormData}
                    onFormDataChange={handleFormDataChange}
                    validationErrors={validationErrors}
                    onValidationErrorsChange={handleValidationErrorsChange}
                    onTabErrorChange={handleTabErrorChange}
                    masterData={masterData}
                    isEditMode={isEditMode}
                    errors={validationErrors}
                    isLoading={isFetchingDetails}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Submit Draft Modal */}
      <SubmitDraftModal
        isOpen={showSubmitModal}
        onUpdateDraft={handleUpdateDraft}
        onSubmitForApproval={handleSubmitForApproval}
        onCancel={() => setShowSubmitModal(false)}
        isLoading={isUpdatingDraft || isSubmittingDraft}
      />
    </div>
  );
};

export default DriverDetailsPage;
