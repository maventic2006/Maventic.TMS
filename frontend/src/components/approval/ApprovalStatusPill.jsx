import { CheckCircle, Clock, XCircle, RotateCcw } from 'lucide-react';

/**
 * ApprovalStatusPill Component
 * 
 * Color-coded status pill for approval requests.
 * Consistent with Vehicle and Driver status pills.
 * 
 * @param {string} status - Status value:
 *   - 'PENDING' -> Yellow pending pill
 *   - 'Approve' | 'APPROVED' -> Green approved pill  
 *   - 'Sent Back' | 'SENT_BACK' -> Orange sent back pill
 *   - 'Rejected' | 'REJECTED' -> Red rejected pill
 * @param {string} className - Additional CSS classes
 */
const ApprovalStatusPill = ({ status, className = '' }) => {
  // Status configuration
  const statusConfig = {
    'PENDING': {
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-200',
      icon: Clock,
      label: 'Pending'
    },
    'Approve': {
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-200',
      icon: CheckCircle,
      label: 'Approved'
    },
    'APPROVED': {
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-200',
      icon: CheckCircle,
      label: 'Approved'
    },
    'Sent Back': {
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-800',
      borderColor: 'border-orange-200',
      icon: RotateCcw,
      label: 'Sent Back'
    },
    'SENT_BACK': {
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-800',
      borderColor: 'border-orange-200',
      icon: RotateCcw,
      label: 'Sent Back'
    },
    'Rejected': {
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      borderColor: 'border-red-200',
      icon: XCircle,
      label: 'Rejected'
    },
    'REJECTED': {
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      borderColor: 'border-red-200',
      icon: XCircle,
      label: 'Rejected'
    }
  };

  const config = statusConfig[status] || statusConfig['PENDING']; // ✅ STANDARDIZED: Default to "PENDING"
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor} ${className}`}
    >
      <Icon className="w-3.5 h-3.5 mr-1.5" />
      {config.label}
    </span>
  );
};

export default ApprovalStatusPill;
