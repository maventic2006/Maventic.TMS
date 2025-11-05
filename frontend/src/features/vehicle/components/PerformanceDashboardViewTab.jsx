import React from "react";
import { BarChart3, TrendingUp, Gauge, Calendar, AlertCircle, CheckCircle } from "lucide-react";

const InfoField = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-xs font-semibold text-[#4A5568] uppercase tracking-wide">{label}</p>
    <p className="text-sm font-medium text-[#0D1A33]">{value || "N/A"}</p>
  </div>
);

const ServiceFrequencyCard = ({ serviceName, frequency, lastServiceKm, nextServiceKm, status }) => {
  const statusConfig = {
    upcoming: { bg: "#DBEAFE", text: "#1D4ED8", icon: AlertCircle },
    overdue: { bg: "#FEE2E2", text: "#EF4444", icon: AlertCircle },
    completed: { bg: "#D1FAE5", text: "#10B981", icon: CheckCircle },
  };

  const config = statusConfig[status] || statusConfig.upcoming;
  const StatusIcon = config.icon;

  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-[#0D1A33] text-base">{serviceName}</h4>
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ background: config.bg, color: config.text }}
        >
          <StatusIcon className="h-3.5 w-3.5" />
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <InfoField label="Frequency" value={frequency} />
        <InfoField label="Last Service (km)" value={lastServiceKm} />
        <InfoField label="Next Service (km)" value={nextServiceKm} />
        <InfoField label="Remaining (km)" value={nextServiceKm && lastServiceKm ? (parseInt(nextServiceKm) - parseInt(lastServiceKm)).toString() : "N/A"} />
      </div>
    </div>
  );
};

const PerformanceDashboardViewTab = ({ vehicle, isEditMode }) => {
  if (isEditMode) {
    return (
      <div className="text-center py-12">
        <p className="text-[#4A5568]">Edit mode for Service Frequency coming soon...</p>
      </div>
    );
  }

  // Mock data - replace with actual data from vehicle object
  const serviceFrequencies = [
    {
      serviceName: "Engine Oil Change",
      frequency: "Every 10,000 km",
      lastServiceKm: "45,000",
      nextServiceKm: "55,000",
      status: "upcoming",
    },
    {
      serviceName: "Air Filter Replacement",
      frequency: "Every 15,000 km",
      lastServiceKm: "40,000",
      nextServiceKm: "55,000",
      status: "upcoming",
    },
    {
      serviceName: "Brake Pad Inspection",
      frequency: "Every 20,000 km",
      lastServiceKm: "30,000",
      nextServiceKm: "50,000",
      status: "completed",
    },
    {
      serviceName: "Tire Rotation",
      frequency: "Every 10,000 km",
      lastServiceKm: "40,000",
      nextServiceKm: "50,000",
      status: "upcoming",
    },
    {
      serviceName: "Transmission Fluid",
      frequency: "Every 50,000 km",
      lastServiceKm: "0",
      nextServiceKm: "50,000",
      status: "upcoming",
    },
    {
      serviceName: "Coolant Flush",
      frequency: "Every 40,000 km",
      lastServiceKm: "10,000",
      nextServiceKm: "50,000",
      status: "upcoming",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#E5E7EB]">
        <h3 className="text-lg font-bold text-[#0D1A33]">Vehicle Service Frequency</h3>
        <p className="text-sm text-[#4A5568] mt-1">Track service intervals based on kilometer readings</p>
      </div>

      {/* Current Vehicle Stats */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#E5E7EB]">
          <Gauge className="h-5 w-5 text-[#6366F1]" />
          <h4 className="text-sm font-bold text-[#0D1A33] uppercase tracking-wide">Current Odometer Status</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">
          <InfoField label="Current Odometer" value={`${vehicle.currentOdometer || "50,000"} km`} />
          <InfoField label="Total Distance Covered" value={`${vehicle.totalDistance || "50,000"} km`} />
          <InfoField label="Average KM/Day" value={`${vehicle.averageKmPerDay || "150"} km`} />
          <InfoField label="Last Updated" value={vehicle.odometerLastUpdated || "2024-01-15"} />
        </div>
      </div>

      {/* Service Schedule Overview */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#E5E7EB]">
          <Calendar className="h-5 w-5 text-[#6366F1]" />
          <h4 className="text-sm font-bold text-[#0D1A33] uppercase tracking-wide">Upcoming Services</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#DBEAFE] rounded-lg p-4 border border-[#1D4ED8]">
            <p className="text-xs font-semibold text-[#1D4ED8] uppercase tracking-wide mb-1">Next Service</p>
            <p className="text-2xl font-bold text-[#1D4ED8]">5,000 km</p>
            <p className="text-xs text-[#1D4ED8] mt-1">Engine Oil Change</p>
          </div>
          <div className="bg-[#FEF3C7] rounded-lg p-4 border border-[#F59E0B]">
            <p className="text-xs font-semibold text-[#F59E0B] uppercase tracking-wide mb-1">Services Due Soon</p>
            <p className="text-2xl font-bold text-[#F59E0B]">3</p>
            <p className="text-xs text-[#F59E0B] mt-1">Within 5,000 km</p>
          </div>
          <div className="bg-[#FEE2E2] rounded-lg p-4 border border-[#EF4444]">
            <p className="text-xs font-semibold text-[#EF4444] uppercase tracking-wide mb-1">Overdue Services</p>
            <p className="text-2xl font-bold text-[#EF4444]">0</p>
            <p className="text-xs text-[#EF4444] mt-1">All services up to date</p>
          </div>
        </div>
      </div>

      {/* Service Frequency List */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-[#0D1A33] uppercase tracking-wide">Service Schedule</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {serviceFrequencies.map((service, index) => (
            <ServiceFrequencyCard key={index} {...service} />
          ))}
        </div>
      </div>

      {/* Service Recommendations */}
      <div className="bg-[#F0FDF4] border border-[#10B981] rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="h-5 w-5 text-[#10B981]" />
          <h4 className="text-sm font-bold text-[#10B981] uppercase tracking-wide">Recommendations</h4>
        </div>
        <ul className="space-y-2">
          <li className="text-sm text-[#0D1A33] flex items-start gap-2">
            <span className="text-[#10B981] font-bold">•</span>
            Schedule Engine Oil Change within the next 5,000 km
          </li>
          <li className="text-sm text-[#0D1A33] flex items-start gap-2">
            <span className="text-[#10B981] font-bold">•</span>
            Check tire pressure and tread depth at next service
          </li>
          <li className="text-sm text-[#0D1A33] flex items-start gap-2">
            <span className="text-[#10B981] font-bold">•</span>
            Consider booking multiple services together to save time
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PerformanceDashboardViewTab;
