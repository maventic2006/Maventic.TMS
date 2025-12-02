// import React, { useMemo, useEffect } from "react";
// import { FileText, Plus, X, Calendar, Upload, File, Lock } from "lucide-react";
// import { CustomSelect } from "../../../components/ui/Select";
// import { Country, State } from "country-state-city";
// import { useSelector, useDispatch } from "react-redux";
// import { fetchMandatoryDocuments } from "../../../redux/slices/driverSlice";

// const DocumentsTab = ({
//   formData,
//   setFormData,
//   errors = {},
//   masterData,
//   isLoading,
// }) => {
//   const dispatch = useDispatch();
//   const { mandatoryDocuments } = useSelector((state) => state.driver);
//   const documents = formData?.documents || [];

//   // Fetch mandatory documents on mount
//   useEffect(() => {
//     if (mandatoryDocuments.length === 0) {
//       dispatch(fetchMandatoryDocuments());
//     }
//   }, [dispatch, mandatoryDocuments.length]);

//   // Pre-populate mandatory documents on first render or when mandatory docs are loaded
//   useEffect(() => {
//     // Only pre-populate if mandatory documents are loaded and not already present
//     if (mandatoryDocuments.length > 0) {
//       // Check if mandatory documents are already in the documents array
//       const hasMandatoryDocs = documents.some((doc) => doc.isMandatory);

//       // If no mandatory documents present, pre-fill them
//       if (!hasMandatoryDocs) {
//         const mandatoryDocs = mandatoryDocuments.map((mandDoc) => ({
//           documentType: mandDoc.documentTypeId,
//           documentNumber: "",
//           issuingCountry: "",
//           issuingState: "",
//           validFrom: "",
//           validTo: "",
//           status: true,
//           fileName: "",
//           fileType: "",
//           fileData: "",
//           isMandatory: mandDoc.isMandatory,
//           documentTypeName: mandDoc.documentTypeName,
//         }));

//         // If documents array is empty, just set mandatory docs
//         // Otherwise, prepend mandatory docs to existing documents
//         setFormData((prev) => ({
//           ...prev,
//           documents:
//             documents.length === 0
//               ? mandatoryDocs
//               : [
//                   ...mandatoryDocs,
//                   ...prev.documents.filter((doc) => !doc.isMandatory),
//                 ],
//         }));
//       }
//     }
//   }, [mandatoryDocuments, setFormData]);

//   // Get all countries
//   const allCountries = useMemo(() => Country.getAllCountries(), []);

//   // Get states for a specific country
//   const getStatesForCountry = (countryCode) => {
//     if (!countryCode) return [];
//     return State.getStatesOfCountry(countryCode);
//   };

//   const handleDocumentChange = (index, field, value) => {
//     setFormData((prev) => {
//       const updatedDocuments = [...prev.documents];
//       updatedDocuments[index] = {
//         ...updatedDocuments[index],
//         [field]: value,
//       };

//       // Clear state if country changes
//       if (field === "issuingCountry") {
//         updatedDocuments[index].issuingState = "";
//       }

//       return {
//         ...prev,
//         documents: updatedDocuments,
//       };
//     });
//   };

//   const handleFileUpload = (index, event) => {
//     const file = event.target.files[0];
//     if (!file) return;

//     // Validate file type (PDF only)
//     if (file.type !== "application/pdf") {
//       alert("Only PDF files are allowed");
//       event.target.value = "";
//       return;
//     }

//     // Validate file size (5MB max)
//     const maxSize = 5 * 1024 * 1024; // 5MB in bytes
//     if (file.size > maxSize) {
//       alert("File size must be less than 5MB");
//       event.target.value = "";
//       return;
//     }

//     // Convert to base64
//     const reader = new FileReader();
//     reader.onloadend = () => {
//       const base64String = reader.result;
//       setFormData((prev) => {
//         const updatedDocuments = [...prev.documents];
//         updatedDocuments[index] = {
//           ...updatedDocuments[index],
//           fileName: file.name,
//           fileType: file.type,
//           fileData: base64String,
//         };
//         return {
//           ...prev,
//           documents: updatedDocuments,
//         };
//       });
//     };
//     reader.readAsDataURL(file);
//   };

//   const removeFile = (index) => {
//     setFormData((prev) => {
//       const updatedDocuments = [...prev.documents];
//       updatedDocuments[index] = {
//         ...updatedDocuments[index],
//         fileName: "",
//         fileType: "",
//         fileData: "",
//       };
//       return {
//         ...prev,
//         documents: updatedDocuments,
//       };
//     });
//   };

//   const addDocument = () => {
//     setFormData((prev) => ({
//       ...prev,
//       documents: [
//         ...prev.documents,
//         {
//           documentType: "",
//           documentNumber: "",
//           issuingCountry: "",
//           issuingState: "",
//           validFrom: "",
//           validTo: "",
//           status: true,
//           fileName: "",
//           fileType: "",
//           fileData: "",
//           isMandatory: false, // New documents are not mandatory
//         },
//       ],
//     }));
//   };

//   const removeDocument = (index) => {
//     const document = documents[index];

//     // Prevent removal of mandatory documents
//     if (document?.isMandatory) {
//       alert("This is a mandatory document and cannot be removed.");
//       return;
//     }

//     setFormData((prev) => ({
//       ...prev,
//       documents: prev.documents.filter((_, i) => i !== index),
//     }));
//   };

//   return (
//     <div className="space-y-6">
//       <div className="bg-white rounded-lg shadow-sm">
//         <div className="bg-[#0D1A33] text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <FileText className="w-5 h-5" />
//             <h2 className="text-lg font-bold">Driver Documents</h2>
//           </div>
//           <button
//             type="button"
//             onClick={addDocument}
//             className="bg-[#10B981] text-white h-9 px-3 rounded-lg flex items-center gap-2 text-sm hover:bg-[#059669] transition-colors"
//           >
//             <Plus className="w-4 h-4" />
//             Add
//           </button>
//         </div>

//         <div className="p-6">
//           {documents.length > 0 ? (
//             <div className="overflow-x-auto">
//               <table className="w-full min-w-[800px]">
//                 <thead>
//                   <tr className="text-left text-xs font-medium text-gray-600 border-b border-gray-200">
//                     <th className="pb-3 pl-4 min-w-[200px]">
//                       Document Type <span className="text-red-500">*</span>
//                     </th>
//                     <th className="pb-3 pl-4 min-w-[200px]">
//                       Document Number <span className="text-red-500">*</span>
//                     </th>
//                     <th className="pb-3 pl-4 min-w-[200px]">Issuing Country</th>
//                     <th className="pb-3 pl-4 min-w-[200px]">Issuing State</th>
//                     <th className="pb-3 pl-4 min-w-[150px]">Valid From</th>
//                     <th className="pb-3 pl-4 min-w-[150px]">Valid To</th>
//                     <th className="pb-3 pl-4 min-w-[250px]">Upload Document</th>
//                     <th className="pb-3 w-12">Active</th>
//                     <th className="pb-3 w-12"></th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {documents.map((document, index) => (
//                     <tr
//                       key={index}
//                       className="bg-white border-b border-gray-100"
//                       style={{ height: "60px" }}
//                     >
//                       <td className="px-3">
//                         <CustomSelect
//                           value={document.documentType || ""}
//                           onValueChange={(value) =>
//                             handleDocumentChange(index, "documentType", value)
//                           }
//                           options={masterData?.documentTypes || []}
//                           placeholder="Select"
//                           getOptionLabel={(option) => option.label}
//                           getOptionValue={(option) => option.value}
//                           className="min-w-[200px] text-xs"
//                         />
//                       </td>
//                       <td className="px-3">
//                         <input
//                           type="text"
//                           value={document.documentNumber || ""}
//                           onChange={(e) =>
//                             handleDocumentChange(
//                               index,
//                               "documentNumber",
//                               e.target.value
//                             )
//                           }
//                           placeholder="Enter document number"
//                           className="min-w-[200px] px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs"
//                         />
//                       </td>
//                       <td className="px-3">
//                         <CustomSelect
//                           value={document.issuingCountry || ""}
//                           onValueChange={(value) =>
//                             handleDocumentChange(index, "issuingCountry", value)
//                           }
//                           options={allCountries}
//                           placeholder="Select"
//                           searchable
//                           getOptionLabel={(option) => option.name}
//                           getOptionValue={(option) => option.isoCode}
//                           className="min-w-[200px] text-xs"
//                         />
//                       </td>
//                       <td className="px-3">
//                         <CustomSelect
//                           value={document.issuingState || ""}
//                           onValueChange={(value) =>
//                             handleDocumentChange(index, "issuingState", value)
//                           }
//                           options={getStatesForCountry(document.issuingCountry)}
//                           placeholder="Select"
//                           searchable
//                           getOptionLabel={(option) => option.name}
//                           getOptionValue={(option) => option.isoCode}
//                           className="min-w-[200px] text-xs"
//                           disabled={!document.issuingCountry}
//                         />
//                       </td>
//                       <td className="px-3">
//                         <div className="relative min-w-[150px]">
//                           <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none text-gray-400" />
//                           <input
//                             type="date"
//                             value={document.validFrom || ""}
//                             onChange={(e) =>
//                               handleDocumentChange(
//                                 index,
//                                 "validFrom",
//                                 e.target.value
//                               )
//                             }
//                             className="w-full pl-8 pr-2 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs"
//                           />
//                         </div>
//                       </td>
//                       <td className="px-3">
//                         <div className="relative min-w-[150px]">
//                           <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none text-gray-400" />
//                           <input
//                             type="date"
//                             value={document.validTo || ""}
//                             onChange={(e) =>
//                               handleDocumentChange(
//                                 index,
//                                 "validTo",
//                                 e.target.value
//                               )
//                             }
//                             className="w-full pl-8 pr-2 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs"
//                           />
//                         </div>
//                       </td>
//                       <td className="px-3">
//                         <div className="min-w-[250px]">
//                           {document.fileName ? (
//                             <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md">
//                               <File className="w-4 h-4 text-green-600" />
//                               <span className="text-xs text-green-700 flex-1 truncate">
//                                 {document.fileName}
//                               </span>
//                               <button
//                                 type="button"
//                                 onClick={() => removeFile(index)}
//                                 className="p-1 text-red-500 hover:text-red-700"
//                               >
//                                 <X className="w-3 h-3" />
//                               </button>
//                             </div>
//                           ) : (
//                             <label className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer transition-colors">
//                               <Upload className="w-4 h-4 text-gray-400" />
//                               <span className="text-xs text-gray-600">
//                                 Choose PDF (Max 5MB)
//                               </span>
//                               <input
//                                 type="file"
//                                 accept="application/pdf"
//                                 onChange={(e) => handleFileUpload(index, e)}
//                                 className="hidden"
//                               />
//                             </label>
//                           )}
//                         </div>
//                       </td>
//                       <td className="px-3 text-center">
//                         <input
//                           type="radio"
//                           checked={document.status !== false}
//                           onChange={(e) =>
//                             handleDocumentChange(
//                               index,
//                               "status",
//                               e.target.checked
//                             )
//                           }
//                           className="w-4 h-4 text-green-500 focus:ring-green-500"
//                         />
//                       </td>
//                       <td className="px-3">
//                         {document.isMandatory ? (
//                           <div
//                             className="flex items-center justify-center"
//                             title="Mandatory document - cannot be removed"
//                           >
//                             <Lock className="w-4 h-4 text-gray-400" />
//                           </div>
//                         ) : (
//                           <button
//                             type="button"
//                             onClick={() => removeDocument(index)}
//                             className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
//                           >
//                             <X className="w-4 h-4" />
//                           </button>
//                         )}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           ) : (
//             <div className="text-center py-12 text-gray-500">
//               <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
//               <p className="text-lg font-medium">No documents added yet</p>
//               <p className="text-sm">Click "Add" to get started</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DocumentsTab;

import React, { useMemo, useEffect, useRef } from "react";
import { FileText, Plus, X, Calendar, Upload, File, Lock } from "lucide-react";
import { CustomSelect } from "../../../components/ui/Select";
import { Country, State } from "country-state-city";
import { useSelector, useDispatch } from "react-redux";
import { fetchMandatoryDocuments } from "../../../redux/slices/driverSlice";

const DocumentsTab = ({
  formData,
  setFormData,
  errors = {},
  masterData,
  isLoading,
}) => {
  const dispatch = useDispatch();
  const { mandatoryDocuments } = useSelector((state) => state.driver);
  const documents = formData?.documents || [];

  // Track if mandatory documents have been initialized to prevent duplicate additions
  const mandatoryDocsInitialized = useRef(false);

  // Normalize document type options so value is always the SHORT ID and label the name.
  const docTypeOptions = useMemo(() => {
    if (!masterData?.documentTypes) return [];
    return masterData.documentTypes.map((d) => {
      // support multiple possible shapes from backend:
      // - { label, value }
      // - { document_name, doc_name_master_id }
      return {
        label: d.document_name || d.label || d.documentTypeName || d.name,
        value:
          d.doc_name_master_id ||
          d.documentTypeId ||
          d.value ||
          d.id ||
          d.docId ||
          d.document_type_id ||
          "", // fallback empty string if not present
      };
    });
  }, [masterData]);

  // Fetch mandatory documents on mount (only once)
  useEffect(() => {
    if (mandatoryDocuments.length === 0) {
      console.log("🔄 Fetching mandatory documents...");
      dispatch(fetchMandatoryDocuments());
    }
  }, [dispatch, mandatoryDocuments.length]);

  // Pre-populate mandatory documents with proper initialization tracking
  useEffect(() => {
    // Skip if already initialized
    if (mandatoryDocsInitialized.current) {
      console.log("✅ Mandatory documents already initialized, skipping");
      return;
    }

    // Wait for mandatory documents to be loaded
    if (mandatoryDocuments.length === 0) {
      console.log("⏳ Waiting for mandatory documents to load...");
      return;
    }

    console.log("🔍 Checking document initialization state...");
    console.log("  - Current documents count:", documents.length);
    console.log("  - Mandatory documents count:", mandatoryDocuments.length);

    // SCENARIO A: CREATE PAGE - Empty or only placeholder documents
    // Check if documents array is empty OR contains only empty placeholder documents
    const hasOnlyEmptyDocs = documents.every(
      (doc) =>
        !doc.documentType &&
        !doc.documentNumber &&
        !doc.fileName &&
        !doc.documentTypeId
    );

    if (documents.length === 0 || (documents.length > 0 && hasOnlyEmptyDocs)) {
      console.log("📝 CREATE MODE: Adding mandatory documents to empty form");
      const mandatoryDocs = mandatoryDocuments.map((mandDoc) => ({
        documentType:
          mandDoc.documentTypeId ||
          mandDoc.doc_name_master_id ||
          mandDoc.documentTypeCode ||
          "",
        documentNumber: "",
        issuingCountry: "",
        issuingState: "",
        validFrom: "",
        validTo: "",
        status: true,
        fileName: "",
        fileType: "",
        fileData: "",
        isMandatory: !!mandDoc.isMandatory,
        documentTypeName:
          mandDoc.documentTypeName || mandDoc.documentName || "",
      }));

      setFormData((prev) => ({
        ...prev,
        documents: mandatoryDocs,
      }));

      mandatoryDocsInitialized.current = true;
      console.log("✅ Mandatory documents initialized for CREATE mode");
      return;
    }

    // SCENARIO B: EDIT DRAFT PAGE - Documents loaded from database
    // Check if ALL mandatory document types are already present
    const existingDocTypes = documents.map(
      (doc) => doc.documentType || doc.documentTypeId
    );

    // Find missing mandatory documents
    const missingMandatoryDocs = mandatoryDocuments.filter((mandDoc) => {
      const mandDocTypeId =
        mandDoc.documentTypeId ||
        mandDoc.doc_name_master_id ||
        mandDoc.documentTypeCode ||
        "";
      return !existingDocTypes.includes(mandDocTypeId);
    });

    // Add missing mandatory documents if any
    if (missingMandatoryDocs.length > 0) {
      console.log(
        `📝 EDIT MODE: Adding ${missingMandatoryDocs.length} missing mandatory documents`
      );
      const newMandatoryDocs = missingMandatoryDocs.map((mandDoc) => ({
        documentType:
          mandDoc.documentTypeId ||
          mandDoc.doc_name_master_id ||
          mandDoc.documentTypeCode ||
          "",
        documentNumber: "",
        issuingCountry: "",
        issuingState: "",
        validFrom: "",
        validTo: "",
        status: true,
        fileName: "",
        fileType: "",
        fileData: "",
        isMandatory: !!mandDoc.isMandatory,
        documentTypeName:
          mandDoc.documentTypeName || mandDoc.documentName || "",
      }));

      setFormData((prev) => ({
        ...prev,
        documents: [...newMandatoryDocs, ...prev.documents],
      }));

      mandatoryDocsInitialized.current = true;
      console.log("✅ Missing mandatory documents added for EDIT mode");
      return;
    }

    // Mark existing documents that match mandatory types with isMandatory flag
    const documentsNeedUpdate = documents.some((doc) => {
      const docTypeId = doc.documentType || doc.documentTypeId;
      const isMandatoryType = mandatoryDocuments.some((mandDoc) => {
        const mandDocTypeId =
          mandDoc.documentTypeId ||
          mandDoc.doc_name_master_id ||
          mandDoc.documentTypeCode ||
          "";
        return mandDocTypeId === docTypeId;
      });
      return isMandatoryType && !doc.isMandatory;
    });

    if (documentsNeedUpdate) {
      console.log(
        "🔒 EDIT MODE: Marking existing documents with mandatory flags"
      );
      const updatedDocuments = documents.map((doc) => {
        const docTypeId = doc.documentType || doc.documentTypeId;
        const isMandatoryType = mandatoryDocuments.some((mandDoc) => {
          const mandDocTypeId =
            mandDoc.documentTypeId ||
            mandDoc.doc_name_master_id ||
            mandDoc.documentTypeCode ||
            "";
          return mandDocTypeId === docTypeId;
        });

        if (isMandatoryType && !doc.isMandatory) {
          return { ...doc, isMandatory: true };
        }
        return doc;
      });

      setFormData((prev) => ({
        ...prev,
        documents: updatedDocuments,
      }));
    }

    // Mark as initialized after all checks
    mandatoryDocsInitialized.current = true;
    console.log("✅ Document initialization complete");
  }, [mandatoryDocuments, setFormData]); // intentionally not depending on documents to avoid loops

  // Get all countries
  const allCountries = useMemo(() => Country.getAllCountries(), []);

  // Get states for a specific country
  const getStatesForCountry = (countryCode) => {
    if (!countryCode) return [];
    return State.getStatesOfCountry(countryCode);
  };

  const handleDocumentChange = (index, field, value) => {
    // defensive: if select returns an object like { label, value }, extract value
    const normalizedValue =
      typeof value === "object" && value !== null
        ? value.value ?? value.id ?? value.isoCode ?? ""
        : value;

    setFormData((prev) => {
      const updatedDocuments = [...(prev.documents || [])];
      updatedDocuments[index] = {
        ...updatedDocuments[index],
        [field]: normalizedValue,
      };

      // Clear state if country changes
      if (field === "issuingCountry") {
        updatedDocuments[index].issuingState = "";
      }

      return {
        ...prev,
        documents: updatedDocuments,
      };
    });
  };

  const handleFileUpload = (index, event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type (PDF only)
    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed");
      event.target.value = "";
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      alert("File size must be less than 5MB");
      event.target.value = "";
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setFormData((prev) => {
        const updatedDocuments = [...(prev.documents || [])];
        updatedDocuments[index] = {
          ...updatedDocuments[index],
          fileName: file.name,
          fileType: file.type,
          fileData: base64String,
        };
        return {
          ...prev,
          documents: updatedDocuments,
        };
      });
    };
    reader.readAsDataURL(file);
  };

  const removeFile = (index) => {
    setFormData((prev) => {
      const updatedDocuments = [...(prev.documents || [])];
      updatedDocuments[index] = {
        ...updatedDocuments[index],
        fileName: "",
        fileType: "",
        fileData: "",
      };
      return {
        ...prev,
        documents: updatedDocuments,
      };
    });
  };

  const addDocument = () => {
    setFormData((prev) => ({
      ...prev,
      documents: [
        ...(prev.documents || []),
        {
          documentType: "",
          documentNumber: "",
          issuingCountry: "",
          issuingState: "",
          validFrom: "",
          validTo: "",
          status: true,
          fileName: "",
          fileType: "",
          fileData: "",
          isMandatory: false, // New documents are not mandatory
        },
      ],
    }));
  };

  const removeDocument = (index) => {
    const document = documents[index];

    // Prevent removal of mandatory documents
    if (document?.isMandatory) {
      alert("This is a mandatory document and cannot be removed.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      documents: (prev.documents || []).filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="bg-[#0D1A33] text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            <h2 className="text-lg font-bold">Driver Documents</h2>
          </div>
          <button
            type="button"
            onClick={addDocument}
            className="bg-[#10B981] text-white h-9 px-3 rounded-lg flex items-center gap-2 text-sm hover:bg-[#059669] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        <div className="p-6">
          {documents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-600 border-b border-gray-200">
                    <th className="pb-3 pl-4 min-w-[200px]">
                      Document Type <span className="text-red-500">*</span>
                    </th>
                    <th className="pb-3 pl-4 min-w-[200px]">
                      Document Number <span className="text-red-500">*</span>
                    </th>
                    <th className="pb-3 pl-4 min-w-[200px]">Issuing Country</th>
                    <th className="pb-3 pl-4 min-w-[200px]">Issuing State</th>
                    <th className="pb-3 pl-4 min-w-[150px]">Valid From</th>
                    <th className="pb-3 pl-4 min-w-[150px]">Valid To</th>
                    <th className="pb-3 pl-4 min-w-[250px]">Upload Document</th>
                    <th className="pb-3 w-12">Active</th>
                    <th className="pb-3 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((document, index) => (
                    <tr
                      key={index}
                      className="bg-white border-b border-gray-100"
                      style={{ height: "60px" }}
                    >
                      <td className="px-3">
                        <CustomSelect
                          value={document.documentType || ""}
                          onValueChange={(value) =>
                            handleDocumentChange(index, "documentType", value)
                          }
                          options={docTypeOptions}
                          placeholder="Select"
                          getOptionLabel={(option) => option.label}
                          getOptionValue={(option) => option.value}
                          className="min-w-[200px] text-xs"
                        />
                      </td>
                      <td className="px-3">
                        <input
                          type="text"
                          value={document.documentNumber || ""}
                          onChange={(e) =>
                            handleDocumentChange(
                              index,
                              "documentNumber",
                              e.target.value
                            )
                          }
                          placeholder="Enter document number"
                          className="min-w-[200px] px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs"
                        />
                      </td>
                      <td className="px-3">
                        <CustomSelect
                          value={document.issuingCountry || ""}
                          onValueChange={(value) =>
                            handleDocumentChange(index, "issuingCountry", value)
                          }
                          options={allCountries}
                          placeholder="Select"
                          searchable
                          getOptionLabel={(option) => option.name}
                          getOptionValue={(option) => option.isoCode}
                          className="min-w-[200px] text-xs"
                        />
                      </td>
                      <td className="px-3">
                        <CustomSelect
                          value={document.issuingState || ""}
                          onValueChange={(value) =>
                            handleDocumentChange(index, "issuingState", value)
                          }
                          options={getStatesForCountry(document.issuingCountry)}
                          placeholder="Select"
                          searchable
                          getOptionLabel={(option) => option.name}
                          getOptionValue={(option) => option.isoCode}
                          className="min-w-[200px] text-xs"
                          disabled={!document.issuingCountry}
                        />
                      </td>
                      <td className="px-3">
                        <div className="relative min-w-[150px]">
                          <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none text-gray-400" />
                          <input
                            type="date"
                            value={document.validFrom || ""}
                            onChange={(e) =>
                              handleDocumentChange(
                                index,
                                "validFrom",
                                e.target.value
                              )
                            }
                            className="w-full pl-8 pr-2 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs"
                          />
                        </div>
                      </td>
                      <td className="px-3">
                        <div className="relative min-w-[150px]">
                          <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none text-gray-400" />
                          <input
                            type="date"
                            value={document.validTo || ""}
                            onChange={(e) =>
                              handleDocumentChange(
                                index,
                                "validTo",
                                e.target.value
                              )
                            }
                            className="w-full pl-8 pr-2 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs"
                          />
                        </div>
                      </td>
                      <td className="px-3">
                        <div className="min-w-[250px]">
                          {document.fileName ? (
                            <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md">
                              <File className="w-4 h-4 text-green-600" />
                              <span className="text-xs text-green-700 flex-1 truncate">
                                {document.fileName}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="p-1 text-red-500 hover:text-red-700"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <label className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer transition-colors">
                              <Upload className="w-4 h-4 text-gray-400" />
                              <span className="text-xs text-gray-600">
                                Choose PDF (Max 5MB)
                              </span>
                              <input
                                type="file"
                                accept="application/pdf"
                                onChange={(e) => handleFileUpload(index, e)}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      </td>
                      <td className="px-3 text-center">
                        <input
                          type="radio"
                          checked={document.status !== false}
                          onChange={(e) =>
                            handleDocumentChange(
                              index,
                              "status",
                              e.target.checked
                            )
                          }
                          className="w-4 h-4 text-green-500 focus:ring-green-500"
                        />
                      </td>
                      <td className="px-3">
                        {document.isMandatory ? (
                          <div
                            className="flex items-center justify-center"
                            title="Mandatory document - cannot be removed"
                          >
                            <Lock className="w-4 h-4 text-gray-400" />
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => removeDocument(index)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No documents added yet</p>
              <p className="text-sm">Click "Add" to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentsTab;
