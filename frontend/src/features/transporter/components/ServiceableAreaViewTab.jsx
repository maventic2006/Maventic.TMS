import React from "react";
import { Globe, MapPin, Flag, Hash } from "lucide-react";

const ServiceableAreaViewTab = ({ formData, transporterData }) => {
  const data = formData || transporterData;
  const serviceableAreas = data?.serviceableAreas || [];

  return (
    <div className="space-y-8">
      {serviceableAreas.length === 0 ? (
        <div className="text-center py-12">
          <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">
            No Serviceable Areas Found
          </h3>
          <p className="text-gray-400">
            No serviceable area information has been added yet.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {serviceableAreas.map((area, areaIndex) => (
            <div
              key={areaIndex}
              className="bg-gradient-to-r from-green-50/50 to-teal-50/50 rounded-2xl p-6 border border-green-100/50"
            >
              {/* Area Header */}
              <div className="flex items-center gap-3 border-b border-green-200/30 pb-4 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <Flag className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Serviceable Area {areaIndex + 1}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Coverage for {area.country || "Unknown Country"}
                  </p>
                </div>
              </div>

              {/* Country Information */}
              <div className="mb-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">
                    Country
                  </label>
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50 flex items-center gap-2">
                    <Flag className="w-4 h-4 text-gray-500" />
                    <p className="text-gray-800 font-medium">
                      {area.country || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* States Information */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-600">
                    Serviceable States
                  </label>
                  <div className="flex items-center gap-2 bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-medium">
                    <Hash className="w-3 h-3" />
                    <span>{area.states ? area.states.length : 0} States</span>
                  </div>
                </div>

                {area.states && area.states.length > 0 ? (
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {area.states.map((state, stateIndex) => (
                        <div
                          key={stateIndex}
                          className="flex items-center gap-2 bg-gray-50/80 rounded-lg px-3 py-2 border border-gray-200/30"
                        >
                          <MapPin className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="text-gray-800 text-sm font-medium truncate">
                            {state}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50 text-center">
                    <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">
                      No states selected for this country
                    </p>
                  </div>
                )}
              </div>

              {/* Coverage Summary */}
              {area.states && area.states.length > 0 && (
                <div className="mt-6 pt-4 border-t border-green-200/30">
                  <div className="bg-gradient-to-r from-green-100/50 to-teal-100/50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          Coverage Summary for {area.country}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          This transporter can provide services across{" "}
                          {area.states.length} states in {area.country}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Overall Summary */}
          <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-2xl p-6 border border-blue-100/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Overall Coverage
                </h3>
                <p className="text-sm text-gray-600">
                  Complete serviceable area summary
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {serviceableAreas.length}
                </div>
                <div className="text-sm text-gray-600">Countries</div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50 text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {serviceableAreas.reduce(
                    (total, area) =>
                      total + (area.states ? area.states.length : 0),
                    0
                  )}
                </div>
                <div className="text-sm text-gray-600">Total States</div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {serviceableAreas.some(
                    (area) => area.states && area.states.length > 0
                  )
                    ? "Active"
                    : "Inactive"}
                </div>
                <div className="text-sm text-gray-600">Service Status</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceableAreaViewTab;
