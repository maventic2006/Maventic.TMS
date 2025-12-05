import React, { useState } from "react";
import { Country, State, City } from "country-state-city";
import {
  MapPin,
  Building,
  ChevronDown,
  ChevronUp,
  FileText,
  Hash,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AddressViewTab = ({ warehouseData }) => {
  const [expandedSections, setExpandedSections] = useState({
    address: true,
  });

  // Helper function to display value or N/A
  const displayValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return <span className="text-gray-500 italic">N/A</span>;
    }
    return <span className="text-[#0D1A33] font-medium">{value}</span>;
  };

  // Helper function to get country name from ISO code
  const getCountryName = (isoCode) => {
    if (!isoCode) return null;
    const country = Country.getCountryByCode(isoCode);
    return country ? country.name : isoCode; // Fallback to code if not found
  };

  // Helper function to get state name from ISO code
  const getStateName = (countryCode, stateCode) => {
    if (!countryCode || !stateCode) return null;
    const state = State.getStateByCodeAndCountry(stateCode, countryCode);
    return state ? state.name : stateCode; // Fallback to code if not found
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const CollapsibleSection = ({ title, icon: Icon, sectionKey, children }) => {
    const isExpanded = expandedSections[sectionKey];

    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Icon className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
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
              <div className="px-6 py-4 border-t border-gray-200">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const address = warehouseData?.address || {};

  return (
    <div className="space-y-6 p-2">
      {/* Address Information Section */}
      <CollapsibleSection
        title="Address Information"
        icon={MapPin}
        sectionKey="address"
      >
        {address && Object.keys(address).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Address Type
              </label>
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-gray-400" />
                {displayValue(
                  address.address_type_name || address.address_type_id
                )}
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Street Address 1
              </label>
              {displayValue(address.street_1)}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Street Address 2
              </label>
              {displayValue(address.street_2)}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Country
              </label>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                {displayValue(
                  getCountryName(address.country) || address.country
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                State
              </label>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                {displayValue(
                  getStateName(address.country, address.state) || address.state
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                City
              </label>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                {displayValue(address.city)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                District
              </label>
              {displayValue(address.district)}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Postal Code
              </label>
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-gray-400" />
                {displayValue(address.postal_code)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                VAT Number
              </label>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-400" />
                {displayValue(address.vat_number)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Primary Address
              </label>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  address.is_primary
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {address.is_primary ? "Yes" : "No"}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">
              No address data available
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Address information will appear here once added
            </p>
          </div>
        )}
      </CollapsibleSection>
    </div>
  );
};

export default AddressViewTab;
