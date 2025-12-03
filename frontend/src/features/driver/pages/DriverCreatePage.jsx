// // import React, { useState, useEffect, useCallback } from "react";
// // import { useDispatch, useSelector } from "react-redux";
// // import { useNavigate } from "react-router-dom";
// // import TMSHeader from "../../../components/layout/TMSHeader";
// // import {
// //   ArrowLeft,
// //   RefreshCw,
// //   Save,
// //   User,
// //   FileText,
// //   Briefcase,
// //   AlertTriangle,
// //   AlertCircle,
// //   Upload,
// // } from "lucide-react";

// // import {
// //   createDriver,
// //   fetchMasterData,
// //   clearError,
// //   clearLastCreated,
// // } from "../../../redux/slices/driverSlice";
// // import { addToast } from "../../../redux/slices/uiSlice";
// // import { TOAST_TYPES } from "../../../utils/constants";

// // // Import tab components
// // import BasicInfoTab from "../components/BasicInfoTab";
// // import DocumentsTab from "../components/DocumentsTab";
// // import HistoryTab from "../components/HistoryTab";
// // import AccidentViolationTab from "../components/AccidentViolationTab";

// // const DriverCreatePage = () => {
// //   const dispatch = useDispatch();
// //   const navigate = useNavigate();

// //   const { isCreating, error, lastCreated, masterData, isLoading } = useSelector(
// //     (state) => state.driver
// //   );

// //   const [activeTab, setActiveTab] = useState(0);
// //   const [formData, setFormData] = useState({
// //     basicInfo: {
// //       fullName: "",
// //       dateOfBirth: "",
// //       gender: "",
// //       bloodGroup: "",
// //       phoneNumber: "",
// //       emailId: "",
// //       whatsAppNumber: "",
// //       alternatePhoneNumber: "",
// //     },
// //     addresses: [
// //       {
// //         country: "",
// //         state: "",
// //         city: "",
// //         district: "",
// //         street1: "",
// //         street2: "",
// //         postalCode: "",
// //         isPrimary: true,
// //         addressTypeId: "",
// //       },
// //     ],
// //     documents: [],
// //     history: [],
// //     accidents: [],
// //   });

// //   const [validationErrors, setValidationErrors] = useState({});
// //   const [tabErrors, setTabErrors] = useState({
// //     0: false, // Basic Info
// //     1: false, // Documents
// //     2: false, // History
// //     3: false, // Accident & Violation
// //   });

// //   const tabs = [
// //     {
// //       id: 0,
// //       name: "Basic Information",
// //       icon: User,
// //       component: BasicInfoTab,
// //     },
// //     {
// //       id: 1,
// //       name: "Documents",
// //       icon: FileText,
// //       component: DocumentsTab,
// //     },
// //     {
// //       id: 2,
// //       name: "History Information",
// //       icon: Briefcase,
// //       component: HistoryTab,
// //     },
// //     {
// //       id: 3,
// //       name: "Accident & Violation",
// //       icon: AlertTriangle,
// //       component: AccidentViolationTab,
// //     },
// //   ];

// //   // Load master data on component mount
// //   useEffect(() => {
// //     if (masterData?.genders?.length === 0) {
// //       console.log("🔄 Attempting to fetch master data...");
// //       dispatch(fetchMasterData()).catch((error) => {
// //         console.log(
// //           "⚠️ Master data fetch failed (expected in development):",
// //           error
// //         );
// //       });
// //     }
// //   }, [dispatch, masterData?.genders?.length]);

// //   // Clear any previous errors on mount
// //   useEffect(() => {
// //     dispatch(clearError());
// //     dispatch(clearLastCreated());
// //   }, [dispatch]);

// //   // Handle backend validation errors
// //   useEffect(() => {
// //     if (error && !isCreating) {
// //       // Backend returned an error
// //       let errorMessage = "Failed to create driver";
// //       let errorDetails = [];

// //       if (typeof error === "object") {
// //         // Handle structured error response
// //         if (error.message) {
// //           errorMessage = error.message;
// //         }

// //         // Check if it's a validation error with field information
// //         if (error.code === "VALIDATION_ERROR" && error.field) {
// //           errorDetails.push(`${error.field}: ${error.message}`);
// //         }

// //         // Handle multiple validation errors if they exist in details array
// //         if (error.details && Array.isArray(error.details)) {
// //           errorDetails = error.details.map((detail) => {
// //             if (typeof detail === "string") {
// //               return detail;
// //             } else if (detail.field && detail.message) {
// //               return `${detail.field}: ${detail.message}`;
// //             } else if (detail.message) {
// //               return detail.message;
// //             }
// //             return "Validation error";
// //           });
// //         }
// //       } else if (typeof error === "string") {
// //         errorMessage = error;
// //       }

// //       // Show error toast
// //       dispatch(
// //         addToast({
// //           type: TOAST_TYPES.ERROR,
// //           message: errorMessage,
// //           details: errorDetails.length > 0 ? errorDetails : null,
// //           duration: 8000,
// //         })
// //       );

// //       // Clear error after showing toast to prevent re-triggering
// //       dispatch(clearError());
// //     }
// //   }, [error, isCreating, dispatch]);

// //   // Handle successful creation
// //   useEffect(() => {
// //     if (lastCreated && !isCreating) {
// //       // Show success toast
// //       dispatch(
// //         addToast({
// //           type: TOAST_TYPES.SUCCESS,
// //           message: "Driver created successfully!",
// //           details: [
// //             `Driver ID: ${
// //               lastCreated.driverId || lastCreated.driver_id || "Generated"
// //             }`,
// //           ],
// //           duration: 3000,
// //         })
// //       );

// //       // Navigate to driver list after 2 seconds
// //       const timer = setTimeout(() => {
// //         dispatch(clearLastCreated());
// //         navigate("/drivers");
// //       }, 2000);

// //       // Cleanup timer if component unmounts
// //       return () => clearTimeout(timer);
// //     }
// //   }, [lastCreated, isCreating, dispatch, navigate]);

// //   const handleClear = () => {
// //     if (
// //       window.confirm(
// //         "Are you sure you want to clear all data? This action cannot be undone."
// //       )
// //     ) {
// //       setFormData({
// //         basicInfo: {
// //           fullName: "",
// //           dateOfBirth: "",
// //           gender: "",
// //           bloodGroup: "",
// //           phoneNumber: "",
// //           emailId: "",
// //           whatsAppNumber: "",
// //           alternatePhoneNumber: "",
// //         },
// //         addresses: [
// //           {
// //             country: "",
// //             state: "",
// //             city: "",
// //             district: "",
// //             street1: "",
// //             street2: "",
// //             postalCode: "",
// //             isPrimary: true,
// //             addressTypeId: "",
// //           },
// //         ],
// //         documents: [],
// //         history: [],
// //         accidents: [],
// //       });
// //       setValidationErrors({});
// //       setTabErrors({
// //         0: false,
// //         1: false,
// //         2: false,
// //         3: false,
// //       });
// //       setActiveTab(0);
// //     }
// //   };

// //   const handleSubmit = async () => {
// //     // Clear any previous errors
// //     setValidationErrors({});

// //     // Prepare data for API
// //     const driverData = {
// //       basicInfo: formData.basicInfo,
// //       addresses: formData.addresses,
// //       documents: formData.documents,
// //       history: formData.history,
// //       accidents: formData.accidents,
// //     };

// //     // Dispatch the create action
// //     dispatch(createDriver(driverData));
// //   };

// //   const handleBulkUpload = useCallback(() => {
// //     // Placeholder for bulk upload functionality
// //     dispatch(
// //       addToast({
// //         type: TOAST_TYPES.INFO,
// //         message: "Bulk upload feature coming soon",
// //         duration: 3000,
// //       })
// //     );
// //   }, [dispatch]);

// //   const canSubmit = true; // Always allow submission

// //   return (
// //     <div
// //       className="min-h-screen"
// //       style={{
// //         background: `linear-gradient(to bottom right, ${safeTheme.colors.primary.background}, #f0f4f8, #e6f0ff)`,
// //       }}
// //     >
// //       <TMSHeader theme={safeTheme} />
// //       <div className="p-4 lg:p-6">
// //         <div className="max-w-7xl mx-auto space-y-6">
// //         {/* Header */}
// //         <Card
// //           className="overflow-hidden border shadow-md"
// //           style={{
// //             backgroundColor: safeTheme.colors.card.background,
// //             borderColor: safeTheme.colors.card.border,
// //           }}
// //         >
// //           <div className="p-4">
// //             <div className="flex items-center justify-between">
// //               <div className="flex items-center space-x-4">
// //                 <Button
// //                   onClick={handleBack}
// //                   style={{
// //                     backgroundColor: safeActionButtonTheme.secondary.background,
// //                     color: safeActionButtonTheme.secondary.text,
// //                     borderColor: safeActionButtonTheme.secondary.border,
// //                   }}
// //                   className="flex items-center space-x-2 border hover:opacity-90 transition-opacity"
// //                 >
// //                   <ArrowLeft className="h-4 w-4" />
// //                   <span>Back</span>
// //                 </Button>
// //                 <div className="flex items-center space-x-3">
// //                   <User
// //                     className="h-8 w-8"
// //                     style={{ color: safeActionButtonTheme.primary.background }}
// //                   />
// //                   <div>
// //                     <h1
// //                       className="text-2xl font-bold"
// //                       style={{ color: safeTheme.colors.text.primary }}
// //                     >
// //                       Create Driver
// //                     </h1>
// //                     <p
// //                       className="text-sm"
// //                       style={{ color: safeTheme.colors.text.secondary }}
// //                     >
// //                       Add a new driver to the system
// //                     </p>
// //                   </div>
// //                 </div>
// //               </div>
// //             );

// //           {/* })} */}
// //         </div>
// //       </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default DriverCreatePage;

// import React, { useState, useEffect, useCallback } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import {
//   ArrowLeft,
//   RefreshCw,
//   Save,
//   User,
//   FileText,
//   Briefcase,
//   AlertTriangle,
//   AlertCircle,
//   Upload,
// } from "lucide-react";

// import {
//   createDriver,
//   fetchMasterData,
//   clearError,
//   clearLastCreated,
// } from "../../../redux/slices/driverSlice";
// import { addToast } from "../../../redux/slices/uiSlice";
// import { TOAST_TYPES } from "../../../utils/constants";

// // Import tab components
// import BasicInfoTab from "../components/BasicInfoTab";
// import DocumentsTab from "../components/DocumentsTab";
// import HistoryTab from "../components/HistoryTab";
// import AccidentViolationTab from "../components/AccidentViolationTab";
// import DriverBulkUploadModal from "../components/DriverBulkUploadModal";
// import TMSHeader from "@/components/layout/TMSHeader";
// import { getPageTheme } from "@/theme.config";

// const DriverCreatePage = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const { isCreating, error, lastCreated, masterData, isLoading } = useSelector(
//     (state) => state.driver
//   );

//   const [activeTab, setActiveTab] = useState(0);
//   const [formData, setFormData] = useState({
//     basicInfo: {
//       fullName: "",
//       dateOfBirth: "",
//       gender: "",
//       bloodGroup: "",
//       phoneNumber: "",
//       emailId: "",
//       emergencyContact: "",
//       alternatePhoneNumber: "",
//     },
//     addresses: [
//       {
//         country: "",
//         state: "",
//         city: "",
//         district: "",
//         street1: "",
//         street2: "",
//         postalCode: "",
//         isPrimary: true,
//         addressTypeId: "",
//       },
//     ],
//     documents: [
//       {
//         documentType: "",
//         documentNumber: "",
//         issuingCountry: "",
//         issuingState: "",
//         validFrom: "",
//         validTo: "",
//         status: true,
//         // Note: File uploads will be handled separately via document_upload table
//       },
//     ],
//     history: [
//       {
//         employer: "",
//         employmentStatus: "",
//         fromDate: "",
//         toDate: "",
//         jobTitle: "",
//       },
//     ],
//     accidents: [
//       {
//         type: "",
//         date: "",
//         description: "",
//         vehicleRegistrationNumber: "",
//       },
//     ],
//   });

//   const [validationErrors, setValidationErrors] = useState({});
//   const [tabErrors, setTabErrors] = useState({
//     0: false, // Basic Info
//     1: false, // Documents
//     2: false, // History
//     3: false, // Accident & Violation
//   });

//   const tabs = [
//     {
//       id: 0,
//       name: "Basic Information",
//       icon: User,
//       component: BasicInfoTab,
//     },
//     {
//       id: 1,
//       name: "Documents",
//       icon: FileText,
//       component: DocumentsTab,
//     },
//     {
//       id: 2,
//       name: "History Information",
//       icon: Briefcase,
//       component: HistoryTab,
//     },
//     {
//       id: 3,
//       name: "Accident & Violation",
//       icon: AlertTriangle,
//       component: AccidentViolationTab,
//     },
//   ];

//   // Load master data on component mount
//   useEffect(() => {
//     if (!masterData?.genderOptions || masterData?.genderOptions?.length === 0) {
//       console.log("🔄 Attempting to fetch master data...");
//       dispatch(fetchMasterData()).catch((error) => {
//         console.log(
//           "⚠️ Master data fetch failed (expected in development):",
//           error
//         );
//       });
//     }
//   }, [dispatch, masterData?.genders?.length]);

//   // Clear any previous errors on mount
//   useEffect(() => {
//     dispatch(clearError());
//     dispatch(clearLastCreated());
//   }, [dispatch]);

//   // Handle backend validation errors
//   useEffect(() => {
//     if (error && !isCreating) {
//       // Backend returned an error
//       let errorMessage = "Failed to create driver";
//       let errorDetails = [];

//       if (typeof error === "object") {
//         // Handle structured error response
//         if (error.message) {
//           errorMessage = error.message;
//         }

//         // Check if it's a validation error with field information
//         if (error.code === "VALIDATION_ERROR" && error.field) {
//           errorDetails.push(`${error.field}: ${error.message}`);
//         }

//         // Handle multiple validation errors if they exist in details array
//         if (error.details && Array.isArray(error.details)) {
//           errorDetails = error.details.map((detail) => {
//             if (typeof detail === "string") {
//               return detail;
//             } else if (detail.field && detail.message) {
//               return `${detail.field}: ${detail.message}`;
//             } else if (detail.message) {
//               return detail.message;
//             }
//             return "Validation error";
//           });
//         }
//       } else if (typeof error === "string") {
//         errorMessage = error;
//       }

//       // Show error toast
//       dispatch(
//         addToast({
//           type: TOAST_TYPES.ERROR,
//           message: errorMessage,
//           details: errorDetails.length > 0 ? errorDetails : null,
//           duration: 8000,
//         })
//       );

//       // Clear error after showing toast to prevent re-triggering
//       dispatch(clearError());
//     }
//   }, [error, isCreating, dispatch]);

//   // Handle successful creation
//   useEffect(() => {
//     if (lastCreated && !isCreating) {
//       // Show success toast
//       dispatch(
//         addToast({
//           type: TOAST_TYPES.SUCCESS,
//           message: "Driver created successfully!",
//           details: [
//             `Driver ID: ${
//               lastCreated.driverId || lastCreated.driver_id || "Generated"
//             }`,
//           ],
//           duration: 3000,
//         })
//       );

//       // Navigate to driver list after 2 seconds
//       const timer = setTimeout(() => {
//         dispatch(clearLastCreated());
//         navigate("/drivers");
//       }, 2000);

//       // Cleanup timer if component unmounts
//       return () => clearTimeout(timer);
//     }
//   }, [lastCreated, isCreating, dispatch, navigate]);

//   const handleClear = () => {
//     if (
//       window.confirm(
//         "Are you sure you want to clear all data? This action cannot be undone."
//       )
//     ) {
//       setFormData({
//         basicInfo: {
//           fullName: "",
//           dateOfBirth: "",
//           gender: "",
//           bloodGroup: "",
//           phoneNumber: "",
//           emailId: "",
//           emergencyContact: "",
//           alternatePhoneNumber: "",
//         },
//         addresses: [
//           {
//             country: "",
//             state: "",
//             city: "",
//             district: "",
//             street1: "",
//             street2: "",
//             postalCode: "",
//             isPrimary: true,
//             addressTypeId: "",
//           },
//         ],
//         documents: [
//           {
//             documentType: "",
//             documentNumber: "",
//             issuingCountry: "",
//             issuingState: "",
//             validFrom: "",
//             validTo: "",
//             status: true,
//           },
//         ],
//         history: [
//           {
//             employer: "",
//             employmentStatus: "",
//             fromDate: "",
//             toDate: "",
//             jobTitle: "",
//           },
//         ],
//         accidents: [
//           {
//             type: "",
//             date: "",
//             description: "",
//             vehicleRegistrationNumber: "",
//           },
//         ],
//       });
//       setValidationErrors({});
//       setTabErrors({
//         0: false,
//         1: false,
//         2: false,
//         3: false,
//       });
//       setActiveTab(0);
//     }
//   };

//   const handleSubmit = async () => {
//     // Clear previous errors
//     setValidationErrors({});

//     // Prepare data for API
//     const driverData = {
//       basicInfo: formData.basicInfo,
//       addresses: formData.addresses,
//       documents: formData.documents,
//       history: formData.history,
//       accidents: formData.accidents,
//     };

//     // Dispatch the create action
//     dispatch(createDriver(driverData));
//   };

//   const handleBulkUpload = useCallback(() => {
//     // Placeholder for bulk upload functionality
//     dispatch(
//       addToast({
//         type: TOAST_TYPES.INFO,
//         message: "Bulk upload feature coming soon",
//         duration: 3000,
//       })
//     );
//   }, [dispatch]);

//   const canSubmit = true; // Always allow submission

//   return (
//     <div className="bg-gradient-to-br from-[#F5F7FA] via-[#F8FAFC] to-[#F1F5F9]">
//       <TMSHeader theme={theme} />

//       {/* Modern Header Bar with glassmorphism */}
//       <div className="bg-gradient-to-r from-[#0D1A33] via-[#1A2B47] to-[#0D1A33] px-6 py-4 shadow-xl relative overflow-hidden">
//         {/* Background decoration */}
//         <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-transparent to-blue-800/10"></div>
//         <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl"></div>
//         <div className="absolute -bottom-4 -left-4 w-40 h-40 bg-gradient-to-tr from-blue-400/10 to-transparent rounded-full blur-2xl"></div>

//         <div className="relative flex items-center justify-between">
//           <div className="flex items-center gap-4">
//             <button
//               onClick={() => navigate(-1)}
//               className="group p-2 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-105 border border-white/20"
//             >
//               <ArrowLeft className="w-5 h-5 text-white group-hover:text-white transition-colors" />
//             </button>

//             <div className="space-y-1">
//               <h1 className="text-2xl font-bold text-white tracking-tight">
//                 Create New Driver
//               </h1>
//               <p className="text-blue-100/80 text-xs font-medium">
//                 Complete all sections to create a comprehensive driver profile
//               </p>
//             </div>
//           </div>

//           <div className="flex items-center gap-2">
//             <button
//               onClick={handleClear}
//               disabled={isCreating}
//               className="group inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl font-medium text-sm hover:bg-white/20 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
//             >
//               <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
//               Clear
//             </button>

//             <button
//               onClick={handleBulkUpload}
//               disabled={isCreating}
//               className="group inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl font-medium text-sm hover:bg-white/20 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
//             >
//               <Upload className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
//               Bulk Upload
//             </button>

//             <button
//               onClick={handleSubmit}
//               disabled={isCreating}
//               className="group inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#10B981] to-[#059669] text-white rounded-xl font-medium text-sm hover:from-[#059669] hover:to-[#10B981] transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
//             >
//               {isCreating ? (
//                 <>
//                   <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                   Creating...
//                 </>
//               ) : (
//                 <>
//                   <Save className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
//                   Submit
//                 </>
//               )}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Modern Tab Navigation with glassmorphism */}
//       <div className="bg-gradient-to-r from-[#0D1A33] to-[#1A2B47] px-6 relative">
//         {/* Tab backdrop blur effect */}
//         <div className="absolute inset-0 bg-gradient-to-r from-[#0D1A33] to-[#1A2B47] backdrop-blur-sm"></div>

//         <div className="relative flex space-x-2 py-2 ">
//           {tabs.map((tab) => {
//             const Icon = tab.icon;
//             const isActive = activeTab === tab.id;
//             const hasError = tabErrors[tab.id];

//             return (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 className={`group relative px-6 py-3 font-medium text-sm rounded-t-2xl transition-all duration-300 flex items-center gap-3 ${
//                   isActive
//                     ? "bg-gradient-to-br from-white via-white to-gray-50 text-[#0D1A33] shadow-lg transform -translate-y-1 scale-105"
//                     : "bg-white/5 backdrop-blur-sm text-blue-100/80 hover:bg-white/10 hover:text-white border border-white/10 hover:border-white/20"
//                 }`}
//               >
//                 {/* Active tab decoration */}
//                 {isActive && (
//                   <div className="absolute inset-x-0 -bottom-0 h-1 bg-gradient-to-r from-[#10B981] to-[#059669] rounded-t-full"></div>
//                 )}

//                 {/* Error indicator */}
//                 {hasError && (
//                   <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
//                     <AlertCircle className="w-3 h-3 text-white" />
//                   </div>
//                 )}

//                 <Icon
//                   className={`w-5 h-5 transition-all duration-300 ${
//                     isActive
//                       ? "text-[#10B981] scale-110"
//                       : hasError
//                       ? "text-red-300 group-hover:text-red-200"
//                       : "text-blue-200/70 group-hover:text-white group-hover:scale-105"
//                   }`}
//                 />
//                 <span className="font-semibold tracking-wide">{tab.name}</span>

//                 {/* Hover glow effect */}
//                 {!isActive && (
//                   <div className="absolute inset-0 rounded-t-2xl bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
//                 )}
//               </button>
//             );
//           })}
//         </div>
//       </div>

//       {/* Modern Content Area */}
//       <div className="px-0 rounded-none py-0 space-y-4">
//         {/* Enhanced Tab Content Container */}
//         <div className="relative">
//           {tabs.map((tab) => {
//             const TabComponent = tab.component;
//             const isActive = activeTab === tab.id;

//             return (
//               <div
//                 key={tab.id}
//                 className={`transition-all duration-500 ease-in-out ${
//                   isActive
//                     ? "block opacity-100 transform translate-y-0"
//                     : "hidden opacity-0 transform translate-y-4"
//                 }`}
//               >
//                 {/* Content wrapper with modern styling */}
//                 <div className="bg-white/60 backdrop-blur-sm rounded-b-3xl shadow-xl border border-white/40 overflow-hidden">
//                   {/* Tab content */}
//                   <div className="p-4">
//                     <TabComponent
//                       formData={formData}
//                       setFormData={setFormData}
//                       errors={validationErrors}
//                       masterData={masterData}
//                       isLoading={isLoading}
//                     />
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//       </div>
//     </div>
//   );
// };

// export default DriverCreatePage;

import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  Save,
  User,
  FileText,
  Briefcase,
  AlertTriangle,
  AlertCircle,
  Upload,
  FileEdit,
  FileDown,
} from "lucide-react";

import {
  createDriver,
  fetchMasterData,
  clearError,
  clearLastCreated,
  saveDriverAsDraft,
} from "../../../redux/slices/driverSlice";
import { addToast } from "../../../redux/slices/uiSlice";
import { TOAST_TYPES, ERROR_MESSAGES } from "../../../utils/constants";
import { createDriverSchema, formatFieldName } from "../validation";

// Import draft management utilities
import { useFormDirtyTracking } from "../../../hooks/useFormDirtyTracking";
import { useSaveAsDraft } from "../../../hooks/useSaveAsDraft";
import SaveAsDraftModal from "../../../components/ui/SaveAsDraftModal";

// Import tab components
import BasicInfoTab from "../components/BasicInfoTab";
import DocumentsTab from "../components/DocumentsTab";
import HistoryTab from "../components/HistoryTab";
import AccidentViolationTab from "../components/AccidentViolationTab";
import DriverBulkUploadModal from "../components/DriverBulkUploadModal";
import TMSHeader from "@/components/layout/TMSHeader";
import { getPageTheme } from "@/theme.config";

const DriverCreatePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    isCreating,
    isSavingDraft,
    error,
    lastCreated,
    lastDraftAction,
    masterData,
    isLoading,
  } = useSelector((state) => state.driver);

  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    basicInfo: {
      fullName: "",
      dateOfBirth: "",
      gender: "",
      bloodGroup: "",
      phoneNumber: "",
      emailId: "",
      emergencyContact: "",
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
    documents: [], // Start with empty array - mandatory docs will be added by DocumentsTab
    history: [], // Optional - start with empty array
    accidents: [], // Optional - start with empty array
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [tabErrors, setTabErrors] = useState({
    0: false, // Basic Info
    1: false, // Documents
    2: false, // History
    3: false, // Accident & Violation
  });
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);

  // ============================================
  // DRAFT MANAGEMENT HOOKS
  // ============================================

  // Initial form data for dirty tracking
  const initialFormData = {
    basicInfo: {
      fullName: "",
      dateOfBirth: "",
      gender: "",
      bloodGroup: "",
      phoneNumber: "",
      emailId: "",
      emergencyContact: "",
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
    documents: [
      {
        documentType: "",
        documentNumber: "",
        issuingCountry: "",
        issuingState: "",
        validFrom: "",
        validTo: "",
        status: true,
      },
    ],
    history: [], // Optional - start with empty array
    accidents: [], // Optional - start with empty array
  };

  // Form dirty tracking - Pass INITIAL form data (empty baseline) to the hook
  const { isDirty, setCurrentData, resetDirty } =
    useFormDirtyTracking(initialFormData);

  // Sync the dirty tracking hook's internal state with our formData whenever it changes
  useEffect(() => {
    setCurrentData(formData);
  }, [formData, setCurrentData]);

  // Save as draft hook
  const {
    showModal: showDraftModal,
    setShowModal: setShowDraftModal,
    handleSaveDraft,
    handleDiscard,
    handleCancel: handleCancelDraft,
    isLoading: isDraftLoading,
    showSaveAsDraftModal,
  } = useSaveAsDraft(
    "driver",
    formData,
    isDirty,
    null, // No record ID for create page
    (data) => {
      // Success callback
      console.log("Draft saved successfully:", data);
    },
    (error) => {
      // Error callback
      console.error("Draft save error:", error);
    }
  );

  // Navigation blocking - Browser back/close/refresh
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
  ];

  // Load master data on component mount
  useEffect(() => {
    if (!masterData?.genderOptions || masterData?.genderOptions?.length === 0) {
      console.log("🔄 Attempting to fetch master data...");
      dispatch(fetchMasterData()).catch((error) => {
        console.log(
          "⚠️ Master data fetch failed (expected in development):",
          error
        );
      });
    }
  }, [dispatch, masterData?.genderOptions?.length]);

  // Clear any previous errors on mount
  useEffect(() => {
    dispatch(clearError());
    dispatch(clearLastCreated());
  }, [dispatch]);

  // Handle backend validation errors
  useEffect(() => {
    if (error && !isCreating) {
      // Backend returned an error
      let errorMessage = "Failed to create driver";
      let errorDetails = [];

      if (typeof error === "object") {
        // Handle structured error response
        if (error.message) {
          errorMessage = error.message;
        }

        // Check if it's a validation error with field information
        if (error.code === "VALIDATION_ERROR" && error.field) {
          errorDetails.push(`${error.field}: ${error.message}`);
        }

        // Handle multiple validation errors if they exist in details array
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
  }, [error, isCreating, dispatch]);

  // Handle successful creation
  useEffect(() => {
    if (lastCreated && !isCreating) {
      // Show success toast
      dispatch(
        addToast({
          type: TOAST_TYPES.SUCCESS,
          message: "Driver created successfully!",
          details: [
            `Driver ID: ${
              lastCreated.driverId || lastCreated.driver_id || "Generated"
            }`,
          ],
          duration: 3000,
        })
      );

      // Navigate to driver list after 2 seconds
      const timer = setTimeout(() => {
        dispatch(clearLastCreated());
        navigate("/drivers");
      }, 2000);

      // Cleanup timer if component unmounts
      return () => clearTimeout(timer);
    }
  }, [lastCreated, isCreating, dispatch, navigate]);

  const handleClear = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all data? This action cannot be undone."
      )
    ) {
      setFormData({
        basicInfo: {
          fullName: "",
          dateOfBirth: "",
          gender: "",
          bloodGroup: "",
          phoneNumber: "",
          emailId: "",
          emergencyContact: "",
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
        documents: [
          {
            documentType: "",
            documentNumber: "",
            issuingCountry: "",
            issuingState: "",
            validFrom: "",
            validTo: "",
            status: true,
          },
        ],
        history: [
          {
            employer: "",
            employmentStatus: "",
            fromDate: "",
            toDate: "",
            jobTitle: "",
          },
        ],
        accidents: [
          {
            type: "",
            date: "",
            description: "",
            vehicleRegistrationNumber: "",
          },
        ],
      });
      setValidationErrors({});
      setTabErrors({
        0: false,
        1: false,
        2: false,
        3: false,
      });
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

    // Validate entire form
    const validation = createDriverSchema.safeParse(formData);

    if (!validation.success) {
      // Process validation errors
      const errors = {};
      const allErrorMessages = [];

      validation.error.issues.forEach((issue) => {
        const path = issue.path.join(".");
        if (!errors[path]) {
          // Extract the actual error message properly - handle all formats
          let errorMessage = "Validation error";

          if (typeof issue.message === "string") {
            errorMessage = issue.message;
          } else if (issue.message && typeof issue.message === "object") {
            // If message is an object, extract the inner message
            errorMessage = issue.message.message || "Validation error";
          }

          errors[path] = errorMessage;

          // Format error messages with section and field name
          const pathParts = issue.path;
          let formattedMessage = errorMessage;

          if (pathParts.length > 0) {
            const section = pathParts[0];
            const fieldOrIndex = pathParts[1];
            const fieldName = pathParts[2] || pathParts[1];

            // Create user-friendly error message
            if (section === "basicInfo") {
              const field = formatFieldName(fieldName);
              formattedMessage = `Basic Information - ${field}: ${errorMessage}`;
            } else if (section === "addresses" && !isNaN(fieldOrIndex)) {
              const field = formatFieldName(fieldName);
              formattedMessage = `Address ${
                parseInt(fieldOrIndex) + 1
              } - ${field}: ${errorMessage}`;
            } else if (section === "documents" && !isNaN(fieldOrIndex)) {
              const field = formatFieldName(fieldName);
              formattedMessage = `Document ${
                parseInt(fieldOrIndex) + 1
              } - ${field}: ${errorMessage}`;
            } else if (section === "history" && !isNaN(fieldOrIndex)) {
              const field = formatFieldName(fieldName);
              formattedMessage = `History ${
                parseInt(fieldOrIndex) + 1
              } - ${field}: ${errorMessage}`;
            } else if (section === "accidents" && !isNaN(fieldOrIndex)) {
              const field = formatFieldName(fieldName);
              formattedMessage = `Accident/Violation ${
                parseInt(fieldOrIndex) + 1
              } - ${field}: ${errorMessage}`;
            }
          }

          // Only add if we have a clean error message (not a JSON string)
          if (
            !formattedMessage.startsWith("[") &&
            !formattedMessage.startsWith("{")
          ) {
            allErrorMessages.push(formattedMessage);
          }
        }
      });

      // Convert flat error paths to nested structure for easier component access
      const nestedErrors = {};
      Object.keys(errors).forEach((path) => {
        const parts = path.split(".");
        let current = nestedErrors;

        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];
          const nextPart = parts[i + 1];

          // Check if next part is a number (array index)
          if (!isNaN(nextPart)) {
            if (!Array.isArray(current[part])) {
              current[part] = [];
            }
            const index = parseInt(nextPart);
            if (!current[part][index]) {
              current[part][index] = {};
            }
            current = current[part][index];
            i++; // Skip the index part as we've already processed it
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
        0: !!nestedErrors.basicInfo || !!nestedErrors.addresses,
        1: !!nestedErrors.documents,
        2: !!nestedErrors.history,
        3: !!nestedErrors.accidents,
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

      // Get unique error messages (limit to first 10 for readability)
      const uniqueErrors = [...new Set(allErrorMessages)].slice(0, 10);

      // Show toast notification with error details
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

    // Submit valid data
    dispatch(createDriver(formData));
  };

  const handleSaveAsDraft = async () => {
    // Clear previous errors
    setValidationErrors({});
    setTabErrors({
      0: false,
      1: false,
      2: false,
      3: false,
    });

    // Minimal validation - only full name and date of birth required
    if (
      !formData.basicInfo?.fullName ||
      formData.basicInfo.fullName.trim().length < 2
    ) {
      dispatch(
        addToast({
          type: TOAST_TYPES.ERROR,
          message: "Full name is required (minimum 2 characters)",
        })
      );
      return;
    }

    if (!formData.basicInfo?.dateOfBirth) {
      dispatch(
        addToast({
          type: TOAST_TYPES.ERROR,
          message: "Date of birth is required to save as draft",
        })
      );
      return;
    }

    // Save as draft with partial data
    try {
      const result = await dispatch(saveDriverAsDraft(formData)).unwrap();

      // Success - show toast notification
      dispatch(
        addToast({
          type: TOAST_TYPES.SUCCESS,
          message: "Driver saved as draft successfully!",
          details: [`Driver ID: ${result.driver_id}`],
        })
      );

      // Navigate to driver details page
      setTimeout(() => {
        navigate(`/driver/${result.driver_id}`);
      }, 1000);
    } catch (err) {
      console.error("Error saving draft:", err);

      dispatch(
        addToast({
          type: TOAST_TYPES.ERROR,
          message:
            err.message || "Failed to save driver as draft. Please try again.",
        })
      );
    }
  };

  const handleBulkUpload = useCallback(() => {
    // Open bulk upload modal
    setIsBulkUploadModalOpen(true);
  }, []);

  const canSubmit = true; // Always allow submission

  const theme = getPageTheme("list");

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
              onClick={() => {
                if (isDirty) {
                  showSaveAsDraftModal("/drivers");
                } else {
                  navigate("/drivers");
                }
              }}
              className="group p-2 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-105 border border-white/20"
            >
              <ArrowLeft className="w-5 h-5 text-white group-hover:text-white transition-colors" />
            </button>

            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Create New Driver
              </h1>
              <p className="text-blue-100/80 text-xs font-medium">
                Complete all sections to create a comprehensive driver profile
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
              onClick={handleSaveAsDraft}
              disabled={isCreating || isSavingDraft}
              className="group inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl font-medium text-sm hover:bg-white/20 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSavingDraft ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                  Save as Draft
                </>
              )}
            </button>

            <button
              onClick={handleBulkUpload}
              disabled={isCreating || isSavingDraft}
              className="group inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl font-medium text-sm hover:bg-white/20 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Upload className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
              Bulk Upload
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

        <div className="relative flex space-x-2 py-2 ">
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
                <div className="bg-white/60 backdrop-blur-sm rounded-b-3xl shadow-xl border border-white/40 overflow-hidden">
                  {/* Tab content */}
                  <div className="p-4">
                    <TabComponent
                      formData={formData}
                      setFormData={setFormData}
                      errors={validationErrors}
                      masterData={masterData}
                      isLoading={isLoading}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bulk Upload Modal */}
      <DriverBulkUploadModal
        isOpen={isBulkUploadModalOpen}
        onClose={() => setIsBulkUploadModalOpen(false)}
      />

      {/* Save as Draft Modal */}
      <SaveAsDraftModal
        isOpen={showDraftModal}
        onSaveDraft={handleSaveDraft}
        onDiscard={handleDiscard}
        onCancel={handleCancelDraft}
        isLoading={isDraftLoading}
      />
    </div>
  );
};

export default DriverCreatePage;
