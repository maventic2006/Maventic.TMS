import React, { useState, useEffect } from "react";
import {
  User,
  Globe,
  Calendar,
  Upload,
  FileText,
  CheckCircle,
  X,
} from "lucide-react";
import { getComponentTheme } from "../../../utils/theme";
import { CustomSelect } from "@/components/ui/Select";

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
          <CustomSelect
            key={`industry-${formData.general?.industry_type}`}
            value={formData.general?.industry_type || ""}
            onValueChange={(value) => handleInputChange("industry_type", value)}
            options={[
              { name: "Manufacturing", value: "Manufacturing" },
              { name: "Retail", value: "Retail" },
              { name: "Technology", value: "Technology" },
              { name: "Healthcare", value: "Healthcare" },
              { name: "Finance", value: "Finance" },
              { name: "Logistics", value: "Logistics" },
              { name: "Other", value: "Other" },
            ]}
            placeholder="Select Industry Type"
            searchable
            getOptionLabel={(option) => option.name}
            getOptionValue={(option) => option.value}
            className={`w-full text-sm ${
              errors.general?.industry_type ? "border-red-500" : ""
            }`}
            error={errors.general?.industry_type}
          />

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
          <CustomSelect
            key={`currency-${formData.general?.currency_type}`}
            value={formData.general?.currency_type || ""}
            onValueChange={(value) => handleInputChange("currency_type", value)}
            options={[
              { name: "USD - US Dollar", value: "USD" },
              { name: "EUR - Euro", value: "EUR" },
              { name: "GBP - British Pound", value: "GBP" },
              { name: "INR - Indian Rupee", value: "INR" },
              { name: "CNY - Chinese Yuan", value: "CNY" },
            ]}
            placeholder="Select Currency"
            searchable
            getOptionLabel={(option) => option.name}
            getOptionValue={(option) => option.value}
            className="w-full text-sm"
            error={errors.general?.currency_type}
          />
        </div>

        {/* Payment Term */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-[#0D1A33]">
            Payment Term <span className="text-red-500">*</span>
          </label>
          <CustomSelect
            key={`payment-term-${formData.general?.payment_term}`}
            value={formData.general?.payment_term || ""}
            onValueChange={(value) => handleInputChange("payment_term", value)}
            options={[
              { name: "Net 30 Days", value: "NET_30" },
              { name: "Net 60 Days", value: "NET_60" },
              { name: "Net 90 Days", value: "NET_90" },
              { name: "Immediate Payment", value: "IMMEDIATE" },
              { name: "Advance Payment", value: "ADVANCE" },
            ]}
            placeholder="Select Payment Term"
            searchable={false}
            getOptionLabel={(option) => option.name}
            getOptionValue={(option) => option.value}
            className={`w-full text-sm ${
              errors.general?.payment_term ? "border-red-500" : ""
            }`}
            error={errors.general?.payment_term}
          />

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
                    <span className="text-sm text-[#0D1A33]">
                      {ndaFile.name}
                    </span>
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
                  <p className="text-xs text-gray-400">
                    PDF, JPG, PNG (Max 5MB)
                  </p>
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
                    <span className="text-sm text-[#0D1A33]">
                      {msaFile.name}
                    </span>
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
                  <p className="text-xs text-gray-400">
                    PDF, JPG, PNG (Max 5MB)
                  </p>
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
              onChange={(e) =>
                handleInputChange("approved_date", e.target.value)
              }
              className="w-full px-3 py-1.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-colors"
            />
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#0D1A33]">
              Status
            </label>

            <CustomSelect
              key={`status-${formData.general?.status}`}
              value={formData.general?.status || "ACTIVE"}
              onValueChange={(value) => handleInputChange("status", value)}
              options={[
                { name: "Active", value: "ACTIVE" },
                { name: "Inactive", value: "INACTIVE" },
                { name: "Pending", value: "PENDING" },
              ]}
              placeholder="Select Status"
              searchable={false}
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option.value}
              className={`min-w-[200px] text-xs ${
                errors.general?.status ? "border-red-500" : ""
              }`}
              error={errors.general?.status}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralInfoTab;
