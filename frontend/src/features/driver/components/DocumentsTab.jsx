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

import React, { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { useSelector } from "react-redux";
import { Country, State } from "country-state-city";
import ThemeTable from "../../../components/ui/ThemeTable";

const DocumentsTab = ({ formData, setFormData, errors = {} }) => {
  const { masterData } = useSelector((state) => state.driver);
  const [mandatoryDocumentsInitialized, setMandatoryDocumentsInitialized] =
    useState(false);

  const documents = formData.documents || [];

  // Document type options from master data (backend returns value/label format)
  const documentTypes = masterData?.documentTypes || [];
  const mandatoryDocuments = masterData?.mandatoryDocuments || [];

  // Get all countries from country-state-city package
  const allCountries = Country.getAllCountries();

  // Country options from country-state-city package (convert to value/label format)
  const countryOptions = React.useMemo(() => {
    return allCountries.map((country) => ({
      value: country.isoCode, // Use ISO code as value for state lookup
      label: country.name,
    }));
  }, []);

  // Function to get state options for a specific country
  const getStateOptions = (countryCode) => {
    if (!countryCode) return [];
    const states = State.getStatesOfCountry(countryCode);
    return states.map((state) => ({
      value: state.isoCode,
      label: state.name,
    }));
  };

  // Pre-fill mandatory documents on component mount
  useEffect(() => {
    // Only initialize once and only if we have mandatory documents
    if (mandatoryDocumentsInitialized || mandatoryDocuments.length === 0) {
      return;
    }

    // Check if mandatory documents are already in the form
    // Need to check both documentType and documentTypeId since API returns documentTypeId
    const existingMandatoryDocs = documents.filter((doc) =>
      mandatoryDocuments.some(
        (mandatoryDoc) =>
          mandatoryDoc.value === doc.documentType ||
          mandatoryDoc.value === doc.documentTypeId
      )
    );

    // If no mandatory documents exist, pre-fill them
    if (existingMandatoryDocs.length === 0 && documents.length === 0) {
      const mandatoryDocRows = mandatoryDocuments.map((mandatoryDoc) => ({
        documentType: mandatoryDoc.value,
        documentNumber: "",
        issuingCountry: "",
        issuingState: "",
        validFrom: "",
        validTo: "",
        status: true,
        fileName: "",
        fileType: "",
        fileData: "",
        fileUpload: null,
        remarks: "",
        isMandatory: true, // Flag to identify mandatory documents
      }));

      setFormData((prev) => ({
        ...prev,
        documents: mandatoryDocRows,
      }));

      setMandatoryDocumentsInitialized(true);
    } else {
      // Mark existing documents as mandatory if they are in the mandatory list
      // Check both documentType and documentTypeId
      const updatedDocuments = documents.map((doc) => ({
        ...doc,
        // Normalize documentType to use the ID value if documentTypeId exists
        documentType: doc.documentTypeId || doc.documentType,
        isMandatory: mandatoryDocuments.some(
          (mandatoryDoc) =>
            mandatoryDoc.value === doc.documentType ||
            mandatoryDoc.value === doc.documentTypeId
        ),
      }));

      // Only update if we actually have documents to update
      if (updatedDocuments.length > 0) {
        setFormData((prev) => ({
          ...prev,
          documents: updatedDocuments,
        }));
      }

      setMandatoryDocumentsInitialized(true);
    }
  }, [mandatoryDocuments, mandatoryDocumentsInitialized, documents.length]); // Added documents.length to detect changes

  // Helper function to check if a document is mandatory
  const isMandatoryDocument = (documentType) => {
    return mandatoryDocuments.some(
      (mandatoryDoc) => mandatoryDoc.value === documentType
    );
  };

  // Table column configuration
  const columns = [
    {
      key: "documentType",
      label: "Document Type",
      type: "select",
      options: documentTypes,
      placeholder: "Select Document Type",
      searchable: true,
      width: "min-w-[200px]",
      required: true, // Mark as required visually
      // Disable document type dropdown for mandatory documents
      getDisabled: (row) => {
        return row.isMandatory === true;
      },
    },
    {
      key: "documentNumber",
      label: "Document Number",
      type: "text",
      placeholder: "Enter document number",
      width: "min-w-[200px]",
      required: true, // Mark as required visually
    },
    {
      key: "issuingCountry",
      label: "Issuing Country",
      type: "select",
      options: countryOptions,
      placeholder: "Select Country",
      searchable: true,
      width: "min-w-[200px]",
    },
    {
      key: "issuingState",
      label: "Issuing State",
      type: "select",
      options: [], // Will be populated dynamically based on country
      placeholder: "Select State",
      searchable: true,
      width: "min-w-[200px]",
      getDynamicOptions: (rowData) => {
        // Return state options based on the selected country in this row
        if (rowData.issuingCountry) {
          return getStateOptions(rowData.issuingCountry);
        }
        return [];
      },
    },
    {
      key: "validFrom",
      label: "Valid From",
      type: "date",
      width: "min-w-[200px]",
    },
    {
      key: "validTo",
      label: "Valid To",
      type: "date",
      width: "min-w-[200px]",
    },
    {
      key: "fileUpload",
      label: "Document Upload",
      type: "file",
      width: "min-w-[200px]",
      accept: ".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx",
    },
  ];

  const handleDataChange = (updatedDocuments) => {
    // Preserve the isMandatory flag when updating documents
    const documentsWithMandatoryFlag = updatedDocuments.map((doc, index) => {
      const prevDoc = documents[index];

      // Check if country changed - if so, clear the state
      const countryChanged =
        prevDoc && prevDoc.issuingCountry !== doc.issuingCountry;

      return {
        ...doc,
        // Clear state if country changed
        issuingState: countryChanged ? "" : doc.issuingState,
        isMandatory: doc.isMandatory || isMandatoryDocument(doc.documentType),
      };
    });

    setFormData((prev) => ({
      ...prev,
      documents: documentsWithMandatoryFlag,
    }));
  };

  const handleAddDocument = () => {
    const newDocument = {
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
      fileUpload: null,
      remarks: "",
      isMandatory: false, // New documents are not mandatory
    };

    const updatedDocuments = [...documents, newDocument];
    handleDataChange(updatedDocuments);
  };

  const handleRemoveDocument = (index) => {
    const document = documents[index];

    // Prevent removal of mandatory documents
    if (document?.isMandatory) {
      alert("This is a mandatory document and cannot be removed.");
      return;
    }

    const updatedDocuments = documents.filter((_, i) => i !== index);
    handleDataChange(updatedDocuments);
  };

  return (
    <div className="bg-[#F5F7FA]">
      <ThemeTable
        title="Driver Documents"
        titleIcon={FileText}
        data={documents}
        columns={columns}
        onDataChange={handleDataChange}
        onAddRow={handleAddDocument}
        onRemoveRow={handleRemoveDocument}
        errors={errors || {}}
        hasRowSelection={false}
        canRemoveRows={true}
        canAddRows={true}
        className="w-full"
      />

      {/* Validation Error Summary */}
      {errors && typeof errors === "string" && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-700 flex items-center gap-2">
            {errors}
          </p>
        </div>
      )}

      {errors && errors._general && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-700 flex items-center gap-2">
            {errors._general}
          </p>
        </div>
      )}

      {/* Guidelines */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          Document Guidelines:
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Mandatory documents are pre-populated and cannot be removed</li>
          <li>
            • Document numbers must be unique within the same document type
          </li>
          <li>• Valid from date cannot be in the future</li>
          <li>• Valid to date must be after valid from date</li>
          <li>• File uploads are required for all document types</li>
          <li>• Supported formats: JPEG, PNG, GIF, PDF, DOC, DOCX (max 5MB)</li>
          <li>
            • Document number format: Only uppercase letters, numbers, hyphens,
            and forward slashes
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DocumentsTab;
