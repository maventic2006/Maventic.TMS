import React, { memo } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "../ui/Card";
import { Input, Label } from "../ui/Input";
import { Button } from "../ui/Button";
import { StatusSelect } from "../ui/Select";
import { Checkbox } from "../ui/checkbox";

const WarehouseFilterPanel = ({
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
    { value: "APPROVED", label: "Approved" },
    { value: "REJECTED", label: "Rejected" },
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="space-y-2 group">
                  <Label
                    htmlFor="warehouseId"
                    className="text-sm text-[#0D1A33] font-semibold"
                  >
                    Warehouse ID:
                  </Label>
                  <Input
                    id="warehouseId"
                    type="text"
                    value={filters.warehouseId}
                    onChange={(e) =>
                      onFilterChange("warehouseId", e.target.value)
                    }
                    placeholder="Enter warehouse ID"
                    className="bg-white border-[#E5E7EB] hover:border-[#1D4ED8] focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 transition-all duration-200 rounded-lg h-10"
                    style={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)" }}
                  />
                </div>

                <div className="space-y-2 group">
                  <Label
                    htmlFor="warehouseName"
                    className="text-sm text-[#0D1A33] font-semibold"
                  >
                    Warehouse Name:
                  </Label>
                  <Input
                    id="warehouseName"
                    type="text"
                    value={filters.warehouseName}
                    onChange={(e) =>
                      onFilterChange("warehouseName", e.target.value)
                    }
                    placeholder="Enter warehouse name"
                    className="bg-white border-[#E5E7EB] hover:border-[#1D4ED8] focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 transition-all duration-200 rounded-lg h-10"
                    style={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)" }}
                  />
                </div>

                <div className="space-y-2 group">
                  <Label className="text-sm text-[#0D1A33] font-semibold">
                    Status:
                  </Label>
                  <StatusSelect
                    value={filters.status}
                    onChange={(value) => onFilterChange("status", value)}
                    options={statusOptions}
                    placeholder="All Status"
                    className="w-full transition-all duration-200"
                  />
                </div>
              </div>

              {/* Facility Checkboxes Row */}
              <div className="space-y-2 group mb-6">
                <Label className="text-sm text-[#0D1A33] font-semibold">
                  Facilities:
                </Label>
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={filters.weighBridge}
                      onCheckedChange={(checked) =>
                        onFilterChange("weighBridge", checked)
                      }
                    />
                    <span className="text-sm text-[#0D1A33] font-medium">
                      WeighBridge
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={filters.virtualYardIn}
                      onCheckedChange={(checked) =>
                        onFilterChange("virtualYardIn", checked)
                      }
                    />
                    <span className="text-sm text-[#0D1A33] font-medium">
                      Virtual Yard In
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={filters.geoFencing}
                      onCheckedChange={(checked) =>
                        onFilterChange("geoFencing", checked)
                      }
                    />
                    <span className="text-sm text-[#0D1A33] font-medium">
                      Geo Fencing
                    </span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-[#E5E7EB] pt-4">
                <Button
                  variant="outline"
                  onClick={onClearFilters}
                  className="border-[#E5E7EB] hover:bg-gray-50 text-[#4A5568] font-medium rounded-lg py-2.5 px-5 transition-all duration-200"
                  style={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)" }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
                <Button
                  onClick={onApplyFilters}
                  className="bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold rounded-lg py-2.5 px-5 transition-all duration-200"
                >
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default memo(WarehouseFilterPanel);
