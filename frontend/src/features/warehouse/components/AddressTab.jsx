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

  useEffect(() => {
    if (formData.address.country) {
      const countryStates = State.getStatesOfCountry(formData.address.country);
      setStates(countryStates);
    }
  }, [formData.address.country]);

  useEffect(() => {
    if (formData.address.country && formData.address.state) {
      const stateCities = City.getCitiesOfState(
        formData.address.country,
        formData.address.state
      );
      setCities(stateCities);
    }
  }, [formData.address.country, formData.address.state]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));

    // Reset dependent fields
    if (field === "country") {
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          country: value,
          state: "",
          city: "",
        },
      }));
    } else if (field === "state") {
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
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
              value={formData.address.country}
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
              value={formData.address.state}
              onValueChange={(value) => handleChange("state", value)}
              options={states}
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option.isoCode}
              placeholder="Select state"
              disabled={!formData.address.country}
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
              value={formData.address.city}
              onValueChange={(value) => handleChange("city", value)}
              options={cities}
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option.name}
              placeholder="Select city"
              disabled={!formData.address.state}
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
              value={formData.address.district}
              onChange={(e) => handleChange("district", e.target.value)}
              placeholder="Enter district"
              className="w-full px-3 py-1.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-colors"
            />
          </div>

          {/* Street 1 */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#0D1A33]">
              Street Address 1 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.address.street1}
              onChange={(e) => handleChange("street1", e.target.value)}
              placeholder="Enter street address"
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

          {/* Street 2 */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#0D1A33]">
              Street Address 2
            </label>
            <input
              type="text"
              value={formData.address.street2}
              onChange={(e) => handleChange("street2", e.target.value)}
              placeholder="Enter additional address details"
              className="w-full px-3 py-1.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-colors"
            />
          </div>

          {/* Postal Code */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#0D1A33]">
              Postal Code (PIN)
            </label>
            <input
              type="text"
              value={formData.address.postalCode}
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

          {/* VAT Number - Mandatory */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#0D1A33]">
              VAT Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.address.vatNumber}
              onChange={(e) =>
                handleChange("vatNumber", e.target.value.toUpperCase())
              }
              placeholder="Enter VAT number"
              maxLength={20}
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
              8-20 alphanumeric characters
            </p>
          </div>

          {/* TIN/PAN - Optional */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#0D1A33]">
              TIN/PAN
            </label>
            <input
              type="text"
              value={formData.address.tinPan || ""}
              onChange={(e) =>
                handleChange("tinPan", e.target.value.toUpperCase())
              }
              placeholder="Enter TIN/PAN"
              maxLength={50}
              className="w-full px-3 py-1.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-colors"
            />
            <p className="text-xs text-gray-500">
              Tax Identification Number / Permanent Account Number
            </p>
          </div>

          {/* TAN - Optional */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#0D1A33]">
              TAN
            </label>
            <input
              type="text"
              value={formData.address.tan || ""}
              onChange={(e) =>
                handleChange("tan", e.target.value.toUpperCase())
              }
              placeholder="Enter TAN"
              maxLength={50}
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
              value={formData.address.addressType}
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
