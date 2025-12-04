import React, { memo } from "react";
import { motion } from "framer-motion";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Search,
  Building,
  Hash,
  MapPin,
  User,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Trash2, // ✅ Add Trash2 icon for delete button
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../ui/Table";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import StatusPill from "./StatusPill";

// Helper function to display N/A for empty or null values
const displayValue = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    value === "N/A"
  ) {
    return "N/A";
  }
  return value;
};

// Helper function to display boolean as Yes/No with icons
const displayBoolean = (value) => {
  if (value === true || value === 1) {
    return (
      <div className="flex items-center justify-center gap-1 text-green-600">
        <CheckCircle2 className="h-4 w-4" />
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center gap-1 text-red-400">
      <XCircle className="h-5 w-5" />
    </div>
  );
};

const WarehouseListTable = ({
  warehouses,
  loading,
  onWarehouseClick,
  onDeleteDraft, // ✅ Add onDeleteDraft prop
  // Pagination props
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  // Count props
  filteredCount,
  // Search props
  searchText,
  onSearchChange,
}) => {
  // Pagination calculations
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Determine if we should show "no results" message
  const showNoResults = !loading && warehouses.length === 0;

  return (
    <Card
      className="overflow-hidden rounded-xl border border-gray-200 bg-white"
      style={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)" }}
    >
      {/* Results Count Section - Always visible */}
      <div className="px-0 pb-4 border-b border-gray-100 bg-white">
        <div className="flex items-center justify-between">
          {/* Left side - Results count */}
          <p className="text-sm text-[#0D1A33] font-semibold">
            <span className="text-[#1D4ED8] font-bold">{filteredCount}</span>{" "}
            Warehouses Found
          </p>

          {/* Right side - Search bar - Always visible */}
          <div className="flex items-center gap-4">
            {searchText && (
              <div className="text-xs text-[#4A5568] hidden sm:block">
                Searching in {filteredCount} warehouses
              </div>
            )}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#4A5568] pointer-events-none z-10" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search warehouses..."
                className="pl-10 pr-4 py-2 w-48 sm:w-64 lg:w-72 border border-[#E5E7EB] rounded-lg focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 focus:outline-none transition-all duration-200 text-sm bg-white"
                style={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center space-y-4 text-[#4A5568]">
            <div className="relative">
              <Loader2 className="h-8 w-8 animate-spin text-[#1D4ED8]" />
              <div className="absolute inset-0 h-8 w-8 border-2 border-[#1D4ED8]/20 rounded-full animate-pulse"></div>
            </div>
            <span className="text-sm font-semibold">Loading warehouses...</span>
            <div className="flex gap-1">
              <div
                className="w-2 h-2 bg-[#1D4ED8] rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className="w-2 h-2 bg-[#1D4ED8] rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></div>
              <div
                className="w-2 h-2 bg-[#1D4ED8] rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* No Results State */}
      {showNoResults && (
        <div className="text-center py-16 bg-white">
          <div className="flex flex-col items-center space-y-6 text-[#4A5568]">
            <div className="relative">
              <Building className="h-20 w-20 text-[#E5E7EB]" />
              <div className="absolute -top-2 -right-2 h-6 w-6 bg-[#1D4ED8]/10 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-[#1D4ED8] rounded-full"></div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-[#0D1A33]">
                No Warehouses Found
              </h3>
              <p className="text-sm text-[#4A5568] max-w-md">
                {searchText
                  ? `No results found for "${searchText}". Try adjusting your search or use different keywords.`
                  : "Try adjusting your filters, or create a new warehouse to get started."}
              </p>
            </div>
            <div className="flex gap-2 text-xs text-[#4A5568]">
              <span>• Check spelling</span>
              <span>• Clear filters</span>
              <span>• Try different keywords</span>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Card Layout - Only show when there are results */}
      {!loading && !showNoResults && (
        <div className="block lg:hidden p-6 space-y-4">
          {warehouses.map((warehouse, index) => (
            <motion.div
              key={warehouse.warehouse_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white border border-[#E5E7EB] rounded-xl p-6 hover:shadow-md transition-all duration-300"
              style={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)" }}
            >
              {/* Header row with ID and Status */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-[#1D4ED8]" />
                  <span
                    className="font-bold text-[#1D4ED8] text-sm hover:text-[#0F172A] hover:underline cursor-pointer transition-all duration-200"
                    onClick={() => onWarehouseClick(warehouse.warehouse_id)}
                  >
                    {warehouse.warehouse_id}
                  </span>
                </div>
                {/* ✅ Status with delete draft button */}
                <div className="flex items-center gap-2">
                  <StatusPill status={warehouse.status} />
                  {warehouse.status === "SAVE_AS_DRAFT" && onDeleteDraft && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDraft(warehouse.warehouse_id);
                      }}
                      className="p-1 hover:bg-red-50 rounded-md transition-colors duration-200 group"
                      title="Delete draft"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-colors duration-200" />
                    </button>
                  )}
                </div>
              </div>

              {/* Warehouse Name */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Building className="h-4 w-4 text-[#4A5568]" />
                  <span className="text-xs text-[#4A5568] font-semibold">
                    Warehouse Name
                  </span>
                </div>
                <p className="font-semibold text-[#0D1A33] text-sm truncate">
                  {displayValue(warehouse.warehouse_name1)}
                </p>
              </div>

              {/* Consignor and Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Building className="h-3 w-3 text-[#4A5568]" />
                    <span className="text-xs text-[#4A5568] font-semibold">
                      Consignor Id
                    </span>
                  </div>
                  <p className="text-sm text-[#0D1A33]">
                    {displayValue(warehouse.consignor_id)}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Building className="h-3 w-3 text-[#4A5568]" />
                    <span className="text-xs text-[#4A5568] font-semibold">
                      Type
                    </span>
                  </div>
                  <p className="text-sm text-[#0D1A33]">
                    {displayValue(
                      warehouse.warehouse_type_name || warehouse.warehouse_type
                    )}
                  </p>
                </div>
              </div>

              {/* Location Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <MapPin className="h-3 w-3 text-[#4A5568]" />
                    <span className="text-xs text-[#4A5568] font-semibold">
                      City
                    </span>
                  </div>
                  <p className="text-sm text-[#0D1A33]">
                    {displayValue(warehouse.city)}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <MapPin className="h-3 w-3 text-[#4A5568]" />
                    <span className="text-xs text-[#4A5568] font-semibold">
                      State
                    </span>
                  </div>
                  <p className="text-sm text-[#0D1A33]">
                    {displayValue(warehouse.state)}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <MapPin className="h-3 w-3 text-[#4A5568]" />
                    <span className="text-xs text-[#4A5568] font-semibold">
                      Country
                    </span>
                  </div>
                  <p className="text-sm text-[#0D1A33]">
                    {displayValue(warehouse.country)}
                  </p>
                </div>
              </div>

              {/* Region and Zone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <MapPin className="h-3 w-3 text-[#4A5568]" />
                    <span className="text-xs text-[#4A5568] font-semibold">
                      Region
                    </span>
                  </div>
                  <p className="text-sm text-[#0D1A33]">
                    {displayValue(warehouse.region)}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <MapPin className="h-3 w-3 text-[#4A5568]" />
                    <span className="text-xs text-[#4A5568] font-semibold">
                      Zone
                    </span>
                  </div>
                  <p className="text-sm text-[#0D1A33]">
                    {displayValue(warehouse.zone)}
                  </p>
                </div>
              </div>

              {/* Facilities */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-xs text-[#4A5568] font-semibold">
                      Geo Fencing
                    </span>
                  </div>
                  <div className="text-sm">
                    {displayBoolean(warehouse.geo_fencing)}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-xs text-[#4A5568] font-semibold">
                      WeighBridge
                    </span>
                  </div>
                  <div className="text-sm">
                    {displayBoolean(warehouse.weigh_bridge_availability)}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-xs text-[#4A5568] font-semibold">
                      Virtual Yard
                    </span>
                  </div>
                  <div className="text-sm">
                    {displayBoolean(warehouse.virtual_yard_in)}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-xs text-[#4A5568] font-semibold">
                      Gatepass
                    </span>
                  </div>
                  <div className="text-sm">
                    {displayBoolean(warehouse.gatepass_system_available)}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-xs text-[#4A5568] font-semibold">
                      Fuel
                    </span>
                  </div>
                  <div className="text-sm">
                    {displayBoolean(warehouse.fuel_availability)}
                  </div>
                </div>
              </div>

              {/* Footer with additional info */}
              <div className="pt-4 border-t border-[#E5E7EB] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3 text-[#4A5568]" />
                    <span className="text-xs text-[#4A5568] font-semibold">
                      Created by {displayValue(warehouse.created_by)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-[#4A5568]" />
                    <span className="text-xs text-[#4A5568] font-semibold">
                      {displayValue(
                        warehouse.created_at
                          ? new Date(warehouse.created_at).toLocaleDateString()
                          : null
                      )}
                    </span>
                  </div>
                </div>
                {(warehouse.approver || warehouse.approvedOn) && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 text-[#10B981]" />
                      <span className="text-xs text-[#10B981] font-semibold">
                        Approved by {displayValue(warehouse.approver)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-[#10B981]" />
                      <span className="text-xs text-[#10B981] font-semibold">
                        {displayValue(
                          warehouse.approvedOn
                            ? new Date(
                                warehouse.approvedOn
                              ).toLocaleDateString()
                            : null
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Desktop Table Layout - Only show when there are results */}
      {!loading && !showNoResults && (
        <div className="hidden lg:block">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#0D1A33] hover:bg-[#0D1A33]/90 transition-all duration-300">
                <TableHead className="text-white text-nowrap w-24 text-sm font-semibold h-14">
                  <div className="flex items-center">
                    Warehouse ID
                    <svg
                      className="ml-2 h-4 w-4 opacity-70"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </TableHead>
                <TableHead className="text-white text-nowrap w-20 text-sm font-semibold h-14">
                  Consignor ID
                </TableHead>
                <TableHead className="text-white text-nowrap w-28 text-sm font-semibold h-14">
                  Warehouse Type
                </TableHead>
                <TableHead className="text-white text-nowrap w-40 text-sm font-semibold h-14">
                  <div className="flex items-center">
                    Warehouse Name
                    <svg
                      className="ml-2 h-4 w-4 opacity-70"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </TableHead>
                <TableHead className="text-white text-nowrap w-24 text-sm font-semibold h-14">
                  Geo Fencing
                </TableHead>
                <TableHead className="text-white text-nowrap w-24 text-sm font-semibold h-14">
                  WeighBridge
                </TableHead>
                <TableHead className="text-white text-nowrap w-26 text-sm font-semibold h-14">
                  Virtual Yard In
                </TableHead>
                <TableHead className="text-white text-nowrap w-28 text-sm font-semibold h-14">
                  Gatepass System
                </TableHead>
                <TableHead className="text-white text-nowrap w-24 text-sm font-semibold h-14">
                  Fuel Availability
                </TableHead>
                <TableHead className="text-white text-nowrap w-20 text-sm font-semibold h-14">
                  City
                </TableHead>
                <TableHead className="text-white text-nowrap w-20 text-sm font-semibold h-14">
                  State
                </TableHead>
                <TableHead className="text-white text-nowrap w-20 text-sm font-semibold h-14">
                  Country
                </TableHead>
                <TableHead className="text-white text-nowrap w-20 text-sm font-semibold h-14">
                  Region
                </TableHead>
                <TableHead className="text-white text-nowrap w-20 text-sm font-semibold h-14">
                  Zone
                </TableHead>
                <TableHead className="text-white text-nowrap w-24 text-sm font-semibold h-14">
                  Created By
                </TableHead>
                <TableHead className="text-white text-nowrap w-24 text-sm font-semibold h-14">
                  Created On
                </TableHead>
                <TableHead className="text-white text-nowrap w-20 text-sm font-semibold h-14">
                  Status
                </TableHead>
                <TableHead className="text-white text-nowrap w-24 text-sm font-semibold h-14">
                  Approver
                </TableHead>
                <TableHead className="text-white text-nowrap w-24 text-sm font-semibold h-14">
                  Approved On
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {warehouses.map((warehouse, index) => (
                <TableRow
                  key={warehouse.warehouse_id}
                  className="hover:bg-[#F5F7FA] transition-all duration-300 border-b border-[#E5E7EB] group h-14"
                >
                  <TableCell className="px-4 py-3 whitespace-nowrap text-nowrap">
                    <span
                      className="text-[#1D4ED8] font-bold text-sm hover:text-[#0F172A] hover:underline cursor-pointer transition-all duration-200"
                      onClick={() => onWarehouseClick(warehouse.warehouse_id)}
                    >
                      {warehouse.warehouse_id}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-nowrap">
                    <span className="text-sm text-[#4A5568]">
                      {displayValue(warehouse.consignor_id)}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-nowrap">
                    <span className="text-sm text-[#4A5568]">
                      {displayValue(
                        warehouse.warehouse_type_name ||
                          warehouse.warehouse_type
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-nowrap">
                    <div className="max-w-xs">
                      <span
                        className="text-sm text-[#0D1A33] truncate block font-medium"
                        title={warehouse.warehouse_name1}
                      >
                        {displayValue(warehouse.warehouse_name1)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-nowrap text-center">
                    {displayBoolean(warehouse.geo_fencing)}
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-nowrap text-center">
                    {displayBoolean(warehouse.weigh_bridge_availability)}
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-nowrap text-center">
                    {displayBoolean(warehouse.virtual_yard_in)}
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-nowrap text-center">
                    {displayBoolean(warehouse.gatepass_system_available)}
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-nowrap text-center">
                    {displayBoolean(warehouse.fuel_availability)}
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-nowrap">
                    <span className="text-sm text-[#4A5568]">
                      {displayValue(warehouse.city)}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-nowrap">
                    <span className="text-sm text-[#4A5568]">
                      {displayValue(warehouse.state)}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-nowrap">
                    <span className="text-sm text-[#4A5568]">
                      {displayValue(warehouse.country)}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-nowrap">
                    <span className="text-sm text-[#4A5568]">
                      {displayValue(warehouse.region)}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-nowrap">
                    <span className="text-sm text-[#4A5568]">
                      {displayValue(warehouse.zone)}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-nowrap">
                    <span className="text-sm text-[#4A5568]">
                      {displayValue(warehouse.created_by)}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-nowrap">
                    <span className="text-sm text-[#4A5568]">
                      {displayValue(
                        warehouse.created_on
                          ? warehouse.created_on.split("T")[0]
                          : null
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {/* ✅ Status with delete draft button (matching transporter pattern) */}
                    <div className="flex items-center justify-center gap-2">
                      <StatusPill status={warehouse.status} />
                      {warehouse.status === "SAVE_AS_DRAFT" &&
                        onDeleteDraft && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteDraft(warehouse.warehouse_id);
                            }}
                            className="p-1 hover:bg-red-50 rounded-md transition-colors duration-200 group"
                            title="Delete draft"
                          >
                            <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-colors duration-200" />
                          </button>
                        )}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-nowrap">
                    <span className="text-sm text-[#4A5568]">
                      {displayValue(warehouse.approver)}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-nowrap">
                    <span className="text-sm text-[#4A5568]">
                      {displayValue(
                        warehouse.approvedOn
                          ? new Date(warehouse.approvedOn).toLocaleDateString()
                          : null
                      )}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination Section */}
      {totalItems > 0 && (
        <div className="px-6 py-6 border-t border-[#E5E7EB] bg-white">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Left side - Results info */}
            <span className="text-xs sm:text-sm text-[#4A5568] font-semibold">
              <span className="hidden sm:inline">Showing </span>
              <span className="text-[#0D1A33] font-bold">{startItem}</span>-
              <span className="text-[#0D1A33] font-bold">{endItem}</span>
              <span className="hidden sm:inline"> of </span>
              <span className="sm:hidden">/</span>
              <span className="text-[#1D4ED8] font-bold">{totalItems}</span>
              <span className="hidden sm:inline"> warehouses</span>
            </span>

            {/* Right side - Pagination controls */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="hover:bg-[#1D4ED8]/10 hover:border-[#1D4ED8] hover:text-[#1D4ED8] rounded-lg transition-all duration-200 disabled:opacity-50 py-2.5 px-5"
              >
                <ChevronLeft className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Previous</span>
              </Button>

              <span
                className="text-xs sm:text-sm text-[#0D1A33] px-5 py-2.5 bg-white rounded-lg border border-[#E5E7EB] font-semibold"
                style={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)" }}
              >
                <span className="text-[#1D4ED8] font-bold">{currentPage}</span>
                <span className="text-[#4A5568]">/</span>
                <span className="text-[#0D1A33]">{totalPages}</span>
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="hover:bg-[#1D4ED8]/10 hover:border-[#1D4ED8] hover:text-[#1D4ED8] rounded-lg transition-all duration-200 disabled:opacity-50 py-2.5 px-5"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4 sm:ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default memo(WarehouseListTable);
