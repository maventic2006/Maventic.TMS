import React, { useState, useEffect } from "react";
import { Country, State, City } from "country-state-city";
import {
  CustomSelect,
  GlobalDropdownProvider,
} from "../../../components/ui/Select";

const AddressTab = ({ formData, setFormData, errors, masterData }) => {
  const [countries] = useState(Country.getAllCountries());
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  // Safe navigation - ensure formData has the expected structure
  const address = formData?.address || {
    country: "",
    state: "",
    city: "",
    district: "",
    street1: "",
    street2: "",
    postalCode: "",
    vatNumber: "",
    tinPan: "",
    tan: "",
    addressType: "",
  };

  useEffect(() => {
    if (address.country) {
      const countryStates = State.getStatesOfCountry(address.country);
      setStates(countryStates);
    }
  }, [address.country]);

  useEffect(() => {
    if (address.country && address.state) {
      const stateCities = City.getCitiesOfState(address.country, address.state);
      setCities(stateCities);
    }
  }, [address.country, address.state]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...(prev?.address || {}),
        [field]: value,
      },
    }));

    // Reset dependent fields
    if (field === "country") {
      setFormData((prev) => ({
        ...prev,
        address: {
          ...(prev?.address || {}),
          country: value,
          state: "",
          city: "",
        },
      }));
    } else if (field === "state") {
      setFormData((prev) => ({
        ...prev,
        address: {
          ...(prev?.address || {}),
          state: value,
          city: "",
        },
      }));
    }
  };

  return (
    <GlobalDropdownProvider>
      <div className="bg-white rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Country */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#0D1A33]">
              Country <span className="text-red-500">*</span>
            </label>
            <CustomSelect
              value={address.country || ""}
              onValueChange={(value) => handleChange("country", value)}
              options={countries}
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option.isoCode}
              placeholder="Select country"
              error={errors?.["address.country"]}
              required
              searchable
            />
            {errors?.["address.country"] && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                ⚠️ {errors["address.country"]}
              </p>
            )}
          </div>

          {/* State */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#0D1A33]">
              State <span className="text-red-500">*</span>
            </label>
            <CustomSelect
              value={address.state || ""}
              onValueChange={(value) => handleChange("state", value)}
              options={states}
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option.isoCode}
              placeholder="Select state"
              disabled={!address.country}
              error={errors?.["address.state"]}
              required
              searchable
            />
            {errors?.["address.state"] && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                ⚠️ {errors["address.state"]}
              </p>
            )}
          </div>

          {/* City */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#0D1A33]">
              City <span className="text-red-500">*</span>
            </label>
            <CustomSelect
              value={address.city || ""}
              onValueChange={(value) => handleChange("city", value)}
              options={cities}
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option.name}
              placeholder="Select city"
              disabled={!address.state}
              error={errors?.["address.city"]}
              required
              searchable
            />
            {errors?.["address.city"] && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                ⚠️ {errors["address.city"]}
              </p>
            )}
          </div>

          {/* District */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#0D1A33]">
              District
            </label>
            <input
              type="text"
              value={address.district || ""}
              onChange={(e) => handleChange("district", e.target.value)}
              placeholder="Enter district"
              maxLength={30}
              className="w-full px-3 py-1.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-colors"
            />
          </div>

          {/* Street 1 - Mandatory */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#0D1A33]">
              Street 1 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={address.street1 || ""}
              onChange={(e) => handleChange("street1", e.target.value)}
              placeholder="Enter street 1"
              maxLength={50}
              className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 transition-colors ${
                errors?.["address.street1"]
                  ? "border-red-500 focus:border-red-500"
                  : "border-[#E5E7EB] focus:border-[#3B82F6]"
              }`}
            />
            {errors?.["address.street1"] && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                ⚠️ {errors["address.street1"]}
              </p>
            )}
          </div>

          {/* Street 2 - Optional */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#0D1A33]">
              Street 2
            </label>
            <input
              type="text"
              value={address.street2 || ""}
              onChange={(e) => handleChange("street2", e.target.value)}
              placeholder="Enter street 2"
              maxLength={50}
              className="w-full px-3 py-1.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-colors"
            />
          </div>

          {/* Postal Code - Mandatory */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#0D1A33]">
              Postal Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              max={6}
              value={address.postalCode || ""}
              onChange={(e) => handleChange("postalCode", e.target.value)}
              placeholder="Enter postal code"
              maxLength={6}
              className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 transition-colors ${
                errors?.["address.postalCode"]
                  ? "border-red-500 focus:border-red-500"
                  : "border-[#E5E7EB] focus:border-[#3B82F6]"
              }`}
            />
            {errors?.["address.postalCode"] && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                ⚠️ {errors["address.postalCode"]}
              </p>
            )}
          </div>

          {/* VAT Number - Mandatory, Auto-generate from state & other info */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#0D1A33]">
              VAT Number (GST) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={address.vatNumber || ""}
              onChange={(e) =>
                handleChange(
                  "vatNumber",
                  e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()
                )
              }
              placeholder="Enter VAT/GST number"
              maxLength={15}
              className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 transition-colors ${
                errors?.["address.vatNumber"]
                  ? "border-red-500 focus:border-red-500"
                  : "border-[#E5E7EB] focus:border-[#3B82F6]"
              }`}
            />
            {errors?.["address.vatNumber"] && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                ⚠️ {errors["address.vatNumber"]}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Format: 15 alphanumeric characters (auto-uppercase, special
              characters stripped)
            </p>
          </div>

          {/* TIN/PAN - Optional */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#0D1A33]">
              TIN/PAN
            </label>
            <input
              type="text"
              value={address.tinPan || ""}
              onChange={(e) => handleChange("tinPan", e.target.value)}
              placeholder="Enter TIN/PAN number"
              maxLength={15}
              className="w-full px-3 py-1.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-colors"
            />
            <p className="text-xs text-gray-500">
              Tax Identification Number (TIN) / Permanent Account Number (PAN)
            </p>
          </div>

          {/* TAN - Optional */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#0D1A33]">
              TAN
            </label>
            <input
              type="text"
              value={address.tan || ""}
              onChange={(e) => handleChange("tan", e.target.value)}
              placeholder="Enter TAN number"
              maxLength={15}
              className="w-full px-3 py-1.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-colors"
            />
            <p className="text-xs text-gray-500">
              Tax Deduction and Collection Account Number
            </p>
          </div>

          {/* Address Type - Mandatory */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#0D1A33]">
              Address Type <span className="text-red-500">*</span>
            </label>
            <CustomSelect
              value={address.addressType || ""}
              onValueChange={(value) => handleChange("addressType", value)}
              options={masterData?.addressTypes || []}
              getOptionLabel={(option) => option.address}
              getOptionValue={(option) => option.address_type_id}
              placeholder="Select address type"
              error={errors?.["address.addressType"]}
              required
              searchable
            />
            {errors?.["address.addressType"] && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                ⚠️ {errors["address.addressType"]}
              </p>
            )}
          </div>
        </div>
      </div>
    </GlobalDropdownProvider>
  );
};

export default AddressTab;
