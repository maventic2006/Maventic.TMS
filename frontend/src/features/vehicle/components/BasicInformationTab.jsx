import React from "react";
import { Info, Truck } from "lucide-react";
import { CustomSelect } from "../../../components/ui/Select";

const BasicInformationTab = ({ formData, setFormData, errors, masterData }) => {
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      basicInformation: {
        ...prev.basicInformation,
        [field]: value,
      },
    }));
  };

  const data = formData.basicInformation || {};
  
  // Get current year for month/year picker
  const currentYear = new Date().getFullYear();

  // ✅ USE MASTER DATA FROM API - NOT HARDCODED CONSTANTS
  const vehicleTypes = masterData?.vehicleTypes || [
    { value: 'VT001', label: 'HCV - Heavy Commercial Vehicle' },
    { value: 'VT002', label: 'MCV - Medium Commercial Vehicle' },
    { value: 'VT003', label: 'LCV - Light Commercial Vehicle' }
  ];

  // ✅ USE MASTER DATA FROM API - NOT HARDCODED CONSTANTS
  const usageTypes = masterData?.usageTypes || [
    { value: 'UT001', label: 'COMMERCIAL' },
    { value: 'UT002', label: 'PRIVATE' },
    { value: 'UT003', label: 'RENTAL' },
    { value: 'UT004', label: 'LEASE' }
  ];

  return (
    <div className="space-y-5">
      {/* 3-column grid layout with smaller inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Registration Number */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Registration Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.registrationNumber || ""}
            onChange={(e) => handleChange("registrationNumber", e.target.value.toUpperCase())}
            placeholder="e.g., MH12AB1234"
            maxLength={15}
            className={`w-full px-3 py-2 text-sm border ${
              errors.registrationNumber ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent`}
          />
          {errors.registrationNumber && <p className="mt-1 text-xs text-red-600">{errors.registrationNumber}</p>}
        </div>

        {/* Make/Brand */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Make/Brand <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.make || ""}
            onChange={(e) => handleChange("make", e.target.value)}
            placeholder="e.g., Tata, Ashok Leyland"
            className={`w-full px-3 py-2 text-sm border ${
              errors.make ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent`}
          />
          {errors.make && <p className="mt-1 text-xs text-red-600">{errors.make}</p>}
        </div>

        {/* Maker Model */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Maker Model
          </label>
          <input
            type="text"
            value={data.model || ""}
            onChange={(e) => handleChange("model", e.target.value)}
            placeholder="e.g., LPT 1918, ECOMET 1215"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>

        {/* Year of Manufacture */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Year of Manufacture <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={data.year || currentYear}
            onChange={(e) => handleChange("year", parseInt(e.target.value) || currentYear)}
            min="1990"
            max={currentYear + 1}
            placeholder={currentYear.toString()}
            className={`w-full px-3 py-2 text-sm border ${
              errors.year ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent`}
          />
          {errors.year && <p className="mt-1 text-xs text-red-600">{errors.year}</p>}
        </div>

        {/* VIN (Vehicle Identification Number) */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            VIN (Vehicle Identification Number) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.vin || ""}
            onChange={(e) => handleChange("vin", e.target.value.toUpperCase())}
            placeholder="e.g., 1HGBH41JXMN109186"
            maxLength={17}
            className={`w-full px-3 py-2 text-sm border ${
              errors.vin ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent`}
          />
          {errors.vin && <p className="mt-1 text-xs text-red-600">{errors.vin}</p>}
        </div>

        {/* Vehicle Type */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Vehicle Type <span className="text-red-500">*</span>
          </label>
          <CustomSelect
            value={data.vehicleType || ""}
            onChange={(value) => handleChange("vehicleType", value)}
            options={vehicleTypes}
            placeholder="Select Type"
            error={errors.vehicleType}
            className="w-full"
          />
          {errors.vehicleType && <p className="mt-1 text-xs text-red-600">{errors.vehicleType}</p>}
        </div>

        {/* Vehicle Category */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Vehicle Category
          </label>
          <input
            type="text"
            value={data.vehicleCategory || ""}
            onChange={(e) => handleChange("vehicleCategory", e.target.value)}
            placeholder="e.g., Commercial, Heavy Duty"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>

        {/* Manufacturing Month & Year */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Manufacturing Month & Year <span className="text-red-500">*</span>
          </label>
          <input
            type="month"
            value={data.manufacturingMonthYear || ""}
            onChange={(e) => handleChange("manufacturingMonthYear", e.target.value)}
            max={`${currentYear}-12`}
            className={`w-full px-3 py-2 text-sm border ${
              errors.manufacturingMonthYear ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent`}
          />
          {errors.manufacturingMonthYear && (
            <p className="mt-1 text-xs text-red-600">{errors.manufacturingMonthYear}</p>
          )}
        </div>

        {/* GPS Tracker IMEI Number */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            GPS Tracker IMEI Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.gpsIMEI || ""}
            onChange={(e) => handleChange("gpsIMEI", e.target.value)}
            placeholder="123456789012345"
            maxLength={15}
            className={`w-full px-3 py-2 text-sm border ${
              errors.gpsIMEI ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent`}
          />
          {errors.gpsIMEI && <p className="mt-1 text-xs text-red-600">{errors.gpsIMEI}</p>}
        </div>

        {/* GPS Tracker Active Flag */}
        <div className="flex items-center pt-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.gpsActive || false}
              onChange={(e) => handleChange("gpsActive", e.target.checked)}
              className="w-4 h-4 text-[#10B981] border-gray-300 rounded focus:ring-2 focus:ring-[#10B981]"
            />
            <span className="text-xs font-semibold text-gray-700">
              GPS Tracker Active <span className="text-red-500">*</span>
            </span>
          </label>
        </div>

        {/* Leasing Flag */}
        <div className="flex items-center pt-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.leasingFlag || false}
              onChange={(e) => handleChange("leasingFlag", e.target.checked)}
              className="w-4 h-4 text-[#10B981] border-gray-300 rounded focus:ring-2 focus:ring-[#10B981]"
            />
            <span className="text-xs font-semibold text-gray-700">
              Leasing Flag
            </span>
          </label>
        </div>

        {/* Avg Running Speed */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Avg Running Speed (km/h)
          </label>
          <input
            type="number"
            value={data.avgRunningSpeed || ""}
            onChange={(e) => handleChange("avgRunningSpeed", parseFloat(e.target.value) || "")}
            min="0"
            step="0.1"
            placeholder="60"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>

        {/* Max Running Speed */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Max Running Speed (km/h)
          </label>
          <input
            type="number"
            value={data.maxRunningSpeed || ""}
            onChange={(e) => handleChange("maxRunningSpeed", parseFloat(e.target.value) || "")}
            min="0"
            step="0.1"
            placeholder="100"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>

        {/* Usage Type */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Usage Type <span className="text-red-500">*</span>
          </label>
          <CustomSelect
            value={data.usageType || ""}
            onChange={(value) => handleChange("usageType", value)}
            options={usageTypes}
            placeholder="Select Usage Type"
            error={errors.usageType}
            className="w-full"
          />
          {errors.usageType && <p className="mt-1 text-xs text-red-600">{errors.usageType}</p>}
        </div>

        {/* Safety Inspection Date */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Safety Inspection Date
          </label>
          <input
            type="date"
            value={data.safetyInspectionDate || ""}
            onChange={(e) => handleChange("safetyInspectionDate", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>

        {/* Taxes and Fees */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Taxes and Fees
          </label>
          <input
            type="number"
            value={data.taxesAndFees || ""}
            onChange={(e) => handleChange("taxesAndFees", parseFloat(e.target.value) || "")}
            min="0"
            step="0.01"
            placeholder="50000"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>
      </div>

      {/* Information panel at the bottom */}
      <div className="mt-6 bg-blue-50/50 border border-blue-200/50 rounded-lg p-3 flex items-start gap-2">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-blue-800">
          <p className="font-semibold mb-0.5">Basic Vehicle Information</p>
          <p className="text-blue-700">Fields marked with * are mandatory. Ensure Make/Brand, VIN, and Manufacturing details are accurate for proper vehicle identification.</p>
        </div>
      </div>
    </div>
  );
};

export default BasicInformationTab;
