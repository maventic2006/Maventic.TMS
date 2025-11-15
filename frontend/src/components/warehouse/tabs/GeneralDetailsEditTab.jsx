import React from "react";
import { Building2, Hash, User, MapPin } from "lucide-react";

const GeneralDetailsEditTab = ({
  formData,
  onInputChange,
  validationErrors = {},
}) => {
  // Helper function to get field error
  const getFieldError = (fieldPath) => {
    return validationErrors[fieldPath];
  };

  // Helper function to render input with error
  const renderInput = (
    name,
    label,
    type = "text",
    placeholder = "",
    icon = null,
    required = false,
    disabled = false
  ) => {
    const error = getFieldError(name);

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {icon && <span className="mr-2">{icon}</span>}
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative">
          <input
            type={type}
            name={name}
            value={formData[name] || ""}
            onChange={onInputChange}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              error
                ? "border-red-500 bg-red-50"
                : "border-gray-300 focus:border-blue-500"
            } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
          />
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  };

  // Helper function to render select with error
  const renderSelect = (
    name,
    label,
    options = [],
    placeholder = "Select...",
    icon = null,
    required = false
  ) => {
    const error = getFieldError(name);

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {icon && <span className="mr-2">{icon}</span>}
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative">
          <select
            name={name}
            value={formData[name] || ""}
            onChange={onInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none bg-white ${
              error
                ? "border-red-500 bg-red-50"
                : "border-gray-300 focus:border-blue-500"
            }`}
          >
            <option value="">{placeholder}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  };

  // Warehouse type options
  const warehouseTypeOptions = [
    { value: "distribution", label: "Distribution Center" },
    { value: "storage", label: "Storage Warehouse" },
    { value: "manufacturing", label: "Manufacturing Facility" },
    { value: "cross_dock", label: "Cross-Dock Terminal" },
    { value: "cold_storage", label: "Cold Storage Facility" },
    { value: "bonded", label: "Bonded Warehouse" },
    { value: "public", label: "Public Warehouse" },
    { value: "private", label: "Private Warehouse" },
  ];

  // Language options
  const languageOptions = [
    { value: "en", label: "English" },
    { value: "hi", label: "Hindi" },
    { value: "ta", label: "Tamil" },
    { value: "te", label: "Telugu" },
    { value: "kn", label: "Kannada" },
    { value: "ml", label: "Malayalam" },
    { value: "gu", label: "Gujarati" },
    { value: "mr", label: "Marathi" },
    { value: "bn", label: "Bengali" },
    { value: "pa", label: "Punjabi" },
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Basic Information Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h3>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {renderInput(
              "warehouse_id",
              "Warehouse ID",
              "text",
              "Auto-generated",
              <Hash className="h-4 w-4 text-gray-400" />,
              false,
              true
            )}

            {renderInput(
              "warehouse_name1",
              "Warehouse Name",
              "text",
              "Enter warehouse name",
              <Building2 className="h-4 w-4 text-gray-400" />,
              true
            )}

            {renderInput(
              "warehouse_name2",
              "Alternative Name",
              "text",
              "Enter alternative name (optional)",
              <Building2 className="h-4 w-4 text-gray-400" />
            )}

            {renderInput(
              "consignor_id",
              "Consignor ID",
              "text",
              "Enter consignor ID",
              <User className="h-4 w-4 text-gray-400" />,
              true
            )}

            {renderSelect(
              "warehouse_type",
              "Warehouse Type",
              warehouseTypeOptions,
              "Select warehouse type",
              <Building2 className="h-4 w-4 text-gray-400" />,
              true
            )}

            {renderSelect(
              "language",
              "Language",
              languageOptions,
              "Select language",
              null,
              false
            )}
          </div>
        </div>
      </div>

      {/* Capacity & Specifications */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Building2 className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Capacity & Specifications
            </h3>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {renderInput(
              "vehicle_capacity",
              "Vehicle Capacity",
              "number",
              "Enter vehicle capacity",
              null,
              false
            )}

            {renderInput(
              "speed_limit",
              "Speed Limit (km/h)",
              "number",
              "Enter speed limit",
              null,
              false
            )}

            {renderInput(
              "radius_for_virtual_yard_in",
              "Virtual Yard Radius (meters)",
              "number",
              "Enter radius in meters",
              null,
              false
            )}
          </div>
        </div>
      </div>

      {/* Location Information */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MapPin className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Location Information
            </h3>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {renderInput(
              "region",
              "Region",
              "text",
              "Enter region",
              <MapPin className="h-4 w-4 text-gray-400" />
            )}

            {renderInput(
              "zone",
              "Zone",
              "text",
              "Enter zone",
              <MapPin className="h-4 w-4 text-gray-400" />
            )}

            {renderInput(
              "city",
              "City",
              "text",
              "Enter city",
              <MapPin className="h-4 w-4 text-gray-400" />,
              true
            )}

            {renderInput(
              "state",
              "State",
              "text",
              "Enter state",
              <MapPin className="h-4 w-4 text-gray-400" />,
              true
            )}

            {renderInput(
              "country",
              "Country",
              "text",
              "Enter country",
              <MapPin className="h-4 w-4 text-gray-400" />,
              true
            )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="p-1 bg-blue-100 rounded">
            <Building2 className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-800 mb-1">
              Form Instructions
            </h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Fields marked with * are required</li>
              <li>• Warehouse ID is auto-generated and cannot be edited</li>
              <li>
                • Choose the appropriate warehouse type for accurate
                categorization
              </li>
              <li>
                • Capacity values should be realistic and based on actual
                facility capabilities
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralDetailsEditTab;
