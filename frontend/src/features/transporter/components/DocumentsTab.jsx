import React from "react";
import { FileText } from "lucide-react";
import { useSelector } from "react-redux";
import ThemeTable from "../../../components/ui/ThemeTable";

const DocumentsTab = ({ formData, setFormData, errors = {} }) => {
  const { masterData } = useSelector((state) => state.transporter);

  const documents = formData.documents || [];

  // Document type options from master data (backend already returns value/label format)
  const documentTypes = masterData?.documentNames || [];

  // Table column configuration
  const columns = [
    {
      key: "documentType",
      label: "Document Type",
      type: "select",
      options: documentTypes,
      placeholder: "Select Document Type",
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
      options:
        masterData?.countries?.map((country) => ({
          value: country.code,
          label: country.name,
        })) || [],
      placeholder: "Select Country",
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
        title="Transporter Documents"
        titleIcon={FileText}
        data={documents}
        columns={columns}
        onDataChange={handleDataChange}
        onAddRow={handleAddDocument}
        onRemoveRow={handleRemoveDocument}
        errors={errors.documents || {}}
        hasRowSelection={false}
        canRemoveRows={true}
        canAddRows={true}
        className="w-full"
      />

      {/* Validation Error Summary */}
      {errors.documents && typeof errors.documents === "string" && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 flex items-center gap-2">
            {errors.documents}
          </p>
        </div>
      )}

      {/* Guidelines */}
      {/* <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          Document Guidelines:
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li> Document numbers must be unique within the same document type</li>
          <li> Valid from date cannot be in the future</li>
          <li> Valid to date must be after valid from date</li>
          <li> File uploads are optional but recommended for verification</li>
          <li> Supported formats: JPEG, PNG, GIF, PDF, DOC, DOCX (max 5MB)</li>
          <li> Document number format: Only uppercase letters, numbers, hyphens, and forward slashes</li>
        </ul>
      </div> */}
    </div>
  );
};

export default DocumentsTab;
