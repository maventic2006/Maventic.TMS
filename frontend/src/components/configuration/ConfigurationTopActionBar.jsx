import React, { memo } from "react";
import { ArrowLeft, Plus, Filter } from "lucide-react";
import { Button } from "../ui/Button";
import { Card, CardContent } from "../ui/Card";
// import TMSHeader from "../layout/TMSHeader";

const ConfigurationTopActionBar = ({
  onCreateNew,
  totalCount,
  onBack,
  showFilters,
  onToggleFilters,
  searchText,
  onSearchChange,
  configurationName,
}) => {
  return (
    <>
    {/* <TMSHeader /> */}
    <Card
    className="mb-2 mt-2 rounded-xl border border-gray-200 bg-white"
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
                Global Master Config -  {configurationName || 'Configuration Management'}
              </h1>
              {/* {totalCount > 0 && (
                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  <span className="text-blue-600 font-bold">{totalCount}</span> records found
                </p>
              )} */}
            </div>
          </div>

          {/* Right Section - Action Buttons */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <Button
              variant="default"
              size="sm"
              onClick={onCreateNew}
              className="h-12 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create New
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onToggleFilters}
              className={`h-12 px-4 font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 ${
                showFilters
                  ? "bg-blue-50 text-blue-700 border-blue-300"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
    </>
  );
};

export default memo(ConfigurationTopActionBar);