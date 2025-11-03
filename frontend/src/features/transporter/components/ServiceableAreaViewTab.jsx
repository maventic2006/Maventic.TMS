import React from "react";
import { Globe, MapPin, Flag, Hash } from "lucide-react";
import { Country, State } from "country-state-city";
import CollapsibleSection from "../../../components/ui/CollapsibleSection";

const ServiceableAreaViewTab = ({ formData, transporterData }) => {
  const data = formData || transporterData;
  const serviceableAreas = data?.serviceableAreas || [];

  // Helper function to get country name (already a name, just return it)
  const getCountryName = (countryName) => {
    if (!countryName) return "Unknown Country";
    // Since we now store full names, just return the name
    return countryName;
  };

  // Helper function to get state name (already a name, just return it)
  const getStateName = (countryName, stateName) => {
    if (!stateName) return "Unknown State";
    // Since we now store full names, just return the name
    return stateName;
  };

  // Helper function to render country flag with fallback
  const renderCountryFlag = (countryCode) => {
    if (!countryCode) {
      return <Flag className="w-5 h-5 text-green-600" />;
    }

    return (
      <img
        src={`https://flagsapi.com/${countryCode}/shiny/64.png`}
        alt={`${countryCode} flag`}
        className="w-5 h-5"
        onError={(e) => {
          // Fallback to Flag icon if image fails to load
          e.target.style.display = "none";
          e.target.nextSibling.style.display = "block";
        }}
      />
    );
  };

  return (
    <div className="space-y-6">
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
        serviceableAreas.map((area, areaIndex) => (
          <CollapsibleSection
            key={areaIndex}
            defaultOpen={areaIndex === 0}
            gradientFrom="green-50/50"
            gradientTo="green-50/50"
            borderColor="green-100/50"
            header={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center relative">
                    {renderCountryFlag(area.countryCode)}
                    <Flag
                      className="w-5 h-5 text-green-600"
                      style={{ display: "none" }}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg text-left font-semibold text-gray-800">
                      {getCountryName(area.country)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {area.states ? area.states.length : 0} States Covered
                    </p>
                  </div>
                </div>

                {/* <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mr-8">
                  <Hash className="w-3 h-3" />
                  <span>{area.states ? area.states.length : 0}</span>
                </div> */}
              </div>
            }
          >
            {/* Country Information */}
            {/* <div className="mb-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Country
                </label>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50 flex items-center gap-2">
                  <Flag className="w-4 h-4 text-gray-500" />
                  <p className="text-gray-800 font-medium">
                    {getCountryName(area.country)}
                  </p>
                </div>
              </div>
            </div> */}

            {/* States Information */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-600">
                Serviceable States
              </label>

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
                          {getStateName(area.country, state)}
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
          </CollapsibleSection>
        ))
      )}
    </div>
  );
};

export default ServiceableAreaViewTab;
