import React, { memo } from "react";
import { motion } from "framer-motion";
import {
  User as UserIcon,
  Phone,
  Mail,
  Loader2,
  Calendar,
  Shield,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../ui/Table";
import { Card, CardContent } from "../ui/Card";
import StatusPill from "./StatusPill";

// Helper function to display N/A for empty or null values
const displayValue = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    value === "N/A"
  ) {
    return "N/A";
  }
  return value;
};

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const UserListTable = ({ users, isLoading, onRowClick }) => {
  const showNoResults = !isLoading && users.length === 0;

  return (
    <Card
      className="overflow-hidden rounded-xl border border-gray-200 bg-white"
      style={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)" }}
    >
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center space-y-4 text-[#4A5568]">
            <div className="relative">
              <Loader2 className="h-8 w-8 animate-spin text-[#1D4ED8]" />
              <div className="absolute inset-0 h-8 w-8 border-2 border-[#1D4ED8]/20 rounded-full animate-pulse"></div>
            </div>
            <span className="text-sm font-semibold">Loading users...</span>
            <div className="flex gap-1">
              <div
                className="w-2 h-2 bg-[#1D4ED8] rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className="w-2 h-2 bg-[#1D4ED8] rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></div>
              <div
                className="w-2 h-2 bg-[#1D4ED8] rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* No Results State */}
      {showNoResults && (
        <div className="text-center py-16 bg-white">
          <div className="flex flex-col items-center space-y-6 text-[#4A5568]">
            <div className="relative">
              <UserIcon className="h-20 w-20 text-[#E5E7EB]" />
              <div className="absolute -top-2 -right-2 h-6 w-6 bg-[#1D4ED8]/10 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-[#1D4ED8] rounded-full"></div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-[#0D1A33]">
                No Users Found
              </h3>
              <p className="text-sm text-[#4A5568] max-w-md">
                Try adjusting your search or filters to find users.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {!isLoading && !showNoResults && (
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow className="bg-gray-800 border-b border-gray-800">
                  <TableHead className="px-6 py-4 text-left text-xs font-bold text-[#0D1A33] uppercase tracking-wider">
                    User ID
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left text-xs font-bold text-[#0D1A33] uppercase tracking-wider">
                    Full Name
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left text-xs font-bold text-[#0D1A33] uppercase tracking-wider">
                    Email
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left text-xs font-bold text-[#0D1A33] uppercase tracking-wider">
                    Mobile Number
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left text-xs font-bold text-[#0D1A33] uppercase tracking-wider">
                    User Type
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left text-xs font-bold text-[#0D1A33] uppercase tracking-wider">
                    From Date
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left text-xs font-bold text-[#0D1A33] uppercase tracking-wider">
                    To Date
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left text-xs font-bold text-[#0D1A33] uppercase tracking-wider">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user, index) => (
                  <motion.tr
                    key={user.userId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-gray-100 hover:bg-blue-50 hover:shadow-md hover:scale-[1.01] transition-all duration-200 cursor-pointer group"
                    onClick={() => onRowClick(user.userId)}
                  >
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-[#1D4ED8]" />
                        <span className="text-sm font-semibold text-[#1D4ED8] group-hover:underline">
                          {displayValue(user.userId)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <UserIcon className="h-4 w-4 text-[#4A5568]" />
                        <span className="text-sm font-medium text-[#0D1A33]">
                          {displayValue(user.fullName)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-[#4A5568]" />
                        <span className="text-sm text-[#4A5568]">
                          {displayValue(user.email)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-[#4A5568]" />
                        <span className="text-sm text-[#4A5568]">
                          {displayValue(user.mobileNumber)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                        {displayValue(user.userType)}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-[#4A5568]" />
                        <span className="text-sm text-[#4A5568]">
                          {formatDate(user.fromDate)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-[#4A5568]" />
                        <span className="text-sm text-[#4A5568]">
                          {formatDate(user.toDate)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <StatusPill status={user.status} />
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default memo(UserListTable);
