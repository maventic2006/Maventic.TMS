import React, { useState, useMemo } from "react";
import {
  User,
  Phone,
  Mail,
  Calendar,
  Droplet,
  MapPin,
  Plus,
  X,
} from "lucide-react";
import { CustomSelect } from "../../../components/ui/Select";
import { Country, State, City } from "country-state-city";

const BasicInfoTab = ({
  formData,
  setFormData,
  errors = {},
  masterData,
  isLoading,
}) => {
  const basicInfo = formData?.basicInfo || {};
  const addresses = formData?.addresses || [];

  // Get all countries
  const allCountries = useMemo(() => {
    return Country.getAllCountries().map((country) => ({
      code: country.isoCode,
      name: country.name,
    }));
  }, []);

  // Get states for a specific country
  const getStatesForCountry = (countryCode) => {
    if (!countryCode) return [];
    return State.getStatesOfCountry(countryCode).map((state) => ({
      code: state.isoCode,
      name: state.name,
    }));
  };

  // Get cities for a specific state in a country
  const getCitiesForState = (countryCode, stateCode) => {
    if (!countryCode || !stateCode) return [];
    return City.getCitiesOfState(countryCode, stateCode).map((city) => ({
      name: city.name,
    }));
  };

  const handleBasicInfoChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      basicInfo: {
        ...prev.basicInfo,
        [field]: value,
      },
    }));
  };

  const handleAddressChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedAddresses = [...prev.addresses];
      updatedAddresses[index] = {
        ...updatedAddresses[index],
        [field]: value,
      };

      // Clear dependent fields when country changes
      if (field === "country") {
        updatedAddresses[index].state = "";
        updatedAddresses[index].city = "";
      }

      // Clear city when state changes
      if (field === "state") {
        updatedAddresses[index].city = "";
      }

      return {
        ...prev,
        addresses: updatedAddresses,
      };
    });
  };

  const addAddress = () => {
    setFormData((prev) => ({
      ...prev,
      addresses: [
        ...prev.addresses,
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
      ],
    }));
  };

  const removeAddress = (index) => {
    setFormData((prev) => ({
      ...prev,
      addresses: prev.addresses.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-8">
      {/* Basic Information Section */}
      <div>
        {/* <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-gray-800">
          <User className="h-5 w-5" />
          <span>Basic Information</span>
        </h3> */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-medium mb-2 text-gray-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={basicInfo.fullName || ""}
              onChange={(e) =>
                handleBasicInfoChange("fullName", e.target.value)
              }
              placeholder="Enter full name"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-xs ${
                errors?.fullName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors?.fullName && (
              <p className="text-xs mt-1 text-red-500">{errors.fullName}</p>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-xs font-medium mb-2 text-gray-700">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 pointer-events-none text-gray-400" />
              <input
                type="date"
                value={basicInfo.dateOfBirth || ""}
                onChange={(e) =>
                  handleBasicInfoChange("dateOfBirth", e.target.value)
                }
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-xs ${
                  errors?.dateOfBirth ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>
            {errors?.dateOfBirth && (
              <p className="text-xs mt-1 text-red-500">{errors.dateOfBirth}</p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Gender
            </label>
            <CustomSelect
              value={basicInfo.gender || ""}
              onValueChange={(value) => handleBasicInfoChange("gender", value)}
              options={masterData?.genderOptions || []}
              placeholder="Select Gender"
              getOptionLabel={(option) => option.label}
              getOptionValue={(option) => option.value}
              className="w-full text-sm"
            />
          </div>

          {/* Blood Group */}
          <div>
            <label className="text-sm font-medium mb-2 flex items-center space-x-2 text-gray-700">
              <Droplet className="h-4 w-4" />
              <span>Blood Group</span>
            </label>
            <CustomSelect
              value={basicInfo.bloodGroup || ""}
              onValueChange={(value) =>
                handleBasicInfoChange("bloodGroup", value)
              }
              options={masterData?.bloodGroupOptions || []}
              placeholder="Select Blood Group"
              getOptionLabel={(option) => option.label}
              getOptionValue={(option) => option.value}
              className="w-full text-sm"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-medium mb-2 text-gray-700">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 pointer-events-none text-gray-400" />
              <input
                type="tel"
                value={basicInfo.phoneNumber || ""}
                onChange={(e) =>
                  handleBasicInfoChange("phoneNumber", e.target.value)
                }
                placeholder="10-digit phone number"
                maxLength="10"
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-xs ${
                  errors?.phoneNumber ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>
            {errors?.phoneNumber && (
              <p className="text-xs mt-1 text-red-500">{errors.phoneNumber}</p>
            )}
          </div>

          {/* Email ID */}
          <div>
            <label className="block text-xs font-medium mb-2 text-gray-700">
              Email ID
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 pointer-events-none text-gray-400" />
              <input
                type="email"
                value={basicInfo.emailId || ""}
                onChange={(e) =>
                  handleBasicInfoChange("emailId", e.target.value)
                }
                placeholder="email@example.com"
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-xs ${
                  errors?.emailId ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>
            {errors?.emailId && (
              <p className="text-xs mt-1 text-red-500">{errors.emailId}</p>
            )}
          </div>

          {/* Alternate Phone Number */}
          <div>
            <label className="block text-xs font-medium mb-2 text-gray-700">
              Alternate Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 pointer-events-none text-gray-400" />
              <input
                type="tel"
                value={basicInfo.alternatePhoneNumber || ""}
                onChange={(e) =>
                  handleBasicInfoChange("alternatePhoneNumber", e.target.value)
                }
                placeholder="10-digit alternate number"
                maxLength="10"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-xs"
              />
            </div>
          </div>

          {/* Emergency Contact Number */}
          <div>
            <label className="block text-xs font-medium mb-2 text-gray-700">
              Emergency Contact Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 pointer-events-none text-gray-400" />
              <input
                type="tel"
                value={basicInfo.emergencyContact || ""}
                onChange={(e) =>
                  handleBasicInfoChange("emergencyContact", e.target.value)
                }
                placeholder="10-digit emergency contact"
                maxLength="10"
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-xs ${
                  errors?.emergencyContact
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
            </div>
            {errors?.emergencyContact && (
              <p className="text-xs mt-1 text-red-500">
                {errors.emergencyContact}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Address Section */}
      <div>
        <div className="bg-white rounded-lg shadow-sm">
          <div className="bg-[#0D1A33] text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <h2 className="text-lg font-bold">Address Information</h2>
            </div>
            <button
              type="button"
              onClick={addAddress}
              className="bg-[#10B981] text-white h-9 px-3 rounded-lg flex items-center gap-2 text-xs hover:bg-[#059669] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          <div className="p-6">
            {addresses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="text-left text-xs font-medium text-gray-600 border-b border-gray-200">
                      <th className="pb-3 w-12">Primary</th>
                      <th className="pb-3 pl-4 min-w-[200px]">
                        Address Type <span className="text-red-500">*</span>
                      </th>
                      <th className="pb-3 pl-4 min-w-[200px]">
                        Country <span className="text-red-500">*</span>
                      </th>
                      <th className="pb-3 pl-4 min-w-[200px]">
                        State <span className="text-red-500">*</span>
                      </th>
                      <th className="pb-3 pl-4 min-w-[200px]">
                        City <span className="text-red-500">*</span>
                      </th>
                      <th className="pb-3 pl-4 min-w-[200px]">District</th>
                      <th className="pb-3 pl-4 min-w-[200px]">Street 1</th>
                      <th className="pb-3 pl-4 min-w-[200px]">Street 2</th>
                      <th className="pb-3 pl-4 min-w-[200px]">
                        PIN <span className="text-red-500">*</span>
                      </th>
                      <th className="pb-3 w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {addresses.map((address, index) => (
                      <tr
                        key={index}
                        className="bg-white border-b border-gray-100"
                        style={{ height: "60px" }}
                      >
                        <td className="px-3">
                          <input
                            type="radio"
                            name="primaryAddress"
                            checked={address.isPrimary || false}
                            onChange={(e) =>
                              handleAddressChange(
                                index,
                                "isPrimary",
                                e.target.checked
                              )
                            }
                            className="w-4 h-4 text-green-500 focus:ring-green-500"
                          />
                        </td>
                        <td className="px-3">
                          <CustomSelect
                            value={address.addressTypeId || ""}
                            onValueChange={(value) =>
                              handleAddressChange(index, "addressTypeId", value)
                            }
                            options={masterData?.addressTypes || []}
                            placeholder="Select"
                            getOptionLabel={(option) => option.label}
                            getOptionValue={(option) => option.value}
                            className="min-w-[200px] text-xs"
                          />
                        </td>
                        <td className="px-3">
                          <CustomSelect
                            value={address.country || ""}
                            onValueChange={(value) =>
                              handleAddressChange(index, "country", value)
                            }
                            options={allCountries}
                            placeholder="Select"
                            searchable
                            getOptionLabel={(option) => option.name}
                            getOptionValue={(option) => option.code}
                            className="min-w-[200px] text-xs"
                          />
                        </td>
                        <td className="px-3">
                          <CustomSelect
                            value={address.state || ""}
                            onValueChange={(value) =>
                              handleAddressChange(index, "state", value)
                            }
                            options={getStatesForCountry(address.country)}
                            placeholder="Select"
                            searchable
                            getOptionLabel={(option) => option.name}
                            getOptionValue={(option) => option.code}
                            className="min-w-[200px] text-xs"
                            disabled={!address.country}
                          />
                        </td>
                        <td className="px-3">
                          <CustomSelect
                            value={address.city || ""}
                            onValueChange={(value) =>
                              handleAddressChange(index, "city", value)
                            }
                            options={getCitiesForState(
                              address.country,
                              address.state
                            )}
                            placeholder="Select"
                            searchable
                            getOptionLabel={(option) => option.name}
                            getOptionValue={(option) => option.name}
                            className="min-w-[200px] text-xs"
                            disabled={!address.state}
                          />
                        </td>
                        <td className="px-3">
                          <input
                            type="text"
                            value={address.district || ""}
                            onChange={(e) =>
                              handleAddressChange(
                                index,
                                "district",
                                e.target.value
                              )
                            }
                            placeholder="Enter district"
                            className="min-w-[200px] px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs"
                          />
                        </td>
                        <td className="px-3">
                          <input
                            type="text"
                            value={address.street1 || ""}
                            onChange={(e) =>
                              handleAddressChange(
                                index,
                                "street1",
                                e.target.value
                              )
                            }
                            placeholder="Enter street 1"
                            className="min-w-[200px] px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs"
                          />
                        </td>
                        <td className="px-3">
                          <input
                            type="text"
                            value={address.street2 || ""}
                            onChange={(e) =>
                              handleAddressChange(
                                index,
                                "street2",
                                e.target.value
                              )
                            }
                            placeholder="Enter street 2"
                            className="min-w-[200px] px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs"
                          />
                        </td>
                        <td className="px-3">
                          <input
                            type="text"
                            maxLength={6}
                            value={address.postalCode || ""}
                            onChange={(e) =>
                              handleAddressChange(
                                index,
                                "postalCode",
                                e.target.value
                              )
                            }
                            placeholder="Enter PIN"
                            className="min-w-[150px] px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs"
                          />
                        </td>
                        <td className="px-3">
                          {addresses.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeAddress(index)}
                              disabled={addresses.length === 1}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No addresses added yet</p>
                <p className="text-xs">Click "Add" to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoTab;
