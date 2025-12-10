import React, { memo } from "react";
import { motion } from "framer-motion";
import {
  Building,
  Phone,
  Mail,
  Hash,
  MapPin,
  Loader2,
  Truck,
  Plane,
  Train,
  Ship,
  User,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Search,
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
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import StatusPill from "./StatusPill";
import StatusBadges from "../ui/StatusBadges";

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

const TransportModeIcons = ({ modes }) => {
  const iconMap = {
    R: { icon: Truck, label: "R", color: "text-green-500" },
    A: { icon: Plane, label: "A", color: "text-blue-500" },
    RL: { icon: Train, label: "RL", color: "text-purple-500" },
    S: { icon: Ship, label: "S", color: "text-cyan-500" },
  };

  return (
    <div className="flex items-center space-x-2">
      {modes.map((mode, index) => {
        const modeData = iconMap[mode];
        const IconComponent = modeData?.icon;
        return IconComponent ? (
          <div
            key={index}
            className={`flex items-center space-x-1 ${modeData.color}`}
            title={`${
              mode === "R"
                ? "Road"
                : mode === "A"
                ? "Air"
                : mode === "RL"
                ? "Rail"
                : "Sea"
            }`}
          >
            <IconComponent className="h-5 w-5" />
            <span className="text-pill font-medium">{modeData.label}</span>
          </div>
        ) : null;
      })}
    </div>
  );
};

const TransporterListTable = ({
  transporters,
  loading,
  onTransporterClick,
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
  // Status badges props
  statusCounts,
  statusCountsLoading,
  selectedStatus,
  onStatusClick,
}) => {
  // Pagination calculations
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Determine if we should show "no results" message
  const showNoResults = !loading && transporters.length === 0;

  return (
    <Card
      className="overflow-hidden rounded-xl border border-gray-200 bg-white"
      style={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)" }}
    >
      {/* Results Count Section - Always visible */}
      <div className="px-0 pb-4 border-b border-gray-100 bg-white">
        <div className="flex items-center justify-between">
          {/* Left side - Status badges */}
          <StatusBadges
            counts={statusCounts}
            selectedStatus={selectedStatus}
            onStatusClick={onStatusClick}
            loading={statusCountsLoading}
            module="transporter"
          />

          {/* Right side - Search bar - Always visible */}
          <div className="flex items-center gap-4">
            {searchText && (
              <div className="text-xs text-[#4A5568] hidden sm:block">
                Searching in {filteredCount} transporters
              </div>
            )}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#4A5568] pointer-events-none z-10" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search transporters..."
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
            <span className="text-sm font-semibold">
              Loading transporters...
            </span>
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
                No Transporters Found
              </h3>
              <p className="text-sm text-[#4A5568] max-w-md">
                {searchText
                  ? `No results found for "${searchText}". Try adjusting your search or use different keywords.`
                  : "Try adjusting your filters, or create a new transporter to get started."}
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
          {transporters.map((transporter, index) => (
            <motion.div
              key={transporter.id}
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
                    onClick={() => onTransporterClick(transporter.id)}
                  >
                    {transporter.id}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill status={transporter.status} />
                  {transporter.status === "SAVE_AS_DRAFT" && onDeleteDraft && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDraft(transporter.id);
                      }}
                      className="inline-flex items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Delete Draft"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Business Name */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Building className="h-4 w-4 text-[#4A5568]" />
                  <span className="text-xs text-[#4A5568] font-semibold">
                    Business Name
                  </span>
                </div>
                <p className="font-semibold text-[#0D1A33] text-sm truncate">
                  {transporter.businessName}
                </p>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Phone className="h-3 w-3 text-[#4A5568]" />
                    <span className="text-xs text-[#4A5568] font-semibold">
                      Phone
                    </span>
                  </div>
                  <p className="text-sm text-[#0D1A33]">
                    {displayValue(transporter.mobileNumber)}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Mail className="h-3 w-3 text-[#4A5568]" />
                    <span className="text-xs text-[#4A5568] font-semibold">
                      Email
                    </span>
                  </div>
                  <p className="text-sm text-[#0D1A33] truncate">
                    {displayValue(transporter.emailId)}
                  </p>
                </div>
              </div>

              {/* Tax Information */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Hash className="h-3 w-3 text-[#4A5568]" />
                    <span className="text-xs text-[#4A5568] font-semibold">
                      TIN/PAN
                    </span>
                  </div>
                  <p className="text-sm text-[#0D1A33]">
                    {displayValue(transporter.tinPan)}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Hash className="h-3 w-3 text-[#4A5568]" />
                    <span className="text-xs text-[#4A5568] font-semibold">
                      TAN
                    </span>
                  </div>
                  <p className="text-sm text-[#0D1A33]">
                    {displayValue(transporter.tan)}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Hash className="h-3 w-3 text-[#4A5568]" />
                    <span className="text-xs text-[#4A5568] font-semibold">
                      VAT/GST
                    </span>
                  </div>
                  <p className="text-sm text-[#0D1A33]">
                    {displayValue(transporter.vatGst)}
                  </p>
                </div>
              </div>

              {/* Transport Mode */}
              <div className="mb-4">
                <div className="flex items-center gap-1 mb-1">
                  <Truck className="h-3 w-3 text-[#4A5568]" />
                  <span className="text-xs text-[#4A5568] font-semibold">
                    Transport Mode
                  </span>
                </div>
                <TransportModeIcons modes={transporter.transportMode} />
              </div>

              {/* Address */}
              <div className="mb-4">
                <div className="flex items-center gap-1 mb-1">
                  <MapPin className="h-3 w-3 text-[#4A5568]" />
                  <span className="text-xs text-[#4A5568] font-semibold">
                    Address
                  </span>
                </div>
                <p
                  className="text-sm text-[#0D1A33] overflow-hidden"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {displayValue(transporter.address)}
                </p>
              </div>

              {/* Footer with additional info */}
              <div className="flex items-center justify-between pt-4 border-t border-[#E5E7EB]">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3 text-[#4A5568]" />
                  <span className="text-xs text-[#4A5568] font-semibold">
                    By {displayValue(transporter.createdBy)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-[#4A5568]" />
                  <span className="text-xs text-[#4A5568] font-semibold">
                    {displayValue(transporter.createdOn)}
                  </span>
                </div>
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
                <TableHead className="text-white w-16 text-sm font-semibold h-14">
                  <div className="flex items-center">
                    Transporter ID
                    <svg
                      className="ml-2 h-4 w-4 opacity-70"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </TableHead>
                <TableHead className="text-white w-40 text-sm font-semibold h-14">
                  <div className="flex items-center">
                    Business Name
                    <svg
                      className="ml-2 h-4 w-4 opacity-70"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </TableHead>
                <TableHead className="text-white w-32 text-sm font-semibold h-14">
                  Transport Mode
                </TableHead>
                <TableHead className="text-white w-28 text-sm font-semibold h-14">
                  Mobile Number
                </TableHead>
                <TableHead className="text-white w-40 text-sm font-semibold h-14">
                  Email ID
                </TableHead>
                <TableHead className="text-white w-32 text-sm font-semibold h-14">
                  TIN/PAN
                </TableHead>
                <TableHead className="text-white w-28 text-sm font-semibold h-14">
                  TAN
                </TableHead>
                <TableHead className="text-white w-32 text-sm font-semibold h-14">
                  VAT/GST
                </TableHead>
                <TableHead className="text-white w-48 text-sm font-semibold h-14">
                  Address
                </TableHead>
                <TableHead className="text-white w-28 text-sm font-semibold h-14">
                  Created By
                </TableHead>
                <TableHead className="text-white w-24 text-sm font-semibold h-14">
                  Created On
                </TableHead>
                <TableHead className="text-white w-24 text-sm font-semibold h-14">
                  Status
                </TableHead>
                <TableHead className="text-white w-32 text-sm font-semibold h-14">
                  Approver
                </TableHead>
                <TableHead className="text-white w-24 text-sm font-semibold h-14">
                  Approved On
                </TableHead>
                <TableHead className="text-white w-20 text-sm font-semibold h-14 text-center">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transporters.map((transporter, index) => (
                <TableRow
                  key={transporter.id}
                  className="hover:bg-[#F5F7FA] transition-all duration-300 border-b border-[#E5E7EB] group h-14"
                >
                  <TableCell className="px-4 py-3 whitespace-nowrap text-nowrap">
                    <span
                      className="text-[#1D4ED8] font-bold text-sm hover:text-[#0F172A] hover:underline cursor-pointer transition-all duration-200"
                      onClick={() => onTransporterClick(transporter.id)}
                    >
                      {transporter.id}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-nowrap">
                    <div className="max-w-xs">
                      <span
                        className="text-sm text-[#0D1A33] truncate block font-semibold"
                        title={transporter.businessName}
                      >
                        {displayValue(transporter.businessName)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-nowrap">
                    <TransportModeIcons modes={transporter.transportMode} />
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-nowrap">
                    <span className="text-sm text-[#4A5568]">
                      {displayValue(transporter.mobileNumber)}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-nowrap">
                    <div className="max-w-xs">
                      <span
                        className="text-sm text-[#4A5568] truncate block"
                        title={transporter.emailId}
                      >
                        {displayValue(transporter.emailId)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-nowrap">
                    <span className="text-sm text-[#4A5568]">
                      {displayValue(transporter.tinPan)}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-nowrap">
                    <span className="text-sm text-[#4A5568]">
                      {displayValue(transporter.tan)}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-nowrap">
                    <span className="text-sm text-[#4A5568]">
                      {displayValue(transporter.vatGst)}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-nowrap">
                    <div className="max-w-48">
                      <span
                        className="text-sm text-[#4A5568] truncate block"
                        title={transporter.address}
                      >
                        {displayValue(transporter.address)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-nowrap">
                    <span className="text-sm text-[#4A5568]">
                      {displayValue(transporter.createdBy)}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-nowrap">
                    <span className="text-sm text-[#4A5568]">
                      {displayValue(transporter.createdOn)}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <StatusPill status={transporter.status} />
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-nowrap">
                    <span className="text-sm text-[#4A5568]">
                      {displayValue(transporter.approver)}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-nowrap">
                    <span className="text-sm text-[#4A5568]">
                      {displayValue(transporter.approvedOn)}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center">
                    {transporter.status === "SAVE_AS_DRAFT" &&
                      onDeleteDraft && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteDraft(transporter.id);
                          }}
                          className="inline-flex items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="Delete Draft"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
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
              <span className="hidden sm:inline"> transporters</span>
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

export default memo(TransporterListTable);
