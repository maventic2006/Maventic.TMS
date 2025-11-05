import React from "react";
import { MapPin, Satellite, Calendar, CheckCircle } from "lucide-react";

const InfoRow = ({ label, value, icon: Icon }) => (
  <div className="flex items-start gap-3 py-3 border-b border-[#F5F7FA] last:border-0">
    {Icon && <Icon className="h-5 w-5 text-[#6366F1] mt-0.5" />}
    <div className="flex-1">
      <p className="text-sm text-[#4A5568] mb-1">{label}</p>
      <p className="text-base font-semibold text-[#0D1A33]">{value || "N/A"}</p>
    </div>
  </div>
);

const GPSTrackerViewTab = ({ vehicle, isEditMode }) => {
  if (isEditMode) {
    return (
      <div className="text-center py-12">
        <p className="text-[#4A5568]">Edit mode for GPS Tracker coming soon...</p>
      </div>
    );
  }

  const gpsTracker = vehicle.gpsTracker || {};
  const hasGPS = vehicle.gpsEnabled;

  if (!hasGPS) {
    return (
      <div className="text-center py-12">
        <Satellite className="h-16 w-16 text-[#E5E7EB] mx-auto mb-4" />
        <p className="text-[#4A5568] font-semibold">GPS tracking not enabled</p>
        <p className="text-sm text-[#4A5568] mt-2">
          Enable GPS tracking to monitor vehicle location in real-time
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-[#0D1A33]">GPS Tracking Information</h3>

      {/* GPS Device Details */}
      <div className="bg-[#F9FAFB] rounded-lg p-6">
        <h4 className="text-sm font-semibold text-[#0D1A33] mb-4 flex items-center gap-2">
          <Satellite className="h-4 w-4 text-[#6366F1]" />
          GPS Device Information
        </h4>
        <div className="space-y-4">
          <InfoRow label="Device ID" value={gpsTracker.deviceId} icon={Satellite} />
          <InfoRow label="Provider" value={gpsTracker.provider} icon={Satellite} />
          <InfoRow label="Installation Date" value={gpsTracker.installationDate} icon={Calendar} />
          <div className="flex items-center gap-2 pt-4 border-t border-[#E5E7EB]">
            <CheckCircle className="h-5 w-5 text-[#10B981]" />
            <span className="text-sm font-semibold text-[#10B981]">GPS Status: Active</span>
          </div>
        </div>
      </div>

      {/* Last Known Location */}
      {gpsTracker.lastLocation && (
        <div className="bg-[#F9FAFB] rounded-lg p-6">
          <h4 className="text-sm font-semibold text-[#0D1A33] mb-4 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#6366F1]" />
            Last Known Location
          </h4>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[#4A5568] mb-1">Latitude</p>
                <p className="text-base font-semibold text-[#0D1A33]">{gpsTracker.lastLocation.lat}</p>
              </div>
              <div>
                <p className="text-sm text-[#4A5568] mb-1">Longitude</p>
                <p className="text-base font-semibold text-[#0D1A33]">{gpsTracker.lastLocation.lng}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-[#4A5568] mb-1">Last Updated</p>
              <p className="text-base font-semibold text-[#0D1A33]">{gpsTracker.lastLocation.timestamp}</p>
            </div>
          </div>
        </div>
      )}

      {/* Map Placeholder */}
      <div className="bg-[#F9FAFB] rounded-lg p-12 text-center">
        <MapPin className="h-16 w-16 text-[#E5E7EB] mx-auto mb-4" />
        <p className="text-[#4A5568] font-semibold">Live map view coming soon</p>
        <p className="text-sm text-[#4A5568] mt-2">
          Real-time location tracking will be available in the next update
        </p>
      </div>
    </div>
  );
};

export default GPSTrackerViewTab;
