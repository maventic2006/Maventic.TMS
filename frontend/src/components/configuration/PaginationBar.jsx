import React, { memo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/Button";
import { Card, CardContent } from "../ui/Card";

const ConfigurationPaginationBar = ({
  pagination = {},
  onPageChange,
}) => {
  const {
    currentPage = 1,
    totalPages = 1,
    totalRecords = 0,
    limit = 10
  } = pagination;

  // Calculate displayed record range
  const startRecord = (currentPage - 1) * limit + 1;
  const endRecord = Math.min(currentPage * limit, totalRecords);

  // Don't show pagination if no data
  if (totalRecords === 0) {
    return null;
  }

  return (
    <Card className="mt-4 rounded-xl border border-gray-200 bg-white shadow-sm">
      <CardContent className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Record count */}
          <div className="text-sm text-gray-600 font-medium">
            Showing{" "}
            <span className="text-gray-900 font-semibold">
              {startRecord}
            </span>{" "}
            to{" "}
            <span className="text-gray-900 font-semibold">
              {endRecord}
            </span>{" "}
            of{" "}
            <span className="text-gray-900 font-semibold">
              {totalRecords}
            </span>{" "}
            results
          </div>

          {/* Right side - Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              {/* Previous button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="h-9 w-9 p-0 border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    // Show first page, last page, current page, and pages around current
                    if (page === 1 || page === totalPages) return true;
                    if (Math.abs(page - currentPage) <= 2) return true;
                    return false;
                  })
                  .map((page, index, arr) => {
                    // Add ellipsis if there's a gap
                    const showEllipsisBefore = index > 0 && page - arr[index - 1] > 1;
                    
                    return (
                      <React.Fragment key={page}>
                        {showEllipsisBefore && (
                          <span className="px-2 py-1 text-gray-400">...</span>
                        )}
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => onPageChange(page)}
                          className={`h-9 w-9 p-0 ${
                            currentPage === page
                              ? "bg-blue-600 text-white border-blue-600"
                              : "border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </Button>
                      </React.Fragment>
                    );
                  })}
              </div>

              {/* Next button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="h-9 w-9 p-0 border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default memo(ConfigurationPaginationBar);