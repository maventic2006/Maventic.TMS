import React from "react";
import { CheckCircle, XCircle, Clock } from "lucide-react";

const StatusPill = ({ status }) => {
  const getStatusStyles = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-500 text-white";
      case "Approved":
        return "bg-blue-500 text-white";
      case "Pending":
        return "bg-yellow-500 text-white";
      case "Inactive":
        return "bg-red-500 text-white";
      case "Rejected":
        return "bg-red-600 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Active":
      case "Approved":
        return <CheckCircle className="h-3 w-3" />;
      case "Pending":
        return <Clock className="h-3 w-3" />;
      case "Inactive":
      case "Rejected":
        return <XCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const icon = getStatusIcon(status);

  return (
    <span
      className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium shadow-sm ${getStatusStyles(
        status
      )}`}
    >
      {icon}
      <span>{status}</span>
    </span>
  );
};

export default StatusPill;
