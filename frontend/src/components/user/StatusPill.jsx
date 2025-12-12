import React, { memo } from "react";
import { CheckCircle, XCircle, Clock, AlertCircle, Lock } from "lucide-react";

const StatusPill = ({ status }) => {
  const statusConfig = {
    ACTIVE: {
      label: "Active",
      bgColor: "bg-green-100",
      textColor: "text-green-700",
      icon: CheckCircle,
    },
    INACTIVE: {
      label: "Inactive",
      bgColor: "bg-gray-100",
      textColor: "text-gray-700",
      icon: XCircle,
    },
    PENDING: {
      label: "Pending",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-700",
      icon: Clock,
    },
    LOCKED: {
      label: "Locked",
      bgColor: "bg-red-100",
      textColor: "text-red-700",
      icon: Lock,
    },
  };

  const config = statusConfig[status] || {
    label: status || "Unknown",
    bgColor: "bg-gray-100",
    textColor: "text-gray-700",
    icon: AlertCircle,
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
};

export default memo(StatusPill);
