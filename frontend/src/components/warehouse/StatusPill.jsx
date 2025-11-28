import React from "react";
import { CheckCircle, XCircle, Clock, FileText } from "lucide-react";

const StatusPill = ({ status }) => {
  const getStatusStyles = (status) => {
    const normalizedStatus = status?.toLowerCase();

    switch (normalizedStatus) {
      case "active":
      case "approved":
        // Active/Approved: Green theme from specification
        return "bg-[#D1FAE5] text-[#10B981]";
      case "pending":
        // Pending: Yellow/Amber theme
        return "bg-[#FEF3C7] text-[#F97316]";
      case "save_as_draft": // ✅ Add draft status (matching transporter pattern)
        // Draft: Blue theme
        return "bg-blue-100 text-blue-700";
      case "inactive":
        // Inactive: Gray theme
        return "bg-[#E5E7EB] text-[#6B7280]";
      case "rejected":
        // Rejected: Red theme
        return "bg-[#FEE2E2] text-[#EF4444]";
      default:
        return "bg-[#E5E7EB] text-[#6B7280]";
    }
  };

  const getStatusIcon = (status) => {
    const normalizedStatus = status?.toLowerCase();

    switch (normalizedStatus) {
      case "active":
      case "approved":
        return <CheckCircle className="h-3 w-3" />;
      case "pending":
        return <Clock className="h-3 w-3" />;
      case "save_as_draft": // ✅ Add draft icon
        return <FileText className="h-3 w-3" />;
      case "inactive":
      case "rejected":
        return <XCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  // ✅ Display text mapping (SAVE_AS_DRAFT → "Draft")
  const getStatusText = (status) => {
    if (status === "SAVE_AS_DRAFT" || status === "save_as_draft") {
      return "Draft";
    }
    return status || "Unknown";
  };

  const icon = getStatusIcon(status);

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${getStatusStyles(
        status
      )}`}
    >
      {icon}
      <span className="capitalize">{getStatusText(status)}</span>
    </span>
  );
};

export default StatusPill;
