import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  User,
  FileText,
  Briefcase,
  AlertTriangle,
  Users,
  Car,
  Ban,
  AlertCircle,
} from "lucide-react";

import {
  createDriver,
  fetchMasterData,
  clearError,
  clearLastCreated,
} from "../../../redux/slices/driverSlice";
import { addToast } from "../../../redux/slices/uiSlice";
import { getPageTheme, getComponentTheme } from "../../../theme.config";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";

// Import tab components
import BasicInfoTab from "../components/BasicInfoTab";
import DocumentsTab from "../components/DocumentsTab";
import HistoryTab from "../components/HistoryTab";
import AccidentViolationTab from "../components/AccidentViolationTab";
import TransporterMappingTab from "../components/TransporterMappingTab";
import VehicleMappingTab from "../components/VehicleMappingTab";
import BlacklistMappingTab from "../components/BlacklistMappingTab";

const DriverCreatePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

  const { isCreating, error, lastCreated, masterData, isLoading } = useSelector(
    (state) => state.driver
  );

  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    basicInfo: {
      fullName: "",
      dateOfBirth: "",
      gender: "",
      bloodGroup: "",
      phoneNumber: "",
      emailId: "",
      whatsAppNumber: "",
      alternatePhoneNumber: "",
    },
    addresses: [
      {
        country: "",
        state: "",
        city: "",
        district: "",
        street1: "",
        street2: "",
        postalCode: "",
        isPrimary: true,
        addressTypeId: "",
      },
    ],
    documents: [],
    history: [],
    accidents: [],
    transporterMappings: [],
    vehicleMappings: [],
    blacklistMappings: [],
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [tabErrors, setTabErrors] = useState({
    0: false, // Basic Info
    1: false, // Documents
    2: false, // History
    3: false, // Accident & Violation
    4: false, // Transporter Mapping
    5: false, // Vehicle Mapping
    6: false, // Blacklist Mapping
  });

  const tabs = [
    {
      id: 0,
      name: "Basic Information",
      icon: User,
      component: BasicInfoTab,
    },
    {
      id: 1,
      name: "Documents",
      icon: FileText,
      component: DocumentsTab,
    },
    {
      id: 2,
      name: "History Information",
      icon: Briefcase,
      component: HistoryTab,
    },
    {
      id: 3,
      name: "Accident & Violation",
      icon: AlertTriangle,
      component: AccidentViolationTab,
    },
    {
      id: 4,
      name: "Transporter/Owner Mapping",
      icon: Users,
      component: TransporterMappingTab,
    },
    {
      id: 5,
      name: "Vehicle Mapping",
      icon: Car,
      component: VehicleMappingTab,
    },
    {
      id: 6,
      name: "Blacklist Mapping",
      icon: Ban,
      component: BlacklistMappingTab,
    },
  ];

  // Load master data
  useEffect(() => {
    dispatch(fetchMasterData());
  }, [dispatch]);

  // Handle successful creation
  useEffect(() => {
    if (lastCreated) {
      dispatch(
        addToast({
          type: "success",
          message: `Driver ${lastCreated.driverId} created successfully!`,
        })
      );
      dispatch(clearLastCreated());
      navigate("/drivers");
    }
  }, [lastCreated, dispatch, navigate]);

  // Handle errors
  useEffect(() => {
    if (error) {
      dispatch(
        addToast({
          type: "error",
          message: error.message || "Failed to create driver",
        })
      );
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleBack = () => {
    navigate("/drivers");
  };

  const handleFormDataChange = useCallback((section, data) => {
    setFormData((prev) => ({
      ...prev,
      [section]: data,
    }));
  }, []);

  const handleValidationErrorsChange = useCallback((errors) => {
    setValidationErrors(errors);
  }, []);

  const handleTabErrorChange = useCallback((tabId, hasError) => {
    setTabErrors((prev) => ({
      ...prev,
      [tabId]: hasError,
    }));
  }, []);

  const validateAllTabs = () => {
    // Basic validation for now - will be enhanced with proper validation
    const errors = {};
    let hasErrors = false;

    // Basic Info validation
    if (!formData.basicInfo.fullName) {
      errors.fullName = "Full name is required";
      hasErrors = true;
      setTabErrors((prev) => ({ ...prev, 0: true }));
    }
    if (!formData.basicInfo.phoneNumber) {
      errors.phoneNumber = "Phone number is required";
      hasErrors = true;
      setTabErrors((prev) => ({ ...prev, 0: true }));
    }

    setValidationErrors(errors);
    return !hasErrors;
  };

  const handleSave = async () => {
    if (!validateAllTabs()) {
      dispatch(
        addToast({
          type: "error",
          message: "Please fix validation errors before saving",
        })
      );
      return;
    }

    // Prepare data for API
    const driverData = {
      basicInfo: formData.basicInfo,
      addresses: formData.addresses,
      documents: formData.documents,
      history: formData.history,
      accidents: formData.accidents,
      transporterMappings: formData.transporterMappings,
      vehicleMappings: formData.vehicleMappings,
      blacklistMappings: formData.blacklistMappings,
    };

    dispatch(createDriver(driverData));
  };

  const ActiveTabComponent = tabs[activeTab].component;

  return (
    <div
      className="min-h-screen p-4 lg:p-6"
      style={{
        background: `linear-gradient(to bottom right, ${safeTheme.colors.primary.background}, #f0f4f8, #e6f0ff)`,
      }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card
          className="overflow-hidden border shadow-md"
          style={{
            backgroundColor: safeTheme.colors.card.background,
            borderColor: safeTheme.colors.card.border,
          }}
        >
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={handleBack}
                  style={{
                    backgroundColor: safeActionButtonTheme.secondary.background,
                    color: safeActionButtonTheme.secondary.text,
                    borderColor: safeActionButtonTheme.secondary.border,
                  }}
                  className="flex items-center space-x-2 border hover:opacity-90 transition-opacity"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </Button>
                <div className="flex items-center space-x-3">
                  <User
                    className="h-8 w-8"
                    style={{ color: safeActionButtonTheme.primary.background }}
                  />
                  <div>
                    <h1
                      className="text-2xl font-bold"
                      style={{ color: safeTheme.colors.text.primary }}
                    >
                      Create Driver
                    </h1>
                    <p
                      className="text-sm"
                      style={{ color: safeTheme.colors.text.secondary }}
                    >
                      Add a new driver to the system
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSave}
                disabled={isCreating}
                style={{
                  backgroundColor: safeActionButtonTheme.primary.background,
                  color: safeActionButtonTheme.primary.text,
                  opacity: isCreating ? 0.5 : 1,
                }}
                className="flex items-center space-x-2 hover:opacity-90 transition-opacity"
              >
                <Save className="h-4 w-4" />
                <span>{isCreating ? "Saving..." : "Save Driver"}</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* Tab Navigation - Matches Transporter Design */}
        <div className="bg-gradient-to-r from-[#0D1A33] to-[#1A2B47] px-6 rounded-t-2xl relative">
          {/* Tab backdrop blur effect */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-t-2xl"></div>

          <div className="relative flex flex-wrap gap-2 py-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const hasError = tabErrors[tab.id];

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative px-6 py-4 font-medium text-sm rounded-t-2xl transition-all duration-300 flex items-center gap-3 ${
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
                  {hasError && (
                    <div className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
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
              formData={formData}
              onFormDataChange={handleFormDataChange}
              validationErrors={validationErrors}
              onValidationErrorsChange={handleValidationErrorsChange}
              onTabErrorChange={handleTabErrorChange}
              masterData={masterData}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverCreatePage;
