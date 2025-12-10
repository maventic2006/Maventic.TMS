import React, { useEffect } from "react";
import { Building2, Truck, Train, Plane, Ship } from "lucide-react";
import { getComponentTheme } from "../../../utils/theme";
import { Switch } from "../../../components/ui/switch";

const GeneralDetailsTab = ({
  formData,
  setFormData,
  errors = {},
  nextTransporterId,
}) => {
  const transportModeTheme = getComponentTheme("transportModeCard");

  // Generate next transporter ID on component mount
  useEffect(() => {
    if (!formData.transporterId && nextTransporterId) {
      setFormData((prev) => ({
        ...prev,
        transporterId: nextTransporterId,
      }));
    }
  }, [nextTransporterId, formData.transporterId, setFormData]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      generalDetails: {
        ...prev.generalDetails,
        [field]: value,
      },
    }));
  };

  const handleTransportModeChange = (mode, checked) => {
    setFormData((prev) => ({
      ...prev,
      generalDetails: {
        ...prev.generalDetails,
        transMode: {
          ...prev.generalDetails.transMode,
          [mode]: checked,
        },
      },
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const transportModes = [
    {
      key: "road",
      label: "RD - Road",
      icon: Truck,
      color: "#14B8A6",
    },
    {
      key: "rail",
      label: "RL - Rail",
      icon: Train,
      color: "#14B8A6",
    },
    {
      key: "air",
      label: "A - Air",
      icon: Plane,
      color: "#14B8A6",
    },
    {
      key: "sea",
      label: "S - Sea",
      icon: Ship,
      color: "#14B8A6",
    },
  ];

  return (
    <div className="bg-white rounded-xl p-4">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="w-5 h-5 text-[#0D1A33]" />
        <h2 className="text-lg font-semibold text-[#0D1A33]">
          Transporter General Details
        </h2>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Row 1 */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-[#0D1A33]">
            Business Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.generalDetails?.businessName || ""}
            onChange={(e) => handleInputChange("businessName", e.target.value)}
            className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 transition-colors ${
              errors.businessName
                ? "border-red-500 focus:border-red-500"
                : "border-[#E5E7EB] focus:border-[#3B82F6]"
            }`}
            placeholder="Enter business name"
          />
          {errors.businessName && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              ⚠️ {errors.businessName}
            </p>
          )}
        </div>

        {/* <div className="space-y-1">
          <label className="block text-xs font-medium text-[#0D1A33]">
            Average Rating
          </label>
          <input
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={formData.generalDetails?.avgRating || 0}
            onChange={(e) =>
              handleInputChange("avgRating", parseFloat(e.target.value) || 0)
            }
            className="w-full bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 transition-colors"
            readOnly
          />
          </div> */}

        {/* Row 2 */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-[#0D1A33]">
            From Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.generalDetails?.fromDate || ""}
            readOnly
            disabled
            className="w-full px-3 py-1.5 text-sm border rounded-lg bg-gray-50 cursor-not-allowed opacity-70 border-[#E5E7EB]"
            title="From Date is automatically set to current date"
          />
          {errors.fromDate && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              ⚠️ {errors.fromDate}
            </p>
          )}
        </div>

        {/* Transport Modes Section */}
        <div className="space-y-1 mb-4 col-span-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-[#0D1A33]">
              Transport Modes <span className="text-red-500">*</span>
            </label>
            {errors.transMode && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                ⚠️ {errors.transMode}
              </p>
            )}
          </div>

          <div className="grid grid-cols-4 gap-2">
            {transportModes.map((mode) => {
              const Icon = mode.icon;
              const isSelected =
                formData.generalDetails?.transMode?.[mode.key] || false;

              return (
                <div
                  key={mode.key}
                  onClick={() =>
                    handleTransportModeChange(mode.key, !isSelected)
                  }
                  className={`${transportModeTheme.base} ${
                    isSelected
                      ? transportModeTheme.active
                      : transportModeTheme.inactive
                  }`}
                >
                  <Icon
                    className={`w-7 h-7 ${
                      isSelected ? "text-[#10B981]" : "text-gray-400"
                    }`}
                  />
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-[#10B981] border-[#10B981]"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {isSelected && (
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        isSelected ? "text-[#10B981]" : "text-gray-600"
                      }`}
                    >
                      {mode.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Flag */}
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <Switch
            checked={formData.generalDetails?.activeFlag !== false}
            onCheckedChange={(checked) =>
              handleInputChange("activeFlag", checked)
            }
          />
          <span className="text-xs font-medium text-[#0D1A33]">
            Active Flag
          </span>
        </label>
      </div>
    </div>
  );
};

export default GeneralDetailsTab;
