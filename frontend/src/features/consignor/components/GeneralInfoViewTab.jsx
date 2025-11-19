import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getPageTheme } from "../../../theme.config";
import {
  ChevronDown,
  ChevronUp,
  Building2,
  Globe,
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Download,
} from "lucide-react";

const GeneralInfoViewTab = ({ consignor }) => {
  const theme = getPageTheme("tab");
  
  // 🔍 COMPREHENSIVE DEBUG LOGGING FOR NDA/MSA
  console.log('\n🔍 ===== GENERAL INFO VIEW TAB DEBUG =====');
  console.log('Full consignor object:', consignor);
  console.log('consignor keys:', Object.keys(consignor || {}));
  console.log('upload_nda:', consignor?.upload_nda);
  console.log('upload_msa:', consignor?.upload_msa);
  console.log('Type of upload_nda:', typeof consignor?.upload_nda);
  console.log('Type of upload_msa:', typeof consignor?.upload_msa);
  console.log('Truthy check upload_nda:', !!consignor?.upload_nda);
  console.log('Truthy check upload_msa:', !!consignor?.upload_msa);
  console.log('===================================\n');

  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    documents: true,
    additional: true,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Check if document is expired
  const isDocumentExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  // Check if document is expiring soon (within 30 days)
  const isDocumentExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const expiryDateObj = new Date(expiryDate);
    return expiryDateObj > new Date() && expiryDateObj <= thirtyDaysFromNow;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div style={{ padding: "24px" }}>
        
      {/* Basic Information Section */}
      <div
        style={{
          backgroundColor: theme.colors.card.background,
          borderRadius: "12px",
          marginBottom: "20px",
          border: `1px solid ${theme.colors.card.border}`,
          overflow: "hidden",
        }}
      >
        {/* Section Header */}
        <button
          onClick={() => toggleSection("basic")}
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
              Basic Information
            </h3>
          </div>
          {expandedSections.basic ? (
            <ChevronUp size={20} style={{ color: theme.colors.text.secondary }} />
          ) : (
            <ChevronDown size={20} style={{ color: theme.colors.text.secondary }} />
          )}
        </button>

        {/* Section Content */}
        <AnimatePresence>
          {expandedSections.basic && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: "hidden" }}
            >
              <div style={{ padding: "0 24px 24px 24px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  {/* Customer ID */}
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
                      Customer ID
                    </label>
                    <p
                      style={{
                        fontSize: "14px",
                        color: theme.colors.text.primary,
                        fontWeight: "500",
                        margin: 0,
                      }}
                    >
                      {consignor?.customer_id || "N/A"}
                    </p>
                  </div>

                  {/* Customer Name */}
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
                      Customer Name
                    </label>
                    <p
                      style={{
                        fontSize: "14px",
                        color: theme.colors.text.primary,
                        fontWeight: "500",
                        margin: 0,
                      }}
                    >
                      {consignor?.customer_name || "N/A"}
                    </p>
                  </div>

                  {/* Search Term */}
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
                      Search Term
                    </label>
                    <p
                      style={{
                        fontSize: "14px",
                        color: theme.colors.text.primary,
                        margin: 0,
                      }}
                    >
                      {consignor?.search_term || "N/A"}
                    </p>
                  </div>

                  {/* Industry Type */}
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
                      Industry Type
                    </label>
                    <p
                      style={{
                        fontSize: "14px",
                        color: theme.colors.text.primary,
                        margin: 0,
                      }}
                    >
                      {consignor?.industry_type || "N/A"}
                    </p>
                  </div>

                  {/* Currency Type */}
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
                      Currency Type
                    </label>
                    <p
                      style={{
                        fontSize: "14px",
                        color: theme.colors.text.primary,
                        margin: 0,
                      }}
                    >
                      {consignor?.currency_type || "N/A"}
                    </p>
                  </div>

                  {/* Payment Term */}
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
                      Payment Term
                    </label>
                    <p
                      style={{
                        fontSize: "14px",
                        color: theme.colors.text.primary,
                        margin: 0,
                      }}
                    >
                      {consignor?.payment_term || "N/A"}
                    </p>
                  </div>

                  {/* Website URL */}
                  {consignor?.website_url && (
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: "12px",
                          fontWeight: "500",
                          color: theme.colors.text.secondary,
                          marginBottom: "6px",
                        }}
                      >
                        <Globe size={14} style={{ display: "inline", marginRight: "4px" }} />
                        Website URL
                      </label>
                      <a
                        href={consignor.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: "14px",
                          color: theme.colors.primary.background,
                          textDecoration: "none",
                        }}
                      >
                        {consignor.website_url}
                      </a>
                    </div>
                  )}

                  {/* Remark */}
                  {consignor?.remark && (
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: "12px",
                          fontWeight: "500",
                          color: theme.colors.text.secondary,
                          marginBottom: "6px",
                        }}
                      >
                        Remark
                      </label>
                      <p
                        style={{
                          fontSize: "14px",
                          color: theme.colors.text.primary,
                          margin: 0,
                          lineHeight: "1.6",
                        }}
                      >
                        {consignor.remark}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Document Status Section */}
      <div
        style={{
          backgroundColor: theme.colors.card.background,
          borderRadius: "12px",
          marginBottom: "20px",
          border: `1px solid ${theme.colors.card.border}`,
          overflow: "hidden",
        }}
      >
        {/* Section Header */}
        <button
          onClick={() => toggleSection("documents")}
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 24px",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <FileText size={20} style={{ color: theme.colors.primary.background, marginRight: "12px" }} />
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: theme.colors.text.primary,
                margin: 0,
              }}
            >
              NDA & MSA Documents
            </h3>
          </div>
          {expandedSections.documents ? (
            <ChevronUp size={20} style={{ color: theme.colors.text.secondary }} />
          ) : (
            <ChevronDown size={20} style={{ color: theme.colors.text.secondary }} />
          )}
        </button>

        {/* Section Content */}
        <AnimatePresence>
          {expandedSections.documents && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{ padding: "0 24px 24px 24px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  {/* NDA Document */}
                  <div
                    style={{
                      padding: "16px",
                      backgroundColor: theme.colors.primary.background + "10",
                      borderRadius: "8px",
                      border: `1px solid ${theme.colors.card.border}`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
                      <FileText size={18} style={{ color: theme.colors.primary.background, marginRight: "8px" }} />
                      <span style={{ fontSize: "14px", fontWeight: "500", color: theme.colors.text.primary }}>
                        NDA Document
                      </span>
                    </div>
                    {consignor?.upload_nda ? (
                      <div>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                          <CheckCircle size={16} style={{ color: theme.colors.status.success.text, marginRight: "6px" }} />
                          <span style={{ fontSize: "13px", color: theme.colors.text.secondary }}>
                            Document ID: {consignor.upload_nda}
                          </span>
                        </div>
                        <button
                          style={{
                            display: "flex",
                            alignItems: "center",
                            padding: "6px 12px",
                            backgroundColor: theme.colors.button.primary.background,
                            color: theme.colors.button.primary.text,
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "500",
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                          onClick={async () => {
                            try {
                              const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                              const response = await fetch(
                                `${apiUrl}/api/consignors/${consignor.customer_id}/general/nda/download`,
                                { credentials: 'include' }
                              );

                              if (!response.ok) {
                                throw new Error(`HTTP error! status: ${response.status}`);
                              }

                              const blob = await response.blob();
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `NDA_${consignor.customer_id}`;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              window.URL.revokeObjectURL(url);
                            } catch (error) {
                              console.error("Error downloading NDA:", error);
                              alert("Failed to download NDA document");
                            }
                          }}
                        >
                          <Download size={14} style={{ marginRight: "4px" }} />
                          Download NDA
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <XCircle size={16} style={{ color: theme.colors.text.disabled, marginRight: "6px" }} />
                        <span style={{ fontSize: "13px", color: theme.colors.text.disabled }}>Not uploaded</span>
                      </div>
                    )}
                  </div>

                  {/* MSA Document */}
                  <div
                    style={{
                      padding: "16px",
                      backgroundColor: theme.colors.primary.background + "10",
                      borderRadius: "8px",
                      border: `1px solid ${theme.colors.card.border}`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
                      <FileText size={18} style={{ color: theme.colors.primary.background, marginRight: "8px" }} />
                      <span style={{ fontSize: "14px", fontWeight: "500", color: theme.colors.text.primary }}>
                        MSA Document
                      </span>
                    </div>
                    {consignor?.upload_msa ? (
                      <div>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                          <CheckCircle size={16} style={{ color: theme.colors.status.success.text, marginRight: "6px" }} />
                          <span style={{ fontSize: "13px", color: theme.colors.text.secondary }}>
                            Document ID: {consignor.upload_msa}
                          </span>
                        </div>
                        <button
                          style={{
                            display: "flex",
                            alignItems: "center",
                            padding: "6px 12px",
                            backgroundColor: theme.colors.button.primary.background,
                            color: theme.colors.button.primary.text,
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "500",
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                          onClick={async () => {
                            try {
                              const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                              const response = await fetch(
                                `${apiUrl}/api/consignors/${consignor.customer_id}/general/msa/download`,
                                { credentials: 'include' }
                              );

                              if (!response.ok) {
                                throw new Error(`HTTP error! status: ${response.status}`);
                              }

                              const blob = await response.blob();
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `MSA_${consignor.customer_id}`;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              window.URL.revokeObjectURL(url);
                            } catch (error) {
                              console.error("Error downloading MSA:", error);
                              alert("Failed to download MSA document");
                            }
                          }}
                        >
                          <Download size={14} style={{ marginRight: "4px" }} />
                          Download MSA
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <XCircle size={16} style={{ color: theme.colors.text.disabled, marginRight: "6px" }} />
                        <span style={{ fontSize: "13px", color: theme.colors.text.disabled }}>Not uploaded</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Additional Information Section */}
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
          onClick={() => toggleSection("additional")}
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 24px",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <User size={20} style={{ color: theme.colors.primary.background, marginRight: "12px" }} />
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: theme.colors.text.primary,
                margin: 0,
              }}
            >
              Additional Information
            </h3>
          </div>
          {expandedSections.additional ? (
            <ChevronUp size={20} style={{ color: theme.colors.text.secondary }} />
          ) : (
            <ChevronDown size={20} style={{ color: theme.colors.text.secondary }} />
          )}
        </button>

        {/* Section Content */}
        <AnimatePresence>
          {expandedSections.additional && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{ padding: "0 24px 24px 24px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  {/* Name on PO */}
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
                      Name on Purchase Order
                    </label>
                    <p
                      style={{
                        fontSize: "14px",
                        color: theme.colors.text.primary,
                        margin: 0,
                      }}
                    >
                      {consignor?.name_on_po || "N/A"}
                    </p>
                  </div>

                  {/* Approved By */}
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
                      Approved By
                    </label>
                    <p
                      style={{
                        fontSize: "14px",
                        color: theme.colors.text.primary,
                        margin: 0,
                      }}
                    >
                      {consignor?.approved_by || "N/A"}
                    </p>
                  </div>

                  {/* Approved Date */}
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
                      <Calendar size={14} style={{ display: "inline", marginRight: "4px" }} />
                      Approved Date
                    </label>
                    <p
                      style={{
                        fontSize: "14px",
                        color: theme.colors.text.primary,
                        margin: 0,
                      }}
                    >
                      {formatDate(consignor?.approved_date)}
                    </p>
                  </div>

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
                          consignor?.status === "ACTIVE"
                            ? theme.colors.status.success.background
                            : consignor?.status === "PENDING"
                            ? theme.colors.status.warning.background
                            : theme.colors.status.error.background,
                        color:
                          consignor?.status === "ACTIVE"
                            ? theme.colors.status.success.text
                            : consignor?.status === "PENDING"
                            ? theme.colors.status.warning.text
                            : theme.colors.status.error.text,
                      }}
                    >
                      {consignor?.status || "UNKNOWN"}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GeneralInfoViewTab;
