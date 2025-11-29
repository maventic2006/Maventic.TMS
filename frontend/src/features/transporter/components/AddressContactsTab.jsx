import React, { useState, useEffect } from "react";
import { MapPin, Phone, Plus, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Country, State, City } from "country-state-city";
import { CustomSelect } from "../../../components/ui/Select";

const AddressContactsTab = ({ formData, setFormData, errors = {} }) => {
  const dispatch = useDispatch();
  const { masterData } = useSelector((state) => state.transporter);

  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);

  // Get all countries from country-state-city package
  const allCountries = Country.getAllCountries();

  // Debug: Log countries data
  useEffect(() => {
    console.log("📍 Available countries:", allCountries.length);
    if (allCountries.length > 0) {
      console.log("📍 Sample country:", allCountries[0]);
    }
  }, []);

  const addresses = formData.addresses || [];
  const selectedAddress = addresses[selectedAddressIndex];
  const contacts = selectedAddress?.contacts || [];

  // Initialize with at least one address if none exist
  useEffect(() => {
    if (addresses.length === 0) {
      addAddress();
    }
  }, []);

  // Ensure single address is primary by default
  useEffect(() => {
    if (addresses.length === 1 && !addresses[0].isPrimary) {
      updateAddress(0, "isPrimary", true);
    }
  }, [addresses.length]);

  const addAddress = () => {
    const newAddress = {
      vatNumber: "",
      country: "",
      state: "",
      city: "",
      district: "",
      street1: "",
      street2: "",
      postalCode: "",
      isPrimary: addresses.length === 0, // Automatically primary if it's the first address
      addressType: "",
      contacts: [],
    };

    const updatedAddresses = [...addresses, newAddress];
    setFormData((prev) => ({
      ...prev,
      addresses: updatedAddresses,
    }));

    setSelectedAddressIndex(addresses.length);
  };

  const removeAddress = (index) => {
    if (addresses.length <= 1) return;

    const updatedAddresses = addresses.filter((_, i) => i !== index);

    // If only one address remains, make it primary
    if (updatedAddresses.length === 1) {
      updatedAddresses[0].isPrimary = true;
    }

    let newSelectedIndex = selectedAddressIndex;
    if (index === selectedAddressIndex) {
      newSelectedIndex = Math.max(0, selectedAddressIndex - 1);
    } else if (index < selectedAddressIndex) {
      newSelectedIndex = selectedAddressIndex - 1;
    }

    setFormData((prev) => ({
      ...prev,
      addresses: updatedAddresses,
    }));

    setSelectedAddressIndex(newSelectedIndex);
  };

  const updateAddress = (index, field, value) => {
    const updatedAddresses = [...addresses];

    // Handle primary address logic - only one can be primary
    if (field === "isPrimary" && value === true) {
      // Set all other addresses to not primary
      updatedAddresses.forEach((address, i) => {
        if (i !== index) {
          address.isPrimary = false;
        }
      });
    }

    updatedAddresses[index] = {
      ...updatedAddresses[index],
      [field]: value,
    };

    if (field === "country") {
      updatedAddresses[index].state = "";
      updatedAddresses[index].city = "";
    }

    if (field === "state") {
      updatedAddresses[index].city = "";
    }

    setFormData((prev) => ({
      ...prev,
      addresses: updatedAddresses,
    }));
  };

  const addContact = () => {
    if (!selectedAddress) return;

    const newContact = {
      name: "",
      role: "",
      phoneNumber: "",
      alternatePhoneNumber: "",
      email: "",
      alternateEmail: "",
      whatsappNumber: "",
    };

    const updatedAddresses = [...addresses];
    updatedAddresses[selectedAddressIndex] = {
      ...updatedAddresses[selectedAddressIndex],
      contacts: [
        ...(updatedAddresses[selectedAddressIndex].contacts || []),
        newContact,
      ],
    };

    setFormData((prev) => ({
      ...prev,
      addresses: updatedAddresses,
    }));
  };

  const removeContact = (contactIndex) => {
    const updatedAddresses = [...addresses];
    updatedAddresses[selectedAddressIndex] = {
      ...updatedAddresses[selectedAddressIndex],
      contacts: updatedAddresses[selectedAddressIndex].contacts.filter(
        (_, i) => i !== contactIndex
      ),
    };

    setFormData((prev) => ({
      ...prev,
      addresses: updatedAddresses,
    }));
  };

  const updateContact = (contactIndex, field, value) => {
    const updatedAddresses = [...addresses];
    const updatedContacts = [
      ...updatedAddresses[selectedAddressIndex].contacts,
    ];
    updatedContacts[contactIndex] = {
      ...updatedContacts[contactIndex],
      [field]: value,
    };
    updatedAddresses[selectedAddressIndex] = {
      ...updatedAddresses[selectedAddressIndex],
      contacts: updatedContacts,
    };

    setFormData((prev) => ({
      ...prev,
      addresses: updatedAddresses,
    }));
  };

  const getStatesForCountry = (countryName) => {
    if (!countryName) return [];
    // Find country by name and get its isoCode
    const country = allCountries.find((c) => c.name === countryName);
    if (!country) return [];
    return State.getStatesOfCountry(country.isoCode);
  };

  const getCitiesForCountryState = (countryName, stateName) => {
    if (!countryName || !stateName) return [];
    // Find country and state by name
    const country = allCountries.find((c) => c.name === countryName);
    if (!country) return [];
    const states = State.getStatesOfCountry(country.isoCode);
    const state = states.find((s) => s.name === stateName);
    if (!state) return [];
    return City.getCitiesOfState(country.isoCode, state.isoCode);
  };

  return (
    <div className="">
      <div className="grid grid-cols-1 gap-4">
        {/* Address Section */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="bg-[#0D1A33] text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <h2 className="text-lg font-bold">Transporter's Addresses</h2>
            </div>
            <button
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
                      <th className="pb-3 w-12"></th>
                      <th className="pb-3 pl-4 min-w-[200px]">VAT Number</th>
                      <th className="pb-3 pl-4 min-w-[200px]">Country</th>
                      <th className="pb-3 pl-4 min-w-[200px]">State</th>
                      <th className="pb-3 pl-4 min-w-[200px]">City</th>
                      <th className="pb-3 pl-4 min-w-[200px]">District</th>
                      <th className="pb-3 pl-4 min-w-[200px]">Street 1</th>
                      <th className="pb-3 pl-4 min-w-[200px]">Street 2</th>
                      <th className="pb-3 min-w-[150px]">Pincode</th>
                      <th className="pb-3 min-w-[150px]">Is Primary</th>
                      <th className="pb-3 pl-4 min-w-[200px]">Address Type</th>
                      <th className="pb-3 w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {addresses.map((address, index) => {
                      const isSelected = index === selectedAddressIndex;

                      return (
                        <tr
                          key={index}
                          className={`${
                            isSelected
                              ? "bg-gray-100 border-l-4 border-l-[#10B981]"
                              : "bg-white"
                          } border-b border-gray-100`}
                          style={{ height: "60px" }}
                        >
                          <td className="px-3">
                            <input
                              type="radio"
                              checked={isSelected}
                              onChange={() => setSelectedAddressIndex(index)}
                              className="w-5 h-5 text-[#10B981] border-gray-300 focus:ring-[#10B981]"
                            />
                          </td>
                          <td className="px-3">
                            <input
                              type="text"
                              value={address.vatNumber || ""}
                              onChange={(e) =>
                                updateAddress(
                                  index,
                                  "vatNumber",
                                  e.target.value
                                )
                              }
                              placeholder="Enter VAT Number"
                              className={`min-w-[200px] px-3 py-2 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs ${
                                errors.addresses?.[index]?.vatNumber
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                          </td>
                          <td className="px-3">
                            <CustomSelect
                              key={`country-${index}-${address.country}`}
                              value={address.country || ""}
                              onValueChange={(value) =>
                                updateAddress(index, "country", value)
                              }
                              options={allCountries}
                              placeholder="Select Country"
                              searchable
                              getOptionLabel={(option) => option.name}
                              getOptionValue={(option) => option.name}
                              className={`min-w-[200px] text-xs ${
                                errors.addresses?.[index]?.country
                                  ? "border-red-500"
                                  : ""
                              }`}
                              error={errors.addresses?.[index]?.country}
                            />
                          </td>
                          <td className="px-3">
                            <CustomSelect
                              key={`state-${index}-${address.state}`}
                              value={address.state || ""}
                              onValueChange={(value) =>
                                updateAddress(index, "state", value)
                              }
                              options={getStatesForCountry(address.country)}
                              placeholder="Select State"
                              searchable
                              disabled={!address.country}
                              getOptionLabel={(option) => option.name}
                              getOptionValue={(option) => option.name}
                              className={`min-w-[200px] text-xs ${
                                errors.addresses?.[index]?.state
                                  ? "border-red-500"
                                  : ""
                              }`}
                              error={errors.addresses?.[index]?.state}
                            />
                          </td>
                          <td className="px-3">
                            <CustomSelect
                              key={`city-${index}-${address.city}`}
                              value={address.city || ""}
                              onValueChange={(value) =>
                                updateAddress(index, "city", value)
                              }
                              options={getCitiesForCountryState(
                                address.country,
                                address.state
                              )}
                              placeholder="Select City"
                              searchable
                              disabled={!address.state}
                              getOptionLabel={(option) => option.name}
                              getOptionValue={(option) => option.name}
                              className={`min-w-[200px] text-xs ${
                                errors.addresses?.[index]?.city
                                  ? "border-red-500"
                                  : ""
                              }`}
                              error={errors.addresses?.[index]?.city}
                            />
                          </td>
                          <td className="px-3">
                            <input
                              type="text"
                              value={address.district || ""}
                              onChange={(e) =>
                                updateAddress(index, "district", e.target.value)
                              }
                              placeholder="Enter district"
                              className={`min-w-[200px] px-3 py-2 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs ${
                                errors.addresses?.[index]?.district
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                          </td>
                          <td className="px-3">
                            <input
                              type="text"
                              value={address.street1 || ""}
                              onChange={(e) =>
                                updateAddress(index, "street1", e.target.value)
                              }
                              placeholder="Enter street 1"
                              className={`min-w-[200px] px-3 py-2 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs ${
                                errors.addresses?.[index]?.street1
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                          </td>
                          <td className="px-3">
                            <input
                              type="text"
                              value={address.street2 || ""}
                              onChange={(e) =>
                                updateAddress(index, "street2", e.target.value)
                              }
                              placeholder="Enter street 2"
                              className={`min-w-[200px] px-3 py-2 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs ${
                                errors.addresses?.[index]?.street2
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                          </td>
                          <td className="px-3">
                            <input
                              type="text"
                              maxLength={6}
                              value={address.postalCode || ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                // Only allow numeric values
                                if (value === "" || /^\d+$/.test(value)) {
                                  updateAddress(index, "postalCode", value);
                                }
                              }}
                              placeholder="Enter pincode"
                              className={`min-w-[150px] px-3 py-2 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs ${
                                errors.addresses?.[index]?.postalCode
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                          </td>
                          <td className="px-3">
                            <input
                              type="radio"
                              name="primaryAddress"
                              checked={address.isPrimary || false}
                              onChange={() =>
                                updateAddress(index, "isPrimary", true)
                              }
                              className="w-5 h-5 text-[#10B981] border-gray-300 focus:ring-[#10B981]"
                            />
                          </td>
                          <td className="px-3">
                            <CustomSelect
                              key={`addressType-${index}-${address.addressType}`}
                              value={address.addressType || ""}
                              onValueChange={(value) =>
                                updateAddress(index, "addressType", value)
                              }
                              options={masterData?.addressTypes || []}
                              placeholder="Select Type"
                              getOptionLabel={(option) => option.label}
                              getOptionValue={(option) => option.value}
                              className={`min-w-[200px] text-xs ${
                                errors.addresses?.[index]?.addressType
                                  ? "border-red-500"
                                  : ""
                              }`}
                              error={errors.addresses?.[index]?.addressType}
                            />
                          </td>
                          <td className="px-3">
                            <button
                              onClick={() => removeAddress(index)}
                              disabled={addresses.length <= 1}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No addresses added yet</p>
                <p className="text-sm">Click "Add Address" to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Contacts Section */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="bg-[#0D1A33] text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              <div>
                <h2 className="text-lg font-bold">Contact details</h2>
                <p className="text-xs text-gray-300">(for selected address)</p>
              </div>
            </div>
            <button
              onClick={addContact}
              disabled={!selectedAddress}
              className="bg-[#10B981] text-white h-9 px-3 rounded-lg flex items-center gap-2 text-sm hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          <div className="p-4">
            {selectedAddress ? (
              contacts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="text-left text-xs font-medium text-gray-600 border-b border-gray-200">
                        <th className="pl-4 pb-3 min-w-[200px]">Name</th>
                        <th className="pl-4 pb-3 min-w-[200px]">Role</th>
                        <th className="pl-4 pb-3 min-w-[200px]">
                          Phone Number
                        </th>
                        <th className="pl-4 pb-3 min-w-[200px]">
                          Alternate Phone Number
                        </th>
                        <th className="pl-4 pb-3 min-w-[250px]">Email</th>
                        <th className="pl-4 pb-3 min-w-[250px]">
                          Alternate Email
                        </th>
                        <th className="pb-3 w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {contacts.map((contact, index) => (
                        <tr
                          key={index}
                          className="bg-white border-b border-gray-100"
                          style={{ height: "60px" }}
                        >
                          <td className="px-3">
                            <input
                              type="text"
                              value={contact.name || ""}
                              onChange={(e) =>
                                updateContact(index, "name", e.target.value)
                              }
                              placeholder="Enter the name"
                              className={`min-w-[200px] px-3 py-2 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs ${
                                errors.addresses?.[selectedAddressIndex]
                                  ?.contacts?.[index]?.name
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                          </td>
                          <td className="px-3">
                            <input
                              type="text"
                              value={contact.role || ""}
                              onChange={(e) =>
                                updateContact(index, "role", e.target.value)
                              }
                              placeholder="Enter the role"
                              className={`min-w-[200px] px-3 py-2 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs ${
                                errors.addresses?.[selectedAddressIndex]
                                  ?.contacts?.[index]?.role
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                          </td>
                          <td className="px-3">
                            <input
                              type="text"
                              maxLength={10}
                              value={contact.phoneNumber || ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                // Only allow numeric values
                                if (value === "" || /^\d+$/.test(value)) {
                                  updateContact(
                                    index,
                                    "phoneNumber",
                                    e.target.value
                                  );
                                }
                              }}
                              placeholder="Enter the phone number"
                              className={`min-w-[200px] px-3 py-2 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs ${
                                errors.addresses?.[selectedAddressIndex]
                                  ?.contacts?.[index]?.phoneNumber
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                          </td>
                          <td className="px-3">
                            <input
                              type="text"
                              maxLength={10}
                              value={contact.alternatePhoneNumber || ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                // Only allow numeric values
                                if (value === "" || /^\d+$/.test(value)) {
                                  updateContact(
                                    index,
                                    "alternatePhoneNumber",
                                    e.target.value
                                  );
                                }
                              }}
                              placeholder="Enter the alternate phone"
                              className={`min-w-[200px] px-3 py-2 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs ${
                                errors.addresses?.[selectedAddressIndex]
                                  ?.contacts?.[index]?.alternatePhoneNumber
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                          </td>
                          <td className="px-3">
                            <input
                              type="email"
                              value={contact.email || ""}
                              onChange={(e) =>
                                updateContact(index, "email", e.target.value)
                              }
                              placeholder="Enter email"
                              className={`min-w-[250px] px-3 py-2 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs ${
                                errors.addresses?.[selectedAddressIndex]
                                  ?.contacts?.[index]?.email
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                          </td>
                          <td className="px-3">
                            <input
                              type="email"
                              value={contact.alternateEmail || ""}
                              onChange={(e) =>
                                updateContact(
                                  index,
                                  "alternateEmail",
                                  e.target.value
                                )
                              }
                              placeholder="Enter the alternate email"
                              className={`min-w-[250px] px-3 py-2 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs ${
                                errors.addresses?.[selectedAddressIndex]
                                  ?.contacts?.[index]?.alternateEmail
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                          </td>
                          <td className="px-3">
                            <button
                              onClick={() => removeContact(index)}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Phone className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No contacts added yet</p>
                  <p className="text-sm">Click "Add Contact" to get started</p>
                </div>
              )
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Phone className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">
                  Select an address to view contacts
                </p>
                <p className="text-sm">
                  Choose an address from the left table to manage its contacts
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressContactsTab;
