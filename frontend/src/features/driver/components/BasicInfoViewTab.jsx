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
  });
  const [expandedAddresses, setExpandedAddresses] = useState({});

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

  // Helper function to format gender
  const formatGender = (gender) => {
    if (!gender) return "N/A";
    const genderMap = {
      M: "Male",
      F: "Female",
      MALE: "Male",
      FEMALE: "Female",
      OTHERS: "Others",
      OTHER: "Others",
    };
    return genderMap[gender.toUpperCase()] || gender;
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleAddress = (index) => {
    setExpandedAddresses((prev) => ({
      ...prev,
      [index]: !prev[index],
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
              style={{ color: safeTheme.colors.text.primary }}
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
          <InfoItem label="Gender" value={formatGender(driver.gender)} />
          <InfoItem label="Blood Group" value={driver.bloodGroup} />
          <InfoItem label="Phone Number" value={driver.phoneNumber} />
          <InfoItem label="Email" value={driver.emailId} />
          <InfoItem label="Emergency Contact" value={driver.emergencyContact} />
          <InfoItem
            label="Alternate Phone"
            value={driver.alternatePhoneNumber}
          />
          <InfoItem label="Average Rating" value={driver.avgRating} />
        </div>
      </CollapsibleSection>

      {/* Address Information - Multiple Addresses */}
      <div className="space-y-4">
        {driver.addresses && driver.addresses.length > 0 ? (
          driver.addresses.map((address, index) => {
            const isExpanded = expandedAddresses[index];

            return (
              <div
                key={address.addressId || index}
                className="border rounded-lg overflow-hidden shadow-sm"
                style={{
                  backgroundColor: safeTheme.colors.card.background,
                  borderColor: safeTheme.colors.card.border,
                }}
              >
                <button
                  onClick={() => toggleAddress(index)}
                  className="w-full px-6 py-4 flex items-start justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <h3
                        className="text-lg font-semibold"
                        style={{ color: safeTheme.colors.text.primary }}
                      >
                        {address.addressType || "Address"}{" "}
                        {address.isPrimary ? "(Primary)" : ""}
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: safeTheme.colors.text.secondary }}
                      >
                        {address.city || "N/A"}, {address.state || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {address.isPrimary ? (
                      <span className="px-3 py-1 rounded-full text-xs font-medium border border-green-200 bg-green-100 text-green-800">
                        Primary
                      </span>
                    ) : null}
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <InfoItem
                            label="Address Type"
                            value={address.addressType}
                            icon={MapPin}
                          />
                          <InfoItem label="City" value={address.city} />
                          <InfoItem label="State" value={address.state} />
                          <InfoItem label="Country" value={address.country} />
                          <InfoItem
                            label="Postal Code"
                            value={address.postalCode}
                          />
                          <InfoItem label="District" value={address.district} />
                          <InfoItem label="Street 1" value={address.street1} />
                          {address.street2 && (
                            <InfoItem
                              label="Street 2"
                              value={address.street2}
                            />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        ) : (
          <div
            className="border rounded-lg p-6 text-center"
            style={{
              backgroundColor: safeTheme.colors.card.background,
              borderColor: safeTheme.colors.card.border,
            }}
          >
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p
              className="text-sm font-medium"
              style={{ color: safeTheme.colors.text.secondary }}
            >
              No address information available
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BasicInfoViewTab;
