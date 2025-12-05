import React, { useEffect, useState } from "react";
import { FileText, AlertCircle } from "lucide-react";
import { useSelector } from "react-redux";
import { Country } from "country-state-city";
import ThemeTable from "../../../components/ui/ThemeTable";

const DocumentsTab = ({ formData, setFormData, errors = {} }) => {
  const { masterData } = useSelector((state) => state.transporter);
  const [mandatoryDocumentsInitialized, setMandatoryDocumentsInitialized] =
    useState(false);

  const documents = formData.documents || [];

  // Document type options from master data (backend already returns value/label format)
  const documentTypes = masterData?.documentNames || [];
  const mandatoryDocuments = masterData?.mandatoryDocuments || [];

  // Get all countries from country-state-city package
  const allCountries = Country.getAllCountries();

  // Country options from country-state-city package (convert to value/label format)
  const countryOptions = React.useMemo(() => {
    return allCountries.map((country) => ({
      value: country.name,
      label: country.name,
    }));
  }, []);

  // Pre-fill mandatory documents on component mount
  useEffect(() => {
    // Only initialize once and only if we have mandatory documents
    if (mandatoryDocumentsInitialized || mandatoryDocuments.length === 0) {
      return;
    }

    // Check if mandatory documents are already in the form
    const existingMandatoryDocs = documents.filter((doc) =>
      mandatoryDocuments.some(
        (mandatoryDoc) => mandatoryDoc.value === doc.documentType
      )
    );

    // If no mandatory documents exist, pre-fill them
    if (existingMandatoryDocs.length === 0) {
      const mandatoryDocRows = mandatoryDocuments.map((mandatoryDoc) => ({
        documentType: mandatoryDoc.value,
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
        isMandatory: true, // Flag to identify mandatory documents
      }));

      setFormData((prev) => ({
        ...prev,
        documents: mandatoryDocRows,
      }));

      setMandatoryDocumentsInitialized(true);
    } else {
      // Mark existing documents as mandatory if they are in the mandatory list
      const updatedDocuments = documents.map((doc) => ({
        ...doc,
        isMandatory: mandatoryDocuments.some(
          (mandatoryDoc) => mandatoryDoc.value === doc.documentType
        ),
      }));

      setFormData((prev) => ({
        ...prev,
        documents: updatedDocuments,
      }));

      setMandatoryDocumentsInitialized(true);
    }
  }, [mandatoryDocuments, mandatoryDocumentsInitialized]); // Only depend on mandatoryDocuments and initialization flag

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
    // Preserve the isMandatory flag when updating documents
    const documentsWithMandatoryFlag = updatedDocuments.map((doc) => ({
      ...doc,
      isMandatory: doc.isMandatory || isMandatoryDocument(doc.documentType),
    }));

    setFormData((prev) => ({
      ...prev,
      documents: documentsWithMandatoryFlag,
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
      isMandatory: false,
    };

    const updatedDocuments = [...documents, newDocument];
    setFormData((prev) => ({
      ...prev,
      documents: updatedDocuments,
    }));
  };

  const handleRemoveDocument = (index) => {
    const documentToRemove = documents[index];

    // Prevent removal of mandatory documents
    if (documentToRemove.isMandatory) {
      console.log("Cannot remove mandatory document");
      return;
    }

    // Prevent removal if it's the last document
    if (documents.length <= 1) {
      console.log("Cannot remove the last document");
      return;
    }

    const updatedDocuments = documents.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      documents: updatedDocuments,
    }));
  };

  // Custom row renderer to disable remove button for mandatory documents
  const isRowRemovable = (rowIndex) => {
    const document = documents[rowIndex];
    return !document?.isMandatory;
  };

  return (
    <div className="bg-[#F5F7FA]">
      {/* Mandatory Documents Notice */}
      {mandatoryDocuments.length > 0 && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-900">
                Mandatory Documents Required
              </p>
              <p className="text-xs text-amber-700 mt-1">
                The following documents are mandatory and must be filled:{" "}
                <span className="font-semibold">
                  {mandatoryDocuments.map((doc) => doc.label).join(", ")}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      <ThemeTable
        title="Transporter Documents"
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
        isRowRemovable={isRowRemovable} // Pass function to check if row is removable
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
    </div>
  );
};

export default DocumentsTab;
