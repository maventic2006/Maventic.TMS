import React from "react";
import { CheckCircle, XCircle, Clock } from "lucide-react";

const StatusPill = ({ status }) => {
  const getStatusStyles = (status) => {
    const normalizedStatus = status?.toLowerCase();
    
    switch (normalizedStatus) {
      case 'active':
        // Green theme color for success/active state
        return 'bg-green-100 text-green-800 border border-green-300';
      case 'approved':
        // Blue theme color for approved state
        return 'bg-blue-100 text-blue-800 border border-blue-300';
      case 'pending':
        // Yellow/Amber theme color for warning/pending state
        return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case 'inactive':
        // Red theme color for error/inactive state
        return 'bg-red-100 text-red-800 border border-red-300';
      case 'rejected':
        // Darker red for rejected state
        return 'bg-red-100 text-red-900 border border-red-400';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    const normalizedStatus = status?.toLowerCase();
    
    switch (normalizedStatus) {
      case 'active':
      case 'approved':
        return <CheckCircle className="h-3 w-3" />;
      case 'pending':
        return <Clock className="h-3 w-3" />;
      case 'inactive':
      case 'rejected':
        return <XCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };
  
  const icon = getStatusIcon(status);

  return (
    <span className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all duration-200 ${getStatusStyles(status)}`}>
      {icon}
      <span className="capitalize">{status || 'Unknown'}</span>
    </span>
  );
};

export default StatusPill;
