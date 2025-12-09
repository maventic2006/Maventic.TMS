import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Edit3, Trash2, Download, Upload, Calendar, Flag, CheckCircle, XCircle, AlertCircle, Eye, X } from 'lucide-react';
import { Card, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../ui/Table';

const DocumentsTab = ({ transporter, transporterId, onUpdate }) => {
  // Use actual API data
  const documents = transporter?.documents || [];
  const [previewDocument, setPreviewDocument] = useState(null);

  // Document type mapping
  const getDocumentTypeLabel = (documentType) => {
    const typeMap = {
      'DT001': 'Transport License',
      'DT002': 'PAN Card',
      'DT003': 'Vehicle Insurance',
      'DT004': 'Registration Certificate',
      'DT005': 'GST Certificate'
    };
    return typeMap[documentType] || documentType;
  };

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusIcon = (active, validTo) => {
    const currentDate = new Date();
    const expiryDate = new Date(validTo);
    const daysUntilExpiry = Math.ceil((expiryDate - currentDate) / (1000 * 60 * 60 * 24));

    if (!active) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    } else if (daysUntilExpiry < 30) {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    } else {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getStatusText = (active, validTo) => {
    const currentDate = new Date();
    const expiryDate = new Date(validTo);
    const daysUntilExpiry = Math.ceil((expiryDate - currentDate) / (1000 * 60 * 60 * 24));

    if (!active) {
      return { text: 'Inactive', color: 'bg-red-100 text-red-800' };
    } else if (daysUntilExpiry < 0) {
      return { text: 'Expired', color: 'bg-red-100 text-red-800' };
    } else if (daysUntilExpiry < 30) {
      return { text: 'Expiring Soon', color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { text: 'Active', color: 'bg-green-100 text-green-800' };
    }
  };

  const handlePreviewDocument = (document) => {
    if (document.fileData && document.fileType) {
      setPreviewDocument({
        fileName: document.fileName,
        fileType: document.fileType,
        fileData: document.fileData,
      });
    }
  };

  const closePreview = () => {
    setPreviewDocument(null);
  };

  const DocumentCard = ({ document, index }) => {
    const statusInfo = getStatusText(document.active, document.validTo);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.15 }}
        whileHover={{ y: -4, scale: 1.02 }}
        className="p-6 rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white via-white to-gray-50 hover:shadow-xl hover:shadow-orange-100 hover:border-orange-300 transition-all duration-300"
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-text-primary mb-1">
                {getDocumentTypeLabel(document.documentType)}
              </h4>
              <p className="text-sm text-text-secondary font-medium bg-gray-100 px-3 py-1 rounded-lg">
                #{document.documentNumber || 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-xl">
              {getStatusIcon(document.active, document.validTo)}
            </div>
            <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold shadow-sm border ${statusInfo.color}`}>
              {statusInfo.text}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <Flag className="h-4 w-4 text-text-secondary" />
              <span className="text-text-secondary">Country:</span>
              <span className="text-text-primary font-medium">{document.country}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="h-4 w-4 text-text-secondary" />
              <span className="text-text-secondary">Valid From:</span>
              <span className="text-text-primary font-medium">{formatDateForDisplay(document.validFrom)}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="h-4 w-4 text-text-secondary" />
              <span className="text-text-secondary">Valid To:</span>
              <span className="text-text-primary font-medium">{formatDateForDisplay(document.validTo)}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <FileText className="h-4 w-4 text-text-secondary" />
              <span className="text-text-secondary">Ref:</span>
              <span className="text-text-primary font-medium">{document.referenceNumber || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-xs text-text-secondary">
            Document ID: {document.id} • User Type: {document.userType}
          </div>
          <div className="flex space-x-2">
            {document.fileData && document.fileType && (
              <Button variant="ghost" size="sm" onClick={() => handlePreviewDocument(document)} title="Preview">
                <Eye className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm" title="Download">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" title="Edit">
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" title="Delete">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="space-y-8"
    >
      <Card className="shadow-xl bg-gradient-to-br from-white via-white to-orange-50/30 border-white/50 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center space-x-3"
            >
              <div className="p-3 bg-gradient-to-r from-orange-100 to-amber-100 rounded-xl">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-text-primary to-orange-600 bg-clip-text text-transparent">
                  Business Documents
                </h3>
                <p className="text-text-secondary text-sm mt-1">Legal documents and certifications</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button 
                variant="primary"
                size="sm"
                className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Upload className="h-4 w-4" />
                <span>Upload Document</span>
              </Button>
            </motion.div>
          </div>

          {documents.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {documents.map((document, index) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 mb-8">
              <FileText className="h-16 w-16 text-text-secondary opacity-40 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-text-primary mb-2">
                No Documents Uploaded
              </h4>
              <p className="text-text-secondary mb-4">
                Upload documents to complete the transporter profile.
              </p>
              <Button 
                variant="primary"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>Upload First Document</span>
              </Button>
            </div>
          )}

          {/* Documents Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800">
                  <TableHead className="text-white">Document Type</TableHead>
                  <TableHead className="text-white">Document Number</TableHead>
                  <TableHead className="text-white">Country</TableHead>
                  <TableHead className="text-white">Valid From</TableHead>
                  <TableHead className="text-white">Valid To</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white">User Type</TableHead>
                  <TableHead className="text-white text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((document, index) => {
                  const statusInfo = getStatusText(document.active, document.validTo);
                  
                  return (
                    <TableRow 
                      key={document.id}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-primary-accent" />
                          <span>{document.documentType}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {document.documentNumber}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Flag className="h-4 w-4 text-text-secondary" />
                          <span>{document.country}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-text-secondary" />
                          <span>{document.validFrom}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-text-secondary" />
                          <span>{document.validTo}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(document.active, document.validTo)}
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                            {statusInfo.text}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {document.userType}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center space-x-1">
                          {document.fileData && document.fileType && (
                            <Button variant="ghost" size="sm" onClick={() => handlePreviewDocument(document)} title="Preview">
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" title="Download">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Edit">
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Document Statistics */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Total Documents</span>
              </div>
              <p className="text-2xl font-bold text-blue-900 mt-2">
                {documents.length}
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">Active</span>
              </div>
              <p className="text-2xl font-bold text-green-900 mt-2">
                {documents.filter(doc => doc.active && new Date(doc.validTo) > new Date()).length}
              </p>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-900">Expiring Soon</span>
              </div>
              <p className="text-2xl font-bold text-yellow-900 mt-2">
                {documents.filter(doc => {
                  const daysUntilExpiry = Math.ceil((new Date(doc.validTo) - new Date()) / (1000 * 60 * 60 * 24));
                  return doc.active && daysUntilExpiry > 0 && daysUntilExpiry < 30;
                }).length}
              </p>
            </div>

            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-red-900">Expired/Inactive</span>
              </div>
              <p className="text-2xl font-bold text-red-900 mt-2">
                {documents.filter(doc => !doc.active || new Date(doc.validTo) < new Date()).length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
    </motion.div>
  );
};

export default DocumentsTab;