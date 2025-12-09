import React, { useState, useCallback, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Info, Truck, Search, Loader2, CheckCircle, AlertCircle, X } from "lucide-react";
import { CustomSelect } from "../../../components/ui/Select";
import { Country, State } from "country-state-city";
import { vehicleAPI } from "../../../utils/api";
import { addToast } from "../../../redux/slices/uiSlice";
import { TOAST_TYPES } from "../../../utils/constants";

const BasicInformationTab = ({ formData, setFormData, errors, masterData }) => {
  const dispatch = useDispatch();
  
  // RC Lookup states
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupStatus, setLookupStatus] = useState(null); // 'success', 'error', null
  const [lookupMessage, setLookupMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingRCData, setPendingRCData] = useState(null);
  const debounceRef = useRef(null);

  const handleChange = (field, value) => {
    // Create updated basic information object
    const updatedBasicInfo = {
      ...formData.basicInformation,
      [field]: value,
    };

    // If GPS tracking is being disabled, clear the IMEI number
    if (field === 'gpsActive' && !value) {
      updatedBasicInfo.gpsIMEI = '';
    }

    setFormData((prev) => ({
      ...prev,
      basicInformation: updatedBasicInfo,
    }));

    // If registration number is being changed, trigger RC lookup
    if (field === 'registrationNumber') {
      handleRegistrationNumberChange(value);
    }
  };

  /**
   * Maps RC API response to vehicle form data structure
   */
  const mapRCResponseToFormData = useCallback((rcData) => {
    const vehicleDetails = rcData.VehicleDetails;
    if (!vehicleDetails) return null;

    // Extract manufacturing year from month/year format
    const extractYear = (monthYear) => {
      if (!monthYear) return new Date().getFullYear();
      const parts = monthYear.split('/');
      return parts.length === 2 ? parseInt(parts[1]) : new Date().getFullYear();
    };

    // Map state code to full name
    const getStateName = (stateCode) => {
      const states = State.getStatesOfCountry('IN');
      const state = states.find(s => s.isoCode === stateCode);
      return state ? state.name : stateCode;
    };

    // Map RC fuel description to fuel type ID
    const mapFuelTypeToId = (fuelDesc) => {
      if (!fuelDesc) return '';
      const fuelLower = fuelDesc.toLowerCase();
      
      let mappedId = '';
      if (fuelLower.includes('diesel')) mappedId = 'FT001';
      else if (fuelLower.includes('cng')) mappedId = 'FT002';
      else if (fuelLower.includes('electric')) mappedId = 'FT003';
      else if (fuelLower.includes('petrol') || fuelLower.includes('gasoline')) mappedId = 'FT004';
      
      // Return empty string if no match found
      return mappedId;
    };

    return {
      basicInformation: {
        ...formData.basicInformation,
        registrationNumber: vehicleDetails.rc_regn_no || '',
        vin: vehicleDetails.rc_chasi_no || '',
        make: vehicleDetails.rc_maker_desc || '',
        model: vehicleDetails.rc_maker_model || '',
        year: extractYear(vehicleDetails.rc_manu_month_yr),
        color: vehicleDetails.rc_color || '',
        vehicleRegisteredAtCountry: vehicleDetails.state_cd ? 'IN' : '',
        vehicleRegisteredAtState: vehicleDetails.state_cd || '',
      },
      specifications: {
        ...formData.specifications,
        engineNumber: vehicleDetails.rc_eng_no || '',
        fuelType: mapFuelTypeToId(vehicleDetails.rc_fuel_desc),
        emissionStandard: vehicleDetails.rc_norms_desc || '',
        noOfCylinders: parseInt(vehicleDetails.rc_no_cyl) || 0,
        engineCapacity: parseFloat(vehicleDetails.rc_cubic_cap) || 0,
      },
      capacityDetails: {
        ...formData.capacityDetails,
        gvw: parseFloat(vehicleDetails.rc_gvw) || 0,
        unladenWeight: parseFloat(vehicleDetails.rc_unld_wt) || 0,
        payloadCapacity: (parseFloat(vehicleDetails.rc_gvw) || 0) - (parseFloat(vehicleDetails.rc_unld_wt) || 0),
        seatingCapacity: parseInt(vehicleDetails.rc_seat_cap) || 0,
        wheelbase: parseFloat(vehicleDetails.rc_wheelbase) || 0,
      }
    };
  }, [formData]);

  /**
   * Check if form has existing data that would be overwritten
   */
  const checkForExistingData = useCallback(() => {
    const basic = formData.basicInformation || {};
    const specs = formData.specifications || {};
    const capacity = formData.capacityDetails || {};
    
    // Check key fields that would be overwritten
    return !!(
      basic.make ||
      basic.model ||
      basic.year !== new Date().getFullYear() ||
      basic.color ||
      basic.vin ||
      specs.engineNumber ||
      specs.fuelType ||
      specs.emissionStandard ||
      capacity.gvw ||
      capacity.unladenWeight
    );
  }, [formData]);

  /**
   * Apply RC data to form
   */
  const applyRCData = useCallback((mappedData) => {
    setFormData(prev => ({
      ...prev,
      ...mappedData
    }));
    
    setLookupStatus('success');
    setLookupMessage('Vehicle details fetched and applied successfully');
    dispatch(addToast({
      type: TOAST_TYPES.SUCCESS,
      message: 'Vehicle details auto-populated from RC database'
    }));
  }, [setFormData, dispatch]);

  /**
   * Handle confirmation dialog - confirm overwrite
   */
  const handleConfirmOverwrite = useCallback(() => {
    if (pendingRCData) {
      applyRCData(pendingRCData);
      setPendingRCData(null);
      setShowConfirmModal(false);
    }
  }, [pendingRCData, applyRCData]);

  /**
   * Handle confirmation dialog - cancel overwrite
   */
  const handleCancelOverwrite = useCallback(() => {
    setPendingRCData(null);
    setShowConfirmModal(false);
    setLookupStatus('error');
    setLookupMessage('Data overwrite cancelled');
  }, []);

  /**
   * Performs RC lookup API call
   */
  const performRCLookup = useCallback(async (registrationNumber) => {
    if (!registrationNumber || registrationNumber.length < 8) {
      setLookupStatus(null);
      setLookupMessage('');
      return;
    }

    setIsLookingUp(true);
    setLookupStatus(null);

    try {
      const response = await vehicleAPI.lookupVehicleByRC(registrationNumber);
      
      if (response.data && response.data.response && response.data.response.length > 0) {
        const rcData = response.data.response[0].jsonResponse;
        
        if (rcData && rcData.VehicleDetails && rcData.VehicleDetails.stautsMessage === 'OK') {
          // Map API response to form data
          const mappedData = mapRCResponseToFormData(rcData);
          
          if (mappedData) {
            // Check if form has existing data
            const hasExistingData = checkForExistingData();
            
            if (hasExistingData) {
              // Show confirmation dialog
              setPendingRCData(mappedData);
              setShowConfirmModal(true);
              setLookupStatus('success');
              setLookupMessage('Vehicle details found - Click confirm to overwrite existing data');
            } else {
              // Auto-populate without confirmation
              applyRCData(mappedData);
            }
          } else {
            setLookupStatus('error');
            setLookupMessage('Unable to parse vehicle details');
          }
        } else {
          setLookupStatus('error');
          setLookupMessage('Registration number not found');
          dispatch(addToast({
            type: TOAST_TYPES.WARNING,
            message: 'Registration number not found'
          }));
        }
      } else {
        setLookupStatus('error');
        setLookupMessage('Registration number not found');
        dispatch(addToast({
          type: TOAST_TYPES.WARNING,
          message: 'Registration number not found'
        }));
      }
    } catch (error) {
      console.error('RC Lookup error:', error);
      
      let errorMessage = 'Error occurred in server';
      let toastMessage = 'Error occurred in server';
      
      if (error.response?.status === 404) {
        errorMessage = 'Registration number not found';
        toastMessage = 'Registration number not found';
      } else if (error.response?.status === 408) {
        errorMessage = 'Request timeout';
        toastMessage = 'Error occurred in server - Request timeout';
      } else if (error.response?.status >= 500 || error.response?.status === 502) {
        errorMessage = 'Server error occurred';
        toastMessage = 'Error occurred in server';
      }
      
      setLookupStatus('error');
      setLookupMessage(errorMessage);
      dispatch(addToast({
        type: TOAST_TYPES.ERROR,
        message: toastMessage
      }));
    } finally {
      setIsLookingUp(false);
    }
  }, [mapRCResponseToFormData, checkForExistingData, applyRCData, dispatch]);

  /**
   * Handles registration number change with debouncing
   */
  const handleRegistrationNumberChange = useCallback((value) => {
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Reset lookup status when typing
    if (value !== formData.basicInformation?.registrationNumber) {
      setLookupStatus(null);
      setLookupMessage('');
    }

    // Debounce the API call
    debounceRef.current = setTimeout(() => {
      if (value && value.length >= 8) {
        performRCLookup(value.trim().toUpperCase());
      }
    }, 1000); // 1 second delay
  }, [performRCLookup, formData.basicInformation?.registrationNumber]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Helper function to handle numeric inputs with leading zeros
  const handleNumericChange = (field, value) => {
    // Allow empty string
    if (value === "") {
      handleChange(field, "");
      return;
    }

    // Remove leading zeros but keep single zero
    const cleanedValue = value.replace(/^0+(?=\d)/, "") || "0";
    handleChange(field, cleanedValue);
  };

  const data = formData.basicInformation || {};
  
  // Debug logging for data reception
  console.log("🎛️ BasicInformationTab received formData:", formData);
  console.log("🎛️ Extracted data:", data);
  console.log("🎛️ registrationNumber value:", data.registrationNumber);

  // Get current year for month/year picker
  const currentYear = new Date().getFullYear();

  // ✅ USE MASTER DATA FROM API - NOT HARDCODED CONSTANTS
  const vehicleTypes = masterData?.vehicleTypes || [
    { value: "VT001", label: "HCV - Heavy Commercial Vehicle" },
    { value: "VT002", label: "MCV - Medium Commercial Vehicle" },
    { value: "VT003", label: "LCV - Light Commercial Vehicle" },
  ];

  // ✅ USE MASTER DATA FROM API - NOT HARDCODED CONSTANTS
  const usageTypes = masterData?.usageTypes || [
    { value: "UT001", label: "COMMERCIAL" },
    { value: "UT002", label: "PRIVATE" },
    { value: "UT003", label: "RENTAL" },
    { value: "UT004", label: "LEASE" },
  ];

  // Country and state options for registration location
  const countryOptions = Country.getAllCountries().map((country) => ({
    value: country.isoCode,
    label: country.name,
  }));

  const stateOptions = data.vehicleRegisteredAtCountry
    ? State.getStatesOfCountry(data.vehicleRegisteredAtCountry).map(
        (state) => ({
          value: state.isoCode,
          label: state.name,
        })
      )
    : [];

  const handleCountryChange = (countryCode) => {
    console.log("🌍 Country selected:", countryCode);
    handleChange("vehicleRegisteredAtCountry", countryCode);
    // Clear state when country changes
    handleChange("vehicleRegisteredAtState", "");
  };

  // Debug log for formData
  console.log(
    "📋 BasicInformationTab - Current formData.basicInformation:",
    data
  );
  console.log("🌍 Selected Country:", data.vehicleRegisteredAtCountry);
  console.log("🏙️ Selected State:", data.vehicleRegisteredAtState);
  console.log("📍 State Options Count:", stateOptions.length);

  return (
    <div className="space-y-5">
      {/* 3-column grid layout with smaller inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Registration Number */}
        {/* Registration Number with RC Lookup */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Registration Number <span className="text-red-500">*</span>
            {/* <span className="text-xs font-normal text-gray-500 ml-2">
              (Auto-fetches vehicle details from RC database)
            </span> */}
          </label>
          <div className="relative">
            <input
              type="text"
              value={data.registrationNumber || ""}
              onChange={(e) => handleChange("registrationNumber", e.target.value.toUpperCase())}
              placeholder="e.g., MH12AB1234"
              maxLength={15}
              className={`w-full px-3 py-2 pr-10 text-sm border ${
                errors.registrationNumber 
                  ? "border-red-500" 
                  : lookupStatus === 'success' 
                  ? "border-green-500" 
                  : lookupStatus === 'error'
                  ? "border-orange-500"
                  : "border-gray-300"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent`}
            />
            
            {/* Loading/Status Icon */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {isLookingUp ? (
                <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
              ) : lookupStatus === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : lookupStatus === 'error' ? (
                <AlertCircle className="h-4 w-4 text-orange-500" />
              ) : null}
            </div>
          </div>
          
          {/* Status Messages */}
          {errors.registrationNumber && (
            <p className="mt-1 text-xs text-red-600">{errors.registrationNumber}</p>
          )}
          {lookupMessage && !errors.registrationNumber && (
            <p className={`mt-1 text-xs ${
              lookupStatus === 'success' 
                ? 'text-green-600' 
                : lookupStatus === 'error' 
                ? 'text-orange-600' 
                : 'text-gray-600'
            }`}>
              {lookupMessage}
            </p>
          )}
          {/* {isLookingUp && (
            <p className="mt-1 text-xs text-blue-600">
              Fetching vehicle details from RC database...
            </p>
          )} */}
        </div>

        {/* Make/Brand */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Make/Brand <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.make || ""}
            onChange={(e) => handleChange("make", e.target.value)}
            placeholder="e.g., Tata, Ashok Leyland"
            className={`w-full px-3 py-2 text-sm border ${
              errors.make ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent`}
          />
          {errors.make && (
            <p className="mt-1 text-xs text-red-600">{errors.make}</p>
          )}
        </div>

        {/* Maker Model */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Maker Model
          </label>
          <input
            type="text"
            value={data.model || ""}
            onChange={(e) => handleChange("model", e.target.value)}
            placeholder="e.g., LPT 1918, ECOMET 1215"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>

        {/* Year of Manufacture */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Year of Manufacture <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={data.year || currentYear}
            onChange={(e) => handleNumericChange("year", e.target.value)}
            min="1990"
            max={currentYear + 1}
            placeholder={currentYear.toString()}
            className={`w-full px-3 py-2 text-sm border ${
              errors.year ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent`}
          />
          {errors.year && (
            <p className="mt-1 text-xs text-red-600">{errors.year}</p>
          )}
        </div>

        {/* VIN (Vehicle Identification Number) */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            VIN (Vehicle Identification Number){" "}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.vin || ""}
            onChange={(e) => handleChange("vin", e.target.value.toUpperCase())}
            placeholder="e.g., 1HGBH41JXMN109186"
            maxLength={17}
            className={`w-full px-3 py-2 text-sm border ${
              errors.vin ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent`}
          />
          {errors.vin && (
            <p className="mt-1 text-xs text-red-600">{errors.vin}</p>
          )}
        </div>

        {/* Vehicle Type */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Vehicle Type <span className="text-red-500">*</span>
          </label>
          <CustomSelect
            value={data.vehicleType || ""}
            onChange={(value) => handleChange("vehicleType", value)}
            options={vehicleTypes}
            placeholder="Select Type"
            error={errors.vehicleType}
            className="w-full"
          />
          {errors.vehicleType && (
            <p className="mt-1 text-xs text-red-600">{errors.vehicleType}</p>
          )}
        </div>

        {/* Vehicle Category */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Vehicle Category
          </label>
          <input
            type="text"
            value={data.vehicleCategory || ""}
            onChange={(e) => handleChange("vehicleCategory", e.target.value)}
            placeholder="e.g., Commercial, Heavy Duty"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>

        {/* Manufacturing Month & Year */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Manufacturing Month & Year <span className="text-red-500">*</span>
          </label>
          <input
            type="month"
            value={data.manufacturingMonthYear || ""}
            onChange={(e) =>
              handleChange("manufacturingMonthYear", e.target.value)
            }
            max={`${currentYear}-12`}
            className={`w-full px-3 py-2 text-sm border ${
              errors.manufacturingMonthYear
                ? "border-red-500"
                : "border-gray-300"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent`}
          />
          {errors.manufacturingMonthYear && (
            <p className="mt-1 text-xs text-red-600">
              {errors.manufacturingMonthYear}
            </p>
          )}
        </div>

        {/* GPS Tracker IMEI Number */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            GPS Tracker IMEI Number {data.gpsActive && <span className="text-red-500">*</span>}
            {data.gpsActive && (
              <span className="text-xs text-gray-500 ml-2">(Required when GPS tracking is enabled)</span>
            )}
          </label>
          <input
            type="text"
            value={data.gpsIMEI || ""}
            onChange={(e) => handleChange("gpsIMEI", e.target.value)}
            placeholder="123456789012345"
            maxLength={15}
            disabled={!data.gpsActive}
            className={`w-full px-3 py-2 text-sm border ${
              errors.gpsIMEI ? "border-red-500" : "border-gray-300"
            } ${!data.gpsActive ? "bg-gray-100 cursor-not-allowed" : ""} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent`}
          />
          {errors.gpsIMEI && (
            <p className="mt-1 text-xs text-red-600">{errors.gpsIMEI}</p>
          )}
          {!data.gpsActive && (
            <p className="mt-1 text-xs text-gray-500">Enable GPS tracking to enter IMEI number</p>
          )}
        </div>

        {/* GPS Tracker Active Flag */}
        <div className="flex items-center pt-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.gpsActive || false}
              onChange={(e) => handleChange("gpsActive", e.target.checked)}
              className="w-4 h-4 text-[#10B981] border-gray-300 rounded focus:ring-2 focus:ring-[#10B981]"
            />
            <span className="text-xs font-semibold text-gray-700">
              GPS Tracker Active 
            </span>
          </label>
        </div>

        {/* Leasing Flag */}
        <div className="flex items-center pt-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.leasingFlag || false}
              onChange={(e) => handleChange("leasingFlag", e.target.checked)}
              className="w-4 h-4 text-[#10B981] border-gray-300 rounded focus:ring-2 focus:ring-[#10B981]"
            />
            <span className="text-xs font-semibold text-gray-700">
              Leasing Flag
            </span>
          </label>
        </div>

        {/* Avg Running Speed */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Avg Running Speed (km/h)
          </label>
          <input
            type="number"
            value={data.avgRunningSpeed || ""}
            onChange={(e) =>
              handleNumericChange("avgRunningSpeed", e.target.value)
            }
            min="0"
            step="0.1"
            placeholder="60"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>

        {/* Max Running Speed */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Max Running Speed (km/h)
          </label>
          <input
            type="number"
            value={data.maxRunningSpeed || ""}
            onChange={(e) =>
              handleNumericChange("maxRunningSpeed", e.target.value)
            }
            min="0"
            step="0.1"
            placeholder="100"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>

        {/* Usage Type */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Usage Type <span className="text-red-500">*</span>
          </label>
          <CustomSelect
            value={data.usageType || ""}
            onChange={(value) => handleChange("usageType", value)}
            options={usageTypes}
            placeholder="Select Usage Type"
            error={errors.usageType}
            className="w-full"
          />
          {errors.usageType && (
            <p className="mt-1 text-xs text-red-600">{errors.usageType}</p>
          )}
        </div>

        {/* Vehicle Registered at Country */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Vehicle Registered at Country
          </label>
          <CustomSelect
            value={data.vehicleRegisteredAtCountry || ""}
            onChange={handleCountryChange}
            options={countryOptions}
            placeholder="Select Country"
            searchable
            error={errors.vehicleRegisteredAtCountry}
            className="w-full"
          />
          {errors.vehicleRegisteredAtCountry && (
            <p className="mt-1 text-xs text-red-600">
              {errors.vehicleRegisteredAtCountry}
            </p>
          )}
        </div>

        {/* Vehicle Registered at State */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Vehicle Registered at State
          </label>
          <CustomSelect
            value={data.vehicleRegisteredAtState || ""}
            onChange={(value) =>
              handleChange("vehicleRegisteredAtState", value)
            }
            options={stateOptions}
            searchable
            placeholder="Select State"
            error={errors.vehicleRegisteredAtState}
            className="w-full"
            disabled={!data.vehicleRegisteredAtCountry}
          />
          {errors.vehicleRegisteredAtState && (
            <p className="mt-1 text-xs text-red-600">
              {errors.vehicleRegisteredAtState}
            </p>
          )}
        </div>

        {/* Safety Inspection Date */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Safety Inspection Date
          </label>
          <input
            type="date"
            value={data.safetyInspectionDate || ""}
            onChange={(e) =>
              handleChange("safetyInspectionDate", e.target.value)
            }
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>

        {/* Taxes and Fees */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Taxes and Fees
          </label>
          <input
            type="number"
            value={data.taxesAndFees || ""}
            onChange={(e) =>
              handleNumericChange("taxesAndFees", e.target.value)
            }
            min="0"
            step="0.01"
            placeholder="50000"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
          />
        </div>
      </div>

      {/* Information panel at the bottom */}
      <div className="mt-6 bg-blue-50/50 border border-blue-200/50 rounded-lg p-3 flex items-start gap-2">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-blue-800">
          <p className="font-semibold mb-0.5">Basic Vehicle Information</p>
          <p className="text-blue-700">
            Fields marked with * are mandatory. Ensure Make/Brand, VIN, and
            Manufacturing details are accurate for proper vehicle
            identification.
          </p>
        </div>
      </div>

      {/* Confirmation Modal for RC Data Overwrite */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Confirm Vehicle Details Overwrite
              </h3>
              <button
                onClick={handleCancelOverwrite}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    Vehicle details found in RC database
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    This will overwrite any existing data in the form with details from the RC database. This action cannot be undone.
                  </p>
                  
                  {/* Show some key fields that will be overwritten */}
                  {pendingRCData && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <p className="text-xs font-semibold text-gray-700 mb-2">
                        Data to be populated:
                      </p>
                      <div className="space-y-1 text-xs text-gray-600">
                        {pendingRCData.basicInformation?.make && (
                          <p><span className="font-medium">Make:</span> {pendingRCData.basicInformation.make}</p>
                        )}
                        {pendingRCData.basicInformation?.model && (
                          <p><span className="font-medium">Model:</span> {pendingRCData.basicInformation.model}</p>
                        )}
                        {pendingRCData.basicInformation?.year && (
                          <p><span className="font-medium">Year:</span> {pendingRCData.basicInformation.year}</p>
                        )}
                        {pendingRCData.basicInformation?.color && (
                          <p><span className="font-medium">Color:</span> {pendingRCData.basicInformation.color}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Modal Actions */}
            <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
              <button
                onClick={handleCancelOverwrite}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmOverwrite}
                className="px-4 py-2 text-sm font-medium text-white bg-[#10B981] rounded-lg hover:bg-[#059669] transition-colors"
              >
                Confirm Overwrite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BasicInformationTab;
