import React, { useRef } from "react";
import { Plus, X, Upload, FileText, Image } from "lucide-react";
import { useSelector } from "react-redux";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./Select";
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
  customRenderers = {},
  validationRules = {},
  className = "",
}) => {
  const { masterData } = useSelector((state) => state.transporter);
  const fileInputRefs = useRef({});

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
      alert("File size must be less than 5MB");
      event.target.value = "";
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      alert("Only JPEG, PNG, GIF, PDF, DOC, and DOCX files are allowed");
      event.target.value = "";
      return;
    }

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = () => {
        const updatedData = [...data];
        updatedData[rowIndex] = {
          ...updatedData[rowIndex],
          fileName: file.name,
          fileType: file.type,
          fileData: reader.result.split(",")[1], // Remove data:type;base64, prefix
        };
        onDataChange(updatedData);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      alert("Error uploading file: " + error.message);
    }
  };

  const removeFile = (rowIndex) => {
    const updatedData = [...data];
    updatedData[rowIndex] = {
      ...updatedData[rowIndex],
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
      return <Image className="w-4 h-4 text-blue-500" />;
    } else if (fileType === "application/pdf") {
      return <FileText className="w-4 h-4 text-red-500" />;
    } else {
      return <FileText className="w-4 h-4 text-gray-500" />;
    }
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
      return (
        <div className="flex items-center gap-2">
          <input
            ref={(el) => (fileInputRefs.current[rowIndex] = el)}
            type="file"
            onChange={(e) => handleFileUpload(rowIndex, column.key, e)}
            className="hidden"
            accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
          />
          {row.fileName ? (
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg flex-1">
              {getFileIcon(row.fileType)}
              <span className="text-sm text-gray-700 truncate flex-1">
                {row.fileName}
              </span>
              <button
                onClick={() => removeFile(rowIndex)}
                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRefs.current[rowIndex]?.click()}
              className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg hover:border-[#FFA500] hover:bg-[#FFF4E6] transition-colors w-full"
            >
              <Upload className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">Upload File</span>
            </button>
          )}
        </div>
      );
    }

    // Select dropdown
    if (column.type === "select") {
      return (
        <Select
          value={value}
          onValueChange={(newValue) =>
            handleCellChange(rowIndex, column.key, newValue)
          }
          disabled={column.disabled}
        >
          <SelectTrigger
            className={`min-w-[200px] ${hasError ? "border-red-500" : ""}`}
          >
            <SelectValue
              placeholder={column.placeholder || `Select ${column.label}`}
            />
          </SelectTrigger>
          <SelectContent>
            {(column.options || []).map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          className={`w-full min-w-[200px] px-3 py-2 bg-gray-50 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFA500] focus:border-transparent ${errorClass}`}
          placeholder={column.placeholder}
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
          className="w-5 h-5 text-[#FFA500] border-gray-300 focus:ring-[#FFA500]"
        />
      );
    }

    // Default text input
    return (
      <input
        type={column.type || "text"}
        value={value}
        onChange={(e) => handleCellChange(rowIndex, column.key, e.target.value)}
        placeholder={column.placeholder}
        className={`w-full min-w-[200px] px-3 py-2 bg-gray-50 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFA500] focus:border-transparent ${errorClass}`}
        disabled={column.disabled}
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
            className="bg-[#FFA500] text-white h-10 px-4 rounded-lg flex items-center gap-2 hover:bg-[#e6940a] transition-colors"
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
                <tr className="text-left text-sm font-medium text-gray-600 border-b border-gray-200">
                  {hasRowSelection && <th className="pb-3 w-12"></th>}
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={`pb-3 min-w-[200px] ${
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
                    ? "bg-[#FFF4E6] border-l-4 border-l-[#FFA500]"
                    : "bg-white";

                  return (
                    <tr
                      key={rowIndex}
                      className={`${rowClass} border-b border-gray-100`}
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
                            disabled={data.length <= 1}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
};

export default ThemeTable;
