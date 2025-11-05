import React from "react";
import { FileText, Plus, X, Calendar } from "lucide-react";

const DocumentsTab = ({
  formData,
  setFormData,
  errors = {},
  masterData,
  isLoading,
}) => {
  const documents = formData?.documents || [];

  const handleDocumentChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedDocuments = [...prev.documents];
      updatedDocuments[index] = {
        ...updatedDocuments[index],
        [field]: value,
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
        ...prev.documents,
        {
          documentType: "",
          documentNumber: "",
          referenceNumber: "",
          validFrom: "",
          validTo: "",
          status: true,
          fileName: "",
          fileType: "",
          fileData: "",
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
                    <th className="pb-3 pl-4 min-w-[200px]">Document Type</th>
                    <th className="pb-3 pl-4 min-w-[200px]">Document Number</th>
                    <th className="pb-3 pl-4 min-w-[200px]">
                      Reference Number
                    </th>
                    <th className="pb-3 pl-4 min-w-[150px]">Valid From</th>
                    <th className="pb-3 pl-4 min-w-[150px]">Valid To</th>
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
                        <select
                          value={document.documentType || ""}
                          onChange={(e) =>
                            handleDocumentChange(
                              index,
                              "documentType",
                              e.target.value
                            )
                          }
                          className="min-w-[200px] px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs"
                        >
                          <option value="">Select</option>
                          {masterData?.documentTypes?.map((type) => (
                            <option
                              key={type.document_type_id}
                              value={type.document_type_name}
                            >
                              {type.document_type_name}
                            </option>
                          ))}
                        </select>
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
                        <input
                          type="text"
                          value={document.referenceNumber || ""}
                          onChange={(e) =>
                            handleDocumentChange(
                              index,
                              "referenceNumber",
                              e.target.value
                            )
                          }
                          placeholder="Enter reference"
                          className="min-w-[200px] px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs"
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
                        <button
                          type="button"
                          onClick={() => removeDocument(index)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
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
