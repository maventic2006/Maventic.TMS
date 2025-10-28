import React, { useState, useEffect } from "react";
import { Globe, Plus, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStates } from "../../../redux/slices/transporterSlice";
import { getComponentTheme } from "../../../utils/theme";
import { CustomSelect } from "../../../components/ui/Select";

const ServiceableAreaTab = ({ formData, setFormData, errors = {} }) => {
  const dispatch = useDispatch();
  const { masterData, statesByCountry } = useSelector(
    (state) => state.transporter
  );
  const actionButtonTheme = getComponentTheme("actionButton");

  const serviceableAreas = formData.serviceableAreas || [];

  // Load states for each serviceable area country
  useEffect(() => {
    serviceableAreas.forEach((area) => {
      if (area.country && !statesByCountry[area.country]) {
        dispatch(fetchStates(area.country));
      }
    });
  }, [serviceableAreas, dispatch, statesByCountry]);

  const addServiceableArea = () => {
    const newArea = {
      country: "",
      states: [],
    };

    setFormData((prev) => ({
      ...prev,
      serviceableAreas: [...prev.serviceableAreas, newArea],
    }));
  };

  const removeServiceableArea = (index) => {
    if (serviceableAreas.length <= 1) return; // Don't allow removing the last area

    const updatedAreas = serviceableAreas.filter((_, i) => i !== index);

    setFormData((prev) => ({
      ...prev,
      serviceableAreas: updatedAreas,
    }));
  };

  const updateServiceableArea = (index, field, value) => {
    const updatedAreas = [...serviceableAreas];
    updatedAreas[index] = {
      ...updatedAreas[index],
      [field]: value,
    };

    // If country changes, reset states and fetch new ones
    if (field === "country") {
      updatedAreas[index].states = [];
      // Fetch states for new country
      if (value && !statesByCountry[value]) {
        dispatch(fetchStates(value));
      }
    }

    setFormData((prev) => ({
      ...prev,
      serviceableAreas: updatedAreas,
    }));
  };

  const toggleState = (areaIndex, stateCode, stateName) => {
    const area = serviceableAreas[areaIndex];
    const currentStates = area.states || [];

    let updatedStates;
    if (currentStates.includes(stateCode)) {
      // Remove state
      updatedStates = currentStates.filter((code) => code !== stateCode);
    } else {
      // Add state
      updatedStates = [...currentStates, stateCode];
    }

    updateServiceableArea(areaIndex, "states", updatedStates);
  };

  const removeState = (areaIndex, stateCode) => {
    const area = serviceableAreas[areaIndex];
    const updatedStates = (area.states || []).filter(
      (code) => code !== stateCode
    );
    updateServiceableArea(areaIndex, "states", updatedStates);
  };

  const getAvailableCountries = () => {
    const usedCountries = serviceableAreas
      .map((area) => area.country)
      .filter(Boolean);
    return masterData.countries.filter(
      (country) => !usedCountries.includes(country.code)
    );
  };

  const getStatesForCountry = (countryCode) => {
    return statesByCountry[countryCode] || [];
  };

  const getStateName = (countryCode, stateCode) => {
    const states = getStatesForCountry(countryCode);
    const state = states.find((s) => s.code === stateCode);
    return state ? state.name : stateCode;
  };

  const getCountryName = (countryCode) => {
    const country = masterData.countries.find((c) => c.code === countryCode);
    return country ? country.name : countryCode;
  };

  return (
    <div className="bg-white rounded-xl p-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Globe className="w-6 h-6 text-[#0D1A33]" />
          <h2 className="text-xl font-semibold text-[#0D1A33]">
            Serviceable Areas
          </h2>
        </div>
        <button
          onClick={addServiceableArea}
          disabled={getAvailableCountries().length === 0}
          className={`${actionButtonTheme.primary} disabled:opacity-50 disabled:cursor-not-allowed`}
          title={
            getAvailableCountries().length === 0
              ? "All countries have been added"
              : ""
          }
        >
          <Plus className="w-4 h-4" />
          Add Service Area
        </button>
      </div>

      {/* Service Areas List */}
      <div className="space-y-4">
        {serviceableAreas.map((area, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            {/* Area Header */}
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">
                    Service Area {index + 1}
                  </span>
                  {area.country && (
                    <span className="text-sm text-gray-600">
                      ({getCountryName(area.country)} -{" "}
                      {area.states?.length || 0} states)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {serviceableAreas.length > 1 && (
                    <button
                      onClick={() => removeServiceableArea(index)}
                      className="p-1 text-red-500 hover:text-red-700 rounded"
                      title="Remove Service Area"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Area Content */}
            <div className="p-4">
              {/* Country Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Service Country <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    value={area.country || ""}
                    onValueChange={(value) =>
                      updateServiceableArea(index, "country", value)
                    }
                    options={getAvailableCountries()}
                    placeholder="Select country"
                    searchable
                    getOptionLabel={(option) => option.name}
                    getOptionValue={(option) => option.code}
                    className={
                      errors.serviceableAreas &&
                      errors.serviceableAreas[index]?.country
                        ? "border-red-500"
                        : ""
                    }
                    error={errors.serviceableAreas?.[index]?.country}
                  />
                  {errors.serviceableAreas &&
                    errors.serviceableAreas[index]?.country && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        ⚠️ {errors.serviceableAreas[index].country}
                      </p>
                    )}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Service States <span className="text-red-500">*</span>
                  </label>

                  {/* State Selection Dropdown */}
                  {area.country && (
                    <CustomSelect
                      value=""
                      onValueChange={(value) => {
                        if (value) {
                          const stateCode = value;
                          const updatedStates = [
                            ...(area.states || []),
                            stateCode,
                          ];
                          updateServiceableArea(index, "states", updatedStates);
                        }
                      }}
                      options={getStatesForCountry(area.country).filter(
                        (state) => !(area.states || []).includes(state.code)
                      )}
                      placeholder="Select states to add"
                      searchable
                      getOptionLabel={(option) => option.name}
                      getOptionValue={(option) => option.code}
                    />
                  )}

                  {!area.country && (
                    <div className="text-sm text-gray-500 italic">
                      Select a country first to choose states
                    </div>
                  )}

                  {/* Selected States Tags */}
                  {area.states && area.states.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {area.states.map((stateCode) => (
                        <span
                          key={stateCode}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-teal-100 text-teal-800 text-sm rounded-full"
                        >
                          {getStateName(area.country, stateCode)}
                          <button
                            onClick={() => removeState(index, stateCode)}
                            className="text-teal-600 hover:text-teal-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {errors.serviceableAreas &&
                    errors.serviceableAreas[index]?.states && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        ⚠️ {errors.serviceableAreas[index].states}
                      </p>
                    )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {serviceableAreas.length === 0 && (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
          <Globe className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Service Areas Added
          </h3>
          <p className="text-gray-500 mb-4">
            Add service areas to specify which countries and states this
            transporter can service.
          </p>
          <button
            onClick={addServiceableArea}
            className={actionButtonTheme.primary}
          >
            <Plus className="w-4 h-4" />
            Add First Service Area
          </button>
        </div>
      )}

      {/* Global Validation Errors */}
      {errors.serviceableAreas &&
        typeof errors.serviceableAreas === "string" && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 flex items-center gap-2">
              ⚠️ {errors.serviceableAreas}
            </p>
          </div>
        )}

      {/* Help Text */}
      {/* <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Tips:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            • Each country can only be added once across all service areas
          </li>
          <li>• You must select at least one state for each country</li>
          <li>• Use the expand/collapse buttons to manage state selections</li>
          <li>• Remove state tags by clicking the × button</li>
        </ul>
      </div> */}
    </div>
  );
};

export default ServiceableAreaTab;
