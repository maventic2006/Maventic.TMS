import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Filter, RefreshCw, ShieldCheck } from 'lucide-react';
import { getPageTheme, getComponentTheme } from '../../theme.config';

const theme = getPageTheme('list');
const buttonTheme = getComponentTheme('actionButton');

/**
 * ApprovalTopActionBar Component
 * 
 * Top action bar for approval list page - Matches Vehicle Maintenance design
 * Features:
 * - Back button
 * - Page title
 * - Show/Hide Filters toggle
 * - Refresh button
 * 
 * @param {number} totalCount - Total number of approvals
 * @param {boolean} isFiltersVisible - Filter panel visibility state
 * @param {function} onToggleFilters - Toggle filters callback
 * @param {function} onRefresh - Refresh data callback
 * @param {boolean} isLoading - Loading state
 * @param {function} onBack - Back navigation callback
 */
const ApprovalTopActionBar = ({
  totalCount = 0,
  isFiltersVisible,
  onToggleFilters,
  onRefresh,
  isLoading = false,
  onBack
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 rounded-xl p-3 my-2"
      style={{
        boxShadow: theme.colors.card.shadow,
        background: theme.colors.card.background,
        border: `1px solid ${theme.colors.card.border}`,
      }}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="p-2.5 rounded-lg transition-all duration-200"
          style={{
            background: theme.colors.primary.background,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = theme.colors.table.row.hover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = theme.colors.primary.background;
          }}
          title="Back to Portal"
        >
          <ArrowLeft className="h-5 w-5" style={{ color: theme.colors.text.primary}} />
        </motion.button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold" style={{ color: theme.colors.text.primary }}>
              Super Admin Approval List
            </h1>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3 w-full lg:w-auto">
        {/* Filter Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onToggleFilters}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200"
          style={{
            background: isFiltersVisible ? buttonTheme.primary.background : buttonTheme.secondary.background,
            color: isFiltersVisible ? buttonTheme.primary.text : buttonTheme.secondary.text,
            border: `1px solid ${isFiltersVisible ? buttonTheme.primary.border : buttonTheme.secondary.border}`,
          }}
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">{isFiltersVisible ? 'Hide Filters' : 'Show Filters'}</span>
        </motion.button>

        {/* Refresh Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: '#3B82F6',
            color: '#FFFFFF',
            border: '1px solid #2563EB',
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.background = '#2563EB';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#3B82F6';
            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
          }}
          title="Refresh Data"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ApprovalTopActionBar;
