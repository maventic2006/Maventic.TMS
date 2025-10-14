import React from 'react';
import { motion } from 'framer-motion';
import { Building, Phone, Mail, Hash, MapPin, Loader2, Truck, Plane, Train, Ship, User, Calendar, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/Table';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import StatusPill from './StatusPill';

const TransportModeIcons = ({ modes }) => {
  const iconMap = {
    'R': { icon: Truck, label: 'R', color: 'text-green-500' },
    'A': { icon: Plane, label: 'A', color: 'text-blue-500' },
    'RL': { icon: Train, label: 'RL', color: 'text-purple-500' },
    'S': { icon: Ship, label: 'S', color: 'text-cyan-500' }
  };

  return (
    <div className="flex items-center space-x-2">
      {modes.map((mode, index) => {
        const modeData = iconMap[mode];
        const IconComponent = modeData?.icon;
        return IconComponent ? (
          <div key={index} className={`flex items-center space-x-1 ${modeData.color}`} title={`${mode === 'R' ? 'Road' : mode === 'A' ? 'Air' : mode === 'RL' ? 'Rail' : 'Sea'}`}>
            <IconComponent className="h-5 w-5" />
            <span className="text-pill font-medium">{modeData.label}</span>
          </div>
        ) : null;
      })}
    </div>
  );
};

const TransporterListTable = ({ 
  transporters, 
  loading, 
  onTransporterClick,
  // Pagination props
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  // Count props
  filteredCount
}) => {
  if (loading) {
    return (
      <Card className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3 text-text-secondary">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-body">Loading transporters...</span>
        </div>
      </Card>
    );
  }

  if (transporters.length === 0) {
    return (
      <Card className="text-center py-12">
        <div className="flex flex-col items-center space-y-4 text-text-secondary">
          <Building className="h-16 w-16 text-text-secondary opacity-40" />
          <div>
            <h3 className="text-subtitle text-text-primary mb-2">No Transporters Found</h3>
            <p className="text-body">Try adjusting your search criteria or create a new transporter.</p>
          </div>
        </div>
      </Card>
    );
  }

  // Pagination calculations
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <Card className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      {/* Results Count Section */}
      <div className=" px-4 py-2 border-b border-gray-200">
        <p className="text-md text-text-primary font-medium">
          <span className="text-primary-accent font-bold">{filteredCount}</span> Transporters Found
        </p>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 hover:from-slate-700 hover:via-slate-800 hover:to-slate-700 transition-all duration-300">
            <TableHead className="text-white w-16">
              <div className="flex items-center">
                Transporter ID
                <svg className="ml-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </TableHead>
            <TableHead className="text-white w-40">
              <div className="flex items-center">
                Business Name
                <svg className="ml-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </TableHead>
            <TableHead className="text-white w-32">Transport Mode</TableHead>
            <TableHead className="text-white w-28">Mobile Number</TableHead>
            <TableHead className="text-white w-40">Email ID</TableHead>
            <TableHead className="text-white w-32">TIN/PAN</TableHead>
            <TableHead className="text-white w-32">VAT/GST</TableHead>
            <TableHead className="text-white w-48">Address</TableHead>
            <TableHead className="text-white w-28">Created By</TableHead>
            <TableHead className="text-white w-24">Created On</TableHead>
            <TableHead className="text-white w-24">Status</TableHead>
            <TableHead className="text-white w-32">Approver</TableHead>
            <TableHead className="text-white w-24">Approved On</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transporters.map((transporter, index) => (
            <TableRow
              key={transporter.id}
              className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer border-b border-gray-100 group"
              onClick={() => onTransporterClick(transporter.id)}
            >
              <TableCell className="px-3 py-2 whitespace-nowrap">
                <span className="text-orange-500 font-bold text-sm hover:underline cursor-pointer transition-all duration-200">
                  {transporter.id}
                </span>
              </TableCell>
              <TableCell className="px-3 py-2 whitespace-nowrap">
                <div className="max-w-xs">
                  <span className="text-body text-text-primary truncate block font-semibold" title={transporter.businessName}>
                    {transporter.businessName}
                  </span>
                </div>
              </TableCell>
              <TableCell className="px-3 py-2 whitespace-nowrap">
                <TransportModeIcons modes={transporter.transportMode} />
              </TableCell>
              <TableCell className="px-3 py-2 whitespace-nowrap">
                <span className="text-pill text-text-secondary">{transporter.mobileNumber}</span>
              </TableCell>
              <TableCell className="px-3 py-2 whitespace-nowrap">
                <div className="max-w-xs">
                  <span className="text-pill text-text-secondary truncate block" title={transporter.emailId}>
                    {transporter.emailId}
                  </span>
                </div>
              </TableCell>
              <TableCell className="px-3 py-2 whitespace-nowrap">
                <span className="text-pill text-text-secondary">{transporter.tinPan}</span>
              </TableCell>
              <TableCell className="px-3 py-2 whitespace-nowrap">
                <span className="text-pill text-text-secondary">{transporter.vatGst}</span>
              </TableCell>
              <TableCell className="px-3 py-2 whitespace-nowrap">
                <div className="max-w-48">
                  <span className="text-pill text-text-secondary truncate block" title={transporter.address}>
                    {transporter.address}
                  </span>
                </div>
              </TableCell>
              <TableCell className="px-3 py-2 whitespace-nowrap">
                <span className="text-pill text-text-secondary">{transporter.createdBy}</span>
              </TableCell>
              <TableCell className="px-3 py-2 whitespace-nowrap">
                <span className="text-pill text-text-secondary">{transporter.createdOn}</span>
              </TableCell>
              <TableCell className="px-3 py-2">
                <StatusPill status={transporter.status} />
              </TableCell>
              <TableCell className="px-3 py-2 whitespace-nowrap">
                <span className="text-pill text-text-secondary">{transporter.approver}</span>
              </TableCell>
              <TableCell className="px-3 py-2 whitespace-nowrap">
                <span className="text-pill text-text-secondary">{transporter.approvedOn}</span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {/* Pagination Section */}
      {totalItems > 0 && (
        <div className="px-4 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            {/* Left side - Results info */}
            <span className="text-sm text-text-secondary">
              Showing {startItem} to {endItem} of {totalItems} transporters
            </span>
            
            {/* Right side - Pagination controls */}
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="hover:bg-white"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <span className="text-sm text-text-secondary px-3 py-1">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="hover:bg-white"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default TransporterListTable;