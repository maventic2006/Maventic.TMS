import React, { useEffect } from "react";
import { Building2, Truck, Train, Plane, Ship } from "lucide-react";
import { getComponentTheme } from "../../../utils/theme";

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
    <div className="bg-white rounded-xl p-6">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <Building2 className="w-6 h-6 text-[#0D1A33]" />
        <h2 className="text-xl font-semibold text-[#0D1A33]">
          Transporter General Details
        </h2>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Row 1 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#0D1A33]">
            Transporter ID
          </label>
          <input
            type="text"
            value={formData.transporterId || "Auto-generated"}
            readOnly
            className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
            placeholder="Auto-generated"
          />
          <p className="text-xs text-gray-500">
            ID will be auto-generated upon creation
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#0D1A33]">
            Business Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.generalDetails?.businessName || ""}
            onChange={(e) => handleInputChange("businessName", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 transition-colors ${
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

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#0D1A33]">
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
            className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed"
            readOnly
          />
          <p className="text-xs text-gray-500">
            Rating will be calculated based on performance
          </p>
        </div>

        {/* Row 2 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#0D1A33]">
            From Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.generalDetails?.fromDate || ""}
            onChange={(e) => handleInputChange("fromDate", e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 transition-colors ${
              errors.fromDate
                ? "border-red-500 focus:border-red-500"
                : "border-[#E5E7EB] focus:border-[#3B82F6]"
            }`}
          />
          {formData.generalDetails?.fromDate && (
            <p className="text-xs text-gray-600">
              Display format: {formatDate(formData.generalDetails.fromDate)}
            </p>
          )}
          {errors.fromDate && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              ⚠️ {errors.fromDate}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#0D1A33]">
            To Date
          </label>
          <input
            type="date"
            value={formData.generalDetails?.toDate || ""}
            onChange={(e) => handleInputChange("toDate", e.target.value)}
            min={
              formData.generalDetails?.fromDate ||
              new Date().toISOString().split("T")[0]
            }
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 transition-colors ${
              errors.toDate
                ? "border-red-500 focus:border-red-500"
                : "border-[#E5E7EB] focus:border-[#3B82F6]"
            }`}
          />
          {formData.generalDetails?.toDate && (
            <p className="text-xs text-gray-600">
              Display format: {formatDate(formData.generalDetails.toDate)}
            </p>
          )}
          {errors.toDate && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              ⚠️ {errors.toDate}
            </p>
          )}
        </div>
      </div>

      {/* Transport Modes Section */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-[#0D1A33]">
            Transport Modes <span className="text-red-500">*</span>
          </label>
          {errors.transMode && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              ⚠️ {errors.transMode}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {transportModes.map((mode) => {
            const Icon = mode.icon;
            const isSelected =
              formData.generalDetails?.transMode?.[mode.key] || false;

            return (
              <div
                key={mode.key}
                onClick={() => handleTransportModeChange(mode.key, !isSelected)}
                className={`${transportModeTheme.base} ${
                  isSelected
                    ? transportModeTheme.active
                    : transportModeTheme.inactive
                }`}
              >
                <Icon
                  className={`w-8 h-8 ${
                    isSelected ? "text-[#14B8A6]" : "text-gray-400"
                  }`}
                />
                <div className="flex items-center gap-2">
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      isSelected
                        ? "bg-[#14B8A6] border-[#14B8A6]"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      isSelected ? "text-[#14B8A6]" : "text-gray-600"
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

      {/* Active Flag */}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={formData.generalDetails?.activeFlag !== false}
              onChange={(e) =>
                handleInputChange("activeFlag", e.target.checked)
              }
              className="sr-only"
            />
            <div
              className={`w-12 h-6 rounded-full transition-colors ${
                formData.generalDetails?.activeFlag !== false
                  ? "bg-[#14B8A6]"
                  : "bg-gray-300"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                  formData.generalDetails?.activeFlag !== false
                    ? "translate-x-6"
                    : "translate-x-0.5"
                } mt-0.5`}
              />
            </div>
          </div>
          <span className="text-sm font-medium text-[#0D1A33]">
            Active Flag
          </span>
        </label>
      </div>
    </div>
  );
};

export default GeneralDetailsTab;
