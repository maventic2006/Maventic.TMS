import React, { useState, useEffect } from "react";
import { Globe, Plus, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Country, State } from "country-state-city";
import { getComponentTheme } from "../../../utils/theme";
import { CustomSelect } from "../../../components/ui/Select";

const ServiceableAreaTab = ({ formData, setFormData, errors = {} }) => {
  const dispatch = useDispatch();
  const { masterData } = useSelector((state) => state.transporter);
  const actionButtonTheme = getComponentTheme("actionButton");

  // Get all countries from country-state-city package
  const allCountries = Country.getAllCountries();

  const serviceableAreas = formData.serviceableAreas || [];

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

    // If country changes, reset states
    if (field === "country") {
      updatedAreas[index].states = [];
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
    return allCountries.filter(
      (country) => !usedCountries.includes(country.isoCode)
    );
  };

  const getStatesForCountry = (countryCode) => {
    if (!countryCode) return [];
    return State.getStatesOfCountry(countryCode);
  };

  const getStateName = (countryCode, stateCode) => {
    const states = getStatesForCountry(countryCode);
    const state = states.find((s) => s.isoCode === stateCode);
    return state ? state.name : stateCode;
  };

  const getCountryName = (countryCode) => {
    const country = allCountries.find((c) => c.isoCode === countryCode);
    return country ? country.name : countryCode;
  };

  return (
    <div className="bg-[#F5F7FA]">
      <div className="bg-white rounded-lg shadow-sm">
        {/* Section Header */}
        <div className="bg-[#0D1A33] text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="w-6 h-6" />
            <h2 className="text-xl font-bold">Serviceable Areas</h2>
          </div>
          <button
            onClick={addServiceableArea}
            className="bg-[#FFA500] text-white h-10 px-4 rounded-lg flex items-center gap-2 hover:bg-[#e6940a] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Service Area
          </button>
        </div>

        <div className="p-6">
          {/* Table View for Serviceable Areas */}
          {serviceableAreas.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="text-left text-sm font-medium text-gray-600 border-b border-gray-200">
                    <th className="pb-3 w-12">#</th>
                    <th className="pb-3 min-w-[250px]">Country</th>
                    <th className="pb-3 min-w-[400px]">States/Provinces</th>
                    <th className="pb-3 w-20 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceableAreas.map((area, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 hover:bg-gray-50"
                      style={{ height: "auto", minHeight: "60px" }}
                    >
                      {/* Index */}
                      <td className="px-3 py-4 align-top">
                        <span className="flex items-center justify-center w-8 h-8 bg-[#0D1A33] text-white rounded-full text-sm font-medium">
                          {index + 1}
                        </span>
                      </td>

                      {/* Country Selection */}
                      <td className="px-3 py-4 align-top">
                        <CustomSelect
                          key={`country-${index}-${area.country}`}
                          value={area.country || ""}
                          onValueChange={(value) =>
                            updateServiceableArea(index, "country", value)
                          }
                          options={
                            area.country
                              ? allCountries
                              : getAvailableCountries()
                          }
                          placeholder="Select Country"
                          searchable
                          getOptionLabel={(option) => option.name}
                          getOptionValue={(option) => option.isoCode}
                          className={`min-w-[250px] ${
                            errors.serviceableAreas?.[index]?.country
                              ? "border-red-500"
                              : ""
                          }`}
                          error={errors.serviceableAreas?.[index]?.country}
                        />
                        {errors.serviceableAreas?.[index]?.country && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.serviceableAreas[index].country}
                          </p>
                        )}
                      </td>

                      {/* States Selection */}
                      <td className="px-3 py-4 align-top">
                        {area.country ? (
                          <div className="space-y-2">
                            {/* State Dropdown */}
                            <CustomSelect
                              key={`state-${index}-${area.states?.length}`}
                              value=""
                              onValueChange={(value) => {
                                if (value) {
                                  const updatedStates = [
                                    ...(area.states || []),
                                    value,
                                  ];
                                  updateServiceableArea(
                                    index,
                                    "states",
                                    updatedStates
                                  );
                                }
                              }}
                              options={getStatesForCountry(area.country).filter(
                                (state) =>
                                  !(area.states || []).includes(state.isoCode)
                              )}
                              placeholder="Select states to add"
                              searchable
                              getOptionLabel={(option) => option.name}
                              getOptionValue={(option) => option.isoCode}
                              className="min-w-[400px]"
                            />

                            {/* Selected States Tags */}
                            {area.states && area.states.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {area.states.map((stateCode) => (
                                  <span
                                    key={stateCode}
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-[#E0F2FE] text-[#0369A1] text-xs rounded-full font-medium"
                                  >
                                    {getStateName(area.country, stateCode)}
                                    <button
                                      onClick={() =>
                                        removeState(index, stateCode)
                                      }
                                      className="text-[#0369A1] hover:text-[#075985] ml-1"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}

                            {errors.serviceableAreas?.[index]?.states && (
                              <p className="text-xs text-red-500 mt-1">
                                {errors.serviceableAreas[index].states}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 italic">
                            Select a country first
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-4 align-top text-center">
                        {serviceableAreas.length > 1 && (
                          <button
                            onClick={() => removeServiceableArea(index)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            title="Remove Service Area"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Empty State */
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
                className="bg-[#FFA500] text-white h-10 px-4 rounded-lg flex items-center gap-2 hover:bg-[#e6940a] transition-colors mx-auto"
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
        </div>
      </div>
    </div>
  );
};

export default ServiceableAreaTab;
