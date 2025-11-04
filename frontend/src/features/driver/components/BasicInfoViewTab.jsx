import React from "react";
import { User, Phone, Mail, Calendar, Droplet, MapPin } from "lucide-react";
import { getPageTheme } from "../../../theme.config";

const BasicInfoViewTab = ({ driver }) => {
  const theme = getPageTheme("tab") || {};

  // Ensure theme objects have required structure with defaults
  const safeTheme = {
    colors: {
      text: {
        primary: theme.colors?.text?.primary || "#111827",
        secondary: theme.colors?.text?.secondary || "#6B7280",
      },
    },
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

  return (
    <div className="space-y-8">
      <div>
        <h3
          className="text-lg font-semibold mb-4 flex items-center space-x-2"
          style={{ color: theme.colors.text.primary }}
        >
          <User className="h-5 w-5" />
          <span>Basic Information</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <InfoItem label="Full Name" value={driver.fullName} icon={User} />
          <InfoItem
            label="Date of Birth"
            value={driver.dateOfBirth}
            icon={Calendar}
          />
          <InfoItem label="Gender" value={driver.gender} />
          <InfoItem
            label="Blood Group"
            value={driver.bloodGroup}
            icon={Droplet}
          />
          <InfoItem
            label="Phone Number"
            value={driver.phoneNumber}
            icon={Phone}
          />
          <InfoItem label="Email" value={driver.emailId} icon={Mail} />
          <InfoItem label="WhatsApp Number" value={driver.whatsAppNumber} />
          <InfoItem
            label="Alternate Phone"
            value={driver.alternatePhoneNumber}
          />
          <InfoItem label="Average Rating" value={driver.avgRating} />
        </div>
      </div>

      <div>
        <h3
          className="text-lg font-semibold mb-4 flex items-center space-x-2"
          style={{ color: safeTheme.colors.text.primary }}
        >
          <MapPin className="h-5 w-5" />
          <span>Address Information</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoItem
            label="City"
            value={driver.addresses?.[0]?.city}
            icon={MapPin}
          />
          <InfoItem label="State" value={driver.addresses?.[0]?.state} />
          <InfoItem label="Country" value={driver.addresses?.[0]?.country} />
          <InfoItem
            label="Postal Code"
            value={driver.addresses?.[0]?.postalCode}
          />
          <InfoItem label="Street" value={driver.addresses?.[0]?.street1} />
          <InfoItem label="District" value={driver.addresses?.[0]?.district} />
        </div>
      </div>
    </div>
  );
};

export default BasicInfoViewTab;
