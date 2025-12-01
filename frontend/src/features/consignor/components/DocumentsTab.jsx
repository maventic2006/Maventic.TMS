import React from "react";
import { FileText } from "lucide-react";
import { useSelector } from "react-redux";
import { Country } from "country-state-city";
import ThemeTable from "../../../components/ui/ThemeTable";

const DocumentsTab = ({ formData, setFormData, errors = {} }) => {
  const { masterData } = useSelector((state) => state.consignor);

  const documents = formData.documents || [];

  // Document type options from master data (backend already returns value/label format)
  const documentTypes = masterData?.documentTypes || [];

  // Debug logging
  console.log("📋 DocumentsTab - masterData:", masterData);
  console.log("📋 DocumentsTab - documentTypes:", documentTypes);
  console.log("📋 DocumentsTab - documentTypes length:", documentTypes.length);

  // Get all countries from country-state-city package
  const allCountries = Country.getAllCountries();

  // Country options from country-state-city package (convert to value/label format)
  const countryOptions = React.useMemo(() => {
    return allCountries.map((country) => ({
      value: country.name,
      label: country.name,
    }));
  }, []);

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
    },
  ];

  const handleDataChange = (updatedDocuments) => {
    console.log("📋 DocumentsTab - handleDataChange called:", {
      documentCount: updatedDocuments.length,
      documentsWithFiles: updatedDocuments.filter(
        (d) => d.fileUpload instanceof File
      ).length,
      documents: updatedDocuments.map((d, i) => ({
        index: i,
        hasFile: d.fileUpload instanceof File,
        fileName: d.fileUpload?.name || "No file",
        fileType: d.fileUpload?.type || "N/A",
        fileUploadConstructor: d.fileUpload?.constructor?.name || "N/A",
      })),
    });

    console.log("📋 Raw fileUpload objects:");
    updatedDocuments.forEach((d, i) => {
      if (d.fileUpload) {
        console.log(`  Document ${i} fileUpload:`, d.fileUpload);
        console.log(`  Is File?`, d.fileUpload instanceof File);
        console.log(`  Is Blob?`, d.fileUpload instanceof Blob);
        console.log(`  Constructor:`, d.fileUpload.constructor.name);
        console.log(`  Has name property?`, "name" in d.fileUpload);
        console.log(`  Has size property?`, "size" in d.fileUpload);
      }
    });

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
    };

    const updatedDocuments = [...documents, newDocument];
    setFormData((prev) => ({
      ...prev,
      documents: updatedDocuments,
    }));
  };

  const handleRemoveDocument = (index) => {
    if (documents.length <= 1) return; // Keep at least one document

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
      {/* <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          Document Guidelines:
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✓ Document numbers must be unique within the same document type</li>
          <li>✓ Valid from date cannot be in the future</li>
          <li>✓ Valid to date must be after valid from date</li>
          <li>✓ File uploads are optional but recommended for verification</li>
          <li>✓ Supported formats: JPEG, PNG, GIF, PDF, DOC, DOCX (max 5MB)</li>
          <li>✓ Document number format: Only uppercase letters, numbers, hyphens, and forward slashes</li>
        </ul>
      </div> */}
    </div>
  );
};

export default DocumentsTab;
