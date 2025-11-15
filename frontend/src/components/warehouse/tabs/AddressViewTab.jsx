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

const AddressViewTab = ({ warehouseData }) => {
  // Helper function to display value or N/A
  const displayValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return <span className="text-gray-500 italic">N/A</span>;
    }
    return <span className="text-[#0D1A33] font-medium">{value}</span>;
  };

  // Helper function to format operating hours
  const formatOperatingHours = (hours) => {
    if (!hours) return "N/A";
    return hours;
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Address Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  <Building className="inline h-4 w-4 mr-2" />
                  Street Address
                </label>
                <div className="bg-gray-50 rounded-lg p-3">
                  {displayValue(warehouseData?.address_line1)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Additional Address
                </label>
                <div className="bg-gray-50 rounded-lg p-3">
                  {displayValue(warehouseData?.address_line2)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    City
                  </label>
                  <div className="bg-gray-50 rounded-lg p-3">
                    {displayValue(warehouseData?.city)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Postal Code
                  </label>
                  <div className="bg-gray-50 rounded-lg p-3">
                    {displayValue(warehouseData?.postal_code)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    State
                  </label>
                  <div className="bg-gray-50 rounded-lg p-3">
                    {displayValue(warehouseData?.state)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Country
                  </label>
                  <div className="bg-gray-50 rounded-lg p-3">
                    {displayValue(warehouseData?.country)}
                  </div>
                </div>
              </div>
            </div>

            {/* Location & Coordinates */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  <Navigation className="inline h-4 w-4 mr-2" />
                  Latitude
                </label>
                <div className="bg-gray-50 rounded-lg p-3">
                  {displayValue(warehouseData?.latitude)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  <Navigation className="inline h-4 w-4 mr-2" />
                  Longitude
                </label>
                <div className="bg-gray-50 rounded-lg p-3">
                  {displayValue(warehouseData?.longitude)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Region
                </label>
                <div className="bg-gray-50 rounded-lg p-3">
                  {displayValue(warehouseData?.region)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Zone
                </label>
                <div className="bg-gray-50 rounded-lg p-3">
                  {displayValue(warehouseData?.zone)}
                </div>
              </div>

              {/* Map Integration Placeholder */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    Map Location
                  </span>
                </div>
                <p className="text-xs text-blue-600">
                  {warehouseData?.latitude && warehouseData?.longitude
                    ? `Coordinates: ${warehouseData.latitude}, ${warehouseData.longitude}`
                    : "Coordinates not available"}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                <Phone className="inline h-4 w-4 mr-2" />
                Primary Phone
              </label>
              <div className="bg-gray-50 rounded-lg p-3">
                {displayValue(warehouseData?.phone_number)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                <Phone className="inline h-4 w-4 mr-2" />
                Alternative Phone
              </label>
              <div className="bg-gray-50 rounded-lg p-3">
                {displayValue(warehouseData?.alt_phone_number)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                <Mail className="inline h-4 w-4 mr-2" />
                Email Address
              </label>
              <div className="bg-gray-50 rounded-lg p-3">
                {displayValue(warehouseData?.email)}
              </div>
            </div>
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
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Weekday Hours
              </label>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-[#0D1A33] font-medium">
                  {formatOperatingHours(
                    warehouseData?.weekday_hours ||
                      "Monday - Friday: 9:00 AM - 6:00 PM"
                  )}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Weekend Hours
              </label>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-[#0D1A33] font-medium">
                  {formatOperatingHours(
                    warehouseData?.weekend_hours ||
                      "Saturday - Sunday: 10:00 AM - 4:00 PM"
                  )}
                </p>
              </div>
            </div>
          </div>

          {warehouseData?.twenty_four_seven_ops && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                <span className="text-green-800 font-medium">
                  24/7 Operations Available
                </span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                This warehouse operates around the clock for critical shipments.
              </p>
            </div>
          )}
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
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Access Instructions
              </label>
              <div className="bg-gray-50 rounded-lg p-4 min-h-[100px]">
                {warehouseData?.access_instructions ? (
                  <p className="text-[#0D1A33] whitespace-pre-wrap">
                    {warehouseData.access_instructions}
                  </p>
                ) : (
                  <span className="text-gray-500 italic">
                    No specific access instructions provided
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Landmark Information
              </label>
              <div className="bg-gray-50 rounded-lg p-4 min-h-[100px]">
                {warehouseData?.landmarks ? (
                  <p className="text-[#0D1A33] whitespace-pre-wrap">
                    {warehouseData.landmarks}
                  </p>
                ) : (
                  <span className="text-gray-500 italic">
                    No landmark information provided
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressViewTab;
