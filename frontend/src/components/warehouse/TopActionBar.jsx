import React, { memo } from "react";
import { ArrowLeft, Plus, Filter } from "lucide-react";
import { Button } from "../ui/Button";
import { Card, CardContent } from "../ui/Card";

const TopActionBar = ({
  onCreateNew,
  totalCount,
  onBack,
  showFilters,
  onToggleFilters,
  searchText,
  onSearchChange,
}) => {
  return (
    <Card
      className="mb-2 rounded-xl border border-gray-200 bg-white"
      style={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)" }}
    >
      <CardContent className="px-0 py-0">
        <div className="flex items-center justify-between px-0 py-0 gap-4">
          {/* Left Section - Back Arrow and Title */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-20 w-20 rounded-lg hover:bg-gray-100 hover:text-[#0D1A33] transition-all duration-200 flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5 text-[#0D1A33]" />
            </Button>
            <div className="flex flex-col min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-[#0D1A33] font-poppins truncate">
                Consignor WH Maintenance
              </h1>
              {totalCount > 0 && (
                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  <span className="text-orange-600 font-bold">
                    {totalCount}
                  </span>{" "}
                  warehouses
                </p>
              )}
            </div>
          </div>

          {/* Right Section - Action Buttons */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <Button
              variant="default"
              size="sm"
              onClick={onCreateNew}
              className="bg-[#10B981] hover:bg-[#059669] text-white font-semibold rounded-lg transition-all duration-200 py-2.5 px-5"
            >
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Create New</span>
            </Button>

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
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default memo(TopActionBar);
