import React, { memo } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "../ui/Button";
import { Card, CardContent } from "../ui/Card";

const PaginationBar = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <Card
      className="mt-6 rounded-xl border border-gray-200 bg-white"
      style={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)" }}
    >
      <CardContent className="px-0 py-0">
        <div className="flex items-center justify-between">
          {/* Left side - Items count */}
          <div className="text-sm text-[#4A5568]">
            Showing{" "}
            <span className="font-semibold text-[#0D1A33]">
              {startItem}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-[#0D1A33]">
              {endItem}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-[#0D1A33]">
              {totalItems}
            </span>{" "}
            warehouses
          </div>

          {/* Right side - Pagination controls */}
          <div className="flex items-center gap-2">
            {/* First Page */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(1)}
              disabled={!canGoPrevious}
              className="h-9 w-9 rounded-lg border-[#E5E7EB] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              style={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)" }}
            >
              <ChevronsLeft className="h-4 w-4 text-[#4A5568]" />
            </Button>

            {/* Previous Page */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={!canGoPrevious}
              className="h-9 w-9 rounded-lg border-[#E5E7EB] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              style={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)" }}
            >
              <ChevronLeft className="h-4 w-4 text-[#4A5568]" />
            </Button>

            {/* Page Info */}
            <div className="px-4 py-2 text-sm font-semibold text-[#0D1A33]">
              Page{" "}
              <span className="text-[#1D4ED8]">{currentPage}</span>{" "}
              of{" "}
              <span className="text-[#1D4ED8]">{totalPages}</span>
            </div>

            {/* Next Page */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!canGoNext}
              className="h-9 w-9 rounded-lg border-[#E5E7EB] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              style={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)" }}
            >
              <ChevronRight className="h-4 w-4 text-[#4A5568]" />
            </Button>

            {/* Last Page */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(totalPages)}
              disabled={!canGoNext}
              className="h-9 w-9 rounded-lg border-[#E5E7EB] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              style={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)" }}
            >
              <ChevronsRight className="h-4 w-4 text-[#4A5568]" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default memo(PaginationBar);
