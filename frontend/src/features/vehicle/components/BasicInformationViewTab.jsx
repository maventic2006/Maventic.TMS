import React from "react";
import {
  Truck,
  Settings,
  MapPin,
  FileText,
  Flag,
  Calendar,
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

  // Get the basic information from the vehicle data
  // The transformed vehicle data is flattened, so we access properties directly from vehicle
  const basicInfo = vehicle || {};

  const formatDateLocal = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
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
          <InfoField
            label="Registration Number"
            value={basicInfo.registrationNumber}
          />
          <InfoField label="VIN (Chassis No.)" value={basicInfo.vin} />
          <InfoField label="Vehicle Type" value={basicInfo.vehicleTypeDescription || basicInfo.vehicleType} />
          <InfoField label="Make/Brand" value={basicInfo.make} />
          <InfoField label="Model" value={basicInfo.model} />
          <InfoField label="Manufacturing Year" value={basicInfo.year} />
          <InfoField label="Vehicle Category" value={basicInfo.vehicleCategory} />
          <InfoField label="Manufacturing Month & Year" value={basicInfo.manufacturingMonthYear} />
          <InfoField label="Color" value={basicInfo.color} />
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
          <InfoField label="Usage Type" value={basicInfo.usageType} />
          <InfoField label="Mileage" value={`${basicInfo.mileage || 0} km/l`} />
          <InfoField label="Current Driver" value={basicInfo.currentDriver} />
          <InfoField label="Transporter ID" value={basicInfo.transporterId} />
          <InfoField label="Transporter Name" value={basicInfo.transporterName} />
          <InfoField 
            label="Leasing Flag" 
            value={basicInfo.leasingFlag ? "Yes" : "No"} 
          />
          <InfoField label="Leased From" value={basicInfo.leasedFrom} />
          <InfoField 
            label="Lease Start Date" 
            value={formatDateLocal(basicInfo.leaseStartDate)} 
          />
          <InfoField 
            label="Lease End Date" 
            value={formatDateLocal(basicInfo.leaseEndDate)} 
          />
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
          <InfoField label="GPS IMEI Number" value={basicInfo.gpsIMEI} />
          <InfoField
            label="GPS Enabled"
            value={basicInfo.gpsEnabled || basicInfo.gpsActive ? "Yes" : "No"}
          />
          <InfoField label="GPS Provider" value={basicInfo.gpsProvider} />
        </div>
      </div>

      {/* Registration & Location - 3 Column Grid */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#E5E7EB]">
          <FileText className="h-5 w-5 text-[#6366F1]" />
          <h4 className="text-sm font-bold text-[#0D1A33] uppercase tracking-wide">
            Registration & Location
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
          <InfoField
            label="Vehicle Registered at Country"
            value={basicInfo.vehicleRegisteredAtCountry}
          />
          <InfoField
            label="Vehicle Registered at State"
            value={basicInfo.vehicleRegisteredAtState}
          />
          <InfoField 
            label="Safety Inspection Date" 
            value={formatDateLocal(basicInfo.safetyInspectionDate)} 
          />
          <InfoField 
            label="Avg Running Speed (km/h)" 
            value={basicInfo.avgRunningSpeed} 
          />
          <InfoField 
            label="Max Running Speed (km/h)" 
            value={basicInfo.maxRunningSpeed} 
          />
          <InfoField 
            label="Taxes and Fees" 
            value={basicInfo.taxesAndFees ? `₹${basicInfo.taxesAndFees}` : "N/A"} 
          />
        </div>
      </div>

      {/* System Information - 3 Column Grid */}
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
            value={formatDateLocal(vehicle.createdAt)}
          />
          <InfoField label="Created By" value={vehicle.createdBy} />
          <InfoField
            label="Last Updated"
            value={formatDateLocal(vehicle.updatedAt)}
          />
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