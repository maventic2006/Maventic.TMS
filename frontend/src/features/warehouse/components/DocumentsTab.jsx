import React from "react";
import { Label, Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Button } from "../../../components/ui/button";
import { Plus, Trash2 } from "lucide-react";

const DocumentsTab = ({ formData, setFormData, errors, masterData }) => {
  const addDocument = () => {
    setFormData((prev) => ({
      ...prev,
      documents: [
        ...prev.documents,
        {
          documentType: "",
          documentNumber: "",
          validFrom: "",
          validTo: "",
          fileName: "",
          fileType: "",
          fileData: "",
          status: true,
        },
      ],
    }));
  };

  const removeDocument = (index) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  };

  const handleDocumentChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.map((doc, i) =>
        i === index ? { ...doc, [field]: value } : doc
      ),
    }));
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-[#0D1A33]">
          Warehouse Documents
        </h3>
        <Button
          type="button"
          onClick={addDocument}
          className="bg-[#10B981] hover:bg-[#059669] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Document
        </Button>
      </div>

      {formData.documents.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600">
            No documents added yet. Click "Add Document" to start.
          </p>
        </div>
      )}

      {formData.documents.map((document, index) => (
        <div
          key={index}
          className="p-6 bg-gray-50 rounded-lg border border-gray-200 space-y-4"
        >
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-[#0D1A33]">
              Document {index + 1}
            </h4>
            {formData.documents.length > 1 && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeDocument(index)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Document Type */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-[#0D1A33]">
                Document Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={document.documentType}
                onValueChange={(value) =>
                  handleDocumentChange(index, "documentType", value)
                }
              >
                <SelectTrigger
                  className={
                    errors?.[`documents.${index}.documentType`]
                      ? "border-red-500"
                      : ""
                  }
                >
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {masterData?.documentTypes?.map((type) => (
                    <SelectItem
                      key={type.document_type_id}
                      value={type.document_type_id}
                    >
                      {type.document_type_name || type.document_type_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors?.[`documents.${index}.documentType`] && (
                <p className="text-xs text-red-500">
                  {errors[`documents.${index}.documentType`]}
                </p>
              )}
            </div>

            {/* Document Number */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-[#0D1A33]">
                Document Number <span className="text-red-500">*</span>
              </Label>
              <Input
                value={document.documentNumber}
                onChange={(e) =>
                  handleDocumentChange(
                    index,
                    "documentNumber",
                    e.target.value.toUpperCase()
                  )
                }
                placeholder="Enter document number"
                className={
                  errors?.[`documents.${index}.documentNumber`]
                    ? "border-red-500"
                    : ""
                }
              />
              {errors?.[`documents.${index}.documentNumber`] && (
                <p className="text-xs text-red-500">
                  {errors[`documents.${index}.documentNumber`]}
                </p>
              )}
            </div>

            {/* Valid From */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-[#0D1A33]">
                Valid From
              </Label>
              <Input
                type="date"
                value={document.validFrom}
                onChange={(e) =>
                  handleDocumentChange(index, "validFrom", e.target.value)
                }
              />
            </div>

            {/* Valid To */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-[#0D1A33]">
                Valid To
              </Label>
              <Input
                type="date"
                value={document.validTo}
                onChange={(e) =>
                  handleDocumentChange(index, "validTo", e.target.value)
                }
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocumentsTab;
