import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getPageTheme } from "../../../theme.config";
import {
  ChevronDown,
  ChevronUp,
  User,
  Mail,
  Phone,
  Briefcase,
  Linkedin,
  Users,
} from "lucide-react";

const ContactViewTab = ({ consignor }) => {
  const theme = getPageTheme("tab");
  const [expandedContacts, setExpandedContacts] = useState({});

  const toggleContact = (index) => {
    setExpandedContacts((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const contacts = consignor?.contacts || [];

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
        <Users size={24} style={{ color: theme.colors.primary.background, marginRight: "12px" }} />
        <h3
          style={{
            fontSize: "20px",
            fontWeight: "600",
            color: theme.colors.text.primary,
            margin: 0,
          }}
        >
          Contact Information ({contacts.length})
        </h3>
      </div>

      {/* Contacts List */}
      {contacts.length === 0 ? (
        <div
          style={{
            backgroundColor: theme.colors.card.background,
            borderRadius: "12px",
            padding: "40px",
            textAlign: "center",
            border: `1px solid ${theme.colors.card.border}`,
          }}
        >
          <User size={48} style={{ color: theme.colors.text.disabled, marginBottom: "16px" }} />
          <p style={{ fontSize: "16px", color: theme.colors.text.secondary, marginBottom: "8px" }}>
            No contacts found
          </p>
          <p style={{ fontSize: "14px", color: theme.colors.text.disabled }}>
            Contact information will appear here once added
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {contacts.map((contact, index) => (
            <div
              key={index}
              style={{
                backgroundColor: theme.colors.card.background,
                borderRadius: "12px",
                border: `1px solid ${theme.colors.card.border}`,
                overflow: "hidden",
              }}
            >
              {/* Contact Header */}
              <button
                onClick={() => toggleContact(index)}
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
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  {/* Photo */}
                  {contact.photo ? (
                    <img
                      src={contact.photo}
                      alt={contact.name}
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: `2px solid ${theme.colors.card.border}`,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        backgroundColor: theme.colors.primary.background + "20",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <User size={24} style={{ color: theme.colors.primary.background }} />
                    </div>
                  )}

                  {/* Name and Designation */}
                  <div style={{ textAlign: "left" }}>
                    <h4
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: theme.colors.text.primary,
                        margin: 0,
                        marginBottom: "4px",
                      }}
                    >
                      {contact.name || "N/A"}
                    </h4>
                    <p
                      style={{
                        fontSize: "14px",
                        color: theme.colors.text.secondary,
                        margin: 0,
                      }}
                    >
                      {contact.designation || "N/A"}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <span
                    style={{
                      padding: "4px 12px",
                      fontSize: "12px",
                      fontWeight: "500",
                      borderRadius: "12px",
                      backgroundColor:
                        contact.status === "ACTIVE"
                          ? theme.colors.status.success + "20"
                          : theme.colors.status.error + "20",
                      color:
                        contact.status === "ACTIVE"
                          ? theme.colors.status.success
                          : theme.colors.status.error,
                    }}
                  >
                    {contact.status || "UNKNOWN"}
                  </span>
                </div>

                {expandedContacts[index] ? (
                  <ChevronUp size={20} style={{ color: theme.colors.text.secondary }} />
                ) : (
                  <ChevronDown size={20} style={{ color: theme.colors.text.secondary }} />
                )}
              </button>

              {/* Contact Details */}
              <AnimatePresence>
                {expandedContacts[index] && (
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
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px" }}>
                        {/* Contact ID */}
                        {contact.contact_id && (
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
                              Contact ID
                            </label>
                            <p
                              style={{
                                fontSize: "14px",
                                color: theme.colors.text.primary,
                                fontWeight: "500",
                                margin: 0,
                              }}
                            >
                              {contact.contact_id}
                            </p>
                          </div>
                        )}

                        {/* Phone Number */}
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
                            <Phone size={14} style={{ display: "inline", marginRight: "4px" }} />
                            Phone Number
                          </label>
                          <a
                            href={`tel:${contact.number}`}
                            style={{
                              fontSize: "14px",
                              color: theme.colors.primary.background,
                              textDecoration: "none",
                            }}
                          >
                            {contact.country_code ? `${contact.country_code} ` : ""}
                            {contact.number || "N/A"}
                          </a>
                        </div>

                        {/* Email */}
                        {contact.email && (
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
                              <Mail size={14} style={{ display: "inline", marginRight: "4px" }} />
                              Email
                            </label>
                            <a
                              href={`mailto:${contact.email}`}
                              style={{
                                fontSize: "14px",
                                color: theme.colors.primary.background,
                                textDecoration: "none",
                              }}
                            >
                              {contact.email}
                            </a>
                          </div>
                        )}

                        {/* Role */}
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
                            <Briefcase size={14} style={{ display: "inline", marginRight: "4px" }} />
                            Role
                          </label>
                          <p
                            style={{
                              fontSize: "14px",
                              color: theme.colors.text.primary,
                              margin: 0,
                            }}
                          >
                            {contact.role || "N/A"}
                          </p>
                        </div>

                        {/* Team */}
                        {contact.team && (
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
                              <Users size={14} style={{ display: "inline", marginRight: "4px" }} />
                              Team
                            </label>
                            <p
                              style={{
                                fontSize: "14px",
                                color: theme.colors.text.primary,
                                margin: 0,
                              }}
                            >
                              {contact.team}
                            </p>
                          </div>
                        )}

                        {/* LinkedIn */}
                        {contact.linkedin_link && (
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
                              <Linkedin size={14} style={{ display: "inline", marginRight: "4px" }} />
                              LinkedIn Profile
                            </label>
                            <a
                              href={contact.linkedin_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                fontSize: "14px",
                                color: theme.colors.primary.background,
                                textDecoration: "none",
                              }}
                            >
                              {contact.linkedin_link}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactViewTab;
