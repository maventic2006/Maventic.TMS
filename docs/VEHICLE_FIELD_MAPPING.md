# Vehicle Frontend-Backend Field Mapping

## Overview
This document maps frontend field names (camelCase) to backend field names (snake_case) for the Vehicle module.

---

## Basic Information Mapping

| Frontend Field (CreateVehiclePage.jsx) | Backend Field (vehicleController.js) | Required | Type |
|----------------------------------------|--------------------------------------|----------|------|
| make | maker_brand_description |  Yes | string |
| model | maker_model |  Yes | string |
| in / chassisNumber | in_chassis_no |  Yes | string (unique) |
| ehicleType | ehicle_type_id |  Yes | string |
| year / manufacturingMonthYear | manufacturing_month_year |  Yes | string (YYYY-MM) |
| gpsIMEI | gps_tracker_imei_number |  Yes | string (unique) |
| gpsEnabled / gpsActive | gps_tracker_active_flag |  Yes | boolean |
| usageType | usage_type_id |  Yes | string (PASSENGER/CARGO/SPECIAL_EQUIPMENT) |
| egistrationNumber | (goes to ownership table) |  Yes | string (unique) |
| color | color_of_vehicle |  No | string |
| mileage | odometer_reading_km |  No | number |
| safetyInspectionDate | safety_inspection_date |  No | date |
| 	axesAndFees | 	axes_and_fees |  No | number |

---

## Specifications Mapping

| Frontend Field | Backend Field | Required | Type |
|---------------|---------------|----------|------|
| engineType | engine_type_id |  Yes | string |
| engineNumber | engine_number |  Yes | string |
| uelType | uel_type_id |  Yes | string |
| 	ransmission | 	ransmission_type |  Yes | string |
| inancer | inancer |  Yes | string |
| suspensionType | suspension_type |  Yes | string |
| engineCapacity | engine_capacity_cc |  No | number |
| uelTankCapacity | uel_tank_capacity_ltr |  No | number |
| emissionStandard | emission_standard_id |  No | string |

---

## Capacity Details Mapping

| Frontend Field | Backend Field | Required | Type |
|---------------|---------------|----------|------|
| gvw | gvw |  No | number |
| unladenWeight / unloadingWeight | unloading_weight |  No | number |
| payloadCapacity | (calculated: GVW - Unloading Weight) |  No | number |
| loadingCapacityVolume / olumeCapacity | olume_capacity_cubic_meter |  No | number |
| cargoLength | length_mm |  No | number |
| cargoWidth | width_mm |  No | number |
| cargoHeight | height_mm |  No | number |
| 	owingCapacity | 	owing_capacity |  No | number |
| 	ireLoadRating | 	ire_load_rating |  No | string |
| ehicleCondition | ehicle_condition |  No | string |
| seatingCapacity | seating_capacity |  No | number |

---

## Ownership Details Mapping

| Frontend Field | Backend Field | Required | Type |
|---------------|---------------|----------|------|
| ownershipName / ownerName | ownership_name |  No | string |
| egistrationNumber | egistration_number |  Yes | string (unique) |
| egistrationDate | egistration_date |  No | date |
| egistrationUpto | egistration_upto |  No | date |
| alidFrom | alid_from |  No | date |
| alidTo | alid_to |  No | date |
| purchaseDate | purchase_date |  No | date |
| saleAmount / purchasePrice | sale_amount |  No | number |
| stateCode | state_code |  No | string |
| toCode | to_code |  No | string |

---

## Maintenance History Mapping

| Frontend Field | Backend Field | Required | Type |
|---------------|---------------|----------|------|
| lastServiceDate / serviceDate | service_date |  Yes | date |
| 
extServiceDue / upcomingServiceDate | upcoming_service_date |  Yes | date |
| 	ypeOfService | 	ype_of_service |  No | string |
| serviceExpense / 	otalServiceExpense | service_expense |  No | number |
| maintenanceNotes / serviceRemark | service_remark |  No | string |

---

## Service Frequency Mapping

| Frontend Field | Backend Field | Required | Type |
|---------------|---------------|----------|------|
| sequenceNumber | sequence_number (auto-generated) |  No | number |
| serviceIntervalMonths / 	imePeriod | 	ime_period |  No | string |
| serviceIntervalKM / kmDrove | km_drove |  No | number |

---

## Documents Mapping

| Frontend Field | Backend Field | Required | Type |
|---------------|---------------|----------|------|
| documentType | document_type_id |  Yes | string |
| documentNumber / eferenceNumber | eference_number |  No | string |
| issueDate | (not in backend - remove) |  No | date |
| expiryDate / alidTo | alid_to |  Yes | date |
| issuingAuthority | (not in backend - remove) |  No | string |
| alidFrom | alid_from |  Yes | date |
| emarks | emarks |  Yes | string |
| ileName / file | upload_document |  Yes | file |
| ehicleMaintenanceId | ehicle_maintenance_id |  No | string |
| permitCategory | permit_category |  No | string |
| permitCode | permit_code |  No | string |
| documentProvider | document_provider |  No | string |
| coverageType | coverage_type_id |  No | string |
| premiumAmount | premium_amount |  No | number |

---

## Backend Request Format Expected

`javascript
{
  "basicInformation": {
    "make": "TATA",                           //  maker_brand_description
    "model": "LPT 407",                       //  maker_model
    "vin": "MAT123456789012345",             //  vin_chassis_no
    "vehicleType": "VT001",                   //  vehicle_type_id
    "manufacturingMonthYear": "2023-06",      //  manufacturing_month_year
    "gpsIMEI": "123456789012345",            //  gps_tracker_imei_number
    "gpsActive": true,                        //  gps_tracker_active_flag
    "usageType": "CARGO"                      //  usage_type_id
  },
  "specifications": {
    "engineType": "DIESEL_4CYL",             //  engine_type_id
    "engineNumber": "ENG123456",              //  engine_number
    "fuelType": "DIESEL",                     //  fuel_type_id
    "transmission": "MANUAL",                 //  transmission_type
    "financer": "HDFC Bank",                  //  financer
    "suspensionType": "LEAF_SPRING"           //  suspension_type
  },
  "capacityDetails": {
    "unloadingWeight": 1500,                  //  unloading_weight
    "gvw": 4000                               //  gvw
  },
  "ownershipDetails": {
    "ownershipName": "ABC Logistics",         //  ownership_name
    "registrationNumber": "MH12AB1234"        //  registration_number
  },
  "maintenanceHistory": {
    "serviceDate": "2024-01-15",             //  service_date
    "upcomingServiceDate": "2024-07-15"       //  upcoming_service_date
  },
  "serviceFrequency": {
    "timePeriod": "6 months",                 //  time_period
    "kmDrove": 10000                          //  km_drove
  },
  "documents": [
    {
      "documentType": "VEHICLE_INSURANCE",    //  document_type_id
      "validFrom": "2023-06-20",              //  valid_from
      "validTo": "2024-06-19",                //  valid_to
      "remarks": "Comprehensive insurance"     //  remarks
    }
  ]
}
`

---

## Frontend FormData Structure (Current in CreateVehiclePage.jsx)

**ISSUE**: Current structure doesn't match backend expectations!

**Current Structure** (WRONG ):
`javascript
{
  vehicleId: null,
  basicInformation: {
    registrationNumber: "",  // Should be in ownershipDetails
    vin: "",                // Should be "vin" not mapped to snake_case
    make: "",               // Good - backend maps to maker_brand_description
    model: "",              // Good - backend maps to maker_model
    // ... more fields
  }
}
`

**Required Structure** (CORRECT ):
`javascript
{
  basicInformation: {
    make: "",               // Backend: maker_brand_description
    model: "",              // Backend: maker_model
    vin: "",                // Backend: vin_chassis_no
    vehicleType: "",        // Backend: vehicle_type_id
    manufacturingMonthYear: "", // Backend: manufacturing_month_year
    gpsIMEI: "",           // Backend: gps_tracker_imei_number
    gpsActive: false,       // Backend: gps_tracker_active_flag
    usageType: ""          // Backend: usage_type_id
  },
  specifications: {
    engineType: "",         // Backend: engine_type_id (REQUIRED)
    engineNumber: "",       // Backend: engine_number (REQUIRED)
    fuelType: "",          // Backend: fuel_type_id (REQUIRED)
    transmission: "",       // Backend: transmission_type (REQUIRED)
    financer: "",          // Backend: financer (REQUIRED)
    suspensionType: ""      // Backend: suspension_type (REQUIRED)
  },
  ownershipDetails: {
    ownershipName: "",      // Backend: ownership_name
    registrationNumber: "", // Backend: registration_number (UNIQUE)
    // ... other ownership fields
  }
}
`

---

## Action Items for Integration

###  Completed
- [x] Added vehicle API endpoints to utils/api.js
- [x] Updated ehicleSlice.js to use real API calls
- [x] Added etchMasterData thunk for dropdown options

###  Pending
- [ ] Update CreateVehiclePage.jsx formData structure
- [ ] Map frontend fields to backend field names
- [ ] Add field name transformation in API call
- [ ] Test create vehicle end-to-end
- [ ] Update validation to match backend requirements

---

**Document Version**: 1.0  
**Last Updated**: November 5, 2025  
**Status**: Integration in progress
