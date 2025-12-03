import React, { useState, useEffect } from "react";
import { Globe, Plus, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Country, State } from "country-state-city";
import { getComponentTheme } from "../../../utils/theme";
import { CustomSelect, MultiSelect } from "../../../components/ui/Select";

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

    // If states are being updated, validate they belong to the country
    if (field === "states" && updatedAreas[index].country) {
      const validStates = getStatesForCountry(updatedAreas[index].country);
      const validStateNames = validStates.map((s) => s.name);
      updatedAreas[index].states = value.filter((stateName) =>
        validStateNames.includes(stateName)
      );
    }

    setFormData((prev) => ({
      ...prev,
      serviceableAreas: updatedAreas,
    }));
  };

  const toggleState = (areaIndex, stateName) => {
    const area = serviceableAreas[areaIndex];
    const currentStates = area.states || [];

    let updatedStates;
    if (currentStates.includes(stateName)) {
      // Remove state
      updatedStates = currentStates.filter((name) => name !== stateName);
    } else {
      // Add state
      updatedStates = [...currentStates, stateName];
    }

    updateServiceableArea(areaIndex, "states", updatedStates);
  };

  const removeState = (areaIndex, stateName) => {
    const area = serviceableAreas[areaIndex];
    const updatedStates = (area.states || []).filter(
      (name) => name !== stateName
    );
    updateServiceableArea(areaIndex, "states", updatedStates);
  };

  const getAvailableCountries = () => {
    const usedCountries = serviceableAreas
      .map((area) => area.country)
      .filter(Boolean);
    return allCountries.filter(
      (country) => !usedCountries.includes(country.name)
    );
  };

  const getStatesForCountry = (countryName) => {
    if (!countryName) return [];
    // Find country by name and get its isoCode
    const country = allCountries.find((c) => c.name === countryName);
    if (!country) return [];
    return State.getStatesOfCountry(country.isoCode);
  };

  const getStateName = (countryName, stateName) => {
    // Since we're now storing names directly, just return the stateName
    return stateName;
  };

  const getCountryName = (countryName) => {
    // Since we're now storing names directly, just return the countryName
    return countryName;
  };

  return (
    <div className="bg-[#F5F7FA]">
      <div className="bg-white rounded-lg shadow-sm">
        {/* Section Header */}
        <div className="bg-[#0D1A33] text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            <h2 className="text-lg font-bold">Serviceable Areas</h2>
          </div>
          <button
            onClick={addServiceableArea}
            className="bg-[#10B981] text-white h-9 px-3 rounded-lg flex items-center gap-2 hover:bg-[#059669] transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        <div className="p-4">
          {/* Table View for Serviceable Areas */}
          {serviceableAreas.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-600 border-b border-gray-200">
                    <th className="pb-2 pl-4 w-12">#</th>
                    <th className="pb-2 pl-4 min-w-[250px]">Country</th>
                    <th className="pb-2 pl-4 min-w-[400px]">
                      States/Provinces
                    </th>
                    <th className="pb-2 pl-4 w-20 text-center">Actions</th>
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
                      <td className="px-2 py-3 align-top">
                        <span className="flex items-center justify-center w-7 h-7 bg-[#0D1A33] text-white rounded-full text-xs font-medium">
                          {index + 1}
                        </span>
                      </td>

                      {/* Country Selection */}
                      <td className="px-2 py-3 align-top">
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
                          getOptionValue={(option) => option.name}
                          className={`min-w-[250px] text-sm ${
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
                      <td className="px-2 py-3 align-top">
                        {area.country ? (
                          <div className="space-y-2">
                            {/* State Dropdown */}
                            {/* <CustomSelect
                              key={`state-${index}-${area.states?.length}`}
                              value=""
                              onValueChange={(value) => {
                                if (value) {
                                  // Validate that the selected state belongs to this country
                                  const validStates = getStatesForCountry(
                                    area.country
                                  );
                                  const validStateNames = validStates.map(
                                    (s) => s.name
                                  );

                                  if (validStateNames.includes(value)) {
                                    const updatedStates = [
                                      ...(area.states || []),
                                      value,
                                    ];
                                    updateServiceableArea(
                                      index,
                                      "states",
                                      updatedStates
                                    );
                                  } else {
                                    console.error(
                                      `State "${value}" does not belong to country "${area.country}"`
                                    );
                                  }
                                }
                              }}
                              options={getStatesForCountry(area.country).filter(
                                (state) =>
                                  !(area.states || []).includes(state.name)
                              )}
                              placeholder="Select states to add"
                              searchable
                              getOptionLabel={(option) => option.name}
                              getOptionValue={(option) => option.name}
                              className="min-w-[400px] text-sm"
                            /> */}

                            <MultiSelect
                              key={`state-${index}-${area.states?.length}`}
                              value={area.states || []}
                              onValueChange={(selectedValues) => {
                                updateServiceableArea(
                                  index,
                                  "states",
                                  selectedValues
                                );
                              }}
                              options={getStatesForCountry(area.country).map(
                                (s) => s.name
                              )}
                              placeholder="Select states..."
                              searchable={true}
                              error={errors.serviceableAreas?.[index]?.states}
                              className="min-w-[400px] text-sm"
                            />

                            {errors.serviceableAreas?.[index]?.states && (
                              <p className="text-xs text-red-500 mt-1">
                                {errors.serviceableAreas[index].states}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">
                            Select a country first
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-2 py-3 align-top text-center">
                        {serviceableAreas.length > 1 && (
                          <button
                            onClick={() => removeServiceableArea(index)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            title="Remove Service Area"
                          >
                            <X className="w-4 h-4" />
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
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
              <Globe className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <h3 className="text-base font-medium text-gray-900 mb-2">
                No Service Areas Added
              </h3>
              <p className="text-gray-500 text-sm mb-3">
                Add service areas to specify which countries and states this
                transporter can service.
              </p>
              <button
                onClick={addServiceableArea}
                className="bg-[#10B981] text-white h-9 px-3 rounded-lg flex items-center gap-2 hover:bg-[#059669] transition-colors mx-auto text-sm"
              >
                <Plus className="w-4 h-4" />
                Add First Service Area
              </button>
            </div>
          )}

          {/* Global Validation Errors */}
          {errors.serviceableAreas &&
            typeof errors.serviceableAreas === "string" && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-700 flex items-center gap-2">
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
