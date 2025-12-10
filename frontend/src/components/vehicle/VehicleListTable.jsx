import React from "react";
import { motion } from "framer-motion";
import {
  Truck,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../ui/Table";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import VehicleStatusPill from "./VehicleStatusPill";
import StatusBadges from "../ui/StatusBadges";
import { getPageTheme } from "../../theme.config";
import { formatDate } from "../../utils/helpers";

const theme = getPageTheme("list");

const displayValue = (value) => {
  return value ?? "N/A";
};

const VehicleListTable = ({
  vehicles,
  loading,
  onVehicleClick,
  onDeleteDraft,
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
  // Status badge props
  statusCounts,
  statusCountsLoading,
  selectedStatus,
  onStatusClick,
}) => {
  // Pagination calculations
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Determine if we should show "no results" message
  const showNoResults = !loading && vehicles.length === 0;

  return (
    <Card
      className="overflow-hidden rounded-xl border-0"
      style={{
        boxShadow: theme.colors.card.shadow,
        background: theme.colors.card.background,
      }}
    >
      {/* Header with search */}
      <div
        className="px-6 py-2 border-b"
        style={{
          borderColor: theme.colors.header.border,
          background: theme.colors.header.background,
        }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            {/* <h2 className="text-lg font-bold" style={{ color: theme.colors.text.primary }}>
              Vehicle List
            </h2> */}
            <p
              className="text-sm mt-1"
              style={{ color: theme.colors.text.secondary }}
            >
              <StatusBadges
                counts={statusCounts}
                selectedStatus={selectedStatus}
                onStatusClick={onStatusClick}
                loading={statusCountsLoading}
                module="vehicle"
              />
            </p>
          </div>
          <div className="relative w-full sm:w-auto">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none z-10"
              style={{ color: theme.colors.search.icon }}
            />
            <input
              type="text"
              value={searchText}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search vehicles by ID, make, model, fuel type, status..."
              className="pl-10 pr-4 py-2.5 w-full sm:w-80 rounded-lg focus:ring-2 focus:outline-none transition-all duration-200 text-sm"
              style={{
                border: `1px solid ${theme.colors.search.border}`,
                background: theme.colors.search.background,
                color: theme.colors.text.primary,
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = theme.colors.pagination.active)
              }
              onBlur={(e) =>
                (e.target.style.borderColor = theme.colors.search.border)
              }
            />
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-[#1D4ED8]" />
            <span className="text-sm font-semibold text-[#4A5568]">
              Loading vehicles...
            </span>
          </div>
        </div>
      )}

      {/* No Results */}
      {showNoResults && (
        <div className="text-center py-16">
          <Truck className="h-20 w-20 text-[#E5E7EB] mx-auto mb-4" />
          <h3 className="text-lg font-bold text-[#0D1A33] mb-2">
            No Vehicles Found
          </h3>
          <p className="text-sm text-[#4A5568]">
            {searchText
              ? `No results for "${searchText}"`
              : "Try adjusting your filters"}
          </p>
        </div>
      )}

      {/* Mobile Cards */}
      {!loading && !showNoResults && (
        <div className="block lg:hidden p-4 space-y-3">
          {vehicles.map((vehicle, index) => (
            <motion.div
              key={vehicle.vehicleId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="rounded-xl p-5 cursor-pointer transition-all duration-200"
              style={{
                border: `1px solid ${theme.colors.card.border}`,
                background: theme.colors.card.background,
              }}
              whileHover={{
                scale: 1.02,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onVehicleClick(vehicle.vehicleId)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <span
                    className="font-bold text-lg block"
                    style={{ color: theme.colors.pagination.active }}
                  >
                    {vehicle.vehicleId}
                  </span>
                  <p
                    className="text-sm mt-1 font-medium"
                    style={{ color: theme.colors.text.primary }}
                  >
                    {vehicle.registrationNumber}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <VehicleStatusPill status={vehicle.status} />
                  {vehicle.status === "SAVE_AS_DRAFT" && onDeleteDraft && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDraft(vehicle.vehicleId);
                      }}
                      title="Delete Draft"
                      className="p-1.5 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200 hover:scale-110"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span style={{ color: theme.colors.text.secondary }}>
                    Type:
                  </span>
                  <span
                    className="ml-2 font-semibold"
                    style={{ color: theme.colors.text.primary }}
                  >
                    {vehicle.vehicleType}
                  </span>
                </div>
                <div>
                  <span style={{ color: theme.colors.text.secondary }}>
                    Make:
                  </span>
                  <span
                    className="ml-2 font-semibold"
                    style={{ color: theme.colors.text.primary }}
                  >
                    {vehicle.make}
                  </span>
                </div>
                <div>
                  <span style={{ color: theme.colors.text.secondary }}>
                    Model:
                  </span>
                  <span
                    className="ml-2 font-semibold"
                    style={{ color: theme.colors.text.primary }}
                  >
                    {vehicle.model}
                  </span>
                </div>
                <div>
                  <span style={{ color: theme.colors.text.secondary }}>
                    Year:
                  </span>
                  <span
                    className="ml-2 font-semibold"
                    style={{ color: theme.colors.text.primary }}
                  >
                    {vehicle.year}
                  </span>
                </div>
                <div>
                  <span style={{ color: theme.colors.text.secondary }}>
                    Fuel:
                  </span>
                  <span
                    className="ml-2 font-semibold"
                    style={{ color: theme.colors.text.primary }}
                  >
                    {vehicle.fuelType}
                  </span>
                </div>
                <div>
                  <span style={{ color: theme.colors.text.secondary }}>
                    Condition:
                  </span>
                  <span
                    className="ml-2 font-semibold"
                    style={{ color: theme.colors.text.primary }}
                  >
                    {displayValue(vehicle.vehicleCondition)}
                  </span>
                </div>
                {vehicle.approver && (
                  <div>
                    <span style={{ color: theme.colors.text.secondary }}>
                      Approver:
                    </span>
                    <span
                      className="ml-2 font-semibold"
                      style={{ color: theme.colors.text.primary }}
                    >
                      {vehicle.approver}
                    </span>
                  </div>
                )}
                {vehicle.approvedOn && (
                  <div>
                    <span style={{ color: theme.colors.text.secondary }}>
                      Approved On:
                    </span>
                    <span
                      className="ml-2 font-semibold"
                      style={{ color: theme.colors.text.primary }}
                    >
                      {vehicle.approvedOn}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Desktop Table */}
      {!loading && !showNoResults && (
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr
                style={{
                  background: theme.colors.table.header.background,
                  borderBottom: `1px solid ${theme.colors.table.header.border}`,
                }}
              >
                <th
                  className="text-center px-4 py-3 text-xs font-bold uppercase tracking-wider text-nowrap"
                  style={{ color: theme.colors.table.header.text }}
                >
                  Vehicle ID
                </th>
                <th
                  className="text-center px-4 py-3 text-xs font-bold uppercase tracking-wider text-nowrap"
                  style={{ color: theme.colors.table.header.text }}
                >
                  Type
                </th>
                <th
                  className="text-center px-4 py-3 text-xs font-bold uppercase tracking-wider text-nowrap"
                  style={{ color: theme.colors.table.header.text }}
                >
                  Regn Number
                </th>
                <th
                  className="text-center px-4 py-3 text-xs font-bold uppercase tracking-wider text-nowrap"
                  style={{ color: theme.colors.table.header.text }}
                >
                  Make/Brand
                </th>
                <th
                  className="text-center px-4 py-3 text-xs font-bold uppercase tracking-wider text-nowrap"
                  style={{ color: theme.colors.table.header.text }}
                >
                  Model
                </th>
                <th
                  className="text-center px-4 py-3 text-xs font-bold uppercase tracking-wider text-nowrap"
                  style={{ color: theme.colors.table.header.text }}
                >
                  Year
                </th>
                <th
                  className="text-center px-4 py-3 text-xs font-bold uppercase tracking-wider text-nowrap"
                  style={{ color: theme.colors.table.header.text }}
                >
                  Fuel Type
                </th>
                <th
                  className="text-center px-4 py-3 text-xs font-bold uppercase tracking-wider text-nowrap"
                  style={{ color: theme.colors.table.header.text }}
                >
                  Condition
                </th>
                <th
                  className="text-center px-4 py-3 text-xs font-bold uppercase tracking-wider text-nowrap"
                  style={{ color: theme.colors.table.header.text }}
                >
                  Towing Cap. (kg)
                </th>
                <th
                  className="text-center px-4 py-3 text-xs font-bold uppercase tracking-wider text-nowrap"
                  style={{ color: theme.colors.table.header.text }}
                >
                  Fuel Cap. (L)
                </th>
                <th
                  className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-nowrap"
                  style={{ color: theme.colors.table.header.text }}
                >
                  Created by
                </th>
                <th
                  className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-nowrap"
                  style={{ color: theme.colors.table.header.text }}
                >
                  Created on
                </th>
                <th
                  className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-nowrap"
                  style={{ color: theme.colors.table.header.text }}
                >
                  Status
                </th>
                <th
                  className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-nowrap"
                  style={{ color: theme.colors.table.header.text }}
                >
                  Approver
                </th>
                <th
                  className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-nowrap"
                  style={{ color: theme.colors.table.header.text }}
                >
                  Approved on
                </th>
                <th
                  className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-nowrap"
                  style={{ color: theme.colors.table.header.text }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle, index) => (
                <motion.tr
                  key={vehicle.vehicleId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03, duration: 0.2 }}
                  className="border-b transition-all duration-200 h-12"
                  style={{
                    borderColor: theme.colors.table.row.border,
                    background: theme.colors.table.row.background,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      theme.colors.table.row.hover;
                    e.currentTarget.style.transform = "translateX(2px)";
                    e.currentTarget.style.boxShadow =
                      "0 2px 8px rgba(0, 0, 0, 0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      theme.colors.table.row.background;
                    e.currentTarget.style.transform = "translateX(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <td className="px-4 py-2">
                    <span
                      onClick={() => onVehicleClick(vehicle.vehicleId)}
                      className="font-bold cursor-pointer hover:underline transition-colors duration-200 text-sm"
                      style={{ color: theme.colors.pagination.active }}
                    >
                      {vehicle.vehicleId}
                    </span>
                  </td>
                  <td
                    className="px-4 py-2 text-sm text-center text-nowrap"
                    style={{ color: theme.colors.text.secondary }}
                  >
                    {vehicle.vehicleType}
                  </td>
                  <td
                    className="px-4 py-2 font-semibold text-sm text-center text-nowrap"
                    style={{ color: theme.colors.text.primary }}
                  >
                    {vehicle.registrationNumber}
                  </td>
                  <td
                    className="px-4 py-2 text-sm text-center text-nowrap"
                    style={{ color: theme.colors.text.secondary }}
                  >
                    {vehicle.make}
                  </td>
                  <td
                    className="px-4 py-2 text-sm text-center text-nowrap"
                    style={{ color: theme.colors.text.secondary }}
                  >
                    {displayValue(vehicle.model)}
                  </td>
                  <td
                    className="px-4 py-2 text-sm text-center text-nowrap"
                    style={{ color: theme.colors.text.secondary }}
                  >
                    {displayValue(vehicle.year)}
                  </td>
                  <td className="px-4 py-2 text-center text-nowrap">
                    <span
                      className="text-sm font-medium"
                      style={{ color: theme.colors.text.secondary }}
                    >
                      {displayValue(vehicle.fuelType)}
                    </span>
                  </td>
                  <td
                    className="px-4 py-2 text-sm text-center text-nowrap"
                    style={{ color: theme.colors.text.secondary }}
                  >
                    {displayValue(vehicle.vehicleCondition)}
                  </td>
                  <td
                    className="px-4 py-2 text-sm text-center font-semibold text-nowrap"
                    style={{ color: theme.colors.text.primary }}
                  >
                    {displayValue(vehicle.towingCapacity)}
                  </td>
                  <td
                    className="px-4 py-2 text-sm text-center font-semibold text-nowrap"
                    style={{ color: theme.colors.text.primary }}
                  >
                    {displayValue(vehicle.fuelCapacity)}
                  </td>
                  <td
                    className="px-4 py-2 text-sm text-center font-semibold text-nowrap"
                    style={{ color: theme.colors.text.primary }}
                  >
                    {displayValue(vehicle.createdBy)}
                  </td>
                  <td
                    className="px-4 py-2 text-sm text-center font-semibold text-nowrap"
                    style={{ color: theme.colors.text.primary }}
                  >
                    {formatDate(vehicle.createdAt)}
                  </td>
                  <td className="px-4 py-2 text-center text-nowrap">
                    <VehicleStatusPill status={vehicle.status} />
                  </td>
                  <td
                    className="px-4 py-2 text-sm text-center font-semibold text-nowrap"
                    style={{ color: theme.colors.text.primary }}
                  >
                    {displayValue(vehicle.approver)}
                  </td>
                  <td
                    className="px-4 py-2 text-sm text-center font-semibold text-nowrap"
                    style={{ color: theme.colors.text.primary }}
                  >
                    {displayValue(vehicle.approvedOn)}
                  </td>
                  <td className="px-4 py-2 text-center text-nowrap">
                    {vehicle.status === "SAVE_AS_DRAFT" && onDeleteDraft && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteDraft(vehicle.vehicleId);
                        }}
                        title="Delete Draft"
                        className="p-1.5 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200 hover:scale-110"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
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
              <span className="hidden sm:inline"> vehicles</span>
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

export default VehicleListTable;
