import React, { memo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Calendar,
  DollarSign,
  Briefcase,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const ConsignorListTable = ({
  consignors,
  loading,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  filteredCount,
  searchText,
  onSearchChange,
}) => {
  const navigate = useNavigate();

  // Helper function to display N/A for empty or null values
  const displayValue = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === "" ||
      value === "N/A"
    ) {
      return (
        <span className="text-gray-400 text-sm font-normal italic">N/A</span>
      );
    }
    return value;
  };

  // Pagination calculations
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Determine if we should show "no results" message
  const showNoResults = !loading && consignors.length === 0;

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Check if document is expired
  const isDocumentExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  // Check if document is expiring soon (within 30 days)
  const isDocumentExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const expiryDateObj = new Date(expiryDate);
    return expiryDateObj > new Date() && expiryDateObj <= thirtyDaysFromNow;
  };

  // Get NDA/MSA status indicator
  const getDocumentStatusIcon = (expiryDate) => {
    if (!expiryDate) {
      return <AlertCircle size={16} className="text-gray-400" />;
    }
    if (isDocumentExpired(expiryDate)) {
      return <AlertCircle size={16} className="text-red-600" />;
    }
    if (isDocumentExpiringSoon(expiryDate)) {
      return <AlertCircle size={16} className="text-yellow-600" />;
    }
    return <CheckCircle size={16} className="text-green-600" />;
  };

  // Handle row click - navigate to details page (only when clicking ID)
  const handleRowClick = (customerId, event) => {
    // Only navigate if clicking on the ID cell
    event.stopPropagation();
    navigate(`/consignor/details/${customerId}`);
  };

  // Calculate serial numbers
  const startIndex = (currentPage - 1) * itemsPerPage;

  return (
    <div
      className="bg-white rounded-xl overflow-hidden border border-gray-200"
      style={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)" }}
    >
      {/* Results Count and Search Section - Always visible */}
      <div className="px-6 py-4 border-b border-gray-100 bg-white">
        <div className="flex items-center justify-between">
          {/* Left side - Results count */}
          <p className="text-sm text-[#0D1A33] font-semibold">
            <span className="text-[#1D4ED8] font-bold">{filteredCount}</span>{" "}
            Consignors Found
          </p>

          {/* Right side - Search bar - Always visible */}
          <div className="flex items-center gap-4">
            {searchText && (
              <div className="text-xs text-[#4A5568] hidden sm:block">
                Searching in {filteredCount} consignors
              </div>
            )}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#4A5568] pointer-events-none z-10" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search consignors..."
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
            <span className="text-sm font-semibold">Loading consignors...</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {showNoResults && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="p-4 bg-gray-100 rounded-full">
              <Building2 className="w-12 h-12 text-gray-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Consignors Found
              </h3>
              <p className="text-gray-600 max-w-md">
                {searchText
                  ? `No consignors match your search "${searchText}". Try adjusting your search or filters.`
                  : "No consignors available. Create your first consignor to get started."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {!loading && !showNoResults && (
        <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          {/* Table Header */}
          <thead>
            <tr className="bg-[#0D1A33] hover:bg-[#0D1A33]/90 transition-all duration-300">
              <th className="px-4 py-3.5 text-left text-sm font-semibold text-white h-14 min-w-[60px]">
                S.No
              </th>
              <th className="px-4 py-3.5 text-left text-sm font-semibold text-white h-14 min-w-[120px]">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Customer ID
                  <svg
                    className="ml-1 h-4 w-4 opacity-70"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </th>
              <th className="px-4 py-3.5 text-left text-sm font-semibold text-white h-14 min-w-[200px]">
                <div className="flex items-center gap-2">
                  Customer Name
                  <svg
                    className="ml-1 h-4 w-4 opacity-70"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </th>
              <th className="px-4 py-3.5 text-left text-sm font-semibold text-white h-14 min-w-[150px]">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Industry Type
                </div>
              </th>
              <th className="px-4 py-3.5 text-left text-sm font-semibold text-white h-14 min-w-[120px]">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Currency
                </div>
              </th>
              <th className="px-4 py-3.5 text-left text-sm font-semibold text-white h-14 min-w-[130px]">
                Payment Term
              </th>
              <th className="px-4 py-3.5 text-center text-sm font-semibold text-white h-14 min-w-[100px]">
                <div className="flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" />
                  NDA
                </div>
              </th>
              <th className="px-4 py-3.5 text-center text-sm font-semibold text-white h-14 min-w-[100px]">
                <div className="flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" />
                  MSA
                </div>
              </th>
              <th className="px-4 py-3.5 text-left text-sm font-semibold text-white h-14 min-w-[140px]">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Created Date
                </div>
              </th>
              <th className="px-4 py-3.5 text-center text-sm font-semibold text-white h-14 min-w-[100px]">
                Status
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {consignors.map((consignor, index) => (
              <tr
                key={consignor.customer_id}
                className="border-b border-[#E5E7EB] hover:bg-[#F5F7FA] transition-all duration-300 group h-14"
              >
                {/* Serial Number */}
                <td className="px-4 py-3 text-sm text-[#4A5568] whitespace-nowrap">
                  {startIndex + index + 1}
                </td>

                {/* Customer ID - Clickable */}
                <td
                  className="px-4 py-3 whitespace-nowrap cursor-pointer"
                  onClick={(e) => handleRowClick(consignor.customer_id, e)}
                >
                  <span className="text-[#1D4ED8] font-bold text-sm hover:text-[#0F172A] hover:underline transition-all duration-200">
                    {displayValue(consignor.customer_id)}
                  </span>
                </td>

                {/* Customer Name */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm font-semibold text-[#0D1A33]">
                    {displayValue(consignor.customer_name)}
                  </span>
                </td>

                {/* Industry Type */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm text-[#4A5568]">
                    {displayValue(consignor.industry_type)}
                  </span>
                </td>

                {/* Currency Type */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm text-[#4A5568]">
                    {displayValue(consignor.currency_type)}
                  </span>
                </td>

                {/* Payment Term */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    {displayValue(consignor.payment_term)}
                  </span>
                </td>

                {/* NDA Status */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center justify-center gap-2">
                    {getDocumentStatusIcon(consignor.nda_expiry_date)}
                    <span className="text-xs text-[#4A5568]">
                      {consignor.upload_nda ? formatDate(consignor.nda_expiry_date) : "N/A"}
                    </span>
                  </div>
                </td>

                {/* MSA Status */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center justify-center gap-2">
                    {getDocumentStatusIcon(consignor.msa_expiry_date)}
                    <span className="text-xs text-[#4A5568]">
                      {consignor.upload_msa ? formatDate(consignor.msa_expiry_date) : "N/A"}
                    </span>
                  </div>
                </td>

                {/* Created Date */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm text-[#4A5568]">
                    {formatDate(consignor.created_at)}
                  </span>
                </td>

                {/* Status */}
                <td className="px-4 py-3 text-center whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      consignor.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : consignor.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {consignor.status || "UNKNOWN"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      {/* Pagination Section */}
      {totalItems > 0 && !loading && (
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
              <span className="hidden sm:inline"> consignors</span>
            </span>

            {/* Right side - Pagination controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-5 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#0D1A33] hover:bg-[#1D4ED8]/10 hover:border-[#1D4ED8] hover:text-[#1D4ED8] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                style={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)" }}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              <span
                className="text-xs sm:text-sm text-[#0D1A33] px-5 py-2.5 bg-white rounded-lg border border-[#E5E7EB] font-semibold"
                style={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)" }}
              >
                <span className="text-[#1D4ED8] font-bold">{currentPage}</span>
                <span className="text-[#4A5568]">/</span>
                <span className="text-[#0D1A33]">{totalPages}</span>
              </span>

              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-5 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#0D1A33] hover:bg-[#1D4ED8]/10 hover:border-[#1D4ED8] hover:text-[#1D4ED8] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                style={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)" }}
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(ConsignorListTable);
