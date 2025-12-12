import React, { memo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent } from "../ui/Card";
import { Input, Label } from "../ui/Input";
import { Button } from "../ui/Button";
import { StatusSelect } from "../ui/Select";
import { fetchUserTypes } from "../../redux/slices/userSlice";

const UserFilterPanel = ({
  filters,
  onFilterChange,
  onApply,
  onReset,
}) => {
  const dispatch = useDispatch();
  const { userTypes } = useSelector((state) => state.user);

  useEffect(() => {
    if (userTypes.length === 0) {
      dispatch(fetchUserTypes());
    }
  }, [dispatch, userTypes.length]);

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
    { value: "PENDING", label: "Pending" },
    { value: "LOCKED", label: "Locked" },
  ];

  const userTypeOptions = [
    { value: "", label: "All User Types" },
    ...userTypes.map((type) => ({
      value: type.user_type_id,
      label: type.user_type_name,
    })),
  ];

  return (
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
        <CardContent className="p-6">
          {/* Filter Input Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2 group">
              <Label
                htmlFor="userTypeId"
                className="text-sm text-[#0D1A33] font-semibold"
              >
                User Type:
              </Label>
              <StatusSelect
                value={filters.userTypeId}
                onChange={(value) => onFilterChange("userTypeId", value)}
                options={userTypeOptions}
                placeholder="All User Types"
                className="w-full transition-all duration-200"
              />
            </div>

            <div className="space-y-2 group">
              <Label
                htmlFor="status"
                className="text-sm text-[#0D1A33] font-semibold"
              >
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

            <div className="space-y-2 group">
              <Label
                htmlFor="fromDate"
                className="text-sm text-[#0D1A33] font-semibold"
              >
                From Date:
              </Label>
              <Input
                id="fromDate"
                type="date"
                value={filters.fromDate}
                onChange={(e) => onFilterChange("fromDate", e.target.value)}
                className="bg-white border-[#E5E7EB] hover:border-[#1D4ED8] focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 transition-all duration-200 rounded-lg h-10"
                style={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)" }}
              />
            </div>

            <div className="space-y-2 group">
              <Label
                htmlFor="toDate"
                className="text-sm text-[#0D1A33] font-semibold"
              >
                To Date:
              </Label>
              <Input
                id="toDate"
                type="date"
                value={filters.toDate}
                onChange={(e) => onFilterChange("toDate", e.target.value)}
                className="bg-white border-[#E5E7EB] hover:border-[#1D4ED8] focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 transition-all duration-200 rounded-lg h-10"
                style={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)" }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={onReset}
              className="px-6 py-2 border-[#E5E7EB] text-[#4A5568] hover:bg-gray-50 rounded-lg font-medium transition-all duration-200"
            >
              Reset
            </Button>
            <Button
              variant="default"
              onClick={onApply}
              className="px-6 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white rounded-lg font-medium transition-all duration-200"
            >
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default memo(UserFilterPanel);
