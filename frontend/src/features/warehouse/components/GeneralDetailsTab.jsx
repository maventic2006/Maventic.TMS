import React from "react";
import { useSelector } from "react-redux";
import { Switch } from "../../../components/ui/switch";
import {
  CustomSelect,
  GlobalDropdownProvider,
} from "../../../components/ui/Select";

const GeneralDetailsTab = ({ formData, setFormData, errors, masterData }) => {
  const { user } = useSelector((state) => state.auth);

  // Safe navigation - ensure formData has the expected structure
  const generalDetails = formData?.generalDetails || {
    consignorId: user?.consignor_id,
    warehouseName: "",
    warehouseName2: "",
    warehouseType: "",
    materialType: "",
    language: "EN",
    vehicleCapacity: 0,
    speedLimit: 20,
    virtualYardIn: false,
    radiusVirtualYardIn: 0,
    weighBridge: false,
    gatepassSystem: false,
    fuelAvailability: false,
    stagingArea: false,
    driverWaitingArea: false,
    gateInChecklistAuth: false,
    gateOutChecklistAuth: false,
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      generalDetails: {
        ...(prev?.generalDetails || {}),
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
              value={generalDetails.warehouseName || ""}
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
              value={generalDetails.warehouseName2 || ""}
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
              value={generalDetails.warehouseType || ""}
              onValueChange={(value) => handleChange("warehouseType", value)}
              options={masterData?.warehouseTypes || []}
              getOptionLabel={(option) => option.warehouse_type}
              getOptionValue={(option) => option.warehouse_type_id}
              placeholder={
                masterData?.warehouseTypes?.length > 0
                  ? "Select warehouse type"
                  : "Loading..."
              }
              error={errors?.["generalDetails.warehouseType"]}
              required
              searchable
              disabled={
                !masterData?.warehouseTypes ||
                masterData.warehouseTypes.length === 0
              }
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
              value={generalDetails.materialType || ""}
              onValueChange={(value) => handleChange("materialType", value)}
              options={masterData?.materialTypes || []}
              getOptionLabel={(option) => option.material_types}
              getOptionValue={(option) => option.material_types_id}
              placeholder={
                masterData?.materialTypes?.length > 0
                  ? "Select material type"
                  : "Loading..."
              }
              error={errors?.["generalDetails.materialType"]}
              required
              searchable
              disabled={
                !masterData?.materialTypes ||
                masterData.materialTypes.length === 0
              }
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
              value={generalDetails.language || "EN"}
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
              value={generalDetails.vehicleCapacity || 0}
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
              value={generalDetails.speedLimit || 20}
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
              checked={generalDetails.virtualYardIn || false}
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
          {generalDetails.virtualYardIn && (
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#0D1A33]">
                Radius for Virtual Yard-In (KM)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={generalDetails.radiusVirtualYardIn || 0}
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

          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#0D1A33]">
              Weigh Bridge
            </label>
            <Switch
              checked={generalDetails.weighBridge || false}
              onCheckedChange={(checked) =>
                handleChange("weighBridge", checked)
              }
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#0D1A33]">
              Gatepass System
            </label>
            <Switch
              checked={generalDetails.gatepassSystem || false}
              onCheckedChange={(checked) =>
                handleChange("gatepassSystem", checked)
              }
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#0D1A33]">
              Fuel Availability
            </label>
            <Switch
              checked={generalDetails.fuelAvailability || false}
              onCheckedChange={(checked) =>
                handleChange("fuelAvailability", checked)
              }
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#0D1A33]">
              Staging Area
            </label>
            <Switch
              checked={generalDetails.stagingArea || false}
              onCheckedChange={(checked) =>
                handleChange("stagingArea", checked)
              }
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#0D1A33]">
              Driver Waiting Area
            </label>
            <Switch
              checked={generalDetails.driverWaitingArea || false}
              onCheckedChange={(checked) =>
                handleChange("driverWaitingArea", checked)
              }
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#0D1A33]">
              Gate In Checklist Authorization
            </label>
            <Switch
              checked={generalDetails.gateInChecklistAuth || false}
              onCheckedChange={(checked) =>
                handleChange("gateInChecklistAuth", checked)
              }
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#0D1A33]">
              Gate Out Checklist Authorization
            </label>
            <Switch
              checked={generalDetails.gateOutChecklistAuth || false}
              onCheckedChange={(checked) =>
                handleChange("gateOutChecklistAuth", checked)
              }
            />
          </div>
        </div>
      </div>
    </GlobalDropdownProvider>
  );
};

export default GeneralDetailsTab;
