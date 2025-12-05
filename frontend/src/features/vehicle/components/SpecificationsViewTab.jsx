import React from "react";
import { Settings, Wrench, Zap } from "lucide-react";

const InfoField = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-xs font-semibold text-[#4A5568] uppercase tracking-wide">
      {label}
    </p>
    <p className="text-sm font-medium text-[#0D1A33]">{value || "N/A"}</p>
  </div>
);

const SpecificationsViewTab = ({ vehicle, isEditMode }) => {
  if (isEditMode) {
    return (
      <div className="text-center py-12">
        <p className="text-[#4A5568]">Edit mode for Specifications coming soon...</p>
      </div>
    );
  }

  // Get specifications data from vehicle object
  // The transformed vehicle data is flattened, so we access properties directly from vehicle
  const specs = vehicle || {};

  return (
    <div className="space-y-6">
      {/* Engine & Performance - 3 Column Grid */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#E5E7EB]">
          <Zap className="h-5 w-5 text-[#6366F1]" />
          <h4 className="text-sm font-bold text-[#0D1A33] uppercase tracking-wide">
            Engine & Performance
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
          <InfoField label="Engine Number" value={specs.engineNumber} />
          <InfoField label="Engine Type" value={specs.engineType} />
          <InfoField label="Fuel Type" value={specs.fuelType} />
          <InfoField label="Fuel Tank Capacity (L)" value={specs.fuelTankCapacity} />
          <InfoField label="Transmission Type" value={specs.transmission} />
          <InfoField label="No. of Gears" value={specs.noOfGears} />
          <InfoField label="Emission Standard" value={specs.emissionStandard} />
          <InfoField label="Financer" value={specs.financer} />
          <InfoField label="Suspension Type" value={specs.suspensionType} />
        </div>
      </div>

      {/* Technical Specifications - 3 Column Grid */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#E5E7EB]">
          <Wrench className="h-5 w-5 text-[#6366F1]" />
          <h4 className="text-sm font-bold text-[#0D1A33] uppercase tracking-wide">
            Technical Specifications
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
          <InfoField label="Wheelbase (mm)" value={specs.wheelbase} />
          <InfoField label="No. of Axles" value={specs.noOfAxles} />
        </div>
      </div>
    </div>
  );
};

export default SpecificationsViewTab;