import React, { memo } from 'react';
import { Truck, Plane, Train, Ship, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '../ui/Card';
import { Input, Label } from '../ui/Input';
import { Button } from '../ui/Button';
import { StatusSelect } from '../ui/Select';

const TransporterFilterPanel = ({ filters, onFilterChange, onApplyFilters, onClearFilters, showFilters }) => {
  const transportModes = [
    { value: 'R', label: 'R', icon: Truck },
    { value: 'A', label: 'A', icon: Plane },
    { value: 'RL', label: 'RL', icon: Train },
    { value: 'S', label: 'S', icon: Ship }
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'Active', label: 'Active' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Inactive', label: 'Inactive' },
    { value: 'Rejected', label: 'Rejected' }
  ];

  return (
    <AnimatePresence>
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.15 }}
          className="mb-6"
        >
          <Card className="bg-white border border-gray-200 shadow-md rounded-2xl">
            <CardContent className="p-4 relative">
            {/* Filter Input Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="space-y-1.5 group">
                <Label htmlFor="transporterId" className="text-sm text-gray-700 font-semibold">Transporter ID:</Label>
                <Input
                  id="transporterId"
                  type="text"
                  value={filters.transporterId}
                  onChange={(e) => onFilterChange('transporterId', e.target.value)}
                  placeholder="Enter transporter ID"
                  className="bg-white border-gray-200 hover:border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 group-hover:shadow-md rounded-xl h-9"
                />
              </div>

              <div className="space-y-1.5 group">
                <Label htmlFor="tan" className="text-sm text-gray-700 font-semibold">TAN:</Label>
                <Input
                  id="tan"
                  type="text"
                  value={filters.tan}
                  onChange={(e) => onFilterChange('tan', e.target.value)}
                  placeholder="Enter TAN"
                  className="bg-white border-gray-200 hover:border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 group-hover:shadow-md rounded-xl h-9"
                />
              </div>

              <div className="space-y-1.5 group">
                <Label htmlFor="tinPan" className="text-sm text-gray-700 font-semibold">TIN/PAN:</Label>
                <Input
                  id="tinPan"
                  type="text"
                  value={filters.tinPan}
                  onChange={(e) => onFilterChange('tinPan', e.target.value)}
                  placeholder="Enter TIN/PAN"
                  className="bg-white border-gray-200 hover:border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 group-hover:shadow-md rounded-xl h-9"
                />
              </div>

              <div className="space-y-1.5 group">
                <Label htmlFor="vatGst" className="text-sm text-gray-700 font-semibold">VAT/GST:</Label>
                <Input
                  id="vatGst"
                  type="text"
                  value={filters.vatGst}
                  onChange={(e) => onFilterChange('vatGst', e.target.value)}
                  placeholder="Enter VAT/GST"
                  className="bg-white border-gray-200 hover:border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 group-hover:shadow-md rounded-xl h-9"
                />
              </div>
            </div>

            {/* Status and Transport Mode Row */}
            <div className="flex flex-col sm:flex-row sm:items-start lg:items-end gap-4 sm:gap-6 mb-4 sm:mb-6">
              {/* Status Section */}
              <div className="space-y-2 group flex-shrink-0">
                <Label className="text-sm text-gray-700 font-semibold">Status:</Label>
                <div className="w-full sm:w-48">
                  <StatusSelect
                    value={filters.status}
                    onChange={(value) => onFilterChange('status', value)}
                    options={statusOptions}
                    placeholder="All Status"
                    className="w-full transition-all duration-200"
                  />
                </div>
              </div>

              {/* Transport Mode Section */}
              <div className="space-y-2 group flex-1 min-w-0">
                <Label className="text-sm text-gray-700 font-semibold">Transport Mode:</Label>
                <div className="flex flex-wrap items-center gap-2">
                  {transportModes.map(mode => {
                    const Icon = mode.icon;
                    const isSelected = filters.transportMode.includes(mode.value);
                    return (
                      <label key={mode.value} className={`
                        flex items-center space-x-1 sm:space-x-2 cursor-pointer px-2 sm:px-3 py-2 rounded-xl transition-all duration-200 font-medium text-xs sm:text-sm
                        ${isSelected 
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105' 
                          : 'bg-white hover:bg-gray-50 hover:shadow-md border border-gray-200 hover:border-orange-300 text-gray-700'
                        }
                      `}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const newModes = e.target.checked
                              ? [...filters.transportMode, mode.value]
                              : filters.transportMode.filter(m => m !== mode.value);
                            onFilterChange('transportMode', newModes);
                          }}
                          className="sr-only"
                        />
                        <Icon className={`h-3 w-3 sm:h-4 sm:w-4 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                        <span className={`font-medium ${isSelected ? 'text-white' : 'text-gray-700'} hidden sm:inline`}>
                          {mode.value === 'R' ? 'Road' : mode.value === 'A' ? 'Air' : mode.value === 'RL' ? 'Rail' : 'Sea'}
                        </span>
                        <span className={`font-medium ${isSelected ? 'text-white' : 'text-gray-700'} sm:hidden`}>
                          {mode.value}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 pt-4">
              <Button
                variant="outline"
                onClick={onClearFilters}
                className="bg-white/60 backdrop-blur-sm hover:bg-white hover:shadow-lg hover:scale-105 transition-all duration-200 border-gray-200 hover:border-red-300 rounded-xl w-full sm:w-auto"
              >
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
              <Button
                variant="default"
                onClick={onApplyFilters}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 hover:scale-105 hover:shadow-lg transition-all duration-200 rounded-xl w-full sm:w-auto"
              >
                <Search className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
            </div>

            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default memo(TransporterFilterPanel);