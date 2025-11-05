import React from "react";
import { FileText } from "lucide-react";
import { useSelector } from "react-redux";
import { Country, State } from "country-state-city";
import ThemeTable from "../../../components/ui/ThemeTable";

const DocumentsTab = ({ formData, setFormData, errors = {} }) => {
  const { masterData } = useSelector((state) => state.vehicle);

  const documents = formData.documents || [];

  // Document type options for vehicles
  const documentTypes = [
    { value: "RC", label: "Registration Certificate (RC)" },
    { value: "INSURANCE", label: "Insurance Certificate" },
    { value: "POLLUTION", label: "Pollution Certificate (PUC)" },
    { value: "FITNESS", label: "Fitness Certificate" },
    { value: "PERMIT", label: "Permit" },
    { value: "TAX", label: "Road Tax Receipt" },
    { value: "LOAN", label: "Loan Documents" },
    { value: "WARRANTY", label: "Warranty Certificate" },
    { value: "INSPECTION", label: "Inspection Report" },
    { value: "OTHER", label: "Other Document" },
  ];

  // Get all countries from country-state-city package
  const allCountries = Country.getAllCountries();

  // Country options from country-state-city package
  const countryOptions = React.useMemo(() => {
    return allCountries.map((country) => ({
      value: country.name,
      label: country.name,
    }));
  }, []);

  // State options - dynamically load based on selected country
  const getStateOptions = (countryName) => {
    const country = allCountries.find((c) => c.name === countryName);
    if (!country) return [];

    const states = State.getStatesOfCountry(country.isoCode);
    return states.map((state) => ({
      value: state.name,
      label: state.name,
    }));
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
    },
    {
      key: "documentNumber",
      label: "Document Number",
      type: "text",
      placeholder: "Enter document number",
      width: "min-w-[200px]",
    },
    {
      key: "issueDate",
      label: "Issue Date",
      type: "date",
      width: "min-w-[150px]",
    },
    {
      key: "expiryDate",
      label: "Expiry Date",
      type: "date",
      width: "min-w-[150px]",
    },
    {
      key: "issuingAuthority",
      label: "Issuing Authority",
      type: "text",
      placeholder: "e.g., RTO Mumbai",
      width: "min-w-[200px]",
    },
    {
      key: "country",
      label: "Country",
      type: "select",
      options: countryOptions,
      placeholder: "Select Country",
      searchable: true,
      width: "min-w-[150px]",
    },
    {
      key: "state",
      label: "State",
      type: "text",
      placeholder: "Enter state",
      width: "min-w-[150px]",
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
      issueDate: "",
      expiryDate: "",
      issuingAuthority: "",
      country: "",
      state: "",
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
        title="Vehicle Documents"
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
          <li>• RC, Insurance, Pollution, and Fitness certificates are typically mandatory</li>
          <li>• Ensure expiry dates are monitored to maintain compliance</li>
          <li>• Upload clear, legible copies of all documents</li>
          <li>• Document numbers must be accurate for verification purposes</li>
          <li>• Supported file formats: PDF, JPG, PNG (Max size: 5MB per file)</li>
        </ul>
      </div>
    </div>
  );
};

export default DocumentsTab;