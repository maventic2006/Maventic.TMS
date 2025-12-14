import * as XLSX from 'xlsx';

/**
 * Export data to Excel file
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Array of column definitions [{key: 'id', label: 'ID'}, ...]
 * @param {String} filename - Name of the file (without extension)
 */
export const exportToExcel = (data, columns, filename = 'export') => {
  try {
    // Transform data to match column headers
    const exportData = data.map(item => {
      const row = {};
      columns.forEach(column => {
        // Handle nested properties and formatting
        let value = item[column.key];
        
        // Format based on column type if needed
        if (column.format && typeof column.format === 'function') {
          value = column.format(value, item);
        }
        
        row[column.label] = value ?? 'N/A';
      });
      return row;
    });

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Auto-size columns
    const columnWidths = columns.map(col => ({
      wch: Math.max(col.label.length, 15) // Minimum width of 15 characters
    }));
    worksheet['!cols'] = columnWidths;

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Generate file name with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `${filename}_${timestamp}.xlsx`;

    // Download file
    XLSX.writeFile(workbook, fileName);

    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw error;
  }
};

/**
 * Format helpers for common data types
 */
export const formatters = {
  date: (value) => {
    if (!value) return 'N/A';
    return new Date(value).toLocaleDateString('en-IN');
  },
  
  boolean: (value) => {
    if (value === true || value === 1) return 'Yes';
    if (value === false || value === 0) return 'No';
    return 'N/A';
  },
  
  array: (value) => {
    if (!value || !Array.isArray(value)) return 'N/A';
    return value.join(', ');
  },
  
  number: (value) => {
    if (value === null || value === undefined || value === '') return 'N/A';
    return Number(value).toString();
  }
};
