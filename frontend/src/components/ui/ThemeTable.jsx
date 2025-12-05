import React, { useRef, useState, useEffect } from "react";
import { Plus, X, Upload, FileText, Image, Eye } from "lucide-react";
import { useSelector } from "react-redux";
import { CustomSelect } from "./Select";
import ThemedCheckbox from "./themed/ThemedCheckbox";
import ThemedSwitch from "./themed/ThemedSwitch";

const ThemeTable = ({
  data = [],
  columns = [],
  onDataChange,
  onAddRow,
  onRemoveRow,
  errors = {},
  title,
  titleIcon: TitleIcon,
  hasRowSelection = false,
  selectedRowIndex = null,
  onRowSelect,
  canRemoveRows = true,
  canAddRows = true,
  isRowRemovable, // Function to check if a specific row can be removed
  customRenderers = {},
  validationRules = {},
  className = "",
}) => {
  const { masterData } = useSelector((state) => state.transporter);
  const fileInputRefs = useRef({});
  const [previewDocument, setPreviewDocument] = useState(null);

  // Handle ESC key to close preview modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && previewDocument) {
        closePreview();
      }
    };

    if (previewDocument) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [previewDocument]);

  const handleCellChange = (rowIndex, columnKey, value) => {
    const updatedData = [...data];
    updatedData[rowIndex] = {
      ...updatedData[rowIndex],
      [columnKey]: value,
    };
    onDataChange(updatedData);
  };

  const handleFileUpload = async (rowIndex, columnKey, event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Find column config to get specific accept types
    const column = columns.find((col) => col.key === columnKey);

    // File validation
    const maxSize = 5 * 1024 * 1024; // 5MB
    let allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    // If column specifies accept types, use those
    if (column?.accept) {
      allowedTypes = column.accept.split(",").map((type) => {
        // Convert file extension to MIME type
        const mimeMap = {
          ".jpg": "image/jpeg",
          ".jpeg": "image/jpeg",
          ".png": "image/png",
          ".gif": "image/gif",
          ".pdf": "application/pdf",
          ".doc": "application/msword",
          ".docx":
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        };
        return mimeMap[type] || type;
      });
    }

    if (file.size > maxSize) {
      alert("File size must be less than 5MB");
      event.target.value = "";
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      alert(
        `Only ${allowedTypes
          .map((t) => t.split("/")[1].toUpperCase())
          .join(", ")} files are allowed`
      );
      event.target.value = "";
      return;
    }

    try {
      // Convert file to base64 for storage and preview
      const reader = new FileReader();
      reader.onload = function (e) {
        const base64Data = e.target.result.split(",")[1]; // Remove data:... prefix

        const updatedData = [...data];
        updatedData[rowIndex] = {
          ...updatedData[rowIndex],
          [columnKey]: file, // Store file object for backend upload
          [`${columnKey}_preview`]: URL.createObjectURL(file), // For preview
          fileName: file.name,
          fileType: file.type,
          fileData: base64Data, // Store base64 for preview modal
        };

        console.log(`📎 ThemeTable - File uploaded:`, {
          rowIndex,
          columnKey,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          isFileObject: file instanceof File,
          hasBase64Data: !!base64Data,
        });

        onDataChange(updatedData);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      alert("Error uploading file: " + error.message);
    }
  };

  const removeFile = (rowIndex, columnKey = "photo") => {
    const updatedData = [...data];

    // Clean up preview URL if it exists
    const previewUrl = updatedData[rowIndex][`${columnKey}_preview`];
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    updatedData[rowIndex] = {
      ...updatedData[rowIndex],
      [columnKey]: null,
      [`${columnKey}_preview`]: null,
      fileName: "",
      fileType: "",
      fileData: "",
    };
    onDataChange(updatedData);

    // Clear file input
    if (fileInputRefs.current[rowIndex]) {
      fileInputRefs.current[rowIndex].value = "";
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith("image/")) {
      return <Image className="w-5 h-5 text-[#6366F1]" />;
    } else if (fileType === "application/pdf") {
      return <FileText className="w-5 h-5 text-[#6366F1]" />;
    } else {
      return <FileText className="w-5 h-5 text-[#6366F1]" />;
    }
  };

  const handlePreviewDocument = (row) => {
    const fileValue = row.fileUpload || row.photo || null;
    const isFileObject = fileValue instanceof File;

    let previewData = {};

    if (isFileObject) {
      // For File objects, convert to base64 for preview
      const reader = new FileReader();
      reader.onload = function (e) {
        const base64Data = e.target.result.split(",")[1]; // Remove data:... prefix
        setPreviewDocument({
          fileName: fileValue.name,
          fileType: fileValue.type,
          fileData: base64Data,
        });
      };
      reader.readAsDataURL(fileValue);
    } else if (row.fileData && row.fileType && row.fileName) {
      // For existing uploaded documents with base64 data
      setPreviewDocument({
        fileName: row.fileName,
        fileType: row.fileType,
        fileData: row.fileData,
      });
    } else {
      console.log("No valid file data for preview:", row);
    }
  };

  const closePreview = () => {
    setPreviewDocument(null);
  };

  const renderCell = (row, column, rowIndex) => {
    const value = row[column.key] || "";
    const hasError = errors[rowIndex]?.[column.key];
    const errorClass = hasError ? "border-red-500" : "border-gray-300";

    // Custom renderer
    if (customRenderers[column.key]) {
      return customRenderers[column.key](
        value,
        row,
        rowIndex,
        handleCellChange
      );
    }

    // File upload column
    if (column.type === "file") {
      const fileValue = row[column.key];
      const isFileObject = fileValue instanceof File;
      const previewUrl = row[`${column.key}_preview`];
      const fileName = isFileObject
        ? fileValue.name
        : row.fileName ||
          (typeof fileValue === "string" ? fileValue.split("/").pop() : "");
      const fileType = isFileObject ? fileValue.type : row.fileType;
      const hasFile = isFileObject || fileName;

      return (
        <div className="flex items-center gap-2">
          <input
            ref={(el) => (fileInputRefs.current[rowIndex] = el)}
            type="file"
            onChange={(e) => handleFileUpload(rowIndex, column.key, e)}
            className="hidden"
            accept={column.accept || ".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"}
          />
          {hasFile ? (
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg flex-1">
              {/* Preview for images */}
              {(fileType?.startsWith("image/") || previewUrl) && (
                <img
                  src={
                    previewUrl ||
                    (typeof fileValue === "string" ? fileValue : "")
                  }
                  alt="Preview"
                  className="w-10 h-10 object-cover rounded"
                />
              )}
              {!fileType?.startsWith("image/") &&
                !previewUrl &&
                getFileIcon(fileType)}
              <span className="text-sm text-gray-700 truncate flex-1">
                {fileName}
              </span>
              {/* Preview button - show if we have file data or an uploaded file */}
              {(isFileObject ||
                (row.fileData && row.fileType) ||
                (row.fileName && row.fileType)) && (
                <button
                  onClick={() => handlePreviewDocument(row)}
                  className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                  title="Preview"
                >
                  <Eye className="w-3 h-3" />
                </button>
              )}
              <button
                onClick={() => removeFile(rowIndex, column.key)}
                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                title="Remove"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRefs.current[rowIndex]?.click()}
              className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg hover:border-[#10B981] hover:bg-[#FFF4E6] transition-colors w-full"
            >
              <Upload className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">
                {column.accept?.includes("image")
                  ? "Upload Image"
                  : "Upload File"}
              </span>
            </button>
          )}
        </div>
      );
    }

    // Select dropdown
    if (column.type === "select") {
      // Get options - either static or dynamic based on row data
      const selectOptions = column.getDynamicOptions
        ? column.getDynamicOptions(row)
        : column.options || [];

      // Get disabled state - either static or dynamic based on row data
      const isDisabled = column.getDisabled
        ? column.getDisabled(row, rowIndex)
        : column.disabled || false;

      return (
        <CustomSelect
          value={value}
          onValueChange={(newValue) => {
            handleCellChange(rowIndex, column.key, newValue);
          }}
          options={selectOptions}
          placeholder={column.placeholder || `Select ${column.label}`}
          disabled={isDisabled}
          searchable={column.searchable || false}
          getOptionLabel={(option) => option.label}
          getOptionValue={(option) => option.value}
          className={`min-w-[200px] ${hasError ? "border-red-500" : ""}`}
          error={hasError}
        />
      );
    }

    // Date input
    if (column.type === "date") {
      let dateConstraints = {};

      // Add date constraints based on column key
      if (column.key === "validFrom") {
        dateConstraints.max = new Date().toISOString().split("T")[0]; // Cannot be future
      }

      if (column.key === "validTo" && row.validFrom) {
        dateConstraints.min = row.validFrom; // Must be after validFrom
      }

      return (
        <input
          type="date"
          value={value}
          onChange={(e) =>
            handleCellChange(rowIndex, column.key, e.target.value)
          }
          className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 transition-colors ${errorClass}`}
          {...dateConstraints}
        />
      );
    }

    // Checkbox
    if (column.type === "checkbox") {
      return (
        <ThemedCheckbox
          checked={value || false}
          onCheckedChange={(checked) =>
            handleCellChange(rowIndex, column.key, checked)
          }
        />
      );
    }

    // Radio button (for row selection)
    if (column.type === "radio") {
      return (
        <input
          type="radio"
          checked={selectedRowIndex === rowIndex}
          onChange={() => onRowSelect && onRowSelect(rowIndex)}
          className="w-5 h-5 text-[#10B981] border-gray-300 focus:ring-[#10B981]"
        />
      );
    }

    // Default text input
    // Get disabled state - either static or dynamic based on row data
    const isInputDisabled = column.getDisabled
      ? column.getDisabled(row, rowIndex)
      : column.disabled || false;

    return (
      <input
        type={column.type || "text"}
        value={value}
        onChange={(e) => handleCellChange(rowIndex, column.key, e.target.value)}
        placeholder={column.placeholder}
        className={`w-full min-w-[200px] px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent ${errorClass}`}
        disabled={isInputDisabled}
      />
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="bg-[#0D1A33] text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          {TitleIcon && <TitleIcon className="w-6 h-6" />}
          <h2 className="text-xl font-bold">{title}</h2>
        </div>
        {canAddRows && (
          <button
            onClick={onAddRow}
            className="bg-[#10B981] text-white h-9 px-3 rounded-lg flex items-center gap-2 text-sm hover:bg-[#059669] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        )}
      </div>

      {/* Table */}
      <div className="p-6">
        {data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-600 border-b border-gray-200">
                  {hasRowSelection && <th className="pb-3 w-12"></th>}
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={`pb-3 pl-4 min-w-[200px] ${
                        column.width || "w-auto"
                      }`}
                    >
                      {column.label}
                    </th>
                  ))}
                  {canRemoveRows && <th className="pb-3 w-12"></th>}
                </tr>
              </thead>
              <tbody>
                {data.map((row, rowIndex) => {
                  const isSelected = selectedRowIndex === rowIndex;
                  const rowClass = isSelected
                    ? "bg-[#FFF4E6] border-l-4 border-l-[#10B981]"
                    : "bg-white";

                  return (
                    <tr
                      key={rowIndex}
                      className={`${rowClass} border-b border-gray-100 text-xs`}
                      style={{ height: "60px" }}
                    >
                      {hasRowSelection && (
                        <td className="px-3">
                          {renderCell(row, { type: "radio" }, rowIndex)}
                        </td>
                      )}
                      {columns.map((column) => (
                        <td key={column.key} className="px-3">
                          {renderCell(row, column, rowIndex)}
                        </td>
                      ))}
                      {canRemoveRows && (
                        <td className="px-3">
                          <button
                            onClick={() => onRemoveRow(rowIndex)}
                            disabled={
                              data.length <= 1 ||
                              (isRowRemovable && !isRowRemovable(rowIndex))
                            }
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={
                              isRowRemovable && !isRowRemovable(rowIndex)
                                ? "This document is mandatory and cannot be removed"
                                : "Remove row"
                            }
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            {TitleIcon && (
              <TitleIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            )}
            <p className="text-lg font-medium">No data added yet</p>
            <p className="text-sm">Click "Add Row" to get started</p>
          </div>
        )}
      </div>

      {/* Document Preview Modal */}
      {previewDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closePreview}
          />

          {/* Modal Content */}
          <div className="relative bg-white rounded-xl shadow-2xl max-w-6xl w-full mx-4 max-h-[95vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#E0E7FF] rounded-lg">
                  {getFileIcon(previewDocument.fileType)}
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {previewDocument.fileName}
                </h3>
              </div>
              <button
                onClick={closePreview}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Modal Body - Preview Area */}
            <div className="flex-1 overflow-auto p-6">
              {previewDocument.fileType?.startsWith("image/") ? (
                <img
                  src={
                    previewDocument.fileData.startsWith("http")
                      ? previewDocument.fileData
                      : `data:${previewDocument.fileType};base64,${previewDocument.fileData}`
                  }
                  alt={previewDocument.fileName}
                  className="max-w-full h-auto mx-auto"
                />
              ) : previewDocument.fileType === "application/pdf" ? (
                <iframe
                  src={
                    previewDocument.fileData.startsWith("http")
                      ? previewDocument.fileData
                      : `data:application/pdf;base64,${previewDocument.fileData}`
                  }
                  className="w-full h-[75vh] border-0"
                  title={previewDocument.fileName}
                />
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Preview not available for this file type
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    {previewDocument.fileName}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={closePreview}
                className="px-6 py-2.5 border border-[#E5E7EB] text-[#4A5568] rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeTable;
