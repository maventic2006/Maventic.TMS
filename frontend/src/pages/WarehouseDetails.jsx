import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import TMSHeader from "../components/layout/TMSHeader";
import { getPageTheme } from "../theme.config";
import {
  fetchWarehouseById,
  updateWarehouse,
  updateWarehouseDraft,
  submitWarehouseFromDraft,
  fetchMasterData,
  clearError,
} from "../redux/slices/warehouseSlice";
import { addToast } from "../redux/slices/uiSlice";
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  Building2,
  MapPin,
  Settings,
  FileText,
  AlertTriangle,
  Eye,
  User,
  Calendar,
  Hash,
  Map,
  Send,
} from "lucide-react";

import { getComponentTheme } from "../utils/theme";
import { TOAST_TYPES } from "../utils/constants";
import { formatDateForInput } from "../utils/helpers";
import EmptyState from "../components/ui/EmptyState";

// Import warehouse approval component
import ApprovalActionBar from "../components/approval/ApprovalActionBar";

// Import warehouse tab components
import GeneralDetailsViewTab from "../components/warehouse/tabs/GeneralDetailsViewTab";
import AddressViewTab from "../components/warehouse/tabs/AddressViewTab";
import DocumentsViewTab from "../components/warehouse/tabs/DocumentsViewTab";
import GeofencingViewTab from "../components/warehouse/tabs/GeofencingViewTab";

// Import edit components for edit mode
import GeneralDetailsEditTab from "../features/warehouse/components/GeneralDetailsTab";
import AddressEditTab from "../features/warehouse/components/AddressTab";
import DocumentsEditTab from "../features/warehouse/components/DocumentsTab";
import GeofencingEditTab from "../features/warehouse/components/GeofencingTab";

const WarehouseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, role } = useSelector((state) => state.auth);
  const { warehouses, currentWarehouse, masterData, loading, error } =
    useSelector((state) => state.warehouse);

  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [editFormData, setEditFormData] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [tabErrors, setTabErrors] = useState({
    0: false, // General Details
    1: false, // Address
    2: false, // Documents
    3: false, // Geofencing
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const actionButtonTheme = getComponentTheme("actionButton");
  const tabButtonTheme = getComponentTheme("tabButton");
  const theme = getPageTheme("tab");

  // Helper: Transform flat backend structure to nested frontend structure
  const transformToEditFormat = (warehouseData) => {
    if (!warehouseData) return null;

    // Extract the first address if it's an array, or use the address object
    const address =
      Array.isArray(warehouseData.address) && warehouseData.address.length > 0
        ? warehouseData.address[0]
        : warehouseData.address || {};

    // Transform documents to edit format with date formatting
    const transformedDocuments = (warehouseData.documents || []).map((doc) => ({
      documentUniqueId: doc.documentUniqueId || "", // ✅ PRESERVE document ID for updates
      documentType: doc.documentTypeId || doc.documentType || "",
      documentNumber: doc.documentNumber || "",
      validFrom: formatDateForInput(doc.validFrom) || "", // ✅ Format date for input
      validTo: formatDateForInput(doc.validTo) || "", // ✅ Format date for input
      fileName: doc.fileName || "",
      fileType: doc.fileType || "",
      fileData: doc.fileData || "",
      status: doc.status !== undefined ? doc.status : true,
    }));

    return {
      generalDetails: {
        consignorId: warehouseData.consignor_id || "", // ✅ ADDED: Include consignor ID
        warehouseName: warehouseData.warehouse_name1 || "",
        warehouseName2: warehouseData.warehouse_name2 || "",
        warehouseType: warehouseData.warehouse_type || "",
        materialType: warehouseData.material_type_id || "",
        language: warehouseData.language || "EN",
        vehicleCapacity: warehouseData.vehicle_capacity || 0,
        speedLimit: warehouseData.speed_limit || 20,
        virtualYardIn: warehouseData.virtual_yard_in || false,
        radiusVirtualYardIn: warehouseData.radius_for_virtual_yard_in || 0,
        weighBridge: warehouseData.weigh_bridge_availability || false,
        gatepassSystem: warehouseData.gatepass_system_available || false,
        fuelAvailability: warehouseData.fuel_availability || false,
        stagingArea: warehouseData.staging_area_for_goods_organization || false,
        driverWaitingArea: warehouseData.driver_waiting_area || false,
        gateInChecklistAuth: warehouseData.gate_in_checklist_auth || false,
        gateOutChecklistAuth: warehouseData.gate_out_checklist_auth || false,
      },
      address: {
        addressType: address.address_type_id || "",
        country: address.country || "",
        state: address.state || "",
        city: address.city || "",
        district: address.district || "",
        street1: address.street_1 || address.street1 || "",
        street2: address.street_2 || address.street2 || "",
        postalCode: address.postal_code || address.postalCode || "",
        vatNumber: address.vat_number || address.vatNumber || "",
        tinPan: address.tin_pan || address.tinPan || "",
        tan: address.tan || "",
      },
      documents: transformedDocuments,
      geofencing: warehouseData.geofencing || warehouseData.subLocations || [],
    };
  };

  // Helper: Transform nested frontend structure back to flat backend structure
  const transformToBackendFormat = (editData) => {
    if (!editData) return null;

    return {
      warehouse_name1: editData.generalDetails?.warehouseName || "",
      warehouse_name2: editData.generalDetails?.warehouseName2 || "",
      warehouse_type: editData.generalDetails?.warehouseType || "",
      material_type_id: editData.generalDetails?.materialType || "",
      language: editData.generalDetails?.language || "EN",
      vehicle_capacity: editData.generalDetails?.vehicleCapacity || 0,
      speed_limit: editData.generalDetails?.speedLimit || 20,
      virtual_yard_in: editData.generalDetails?.virtualYardIn || false,
      radius_for_virtual_yard_in:
        editData.generalDetails?.radiusVirtualYardIn || 0,
      weigh_bridge_availability: editData.generalDetails?.weighBridge || false,
      fuel_availability: editData.generalDetails?.fuelAvailability || false,
      staging_area_for_goods_organization:
        editData.generalDetails?.stagingArea || false,
      driver_waiting_area: editData.generalDetails?.driverWaitingArea || false,
      gate_in_checklist_auth:
        editData.generalDetails?.gateInChecklistAuth || false,
      gate_out_checklist_auth:
        editData.generalDetails?.gateOutChecklistAuth || false,
      gatepass_system_available:
        editData.generalDetails?.gatepassSystem || false,
      // ✅ FIXED: Use consignorId from editData if available (preserved from transform)
      consignor_id:
        editData.generalDetails?.consignorId ||
        currentWarehouse?.consignor_id ||
        user?.consignor_id ||
        "",
      address: editData.address
        ? {
            address_type_id: editData.address.addressType || "",
            country: editData.address.country || "",
            state: editData.address.state || "",
            city: editData.address.city || "",
            district: editData.address.district || "",
            street_1: editData.address.street1 || "",
            street_2: editData.address.street2 || "",
            postal_code: editData.address.postalCode || "",
            vat_number: editData.address.vatNumber || "",
            tin_pan: editData.address.tinPan || "",
            tan: editData.address.tan || "",
          }
        : {},
      documents: editData.documents || [],
      geofencing: editData.geofencing || [],
    };
  };

  const tabs = [
    {
      id: 0,
      name: "General Details",
      icon: Building2,
      viewComponent: GeneralDetailsViewTab,
      editComponent: GeneralDetailsEditTab,
    },
    {
      id: 1,
      name: "Address",
      icon: MapPin,
      viewComponent: AddressViewTab,
      editComponent: AddressEditTab,
    },
    {
      id: 2,
      name: "Documents",
      icon: FileText,
      viewComponent: DocumentsViewTab,
      editComponent: DocumentsEditTab,
    },
    {
      id: 3,
      name: "Geofencing",
      icon: Map,
      viewComponent: GeofencingViewTab,
      editComponent: GeofencingEditTab,
    },
  ];

  // Load warehouse data from API
  useEffect(() => {
    if (id) {
      dispatch(fetchWarehouseById(id));
    }
  }, [id, dispatch]);

  // Fetch master data on component mount
  useEffect(() => {
    dispatch(fetchMasterData());
  }, [dispatch]);

  // Set edit form data when warehouse data is loaded
  useEffect(() => {
    if (currentWarehouse && !editFormData) {
      // Transform flat backend structure to nested frontend structure
      setEditFormData(transformToEditFormat(currentWarehouse));
    }
  }, [currentWarehouse, editFormData]);

  // Refresh data function for error recovery
  const handleRefreshData = () => {
    if (id) {
      dispatch(fetchWarehouseById(id));
      dispatch(fetchMasterData());
    }
  };

  // Check if warehouse is a draft
  const isDraftWarehouse = currentWarehouse?.status === "SAVE_AS_DRAFT";

  // Check if current user is the creator of this warehouse
  // Use String() to ensure type consistency in comparison
  // Backend returns created_by (snake_case), not createdBy (camelCase)
  const isCreator =
    currentWarehouse?.created_by &&
    user?.user_id &&
    String(currentWarehouse.created_by) === String(user.user_id);

  // Check if current user is an approver
  // Check both role and user_type_id for Product Owner detection
  const isApprover =
    user?.role === "Product Owner" ||
    user?.role === "admin" ||
    user?.user_type_id === "UT001"; // UT001 is Owner/Product Owner

  // 🔍 DEBUG: Log creator and approver checks
  console.log("🔍 EDIT BUTTON DEBUG - WAREHOUSE:");
  console.log("  Current User ID:", user?.user_id, typeof user?.user_id);
  console.log("  Current User Role:", user?.role);
  console.log("  Current User Type ID:", user?.user_type_id);
  console.log(
    "  Warehouse Created By:",
    currentWarehouse?.created_by,
    typeof currentWarehouse?.created_by
  );
  console.log(
    "  String Comparison:",
    String(currentWarehouse?.created_by),
    "===",
    String(user?.user_id)
  );
  console.log("  Is Creator:", isCreator);
  console.log("  Is Approver:", isApprover, "(role-based or UT001)");
  console.log("  Is Draft:", isDraftWarehouse);
  console.log("  Status:", currentWarehouse?.status);

  // ✅ PERMISSION LOGIC - Rejection/Resubmission Workflow
  // Determine if user can edit based on entity status and user role
  const canEdit = React.useMemo(() => {
    const status = currentWarehouse?.status;

    console.log("🔍 CANEDIT CALCULATION - WAREHOUSE:");
    console.log("  Status:", status);
    console.log("  isDraftWarehouse:", isDraftWarehouse);
    console.log("  isCreator:", isCreator);
    console.log("  isApprover:", isApprover);

    // DRAFT: Only creator can edit
    if (isDraftWarehouse) {
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
  }, [currentWarehouse?.status, isCreator, isApprover, isDraftWarehouse]);

  console.log("🔍 FINAL CANEDIT VALUE - WAREHOUSE:", canEdit);

  // Debug logging for approval data
  useEffect(() => {
    if (currentWarehouse) {
      console.log("🔍 WarehouseDetails - Warehouse Data Loaded:");
      console.log("  Warehouse ID:", currentWarehouse.warehouseId);
      console.log("  Status:", currentWarehouse.status);
      console.log(
        "  User Approval Status:",
        currentWarehouse.userApprovalStatus
      );
      console.log(
        "  ✅ Remarks Available:",
        currentWarehouse.userApprovalStatus?.remarks ? "YES" : "NO"
      );
      console.log(
        "  Remarks Content:",
        currentWarehouse.userApprovalStatus?.remarks
      );
      console.log("  Current User:", user);
      console.log("  Full currentWarehouse object:", currentWarehouse);
    }
  }, [currentWarehouse, user]);

  // Track unsaved changes
  useEffect(() => {
    if (isEditMode && editFormData && currentWarehouse) {
      const hasChanges =
        JSON.stringify(editFormData) !== JSON.stringify(currentWarehouse);
      setHasUnsavedChanges(hasChanges);
    }
  }, [editFormData, currentWarehouse, isEditMode]);

  // Clear errors when switching tabs
  useEffect(() => {
    if (!isEditMode) {
      setValidationErrors({});
    }
  }, [activeTab, isEditMode]);

  const handleEditToggle = () => {
    if (isEditMode && hasUnsavedChanges) {
      // Show confirmation dialog for unsaved changes
      const confirmCancel = window.confirm(
        "You have unsaved changes. Are you sure you want to cancel? All changes will be lost."
      );

      if (!confirmCancel) {
        return;
      }
    }

    if (isEditMode) {
      // Cancel edit mode - reset form data to transformed warehouse data
      setEditFormData(transformToEditFormat(currentWarehouse));
      setValidationErrors({});
      setTabErrors({
        0: false,
        1: false,
        2: false,
        3: false,
      });
      setHasUnsavedChanges(false);
    }
    setIsEditMode(!isEditMode);
  };
  const validateAllSections = (formData) => {
    const errors = {};

    // Basic validation for required fields - check NESTED structure
    if (
      !formData.generalDetails?.warehouseName ||
      formData.generalDetails.warehouseName.trim() === ""
    ) {
      if (!errors.general) errors.general = {};
      errors.general.warehouseName = "Warehouse name is required";
    }

    if (
      !formData.generalDetails?.warehouseType ||
      formData.generalDetails.warehouseType.trim() === ""
    ) {
      if (!errors.general) errors.general = {};
      errors.general.warehouseType = "Warehouse type is required";
    }

    // Address validation
    if (!formData.address?.country || formData.address.country.trim() === "") {
      if (!errors.address) errors.address = {};
      errors.address.country = "Country is required";
    }

    if (!formData.address?.state || formData.address.state.trim() === "") {
      if (!errors.address) errors.address = {};
      errors.address.state = "State is required";
    }

    return errors;
  };

  const handleSaveChanges = async () => {
    try {
      // Clear previous errors
      setValidationErrors({});
      setTabErrors({
        0: false,
        1: false,
        2: false,
        3: false,
      });

      // Check if this is a draft
      const isDraft = currentWarehouse?.status === "SAVE_AS_DRAFT";

      // For drafts: NO validation, just update
      // For non-drafts: Full validation required
      if (!isDraft) {
        // Validate all sections for non-draft warehouses
        const errors = validateAllSections(editFormData);

        if (Object.keys(errors).length > 0) {
          setValidationErrors(errors);

          // Update tab errors to show which tabs have issues
          const newTabErrors = {
            0: errors.general && Object.keys(errors.general).length > 0,
            1: errors.facilities && Object.keys(errors.facilities).length > 0,
            2: errors.address && Object.keys(errors.address).length > 0,
            3: errors.documents && Object.keys(errors.documents).length > 0,
          };
          setTabErrors(newTabErrors);

          // Collect all error messages for user-friendly display
          const errorMessages = [];
          if (errors.general) {
            Object.values(errors.general).forEach((msg) =>
              errorMessages.push(msg)
            );
          }
          if (errors.facilities) {
            Object.values(errors.facilities).forEach((msg) =>
              errorMessages.push(msg)
            );
          }
          if (errors.address) {
            Object.values(errors.address).forEach((msg) =>
              errorMessages.push(msg)
            );
          }
          if (errors.documents) {
            Object.values(errors.documents).forEach((msg) =>
              errorMessages.push(msg)
            );
          }

          // Find the first tab with errors and switch to it
          if (newTabErrors[0]) {
            setActiveTab(0);
          } else if (newTabErrors[1]) {
            setActiveTab(1);
          } else if (newTabErrors[2]) {
            setActiveTab(2);
          } else if (newTabErrors[3]) {
            setActiveTab(3);
          }

          // Show specific error message or first few errors
          const errorMessage =
            errorMessages.length === 1
              ? errorMessages[0]
              : errorMessages.length <= 3
              ? errorMessages.join(", ")
              : `${errorMessages.length} validation errors found: ${
                  errorMessages[0]
                }, ${errorMessages[1]}, and ${
                  errorMessages.length - 2
                } more...`;

          dispatch(
            addToast({
              type: TOAST_TYPES.ERROR,
              message: errorMessage,
            })
          );
          return;
        }
      }

      // Clear any previous errors
      setValidationErrors({});
      setTabErrors({
        0: false,
        1: false,
        2: false,
        3: false,
      });
      dispatch(clearError());

      // ✅ RESUBMISSION LOGIC - If entity is INACTIVE (rejected), change status to PENDING
      const isResubmission = currentWarehouse?.status === "INACTIVE";

      // Transform nested frontend structure to flat backend structure
      let backendData = transformToBackendFormat(editFormData);

      // If resubmitting, update the status to PENDING to restart approval workflow
      if (isResubmission) {
        backendData = {
          ...backendData,
          status: "PENDING", // Restart approval workflow
        };
      }

      console.log("🔍 RESUBMISSION CHECK - WAREHOUSE:");
      console.log("  Current Status:", currentWarehouse?.status);
      console.log("  Is Resubmission:", isResubmission);
      console.log("  Final Status:", backendData?.status);

      // Call appropriate update API based on status
      let result;
      if (isDraft) {
        // Update draft (no validation)
        result = await dispatch(
          updateWarehouseDraft({
            warehouseId: id,
            warehouseData: backendData,
          })
        ).unwrap();
      } else {
        // Update regular warehouse (full validation)
        result = await dispatch(
          updateWarehouse({
            id: id,
            data: backendData,
          })
        ).unwrap();
      }

      // Success - show toast notification
      dispatch(
        addToast({
          type: TOAST_TYPES.SUCCESS,
          message: isResubmission
            ? "Warehouse resubmitted for approval successfully! Status changed to PENDING."
            : isDraft
            ? "Warehouse draft updated successfully!"
            : "Warehouse updated successfully!",
        })
      );

      // Refresh the warehouse data
      await dispatch(fetchWarehouseById(id));

      // Switch to view mode
      setIsEditMode(false);
      setHasUnsavedChanges(false);
      setValidationErrors({});
    } catch (err) {
      console.error("Error saving warehouse:", err);

      // IMPORTANT: Clear Redux error state immediately to prevent "Error Loading Data" page
      dispatch(clearError());

      // Check if it's a validation error from backend (400 Bad Request)
      if (
        err.code === "VALIDATION_ERROR" ||
        err.message?.includes("required")
      ) {
        // Backend validation error - show inline errors and stay in edit mode

        // Try to map backend error to tab and field
        let tabWithError = null;
        const backendErrors = {};

        if (err.field) {
          // Parse field path like "warehouse_name1"
          const fieldMatch = err.field.match(/^(\w+)(?:\[(\d+)\])?\.?(.+)?$/);

          if (fieldMatch) {
            const [, section, index, field] = fieldMatch;

            // Map section to tab index
            const tabMapping = {
              general: 0,
              facilities: 1,
              address: 2,
              documents: 3,
            };

            tabWithError = tabMapping[section] || 0;

            if (index !== undefined) {
              // Array field error
              if (!backendErrors[section]) backendErrors[section] = {};
              if (!backendErrors[section][index])
                backendErrors[section][index] = {};
              if (field) {
                backendErrors[section][index][field] = err.message;
              }
            } else if (field) {
              // Object field error
              if (!backendErrors[section]) backendErrors[section] = {};
              backendErrors[section][field] = err.message;
            }
          }
        }

        // Set validation errors
        setValidationErrors(backendErrors);

        // Update tab errors
        const newTabErrors = {
          0: tabWithError === 0,
          1: tabWithError === 1,
          2: tabWithError === 2,
          3: tabWithError === 3,
        };
        setTabErrors(newTabErrors);

        // Switch to tab with error
        if (tabWithError !== null) {
          setActiveTab(tabWithError);
        }

        // Show error toast
        dispatch(
          addToast({
            type: TOAST_TYPES.ERROR,
            message:
              err.message || "Please fix validation errors before saving.",
          })
        );

        // STAY IN EDIT MODE - do not switch to view mode
        return;
      }

      // Other errors (network, server, etc.) - show generic error toast
      dispatch(
        addToast({
          type: TOAST_TYPES.ERROR,
          message:
            err.message || "Failed to update warehouse. Please try again.",
        })
      );
    }
  };

  // Submit warehouse draft for approval
  const handleSubmitForApproval = async () => {
    try {
      // Confirm submission
      // const confirmed = window.confirm(
      //   "Are you sure you want to submit this warehouse for approval? Full validation will be applied."
      // );

      // if (!confirmed) {
      //   return;
      // }

      // Clear previous errors
      dispatch(clearError());

      // Transform nested frontend structure to flat backend structure
      const backendData = transformToBackendFormat(editFormData);

      // Submit for approval (will perform full validation)
      const result = await dispatch(
        submitWarehouseFromDraft({
          warehouseId: id,
          warehouseData: backendData,
        })
      ).unwrap();

      // Success
      dispatch(
        addToast({
          type: TOAST_TYPES.SUCCESS,
          message: "Warehouse submitted for approval successfully!",
        })
      );

      // Refresh the warehouse data
      await dispatch(fetchWarehouseById(id));

      // Switch to view mode
      setIsEditMode(false);
      setHasUnsavedChanges(false);
      setValidationErrors({});
    } catch (err) {
      console.error("Error submitting warehouse for approval:", err);

      // Clear Redux error state
      dispatch(clearError());

      // Check if it's a validation error
      if (
        err.code === "VALIDATION_ERROR" ||
        err.message?.includes("required") ||
        err.message?.includes("validation")
      ) {
        // Build user-friendly error message
        let errorMessage = err.message || "Validation failed";

        // If there's a field specified, make it more specific
        if (err.field) {
          errorMessage = `${err.message}`;

          // If there's expected format info, add it
          if (err.expectedFormat) {
            errorMessage += ` (Expected format: ${err.expectedFormat})`;
          }
        }

        // Show validation error
        dispatch(
          addToast({
            type: TOAST_TYPES.ERROR,
            message: errorMessage,
          })
        );

        // Stay in edit mode to allow user to fix errors
        return;
      }

      // Other errors
      dispatch(
        addToast({
          type: TOAST_TYPES.ERROR,
          message:
            err.message ||
            "Failed to submit warehouse for approval. Please try again.",
        })
      );
    }
  };

  const handleBackClick = () => {
    if (isEditMode && hasUnsavedChanges) {
      const confirmLeave = window.confirm(
        "You have unsaved changes. Are you sure you want to leave? All changes will be lost."
      );
      if (!confirmLeave) {
        return;
      }
    }
    navigate("/warehouse");
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const handleFormDataChange = (section, data) => {
    setEditFormData((prev) => ({
      ...prev,
      [section]: data,
    }));
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#F8FAFC] to-[#F1F5F9] flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/40 max-w-sm w-full mx-4">
          <div className="flex justify-center mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-[#1D4ED8]"></div>
          </div>
          <h3 className="text-lg font-semibold text-[#0D1A33] mb-2 text-center">
            Loading Details
          </h3>
          <p className="text-[#4A5568] text-sm text-center">
            Please wait while we fetch warehouse information...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#F8FAFC] to-[#F1F5F9] flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/40 max-w-md w-full mx-4">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-[#0D1A33] mb-2 text-center">
            Unable to Load Data
          </h3>
          <p className="text-[#4A5568] text-sm mb-4 text-center">
            We encountered an issue loading the warehouse information.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
            <p className="text-xs text-red-700">{error}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={handleRefreshData}
              className="bg-[#1D4ED8] hover:bg-[#1E40AF] text-white px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200"
            >
              Try Again
            </button>
            <button
              onClick={handleBackClick}
              className="border border-gray-300 hover:border-[#1D4ED8] hover:text-[#1D4ED8] text-[#4A5568] px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-1 inline" />
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No warehouse found
  if (!currentWarehouse) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#F8FAFC] to-[#F1F5F9] flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/40 max-w-md w-full mx-4">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building2 className="h-8 w-8 text-[#1D4ED8]" />
          </div>
          <h3 className="text-lg font-semibold text-[#0D1A33] mb-2 text-center">
            Warehouse Not Found
          </h3>
          <p className="text-[#4A5568] text-sm mb-6 text-center">
            The warehouse you're looking for doesn't exist or you don't have
            access to it.
          </p>
          <div className="flex justify-center">
            <button
              onClick={handleBackClick}
              className="bg-[#1D4ED8] hover:bg-[#1E40AF] text-white px-6 py-2 text-sm rounded-lg font-medium transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-1 inline" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const ActiveTabComponent = tabs.find(
    (tab) => tab.id === activeTab
  )?.viewComponent;
  const ActiveEditComponent = tabs.find(
    (tab) => tab.id === activeTab
  )?.editComponent;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#F8FAFC] to-[#F1F5F9]">
      <TMSHeader theme={theme} />

      {/* Modern Header Bar with glassmorphism - Matches TransporterDetails exactly */}
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
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  {currentWarehouse.warehouse_name1}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    currentWarehouse.status === "ACTIVE"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                      : currentWarehouse.status === "PENDING"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                      : currentWarehouse.status === "SAVE_AS_DRAFT"
                      ? "bg-blue-500/20 text-blue-300 border border-blue-400/30"
                      : "bg-red-500/20 text-red-300 border border-red-400/30"
                  }`}
                >
                  {currentWarehouse.status === "SAVE_AS_DRAFT"
                    ? "Draft"
                    : currentWarehouse.status || "Unknown"}
                </span>
              </div>
              <div className="flex items-center gap-4 text-blue-100/80 text-xs">
                <div className="flex items-center gap-2">
                  <Hash className="w-3 h-3" />
                  <span>ID: {currentWarehouse.warehouse_id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-3 h-3" />
                  <span>Created by: {currentWarehouse.created_by}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  <span>
                    Created:{" "}
                    {new Date(currentWarehouse.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Warehouse Approval Action Bar (only in view mode) */}
            {!isEditMode && currentWarehouse?.userApprovalStatus && (
              <ApprovalActionBar
                userApprovalStatus={currentWarehouse.userApprovalStatus}
                entityId={id}
                onRefreshData={handleRefreshData}
              />
            )}

            {hasUnsavedChanges && (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 backdrop-blur-sm text-amber-300 border border-amber-400/30 rounded-xl font-medium text-sm">
                <AlertTriangle className="w-4 h-4" />
                Unsaved Changes
              </div>
            )}

            {console.log("🔍 BUTTON RENDER CHECK - WAREHOUSE:", {
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

                {/* Show "Submit for Approval" button for drafts in edit mode */}
                {currentWarehouse?.status === "SAVE_AS_DRAFT" && (
                  <button
                    onClick={handleSubmitForApproval}
                    disabled={loading}
                    className="group inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white rounded-xl font-medium text-sm hover:from-[#2563EB] hover:to-[#3B82F6] transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                        Submit for Approval
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={handleSaveChanges}
                  disabled={loading}
                  className="group inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#10B981] to-[#059669] text-white rounded-xl font-medium text-sm hover:from-[#059669] hover:to-[#10B981] transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                      {currentWarehouse?.status === "SAVE_AS_DRAFT"
                        ? "Save Draft"
                        : "Save Changes"}
                    </>
                  )}
                </button>
              </>
            ) : (
              !isEditMode &&
              canEdit && (
                <button
                  onClick={handleEditToggle}
                  className="group inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#10B981] to-[#059669] text-white rounded-xl font-medium text-sm hover:from-[#059669] hover:to-[#10B981] transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-green-500/25"
                >
                  <Edit className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                  {currentWarehouse?.status === "SAVE_AS_DRAFT"
                    ? "Edit Draft"
                    : "Edit Details"}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* ✅ REJECTION REMARKS BANNER - Show when entity is rejected (INACTIVE) */}
      {currentWarehouse?.status === "INACTIVE" &&
        currentWarehouse?.userApprovalStatus?.remarks && (
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
                  {currentWarehouse.userApprovalStatus.remarks}
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

        <div className="relative flex flex-nowrap gap-2 py-2 scrollable-tabs px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const hasError = isEditMode && tabErrors[tab.id];

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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
                <span className="font-semibold tracking-wide">{tab.name}</span>

                {/* Error indicator dot (like create page) */}
                {hasError && (
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

      {/* Modern Content Area - Matches TransporterDetails exactly */}
      <div className="px-0 py-0 space-y-8">
        {/* Enhanced Tab Content Container */}
        <div className="relative">
          {tabs.map((tab) => {
            const TabComponent = isEditMode
              ? tab.editComponent
              : tab.viewComponent;
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
                  {/* Render EmptyState if no component available, otherwise render the component */}
                  {!TabComponent ? (
                    <EmptyState message="No data available" />
                  ) : (
                    <div className="p-4">
                      <TabComponent
                        formData={isEditMode ? editFormData : currentWarehouse}
                        setFormData={isEditMode ? setEditFormData : undefined}
                        masterData={masterData}
                        errors={
                          isEditMode
                            ? tab.id === 0
                              ? validationErrors.general || {}
                              : tab.id === 1
                              ? validationErrors.facilities || {}
                              : tab.id === 2
                              ? validationErrors.address || {}
                              : tab.id === 3
                              ? validationErrors.documents || {}
                              : {}
                            : {}
                        }
                        isEditMode={isEditMode}
                        warehouseData={currentWarehouse}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WarehouseDetails;
