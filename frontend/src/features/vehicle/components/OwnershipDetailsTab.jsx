import React from "react";
import { FileUser, Info } from "lucide-react";
import { OWNERSHIP_TYPES, PERMIT_TYPES } from "../../../utils/vehicleConstants";

const OwnershipDetailsTab = ({ formData, setFormData, errors }) => {
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      ownershipDetails: {
        ...prev.ownershipDetails,
        [field]: value,
      },
    }));
  };

  const data = formData.ownershipDetails || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-xl flex items-center justify-center shadow-lg">
          <FileUser className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#0D1A33]">Ownership Details</h2>
          <p className="text-sm text-gray-600">Enter ownership and registration information</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3 mb-6">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">Ownership Information</p>
          <p>Provide accurate ownership and registration details for legal compliance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ownership Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Ownership <span className="text-red-500">*</span>
          </label>
          <select
            value={data.ownership || ""}
            onChange={(e) => handleChange("ownership", e.target.value)}
            className={`w-full px-4 py-2.5 border ${
              errors.ownership ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent`}
          >
            <option value="">Select Ownership Type</option>
            {OWNERSHIP_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.ownership && <p className="mt-1 text-sm text-red-600">{errors.ownership}</p>}
        </div>

        {/* Owner Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Owner Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.ownerName || ""}
            onChange={(e) => handleChange("ownerName", e.target.value)}
            placeholder="e.g., John Doe"
            className={`w-full px-4 py-2.5 border ${
              errors.ownerName ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent`}
          />
          {errors.ownerName && <p className="mt-1 text-sm text-red-600">{errors.ownerName}</p>}
        </div>

        {/* Contact Number */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Contact Number
          </label>
          <input
            type="tel"
            value={data.contactNumber || ""}
            onChange={(e) => handleChange("contactNumber", e.target.value)}
            placeholder="e.g., +91 98765 43210"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={data.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="e.g., owner@example.com"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>

        {/* Purchase Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Purchase Date
          </label>
          <input
            type="date"
            value={data.purchaseDate || ""}
            onChange={(e) => handleChange("purchaseDate", e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>

        {/* Purchase Price */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Purchase Price
          </label>
          <input
            type="number"
            value={data.purchasePrice || 0}
            onChange={(e) => handleChange("purchasePrice", parseFloat(e.target.value) || 0)}
            min="0"
            step="0.01"
            placeholder="e.g., 2500000"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>

        {/* Registration Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Registration Date
          </label>
          <input
            type="date"
            value={data.registrationDate || ""}
            onChange={(e) => handleChange("registrationDate", e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>

        {/* Registration Authority */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Registration Authority
          </label>
          <input
            type="text"
            value={data.registrationAuthority || ""}
            onChange={(e) => handleChange("registrationAuthority", e.target.value)}
            placeholder="e.g., Maharashtra RTO"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>

        {/* RTO Code */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            RTO Code
          </label>
          <input
            type="text"
            value={data.rtoCode || ""}
            onChange={(e) => handleChange("rtoCode", e.target.value.toUpperCase())}
            placeholder="e.g., MH12"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>

        {/* Chassis Number */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Chassis Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.chassisNumber || ""}
            onChange={(e) => handleChange("chassisNumber", e.target.value.toUpperCase())}
            placeholder="e.g., CHS987654321"
            className={`w-full px-4 py-2.5 border ${
              errors.chassisNumber ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent`}
          />
          {errors.chassisNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.chassisNumber}</p>
          )}
        </div>

        {/* Permit Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Permit Type
          </label>
          <select
            value={data.permitType || ""}
            onChange={(e) => handleChange("permitType", e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          >
            <option value="">Select Permit Type</option>
            {PERMIT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Permit Valid Till */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Permit Valid Till
          </label>
          <input
            type="date"
            value={data.permitValidTill || ""}
            onChange={(e) => handleChange("permitValidTill", e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
};

export default OwnershipDetailsTab;