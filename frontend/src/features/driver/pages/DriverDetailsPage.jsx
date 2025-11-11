import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import TMSHeader from "../../../components/layout/TMSHeader";
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
} from "lucide-react";
import {
  fetchDriverById,
  updateDriver,
  fetchMasterData,
  clearError,
} from "../../../redux/slices/driverSlice";
import { addToast } from "../../../redux/slices/uiSlice";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
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

// Import view tab components
import DriverDashboardViewTab from "../components/DriverDashboardViewTab";
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

  const { selectedDriver, isFetchingDetails, isUpdating, error, masterData } =
    useSelector((state) => state.driver);

  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [editFormData, setEditFormData] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [tabErrors, setTabErrors] = useState({
    0: false, // Dashboard (view-only)
    1: false, // Basic Info
    2: false, // Documents
    3: false, // History
    4: false, // Accident & Violation
    5: false, // Transporter Mapping
    6: false, // Vehicle Mapping
    7: false, // Blacklist Mapping
  });

  const tabs = [
    {
      id: 0,
      name: "Dashboard",
      icon: LayoutDashboard,
      viewComponent: DriverDashboardViewTab,
      editComponent: null, // View-only tab
    },
    {
      id: 1,
      name: "Basic Information",
      icon: User,
      viewComponent: BasicInfoViewTab,
      editComponent: BasicInfoTab,
    },
    {
      id: 2,
      name: "Documents",
      icon: FileText,
      viewComponent: DocumentsViewTab,
      editComponent: DocumentsTab,
    },
    {
      id: 3,
      name: "History Information",
      icon: Briefcase,
      viewComponent: HistoryViewTab,
      editComponent: HistoryTab,
    },
    {
      id: 4,
      name: "Accident & Violation",
      icon: AlertTriangle,
      viewComponent: AccidentViolationViewTab,
      editComponent: AccidentViolationTab,
    },
    {
      id: 5,
      name: "Transporter/Owner Mapping",
      icon: Users,
      viewComponent: TransporterMappingViewTab,
      editComponent: TransporterMappingTab,
    },
    {
      id: 6,
      name: "Vehicle Mapping",
      icon: Car,
      viewComponent: VehicleMappingViewTab,
      editComponent: VehicleMappingTab,
    },
    {
      id: 7,
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

  // Initialize edit form data when driver loads
  useEffect(() => {
    if (selectedDriver && !editFormData) {
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
    }
  }, [selectedDriver, editFormData]);

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

  const handleBack = () => {
    navigate("/drivers");
  };

  const handleEditToggle = () => {
    if (isEditMode) {
      // Cancel edit - reset form data
      setEditFormData(null);
      setValidationErrors({});
      setTabErrors({
        0: false, // Dashboard
        1: false, // Basic Info
        2: false, // Documents
        3: false, // History
        4: false, // Accident & Violation
        5: false, // Transporter Mapping
        6: false, // Vehicle Mapping
        7: false, // Blacklist Mapping
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

  const handleSave = async () => {
    // Validate form data
    const errors = {};
    const newTabErrors = { ...tabErrors };
    const allErrorMessages = []; // Collect all error messages

    // Validate Basic Info (Tab 1)
    try {
      basicInfoSchema.parse(editFormData.basicInfo);
      newTabErrors[1] = false;
    } catch (err) {
      errors.basicInfo = err.errors || [err];
      newTabErrors[1] = true;

      // Collect all errors from this section
      const errorArray = err.errors || [err];
      errorArray.forEach((error) => {
        const fieldName = formatFieldName(error.path?.[0] || "field");
        allErrorMessages.push(
          `Basic Information - ${fieldName}: ${error.message}`
        );
      });
    }

    // Validate Addresses (Tab 1)
    if (editFormData.addresses && editFormData.addresses.length > 0) {
      editFormData.addresses.forEach((address, index) => {
        try {
          addressSchema.parse(address);
        } catch (err) {
          errors[`addresses[${index}]`] = err.errors || [err];
          newTabErrors[1] = true;

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

    // Validate Documents (Tab 2)
    if (editFormData.documents && editFormData.documents.length > 0) {
      editFormData.documents.forEach((document, index) => {
        // Skip validation for empty documents (documents without documentNumber)
        if (!document.documentNumber || document.documentNumber.trim() === "") {
          return; // Skip this document
        }

        // Create a copy of the document with resolved document type name
        const documentForValidation = { ...document };

        // If documentType is an ID (short code like DT001), resolve it to name
        if (documentForValidation.documentType && masterData?.documentTypes) {
          const docTypeMatch = masterData.documentTypes.find(
            (dt) => dt.value === documentForValidation.documentType
          );
          if (docTypeMatch) {
            // Use the label (name) for validation instead of the value (ID)
            documentForValidation.documentType = docTypeMatch.label;
          }
        }

        try {
          documentSchema.parse(documentForValidation);
        } catch (err) {
          errors[`documents[${index}]`] = err.errors || [err];
          newTabErrors[2] = true;

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

    // Validate History (Tab 3)
    if (editFormData.history && editFormData.history.length > 0) {
      editFormData.history.forEach((hist, index) => {
        try {
          historySchema.parse(hist);
        } catch (err) {
          errors[`history[${index}]`] = err.errors || [err];
          newTabErrors[3] = true;

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

    // Validate Accidents (Tab 4)
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
          newTabErrors[4] = true;

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

    // Filter out empty documents (documents without documentNumber)
    const filteredFormData = {
      ...editFormData,
      documents: (editFormData.documents || []).filter(
        (doc) => doc.documentNumber && doc.documentNumber.trim() !== ""
      ),
      // Filter out empty history records
      history: (editFormData.history || []).filter(
        (hist) => hist.employer || hist.jobTitle || hist.fromDate || hist.toDate
      ),
      // Filter out empty accidents
      accidents: (editFormData.accidents || []).filter(
        (acc) => acc.type && acc.date
      ),
    };

    // Dispatch update action
    const result = await dispatch(
      updateDriver({
        driverId: id,
        driverData: filteredFormData,
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
        7: false,
      });

      // Reload driver data to reflect changes in UI
      await dispatch(fetchDriverById(id));

      // Show success toast after data is reloaded
      dispatch(
        addToast({
          type: "success",
          message: "Driver updated successfully",
        })
      );
    }
  };

  const ActiveTabComponent = isEditMode
    ? tabs[activeTab].editComponent
    : tabs[activeTab].viewComponent;

  return (
    <div
      className="min-h-screen"
      style={{
        background: `linear-gradient(to bottom right, ${safeTheme.colors.primary.background}, #f0f4f8, #e6f0ff)`,
      }}
    >
      <TMSHeader theme={safeTheme} />
      <div className="px-4 lg:px-4 py-2">
        <div className="max-w-7xl mx-auto space-y-2">
          {/* Header */}
          <Card
            className="overflow-hidden border shadow-md"
            style={{
              backgroundColor: safeTheme.colors.card.background,
              borderColor: safeTheme.colors.card.border,
            }}
          >
            <div className="p-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={handleBack}
                    style={{
                      backgroundColor:
                        safeActionButtonTheme.secondary.background,
                      color: safeActionButtonTheme.secondary.text,
                      borderColor: safeActionButtonTheme.secondary.border,
                    }}
                    className="flex items-center space-x-2 border hover:opacity-90 transition-opacity"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {/* <span>Back</span> */}
                  </Button>
                  <div className="flex items-center space-x-3">
                    <User
                      className="h-8 w-8"
                      style={{
                        color: safeActionButtonTheme.primary.background,
                      }}
                    />
                    <div>
                      <h1
                        className="text-2xl font-bold"
                        style={{ color: safeTheme.colors.text.primary }}
                      >
                        Driver Details
                      </h1>
                      <p
                        className="text-sm"
                        style={{ color: safeTheme.colors.text.secondary }}
                      >
                        {id ? `Driver ID: ${id}` : "Loading..."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {isEditMode ? (
                    <>
                      <Button
                        onClick={handleEditToggle}
                        disabled={isUpdating}
                        style={{
                          backgroundColor:
                            safeActionButtonTheme.secondary.background,
                          color: safeActionButtonTheme.secondary.text,
                          borderColor: safeActionButtonTheme.secondary.border,
                        }}
                        className="flex items-center space-x-2 border hover:opacity-90 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                        <span>Cancel</span>
                      </Button>
                      <Button
                        onClick={handleSave}
                        disabled={isUpdating}
                        style={{
                          backgroundColor:
                            safeActionButtonTheme.primary.background,
                          color: safeActionButtonTheme.primary.text,
                          opacity: isUpdating ? 0.5 : 1,
                        }}
                        className="flex items-center space-x-2 hover:opacity-90 transition-opacity"
                      >
                        <Save className="h-4 w-4" />
                        <span>{isUpdating ? "Saving..." : "Save Changes"}</span>
                      </Button>
                    </>
                  ) : (
                    // Only show Edit button if not on Dashboard tab (Dashboard is view-only)
                    activeTab !== 0 && (
                      <Button
                        onClick={handleEditToggle}
                        style={{
                          backgroundColor:
                            safeActionButtonTheme.primary.background,
                          color: safeActionButtonTheme.primary.text,
                        }}
                        className="flex items-center space-x-2 hover:opacity-90 transition-opacity"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </Button>
                    )
                  )}
                </div>
              </div>
            </div>
          </Card>

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
                          // Disable edit mode when switching to Dashboard tab (view-only)
                          if (tab.id === 0) {
                            setIsEditMode(false);
                          }
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
    </div>
  );
};

export default DriverDetailsPage;
