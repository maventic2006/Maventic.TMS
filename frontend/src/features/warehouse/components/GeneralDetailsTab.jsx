import React from "react";
import { useSelector } from "react-redux";
import { Switch } from "../../../components/ui/switch";
import {
  CustomSelect,
  GlobalDropdownProvider,
} from "../../../components/ui/Select";

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
    <GlobalDropdownProvider>
      <div className="bg-white rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Consignor ID - Read-only, Auto-filled */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#0D1A33]">
              Consignor ID
            </label>
            <input
              type="text"
              value={user?.consignor_id || "AUTO-GENERATED"}
              readOnly
              disabled
              className="w-full px-3 py-1.5 text-sm bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed"
            />
            <p className="text-xs text-gray-500">
              Auto-filled based on logged-in user
            </p>
          </div>

          {/* Warehouse Name 1 - Mandatory */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#0D1A33]">
              Warehouse Name 1 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.generalDetails.warehouseName}
              onChange={(e) => handleChange("warehouseName", e.target.value)}
              placeholder="Enter warehouse name"
              maxLength={30}
              className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 transition-colors ${
                errors?.["generalDetails.warehouseName"]
                  ? "border-red-500 focus:border-red-500"
                  : "border-[#E5E7EB] focus:border-[#3B82F6]"
              }`}
            />
            {errors?.["generalDetails.warehouseName"] && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                ⚠️ {errors["generalDetails.warehouseName"]}
              </p>
            )}
          </div>

          {/* Warehouse Name 2 - Mandatory */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#0D1A33]">
              Warehouse Name 2 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.generalDetails.warehouseName2}
              onChange={(e) => handleChange("warehouseName2", e.target.value)}
              placeholder="Enter warehouse name 2"
              maxLength={30}
              className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 transition-colors ${
                errors?.["generalDetails.warehouseName2"]
                  ? "border-red-500 focus:border-red-500"
                  : "border-[#E5E7EB] focus:border-[#3B82F6]"
              }`}
            />
            {errors?.["generalDetails.warehouseName2"] && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                ⚠️ {errors["generalDetails.warehouseName2"]}
              </p>
            )}
          </div>

          {/* Warehouse Type - Mandatory */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#0D1A33]">
              Warehouse Type <span className="text-red-500">*</span>
            </label>
            <CustomSelect
              value={formData.generalDetails.warehouseType}
              onValueChange={(value) => handleChange("warehouseType", value)}
              options={masterData?.warehouseTypes || []}
              getOptionLabel={(option) => option.warehouse_type}
              getOptionValue={(option) => option.warehouse_type_id}
              placeholder="Select warehouse type"
              error={errors?.["generalDetails.warehouseType"]}
              required
              searchable
            />
            {errors?.["generalDetails.warehouseType"] && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                ⚠️ {errors["generalDetails.warehouseType"]}
              </p>
            )}
          </div>

          {/* Material Type - Mandatory Single Select */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#0D1A33]">
              Material Type <span className="text-red-500">*</span>
            </label>
            <CustomSelect
              value={formData.generalDetails.materialType}
              onValueChange={(value) => handleChange("materialType", value)}
              options={masterData?.materialTypes || []}
              getOptionLabel={(option) => option.material_types}
              getOptionValue={(option) => option.material_types_id}
              placeholder="Select material type"
              error={errors?.["generalDetails.materialType"]}
              required
              searchable
            />
            {errors?.["generalDetails.materialType"] && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                ⚠️ {errors["generalDetails.materialType"]}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Type of materials that can be shipped from this warehouse
            </p>
          </div>

          {/* Language - Mandatory, Default EN */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#0D1A33]">
              Language <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.generalDetails.language}
              onChange={(e) => handleChange("language", e.target.value)}
              placeholder="EN"
              maxLength={10}
              className="w-full px-3 py-1.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-colors"
            />
          </div>

          {/* Vehicle Capacity - Mandatory */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#0D1A33]">
              Vehicle Capacity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={formData.generalDetails.vehicleCapacity}
              onChange={(e) =>
                handleChange("vehicleCapacity", parseInt(e.target.value) || 0)
              }
              placeholder="Maximum number of vehicles in the warehouse"
              className="w-full px-3 py-1.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-colors"
            />
            <p className="text-xs text-gray-500">
              Maximum number of vehicle capacity in the warehouse
            </p>
          </div>

          {/* Speed Limit - Mandatory, Default 20 KM/H */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#0D1A33]">
              Speed Limit (KM/H) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max="200"
              value={formData.generalDetails.speedLimit}
              onChange={(e) =>
                handleChange("speedLimit", parseInt(e.target.value) || 20)
              }
              placeholder="20"
              className="w-full px-3 py-1.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-colors"
            />
            <p className="text-xs text-gray-500">Default: 20 KM/H</p>
          </div>

          {/* Virtual Yard-In - Optional Boolean */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#0D1A33] mb-2">
              Virtual Yard-In
            </label>
            <Switch
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
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#0D1A33]">
                Radius for Virtual Yard-In (KM)
              </label>
              <input
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
                className="w-full px-3 py-1.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-colors"
              />
              <p className="text-xs text-gray-500">
                Radius in kilometers for virtual yard boundary
              </p>
            </div>
          )}
        </div>
      </div>
    </GlobalDropdownProvider>
  );
};

export default GeneralDetailsTab;
