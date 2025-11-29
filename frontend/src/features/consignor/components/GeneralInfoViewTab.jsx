import React from "react";
import {
  Building2,
  Globe,
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  User,
  Download,
  Hash,
  DollarSign,
  Briefcase,
} from "lucide-react";

const GeneralInfoViewTab = ({ consignor }) => {
  // Format date
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

  return (
    <div className="space-y-6 p-6">
      {/* Business Information Section */}
      <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-2xl p-6 border border-blue-100/50">
        <h3 className="text-sm font-bold text-gray-800 mb-6 flex items-center gap-2 uppercase tracking-wide">
          <Building2 className="w-5 h-5 text-blue-600" />
          Business Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#4A5568] uppercase tracking-wide">
              Customer ID
            </label>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
              <p className="text-sm font-medium text-[#0D1A33]">
                {consignor?.customer_id || "N/A"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#4A5568] uppercase tracking-wide">
              Customer Name
            </label>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
              <p className="text-sm font-medium text-[#0D1A33]">
                {consignor?.customer_name || "N/A"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#4A5568] uppercase tracking-wide">
              Search Term
            </label>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
              <p className="text-sm font-medium text-[#0D1A33]">
                {consignor?.search_term || "N/A"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#4A5568] uppercase tracking-wide">
              Industry Type
            </label>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
              <p className="text-sm font-medium text-[#0D1A33]">
                {consignor?.industry_type || "N/A"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#4A5568] uppercase tracking-wide">
              Currency Type
            </label>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <p className="text-sm font-medium text-[#0D1A33]">
                {consignor?.currency_type || "N/A"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#4A5568] uppercase tracking-wide">
              Payment Term
            </label>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
              <p className="text-sm font-medium text-[#0D1A33]">
                {consignor?.payment_term || "N/A"}
              </p>
            </div>
          </div>

          {consignor?.website_url && (
            <div className="space-y-2 col-span-full">
              <label className="text-xs font-semibold text-[#4A5568] uppercase tracking-wide flex items-center gap-1">
                <Globe className="w-3 h-3" />
                Website URL
              </label>
              <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
                <a
                  href={consignor.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                >
                  {consignor.website_url}
                </a>
              </div>
            </div>
          )}

          {consignor?.remark && (
            <div className="space-y-2 col-span-full">
              <label className="text-xs font-semibold text-[#4A5568] uppercase tracking-wide">
                Remark
              </label>
              <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
                <p className="text-sm font-medium text-[#0D1A33] leading-relaxed">
                  {consignor.remark}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* NDA & MSA Documents Section */}
      <div className="bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-2xl p-6 border border-purple-100/50">
        <h3 className="text-sm font-bold text-gray-800 mb-6 flex items-center gap-2 uppercase tracking-wide">
          <FileText className="w-5 h-5 text-purple-600" />
          NDA & MSA Documents
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* NDA Document */}
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50">
            <div className="flex items-center mb-3">
              <FileText className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-sm font-semibold text-gray-800">
                NDA Document
              </span>
            </div>
            {consignor?.upload_nda ? (
              <div className="space-y-3">
                <div className="flex items-center text-xs text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>Document ID: {consignor.upload_nda}</span>
                </div>
                {consignor?.nda_validity && (
                  <div className="flex items-center text-xs text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                    <span>
                      Valid Until: {formatDate(consignor.nda_validity)}
                    </span>
                  </div>
                )}
                <button
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                  onClick={async () => {
                    try {
                      const apiUrl =
                        import.meta.env.VITE_API_URL || "http://localhost:5000";
                      const response = await fetch(
                        `${apiUrl}/api/consignors/${consignor.customer_id}/general/nda/download`,
                        { credentials: "include" }
                      );

                      if (!response.ok) {
                        throw new Error(
                          `HTTP error! status: ${response.status}`
                        );
                      }

                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `NDA_${consignor.customer_id}`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      window.URL.revokeObjectURL(url);
                    } catch (error) {
                      console.error("Error downloading NDA:", error);
                      alert("Failed to download NDA document");
                    }
                  }}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download NDA
                </button>
              </div>
            ) : (
              <div className="flex items-center text-xs text-gray-400">
                <XCircle className="w-4 h-4 mr-2" />
                <span>Not uploaded</span>
              </div>
            )}
          </div>

          {/* MSA Document */}
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50">
            <div className="flex items-center mb-3">
              <FileText className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-sm font-semibold text-gray-800">
                MSA Document
              </span>
            </div>
            {consignor?.upload_msa ? (
              <div className="space-y-3">
                <div className="flex items-center text-xs text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>Document ID: {consignor.upload_msa}</span>
                </div>
                {consignor?.msa_validity && (
                  <div className="flex items-center text-xs text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                    <span>
                      Valid Until: {formatDate(consignor.msa_validity)}
                    </span>
                  </div>
                )}
                <button
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                  onClick={async () => {
                    try {
                      const apiUrl =
                        import.meta.env.VITE_API_URL || "http://localhost:5000";
                      const response = await fetch(
                        `${apiUrl}/api/consignors/${consignor.customer_id}/general/msa/download`,
                        { credentials: "include" }
                      );

                      if (!response.ok) {
                        throw new Error(
                          `HTTP error! status: ${response.status}`
                        );
                      }

                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `MSA_${consignor.customer_id}`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      window.URL.revokeObjectURL(url);
                    } catch (error) {
                      console.error("Error downloading MSA:", error);
                      alert("Failed to download MSA document");
                    }
                  }}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download MSA
                </button>
              </div>
            ) : (
              <div className="flex items-center text-xs text-gray-400">
                <XCircle className="w-4 h-4 mr-2" />
                <span>Not uploaded</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Information Section */}
      <div className="bg-gradient-to-r from-gray-50/50 to-slate-50/50 rounded-2xl p-6 border border-gray-100/50">
        <h3 className="text-sm font-bold text-gray-800 mb-6 flex items-center gap-2 uppercase tracking-wide">
          <Briefcase className="w-5 h-5 text-gray-600" />
          Additional Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#4A5568] uppercase tracking-wide">
              Name on Purchase Order
            </label>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
              <p className="text-sm font-medium text-[#0D1A33]">
                {consignor?.name_on_po || "N/A"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#4A5568] uppercase tracking-wide">
              Approved By
            </label>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50 flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <p className="text-sm font-medium text-[#0D1A33]">
                {consignor?.approved_by || "N/A"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#4A5568] uppercase tracking-wide">
              Approved Date
            </label>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <p className="text-sm font-medium text-[#0D1A33]">
                {formatDate(consignor?.approved_date)}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#4A5568] uppercase tracking-wide">
              Status
            </label>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                  consignor?.status === "ACTIVE"
                    ? "bg-green-100 text-green-800"
                    : consignor?.status === "PENDING"
                    ? "bg-yellow-100 text-yellow-800"
                    : consignor?.status === "SAVE_AS_DRAFT" ||
                      consignor?.status === "DRAFT"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {consignor?.status === "SAVE_AS_DRAFT"
                  ? "DRAFT"
                  : consignor?.status || "UNKNOWN"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralInfoViewTab;
