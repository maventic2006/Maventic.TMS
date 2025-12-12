import React, { useState, useEffect } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { getPageTheme } from '../../theme.config';

const UserApplicationAccessModal = ({ 
  isOpen, 
  onClose, 
  user,
  userApplicationAccess = [],
  availableApplications = [],
  onRevokeAccess,
  onGrantAccess,
  isLoading = false
  ,
  error = null,
  onRetry = null
}) => {
  const theme = getPageTheme('general');
  const [selectedApplication, setSelectedApplication] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
    const accessNoRole = !!(error && String(error).toLowerCase().includes('no role assigned'));
    const isUserActive = user?.active && String(user?.status || '').toUpperCase() === 'ACTIVE';

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedApplication('');
    }
  }, [isOpen]);

  // Filter out applications that user already has access to
  const availableToAdd = availableApplications.filter(
    app => !userApplicationAccess.some(access => access.applicationId === app.application_id)
  );

  const handleGrantAccess = async () => {
    if (!selectedApplication) return;
    
    setIsSubmitting(true);
    try {
      await onGrantAccess(user.userId, selectedApplication);
      setSelectedApplication('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeAccess = async (accessId) => {
    setIsSubmitting(true);
    try {
      await onRevokeAccess(accessId);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Manage Application Access - ${user?.fullName || ''}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* User Info Section */}
        <div 
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: theme.colors.card.background,
            borderColor: theme.colors.card.border
          }}
        >
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span style={{ color: theme.colors.text.secondary }}>User ID:</span>
              <span className="ml-2 font-medium" style={{ color: theme.colors.text.primary }}>
                {user?.userId}
              </span>
            </div>
            <div>
              <span style={{ color: theme.colors.text.secondary }}>Email:</span>
              <span className="ml-2 font-medium" style={{ color: theme.colors.text.primary }}>
                {user?.email}
              </span>
            </div>
            <div>
              <span style={{ color: theme.colors.text.secondary }}>User Type:</span>
              <span className="ml-2 font-medium" style={{ color: theme.colors.text.primary }}>
                {user?.userType}
              </span>
            </div>
            <div>
              <span style={{ color: theme.colors.text.secondary }}>Status:</span>
              <span 
                className="ml-2 px-2 py-1 rounded text-xs font-medium"
                style={{
                  backgroundColor: user?.active ? theme.colors.status.success : theme.colors.status.error,
                  color: '#FFFFFF'
                }}
              >
                {user?.active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* Current Application Access */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 flex items-center justify-between">
            <div>{error}</div>
            {onRetry && (
              <button
                onClick={onRetry}
                className="ml-4 px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                type="button"
              >
                Retry
              </button>
            )}
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold mb-3" style={{ color: theme.colors.text.primary }}>
            Current Application Access
          </h3>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" style={{ color: theme.colors.button.primary.background }} />
              <span className="ml-2" style={{ color: theme.colors.text.secondary }}>Loading access data...</span>
            </div>
          ) : userApplicationAccess.length === 0 ? (
            <div 
              className="p-6 text-center rounded-lg border"
              style={{
                backgroundColor: theme.colors.card.background,
                borderColor: theme.colors.card.border,
                color: theme.colors.text.secondary
              }}
            >
              No application access granted yet
            </div>
          ) : (
            <div className="space-y-2">
              {userApplicationAccess.map((access) => (
                <div
                  key={access.applicationAccessId}
                  className="flex items-center justify-between p-4 rounded-lg border hover:shadow-md transition-shadow"
                  style={{
                    backgroundColor: theme.colors.card.background,
                    borderColor: theme.colors.card.border
                  }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                        style={{
                          background: `linear-gradient(135deg, ${theme.colors.button.primary.background}, ${theme.colors.header.background})`
                        }}
                      >
                        {access.applicationName?.charAt(0) || 'A'}
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: theme.colors.text.primary }}>
                          {access.applicationName}
                        </p>
                        <p className="text-xs" style={{ color: theme.colors.text.secondary }}>
                          {access.applicationDescription || 'No description'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                      <div className="text-right text-xs" style={{ color: theme.colors.text.secondary }}>
                      <div>Valid: {access.validFrom} to {access.validTo}</div>
                      <div 
                        className="mt-1 px-2 py-1 rounded inline-block"
                        style={{
                          backgroundColor: access.isActive ? theme.colors.status.success : theme.colors.status.error,
                          color: '#FFFFFF'
                        }}
                      >
                        {access.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleRevokeAccess(access.applicationAccessId)}
                      disabled={isSubmitting}
                      className="p-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                      title="Revoke Access"
                    >
                      <X className="h-5 w-5 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add New Application Access */}
        {!accessNoRole && !isUserActive && (
          <div className="p-3 rounded-lg border bg-yellow-50 text-yellow-800">
            {`Cannot grant application access. User status: ${user?.status || 'N/A'}.`}
          </div>
        )}
        {!accessNoRole && isUserActive && (
        <div>
          <h3 className="text-lg font-semibold mb-3" style={{ color: theme.colors.text.primary }}>
            Grant New Application Access
          </h3>
          {availableToAdd.length === 0 ? (
            <div 
              className="p-4 text-center rounded-lg border"
              style={{
                backgroundColor: theme.colors.card.background,
                borderColor: theme.colors.card.border,
                color: theme.colors.text.secondary
              }}
            >
              All available applications have been granted access
            </div>
          ) : (
          <div className="flex gap-3">
            <select
              value={selectedApplication}
              onChange={(e) => setSelectedApplication(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
              style={{
                backgroundColor: theme.colors.input.background,
                borderColor: theme.colors.input.border.default,
                color: theme.colors.text.primary
              }}
              disabled={isSubmitting || !isUserActive}
            >
              <option value="">Select an application...</option>
              {availableToAdd.map((app) => (
                <option key={app.application_id} value={app.application_id}>
                  {app.application_name}
                </option>
              ))}
            </select>
            
            <Button
              onClick={handleGrantAccess}
                disabled={!selectedApplication || isSubmitting || !isUserActive}
              style={{
                backgroundColor: theme.colors.button.primary.background,
                color: theme.colors.button.primary.text
              }}
              className="flex items-center gap-2 px-6 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Granting...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Grant Access
                </>
              )}
            </Button>
          </div>
          )}
        </div>
        )}
      </div>
    </Modal>
  );
};

export default UserApplicationAccessModal;
