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
              <select
                value={filters.vehicleType}
                onChange={(e) => onFilterChange("vehicleType", e.target.value)}
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
              >
                <option value="">All Types</option>
                {VEHICLE_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
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
              <select
                value={filters.status}
                onChange={(e) => onFilterChange("status", e.target.value)}
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
              >
                <option value="">All Statuses</option>
                {VEHICLE_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Registration State Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: theme.colors.text.primary }}>
                Regn State
              </label>
              <input
                type="text"
                value={filters.registrationState}
                onChange={(e) => onFilterChange("registrationState", e.target.value)}
                placeholder="Enter State Code"
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

            {/* Fuel Type Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: theme.colors.text.primary }}>
                Fuel Type
              </label>
              <select
                value={filters.fuelType}
                onChange={(e) => onFilterChange("fuelType", e.target.value)}
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
              >
                <option value="">All Fuel Types</option>
                {FUEL_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Leasing Flag Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: theme.colors.text.primary }}>
                Leasing Flag
              </label>
              <select
                value={filters.leasingFlag}
                onChange={(e) => onFilterChange("leasingFlag", e.target.value)}
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
              >
                <option value="">All</option>
                <option value="Y">Yes</option>
                <option value="N">No</option>
              </select>
            </div>

            {/* Towing Capacity Min Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: theme.colors.text.primary }}>
                Towing Cap. Min (kg)
              </label>
              <input
                type="number"
                value={filters.towingCapacityMin}
                onChange={(e) => onFilterChange("towingCapacityMin", e.target.value)}
                placeholder="Min Capacity"
                min="0"
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

            {/* Towing Capacity Max Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: theme.colors.text.primary }}>
                Towing Cap. Max (kg)
              </label>
              <input
                type="number"
                value={filters.towingCapacityMax}
                onChange={(e) => onFilterChange("towingCapacityMax", e.target.value)}
                placeholder="Max Capacity"
                min="0"
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
          </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-6" style={{ borderTop: `1px solid ${theme.colors.card.border}` }}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClearFilters}
          className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
          style={{
            background: buttonTheme.secondary.background,
            color: buttonTheme.secondary.text,
            border: `1px solid ${buttonTheme.secondary.border}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = buttonTheme.secondary.hover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = buttonTheme.secondary.background;
          }}
        >
          Clear Filters
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onApplyFilters}
          className="px-6 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all duration-200"
          style={{
            background: buttonTheme.primary.background,
            color: buttonTheme.primary.text,
            border: `1px solid ${buttonTheme.primary.border}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = buttonTheme.primary.hover;
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = buttonTheme.primary.background;
            e.currentTarget.style.boxShadow = "0 1px 2px rgba(0, 0, 0, 0.05)";
          }}
        >
          Apply Filters
        </motion.button>
      </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VehicleFilterPanel;
