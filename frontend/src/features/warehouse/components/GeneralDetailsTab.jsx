import React from "react";
import { Label, Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import ThemedSwitch from "../../../components/ui/themed/ThemedSwitch";

const GeneralDetailsTab = ({ formData, setFormData, errors, masterData }) => {
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      generalDetails: {
        ...prev.generalDetails,
        [field]: value,
      },
    }));
  };

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Warehouse Name */}
        <div className="space-y-2">
          <Label
            htmlFor="warehouseName"
            className="text-sm font-semibold text-[#0D1A33]"
          >
            Warehouse Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="warehouseName"
            value={formData.generalDetails.warehouseName}
            onChange={(e) => handleChange("warehouseName", e.target.value)}
            placeholder="Enter warehouse name"
            className={
              errors?.["generalDetails.warehouseName"] ? "border-red-500" : ""
            }
          />
          {errors?.["generalDetails.warehouseName"] && (
            <p className="text-xs text-red-500">
              {errors["generalDetails.warehouseName"]}
            </p>
          )}
        </div>

        {/* Warehouse Type */}
        <div className="space-y-2">
          <Label
            htmlFor="warehouseType"
            className="text-sm font-semibold text-[#0D1A33]"
          >
            Warehouse Type <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.generalDetails.warehouseType}
            onValueChange={(value) => handleChange("warehouseType", value)}
          >
            <SelectTrigger
              className={
                errors?.["generalDetails.warehouseType"] ? "border-red-500" : ""
              }
            >
              <SelectValue placeholder="Select warehouse type" />
            </SelectTrigger>
            <SelectContent>
              {masterData?.warehouseTypes?.map((type) => (
                <SelectItem
                  key={type.warehouse_type_id}
                  value={type.warehouse_type_id}
                >
                  {type.warehouse_type_name || type.warehouse_type_id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.["generalDetails.warehouseType"] && (
            <p className="text-xs text-red-500">
              {errors["generalDetails.warehouseType"]}
            </p>
          )}
        </div>

        {/* Language */}
        <div className="space-y-2">
          <Label
            htmlFor="language"
            className="text-sm font-semibold text-[#0D1A33]"
          >
            Language
          </Label>
          <Input
            id="language"
            value={formData.generalDetails.language}
            onChange={(e) => handleChange("language", e.target.value)}
            placeholder="Enter language code (e.g., EN, HI)"
          />
        </div>

        {/* Vehicle Capacity */}
        <div className="space-y-2">
          <Label
            htmlFor="vehicleCapacity"
            className="text-sm font-semibold text-[#0D1A33]"
          >
            Vehicle Capacity
          </Label>
          <Input
            id="vehicleCapacity"
            type="number"
            min="0"
            value={formData.generalDetails.vehicleCapacity}
            onChange={(e) => handleChange("vehicleCapacity", e.target.value)}
            placeholder="Enter vehicle capacity"
          />
        </div>

        {/* Virtual Yard-In */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-[#0D1A33]">
            Virtual Yard-In
          </Label>
          <ThemedSwitch
            checked={formData.generalDetails.virtualYardIn}
            onCheckedChange={(checked) =>
              handleChange("virtualYardIn", checked)
            }
          />
        </div>

        {/* Radius for Virtual Yard-In */}
        {formData.generalDetails.virtualYardIn && (
          <div className="space-y-2">
            <Label
              htmlFor="radiusVirtualYardIn"
              className="text-sm font-semibold text-[#0D1A33]"
            >
              Radius for Virtual Yard-In (meters)
            </Label>
            <Input
              id="radiusVirtualYardIn"
              type="number"
              min="0"
              value={formData.generalDetails.radiusVirtualYardIn}
              onChange={(e) =>
                handleChange("radiusVirtualYardIn", e.target.value)
              }
              placeholder="Enter radius in meters"
            />
          </div>
        )}

        {/* Speed Limit */}
        <div className="space-y-2">
          <Label
            htmlFor="speedLimit"
            className="text-sm font-semibold text-[#0D1A33]"
          >
            Speed Limit (km/h)
          </Label>
          <Input
            id="speedLimit"
            type="number"
            min="0"
            value={formData.generalDetails.speedLimit}
            onChange={(e) => handleChange("speedLimit", e.target.value)}
            placeholder="Enter speed limit"
          />
        </div>
      </div>
    </div>
  );
};

export default GeneralDetailsTab;
