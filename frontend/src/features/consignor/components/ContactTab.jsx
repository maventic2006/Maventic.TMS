import React, { useState } from "react";
import { Users } from "lucide-react";
import { useSelector } from "react-redux";
import { getPageTheme } from "../../../theme.config";
import ThemeTable from "../../../components/ui/ThemeTable";
import useContactPhotoPreview from "../../../hooks/useContactPhotoPreview";
import PreviewModal from "../../../components/ui/PreviewModal";
import { maxLength } from "zod";

const ContactTab = ({ formData, setFormData, errors = {} }) => {
  const theme = getPageTheme("general");
  const { currentConsignor } = useSelector((state) => state.consignor);
  const contacts = formData.contacts || [];

  // Get customer ID for preview API calls
  const customerId = currentConsignor?.customer_id || formData?.general?.customer_id;

  // ✅ Use shared contact photo preview hook (View Mode logic)
  const {
    contactPhotos,
    handlePreviewContactPhoto,
    handleDownloadContactPhoto,
  } = useContactPhotoPreview(customerId, contacts);

  // State for manual preview modal
  const [previewDocument, setPreviewDocument] = useState(null);

  // Custom preview handler for contact photos
  const handleContactPhotoPreview = (row) => {
    const preview = handlePreviewContactPhoto(row);
    if (preview) {
      setPreviewDocument(preview);
    } else {
      alert("Contact photo not available for preview");
    }
  };

  const closePreview = () => {
    setPreviewDocument(null);
  };

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
      placeholder: "Enter contact name (max 100)",
      width: "min-w-[200px]",
      required: true,
      maxLength: 100,
    },
    {
      key: "designation",
      label: "Designation",
      type: "text",
      placeholder: "Enter designation (max 50)",
      width: "min-w-[180px]",
      required: true,
      maxLength: 50,
    },
    {
      key: "number",
      label: "Phone Number",
      type: "tel",
      placeholder: "+1 234 567 890 (max 15)",
      width: "min-w-[180px]",
      required: true,
      maxLength: 15,
    },
    {
      key: "email",
      label: "Email",
      type: "email",
      placeholder: "contact@example.com (max 100)",
      width: "min-w-[220px]",
      maxLength: 100,
    },
    {
      key: "role",
      label: "Role",
      type: "text",
      placeholder: "Enter role (max 100)",
      width: "min-w-[150px]",
      required: true,
      maxLength: 100,
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
        onPreview={handleContactPhotoPreview} // ✅ Use View Mode preview logic
      />

      {/* ✅ Shared Preview Modal (View Mode component) */}
      <PreviewModal 
        previewDocument={previewDocument} 
        onClose={closePreview} 
      />

      {/* Validation Error Summary */}
      {errors && typeof errors === "string" && (
        <div className="mt-3 
        3 bg-red-50 border border-red-200 rounded-lg">
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
