import React from "react";
import { Users, User, Building } from "lucide-react";

const MappingsViewTab = ({ vehicle, isEditMode }) => {
  if (isEditMode) {
    return (
      <div className="text-center py-12">
        <p className="text-[#4A5568]">Edit mode for Mappings coming soon...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-[#0D1A33]">Vehicle Mappings</h3>

      {/* Driver Mapping */}
      <div className="bg-[#F9FAFB] rounded-lg p-6">
        <h4 className="text-sm font-semibold text-[#0D1A33] mb-4 flex items-center gap-2">
          <User className="h-4 w-4 text-[#6366F1]" />
          Current Driver Assignment
        </h4>
        <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-[#E5E7EB]">
          <div className="p-2 bg-[#E0E7FF] rounded-lg">
            <User className="h-5 w-5 text-[#6366F1]" />
          </div>
          <div>
            <p className="font-semibold text-[#0D1A33]">{vehicle.currentDriver || "No driver assigned"}</p>
            <p className="text-sm text-[#4A5568]">Primary Driver</p>
          </div>
        </div>
      </div>

      {/* Transporter Mapping */}
      <div className="bg-[#F9FAFB] rounded-lg p-6">
        <h4 className="text-sm font-semibold text-[#0D1A33] mb-4 flex items-center gap-2">
          <Building className="h-4 w-4 text-[#6366F1]" />
          Transporter Association
        </h4>
        <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-[#E5E7EB]">
          <div className="p-2 bg-[#E0E7FF] rounded-lg">
            <Building className="h-5 w-5 text-[#6366F1]" />
          </div>
          <div>
            <p className="font-semibold text-[#0D1A33]">{vehicle.transporterName || "N/A"}</p>
            <p className="text-sm text-[#4A5568]">Transporter ID: {vehicle.transporterId || "N/A"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MappingsViewTab;
