import React from "react";
import {
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  User,
  Building,
  Hash,
  Crown,
  CheckCircle,
} from "lucide-react";

const AddressContactsViewTab = ({ formData, transporterData }) => {
  const data = formData || transporterData;
  const addresses = data?.addresses || [];

  return (
    <div className="space-y-8">
      {addresses.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">
            No Addresses Found
          </h3>
          <p className="text-gray-400">
            No address information has been added yet.
          </p>
        </div>
      ) : (
        addresses.map((address, addressIndex) => (
          <div
            key={addressIndex}
            className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-2xl p-6 border border-blue-100/50 space-y-6"
          >
            {/* Address Header */}
            <div className="flex items-center justify-between border-b border-blue-200/30 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Building className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Address {addressIndex + 1}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {address.isPrimary
                      ? "Primary Address"
                      : "Secondary Address"}
                  </p>
                </div>
              </div>

              {address.isPrimary && (
                <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  <Crown className="w-4 h-4" />
                  <span>Primary</span>
                </div>
              )}
            </div>

            {/* Address Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  VAT Number
                </label>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50 flex items-center gap-2">
                  <Hash className="w-4 h-4 text-gray-500" />
                  <p className="text-gray-800">{address.vatNumber || "N/A"}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Country
                </label>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
                  <p className="text-gray-800">{address.country || "N/A"}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  State
                </label>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
                  <p className="text-gray-800">{address.state || "N/A"}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  City
                </label>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
                  <p className="text-gray-800">{address.city || "N/A"}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  District
                </label>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
                  <p className="text-gray-800">{address.district || "N/A"}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Postal Code
                </label>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
                  <p className="text-gray-800">{address.postalCode || "N/A"}</p>
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-600">
                  Street Address 1
                </label>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <p className="text-gray-800">{address.street1 || "N/A"}</p>
                </div>
              </div>

              {address.street2 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">
                    Street Address 2
                  </label>
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <p className="text-gray-800">{address.street2}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Contacts Section */}
            {address.contacts && address.contacts.length > 0 && (
              <div className="border-t border-blue-200/30 pt-6">
                <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Contacts ({address.contacts.length})
                </h4>

                <div className="space-y-4">
                  {address.contacts.map((contact, contactIndex) => (
                    <div
                      key={contactIndex}
                      className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 space-y-4"
                    >
                      <div className="flex items-center gap-3 border-b border-gray-200/30 pb-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-800">
                            {contact.name || `Contact ${contactIndex + 1}`}
                          </h5>
                          <p className="text-sm text-gray-600">
                            {contact.role || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-600">
                            Phone Number
                          </label>
                          <div className="bg-gray-50/70 rounded-lg px-3 py-2 flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <p className="text-gray-800">
                              {contact.phoneNumber || "N/A"}
                            </p>
                          </div>
                        </div>

                        {contact.alternatePhoneNumber && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">
                              Alternate Phone
                            </label>
                            <div className="bg-gray-50/70 rounded-lg px-3 py-2 flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-500" />
                              <p className="text-gray-800">
                                {contact.alternatePhoneNumber}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-600">
                            Email
                          </label>
                          <div className="bg-gray-50/70 rounded-lg px-3 py-2 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <p className="text-gray-800">
                              {contact.email || "N/A"}
                            </p>
                          </div>
                        </div>

                        {contact.alternateEmail && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">
                              Alternate Email
                            </label>
                            <div className="bg-gray-50/70 rounded-lg px-3 py-2 flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-500" />
                              <p className="text-gray-800">
                                {contact.alternateEmail}
                              </p>
                            </div>
                          </div>
                        )}

                        {contact.whatsappNumber && (
                          <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-gray-600">
                              WhatsApp Number
                            </label>
                            <div className="bg-gray-50/70 rounded-lg px-3 py-2 flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-green-500" />
                              <p className="text-gray-800">
                                {contact.whatsappNumber}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default AddressContactsViewTab;
