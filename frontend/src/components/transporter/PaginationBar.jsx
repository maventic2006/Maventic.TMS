import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';

const PaginationBar = ({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <Card className="mt-6 bg-gradient-to-r from-white via-gray-50 to-blue-50/30 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
      <CardContent className="flex items-center justify-between py-4 px-6 relative">
        {/* Modern gradient accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-t-lg" />
        
        {/* Left side - Results info */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm border border-gray-100">
          <span className="text-body text-text-secondary font-medium">
            Showing {startItem} to {endItem} of {totalItems} transporters
          </span>
        </div>
        
        {/* Right side - Pagination controls */}
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="bg-white/60 backdrop-blur-sm hover:bg-white hover:shadow-md hover:scale-105 transition-all duration-200 border-gray-200 hover:border-blue-300"
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            Previous
          </Button>

          <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-100">
            <span className="text-body text-text-secondary font-medium">Page {currentPage} of {totalPages}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="bg-white/60 backdrop-blur-sm hover:bg-white hover:shadow-md hover:scale-105 transition-all duration-200 border-gray-200 hover:border-blue-300"
          >
            Next
            <ChevronRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaginationBar;