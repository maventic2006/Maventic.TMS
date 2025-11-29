import React, { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Card, CardContent } from "../ui/Card";

const ConfigurationFilterPanel = ({
  isVisible,
  onClose,
  filters,
  onFiltersChange,
  onApplyFilters,
  onResetFilters,
  metadata
}) => {
  const handleInputChange = (field, value) => {
    onFiltersChange({
      ...filters,
      [field]: value
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="mb-4 rounded-xl border border-gray-200 bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status || ''}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>

                {/* Dynamic filters based on metadata */}
                {metadata?.fields && Object.entries(metadata.fields).map(([fieldName, fieldConfig]) => {
                  // Skip certain fields from filters
                  if (fieldConfig.autoGenerate || fieldConfig.type === 'boolean' || fieldName === 'status') {
                    return null;
                  }

                  return (
                    <div key={fieldName}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {fieldConfig.label}
                      </label>
                      {fieldConfig.inputType === 'select' ? (
                        <select
                          value={filters[fieldName] || ''}
                          onChange={(e) => handleInputChange(fieldName, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">All {fieldConfig.label}</option>
                          {fieldConfig.options?.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : (
                        <Input
                          type={fieldConfig.type === 'int' ? 'number' : 'text'}
                          placeholder={`Filter by ${fieldConfig.label.toLowerCase()}`}
                          value={filters[fieldName] || ''}
                          onChange={(e) => handleInputChange(fieldName, e.target.value)}
                          className="w-full"
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={onApplyFilters}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Apply Filters
                </Button>
                <Button
                  variant="outline"
                  onClick={onResetFilters}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default memo(ConfigurationFilterPanel);