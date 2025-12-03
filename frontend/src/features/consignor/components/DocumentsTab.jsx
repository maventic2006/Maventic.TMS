import React, { useEffect } from "react";
import { FileText } from "lucide-react";
import { useSelector } from "react-redux";
import { Country } from "country-state-city";
import ThemeTable from "../../../components/ui/ThemeTable";

const DocumentsTab = ({ formData, setFormData, errors = {} }) => {
  const { masterData } = useSelector((state) => state.consignor);

  const documents = formData.documents || [];

  // Document type options from master data (backend returns value/label format)
  const documentTypes = masterData?.documentTypes || [];
  
  // Debug logging
  console.log('📋 DocumentsTab - masterData:', masterData);
  console.log('📋 DocumentsTab - documentTypes:', documentTypes);
  console.log('📋 DocumentsTab - mandatory count:', documentTypes.filter(dt => dt.isMandatory).length);

  // Get all countries from country-state-city package
  const allCountries = Country.getAllCountries();

  // Country options from country-state-city package (convert to value/label format)
  const countryOptions = React.useMemo(() => {
    return allCountries.map((country) => ({
      value: country.name,
      label: country.name,
    }));
  }, []);

  // Auto-populate mandatory documents when component mounts or when documentTypes change
  useEffect(() => {
    if (documentTypes.length > 0 && documents.length === 0) {
      const mandatoryDocuments = documentTypes
        .filter(docType => docType.isMandatory)
        .map(docType => ({
          documentType: docType.value,
          documentNumber: "",
          referenceNumber: "",
          country: "",
          validFrom: "",
          validTo: "",
          status: true,
          fileName: "",
          fileType: "",
          fileData: "",
          fileUpload: null, // For file upload
          documentProvider: "",
          premiumAmount: 0,
          remarks: "",
        }));

      // Only set if no documents exist yet
      if (mandatoryDocuments.length > 0) {
        setFormData((prev) => ({
          ...prev,
          documents: mandatoryDocuments,
        }));
      }
    }
  }, [documentTypes, documents.length, setFormData]);

  // Table column configuration matching transporter design
  const columns = [
    {
      key: "documentType",
      label: "Document Type",
      type: "select",
      options: documentTypes,
      placeholder: "Select Document Type",
      searchable: true,
      width: "min-w-[200px]",
    },
    {
      key: "documentNumber",
      label: "Document Number",
      type: "text",
      placeholder: "Enter document number",
      width: "min-w-[200px]",
    },
    {
      key: "country",
      label: "Country",
      type: "select",
      options: countryOptions,
      placeholder: "Select Country",
      searchable: true,
      width: "min-w-[200px]",
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
    setFormData((prev) => ({
      ...prev,
      documents: updatedDocuments,
    }));
  };

  const handleAddDocument = () => {
    const newDocument = {
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
      fileUpload: null,
      documentProvider: "",
      premiumAmount: 0,
      remarks: "",
    };

    const updatedDocuments = [...documents, newDocument];
    setFormData((prev) => ({
      ...prev,
      documents: updatedDocuments,
    }));
  };

  const handleRemoveDocument = (index) => {
    // Check if this is a mandatory document type
    const documentToRemove = documents[index];
    const mandatoryDocTypes = documentTypes.filter(dt => dt.isMandatory).map(dt => dt.value);
    
    if (mandatoryDocTypes.includes(documentToRemove.documentType)) {
      // Don't allow removal of mandatory document types, just clear the fields
      const updatedDocuments = [...documents];
      updatedDocuments[index] = {
        ...updatedDocuments[index],
        documentNumber: "",
        referenceNumber: "",
        country: "",
        validFrom: "",
        validTo: "",
        fileName: "",
        fileType: "",
        fileData: "",
        fileUpload: null,
        documentProvider: "",
        premiumAmount: 0,
        remarks: "",
      };
      setFormData((prev) => ({
        ...prev,
        documents: updatedDocuments,
      }));
      return;
    }

    // Allow removal of non-mandatory documents
    const updatedDocuments = documents.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      documents: updatedDocuments,
    }));
  };

  return (
    <div className="bg-[#F5F7FA]">
      <ThemeTable
        title="Consignor Documents"
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
          <li>• Document numbers must be unique within the same document type</li>
          <li>• Valid from date cannot be in the future</li>
          <li>• Valid to date must be after valid from date</li>
          <li>• File uploads are required for all document types</li>
          <li>• Supported formats: JPEG, PNG, GIF, PDF, DOC, DOCX (max 5MB)</li>
          <li>• Document number format: Only uppercase letters, numbers, hyphens, and forward slashes</li>
        </ul>
      </div>
    </div>
  );
};

export default DocumentsTab;
