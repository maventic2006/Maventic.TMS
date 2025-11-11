import React from "react";

const StatusPill = ({ status }) => {
  const getStatusStyle = (status) => {
    const normalizedStatus = status?.toUpperCase();
    switch (normalizedStatus) {
      case "ACTIVE":
      case "APPROVED":
        return {
          bgColor: "bg-green-100",
          textColor: "text-green-700",
          dotColor: "bg-green-500",
        };
      case "PENDING":
        return {
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-700",
          dotColor: "bg-yellow-500",
        };
      case "INACTIVE":
        return {
          bgColor: "bg-gray-100",
          textColor: "text-gray-700",
          dotColor: "bg-gray-500",
        };
      case "REJECTED":
        return {
          bgColor: "bg-red-100",
          textColor: "text-red-700",
          dotColor: "bg-red-500",
        };
      default:
        return {
          bgColor: "bg-gray-100",
          textColor: "text-gray-700",
          dotColor: "bg-gray-500",
        };
    }
  };

  const style = getStatusStyle(status);

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${style.bgColor} ${style.textColor} font-semibold text-xs whitespace-nowrap`}
    >
      <span className={`h-2 w-2 rounded-full ${style.dotColor} animate-pulse`}></span>
      <span>{status || "N/A"}</span>
    </div>
  );
};

export default StatusPill;
