import React, { memo } from "react";
import { Truck, Plane, Train, Ship, X, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "../ui/Card";
import { Input, Label } from "../ui/Input";
import { Button } from "../ui/Button";
import { StatusSelect } from "../ui/Select";

const TransporterFilterPanel = ({
  filters,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
  showFilters,
}) => {
  const transportModes = [
    { value: "R", label: "R", icon: Truck },
    { value: "A", label: "A", icon: Plane },
    { value: "RL", label: "RL", icon: Train },
    { value: "S", label: "S", icon: Ship },
  ];

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "Active", label: "Active" },
    { value: "Approved", label: "Approved" },
    { value: "Pending", label: "Pending" },
    { value: "SAVE_AS_DRAFT", label: "Draft" },
    { value: "Inactive", label: "Inactive" },
    { value: "Rejected", label: "Rejected" },
  ];

  return (
    <AnimatePresence>
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.15 }}
          className="mb-6"
        >
          <Card
            className="bg-white border border-[#E5E7EB] rounded-xl"
            style={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)" }}
          >
            <CardContent className="p-0 relative">
              {/* Filter Input Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
                <div className="space-y-2 group">
                  <Label
                    htmlFor="transporterId"
                    className="text-sm text-[#0D1A33] font-semibold"
                  >
                    Transporter ID:
                  </Label>
                  <Input
                    id="transporterId"
                    type="text"
                    value={filters.transporterId}
                    onChange={(e) =>
                      onFilterChange("transporterId", e.target.value)
                    }
                    placeholder="Enter transporter ID"
                    className="bg-white border-[#E5E7EB] hover:border-[#1D4ED8] focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 transition-all duration-200 rounded-lg h-10"
                    style={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)" }}
                  />
                </div>

                <div className="space-y-2 group">
                  <Label
                    htmlFor="tan"
                    className="text-sm text-[#0D1A33] font-semibold"
                  >
                    TAN:
                  </Label>
                  <Input
                    id="tan"
                    type="text"
                    value={filters.tan}
                    onChange={(e) => onFilterChange("tan", e.target.value)}
                    placeholder="Enter TAN"
                    className="bg-white border-[#E5E7EB] hover:border-[#1D4ED8] focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 transition-all duration-200 rounded-lg h-10"
                    style={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)" }}
                  />
                </div>

                <div className="space-y-2 group">
                  <Label
                    htmlFor="tinPan"
                    className="text-sm text-[#0D1A33] font-semibold"
                  >
                    TIN/PAN:
                  </Label>
                  <Input
                    id="tinPan"
                    type="text"
                    value={filters.tinPan}
                    onChange={(e) => onFilterChange("tinPan", e.target.value)}
                    placeholder="Enter TIN/PAN"
                    className="bg-white border-[#E5E7EB] hover:border-[#1D4ED8] focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 transition-all duration-200 rounded-lg h-10"
                    style={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)" }}
                  />
                </div>

                <div className="space-y-2 group">
                  <Label
                    htmlFor="vatGst"
                    className="text-sm text-[#0D1A33] font-semibold"
                  >
                    VAT/GST:
                  </Label>
                  <Input
                    id="vatGst"
                    type="text"
                    value={filters.vatGst}
                    onChange={(e) => onFilterChange("vatGst", e.target.value)}
                    placeholder="Enter VAT/GST"
                    className="bg-white border-[#E5E7EB] hover:border-[#1D4ED8] focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 transition-all duration-200 rounded-lg h-10"
                    style={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)" }}
                  />
                </div>

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
                    value={filters.createdOnStart}
                    onChange={(e) =>
                      onFilterChange("createdOnStart", e.target.value)
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
                    value={filters.createdOnEnd}
                    onChange={(e) =>
                      onFilterChange("createdOnEnd", e.target.value)
                    }
                    className="bg-white border-[#E5E7EB] hover:border-[#1D4ED8] 
      focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 
      transition-all duration-200 rounded-lg h-10"
                  />
                </div>
              </div>

              {/* Status and Transport Mode Row */}
              <div className="flex flex-col sm:flex-row sm:items-start lg:items-end gap-6 mb-6">
                {/* Status Section */}
                <div className="space-y-2 group flex-shrink-0">
                  <Label className="text-sm text-[#0D1A33] font-semibold">
                    Status:
                  </Label>
                  <div className="w-full sm:w-48">
                    <StatusSelect
                      value={filters.status}
                      onChange={(value) => onFilterChange("status", value)}
                      options={statusOptions}
                      placeholder="All Status"
                      className="w-full transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Transport Mode Section */}
                <div className="space-y-2 group flex-1 min-w-0">
                  <Label className="text-sm text-[#0D1A33] font-semibold">
                    Transport Mode:
                  </Label>
                  <div className="flex flex-wrap items-center gap-3">
                    {transportModes.map((mode) => {
                      const Icon = mode.icon;
                      const isSelected = filters.transportMode.includes(
                        mode.value
                      );
                      return (
                        <label
                          key={mode.value}
                          className={`
                        flex items-center gap-2 cursor-pointer py-2.5 px-5 rounded-lg transition-all duration-200 font-semibold text-sm
                        ${
                          isSelected
                            ? "bg-[#10B981] text-white hover:bg-[#059669]"
                            : "bg-white hover:bg-[#F5F7FA] border border-[#E5E7EB] hover:border-[#1D4ED8] text-[#0D1A33]"
                        }
                      `}
                          style={
                            !isSelected
                              ? { boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)" }
                              : {}
                          }
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const newModes = e.target.checked
                                ? [...filters.transportMode, mode.value]
                                : filters.transportMode.filter(
                                    (m) => m !== mode.value
                                  );
                              onFilterChange("transportMode", newModes);
                            }}
                            className="sr-only"
                          />
                          <Icon
                            className={`h-4 w-4 ${
                              isSelected ? "text-white" : "text-[#4A5568]"
                            }`}
                          />
                          <span
                            className={`font-semibold ${
                              isSelected ? "text-white" : "text-[#0D1A33]"
                            } hidden sm:inline`}
                          >
                            {mode.value === "R"
                              ? "Road"
                              : mode.value === "A"
                              ? "Air"
                              : mode.value === "RL"
                              ? "Rail"
                              : "Sea"}
                          </span>
                          <span
                            className={`font-semibold ${
                              isSelected ? "text-white" : "text-[#0D1A33]"
                            } sm:hidden`}
                          >
                            {mode.value}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-0">
                  <Button
                    variant="outline"
                    onClick={onClearFilters}
                    className="bg-white hover:bg-[#F5F7FA] hover:border-[#F97316] hover:text-[#F97316] transition-all duration-200 border-[#E5E7EB] rounded-lg py-2.5 px-5 w-full sm:w-auto"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                  <Button
                    variant="default"
                    onClick={onApplyFilters}
                    className="bg-[#10B981] hover:bg-[#059669] text-white transition-all duration-200 rounded-lg py-2.5 px-5 w-full sm:w-auto font-semibold"
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
