import React, { useState } from "react";
import {
  Map,
  MapPin,
  ChevronDown,
  ChevronUp,
  Navigation,
  Hash,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const GeofencingViewTab = ({ warehouseData }) => {
  const [expandedSections, setExpandedSections] = useState({});

  // Helper function to display value or N/A
  const displayValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return <span className="text-gray-500 italic">N/A</span>;
    }
    return <span className="text-[#0D1A33] font-medium">{value}</span>;
  };

  const toggleSection = (sectionKey) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const CollapsibleSubLocation = ({ subLocation, index }) => {
    const isExpanded = expandedSections[index] !== false; // Default to expanded

    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white">
        <button
          onClick={() => toggleSection(index)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <MapPin className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-left">
              <h4 className="text-lg font-semibold text-gray-900">
                {subLocation.subLocationType || `Sub-Location ${index + 1}`}
              </h4>
              {subLocation.description && (
                <p className="text-sm text-gray-500">
                  {subLocation.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {subLocation.coordinates?.length || 0} coordinates
            </span>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </div>
        </button>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Sub-Location ID
                    </label>
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-gray-400" />
                      {displayValue(subLocation.subLocationHdrId)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Type
                    </label>
                    {displayValue(subLocation.subLocationType)}
                  </div>
                </div>

                {subLocation.coordinates &&
                subLocation.coordinates.length > 0 ? (
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-3">
                      Coordinates
                    </h5>
                    <div className="space-y-2">
                      {subLocation.coordinates
                        .sort((a, b) => a.sequence - b.sequence)
                        .map((coord, coordIndex) => (
                          <div
                            key={coordIndex}
                            className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold">
                              {coord.sequence || coordIndex + 1}
                            </div>
                            <div className="flex-1 grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                  Latitude
                                </label>
                                <div className="flex items-center gap-2">
                                  <Navigation className="h-3 w-3 text-gray-400" />
                                  <span className="text-sm font-mono text-gray-900">
                                    {coord.latitude || "N/A"}
                                  </span>
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                  Longitude
                                </label>
                                <div className="flex items-center gap-2">
                                  <Navigation className="h-3 w-3 text-gray-400" />
                                  <span className="text-sm font-mono text-gray-900">
                                    {coord.longitude || "N/A"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">
                      No coordinates defined
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const subLocations = warehouseData?.subLocations || [];

  return (
    <div className="space-y-6 p-2">
      {subLocations && subLocations.length > 0 ? (
        subLocations.map((subLocation, index) => (
          <CollapsibleSubLocation
            key={subLocation.subLocationHdrId || index}
            subLocation={subLocation}
            index={index}
          />
        ))
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white">
          <div className="px-6 py-4">
            <div className="text-center py-8">
              <Map className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">
                No geofencing data available
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Geofencing information will appear here once configured
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeofencingViewTab;
