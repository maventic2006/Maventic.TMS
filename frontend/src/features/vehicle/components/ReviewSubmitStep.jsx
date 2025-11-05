import React from "react";
import { FileCheck, Check, AlertTriangle } from "lucide-react";
import {
  VEHICLE_TYPES,
  FUEL_TYPES,
  TRANSMISSION_TYPES,
  OWNERSHIP_TYPES,
  GPS_PROVIDER_OPTIONS,
} from "../../../utils/vehicleConstants";

const ReviewSubmitStep = ({ formData, errors }) => {
  const getLabel = (options, value) => {
    const option = options.find((opt) => opt.value === value);
    return option ? option.label : value || "Not specified";
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-xl flex items-center justify-center shadow-lg">
          <FileCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#0D1A33]">Review & Submit</h2>
          <p className="text-sm text-gray-600">Review all information before submitting</p>
        </div>
      </div>

      {hasErrors ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 mb-6">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-800">
            <p className="font-semibold mb-1">Validation Errors Found</p>
            <p>Please go back and fix the errors before submitting. Missing or invalid fields are highlighted.</p>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3 mb-6">
          <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-green-800">
            <p className="font-semibold mb-1">Ready to Submit</p>
            <p>All required information has been provided. Click the Submit button to create the vehicle record.</p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoRow label="Vehicle ID" value={formData.vehicleId} />
            <InfoRow label="Registration Number" value={formData.registrationNumber || "Not provided"} />
            <InfoRow label="Vehicle Type" value={getLabel(VEHICLE_TYPES, formData.vehicleType)} />
            <InfoRow label="Make" value={formData.make || "Not provided"} />
            <InfoRow label="Model" value={formData.model || "Not provided"} />
            <InfoRow label="Year" value={formData.year} />
            <InfoRow label="Engine Number" value={formData.engineNumber || "Not provided"} />
            <InfoRow label="Chassis Number" value={formData.chassisNumber || "Not provided"} />
            <InfoRow label="Fuel Type" value={getLabel(FUEL_TYPES, formData.fuelType)} />
            <InfoRow label="Transmission" value={getLabel(TRANSMISSION_TYPES, formData.transmission)} />
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-md font-semibold text-gray-800 mb-4">Capacity Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoRow
              label="Weight Capacity"
              value={`${formData.capacity.weight || 0} ${formData.capacity.unit}`}
            />
            <InfoRow
              label="Volume Capacity"
              value={
                formData.capacity.volume > 0
                  ? `${formData.capacity.volume} ${formData.capacity.volumeUnit}`
                  : "Not specified"
              }
            />
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-md font-semibold text-gray-800 mb-4">Ownership Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoRow label="Ownership Type" value={getLabel(OWNERSHIP_TYPES, formData.ownership)} />
            <InfoRow label="Owner Name" value={formData.ownerName || "Not provided"} />
            <InfoRow label="Transporter ID" value={formData.transporterId || "Not specified"} />
            <InfoRow label="Transporter Name" value={formData.transporterName || "Not specified"} />
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-md font-semibold text-gray-800 mb-4">GPS & Operational</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoRow
              label="GPS Enabled"
              value={
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    formData.gpsEnabled
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {formData.gpsEnabled ? "Yes" : "No"}
                </span>
              }
            />
            {formData.gpsEnabled && (
              <>
                <InfoRow label="GPS Device ID" value={formData.gpsDeviceId || "Not provided"} />
                <InfoRow label="GPS Provider" value={getLabel(GPS_PROVIDER_OPTIONS, formData.gpsProvider)} />
              </>
            )}
            <InfoRow label="Current Driver" value={formData.currentDriver || "Not assigned"} />
            <InfoRow label="Status" value="Pending Approval" />
            <InfoRow label="Created By" value={formData.createdBy} />
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-xs font-medium text-gray-500 mb-1">{label}</span>
    <span className="text-sm font-semibold text-gray-800">{value}</span>
  </div>
);

export default ReviewSubmitStep;
