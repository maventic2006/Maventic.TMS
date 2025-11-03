import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  User,
  Plus,
  ArrowLeft,
  Filter,
  Search,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { fetchDrivers } from "../redux/slices/driverSlice";
import { getPageTheme, getComponentTheme } from "../theme.config";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import StatusPill from "../components/transporter/StatusPill";
import PaginationBar from "../components/transporter/PaginationBar";

// Fuzzy search utility function
const fuzzySearch = (searchText, drivers) => {
  if (!searchText || searchText.trim() === "") {
    return drivers;
  }

  const searchLower = searchText.toLowerCase().trim();

  return drivers.filter((driver) => {
    // Search across multiple fields (using camelCase from API response)
    const searchableFields = [
      driver.id,
      driver.fullName,
      driver.phoneNumber,
      driver.emailId,
      driver.gender,
      driver.bloodGroup,
      driver.city,
      driver.status,
    ];

    // Check if any field contains the search text (case-insensitive partial match)
    return searchableFields.some((field) => {
      if (field === null || field === undefined) return false;
      return String(field).toLowerCase().includes(searchLower);
    });
  });
};

// Display helper function
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

// Main Driver Maintenance Component
const DriverMaintenance = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const theme = getPageTheme("list");
  const actionButtonTheme = getComponentTheme("actionButton");

  // Redux state
  const { drivers, pagination, isFetching, error } = useSelector(
    (state) => state.driver
  );

  // Local state
  const [searchText, setSearchText] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    driverId: "",
    status: "",
    gender: "",
    bloodGroup: "",
  });

  const [appliedFilters, setAppliedFilters] = useState({
    driverId: "",
    status: "",
    gender: "",
    bloodGroup: "",
  });

  // Fetch drivers when component mounts or when appliedFilters change
  useEffect(() => {
    const fetchData = () => {
      const params = {
        page: pagination.page || 1,
        limit: pagination.limit || 25,
      };

      // Only add applied filter parameters
      if (appliedFilters.driverId) {
        params.driverId = appliedFilters.driverId;
      }
      if (appliedFilters.status) {
        params.status = appliedFilters.status;
      }
      if (appliedFilters.gender) {
        params.gender = appliedFilters.gender;
      }
      if (appliedFilters.bloodGroup) {
        params.bloodGroup = appliedFilters.bloodGroup;
      }

      dispatch(fetchDrivers(params));
    };

    fetchData();
  }, [dispatch, appliedFilters, pagination.page]);

  // Initial load
  useEffect(() => {
    dispatch(fetchDrivers({ page: 1, limit: 25 }));
  }, [dispatch]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const handleApplyFilters = useCallback(() => {
    setAppliedFilters({ ...filters });
  }, [filters]);

  const handleClearFilters = useCallback(() => {
    const emptyFilters = {
      driverId: "",
      status: "",
      gender: "",
      bloodGroup: "",
    };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
  }, []);

  const handleSearchChange = useCallback((text) => {
    setSearchText(text);
  }, []);

  // Apply client-side fuzzy search filtering
  const filteredDrivers = useMemo(() => {
    return fuzzySearch(searchText, drivers);
  }, [searchText, drivers]);

  const handleDriverClick = useCallback(
    (driverId) => {
      navigate(`/driver/${driverId}`);
    },
    [navigate]
  );

  const handleCreateNew = useCallback(() => {
    navigate("/driver/create");
  }, [navigate]);

  const handleBack = useCallback(() => {
    navigate("/tms-portal");
  }, [navigate]);

  const handlePageChange = useCallback(
    (page) => {
      const params = {
        page,
        limit: pagination.limit || 25,
      };

      if (appliedFilters.driverId) {
        params.driverId = appliedFilters.driverId;
      }
      if (appliedFilters.status) {
        params.status = appliedFilters.status;
      }
      if (appliedFilters.gender) {
        params.gender = appliedFilters.gender;
      }
      if (appliedFilters.bloodGroup) {
        params.bloodGroup = appliedFilters.bloodGroup;
      }

      dispatch(fetchDrivers(params));
    },
    [dispatch, pagination.limit, appliedFilters]
  );

  const handleToggleFilters = useCallback(() => {
    setShowFilters(!showFilters);
  }, [showFilters]);

  return (
    <div
      className="min-h-screen p-4 lg:p-6"
      style={{
        background: `linear-gradient(to bottom right, ${theme.colors.primary.background}, #f0f4f8, #e6f0ff)`,
      }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Action Bar */}
        <Card
          className="overflow-hidden border shadow-md"
          style={{
            backgroundColor: theme.colors.card.background,
            borderColor: theme.colors.card.border,
          }}
        >
          <div className="p-4 space-y-4">
            {/* Header Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={handleBack}
                  style={{
                    backgroundColor: actionButtonTheme.secondary.background,
                    color: actionButtonTheme.secondary.text,
                    borderColor: actionButtonTheme.secondary.border,
                  }}
                  className="flex items-center space-x-2 border hover:opacity-90 transition-opacity"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </Button>
                <div className="flex items-center space-x-3">
                  <User
                    className="h-8 w-8"
                    style={{ color: actionButtonTheme.primary.background }}
                  />
                  <div>
                    <h1
                      className="text-2xl font-bold"
                      style={{ color: theme.colors.text.primary }}
                    >
                      Driver Maintenance
                    </h1>
                    <p
                      className="text-sm"
                      style={{ color: theme.colors.text.secondary }}
                    >
                      {pagination.total || 0} Drivers
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  onClick={handleToggleFilters}
                  style={{
                    backgroundColor: showFilters
                      ? actionButtonTheme.primary.background
                      : actionButtonTheme.secondary.background,
                    color: showFilters
                      ? actionButtonTheme.primary.text
                      : actionButtonTheme.secondary.text,
                    borderColor: actionButtonTheme.secondary.border,
                  }}
                  className="flex items-center space-x-2 border hover:opacity-90 transition-opacity"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                </Button>
                <Button
                  onClick={handleCreateNew}
                  style={{
                    backgroundColor: actionButtonTheme.primary.background,
                    color: actionButtonTheme.primary.text,
                  }}
                  className="flex items-center space-x-2 hover:opacity-90 transition-opacity"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Driver</span>
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search drivers by ID, name, phone, email, city..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all duration-200 text-sm bg-white shadow-sm hover:shadow-md"
                  style={{ color: theme.colors.text.primary }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Filter Panel */}
        {showFilters && (
          <Card
            className="overflow-hidden border shadow-md"
            style={{
              backgroundColor: theme.colors.card.background,
              borderColor: theme.colors.card.border,
            }}
          >
            <div className="p-4">
              <h3
                className="text-lg font-semibold mb-4"
                style={{ color: theme.colors.text.primary }}
              >
                Filter Drivers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Driver ID"
                  value={filters.driverId}
                  onChange={(e) =>
                    handleFilterChange("driverId", e.target.value)
                  }
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-200 focus:outline-none"
                />
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-200 focus:outline-none"
                >
                  <option value="">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
                <select
                  value={filters.gender}
                  onChange={(e) => handleFilterChange("gender", e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-200 focus:outline-none"
                >
                  <option value="">All Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
                <select
                  value={filters.bloodGroup}
                  onChange={(e) =>
                    handleFilterChange("bloodGroup", e.target.value)
                  }
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-200 focus:outline-none"
                >
                  <option value="">All Blood Groups</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={handleApplyFilters}
                  style={{
                    backgroundColor: actionButtonTheme.primary.background,
                    color: actionButtonTheme.primary.text,
                  }}
                  className="hover:opacity-90 transition-opacity"
                >
                  Apply Filters
                </Button>
                <Button
                  onClick={handleClearFilters}
                  style={{
                    backgroundColor: actionButtonTheme.secondary.background,
                    color: actionButtonTheme.secondary.text,
                    borderColor: actionButtonTheme.secondary.border,
                  }}
                  className="border hover:opacity-90 transition-opacity"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Driver List Table */}
        <Card
          className="overflow-hidden border shadow-md"
          style={{
            backgroundColor: theme.colors.card.background,
            borderColor: theme.colors.card.border,
          }}
        >
          {/* Results Count */}
          <div
            className="px-4 py-3 border-b"
            style={{
              backgroundColor: "#F9FAFB",
              borderColor: theme.colors.card.border,
            }}
          >
            <p
              className="text-sm font-semibold"
              style={{ color: theme.colors.text.primary }}
            >
              <span className="text-orange-600 font-bold">
                {filteredDrivers.length}
              </span>{" "}
              Drivers Found
            </p>
          </div>

          {/* Loading State */}
          {isFetching && (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center space-y-4 text-gray-600">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                <span className="text-sm font-medium">Loading drivers...</span>
              </div>
            </div>
          )}

          {/* No Results State */}
          {!isFetching && filteredDrivers.length === 0 && (
            <div className="text-center py-16">
              <User className="h-20 w-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No Drivers Found
              </h3>
              <p className="text-sm text-gray-500">
                {searchText
                  ? `No results found for "${searchText}". Try adjusting your search.`
                  : "Try adjusting your filters, or create a new driver to get started."}
              </p>
            </div>
          )}

          {/* Table */}
          {!isFetching && filteredDrivers.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead
                  style={{
                    backgroundColor:
                      theme.colors.table?.header?.background || "#F9FAFB",
                    color:
                      theme.colors.table?.header?.text ||
                      theme.colors.text.primary,
                  }}
                >
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Driver ID
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Full Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Phone
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Gender
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Blood Group
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      City
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDrivers.map((driver, index) => (
                    <tr
                      key={driver.id}
                      className="border-b hover:bg-gray-50 transition-colors"
                      style={{ borderColor: theme.colors.card.border }}
                    >
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDriverClick(driver.id)}
                          className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                        >
                          {displayValue(driver.id)}
                        </button>
                      </td>
                      <td
                        className="px-4 py-3 text-sm"
                        style={{ color: theme.colors.text.primary }}
                      >
                        {displayValue(driver.fullName)}
                      </td>
                      <td
                        className="px-4 py-3 text-sm"
                        style={{ color: theme.colors.text.primary }}
                      >
                        {displayValue(driver.phoneNumber)}
                      </td>
                      <td
                        className="px-4 py-3 text-sm"
                        style={{ color: theme.colors.text.primary }}
                      >
                        {displayValue(driver.emailId)}
                      </td>
                      <td
                        className="px-4 py-3 text-sm"
                        style={{ color: theme.colors.text.primary }}
                      >
                        {displayValue(driver.gender)}
                      </td>
                      <td
                        className="px-4 py-3 text-sm"
                        style={{ color: theme.colors.text.primary }}
                      >
                        {displayValue(driver.bloodGroup)}
                      </td>
                      <td
                        className="px-4 py-3 text-sm"
                        style={{ color: theme.colors.text.primary }}
                      >
                        {displayValue(driver.city)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill status={driver.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!isFetching && filteredDrivers.length > 0 && (
            <div
              className="px-4 py-3 border-t"
              style={{ borderColor: theme.colors.card.border }}
            >
              <PaginationBar
                currentPage={pagination.page}
                totalPages={pagination.pages}
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </Card>

        {/* Error Display */}
        {error && (
          <Card
            className="border p-4"
            style={{
              backgroundColor: "#FEF2F2",
              borderColor: "#FCA5A5",
            }}
          >
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">
                  Error loading drivers
                </p>
                <p className="text-sm text-red-600">
                  {error.message || "Something went wrong"}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DriverMaintenance;
