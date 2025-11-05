import React, { useState } from "react";
import { FileText, Calendar, Building, CheckCircle, XCircle, Upload, Plus, Download, Eye, Trash2, AlertTriangle, X } from "lucide-react";

const InfoField = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-xs font-semibold text-[#4A5568] uppercase tracking-wide">{label}</p>
    <p className="text-sm font-medium text-[#0D1A33]">{value || "N/A"}</p>
  </div>
);

const DocumentsViewTab = ({ vehicle, isEditMode }) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [newDocument, setNewDocument] = useState({
    documentType: "",
    documentNumber: "",
    issuedDate: "",
    expiryDate: "",
    issuingAuthority: "",
    remarks: "",
  });

  if (isEditMode) {
    return (
      <div className="text-center py-12">
        <p className="text-[#4A5568]">Edit mode for Documents coming soon...</p>
      </div>
    );
  }

  const documents = vehicle.documents || [];

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.floor((expiry - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUploadDocument = () => {
    // TODO: Implement API call to upload document
    console.log("Uploading document:", newDocument, selectedFile);
    setShowUploadModal(false);
    // Reset form
    setNewDocument({
      documentType: "",
      documentNumber: "",
      issuedDate: "",
      expiryDate: "",
      issuingAuthority: "",
      remarks: "",
    });
    setSelectedFile(null);
  };

  // Mock statistics
  const totalDocs = documents.length;
  const expiredDocs = documents.filter(doc => isExpired(doc.expiryDate)).length;
  const expiringSoonDocs = documents.filter(doc => isExpiringSoon(doc.expiryDate)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
        <div>
          <h3 className="text-lg font-bold text-[#0D1A33]">Vehicle Documents</h3>
          <p className="text-sm text-[#4A5568] mt-1">Manage all vehicle related documents and certificates</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg transition-all duration-200 text-sm font-semibold"
        >
          <Upload className="h-4 w-4" />
          Upload Document
        </button>
      </div>

      {/* Document Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#DBEAFE] rounded-lg p-4 border border-[#1D4ED8]">
          <p className="text-xs font-semibold text-[#1D4ED8] uppercase tracking-wide mb-1">Total Documents</p>
          <p className="text-2xl font-bold text-[#1D4ED8]">{totalDocs}</p>
        </div>
        <div className="bg-[#FEF3C7] rounded-lg p-4 border border-[#F59E0B]">
          <p className="text-xs font-semibold text-[#F59E0B] uppercase tracking-wide mb-1">Expiring Soon</p>
          <p className="text-2xl font-bold text-[#F59E0B]">{expiringSoonDocs}</p>
          <p className="text-xs text-[#F59E0B] mt-1">Within 30 days</p>
        </div>
        <div className="bg-[#FEE2E2] rounded-lg p-4 border border-[#EF4444]">
          <p className="text-xs font-semibold text-[#EF4444] uppercase tracking-wide mb-1">Expired</p>
          <p className="text-2xl font-bold text-[#EF4444]">{expiredDocs}</p>
          <p className="text-xs text-[#EF4444] mt-1">Requires renewal</p>
        </div>
      </div>

      {/* Documents List */}
      {documents.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-[#E5E7EB]">
          <FileText className="h-16 w-16 text-[#E5E7EB] mx-auto mb-4" />
          <p className="text-[#4A5568] font-medium">No documents found</p>
          <p className="text-sm text-[#4A5568] mt-2">Click "Upload Document" to add the first document</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {documents.map((doc, index) => {
            const expired = isExpired(doc.expiryDate);
            const expiringSoon = isExpiringSoon(doc.expiryDate);
            
            return (
              <div key={index} className="bg-white rounded-lg border border-[#E5E7EB] p-6 hover:shadow-md transition-all duration-200">
                {/* Header */}
                <div className="flex items-start justify-between mb-4 pb-4 border-b border-[#E5E7EB]">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 bg-[#E0E7FF] rounded-lg flex-shrink-0">
                      <FileText className="h-5 w-5 text-[#6366F1]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-[#0D1A33] text-base truncate">{doc.documentType}</h4>
                      <p className="text-sm text-[#4A5568] mt-1 truncate">{doc.documentNumber}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-3">
                    {expired ? (
                      <span className="px-3 py-1 bg-[#FEE2E2] text-[#EF4444] text-xs font-semibold rounded-full flex items-center gap-1 whitespace-nowrap">
                        <XCircle className="h-3 w-3" />
                        Expired
                      </span>
                    ) : expiringSoon ? (
                      <span className="px-3 py-1 bg-[#FEF3C7] text-[#F59E0B] text-xs font-semibold rounded-full flex items-center gap-1 whitespace-nowrap">
                        <AlertTriangle className="h-3 w-3" />
                        Expiring Soon
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-[#D1FAE5] text-[#10B981] text-xs font-semibold rounded-full flex items-center gap-1 whitespace-nowrap">
                        <CheckCircle className="h-3 w-3" />
                        Valid
                      </span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-4">
                  <div className="grid grid-cols-2 gap-3">
                    <InfoField label="Issued Date" value={doc.issuedDate} />
                    <InfoField label="Expiry Date" value={doc.expiryDate} />
                  </div>
                  <InfoField label="Issuing Authority" value={doc.issuingAuthority} />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-[#E5E7EB]">
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#F5F7FA] hover:bg-[#E5E7EB] rounded-lg transition-colors text-sm font-medium text-[#0D1A33]">
                    <Eye className="h-4 w-4" />
                    View
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#F5F7FA] hover:bg-[#E5E7EB] rounded-lg transition-colors text-sm font-medium text-[#0D1A33]">
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                  <button className="p-2 hover:bg-[#FEE2E2] rounded-lg transition-colors">
                    <Trash2 className="h-4 w-4 text-[#EF4444]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB] sticky top-0 bg-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#E0E7FF] rounded-lg">
                  <Upload className="h-5 w-5 text-[#6366F1]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0D1A33]">Upload Document</h3>
                  <p className="text-sm text-[#4A5568]">Add a new vehicle document</p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 hover:bg-[#F5F7FA] rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-[#4A5568]" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* File Upload */}
              <div>
                <label className="block text-xs font-bold text-[#0D1A33] uppercase tracking-wide mb-2">
                  Upload File *
                </label>
                <div className="border-2 border-dashed border-[#E5E7EB] rounded-lg p-6 text-center hover:border-[#6366F1] transition-colors cursor-pointer">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="fileUpload"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />
                  <label htmlFor="fileUpload" className="cursor-pointer">
                    <Upload className="h-12 w-12 text-[#4A5568] mx-auto mb-3" />
                    <p className="text-sm font-medium text-[#0D1A33] mb-1">
                      {selectedFile ? selectedFile.name : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-xs text-[#4A5568]">PDF, JPG, PNG, DOC (Max 10MB)</p>
                  </label>
                </div>
              </div>

              {/* Document Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-[#0D1A33] uppercase tracking-wide mb-2">
                    Document Type *
                  </label>
                  <select
                    value={newDocument.documentType}
                    onChange={(e) => setNewDocument({ ...newDocument, documentType: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] text-sm"
                  >
                    <option value="">Select Document Type</option>
                    <option value="RC">Registration Certificate (RC)</option>
                    <option value="Insurance">Insurance Certificate</option>
                    <option value="Permit">Permit</option>
                    <option value="Fitness">Fitness Certificate</option>
                    <option value="PUC">Pollution Under Control (PUC)</option>
                    <option value="Road Tax">Road Tax Receipt</option>
                    <option value="Loan">Loan Agreement</option>
                    <option value="Lease">Lease Agreement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0D1A33] uppercase tracking-wide mb-2">
                    Document Number *
                  </label>
                  <input
                    type="text"
                    value={newDocument.documentNumber}
                    onChange={(e) => setNewDocument({ ...newDocument, documentNumber: e.target.value })}
                    placeholder="Enter document number"
                    className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0D1A33] uppercase tracking-wide mb-2">
                    Issued Date *
                  </label>
                  <input
                    type="date"
                    value={newDocument.issuedDate}
                    onChange={(e) => setNewDocument({ ...newDocument, issuedDate: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0D1A33] uppercase tracking-wide mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={newDocument.expiryDate}
                    onChange={(e) => setNewDocument({ ...newDocument, expiryDate: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0D1A33] uppercase tracking-wide mb-2">
                  Issuing Authority *
                </label>
                <input
                  type="text"
                  value={newDocument.issuingAuthority}
                  onChange={(e) => setNewDocument({ ...newDocument, issuingAuthority: e.target.value })}
                  placeholder="Enter issuing authority"
                  className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0D1A33] uppercase tracking-wide mb-2">
                  Remarks
                </label>
                <textarea
                  value={newDocument.remarks}
                  onChange={(e) => setNewDocument({ ...newDocument, remarks: e.target.value })}
                  placeholder="Additional notes or remarks..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] text-sm"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-[#E5E7EB] bg-[#F9FAFB]">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-6 py-2.5 border border-[#E5E7EB] text-[#4A5568] rounded-lg hover:bg-white transition-colors text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadDocument}
                className="px-6 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg transition-colors text-sm font-semibold"
              >
                Upload Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsViewTab;
