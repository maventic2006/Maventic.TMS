import React from "react";
import {
  FileText,
  Download,
  Eye,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Upload,
  Paperclip,
  Shield,
  Building,
} from "lucide-react";

const DocumentsViewTab = ({ warehouseData }) => {
  // Helper function to display value or N/A
  const displayValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return <span className="text-gray-500 italic">N/A</span>;
    }
    return <span className="text-[#0D1A33] font-medium">{value}</span>;
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "N/A";
    }
  };

  // Helper function to get document status
  const getDocumentStatus = (expiryDate) => {
    if (!expiryDate) return { status: "unknown", color: "gray" };

    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return { status: "expired", color: "red" };
    } else if (daysUntilExpiry <= 30) {
      return { status: "expiring", color: "yellow" };
    } else {
      return { status: "valid", color: "green" };
    }
  };

  // Sample document structure (in real implementation, this would come from API)
  const documents = [
    {
      id: 1,
      type: "Warehouse License",
      number: warehouseData?.license_number || "N/A",
      expiryDate: warehouseData?.license_expiry,
      uploadDate: warehouseData?.created_at,
      fileUrl: null,
    },
    {
      id: 2,
      type: "Fire Safety Certificate",
      number: warehouseData?.fire_safety_cert || "N/A",
      expiryDate: warehouseData?.fire_safety_expiry,
      uploadDate: warehouseData?.created_at,
      fileUrl: null,
    },
    {
      id: 3,
      type: "Environmental Clearance",
      number: warehouseData?.env_clearance_cert || "N/A",
      expiryDate: warehouseData?.env_clearance_expiry,
      uploadDate: warehouseData?.created_at,
      fileUrl: null,
    },
    {
      id: 4,
      type: "Insurance Certificate",
      number: warehouseData?.insurance_cert || "N/A",
      expiryDate: warehouseData?.insurance_expiry,
      uploadDate: warehouseData?.created_at,
      fileUrl: null,
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Document Summary */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Document Summary
            </h3>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(() => {
              const validDocs = documents.filter(
                (doc) =>
                  doc.number !== "N/A" &&
                  getDocumentStatus(doc.expiryDate).status === "valid"
              ).length;

              const expiringDocs = documents.filter(
                (doc) => getDocumentStatus(doc.expiryDate).status === "expiring"
              ).length;

              const expiredDocs = documents.filter(
                (doc) => getDocumentStatus(doc.expiryDate).status === "expired"
              ).length;

              const totalDocs = documents.filter(
                (doc) => doc.number !== "N/A"
              ).length;

              return (
                <>
                  <div className="text-center bg-green-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {validDocs}
                    </div>
                    <div className="text-sm text-gray-600">Valid Documents</div>
                  </div>

                  <div className="text-center bg-yellow-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-yellow-600">
                      {expiringDocs}
                    </div>
                    <div className="text-sm text-gray-600">Expiring Soon</div>
                  </div>

                  <div className="text-center bg-red-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-red-600">
                      {expiredDocs}
                    </div>
                    <div className="text-sm text-gray-600">Expired</div>
                  </div>

                  <div className="text-center bg-blue-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {totalDocs}
                    </div>
                    <div className="text-sm text-gray-600">Total Documents</div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Document List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Paperclip className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Document Repository
              </h3>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Upload className="h-4 w-4" />
              Upload New
            </button>
          </div>
        </div>

        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document Number
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiry Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Upload Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.map((doc) => {
                  const statusInfo = getDocumentStatus(doc.expiryDate);

                  return (
                    <tr
                      key={doc.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              statusInfo.color === "green"
                                ? "bg-green-100"
                                : statusInfo.color === "yellow"
                                ? "bg-yellow-100"
                                : statusInfo.color === "red"
                                ? "bg-red-100"
                                : "bg-gray-100"
                            }`}
                          >
                            <FileText
                              className={`h-4 w-4 ${
                                statusInfo.color === "green"
                                  ? "text-green-600"
                                  : statusInfo.color === "yellow"
                                  ? "text-yellow-600"
                                  : statusInfo.color === "red"
                                  ? "text-red-600"
                                  : "text-gray-600"
                              }`}
                            />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {doc.type}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {doc.number}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(doc.expiryDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            statusInfo.color === "green"
                              ? "bg-green-100 text-green-800"
                              : statusInfo.color === "yellow"
                              ? "bg-yellow-100 text-yellow-800"
                              : statusInfo.color === "red"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {statusInfo.status === "valid" && (
                            <CheckCircle className="h-3 w-3" />
                          )}
                          {statusInfo.status === "expiring" && (
                            <AlertTriangle className="h-3 w-3" />
                          )}
                          {statusInfo.status === "expired" && (
                            <AlertTriangle className="h-3 w-3" />
                          )}
                          {statusInfo.status === "unknown" && (
                            <FileText className="h-3 w-3" />
                          )}

                          {statusInfo.status === "valid" && "Valid"}
                          {statusInfo.status === "expiring" && "Expiring Soon"}
                          {statusInfo.status === "expired" && "Expired"}
                          {statusInfo.status === "unknown" && "Unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(doc.uploadDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                            title="View Document"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                            title="Download Document"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            className="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded transition-colors"
                            title="Replace Document"
                          >
                            <Upload className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Compliance & Certifications */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Compliance & Certifications
            </h3>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-3">
                Regulatory Compliance
              </label>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">
                    Fire Safety Compliance
                  </span>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">
                    Environmental Standards
                  </span>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Safety Protocols</span>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-3">
                Quality Certifications
              </label>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">ISO 9001:2015</span>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">HACCP Certified</span>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">GST Registration</span>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Upload Guidelines */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Building className="h-5 w-5 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Document Upload Guidelines
            </h3>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">
                Supported Formats
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  PDF documents (preferred)
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-500" />
                  Image files (JPG, PNG)
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-500" />
                  Document files (DOC, DOCX)
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Requirements</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Maximum file size: 10MB
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Clear, readable documents
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Valid expiry dates
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsViewTab;
