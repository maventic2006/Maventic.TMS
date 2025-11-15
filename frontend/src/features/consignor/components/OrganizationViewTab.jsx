import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getPageTheme } from "../../../theme.config";
import { ChevronDown, ChevronUp, Building2, Briefcase } from "lucide-react";

const OrganizationViewTab = ({ consignor }) => {
  const theme = getPageTheme("tab");
  const [isExpanded, setIsExpanded] = useState(true);

  const organization = consignor?.organization || {};

  return (
    <div style={{ padding: "24px" }}>
      {/* Organization Section */}
      <div
        style={{
          backgroundColor: theme.colors.card.background,
          borderRadius: "12px",
          border: `1px solid ${theme.colors.card.border}`,
          overflow: "hidden",
        }}
      >
        {/* Section Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 24px",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
            transition: "background-color 0.2s",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <Building2 size={20} style={{ color: theme.colors.primary.background, marginRight: "12px" }} />
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: theme.colors.text.primary,
                margin: 0,
              }}
            >
              Organization Details
            </h3>
          </div>
          {isExpanded ? (
            <ChevronUp size={20} style={{ color: theme.colors.text.secondary }} />
          ) : (
            <ChevronDown size={20} style={{ color: theme.colors.text.secondary }} />
          )}
        </button>

        {/* Section Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: "hidden" }}
            >
              <div style={{ padding: "0 24px 24px 24px" }}>
                {/* Organization Info Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  {/* Company Code */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: "500",
                        color: theme.colors.text.secondary,
                        marginBottom: "6px",
                      }}
                    >
                      Company Code
                    </label>
                    <p
                      style={{
                        fontSize: "14px",
                        color: theme.colors.text.primary,
                        fontWeight: "600",
                        margin: 0,
                        fontFamily: "monospace",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {organization.company_code || "N/A"}
                    </p>
                  </div>

                  {/* Business Area - States Display */}
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: "500",
                        color: theme.colors.text.secondary,
                        marginBottom: "8px",
                      }}
                    >
                      <Briefcase size={14} style={{ display: "inline", marginRight: "4px" }} />
                      Business Area (States)
                    </label>
                    {Array.isArray(organization.business_area) && organization.business_area.length > 0 ? (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {organization.business_area.map((state, index) => (
                          <span
                            key={index}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "6px 12px",
                              fontSize: "13px",
                              fontWeight: "500",
                              borderRadius: "16px",
                              backgroundColor: theme.colors.primary.background + "20",
                              color: theme.colors.primary.background,
                              border: `1px solid ${theme.colors.primary.background}30`,
                            }}
                          >
                            {state}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p
                        style={{
                          fontSize: "14px",
                          color: theme.colors.text.disabled,
                          fontStyle: "italic",
                          margin: 0,
                        }}
                      >
                        {typeof organization.business_area === "string" 
                          ? organization.business_area 
                          : "No states selected"}
                      </p>
                    )}
                  </div>

                  {/* Organization Unique ID */}
                  {organization.organization_unique_id && (
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "12px",
                          fontWeight: "500",
                          color: theme.colors.text.secondary,
                          marginBottom: "6px",
                        }}
                      >
                        Organization ID
                      </label>
                      <p
                        style={{
                          fontSize: "14px",
                          color: theme.colors.text.primary,
                          fontWeight: "500",
                          margin: 0,
                        }}
                      >
                        {organization.organization_unique_id}
                      </p>
                    </div>
                  )}

                  {/* Status */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: "500",
                        color: theme.colors.text.secondary,
                        marginBottom: "6px",
                      }}
                    >
                      Status
                    </label>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 12px",
                        fontSize: "12px",
                        fontWeight: "500",
                        borderRadius: "12px",
                        backgroundColor:
                          organization.status === "ACTIVE"
                            ? theme.colors.status.success + "20"
                            : theme.colors.status.error + "20",
                        color:
                          organization.status === "ACTIVE"
                            ? theme.colors.status.success
                            : theme.colors.status.error,
                      }}
                    >
                      {organization.status || "UNKNOWN"}
                    </span>
                  </div>
                </div>

                {/* Information Note */}
                <div
                  style={{
                    marginTop: "20px",
                    padding: "16px",
                    backgroundColor: theme.colors.primary.background + "10",
                    borderRadius: "8px",
                    border: `1px solid ${theme.colors.primary.background}20`,
                  }}
                >
                  <p style={{ fontSize: "14px", color: theme.colors.text.secondary, margin: 0, marginBottom: "8px" }}>
                    <strong>Organization Structure:</strong>
                  </p>
                  <ul style={{ fontSize: "13px", color: theme.colors.text.secondary, paddingLeft: "20px", margin: 0 }}>
                    <li>Company Code uniquely identifies this consignor in the system</li>
                    <li>Business Area shows all states where the consignor operates</li>
                    <li>Multiple states indicate wider geographic coverage and operational reach</li>
                    <li>This information is used for financial reporting and regional logistics planning</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Empty State if No Organization Data */}
      {!organization.company_code && !organization.business_area && (
        <div
          style={{
            marginTop: "20px",
            backgroundColor: theme.colors.card.background,
            borderRadius: "12px",
            padding: "40px",
            textAlign: "center",
            border: `1px solid ${theme.colors.card.border}`,
          }}
        >
          <Building2 size={48} style={{ color: theme.colors.text.disabled, marginBottom: "16px" }} />
          <p style={{ fontSize: "16px", color: theme.colors.text.secondary, marginBottom: "8px" }}>
            No organization information available
          </p>
          <p style={{ fontSize: "14px", color: theme.colors.text.disabled }}>
            Organization details will appear here once added
          </p>
        </div>
      )}
    </div>
  );
};

export default OrganizationViewTab;
