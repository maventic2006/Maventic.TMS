import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, FormField } from '../ui/Input';
import { createConsignorRecord, updateConsignorRecord, fetchConsignorConfigurationDropdownOptions } from '../../redux/slices/consignorConfigurationSlice';

const ConsignorConfigurationModal = ({
  isOpen,
  onClose,
  mode = 'create', // 'create' | 'edit'
  record = null,
  configName,
  metadata,
  onSuccess
}) => {
  const dispatch = useDispatch();
  const { dropdownOptions } = useSelector(state => state.consignorConfiguration);
  
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  // Initialize form data when modal opens or record changes
  useEffect(() => {
    if (isOpen && configName) {
      // Fetch dropdown options when modal opens
      dispatch(fetchConsignorConfigurationDropdownOptions(configName));
      
      if (mode === 'edit' && record) {
        // Populate form with existing record data
        setFormData({ ...record });
      } else {
        // Initialize empty form for create mode
        const initialData = {};
        if (metadata && metadata.fields) {
          Object.keys(metadata.fields).forEach(fieldName => {
            const fieldConfig = metadata.fields[fieldName];
            // Set default values for certain field types
            if (fieldConfig.defaultValue) {
              initialData[fieldName] = fieldConfig.defaultValue;
            } else if (fieldConfig.inputType === 'date') {
              initialData[fieldName] = '';
            } else {
              initialData[fieldName] = '';
            }
          });
        }
        setFormData(initialData);
      }
      setValidationErrors([]);
    }
  }, [isOpen, mode, record, metadata, configName, dispatch]);

  const handleFieldChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Clear validation error for this field when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors(prev => prev.filter(err => err.field !== fieldName));
    }
  };

  const validateForm = () => {
    const errors = [];
    
    if (!metadata || !metadata.fields) return errors;

    Object.keys(metadata.fields).forEach(fieldName => {
      const fieldConfig = metadata.fields[fieldName];
      
      // Skip auto-generated primary keys from validation
      if (fieldName === metadata.primaryKey && fieldConfig.autoGenerate) return;
      
      // Skip audit fields from validation
      const auditFields = ['created_at', 'created_on', 'created_by', 'updated_at', 'updated_on', 'updated_by'];
      if (auditFields.includes(fieldName)) return;
      
      // Skip non-editable fields for create mode from validation
      if (mode === 'create' && !fieldConfig.editable) return;
      
      // Skip hidden fields from validation
      if (fieldConfig.inputType === 'hidden' || fieldConfig.suggestedInputType === 'hidden') return;
      
      // Skip all auto-generated fields in create mode from validation (backend will generate them)
      if (mode === 'create' && fieldConfig.autoGenerate) return;
      
      const value = formData[fieldName];
      const fieldLabel = fieldConfig.displayName || fieldConfig.label || fieldName;
      
      if (fieldConfig.required && (!value || value.toString().trim() === '')) {
        errors.push({
          field: fieldName,
          message: `${fieldLabel} is required`
        });
      }
    });

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setLoading(true);
    try {
      let result;
      
      if (mode === 'create') {
        result = await dispatch(createConsignorRecord({ configName, data: formData }));
      } else {
        const recordId = record[metadata.primaryKey];
        result = await dispatch(updateConsignorRecord({ configName, id: recordId, data: formData }));
      }

      if (result.type.endsWith('/fulfilled')) {
        onSuccess && onSuccess();
        onClose();
        setFormData({});
        setValidationErrors([]);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({});
    setValidationErrors([]);
    onClose();
  };

  const renderFormField = (fieldName, fieldConfig) => {
    // Skip auto-generated primary keys
    if (fieldName === metadata.primaryKey && fieldConfig.autoGenerate) return null;
    
    // Skip audit fields
    const auditFields = ['created_at', 'created_on', 'created_by', 'updated_at', 'updated_on', 'updated_by'];
    if (auditFields.includes(fieldName)) return null;
    
    // Skip non-editable fields for create mode
    if (mode === 'create' && !fieldConfig.editable) return null;
    
    // Skip hidden fields
    if (fieldConfig.inputType === 'hidden' || fieldConfig.suggestedInputType === 'hidden') return null;
    
    // Skip all auto-generated fields in create mode (backend will generate them)
    if (mode === 'create' && fieldConfig.autoGenerate) return null;

    const value = formData[fieldName] || '';
    const error = validationErrors.find(err => err.field === fieldName);
    const fieldLabel = fieldConfig.displayName || fieldConfig.label || fieldName;

    // Use database schema suggested input type if available, otherwise fall back to configured type
    const inputType = fieldConfig.suggestedInputType || fieldConfig.inputType;
    
    // Show database schema info for debugging (in development)
    if (fieldConfig.dbSchema && process.env.NODE_ENV === 'development') {
      console.log(`Field ${fieldName}: DB Type=${fieldConfig.dbSchema.dataType}, Suggested=${fieldConfig.suggestedInputType}, Using=${inputType}`);
    }

    // Determine input type based on field configuration and database schema
    const getInputType = () => {
      if (inputType === 'date') return 'date';
      if (inputType === 'datetime-local') return 'datetime-local';
      if (inputType === 'time') return 'time';
      if (inputType === 'number' || fieldConfig.type === 'int' || fieldConfig.type === 'decimal') return 'number';
      if (inputType === 'email') return 'email';
      if (inputType === 'tel') return 'tel';
      if (inputType === 'url') return 'url';
      return 'text';
    };

    // Handle different field types based on database schema suggestions
    if (inputType === 'select') {
      // Get dropdown options for this field
      const options = dropdownOptions[fieldName] || [];
      
      return (
        <FormField 
          key={fieldName}
          label={fieldLabel}
          error={error?.message}
          required={fieldConfig.required}
        >
          <select
            value={value}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Select {fieldLabel}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {/* {fieldConfig.dbSchema && (
            <div className="mt-1 text-xs text-gray-500">
              DB: {fieldConfig.dbSchema.fullType} {fieldConfig.dbSchema.nullable ? '(nullable)' : '(required)'}
            </div>
          )} */}
        </FormField>
      );
    } else if (inputType === 'textarea') {
      return (
        <FormField 
          key={fieldName}
          label={fieldLabel}
          error={error?.message}
          required={fieldConfig.required}
        >
          <textarea
            value={value}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            placeholder={`Enter ${fieldLabel}`}
            disabled={loading}
            rows={fieldConfig.dbSchema?.dataType === 'text' ? 4 : 3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          {/* {fieldConfig.dbSchema && (
            <div className="mt-1 text-xs text-gray-500">
              DB: {fieldConfig.dbSchema.fullType} {fieldConfig.dbSchema.nullable ? '(nullable)' : '(required)'}
            </div>
          )} */}
        </FormField>
      );
    } else if (inputType === 'checkbox') {
      // Boolean/checkbox fields
      return (
        <FormField 
          key={fieldName}
          label=""
          error={error?.message}
          required={fieldConfig.required}
        >
          <div className="flex items-center">
            <input
              type="checkbox"
              id={fieldName}
              checked={value === '1' || value === 1 || value === true || value === 'true'}
              onChange={(e) => handleFieldChange(fieldName, e.target.checked ? '1' : '0')}
              disabled={loading}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:bg-gray-100"
            />
            <label htmlFor={fieldName} className="ml-2 text-sm text-gray-700">
              {fieldLabel}
            </label>
          </div>
          {/* {fieldConfig.dbSchema && (
            <div className="mt-1 text-xs text-gray-500">
              DB: {fieldConfig.dbSchema.fullType} {fieldConfig.dbSchema.nullable ? '(nullable)' : '(required)'}
            </div>
          )} */}
        </FormField>
      );
    } else {
      // Regular input fields (text, number, date, etc.)
      const htmlInputType = getInputType();
      
      return (
        <FormField 
          key={fieldName}
          label={fieldLabel}
          error={error?.message}
          required={fieldConfig.required}
        >
          <Input
            value={value}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            placeholder={`Enter ${fieldLabel}`}
            disabled={loading}
            type={htmlInputType}
            min={htmlInputType === 'number' && fieldConfig.min ? fieldConfig.min : undefined}
            max={htmlInputType === 'number' && fieldConfig.max ? fieldConfig.max : undefined}
            step={htmlInputType === 'number' && fieldConfig.dbSchema?.dataType === 'decimal' ? '0.01' : undefined}
            maxLength={fieldConfig.dbSchema?.maxLength || undefined}
          />
          {/* {fieldConfig.dbSchema && (
            <div className="mt-1 text-xs text-gray-500">
              DB: {fieldConfig.dbSchema.fullType} {fieldConfig.dbSchema.nullable ? '(nullable)' : '(required)'}
              {fieldConfig.dbSchema.maxLength && ` (max: ${fieldConfig.dbSchema.maxLength})`}
            </div>
          )} */}
        </FormField>
      );
    }
  };

  if (!metadata) return null;

  const title = mode === 'create' ? `Create New ${metadata.displayName || metadata.name || configName}` : `Edit ${metadata.displayName || metadata.name || configName}`;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metadata.fields && Object.keys(metadata.fields).map(fieldName => {
            const fieldConfig = metadata.fields[fieldName];
            return renderFormField(fieldName, fieldConfig);
          })}
        </div>

        {validationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <h4 className="text-red-800 font-medium mb-1">Please fix the following errors:</h4>
            <ul className="text-red-600 text-sm space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>{error.message}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            loadingText={mode === 'create' ? 'Creating...' : 'Updating...'}
          >
            {mode === 'create' ? 'Create' : 'Update'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ConsignorConfigurationModal;