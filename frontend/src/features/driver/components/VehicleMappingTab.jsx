import React from 'react';
import { getPageTheme } from '../../../theme.config';

const VehicleMappingTab = ({ formData, onFormDataChange, validationErrors, onTabErrorChange }) => {
  const theme = getPageTheme('tab');
  
  return (
    <div className='border-2 border-dashed rounded-lg p-12 text-center' style={{ borderColor: theme.colors.card.border }}>
      <h3 className='text-xl font-semibold mb-2' style={{ color: theme.colors.text.primary }}>Vehicle Mapping Tab</h3>
      <p style={{ color: theme.colors.text.secondary }}>Coming soon - Driver-vehicle assignments</p>
    </div>
  );
};

export default VehicleMappingTab;
