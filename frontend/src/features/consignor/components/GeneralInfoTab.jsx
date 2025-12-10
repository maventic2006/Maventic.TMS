import React, { useState, useEffect } from "react";
import {
  User,
  Globe,
  Calendar,
  Upload,
  FileText,
  CheckCircle,
  X,
  Eye,
  Download,
} from "lucide-react";
import { getComponentTheme } from "../../../utils/theme";
import { CustomSelect } from "@/components/ui/Select";
import api from "../../../utils/api";

const GeneralInfoTab = ({
  formData,
  setFormData,
  errors = {},
  masterData = {},
}) => {
  const [ndaFile, setNdaFile] = useState(null);
  const [msaFile, setMsaFile] = useState(null);
  const [previewDocument, setPreviewDocument] = useState(null);
  
  // State for existing documents (from draft API)
  const [existingNdaDoc, setExistingNdaDoc] = useState(null);
  const [existingMsaDoc, setExistingMsaDoc] = useState(null);

  // Check for existing NDA/MSA documents when formData changes (draft edit mode)
  useEffect(() => {
    console.log("🔍 GeneralInfoTab: Checking for existing NDA/MSA documents");
    console.log("formData.general:", formData?.general);
    
    // Check if upload_nda contains a document ID (string) indicating existing document
    if (formData?.general?.upload_nda && typeof formData.general.upload_nda === "string") {
      console.log("📄 Found existing NDA document ID:", formData.general.upload_nda);
      setExistingNdaDoc({
        documentId: formData.general.upload_nda,
        fileName: "NDA Document", // Default name for existing docs
        fileType: "application/pdf", // Default type
      });
    } else {
      setExistingNdaDoc(null);
    }

    // Check if upload_msa contains a document ID (string) indicating existing document  
    if (formData?.general?.upload_msa && typeof formData.general.upload_msa === "string") {
      console.log("📄 Found existing MSA document ID:", formData.general.upload_msa);
      setExistingMsaDoc({
        documentId: formData.general.upload_msa,
        fileName: "MSA Document", // Default name for existing docs
        fileType: "application/pdf", // Default type
      });
    } else {
      setExistingMsaDoc(null);
    }
  }, [formData?.general?.upload_nda, formData?.general?.upload_msa]);

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
        setExistingNdaDoc(null); // Clear existing doc when new file uploaded
        handleInputChange("upload_nda", file); // ✅ Store File object, not filename
      } else if (type === "msa") {
        setMsaFile(file);
        setExistingMsaDoc(null); // Clear existing doc when new file uploaded
        handleInputChange("upload_msa", file); // ✅ Store File object, not filename
      }
    }
  };

  const handleRemoveFile = (type) => {
    if (type === "nda") {
      setNdaFile(null);
      setExistingNdaDoc(null); // Clear existing doc
      handleInputChange("upload_nda", null);
    } else if (type === "msa") {
      setMsaFile(null);
      setExistingMsaDoc(null); // Clear existing doc
      handleInputChange("upload_msa", null);
    }
  };

  const handleDownloadExistingDocument = async (type) => {
    const doc = type === "nda" ? existingNdaDoc : existingMsaDoc;
    if (!doc || !formData?.general?.customer_id) return;

    try {
      const customerId = formData.general.customer_id;
      
      // Use axios api instance with proper authentication
      const response = await api.get(
        `/consignors/${customerId}/general/${type}/download`,
        { responseType: 'blob' }
      );

      // Create download link
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = doc.fileName || `${type.toUpperCase()}_Document`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Error downloading ${type.toUpperCase()} document:`, error);
      alert(`Failed to download ${type.toUpperCase()} document`);
    }
  };

  const handlePreviewDocument = async (type) => {
    try {
      const localFile = type === "nda" ? ndaFile : msaFile;
      const existingDoc = type === "nda" ? existingNdaDoc : existingMsaDoc;

      // Case 1: Local file object (newly uploaded)
      if (localFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64Data = e.target.result.split(',')[1]; // Remove data:... prefix
          setPreviewDocument({
            fileName: localFile.name,
            fileType: localFile.type,
            fileData: base64Data,
          });
        };
        reader.readAsDataURL(localFile);
        return;
      }

      // Case 2: Existing document from backend (draft edit mode)
      if (existingDoc?.documentId) {
        console.log(`📋 Fetching ${type.toUpperCase()} document for preview:`, existingDoc.documentId);
        
        const consignorId = formData?.general?.customer_id || formData?.customer_id;
        if (!consignorId) {
          console.error("Cannot preview document: Missing consignor ID");
          alert("Cannot preview document: Missing consignor information");
          return;
        }

        // Use axios api instance with proper authentication instead of fetch
        const response = await api.get(
          `/consignors/${consignorId}/general/${type}/download`,
          { 
            responseType: 'arraybuffer',
            timeout: 10000
          }
        );

        // Convert array buffer to base64
        const base64String = btoa(
          new Uint8Array(response.data).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );

        const contentType = response.headers['content-type'] || "application/pdf";

        setPreviewDocument({
          fileName: existingDoc.fileName || `${type.toUpperCase()} Document`,
          fileType: contentType,
          fileData: base64String,
        });
        return;
      }

      // Case 3: No document available
      console.log(`No ${type.toUpperCase()} document available for preview`);
      alert(`No ${type.toUpperCase()} document available for preview`);
    } catch (error) {
      console.error(`Error previewing ${type.toUpperCase()} document:`, error);
      alert(`Failed to load ${type.toUpperCase()} document for preview: ${error.message}`);
    }
  };

  const closePreview = () => {
    setPreviewDocument(null);
  };

  // ESC key support for modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        closePreview();
      }
    };

    if (previewDocument) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [previewDocument]);

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
            maxLength={100}
            className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 transition-colors ${
              errors.general?.customer_name
                ? "border-red-500 focus:border-red-500"
                : "border-[#E5E7EB] focus:border-[#3B82F6]"
            }`}
            placeholder="Enter customer name (max 100 chars)"
          />
          <div className="flex justify-between items-center">
            {errors.general?.customer_name ? (
              <p className="text-sm text-red-500 flex items-center gap-1">
                ⚠️ {errors.general.customer_name}
              </p>
            ) : <span></span>}
            <span className="text-xs text-gray-500">
              {(formData.general?.customer_name || "").length}/100
            </span>
          </div>
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
            maxLength={100}
            className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 transition-colors ${
              errors.general?.search_term
                ? "border-red-500 focus:border-red-500"
                : "border-[#E5E7EB] focus:border-[#3B82F6]"
            }`}
            placeholder="Enter search term (max 100 chars)"
          />
          <div className="flex justify-between items-center">
            {errors.general?.search_term ? (
              <p className="text-sm text-red-500 flex items-center gap-1">
                ⚠️ {errors.general.search_term}
              </p>
            ) : <span></span>}
            <span className="text-xs text-gray-500">
              {(formData.general?.search_term || "").length}/100
            </span>
          </div>
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
                // New file uploaded
                <div className="space-y-2">
                  {/* File Info Display */}
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-green-800">
                          {ndaFile.name}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-green-600">
                          <span>{ndaFile.type}</span>
                          <span>•</span>
                          <span>{(ndaFile.size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handlePreviewDocument("nda")}
                        className="p-1.5 hover:bg-blue-100 rounded transition-colors"
                        title="Preview Document"
                      >
                        <Eye className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile("nda")}
                        className="p-1.5 hover:bg-red-100 rounded transition-colors"
                        title="Remove File"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : existingNdaDoc ? (
                // Existing document from draft
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-500" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-blue-800">
                          {existingNdaDoc.fileName}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-blue-600">
                          <span>Uploaded Document</span>
                          <span>•</span>
                          <span>Click to download or replace</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handlePreviewDocument("nda")}
                        className="p-1.5 hover:bg-blue-100 rounded transition-colors"
                        title="Preview Document"
                      >
                        <Eye className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadExistingDocument("nda")}
                        className="p-1.5 hover:bg-blue-100 rounded transition-colors"
                        title="Download Document"
                      >
                        <Download className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile("nda")}
                        className="p-1.5 hover:bg-red-100 rounded transition-colors"
                        title="Remove Document"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
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
                // New file uploaded
                <div className="space-y-2">
                  {/* File Info Display */}
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-green-800">
                          {msaFile.name}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-green-600">
                          <span>{msaFile.type}</span>
                          <span>•</span>
                          <span>{(msaFile.size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handlePreviewDocument("msa")}
                        className="p-1.5 hover:bg-blue-100 rounded transition-colors"
                        title="Preview Document"
                      >
                        <Eye className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile("msa")}
                        className="p-1.5 hover:bg-red-100 rounded transition-colors"
                        title="Remove File"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : existingMsaDoc ? (
                // Existing document from draft
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-500" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-blue-800">
                          {existingMsaDoc.fileName}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-blue-600">
                          <span>Uploaded Document</span>
                          <span>•</span>
                          <span>Click to download or replace</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handlePreviewDocument("msa")}
                        className="p-1.5 hover:bg-blue-100 rounded transition-colors"
                        title="Preview Document"
                      >
                        <Eye className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadExistingDocument("msa")}
                        className="p-1.5 hover:bg-blue-100 rounded transition-colors"
                        title="Download Document"
                      >
                        <Download className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile("msa")}
                        className="p-1.5 hover:bg-red-100 rounded transition-colors"
                        title="Remove Document"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
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
              maxLength={30}
              className="w-full px-3 py-1.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-colors"
              placeholder="Name on PO (max 30 chars)"
            />
            <span className="text-xs text-gray-500">
              {(formData.general?.name_on_po || "").length}/30
            </span>
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
              maxLength={30}
              className="w-full px-3 py-1.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-colors"
              placeholder="Approved by (max 30 chars)"
            />
            <span className="text-xs text-gray-500">
              {(formData.general?.approved_by || "").length}/30
            </span>
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

      {/* Document Preview Modal */}
      {previewDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#E0E7FF] rounded-lg">
                  <FileText className="h-5 w-5 text-[#6366F1]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {previewDocument.fileName}
                </h3>
              </div>
              <button
                onClick={closePreview}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Close Preview"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-auto p-4">
              {previewDocument.fileType?.startsWith("image/") ? (
                <img
                  src={`data:${previewDocument.fileType};base64,${previewDocument.fileData}`}
                  alt={previewDocument.fileName}
                  className="max-w-full h-auto mx-auto"
                />
              ) : previewDocument.fileType === "application/pdf" ? (
                <iframe
                  src={`data:application/pdf;base64,${previewDocument.fileData}`}
                  className="w-full h-[600px] border-0"
                  title={previewDocument.fileName}
                />
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Preview not available for this file type
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    You can still download the file
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
              <button
                onClick={closePreview}
                className="px-6 py-2.5 border border-[#E5E7EB] text-[#4A5568] rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneralInfoTab;
