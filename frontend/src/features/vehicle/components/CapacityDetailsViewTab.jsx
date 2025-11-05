import React from "react";
import { Package, Weight, Box, Ruler, TrendingUp } from "lucide-react";

const InfoField = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-xs font-semibold text-[#4A5568] uppercase tracking-wide">{label}</p>
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

  const capacity = vehicle.capacity || {};

  return (
    <div className="space-y-6">
      {/* <div className="pb-4 border-b border-[#E5E7EB]">
        <h3 className="text-lg font-bold text-[#0D1A33]">Vehicle Capacity Details</h3>
        <p className="text-sm text-[#4A5568] mt-1">Load capacity, dimensions, and cargo specifications</p>
      </div> */}

      {/* Weight Capacity */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#E5E7EB]">
          <Weight className="h-5 w-5 text-[#6366F1]" />
          <h4 className="text-sm font-bold text-[#0D1A33] uppercase tracking-wide">Weight Capacity</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
          <InfoField label="Payload Capacity (kg)" value={vehicle.payloadCapacity} />
          <InfoField label="Gross Vehicle Weight (kg)" value={vehicle.grossVehicleWeight} />
          <InfoField label="Kerb Weight (kg)" value={vehicle.kerbWeight} />
          <InfoField label="Unladen Weight (kg)" value={vehicle.unladenWeight} />
          <InfoField label="Max Laden Weight (kg)" value={vehicle.maxLadenWeight} />
          <InfoField label="Towing Capacity (kg)" value={vehicle.towingCapacity} />
        </div>
      </div>

      {/* Volume Capacity */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#E5E7EB]">
          <Box className="h-5 w-5 text-[#6366F1]" />
          <h4 className="text-sm font-bold text-[#0D1A33] uppercase tracking-wide">Volume Capacity</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
          <InfoField label="Cargo Volume (m³)" value={vehicle.cargoVolume} />
          <InfoField label="Cargo Volume (ft³)" value={vehicle.cargoVolumeCubicFeet} />
          <InfoField label="Number of Pallets" value={vehicle.numberOfPallets} />
        </div>
      </div>

      {/* Dimensional Capacity */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#E5E7EB]">
          <Ruler className="h-5 w-5 text-[#6366F1]" />
          <h4 className="text-sm font-bold text-[#0D1A33] uppercase tracking-wide">Cargo Dimensions</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
          <InfoField label="Cargo Length (m)" value={vehicle.cargoLength} />
          <InfoField label="Cargo Width (m)" value={vehicle.cargoWidth} />
          <InfoField label="Cargo Height (m)" value={vehicle.cargoHeight} />
          <InfoField label="Loading Platform Height (m)" value={vehicle.loadingPlatformHeight} />
          <InfoField label="Door Width (m)" value={vehicle.doorWidth} />
          <InfoField label="Door Height (m)" value={vehicle.doorHeight} />
        </div>
      </div>

      {/* Overall Vehicle Dimensions */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#E5E7EB]">
          <Package className="h-5 w-5 text-[#6366F1]" />
          <h4 className="text-sm font-bold text-[#0D1A33] uppercase tracking-wide">Overall Vehicle Dimensions</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
          <InfoField label="Overall Length (m)" value={vehicle.overallLength} />
          <InfoField label="Overall Width (m)" value={vehicle.overallWidth} />
          <InfoField label="Overall Height (m)" value={vehicle.overallHeight} />
          <InfoField label="Wheelbase (m)" value={vehicle.wheelbase} />
          <InfoField label="Ground Clearance (mm)" value={vehicle.groundClearance} />
          <InfoField label="Track Width Front (mm)" value={vehicle.trackWidthFront} />
          <InfoField label="Track Width Rear (mm)" value={vehicle.trackWidthRear} />
        </div>
      </div>

      {/* Seating & Passenger Capacity */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#E5E7EB]">
          <TrendingUp className="h-5 w-5 text-[#6366F1]" />
          <h4 className="text-sm font-bold text-[#0D1A33] uppercase tracking-wide">Seating & Capacity</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
          <InfoField label="Seating Capacity" value={vehicle.seatingCapacity} />
          <InfoField label="Number of Doors" value={vehicle.numberOfDoors} />
          <InfoField label="Number of Axles" value={vehicle.numberOfAxles} />
          <InfoField label="Number of Wheels" value={vehicle.numberOfWheels} />
        </div>
      </div>

      {/* Special Features */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#E5E7EB]">
          <Package className="h-5 w-5 text-[#6366F1]" />
          <h4 className="text-sm font-bold text-[#0D1A33] uppercase tracking-wide">Special Features</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
          <InfoField label="Tail Lift Available" value={vehicle.tailLiftAvailable ? "Yes" : "No"} />
          <InfoField label="Tail Lift Capacity (kg)" value={vehicle.tailLiftCapacity} />
          <InfoField label="Temperature Control" value={vehicle.temperatureControl ? "Yes" : "No"} />
          <InfoField label="Min Temperature (°C)" value={vehicle.minTemperature} />
          <InfoField label="Max Temperature (°C)" value={vehicle.maxTemperature} />
          <InfoField label="Reefer Unit Type" value={vehicle.reeferUnitType} />
        </div>
      </div>
    </div>
  );
};

export default CapacityDetailsViewTab;
