import React, { useState, useEffect } from "react";
import { User, Globe, Calendar, Upload, FileText, CheckCircle, X } from "lucide-react";
import { getComponentTheme } from "../../../utils/theme";

const GeneralInfoTab = ({
  formData,
  setFormData,
  errors = {},
  masterData = {},
}) => {
  const [ndaFile, setNdaFile] = useState(null);
  const [msaFile, setMsaFile] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      general: {
        ...prev.general,
        [field]: value,
      },
    }));
  };

  const handleFileUpload = (type, event) => {
    const file = event.target.files[0];
    if (file) {
      if (type === "nda") {
        setNdaFile(file);
        handleInputChange("upload_nda", file); // ✅ Store File object, not filename
      } else if (type === "msa") {
        setMsaFile(file);
        handleInputChange("upload_msa", file); // ✅ Store File object, not filename
      }
    }
  };

  const handleRemoveFile = (type) => {
    if (type === "nda") {
      setNdaFile(null);
      handleInputChange("upload_nda", null);
    } else if (type === "msa") {
      setMsaFile(null);
      handleInputChange("upload_msa", null);
    }
  };

  return (
    <div className="bg-white rounded-xl p-4">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-4">
        <User className="w-5 h-5 text-[#0D1A33]" />
        <h2 className="text-lg font-semibold text-[#0D1A33]">
          Basic Information
        </h2>
      </div>

      {/* Form Fields - Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Customer Name */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-[#0D1A33]">
            Customer Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.general?.customer_name || ""}
            onChange={(e) => handleInputChange("customer_name", e.target.value)}
            className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 transition-colors ${
              errors.general?.customer_name
                ? "border-red-500 focus:border-red-500"
                : "border-[#E5E7EB] focus:border-[#3B82F6]"
            }`}
            placeholder="Enter customer name"
          />
          {errors.general?.customer_name && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              ⚠️ {errors.general.customer_name}
            </p>
          )}
        </div>

        {/* Search Term */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-[#0D1A33]">
            Search Term <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.general?.search_term || ""}
            onChange={(e) => handleInputChange("search_term", e.target.value)}
            className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 transition-colors ${
              errors.general?.search_term
                ? "border-red-500 focus:border-red-500"
                : "border-[#E5E7EB] focus:border-[#3B82F6]"
            }`}
            placeholder="Enter search term"
          />
          {errors.general?.search_term && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              ⚠️ {errors.general.search_term}
            </p>
          )}
        </div>

        {/* Industry Type */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-[#0D1A33]">
            Industry Type <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.general?.industry_type || ""}
            onChange={(e) => handleInputChange("industry_type", e.target.value)}
            className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 transition-colors ${
              errors.general?.industry_type
                ? "border-red-500 focus:border-red-500"
                : "border-[#E5E7EB] focus:border-[#3B82F6]"
            }`}
          >
            <option value="">Select Industry Type</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Retail">Retail</option>
            <option value="Technology">Technology</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Finance">Finance</option>
            <option value="Logistics">Logistics</option>
            <option value="Other">Other</option>
          </select>
          {errors.general?.industry_type && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              ⚠️ {errors.general.industry_type}
            </p>
          )}
        </div>

        {/* Currency Type */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-[#0D1A33]">
            Currency Type
          </label>
          <select
            value={formData.general?.currency_type || ""}
            onChange={(e) => handleInputChange("currency_type", e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-colors"
          >
            <option value="">Select Currency</option>
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="INR">INR - Indian Rupee</option>
            <option value="CNY">CNY - Chinese Yuan</option>
          </select>
        </div>

        {/* Payment Term */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-[#0D1A33]">
            Payment Term <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.general?.payment_term || ""}
            onChange={(e) => handleInputChange("payment_term", e.target.value)}
            className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 transition-colors ${
              errors.general?.payment_term
                ? "border-red-500 focus:border-red-500"
                : "border-[#E5E7EB] focus:border-[#3B82F6]"
            }`}
          >
            <option value="">Select Payment Term</option>
            <option value="NET_30">Net 30 Days</option>
            <option value="NET_60">Net 60 Days</option>
            <option value="NET_90">Net 90 Days</option>
            <option value="IMMEDIATE">Immediate Payment</option>
            <option value="ADVANCE">Advance Payment</option>
          </select>
          {errors.general?.payment_term && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              ⚠️ {errors.general.payment_term}
            </p>
          )}
        </div>

        {/* Website URL */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-[#0D1A33]">
            <Globe className="inline w-3 h-3 mr-1" />
            Website URL
          </label>
          <input
            type="url"
            value={formData.general?.website_url || ""}
            onChange={(e) => handleInputChange("website_url", e.target.value)}
            className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 transition-colors ${
              errors.general?.website_url
                ? "border-red-500 focus:border-red-500"
                : "border-[#E5E7EB] focus:border-[#3B82F6]"
            }`}
            placeholder="https://example.com"
          />
          {errors.general?.website_url && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              ⚠️ {errors.general.website_url}
            </p>
          )}
        </div>
      </div>

      {/* Remark - Full Width */}
      <div className="mb-6">
        <label className="block text-xs font-medium text-[#0D1A33] mb-1">
          Remark
        </label>
        <textarea
          value={formData.general?.remark || ""}
          onChange={(e) => handleInputChange("remark", e.target.value)}
          rows={3}
          className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-colors resize-vertical"
          placeholder="Enter any additional remarks"
        />
      </div>

      {/* Document Upload Section */}
      <div className="border-t border-gray-200 pt-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-[#0D1A33]" />
          <h2 className="text-lg font-semibold text-[#0D1A33]">
            Document Upload
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* NDA Upload */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#0D1A33]">
              Upload NDA
            </label>
            <div
              className="border-2 border-dashed border-[#E5E7EB] rounded-lg p-4 text-center hover:border-[#3B82F6] transition-colors cursor-pointer"
              onDragOver={(e) => e.preventDefault()}
            >
              {ndaFile ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-[#0D1A33]">{ndaFile.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile("nda")}
                    className="p-1 hover:bg-red-50 rounded"
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-400">PDF, JPG, PNG (Max 5MB)</p>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload("nda", e)}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* MSA Upload */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#0D1A33]">
              Upload MSA
            </label>
            <div
              className="border-2 border-dashed border-[#E5E7EB] rounded-lg p-4 text-center hover:border-[#3B82F6] transition-colors cursor-pointer"
              onDragOver={(e) => e.preventDefault()}
            >
              {msaFile ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-[#0D1A33]">{msaFile.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile("msa")}
                    className="p-1 hover:bg-red-50 rounded"
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-400">PDF, JPG, PNG (Max 5MB)</p>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload("msa", e)}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information Section */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-md font-semibold text-[#0D1A33] mb-4">
          Additional Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Name on PO */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#0D1A33]">
              Name on Purchase Order
            </label>
            <input
              type="text"
              value={formData.general?.name_on_po || ""}
              onChange={(e) => handleInputChange("name_on_po", e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-colors"
              placeholder="Enter name to appear on PO"
            />
          </div>

          {/* Approved By */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#0D1A33]">
              Approved By
            </label>
            <input
              type="text"
              value={formData.general?.approved_by || ""}
              onChange={(e) => handleInputChange("approved_by", e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-colors"
              placeholder="Enter approver name"
            />
          </div>

          {/* Approved Date */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#0D1A33]">
              <Calendar className="inline w-3 h-3 mr-1" />
              Approved Date
            </label>
            <input
              type="date"
              value={formData.general?.approved_date || ""}
              onChange={(e) => handleInputChange("approved_date", e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-colors"
            />
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#0D1A33]">
              Status
            </label>
            <select
              value={formData.general?.status || "ACTIVE"}
              onChange={(e) => handleInputChange("status", e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-colors"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
        </div>
      </div>
    </div>
    // <div style={{ padding: "24px" }}>
    //   {/* Basic Information Section */}
    //   <div
    //     style={{
    //       backgroundColor: theme.colors.card.background,
    //       borderRadius: "12px",
    //       padding: "24px",
    //       marginBottom: "24px",
    //       border: `1px solid ${theme.colors.card.border}`,
    //     }}
    //   >
    //     <h3
    //       style={{
    //         fontSize: "18px",
    //         fontWeight: "600",
    //         color: theme.colors.text.primary,
    //         marginBottom: "20px",
    //       }}
    //     >
    //       Basic Information
    //     </h3>

    //     <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
    //       {/* Customer Name */}
    //       <div>
    //         <label
    //           style={{
    //             display: "block",
    //             fontSize: "14px",
    //             fontWeight: "500",
    //             color: theme.colors.text.primary,
    //             marginBottom: "8px",
    //           }}
    //         >
    //           Customer Name <span style={{ color: theme.colors.status.error }}>*</span>
    //         </label>
    //         <input
    //           type="text"
    //           value={data.customer_name || ""}
    //           onChange={(e) => handleInputChange("customer_name", e.target.value)}
    //           placeholder="Enter customer name"
    //           style={{
    //             width: "100%",
    //             padding: "10px 12px",
    //             fontSize: "14px",
    //             border: `1px solid ${
    //               errors?.customer_name
    //                 ? (theme.colors.input?.border?.error || theme.colors.status.error)
    //                 : (theme.colors.input?.border?.default || theme.colors.card.border)
    //             }`,
    //             borderRadius: "8px",
    //             outline: "none",
    //             transition: "border-color 0.2s",
    //           }}
    //         />
    //         {errors?.customer_name && (
    //           <span
    //             style={{
    //               display: "block",
    //               fontSize: "12px",
    //               color: theme.colors.status.error,
    //               marginTop: "4px",
    //             }}
    //           >
    //             {errors.customer_name}
    //           </span>
    //         )}
    //       </div>

    //       {/* Search Term */}
    //       <div>
    //         <label
    //           style={{
    //             display: "block",
    //             fontSize: "14px",
    //             fontWeight: "500",
    //             color: theme.colors.text.primary,
    //             marginBottom: "8px",
    //           }}
    //         >
    //           Search Term <span style={{ color: theme.colors.status.error }}>*</span>
    //         </label>
    //         <input
    //           type="text"
    //           value={data.search_term || ""}
    //           onChange={(e) => handleInputChange("search_term", e.target.value)}
    //           placeholder="Enter search term"
    //           style={{
    //             width: "100%",
    //             padding: "10px 12px",
    //             fontSize: "14px",
    //             border: `1px solid ${
    //               errors?.search_term
    //                 ? (theme.colors.input?.border?.error || theme.colors.status.error)
    //                 : (theme.colors.input?.border?.default || theme.colors.card.border)
    //             }`,
    //             borderRadius: "8px",
    //             outline: "none",
    //           }}
    //         />
    //         {errors?.search_term && (
    //           <span
    //             style={{
    //               display: "block",
    //               fontSize: "12px",
    //               color: theme.colors.status.error,
    //               marginTop: "4px",
    //             }}
    //           >
    //             {errors.search_term}
    //           </span>
    //         )}
    //       </div>

    //       {/* Industry Type */}
    //       <div>
    //         <label
    //           style={{
    //             display: "block",
    //             fontSize: "14px",
    //             fontWeight: "500",
    //             color: theme.colors.text.primary,
    //             marginBottom: "8px",
    //           }}
    //         >
    //           Industry Type <span style={{ color: theme.colors.status.error }}>*</span>
    //         </label>
    //         <select
    //           value={data.industry_type || ""}
    //           onChange={(e) => handleInputChange("industry_type", e.target.value)}
    //           style={{
    //             width: "100%",
    //             padding: "10px 12px",
    //             fontSize: "14px",
    //             border: `1px solid ${
    //               errors?.industry_type
    //                 ? (theme.colors.input?.border?.error || theme.colors.status.error)
    //                 : (theme.colors.input?.border?.default || theme.colors.card.border)
    //             }`,
    //             borderRadius: "8px",
    //             outline: "none",
    //             backgroundColor: (theme.colors.input?.background || theme.colors.card.background),
    //           }}
    //         >
    //           <option value="">Select Industry Type</option>
    //           {masterData.industryTypes?.map((type) => (
    //             <option key={type.value} value={type.value}>
    //               {type.label}
    //             </option>
    //           ))}
    //         </select>
    //         {errors?.industry_type && (
    //           <span
    //             style={{
    //               display: "block",
    //               fontSize: "12px",
    //               color: theme.colors.status.error,
    //               marginTop: "4px",
    //             }}
    //           >
    //             {errors.industry_type}
    //           </span>
    //         )}
    //       </div>

    //       {/* Currency Type */}
    //       <div>
    //         <label
    //           style={{
    //             display: "block",
    //             fontSize: "14px",
    //             fontWeight: "500",
    //             color: theme.colors.text.primary,
    //             marginBottom: "8px",
    //           }}
    //         >
    //           Currency Type
    //         </label>
    //         <select
    //           value={data.currency_type || ""}
    //           onChange={(e) => handleInputChange("currency_type", e.target.value)}
    //           style={{
    //             width: "100%",
    //             padding: "10px 12px",
    //             fontSize: "14px",
    //             border: `1px solid ${(theme.colors.input?.border?.default || theme.colors.card.border)}`,
    //             borderRadius: "8px",
    //             outline: "none",
    //             backgroundColor: (theme.colors.input?.background || theme.colors.card.background),
    //           }}
    //         >
    //           <option value="">Select Currency Type</option>
    //           {masterData.currencyTypes?.map((currency) => (
    //             <option key={currency.value} value={currency.value}>
    //               {currency.label}
    //             </option>
    //           ))}
    //         </select>
    //       </div>

    //       {/* Payment Term */}
    //       <div>
    //         <label
    //           style={{
    //             display: "block",
    //             fontSize: "14px",
    //             fontWeight: "500",
    //             color: theme.colors.text.primary,
    //             marginBottom: "8px",
    //           }}
    //         >
    //           Payment Term <span style={{ color: theme.colors.status.error }}>*</span>
    //         </label>
    //         <select
    //           value={data.payment_term || ""}
    //           onChange={(e) => handleInputChange("payment_term", e.target.value)}
    //           style={{
    //             width: "100%",
    //             padding: "10px 12px",
    //             fontSize: "14px",
    //             border: `1px solid ${
    //               errors?.payment_term
    //                 ? (theme.colors.input?.border?.error || theme.colors.status.error)
    //                 : (theme.colors.input?.border?.default || theme.colors.card.border)
    //             }`,
    //             borderRadius: "8px",
    //             outline: "none",
    //             backgroundColor: (theme.colors.input?.background || theme.colors.card.background),
    //           }}
    //         >
    //           <option value="">Select Payment Term</option>
    //           {masterData.paymentTerms?.map((term) => (
    //             <option key={term.value} value={term.value}>
    //               {term.label}
    //             </option>
    //           ))}
    //         </select>
    //         {errors?.payment_term && (
    //           <span
    //             style={{
    //               display: "block",
    //               fontSize: "12px",
    //               color: theme.colors.status.error,
    //               marginTop: "4px",
    //             }}
    //           >
    //             {errors.payment_term}
    //           </span>
    //         )}
    //       </div>

    //       {/* Website URL */}
    //       <div>
    //         <label
    //           style={{
    //             display: "block",
    //             fontSize: "14px",
    //             fontWeight: "500",
    //             color: theme.colors.text.primary,
    //             marginBottom: "8px",
    //           }}
    //         >
    //           <Globe size={16} style={{ display: "inline", marginRight: "6px" }} />
    //           Website URL
    //         </label>
    //         <input
    //           type="url"
    //           value={data.website_url || ""}
    //           onChange={(e) => handleInputChange("website_url", e.target.value)}
    //           placeholder="https://example.com"
    //           style={{
    //             width: "100%",
    //             padding: "10px 12px",
    //             fontSize: "14px",
    //             border: `1px solid ${
    //               errors?.website_url
    //                 ? (theme.colors.input?.border?.error || theme.colors.status.error)
    //                 : (theme.colors.input?.border?.default || theme.colors.card.border)
    //             }`,
    //             borderRadius: "8px",
    //             outline: "none",
    //           }}
    //         />
    //         {errors?.website_url && (
    //           <span
    //             style={{
    //               display: "block",
    //               fontSize: "12px",
    //               color: theme.colors.status.error,
    //               marginTop: "4px",
    //             }}
    //           >
    //             {errors.website_url}
    //           </span>
    //         )}
    //       </div>
    //     </div>

    //     {/* Remark - Full Width */}
    //     <div style={{ marginTop: "20px" }}>
    //       <label
    //         style={{
    //           display: "block",
    //           fontSize: "14px",
    //           fontWeight: "500",
    //           color: theme.colors.text.primary,
    //           marginBottom: "8px",
    //         }}
    //       >
    //         Remark
    //       </label>
    //       <textarea
    //         value={data.remark || ""}
    //         onChange={(e) => handleInputChange("remark", e.target.value)}
    //         placeholder="Enter any additional remarks"
    //         rows={3}
    //         style={{
    //           width: "100%",
    //           padding: "10px 12px",
    //           fontSize: "14px",
    //           border: `1px solid ${(theme.colors.input?.border?.default || theme.colors.card.border)}`,
    //           borderRadius: "8px",
    //           outline: "none",
    //           resize: "vertical",
    //         }}
    //       />
    //     </div>
    //   </div>

    //   {/* Document Upload Section */}
    //   <div
    //     style={{
    //       backgroundColor: theme.colors.card.background,
    //       borderRadius: "12px",
    //       padding: "24px",
    //       marginBottom: "24px",
    //       border: `1px solid ${theme.colors.card.border}`,
    //     }}
    //   >
    //     <h3
    //       style={{
    //         fontSize: "18px",
    //         fontWeight: "600",
    //         color: theme.colors.text.primary,
    //         marginBottom: "20px",
    //       }}
    //     >
    //       <FileText size={20} style={{ display: "inline", marginRight: "8px" }} />
    //       Document Upload
    //     </h3>

    //     <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
    //       {/* NDA Upload */}
    //       <div>
    //         <label
    //           style={{
    //             display: "block",
    //             fontSize: "14px",
    //             fontWeight: "500",
    //             color: theme.colors.text.primary,
    //             marginBottom: "8px",
    //           }}
    //         >
    //           Upload NDA
    //         </label>
    //         <div
    //           style={{
    //             border: `2px dashed ${(theme.colors.input?.border?.default || theme.colors.card.border)}`,
    //             borderRadius: "8px",
    //             padding: "20px",
    //             textAlign: "center",
    //             cursor: "pointer",
    //             transition: "border-color 0.2s",
    //           }}
    //           onDragOver={(e) => e.preventDefault()}
    //         >
    //           {ndaFile ? (
    //             <div
    //               style={{
    //                 display: "flex",
    //                 alignItems: "center",
    //                 justifyContent: "space-between",
    //               }}
    //             >
    //               <div style={{ display: "flex", alignItems: "center" }}>
    //                 <CheckCircle size={20} style={{ color: theme.colors.status.success, marginRight: "8px" }} />
    //                 <span style={{ fontSize: "14px", color: theme.colors.text.primary }}>
    //                   {ndaFile.name}
    //                 </span>
    //               </div>
    //               <button
    //                 type="button"
    //                 onClick={() => handleRemoveFile("nda")}
    //                 style={{
    //                   background: "transparent",
    //                   border: "none",
    //                   cursor: "pointer",
    //                   padding: "4px",
    //                 }}
    //               >
    //                 <X size={18} style={{ color: theme.colors.status.error }} />
    //               </button>
    //             </div>
    //           ) : (
    //             <label style={{ cursor: "pointer" }}>
    //               <Upload size={24} style={{ color: theme.colors.text.secondary, marginBottom: "8px" }} />
    //               <p style={{ fontSize: "14px", color: theme.colors.text.secondary, marginBottom: "4px" }}>
    //                 Click to upload or drag and drop
    //               </p>
    //               <p style={{ fontSize: "12px", color: theme.colors.text.disabled }}>
    //                 PDF, JPG, PNG (Max 5MB)
    //               </p>
    //               <input
    //                 type="file"
    //                 accept=".pdf,.jpg,.jpeg,.png"
    //                 onChange={(e) => handleFileUpload("nda", e)}
    //                 style={{ display: "none" }}
    //               />
    //             </label>
    //           )}
    //         </div>
    //       </div>

    //       {/* MSA Upload */}
    //       <div>
    //         <label
    //           style={{
    //             display: "block",
    //             fontSize: "14px",
    //             fontWeight: "500",
    //             color: theme.colors.text.primary,
    //             marginBottom: "8px",
    //           }}
    //         >
    //           Upload MSA
    //         </label>
    //         <div
    //           style={{
    //             border: `2px dashed ${(theme.colors.input?.border?.default || theme.colors.card.border)}`,
    //             borderRadius: "8px",
    //             padding: "20px",
    //             textAlign: "center",
    //             cursor: "pointer",
    //             transition: "border-color 0.2s",
    //           }}
    //           onDragOver={(e) => e.preventDefault()}
    //         >
    //           {msaFile ? (
    //             <div
    //               style={{
    //                 display: "flex",
    //                 alignItems: "center",
    //                 justifyContent: "space-between",
    //               }}
    //             >
    //               <div style={{ display: "flex", alignItems: "center" }}>
    //                 <CheckCircle size={20} style={{ color: theme.colors.status.success, marginRight: "8px" }} />
    //                 <span style={{ fontSize: "14px", color: theme.colors.text.primary }}>
    //                   {msaFile.name}
    //                 </span>
    //               </div>
    //               <button
    //                 type="button"
    //                 onClick={() => handleRemoveFile("msa")}
    //                 style={{
    //                   background: "transparent",
    //                   border: "none",
    //                   cursor: "pointer",
    //                   padding: "4px",
    //                 }}
    //               >
    //                 <X size={18} style={{ color: theme.colors.status.error }} />
    //               </button>
    //             </div>
    //           ) : (
    //             <label style={{ cursor: "pointer" }}>
    //               <Upload size={24} style={{ color: theme.colors.text.secondary, marginBottom: "8px" }} />
    //               <p style={{ fontSize: "14px", color: theme.colors.text.secondary, marginBottom: "4px" }}>
    //                 Click to upload or drag and drop
    //               </p>
    //               <p style={{ fontSize: "12px", color: theme.colors.text.disabled }}>
    //                 PDF, JPG, PNG (Max 5MB)
    //               </p>
    //               <input
    //                 type="file"
    //                 accept=".pdf,.jpg,.jpeg,.png"
    //                 onChange={(e) => handleFileUpload("msa", e)}
    //                 style={{ display: "none" }}
    //               />
    //             </label>
    //           )}
    //         </div>
    //       </div>
    //     </div>
    //   </div>

    //   {/* Additional Information Section */}
    //   <div
    //     style={{
    //       backgroundColor: theme.colors.card.background,
    //       borderRadius: "12px",
    //       padding: "24px",
    //       border: `1px solid ${theme.colors.card.border}`,
    //     }}
    //   >
    //     <h3
    //       style={{
    //         fontSize: "18px",
    //         fontWeight: "600",
    //         color: theme.colors.text.primary,
    //         marginBottom: "20px",
    //       }}
    //     >
    //       Additional Information
    //     </h3>

    //     <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
    //       {/* Name on PO */}
    //       <div>
    //         <label
    //           style={{
    //             display: "block",
    //             fontSize: "14px",
    //             fontWeight: "500",
    //             color: theme.colors.text.primary,
    //             marginBottom: "8px",
    //           }}
    //         >
    //           Name on Purchase Order
    //         </label>
    //         <input
    //           type="text"
    //           value={data.name_on_po || ""}
    //           onChange={(e) => handleInputChange("name_on_po", e.target.value)}
    //           placeholder="Enter name to appear on PO"
    //           style={{
    //             width: "100%",
    //             padding: "10px 12px",
    //             fontSize: "14px",
    //             border: `1px solid ${(theme.colors.input?.border?.default || theme.colors.card.border)}`,
    //             borderRadius: "8px",
    //             outline: "none",
    //           }}
    //         />
    //       </div>

    //       {/* Approved By */}
    //       <div>
    //         <label
    //           style={{
    //             display: "block",
    //             fontSize: "14px",
    //             fontWeight: "500",
    //             color: theme.colors.text.primary,
    //             marginBottom: "8px",
    //           }}
    //         >
    //           Approved By
    //         </label>
    //         <input
    //           type="text"
    //           value={data.approved_by || ""}
    //           onChange={(e) => handleInputChange("approved_by", e.target.value)}
    //           placeholder="Enter approver name"
    //           style={{
    //             width: "100%",
    //             padding: "10px 12px",
    //             fontSize: "14px",
    //             border: `1px solid ${(theme.colors.input?.border?.default || theme.colors.card.border)}`,
    //             borderRadius: "8px",
    //             outline: "none",
    //           }}
    //         />
    //       </div>

    //       {/* Approved Date */}
    //       <div>
    //         <label
    //           style={{
    //             display: "block",
    //             fontSize: "14px",
    //             fontWeight: "500",
    //             color: theme.colors.text.primary,
    //             marginBottom: "8px",
    //           }}
    //         >
    //           <Calendar size={16} style={{ display: "inline", marginRight: "6px" }} />
    //           Approved Date
    //         </label>
    //         <input
    //           type="date"
    //           value={data.approved_date || ""}
    //           onChange={(e) => handleInputChange("approved_date", e.target.value)}
    //           style={{
    //             width: "100%",
    //             padding: "10px 12px",
    //             fontSize: "14px",
    //             border: `1px solid ${(theme.colors.input?.border?.default || theme.colors.card.border)}`,
    //             borderRadius: "8px",
    //             outline: "none",
    //           }}
    //         />
    //       </div>

    //       {/* Status */}
    //       <div>
    //         <label
    //           style={{
    //             display: "block",
    //             fontSize: "14px",
    //             fontWeight: "500",
    //             color: theme.colors.text.primary,
    //             marginBottom: "8px",
    //           }}
    //         >
    //           Status
    //         </label>
    //         <select
    //           value={data.status || "ACTIVE"}
    //           onChange={(e) => handleInputChange("status", e.target.value)}
    //           style={{
    //             width: "100%",
    //             padding: "10px 12px",
    //             fontSize: "14px",
    //             border: `1px solid ${(theme.colors.input?.border?.default || theme.colors.card.border)}`,
    //             borderRadius: "8px",
    //             outline: "none",
    //             backgroundColor: (theme.colors.input?.background || theme.colors.card.background),
    //           }}
    //         >
    //           <option value="ACTIVE">Active</option>
    //           <option value="INACTIVE">Inactive</option>
    //           <option value="PENDING">Pending</option>
    //         </select>
    //       </div>
    //     </div>
    //   </div>
    // </div>
  );
};

export default GeneralInfoTab;
