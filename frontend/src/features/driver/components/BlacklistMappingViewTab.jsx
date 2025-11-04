import React from 'react';
import { Ban, Calendar } from 'lucide-react';
import { getPageTheme } from '../../../theme.config';

const BlacklistMappingViewTab = ({ driver }) => {
  const theme = getPageTheme('tab') || {};
  const blacklistMappings = driver?.blacklistMappings || [];

  const safeTheme = {
    colors: {
      text: {
        primary: theme.colors?.text?.primary || '#111827',
        secondary: theme.colors?.text?.secondary || '#6B7280',
      },
      card: {
        background: theme.colors?.card?.background || '#FFFFFF',
        border: theme.colors?.card?.border || '#E5E7EB',
      },
    },
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (blacklistMappings.length === 0) {
    return (
      <div className="text-center py-12">
        <Ban className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-500 mb-2">
          No Blacklist Records
        </h3>
        <p className="text-gray-400">
          This driver is not blacklisted by any entity.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {blacklistMappings.map((item, index) => (
        <div
          key={item.mappingId || index}
          className="border-2 rounded-lg p-6 border-red-200 bg-red-50"
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Ban className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3
                className="text-lg font-semibold"
                style={{ color: safeTheme.colors.text.primary }}
              >
                Blacklisted By: {item.blacklistedBy || 'N/A'}
              </h3>
              <p
                className="text-sm"
                style={{ color: safeTheme.colors.text.secondary }}
              >
                ID: {item.blacklistedById || 'N/A'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                {formatDate(item.validFrom)}
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
                className="text-sm font-medium"
                style={{ color: safeTheme.colors.text.primary }}
              >
                {formatDate(item.validTo)}
              </p>
            </div>
          </div>

          {item.remark && (
            <div className="mt-4">
              <label
                className="text-sm font-medium mb-2 block"
                style={{ color: safeTheme.colors.text.secondary }}
              >
                Reason
              </label>
              <p
                className="text-sm"
                style={{ color: safeTheme.colors.text.primary }}
              >
                {item.remark}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default BlacklistMappingViewTab;
