import React, { memo, useEffect, useState } from "react";
import { X, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "../ui/Card";
import { Input, Label } from "../ui/Input";
import { Button } from "../ui/Button";
import { StatusSelect } from "../ui/Select";
import { Country, State, City } from "country-state-city";

const DriverFilterPanel = ({
  filters,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
  showFilters,
}) => {
  // Local state for cascading dropdowns
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  // Initialize countries on mount
  useEffect(() => {
    const allCountries = Country.getAllCountries().map((country) => ({
      value: country.isoCode,
      label: country.name,
    }));
    setCountries([{ value: "", label: "All Countries" }, ...allCountries]);
  }, []);

  // Update states when country changes
  useEffect(() => {
    if (filters.country) {
      const countryStates = State.getStatesOfCountry(filters.country).map(
        (state) => ({
          value: state.isoCode,
          label: state.name,
        })
      );
      setStates([{ value: "", label: "All States" }, ...countryStates]);
    } else {
      setStates([{ value: "", label: "All States" }]);
      setCities([{ value: "", label: "All Cities" }]);
    }
  }, [filters.country]);

  // Update cities when state changes
  useEffect(() => {
    if (filters.country && filters.state) {
      const stateCities = City.getCitiesOfState(
        filters.country,
        filters.state
      ).map((city) => ({
        value: city.name,
        label: city.name,
      }));
      setCities([{ value: "", label: "All Cities" }, ...stateCities]);
    } else {
      setCities([{ value: "", label: "All Cities" }]);
    }
  }, [filters.country, filters.state]);

  // Handle country change - reset state and city
  const handleCountryChange = (value) => {
    onFilterChange("country", value);
    onFilterChange("state", "");
    onFilterChange("city", "");
  };

  // Handle state change - reset city
  const handleStateChange = (value) => {
    onFilterChange("state", value);
    onFilterChange("city", "");
  };

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
    { value: "SUSPENDED", label: "Suspended" },
  ];

  const genderOptions = [
    { value: "", label: "All Genders" },
    { value: "MALE", label: "Male" },
    { value: "FEMALE", label: "Female" },
    { value: "OTHERS", label: "Others" },
  ];

  const bloodGroupOptions = [
    { value: "", label: "All Blood Groups" },
    { value: "A+", label: "A+" },
    { value: "A-", label: "A-" },
    { value: "B+", label: "B+" },
    { value: "B-", label: "B-" },
    { value: "AB+", label: "AB+" },
    { value: "AB-", label: "AB-" },
    { value: "O+", label: "O+" },
    { value: "O-", label: "O-" },
  ];

  return (
    <AnimatePresence>
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.15 }}
          className="mb-2"
        >
          <Card
            className="bg-white border border-[#E5E7EB] rounded-xl"
            style={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)" }}
          >
            <CardContent className="p-6 relative">
              {/* Filter Input Grid - Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="space-y-2 group">
                  <Label
                    htmlFor="driverId"
                    className="text-sm text-[#0D1A33] font-semibold"
                  >
                    Driver ID:
                  </Label>
                  <Input
                    id="driverId"
                    type="text"
                    value={filters.driverId}
                    onChange={(e) => onFilterChange("driverId", e.target.value)}
                    placeholder="Enter driver ID"
                    className="bg-white border-[#E5E7EB] hover:border-[#1D4ED8] focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 transition-all duration-200 rounded-lg h-10"
                    style={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)" }}
                  />
                </div>

                <div className="space-y-2 group">
                  <Label
                    htmlFor="licenseNumber"
                    className="text-sm text-[#0D1A33] font-semibold"
                  >
                    License Number:
                  </Label>
                  <Input
                    id="licenseNumber"
                    type="text"
                    value={filters.licenseNumber}
                    onChange={(e) =>
                      onFilterChange("licenseNumber", e.target.value)
                    }
                    placeholder="Enter license"
                    className="bg-white border-[#E5E7EB] hover:border-[#1D4ED8] focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 transition-all duration-200 rounded-lg h-10"
                    style={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)" }}
                  />
                </div>

                <div className="space-y-2 group">
                  <Label className="text-sm text-[#0D1A33] font-semibold">
                    Status:
                  </Label>
                  <StatusSelect
                    value={filters.status}
                    onChange={(value) => onFilterChange("status", value)}
                    options={statusOptions}
                    placeholder="All Status"
                    className="w-full transition-all duration-200"
                  />
                </div>

                <div className="space-y-2 group">
                  <Label
                    htmlFor="avgRating"
                    className="text-sm text-[#0D1A33] font-semibold"
                  >
                    Min Rating:
                  </Label>
                  <Input
                    id="avgRating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={filters.avgRating}
                    onChange={(e) =>
                      onFilterChange("avgRating", e.target.value)
                    }
                    placeholder="0.0"
                    className="bg-white border-[#E5E7EB] hover:border-[#1D4ED8] focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 transition-all duration-200 rounded-lg h-10"
                    style={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)" }}
                  />
                </div>

                <div className="space-y-2 group">
                  <Label
                    htmlFor="country"
                    className="text-sm text-[#0D1A33] font-semibold"
                  >
                    Country:
                  </Label>
                  <StatusSelect
                    id="country"
                    value={filters.country}
                    onChange={handleCountryChange}
                    options={countries}
                    searchable
                    className="bg-white border-[#E5E7EB] hover:border-[#1D4ED8] focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 transition-all duration-200 rounded-lg h-10"
                    style={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)" }}
                  />
                </div>

                <div className="space-y-2 group">
                  <Label
                    htmlFor="state"
                    className="text-sm text-[#0D1A33] font-semibold"
                  >
                    State:
                  </Label>
                  <StatusSelect
                    id="state"
                    value={filters.state}
                    onChange={handleStateChange}
                    options={states}
                    disabled={!filters.country}
                    searchable
                    className="bg-white border-[#E5E7EB] hover:border-[#1D4ED8] focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 transition-all duration-200 rounded-lg h-10 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)" }}
                  />
                </div>

                <div className="space-y-2 group">
                  <Label
                    htmlFor="city"
                    className="text-sm text-[#0D1A33] font-semibold"
                  >
                    City:
                  </Label>
                  <StatusSelect
                    id="city"
                    value={filters.city}
                    onChange={(value) => onFilterChange("city", value)}
                    options={cities}
                    disabled={!filters.state}
                    searchable
                    className="bg-white border-[#E5E7EB] hover:border-[#1D4ED8] focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 transition-all duration-200 rounded-lg h-10 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)" }}
                  />
                </div>

                <div className="space-y-2 group">
                  <Label
                    htmlFor="postalCode"
                    className="text-sm text-[#0D1A33] font-semibold"
                  >
                    Postal Code:
                  </Label>
                  <Input
                    id="postalCode"
                    type="text"
                    value={filters.postalCode}
                    onChange={(e) =>
                      onFilterChange("postalCode", e.target.value)
                    }
                    placeholder="Enter postal code"
                    className="bg-white border-[#E5E7EB] hover:border-[#1D4ED8] focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 transition-all duration-200 rounded-lg h-10"
                    style={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)" }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-4 pt-2">
                <Button
                  variant="outline"
                  onClick={onClearFilters}
                  className="bg-white hover:bg-[#F5F7FA] hover:border-[#F97316] hover:text-[#F97316] transition-all duration-200 border-[#E5E7EB] rounded-lg py-2.5 px-5 w-full sm:w-auto"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
                <Button
                  variant="default"
                  onClick={onApplyFilters}
                  className="bg-[#10B981] hover:bg-[#059669] text-white transition-all duration-200 rounded-lg py-2.5 px-5 w-full sm:w-auto font-semibold"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default memo(DriverFilterPanel);
