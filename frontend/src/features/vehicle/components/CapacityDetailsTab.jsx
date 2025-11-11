import React from "react";
import { Package, Info } from "lucide-react";
import { useSelector } from "react-redux";
import { CustomSelect } from "../../../components/ui/Select";

const CapacityDetailsTab = ({ formData, setFormData, errors }) => {
  const { masterData } = useSelector((state) => state.vehicle);
  
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
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Unloading Weight */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Unloading Weight (KG) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={data.unladenWeight || 0}
            onChange={(e) => handleChange("unladenWeight", parseFloat(e.target.value) || 0)}
            min="0"
            step="0.01"
            placeholder="7000"
            className={`w-full px-3 py-2 text-sm border ${
              errors.unladenWeight ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent`}
          />
          {errors.unladenWeight && <p className="mt-1 text-xs text-red-600">{errors.unladenWeight}</p>}
        </div>

        {/* GVW (Gross Vehicle Weight) */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Gross Vehicle Weight (GVW) KG
          </label>
          <input
            type="number"
            value={data.gvw || ""}
            onChange={(e) => handleChange("gvw", parseFloat(e.target.value) || "")}
            min="0"
            step="0.01"
            placeholder="25000"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>

        {/* Payload Capacity (Calculated) */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Payload Capacity (KG)
            <span className="text-gray-400 text-xs ml-2">(Calculated)</span>
          </label>
          <input
            type="number"
            value={data.payloadCapacity || 0}
            readOnly
            placeholder="Auto-calculated: GVW - Unladen Weight"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>

        {/* Volume Capacity cubic meter (CFT) */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Volume Capacity (Cubic Meter/CFT)
          </label>
          <input
            type="number"
            value={data.volumeCapacity || ""}
            onChange={(e) => handleChange("volumeCapacity", parseFloat(e.target.value) || "")}
            min="0"
            step="0.01"
            placeholder="45"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>

        {/* Cargo Dimensions (Width) meter */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Cargo Dimensions (Width) - Meter
          </label>
          <input
            type="number"
            value={data.cargoWidth || ""}
            onChange={(e) => handleChange("cargoWidth", parseFloat(e.target.value) || "")}
            min="0"
            step="0.01"
            placeholder="2.5"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>

        {/* Cargo Dimensions (Height) meter */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Cargo Dimensions (Height) - Meter
          </label>
          <input
            type="number"
            value={data.cargoHeight || ""}
            onChange={(e) => handleChange("cargoHeight", parseFloat(e.target.value) || "")}
            min="0"
            step="0.01"
            placeholder="3"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>

        {/* Cargo Dimensions (Length) meter */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Cargo Dimensions (Length) - Meter
          </label>
          <input
            type="number"
            value={data.cargoLength || ""}
            onChange={(e) => handleChange("cargoLength", parseFloat(e.target.value) || "")}
            min="0"
            step="0.01"
            placeholder="10"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>

        {/* Towing Capacity */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Towing Capacity (KG)
          </label>
          <input
            type="number"
            value={data.towingCapacity || ""}
            onChange={(e) => handleChange("towingCapacity", parseFloat(e.target.value) || "")}
            min="0"
            step="0.01"
            placeholder="5000"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>

        {/* Tire Load Rating */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Tire Load Rating (KG/LBS per tire)
          </label>
          <input
            type="number"
            value={data.tireLoadRating || ""}
            onChange={(e) => handleChange("tireLoadRating", parseFloat(e.target.value) || "")}
            min="0"
            step="0.01"
            placeholder="1500"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>

        {/* Vehicle Condition */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Vehicle Condition
          </label>
          <CustomSelect
            value={data.vehicleCondition || ""}
            onChange={(value) => handleChange("vehicleCondition", value)}
            options={masterData.vehicleConditions || []}
            placeholder="Select Condition"
            className="w-full"
          />
        </div>

        {/* Fuel Tank Capacity */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Fuel Tank Capacity (Liters)
          </label>
          <input
            type="number"
            value={data.fuelTankCapacity || ""}
            onChange={(e) => handleChange("fuelTankCapacity", parseFloat(e.target.value) || "")}
            min="0"
            step="0.1"
            placeholder="400"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>

        {/* Seating Capacity */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Seating Capacity
          </label>
          <input
            type="number"
            value={data.seatingCapacity || ""}
            onChange={(e) => handleChange("seatingCapacity", parseInt(e.target.value) || "")}
            min="0"
            step="1"
            placeholder="2"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>
      </div>

      {/* Info Panel at Bottom */}
      <div className="mt-6 bg-blue-50/50 border border-blue-200/50 rounded-lg p-3 flex items-start gap-2">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-blue-800">
          <p className="font-semibold mb-1">Vehicle Capacity Details</p>
          <p>Payload capacity is auto-calculated as: GVW - Unloading Weight. Enter cargo dimensions in meters.</p>
        </div>
      </div>
    </div>
  );
};

export default CapacityDetailsTab;