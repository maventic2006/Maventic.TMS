import React from "react";
import { motion } from "framer-motion";
import { Plus, ArrowLeft, Filter, Truck, Upload } from "lucide-react";
import { getPageTheme, getComponentTheme } from "../../theme.config";
import { Button } from "../ui/Button";

const theme = getPageTheme("list");
const buttonTheme = getComponentTheme("actionButton");

const TopActionBar = ({
  onCreateNew,
  onBulkUpload,
  onBack,
  totalCount,
  showFilters,
  onToggleFilters,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 rounded-xl p-3 my-2 "
      style={{
        boxShadow: theme.colors.card.shadow,
        background: theme.colors.card.background,
        border: `1px solid ${theme.colors.card.border}`,
      }}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="p-2.5 rounded-lg transition-all duration-200"
          style={{
            background: theme.colors.primary.background,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = theme.colors.table.row.hover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = theme.colors.primary.background;
          }}
          title="Back to Portal"
        >
          <ArrowLeft
            className="h-5 w-5"
            style={{ color: theme.colors.text.primary }}
          />
        </motion.button>
        <div>
          <div className="flex items-center gap-3">
            {/* <Truck className="h-7 w-7" style={{ color: theme.colors.pagination.active }} /> */}
            <h1
              className="text-2xl font-bold"
              style={{ color: theme.colors.text.primary }}
            >
              Vehicle Maintenance
            </h1>
          </div>
          {/* <p className="text-sm mt-1" style={{ color: theme.colors.text.secondary }}>
            Manage and monitor your fleet vehicles
          </p> */}
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3 w-full lg:w-auto">
        {/* Total Count Badge */}
        {/* <div
          className="px-4 py-2 rounded-lg hidden sm:block"
          style={{
            background: theme.colors.status.info.background,
            border: `1px solid ${theme.colors.status.info.border}`,
          }}
        >
          <p className="text-xs font-medium" style={{ color: theme.colors.status.info.text }}>
            Total Vehicles
          </p>
          <p className="text-xl font-bold mt-0.5" style={{ color: theme.colors.status.info.text }}>
            {totalCount}
          </p>
        </div> */}

        {/* Bulk Upload Button */}
        {onBulkUpload && (
         
          <Button
            variant="default"
            size="sm"
            onClick={onBulkUpload}
            className="bg-[#10B981] hover:bg-[#059669] text-white font-semibold rounded-lg transition-all duration-200 py-2.5 px-5"
          >
            <Upload className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Bulk Upload</span>
          </Button>
        )}

        {/* Filter Toggle Button */}
        {/* <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onToggleFilters}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200"
          style={{
            background: showFilters
              ? buttonTheme.primary.background
              : buttonTheme.secondary.background,
            color: showFilters
              ? buttonTheme.primary.text
              : buttonTheme.secondary.text,
            border: `1px solid ${
              showFilters
                ? buttonTheme.primary.border
                : buttonTheme.secondary.border
            }`,
          }}
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">
            {showFilters ? "Hide" : "Show"}
          </span>
        </motion.button>
         */}

        <Button
          variant="outline"
          size="sm"
          onClick={onToggleFilters}
          className={`transition-colors duration-200 rounded-lg py-2.5 px-5 font-medium ${
            showFilters
              ? "bg-[#1D4ED8]/10 border-[#1D4ED8] text-[#1D4ED8]"
              : "border-[#E5E7EB] text-[#4A5568] hover:bg-gray-50"
          }`}
        >
          <Filter className="h-4 w-4 sm:mr-2" />
          <span className="hidden md:inline">
            {showFilters ? "Hide" : "Filters"}
          </span>
          <span className="hidden sm:inline md:hidden">
            {showFilters ? "Hide" : "Show"}
          </span>
        </Button>

        {/* Create Vehicle Button */}
        {/* <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCreateNew}
          className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 shadow-sm"
          style={{
            background: buttonTheme.primary.background,
            color: buttonTheme.primary.text,
            border: `1px solid ${buttonTheme.primary.border}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = buttonTheme.primary.hover;
            e.currentTarget.style.boxShadow =
              "0 4px 12px rgba(16, 185, 129, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = buttonTheme.primary.background;
            e.currentTarget.style.boxShadow = "0 1px 2px rgba(0, 0, 0, 0.05)";
          }}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Create New</span>
        </motion.button> */}

        <Button
          variant="default"
          size="sm"
          onClick={onCreateNew}
          className="bg-[#10B981] hover:bg-[#059669] text-white font-semibold rounded-lg transition-all duration-200 py-2.5 px-5"
        >
          <Plus className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Create New</span>
        </Button>
      </div>
    </motion.div>
  );
};

export default TopActionBar;
