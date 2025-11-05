import React from "react";
import { Package, Info } from "lucide-react";
import { CAPACITY_UNITS, DOOR_TYPES } from "../../../utils/vehicleConstants";

const CapacityDetailsTab = ({ formData, setFormData, errors }) => {
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      capacityDetails: {
        ...prev.capacityDetails,
        [field]: value,
      },
    }));
  };

  const data = formData.capacityDetails || {};

  // Auto-calculate payload capacity when GVW or unladen weight changes
  React.useEffect(() => {
    const gvw = data.gvw || 0;
    const unladenWeight = data.unladenWeight || 0;
    const calculatedPayload = gvw - unladenWeight;
    
    if (calculatedPayload !== data.payloadCapacity && gvw > 0 && unladenWeight > 0) {
      handleChange("payloadCapacity", calculatedPayload);
    }
  }, [data.gvw, data.unladenWeight]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-xl flex items-center justify-center shadow-lg">
          <Package className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#0D1A33]">Capacity Details</h2>
          <p className="text-sm text-gray-600">Enter vehicle load capacity and cargo dimensions</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3 mb-6">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">Capacity Information</p>
          <p>Payload capacity will be automatically calculated: Payload = GVW - Unladen Weight</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* GVW (Gross Vehicle Weight) */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            GVW - Gross Vehicle Weight (KG) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={data.gvw || 0}
            onChange={(e) => handleChange("gvw", parseFloat(e.target.value) || 0)}
            min="0"
            step="0.01"
            placeholder="e.g., 25000"
            className={`w-full px-4 py-2.5 border ${
              errors.gvw ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent`}
          />
          {errors.gvw && <p className="mt-1 text-sm text-red-600">{errors.gvw}</p>}
        </div>

        {/* Unladen Weight */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Unladen Weight (KG) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={data.unladenWeight || 0}
            onChange={(e) => handleChange("unladenWeight", parseFloat(e.target.value) || 0)}
            min="0"
            step="0.01"
            placeholder="e.g., 7000"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>

        {/* Payload Capacity (Auto-calculated) */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Payload Capacity (KG) <span className="text-red-500">*</span>
            <span className="text-gray-400 text-xs ml-2">(Auto-calculated)</span>
          </label>
          <input
            type="number"
            value={data.payloadCapacity || 0}
            onChange={(e) => handleChange("payloadCapacity", parseFloat(e.target.value) || 0)}
            min="0"
            step="0.01"
            placeholder="Auto-calculated"
            className={`w-full px-4 py-2.5 border ${
              errors.payloadCapacity ? "border-red-500" : "border-gray-300"
            } rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent`}
          />
          {errors.payloadCapacity && (
            <p className="mt-1 text-sm text-red-600">{errors.payloadCapacity}</p>
          )}
        </div>

        {/* Loading Capacity (Volume) */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Loading Capacity (Volume)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={data.loadingCapacityVolume || 0}
              onChange={(e) => handleChange("loadingCapacityVolume", parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
              placeholder="e.g., 45"
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
            />
            <select
              value={data.loadingCapacityUnit || "CBM"}
              onChange={(e) => handleChange("loadingCapacityUnit", e.target.value)}
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

        {/* Cargo Length */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Cargo Length (Feet)
          </label>
          <input
            type="number"
            value={data.cargoLength || 0}
            onChange={(e) => handleChange("cargoLength", parseFloat(e.target.value) || 0)}
            min="0"
            step="0.01"
            placeholder="e.g., 20"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>

        {/* Cargo Width */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Cargo Width (Feet)
          </label>
          <input
            type="number"
            value={data.cargoWidth || 0}
            onChange={(e) => handleChange("cargoWidth", parseFloat(e.target.value) || 0)}
            min="0"
            step="0.01"
            placeholder="e.g., 8"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>

        {/* Cargo Height */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Cargo Height (Feet)
          </label>
          <input
            type="number"
            value={data.cargoHeight || 0}
            onChange={(e) => handleChange("cargoHeight", parseFloat(e.target.value) || 0)}
            min="0"
            step="0.01"
            placeholder="e.g., 8"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>

        {/* Door Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Door Type
          </label>
          <select
            value={data.doorType || ""}
            onChange={(e) => handleChange("doorType", e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          >
            <option value="">Select Door Type</option>
            {DOOR_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Number of Pallets */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Number of Pallets
          </label>
          <input
            type="number"
            value={data.noOfPallets || 0}
            onChange={(e) => handleChange("noOfPallets", parseInt(e.target.value) || 0)}
            min="0"
            step="1"
            placeholder="e.g., 26"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
};

export default CapacityDetailsTab;