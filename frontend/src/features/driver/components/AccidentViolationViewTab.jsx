import React from 'react';
import { AlertTriangle, Calendar, Car } from 'lucide-react';
import { getPageTheme } from '../../../theme.config';

const AccidentViolationViewTab = ({ driver }) => {
  const theme = getPageTheme('tab') || {};
  const accidents = driver?.accidents || [];

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

  if (accidents.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-500 mb-2">
          No Accident or Violation Records
        </h3>
        <p className="text-gray-400">
          No accident or violation records have been added yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {accidents.map((item, index) => (
        <div
          key={item.violationId || index}
          className="border-2 rounded-lg p-6"
          style={{
            borderColor: safeTheme.colors.card.border,
            backgroundColor: safeTheme.colors.card.background,
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3
                  className="text-lg font-semibold"
                  style={{ color: safeTheme.colors.text.primary }}
                >
                  {item.type || 'N/A'}
                </h3>
                <p
                  className="text-sm"
                  style={{ color: safeTheme.colors.text.secondary }}
                >
                  {formatDate(item.date)}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {item.description && (
              <div>
                <label
                  className="text-sm font-medium mb-2 block"
                  style={{ color: safeTheme.colors.text.secondary }}
                >
                  Description
                </label>
                <p
                  className="text-sm"
                  style={{ color: safeTheme.colors.text.primary }}
                >
                  {item.description}
                </p>
              </div>
            )}

            {item.vehicleRegnNumber && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Car
                    className="w-4 h-4"
                    style={{ color: safeTheme.colors.text.secondary }}
                  />
                  <label
                    className="text-sm font-medium"
                    style={{ color: safeTheme.colors.text.secondary }}
                  >
                    Vehicle Registration Number
                  </label>
                </div>
                <p
                  className="text-sm font-medium"
                  style={{ color: safeTheme.colors.text.primary }}
                >
                  {item.vehicleRegnNumber}
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AccidentViolationViewTab;
