import React from "react";
import { Settings, Gauge, Fuel, Zap, Activity, Thermometer } from "lucide-react";

const InfoField = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-xs font-semibold text-[#4A5568] uppercase tracking-wide">{label}</p>
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

  return (
    <div className="space-y-6">
      {/* <div className="pb-4 border-b border-[#E5E7EB]">
        <h3 className="text-lg font-bold text-[#0D1A33]">Vehicle Specifications</h3>
        <p className="text-sm text-[#4A5568] mt-1">Detailed technical specifications and performance metrics</p>
      </div> */}

      {/* Engine Specifications */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#E5E7EB]">
          <Zap className="h-5 w-5 text-[#6366F1]" />
          <h4 className="text-sm font-bold text-[#0D1A33] uppercase tracking-wide">Engine Specifications</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
          <InfoField label="Engine Number" value={vehicle.engineNumber} />
          <InfoField label="Engine Type" value={vehicle.engineType} />
          <InfoField label="Engine Capacity (cc)" value={vehicle.engineCapacity} />
          <InfoField label="Max Power (HP)" value={vehicle.maxPower} />
          <InfoField label="Max Torque (Nm)" value={vehicle.maxTorque} />
          <InfoField label="Number of Cylinders" value={vehicle.numberOfCylinders} />
          <InfoField label="Valves per Cylinder" value={vehicle.valvesPerCylinder} />
          <InfoField label="Fuel System" value={vehicle.fuelSystem} />
          <InfoField label="Aspiration Type" value={vehicle.aspirationType} />
        </div>
      </div>

      {/* Fuel & Emission */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#E5E7EB]">
          <Fuel className="h-5 w-5 text-[#6366F1]" />
          <h4 className="text-sm font-bold text-[#0D1A33] uppercase tracking-wide">Fuel & Emission</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
          <InfoField label="Fuel Type" value={vehicle.fuelType} />
          <InfoField label="Fuel Tank Capacity (L)" value={vehicle.fuelCapacity} />
          <InfoField label="Mileage (km/l)" value={vehicle.mileage} />
          <InfoField label="Emission Standard" value={vehicle.emissionStandard} />
          <InfoField label="Emission Level" value={vehicle.emissionLevel} />
          <InfoField label="PUC Valid Until" value={vehicle.pucValidUntil} />
        </div>
      </div>

      {/* Transmission & Drivetrain */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#E5E7EB]">
          <Gauge className="h-5 w-5 text-[#6366F1]" />
          <h4 className="text-sm font-bold text-[#0D1A33] uppercase tracking-wide">Transmission & Drivetrain</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
          <InfoField label="Transmission Type" value={vehicle.transmission} />
          <InfoField label="Number of Gears" value={vehicle.numberOfGears} />
          <InfoField label="Drive Type" value={vehicle.driveType} />
          <InfoField label="Gear Ratio" value={vehicle.gearRatio} />
          <InfoField label="Differential Type" value={vehicle.differentialType} />
          <InfoField label="Clutch Type" value={vehicle.clutchType} />
        </div>
      </div>

      {/* Suspension & Brakes */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#E5E7EB]">
          <Activity className="h-5 w-5 text-[#6366F1]" />
          <h4 className="text-sm font-bold text-[#0D1A33] uppercase tracking-wide">Suspension & Brakes</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
          <InfoField label="Front Suspension" value={vehicle.frontSuspension} />
          <InfoField label="Rear Suspension" value={vehicle.rearSuspension} />
          <InfoField label="Front Brake Type" value={vehicle.frontBrakeType} />
          <InfoField label="Rear Brake Type" value={vehicle.rearBrakeType} />
          <InfoField label="Brake Assist" value={vehicle.brakeAssist} />
          <InfoField label="ABS Available" value={vehicle.absAvailable ? "Yes" : "No"} />
        </div>
      </div>

      {/* Wheels & Tyres */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#E5E7EB]">
          <Settings className="h-5 w-5 text-[#6366F1]" />
          <h4 className="text-sm font-bold text-[#0D1A33] uppercase tracking-wide">Wheels & Tyres</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
          <InfoField label="Wheel Type" value={vehicle.wheelType} />
          <InfoField label="Wheel Size (inches)" value={vehicle.wheelSize} />
          <InfoField label="Tyre Size (Front)" value={vehicle.tyreSizeFront} />
          <InfoField label="Tyre Size (Rear)" value={vehicle.tyreSizeRear} />
          <InfoField label="Tyre Type" value={vehicle.tyreType} />
          <InfoField label="Spare Tyre" value={vehicle.spareTyre ? "Available" : "Not Available"} />
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#E5E7EB]">
          <Thermometer className="h-5 w-5 text-[#6366F1]" />
          <h4 className="text-sm font-bold text-[#0D1A33] uppercase tracking-wide">Performance Metrics</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
          <InfoField label="Top Speed (km/h)" value={vehicle.topSpeed} />
          <InfoField label="Acceleration 0-100 (sec)" value={vehicle.acceleration} />
          <InfoField label="Turning Radius (m)" value={vehicle.turningRadius} />
          <InfoField label="Ground Clearance (mm)" value={vehicle.groundClearance} />
          <InfoField label="Kerb Weight (kg)" value={vehicle.kerbWeight} />
          <InfoField label="Gross Vehicle Weight (kg)" value={vehicle.grossVehicleWeight} />
        </div>
      </div>
    </div>
  );
};

export default SpecificationsViewTab;
