import React, { useState } from "react";
import {
  AlertTriangle,
  Calendar,
  Car,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getPageTheme } from "../../../theme.config";

const AccidentViolationViewTab = ({ driver }) => {
  const theme = getPageTheme("tab") || {};
  const accidents = driver?.accidents || [];
  const [expandedAccidents, setExpandedAccidents] = useState({});

  const toggleAccident = (index) => {
    setExpandedAccidents((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Helper function to format type name
  const formatTypeName = (type) => {
    if (!type) return "N/A";
    // Handle violation_type_id format (VT001, VT002)
    if (type === "VT001") return "Accident";
    if (type === "VT002") return "Violation";
    // If it's a number (ID), map it to name
    if (type === "1" || type === 1) return "Accident";
    if (type === "2" || type === 2) return "Violation";
    // If it's already a name, capitalize it properly
    if (typeof type === "string") {
      const typeLower = type.toLowerCase();
      if (typeLower === "accident") return "Accident";
      if (typeLower === "violation") return "Violation";
      return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
    }
    return type;
  };

  const safeTheme = {
    colors: {
      text: {
        primary: theme.colors?.text?.primary || "#111827",
        secondary: theme.colors?.text?.secondary || "#6B7280",
      },
      card: {
        background: theme.colors?.card?.background || "#FFFFFF",
        border: theme.colors?.card?.border || "#E5E7EB",
      },
    },
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (accidents.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-500 mb-2">
          No Accident or Violation Records
        </h3>
        <p className="text-gray-400">
          No accident or violation records have been added yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-2">
      {accidents.map((item, index) => {
        const isExpanded = expandedAccidents[index];

        return (
          <div
            key={item.violationId || index}
            className="border rounded-lg overflow-hidden shadow-sm"
            style={{
              borderColor: safeTheme.colors.card.border,
              backgroundColor: safeTheme.colors.card.background,
            }}
          >
            <button
              onClick={() => toggleAccident(index)}
              className="w-full px-6 py-4 flex items-start justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: safeTheme.colors.text.primary }}
                  >
                    {formatTypeName(item.type)}
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: safeTheme.colors.text.secondary }}
                  >
                    {formatDate(item.date)}
                  </p>
                </div>
              </div>

              {isExpanded ? (
                <ChevronUp
                  className="h-5 w-5"
                  style={{ color: safeTheme.colors.text.secondary }}
                />
              ) : (
                <ChevronDown
                  className="h-5 w-5"
                  style={{ color: safeTheme.colors.text.secondary }}
                />
              )}
            </button>

            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div
                    className="px-6 py-4 border-t"
                    style={{ borderColor: safeTheme.colors.card.border }}
                  >
                    <div className="space-y-4">
                      {item.description && (
                        <div>
                          <label
                            className="text-sm font-medium mb-2 block"
                            style={{ color: safeTheme.colors.text.secondary }}
                          >
                            Description
                          </label>
                          <p
                            className="text-sm"
                            style={{ color: safeTheme.colors.text.primary }}
                          >
                            {item.description}
                          </p>
                        </div>
                      )}

                      {item.vehicleRegnNumber && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Car
                              className="w-4 h-4"
                              style={{ color: safeTheme.colors.text.secondary }}
                            />
                            <label
                              className="text-sm font-medium"
                              style={{ color: safeTheme.colors.text.secondary }}
                            >
                              Vehicle Registration Number
                            </label>
                          </div>
                          <p
                            className="text-sm font-medium"
                            style={{ color: safeTheme.colors.text.primary }}
                          >
                            {item.vehicleRegnNumber}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

export default AccidentViolationViewTab;
