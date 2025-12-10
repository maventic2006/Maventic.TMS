import React from "react";

/**
 * StatusBadges Component (Dynamic - works for all modules)
 *
 * Displays clickable status badges with counts for any module (transporter, driver, warehouse, etc.).
 * Allows users to filter the list by clicking on status badges.
 *
 * @param {Object} counts - Status counts object { ACTIVE: 91, INACTIVE: 5, PENDING: 10, DRAFT: 3 }
 * @param {string|null} selectedStatus - Currently selected status (null if no filter applied)
 * @param {Function} onStatusClick - Callback when a status badge is clicked
 * @param {boolean} loading - Whether status counts are loading
 * @param {string} module - Module name for dynamic labels (e.g., 'transporter', 'driver', 'warehouse')
 */
const StatusBadges = ({ 
  counts, 
  selectedStatus, 
  onStatusClick, 
  loading,
  module = 'transporter' // Default to transporter for backward compatibility
}) => {
  // Module name mapping for pluralization
  const moduleNames = {
    transporter: 'transporters',
    driver: 'drivers',
    warehouse: 'warehouses',
    vehicle: 'vehicles',
    consignor: 'consignors',
  };

  const moduleName = moduleNames[module] || module;

  const badges = [
    {
      status: "ACTIVE",
      label: "Active",
      bgColor: "bg-green-100",
      textColor: "text-green-800",
      hoverColor: "hover:bg-green-200",
      selectedBg: "bg-green-600",
      selectedText: "text-white",
    },
    {
      status: "INACTIVE",
      label: "Inactive",
      bgColor: "bg-red-100",
      textColor: "text-red-800",
      hoverColor: "hover:bg-red-200",
      selectedBg: "bg-red-600",
      selectedText: "text-white",
    },
    {
      status: "PENDING",
      label: "Pending",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-800",
      hoverColor: "hover:bg-yellow-200",
      selectedBg: "bg-yellow-600",
      selectedText: "text-white",
    },
    {
      status: "DRAFT",
      label: "Draft",
      bgColor: "bg-gray-100",
      textColor: "text-gray-800",
      hoverColor: "hover:bg-gray-200",
      selectedBg: "bg-gray-600",
      selectedText: "text-white",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-6 w-20 bg-gray-200 animate-pulse rounded-full"></div>
        <div className="h-6 w-20 bg-gray-200 animate-pulse rounded-full"></div>
        <div className="h-6 w-20 bg-gray-200 animate-pulse rounded-full"></div>
        <div className="h-6 w-20 bg-gray-200 animate-pulse rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {badges.map(
        ({
          status,
          label,
          bgColor,
          textColor,
          hoverColor,
          selectedBg,
          selectedText,
        }) => {
          // Map DRAFT to SAVE_AS_DRAFT for backend compatibility
          const backendStatus = status === "DRAFT" ? "SAVE_AS_DRAFT" : status;
          // Check if this badge should be selected (handles SAVE_AS_DRAFT -> DRAFT mapping)
          const isSelected =
            selectedStatus === status ||
            (status === "DRAFT" && selectedStatus === "SAVE_AS_DRAFT");
          const count = counts[status] || 0;

          return (
            <button
              key={status}
              onClick={() => onStatusClick(backendStatus)}
              className={`
              px-3 py-1.5 rounded-full text-sm font-medium 
              transition-all duration-200 cursor-pointer
              ${
                isSelected
                  ? `${selectedBg} ${selectedText} shadow-md`
                  : `${bgColor} ${textColor} ${hoverColor}`
              }
              hover:shadow-md hover:scale-105
              focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500
            `}
              title={
                isSelected
                  ? `Click to clear ${label} filter`
                  : `Click to filter by ${label} ${moduleName}`
              }
            >
              <span className="font-semibold">{label}</span>
              <span
                className={`ml-1.5 ${isSelected ? "font-bold" : "font-normal"}`}
              >
                {count}
              </span>
            </button>
          );
        }
      )}
    </div>
  );
};

export default StatusBadges;
