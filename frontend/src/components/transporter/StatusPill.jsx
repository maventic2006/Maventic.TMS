import React from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

const StatusPill = ({ status }) => {
  const getStatusStyles = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-500 text-white';
      case 'Approved':
        return 'bg-blue-500 text-white';
      case 'Pending':
        return 'bg-yellow-500 text-white';
      case 'Inactive':
        return 'bg-red-500 text-white';
      case 'Rejected':
        return 'bg-red-600 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active':
      case 'Approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'Pending':
        return <Clock className="h-4 w-4" />;
      case 'Inactive':
      case 'Rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <span className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium ${getStatusStyles(status)}`}>
      {getStatusIcon(status)}
      <span>{status}</span>
    </span>
  );
};

export default StatusPill;