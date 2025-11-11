// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import TMSHeader from "../../../components/layout/TMSHeader";
// import {
//   ArrowLeft,
//   User,
//   Loader2,
//   Edit,
//   Save,
//   X,
//   FileText,
//   Briefcase,
//   AlertTriangle,
//   Users,
//   Car,
//   Ban,
//   AlertCircle,
//   Eye,
// } from "lucide-react";
// import {
//   fetchDriverById,
//   updateDriver,
//   fetchMasterData,
//   clearError,
// } from "../../../redux/slices/driverSlice";
// import { addToast } from "../../../redux/slices/uiSlice";
// import { Button } from "../../../components/ui/Button";
// import { Card } from "../../../components/ui/Card";
// import { getPageTheme, getComponentTheme } from "../../../theme.config";

// // Import view tab components
// import BasicInfoViewTab from "../components/BasicInfoViewTab";
// import DocumentsViewTab from "../components/DocumentsViewTab";
// import HistoryViewTab from "../components/HistoryViewTab";
// import AccidentViolationViewTab from "../components/AccidentViolationViewTab";
// import TransporterMappingViewTab from "../components/TransporterMappingViewTab";
// import VehicleMappingViewTab from "../components/VehicleMappingViewTab";
// import BlacklistMappingViewTab from "../components/BlacklistMappingViewTab";

// // Import edit tab components
// import BasicInfoTab from "../components/BasicInfoTab";
// import DocumentsTab from "../components/DocumentsTab";
// import HistoryTab from "../components/HistoryTab";
// import AccidentViolationTab from "../components/AccidentViolationTab";
// import TransporterMappingTab from "../components/TransporterMappingTab";
// import VehicleMappingTab from "../components/VehicleMappingTab";
// import BlacklistMappingTab from "../components/BlacklistMappingTab";

// const DriverDetailsPage = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const theme = getPageTheme("tab") || {};
//   const actionButtonTheme = getComponentTheme("actionButton") || {};
//   const tabButtonTheme = getComponentTheme("tabButton") || {};

//   // Ensure theme objects have required structure with defaults
//   const safeTheme = {
//     colors: {
//       primary: { background: theme.colors?.primary?.background || "#10B981" },
//       card: {
//         background: theme.colors?.card?.background || "#FFFFFF",
//         border: theme.colors?.card?.border || "#E5E7EB",
//       },
//       text: {
//         primary: theme.colors?.text?.primary || "#111827",
//         secondary: theme.colors?.text?.secondary || "#6B7280",
//       },
//       status: {
//         error: theme.colors?.status?.error || "#EF4444",
//       },
//     },
//   };

//   const safeActionButtonTheme = {
//     primary: {
//       background: actionButtonTheme.primary?.background || "#10B981",
//       text: actionButtonTheme.primary?.text || "#FFFFFF",
//       border: actionButtonTheme.primary?.border || "#10B981",
//     },
//     secondary: {
//       background: actionButtonTheme.secondary?.background || "#F3F4F6",
//       text: actionButtonTheme.secondary?.text || "#374151",
//       border: actionButtonTheme.secondary?.border || "#D1D5DB",
//     },
//   };

//   const safeTabButtonTheme = {
//     active: {
//       background: tabButtonTheme.active?.background || "#F0FDF4",
//       text: tabButtonTheme.active?.text || "#10B981",
//       border: tabButtonTheme.active?.border || "#10B981",
//     },
//     default: {
//       background: tabButtonTheme.default?.background || "#FFFFFF",
//       text: tabButtonTheme.default?.text || "#6B7280",
//       border: tabButtonTheme.default?.border || "transparent",
//     },
//   };

//   const { selectedDriver, isFetchingDetails, isUpdating, error, masterData } =
//     useSelector((state) => state.driver);

//   const [isEditMode, setIsEditMode] = useState(false);
//   const [activeTab, setActiveTab] = useState(0);
//   const [editFormData, setEditFormData] = useState(null);
//   const [validationErrors, setValidationErrors] = useState({});
//   const [tabErrors, setTabErrors] = useState({
//     0: false, // Basic Info
//     1: false, // Documents
//     2: false, // History
//     3: false, // Accident & Violation
//     4: false, // Transporter Mapping
//     5: false, // Vehicle Mapping
//     6: false, // Blacklist Mapping
//   });

//   const tabs = [
//     {
//       id: 0,
//       name: "Basic Information",
//       icon: User,
//       viewComponent: BasicInfoViewTab,
//       editComponent: BasicInfoTab,
//     },
//     {
//       id: 1,
//       name: "Documents",
//       icon: FileText,
//       viewComponent: DocumentsViewTab,
//       editComponent: DocumentsTab,
//     },
//     {
//       id: 2,
//       name: "History Information",
//       icon: Briefcase,
//       viewComponent: HistoryViewTab,
//       editComponent: HistoryTab,
//     },
//     {
//       id: 3,
//       name: "Accident & Violation",
//       icon: AlertTriangle,
//       viewComponent: AccidentViolationViewTab,
//       editComponent: AccidentViolationTab,
//     },
//     {
//       id: 4,
//       name: "Transporter/Owner Mapping",
//       icon: Users,
//       viewComponent: TransporterMappingViewTab,
//       editComponent: TransporterMappingTab,
//     },
//     {
//       id: 5,
//       name: "Vehicle Mapping",
//       icon: Car,
//       viewComponent: VehicleMappingViewTab,
//       editComponent: VehicleMappingTab,
//     },
//     {
//       id: 6,
//       name: "Blacklist Mapping",
//       icon: Ban,
//       viewComponent: BlacklistMappingViewTab,
//       editComponent: BlacklistMappingTab,
//     },
//   ];

//   // Load driver data
//   useEffect(() => {
//     if (id) {
//       dispatch(fetchDriverById(id));
//       dispatch(fetchMasterData());
//     }
//   }, [id, dispatch]);

//   // Initialize edit form data when driver loads
//   useEffect(() => {
//     if (selectedDriver && !editFormData) {
//       setEditFormData({
//         basicInfo: {
//           fullName: selectedDriver.fullName || "",
//           dateOfBirth: selectedDriver.dateOfBirth || "",
//           gender: selectedDriver.gender || "",
//           bloodGroup: selectedDriver.bloodGroup || "",
//           phoneNumber: selectedDriver.phoneNumber || "",
//           emailId: selectedDriver.emailId || "",
//           whatsAppNumber: selectedDriver.whatsAppNumber || "",
//           alternatePhoneNumber: selectedDriver.alternatePhoneNumber || "",
//         },
//         addresses: selectedDriver.addresses || [],
//         documents: selectedDriver.documents || [],
//         history: selectedDriver.history || [],
//         accidents: selectedDriver.accidents || [],
//         transporterMappings: selectedDriver.transporterMappings || [],
//         vehicleMappings: selectedDriver.vehicleMappings || [],
//         blacklistMappings: selectedDriver.blacklistMappings || [],
//       });
//     }
//   }, [selectedDriver, editFormData]);

//   // Handle errors
//   useEffect(() => {
//     if (error) {
//       dispatch(
//         addToast({
//           type: "error",
//           message: error.message || "Failed to load driver details",
//         })
//       );
//       dispatch(clearError());
//     }
//   }, [error, dispatch]);

//   const handleBack = () => {
//     navigate("/drivers");
//   };

//   const handleEditToggle = () => {
//     if (isEditMode) {
//       // Cancel edit - reset form data
//       setEditFormData(null);
//       setValidationErrors({});
//       setTabErrors({
//         0: false,
//         1: false,
//         2: false,
//         3: false,
//         4: false,
//         5: false,
//         6: false,
//       });
//     }
//     setIsEditMode(!isEditMode);
//   };

//   const handleFormDataChange = (section, data) => {
//     setEditFormData((prev) => ({
//       ...prev,
//       [section]: data,
//     }));
//   };

//   const handleValidationErrorsChange = (errors) => {
//     setValidationErrors(errors);
//   };

//   const handleTabErrorChange = (tabId, hasError) => {
//     setTabErrors((prev) => ({
//       ...prev,
//       [tabId]: hasError,
//     }));
//   };

//   const handleSave = async () => {
//     // Basic validation
//     const hasErrors = Object.values(tabErrors).some((err) => err);
//     if (hasErrors) {
//       dispatch(
//         addToast({
//           type: "error",
//           message: "Please fix validation errors before saving",
//         })
//       );
//       return;
//     }

//     // Dispatch update action
//     const result = await dispatch(
//       updateDriver({
//         driverId: id,
//         driverData: editFormData,
//       })
//     );

//     if (result.type.endsWith("/fulfilled")) {
//       dispatch(
//         addToast({
//           type: "success",
//           message: "Driver updated successfully",
//         })
//       );
//       setIsEditMode(false);
//       setEditFormData(null);
//       // Reload driver data
//       dispatch(fetchDriverById(id));
//     }
//   };

//   const ActiveTabComponent = isEditMode
//     ? tabs[activeTab].editComponent
//     : tabs[activeTab].viewComponent;

//   return (
//     <div
// <<<<<<< Updated upstream
//       className="min-h-screen px-4 py-2 lg:px-4"
// =======
//       className="min-h-screen"
// >>>>>>> Stashed changes
//       style={{
//         background: `linear-gradient(to bottom right, ${safeTheme.colors.primary.background}, #f0f4f8, #e6f0ff)`,
//       }}
//     >
//       <div className="max-w-7xl mx-auto space-y-3">
//         {/* Header */}
//         <Card
//           className="overflow-hidden border shadow-md"
//           style={{
//             backgroundColor: safeTheme.colors.card.background,
//             borderColor: safeTheme.colors.card.border,
//           }}
//         >
//           <div className="p-0">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-4">
//                 <Button
//                   onClick={handleBack}
//                   style={{
//                     backgroundColor: safeActionButtonTheme.secondary.background,
//                     color: safeActionButtonTheme.secondary.text,
//                     borderColor: safeActionButtonTheme.secondary.border,
//                   }}
//                   className="flex items-center space-x-2 border hover:opacity-90 transition-opacity"
//                 >
//                   <ArrowLeft className="h-4 w-4" />
//                   {/* <span>Back</span> */}
//                 </Button>
//                 <div className="flex items-center space-x-3">
//                   <User
//                     className="h-8 w-8"
//                     style={{ color: safeActionButtonTheme.primary.background }}
//                   />
//                   <div>
//                     <h1
//                       className="text-2xl font-bold"
//                       style={{ color: safeTheme.colors.text.primary }}
//                     >
//                       Driver Details
//                     </h1>
//                     <p
//                       className="text-sm"
//                       style={{ color: safeTheme.colors.text.secondary }}
//                     >
//                       {id ? `Driver ID: ${id}` : "Loading..."}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex items-center space-x-3">
//                 {isEditMode ? (
//                   <>
//                     <Button
//                       onClick={handleEditToggle}
//                       disabled={isUpdating}
//                       style={{
//                         backgroundColor:
//                           safeActionButtonTheme.secondary.background,
//                         color: safeActionButtonTheme.secondary.text,
//                         borderColor: safeActionButtonTheme.secondary.border,
//                       }}
//                       className="flex items-center space-x-2 border hover:opacity-90 transition-opacity"
//                     >
//                       <X className="h-4 w-4" />
//                       <span>Cancel</span>
//                     </Button>
//                     <Button
//                       onClick={handleSave}
//                       disabled={isUpdating}
//                       style={{
//                         backgroundColor:
//                           safeActionButtonTheme.primary.background,
//                         color: safeActionButtonTheme.primary.text,
//                         opacity: isUpdating ? 0.5 : 1,
//                       }}
//                       className="flex items-center space-x-2 hover:opacity-90 transition-opacity"
//                     >
//                       <Save className="h-4 w-4" />
//                       <span>{isUpdating ? "Saving..." : "Save Changes"}</span>
//                     </Button>
//                   </>
//                 ) : (
//                   <Button
//                     onClick={handleEditToggle}
//                     style={{
//                       backgroundColor: safeActionButtonTheme.primary.background,
//                       color: safeActionButtonTheme.primary.text,
//                     }}
//                     className="flex items-center space-x-2 hover:opacity-90 transition-opacity"
//                   >
//                     <Edit className="h-4 w-4" />
//                     <span>Edit</span>
//                   </Button>
//                 )}
//               </div>
//             </div>
//           </div>
//         </Card>

//         {/* Loading State */}
//         {isFetchingDetails && (
//           <Card
//             className="overflow-hidden border shadow-md"
//             style={{
//               backgroundColor: safeTheme.colors.card.background,
//               borderColor: safeTheme.colors.card.border,
//             }}
//           >
//             <div className="p-8 text-center">
//               <Loader2
//                 className="h-12 w-12 animate-spin mx-auto mb-4"
//                 style={{ color: safeActionButtonTheme.primary.background }}
//               />
//               <p style={{ color: safeTheme.colors.text.secondary }}>
//                 Loading driver details...
//               </p>
//             </div>
//           </Card>
//         )}

//         {/* Error State */}
//         {error && !isFetchingDetails && (
//           <Card
//             className="overflow-hidden border shadow-md"
//             style={{
//               backgroundColor: safeTheme.colors.card.background,
//               borderColor: safeTheme.colors.card.border,
//             }}
//           >
//             <div className="p-8 text-center">
//               <User
//                 className="h-24 w-24 mx-auto mb-4"
//                 style={{ color: safeTheme.colors.status.error }}
//               />
//               <h2
//                 className="text-2xl font-bold mb-2"
//                 style={{ color: safeTheme.colors.status.error }}
//               >
//                 Error Loading Driver
//               </h2>
//               <p
//                 style={{ color: safeTheme.colors.text.secondary }}
//                 className="mb-4"
//               >
//                 {error?.message || "Something went wrong"}
//               </p>
//               <Button
//                 onClick={handleBack}
//                 style={{
//                   backgroundColor: actionButtonTheme.primary.background,
//                   color: actionButtonTheme.primary.text,
//                 }}
//               >
//                 Back to Driver List
//               </Button>
//             </div>
//           </Card>
//         )}

//         {/* Content */}
//         {!isFetchingDetails && !error && selectedDriver && (
//           <>
//             {/* Tab Navigation - Matches Transporter Design */}
//             <div className="bg-gradient-to-r from-[#0D1A33] to-[#1A2B47] px-6 rounded-t-2xl relative">
//               {/* Tab backdrop blur effect */}
//               <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-t-2xl"></div>

//               <div className="relative flex flex-nowrap gap-2 py-2 scrollable-tabs px-2">
//                 {tabs.map((tab) => {
//                   const Icon = tab.icon;
//                   const isActive = activeTab === tab.id;
//                   const hasError = tabErrors[tab.id];

//                   return (
//                     <button
//                       key={tab.id}
//                       onClick={() => setActiveTab(tab.id)}
//                       className={`text-nowrap group relative px-6 py-4 font-medium text-sm rounded-t-2xl transition-all duration-300 flex items-center gap-3 ${
//                         isActive
//                           ? "bg-gradient-to-br from-white via-white to-gray-50 text-[#0D1A33] shadow-lg transform -translate-y-1 scale-105"
//                           : "bg-white/5 backdrop-blur-sm text-blue-100/80 hover:bg-white/10 hover:text-white border border-white/10 hover:border-white/20"
//                       }`}
//                     >
//                       {/* Active tab decoration */}
//                       {isActive && (
//                         <div className="absolute inset-x-0 -bottom-0 h-1 bg-gradient-to-r from-[#10B981] to-[#059669] rounded-t-full"></div>
//                       )}

//                       <Icon
//                         className={`w-5 h-5 transition-all duration-300 ${
//                           isActive
//                             ? "text-[#10B981] scale-110"
//                             : "text-blue-200/70 group-hover:text-white group-hover:scale-105"
//                         }`}
//                       />
//                       <span className="font-semibold tracking-wide">
//                         {tab.name}
//                       </span>

//                       {/* Error indicator dot */}
//                       {hasError && isEditMode && (
//                         <div className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
//                       )}

//                       {/* Mode indicator (only show when no errors) */}
//                       {isActive && !hasError && (
//                         <div className="ml-2">
//                           {isEditMode ? (
//                             <Edit className="w-3 h-3 text-orange-500" />
//                           ) : (
//                             <Eye className="w-3 h-3 text-green-500" />
//                           )}
//                         </div>
//                       )}

//                       {/* Hover glow effect */}
//                       {!isActive && (
//                         <div className="absolute inset-0 rounded-t-2xl bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
//                       )}
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* Tab Content */}
//             <div className="bg-white/60 backdrop-blur-sm rounded-b-3xl shadow-xl border border-white/40">
//               <div className="p-4">
//                 <ActiveTabComponent
//                   driver={selectedDriver}
//                   formData={editFormData}
//                   onFormDataChange={handleFormDataChange}
//                   validationErrors={validationErrors}
//                   onValidationErrorsChange={handleValidationErrorsChange}
//                   onTabErrorChange={handleTabErrorChange}
//                   masterData={masterData}
//                   isEditMode={isEditMode}
//                 />
//               </div>
//             </div>
//           </>
//         )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DriverDetailsPage;

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


// Import view tab components
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


  // Initialize edit form data when driver loads
  useEffect(() => {
    if (selectedDriver && !editFormData) {
      setEditFormData({
        basicInfo: {
          fullName: selectedDriver.fullName || "",
          dateOfBirth: selectedDriver.dateOfBirth || "",
          gender: selectedDriver.gender || "",
          bloodGroup: selectedDriver.bloodGroup || "",
          phoneNumber: selectedDriver.phoneNumber || "",
          emailId: selectedDriver.emailId || "",
          whatsAppNumber: selectedDriver.whatsAppNumber || "",
          alternatePhoneNumber: selectedDriver.alternatePhoneNumber || "",
        },
        addresses: selectedDriver.addresses || [],
        documents: selectedDriver.documents || [],
        history: selectedDriver.history || [],
        accidents: selectedDriver.accidents || [],
        transporterMappings: selectedDriver.transporterMappings || [],
        vehicleMappings: selectedDriver.vehicleMappings || [],
        blacklistMappings: selectedDriver.blacklistMappings || [],
      });
    }
  }, [selectedDriver, editFormData]);


  // Handle errors
  useEffect(() => {
    if (error) {
      dispatch(
        addToast({
          type: "error",
          message: error.message || "Failed to load driver details",
        })
      );
      dispatch(clearError());
    }
  }, [error, dispatch]);


  const handleBack = () => {
    navigate("/drivers");
  };


  const handleEditToggle = () => {
    if (isEditMode) {
      // Cancel edit - reset form data
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
    // Basic validation
    const hasErrors = Object.values(tabErrors).some((err) => err);
    if (hasErrors) {
      dispatch(
        addToast({
          type: "error",
          message: "Please fix validation errors before saving",
        })
      );
      return;
    }


    // Dispatch update action
    const result = await dispatch(
      updateDriver({
        driverId: id,
        driverData: editFormData,
      })
    );


    if (result.type.endsWith("/fulfilled")) {
      dispatch(
        addToast({
          type: "success",
          message: "Driver updated successfully",
        })
      );
      setIsEditMode(false);
      setEditFormData(null);
      // Reload driver data
      dispatch(fetchDriverById(id));
    }
  };


  const ActiveTabComponent = isEditMode
    ? tabs[activeTab].editComponent
    : tabs[activeTab].viewComponent;


  return (
    <div
      className="min-h-screen px-4 py-2 lg:px-4"
      style={{
        background: `linear-gradient(to bottom right, ${safeTheme.colors.primary.background}, #f0f4f8, #e6f0ff)`,
      }}
    >
      <div className="max-w-7xl mx-auto space-y-3">
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
                    backgroundColor: safeActionButtonTheme.secondary.background,
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
                    style={{ color: safeActionButtonTheme.primary.background }}
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
                  <Button
                    onClick={handleEditToggle}
                    style={{
                      backgroundColor: safeActionButtonTheme.primary.background,
                      color: safeActionButtonTheme.primary.text,
                    }}
                    className="flex items-center space-x-2 hover:opacity-90 transition-opacity"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </Button>
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
            <div className="bg-gradient-to-r from-[#0D1A33] to-[#1A2B47] px-6 rounded-t-2xl relative">
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
                  onFormDataChange={handleFormDataChange}
                  validationErrors={validationErrors}
                  onValidationErrorsChange={handleValidationErrorsChange}
                  onTabErrorChange={handleTabErrorChange}
                  masterData={masterData}
                  isEditMode={isEditMode}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};


export default DriverDetailsPage;




