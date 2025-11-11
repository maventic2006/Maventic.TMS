import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter } from "lucide-react";
import {
  VEHICLE_TYPES,
  VEHICLE_STATUS_OPTIONS,
  OWNERSHIP_TYPES,
  FUEL_TYPES,
} from "../../utils/vehicleConstants";
import { getPageTheme, getComponentTheme } from "../../theme.config";
import { StatusSelect } from "../ui/Select";

const theme = getPageTheme("list");
const buttonTheme = getComponentTheme("actionButton");
const inputTheme = getComponentTheme("formInput");

const VehicleFilterPanel = ({
  filters,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
  showFilters,
}) => {
  return (
    <AnimatePresence>
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0, y: -20 }}
          animate={{ opacity: 1, height: "auto", y: 0 }}
          exit={{ opacity: 0, height: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="rounded-xl p-6 overflow-hidden"
          style={{
            boxShadow: theme.colors.card.shadow,
            background: theme.colors.card.background,
            border: `1px solid ${theme.colors.card.border}`,
          }}
        >
          {/* Header */}
          {/* <div className="flex items-center gap-3 mb-3 pb-2" style={{ borderBottom: `1px solid ${theme.colors.card.border}` }}>
            <div className="p-2 rounded-lg" style={{ background: theme.colors.status.info.background }}>
              <Filter className="h-5 w-5" style={{ color: theme.colors.status.info.text }} />
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: theme.colors.text.primary }}>
                Filter Vehicles
              </h3>
              <p className="text-sm" style={{ color: theme.colors.text.secondary }}>
                Refine your search with advanced filters
              </p>
            </div>
          </div> */}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Registration Number Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: theme.colors.text.primary }}>
                Regn Number
              </label>
              <input
                type="text"
                value={filters.registrationNumber}
                onChange={(e) => onFilterChange("registrationNumber", e.target.value)}
                placeholder="Enter Registration No."
                className="w-full px-4 py-2.5 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2"
                style={{
                  border: `1px solid ${inputTheme.border.default}`,
                  background: inputTheme.background,
                  color: inputTheme.text,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = inputTheme.border.focus;
                  e.target.style.boxShadow = `0 0 0 3px ${inputTheme.border.focus}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = inputTheme.border.default;
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Vehicle Type Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: theme.colors.text.primary }}>
                Vehicle Type
              </label>
              <StatusSelect
                value={filters.vehicleType}
                onChange={(value) => onFilterChange("vehicleType", value)}
                options={[{ value: "", label: "All Types" }, ...VEHICLE_TYPES]}
                placeholder="All Types"
                className="w-full"
              />
            </div>

            {/* Make/Brand Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: theme.colors.text.primary }}>
                Make
              </label>
              <input
                type="text"
                value={filters.make}
                onChange={(e) => onFilterChange("make", e.target.value)}
                placeholder="Enter Make/Brand"
                className="w-full px-4 py-2.5 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2"
                style={{
                  border: `1px solid ${inputTheme.border.default}`,
                  background: inputTheme.background,
                  color: inputTheme.text,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = inputTheme.border.focus;
                  e.target.style.boxShadow = `0 0 0 3px ${inputTheme.border.focus}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = inputTheme.border.default;
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Model Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: theme.colors.text.primary }}>
                Model
              </label>
              <input
                type="text"
                value={filters.model}
                onChange={(e) => onFilterChange("model", e.target.value)}
                placeholder="Enter Model"
                className="w-full px-4 py-2.5 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2"
                style={{
                  border: `1px solid ${inputTheme.border.default}`,
                  background: inputTheme.background,
                  color: inputTheme.text,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = inputTheme.border.focus;
                  e.target.style.boxShadow = `0 0 0 3px ${inputTheme.border.focus}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = inputTheme.border.default;
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Manufacturing Year From Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: theme.colors.text.primary }}>
                Year From
              </label>
              <input
                type="number"
                value={filters.yearFrom}
                onChange={(e) => onFilterChange("yearFrom", e.target.value)}
                placeholder="Start Year"
                min="1990"
                max={new Date().getFullYear()}
                className="w-full px-4 py-2.5 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2"
                style={{
                  border: `1px solid ${inputTheme.border.default}`,
                  background: inputTheme.background,
                  color: inputTheme.text,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = inputTheme.border.focus;
                  e.target.style.boxShadow = `0 0 0 3px ${inputTheme.border.focus}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = inputTheme.border.default;
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Manufacturing Year To Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: theme.colors.text.primary }}>
                Year To
              </label>
              <input
                type="number"
                value={filters.yearTo}
                onChange={(e) => onFilterChange("yearTo", e.target.value)}
                placeholder="End Year"
                min="1990"
                max={new Date().getFullYear()}
                className="w-full px-4 py-2.5 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2"
                style={{
                  border: `1px solid ${inputTheme.border.default}`,
                  background: inputTheme.background,
                  color: inputTheme.text,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = inputTheme.border.focus;
                  e.target.style.boxShadow = `0 0 0 3px ${inputTheme.border.focus}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = inputTheme.border.default;
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: theme.colors.text.primary }}>
                Status
              </label>
              <StatusSelect
                value={filters.status}
                onChange={(value) => onFilterChange("status", value)}
                options={[{ value: "", label: "All Statuses" }, ...VEHICLE_STATUS_OPTIONS]}
                placeholder="All Statuses"
                className="w-full"
              />
            </div>

            {/* Ownership Type Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: theme.colors.text.primary }}>
                Ownership
              </label>
              <StatusSelect
                value={filters.ownership}
                onChange={(value) => onFilterChange("ownership", value)}
                options={[{ value: "", label: "All Types" }, ...OWNERSHIP_TYPES]}
                placeholder="All Types"
                className="w-full"
              />
            </div>

            {/* Fuel Type Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: theme.colors.text.primary }}>
                Fuel Type
              </label>
              <StatusSelect
                value={filters.fuelType}
                onChange={(value) => onFilterChange("fuelType", value)}
                options={[{ value: "", label: "All Types" }, ...FUEL_TYPES]}
                placeholder="All Types"
                className="w-full"
              />
            </div>

            {/* GPS Enabled Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: theme.colors.text.primary }}>
                GPS Enabled
              </label>
              <StatusSelect
                value={filters.gpsEnabled}
                onChange={(value) => onFilterChange("gpsEnabled", value)}
                options={[
                  { value: "", label: "All" },
                  { value: "true", label: "Yes" },
                  { value: "false", label: "No" }
                ]}
                placeholder="All"
                className="w-full"
              />
            </div>

            {/* Leasing Flag Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: theme.colors.text.primary }}>
                Leased
              </label>
              <StatusSelect
                value={filters.leasingFlag}
                onChange={(value) => onFilterChange("leasingFlag", value)}
                options={[
                  { value: "", label: "All" },
                  { value: "true", label: "Yes" },
                  { value: "false", label: "No" }
                ]}
                placeholder="All"
                className="w-full"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6 pt-6" style={{ borderTop: `1px solid ${theme.colors.card.border}` }}>
            <button
              onClick={onClearFilters}
              className="flex-1 px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: buttonTheme.secondary.background,
                color: buttonTheme.secondary.text,
                border: `1px solid ${buttonTheme.secondary.border}`,
              }}
              onMouseEnter={(e) => {
                e.target.style.background = buttonTheme.secondary.hover.background;
                e.target.style.borderColor = buttonTheme.secondary.hover.border;
              }}
              onMouseLeave={(e) => {
                e.target.style.background = buttonTheme.secondary.background;
                e.target.style.borderColor = buttonTheme.secondary.border;
              }}
            >
              Clear Filters
            </button>
            <button
              onClick={onApplyFilters}
              className="flex-1 px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: buttonTheme.primary.background,
                color: buttonTheme.primary.text,
              }}
              onMouseEnter={(e) => {
                e.target.style.background = buttonTheme.primary.hover.background;
              }}
              onMouseLeave={(e) => {
                e.target.style.background = buttonTheme.primary.background;
              }}
            >
              Apply Filters
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VehicleFilterPanel;
