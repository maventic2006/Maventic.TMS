import React from "react";
import { Info, Gauge } from "lucide-react";
import { FUEL_TYPES, TRANSMISSION_TYPES, EMISSION_STANDARDS } from "../../../utils/vehicleConstants";

const SpecificationsTab = ({ formData, setFormData, errors }) => {
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [field]: value,
      },
    }));
  };

  const data = formData.specifications || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-xl flex items-center justify-center shadow-lg">
          <Gauge className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#0D1A33]">Vehicle Specifications</h2>
          <p className="text-sm text-gray-600">Enter technical specifications and engine details</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3 mb-6">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">Technical Specifications</p>
          <p>Enter accurate technical details for proper vehicle classification and performance tracking.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Engine Number */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Engine Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.engineNumber || ""}
            onChange={(e) => handleChange("engineNumber", e.target.value.toUpperCase())}
            placeholder="e.g., ENG123456789"
            className={`w-full px-4 py-2.5 border ${
              errors.engineNumber ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent`}
          />
          {errors.engineNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.engineNumber}</p>
          )}
        </div>

        {/* Engine Capacity */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Engine Capacity (CC)
          </label>
          <input
            type="number"
            value={data.engineCapacity || 0}
            onChange={(e) => handleChange("engineCapacity", parseFloat(e.target.value) || 0)}
            min="0"
            step="1"
            placeholder="e.g., 5700"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>

        {/* Fuel Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Fuel Type <span className="text-red-500">*</span>
          </label>
          <select
            value={data.fuelType || ""}
            onChange={(e) => handleChange("fuelType", e.target.value)}
            className={`w-full px-4 py-2.5 border ${
              errors.fuelType ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent`}
          >
            <option value="">Select Fuel Type</option>
            {FUEL_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.fuelType && <p className="mt-1 text-sm text-red-600">{errors.fuelType}</p>}
        </div>

        {/* Fuel Tank Capacity */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Fuel Tank Capacity (Liters)
          </label>
          <input
            type="number"
            value={data.fuelTankCapacity || 0}
            onChange={(e) => handleChange("fuelTankCapacity", parseFloat(e.target.value) || 0)}
            min="0"
            step="0.1"
            placeholder="e.g., 400"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>

        {/* Transmission */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Transmission <span className="text-red-500">*</span>
          </label>
          <select
            value={data.transmission || ""}
            onChange={(e) => handleChange("transmission", e.target.value)}
            className={`w-full px-4 py-2.5 border ${
              errors.transmission ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent`}
          >
            <option value="">Select Transmission</option>
            {TRANSMISSION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.transmission && <p className="mt-1 text-sm text-red-600">{errors.transmission}</p>}
        </div>

        {/* Number of Gears */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Number of Gears
          </label>
          <input
            type="number"
            value={data.noOfGears || 0}
            onChange={(e) => handleChange("noOfGears", parseInt(e.target.value) || 0)}
            min="0"
            max="20"
            step="1"
            placeholder="e.g., 6"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>

        {/* Wheelbase */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Wheelbase (MM)
          </label>
          <input
            type="number"
            value={data.wheelbase || 0}
            onChange={(e) => handleChange("wheelbase", parseFloat(e.target.value) || 0)}
            min="0"
            step="1"
            placeholder="e.g., 5300"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>

        {/* Number of Axles */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Number of Axles
          </label>
          <input
            type="number"
            value={data.noOfAxles || 0}
            onChange={(e) => handleChange("noOfAxles", parseInt(e.target.value) || 0)}
            min="0"
            max="10"
            step="1"
            placeholder="e.g., 2"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>

        {/* Emission Standard */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Emission Standard
          </label>
          <select
            value={data.emissionStandard || ""}
            onChange={(e) => handleChange("emissionStandard", e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          >
            <option value="">Select Emission Standard</option>
            {EMISSION_STANDARDS.map((standard) => (
              <option key={standard.value} value={standard.value}>
                {standard.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default SpecificationsTab;