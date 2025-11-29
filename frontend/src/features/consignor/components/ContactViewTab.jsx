import React from "react";
import { User, Mail, Phone, Briefcase, Linkedin, Users } from "lucide-react";

const ContactViewTab = ({ consignor }) => {
  const contacts = consignor?.contacts || [];

  return (
    <div className="p-6">
      {/* Contacts List */}
      {contacts.length === 0 ? (
        <div className="bg-gradient-to-r from-gray-50/50 to-slate-50/50 rounded-2xl p-12 text-center border border-gray-100/50">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-sm font-medium text-gray-600 mb-2">
            No contacts found
          </p>
          <p className="text-xs text-gray-500">
            Contact information will appear here once added
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {contacts.map((contact, index) => (
            <div
              key={index}
              className="bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-2xl p-6 border border-purple-100/50"
            >
              {/* Contact Header */}
              <div className="flex items-center gap-4 mb-6">
                {/* Photo */}
                {contact.contact_photo ? (
                  <img
                    src={`${
                      import.meta.env.VITE_API_URL || "http://localhost:5000"
                    }/api/consignors/${consignor.customer_id}/contacts/${
                      contact.contact_id
                    }/photo`}
                    alt={contact.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-purple-200"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}

                {/* Default Avatar */}
                <div
                  className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center"
                  style={{ display: contact.contact_photo ? "none" : "flex" }}
                >
                  <User className="w-8 h-8 text-purple-600" />
                </div>

                {/* Name and Designation */}
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-gray-800 mb-1">
                    {contact.name || "N/A"}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {contact.designation || "N/A"}
                  </p>
                </div>

                {/* Status Badge */}
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    contact.status === "ACTIVE"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {contact.status || "UNKNOWN"}
                </span>
              </div>

              {/* Contact Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact ID */}
                <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
                  <label className="text-xs font-semibold text-[#4A5568] uppercase tracking-wide block mb-2">
                    Contact ID
                  </label>
                  <p className="text-sm font-medium text-[#0D1A33]">
                    {contact.contact_id || "N/A"}
                  </p>
                </div>

                {/* Phone Number */}
                <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
                  <label className="text-xs font-semibold text-[#4A5568] uppercase tracking-wide mb-2 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    Phone Number
                  </label>
                  <a
                    href={`tel:${contact.number}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    {contact.country_code ? `${contact.country_code} ` : ""}
                    {contact.number || "N/A"}
                  </a>
                </div>

                {/* Email */}
                <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
                  <label className="text-xs font-semibold text-[#4A5568] uppercase tracking-wide mb-2 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    Email
                  </label>
                  {contact.email ? (
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline break-all"
                    >
                      {contact.email}
                    </a>
                  ) : (
                    <p className="text-sm font-medium text-[#0D1A33]">N/A</p>
                  )}
                </div>

                {/* Role */}
                <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
                  <label className="text-xs font-semibold text-[#4A5568] uppercase tracking-wide mb-2 flex items-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    Role
                  </label>
                  <p className="text-sm font-medium text-[#0D1A33]">
                    {contact.role || "N/A"}
                  </p>
                </div>

                {/* Team */}
                <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
                  <label className="text-xs font-semibold text-[#4A5568] uppercase tracking-wide mb-2 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Team
                  </label>
                  <p className="text-sm font-medium text-[#0D1A33]">
                    {contact.team || "N/A"}
                  </p>
                </div>

                {/* LinkedIn */}
                <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
                  <label className="text-xs font-semibold text-[#4A5568] uppercase tracking-wide mb-2 flex items-center gap-1">
                    <Linkedin className="w-3 h-3" />
                    LinkedIn Profile
                  </label>
                  {contact.linkedin_link ? (
                    <a
                      href={contact.linkedin_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      View Profile
                    </a>
                  ) : (
                    <p className="text-sm font-medium text-[#0D1A33]">N/A</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactViewTab;
