import React, { memo } from 'react';
import { ArrowLeft, Plus, Filter } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';

const TopActionBar = ({ 
  onCreateNew, 
  totalCount, 
  onBack, 
  showFilters, 
  onToggleFilters,
  searchText,
  onSearchChange
}) => {
  return (
    <Card className="mb-4 shadow-md rounded-2xl border border-gray-200 bg-white">
      <CardContent className="px-0 py-0">
        <div className="flex items-center justify-between px-4 py-4 gap-4">
          {/* Left Section - Back Arrow and Title */}
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-12 w-12 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-all duration-200 hover:shadow-sm flex-shrink-0"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div className="flex flex-col min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 font-poppins truncate">
                Transporter Maintenance
              </h1>
              {/* {totalCount > 0 && (
                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  <span className="text-orange-600 font-bold">{totalCount}</span> transporters
                </p>
              )} */}
            </div>
          </div>

          {/* Right Section - Action Buttons */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Button
              variant="default"
              size="sm"
              onClick={onCreateNew}
              className="bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200 h-10 px-3"
            >
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Create New</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onToggleFilters}
              className={`transition-colors duration-200 rounded-xl h-10 px-3 ${
                showFilters 
                  ? "bg-orange-50 border-orange-300 text-orange-700" 
                  : "hover:bg-gray-50"
              }`}
            >
              <Filter className="h-4 w-4 sm:mr-2" />
              <span className="hidden md:inline">{showFilters ? 'Hide' : 'Filters'}</span>
              <span className="hidden sm:inline md:hidden">{showFilters ? 'Hide' : 'Show'}</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default memo(TopActionBar);