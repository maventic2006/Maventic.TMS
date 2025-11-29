import React from "react";
import { CheckCircle, XCircle, Clock } from "lucide-react";

const StatusPill = ({ status }) => {
  const getStatusStyles = (status) => {
    const normalizedStatus = status?.toLowerCase();
    
    switch (normalizedStatus) {
      case 'active':
      case 'delivered':
        // Delivered: Green theme from specification
        return 'bg-[#D1FAE5] text-[#10B981]';
      case 'approved':
      case 'processing':
        // Processing: Blue/Indigo theme from specification
        return 'bg-[#E0E7FF] text-[#6366F1]';
      case 'pending':
        // Use Draft styling for pending
        return 'bg-[#E5E7EB] text-[#6B7280]';
      case 'inactive':
      case 'rejected':
      case 'cancelled':
        // Cancelled: Red theme from specification
        return 'bg-[#FEE2E2] text-[#EF4444]';
      case 'delayed':
        // Delayed: Orange/Amber theme from specification
        return 'bg-[#FEF3C7] text-[#F97316]';
      case 'draft':
        // Draft: Gray theme from specification
        return 'bg-[#E5E7EB] text-[#6B7280]';
      default:
        return 'bg-[#E5E7EB] text-[#6B7280]';
    }
  };

  const getStatusIcon = (status) => {
    const normalizedStatus = status?.toLowerCase();
    
    switch (normalizedStatus) {
      case 'active':
      case 'approved':
      case 'delivered':
        return <CheckCircle className="h-3 w-3" />;
      case 'pending':
      case 'processing':
      case 'draft':
        return <Clock className="h-3 w-3" />;
      case 'inactive':
      case 'rejected':
      case 'cancelled':
      case 'delayed':
        return <XCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };
  
  const icon = getStatusIcon(status);

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${getStatusStyles(status)}`}>
      {icon}
      <span className="capitalize">{status || 'Unknown'}</span>
    </span>
  );
};

export { StatusPill };
export default StatusPill;
