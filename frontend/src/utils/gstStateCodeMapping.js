/**
 * GST State Code Mapping for India
 * Maps state names to their GST state codes (2-digit codes)
 * Reference: Indian Census 2011 state codes
 */

export const GST_STATE_CODES = {
  // Union Territories
  "Andaman and Nicobar Islands": "35",
  "Chandigarh": "04",
  "Dadra and Nagar Haveli and Daman and Diu": "26",
  "Delhi": "07",
  "Jammu and Kashmir": "01",
  "Ladakh": "38",
  "Lakshadweep": "31",
  "Puducherry": "34",
  
  // States
  "Andhra Pradesh": "37",
  "Arunachal Pradesh": "12",
  "Assam": "18",
  "Bihar": "10",
  "Chhattisgarh": "22",
  "Goa": "30",
  "Gujarat": "24",
  "Haryana": "06",
  "Himachal Pradesh": "02",
  "Jharkhand": "20",
  "Karnataka": "29",
  "Kerala": "32",
  "Madhya Pradesh": "23",
  "Maharashtra": "27",
  "Manipur": "14",
  "Meghalaya": "17",
  "Mizoram": "15",
  "Nagaland": "13",
  "Odisha": "21",
  "Punjab": "03",
  "Rajasthan": "08",
  "Sikkim": "11",
  "Tamil Nadu": "33",
  "Telangana": "36",
  "Tripura": "16",
  "Uttar Pradesh": "09",
  "Uttarakhand": "05",
  "West Bengal": "19",
  
  // Alternative names / Common variations
  "NCT of Delhi": "07",
  "Dadra & Nagar Haveli and Daman & Diu": "26",
  "Andaman & Nicobar Islands": "35",
};

/**
 * Get GST state code for a given state name
 * @param {string} stateName - The state name
 * @returns {string|null} - The 2-digit GST state code or null if not found
 */
export const getGSTStateCode = (stateName) => {
  if (!stateName) return null;
  
  // Direct lookup
  if (GST_STATE_CODES[stateName]) {
    return GST_STATE_CODES[stateName];
  }
  
  // Case-insensitive lookup
  const normalizedStateName = stateName.trim();
  const matchedState = Object.keys(GST_STATE_CODES).find(
    (key) => key.toLowerCase() === normalizedStateName.toLowerCase()
  );
  
  return matchedState ? GST_STATE_CODES[matchedState] : null;
};

/**
 * Get state name from GST state code
 * @param {string} gstCode - The 2-digit GST state code
 * @returns {string|null} - The state name or null if not found
 */
export const getStateNameFromGSTCode = (gstCode) => {
  if (!gstCode) return null;
  
  const normalizedCode = gstCode.toString().padStart(2, '0');
  const entry = Object.entries(GST_STATE_CODES).find(
    ([_, code]) => code === normalizedCode
  );
  
  return entry ? entry[0] : null;
};
