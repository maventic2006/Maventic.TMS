import React, { useState } from "react";
import {
  Briefcase,
  Calendar,
  Building,
  MapPin,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getPageTheme } from "../../../theme.config";

const HistoryViewTab = ({ driver }) => {
  const theme = getPageTheme("tab") || {};
  const history = driver?.history || [];
  const [expandedHistory, setExpandedHistory] = useState({});

  const toggleHistory = (index) => {
    setExpandedHistory((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
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

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-500 mb-2">
          No Employment History
        </h3>
        <p className="text-gray-400">
          No employment history information has been added yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-2">
      {history.map((item, index) => {
        const isExpanded = expandedHistory[index];

        return (
          <div
            key={item.historyId || index}
            className="border rounded-lg overflow-hidden shadow-sm"
            style={{
              borderColor: safeTheme.colors.card.border,
              backgroundColor: safeTheme.colors.card.background,
            }}
          >
            <button
              onClick={() => toggleHistory(index)}
              className="w-full px-6 py-4 flex items-start justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: safeTheme.colors.text.primary }}
                  >
                    {item.employer || "N/A"}
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: safeTheme.colors.text.secondary }}
                  >
                    {item.jobTitle || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-medium border border-blue-200 bg-blue-100 text-blue-800">
                  {item.employmentStatus || "N/A"}
                </span>
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
              </div>
            </button>

            <AnimatePresence>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar
                            className="w-4 h-4"
                            style={{ color: safeTheme.colors.text.secondary }}
                          />
                          <label
                            className="text-sm font-medium"
                            style={{ color: safeTheme.colors.text.secondary }}
                          >
                            From Date
                          </label>
                        </div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: safeTheme.colors.text.primary }}
                        >
                          {formatDate(item.fromDate)}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar
                            className="w-4 h-4"
                            style={{ color: safeTheme.colors.text.secondary }}
                          />
                          <label
                            className="text-sm font-medium"
                            style={{ color: safeTheme.colors.text.secondary }}
                          >
                            To Date
                          </label>
                        </div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: safeTheme.colors.text.primary }}
                        >
                          {formatDate(item.toDate)}
                        </p>
                      </div>
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

export default HistoryViewTab;
