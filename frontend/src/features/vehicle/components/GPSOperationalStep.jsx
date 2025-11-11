import React from "react";
import { Satellite, Info } from "lucide-react";
import { GPS_PROVIDER_OPTIONS } from "../../../utils/vehicleConstants";
import { CustomSelect } from "../../../components/ui/Select";

const GPSOperationalStep = ({ formData, setFormData, errors }) => {
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-xl flex items-center justify-center shadow-lg">
          <Satellite className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#0D1A33]">GPS & Operational</h2>
          <p className="text-sm text-gray-600">Configure GPS tracker and operational details</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3 mb-6">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">GPS Tracking</p>
          <p>Enable GPS tracking for real-time vehicle monitoring and route optimization. GPS device ID and provider are required when GPS is enabled.</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 className="text-md font-semibold text-gray-800 mb-4">GPS Tracker Configuration</h3>
        
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={formData.gpsEnabled}
                onChange={(e) => handleChange("gpsEnabled", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#10B981] peer-focus:ring-2 peer-focus:ring-[#10B981] peer-focus:ring-offset-2 transition-all"></div>
              <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md peer-checked:translate-x-5 transition-transform"></div>
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-700">Enable GPS Tracking</span>
              <p className="text-xs text-gray-500">Turn on to track vehicle location in real-time</p>
            </div>
          </label>
        </div>

        {formData.gpsEnabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 border-t border-gray-200 pt-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                GPS Device ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.gpsDeviceId}
                onChange={(e) => handleChange("gpsDeviceId", e.target.value.toUpperCase())}
                placeholder="e.g., GPS001, IMEI123456789"
                className={`w-full px-4 py-2.5 border ${
                  errors.gpsDeviceId ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent`}
              />
              {errors.gpsDeviceId && <p className="mt-1 text-sm text-red-600">{errors.gpsDeviceId}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                GPS Provider <span className="text-red-500">*</span>
              </label>
              <CustomSelect
                value={formData.gpsProvider}
                onChange={(value) => handleChange("gpsProvider", value)}
                options={GPS_PROVIDER_OPTIONS}
                placeholder="Select GPS Provider"
                error={errors.gpsProvider}
                className="w-full"
              />
              {errors.gpsProvider && <p className="mt-1 text-sm text-red-600">{errors.gpsProvider}</p>}
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-md font-semibold text-gray-800 mb-4">Operational Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Current Driver <span className="text-gray-400">(Optional)</span>
            </label>
            <input
              type="text"
              value={formData.currentDriver}
              onChange={(e) => handleChange("currentDriver", e.target.value)}
              placeholder="e.g., John Doe"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">Assign a driver to this vehicle (can be updated later)</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Created By <span className="text-gray-400">(Auto-filled)</span>
            </label>
            <input
              type="text"
              value={formData.createdBy}
              disabled
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GPSOperationalStep;
