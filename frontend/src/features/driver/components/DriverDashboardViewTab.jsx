import React from "react";
import { Star, TrendingUp, Clock, AlertTriangle, Ban } from "lucide-react";
import { getPageTheme } from "../../../theme.config";

const DriverDashboardViewTab = ({ driver }) => {
  const theme = getPageTheme("tab") || {};
  const safeTheme = {
    card: theme.card || "#ffffff",
    text: theme.text || "#1f2937",
    textLight: theme.textLight || "#6b7280",
    primary: theme.primary || "#3b82f6",
    secondary: theme.secondary || "#8b5cf6",
    success: theme.success || "#10b981",
    warning: theme.warning || "#f59e0b",
    danger: theme.danger || "#ef4444",
  };

  const dashboard = driver?.dashboard || {
    avgRating: 0,
    totalTrips: 0,
    tripsOnTime: 0,
    totalAccidents: 0,
    totalViolations: 0,
  };

  const MetricCard = ({ icon: Icon, label, value, color, iconBg, note }) => (
    <div
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-100"
      style={{
        backgroundColor: safeTheme.card,
      }}
    >
      <div className="flex items-center gap-4">
        <div
          className="flex items-center justify-center w-14 h-14 rounded-full"
          style={{ backgroundColor: iconBg }}
        >
          <Icon
            className="w-7 h-7"
            style={{ color: color }}
            strokeWidth={2.5}
          />
        </div>
        <div className="flex-1">
          <p
            className="text-sm font-medium mb-1"
            style={{ color: safeTheme.textLight }}
          >
            {label}
          </p>
          <p className="text-3xl font-bold" style={{ color: safeTheme.text }}>
            {value}
          </p>
          {note && (
            <p
              className="text-xs mt-1 italic"
              style={{ color: safeTheme.textLight }}
            >
              {note}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2
          className="text-2xl font-bold mb-2"
          style={{ color: safeTheme.text }}
        >
          Driver Performance Dashboard
        </h2>
        <p style={{ color: safeTheme.textLight }}>
          Overview of key performance metrics and statistics
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Average Rating */}
        <MetricCard
          icon={Star}
          label="Average Rating"
          value={
            dashboard.avgRating
              ? `${parseFloat(dashboard.avgRating).toFixed(2)} ★`
              : "N/A"
          }
          color={safeTheme.warning}
          iconBg={`${safeTheme.warning}20`}
        />

        {/* Total Trips */}
        <MetricCard
          icon={TrendingUp}
          label="Total Trips"
          value={dashboard.totalTrips || 0}
          color={safeTheme.primary}
          iconBg={`${safeTheme.primary}20`}
          note="Trip tracking coming soon"
        />

        {/* On-Time Trips */}
        <MetricCard
          icon={Clock}
          label="Trips On Time"
          value={dashboard.tripsOnTime || 0}
          color={safeTheme.success}
          iconBg={`${safeTheme.success}20`}
          note="Trip tracking coming soon"
        />

        {/* Total Accidents */}
        <MetricCard
          icon={AlertTriangle}
          label="Total Accidents"
          value={dashboard.totalAccidents || 0}
          color={safeTheme.danger}
          iconBg={`${safeTheme.danger}20`}
        />

        {/* Total Violations */}
        <MetricCard
          icon={Ban}
          label="Total Violations"
          value={dashboard.totalViolations || 0}
          color={safeTheme.warning}
          iconBg={`${safeTheme.warning}20`}
        />
      </div>

      {/* Safety Score Card */}
      <div
        className="bg-white rounded-lg shadow-md p-6 border border-gray-100"
        style={{ backgroundColor: safeTheme.card }}
      >
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: safeTheme.text }}
        >
          Safety Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p
              className="text-sm font-medium mb-2"
              style={{ color: safeTheme.textLight }}
            >
              Accidents
            </p>
            <p
              className="text-4xl font-bold"
              style={{ color: safeTheme.danger }}
            >
              {dashboard.totalAccidents || 0}
            </p>
          </div>
          <div className="text-center">
            <p
              className="text-sm font-medium mb-2"
              style={{ color: safeTheme.textLight }}
            >
              Violations
            </p>
            <p
              className="text-4xl font-bold"
              style={{ color: safeTheme.warning }}
            >
              {dashboard.totalViolations || 0}
            </p>
          </div>
          <div className="text-center">
            <p
              className="text-sm font-medium mb-2"
              style={{ color: safeTheme.textLight }}
            >
              Safety Score
            </p>
            <p
              className="text-4xl font-bold"
              style={{
                color:
                  (dashboard.totalAccidents || 0) +
                    (dashboard.totalViolations || 0) ===
                  0
                    ? safeTheme.success
                    : (dashboard.totalAccidents || 0) +
                        (dashboard.totalViolations || 0) <=
                      2
                    ? safeTheme.warning
                    : safeTheme.danger,
              }}
            >
              {(dashboard.totalAccidents || 0) +
                (dashboard.totalViolations || 0) ===
              0
                ? "Excellent"
                : (dashboard.totalAccidents || 0) +
                    (dashboard.totalViolations || 0) <=
                  2
                ? "Good"
                : "Needs Improvement"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboardViewTab;
