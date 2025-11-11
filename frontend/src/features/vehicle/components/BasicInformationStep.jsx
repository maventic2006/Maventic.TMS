import React from "react";
import { Info, Truck } from "lucide-react";
import { VEHICLE_TYPES } from "../../../utils/vehicleConstants";
import { CustomSelect } from "../../../components/ui/Select";

const BasicInformationTab = ({ formData, setFormData, errors }) => {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-xl flex items-center justify-center shadow-lg">
          <Truck className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#0D1A33]">Basic Information</h2>
          <p className="text-sm text-gray-600">Enter vehicle identification and basic details</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3 mb-6">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">Important Information</p>
          <p>All fields marked with * are mandatory. Ensure registration number and VIN are unique.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Registration Number */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Registration Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.registrationNumber || ""}
            onChange={(e) => handleChange("registrationNumber", e.target.value.toUpperCase())}
            placeholder="e.g., MH12AB1234"
            className={`w-full px-4 py-2.5 border ${
              errors.registrationNumber ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent`}
          />
          {errors.registrationNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.registrationNumber}</p>
          )}
        </div>

        {/* VIN */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            VIN (Vehicle Identification Number)
          </label>
          <input
            type="text"
            value={data.vin || ""}
            onChange={(e) => handleChange("vin", e.target.value.toUpperCase())}
            placeholder="e.g., 1HGBH41JXMN109186"
            maxLength={17}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>

        {/* Vehicle Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Vehicle Type <span className="text-red-500">*</span>
          </label>
          <CustomSelect
            value={data.vehicleType || ""}
            onChange={(value) => handleChange("vehicleType", value)}
            options={VEHICLE_TYPES}
            placeholder="Select Vehicle Type"
            error={errors.vehicleType}
            className="w-full"
          />
          {errors.vehicleType && <p className="mt-1 text-sm text-red-600">{errors.vehicleType}</p>}
        </div>

        {/* Transporter ID */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Transporter ID
          </label>
          <input
            type="text"
            value={data.transporterId || ""}
            onChange={(e) => handleChange("transporterId", e.target.value.toUpperCase())}
            placeholder="e.g., T001"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>

        {/* Transporter Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Transporter Name
          </label>
          <input
            type="text"
            value={data.transporterName || ""}
            onChange={(e) => handleChange("transporterName", e.target.value)}
            placeholder="e.g., ABC Transport Services"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>

        {/* Make */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Make <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.make || ""}
            onChange={(e) => handleChange("make", e.target.value)}
            placeholder="e.g., Tata, Ashok Leyland"
            className={`w-full px-4 py-2.5 border ${
              errors.make ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent`}
          />
          {errors.make && <p className="mt-1 text-sm text-red-600">{errors.make}</p>}
        </div>

        {/* Model */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Model <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.model || ""}
            onChange={(e) => handleChange("model", e.target.value)}
            placeholder="e.g., LPT 1918, 2518"
            className={`w-full px-4 py-2.5 border ${
              errors.model ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent`}
          />
          {errors.model && <p className="mt-1 text-sm text-red-600">{errors.model}</p>}
        </div>

        {/* Year */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Year <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={data.year || new Date().getFullYear()}
            onChange={(e) => handleChange("year", parseInt(e.target.value) || new Date().getFullYear())}
            min="1900"
            max={new Date().getFullYear() + 1}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>

        {/* Leasing Flag */}
        <div>
          <label className="flex items-center gap-3 mt-8">
            <input
              type="checkbox"
              checked={data.leasingFlag || false}
              onChange={(e) => handleChange("leasingFlag", e.target.checked)}
              className="w-5 h-5 text-[#10B981] border-gray-300 rounded focus:ring-2 focus:ring-[#10B981]"
            />
            <span className="text-sm font-semibold text-gray-700">
              This vehicle is leased
            </span>
          </label>
        </div>

        {/* Leased From - only show if leasing flag is true */}
        {data.leasingFlag && (
          <>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Leased From
              </label>
              <input
                type="text"
                value={data.leasedFrom || ""}
                onChange={(e) => handleChange("leasedFrom", e.target.value)}
                placeholder="e.g., XYZ Leasing Company"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Lease Start Date
              </label>
              <input
                type="date"
                value={data.leaseStartDate || ""}
                onChange={(e) => handleChange("leaseStartDate", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Lease End Date
              </label>
              <input
                type="date"
                value={data.leaseEndDate || ""}
                onChange={(e) => handleChange("leaseEndDate", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
              />
            </div>
          </>
        )}

        {/* Color */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Color
          </label>
          <input
            type="text"
            value={data.color || ""}
            onChange={(e) => handleChange("color", e.target.value)}
            placeholder="e.g., White, Blue"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>

        {/* Mileage */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Current Mileage (KM)
          </label>
          <input
            type="number"
            value={data.mileage || 0}
            onChange={(e) => handleChange("mileage", parseFloat(e.target.value) || 0)}
            min="0"
            step="0.01"
            placeholder="e.g., 50000"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>

        {/* GPS Enabled */}
        <div>
          <label className="flex items-center gap-3 mt-8">
            <input
              type="checkbox"
              checked={data.gpsEnabled || false}
              onChange={(e) => handleChange("gpsEnabled", e.target.checked)}
              className="w-5 h-5 text-[#10B981] border-gray-300 rounded focus:ring-2 focus:ring-[#10B981]"
            />
            <span className="text-sm font-semibold text-gray-700">
              GPS Tracking Enabled
            </span>
          </label>
        </div>

        {/* GPS IMEI - only show if GPS is enabled */}
        {data.gpsEnabled && (
          <>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                GPS IMEI Number
              </label>
              <input
                type="text"
                value={data.gpsIMEI || ""}
                onChange={(e) => handleChange("gpsIMEI", e.target.value)}
                placeholder="e.g., 123456789012345"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                GPS Provider
              </label>
              <input
                type="text"
                value={data.gpsProvider || ""}
                onChange={(e) => handleChange("gpsProvider", e.target.value)}
                placeholder="e.g., ABC GPS Services"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
              />
            </div>
          </>
        )}

        {/* Current Driver */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Current Driver ID
          </label>
          <input
            type="text"
            value={data.currentDriver || ""}
            onChange={(e) => handleChange("currentDriver", e.target.value.toUpperCase())}
            placeholder="e.g., DR001"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
};

export default BasicInformationTab;
