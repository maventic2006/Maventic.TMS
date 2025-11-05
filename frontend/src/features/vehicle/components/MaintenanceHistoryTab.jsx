import React from "react";
import { Wrench, Info } from "lucide-react";

const MaintenanceHistoryTab = ({ formData, setFormData, errors }) => {
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      maintenanceHistory: {
        ...prev.maintenanceHistory,
        [field]: value,
      },
    }));
  };

  const data = formData.maintenanceHistory || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-xl flex items-center justify-center shadow-lg">
          <Wrench className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#0D1A33]">Maintenance History</h2>
          <p className="text-sm text-gray-600">Track service and maintenance records</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3 mb-6">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">Maintenance Tracking</p>
          <p>Record service dates and expenses for better vehicle lifecycle management.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Last Service Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Last Service Date
          </label>
          <input
            type="date"
            value={data.lastServiceDate || ""}
            onChange={(e) => handleChange("lastServiceDate", e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>

        {/* Next Service Due */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Next Service Due
          </label>
          <input
            type="date"
            value={data.nextServiceDue || ""}
            onChange={(e) => handleChange("nextServiceDue", e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>

        {/* Last Inspection Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Last Inspection Date
          </label>
          <input
            type="date"
            value={data.lastInspectionDate || ""}
            onChange={(e) => handleChange("lastInspectionDate", e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>

        {/* Total Service Expense */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Total Service Expense
          </label>
          <input
            type="number"
            value={data.totalServiceExpense || 0}
            onChange={(e) => handleChange("totalServiceExpense", parseFloat(e.target.value) || 0)}
            min="0"
            step="0.01"
            placeholder="e.g., 50000"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>

        {/* Maintenance Notes - Full Width */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Maintenance Notes
          </label>
          <textarea
            value={data.maintenanceNotes || ""}
            onChange={(e) => handleChange("maintenanceNotes", e.target.value)}
            rows={4}
            placeholder="Enter any maintenance notes, issues, or observations..."
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent resize-none"
          />
        </div>
      </div>
    </div>
  );
};

export default MaintenanceHistoryTab;