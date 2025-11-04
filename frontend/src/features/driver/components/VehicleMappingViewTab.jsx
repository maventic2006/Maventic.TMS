import React from 'react';
import { Car, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { getPageTheme } from '../../../theme.config';

const VehicleMappingViewTab = ({ driver }) => {
  const theme = getPageTheme('tab') || {};
  const vehicleMappings = driver?.vehicleMappings || [];

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

  if (vehicleMappings.length === 0) {
    return (
      <div className="text-center py-12">
        <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-500 mb-2">
          No Vehicle Mappings
        </h3>
        <p className="text-gray-400">
          No vehicle mappings have been added yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {vehicleMappings.map((item, index) => (
        <div
          key={item.mappingId || index}
          className="border-2 rounded-lg p-6"
          style={{
            borderColor: safeTheme.colors.card.border,
            backgroundColor: safeTheme.colors.card.background,
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3
                  className="text-lg font-semibold"
                  style={{ color: safeTheme.colors.text.primary }}
                >
                  {item.vehicleNumber || item.vehicleId || 'N/A'}
                </h3>
                <p
                  className="text-sm"
                  style={{ color: safeTheme.colors.text.secondary }}
                >
                  Type: {item.vehicleType || 'N/A'}
                </p>
              </div>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${
                item.activeFlag
                  ? 'border-green-200 bg-green-100 text-green-800'
                  : 'border-red-200 bg-red-100 text-red-800'
              }`}
            >
              {item.activeFlag ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
              {item.activeFlag ? 'Active' : 'Inactive'}
            </span>
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
                Remark
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

export default VehicleMappingViewTab;
