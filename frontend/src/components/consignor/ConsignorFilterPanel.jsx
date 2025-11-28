// import React, { useState, memo } from "react";
// import { Filter, X, Search, Briefcase, Activity } from "lucide-react";

// const ConsignorFilterPanel = ({
//   filters,
//   onFilterChange,
//   onApplyFilters,
//   onClearFilters,
//   showFilters,
// }) => {
//   const statusOptions = [
//     { value: "", label: "All Status" },
//     { value: "ACTIVE", label: "Active" },
//     { value: "INACTIVE", label: "Inactive" },
//     { value: "PENDING", label: "Pending" },
//   ];

//   const handleInputChange = (field, value) => {
//     onFilterChange({
//       ...filters,
//       [field]: value,
//     });
//   };

//   const handleClearAll = () => {
//     onClearFilters();
//   };

//   const handleApply = () => {
//     onApplyFilters();
//   };

//   // Count active filters
//   const activeFilterCount = Object.values(filters).filter(
//     (value) => value && value !== ""
//   ).length;

//   if (!showFilters) return null;

//   return (
//     <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         {/* Customer ID Search */}
//         <div>
//           <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
//             <Search className="w-4 h-4 text-gray-500" />
//             Customer ID
//           </label>
//           <input
//             type="text"
//             value={filters.customerId || ""}
//             onChange={(e) => handleInputChange("customerId", e.target.value)}
//             placeholder="Search by ID..."
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
//           />
//         </div>

//         {/* Customer Name Search */}
//         <div>
//           <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
//             <Search className="w-4 h-4 text-gray-500" />
//             Customer Name
//           </label>
//           <input
//             type="text"
//             value={filters.customerName || ""}
//             onChange={(e) => handleInputChange("customerName", e.target.value)}
//             placeholder="Search by name..."
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
//           />
//         </div>

//         {/* Industry Type Filter */}
//         <div>
//           <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
//             <Briefcase className="w-4 h-4 text-gray-500" />
//             Industry Type
//           </label>
//           <select
//             value={filters.industryType || ""}
//             onChange={(e) => handleInputChange("industryType", e.target.value)}
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm bg-white cursor-pointer"
//           >
//             <option value="">All Industries</option>
//             <option value="Manufacturing">Manufacturing</option>
//             <option value="Retail">Retail</option>
//             <option value="Logistics">Logistics</option>
//             <option value="Technology">Technology</option>
//             <option value="Healthcare">Healthcare</option>
//             <option value="Other">Other</option>
//           </select>
//         </div>

//         {/* Status Filter */}
//         <div>
//           <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
//             <Activity className="w-4 h-4 text-gray-500" />
//             Status
//           </label>
//           <select
//             value={filters.status || ""}
//             onChange={(e) => handleInputChange("status", e.target.value)}
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm bg-white cursor-pointer"
//           >
//             {statusOptions.map((option) => (
//               <option key={option.value} value={option.value}>
//                 {option.label}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {/* Action Buttons */}
//       <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
//         <button
//           onClick={handleClearAll}
//           className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//         >
//           <X className="w-4 h-4" />
//           Clear All
//         </button>
//         <button
//           onClick={handleApply}
//           className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
//         >
//           <Filter className="w-4 h-4" />
//           Apply Filters
//         </button>
//       </div>
//     </div>
//   );
// };

// export default memo(ConsignorFilterPanel);

import React, { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "../ui/Card";
import { Input, Label } from "../ui/Input";
import { Button } from "../ui/Button";
import { StatusSelect } from "../ui/Select";

const ConsignorFilterPanel = ({
  filters,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
  showFilters,
}) => {
  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
    { value: "PENDING", label: "Pending" },
    { value: "SAVE_AS_DRAFT", label: "Draft" },
  ];

  const industryOptions = [
    { value: "", label: "All Industries" },
    { value: "Manufacturing", label: "Manufacturing" },
    { value: "Retail", label: "Retail" },
    { value: "Logistics", label: "Logistics" },
    { value: "Technology", label: "Technology" },
    { value: "Healthcare", label: "Healthcare" },
    { value: "Other", label: "Other" },
  ];

  // ✅ Restoring old working behavior
  const handleInputChange = (field, value) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  return (
    <AnimatePresence>
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.15 }}
          className="mb-2"
        >
          <Card
            className="bg-white border border-[#E5E7EB] rounded-xl"
            style={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)" }}
          >
            <CardContent className="p-0 relative">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
                {/* Customer ID */}
                <div className="space-y-2 group">
                  <Label className="text-sm text-[#0D1A33] font-semibold">
                    Customer ID:
                  </Label>
                  <Input
                    type="text"
                    value={filters.customerId ?? ""}
                    onChange={(e) =>
                      handleInputChange("customerId", e.target.value)
                    }
                    placeholder="Search by ID"
                    className="bg-white border-[#E5E7EB] hover:border-[#1D4ED8]
                      focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20
                      transition-all duration-200 rounded-lg h-10"
                  />
                </div>

                {/* Customer Name */}
                <div className="space-y-2 group">
                  <Label className="text-sm text-[#0D1A33] font-semibold">
                    Customer Name:
                  </Label>
                  <Input
                    type="text"
                    value={filters.customerName ?? ""}
                    onChange={(e) =>
                      handleInputChange("customerName", e.target.value)
                    }
                    placeholder="Search by name"
                    className="bg-white border-[#E5E7EB] hover:border-[#1D4ED8]
                      focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20
                      transition-all duration-200 rounded-lg h-10"
                  />
                </div>

                {/* Industry Type Select */}
                <div className="space-y-2 group">
                  <Label className="text-sm text-[#0D1A33] font-semibold">
                    Industry Type:
                  </Label>
                  <StatusSelect
                    options={industryOptions}
                    value={filters.industryType ?? ""}
                    onChange={(value) =>
                      handleInputChange("industryType", value)
                    }
                    placeholder="All Industries"
                    className="w-full transition-all duration-200"
                  />
                </div>

                {/* Status Select */}
                <div className="space-y-2 group">
                  <Label className="text-sm text-[#0D1A33] font-semibold">
                    Status:
                  </Label>
                  <StatusSelect
                    options={statusOptions}
                    value={filters.status ?? ""}
                    onChange={(value) => handleInputChange("status", value)}
                    placeholder="All Status"
                    className="w-full transition-all duration-200"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start lg:items-end gap-6 mb-6">
                <div className="space-y-2 group">
                  <Label
                    htmlFor="createdOnStart"
                    className="text-sm text-[#0D1A33] font-semibold"
                  >
                    Created On (Start):
                  </Label>
                  <Input
                    id="createdOnStart"
                    type="date"
                    value={filters.createdOnStart ?? ""}
                    onChange={(e) =>
                      handleInputChange("createdOnStart", e.target.value)
                    }
                    className="bg-white border-[#E5E7EB] hover:border-[#1D4ED8] 
                          focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 
                          transition-all duration-200 rounded-lg h-10"
                  />
                </div>

                <div className="space-y-2 group">
                  <Label
                    htmlFor="createdOnEnd"
                    className="text-sm text-[#0D1A33] font-semibold"
                  >
                    Created On (End):
                  </Label>
                  <Input
                    id="createdOnEnd"
                    type="date"
                    value={filters.createdOnEnd ?? ""}
                    onChange={(e) =>
                      handleInputChange("createdOnEnd", e.target.value)
                    }
                    className="bg-white border-[#E5E7EB] hover:border-[#1D4ED8] 
                          focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 
                          transition-all duration-200 rounded-lg h-10"
                  />
                </div>
                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 ml-auto">
                  <Button
                    variant="secondary"
                    onClick={onClearFilters}
                    className="px-5 py-2.5"
                  >
                    Clear All
                  </Button>

                  <Button onClick={onApplyFilters} className="px-6 py-2.5">
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

export default memo(ConsignorFilterPanel);
