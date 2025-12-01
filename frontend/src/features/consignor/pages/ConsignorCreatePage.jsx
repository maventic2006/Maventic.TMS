import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import TMSHeader from "../../../components/layout/TMSHeader";
import { getPageTheme } from "../../../theme.config";
import {
  ArrowLeft,
  RefreshCw,
  Save,
  User,
  Users,
  Building2,
  FileText,
  AlertCircle,
} from "lucide-react";

import {
  createConsignor,
  fetchConsignorMasterData,
  clearError,
  saveConsignorAsDraft,
  updateConsignorDraft,
} from "../../../redux/slices/consignorSlice";
import { createConsignorSchema } from "../validation";
import { getComponentTheme } from "../../../utils/theme";
import { TOAST_TYPES, ERROR_MESSAGES } from "../../../utils/constants";
import { addToast } from "../../../redux/slices/uiSlice";
import { useFormDirtyTracking } from "../../../hooks/useFormDirtyTracking";
import { useSaveAsDraft } from "../../../hooks/useSaveAsDraft";
import SaveAsDraftModal from "../../../components/ui/SaveAsDraftModal";

// Import tab components
import GeneralInfoTab from "../components/GeneralInfoTab";
import ContactTab from "../components/ContactTab";
import OrganizationTab from "../components/OrganizationTab";
import DocumentsTab from "../components/DocumentsTab";

// Initial form data constant for dirty tracking
const getInitialFormData = () => ({
  consignorId: null,
  general: {
    customer_name: "",
    search_term: "",
    industry_type: "",
    currency_type: "",
    payment_term: "",
    website_url: "",
    remark: "",
    name_on_po: "",
    approved_by: "",
    approved_date: "",
    upload_nda: null,
    nda_validity: "",
    upload_msa: null,
    msa_validity: "",
    address_id: "",
    status: "ACTIVE",
  },
  contacts: [],
  organization: {
    company_code: "",
    business_area: "",
    status: "ACTIVE",
  },
  documents: [],
});

const ConsignorCreatePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    isCreating,
    isSavingDraft,
    error,
    lastCreatedId,
    masterData,
    isLoading,
  } = useSelector((state) => state.consignor);

  const { user, role } = useSelector((state) => state.auth);

  const actionButtonTheme = getComponentTheme("actionButton");
  const tabButtonTheme = getComponentTheme("tabButton");
  const theme = getPageTheme("general");

  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState(() => getInitialFormData());

  const [validationErrors, setValidationErrors] = useState({});
  const [tabErrors, setTabErrors] = useState({
    0: false, // General Information
    1: false, // Contact Information
    2: false, // Organization Details
    3: false, // Documents
  });

  const tabs = [
    {
      id: 0,
      name: "General Information",
      icon: User,
      component: GeneralInfoTab,
    },
    {
      id: 1,
      name: "Contact Information",
      icon: Users,
      component: ContactTab,
    },
    {
      id: 2,
      name: "Organization Details",
      icon: Building2,
      component: OrganizationTab,
    },
    {
      id: 3,
      name: "Documents",
      icon: FileText,
      component: DocumentsTab,
    },
  ];

  // Dirty tracking hook for unsaved changes
  const initialFormData = getInitialFormData();
  const { isDirty, currentData, setCurrentData, resetDirty } =
    useFormDirtyTracking(initialFormData);

  // Sync formData with dirty tracking
  useEffect(() => {
    setCurrentData(formData);
  }, [formData, setCurrentData]);

  // Save as draft hook integration
  const {
    showModal: showDraftModal,
    handleSaveDraft,
    handleDiscard,
    handleCancel: handleCancelDraft,
    isLoading: isDraftLoading,
    showSaveAsDraftModal,
  } = useSaveAsDraft(
    "consignor",
    formData,
    isDirty,
    null, // No recordId for create page
    (data) => {
      console.log("✅ Draft saved successfully:", data);
      resetDirty(formData);
      dispatch(
        addToast({
          type: TOAST_TYPES.SUCCESS,
          message: "Consignor draft saved successfully!",
          duration: 3000,
        })
      );
      // Navigate to consignor list page after successful save
      setTimeout(() => {
        navigate("/consignor");
      }, 1000);
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

  // React Router navigation blocking
  // const blocker = useBlocker(
  //   ({ currentLocation, nextLocation }) =>
  //     isDirty && currentLocation.pathname !== nextLocation.pathname
  // );

  // useEffect(() => {
  //   if (blocker.state === "blocked") {
  //     showSaveAsDraftModal(blocker.location.pathname);
  //   }
  // }, [blocker.state, blocker.location, showSaveAsDraftModal]);

  // Load master data on component mount
  useEffect(() => {
    // Check if masterData is empty or if documentTypes array is empty
    const needsFetch =
      !masterData ||
      Object.keys(masterData).length === 0 ||
      !masterData.documentTypes ||
      masterData.documentTypes.length === 0;

    if (needsFetch) {
      console.log("🔄 Attempting to fetch consignor master data...");
      console.log("🔄 Current masterData:", masterData);
      dispatch(fetchConsignorMasterData()).catch((error) => {
        console.log(
          "⚠️ Master data fetch failed (expected in development):",
          error
        );
      });
    } else {
      console.log("✅ Master data already loaded:", masterData);
    }
  }, [dispatch, masterData]);

  // Clear any previous errors on mount
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Handle backend validation errors
  useEffect(() => {
    if (error && !isCreating) {
      let errorMessage = "Failed to create consignor";
      let errorDetails = [];

      if (typeof error === "object") {
        if (error.message) {
          errorMessage = error.message;
        }

        if (error.code === "VALIDATION_ERROR" && error.field) {
          errorDetails.push(`${error.field}: ${error.message}`);
        }

        if (error.details && Array.isArray(error.details)) {
          errorDetails = error.details.map((detail) => {
            if (typeof detail === "string") {
              return detail;
            } else if (detail.field && detail.message) {
              return `${detail.field}: ${detail.message}`;
            } else if (detail.message) {
              return detail.message;
            }
            return "Validation error";
          });
        }
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      dispatch(
        addToast({
          type: TOAST_TYPES.ERROR,
          message: errorMessage,
          details: errorDetails.length > 0 ? errorDetails : null,
          duration: 8000,
        })
      );

      dispatch(clearError());
    }
  }, [error, isCreating, dispatch]);

  // Handle successful creation
  useEffect(() => {
    if (lastCreatedId && !isCreating) {
      dispatch(
        addToast({
          type: TOAST_TYPES.SUCCESS,
          message: "Consignor created successfully!",
          details: [`Consignor ID: ${lastCreatedId}`],
          duration: 3000,
        })
      );

      const timer = setTimeout(() => {
        navigate("/consignor");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [lastCreatedId, isCreating, dispatch, navigate]);

  const handleClear = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all data? This action cannot be undone."
      )
    ) {
      const clearedData = getInitialFormData();
      setFormData(clearedData);
      resetDirty(clearedData);
      setValidationErrors({});
      setActiveTab(0);
    }
  };

  const handleSubmit = async () => {
    // Clear previous errors
    setValidationErrors({});
    setTabErrors({
      0: false,
      1: false,
      2: false,
      3: false,
    });

    // Prepare data for validation (remove File objects temporarily)
    const validationData = JSON.parse(
      JSON.stringify(formData, (key, value) => {
        if (value instanceof File) {
          return value.name; // Replace File with filename for validation
        }
        return value;
      })
    );

    // Validate entire form
    const validation = createConsignorSchema.safeParse(validationData);

    if (!validation.success) {
      const errors = {};
      const errorMessages = [];

      validation.error.issues.forEach((issue) => {
        const path = issue.path.join(".");
        if (!errors[path]) {
          errors[path] = issue.message;
          errorMessages.push(issue.message);
        }
      });

      // Convert flat error paths to nested structure
      const nestedErrors = {};
      Object.keys(errors).forEach((path) => {
        const parts = path.split(".");
        let current = nestedErrors;

        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];
          const nextPart = parts[i + 1];

          if (!isNaN(nextPart)) {
            if (!Array.isArray(current[part])) {
              current[part] = [];
            }
            const index = parseInt(nextPart);
            if (!current[part][index]) {
              current[part][index] = {};
            }
            current = current[part][index];
            i++;
          } else {
            if (!current[part]) {
              current[part] = {};
            }
            current = current[part];
          }
        }

        const lastPart = parts[parts.length - 1];
        current[lastPart] = errors[path];
      });

      setValidationErrors(nestedErrors);

      // Determine which tabs have errors
      const newTabErrors = {
        0: !!nestedErrors.general,
        1: !!nestedErrors.contacts,
        2: !!nestedErrors.organization,
        3: !!nestedErrors.documents,
      };
      setTabErrors(newTabErrors);

      // Find the first tab with errors and switch to it
      const tabsWithErrors = [];
      if (newTabErrors[0]) tabsWithErrors.push(0);
      if (newTabErrors[1]) tabsWithErrors.push(1);
      if (newTabErrors[2]) tabsWithErrors.push(2);
      if (newTabErrors[3]) tabsWithErrors.push(3);

      if (tabsWithErrors.length > 0) {
        setActiveTab(tabsWithErrors[0]);
      }

      const uniqueErrors = [...new Set(errorMessages)].slice(0, 5);

      dispatch(
        addToast({
          type: TOAST_TYPES.ERROR,
          message: ERROR_MESSAGES.VALIDATION_ERROR,
          details: uniqueErrors,
          duration: 8000,
        })
      );

      return;
    }

    // Extract file objects from contacts and documents
    const files = {};
    const cleanFormData = { ...formData };

    // Process contacts to extract photo files
    if (cleanFormData.contacts && Array.isArray(cleanFormData.contacts)) {
      cleanFormData.contacts = cleanFormData.contacts.map((contact, index) => {
        const cleanContact = { ...contact };

        // Extract photo file if it exists
        if (cleanContact.photo instanceof File) {
          files[`contact_${index}_photo`] = cleanContact.photo;
          cleanContact.photo = null; // ✅ Set to null instead of filename string
        } else if (typeof cleanContact.photo === "string") {
          // If photo is already a filename string (from state), remove it
          cleanContact.photo = null;
        }

        // Remove preview URL (not needed for backend)
        delete cleanContact.photo_preview;

        return cleanContact;
      });
    }

    // Process documents to extract file uploads and map field names
    if (cleanFormData.documents && Array.isArray(cleanFormData.documents)) {
      cleanFormData.documents = cleanFormData.documents.map((doc, index) => {
        const cleanDoc = { ...doc };

        // Map frontend field names to backend field names
        const mappedDoc = {
          document_type_id: cleanDoc.documentType || cleanDoc.document_type_id,
          document_number: cleanDoc.documentNumber || cleanDoc.document_number,
          valid_from: cleanDoc.validFrom || cleanDoc.valid_from,
          valid_to: cleanDoc.validTo || cleanDoc.valid_to,
          country: cleanDoc.country,
          status: cleanDoc.status !== undefined ? cleanDoc.status : true,
        };

        // Extract document file if it exists
        if (cleanDoc.fileUpload instanceof File) {
          const fileKey = `document_${index}_file`;
          files[fileKey] = cleanDoc.fileUpload;
          mappedDoc.fileKey = fileKey; // Add fileKey reference for backend
          // ✅ Don't include fileName and fileType in payload - backend gets them from the File
        } else {
          // If no file uploaded, set fileKey to null
          mappedDoc.fileKey = null;
        }

        return mappedDoc;
      });
    }

    // Process general section to extract NDA/MSA files
    if (cleanFormData.general) {
      // Handle NDA upload
      if (cleanFormData.general.upload_nda instanceof File) {
        files["general_nda"] = cleanFormData.general.upload_nda;
        cleanFormData.general.upload_nda = null; // ✅ Set to null, not filename
      } else if (typeof cleanFormData.general.upload_nda === "string") {
        cleanFormData.general.upload_nda = null; // Remove filename string
      }

      // Handle MSA upload
      if (cleanFormData.general.upload_msa instanceof File) {
        files["general_msa"] = cleanFormData.general.upload_msa;
        cleanFormData.general.upload_msa = null; // ✅ Set to null, not filename
      } else if (typeof cleanFormData.general.upload_msa === "string") {
        cleanFormData.general.upload_msa = null; // Remove filename string
      }
    }

    // Submit valid data with files using Redux action
    console.log("\n🔍 ===== FRONTEND FILE DEBUG =====");
    console.log("Total files to upload:", Object.keys(files).length);
    Object.entries(files).forEach(([key, file]) => {
      console.log(`  Appending file: ${key}`);
      console.log(`    - name: ${file.name}`);
      console.log(`    - type: ${file.type}`);
      console.log(`    - size: ${file.size} bytes`);
    });
    console.log("===========================\n");

    // Dispatch Redux action to create consignor
    // This will set isCreating to true, disabling the submit button
    dispatch(createConsignor({ consignorData: cleanFormData, files }))
      .unwrap()
      .then((result) => {
        console.log("✅ Consignor created successfully:", result);

        dispatch(
          addToast({
            type: TOAST_TYPES.SUCCESS,
            message: "Consignor created successfully",
            duration: 3000,
          })
        );

        // Reset dirty tracking
        resetDirty();

        // Navigate to list page
        navigate("/consignor");
      })
      .catch((error) => {
        console.error("❌ Failed to create consignor:", error);

        dispatch(
          addToast({
            type: TOAST_TYPES.ERROR,
            message: error.message || "Failed to create consignor",
            duration: 5000,
          })
        );
      });
  };

  // Back button handler with dirty check
  const handleBackClick = () => {
    if (isDirty) {
      showSaveAsDraftModal("/consignor");
    } else {
      navigate("/consignor");
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
      const result = await dispatch(
        saveConsignorAsDraft({ consignorData: formData })
      ).unwrap();

      dispatch(
        addToast({
          type: TOAST_TYPES.SUCCESS,
          message: "Consignor draft saved successfully!",
        })
      );

      resetDirty(formData);

      // Navigate to consignor list page after 1 second
      setTimeout(() => {
        navigate("/consignor");
      }, 1000);
    } catch (error) {
      dispatch(
        addToast({
          type: TOAST_TYPES.ERROR,
          message: error?.message || "Failed to save draft",
        })
      );
    }
  };

  const canSubmit = true;

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
                Create New Consignor
              </h1>
              <p className="text-blue-100/80 text-xs font-medium">
                Complete all sections to create a comprehensive consignor
                profile
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

      {/* Modern Tab Navigation with glassmorphism */}
      <div className="bg-gradient-to-r from-[#0D1A33] to-[#1A2B47] px-6 relative">
        {/* Tab backdrop blur effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D1A33] to-[#1A2B47] backdrop-blur-sm"></div>

        <div className="relative flex space-x-2 py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const hasError = tabErrors[tab.id];

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative px-6 py-3 font-medium text-sm rounded-t-2xl transition-all duration-300 flex items-center gap-3 ${
                  isActive
                    ? "bg-gradient-to-br from-white via-white to-gray-50 text-[#0D1A33] shadow-lg transform -translate-y-1 scale-105"
                    : "bg-white/5 backdrop-blur-sm text-blue-100/80 hover:bg-white/10 hover:text-white border border-white/10 hover:border-white/20"
                }`}
              >
                {/* Active tab decoration */}
                {isActive && (
                  <div className="absolute inset-x-0 -bottom-0 h-1 bg-gradient-to-r from-[#10B981] to-[#059669] rounded-t-full"></div>
                )}

                {/* Error indicator */}
                {hasError && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <AlertCircle className="w-3 h-3 text-white" />
                  </div>
                )}

                <Icon
                  className={`w-5 h-5 transition-all duration-300 ${
                    isActive
                      ? "text-[#10B981] scale-110"
                      : hasError
                      ? "text-red-300 group-hover:text-red-200"
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
      <div className="px-0 rounded-none py-0 space-y-4">
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
                <div className="bg-white/60 backdrop-blur-sm rounded-b-3xl shadow-xl border border-white/40 overflow-hidden">
                  <div className="p-4">
                    <TabComponent
                      formData={formData}
                      setFormData={setFormData}
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

export default ConsignorCreatePage;
