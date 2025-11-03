import React from "react";
import {
  FileText,
  Download,
  Eye,
  Calendar,
  CheckCircle,
  XCircle,
  Flag,
  Hash,
  AlertTriangle,
} from "lucide-react";
import { Country } from "country-state-city";
import CollapsibleSection from "../../../components/ui/CollapsibleSection";

const DocumentsViewTab = ({ formData, transporterData }) => {
  const data = formData || transporterData;
  const documents = data?.documents || [];

  // Helper function to convert country code to country name
  const getCountryName = (countryCode) => {
    if (!countryCode) return "N/A";
    const country = Country.getCountryByCode(countryCode);
    return country ? country.name : countryCode;
  };

  const getDocumentIcon = (documentType) => {
    // You can extend this with more specific icons based on document type
    return FileText;
  };

  const getStatusColor = (status) => {
    return status
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-red-100 text-red-800 border-red-200";
  };

  const getStatusIcon = (status) => {
    return status ? CheckCircle : XCircle;
  };

  const isDocumentExpired = (validTo) => {
    if (!validTo) return false;
    const today = new Date();
    const expiryDate = new Date(validTo);
    return expiryDate < today;
  };

  const isDocumentExpiringSoon = (validTo) => {
    if (!validTo) return false;
    const today = new Date();
    const expiryDate = new Date(validTo);
    const daysUntilExpiry = Math.ceil(
      (expiryDate - today) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {documents.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">
            No Documents Found
          </h3>
          <p className="text-gray-400">
            No document information has been added yet.
          </p>
        </div>
      ) : (
        documents.map((document, documentIndex) => {
          const IconComponent = getDocumentIcon(document.documentType);
          const StatusIcon = getStatusIcon(document.status);
          const isExpired = isDocumentExpired(document.validTo);
          const isExpiringSoon = isDocumentExpiringSoon(document.validTo);

          return (
            <CollapsibleSection
              key={documentIndex}
              defaultOpen={documentIndex === 0}
              gradientFrom="purple-50/50"
              gradientTo="pink-50/50"
              borderColor="purple-100/50"
              header={
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {document.documentType ||
                          `Document ${documentIndex + 1}`}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {document.documentNumber || "No document number"}
                      </p>
                    </div>
                  </div>

                  {/* Status and Warning Badges */}
                  <div className="flex items-center gap-2 mr-8">
                    {isExpired && (
                      <div className="flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium border border-red-200">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Expired</span>
                      </div>
                    )}

                    {!isExpired && isExpiringSoon && (
                      <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium border border-yellow-200">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Expiring Soon</span>
                      </div>
                    )}

                    <div
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        document.status
                      )}`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      <span>{document.status ? "Active" : "Inactive"}</span>
                    </div>
                  </div>
                </div>
              }
            >
              {/* Document Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">
                    Document Number
                  </label>
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50 flex items-center gap-2">
                    <Hash className="w-4 h-4 text-gray-500" />
                    <p className="text-gray-800">
                      {document.documentNumber || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">
                    Reference Number
                  </label>
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50 flex items-center gap-2">
                    <Hash className="w-4 h-4 text-gray-500" />
                    <p className="text-gray-800">
                      {document.referenceNumber || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">
                    Country
                  </label>
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50 flex items-center gap-2">
                    <Flag className="w-4 h-4 text-gray-500" />
                    <p className="text-gray-800">
                      {getCountryName(document.country)}
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
                      {formatDate(document.validFrom)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">
                    Valid To
                  </label>
                  <div
                    className={`bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border flex items-center gap-2 ${
                      isExpired
                        ? "border-red-300 bg-red-50/50"
                        : isExpiringSoon
                        ? "border-yellow-300 bg-yellow-50/50"
                        : "border-gray-200/50"
                    }`}
                  >
                    <Calendar
                      className={`w-4 h-4 ${
                        isExpired
                          ? "text-red-500"
                          : isExpiringSoon
                          ? "text-yellow-500"
                          : "text-gray-500"
                      }`}
                    />
                    <p
                      className={`${
                        isExpired
                          ? "text-red-800"
                          : isExpiringSoon
                          ? "text-yellow-800"
                          : "text-gray-800"
                      }`}
                    >
                      {formatDate(document.validTo)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">
                    File Type
                  </label>
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
                    <p className="text-gray-800">
                      {document.fileType || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* File Information */}
              {document.fileName && (
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {document.fileName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {document.fileType} Document
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium">
                        <Eye className="w-4 h-4" />
                        View
                      </button>

                      <button className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium">
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Document Validity Status */}
              <div
                className={`rounded-lg p-4 ${
                  isExpired
                    ? "bg-gradient-to-r from-red-100/50 to-rose-100/50 border border-red-200"
                    : isExpiringSoon
                    ? "bg-gradient-to-r from-yellow-100/50 to-orange-100/50 border border-yellow-200"
                    : "bg-gradient-to-r from-green-100/50 to-green-50/50 border border-green-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  {isExpired ? (
                    <XCircle className="w-5 h-5 text-red-600" />
                  ) : isExpiringSoon ? (
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        isExpired
                          ? "text-red-800"
                          : isExpiringSoon
                          ? "text-yellow-800"
                          : "text-green-800"
                      }`}
                    >
                      {isExpired
                        ? "Document Expired"
                        : isExpiringSoon
                        ? "Document Expiring Soon"
                        : "Document Valid"}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        isExpired
                          ? "text-red-600"
                          : isExpiringSoon
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {isExpired
                        ? "This document has expired and needs to be renewed"
                        : isExpiringSoon
                        ? "Please renew this document before it expires"
                        : "This document is currently valid and active"}
                    </p>
                  </div>
                </div>
              </div>
            </CollapsibleSection>
          );
        })
      )}
    </div>
  );
};

export default DocumentsViewTab;
