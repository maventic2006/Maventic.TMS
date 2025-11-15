import React from "react";
import {
  MapPin,
  Navigation,
  Globe,
  Mail,
  Phone,
  Clock,
  Building,
} from "lucide-react";

const AddressEditTab = ({ formData, onInputChange, validationErrors = {} }) => {
  // Helper function to get field error
  const getFieldError = (fieldPath) => {
    return validationErrors[fieldPath];
  };

  // Helper function to render input with error
  const renderInput = (
    name,
    label,
    type = "text",
    placeholder = "",
    icon = null,
    required = false
  ) => {
    const error = getFieldError(name);

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {icon && <span className="mr-2">{icon}</span>}
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative">
          <input
            type={type}
            name={name}
            value={formData[name] || ""}
            onChange={onInputChange}
            placeholder={placeholder}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              error
                ? "border-red-500 bg-red-50"
                : "border-gray-300 focus:border-blue-500"
            }`}
          />
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  };

  // Helper function to render textarea with error
  const renderTextarea = (
    name,
    label,
    placeholder = "",
    rows = 3,
    icon = null
  ) => {
    const error = getFieldError(name);

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {icon && <span className="mr-2">{icon}</span>}
          {label}
        </label>
        <div className="relative">
          <textarea
            name={name}
            value={formData[name] || ""}
            onChange={onInputChange}
            placeholder={placeholder}
            rows={rows}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical ${
              error
                ? "border-red-500 bg-red-50"
                : "border-gray-300 focus:border-blue-500"
            }`}
          />
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Primary Address Information */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MapPin className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Primary Address
            </h3>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Address Fields */}
            <div className="space-y-4">
              {renderTextarea(
                "address_line1",
                "Street Address",
                "Enter street address, building number, etc.",
                2,
                <Building className="h-4 w-4 text-gray-400" />
              )}

              {renderTextarea(
                "address_line2",
                "Additional Address",
                "Enter additional address information (optional)",
                2
              )}

              <div className="grid grid-cols-2 gap-4">
                {renderInput("city", "City", "text", "Enter city", null, true)}

                {renderInput(
                  "postal_code",
                  "Postal Code",
                  "text",
                  "Enter postal/ZIP code"
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {renderInput(
                  "state",
                  "State",
                  "text",
                  "Enter state/province",
                  null,
                  true
                )}

                {renderInput(
                  "country",
                  "Country",
                  "text",
                  "Enter country",
                  null,
                  true
                )}
              </div>
            </div>

            {/* Location & Coordinates */}
            <div className="space-y-4">
              {renderInput(
                "latitude",
                "Latitude",
                "number",
                "e.g., 28.6139",
                <Navigation className="h-4 w-4 text-gray-400" />
              )}

              {renderInput(
                "longitude",
                "Longitude",
                "number",
                "e.g., 77.2090",
                <Navigation className="h-4 w-4 text-gray-400" />
              )}

              {renderInput("region", "Region", "text", "Enter region")}

              {renderInput("zone", "Zone", "text", "Enter zone")}

              {/* GPS Coordinates Helper */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    GPS Coordinates
                  </span>
                </div>
                <p className="text-xs text-blue-600">
                  Enter precise latitude and longitude for accurate location
                  mapping. You can use Google Maps to find exact coordinates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Phone className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Contact Information
            </h3>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {renderInput(
              "phone_number",
              "Primary Phone",
              "tel",
              "Enter primary phone number",
              <Phone className="h-4 w-4 text-gray-400" />
            )}

            {renderInput(
              "alt_phone_number",
              "Alternative Phone",
              "tel",
              "Enter alternative phone number",
              <Phone className="h-4 w-4 text-gray-400" />
            )}

            {renderInput(
              "email",
              "Email Address",
              "email",
              "Enter email address",
              <Mail className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Operating Hours */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Operating Hours
            </h3>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderInput(
              "weekday_hours",
              "Weekday Hours",
              "text",
              "e.g., Monday - Friday: 9:00 AM - 6:00 PM",
              <Clock className="h-4 w-4 text-gray-400" />
            )}

            {renderInput(
              "weekend_hours",
              "Weekend Hours",
              "text",
              "e.g., Saturday - Sunday: 10:00 AM - 4:00 PM",
              <Clock className="h-4 w-4 text-gray-400" />
            )}
          </div>

          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Operating Hours Format
              </span>
            </div>
            <p className="text-xs text-blue-600">
              Use 12-hour format with AM/PM. For 24/7 operations, check the
              "24/7 Operations" checkbox in the Facilities tab.
            </p>
          </div>
        </div>
      </div>

      {/* Additional Location Details */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Building className="h-5 w-5 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Additional Details
            </h3>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderTextarea(
              "access_instructions",
              "Access Instructions",
              "Provide detailed instructions for accessing the warehouse...",
              4
            )}

            {renderTextarea(
              "landmarks",
              "Landmark Information",
              "Describe nearby landmarks, notable buildings, or reference points...",
              4
            )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="p-1 bg-blue-100 rounded">
            <MapPin className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-800 mb-1">
              Address Guidelines
            </h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Fields marked with * are required</li>
              <li>• Provide complete and accurate address information</li>
              <li>• GPS coordinates help with precise location mapping</li>
              <li>
                • Include clear access instructions for drivers and visitors
              </li>
              <li>
                • Contact information should be for the warehouse facility
                directly
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressEditTab;
