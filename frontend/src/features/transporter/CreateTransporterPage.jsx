import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  Save,
  Share,
  Building2,
  MapPin,
  Globe,
  FileText,
  AlertTriangle,
} from "lucide-react";

import {
  createTransporter,
  fetchMasterData,
  clearError,
  clearLastCreated,
} from "../../redux/slices/transporterSlice";
import { createTransporterSchema, validateFormSection } from "./validation";
import { getComponentTheme } from "../../utils/theme";
import { TOAST_TYPES } from "../../utils/constants";

// Import tab components
import GeneralDetailsTab from "./components/GeneralDetailsTab";
import AddressContactsTab from "./components/AddressContactsTab";
import ServiceableAreaTab from "./components/ServiceableAreaTab";
import DocumentsTab from "./components/DocumentsTab";

const CreateTransporterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isCreating, error, lastCreatedTransporter, masterData, isLoading } =
    useSelector((state) => state.transporter);

  const { user, role } = useSelector((state) => state.auth);

  const actionButtonTheme = getComponentTheme("actionButton");
  const tabButtonTheme = getComponentTheme("tabButton");

  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    transporterId: null,
    generalDetails: {
      businessName: "",
      fromDate: "",
      toDate: "",
      avgRating: 0,
      transMode: {
        road: false,
        rail: false,
        air: false,
        sea: false,
      },
      activeFlag: true,
    },
    addresses: [
      {
        vatNumber: "",
        country: "",
        state: "",
        city: "",
        street1: "",
        street2: "",
        district: "",
        postalCode: "",
        isPrimary: true,
        contacts: [
          {
            name: "",
            role: "",
            phoneNumber: "",
            alternatePhoneNumber: "",
            email: "",
            alternateEmail: "",
            whatsappNumber: "",
          },
        ],
      },
    ],
    serviceableAreas: [
      {
        country: "",
        states: [],
      },
    ],
    documents: [
      {
        documentType: "",
        documentNumber: "",
        referenceNumber: "",
        country: "",
        validFrom: "",
        validTo: "",
        status: true,
        fileName: "",
        fileType: "",
        fileData: "",
      },
    ],
  });

  const [validationErrors, setValidationErrors] = useState({});

  const tabs = [
    {
      id: 0,
      name: "General Details",
      icon: Building2,
      component: GeneralDetailsTab,
    },
    {
      id: 1,
      name: "Address & Contacts",
      icon: MapPin,
      component: AddressContactsTab,
    },
    {
      id: 2,
      name: "Serviceable Area",
      icon: Globe,
      component: ServiceableAreaTab,
    },
    {
      id: 3,
      name: "Documents",
      icon: FileText,
      component: DocumentsTab,
    },
  ];

  // Check if user has permission (product owner only)
  // useEffect(() => {
  //   if (role !== "product_owner") {
  //     navigate("/dashboard", { replace: true });
  //     return;
  //   }
  // }, [role, navigate]);

  // Load master data on component mount
  useEffect(() => {
    if (masterData.countries.length === 0) {
      console.log("🔄 Attempting to fetch master data...");
      dispatch(fetchMasterData()).catch((error) => {
        console.log(
          "⚠️ Master data fetch failed (expected in development):",
          error
        );
        // This is expected when backend is not running or auth is disabled
        // The component will still function with empty arrays
      });
    }
  }, [dispatch, masterData.countries.length]);

  // Clear any previous errors on mount
  useEffect(() => {
    dispatch(clearError());
    dispatch(clearLastCreated());
  }, [dispatch]);

  // Handle successful creation
  // useEffect(() => {
  //   if (lastCreatedTransporter) {
  //     // Show success message
  //     alert(
  //       `Transporter created successfully! ID: ${lastCreatedTransporter.transporterId}`
  //     );

  //     // Navigate to transporter list (or dashboard for now)
  //     navigate("/dashboard");
  //   }
  // }, [lastCreatedTransporter, navigate]);

  const handleClear = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all data? This action cannot be undone."
      )
    ) {
      setFormData({
        transporterId: null,
        generalDetails: {
          businessName: "",
          fromDate: "",
          toDate: "",
          avgRating: 0,
          transMode: {
            road: false,
            rail: false,
            air: false,
            sea: false,
          },
          activeFlag: true,
        },
        addresses: [
          {
            vatNumber: "",
            country: "",
            state: "",
            city: "",
            street1: "",
            street2: "",
            district: "",
            postalCode: "",
            isPrimary: true,
            contacts: [
              {
                name: "",
                role: "",
                phoneNumber: "",
                alternatePhoneNumber: "",
                email: "",
                alternateEmail: "",
                whatsappNumber: "",
              },
            ],
          },
        ],
        serviceableAreas: [
          {
            country: "",
            states: [],
          },
        ],
        documents: [
          {
            documentType: "",
            documentNumber: "",
            referenceNumber: "",
            country: "",
            validFrom: "",
            validTo: "",
            status: true,
            fileName: "",
            fileType: "",
            fileData: "",
          },
        ],
      });
      setValidationErrors({});
      setActiveTab(0);
    }
  };

  const handleSubmit = async () => {
    // Clear previous errors
    setValidationErrors({});

    // Validate entire form
    const validation = createTransporterSchema.safeParse(formData);

    if (!validation.success) {
      // Process validation errors
      const errors = {};
      validation.error.issues.forEach((issue) => {
        const path = issue.path.join(".");
        if (!errors[path]) {
          errors[path] = issue.message;
        }
      });

      // Convert flat error paths to nested structure for easier component access
      const nestedErrors = {};
      Object.keys(errors).forEach((path) => {
        const parts = path.split(".");
        let current = nestedErrors;

        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];
          if (!current[part]) {
            current[part] = isNaN(parts[i + 1]) ? {} : [];
          }
          current = current[part];
        }

        const lastPart = parts[parts.length - 1];
        current[lastPart] = errors[path];
      });

      setValidationErrors(nestedErrors);

      // Find the first tab with errors and switch to it
      const tabsWithErrors = [];
      if (nestedErrors.generalDetails) tabsWithErrors.push(0);
      if (nestedErrors.addresses) tabsWithErrors.push(1);
      if (nestedErrors.serviceableAreas) tabsWithErrors.push(2);
      if (nestedErrors.documents) tabsWithErrors.push(3);

      if (tabsWithErrors.length > 0) {
        setActiveTab(tabsWithErrors[0]);
      }

      // Show error message
      alert("Please fix the validation errors before submitting.");
      return;
    }

    // Submit valid data
    dispatch(createTransporter(formData));
  };

  const handleExport = () => {
    // Generate a summary of the form data for export/sharing
    const summary = {
      businessName: formData.generalDetails.businessName,
      transportModes: Object.keys(formData.generalDetails.transMode).filter(
        (mode) => formData.generalDetails.transMode[mode]
      ),
      addressCount: formData.addresses.length,
      contactCount: formData.addresses.reduce(
        (total, addr) => total + (addr.contacts?.length || 0),
        0
      ),
      serviceableCountries: formData.serviceableAreas
        .map((area) => area.country)
        .filter(Boolean).length,
      documentCount: formData.documents.length,
      completionStatus: "Ready for submission",
    };

    const exportData = JSON.stringify(summary, null, 2);
    const blob = new Blob([exportData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transporter-summary-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const canSubmit = true; // Always allow submission

  // if (role !== "product_owner") {
  //   return null; // Will redirect via useEffect
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#F8FAFC] to-[#F1F5F9]">
      {/* Modern Header Bar with glassmorphism */}
      <div className="bg-gradient-to-r from-[#0D1A33] via-[#1A2B47] to-[#0D1A33] px-6 py-6 shadow-xl relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-transparent to-teal-600/10"></div>
        <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl"></div>
        <div className="absolute -bottom-4 -left-4 w-40 h-40 bg-gradient-to-tr from-teal-400/10 to-transparent rounded-full blur-2xl"></div>

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate(-1)}
              className="group p-3 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-105 border border-white/20"
            >
              <ArrowLeft className="w-5 h-5 text-white group-hover:text-white transition-colors" />
            </button>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Create New Transporter
              </h1>
              <p className="text-blue-100/80 text-sm font-medium">
                Complete all sections to create a comprehensive transporter
                profile
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleClear}
              disabled={isCreating}
              className="group inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl font-medium hover:bg-white/20 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              Clear
            </button>

            <button
              onClick={handleSubmit}
              disabled={isCreating}
              className="group inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#14B8A6] to-[#0891B2] text-white rounded-xl font-medium hover:from-[#0891B2] hover:to-[#14B8A6] transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-teal-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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

            <button
              onClick={handleExport}
              disabled={isCreating}
              className="group inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl font-medium hover:bg-white/20 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Share className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Modern Tab Navigation with glassmorphism */}
      <div className="bg-gradient-to-r from-[#0D1A33] to-[#1A2B47] px-6 relative">
        {/* Tab backdrop blur effect */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>

        <div className="relative flex space-x-1 py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

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
                  <div className="absolute inset-x-0 -bottom-0 h-1 bg-gradient-to-r from-[#14B8A6] to-[#0891B2] rounded-t-full"></div>
                )}

                <Icon
                  className={`w-5 h-5 transition-all duration-300 ${
                    isActive
                      ? "text-[#14B8A6] scale-110"
                      : "text-blue-200/70 group-hover:text-white group-hover:scale-105"
                  }`}
                />
                <span className="font-semibold tracking-wide">{tab.name}</span>

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
      <div className="px-6 py-8 space-y-8">
        {/* Modern Progress Indicator - Currently commented out but enhanced for future use */}
        {/* <div className="mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/40">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-[#0D1A33] tracking-wide">
                Completion Progress
              </span>
              <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                {Object.values(tabValidationStatus).filter(Boolean).length}/4 sections completed
              </span>
            </div>
            <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full"></div>
              <div
                className="relative bg-gradient-to-r from-[#14B8A6] to-[#0891B2] h-3 rounded-full transition-all duration-700 ease-out shadow-lg"
                style={{
                  width: `${(Object.values(tabValidationStatus).filter(Boolean).length / 4) * 100}%`,
                }}
              >
                <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div> */}

        {/* Enhanced Error Display */}
        {error && (
          <div className="mb-8 relative">
            <div className="bg-gradient-to-r from-red-50/90 to-rose-50/90 backdrop-blur-sm border border-red-200/60 rounded-2xl p-6 shadow-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-red-800 mb-2">
                    Error Creating Transporter
                  </h3>
                  <p className="text-sm text-red-700 leading-relaxed">
                    {typeof error === "string"
                      ? error
                      : error.message || "An unexpected error occurred"}
                  </p>
                  {error.field && (
                    <p className="mt-3 text-xs text-red-600 bg-red-100/50 px-3 py-1 rounded-full inline-block">
                      Field: {error.field}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

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
                <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/40 overflow-hidden">
                  {/* Tab content header with gradient */}
                  <div className="bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-sm px-8 py-6 border-b border-gray-200/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#14B8A6] to-[#0891B2] rounded-xl flex items-center justify-center shadow-lg">
                        {React.createElement(tab.icon, {
                          className: "w-5 h-5 text-white",
                        })}
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-[#0D1A33] tracking-tight">
                          {tab.name}
                        </h2>
                        <p className="text-sm text-gray-600">
                          Complete the required information below
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tab content */}
                  <div className="p-8">
                    <TabComponent
                      formData={formData}
                      setFormData={setFormData}
                      errors={validationErrors}
                      nextTransporterId="T001" // This would come from backend in real scenario
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CreateTransporterPage;
