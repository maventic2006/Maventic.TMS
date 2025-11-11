import React from "react";
import { BarChart3, Gauge, Calendar, Activity } from "lucide-react";
import CollapsibleSection from "../../../components/ui/CollapsibleSection";

const PerformanceDashboardViewTab = ({ vehicle, isEditMode }) => {
  if (isEditMode) {
    return (
      <div className="text-center py-12">
        <p className="text-[#4A5568]">Edit mode for Service Frequency coming soon...</p>
      </div>
    );
  }

  // Get service frequency array from vehicle object
  const serviceFrequencies = vehicle?.serviceFrequency || [];

  return (
    <div className="space-y-6">
      {/* Service Frequency List with Collapsible Sections */}
      <div className="space-y-4">
        
        {serviceFrequencies.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-[#E5E7EB]">
            <BarChart3 className="h-16 w-16 text-[#E5E7EB] mx-auto mb-4" />
            <p className="text-[#4A5568] font-medium">No service frequency records found</p>
            <p className="text-sm text-[#4A5568] mt-2">Service frequency schedule not configured yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {serviceFrequencies.map((freq, index) => (
              <CollapsibleSection
                key={index}
                defaultOpen={index === 0}
                gradientFrom="blue-50/50"
                gradientTo="indigo-50/50"
                borderColor="blue-100/50"
                header={
                  <div className="flex items-center justify-between w-full text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <Activity className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          Service Frequency #{freq.sequenceNumber || index + 1}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {freq.timePeriod || "No time period specified"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right mr-8">
                      <p className="text-xs text-gray-600 uppercase tracking-wide">KM Drove</p>
                      <p className="text-lg font-bold text-gray-800">
                        {freq.kmDrove ? parseFloat(freq.kmDrove).toLocaleString() : "0"} km
                      </p>
                    </div>
                  </div>
                }
              >
                {/* Service Frequency Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Sequence Number</label>
                    <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
                      <p className="text-gray-800 font-semibold">#{freq.sequenceNumber || "N/A"}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Time Period</label>
                    <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <p className="text-gray-800">{freq.timePeriod || "N/A"}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Kilometers Drove</label>
                    <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50 flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-gray-500" />
                      <p className="text-gray-800 font-semibold">
                        {freq.kmDrove ? parseFloat(freq.kmDrove).toLocaleString() : "0"} km
                      </p>
                    </div>
                  </div>
                </div>
              </CollapsibleSection>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceDashboardViewTab;
