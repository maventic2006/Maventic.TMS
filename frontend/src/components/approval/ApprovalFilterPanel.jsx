import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X } from 'lucide-react';
import { getPageTheme, getComponentTheme } from '../../theme.config';

const theme = getPageTheme('list');
const buttonTheme = getComponentTheme('actionButton');
const inputTheme = getComponentTheme('formInput');

/**
 * ApprovalFilterPanel Component
 * 
 * Collapsible filter panel for approval requests - Matches Vehicle Maintenance design.
 * Features:
 * - Request Type dropdown filter
 * - Date Range filters (From/To)
 * - Status filter with default 'Pending for Approval'
 * - Apply and Clear buttons
 * - Smooth slide-in animation
 * 
 * @param {boolean} isVisible - Panel visibility state
 * @param {object} filters - Current filter values { requestType, dateFrom, dateTo, status }
 * @param {function} onFilterChange - Filter change callback
 * @param {function} onApplyFilters - Apply filters callback
 * @param {function} onClearFilters - Clear filters callback
 * @param {Array} approvalTypes - Approval type options for dropdown
 */
const ApprovalFilterPanel = ({
  isVisible,
  filters,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
  approvalTypes = []
}) => {
  // Handle input change
  const handleChange = (field, value) => {
    onFilterChange?.({ ...filters, [field]: value });
  };

  // Status options - matches backend status values
  const statusOptions = [
    { value: '', label: 'All' },
    { value: 'Pending for Approval', label: 'Pending for Approval' },
    { value: 'Approve', label: 'Approved' },
    { value: 'Sent Back', label: 'Sent Back' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Active', label: 'Active' }
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0, y: -20 }}
          animate={{ opacity: 1, height: 'auto', y: 0 }}
          exit={{ opacity: 0, height: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="rounded-xl p-6 overflow-hidden"
          style={{
            boxShadow: theme.colors.card.shadow,
            background: theme.colors.card.background,
            border: `1px solid ${theme.colors.card.border}`,
          }}
        >
          {/* Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Request Type */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: theme.colors.text.primary }}>
                Request Type
              </label>
              <select
                value={filters.requestType || ''}
                onChange={(e) => handleChange('requestType', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2"
                style={{
                  border: `1px solid ${inputTheme.border.default}`,
                  background: inputTheme.background,
                  color: inputTheme.text,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = inputTheme.border.focus;
                  e.target.style.boxShadow = `0 0 0 3px ${inputTheme.border.focus}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = inputTheme.border.default;
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="">All Types</option>
                {approvalTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: theme.colors.text.primary }}>
                Date From
              </label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleChange('dateFrom', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2"
                style={{
                  border: `1px solid ${inputTheme.border.default}`,
                  background: inputTheme.background,
                  color: inputTheme.text,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = inputTheme.border.focus;
                  e.target.style.boxShadow = `0 0 0 3px ${inputTheme.border.focus}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = inputTheme.border.default;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: theme.colors.text.primary }}>
                Date To
              </label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => handleChange('dateTo', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2"
                style={{
                  border: `1px solid ${inputTheme.border.default}`,
                  background: inputTheme.background,
                  color: inputTheme.text,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = inputTheme.border.focus;
                  e.target.style.boxShadow = `0 0 0 3px ${inputTheme.border.focus}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = inputTheme.border.default;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: theme.colors.text.primary }}>
                Status
              </label>
              <select
                value={filters.status || 'Pending for Approval'}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2"
                style={{
                  border: `1px solid ${inputTheme.border.default}`,
                  background: inputTheme.background,
                  color: inputTheme.text,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = inputTheme.border.focus;
                  e.target.style.boxShadow = `0 0 0 3px ${inputTheme.border.focus}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = inputTheme.border.default;
                  e.target.style.boxShadow = 'none';
                }}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onApplyFilters}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 shadow-sm"
              style={{
                background: buttonTheme.primary.background,
                color: buttonTheme.primary.text,
                border: `1px solid ${buttonTheme.primary.border}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = buttonTheme.primary.hover;
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = buttonTheme.primary.background;
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
              }}
            >
              <Filter className="h-4 w-4" />
              <span>Apply Filters</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClearFilters}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200"
              style={{
                background: buttonTheme.secondary.background,
                color: buttonTheme.secondary.text,
                border: `1px solid ${buttonTheme.secondary.border}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = theme.colors.table.row.hover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = buttonTheme.secondary.background;
              }}
            >
              <X className="h-4 w-4" />
              <span>Clear Filters</span>
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ApprovalFilterPanel;
