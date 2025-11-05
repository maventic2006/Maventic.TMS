import React from "react";
import { VEHICLE_STATUS_COLORS } from "../../utils/vehicleConstants";

const VehicleStatusPill = ({ status }) => {
  const colors = VEHICLE_STATUS_COLORS[status] || {
    bg: "#E5E7EB",
    text: "#6B7280",
  };

  return (
    <span
      className="px-3 py-1 rounded-full text-xs font-medium"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
      }}
    >
      {status || "Unknown"}
    </span>
  );
};

export default VehicleStatusPill;
