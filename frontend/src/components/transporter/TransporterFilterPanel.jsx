import React from 'react';
import { Truck, Plane, Train, Ship, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '../ui/Card';
import { Input, Label } from '../ui/Input';
import { Button } from '../ui/Button';
import { StatusSelect } from '../ui/Select';

const TransporterFilterPanel = ({ filters, onFilterChange, showFilters }) => {
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

  const clearFilters = () => {
    onFilterChange('transporterId', '');
    onFilterChange('tan', '');
    onFilterChange('tinPan', '');
    onFilterChange('vatGst', '');
    onFilterChange('status', '');
    onFilterChange('transportMode', []);
  };

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
          <Card className="bg-white border border-gray-200 shadow-lg">
            <CardContent className="p-6 relative">
            {/* Filter Input Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="space-y-3 group">
                <Label htmlFor="transporterId" className="text-text-body text-text-primary font-medium">Transporter Id:</Label>
                <Input
                  id="transporterId"
                  type="text"
                  value={filters.transporterId}
                  onChange={(e) => onFilterChange('transporterId', e.target.value)}
                  placeholder="Enter transporter ID"
                  className="bg-white/80 backdrop-blur-sm border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-all duration-200 group-hover:shadow-md"
                />
              </div>

              <div className="space-y-3 group">
                <Label htmlFor="tan" className="text-text-body text-text-primary font-medium">TAN:</Label>
                <Input
                  id="tan"
                  type="text"
                  value={filters.tan}
                  onChange={(e) => onFilterChange('tan', e.target.value)}
                  placeholder="Enter TAN"
                  className="bg-white/80 backdrop-blur-sm border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-all duration-200 group-hover:shadow-md"
                />
              </div>

              <div className="space-y-3 group">
                <Label htmlFor="tinPan" className="text-text-body text-text-primary font-medium">TIN/PAN:</Label>
                <Input
                  id="tinPan"
                  type="text"
                  value={filters.tinPan}
                  onChange={(e) => onFilterChange('tinPan', e.target.value)}
                  placeholder="Enter TIN/PAN"
                  className="bg-white/80 backdrop-blur-sm border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-all duration-200 group-hover:shadow-md"
                />
              </div>

              <div className="space-y-3 group">
                <Label htmlFor="vatGst" className="text-text-body text-text-primary font-medium">VAT/GST:</Label>
                <Input
                  id="vatGst"
                  type="text"
                  value={filters.vatGst}
                  onChange={(e) => onFilterChange('vatGst', e.target.value)}
                  placeholder="Enter VAT/GST"
                  className="bg-white/80 backdrop-blur-sm border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-all duration-200 group-hover:shadow-md"
                />
              </div>
            </div>

            {/* Status and Transport Mode Row */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-8">
                <div className="space-y-2 group">
                  <Label className="text-body text-text-primary font-medium">Status:</Label>
                  <div className="mt-2">
                    <StatusSelect
                      value={filters.status}
                      onChange={(value) => onFilterChange('status', value)}
                      options={statusOptions}
                      placeholder="All Status"
                      className="transition-all duration-200"
                    />
                  </div>
                </div>

              <div className="flex items-center space-x-6">
                <Label className="text-text-body text-text-primary font-medium">Transport Mode:</Label>
                <div className="flex items-center space-x-4">
                  {transportModes.map(mode => {
                    const Icon = mode.icon;
                    const isSelected = filters.transportMode.includes(mode.value);
                    return (
                      <label key={mode.value} className={`
                        flex items-center space-x-2 cursor-pointer p-3 rounded-lg transition-all duration-200
                        ${isSelected 
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg scale-105' 
                          : 'bg-white/60 hover:bg-white hover:shadow-md border border-gray-200 hover:border-blue-300'
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
                        <div className="flex items-center space-x-2">
                          <Icon className={`h-5 w-5 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                          <span className={`text-body font-medium ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                            {mode.label}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="bg-white/60 backdrop-blur-sm hover:bg-white hover:shadow-lg hover:scale-105 transition-all duration-200 border-gray-200 hover:border-red-300"
              >
                <X className="h-5 w-5 mr-2" />
                Clear All
              </Button>
              <Button
                variant="default"
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 hover:scale-105 hover:shadow-lg transition-all duration-200"
              >
                <Search className="h-5 w-5 mr-2" />
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

export default TransporterFilterPanel;