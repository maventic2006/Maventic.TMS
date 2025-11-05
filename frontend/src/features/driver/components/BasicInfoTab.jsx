import React from "react";
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

const BasicInfoTab = ({
  formData,
  setFormData,
  errors = {},
  masterData,
  isLoading,
}) => {
  const basicInfo = formData?.basicInfo || {};
  const addresses = formData?.addresses || [];

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
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-gray-800">
          <User className="h-5 w-5" />
          <span>Basic Information</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={basicInfo.fullName || ""}
              onChange={(e) =>
                handleBasicInfoChange("fullName", e.target.value)
              }
              placeholder="Enter full name"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${"$"}{
                errors?.fullName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors?.fullName && (
              <p className="text-sm mt-1 text-red-500">{errors.fullName}</p>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
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
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${"$"}{
                  errors?.dateOfBirth ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>
            {errors?.dateOfBirth && (
              <p className="text-sm mt-1 text-red-500">{errors.dateOfBirth}</p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Gender
            </label>
            <select
              value={basicInfo.gender || ""}
              onChange={(e) => handleBasicInfoChange("gender", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
            >
              <option value="">Select Gender</option>
              {masterData?.genders?.map((gender) => (
                <option key={gender.gender_id} value={gender.gender_name}>
                  {gender.gender_name}
                </option>
              ))}
            </select>
          </div>

          {/* Blood Group */}
          <div>
            <label className="text-sm font-medium mb-2 flex items-center space-x-2 text-gray-700">
              <Droplet className="h-4 w-4" />
              <span>Blood Group</span>
            </label>
            <select
              value={basicInfo.bloodGroup || ""}
              onChange={(e) =>
                handleBasicInfoChange("bloodGroup", e.target.value)
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
            >
              <option value="">Select Blood Group</option>
              {masterData?.bloodGroups?.map((bg) => (
                <option key={bg.blood_group_id} value={bg.blood_group_name}>
                  {bg.blood_group_name}
                </option>
              ))}
            </select>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
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
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${"$"}{
                  errors?.phoneNumber ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>
            {errors?.phoneNumber && (
              <p className="text-sm mt-1 text-red-500">{errors.phoneNumber}</p>
            )}
          </div>

          {/* Email ID */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
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
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${"$"}{
                  errors?.emailId ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>
            {errors?.emailId && (
              <p className="text-sm mt-1 text-red-500">{errors.emailId}</p>
            )}
          </div>

          {/* WhatsApp Number */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              WhatsApp Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 pointer-events-none text-gray-400" />
              <input
                type="tel"
                value={basicInfo.whatsAppNumber || ""}
                onChange={(e) =>
                  handleBasicInfoChange("whatsAppNumber", e.target.value)
                }
                placeholder="10-digit WhatsApp number"
                maxLength="10"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
              />
            </div>
          </div>

          {/* Alternate Phone Number */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
              />
            </div>
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
              className="bg-[#10B981] text-white h-9 px-3 rounded-lg flex items-center gap-2 text-sm hover:bg-[#059669] transition-colors"
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
                      <th className="pb-3 pl-4 min-w-[200px]">Address Type</th>
                      <th className="pb-3 pl-4 min-w-[200px]">Country</th>
                      <th className="pb-3 pl-4 min-w-[200px]">State</th>
                      <th className="pb-3 pl-4 min-w-[200px]">City</th>
                      <th className="pb-3 pl-4 min-w-[200px]">District</th>
                      <th className="pb-3 pl-4 min-w-[200px]">Street 1</th>
                      <th className="pb-3 pl-4 min-w-[200px]">Street 2</th>
                      <th className="pb-3 min-w-[150px]">Postal Code</th>
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
                          <select
                            value={address.addressTypeId || ""}
                            onChange={(e) =>
                              handleAddressChange(
                                index,
                                "addressTypeId",
                                e.target.value
                              )
                            }
                            className="min-w-[200px] px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs"
                          >
                            <option value="">Select</option>
                            {masterData?.addressTypes?.map((type) => (
                              <option
                                key={type.address_type_id}
                                value={type.address_type_id}
                              >
                                {type.address_type_name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3">
                          <select
                            value={address.country || ""}
                            onChange={(e) =>
                              handleAddressChange(
                                index,
                                "country",
                                e.target.value
                              )
                            }
                            className="min-w-[200px] px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs"
                          >
                            <option value="">Select</option>
                            {masterData?.countries?.map((country) => (
                              <option
                                key={country.isoCode}
                                value={country.isoCode}
                              >
                                {country.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3">
                          <input
                            type="text"
                            value={address.state || ""}
                            onChange={(e) =>
                              handleAddressChange(
                                index,
                                "state",
                                e.target.value
                              )
                            }
                            placeholder="Enter state"
                            className="min-w-[200px] px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs"
                          />
                        </td>
                        <td className="px-3">
                          <input
                            type="text"
                            value={address.city || ""}
                            onChange={(e) =>
                              handleAddressChange(index, "city", e.target.value)
                            }
                            placeholder="Enter city"
                            className="min-w-[200px] px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs"
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
                            value={address.postalCode || ""}
                            onChange={(e) =>
                              handleAddressChange(
                                index,
                                "postalCode",
                                e.target.value
                              )
                            }
                            placeholder="Enter postal code"
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
                <p className="text-sm">Click "Add" to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoTab;
