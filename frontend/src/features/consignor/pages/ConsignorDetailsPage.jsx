import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import TMSHeader from "../../../components/layout/TMSHeader";
import { getPageTheme } from "../../../theme.config";
import {
  fetchConsignorById,
  updateConsignor,
  fetchConsignorMasterData,
  clearError,
  updateConsignorDraft,
  submitConsignorFromDraft,
} from "../../../redux/slices/consignorSlice";
import { addToast } from "../../../redux/slices/uiSlice";
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  Building2,
  Users,
  Briefcase,
  FileText,
  AlertTriangle,
  Eye,
  User,
  Calendar,
  Hash,
  Warehouse,
} from "lucide-react";

import { getComponentTheme } from "../../../utils/theme";
import { validateTab } from "../validation";
import { TOAST_TYPES } from "../../../utils/constants";
import EmptyState from "../../../components/ui/EmptyState";
import ApprovalActionBar from "../../../components/approval/ApprovalActionBar";
import SubmitDraftModal from "../../../components/ui/SubmitDraftModal";

// Import view tab components
import GeneralInfoViewTab from "../components/GeneralInfoViewTab";
import ContactViewTab from "../components/ContactViewTab";
import OrganizationViewTab from "../components/OrganizationViewTab";
import DocumentsViewTab from "../components/DocumentsViewTab";
import WarehouseListViewTab from "../components/WarehouseListViewTab";

// Import edit components for edit mode
import GeneralInfoTab from "../components/GeneralInfoTab";
import ContactTab from "../components/ContactTab";
import OrganizationTab from "../components/OrganizationTab";
import DocumentsTab from "../components/DocumentsTab";
import WarehouseListTab from "../components/WarehouseListTab";

const ConsignorDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, role } = useSelector((state) => state.auth);
  const { 
    currentConsignor, 
    isFetching, 
    isUpdating, 
    isUpdatingDraft,
    isSubmittingDraft,
    error 
  } = useSelector((state) => state.consignor);

  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [editFormData, setEditFormData] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [tabErrors, setTabErrors] = useState({
    0: false, // General Information
    1: false, // Contact Information
    2: false, // Organization Details
    3: false, // Documents
    4: false, // Warehouse List
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const actionButtonTheme = getComponentTheme("actionButton");
  const tabButtonTheme = getComponentTheme("tabButton");
  const theme = getPageTheme("tab");

  const tabs = [
    {
      id: 0,
      name: "General Information",
      icon: Building2,
      viewComponent: GeneralInfoViewTab,
      editComponent: GeneralInfoTab,
    },
    {
      id: 1,
      name: "Contact Information",
      icon: Users,
      viewComponent: ContactViewTab,
      editComponent: ContactTab,
    },
    {
      id: 2,
      name: "Organization Details",
      icon: Briefcase,
      viewComponent: OrganizationViewTab,
      editComponent: OrganizationTab,
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
      name: "Warehouse List",
      icon: Warehouse,
      viewComponent: WarehouseListViewTab,
      editComponent: WarehouseListTab,
    },
  ];

  // Load consignor data from API
  useEffect(() => {
    if (id) {
      dispatch(fetchConsignorById(id));
    }
  }, [id, dispatch]);

  // Fetch master data on component mount
  useEffect(() => {
    dispatch(fetchConsignorMasterData());
  }, [dispatch]);

  // Set edit form data when consignor data is loaded
  // Transform flattened currentConsignor into nested structure for edit components
  useEffect(() => {
    if (currentConsignor) {
      console.log("📋 ===== CONSIGNOR DETAILS PAGE DEBUG =====");
      console.log("currentConsignor from Redux:", currentConsignor);

      // The Redux slice already flattened the backend response 
      // Backend returns: { general: {...}, contacts: [...], documents: [...] }
      // Redux flattens to: { ...general, contacts: [...], documents: [...] }
      // We need to reconstruct the nested structure for edit components

      const { 
        contacts, 
        organization, 
        documents, 
        userApprovalStatus, 
        ...generalFields 
      } = currentConsignor;

      // 🔄 MAP BACKEND CONTACT FIELDS TO FRONTEND FIELD NAMES
      const mappedContacts = (contacts || []).map(contact => ({
        // Map backend field names to frontend field names expected by ContactTab
        contact_id: contact.contact_id,
        designation: contact.contact_designation || contact.designation || "",
        name: contact.contact_name || contact.name || "",
        number: contact.contact_number || contact.number || "",
        photo: contact.contact_photo || contact.photo || null,
        role: contact.contact_role || contact.role || "",
        email: contact.email_id || contact.email || "",
        linkedin_link: contact.linkedin_link || "",
        status: contact.status || "ACTIVE",
        // Add backend-specific fields for download functionality
        _backend_photo_id: contact.contact_photo,
        _backend_number: contact.contact_number,
        _backend_name: contact.contact_name,
        // 📸 ADD EXISTING PHOTO PREVIEW FOR THEMETABLE
        photo_preview: contact.contact_photo ? 
          `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/consignors/${currentConsignor.customer_id}/contacts/${contact.contact_id}/photo` : 
          null,
        // Add metadata for ThemeTable to recognize existing files
        fileName: contact.contact_photo ? `${contact.contact_name || 'Contact'}_Photo` : "",
        fileType: contact.contact_photo ? "image/jpeg" : "", // Assume JPEG for contact photos
        fileData: null // ThemeTable expects this for preview mode
      }));

      // 🔄 MAP BACKEND DOCUMENT FIELDS TO FRONTEND FIELD NAMES
      const mappedDocuments = (documents || []).map(document => ({
        // Map backend field names to frontend field names expected by DocumentsTab
        documentType: document.document_type || document.documentType || "",
        documentNumber: document.document_number || document.documentNumber || "",
        referenceNumber: document.reference_number || document.referenceNumber || "",
        country: document.country || "",
        validFrom: document.valid_from || document.validFrom || "",
        validTo: document.valid_to || document.validTo || "",
        status: document.status || true,
        fileName: document.file_name || document.fileName || "",
        fileType: document.file_type || document.fileType || "",
        fileData: "",
        fileUpload: null,
        documentProvider: document.document_provider || document.documentProvider || "",
        premiumAmount: document.premium_amount || document.premiumAmount || 0,
        remarks: document.remarks || "",
        // Keep original backend fields for reference
        _backend_document_id: document.document_id,
        _backend_document_unique_id: document.document_unique_id
      }));

      // Create proper nested formData structure with field mapping
      const transformedData = {
        general: generalFields, // All general fields (customer_name, upload_nda, upload_msa, approved_date, etc.)
        contacts: mappedContacts,
        organization: organization || {
          company_code: "",
          business_area: "",
          status: "ACTIVE",
        },
        documents: mappedDocuments,
      };

      console.log("📋 Transformed data for edit mode:");
      console.log("  general:", transformedData.general);
      console.log("  ✅ approved_date:", transformedData.general?.approved_date);
      console.log("  contacts (mapped):", transformedData.contacts);
      console.log("  ✅ First contact phone:", transformedData.contacts[0]?.number);
      console.log("  ✅ First contact photo:", transformedData.contacts[0]?.photo);
      console.log("  organization:", transformedData.organization);
      console.log("  documents (mapped):", transformedData.documents);
      console.log("  ✅ First document country:", transformedData.documents[0]?.country);
      console.log("  ✅ First document validFrom:", transformedData.documents[0]?.validFrom);
      console.log("🔍 NDA Document ID:", transformedData.general?.upload_nda);
      console.log("🔍 MSA Document ID:", transformedData.general?.upload_msa);
      console.log("==========================================");

      setEditFormData(transformedData);
    }
  }, [currentConsignor]);

  // Track unsaved changes
  useEffect(() => {
    if (editFormData && currentConsignor && isEditMode) {
      const hasChanges =
        JSON.stringify(editFormData) !== JSON.stringify(currentConsignor);
      setHasUnsavedChanges(hasChanges);
    }
  }, [editFormData, currentConsignor, isEditMode]);

  // Clear errors when switching tabs
  useEffect(() => {
    if (!isEditMode) {
      setValidationErrors({});
    }
  }, [activeTab, isEditMode]);

  // Refresh data function for approval actions
  const handleRefreshData = () => {
    console.log("🔄 Refreshing consignor data...", id);
    if (id) {
      dispatch(fetchConsignorById(id))
        .unwrap()
        .then((data) => {
          console.log("✅ Consignor data refreshed:", data);
          console.log("📊 Current status:", data?.general?.status);
        })
        .catch((error) => {
          console.error("❌ Failed to refresh consignor data:", error);
        });
    }
  };

  // Check if consignor is a draft
  const isDraftConsignor = currentConsignor?.status === "SAVE_AS_DRAFT";

  // Check if current user is the creator of this consignor
  // Use String() to ensure type consistency in comparison
  const isCreator =
    currentConsignor?.created_by &&
    user?.user_id &&
    String(currentConsignor.created_by) === String(user.user_id);

  // Check if current user is an approver
  // Check both role and user_type_id for Product Owner detection
  const isApprover =
    user?.role === "Product Owner" ||
    user?.role === "admin" ||
    user?.user_type_id === "UT001"; // UT001 is Owner/Product Owner

  // 🔍 DEBUG: Log creator and approver checks
  console.log("🔍 EDIT BUTTON DEBUG - CONSIGNOR:");
  console.log("  Current User ID:", user?.user_id, typeof user?.user_id);
  console.log("  Current User Role:", user?.role);
  console.log("  Current User Type ID:", user?.user_type_id);
  console.log(
    "  Consignor Created By:",
    currentConsignor?.created_by,
    typeof currentConsignor?.created_by
  );
  console.log(
    "  String Comparison:",
    String(currentConsignor?.created_by),
    "===",
    String(user?.user_id)
  );
  console.log("  Is Creator:", isCreator);
  console.log("  Is Approver:", isApprover, "(role-based or UT001)");
  console.log("  Is Draft:", isDraftConsignor);
  console.log("  Status:", currentConsignor?.status);

  // ✅ PERMISSION LOGIC - Rejection/Resubmission Workflow
  // Determine if user can edit based on entity status and user role
  const canEdit = React.useMemo(() => {
    const status = currentConsignor?.status;

    console.log("🔍 CANEDIT CALCULATION - CONSIGNOR:");
    console.log("  Status:", status);
    console.log("  isDraftConsignor:", isDraftConsignor);
    console.log("  isCreator:", isCreator);
    console.log("  isApprover:", isApprover);

    // DRAFT: Only creator can edit
    if (isDraftConsignor) {
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
  }, [currentConsignor?.status, isCreator, isApprover, isDraftConsignor]);

  console.log("🔍 FINAL CANEDIT VALUE - CONSIGNOR:", canEdit);

  // Debug logging for approval data
  useEffect(() => {
    if (currentConsignor) {
      console.log("🔍 ConsignorDetailsPage - Consignor Data Loaded:");
      console.log("  Consignor ID:", currentConsignor.customerId);
      console.log("  Status:", currentConsignor.general?.status);
      console.log(
        "  User Approval Status:",
        currentConsignor.userApprovalStatus
      );
      console.log(
        "  ✅ Remarks Available:",
        currentConsignor.userApprovalStatus?.remarks ? "YES" : "NO"
      );
      console.log(
        "  Remarks Content:",
        currentConsignor.userApprovalStatus?.remarks
      );
      console.log("  Current User:", user);
      console.log("  Full currentConsignor object:", currentConsignor);
    }
  }, [currentConsignor, user]);

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
      setEditFormData(currentConsignor);
      setValidationErrors({});
      setTabErrors({
        0: false,
        1: false,
        2: false,
        3: false,
        4: false,
      });
      setHasUnsavedChanges(false);
    }
    setIsEditMode(!isEditMode);
  };

  const validateAllSections = (formData) => {
    const errors = {};

    // Validate general information
    const generalValidation = validateTab("general", formData.general);
    if (!generalValidation.isValid) {
      errors.general = generalValidation.errors;
    }

    // Validate contacts
    const contactsValidation = validateTab("contacts", formData.contacts);
    if (!contactsValidation.isValid) {
      errors.contacts = contactsValidation.errors;
    }

    // Validate organization
    const organizationValidation = validateTab(
      "organization",
      formData.organization
    );
    if (!organizationValidation.isValid) {
      errors.organization = organizationValidation.errors;
    }

    // Validate documents
    if (formData.documents && formData.documents.length > 0) {
      const documentsValidation = validateTab("documents", formData.documents);
      if (!documentsValidation.isValid) {
        errors.documents = documentsValidation.errors;
      }
    }

    return errors;
  };

  const handleSaveChanges = async () => {
    // If this is a draft consignor, show the submit modal
    if (currentConsignor?.status === "SAVE_AS_DRAFT") {
      setShowSubmitModal(true);
      return;
    }

    // For non-draft consignors, proceed with normal update
    try {
      // Clear previous errors
      setValidationErrors({});
      setTabErrors({
        0: false,
        1: false,
        2: false,
        3: false,
        4: false,
      });

      // Validate all sections
      const errors = validateAllSections(editFormData);

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);

        // Update tab errors to show which tabs have issues
        const newTabErrors = {
          0: errors.general && Object.keys(errors.general).length > 0,
          1: errors.contacts && Object.keys(errors.contacts).length > 0,
          2: errors.organization && Object.keys(errors.organization).length > 0,
          3: errors.documents && Object.keys(errors.documents).length > 0,
          4: false, // Warehouse List - no validation for now
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
        4: false,
      });
      dispatch(clearError());

      // Extract file objects from editFormData
      const files = {};
      const cleanFormData = { ...editFormData };

      // Process contacts to extract photo files but KEEP frontend field names
      if (cleanFormData.contacts && Array.isArray(cleanFormData.contacts)) {
        cleanFormData.contacts = cleanFormData.contacts.map(
          (contact, index) => {
            // ✅ KEEP Frontend field names for validation (backend expects these)
            const cleanContact = {
              contact_id: contact.contact_id || null,
              designation: contact.designation || "",
              name: contact.name || "",
              number: contact.number || "",
              email: contact.email || "",
              linkedin_link: contact.linkedin_link || "",
              team: contact.team || "",
              role: contact.role || "",
              status: contact.status || "ACTIVE",
              // Keep existing photo logic
              photo: contact.photo
            };

            // Extract photo file if it exists
            if (cleanContact.photo instanceof File) {
              files[`contact_${index}_photo`] = cleanContact.photo;
              cleanContact.photo = null;
            } else if (typeof cleanContact.photo === "string") {
              // Keep existing photo ID for update
              cleanContact.photo = contact._backend_photo_id || cleanContact.photo;
            }

            // Remove preview URL and frontend-specific fields
            delete cleanContact.photo_preview;
            delete cleanContact._backend_photo_id;
            delete cleanContact._backend_number;
            delete cleanContact._backend_name;

            return cleanContact;
          }
        );
      }

      // Process documents to extract file uploads but KEEP frontend field names
      if (cleanFormData.documents && Array.isArray(cleanFormData.documents)) {
        cleanFormData.documents = cleanFormData.documents.map((doc, index) => {
          // ✅ KEEP Frontend field names for validation (backend expects these)
          const cleanDoc = {
            document_unique_id: doc._backend_document_unique_id || null,
            document_type_id: doc.document_type_id || null, 
            documentType: doc.documentType || "",
            documentNumber: doc.documentNumber || "",
            referenceNumber: doc.referenceNumber || "",
            country: doc.country || "",
            validFrom: doc.validFrom || "",
            validTo: doc.validTo || "",
            status: doc.status !== undefined ? doc.status : true,
            fileName: doc.fileName || "",
            fileType: doc.fileType || "",
            fileData: doc.fileData || "",
            document_id: doc._backend_document_id || null
          };

          // Extract document file if it exists
          // Check for File instance OR File-like object (has name, size, type properties)
          const isFileOrFileLike =
            doc.fileUpload &&
            (doc.fileUpload instanceof File ||
              doc.fileUpload instanceof Blob ||
              (typeof doc.fileUpload === "object" &&
                "name" in doc.fileUpload &&
                "size" in doc.fileUpload &&
                "type" in doc.fileUpload));

          if (isFileOrFileLike) {
            const fileKey = `document_${index}_file`;
            files[fileKey] = doc.fileUpload;
            // Add fileKey reference for backend
            cleanDoc.fileKey = fileKey;
          } else {
            // If no file uploaded, set fileKey to null
            cleanDoc.fileKey = null;
          }

          // Remove fields not accepted by backend and frontend-specific fields
          delete cleanDoc.fileUpload_preview;
          delete cleanDoc.fileUpload;
          delete cleanDoc.documentProvider; // Not in backend schema
          delete cleanDoc.premiumAmount; // Not in backend schema
          delete cleanDoc.remarks; // Not in backend schema
          delete cleanDoc._backend_document_id;
          delete cleanDoc._backend_document_unique_id;

          return cleanDoc;
          delete cleanDoc.referenceNumber;
          delete cleanDoc.validFrom;
          delete cleanDoc.validTo;
          delete cleanDoc.fileName;
          delete cleanDoc.fileType;
          delete cleanDoc.fileData;

          return cleanDoc;
        });
      }

      // Process general section to extract NDA/MSA files
      if (cleanFormData.general) {
        // Handle NDA upload
        if (cleanFormData.general.upload_nda instanceof File) {
          files["general_nda"] = cleanFormData.general.upload_nda;
          cleanFormData.general.upload_nda = null;
        } else if (typeof cleanFormData.general.upload_nda === "string") {
          cleanFormData.general.upload_nda = null;
        }

        // Handle MSA upload
        if (cleanFormData.general.upload_msa instanceof File) {
          files["general_msa"] = cleanFormData.general.upload_msa;
          cleanFormData.general.upload_msa = null;
        } else if (typeof cleanFormData.general.upload_msa === "string") {
          cleanFormData.general.upload_msa = null;
        }

        // Remove database audit fields not allowed in validation schema
        delete cleanFormData.general.created_by; // Database audit field, not user input
        delete cleanFormData.general.updated_by; // Database audit field, not user input  
        delete cleanFormData.general.created_at; // Database audit field, not user input
        delete cleanFormData.general.updated_at; // Database audit field, not user input
        delete cleanFormData.general.consignor_unique_id; // Database primary key, not user input
      }

      // Prepare data for backend API (needs nested structure)
      // Extract general fields from cleanFormData
      const { general, contacts, organization, documents } = cleanFormData;

      console.log("\n🔍 ===== UPDATE CONSIGNOR FILE DEBUG =====");
      console.log("Total files to upload:", Object.keys(files).length);
      Object.entries(files).forEach(([key, file]) => {
        console.log(`  File: ${key}`);
        console.log(`    - name: ${file.name}`);
        console.log(`    - type: ${file.type}`);
        console.log(`    - size: ${file.size} bytes`);
      });
      console.log("===========================\n");

      // ✅ RESUBMISSION LOGIC - If entity is INACTIVE (rejected), change status to PENDING
      const isResubmission = currentConsignor?.status === "INACTIVE";

      // If resubmitting, update the status to PENDING to restart approval workflow
      const finalGeneral = isResubmission
        ? {
            ...general,
            status: "PENDING", // Restart approval workflow
          }
        : general;

      console.log("🔍 RESUBMISSION CHECK - CONSIGNOR:");
      console.log("  Current Status:", currentConsignor?.status);
      console.log("  Is Resubmission:", isResubmission);
      console.log("  Final Status:", finalGeneral?.status);

      // Call the update API
      const result = await dispatch(
        updateConsignor({
          customerId: id,
          data: {
            general: finalGeneral,
            contacts,
            organization,
            documents,
          },
          files,
        })
      ).unwrap();

      // Success - show toast notification
      dispatch(
        addToast({
          type: TOAST_TYPES.SUCCESS,
          message: isResubmission
            ? "Consignor resubmitted for approval successfully! Status changed to PENDING."
            : "Consignor updated successfully!",
        })
      );

      // Refresh the consignor data
      await dispatch(fetchConsignorById(id));

      // Switch to view mode
      setIsEditMode(false);
      setHasUnsavedChanges(false);
      setValidationErrors({});
    } catch (err) {
      console.error("Error saving consignor:", err);

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
              general: 0,
              contacts: 1,
              organization: 2,
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
              // Object field error (e.g., general.customer_name)
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
          4: false, // Warehouse List - no validation for now
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
            err.message || "Failed to update consignor. Please try again.",
        })
      );
    }
  };

  // Handle update draft (for SAVE_AS_DRAFT status only)
  const handleUpdateDraft = async () => {
    setShowSubmitModal(false);

    try {
      // Extract file objects from editFormData
      const files = {};
      const cleanFormData = { ...editFormData };

      console.log("\n🔍 ===== EDIT FORM DATA INSPECTION =====");
      console.log("editFormData.documents:", editFormData.documents);
      if (editFormData.documents && Array.isArray(editFormData.documents)) {
        editFormData.documents.forEach((doc, index) => {
          console.log(`Document ${index}:`, {
            documentType: doc.documentType,
            documentNumber: doc.documentNumber,
            hasFileUpload: !!doc.fileUpload,
            fileUploadType: typeof doc.fileUpload,
            isFileObject: doc.fileUpload instanceof File,
            fileUploadKeys: doc.fileUpload
              ? Object.keys(doc.fileUpload)
              : "null",
            fileUploadValue: doc.fileUpload,
          });
        });
      }
      console.log("===========================\n");

      // Process contacts to extract photo files but KEEP frontend field names for validation
      if (cleanFormData.contacts && Array.isArray(cleanFormData.contacts)) {
        cleanFormData.contacts = cleanFormData.contacts.map(
          (contact, index) => {
            // ✅ KEEP Frontend field names (backend validation expects these)
            const cleanContact = {
              contact_id: contact.contact_id || null,
              designation: contact.designation || "",
              name: contact.name || "",
              number: contact.number || "",
              email: contact.email || "",
              linkedin_link: contact.linkedin_link || "",
              team: contact.team || "",
              role: contact.role || "",
              status: contact.status || "ACTIVE",
              // Keep existing photo logic
              photo: contact.photo
            };

            // Extract photo file if it exists
            if (cleanContact.photo instanceof File) {
              files[`contact_${index}_photo`] = cleanContact.photo;
              cleanContact.photo = null;
            } else if (typeof cleanContact.photo === "string") {
              // Keep existing photo ID for update
              cleanContact.photo = contact._backend_photo_id || cleanContact.photo;
            }

            // Remove preview URL and frontend-specific fields
            delete cleanContact.photo_preview;
            delete cleanContact._backend_photo_id;
            delete cleanContact._backend_number;
            delete cleanContact._backend_name;

            return cleanContact;
          }
        );
      }

      // Process documents to extract file uploads and map field names (same as saveConsignorAsDraft)
      if (cleanFormData.documents && Array.isArray(cleanFormData.documents)) {
        cleanFormData.documents = cleanFormData.documents.map((doc, index) => {
          const cleanDoc = { ...doc };

          console.log(`\n🔍 Processing document ${index}:`, {
            hasFileUpload: !!cleanDoc.fileUpload,
            fileUploadType: typeof cleanDoc.fileUpload,
            isFileObject: cleanDoc.fileUpload instanceof File,
            isBlobObject: cleanDoc.fileUpload instanceof Blob,
            fileName: cleanDoc.fileUpload?.name || "N/A",
            constructor: cleanDoc.fileUpload?.constructor?.name || "N/A",
            hasNameProp: cleanDoc.fileUpload && "name" in cleanDoc.fileUpload,
            hasSizeProp: cleanDoc.fileUpload && "size" in cleanDoc.fileUpload,
            documentType: cleanDoc.documentType,
            documentNumber: cleanDoc.documentNumber,
          });

          // ✅ FIXED: Map frontend field names to backend field names (same as saveConsignorAsDraft)
          const mappedDoc = {
            document_type_id: cleanDoc.documentType || cleanDoc.document_type_id,
            document_number: cleanDoc.documentNumber || cleanDoc.document_number,
            valid_from: cleanDoc.validFrom || cleanDoc.valid_from,
            valid_to: cleanDoc.validTo || cleanDoc.valid_to,
            country: cleanDoc.country,
            status: cleanDoc.status !== undefined ? cleanDoc.status : true,
          };

          // Extract document file if it exists
          // Check for File instance OR File-like object (has name, size, type properties)
          const isFileOrFileLike =
            cleanDoc.fileUpload &&
            (cleanDoc.fileUpload instanceof File ||
              cleanDoc.fileUpload instanceof Blob ||
              (typeof cleanDoc.fileUpload === "object" &&
                "name" in cleanDoc.fileUpload &&
                "size" in cleanDoc.fileUpload &&
                "type" in cleanDoc.fileUpload));

          if (isFileOrFileLike) {
            const fileKey = `document_${index}_file`;
            files[fileKey] = cleanDoc.fileUpload;
            // Add fileKey reference for backend
            mappedDoc.fileKey = fileKey;
            console.log(
              `✅ File extracted: ${fileKey} -> ${cleanDoc.fileUpload.name} (${cleanDoc.fileUpload.constructor.name})`
            );
          } else {
            // If no file uploaded, set fileKey to null
            mappedDoc.fileKey = null;
            console.log(
              `⚠️  No file to extract (fileUpload is ${typeof cleanDoc.fileUpload})`
            );
          }

          console.log(`✅ Document mapped:`, {
            original: { documentType: cleanDoc.documentType, documentNumber: cleanDoc.documentNumber },
            mapped: { document_type_id: mappedDoc.document_type_id, document_number: mappedDoc.document_number }
          });

          return mappedDoc;
        });
      }

      // Process general section to extract NDA/MSA files
      if (cleanFormData.general) {
        // Handle NDA upload
        if (cleanFormData.general.upload_nda instanceof File) {
          files["general_nda"] = cleanFormData.general.upload_nda;
          cleanFormData.general.upload_nda = null;
        } else if (typeof cleanFormData.general.upload_nda === "string") {
          cleanFormData.general.upload_nda = null;
        }

        // Handle MSA upload
        if (cleanFormData.general.upload_msa instanceof File) {
          files["general_msa"] = cleanFormData.general.upload_msa;
          cleanFormData.general.upload_msa = null;
        } else if (typeof cleanFormData.general.upload_msa === "string") {
          cleanFormData.general.upload_msa = null;
        }
      }

      // Prepare data for backend API (needs nested structure)
      const { general, contacts, organization, documents } = cleanFormData;

      console.log("\n🔍 ===== UPDATE DRAFT FILE DEBUG =====");
      console.log("Total files to upload:", Object.keys(files).length);
      Object.entries(files).forEach(([key, file]) => {
        console.log(`  File: ${key}`);
        console.log(`    - name: ${file.name}`);
        console.log(`    - type: ${file.type}`);
        console.log(`    - size: ${file.size} bytes`);
      });
      console.log("===========================\n");

      await dispatch(
        updateConsignorDraft({
          customerId: id,
          consignorData: {
            general,
            contacts,
            organization,
            documents,
          },
          files,
        })
      ).unwrap();

      dispatch(
        addToast({
          type: TOAST_TYPES.SUCCESS,
          message: "Draft updated successfully!",
        })
      );

      // Refresh the consignor data
      await dispatch(fetchConsignorById(id));
      setIsEditMode(false);
      setHasUnsavedChanges(false);
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

  // Handle submit draft for approval (SAVE_AS_DRAFT → PENDING)
  const handleSubmitForApproval = async () => {
    setShowSubmitModal(false);

    try {
      // Extract file objects from editFormData
      const files = {};
      const cleanFormData = { ...editFormData };

      // Process contacts to extract photo files but KEEP frontend field names for validation
      if (cleanFormData.contacts && Array.isArray(cleanFormData.contacts)) {
        cleanFormData.contacts = cleanFormData.contacts.map(
          (contact, index) => {
            // ✅ KEEP Frontend field names (backend validation expects these)
            const cleanContact = {
              contact_id: contact.contact_id || null,
              designation: contact.designation || "",
              name: contact.name || "",
              number: contact.number || "",
              email: contact.email || "",
              linkedin_link: contact.linkedin_link || "",
              team: contact.team || "",
              role: contact.role || "",
              status: contact.status || "ACTIVE",
              country_code: contact.country_code || "",
              // Keep existing photo logic
              photo: contact.photo
            };

            // Fix contact number field - ensure it's a string (required by validation)
            if (cleanContact.number === null || cleanContact.number === undefined) {
              cleanContact.number = ""; // Convert null to empty string to prevent validation error
            }

            // Ensure country_code is properly handled  
            if (cleanContact.country_code === null || cleanContact.country_code === undefined) {
              cleanContact.country_code = ""; // Convert null to empty string
            }

            // Extract photo file if it exists
            if (cleanContact.photo instanceof File) {
              files[`contact_${index}_photo`] = cleanContact.photo;
              cleanContact.photo = null;
            } else if (typeof cleanContact.photo === "string") {
              // ⭐ CRITICAL: Preserve existing photo ID for submit (don't nullify!)
              cleanContact.photo = contact._backend_photo_id || cleanContact.photo;
            }

            // Remove preview URL and frontend-specific fields
            delete cleanContact.photo_preview;
            delete cleanContact._backend_photo_id;
            delete cleanContact._backend_number;
            delete cleanContact._backend_name;

            return cleanContact;
          }
        );
      }

      // Process documents to extract file uploads
      if (cleanFormData.documents && Array.isArray(cleanFormData.documents)) {
        cleanFormData.documents = cleanFormData.documents.map((doc, index) => {
          const cleanDoc = { ...doc };

          // Extract document file if it exists
          // Check for File instance OR File-like object (has name, size, type properties)
          const isFileOrFileLike =
            cleanDoc.fileUpload &&
            (cleanDoc.fileUpload instanceof File ||
              cleanDoc.fileUpload instanceof Blob ||
              (typeof cleanDoc.fileUpload === "object" &&
                "name" in cleanDoc.fileUpload &&
                "size" in cleanDoc.fileUpload &&
                "type" in cleanDoc.fileUpload));

          if (isFileOrFileLike) {
            const fileKey = `document_${index}_file`;
            files[fileKey] = cleanDoc.fileUpload;
            // Add fileKey reference for backend
            cleanDoc.fileKey = fileKey;
          } else {
            // If no file uploaded, set fileKey to null
            cleanDoc.fileKey = null;
          }

          // Remove fields not accepted by backend validation
          delete cleanDoc.fileUpload_preview;
          delete cleanDoc.fileUpload;
          delete cleanDoc.documentProvider; // Not in backend schema
          delete cleanDoc.premiumAmount; // Not in backend schema
          delete cleanDoc.remarks; // Not in backend schema
          
          // Remove frontend-only fields that cause validation errors
          delete cleanDoc.documentUniqueId; // Frontend display field, not allowed in backend
          delete cleanDoc.documentTypeName; // Frontend display field, not allowed in backend  
          delete cleanDoc.documentId; // Frontend reference field, not allowed in backend

          return cleanDoc;
        });
      }

      // Process general section to extract NDA/MSA files
      if (cleanFormData.general) {
        // Handle NDA upload
        if (cleanFormData.general.upload_nda instanceof File) {
          files["general_nda"] = cleanFormData.general.upload_nda;
          cleanFormData.general.upload_nda = null;
        } else if (typeof cleanFormData.general.upload_nda === "string") {
          cleanFormData.general.upload_nda = null;
        }

        // Handle MSA upload
        if (cleanFormData.general.upload_msa instanceof File) {
          files["general_msa"] = cleanFormData.general.upload_msa;
          cleanFormData.general.upload_msa = null;
        } else if (typeof cleanFormData.general.upload_msa === "string") {
          cleanFormData.general.upload_msa = null;
        }

        // Remove database audit fields not allowed in validation schema
        delete cleanFormData.general.created_by; // Database audit field, not user input
        delete cleanFormData.general.updated_by; // Database audit field, not user input  
        delete cleanFormData.general.created_at; // Database audit field, not user input
        delete cleanFormData.general.updated_at; // Database audit field, not user input
        delete cleanFormData.general.consignor_unique_id; // Database primary key, not user input
      }

      // Prepare data for backend API (needs nested structure)
      const { general, contacts, organization, documents } = cleanFormData;

      console.log("\n🔍 ===== SUBMIT DRAFT FILE DEBUG =====");
      console.log("Total files to upload:", Object.keys(files).length);
      Object.entries(files).forEach(([key, file]) => {
        console.log(`  File: ${key}`);
        console.log(`    - name: ${file.name}`);
        console.log(`    - type: ${file.type}`);
        console.log(`    - size: ${file.size} bytes`);
      });
      console.log("===========================\n");

      await dispatch(
        submitConsignorFromDraft({
          customerId: id,
          consignorData: {
            general,
            contacts,
            organization,
            documents,
          },
          files,
        })
      ).unwrap();

      dispatch(
        addToast({
          type: TOAST_TYPES.SUCCESS,
          message:
            "Consignor submitted for approval successfully! Status changed to PENDING.",
        })
      );

      // Refresh the consignor data
      await dispatch(fetchConsignorById(id));
      setIsEditMode(false);
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error("Error submitting for approval:", err);
      dispatch(clearError());

      // Handle validation errors with multiple error details
      if (err.code === "VALIDATION_ERROR") {
        // If there are multiple validation errors in details array
        if (err.errors && Array.isArray(err.errors) && err.errors.length > 0) {
          // Show each error in a toast
          err.errors.forEach((error) => {
            const errorMessage = error.message || "Validation error";
            dispatch(
              addToast({
                type: TOAST_TYPES.ERROR,
                message: errorMessage,
              })
            );
          });

          // Switch to the first tab with errors
          const firstError = err.errors[0];
          if (firstError.field) {
            const fieldMatch = firstError.field.match(
              /^(\w+)(?:\[(\d+)\])?\.?(.+)?$/
            );
            if (fieldMatch) {
              const [, section] = fieldMatch;
              const tabMapping = {
                general: 0,
                contacts: 1,
                organization: 2,
                documents: 3,
              };
              const tabWithError = tabMapping[section];
              if (tabWithError !== undefined && tabWithError !== null) {
                setActiveTab(tabWithError);
              }
            }
          }
          return;
        }

        // Handle single validation error (backward compatibility)
        if (err.field) {
          const fieldMatch = err.field.match(/^(\w+)(?:\[(\d+)\])?\.?(.+)?$/);
          if (fieldMatch) {
            const [, section] = fieldMatch;
            const tabMapping = {
              general: 0,
              contacts: 1,
              organization: 2,
              documents: 3,
            };
            const tabWithError = tabMapping[section];
            if (tabWithError !== null) {
              setActiveTab(tabWithError);
            }
          }

          // Build user-friendly error message with expected format
          let errorMessage = err.message;
          if (err.expectedFormat) {
            errorMessage = `${err.message} (Expected format: ${err.expectedFormat})`;
          }

          dispatch(
            addToast({
              type: TOAST_TYPES.ERROR,
              message: errorMessage,
            })
          );
          return;
        }

        // Generic validation error without field info
        dispatch(
          addToast({
            type: TOAST_TYPES.ERROR,
            message:
              err.message || "Validation failed. Please check your input.",
          })
        );
        return;
      }

      // Other errors (network, server, etc.)
      dispatch(
        addToast({
          type: TOAST_TYPES.ERROR,
          message:
            err.message ||
            "Failed to submit for approval. Please check all required fields.",
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
      case "save_as_draft":
      case "draft":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#F8FAFC] to-[#F1F5F9] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading consignor details...</p>
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
            {error.message || "Failed to load consignor details"}
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

  if (!currentConsignor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#F8FAFC] to-[#F1F5F9] flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Consignor Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The requested consignor could not be found.
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
                  {currentConsignor.customer_name || "Unnamed Consignor"}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    currentConsignor.status
                  )}`}
                >
                  {currentConsignor.status === "SAVE_AS_DRAFT"
                    ? "DRAFT"
                    : currentConsignor.status || "UNKNOWN"}
                </span>
              </div>
              <div className="flex items-center gap-4 text-blue-100/80 text-xs">
                <div className="flex items-center gap-2">
                  <Hash className="w-3 h-3" />
                  <span>ID: {currentConsignor.customer_id || id}</span>
                </div>
                {currentConsignor.created_by && (
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3" />
                    <span>Created by: {currentConsignor.created_by}</span>
                  </div>
                )}
                {currentConsignor.created_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    <span>Created: {currentConsignor.created_date}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Approval Action Bar - Only show for records with actual approval flow */}
            {currentConsignor.userApprovalStatus &&
              currentConsignor.userApprovalStatus.currentApprovalStatus !==
                "Not in Approval Flow" && (
                <>
                  {console.log(
                    "🎯 ConsignorDetailsPage - Passing userApprovalStatus:",
                    currentConsignor.userApprovalStatus
                  )}
                  {console.log(
                    "🎯 ConsignorDetailsPage - Current user from Redux:",
                    user
                  )}
                  <ApprovalActionBar
                    userApprovalStatus={currentConsignor.userApprovalStatus}
                    entityId={id}
                    onRefreshData={handleRefreshData}
                  />
                </>
              )}

            {console.log("🔍 BUTTON RENDER CHECK - CONSIGNOR:", {
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

                {/* Single Save Changes button for all statuses (including drafts) */}
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
              !isEditMode &&
              canEdit && (
                <button
                  onClick={handleEditToggle}
                  className="group inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#10B981] to-[#059669] text-white rounded-xl font-medium text-sm hover:from-[#059669] hover:to-[#10B981] transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-green-500/25"
                >
                  <Edit className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                  {currentConsignor.status === "SAVE_AS_DRAFT" ||
                  currentConsignor.status === "DRAFT"
                    ? "Edit Draft"
                    : "Edit Details"}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* ✅ REJECTION REMARKS BANNER - Show when entity is rejected (INACTIVE) */}
      {currentConsignor?.status === "INACTIVE" &&
        currentConsignor?.userApprovalStatus?.remarks && (
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
                  {currentConsignor.userApprovalStatus.remarks}
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
                    <EmptyState message="No data available" />
                  ) : (
                    <div className="p-4" style={{ height: "fit-content" }}>
                    {/* <div className="p-4" style={{height: "665px"}}> */}
                      <TabComponent
                        // For edit mode, pass formData. For view mode, pass consignor
                        {...(isEditMode
                          ? {
                              formData: editFormData,
                              setFormData: setEditFormData,
                            }
                          : {
                              consignor: currentConsignor,
                            })}
                        errors={
                          isEditMode
                            ? tab.id === 0
                              ? validationErrors.general || {}
                              : tab.id === 1
                              ? validationErrors.contacts || {}
                              : tab.id === 2
                              ? validationErrors.organization || {}
                              : tab.id === 3
                              ? validationErrors.documents || {}
                              : {}
                            : {}
                        }
                        isEditMode={isEditMode}
                        consignorData={currentConsignor}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Submit Draft Modal */}
      <SubmitDraftModal
        isOpen={showSubmitModal}
        onUpdateDraft={handleUpdateDraft}
        onSubmitForApproval={handleSubmitForApproval}
        onCancel={() => setShowSubmitModal(false)}
        isLoading={isUpdating}
        title="Submit Changes"
        message="Would you like to update the draft or submit it for approval?"
      />
    </div>
  );
};

export default ConsignorDetailsPage;
