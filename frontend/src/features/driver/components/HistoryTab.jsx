import React from 'react';
import { getPageTheme } from '../../../theme.config';

const HistoryTab = ({ formData, onFormDataChange, validationErrors, onTabErrorChange }) => {
  const theme = getPageTheme('tab');
  
  return (
    <div className='border-2 border-dashed rounded-lg p-12 text-center' style={{ borderColor: theme.colors.card.border }}>
      <h3 className='text-xl font-semibold mb-2' style={{ color: theme.colors.text.primary }}>History Information Tab</h3>
      <p style={{ color: theme.colors.text.secondary }}>Coming soon - Employment history tracking</p>
    </div>
  );
};

export default HistoryTab;
