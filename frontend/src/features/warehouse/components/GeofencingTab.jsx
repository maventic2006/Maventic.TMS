import React from "react";
import { Label, Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Button } from "../../../components/ui/button";
import { Plus, Trash2, MapPin } from "lucide-react";

const GeofencingTab = ({ formData, setFormData, errors, masterData }) => {
  const addSubLocation = () => {
    setFormData((prev) => ({
      ...prev,
      subLocations: [
        ...prev.subLocations,
        {
          subLocationType: "",
          description: "",
          coordinates: [
            { latitude: "", longitude: "", sequence: 1 },
            { latitude: "", longitude: "", sequence: 2 },
            { latitude: "", longitude: "", sequence: 3 },
          ],
        },
      ],
    }));
  };
  const removeSubLocation = (index) => {
    setFormData((prev) => ({
      ...prev,
      subLocations: prev.subLocations.filter((_, i) => i !== index),
    }));
  };
  const handleSubLocationChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      subLocations: prev.subLocations.map((loc, i) =>
        i === index ? { ...loc, [field]: value } : loc
      ),
    }));
  };
  const addCoordinate = (subLocationIndex) => {
    setFormData((prev) => ({
      ...prev,
      subLocations: prev.subLocations.map((loc, i) =>
        i === subLocationIndex
          ? {
              ...loc,
              coordinates: [
                ...loc.coordinates,
                {
                  latitude: "",
                  longitude: "",
                  sequence: loc.coordinates.length + 1,
                },
              ],
            }
          : loc
      ),
    }));
  };
  const removeCoordinate = (subLocationIndex, coordIndex) => {
    setFormData((prev) => ({
      ...prev,
      subLocations: prev.subLocations.map((loc, i) =>
        i === subLocationIndex
          ? {
              ...loc,
              coordinates: loc.coordinates.filter((_, ci) => ci !== coordIndex),
            }
          : loc
      ),
    }));
  };
  const handleCoordinateChange = (
    subLocationIndex,
    coordIndex,
    field,
    value
  ) => {
    setFormData((prev) => ({
      ...prev,
      subLocations: prev.subLocations.map((loc, i) =>
        i === subLocationIndex
          ? {
              ...loc,
              coordinates: loc.coordinates.map((coord, ci) =>
                ci === coordIndex ? { ...coord, [field]: value } : coord
              ),
            }
          : loc
      ),
    }));
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-[#0D1A33]">
            Geofencing / Sub-Locations
          </h3>
          <p className="text-sm text-gray-600">
            Define warehouse sub-locations with GPS coordinates (optional)
          </p>
        </div>
        <Button
          type="button"
          onClick={addSubLocation}
          className="bg-[#10B981] hover:bg-[#059669] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Sub-Location
        </Button>
      </div>
      {formData.subLocations.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-600">No sub-locations added yet.</p>
        </div>
      )}
      {formData.subLocations.map((subLocation, subIndex) => (
        <div
          key={subIndex}
          className="p-6 bg-gray-50 rounded-lg border space-y-4"
        >
          <div className="flex justify-between items-center">
            <h4 className="font-semibold">Sub-Location {subIndex + 1}</h4>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => removeSubLocation(subIndex)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Sub-Location Type</Label>
              <Select
                value={subLocation.subLocationType}
                onValueChange={(value) =>
                  handleSubLocationChange(subIndex, "subLocationType", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {masterData?.subLocationTypes?.map((type) => (
                    <SelectItem
                      key={type.sub_location_id}
                      value={type.sub_location_id}
                    >
                      {type.warehouse_sub_location_description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={subLocation.description}
                onChange={(e) =>
                  handleSubLocationChange(
                    subIndex,
                    "description",
                    e.target.value
                  )
                }
                placeholder="Enter description"
              />
            </div>
          </div>
          <div className="space-y-4 mt-4">
            <div className="flex justify-between">
              <Label>GPS Coordinates (min 3)</Label>
              <Button
                type="button"
                size="sm"
                onClick={() => addCoordinate(subIndex)}
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Point
              </Button>
            </div>
            {subLocation.coordinates.map((coord, coordIndex) => (
              <div
                key={coordIndex}
                className="grid grid-cols-3 gap-4 p-4 bg-white rounded border"
              >
                <div className="space-y-1">
                  <Label className="text-xs">Latitude</Label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={coord.latitude}
                    onChange={(e) =>
                      handleCoordinateChange(
                        subIndex,
                        coordIndex,
                        "latitude",
                        e.target.value
                      )
                    }
                    placeholder="e.g., 19.076090"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Longitude</Label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={coord.longitude}
                    onChange={(e) =>
                      handleCoordinateChange(
                        subIndex,
                        coordIndex,
                        "longitude",
                        e.target.value
                      )
                    }
                    placeholder="e.g., 72.877426"
                  />
                </div>
                <div className="flex items-end">
                  {subLocation.coordinates.length > 3 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeCoordinate(subIndex, coordIndex)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default GeofencingTab;
