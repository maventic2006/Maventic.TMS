import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Building, Phone, Mail, Hash, MapPin, Loader2, Truck, Plane, Train, Ship, User, Calendar, CheckCircle, ChevronLeft, ChevronRight, Search } from 'lucide-react';
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
  filteredCount,
  // Search props
  searchText,
  onSearchChange
}) => {
  if (loading) {
    return (
      <Card className="flex items-center justify-center py-16 rounded-2xl shadow-md border border-gray-200">
        <div className="flex flex-col items-center space-y-4 text-gray-600">
          <div className="relative">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <div className="absolute inset-0 h-8 w-8 border-2 border-orange-200 rounded-full animate-pulse"></div>
          </div>
          <span className="text-sm font-medium">Loading transporters...</span>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </Card>
    );
  }

  if (transporters.length === 0) {
    return (
      <Card className="text-center py-16 rounded-2xl shadow-md border border-gray-200 bg-gradient-to-br from-gray-50 to-white">
        <div className="flex flex-col items-center space-y-6 text-gray-500">
          <div className="relative">
            <Building className="h-20 w-20 text-gray-300" />
            <div className="absolute -top-2 -right-2 h-6 w-6 bg-orange-100 rounded-full flex items-center justify-center">
              <div className="h-3 w-3 bg-orange-400 rounded-full"></div>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-700">No Transporters Found</h3>
            <p className="text-sm text-gray-500 max-w-md">
              Try adjusting your search criteria or filters, or create a new transporter to get started.
            </p>
          </div>
          <div className="flex space-x-2 text-xs text-gray-400">
            <span>• Check spelling</span>
            <span>• Clear filters</span>
            <span>• Try different keywords</span>
          </div>
        </div>
      </Card>
    );
  }

  // Pagination calculations
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
      {/* Results Count Section */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          {/* Left side - Results count */}
          <p className="text-sm text-text-primary font-semibold">
            <span className="text-orange-600 font-bold">{filteredCount}</span> Transporters Found
          </p>
          
          {/* Right side - Search bar */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {searchText && (
              <div className="text-xs text-gray-500 hidden sm:block">
                Searching in {filteredCount} transporters
              </div>
            )}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search transporters..."
                className="pl-10 pr-4 py-2 w-48 sm:w-64 lg:w-72 border border-gray-200 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all duration-200 text-sm bg-white shadow-sm hover:shadow-md"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Card Layout - Hidden on desktop */}
      <div className="block lg:hidden p-4 space-y-4">
        {transporters.map((transporter, index) => (
          <motion.div
            key={transporter.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer"
            onClick={() => onTransporterClick(transporter.id)}
          >
            {/* Header row with ID and Status */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Hash className="h-4 w-4 text-orange-500" />
                <span className="font-bold text-orange-600 text-sm">
                  {transporter.id}
                </span>
              </div>
              <StatusPill status={transporter.status} />
            </div>
            
            {/* Business Name */}
            <div className="mb-3">
              <div className="flex items-center space-x-2 mb-1">
                <Building className="h-4 w-4 text-gray-500" />
                <span className="text-xs text-gray-500 font-medium">Business Name</span>
              </div>
              <p className="font-semibold text-gray-900 text-sm truncate">
                {transporter.businessName}
              </p>
            </div>
            
            {/* Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <div className="flex items-center space-x-1 mb-1">
                  <Phone className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500">Phone</span>
                </div>
                <p className="text-sm text-gray-700">{transporter.mobileNumber}</p>
              </div>
              <div>
                <div className="flex items-center space-x-1 mb-1">
                  <Mail className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500">Email</span>
                </div>
                <p className="text-sm text-gray-700 truncate">{transporter.emailId}</p>
              </div>
            </div>
            
            {/* Transport Mode */}
            <div className="mb-3">
              <div className="flex items-center space-x-1 mb-1">
                <Truck className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500">Transport Mode</span>
              </div>
              <TransportModeIcons modes={transporter.transportMode} />
            </div>
            
            {/* Address */}
            <div className="mb-3">
              <div className="flex items-center space-x-1 mb-1">
                <MapPin className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500">Address</span>
              </div>
              <p className="text-sm text-gray-700 overflow-hidden" style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}>{transporter.address}</p>
            </div>
            
            {/* Footer with additional info */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-1">
                <User className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500">
                  By {transporter.createdBy}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500">
                  {transporter.createdOn}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Desktop Table Layout - Hidden on mobile/tablet */}
      <div className="hidden lg:block">
      <Table>
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 hover:from-gray-700 hover:via-gray-800 hover:to-gray-700 transition-all duration-300">
            <TableHead className="text-white w-16 font-semibold">
              <div className="flex items-center">
                Transporter ID
                <svg className="ml-2 h-4 w-4 opacity-70" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </TableHead>
            <TableHead className="text-white w-40 font-semibold">
              <div className="flex items-center">
                Business Name
                <svg className="ml-2 h-4 w-4 opacity-70" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </TableHead>
            <TableHead className="text-white w-32 font-semibold">Transport Mode</TableHead>
            <TableHead className="text-white w-28 font-semibold">Mobile Number</TableHead>
            <TableHead className="text-white w-40 font-semibold">Email ID</TableHead>
            <TableHead className="text-white w-32 font-semibold">TIN/PAN</TableHead>
            <TableHead className="text-white w-32 font-semibold">VAT/GST</TableHead>
            <TableHead className="text-white w-48 font-semibold">Address</TableHead>
            <TableHead className="text-white w-28 font-semibold">Created By</TableHead>
            <TableHead className="text-white w-24 font-semibold">Created On</TableHead>
            <TableHead className="text-white w-24 font-semibold">Status</TableHead>
            <TableHead className="text-white w-32 font-semibold">Approver</TableHead>
            <TableHead className="text-white w-24 font-semibold">Approved On</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transporters.map((transporter, index) => (
            <TableRow
              key={transporter.id}
              className="hover:bg-gradient-to-r hover:from-orange-50 hover:to-blue-50 transition-all duration-300 cursor-pointer border-b border-gray-100 group hover:shadow-sm"
              onClick={() => onTransporterClick(transporter.id)}
            >
              <TableCell className="px-3 py-3 whitespace-nowrap">
                <span className="text-orange-600 font-bold text-sm hover:text-orange-700 hover:underline cursor-pointer transition-all duration-200 group-hover:scale-105">
                  {transporter.id}
                </span>
              </TableCell>
              <TableCell className="px-3 py-3 whitespace-nowrap">
                <div className="max-w-xs">
                  <span className="text-sm text-gray-900 truncate block font-semibold group-hover:text-gray-800" title={transporter.businessName}>
                    {transporter.businessName}
                  </span>
                </div>
              </TableCell>
              <TableCell className="px-3 py-3 whitespace-nowrap">
                <TransportModeIcons modes={transporter.transportMode} />
              </TableCell>
              <TableCell className="px-3 py-3 whitespace-nowrap">
                <span className="text-sm text-gray-600">{transporter.mobileNumber}</span>
              </TableCell>
              <TableCell className="px-3 py-3 whitespace-nowrap">
                <div className="max-w-xs">
                  <span className="text-sm text-gray-600 truncate block" title={transporter.emailId}>
                    {transporter.emailId}
                  </span>
                </div>
              </TableCell>
              <TableCell className="px-3 py-3 whitespace-nowrap">
                <span className="text-sm text-gray-600">{transporter.tinPan}</span>
              </TableCell>
              <TableCell className="px-3 py-3 whitespace-nowrap">
                <span className="text-sm text-gray-600">{transporter.vatGst}</span>
              </TableCell>
              <TableCell className="px-3 py-3 whitespace-nowrap">
                <div className="max-w-48">
                  <span className="text-sm text-gray-600 truncate block" title={transporter.address}>
                    {transporter.address}
                  </span>
                </div>
              </TableCell>
              <TableCell className="px-3 py-3 whitespace-nowrap">
                <span className="text-sm text-gray-600">{transporter.createdBy}</span>
              </TableCell>
              <TableCell className="px-3 py-3 whitespace-nowrap">
                <span className="text-sm text-gray-600">{transporter.createdOn}</span>
              </TableCell>
              <TableCell className="px-3 py-3">
                <StatusPill status={transporter.status} />
              </TableCell>
              <TableCell className="px-3 py-3 whitespace-nowrap">
                <span className="text-sm text-gray-600">{transporter.approver}</span>
              </TableCell>
              <TableCell className="px-3 py-3 whitespace-nowrap">
                <span className="text-sm text-gray-600">{transporter.approvedOn}</span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
      
      {/* Pagination Section */}
      {totalItems > 0 && (
        <div className="px-3 sm:px-4 py-3 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
            {/* Left side - Results info */}
            <span className="text-xs sm:text-sm text-gray-600 font-medium">
              <span className="hidden sm:inline">Showing </span>
              <span className="text-gray-900 font-semibold">{startItem}</span>-<span className="text-gray-900 font-semibold">{endItem}</span> 
              <span className="hidden sm:inline"> of </span>
              <span className="sm:hidden">/</span>
              <span className="text-orange-600 font-bold">{totalItems}</span>
              <span className="hidden sm:inline"> transporters</span>
            </span>
            
            {/* Right side - Pagination controls */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 rounded-lg transition-all duration-200 disabled:opacity-50 px-2 sm:px-3"
              >
                <ChevronLeft className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Previous</span>
              </Button>

              <span className="text-xs sm:text-sm text-gray-700 px-2 sm:px-3 py-2 bg-white rounded-lg shadow-sm border font-medium">
                <span className="text-orange-600 font-bold">{currentPage}</span>
                <span className="text-gray-500">/</span>
                <span className="text-gray-900">{totalPages}</span>
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 rounded-lg transition-all duration-200 disabled:opacity-50 px-2 sm:px-3"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4 sm:ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default memo(TransporterListTable);