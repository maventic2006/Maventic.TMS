import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { getPageTheme } from "../../theme.config";

const theme = getPageTheme("list");

const PaginationBar = ({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const handlePageClick = (page) => {
    if (page !== "..." && page !== currentPage) {
      onPageChange(page);
    }
  };

  return (
    <div
      className="px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4"
      style={{
        borderColor: theme.colors.pagination.border,
        background: theme.colors.pagination.background,
      }}
    >
      {/* Items Info */}
      <div className="text-sm" style={{ color: theme.colors.text.secondary }}>
        Showing <span className="font-semibold" style={{ color: theme.colors.text.primary }}>{startItem}</span> to{" "}
        <span className="font-semibold" style={{ color: theme.colors.text.primary }}>{endItem}</span> of{" "}
        <span className="font-semibold" style={{ color: theme.colors.text.primary }}>{totalItems}</span> vehicles
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        {/* First Page */}
        <button
          onClick={() => handlePageClick(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            border: `1px solid ${theme.colors.pagination.border}`,
            background: theme.colors.pagination.background,
            color: theme.colors.text.primary,
          }}
          onMouseEnter={(e) => {
            if (currentPage !== 1) {
              e.currentTarget.style.background = theme.colors.table.row.hover;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = theme.colors.pagination.background;
          }}
          title="First Page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>

        {/* Previous Page */}
        <button
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            border: `1px solid ${theme.colors.pagination.border}`,
            background: theme.colors.pagination.background,
            color: theme.colors.text.primary,
          }}
          onMouseEnter={(e) => {
            if (currentPage !== 1) {
              e.currentTarget.style.background = theme.colors.table.row.hover;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = theme.colors.pagination.background;
          }}
          title="Previous Page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Page Numbers */}
        <div className="hidden sm:flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (page === "...") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-3 py-2 text-sm"
                  style={{ color: theme.colors.text.secondary }}
                >
                  ...
                </span>
              );
            }

            const isActive = page === currentPage;

            return (
              <button
                key={page}
                onClick={() => handlePageClick(page)}
                className="min-w-[40px] px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                style={{
                  background: isActive ? theme.colors.pagination.active : theme.colors.pagination.background,
                  color: isActive ? theme.colors.pagination.activeText : theme.colors.text.primary,
                  border: `1px solid ${isActive ? theme.colors.pagination.active : theme.colors.pagination.border}`,
                  transform: isActive ? "scale(1.05)" : "scale(1)",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = theme.colors.table.row.hover;
                    e.currentTarget.style.transform = "scale(1.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = theme.colors.pagination.background;
                    e.currentTarget.style.transform = "scale(1)";
                  }
                }}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Mobile Page Info */}
        <div className="sm:hidden px-4 py-2 text-sm font-semibold" style={{ color: theme.colors.text.primary }}>
          {currentPage} / {totalPages}
        </div>

        {/* Next Page */}
        <button
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            border: `1px solid ${theme.colors.pagination.border}`,
            background: theme.colors.pagination.background,
            color: theme.colors.text.primary,
          }}
          onMouseEnter={(e) => {
            if (currentPage !== totalPages) {
              e.currentTarget.style.background = theme.colors.table.row.hover;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = theme.colors.pagination.background;
          }}
          title="Next Page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Last Page */}
        <button
          onClick={() => handlePageClick(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            border: `1px solid ${theme.colors.pagination.border}`,
            background: theme.colors.pagination.background,
            color: theme.colors.text.primary,
          }}
          onMouseEnter={(e) => {
            if (currentPage !== totalPages) {
              e.currentTarget.style.background = theme.colors.table.row.hover;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = theme.colors.pagination.background;
          }}
          title="Last Page"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default PaginationBar;
