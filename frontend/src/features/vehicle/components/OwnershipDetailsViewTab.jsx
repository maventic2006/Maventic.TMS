import React from "react";
import { Key, CreditCard, Calendar, Phone, Mail, MapPin } from "lucide-react";
import CollapsibleSection from "../../../components/ui/CollapsibleSection";
import { formatDate } from "../../../utils/helpers";

const OwnershipDetailsViewTab = ({ vehicle, isEditMode }) => {
  if (isEditMode) {
    return (
      <div className="text-center py-12">
        <p className="text-[#4A5568]">
          Edit mode for Ownership Details coming soon...
        </p>
      </div>
    );
  }

  const ownershipRecords = vehicle?.ownershipDetails || [];

  return (
    <div className="space-y-6">
      {ownershipRecords.length === 0 ? (
        <div className="text-center py-12">
          <Key className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">
            No Ownership Records Found
          </h3>
          <p className="text-gray-400">
            No ownership information has been added yet.
          </p>
        </div>
      ) : (
        ownershipRecords.map((ownership, index) => (
          <CollapsibleSection
            key={index}
            defaultOpen={index === 0}
            gradientFrom="blue-50/50"
            gradientTo="indigo-50/50"
            borderColor="blue-100/50"
            header={
              <div className="flex items-center justify-between w-full text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Key className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {ownership.ownershipName ||
                        `Ownership Record ${index + 1}`}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {ownership.registrationNumber || "No Registration Number"}
                    </p>
                  </div>
                </div>
              </div>
            }
          >
            {/* Ownership Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Owner ID
                </label>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
                  <p className="text-gray-800">{ownership.ownerId || "N/A"}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Ownership Name
                </label>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
                  <p className="text-gray-800">
                    {ownership.ownershipName || "N/A"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Valid From
                </label>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <p className="text-gray-800">
                    {formatDate(ownership.validFrom)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Valid To
                </label>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <p className="text-gray-800">
                    {formatDate(ownership.validTo)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Registration Number
                </label>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
                  <p className="text-gray-800 font-semibold">
                    {ownership.registrationNumber || "N/A"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Registration Date
                </label>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <p className="text-gray-800">
                    {formatDate(ownership.registrationDate)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Registration Upto
                </label>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <p className="text-gray-800">
                    {formatDate(ownership.registrationUpto)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Purchase Date
                </label>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <p className="text-gray-800">
                    {formatDate(ownership.purchaseDate)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Owner Sr Number
                </label>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
                  <p className="text-gray-800">
                    {ownership.ownerSrNumber || "N/A"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  State Code
                </label>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
                  <p className="text-gray-800">
                    {ownership.stateCode || "N/A"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  RTO Code
                </label>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
                  <p className="text-gray-800">{ownership.rtoCode || "N/A"}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Sale Amount
                </label>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-500" />
                  <p className="text-gray-800 font-semibold">
                    ₹ {ownership.saleAmount?.toLocaleString() || "0"}
                  </p>
                </div>
              </div>

              {ownership.country && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">
                    Country
                  </label>
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <p className="text-gray-800">{ownership.country}</p>
                  </div>
                </div>
              )}

              {ownership.contactNumber && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">
                    Contact Number
                  </label>
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <p className="text-gray-800">{ownership.contactNumber}</p>
                  </div>
                </div>
              )}

              {ownership.email && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">
                    Email
                  </label>
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <p className="text-gray-800">{ownership.email}</p>
                  </div>
                </div>
              )}
            </div>
          </CollapsibleSection>
        ))
      )}
    </div>
  );
};

export default OwnershipDetailsViewTab;
