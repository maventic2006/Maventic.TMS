import React, { memo, useState } from "react";
import { motion } from "framer-motion";
import {
    Loader2,
    Edit,
    Trash2,
    Search,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "../ui/Table";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { StatusPill } from "../ui/StatusPill";

// Helper function to display N/A for empty or null values
const displayValue = (value) => {
    if (
        value === null ||
        value === undefined ||
        value === "" ||
        value === "N/A"
    ) {
        return "N/A";
    }
    return value;
};

const ConfigurationListTable = ({
    data = [],
    metadata,
    loading,
    error,
    searchText,
    onSearchChange,
    onEdit,
    onDelete,
    totalCount,
    // Pagination props
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
}) => {
    // State for delete confirmation popup
    const [deleteTarget, setDeleteTarget] = useState(null);
    
    // Pagination calculations
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    if (loading) {
        return (
            <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <CardContent className="p-8">
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
                        <p className="text-gray-500 font-medium">Loading configuration data...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <CardContent className="p-8">
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="text-red-600 text-xl mb-4">Error Loading Data</div>
                        <div className="text-gray-600 mb-4">{error}</div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Generate table headers from metadata
    const getTableHeaders = () => {
        if (!metadata?.fields) return [];

        // List of audit fields to exclude from display
        const auditFields = ['created_at', 'created_on', 'created_by', 'updated_at', 'updated_on', 'updated_by'];

        const headers = [];
        // Include fields except audit fields
        Object.entries(metadata.fields).forEach(([fieldName, fieldConfig]) => {
            // Skip audit fields
            if (auditFields.includes(fieldName)) {
                return;
            }
            
            headers.push({
                key: fieldName,
                label: fieldConfig.label || fieldName,
                sortable: true
            });
        });

        // Add Actions header
        headers.push({
            key: 'actions',
            label: 'Actions',
            sortable: false
        });

        return headers;
    };

    const headers = getTableHeaders();
    
    console.log("🎨 ConfigurationListTable render:");
    console.log("  - data received:", data);
    console.log("  - data length:", data?.length || 0);
    console.log("  - metadata:", metadata);
    console.log("  - loading:", loading);
    console.log("  - error:", error);
    console.log("  - totalCount:", totalCount);

    return (
        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <CardContent className="p-0">
                {/* Search Bar */}
                <div className="px-4 py-2 border-b border-gray-100">
                    <div className="flex items-center justify-between gap-4">
                         {totalCount > 0 && (
                            <div className="text-sm text-[#0D1A33] font-medium whitespace-nowrap">
                                <span className="text-[#0D1A33] font-bold">{totalCount}</span> {metadata?.name || 'Records'} Found
                            </div>
                        )}
                        <div className="flex justify-end">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                {/* <Input
                  type="text"
                  placeholder={`Search ${metadata?.name?.toLowerCase() || 'records'}...`}
                  value={searchText}
                  onChange={onSearchChange}
                  className="pl-10 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                /> */}
                                <input
                                    type="text"
                                    value={searchText}
                                    onChange={(e) => onSearchChange(e.target.value)}
                                    placeholder={`Search ${metadata?.name?.toLowerCase() || 'records'}...`}
                                    className="pl-10 pr-4 py-2 w-48 sm:w-64 lg:w-72 border border-[#E5E7EB] rounded-lg focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 focus:outline-none transition-all duration-200 text-sm bg-white"
                                    style={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)" }}
                                />
                            </div>
                        </div>
                       
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-[#0D1A33]">
                            <TableRow>
                                {headers.map((header, index) => (
                                    <TableHead
                                        key={header.key}
                                        className="text-xs font-semibold uppercase tracking-wider text-gray-700 py-3 px-6"
                                    >
                                        {header.label}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data && data.length > 0 ? (
                                data.map((record, index) => (
                                    <motion.tr
                                        key={record[metadata?.primaryKey] || index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                                    >
                                        {headers.slice(0, -1).map((header) => (
                                            <TableCell key={header.key} className="py-4 px-6">
                                                <div className="text-sm text-gray-900">
                                                    {/* Render StatusPill for status fields */}
                                                    {header.key.toLowerCase().includes('status') ? (
                                                        <StatusPill status={record[header.key]} />
                                                    ) : (
                                                        displayValue(record[header.key])
                                                    )}
                                                </div>
                                            </TableCell>
                                        ))}
                                        <TableCell className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onEdit(record)}
                                                    className="h-12 w-12 p-0 text-blue-700 hover:text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-300 rounded-full transition-colors duration-200 shadow-md border border-blue-100"
                                                    title="Edit record"
                                                >
                                                    <Edit className="h-7 w-7" strokeWidth={2.5} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setDeleteTarget(record)}
                                                    className="h-12 w-12 p-0 text-red-600 hover:text-white hover:bg-red-600 focus:ring-2 focus:ring-red-300 rounded-full transition-colors duration-200 shadow-md border border-red-100"
                                                    title="Delete record"
                                                >
                                                    <Trash2 className="h-7 w-7" strokeWidth={2.5} />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </motion.tr>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={headers.length}
                                        className="py-12 text-center text-gray-500"
                                    >
                                        {searchText ? (
                                            <div>
                                                <div className="text-lg font-medium mb-2">No results found</div>
                                                <div className="text-sm">Try adjusting your search terms</div>
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="text-lg font-medium mb-2">No data available</div>
                                                <div className="text-sm">Create your first record to get started</div>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Section */}
                {totalItems > 0 && (
                    <div className="px-6 py-6 border-t border-[#E5E7EB] bg-white">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            {/* Left side - Results info */}
                            <span className="text-xs sm:text-sm text-[#4A5568] font-semibold">
                                <span className="hidden sm:inline">Showing </span>
                                <span className="text-[#0D1A33] font-bold">{startItem}</span>-
                                <span className="text-[#0D1A33] font-bold">{endItem}</span>
                                <span className="hidden sm:inline"> of </span>
                                <span className="sm:hidden">/</span>
                                <span className="text-[#1D4ED8] font-bold">{totalItems}</span>
                                <span className="hidden sm:inline"> {metadata?.name?.toLowerCase() || 'records'}</span>
                            </span>

                            {/* Right side - Pagination controls */}
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onPageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="hover:bg-[#1D4ED8]/10 hover:border-[#1D4ED8] hover:text-[#1D4ED8] rounded-lg transition-all duration-200 disabled:opacity-50 py-2.5 px-5"
                                >
                                    <ChevronLeft className="h-4 w-4 sm:mr-1" />
                                    <span className="hidden sm:inline">Previous</span>
                                </Button>

                                <span
                                    className="text-xs sm:text-sm text-[#0D1A33] px-5 py-2.5 bg-white rounded-lg border border-[#E5E7EB] font-semibold"
                                    style={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)" }}
                                >
                                    <span className="text-[#1D4ED8] font-bold">{currentPage}</span>
                                    <span className="text-[#4A5568]">/</span>
                                    <span className="text-[#0D1A33]">{totalPages}</span>
                                </span>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onPageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="hover:bg-[#1D4ED8]/10 hover:border-[#1D4ED8] hover:text-[#1D4ED8] rounded-lg transition-all duration-200 disabled:opacity-50 py-2.5 px-5"
                                >
                                    <span className="hidden sm:inline">Next</span>
                                    <ChevronRight className="h-4 w-4 sm:ml-1" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pagination Bar removed (handled by parent or only one footer needed) */}
            </CardContent>

            {/* Delete Confirmation Popup */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full border border-gray-200">
                        <div className="flex flex-col items-center">
                            <Trash2 className="h-10 w-10 text-red-500 mb-3" />
                            <div className="text-lg font-semibold mb-2 text-gray-900">Delete Confirmation</div>
                            <div className="text-gray-700 mb-6 text-center">
                                Do you really want to delete this parameter?<br />
                                <span className="text-gray-500 text-sm">This action cannot be undone.</span>
                            </div>
                            <div className="flex gap-4">
                                <Button
                                    variant="outline"
                                    className="px-6 py-2 rounded-lg border-gray-300 text-gray-700 hover:bg-gray-100"
                                    onClick={() => setDeleteTarget(null)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                                    onClick={() => {
                                        onDelete(deleteTarget);
                                        setDeleteTarget(null);
                                    }}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default memo(ConfigurationListTable);