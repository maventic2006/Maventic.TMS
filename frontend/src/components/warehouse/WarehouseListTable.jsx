import React, { memo } from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, XCircle, Search } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../ui/Table";
import { Card, CardContent } from "../ui/Card";
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
  if (value === true) {
    return (
      <div className="flex items-center gap-1 text-green-600">
        <CheckCircle2 className="h-4 w-4" />
        <span className="font-medium">Yes</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 text-gray-400">
      <XCircle className="h-4 w-4" />
      <span className="font-medium">No</span>
    </div>
  );
};

const WarehouseListTable = ({
  warehouses,
  loading,
  onWarehouseClick,
  // Count props
  filteredCount,
  // Search props
  searchText,
  onSearchChange,
}) => {
  // Determine if we should show "no results" message
  const showNoResults = !loading && warehouses.length === 0;

  return (
    <Card
      className="overflow-hidden rounded-xl"
      style={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)" }}
    >
      {/* Results Count Section */}
      <div className="px-0 pb-4">
        <div className="flex items-center justify-between">
          {/* Left side - Results count */}
          <p className="text-sm text-[#0D1A33] font-semibold">
            <span className="text-[#1D4ED8] font-bold">{filteredCount}</span>{" "}
            Warehouses Found
          </p>

          {/* Right side - Search bar */}
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
                className="pl-10 pr-4 py-2 w-48 sm:w-64 lg:w-72 border border-[#E5E7EB] rounded-lg focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 focus:outline-none transition-all duration-200 text-sm"
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
          </div>
        </div>
      )}

      {/* No Results State */}
      {showNoResults && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center space-y-2 text-center max-w-md">
            <p className="text-lg font-semibold text-[#0D1A33]">
              No warehouses found
            </p>
            <p className="text-sm text-[#4A5568]">
              {searchText
                ? `No results found for "${searchText}". Try adjusting your search or filters.`
                : "No warehouses available. Create your first warehouse to get started."}
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      {!loading && !showNoResults && (
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b-2 border-gray-200">
                  <TableHead className="text-xs font-bold text-[#0D1A33] uppercase tracking-wide py-4 whitespace-nowrap">
                    Warehouse ID
                  </TableHead>
                  <TableHead className="text-xs font-bold text-[#0D1A33] uppercase tracking-wide py-4 whitespace-nowrap">
                    Type
                  </TableHead>
                  <TableHead className="text-xs font-bold text-[#0D1A33] uppercase tracking-wide py-4 whitespace-nowrap">
                    Name
                  </TableHead>
                  <TableHead className="text-xs font-bold text-[#0D1A33] uppercase tracking-wide py-4 whitespace-nowrap text-center">
                    WeighBridge
                  </TableHead>
                  <TableHead className="text-xs font-bold text-[#0D1A33] uppercase tracking-wide py-4 whitespace-nowrap text-center">
                    Virtual Yard
                  </TableHead>
                  <TableHead className="text-xs font-bold text-[#0D1A33] uppercase tracking-wide py-4 whitespace-nowrap text-center">
                    Gatepass
                  </TableHead>
                  <TableHead className="text-xs font-bold text-[#0D1A33] uppercase tracking-wide py-4 whitespace-nowrap text-center">
                    Fuel
                  </TableHead>
                  <TableHead className="text-xs font-bold text-[#0D1A33] uppercase tracking-wide py-4 whitespace-nowrap">
                    Region
                  </TableHead>
                  <TableHead className="text-xs font-bold text-[#0D1A33] uppercase tracking-wide py-4 whitespace-nowrap">
                    Zone
                  </TableHead>
                  <TableHead className="text-xs font-bold text-[#0D1A33] uppercase tracking-wide py-4 whitespace-nowrap">
                    Created By
                  </TableHead>
                  <TableHead className="text-xs font-bold text-[#0D1A33] uppercase tracking-wide py-4 whitespace-nowrap">
                    Created On
                  </TableHead>
                  <TableHead className="text-xs font-bold text-[#0D1A33] uppercase tracking-wide py-4 whitespace-nowrap text-center">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warehouses.map((warehouse, index) => (
                  <motion.tr
                    key={warehouse.warehouse_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className="border-b border-gray-100 hover:bg-gray-50/50 cursor-pointer transition-all duration-150"
                  >
                    <TableCell className="py-4 px-6">
                      <button
                        onClick={() => onWarehouseClick(warehouse.warehouse_id)}
                        className="text-[#1D4ED8] hover:text-[#1E40AF] font-semibold hover:underline transition-colors duration-150"
                      >
                        {displayValue(warehouse.warehouse_id)}
                      </button>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-sm text-[#0D1A33]">
                      {displayValue(warehouse.warehouse_type)}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-sm text-[#0D1A33] font-medium">
                      {displayValue(warehouse.warehouse_name1)}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-center">
                      {displayBoolean(warehouse.weigh_bridge_availability)}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-center">
                      {displayBoolean(warehouse.virtual_yard_in)}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-center">
                      {displayBoolean(warehouse.gatepass_system_available)}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-center">
                      {displayBoolean(warehouse.fuel_availability)}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-sm text-[#0D1A33]">
                      {displayValue(warehouse.region)}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-sm text-[#0D1A33]">
                      {displayValue(warehouse.zone)}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-sm text-[#0D1A33]">
                      {displayValue(warehouse.created_by)}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-sm text-[#0D1A33]">
                      {displayValue(
                        warehouse.created_at
                          ? new Date(warehouse.created_at).toLocaleDateString()
                          : null
                      )}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-center">
                      <StatusPill status={warehouse.status} />
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default memo(WarehouseListTable);
