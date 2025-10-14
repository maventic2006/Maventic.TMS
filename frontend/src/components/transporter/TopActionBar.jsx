import React from 'react';
import { ArrowLeft, Plus, Filter, Search, LogOut } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';

const TopActionBar = ({ 
  onCreateNew, 
  onLogout, 
  totalCount, 
  onBack, 
  showFilters, 
  onToggleFilters,
  searchText,
  onSearchChange
}) => {
  return (
    <Card className="mb-4 shadow-lg rounded-xl border border-gray-200 bg-white">
      <CardContent className="px-0 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Back Arrow and Title */}
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-12 w-12 rounded-lg hover:bg-orange-50 hover:text-orange-600 transition-colors duration-200"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div className="flex flex-col">
              <h1 className="text-2xl lg:text-3xl font-bold text-text-primary">
                Transporter Maintenance
              </h1>
              <p className="text-sm text-text-secondary mt-1">Manage your transport partners efficiently</p>
            </div>
          </div>

          {/* Right Section - Action Buttons */}
          <div className="flex items-center space-x-3">
            <Button
              variant="default"
              size="sm"
              onClick={onCreateNew}
              className="bg-orange-600 hover:bg-orange-700 text-white font-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Create New</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onToggleFilters}
              className={`transition-colors duration-200 ${
                showFilters 
                  ? "bg-orange-50 border-orange-300 text-orange-700" 
                  : "hover:bg-gray-50"
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
            </Button>

            {/* Search Input */}
            <div className="relative">
              {/* <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" /> */}
              <Input
                type="text"
                value={searchText}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search transporters..."
                className="pl-11 pr-4 w-48 lg:w-64 border-gray-200 focus:border-orange-400 focus:ring-orange-200"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="text-red-600 hover:bg-red-50 hover:border-red-300"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopActionBar;