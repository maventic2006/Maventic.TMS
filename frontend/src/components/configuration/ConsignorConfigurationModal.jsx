import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { createConsignorRecord, updateConsignorRecord } from '../../redux/slices/consignorConfigurationSlice';

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
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  // Initialize form data when modal opens or record changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && record) {
        // Populate form with existing record data
        setFormData({ ...record });
      } else {
        // Initialize empty form for create mode
        const initialData = {};
        if (metadata && metadata.fields) {
          Object.keys(metadata.fields).forEach(fieldName => {
            const fieldConfig = metadata.fields[fieldName];
            initialData[fieldName] = '';
          });
        }
        setFormData(initialData);
      }
      setValidationErrors([]);
    }
  }, [isOpen, mode, record, metadata]);

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
      
      const value = formData[fieldName];
      if (fieldConfig.required && (!value || value.toString().trim() === '')) {
        errors.push({
          field: fieldName,
          message: `${fieldConfig.displayName || fieldName} is required`
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
    if (fieldName === metadata.primaryKey && fieldConfig.autoGenerate) return null;
    const auditFields = ['created_at', 'created_on', 'created_by', 'updated_at', 'updated_on', 'updated_by'];
    if (auditFields.includes(fieldName)) return null;

    const value = formData[fieldName] || '';
    const error = validationErrors.find(err => err.field === fieldName);
    
    return (
      <Input
        key={fieldName}
        label={fieldConfig.displayName || fieldName}
        value={value}
        onChange={(val) => handleFieldChange(fieldName, val)}
        error={error?.message}
        required={fieldConfig.required}
        placeholder={`Enter ${fieldConfig.displayName || fieldName}`}
        disabled={loading}
        type={fieldConfig.type === 'int' ? 'number' : 'text'}
      />
    );
  };

  if (!metadata) return null;

  const title = mode === 'create' ? `Create New ${metadata.displayName || configName}` : `Edit ${metadata.displayName || configName}`;

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