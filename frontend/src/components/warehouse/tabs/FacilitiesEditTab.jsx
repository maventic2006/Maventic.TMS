import React from "react";
import {
  Truck,
  Scale,
  Fuel,
  Warehouse,
  Users,
  Wrench,
  Settings,
  Clock,
} from "lucide-react";

const FacilitiesEditTab = ({
  formData,
  onInputChange,
  validationErrors = {},
}) => {
  // Helper function to get field error
  const getFieldError = (fieldPath) => {
    return validationErrors[fieldPath];
  };

  // Helper function to handle checkbox change
  const handleCheckboxChange = (name) => {
    const event = {
      target: {
        name,
        value: !formData[name],
        type: "checkbox",
      },
    };
    onInputChange(event);
  };

  // Helper function to render checkbox with error
  const renderCheckbox = (name, label, icon = null, description = "") => {
    const error = getFieldError(name);

    return (
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors">
        <div className="flex items-start gap-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              name={name}
              checked={formData[name] || false}
              onChange={() => handleCheckboxChange(name)}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 cursor-pointer">
              <div className="flex items-center gap-2 mb-1">
                {icon && <span className="text-gray-500">{icon}</span>}
                {label}
              </div>
              {description && (
                <p className="text-xs text-gray-500">{description}</p>
              )}
            </label>
          </div>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    );
  };

  // Helper function to render textarea with error
  const renderTextarea = (
    name,
    label,
    placeholder = "",
    rows = 4,
    icon = null
  ) => {
    const error = getFieldError(name);

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {icon && <span className="mr-2">{icon}</span>}
          {label}
        </label>
        <div className="relative">
          <textarea
            name={name}
            value={formData[name] || ""}
            onChange={onInputChange}
            placeholder={placeholder}
            rows={rows}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical ${
              error
                ? "border-red-500 bg-red-50"
                : "border-gray-300 focus:border-blue-500"
            }`}
          />
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Vehicle & Equipment Facilities */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Truck className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Vehicle & Equipment Facilities
            </h3>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {renderCheckbox(
              "weigh_bridge",
              "Weigh Bridge",
              <Scale className="h-4 w-4" />,
              "Electronic weighing system for vehicles"
            )}

            {renderCheckbox(
              "fuel_availability",
              "Fuel Availability",
              <Fuel className="h-4 w-4" />,
              "On-site fuel station for vehicles"
            )}

            {renderCheckbox(
              "truck_wash",
              "Truck Wash",
              <Truck className="h-4 w-4" />,
              "Vehicle cleaning and maintenance facility"
            )}

            {renderCheckbox(
              "truck_repair",
              "Truck Repair",
              <Wrench className="h-4 w-4" />,
              "On-site vehicle repair services"
            )}

            {renderCheckbox(
              "covered_area",
              "Covered Area",
              <Warehouse className="h-4 w-4" />,
              "Protected loading/unloading areas"
            )}

            {renderCheckbox(
              "loading_dock",
              "Loading Dock",
              <Settings className="h-4 w-4" />,
              "Dedicated vehicle docking stations"
            )}
          </div>
        </div>
      </div>

      {/* Operational Facilities */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Settings className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Operational Facilities
            </h3>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {renderCheckbox(
              "cold_storage",
              "Cold Storage",
              <Warehouse className="h-4 w-4" />,
              "Temperature-controlled storage facility"
            )}

            {renderCheckbox(
              "staff_quarters",
              "Staff Quarters",
              <Users className="h-4 w-4" />,
              "On-site accommodation for staff"
            )}

            {renderCheckbox(
              "material_handling_equip",
              "Material Handling Equipment",
              <Settings className="h-4 w-4" />,
              "Forklifts, cranes, and other equipment"
            )}

            {renderCheckbox(
              "twenty_four_seven_ops",
              "24/7 Operations",
              <Clock className="h-4 w-4" />,
              "Round-the-clock operational capability"
            )}
          </div>
        </div>
      </div>

      {/* Additional Facility Information */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Warehouse className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Additional Information
            </h3>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderTextarea(
              "special_facilities",
              "Special Facilities",
              "Describe any special facilities or unique features...",
              4,
              <Settings className="h-4 w-4 text-gray-400" />
            )}

            {renderTextarea(
              "equipment_details",
              "Equipment Details",
              "List specific equipment, capacity, and specifications...",
              4,
              <Wrench className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="p-1 bg-blue-100 rounded">
            <Settings className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-800 mb-1">
              Facility Configuration
            </h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Check all facilities available at this warehouse</li>
              <li>
                • Accurate facility information helps in proper resource
                allocation
              </li>
              <li>
                • Special facilities should include any unique capabilities
              </li>
              <li>
                • Equipment details help in capacity planning and operational
                efficiency
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilitiesEditTab;
