import React, { useState } from "react";
import { Plus, Trash2, MapPin, CheckCircle } from "lucide-react";

const GeofencingTab = ({ formData, setFormData, errors, masterData }) => {
  const [coordinates, setCoordinates] = useState([]);
  const [isPolygonComplete, setIsPolygonComplete] = useState(false);

  const addCoordinate = () => {
    const newCoord = {
      sequence: coordinates.length + 1,
      latitude: "",
      longitude: "",
    };
    setCoordinates([...coordinates, newCoord]);
    setIsPolygonComplete(false);
  };

  const removeCoordinate = (index) => {
    const updated = coordinates.filter((_, i) => i !== index);
    // Re-sequence
    const resequenced = updated.map((coord, i) => ({
      ...coord,
      sequence: i + 1,
    }));
    setCoordinates(resequenced);
    setIsPolygonComplete(false);
  };

  const handleCoordinateChange = (index, field, value) => {
    const updated = coordinates.map((coord, i) =>
      i === index ? { ...coord, [field]: value } : coord
    );
    setCoordinates(updated);
  };

  const handleCompleteGeofencing = () => {
    if (coordinates.length < 3) {
      alert("A polygon requires at least 3 coordinate points.");
      return;
    }

    // Validate that all coordinates have lat/long
    const invalid = coordinates.some(
      (coord) => !coord.latitude || !coord.longitude
    );
    if (invalid) {
      alert("Please fill in all latitude and longitude values.");
      return;
    }

    // Update formData with completed coordinates
    setFormData((prev) => ({
      ...prev,
      subLocations: [
        {
          subLocationType: "GEOFENCE",
          description: "Warehouse Geofencing Area",
          coordinates: coordinates,
        },
      ],
    }));

    setIsPolygonComplete(true);
  };

  return (
    <div className="bg-white rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[#0D1A33]">
            Geofencing Configuration
          </h3>
          <p className="text-xs text-gray-500">
            Define warehouse boundaries using GPS coordinates (min 3 points for
            polygon)
          </p>
        </div>
        {isPolygonComplete && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Polygon Complete</span>
          </div>
        )}
      </div>

      {/* Split Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[600px]">
        {/* LEFT SIDE: Coordinate Table */}
        <div className="flex flex-col border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-[#0D1A33]">
              Coordinate Points
            </h4>
            <button
              type="button"
              onClick={addCoordinate}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-[#10B981] hover:bg-[#059669] text-white rounded transition-colors"
            >
              <Plus className="w-3 h-3" />
              Add Point
            </button>
          </div>

          <div className="flex-1 overflow-auto">
            {coordinates.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                <MapPin className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-sm text-gray-500 mb-2">
                  No coordinates added yet
                </p>
                <p className="text-xs text-gray-400">
                  Click "Add Point" to manually add GPS coordinates
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-[#0D1A33] uppercase tracking-wider border-b">
                      Seq
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-[#0D1A33] uppercase tracking-wider border-b">
                      Latitude <span className="text-red-500">*</span>
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-[#0D1A33] uppercase tracking-wider border-b">
                      Longitude <span className="text-red-500">*</span>
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-[#0D1A33] uppercase tracking-wider border-b">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {coordinates.map((coord, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-sm text-gray-700">
                        {coord.sequence}
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          step="0.000001"
                          value={coord.latitude}
                          onChange={(e) =>
                            handleCoordinateChange(
                              index,
                              "latitude",
                              e.target.value
                            )
                          }
                          placeholder="e.g., 19.076090"
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          step="0.000001"
                          value={coord.longitude}
                          onChange={(e) =>
                            handleCoordinateChange(
                              index,
                              "longitude",
                              e.target.value
                            )
                          }
                          placeholder="e.g., 72.877426"
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeCoordinate(index)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs text-white bg-red-500 hover:bg-red-600 rounded transition-colors"
                          title="Remove coordinate"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {coordinates.length > 0 && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCompleteGeofencing}
                disabled={coordinates.length < 3}
                className={`w-full px-4 py-2 text-sm font-medium rounded transition-colors ${
                  coordinates.length >= 3
                    ? "bg-[#3B82F6] hover:bg-[#2563EB] text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isPolygonComplete
                  ? "Polygon Completed ✓"
                  : `Complete Geofencing (${coordinates.length}/3 min)`}
              </button>
              {coordinates.length < 3 && (
                <p className="text-xs text-amber-600 mt-2 text-center">
                  Add at least {3 - coordinates.length} more point(s) to form a
                  polygon
                </p>
              )}
            </div>
          )}
        </div>

        {/* RIGHT SIDE: Map Placeholder */}
        <div className="flex flex-col border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h4 className="text-sm font-semibold text-[#0D1A33]">Map View</h4>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-full max-w-md space-y-4">
              <div className="w-20 h-20 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
                <MapPin className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700">
                Google Maps Integration Pending
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <strong>Status:</strong> Google Maps API key required
                </p>
                <p className="text-xs">
                  To enable interactive map features with click-to-add points
                  and polygon drawing:
                </p>
                <ul className="text-xs text-left list-disc list-inside space-y-1 bg-white p-4 rounded border border-gray-200">
                  <li>Obtain Google Maps API key</li>
                  <li>Install @react-google-maps/api package</li>
                  <li>Add VITE_GOOGLE_MAPS_API_KEY to .env file</li>
                  <li>Enable Maps JavaScript API in Google Cloud Console</li>
                </ul>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  <strong>Current Mode:</strong> Manual coordinate entry
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Use the table on the left to manually input GPS coordinates
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h5 className="text-sm font-semibold text-blue-900 mb-2">
          📍 How to use Geofencing:
        </h5>
        <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
          <li>Click "Add Point" to manually add GPS coordinate points</li>
          <li>
            Enter Latitude and Longitude values for each point (use Google Maps
            to find coordinates)
          </li>
          <li>A minimum of 3 points is required to form a valid polygon</li>
          <li>
            Click "Complete Geofencing" when you've added all boundary points
          </li>
          <li>
            The coordinates will define the virtual fence for warehouse yard-in
            detection
          </li>
        </ul>
      </div>
    </div>
  );
};

export default GeofencingTab;
