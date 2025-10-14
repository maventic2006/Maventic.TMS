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
  useEffect(() => {
    if (role !== "product_owner") {
      navigate("/dashboard", { replace: true });
      return;
    }
  }, [role, navigate]);

  // Load master data on component mount
  useEffect(() => {
    if (masterData.countries.length === 0) {
      dispatch(fetchMasterData());
    }
  }, [dispatch, masterData.countries.length]);

  // Clear any previous errors on mount
  useEffect(() => {
    dispatch(clearError());
    dispatch(clearLastCreated());
  }, [dispatch]);

  // Handle successful creation
  useEffect(() => {
    if (lastCreatedTransporter) {
      // Show success message
      alert(
        `Transporter created successfully! ID: ${lastCreatedTransporter.transporterId}`
      );

      // Navigate to transporter list (or dashboard for now)
      navigate("/dashboard");
    }
  }, [lastCreatedTransporter, navigate]);

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

  if (role !== "product_owner") {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Header Bar */}
      <div className="bg-[#0D1A33] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#0D1A33]" />
            </button>

            <div>
              <h1 className="text-2xl font-bold text-white">
                Create New Transporter
              </h1>
              <p className="text-gray-300 text-sm">
                Complete all sections to create a comprehensive transporter
                profile
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleClear}
              disabled={isCreating}
              className={`${actionButtonTheme.clear} disabled:opacity-50`}
            >
              <RefreshCw className="w-4 h-4" />
              Clear
            </button>

            <button
              onClick={handleSubmit}
              disabled={isCreating}
              className={`${actionButtonTheme.primary} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Submit
                </>
              )}
            </button>

            <button
              onClick={handleExport}
              disabled={isCreating}
              className={`${actionButtonTheme.clear} disabled:opacity-50`}
            >
              <Share className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-[#0D1A33] px-6">
        <div className="flex space-x-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${tabButtonTheme.base} ${
                  isActive ? tabButtonTheme.active : tabButtonTheme.inactive
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="px-6 py-6">
        {/* Progress Indicator */}
        {/* <div className="mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Completion Progress
              </span>
              <span className="text-sm text-gray-600">
                {Object.values(tabValidationStatus).filter(Boolean).length}/4
                sections completed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#14B8A6] h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    (Object.values(tabValidationStatus).filter(Boolean).length /
                      4) *
                    100
                  }%`,
                }}
              ></div>
            </div>
          </div>
        </div> */}

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Error Creating Transporter</span>
            </div>
            <p className="mt-2 text-sm text-red-600">
              {typeof error === "string"
                ? error
                : error.message || "An unexpected error occurred"}
            </p>
            {error.field && (
              <p className="mt-1 text-xs text-red-500">Field: {error.field}</p>
            )}
          </div>
        )}

        {/* Tab Content */}
        <div className="space-y-6">
          {tabs.map((tab) => {
            const TabComponent = tab.component;
            return (
              <div
                key={tab.id}
                className={activeTab === tab.id ? "block" : "hidden"}
              >
                <TabComponent
                  formData={formData}
                  setFormData={setFormData}
                  errors={validationErrors}
                  nextTransporterId="T001" // This would come from backend in real scenario
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CreateTransporterPage;
