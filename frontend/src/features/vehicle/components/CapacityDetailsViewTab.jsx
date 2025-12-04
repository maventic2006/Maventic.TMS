import React from "react";
import { Package, Scale } from "lucide-react";

const InfoField = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-xs font-semibold text-[#4A5568] uppercase tracking-wide">
      {label}
    </p>
    <p className="text-sm font-medium text-[#0D1A33]">{value || "N/A"}</p>
  </div>
);

const CapacityDetailsViewTab = ({ vehicle, isEditMode }) => {
  if (isEditMode) {
    return (
      <div className="text-center py-12">
        <p className="text-[#4A5568]">Edit mode for Capacity Details coming soon...</p>
      </div>
    );
  }

  // Get capacity details from vehicle object  
  // The transformed vehicle data is flattened, so we access properties directly from vehicle
  const capacity = vehicle || {};

  return (
    <div className="space-y-6">
      {/* Weight & Load Capacity - 3 Column Grid */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#E5E7EB]">
          <Scale className="h-5 w-5 text-[#6366F1]" />
          <h4 className="text-sm font-bold text-[#0D1A33] uppercase tracking-wide">
            Weight & Load Capacity
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
          <InfoField label="GVW (Gross Vehicle Weight) (kg)" value={capacity.gvw} />
          <InfoField label="Unladen Weight (kg)" value={capacity.unladenWeight} />
          <InfoField label="Payload Capacity (kg)" value={capacity.payloadCapacity} />
          <InfoField label="Seating Capacity" value={capacity.seatingCapacity} />
          <InfoField label="Towing Capacity (kg)" value={capacity.towingCapacity} />
          <InfoField label="Vehicle Condition" value={capacity.vehicleCondition} />
        </div>
      </div>

      {/* Volume & Dimensions - 3 Column Grid */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#E5E7EB]">
          <Package className="h-5 w-5 text-[#6366F1]" />
          <h4 className="text-sm font-bold text-[#0D1A33] uppercase tracking-wide">
            Volume & Dimensions
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
          <InfoField 
            label="Loading Capacity Volume" 
            value={capacity.loadingCapacityVolume ? `${capacity.loadingCapacityVolume} ${capacity.loadingCapacityUnit || 'CBM'}` : "N/A"} 
          />
          <InfoField label="Cargo Length (m)" value={capacity.cargoLength} />
          <InfoField label="Cargo Width (m)" value={capacity.cargoWidth} />
          <InfoField label="Cargo Height (m)" value={capacity.cargoHeight} />
          <InfoField label="Door Type" value={capacity.doorType} />
          <InfoField label="No. of Pallets" value={capacity.noOfPallets} />
        </div>
      </div>
    </div>
  );
};

export default CapacityDetailsViewTab;