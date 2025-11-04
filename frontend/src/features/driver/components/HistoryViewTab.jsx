import React from 'react';
import { Briefcase, Calendar, Building, MapPin } from 'lucide-react';
import { getPageTheme } from '../../../theme.config';

const HistoryViewTab = ({ driver }) => {
  const theme = getPageTheme('tab') || {};
  const history = driver?.history || [];

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

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-500 mb-2">
          No Employment History
        </h3>
        <p className="text-gray-400">
          No employment history information has been added yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {history.map((item, index) => (
        <div
          key={item.historyId || index}
          className="border-2 rounded-lg p-6"
          style={{
            borderColor: safeTheme.colors.card.border,
            backgroundColor: safeTheme.colors.card.background,
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3
                  className="text-lg font-semibold"
                  style={{ color: safeTheme.colors.text.primary }}
                >
                  {item.employer || 'N/A'}
                </h3>
                <p
                  className="text-sm"
                  style={{ color: safeTheme.colors.text.secondary }}
                >
                  {item.jobTitle || 'N/A'}
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-medium border border-blue-200 bg-blue-100 text-blue-800">
              {item.employmentStatus || 'N/A'}
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
                  From Date
                </label>
              </div>
              <p
                className="text-sm font-medium"
                style={{ color: safeTheme.colors.text.primary }}
              >
                {formatDate(item.fromDate)}
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
                  To Date
                </label>
              </div>
              <p
                className="text-sm font-medium"
                style={{ color: safeTheme.colors.text.primary }}
              >
                {formatDate(item.toDate)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HistoryViewTab;
