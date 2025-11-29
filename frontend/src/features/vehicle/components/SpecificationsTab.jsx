import React from "react";
import { Info, Gauge } from "lucide-react";
import { TRANSMISSION_TYPES, EMISSION_STANDARDS, SUSPENSION_TYPES } from "../../../utils/vehicleConstants";
import { CustomSelect } from "../../../components/ui/Select";

const SpecificationsTab = ({ formData, setFormData, errors, masterData }) => {
  const handleChange = (field, value) => {
    // �️ Additional validation for fuel type to ensure only valid IDs
    if (field === 'fuelType' && value && !value.startsWith('FT')) {
      console.warn("⚠️  Invalid fuel type value rejected:", value);
      return;
    }
    
    setFormData((prev) => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [field]: value,
      },
    }));
  };

  const data = formData.specifications || {};

  // ✅ USE MASTER DATA FROM API - NOT HARDCODED CONSTANTS
  const engineTypes = masterData?.engineTypes || [
    { value: 'ET001', label: 'BS4' },
    { value: 'ET002', label: 'BS6' },
    { value: 'ET003', label: 'EURO5' },
    { value: 'ET004', label: 'EURO6' }
  ];

  // ✅ USE MASTER DATA FROM API - ENHANCED WITH VALIDATION
  const fuelTypes = masterData?.fuelTypes || [
    { value: 'FT001', label: 'DIESEL' },
    { value: 'FT002', label: 'CNG' },
    { value: 'FT003', label: 'ELECTRIC' },
    { value: 'FT004', label: 'PETROL' }
  ];

  return (
    <div className="space-y-5">
      {/* 3-column grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Engine Type - CHANGED TO DROPDOWN */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Engine Type <span className="text-red-500">*</span>
          </label>
          <CustomSelect
            value={data.engineType || ""}
            onChange={(value) => handleChange("engineType", value)}
            options={engineTypes}
            placeholder="Select Engine Type"
            error={errors.engineType}
            className="w-full"
          />
          {errors.engineType && (
            <p className="mt-1 text-xs text-red-600">{errors.engineType}</p>
          )}
        </div>

        {/* Engine Number */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Engine Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.engineNumber || ""}
            onChange={(e) => handleChange("engineNumber", e.target.value.toUpperCase())}
            placeholder="ENG123456789"
            className={`w-full px-3 py-2 text-sm border ${
              errors.engineNumber ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent`}
          />
          {errors.engineNumber && (
            <p className="mt-1 text-xs text-red-600">{errors.engineNumber}</p>
          )}
        </div>

        {/* Body Type Description */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Body Type Description
          </label>
          <input
            type="text"
            value={data.bodyTypeDescription || ""}
            onChange={(e) => handleChange("bodyTypeDescription", e.target.value)}
            placeholder="e.g., Flatbed, Container, Tanker"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>

        {/* Fuel Type */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Fuel Type <span className="text-red-500">*</span>
          </label>
          <CustomSelect
            value={data.fuelType || ""}
            onChange={(value) => {
              // �️ Final validation layer - ensure only valid fuel type IDs pass through
              if (value && !value.startsWith('FT')) {
                console.warn("⚠️  Invalid fuel type value detected in dropdown:", value);
                return;
              }
              handleChange("fuelType", value);
            }}
            options={fuelTypes}
            placeholder="Select Type"
            error={errors.fuelType}
            className="w-full"
          />
          {errors.fuelType && <p className="mt-1 text-xs text-red-600">{errors.fuelType}</p>}
        </div>

        {/* Transmission Type */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Transmission Type <span className="text-red-500">*</span>
          </label>
          <CustomSelect
            value={data.transmission || ""}
            onChange={(value) => handleChange("transmission", value)}
            options={TRANSMISSION_TYPES}
            placeholder="Select"
            error={errors.transmission}
            className="w-full"
          />
          {errors.transmission && <p className="mt-1 text-xs text-red-600">{errors.transmission}</p>}
        </div>

        {/* Color */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Color
          </label>
          <input
            type="text"
            value={data.color || ""}
            onChange={(e) => handleChange("color", e.target.value)}
            placeholder="e.g., White, Blue"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>

        {/* Emission Standard */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Emission Standard
          </label>
          <CustomSelect
            value={data.emissionStandard || ""}
            onChange={(value) => handleChange("emissionStandard", value)}
            options={EMISSION_STANDARDS}
            placeholder="Select Standard"
            className="w-full"
          />
        </div>

        {/* Financer */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Financer <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.financer || ""}
            onChange={(e) => handleChange("financer", e.target.value)}
            placeholder="e.g., HDFC Bank, ICICI Bank"
            className={`w-full px-3 py-2 text-sm border ${
              errors.financer ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent`}
          />
          {errors.financer && <p className="mt-1 text-xs text-red-600">{errors.financer}</p>}
        </div>

        {/* Suspension Type */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Suspension Type <span className="text-red-500">*</span>
          </label>
          <CustomSelect
            value={data.suspensionType || ""}
            onChange={(value) => handleChange("suspensionType", value)}
            options={SUSPENSION_TYPES}
            placeholder="Select Suspension Type"
            error={errors.suspensionType}
            className="w-full"
          />
          {errors.suspensionType && <p className="mt-1 text-xs text-red-600">{errors.suspensionType}</p>}
        </div>
      </div>

      {/* Information panel at the bottom */}
      <div className="mt-6 bg-blue-50/50 border border-blue-200/50 rounded-lg p-3 flex items-start gap-2">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-blue-800">
          <p className="font-semibold mb-0.5">Vehicle Specifications</p>
          <p className="text-blue-700">Enter accurate technical specifications for proper vehicle classification. Fields marked with * are mandatory.</p>
        </div>
      </div>
    </div>
  );
};

export default SpecificationsTab;