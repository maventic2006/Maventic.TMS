// import React, { useState, useEffect } from "react";
// import { X, Search } from "lucide-react";
// import { StatusSelect } from "../ui/Select";
// import ThemedSelect from "../ui/themed/ThemedSelect";
// import ThemedCheckbox from "../ui/themed/ThemedCheckbox";
// import { Button } from "../ui/Button";
// import { motion, AnimatePresence } from "framer-motion";
// import { Filter } from "lucide-react";
// import {
//   VEHICLE_TYPES,
//   VEHICLE_STATUS_OPTIONS,
//   OWNERSHIP_TYPES,
//   FUEL_TYPES,
// } from "../../utils/vehicleConstants";
// import { getPageTheme, getComponentTheme } from "../../theme.config";

// const theme = getPageTheme("list");
// const inputTheme = getComponentTheme("formInput");

// const VehicleFilterPanel = ({
//   filters,
//   onFilterChange,
//   onApplyFilters,
//   onClearFilters,
//   showFilters,
// }) => {
//   return (
//     <AnimatePresence>
//       {showFilters && (
//         <motion.div
//           initial={{ opacity: 0, height: 0, y: -20 }}
//           animate={{ opacity: 1, height: "auto", y: 0 }}
//           exit={{ opacity: 0, height: 0, y: -20 }}
//           transition={{ duration: 0.3 }}
//           className="rounded-xl p-6 overflow-hidden"
//           style={{
//             boxShadow: theme.colors.card.shadow,
//             background: theme.colors.card.background,
//             border: `1px solid ${theme.colors.card.border}`,
//           }}
//         >
//           {/* Header */}
//           {/* <div className="flex items-center gap-3 mb-3 pb-2" style={{ borderBottom: `1px solid ${theme.colors.card.border}` }}>
//             <div className="p-2 rounded-lg" style={{ background: theme.colors.status.info.background }}>
//               <Filter className="h-5 w-5" style={{ color: theme.colors.status.info.text }} />
//             </div>
//             <div>
//               <h3 className="text-lg font-bold" style={{ color: theme.colors.text.primary }}>
//                 Filter Vehicles
//               </h3>
//               <p className="text-sm" style={{ color: theme.colors.text.secondary }}>
//                 Refine your search with advanced filters
//               </p>
//             </div>
//           </div> */}

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//             {/* Registration Number Filter */}
//             <div>
//               <label
//                 className="block text-xs font-bold uppercase tracking-wider mb-2"
//                 style={{ color: theme.colors.text.primary }}
//               >
//                 Regn Number
//               </label>
//               <input
//                 type="text"
//                 value={filters.registrationNumber}
//                 onChange={(e) =>
//                   onFilterChange("registrationNumber", e.target.value)
//                 }
//                 placeholder="Enter Registration No."
//                 className="w-full px-4 py-2.5 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2"
//                 style={{
//                   border: `1px solid ${inputTheme.border.default}`,
//                   background: inputTheme.background,
//                   color: inputTheme.text,
//                 }}
//                 onFocus={(e) => {
//                   e.target.style.borderColor = inputTheme.border.focus;
//                   e.target.style.boxShadow = `0 0 0 3px ${inputTheme.border.focus}20`;
//                 }}
//                 onBlur={(e) => {
//                   e.target.style.borderColor = inputTheme.border.default;
//                   e.target.style.boxShadow = "none";
//                 }}
//               />
//             </div>

//             {/* Vehicle Type Filter */}
//             <div>
//               <label
//                 className="block text-xs font-bold uppercase tracking-wider mb-2"
//                 style={{ color: theme.colors.text.primary }}
//               >
//                 Vehicle Type
//               </label>
//               <StatusSelect
//                 value={filters.vehicleType}
//                 onChange={(value) => onFilterChange("vehicleType", value)}
//                 options={[{ value: "", label: "All Types" }, ...VEHICLE_TYPES]}
//                 placeholder="All Types"
//                 className="w-full"
//               />
//             </div>

//             {/* Make/Brand Filter */}
//             <div>
//               <label
//                 className="block text-xs font-bold uppercase tracking-wider mb-2"
//                 style={{ color: theme.colors.text.primary }}
//               >
//                 Make
//               </label>
//               <input
//                 type="text"
//                 value={filters.make}
//                 onChange={(e) => onFilterChange("make", e.target.value)}
//                 placeholder="Enter Make/Brand"
//                 className="w-full px-4 py-2.5 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2"
//                 style={{
//                   border: `1px solid ${inputTheme.border.default}`,
//                   background: inputTheme.background,
//                   color: inputTheme.text,
//                 }}
//                 onFocus={(e) => {
//                   e.target.style.borderColor = inputTheme.border.focus;
//                   e.target.style.boxShadow = `0 0 0 3px ${inputTheme.border.focus}20`;
//                 }}
//                 onBlur={(e) => {
//                   e.target.style.borderColor = inputTheme.border.default;
//                   e.target.style.boxShadow = "none";
//                 }}
//               />
//             </div>

//             {/* Model Filter */}
//             <div>
//               <label
//                 className="block text-xs font-bold uppercase tracking-wider mb-2"
//                 style={{ color: theme.colors.text.primary }}
//               >
//                 Model
//               </label>
//               <input
//                 type="text"
//                 value={filters.model}
//                 onChange={(e) => onFilterChange("model", e.target.value)}
//                 placeholder="Enter Model"
//                 className="w-full px-4 py-2.5 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2"
//                 style={{
//                   border: `1px solid ${inputTheme.border.default}`,
//                   background: inputTheme.background,
//                   color: inputTheme.text,
//                 }}
//                 onFocus={(e) => {
//                   e.target.style.borderColor = inputTheme.border.focus;
//                   e.target.style.boxShadow = `0 0 0 3px ${inputTheme.border.focus}20`;
//                 }}
//                 onBlur={(e) => {
//                   e.target.style.borderColor = inputTheme.border.default;
//                   e.target.style.boxShadow = "none";
//                 }}
//               />
//             </div>

//             {/* Manufacturing Year From Filter */}
//             <div>
//               <label
//                 className="block text-xs font-bold uppercase tracking-wider mb-2"
//                 style={{ color: theme.colors.text.primary }}
//               >
//                 Year From
//               </label>
//               <input
//                 type="number"
//                 value={filters.yearFrom}
//                 onChange={(e) => onFilterChange("yearFrom", e.target.value)}
//                 placeholder="Start Year"
//                 min="1990"
//                 max={new Date().getFullYear()}
//                 className="w-full px-4 py-2.5 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2"
//                 style={{
//                   border: `1px solid ${inputTheme.border.default}`,
//                   background: inputTheme.background,
//                   color: inputTheme.text,
//                 }}
//                 onFocus={(e) => {
//                   e.target.style.borderColor = inputTheme.border.focus;
//                   e.target.style.boxShadow = `0 0 0 3px ${inputTheme.border.focus}20`;
//                 }}
//                 onBlur={(e) => {
//                   e.target.style.borderColor = inputTheme.border.default;
//                   e.target.style.boxShadow = "none";
//                 }}
//               />
//             </div>

//             {/* Manufacturing Year To Filter */}
//             <div>
//               <label
//                 className="block text-xs font-bold uppercase tracking-wider mb-2"
//                 style={{ color: theme.colors.text.primary }}
//               >
//                 Year To
//               </label>
//               <input
//                 type="number"
//                 value={filters.yearTo}
//                 onChange={(e) => onFilterChange("yearTo", e.target.value)}
//                 placeholder="End Year"
//                 min="1990"
//                 max={new Date().getFullYear()}
//                 className="w-full px-4 py-2.5 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2"
//                 style={{
//                   border: `1px solid ${inputTheme.border.default}`,
//                   background: inputTheme.background,
//                   color: inputTheme.text,
//                 }}
//                 onFocus={(e) => {
//                   e.target.style.borderColor = inputTheme.border.focus;
//                   e.target.style.boxShadow = `0 0 0 3px ${inputTheme.border.focus}20`;
//                 }}
//                 onBlur={(e) => {
//                   e.target.style.borderColor = inputTheme.border.default;
//                   e.target.style.boxShadow = "none";
//                 }}
//               />
//             </div>

//             {/* Status Filter */}
//             <div>
//               <label
//                 className="block text-xs font-bold uppercase tracking-wider mb-2"
//                 style={{ color: theme.colors.text.primary }}
//               >
//                 Status
//               </label>
//               <StatusSelect
//                 value={filters.status}
//                 onChange={(value) => onFilterChange("status", value)}
//                 options={[
//                   { value: "", label: "All Statuses" },
//                   ...VEHICLE_STATUS_OPTIONS,
//                 ]}
//                 placeholder="All Statuses"
//                 className="w-full"
//               />
//             </div>

//             {/* Ownership Type Filter */}
//             <div>
//               <label
//                 className="block text-xs font-bold uppercase tracking-wider mb-2"
//                 style={{ color: theme.colors.text.primary }}
//               >
//                 Ownership
//               </label>
//               <StatusSelect
//                 value={filters.ownership}
//                 onChange={(value) => onFilterChange("ownership", value)}
//                 options={[
//                   { value: "", label: "All Types" },
//                   ...OWNERSHIP_TYPES,
//                 ]}
//                 placeholder="All Types"
//                 className="w-full"
//               />
//             </div>

//             {/* Vehicle Condition Filter */}
//             <div>
//               <label
//                 className="block text-xs font-bold uppercase tracking-wider mb-2"
//                 style={{ color: theme.colors.text.primary }}
//               >
//                 Condition
//               </label>
//               <StatusSelect
//                 value={filters.vehicleCondition}
//                 onChange={(value) => onFilterChange("vehicleCondition", value)}
//                 options={[
//                   { value: "", label: "All Conditions" },
//                   { value: "EXCELLENT", label: "Excellent" },
//                   { value: "GOOD", label: "Good" },
//                   { value: "FAIR", label: "Fair" },
//                   { value: "POOR", label: "Poor" },
//                 ]}
//                 placeholder="All Conditions"
//                 className="w-full"
//               />
//             </div>

//             {/* Registration State Filter */}
//             <div>
//               <label
//                 className="block text-xs font-bold uppercase tracking-wider mb-2"
//                 style={{ color: theme.colors.text.primary }}
//               >
//                 Reg. State
//               </label>
//               <input
//                 type="text"
//                 value={filters.registrationState}
//                 onChange={(e) =>
//                   onFilterChange("registrationState", e.target.value)
//                 }
//                 placeholder="Enter Registration State"
//                 className="w-full px-4 py-2.5 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2"
//                 style={{
//                   border: `1px solid ${inputTheme.border.default}`,
//                   background: inputTheme.background,
//                   color: inputTheme.text,
//                 }}
//                 onFocus={(e) => {
//                   e.target.style.borderColor = inputTheme.border.focus;
//                   e.target.style.boxShadow = `0 0 0 3px ${inputTheme.border.focus}20`;
//                 }}
//                 onBlur={(e) => {
//                   e.target.style.borderColor = inputTheme.border.default;
//                   e.target.style.boxShadow = "none";
//                 }}
//               />
//             </div>

//             {/* Towing Capacity Range Filters */}
//             <div>
//               <label
//                 className="block text-xs font-bold uppercase tracking-wider mb-2"
//                 style={{ color: theme.colors.text.primary }}
//               >
//                 Towing Cap. Min
//               </label>
//               <input
//                 type="number"
//                 value={filters.towingCapacityMin}
//                 onChange={(e) =>
//                   onFilterChange("towingCapacityMin", e.target.value)
//                 }
//                 placeholder="Min Capacity (kg)"
//                 min="0"
//                 className="w-full px-4 py-2.5 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2"
//                 style={{
//                   border: `1px solid ${inputTheme.border.default}`,
//                   background: inputTheme.background,
//                   color: inputTheme.text,
//                 }}
//                 onFocus={(e) => {
//                   e.target.style.borderColor = inputTheme.border.focus;
//                   e.target.style.boxShadow = `0 0 0 3px ${inputTheme.border.focus}20`;
//                 }}
//                 onBlur={(e) => {
//                   e.target.style.borderColor = inputTheme.border.default;
//                   e.target.style.boxShadow = "none";
//                 }}
//               />
//             </div>

//             <div>
//               <label
//                 className="block text-xs font-bold uppercase tracking-wider mb-2"
//                 style={{ color: theme.colors.text.primary }}
//               >
//                 Towing Cap. Max
//               </label>
//               <input
//                 type="number"
//                 value={filters.towingCapacityMax}
//                 onChange={(e) =>
//                   onFilterChange("towingCapacityMax", e.target.value)
//                 }
//                 placeholder="Max Capacity (kg)"
//                 min="0"
//                 className="w-full px-4 py-2.5 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2"
//                 style={{
//                   border: `1px solid ${inputTheme.border.default}`,
//                   background: inputTheme.background,
//                   color: inputTheme.text,
//                 }}
//                 onFocus={(e) => {
//                   e.target.style.borderColor = inputTheme.border.focus;
//                   e.target.style.boxShadow = `0 0 0 3px ${inputTheme.border.focus}20`;
//                 }}
//                 onBlur={(e) => {
//                   e.target.style.borderColor = inputTheme.border.default;
//                   e.target.style.boxShadow = "none";
//                 }}
//               />
//             </div>

//             {/* Fuel Type Filter */}
//             <div>
//               <label
//                 className="block text-xs font-bold uppercase tracking-wider mb-2"
//                 style={{ color: theme.colors.text.primary }}
//               >
//                 Fuel Type
//               </label>
//               <StatusSelect
//                 value={filters.fuelType}
//                 onChange={(value) => onFilterChange("fuelType", value)}
//                 options={[{ value: "", label: "All Types" }, ...FUEL_TYPES]}
//                 placeholder="All Types"
//                 className="w-full"
//               />
//             </div>

//             {/* GPS Enabled Filter */}
//             <div>
//               <label
//                 className="block text-xs font-bold uppercase tracking-wider mb-2"
//                 style={{ color: theme.colors.text.primary }}
//               >
//                 GPS Enabled
//               </label>
//               <div className="flex items-center space-x-2">
//                 <ThemedCheckbox
//                   checked={filters.gpsEnabled === "true"}
//                   onCheckedChange={(checked) =>
//                     onFilterChange("gpsEnabled", checked ? "true" : "")
//                   }
//                 />
//                 <span
//                   className="text-sm"
//                   style={{ color: theme.colors.text.secondary }}
//                 >
//                   Only GPS enabled vehicles
//                 </span>
//               </div>
//             </div>

//             {/* Leasing Flag Filter */}
//             <div>
//               <label
//                 className="block text-xs font-bold uppercase tracking-wider mb-2"
//                 style={{ color: theme.colors.text.primary }}
//               >
//                 Leased
//               </label>
//               <div className="flex items-center space-x-2">
//                 <ThemedCheckbox
//                   checked={filters.leasingFlag === "true"}
//                   onCheckedChange={(checked) =>
//                     onFilterChange("leasingFlag", checked ? "true" : "")
//                   }
//                 />
//                 <span
//                   className="text-sm"
//                   style={{ color: theme.colors.text.secondary }}
//                 >
//                   Only leased vehicles
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div
//             className="flex gap-4 mt-6 pt-6"
//             style={{ borderTop: `1px solid ${theme.colors.card.border}` }}
//           >
//             <Button
//               variant="secondary"
//               onClick={onClearFilters}
//               className="flex-1"
//             >
//               <X className="h-4 w-4 mr-2" />
//               Clear All
//             </Button>
//             <Button
//               variant="default"
//               onClick={onApplyFilters}
//               className="flex-1"
//             >
//               <Search className="h-4 w-4 mr-2" />
//               Apply Filters
//             </Button>
//           </div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// };

// export default VehicleFilterPanel;

import React from "react";
import { X, Search } from "lucide-react";
import { StatusSelect } from "../ui/Select";
import ThemedSelect from "../ui/themed/ThemedSelect";
import ThemedCheckbox from "../ui/themed/ThemedCheckbox";
import { Button } from "../ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { Filter } from "lucide-react";
import {
  VEHICLE_TYPES,
  VEHICLE_STATUS_OPTIONS,
  OWNERSHIP_TYPES,
  FUEL_TYPES,
} from "../../utils/vehicleConstants";
import { getPageTheme, getComponentTheme } from "../../theme.config";
import { Input, Label } from "../ui/Input";

const theme = getPageTheme("list");
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Registration Number Filter */}
            <div>
              <Label
                htmlFor="registrationNumber"
                className="block text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color: theme.colors.text.primary }}
              >
                Regn Number
              </Label>
              <Input
                id="registrationNumber"
                type="text"
                value={filters.registrationNumber}
                onChange={(e) =>
                  onFilterChange("registrationNumber", e.target.value)
                }
                placeholder="Enter Registration No."
                className="w-full px-4 py-2.5 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2"
                style={{
                  border: `1px solid ${inputTheme.border.default}`,
                  background: inputTheme.background,
                  color: inputTheme.text,
                }}
                // keep the visual focus behaviour consistent with other inputs
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
              <Label
                htmlFor="vehicleType"
                className="block text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color: theme.colors.text.primary }}
              >
                Vehicle Type
              </Label>
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
              <Label
                htmlFor="make"
                className="block text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color: theme.colors.text.primary }}
              >
                Make
              </Label>
              <Input
                id="make"
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
              <Label
                htmlFor="model"
                className="block text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color: theme.colors.text.primary }}
              >
                Model
              </Label>
              <Input
                id="model"
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
              <Label
                htmlFor="yearFrom"
                className="block text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color: theme.colors.text.primary }}
              >
                Year From
              </Label>
              <Input
                id="yearFrom"
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
              <Label
                htmlFor="yearTo"
                className="block text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color: theme.colors.text.primary }}
              >
                Year To
              </Label>
              <Input
                id="yearTo"
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

            {/* Ownership Type Filter */}
            <div>
              <Label
                htmlFor="ownership"
                className="block text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color: theme.colors.text.primary }}
              >
                Ownership
              </Label>
              <StatusSelect
                value={filters.ownership}
                onChange={(value) => onFilterChange("ownership", value)}
                options={[
                  { value: "", label: "All Types" },
                  ...OWNERSHIP_TYPES,
                ]}
                placeholder="All Types"
                className="w-full"
              />
            </div>

            {/* Vehicle Condition Filter */}
            <div>
              <Label
                htmlFor="vehicleCondition"
                className="block text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color: theme.colors.text.primary }}
              >
                Condition
              </Label>
              <StatusSelect
                value={filters.vehicleCondition}
                onChange={(value) => onFilterChange("vehicleCondition", value)}
                options={[
                  { value: "", label: "All Conditions" },
                  { value: "EXCELLENT", label: "Excellent" },
                  { value: "GOOD", label: "Good" },
                  { value: "FAIR", label: "Fair" },
                  { value: "POOR", label: "Poor" },
                ]}
                placeholder="All Conditions"
                className="w-full"
              />
            </div>

            {/* Registration State Filter */}
            <div>
              <Label
                htmlFor="registrationState"
                className="block text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color: theme.colors.text.primary }}
              >
                Reg. State
              </Label>
              <Input
                id="registrationState"
                type="text"
                value={filters.registrationState}
                onChange={(e) =>
                  onFilterChange("registrationState", e.target.value)
                }
                placeholder="Enter Registration State"
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

            {/* Towing Capacity Range Filters */}
            <div>
              <Label
                htmlFor="towingCapacityMin"
                className="block text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color: theme.colors.text.primary }}
              >
                Towing Cap. Min
              </Label>
              <Input
                id="towingCapacityMin"
                type="number"
                value={filters.towingCapacityMin}
                onChange={(e) =>
                  onFilterChange("towingCapacityMin", e.target.value)
                }
                placeholder="Min Capacity (kg)"
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

            <div>
              <Label
                htmlFor="towingCapacityMax"
                className="block text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color: theme.colors.text.primary }}
              >
                Towing Cap. Max
              </Label>
              <Input
                id="towingCapacityMax"
                type="number"
                value={filters.towingCapacityMax}
                onChange={(e) =>
                  onFilterChange("towingCapacityMax", e.target.value)
                }
                placeholder="Max Capacity (kg)"
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

            {/* Fuel Type Filter */}
            <div>
              <Label
                htmlFor="fuelType"
                className="block text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color: theme.colors.text.primary }}
              >
                Fuel Type
              </Label>
              <StatusSelect
                value={filters.fuelType}
                onChange={(value) => onFilterChange("fuelType", value)}
                options={[{ value: "", label: "All Types" }, ...FUEL_TYPES]}
                placeholder="All Types"
                className="w-full"
              />
            </div>

            {/* Status Filter */}
            <div>
              <Label
                htmlFor="status"
                className="block text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color: theme.colors.text.primary }}
              >
                Status
              </Label>
              <StatusSelect
                value={filters.status}
                onChange={(value) => onFilterChange("status", value)}
                options={[
                  { value: "", label: "All Statuses" },
                  ...VEHICLE_STATUS_OPTIONS,
                ]}
                placeholder="All Statuses"
                className="w-full"
              />
            </div>

            <div className="space-y-2 group">
              <Label
                htmlFor="createdOnStart"
                className="text-sm text-[#0D1A33] font-semibold"
              >
                Created On (Start):
              </Label>
              <Input
                id="createdOnStart"
                type="date"
                value={filters.createdOnStart}
                onChange={(e) =>
                  onFilterChange("createdOnStart", e.target.value)
                }
                className="bg-white border-[#E5E7EB] hover:border-[#1D4ED8] 
                  focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 
                  transition-all duration-200 rounded-lg h-10"
              />
            </div>

            <div className="space-y-2 group">
              <Label
                htmlFor="createdOnEnd"
                className="text-sm text-[#0D1A33] font-semibold"
              >
                Created On (End):
              </Label>
              <Input
                id="createdOnEnd"
                type="date"
                value={filters.createdOnEnd}
                onChange={(e) => onFilterChange("createdOnEnd", e.target.value)}
                className="bg-white border-[#E5E7EB] hover:border-[#1D4ED8] 
                  focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 
                  transition-all duration-200 rounded-lg h-10"
              />
            </div>

            {/* GPS Enabled Filter */}
            <div>
              <Label
                htmlFor="gpsEnabled"
                className="block text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color: theme.colors.text.primary }}
              >
                GPS Enabled
              </Label>
              <div className="flex items-center space-x-2">
                <ThemedCheckbox
                  checked={filters.gpsEnabled === "true"}
                  onCheckedChange={(checked) =>
                    onFilterChange("gpsEnabled", checked ? "true" : "")
                  }
                />
                <span
                  className="text-sm"
                  style={{ color: theme.colors.text.secondary }}
                >
                  Only GPS enabled vehicles
                </span>
              </div>
            </div>

            {/* Leasing Flag Filter */}
            <div>
              <Label
                htmlFor="leasingFlag"
                className="block text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color: theme.colors.text.primary }}
              >
                Leased
              </Label>
              <div className="flex items-center space-x-2">
                <ThemedCheckbox
                  checked={filters.leasingFlag === "true"}
                  onCheckedChange={(checked) =>
                    onFilterChange("leasingFlag", checked ? "true" : "")
                  }
                />
                <span
                  className="text-sm"
                  style={{ color: theme.colors.text.secondary }}
                >
                  Only leased vehicles
                </span>
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-0 mt-2 justify-end col-span-3">
              <Button
                variant="outline"
                onClick={onClearFilters}
                className="bg-white hover:bg-[#F5F7FA] hover:border-[#F97316] hover:text-[#F97316] transition-all duration-200 border-[#E5E7EB] rounded-lg py-2.5 px-5 w-full sm:w-auto"
              >
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
              <Button
                variant="default"
                onClick={onApplyFilters}
                className="bg-[#10B981] hover:bg-[#059669] text-white transition-all duration-200 rounded-lg py-2.5 px-5 w-full sm:w-auto font-semibold"
              >
                <Search className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VehicleFilterPanel;
