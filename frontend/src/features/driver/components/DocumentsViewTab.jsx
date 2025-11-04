import React from 'react';
import {
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  Hash,
  AlertTriangle,
  MapPin,
} from 'lucide-react';
import { Country, State } from 'country-state-city';
import { getPageTheme } from '../../../theme.config';

const DocumentsViewTab = ({ driver }) => {
  const theme = getPageTheme('tab') || {};
  const documents = driver?.documents || [];

  const safeTheme = {
    colors: {
      text: {
        primary: theme.colors?.text?.primary || '#111827',
        secondary: theme.colors?.text?.secondary || '#6B7280',
      },
      status: {
        success: theme.colors?.status?.success || '#10B981',
        error: theme.colors?.status?.error || '#EF4444',
        warning: theme.colors?.status?.warning || '#F59E0B',
      },
      card: {
        background: theme.colors?.card?.background || '#FFFFFF',
        border: theme.colors?.card?.border || '#E5E7EB',
      },
    },
  };

  const getCountryName = (countryCode) => {
    if (!countryCode) return 'N/A';
    const country = Country.getCountryByCode(countryCode);
    return country ? country.name : countryCode;
  };

  const getStateName = (countryCode, stateCode) => {
    if (!countryCode || !stateCode) return 'N/A';
    const state = State.getStateByCodeAndCountry(stateCode, countryCode);
    return state ? state.name : stateCode;
  };

  const getStatusColor = (status) => {
    return status
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
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
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-500 mb-2">
          No Documents Found
        </h3>
        <p className="text-gray-400">
          No document information has been added yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {documents.map((document, index) => {
        const StatusIcon = getStatusIcon(document.status);
        const isExpired = isDocumentExpired(document.validTo);
        const isExpiringSoon = isDocumentExpiringSoon(document.validTo);

        return (
          <div
            key={document.documentId || index}
            className="border-2 rounded-lg p-6"
            style={{
              borderColor: safeTheme.colors.card.border,
              backgroundColor: safeTheme.colors.card.background,
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: safeTheme.colors.text.primary }}
                  >
                    {document.documentType || 'N/A'}
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: safeTheme.colors.text.secondary }}
                  >
                    Document #{document.documentNumber || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(
                    document.status
                  )}`}
                >
                  <StatusIcon className="w-3 h-3" />
                  {document.status ? 'Active' : 'Inactive'}
                </span>
                {isExpired && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium border border-red-200 bg-red-100 text-red-800 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Expired
                  </span>
                )}
                {!isExpired && isExpiringSoon && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium border border-orange-200 bg-orange-100 text-orange-800 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Expiring Soon
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Hash
                      className="w-4 h-4"
                      style={{ color: safeTheme.colors.text.secondary }}
                    />
                    <label
                      className="text-sm font-medium"
                      style={{ color: safeTheme.colors.text.secondary }}
                    >
                      Document Number
                    </label>
                  </div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: safeTheme.colors.text.primary }}
                  >
                    {document.documentNumber || 'N/A'}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin
                      className="w-4 h-4"
                      style={{ color: safeTheme.colors.text.secondary }}
                    />
                    <label
                      className="text-sm font-medium"
                      style={{ color: safeTheme.colors.text.secondary }}
                    >
                      Issuing Country
                    </label>
                  </div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: safeTheme.colors.text.primary }}
                  >
                    {getCountryName(document.issuingCountry)}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin
                      className="w-4 h-4"
                      style={{ color: safeTheme.colors.text.secondary }}
                    />
                    <label
                      className="text-sm font-medium"
                      style={{ color: safeTheme.colors.text.secondary }}
                    >
                      Issuing State
                    </label>
                  </div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: safeTheme.colors.text.primary }}
                  >
                    {getStateName(document.issuingCountry, document.issuingState) || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar
                      className="w-4 h-4"
                      style={{ color: safeTheme.colors.text.secondary }}
                    />
                    <label
                      className="text-sm font-medium"
                      style={{ color: safeTheme.colors.text.secondary }}
                    >
                      Valid From
                    </label>
                  </div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: safeTheme.colors.text.primary }}
                  >
                    {formatDate(document.validFrom)}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar
                      className="w-4 h-4"
                      style={{ color: safeTheme.colors.text.secondary }}
                    />
                    <label
                      className="text-sm font-medium"
                      style={{ color: safeTheme.colors.text.secondary }}
                    >
                      Valid To
                    </label>
                  </div>
                  <p
                    className={`text-sm font-medium ${
                      isExpired
                        ? 'text-red-600'
                        : isExpiringSoon
                        ? 'text-orange-600'
                        : ''
                    }`}
                    style={
                      !isExpired && !isExpiringSoon
                        ? { color: safeTheme.colors.text.primary }
                        : {}
                    }
                  >
                    {formatDate(document.validTo)}
                  </p>
                </div>

                {document.remarks && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText
                        className="w-4 h-4"
                        style={{ color: safeTheme.colors.text.secondary }}
                      />
                      <label
                        className="text-sm font-medium"
                        style={{ color: safeTheme.colors.text.secondary }}
                      >
                        Remarks
                      </label>
                    </div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: safeTheme.colors.text.primary }}
                    >
                      {document.remarks}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DocumentsViewTab;
