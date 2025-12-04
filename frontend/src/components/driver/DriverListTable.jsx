import React, { memo } from "react";
import { motion } from "framer-motion";
import {
  User,
  Phone,
  Hash,
  MapPin,
  Loader2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Search,
  CreditCard,
  Star,
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

// Status pill component
const StatusPill = ({ status }) => {
  const getStatusStyle = () => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 border border-green-200";
      case "INACTIVE":
        return "bg-gray-100 text-gray-800 border border-gray-200";
      case "SUSPENDED":
        return "bg-red-100 text-red-800 border border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle()}`}
    >
      {displayValue(status)}
    </span>
  );
};

const DriverListTable = ({
  drivers,
  loading,
  onDriverClick,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  filteredCount,
  searchText,
  onSearchChange,
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  const showNoResults = !loading && drivers.length === 0;

  return (
    <Card
      className="overflow-hidden rounded-xl border border-gray-200 bg-white"
      style={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)" }}
    >
      {/* Results Count and Search Section */}
      <div className="px-0 py-0 pb-4 border-b border-gray-100 bg-white">
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#0D1A33] font-semibold">
            <span className="text-[#1D4ED8] font-bold">{filteredCount}</span>{" "}
            Drivers Found
          </p>

          <div className="flex items-center gap-4">
            {searchText && (
              <div className="text-xs text-[#4A5568] hidden sm:block">
                Searching in {filteredCount} drivers
              </div>
            )}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#4A5568] pointer-events-none z-10" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search drivers..."
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
            <span className="text-sm font-semibold">Loading drivers...</span>
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
              <User className="h-20 w-20 text-[#E5E7EB]" />
              <div className="absolute -top-2 -right-2 h-6 w-6 bg-[#1D4ED8]/10 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-[#1D4ED8] rounded-full"></div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-[#0D1A33]">
                No Drivers Found
              </h3>
              <p className="text-sm text-[#4A5568] max-w-md">
                {searchText
                  ? `No results found for "${searchText}". Try adjusting your search or use different keywords.`
                  : "Try adjusting your filters, or create a new driver to get started."}
              </p>
            </div>
            <div className="flex gap-2 text-xs text-[#4A5568]">
              <span> Check spelling</span>
              <span> Clear filters</span>
              <span> Try different keywords</span>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Card Layout */}
      {!loading && !showNoResults && (
        <div className="block lg:hidden p-6 space-y-4">
          {drivers.map((driver, index) => (
            <motion.div
              key={driver.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white border border-[#E5E7EB] rounded-xl p-6 hover:shadow-md transition-all duration-300"
              style={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-[#1D4ED8]" />
                  <span
                    className="font-bold text-[#1D4ED8] text-sm hover:text-[#0F172A] hover:underline cursor-pointer transition-all duration-200"
                    onClick={() => onDriverClick(driver.id)}
                  >
                    {driver.id}
                  </span>
                </div>
                <StatusPill status={driver.status} />
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-4 w-4 text-[#4A5568]" />
                  <span className="text-xs text-[#4A5568] font-semibold">
                    Full Name
                  </span>
                </div>
                <p className="font-semibold text-[#0D1A33] text-sm truncate">
                  {displayValue(driver.fullName)}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Phone className="h-3 w-3 text-[#4A5568]" />
                    <span className="text-xs text-[#4A5568] font-semibold">
                      Phone
                    </span>
                  </div>
                  <p className="text-sm text-[#0D1A33]">
                    {displayValue(driver.phoneNumber)}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <CreditCard className="h-3 w-3 text-[#4A5568]" />
                    <span className="text-xs text-[#4A5568] font-semibold">
                      License
                    </span>
                  </div>
                  <p className="text-sm text-[#0D1A33] truncate">
                    {displayValue(driver.licenseNumbers)}
                  </p>
                </div>
              </div>

              {/* Address Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <MapPin className="h-3 w-3 text-[#4A5568]" />
                    <span className="text-xs text-[#4A5568] font-semibold">
                      Country
                    </span>
                  </div>
                  <p className="text-sm text-[#0D1A33]">
                    {displayValue(driver.country)}
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
                    {displayValue(driver.state)}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <MapPin className="h-3 w-3 text-[#4A5568]" />
                    <span className="text-xs text-[#4A5568] font-semibold">
                      City
                    </span>
                  </div>
                  <p className="text-sm text-[#0D1A33]">
                    {displayValue(driver.city)}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <MapPin className="h-3 w-3 text-[#4A5568]" />
                    <span className="text-xs text-[#4A5568] font-semibold">
                      Postal Code
                    </span>
                  </div>
                  <p className="text-sm text-[#0D1A33]">
                    {displayValue(driver.postalCode)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <User className="h-3 w-3 text-[#4A5568]" />
                    <span className="text-xs text-[#4A5568] font-semibold">
                      Status
                    </span>
                  </div>
                  <StatusPill status={driver.status} />
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Star className="h-3 w-3 text-[#F59E0B]" />
                    <span className="text-xs text-[#4A5568] font-semibold">
                      Rating
                    </span>
                  </div>
                  <p className="text-sm text-[#0D1A33]">
                    {driver.avgRating
                      ? `${Number(driver.avgRating).toFixed(1)} ⭐`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <User className="h-3 w-3 text-[#4A5568]" />
                    <span className="text-xs text-[#4A5568] font-semibold">
                      Approver
                    </span>
                  </div>
                  <p className="text-sm text-[#0D1A33]">
                    {displayValue(driver.createdBy)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#E5E7EB]">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-[#4A5568]" />
                  <span className="text-xs text-[#4A5568] font-semibold">
                    Approved on: {displayValue(driver.createdOn)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Desktop Table Layout */}
      {!loading && !showNoResults && (
        <div className="hidden lg:block">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#0D1A33] hover:bg-[#0D1A33]/90 transition-all duration-300">
                <TableHead className="text-white w-28 text-sm font-semibold h-14">
                  Driver ID
                </TableHead>
                <TableHead className="text-white w-48 text-sm font-semibold h-14">
                  License Numbers
                </TableHead>
                <TableHead className="text-white w-48 text-sm font-semibold h-14">
                  Full Name
                </TableHead>
                <TableHead className="text-white w-32 text-sm font-semibold h-14">
                  Phone Number
                </TableHead>
                <TableHead className="text-white w-32 text-sm font-semibold h-14">
                  State
                </TableHead>
                <TableHead className="text-white w-32 text-sm font-semibold h-14">
                  Country
                </TableHead>
                <TableHead className="text-white w-32 text-sm font-semibold h-14">
                  City
                </TableHead>
                <TableHead className="text-white w-28 text-sm font-semibold h-14">
                  Postal Code
                </TableHead>
                <TableHead className="text-white w-24 text-sm font-semibold h-14">
                  Rating
                </TableHead>
                <TableHead className="text-white w-24 text-sm font-semibold h-14">
                  Status
                </TableHead>
                <TableHead className="text-white w-24 text-sm font-semibold h-14">
                  Created by
                </TableHead>
                <TableHead className="text-white w-24 text-sm font-semibold h-14">
                  Created on
                </TableHead>
                <TableHead className="text-white w-32 text-sm font-semibold h-14">
                  Approver
                </TableHead>
                <TableHead className="text-white w-32 text-sm font-semibold h-14">
                  Approved On
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drivers.map((driver, index) => (
                <TableRow
                  key={driver.id}
                  className="hover:bg-[#F5F7FA] transition-all duration-300 border-b border-[#E5E7EB] group h-14"
                >
                  <TableCell className="px-4 py-3 whitespace-nowrap">
                    <span
                      className="text-[#1D4ED8] font-bold text-sm hover:text-[#0F172A] hover:underline cursor-pointer transition-all duration-200"
                      onClick={() => onDriverClick(driver.id)}
                    >
                      {driver.id}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap">
                    <div className="max-w-xs">
                      <span
                        className="text-sm text-[#4A5568] truncate block"
                        title={driver.licenseNumbers}
                      >
                        {displayValue(driver.licenseNumbers)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap">
                    <div className="max-w-xs">
                      <span
                        className="text-sm text-[#0D1A33] truncate block font-semibold"
                        title={driver.fullName}
                      >
                        {displayValue(driver.fullName)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm text-[#4A5568]">
                      {displayValue(driver.phoneNumber)}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm text-[#4A5568]">
                      {displayValue(driver.state)}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm text-[#4A5568]">
                      {displayValue(driver.country)}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm text-[#4A5568]">
                      {displayValue(driver.city)}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm text-[#4A5568]">
                      {displayValue(driver.postalCode)}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-[#F59E0B] fill-[#F59E0B]" />
                      <span className="text-sm text-[#0D1A33] font-semibold">
                        {driver.avgRating
                          ? Number(driver.avgRating).toFixed(1)
                          : "N/A"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <StatusPill status={driver.status} />
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm text-[#4A5568]">
                      {displayValue(driver.createdBy)}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm text-[#4A5568]">
                      {displayValue(driver.createdOn)}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm text-[#4A5568]">
                      {displayValue(driver.approver)}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm text-[#4A5568]">
                      {displayValue(driver.approvedOn)}
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
            <span className="text-xs sm:text-sm text-[#4A5568] font-semibold">
              <span className="hidden sm:inline">Showing </span>
              <span className="text-[#0D1A33] font-bold">{startItem}</span>-
              <span className="text-[#0D1A33] font-bold">{endItem}</span>
              <span className="hidden sm:inline"> of </span>
              <span className="sm:hidden">/</span>
              <span className="text-[#1D4ED8] font-bold">{totalItems}</span>
              <span className="hidden sm:inline"> drivers</span>
            </span>

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

export default memo(DriverListTable);
