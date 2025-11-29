import React from "react";
import { Building2, Briefcase } from "lucide-react";

const OrganizationViewTab = ({ consignor }) => {
  const organization = consignor?.organization || {};

  return (
    <div className="p-6">
      {/* Organization Section */}
      <div className="bg-gradient-to-r from-indigo-50/50 to-blue-50/50 rounded-2xl p-6 border border-indigo-100/50">
        {/* Section Header */}
        <div className="flex items-center gap-2 mb-6">
          <Building2 className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
            Organization Details
          </h3>
        </div>

        {/* Organization Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company Code */}
          <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
            <label className="text-xs font-semibold text-[#4A5568] uppercase tracking-wide block mb-2">
              Company Code
            </label>
            <p className="text-sm font-medium text-[#0D1A33] font-mono tracking-wide">
              {organization.company_code || "N/A"}
            </p>
          </div>

          {/* Organization Unique ID */}
          {organization.organization_unique_id && (
            <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
              <label className="text-xs font-semibold text-[#4A5568] uppercase tracking-wide block mb-2">
                Organization ID
              </label>
              <p className="text-sm font-medium text-[#0D1A33]">
                {organization.organization_unique_id}
              </p>
            </div>
          )}

          {/* Status */}
          <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
            <label className="text-xs font-semibold text-[#4A5568] uppercase tracking-wide block mb-2">
              Status
            </label>
            <span
              className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                organization.status === "ACTIVE"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {organization.status || "UNKNOWN"}
            </span>
          </div>

          {/* Business Area - States Display */}
          <div className="md:col-span-2 bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
            <label className="text-xs font-semibold text-[#4A5568] uppercase tracking-wide mb-3 flex items-center gap-1">
              <Briefcase className="w-3 h-3" />
              Business Area (States)
            </label>
            {Array.isArray(organization.business_area) &&
            organization.business_area.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {organization.business_area.map((state, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200"
                  >
                    {state}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">
                {typeof organization.business_area === "string"
                  ? organization.business_area
                  : "No states selected"}
              </p>
            )}
          </div>
        </div>

        {/* Information Note */}
        <div className="mt-6 p-4 bg-indigo-50/50 rounded-lg border border-indigo-100">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            Organization Structure:
          </p>
          <ul className="text-xs text-gray-600 space-y-1 pl-5 list-disc">
            <li>
              Company Code uniquely identifies this consignor in the system
            </li>
            <li>Business Area shows all states where the consignor operates</li>
            <li>
              Multiple states indicate wider geographic coverage and operational
              reach
            </li>
            <li>
              This information is used for financial reporting and regional
              logistics planning
            </li>
          </ul>
        </div>
      </div>

      {/* Empty State if No Organization Data */}
      {!organization.company_code && !organization.business_area && (
        <div className="bg-gradient-to-r from-gray-50/50 to-slate-50/50 rounded-2xl p-12 text-center border border-gray-100/50">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-sm font-medium text-gray-600 mb-2">
            No organization information available
          </p>
          <p className="text-xs text-gray-500">
            Organization details will appear here once added
          </p>
        </div>
      )}
    </div>
  );
};

export default OrganizationViewTab;
