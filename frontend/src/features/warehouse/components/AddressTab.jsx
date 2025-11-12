import React, { useState, useEffect } from "react";
import { Label, Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Country, State, City } from "country-state-city";

const AddressTab = ({ formData, setFormData, errors }) => {
  const [countries] = useState(Country.getAllCountries());
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    if (formData.address.country) {
      const countryStates = State.getStatesOfCountry(formData.address.country);
      setStates(countryStates);
    }
  }, [formData.address.country]);

  useEffect(() => {
    if (formData.address.country && formData.address.state) {
      const stateCities = City.getCitiesOfState(
        formData.address.country,
        formData.address.state
      );
      setCities(stateCities);
    }
  }, [formData.address.country, formData.address.state]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));

    // Reset dependent fields
    if (field === "country") {
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          country: value,
          state: "",
          city: "",
        },
      }));
    } else if (field === "state") {
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          state: value,
          city: "",
        },
      }));
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Country */}
        <div className="space-y-2">
          <Label
            htmlFor="country"
            className="text-sm font-semibold text-[#0D1A33]"
          >
            Country <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.address.country}
            onValueChange={(value) => handleChange("country", value)}
          >
            <SelectTrigger
              className={errors?.["address.country"] ? "border-red-500" : ""}
            >
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.isoCode} value={country.isoCode}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.["address.country"] && (
            <p className="text-xs text-red-500">{errors["address.country"]}</p>
          )}
        </div>

        {/* State */}
        <div className="space-y-2">
          <Label
            htmlFor="state"
            className="text-sm font-semibold text-[#0D1A33]"
          >
            State <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.address.state}
            onValueChange={(value) => handleChange("state", value)}
            disabled={!formData.address.country}
          >
            <SelectTrigger
              className={errors?.["address.state"] ? "border-red-500" : ""}
            >
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {states.map((state) => (
                <SelectItem key={state.isoCode} value={state.isoCode}>
                  {state.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.["address.state"] && (
            <p className="text-xs text-red-500">{errors["address.state"]}</p>
          )}
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label
            htmlFor="city"
            className="text-sm font-semibold text-[#0D1A33]"
          >
            City <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.address.city}
            onValueChange={(value) => handleChange("city", value)}
            disabled={!formData.address.state}
          >
            <SelectTrigger
              className={errors?.["address.city"] ? "border-red-500" : ""}
            >
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city.name} value={city.name}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.["address.city"] && (
            <p className="text-xs text-red-500">{errors["address.city"]}</p>
          )}
        </div>

        {/* District */}
        <div className="space-y-2">
          <Label
            htmlFor="district"
            className="text-sm font-semibold text-[#0D1A33]"
          >
            District
          </Label>
          <Input
            id="district"
            value={formData.address.district}
            onChange={(e) => handleChange("district", e.target.value)}
            placeholder="Enter district"
          />
        </div>

        {/* Street 1 */}
        <div className="space-y-2">
          <Label
            htmlFor="street1"
            className="text-sm font-semibold text-[#0D1A33]"
          >
            Street Address 1 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="street1"
            value={formData.address.street1}
            onChange={(e) => handleChange("street1", e.target.value)}
            placeholder="Enter street address"
            className={errors?.["address.street1"] ? "border-red-500" : ""}
          />
          {errors?.["address.street1"] && (
            <p className="text-xs text-red-500">{errors["address.street1"]}</p>
          )}
        </div>

        {/* Street 2 */}
        <div className="space-y-2">
          <Label
            htmlFor="street2"
            className="text-sm font-semibold text-[#0D1A33]"
          >
            Street Address 2
          </Label>
          <Input
            id="street2"
            value={formData.address.street2}
            onChange={(e) => handleChange("street2", e.target.value)}
            placeholder="Enter additional address details"
          />
        </div>

        {/* Postal Code */}
        <div className="space-y-2">
          <Label
            htmlFor="postalCode"
            className="text-sm font-semibold text-[#0D1A33]"
          >
            Postal Code
          </Label>
          <Input
            id="postalCode"
            value={formData.address.postalCode}
            onChange={(e) => handleChange("postalCode", e.target.value)}
            placeholder="Enter postal code"
            maxLength={6}
            className={errors?.["address.postalCode"] ? "border-red-500" : ""}
          />
          {errors?.["address.postalCode"] && (
            <p className="text-xs text-red-500">
              {errors["address.postalCode"]}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressTab;
