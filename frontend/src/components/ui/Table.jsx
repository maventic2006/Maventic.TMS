import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { baseColors, baseLayout } from "../../utils/theme";

const Table = ({
  columns = [],
  data = [],
  onRowClick,
  selectedRowId,
  pagination,
  onPageChange,
  className = "",
  scrollable = false,
}) => {
  const tableStyles = {
    container: `bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`,
    table: "min-w-full",
    header: `bg-[${baseColors.headerBg}] text-[${baseColors.headerText}]`,
    headerCell: "px-6 py-3 text-left text-sm font-medium tracking-wider",
    body: "bg-white divide-y divide-gray-200",
    row: "hover:bg-gray-50 cursor-pointer transition-colors duration-200",
    selectedRow: "bg-blue-50 hover:bg-blue-100",
    cell: "px-6 py-4 whitespace-nowrap text-sm text-gray-900",
    emptyState: "px-6 py-8 text-center text-gray-500",
    pagination:
      "bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200",
    paginationButton:
      "p-2 rounded text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:hover:text-gray-400",
  };

  const renderCell = (item, column) => {
    if (column.render) {
      return column.render(item[column.key], item);
    }
    return item[column.key] || "-";
  };

  const handleRowClick = (item, index) => {
    if (onRowClick) {
      onRowClick(item, index);
    }
  };

  return (
    <div className={tableStyles.container}>
      {scrollable ? (
        <div className="overflow-x-auto">
          <table className={tableStyles.table}>
            <thead className={tableStyles.header}>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={tableStyles.headerCell}
                    style={{ width: column.width }}
                  >
                    {column.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={tableStyles.body}>
              {data.length > 0 ? (
                data.map((item, index) => (
                  <tr
                    key={item.id || index}
                    className={`${tableStyles.row} ${
                      selectedRowId === (item.id || index)
                        ? tableStyles.selectedRow
                        : ""
                    }`}
                    onClick={() => handleRowClick(item, index)}
                  >
                    {columns.map((column) => (
                      <td key={column.key} className={tableStyles.cell}>
                        {renderCell(item, column)}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className={tableStyles.emptyState}
                  >
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <table className={tableStyles.table}>
          <thead className={tableStyles.header}>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={tableStyles.headerCell}
                  style={{ width: column.width }}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={tableStyles.body}>
            {data.length > 0 ? (
              data.map((item, index) => (
                <tr
                  key={item.id || index}
                  className={`${tableStyles.row} ${
                    selectedRowId === (item.id || index)
                      ? tableStyles.selectedRow
                      : ""
                  }`}
                  onClick={() => handleRowClick(item, index)}
                >
                  {columns.map((column) => (
                    <td key={column.key} className={tableStyles.cell}>
                      {renderCell(item, column)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className={tableStyles.emptyState}>
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {pagination && (
        <div className={tableStyles.pagination}>
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
              className={tableStyles.paginationButton}
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
              className={tableStyles.paginationButton}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {(pagination.currentPage - 1) * pagination.pageSize + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(
                    pagination.currentPage * pagination.pageSize,
                    pagination.totalItems
                  )}
                </span>{" "}
                of <span className="font-medium">{pagination.totalItems}</span>{" "}
                results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => onPageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage <= 1}
                  className={`${tableStyles.paginationButton} rounded-l-md border border-gray-300`}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onPageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= pagination.totalPages}
                  className={`${tableStyles.paginationButton} rounded-r-md border border-gray-300`}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
