import React, { useState } from "react";
import {
  User,
  Phone,
  Mail,
  Calendar,
  Droplet,
  MapPin,
  Star,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getPageTheme } from "../../../theme.config";

const BasicInfoViewTab = ({ driver }) => {
  const theme = getPageTheme("tab") || {};
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    address: true,
  });

  // Ensure theme objects have required structure with defaults
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
      primary: {
        background: theme.colors?.primary?.background || "#10B981",
      },
    },
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const InfoItem = ({ label, value, icon: Icon }) => (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        {Icon && (
          <Icon
            className="h-4 w-4"
            style={{ color: safeTheme.colors.text.secondary }}
          />
        )}
        <p
          className="text-sm font-medium"
          style={{ color: safeTheme.colors.text.secondary }}
        >
          {label}
        </p>
      </div>
      <p
        className="text-base font-semibold"
        style={{ color: safeTheme.colors.text.primary }}
      >
        {value || "N/A"}
      </p>
    </div>
  );

  const CollapsibleSection = ({ title, icon: Icon, sectionKey, children }) => {
    const isExpanded = expandedSections[sectionKey];

    return (
      <div
        className="border rounded-lg overflow-hidden shadow-sm"
        style={{
          backgroundColor: safeTheme.colors.card.background,
          borderColor: safeTheme.colors.card.border,
        }}
      >
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Icon
              className="h-5 w-5"
              style={{ color: safeTheme.colors.primary.background }}
            />
            <h3
              className="text-lg font-semibold"
              style={{ color: safeTheme.colors.text.primary }}
            >
              {title}
            </h3>
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
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="space-y-4 p-2">
      <CollapsibleSection
        title="Basic Information"
        icon={User}
        sectionKey="basic"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <InfoItem label="Full Name" value={driver.fullName} />
          <InfoItem label="Date of Birth" value={driver.dateOfBirth} />
          <InfoItem label="Gender" value={driver.gender} />
          <InfoItem label="Blood Group" value={driver.bloodGroup} />
          <InfoItem label="Phone Number" value={driver.phoneNumber} />
          <InfoItem label="Email" value={driver.emailId} />
          <InfoItem label="WhatsApp Number" value={driver.whatsAppNumber} />
          <InfoItem
            label="Alternate Phone"
            value={driver.alternatePhoneNumber}
          />
          <InfoItem label="Average Rating" value={driver.avgRating} />
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Address Information"
        icon={MapPin}
        sectionKey="address"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoItem label="City" value={driver.addresses?.[0]?.city} />
          <InfoItem label="State" value={driver.addresses?.[0]?.state} />
          <InfoItem label="Country" value={driver.addresses?.[0]?.country} />
          <InfoItem
            label="Postal Code"
            value={driver.addresses?.[0]?.postalCode}
          />
          <InfoItem label="Street" value={driver.addresses?.[0]?.street1} />
          <InfoItem label="District" value={driver.addresses?.[0]?.district} />
        </div>
      </CollapsibleSection>
    </div>
  );
};

export default BasicInfoViewTab;
