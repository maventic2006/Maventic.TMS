import React from "react";
import { useDispatch } from "react-redux";
import { Plus, Trash2, Upload } from "lucide-react";
import { CustomSelect } from "@/components/ui/Select";
import { addToast } from "../../../redux/slices/uiSlice";
import { TOAST_TYPES } from "../../../utils/constants";

const DocumentsTab = ({ formData, setFormData, errors, masterData }) => {
  const dispatch = useDispatch();
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

  const handleFileUpload = (index, event) => {
    const file = event.target.files[0];
    if (!file) return;

    // File validation
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (file.size > maxSize) {
      dispatch(
        addToast({
          type: TOAST_TYPES.ERROR,
          message: "File size must be less than 5MB",
          duration: 4000,
        })
      );
      event.target.value = "";
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      dispatch(
        addToast({
          type: TOAST_TYPES.ERROR,
          message: "Only JPEG, PNG, GIF, PDF, DOC, and DOCX files are allowed",
          duration: 4000,
        })
      );
      event.target.value = "";
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        documents: prev.documents.map((doc, i) =>
          i === index
            ? {
                ...doc,
                fileName: file.name,
                fileType: file.type,
                fileData: reader.result.split(",")[1], // Base64 string without data URL prefix
              }
            : doc
        ),
      }));

      dispatch(
        addToast({
          type: TOAST_TYPES.SUCCESS,
          message: `File "${file.name}" uploaded successfully`,
          duration: 2000,
        })
      );
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white rounded-xl p-4">
      {/* Add Document Button */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-[#0D1A33]">
          Document Information
        </h3>
        <button
          type="button"
          onClick={addDocument}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[#10B981] hover:bg-[#059669] text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Document
        </button>
      </div>

      {/* Documents Table */}
      {formData.documents.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600 text-sm">
            No documents added yet. Click "Add Document" to start.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 py-2 text-left text-xs font-semibold text-[#0D1A33] uppercase tracking-wider">
                  Document Type <span className="text-red-500">*</span>
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-[#0D1A33] uppercase tracking-wider">
                  Document Number <span className="text-red-500">*</span>
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-[#0D1A33] uppercase tracking-wider">
                  Valid From
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-[#0D1A33] uppercase tracking-wider">
                  Valid To
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-[#0D1A33] uppercase tracking-wider">
                  File Name
                </th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-[#0D1A33] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {formData.documents.map((document, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  {/* Document Type */}
                  <td className="px-3 py-2">
                    <CustomSelect
                      value={document.documentType}
                      onValueChange={(value) =>
                        handleDocumentChange(index, "documentType", value)
                      }
                      options={masterData?.documentNames || []}
                      getOptionLabel={(option) => option.label}
                      getOptionValue={(option) => option.value}
                      placeholder="Select document type"
                      error={errors?.[`documents.${index}.documentType`]}
                      required
                      searchable
                    />
                    {errors?.[`documents.${index}.documentType`] && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors[`documents.${index}.documentType`]}
                      </p>
                    )}
                  </td>

                  {/* Document Number */}
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={document.documentNumber}
                      onChange={(e) =>
                        handleDocumentChange(
                          index,
                          "documentNumber",
                          e.target.value.toUpperCase()
                        )
                      }
                      placeholder="Enter number"
                      className={`w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 transition-colors ${
                        errors?.[`documents.${index}.documentNumber`]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors?.[`documents.${index}.documentNumber`] && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors[`documents.${index}.documentNumber`]}
                      </p>
                    )}
                  </td>

                  {/* Valid From */}
                  <td className="px-3 py-2">
                    <input
                      type="date"
                      value={document.validFrom}
                      onChange={(e) =>
                        handleDocumentChange(index, "validFrom", e.target.value)
                      }
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 transition-colors"
                    />
                  </td>

                  {/* Valid To */}
                  <td className="px-3 py-2">
                    <input
                      type="date"
                      value={document.validTo}
                      onChange={(e) =>
                        handleDocumentChange(index, "validTo", e.target.value)
                      }
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 transition-colors"
                    />
                  </td>

                  {/* File Name */}
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          document
                            .getElementById(`file-upload-${index}`)
                            .click()
                        }
                        className="flex items-center gap-1 px-2 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded transition-colors"
                      >
                        <Upload className="w-3 h-3" />
                        Upload
                      </button>
                      <input
                        id={`file-upload-${index}`}
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={(e) => handleFileUpload(index, e)}
                      />
                      {document.fileName && (
                        <span
                          className="text-xs text-green-600 font-medium truncate max-w-[150px]"
                          title={document.fileName}
                        >
                          {document.fileName}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="inline-flex items-center gap-1 px-2 py-1.5 text-xs text-white bg-red-500 hover:bg-red-600 rounded transition-colors"
                      title="Remove document"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-4">
        <strong>Note:</strong> Supported file formats: PDF, JPG, PNG, DOC, DOCX
        (Max 5MB)
      </p>
    </div>
  );
};

export default DocumentsTab;
