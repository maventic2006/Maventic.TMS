import React, { useState, useRef, useEffect } from "react";
import { Building2, Briefcase, Info, X, ChevronDown } from "lucide-react";
import { State } from "country-state-city";
import { CustomSelect } from "@/components/ui/Select";

const OrganizationTab = ({ formData, setFormData, errors = {} }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Get all Indian states
  const allStates = State.getStatesOfCountry("IN").map((state) => state.name);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      organization: {
        ...prev.organization,
        [field]: value,
      },
    }));
  };

  const handleStateToggle = (stateName) => {
    const currentStates = formData.organization?.business_area || [];
    const isSelected = currentStates.includes(stateName);

    if (isSelected) {
      // Remove state
      handleInputChange(
        "business_area",
        currentStates.filter((s) => s !== stateName)
      );
    } else {
      // Add state
      handleInputChange("business_area", [...currentStates, stateName]);
    }
  };

  const handleRemoveState = (stateName) => {
    const currentStates = formData.organization?.business_area || [];
    handleInputChange(
      "business_area",
      currentStates.filter((s) => s !== stateName)
    );
  };

  const filteredStates = allStates.filter((state) =>
    state.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 transition-colors uppercase ${
              errors.organization?.company_code
                ? "border-red-500 focus:border-red-500"
                : "border-[#E5E7EB] focus:border-[#3B82F6]"
            }`}
            placeholder="e.g., ACME-MFG-001"
          />
          {errors.organization?.company_code && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              ⚠️ {errors.organization.company_code}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            Must be uppercase alphanumeric with hyphens (e.g., ABC-123-XYZ)
          </p>
        </div>

        {/* Business Area - Multi-Select States */}
        <div className="space-y-1 md:col-span-2">
          <label className="block text-xs font-medium text-[#0D1A33]">
            <Briefcase className="inline w-3 h-3 mr-1" />
            Business Area (States) <span className="text-red-500">*</span>
          </label>

          <div className="relative" ref={dropdownRef}>
            {/* Selected States Display */}
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full min-h-[38px] px-3 py-1.5 text-sm border rounded-lg cursor-pointer transition-colors ${
                errors.organization?.business_area
                  ? "border-red-500 focus:border-red-500"
                  : "border-[#E5E7EB] hover:border-[#3B82F6]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1 flex-1">
                  {selectedStates.length === 0 ? (
                    <span className="text-gray-400">Select states...</span>
                  ) : (
                    selectedStates.map((state) => (
                      <span
                        key={state}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveState(state);
                        }}
                      >
                        {state}
                        <X className="w-3 h-3 cursor-pointer hover:text-blue-900" />
                      </span>
                    ))
                  )}
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    isDropdownOpen ? "transform rotate-180" : ""
                  }`}
                />
              </div>
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
                {/* Search Input */}
                <div className="p-2 border-b border-gray-200">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search states..."
                    className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {/* States List */}
                <div className="overflow-y-auto max-h-48">
                  {filteredStates.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-500 text-center">
                      No states found
                    </div>
                  ) : (
                    filteredStates.map((state) => {
                      const isSelected = selectedStates.includes(state);
                      return (
                        <div
                          key={state}
                          onClick={() => handleStateToggle(state)}
                          className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-blue-50 text-blue-700 font-medium"
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            {state}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {errors.organization?.business_area && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              ⚠️ {errors.organization.business_area}
            </p>
          )}
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
