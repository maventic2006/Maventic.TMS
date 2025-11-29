import React, { memo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDropdownOptions } from "../../redux/slices/configurationSlice";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Card, CardContent } from "../ui/Card";
import { StatusSelect } from "../ui/Select";

const ConfigurationFilterPanel = ({
  isVisible,
  onClose,
  filters,
  onFiltersChange,
  onApplyFilters,
  onResetFilters,
  metadata
}) => {
  const dispatch = useDispatch();
  const { dropdownOptions } = useSelector(state => state.configuration);

  // Fetch dropdown options when panel opens
  useEffect(() => {
    if (isVisible && metadata?.fields) {
      // Fetch status options if not already loaded
      if (!dropdownOptions['status']) {
        dispatch(fetchDropdownOptions('status'));
      }
      
      // Fetch options for any other select fields
      Object.entries(metadata.fields).forEach(([fieldName, fieldConfig]) => {
        if (fieldConfig.inputType === 'select' && !dropdownOptions[fieldName]) {
          // Try to fetch from database using the field name as type
          dispatch(fetchDropdownOptions(fieldName));
        }
      });
    }
  }, [isVisible, metadata, dispatch, dropdownOptions]);

  const handleInputChange = (field, value) => {
    onFiltersChange({
      ...filters,
      [field]: value
    });
  };

  // Get status options from Redux or use defaults
  const statusOptions = [
    { value: "", label: "All Statuses" },
    ...(dropdownOptions['status'] || [
      { value: "ACTIVE", label: "Active" },
      { value: "INACTIVE", label: "Inactive" },
    ])
  ];

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
                  <StatusSelect
                    value={filters.status || ''}
                    onChange={(value) => handleInputChange('status', value)}
                    options={statusOptions}
                    placeholder="All Statuses"
                    className="w-full"
                  />
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
                        <StatusSelect
                          value={filters[fieldName] || ''}
                          onChange={(value) => handleInputChange(fieldName, value)}
                          options={[
                            { value: '', label: `All ${fieldConfig.label}` },
                            // Use dynamic options from Redux if available, fallback to hardcoded
                            ...(dropdownOptions[fieldName] || 
                               fieldConfig.options?.map(opt => ({ value: opt, label: opt })) || [])
                          ]}
                          placeholder={`All ${fieldConfig.label}`}
                          className="w-full"
                        />
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
                  className="bg-[#10B981] hover:bg-[#059669] text-white font-semibold transition-all duration-200"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
                <Button
                  variant="outline"
                  onClick={onResetFilters}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <X className="h-4 w-4 mr-2" />
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