import React, { useEffect } from "react";
import { User, Phone, Mail, Calendar, Droplet } from "lucide-react";
import { getPageTheme, getComponentTheme } from "../../../theme.config";

const BasicInfoTab = ({
  formData,
  onFormDataChange,
  validationErrors,
  onValidationErrorsChange,
  onTabErrorChange,
  masterData,
  isLoading,
}) => {
  const theme = getPageTheme("tab") || {};
  const inputTheme = getComponentTheme("formInput") || {};

  // Ensure theme objects have required structure with defaults
  const safeTheme = {
    colors: {
      text: {
        primary: theme.colors?.text?.primary || "#111827",
        secondary: theme.colors?.text?.secondary || "#6B7280",
      },
      status: {
        error: theme.colors?.status?.error || "#EF4444",
      },
      card: {
        border: theme.colors?.card?.border || "#E5E7EB",
      },
    },
  };

  const safeInputTheme = {
    default: {
      background: inputTheme.default?.background || "#FFFFFF",
      border: inputTheme.default?.border || "#D1D5DB",
    },
    error: {
      border: inputTheme.error?.border || "#EF4444",
    },
  };

  const basicInfo = formData.basicInfo || {};
  const addresses = formData.addresses || [];

  useEffect(() => {
    // Validate and update tab error state
    const hasErrors =
      !basicInfo.fullName || !basicInfo.phoneNumber || !basicInfo.dateOfBirth;
    onTabErrorChange(0, hasErrors);
  }, [basicInfo, onTabErrorChange]);

  const handleBasicInfoChange = (field, value) => {
    const updatedBasicInfo = {
      ...basicInfo,
      [field]: value,
    };
    onFormDataChange("basicInfo", updatedBasicInfo);
  };

  const handleAddressChange = (index, field, value) => {
    const updatedAddresses = [...addresses];
    updatedAddresses[index] = {
      ...updatedAddresses[index],
      [field]: value,
    };
    onFormDataChange("addresses", updatedAddresses);
  };

  const addAddress = () => {
    onFormDataChange("addresses", [
      ...addresses,
      {
        country: "",
        state: "",
        city: "",
        district: "",
        street1: "",
        street2: "",
        postalCode: "",
        isPrimary: false,
        addressTypeId: "",
      },
    ]);
  };

  const removeAddress = (index) => {
    const updatedAddresses = addresses.filter((_, i) => i !== index);
    onFormDataChange("addresses", updatedAddresses);
  };

  return (
    <div className="space-y-8">
      {/* Basic Information Section */}
      <div>
        <h3
          className="text-lg font-semibold mb-4 flex items-center space-x-2"
          style={{ color: safeTheme.colors.text.primary }}
        >
          <User className="h-5 w-5" />
          <span>Basic Information</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: safeTheme.colors.text.primary }}
            >
              Full Name{" "}
              <span style={{ color: safeTheme.colors.status.error }}>*</span>
            </label>
            <input
              type="text"
              value={basicInfo.fullName || ""}
              onChange={(e) =>
                handleBasicInfoChange("fullName", e.target.value)
              }
              placeholder="Enter full name"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all"
              style={{
                backgroundColor: safeInputTheme.default.background,
                borderColor: validationErrors.fullName
                  ? safeInputTheme.error.border
                  : safeInputTheme.default.border,
                color: safeTheme.colors.text.primary,
              }}
            />
            {validationErrors.fullName && (
              <p
                className="text-sm mt-1"
                style={{ color: safeTheme.colors.status.error }}
              >
                {validationErrors.fullName}
              </p>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: safeTheme.colors.text.primary }}
            >
              Date of Birth{" "}
              <span style={{ color: safeTheme.colors.status.error }}>*</span>
            </label>
            <div className="relative">
              <Calendar
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 pointer-events-none"
                style={{ color: safeTheme.colors.text.secondary }}
              />
              <input
                type="date"
                value={basicInfo.dateOfBirth || ""}
                onChange={(e) =>
                  handleBasicInfoChange("dateOfBirth", e.target.value)
                }
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                style={{
                  backgroundColor: safeInputTheme.default.background,
                  borderColor: validationErrors.dateOfBirth
                    ? safeInputTheme.error.border
                    : safeInputTheme.default.border,
                  color: safeTheme.colors.text.primary,
                }}
              />
            </div>
            {validationErrors.dateOfBirth && (
              <p
                className="text-sm mt-1"
                style={{ color: safeTheme.colors.status.error }}
              >
                {validationErrors.dateOfBirth}
              </p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: safeTheme.colors.text.primary }}
            >
              Gender
            </label>
            <select
              value={basicInfo.gender || ""}
              onChange={(e) => handleBasicInfoChange("gender", e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all"
              style={{
                backgroundColor: safeInputTheme.default.background,
                borderColor: safeInputTheme.default.border,
                color: safeTheme.colors.text.primary,
              }}
            >
              <option value="">Select Gender</option>
              {masterData?.genderOptions?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Blood Group */}
          <div>
            <label
              className="text-sm font-medium mb-2 flex items-center space-x-2"
              style={{ color: safeTheme.colors.text.primary }}
            >
              <Droplet className="h-4 w-4" />
              <span>Blood Group</span>
            </label>
            <select
              value={basicInfo.bloodGroup || ""}
              onChange={(e) =>
                handleBasicInfoChange("bloodGroup", e.target.value)
              }
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all"
              style={{
                backgroundColor: safeInputTheme.default.background,
                borderColor: safeInputTheme.default.border,
                color: safeTheme.colors.text.primary,
              }}
            >
              <option value="">Select Blood Group</option>
              {masterData?.bloodGroupOptions?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Phone Number */}
          <div>
            <label
              className="text-sm font-medium mb-2 flex items-center space-x-2"
              style={{ color: safeTheme.colors.text.primary }}
            >
              <Phone className="h-4 w-4" />
              <span>
                Phone Number{" "}
                <span style={{ color: safeTheme.colors.status.error }}>*</span>
              </span>
            </label>
            <input
              type="tel"
              value={basicInfo.phoneNumber || ""}
              onChange={(e) =>
                handleBasicInfoChange("phoneNumber", e.target.value)
              }
              placeholder="10-digit number (6-9 start)"
              maxLength="10"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all"
              style={{
                backgroundColor: safeInputTheme.default.background,
                borderColor: validationErrors.phoneNumber
                  ? safeInputTheme.error.border
                  : safeInputTheme.default.border,
                color: safeTheme.colors.text.primary,
              }}
            />
            {validationErrors.phoneNumber && (
              <p
                className="text-sm mt-1"
                style={{ color: safeTheme.colors.status.error }}
              >
                {validationErrors.phoneNumber}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              className="text-sm font-medium mb-2 flex items-center space-x-2"
              style={{ color: safeTheme.colors.text.primary }}
            >
              <Mail className="h-4 w-4" />
              <span>Email</span>
            </label>
            <input
              type="email"
              value={basicInfo.emailId || ""}
              onChange={(e) => handleBasicInfoChange("emailId", e.target.value)}
              placeholder="Enter email address"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all"
              style={{
                backgroundColor: safeInputTheme.default.background,
                borderColor: safeInputTheme.default.border,
                color: safeTheme.colors.text.primary,
              }}
            />
          </div>

          {/* WhatsApp Number */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: safeTheme.colors.text.primary }}
            >
              WhatsApp Number
            </label>
            <input
              type="tel"
              value={basicInfo.whatsAppNumber || ""}
              onChange={(e) =>
                handleBasicInfoChange("whatsAppNumber", e.target.value)
              }
              placeholder="10-digit number"
              maxLength="10"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all"
              style={{
                backgroundColor: safeInputTheme.default.background,
                borderColor: safeInputTheme.default.border,
                color: safeTheme.colors.text.primary,
              }}
            />
          </div>

          {/* Alternate Phone Number */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: safeTheme.colors.text.primary }}
            >
              Alternate Phone Number
            </label>
            <input
              type="tel"
              value={basicInfo.alternatePhoneNumber || ""}
              onChange={(e) =>
                handleBasicInfoChange("alternatePhoneNumber", e.target.value)
              }
              placeholder="10-digit number"
              maxLength="10"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all"
              style={{
                backgroundColor: safeInputTheme.default.background,
                borderColor: safeInputTheme.default.border,
                color: safeTheme.colors.text.primary,
              }}
            />
          </div>
        </div>
      </div>

      {/* Address Section - Coming Soon Placeholder */}
      <div>
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: safeTheme.colors.text.primary }}
        >
          Address Information
        </h3>
        <div
          className="border-2 border-dashed rounded-lg p-8 text-center"
          style={{
            borderColor: safeTheme.colors.card.border,
            backgroundColor: `${theme.colors.card.background}80`,
          }}
        >
          <p style={{ color: safeTheme.colors.text.secondary }}>
            Address management will be implemented next
          </p>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoTab;
