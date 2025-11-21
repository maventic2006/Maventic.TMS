import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getPageTheme } from "../../../theme.config";
import {
  ChevronDown,
  ChevronUp,
  FileText,
  Calendar,
  CheckCircle,
  AlertCircle,
  XCircle,
  Download,
  Eye,
} from "lucide-react";

const DocumentsViewTab = ({ consignor }) => {
  const theme = getPageTheme("tab");
  const [expandedDocuments, setExpandedDocuments] = useState({});

  const toggleDocument = (index) => {
    setExpandedDocuments((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const documents = consignor?.documents || [];

  // Check if document is expired
  const isExpired = (validTo) => {
    if (!validTo) return false;
    return new Date(validTo) < new Date();
  };

  // Check if document is expiring soon (within 30 days)
  const isExpiringSoon = (validTo) => {
    if (!validTo) return false;
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const validToDate = new Date(validTo);
    return validToDate > new Date() && validToDate <= thirtyDaysFromNow;
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

  // Get document status badge
  const getDocumentStatusBadge = (document) => {
    if (isExpired(document.valid_to)) {
      return {
        label: "Expired",
        color: theme.colors.status.error,
        backgroundColor: theme.colors.status.error + "20",
        icon: XCircle,
      };
    } else if (isExpiringSoon(document.valid_to)) {
      return {
        label: "Expiring Soon",
        color: theme.colors.status.warning,
        backgroundColor: theme.colors.status.warning + "20",
        icon: AlertCircle,
      };
    } else if (document.status === "ACTIVE") {
      return {
        label: "Active",
        color: theme.colors.status.success,
        backgroundColor: theme.colors.status.success + "20",
        icon: CheckCircle,
      };
    } else {
      return {
        label: document.status || "Unknown",
        color: theme.colors.text.disabled,
        backgroundColor: theme.colors.text.disabled + "20",
        icon: AlertCircle,
      };
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <FileText size={24} style={{ color: theme.colors.primary.background, marginRight: "12px" }} />
        <h3
          style={{
            fontSize: "20px",
            fontWeight: "600",
            color: theme.colors.text.primary,
            margin: 0,
          }}
        >
          Documents ({documents.length})
        </h3>
      </div>

      {/* Documents List */}
      {documents.length === 0 ? (
        <div
          style={{
            backgroundColor: theme.colors.card.background,
            borderRadius: "12px",
            padding: "40px",
            textAlign: "center",
            border: `1px solid ${theme.colors.card.border}`,
          }}
        >
          <FileText size={48} style={{ color: theme.colors.text.disabled, marginBottom: "16px" }} />
          <p style={{ fontSize: "16px", color: theme.colors.text.secondary, marginBottom: "8px" }}>
            No documents found
          </p>
          <p style={{ fontSize: "14px", color: theme.colors.text.disabled }}>
            Document information will appear here once uploaded
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {documents.map((document, index) => {
            const statusBadge = getDocumentStatusBadge(document);
            const StatusIcon = statusBadge.icon;

            return (
              <div
                key={index}
                style={{
                  backgroundColor: theme.colors.card.background,
                  borderRadius: "12px",
                  border: `1px solid ${theme.colors.card.border}`,
                  overflow: "hidden",
                }}
              >
                {/* Document Header */}
                <button
                  onClick={() => toggleDocument(index)}
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
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1 }}>
                    {/* Document Icon */}
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "8px",
                        background: `linear-gradient(to bottom right, ${theme.colors.primary.background}, ${theme.colors.button.primary.background})`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FileText size={24} style={{ color: "#FFFFFF" }} />
                    </div>

                    {/* Document Info */}
                    <div style={{ textAlign: "left", flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
                        <h4
                          style={{
                            fontSize: "16px",
                            fontWeight: "600",
                            color: theme.colors.text.primary,
                            margin: 0,
                          }}
                        >
                          {document.document_type || "Unknown Document"}
                        </h4>
                        <span
                          style={{
                            padding: "4px 12px",
                            fontSize: "12px",
                            fontWeight: "500",
                            borderRadius: "12px",
                            backgroundColor: statusBadge.backgroundColor,
                            color: statusBadge.color,
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <StatusIcon size={14} />
                          {statusBadge.label}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: "14px",
                          color: theme.colors.text.secondary,
                          margin: 0,
                        }}
                      >
                        {document.document_number || "No document number"}
                      </p>
                    </div>
                  </div>

                  {expandedDocuments[index] ? (
                    <ChevronUp size={20} style={{ color: theme.colors.text.secondary }} />
                  ) : (
                    <ChevronDown size={20} style={{ color: theme.colors.text.secondary }} />
                  )}
                </button>

                {/* Document Details */}
                <AnimatePresence>
                  {expandedDocuments[index] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div
                        style={{
                          padding: "0 24px 24px 24px",
                          borderTop: `1px solid ${theme.colors.card.border}`,
                        }}
                      >
                        {/* Document Information Grid */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px" }}>
                          {/* Document ID */}
                          {document.document_id && (
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
                                Document ID
                              </label>
                              <p
                                style={{
                                  fontSize: "14px",
                                  color: theme.colors.text.primary,
                                  fontWeight: "500",
                                  margin: 0,
                                }}
                              >
                                {document.document_id}
                              </p>
                            </div>
                          )}

                          {/* Document Type ID */}
                          {document.document_type_id && (
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
                                Type ID
                              </label>
                              <p
                                style={{
                                  fontSize: "14px",
                                  color: theme.colors.text.primary,
                                  margin: 0,
                                }}
                              >
                                {document.document_type_id}
                              </p>
                            </div>
                          )}

                          {/* Valid From */}
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
                              Valid From
                            </label>
                            <p
                              style={{
                                fontSize: "14px",
                                color: theme.colors.text.primary,
                                margin: 0,
                              }}
                            >
                              {formatDate(document.valid_from)}
                            </p>
                          </div>

                          {/* Valid To */}
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
                              Valid To
                            </label>
                            <p
                              style={{
                                fontSize: "14px",
                                color: isExpired(document.valid_to)
                                  ? theme.colors.status.error
                                  : isExpiringSoon(document.valid_to)
                                  ? theme.colors.status.warning
                                  : theme.colors.text.primary,
                                fontWeight: isExpired(document.valid_to) || isExpiringSoon(document.valid_to) ? "600" : "400",
                                margin: 0,
                              }}
                            >
                              {formatDate(document.valid_to)}
                            </p>
                          </div>
                        </div>

                        {/* Document Validity Status */}
                        {document.valid_to && (
                          <div
                            style={{
                              marginTop: "16px",
                              padding: "12px",
                              backgroundColor: isExpired(document.valid_to)
                                ? theme.colors.status.error + "20"
                                : isExpiringSoon(document.valid_to)
                                ? theme.colors.status.warning + "20"
                                : theme.colors.status.success + "20",
                              borderRadius: "8px",
                              border: `1px solid ${
                                isExpired(document.valid_to)
                                  ? theme.colors.status.error
                                  : isExpiringSoon(document.valid_to)
                                  ? theme.colors.status.warning
                                  : theme.colors.status.success
                              }`,
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            {isExpired(document.valid_to) ? (
                              <>
                                <XCircle size={18} style={{ color: theme.colors.status.error }} />
                                <span style={{ fontSize: "14px", color: theme.colors.status.error }}>
                                  This document has expired on {formatDate(document.valid_to)}
                                </span>
                              </>
                            ) : isExpiringSoon(document.valid_to) ? (
                              <>
                                <AlertCircle size={18} style={{ color: theme.colors.status.warning }} />
                                <span style={{ fontSize: "14px", color: theme.colors.status.warning }}>
                                  This document will expire on {formatDate(document.valid_to)} (within 30 days)
                                </span>
                              </>
                            ) : (
                              <>
                                <CheckCircle size={18} style={{ color: theme.colors.status.success }} />
                                <span style={{ fontSize: "14px", color: theme.colors.status.success }}>
                                  Document is valid until {formatDate(document.valid_to)}
                                </span>
                              </>
                            )}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div
                          style={{
                            marginTop: "16px",
                            display: "flex",
                            gap: "12px",
                          }}
                        >
                          <button
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "8px 16px",
                              backgroundColor: theme.colors.button.primary.background,
                              color: theme.colors.button.primary.text,
                              border: "none",
                              borderRadius: "8px",
                              fontSize: "14px",
                              fontWeight: "500",
                              cursor: "pointer",
                              transition: "all 0.2s",
                            }}
                            onClick={async () => {
                              try {
                                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                                const url = `${apiUrl}/api/consignors/${consignor.customer_id}/documents/${document.document_unique_id}/download`;
                                window.open(url, "_blank");
                              } catch (error) {
                                console.error("Error viewing document:", error);
                                alert("Failed to view document");
                              }
                            }}
                          >
                            <Eye size={16} style={{ marginRight: "6px" }} />
                            View Document
                          </button>
                          <button
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "8px 16px",
                              backgroundColor: "transparent",
                              color: theme.colors.button.primary.background,
                              border: `1px solid ${theme.colors.button.primary.background}`,
                              borderRadius: "8px",
                              fontSize: "14px",
                              fontWeight: "500",
                              cursor: "pointer",
                              transition: "all 0.2s",
                            }}
                            onClick={async () => {
                              try {
                                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                                const response = await fetch(
                                  `${apiUrl}/api/consignors/${consignor.customer_id}/documents/${document.document_unique_id}/download`,
                                  { credentials: 'include' }
                                );

                                if (!response.ok) {
                                  throw new Error(`HTTP error! status: ${response.status}`);
                                }

                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = document.document_number || 'document';
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                window.URL.revokeObjectURL(url);
                              } catch (error) {
                                console.error("Error downloading document:", error);
                                alert("Failed to download document");
                              }
                            }}
                          >
                            <Download size={16} style={{ marginRight: "6px" }} />
                            Download
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DocumentsViewTab;
