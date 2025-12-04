import React, { useState } from "react";
import { Wrench, Calendar, DollarSign, FileText, Plus, X } from "lucide-react";
import CollapsibleSection from "../../../components/ui/CollapsibleSection";
import { formatDate } from "../../../utils/helpers";

const InfoField = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-xs font-semibold text-[#4A5568] uppercase tracking-wide">
      {label}
    </p>
    <p className="text-sm font-medium text-[#0D1A33]">{value || "N/A"}</p>
  </div>
);

const MaintenanceViewTab = ({ vehicle, isEditMode }) => {
  if (isEditMode) {
    return (
      <div className="text-center py-12">
        <p className="text-[#4A5568]">
          Edit mode for Maintenance History coming soon...
        </p>
      </div>
    );
  }

  // Get maintenance history array from vehicle object
  const maintenanceHistory = vehicle?.maintenanceHistory || [];

  return (
    <div className="space-y-6">
      {maintenanceHistory.length === 0 ? (
        <div className="text-center py-12">
          <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">
            No Maintenance Records Found
          </h3>
          <p className="text-gray-400">
            No maintenance history has been recorded yet.
          </p>
        </div>
      ) : (
        maintenanceHistory.map((record, index) => (
          <CollapsibleSection
            key={index}
            defaultOpen={index === 0}
            gradientFrom="orange-50/50"
            gradientTo="red-50/50"
            borderColor="orange-100/50"
            header={
              <div className="flex items-center justify-between w-full text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                    <Wrench className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {record.serviceType || `Maintenance Record ${index + 1}`}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(record.serviceDate)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">
                    {record.cost ? `₹${record.cost}` : "Cost Not Specified"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {record.serviceCenter || "Service Center Not Specified"}
                  </p>
                </div>
              </div>
            }
          >
            {/* Service Information - matching create page fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Service Type
                </label>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
                  <p className="text-gray-800">{record.serviceType || "N/A"}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Service Date
                </label>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <p className="text-gray-800">{formatDate(record.serviceDate)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Odometer Reading (km)
                </label>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
                  <p className="text-gray-800">{record.odometerReading || "N/A"}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Service Center
                </label>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
                  <p className="text-gray-800">{record.serviceCenter || "N/A"}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Technician
                </label>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
                  <p className="text-gray-800">{record.technician || "N/A"}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Cost
                </label>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <p className="text-gray-800">
                    {record.cost ? `₹${record.cost}` : "N/A"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Description
                </label>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
                  <p className="text-gray-800">{record.description || "N/A"}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Parts Replaced
                </label>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
                  <p className="text-gray-800">{record.partsReplaced || "N/A"}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Next Service Due
                </label>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <p className="text-gray-800">{formatDate(record.nextServiceDue)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Invoice Number
                </label>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <p className="text-gray-800">{record.invoiceNumber || "N/A"}</p>
                </div>
              </div>
            </div>
          </CollapsibleSection>
        ))
      )}
    </div>
  );
};

export default MaintenanceViewTab;