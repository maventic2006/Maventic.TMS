import React from "react";
import { useSelector } from "react-redux";
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
  const { user } = useSelector((state) => state.auth);

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
        {/* Consignor ID - Read-only, Auto-filled */}
        <div className="space-y-2">
          <Label
            htmlFor="consignorId"
            className="text-sm font-semibold text-[#0D1A33]"
          >
            Consignor ID
          </Label>
          <Input
            id="consignorId"
            value={user?.consignor_id || "AUTO-GENERATED"}
            readOnly
            disabled
            className="bg-gray-100 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500">
            Auto-filled based on logged-in user
          </p>
        </div>

        {/* Warehouse Name 1 - Mandatory */}
        <div className="space-y-2">
          <Label
            htmlFor="warehouseName"
            className="text-sm font-semibold text-[#0D1A33]"
          >
            Warehouse Name 1 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="warehouseName"
            value={formData.generalDetails.warehouseName}
            onChange={(e) => handleChange("warehouseName", e.target.value)}
            placeholder="Enter warehouse name"
            maxLength={30}
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

        {/* Warehouse Name 2 - Mandatory */}
        <div className="space-y-2">
          <Label
            htmlFor="warehouseName2"
            className="text-sm font-semibold text-[#0D1A33]"
          >
            Warehouse Name 2 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="warehouseName2"
            value={formData.generalDetails.warehouseName2}
            onChange={(e) => handleChange("warehouseName2", e.target.value)}
            placeholder="Enter warehouse name 2"
            maxLength={30}
            className={
              errors?.["generalDetails.warehouseName2"] ? "border-red-500" : ""
            }
          />
          {errors?.["generalDetails.warehouseName2"] && (
            <p className="text-xs text-red-500">
              {errors["generalDetails.warehouseName2"]}
            </p>
          )}
        </div>

        {/* Warehouse Type - Mandatory */}
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
              <SelectItem value="Manufacturing">Manufacturing</SelectItem>
              <SelectItem value="Mining">Mining</SelectItem>
              <SelectItem value="Extraction">Extraction</SelectItem>
              <SelectItem value="Assembling">Assembling</SelectItem>
              <SelectItem value="Food Processing">Food Processing</SelectItem>
              <SelectItem value="Cold Storage">Cold Storage</SelectItem>
              <SelectItem value="Distributor">Distributor</SelectItem>
            </SelectContent>
          </Select>
          {errors?.["generalDetails.warehouseType"] && (
            <p className="text-xs text-red-500">
              {errors["generalDetails.warehouseType"]}
            </p>
          )}
        </div>

        {/* Material Type - Mandatory Single Select */}
        <div className="space-y-2">
          <Label
            htmlFor="materialType"
            className="text-sm font-semibold text-[#0D1A33]"
          >
            Material Type <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.generalDetails.materialType}
            onValueChange={(value) => handleChange("materialType", value)}
          >
            <SelectTrigger
              className={
                errors?.["generalDetails.materialType"] ? "border-red-500" : ""
              }
            >
              <SelectValue placeholder="Select material type" />
            </SelectTrigger>
            <SelectContent>
              {masterData?.materialTypes?.map((type) => (
                <SelectItem
                  key={type.material_types_id}
                  value={type.material_types_id}
                >
                  {type.material_types}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.["generalDetails.materialType"] && (
            <p className="text-xs text-red-500">
              {errors["generalDetails.materialType"]}
            </p>
          )}
          <p className="text-xs text-gray-500">
            Type of materials that can be shipped from this warehouse
          </p>
        </div>

        {/* Language - Mandatory, Default EN */}
        <div className="space-y-2">
          <Label
            htmlFor="language"
            className="text-sm font-semibold text-[#0D1A33]"
          >
            Language <span className="text-red-500">*</span>
          </Label>
          <Input
            id="language"
            value={formData.generalDetails.language}
            onChange={(e) => handleChange("language", e.target.value)}
            placeholder="EN"
            maxLength={10}
          />
        </div>

        {/* Vehicle Capacity - Mandatory */}
        <div className="space-y-2">
          <Label
            htmlFor="vehicleCapacity"
            className="text-sm font-semibold text-[#0D1A33]"
          >
            Vehicle Capacity <span className="text-red-500">*</span>
          </Label>
          <Input
            id="vehicleCapacity"
            type="number"
            min="0"
            value={formData.generalDetails.vehicleCapacity}
            onChange={(e) =>
              handleChange("vehicleCapacity", parseInt(e.target.value) || 0)
            }
            placeholder="Maximum number of vehicles in the warehouse"
          />
          <p className="text-xs text-gray-500">
            Maximum number of vehicle capacity in the warehouse
          </p>
        </div>

        {/* Speed Limit - Mandatory, Default 20 KM/H */}
        <div className="space-y-2">
          <Label
            htmlFor="speedLimit"
            className="text-sm font-semibold text-[#0D1A33]"
          >
            Speed Limit (KM/H) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="speedLimit"
            type="number"
            min="1"
            max="200"
            value={formData.generalDetails.speedLimit}
            onChange={(e) =>
              handleChange("speedLimit", parseInt(e.target.value) || 20)
            }
            placeholder="20"
          />
          <p className="text-xs text-gray-500">Default: 20 KM/H</p>
        </div>

        {/* Virtual Yard-In - Optional Boolean */}
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
          <p className="text-xs text-gray-500">
            If there is no Physical Yard, then by geo fencing Virtual Yard-In
            can be done
          </p>
        </div>

        {/* Radius for Virtual Yard-In - Optional, shown only if Virtual Yard-In is enabled */}
        {formData.generalDetails.virtualYardIn && (
          <div className="space-y-2">
            <Label
              htmlFor="radiusVirtualYardIn"
              className="text-sm font-semibold text-[#0D1A33]"
            >
              Radius for Virtual Yard-In (KM)
            </Label>
            <Input
              id="radiusVirtualYardIn"
              type="number"
              min="0"
              step="0.01"
              value={formData.generalDetails.radiusVirtualYardIn}
              onChange={(e) =>
                handleChange(
                  "radiusVirtualYardIn",
                  parseFloat(e.target.value) || 0
                )
              }
              placeholder="Enter radius in KM"
            />
            <p className="text-xs text-gray-500">
              Radius in kilometers for virtual yard boundary
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneralDetailsTab;
