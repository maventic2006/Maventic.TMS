import React from "react";
import { Calendar, Info } from "lucide-react";

const ServiceFrequencyTab = ({ formData, setFormData, errors }) => {
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      serviceFrequency: {
        ...prev.serviceFrequency,
        [field]: value,
      },
    }));
  };

  const data = formData.serviceFrequency || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-xl flex items-center justify-center shadow-lg">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#0D1A33]">Service Frequency</h2>
          <p className="text-sm text-gray-600">Define service and inspection schedules</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3 mb-6">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">Schedule Configuration</p>
          <p>Set up service intervals based on kilometers traveled or time periods for automated reminders.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Service Interval KM */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Service Interval (KM)
          </label>
          <input
            type="number"
            value={data.serviceIntervalKM || 0}
            onChange={(e) => handleChange("serviceIntervalKM", parseInt(e.target.value) || 0)}
            min="0"
            step="1000"
            placeholder="e.g., 10000"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500">Service required every X kilometers</p>
        </div>

        {/* Service Interval Months */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Service Interval (Months)
          </label>
          <input
            type="number"
            value={data.serviceIntervalMonths || 0}
            onChange={(e) => handleChange("serviceIntervalMonths", parseInt(e.target.value) || 0)}
            min="0"
            max="60"
            step="1"
            placeholder="e.g., 6"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500">Service required every X months</p>
        </div>

        {/* Inspection Frequency Months */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Inspection Frequency (Months)
          </label>
          <input
            type="number"
            value={data.inspectionFrequencyMonths || 0}
            onChange={(e) => handleChange("inspectionFrequencyMonths", parseInt(e.target.value) || 0)}
            min="0"
            max="60"
            step="1"
            placeholder="e.g., 12"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500">Inspection required every X months</p>
        </div>
      </div>

      {/* Info Panel for Service Scheduling */}
      <div className="bg-gray-50 rounded-lg p-6 mt-8">
        <h3 className="text-md font-semibold text-gray-800 mb-3">Service Scheduling Rules</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-[#10B981] font-bold">•</span>
            <span>Service will be triggered whichever comes first - KM interval or time interval</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#10B981] font-bold">•</span>
            <span>Inspection frequency is independent and typically based on regulatory requirements</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#10B981] font-bold">•</span>
            <span>System will send automated reminders 7 days before the service/inspection is due</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ServiceFrequencyTab;