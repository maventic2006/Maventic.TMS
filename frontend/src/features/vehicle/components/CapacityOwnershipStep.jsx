import React from "react";
import { Package, Info } from "lucide-react";
import { OWNERSHIP_TYPES, CAPACITY_UNITS } from "../../../utils/vehicleConstants";

const CapacityOwnershipStep = ({ formData, setFormData, errors }) => {
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCapacityChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      capacity: { ...prev.capacity, [field]: value },
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-xl flex items-center justify-center shadow-lg">
          <Package className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#0D1A33]">Capacity & Ownership</h2>
          <p className="text-sm text-gray-600">Enter load capacity and ownership information</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3 mb-6">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">Capacity Information</p>
          <p>Weight capacity is mandatory. Volume capacity is optional but recommended for accurate load planning.</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 className="text-md font-semibold text-gray-800 mb-4">Capacity Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Weight Capacity <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={formData.capacity.weight}
                onChange={(e) => handleCapacityChange("weight", parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                placeholder="e.g., 18"
                className={`flex-1 px-4 py-2.5 border ${
                  errors.capacity ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent`}
              />
              <select
                value={formData.capacity.unit}
                onChange={(e) => handleCapacityChange("unit", e.target.value)}
                className="w-32 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
              >
                {CAPACITY_UNITS.weight.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>
            {errors.capacity && <p className="mt-1 text-sm text-red-600">{errors.capacity}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Volume Capacity <span className="text-gray-400">(Optional)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={formData.capacity.volume}
                onChange={(e) => handleCapacityChange("volume", parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                placeholder="e.g., 45"
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
              />
              <select
                value={formData.capacity.volumeUnit}
                onChange={(e) => handleCapacityChange("volumeUnit", e.target.value)}
                className="w-32 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
              >
                {CAPACITY_UNITS.volume.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-md font-semibold text-gray-800 mb-4">Ownership Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ownership Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.ownership}
              onChange={(e) => handleChange("ownership", e.target.value)}
              className={`w-full px-4 py-2.5 border ${
                errors.ownership ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent`}
            >
              <option value="">Select Ownership Type</option>
              {OWNERSHIP_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.ownership && <p className="mt-1 text-sm text-red-600">{errors.ownership}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Owner Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.ownerName}
              onChange={(e) => handleChange("ownerName", e.target.value)}
              placeholder="e.g., ABC Transport Pvt Ltd"
              className={`w-full px-4 py-2.5 border ${
                errors.ownerName ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent`}
            />
            {errors.ownerName && <p className="mt-1 text-sm text-red-600">{errors.ownerName}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Transporter ID <span className="text-gray-400">(Optional)</span>
            </label>
            <input
              type="text"
              value={formData.transporterId}
              onChange={(e) => handleChange("transporterId", e.target.value.toUpperCase())}
              placeholder="e.g., TR001"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Transporter Name <span className="text-gray-400">(Optional)</span>
            </label>
            <input
              type="text"
              value={formData.transporterName}
              onChange={(e) => handleChange("transporterName", e.target.value)}
              placeholder="e.g., ABC Transport"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CapacityOwnershipStep;
