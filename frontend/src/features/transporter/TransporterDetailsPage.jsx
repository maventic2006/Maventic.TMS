import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import TMSHeader from "../../components/layout/TMSHeader";
import { getPageTheme } from "../../theme.config";
import {
  fetchTransporterById,
  updateTransporter,
  fetchMasterData,
  clearError,
} from "../../redux/slices/transporterSlice";
import { addToast } from "../../redux/slices/uiSlice";
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  Building2,
  MapPin,
  Globe,
  FileText,
  AlertTriangle,
  Eye,
  User,
  Calendar,
  Hash,
  Caravan,
} from "lucide-react";

import { getComponentTheme } from "../../utils/theme";
import { validateFormSection } from "./validation";
import { TOAST_TYPES } from "../../utils/constants";
import EmptyState from "../../components/ui/EmptyState";

// Import tab components (we'll create view versions)
import GeneralDetailsViewTab from "./components/GeneralDetailsViewTab";
import AddressContactsViewTab from "./components/AddressContactsViewTab";
import ServiceableAreaViewTab from "./components/ServiceableAreaViewTab";
import DocumentsViewTab from "./components/DocumentsViewTab";

// Import edit components for edit mode
import GeneralDetailsTab from "./components/GeneralDetailsTab";
import AddressContactsTab from "./components/AddressContactsTab";
import ServiceableAreaTab from "./components/ServiceableAreaTab";
import DocumentsTab from "./components/DocumentsTab";

// Import approval component
import ApprovalActionBar from "../../components/approval/ApprovalActionBar";

const TransporterDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, role } = useSelector((state) => state.auth);
  const { selectedTransporter, isFetchingDetails, isUpdating, error } =
    useSelector((state) => state.transporter);

  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [editFormData, setEditFormData] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [tabErrors, setTabErrors] = useState({
    0: false, // General Details
    1: false, // Address & Contacts
    2: false, // Serviceable Area
    3: false, // Documents
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const actionButtonTheme = getComponentTheme("actionButton");
  const tabButtonTheme = getComponentTheme("tabButton");
  const theme = getPageTheme("tab");

  const tabs = [
    {
      id: 0,
      name: "General Details",
      icon: Building2,
      viewComponent: GeneralDetailsViewTab,
      editComponent: GeneralDetailsTab,
    },
    {
      id: 1,
      name: "Address & Contacts",
      icon: MapPin,
      viewComponent: AddressContactsViewTab,
      editComponent: AddressContactsTab,
    },
    {
      id: 2,
      name: "Serviceable Area",
      icon: Globe,
      viewComponent: ServiceableAreaViewTab,
      editComponent: ServiceableAreaTab,
    },
    {
      id: 3,
      name: "Documents",
      icon: FileText,
      viewComponent: DocumentsViewTab,
      editComponent: DocumentsTab,
    },
    {
      id: 4,
      name: "Transporter and Consignor Mapping",
      icon: User,
    },
    {
      id: 5,
      name: "Transporter and Vehicle Mapping",
      icon: Caravan,
    },
    {
      id: 6,
      name: "Transporter and Driver Mapping",
      icon: User,
    },
    {
      id: 7,
      name: "Transporter and Vehicle Owner Mapping",
      icon: User,
    },
    {
      id: 8,
      name: "Blacklist Mapping",
      icon: User,
    },
  ];

  // Load transporter data from API
  useEffect(() => {
    if (id) {
      dispatch(fetchTransporterById(id));
    }
  }, [id, dispatch]);

  // Fetch master data on component mount
  useEffect(() => {
    dispatch(fetchMasterData());
  }, [dispatch]);

  // Set edit form data when transporter data is loaded
  useEffect(() => {
    if (selectedTransporter && !editFormData) {
      setEditFormData(selectedTransporter);
    }
  }, [selectedTransporter, editFormData]);

  // Refresh data function for approval actions
  const handleRefreshData = () => {
    if (id) {
      dispatch(fetchTransporterById(id));
    }
  };

  // Track unsaved changes
  useEffect(() => {
    if (isEditMode && editFormData && selectedTransporter) {
      const hasChanges =
        JSON.stringify(editFormData) !== JSON.stringify(selectedTransporter);
      setHasUnsavedChanges(hasChanges);
    }
  }, [editFormData, selectedTransporter, isEditMode]);

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
      // Cancel edit mode - reset form data
      setEditFormData(selectedTransporter);
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

    // Validate general details
    const generalErrors = validateFormSection("generalDetails", formData);
    if (Object.keys(generalErrors).length > 0) {
      errors.generalDetails = generalErrors;
    }

    // Validate addresses
    const addressErrors = validateFormSection("addresses", formData);
    if (Object.keys(addressErrors).length > 0) {
      errors.addresses = addressErrors;
    }

    // Validate serviceable areas
    const serviceableAreaErrors = validateFormSection(
      "serviceableAreas",
      formData
    );
    if (Object.keys(serviceableAreaErrors).length > 0) {
      errors.serviceableAreas = serviceableAreaErrors;
    }

    // Validate documents
    const documentErrors = validateFormSection("documents", formData);
    if (Object.keys(documentErrors).length > 0) {
      errors.documents = documentErrors;
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

      // Validate all sections
      const errors = validateAllSections(editFormData);

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);

        // Update tab errors to show which tabs have issues
        const newTabErrors = {
          0:
            errors.generalDetails &&
            Object.keys(errors.generalDetails).length > 0,
          1: errors.addresses && Object.keys(errors.addresses).length > 0,
          2:
            errors.serviceableAreas &&
            Object.keys(errors.serviceableAreas).length > 0,
          3: errors.documents && Object.keys(errors.documents).length > 0,
        };
        setTabErrors(newTabErrors);

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

        dispatch(
          addToast({
            type: TOAST_TYPES.ERROR,
            message: "Please fix all validation errors before saving.",
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
      });
      dispatch(clearError());

      // Call the update API
      const result = await dispatch(
        updateTransporter({
          transporterId: id,
          transporterData: {
            generalDetails: editFormData.generalDetails,
            addresses: editFormData.addresses,
            serviceableAreas: editFormData.serviceableAreas,
            documents: editFormData.documents,
          },
        })
      ).unwrap();

      // Success - show toast notification
      dispatch(
        addToast({
          type: TOAST_TYPES.SUCCESS,
          message: "Transporter updated successfully!",
        })
      );

      // Refresh the transporter data
      await dispatch(fetchTransporterById(id));

      // Switch to view mode
      setIsEditMode(false);
      setHasUnsavedChanges(false);
      setValidationErrors({});
    } catch (err) {
      console.error("Error saving transporter:", err);

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
          // Parse field path like "documents[0].documentNumber"
          const fieldMatch = err.field.match(/^(\w+)(?:\[(\d+)\])?\.?(.+)?$/);

          if (fieldMatch) {
            const [, section, index, field] = fieldMatch;

            // Map section to tab index
            const tabMapping = {
              generalDetails: 0,
              addresses: 1,
              serviceableAreas: 2,
              documents: 3,
            };

            tabWithError = tabMapping[section];

            if (index !== undefined) {
              // Array field error (e.g., documents[0].documentNumber)
              if (!backendErrors[section]) backendErrors[section] = {};
              if (!backendErrors[section][index])
                backendErrors[section][index] = {};
              if (field) {
                backendErrors[section][index][field] = err.message;
              }
            } else if (field) {
              // Object field error (e.g., generalDetails.businessName)
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
            err.message || "Failed to update transporter. Please try again.",
        })
      );
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isFetchingDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#F8FAFC] to-[#F1F5F9] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transporter details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#F8FAFC] to-[#F1F5F9] flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Error Loading Data
          </h2>
          <p className="text-gray-600 mb-4">
            {error.message || "Failed to load transporter details"}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!selectedTransporter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#F8FAFC] to-[#F1F5F9] flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Transporter Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The requested transporter could not be found.
          </p>
          <button
            onClick={() => navigate("/transporters")}
            className="px-4 py-2 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition-colors"
          >
            Back to Transporters
          </button>
        </div>
      </div>
    );
  }

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
                  {selectedTransporter.generalDetails.businessName}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    selectedTransporter.generalDetails.status
                  )}`}
                >
                  {selectedTransporter.generalDetails.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-blue-100/80 text-xs">
                <div className="flex items-center gap-2">
                  <Hash className="w-3 h-3" />
                  <span>ID: {selectedTransporter.transporterId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-3 h-3" />
                  <span>
                    Created by: {selectedTransporter.generalDetails.createdBy}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  <span>
                    Created: {selectedTransporter.generalDetails.createdOn}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Approval Action Bar - shows approval status and actions */}
            {selectedTransporter.userApprovalStatus && (
              <ApprovalActionBar
                userApprovalStatus={selectedTransporter.userApprovalStatus}
                transporterId={selectedTransporter.transporterId}
                onRefreshData={handleRefreshData}
              />
            )}

            {/* Edit/Save/Cancel Buttons */}
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
                  disabled={isUpdating}
                  className="group inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#10B981] to-[#059669] text-white rounded-xl font-medium text-sm hover:from-[#059669] hover:to-[#10B981] transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isUpdating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                      Save Changes
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={handleEditToggle}
                className="group inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#10B981] to-[#059669] text-white rounded-xl font-medium text-sm hover:from-[#059669] hover:to-[#10B981] transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-green-500/25"
              >
                <Edit className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                Edit Details
              </button>
            )}
          </div>
        </div>
      </div>

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

      {/* Modern Content Area */}
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
                    <EmptyState message="No mapping data available" />
                  ) : (
                    <div className="p-4">
                      <TabComponent
                        formData={
                          isEditMode ? editFormData : selectedTransporter
                        }
                        setFormData={isEditMode ? setEditFormData : undefined}
                        errors={
                          isEditMode
                            ? tab.id === 0
                              ? validationErrors.generalDetails || {}
                              : tab.id === 1
                              ? validationErrors.addresses || {}
                              : tab.id === 2
                              ? validationErrors.serviceableAreas || {}
                              : tab.id === 3
                              ? validationErrors.documents || {}
                              : {}
                            : {}
                        }
                        isEditMode={isEditMode}
                        transporterData={selectedTransporter}
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

export default TransporterDetailsPage;
