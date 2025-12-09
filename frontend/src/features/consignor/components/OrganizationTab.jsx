import React, { useState } from "react";
import { Building2, Briefcase, Info } from "lucide-react";
import { State } from "country-state-city";
import { CustomSelect, MultiSelect } from "@/components/ui/Select";

const OrganizationTab = ({ formData, setFormData, errors = {} }) => {
  // Get all Indian states
  const allStates = State.getStatesOfCountry("IN").map((state) => state.name);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      organization: {
        ...prev.organization,
        [field]: value,
      },
    }));
  };

  const selectedStates = formData.organization?.business_area || [];

  return (
    <div className="bg-white rounded-xl p-4">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="w-5 h-5 text-[#0D1A33]" />
        <h2 className="text-lg font-semibold text-[#0D1A33]">
          Organization Details
        </h2>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Company Code */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-[#0D1A33]">
            Company Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.organization?.company_code || ""}
            onChange={(e) =>
              handleInputChange("company_code", e.target.value.toUpperCase())
            }
            maxLength={20}
            className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 transition-colors uppercase ${
              errors.organization?.company_code
                ? "border-red-500 focus:border-red-500"
                : "border-[#E5E7EB] focus:border-[#3B82F6]"
            }`}
            placeholder="Company code (max 20 chars)"
          />
          <div className="flex justify-between items-center">
            {errors.organization?.company_code ? (
              <p className="text-sm text-red-500 flex items-center gap-1">
                ⚠️ {errors.organization.company_code}
              </p>
            ) : (
              <p className="text-xs text-gray-400">
                Uppercase alphanumeric with hyphens (e.g., ABC-123-XYZ)
              </p>
            )}
            <span className="text-xs text-gray-500">
              {(formData.organization?.company_code || "").length}/20
            </span>
          </div>
        </div>

        {/* Business Area - Multi-Select States */}
        <div className="space-y-1 md:col-span-2">
          <label className="block text-xs font-medium text-[#0D1A33]">
            <Briefcase className="inline w-3 h-3 mr-1" />
            Business Area (States) <span className="text-red-500">*</span>
          </label>

          <MultiSelect
            value={selectedStates}
            onValueChange={(value) => handleInputChange("business_area", value)}
            options={allStates}
            placeholder="Select states..."
            searchable={true}
            error={errors.organization?.business_area}
            className="w-full"
          />

          <p className="text-xs text-gray-400 mt-1">
            Select one or more states where this consignor operates
          </p>
        </div>

        {/* Status */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-[#0D1A33]">
            Status
          </label>
          <CustomSelect
            key={`org-status-${formData.organization?.status}`}
            value={formData.organization?.status || "ACTIVE"}
            onValueChange={(value) => handleInputChange("status", value)}
            options={[
              { name: "Active", value: "ACTIVE" },
              { name: "Inactive", value: "INACTIVE" },
            ]}
            placeholder="Select Status"
            searchable={false}
            getOptionLabel={(option) => option.name}
            getOptionValue={(option) => option.value}
            className="w-full text-sm"
            error={errors.organization?.status}
          />
        </div>
      </div>

      {/* Information Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-gray-700 font-medium mb-2">
              Organization Information
            </p>
            <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
              <li>Company Code must be unique across all consignors</li>
              <li>
                Business Area allows selection of multiple states where the
                consignor operates
              </li>
              <li>Select all applicable states for comprehensive coverage</li>
              <li>Use consistent naming conventions for better reporting</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationTab;
