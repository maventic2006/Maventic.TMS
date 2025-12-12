import React, { memo } from "react";
import { Plus, Filter } from "lucide-react";
import { Button } from "../ui/Button";
import { Card, CardContent } from "../ui/Card";
import SearchBar from "./SearchBar";

const TopActionBar = ({
  totalCount,
  onCreateClick,
  onFilterToggle,
  showFilters,
  filterCount = 0,
  searchText,
  onSearchChange,
}) => {
  return (
    <Card
      className="mb-6 rounded-xl border border-gray-200 bg-white"
      style={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)" }}
    >
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Left Section - Title and Count */}
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-[#0D1A33] font-poppins">
              User Management
            </h1>
            {totalCount > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                <span className="text-orange-600 font-bold">{totalCount}</span>{" "}
                users found
              </p>
            )}
          </div>

          {/* Right Section - Search and Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {/* Search Bar */}
            <div className="w-full sm:w-80">
              <SearchBar
                searchText={searchText}
                onSearchChange={onSearchChange}
                placeholder="Search users..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="default"
                size="sm"
                onClick={onCreateClick}
                className="bg-[#10B981] hover:bg-[#059669] text-white font-semibold rounded-lg transition-all duration-200 py-2.5 px-5"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onFilterToggle}
                className={`transition-colors duration-200 rounded-lg py-2.5 px-5 font-medium relative ${
                  showFilters
                    ? "bg-[#1D4ED8]/10 border-[#1D4ED8] text-[#1D4ED8]"
                    : "border-[#E5E7EB] text-[#4A5568] hover:bg-gray-50"
                }`}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {filterCount > 0 && (
                  <span className="ml-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {filterCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default memo(TopActionBar);
