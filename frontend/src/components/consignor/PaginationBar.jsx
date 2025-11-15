import React from "react";
import { getPageTheme } from "../../theme.config";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

const PaginationBar = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  const theme = getPageTheme("list");

  // Calculate display values
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);
      
      // Calculate range around current page
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Add ellipsis if needed
      if (startPage > 2) {
        pages.push("...");
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        pages.push("...");
      }
      
      // Show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 20px",
        backgroundColor: theme.colors.card.background,
        borderRadius: "12px",
        border: `1px solid ${theme.colors.card.border}`,
        flexWrap: "wrap",
        gap: "16px",
      }}
    >
      {/* Items Info */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span
          style={{
            fontSize: "14px",
            color: theme.colors.text.secondary,
          }}
        >
          Showing
        </span>
        <span
          style={{
            fontSize: "14px",
            fontWeight: "600",
            color: theme.colors.text.primary,
          }}
        >
          {startItem} - {endItem}
        </span>
        <span
          style={{
            fontSize: "14px",
            color: theme.colors.text.secondary,
          }}
        >
          of
        </span>
        <span
          style={{
            fontSize: "14px",
            fontWeight: "600",
            color: theme.colors.text.primary,
          }}
        >
          {totalItems}
        </span>
        <span
          style={{
            fontSize: "14px",
            color: theme.colors.text.secondary,
          }}
        >
          consignors
        </span>
      </div>

      {/* Pagination Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* First Page Button */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            border: `1px solid ${theme.colors.card.border}`,
            borderRadius: "8px",
            backgroundColor: theme.colors.card.background,
            color: currentPage === 1 ? theme.colors.text.disabled : theme.colors.text.primary,
            cursor: currentPage === 1 ? "not-allowed" : "pointer",
            transition: "all 0.2s",
            opacity: currentPage === 1 ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (currentPage !== 1) {
              e.target.style.backgroundColor = theme.colors.primary.background + "10";
              e.target.style.borderColor = theme.colors.primary.background;
            }
          }}
          onMouseLeave={(e) => {
            if (currentPage !== 1) {
              e.target.style.backgroundColor = theme.colors.card.background;
              e.target.style.borderColor = theme.colors.card.border;
            }
          }}
        >
          <ChevronsLeft size={18} />
        </button>

        {/* Previous Page Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            border: `1px solid ${theme.colors.card.border}`,
            borderRadius: "8px",
            backgroundColor: theme.colors.card.background,
            color: currentPage === 1 ? theme.colors.text.disabled : theme.colors.text.primary,
            cursor: currentPage === 1 ? "not-allowed" : "pointer",
            transition: "all 0.2s",
            opacity: currentPage === 1 ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (currentPage !== 1) {
              e.target.style.backgroundColor = theme.colors.primary.background + "10";
              e.target.style.borderColor = theme.colors.primary.background;
            }
          }}
          onMouseLeave={(e) => {
            if (currentPage !== 1) {
              e.target.style.backgroundColor = theme.colors.card.background;
              e.target.style.borderColor = theme.colors.card.border;
            }
          }}
        >
          <ChevronLeft size={18} />
        </button>

        {/* Page Numbers */}
        {pageNumbers.map((pageNum, index) => {
          if (pageNum === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "36px",
                  height: "36px",
                  fontSize: "14px",
                  color: theme.colors.text.disabled,
                }}
              >
                ...
              </span>
            );
          }

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: "36px",
                height: "36px",
                padding: "0 12px",
                border: `1px solid ${
                  currentPage === pageNum ? theme.colors.primary.background : theme.colors.card.border
                }`,
                borderRadius: "8px",
                backgroundColor:
                  currentPage === pageNum ? theme.colors.primary.background : theme.colors.card.background,
                color: currentPage === pageNum ? "#FFFFFF" : theme.colors.text.primary,
                fontSize: "14px",
                fontWeight: currentPage === pageNum ? "600" : "500",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (currentPage !== pageNum) {
                  e.target.style.backgroundColor = theme.colors.primary.background + "10";
                  e.target.style.borderColor = theme.colors.primary.background;
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== pageNum) {
                  e.target.style.backgroundColor = theme.colors.card.background;
                  e.target.style.borderColor = theme.colors.card.border;
                }
              }}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Next Page Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            border: `1px solid ${theme.colors.card.border}`,
            borderRadius: "8px",
            backgroundColor: theme.colors.card.background,
            color: currentPage === totalPages ? theme.colors.text.disabled : theme.colors.text.primary,
            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            transition: "all 0.2s",
            opacity: currentPage === totalPages ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (currentPage !== totalPages) {
              e.target.style.backgroundColor = theme.colors.primary.background + "10";
              e.target.style.borderColor = theme.colors.primary.background;
            }
          }}
          onMouseLeave={(e) => {
            if (currentPage !== totalPages) {
              e.target.style.backgroundColor = theme.colors.card.background;
              e.target.style.borderColor = theme.colors.card.border;
            }
          }}
        >
          <ChevronRight size={18} />
        </button>

        {/* Last Page Button */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            border: `1px solid ${theme.colors.card.border}`,
            borderRadius: "8px",
            backgroundColor: theme.colors.card.background,
            color: currentPage === totalPages ? theme.colors.text.disabled : theme.colors.text.primary,
            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            transition: "all 0.2s",
            opacity: currentPage === totalPages ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (currentPage !== totalPages) {
              e.target.style.backgroundColor = theme.colors.primary.background + "10";
              e.target.style.borderColor = theme.colors.primary.background;
            }
          }}
          onMouseLeave={(e) => {
            if (currentPage !== totalPages) {
              e.target.style.backgroundColor = theme.colors.card.background;
              e.target.style.borderColor = theme.colors.card.border;
            }
          }}
        >
          <ChevronsRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default PaginationBar;
