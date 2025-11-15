import React, { useState, memo } from "react";
import { Filter, X, Search, Briefcase, Activity } from "lucide-react";

const ConsignorFilterPanel = ({
  filters,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
  showFilters,
}) => {
  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
    { value: "PENDING", label: "Pending" },
  ];

  const handleInputChange = (field, value) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  const handleClearAll = () => {
    onClearFilters();
  };

  // Count active filters
  const activeFilterCount = Object.values(filters).filter(
    (value) => value && value !== ""
  ).length;

  if (!showFilters) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Filter className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            {activeFilterCount > 0 && (
              <p className="text-sm text-gray-600">
                {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} applied
              </p>
            )}
          </div>
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <X className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Customer ID Search */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Search className="w-4 h-4 text-gray-500" />
            Customer ID
          </label>
          <input
            type="text"
            value={filters.customerId || ""}
            onChange={(e) => handleInputChange("customerId", e.target.value)}
            placeholder="Search by ID..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
          />
        </div>

        {/* Customer Name Search */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Search className="w-4 h-4 text-gray-500" />
            Customer Name
          </label>
          <input
            type="text"
            value={filters.customerName || ""}
            onChange={(e) => handleInputChange("customerName", e.target.value)}
            placeholder="Search by name..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
          />
        </div>

        {/* Industry Type Filter */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Briefcase className="w-4 h-4 text-gray-500" />
            Industry Type
          </label>
          <select
            value={filters.industryType || ""}
            onChange={(e) => handleInputChange("industryType", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm bg-white cursor-pointer"
          >
            <option value="">All Industries</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Retail">Retail</option>
            <option value="Logistics">Logistics</option>
            <option value="Technology">Technology</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Activity className="w-4 h-4 text-gray-500" />
            Status
          </label>
          <select
            value={filters.status || ""}
            onChange={(e) => handleInputChange("status", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm bg-white cursor-pointer"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default memo(ConsignorFilterPanel);
