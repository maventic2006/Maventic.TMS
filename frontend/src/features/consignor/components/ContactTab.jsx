import React from "react";
import { Users } from "lucide-react";
import { getPageTheme } from "../../../theme.config";
import ThemeTable from "../../../components/ui/ThemeTable";
import { maxLength } from "zod";

const ContactTab = ({ formData, setFormData, errors = {} }) => {
  const theme = getPageTheme("general");
  const contacts = formData.contacts || [];

  // Table column configuration
  const columns = [
    {
      key: "photo",
      label: "Photo",
      type: "file",
      width: "min-w-[200px]",
      required: false,
      accept: "image/jpeg,image/png,image/jpg",
    },
    {
      key: "name",
      label: "Name",
      type: "text",
      placeholder: "Enter contact name",
      width: "min-w-[200px]",
      required: true,
    },
    {
      key: "designation",
      label: "Designation",
      type: "text",
      placeholder: "Enter designation",
      width: "min-w-[180px]",
      required: true,
    },
    {
      key: "number",
      label: "Phone Number",
      type: "tel",
      placeholder: "+1 234 567 8900",
      width: "min-w-[180px]",
      required: true,
      maxLength: 10,
    },
    {
      key: "email",
      label: "Email",
      type: "email",
      placeholder: "contact@example.com",
      width: "min-w-[220px]",
    },
    {
      key: "role",
      label: "Role",
      type: "text",
      placeholder: "Enter role",
      width: "min-w-[150px]",
      required: true,
    },
    {
      key: "team",
      label: "Team",
      type: "text",
      placeholder: "Enter team name",
      width: "min-w-[150px]",
    },
    {
      key: "country_code",
      label: "Country Code",
      type: "text",
      placeholder: "+1",
      width: "min-w-[130px]",
    },
    {
      key: "linkedin_link",
      label: "LinkedIn Profile",
      type: "url",
      placeholder: "https://linkedin.com/in/username",
      width: "min-w-[250px]",
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "ACTIVE", label: "Active" },
        { value: "INACTIVE", label: "Inactive" },
      ],
      width: "min-w-[120px]",
    },
  ];

  const handleDataChange = (updatedContacts) => {
    setFormData((prev) => ({
      ...prev,
      contacts: updatedContacts,
    }));
  };

  const handleAddContact = () => {
    const newContact = {
      contact_id: null,
      designation: "",
      name: "",
      number: "",
      photo: null,
      role: "",
      team: "",
      country_code: "",
      email: "",
      linkedin_link: "",
      status: "ACTIVE",
    };

    const updatedContacts = [...contacts, newContact];
    setFormData((prev) => ({
      ...prev,
      contacts: updatedContacts,
    }));
  };

  const handleRemoveContact = (index) => {
    if (contacts.length <= 1) return; // Keep at least one contact

    const updatedContacts = contacts.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      contacts: updatedContacts,
    }));
  };

  return (
    <div className="bg-[#F5F7FA]">
      <ThemeTable
        title="Contact Information"
        titleIcon={Users}
        data={contacts}
        columns={columns}
        onDataChange={handleDataChange}
        onAddRow={handleAddContact}
        onRemoveRow={handleRemoveContact}
        errors={errors || {}}
        hasRowSelection={false}
        canRemoveRows={true}
        canAddRows={true}
        className="w-full"
      />

      {/* Validation Error Summary */}
      {errors && typeof errors === "string" && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-700 flex items-center gap-2">
            {errors}
          </p>
        </div>
      )}

      {errors && errors._general && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-700 flex items-center gap-2">
            {errors._general}
          </p>
        </div>
      )}
    </div>
  );
};

export default ContactTab;
