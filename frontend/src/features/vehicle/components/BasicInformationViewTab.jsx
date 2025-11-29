import React from "react";
import {
  Truck,
  Calendar,
  Hash,
  User,
  MapPin,
  FileText,
  Settings,
  Flag,
} from "lucide-react";
import VehicleStatusPill from "../../../components/vehicle/VehicleStatusPill";
import { formatDate } from "../../../utils/helpers";

const InfoField = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-xs font-semibold text-[#4A5568] uppercase tracking-wide">
      {label}
    </p>
    <p className="text-sm font-medium text-[#0D1A33]">{value || "N/A"}</p>
  </div>
);

const BasicInformationViewTab = ({ vehicle, isEditMode }) => {
  if (isEditMode) {
    return (
      <div className="text-center py-12">
        <p className="text-[#4A5568]">
          Edit mode for Basic Information coming soon...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Badge */}
      {/* <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
        <h3 className="text-lg font-bold text-[#0D1A33]">Basic Vehicle Information</h3>
      </div> */}

      {/* Vehicle Identification - 3 Column Grid */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#E5E7EB]">
          <Truck className="h-5 w-5 text-[#6366F1]" />
          <h4 className="text-sm font-bold text-[#0D1A33] uppercase tracking-wide">
            Vehicle Identification
          </h4>
          <VehicleStatusPill status={vehicle.status} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
          <InfoField label="Vehicle ID" value={vehicle.vehicleId} />
          <InfoField
            label="Registration Number"
            value={vehicle.registrationNumber}
          />
          <InfoField label="Vehicle Type" value={vehicle.vehicleType} />
          <InfoField label="Make/Brand" value={vehicle.make} />
          <InfoField label="Model" value={vehicle.model} />
          <InfoField label="Manufacturing Year" value={vehicle.year} />
          <InfoField label="VIN (Chassis No.)" value={vehicle.chassisNumber} />
          <InfoField label="Engine Number" value={vehicle.engineNumber} />
          <InfoField label="Color" value={vehicle.color} />
        </div>
      </div>

      {/* Registration Details - 3 Column Grid */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#E5E7EB]">
          <FileText className="h-5 w-5 text-[#6366F1]" />
          <h4 className="text-sm font-bold text-[#0D1A33] uppercase tracking-wide">
            Registration Details
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
          <InfoField
            label="Registration State"
            value={vehicle.registrationState}
          />
          <InfoField
            label="Registration Date"
            value={formatDate(vehicle.registrationDate)}
          />
          <InfoField label="RC Book Number" value={vehicle.rcBookNumber} />
          <InfoField
            label="RC Expiry Date"
            value={formatDate(vehicle.rcExpiryDate)}
          />
          <InfoField
            label="Insurance Policy No."
            value={vehicle.insurancePolicyNumber}
          />
          <InfoField
            label="Insurance Expiry"
            value={formatDate(vehicle.insuranceExpiryDate)}
          />
        </div>
      </div>

      {/* Technical Specifications - 3 Column Grid */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#E5E7EB]">
          <Settings className="h-5 w-5 text-[#6366F1]" />
          <h4 className="text-sm font-bold text-[#0D1A33] uppercase tracking-wide">
            Technical Specifications
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
          <InfoField label="Fuel Type" value={vehicle.fuelType} />
          <InfoField label="Transmission" value={vehicle.transmission} />
          <InfoField label="Fuel Capacity (L)" value={vehicle.fuelCapacity} />
          <InfoField label="Mileage (km/l)" value={vehicle.mileage} />
          <InfoField label="Seating Capacity" value={vehicle.seatingCapacity} />
        </div>
      </div>

      {/* Operational Information - 3 Column Grid */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#E5E7EB]">
          <MapPin className="h-5 w-5 text-[#6366F1]" />
          <h4 className="text-sm font-bold text-[#0D1A33] uppercase tracking-wide">
            Operational Information
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
          <InfoField
            label="Current Odometer (km)"
            value={vehicle.currentOdometer}
          />
          <InfoField label="Average KM/Day" value={vehicle.averageKmPerDay} />
          <InfoField
            label="Last Service Date"
            value={formatDate(vehicle.lastServiceDate)}
          />
          <InfoField
            label="Next Service Due (km)"
            value={formatDate(vehicle.nextServiceDue)}
          />
          <InfoField label="Current Driver" value={vehicle.currentDriver} />
          <InfoField label="Current Location" value={vehicle.currentLocation} />
        </div>
      </div>

      {/* GPS & Tracking - 3 Column Grid */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#E5E7EB]">
          <Flag className="h-5 w-5 text-[#6366F1]" />
          <h4 className="text-sm font-bold text-[#0D1A33] uppercase tracking-wide">
            GPS & Tracking
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
          <InfoField
            label="GPS Enabled"
            value={vehicle.gpsEnabled ? "Yes" : "No"}
          />
          <InfoField label="GPS Device ID" value={vehicle.gpsDeviceId} />
          <InfoField label="GPS Provider" value={vehicle.gpsProvider} />
          <InfoField label="IMEI Number" value={vehicle.imeiNumber} />
          <InfoField label="SIM Number" value={vehicle.simNumber} />
          <InfoField label="Last GPS Update" value={vehicle.lastGpsUpdate} />
        </div>
      </div>

      {/* Audit Information - 3 Column Grid */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#E5E7EB]">
          <Calendar className="h-5 w-5 text-[#6366F1]" />
          <h4 className="text-sm font-bold text-[#0D1A33] uppercase tracking-wide">
            System Information
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
          <InfoField
            label="Created Date"
            value={formatDate(vehicle.createdAt)}
          />
          <InfoField label="Created By" value={vehicle.createdBy} />
          <InfoField
            label="Last Updated"
            value={formatDate(vehicle.updatedAt)}
          />
          <InfoField label="Updated By" value={vehicle.updatedBy} />
          <InfoField label="Status" value={vehicle.status} />
          <InfoField
            label="Blacklist Status"
            value={vehicle.blacklistStatus || "Not Blacklisted"}
          />
        </div>
      </div>
    </div>
  );
};

export default BasicInformationViewTab;
