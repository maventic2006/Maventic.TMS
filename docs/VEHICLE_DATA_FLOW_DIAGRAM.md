#  VEHICLE FOREIGN KEY FIX - DATA FLOW DIAGRAM

##  **VISUAL REPRESENTATION**

###  BEFORE FIX (BROKEN FLOW)

`

                    DATABASE LAYER                           
     
    Master Tables (Source of Truth)                        
     vehicle_type_master   (VT001, VT002, VT003...)     
     fuel_type_master      (FT001, FT002, FT003...)     
     usage_type_master     (UT001, UT002, UT003...)     
     engine_type_master    (ET001, ET002, ET003...)     
     coverage_type_master  (CT001, CT002, CT003...)     
     
─
                            
                              NOT QUERIED
                             (coverage_type_master missing)
                            

                    BACKEND API LAYER                        
     
    GET /api/vehicles/master-data                          
     vehicleTypes   Returns VT001, VT002, VT003       
     fuelTypes      Returns FT001, FT002, FT003       
     usageTypes     Returns UT001, UT002, UT003       
     engineTypes    Returns ET001, ET002, ET003       
     coverageTypes  MISSING (not in response)         
     

                            
                     API Data Available
                            

                    REDUX STATE LAYER                        
     
    vehicle.masterData                                     
     vehicleTypes: [VT001, VT002, ...]   Stored      
     fuelTypes: [FT001, FT002, ...]      Stored      
     usageTypes: [UT001, UT002, ...]     Stored      
     engineTypes: [ET001, ET002, ...]    Stored      
     coverageTypes: []                   MISSING     
     

                            
                     Components Ignore API
                            

                  FRONTEND COMPONENTS                        
                                                             
      
    BasicInformationTab.jsx                               
     import { VEHICLE_TYPES } from "constants"          
     const VEHICLE_TYPES = [                            
         { value: "HCV", label: "..." }   WRONG ID!      
       ]                                                   
     Ignores masterData.vehicleTypes                    
      
                                                             
      
    SpecificationsTab.jsx                                 
     import { FUEL_TYPES } from "constants"             
     const FUEL_TYPES = [                               
         { value: "DIESEL", label: "..." }  WRONG ID!    
       ]                                                   
     Ignores masterData.fuelTypes                       
      
                                                             
      
    DocumentUploadModal.jsx                               
     <input type="text"                                 
         placeholder="Full/Third Party"                   
         onChange={handleChange} />   FREE TEXT!         
     User types "full" (not CT001)                      
      

                            
                     Invalid Values
                            

                    FORM SUBMISSION                          
     
    POST /api/vehicles                                     
    {                                                      
      vehicleType: "HCV",       Invalid (not VT001)    
      fuelType: "DIESEL",       Invalid (not FT001)    
      usageType: "COMMERCIAL",  Invalid (not UT001)    
      documents: [                                         
        { coverageType: "full" }  Invalid (not CT001)   
      ]                                                    
    }                                                      
     

                            
                     Foreign Key Error
                            

                    DATABASE ERROR                           
     
     ER_NO_REFERENCED_ROW_2                             
    Cannot add or update a child row: a foreign key       
    constraint fails                                       
                                                           
    vehicle_basic_information_hdr.vehicle_type_id         
    CONSTRAINT FOREIGN KEY (vehicle_type_id)              
    REFERENCES vehicle_type_master (vehicle_type_id)      
                                                           
    Value "HCV" does NOT exist in vehicle_type_master     
    Value "DIESEL" does NOT exist in fuel_type_master     
    Value "full" does NOT exist in coverage_type_master   
     

`

---

###  AFTER FIX (WORKING FLOW)

`

                    DATABASE LAYER                           
     
    Master Tables (Source of Truth)                        
     vehicle_type_master   (VT001, VT002, VT003...)     
     fuel_type_master      (FT001, FT002, FT003...)     
     usage_type_master     (UT001, UT002, UT003...)     
     engine_type_master    (ET001, ET002, ET003...)     
     coverage_type_master  (CT001, CT002, CT003...)     
     

                            
                              ALL TABLES QUERIED
                             (including coverage_type_master)
                            

                    BACKEND API LAYER                        
     
    GET /api/vehicles/master-data                          
     vehicleTypes   Returns VT001, VT002, VT003       
     fuelTypes      Returns FT001, FT002, FT003       
     usageTypes     Returns UT001, UT002, UT003       
     engineTypes    Returns ET001, ET002, ET003       
     coverageTypes  Returns CT001-CT008 (FIXED!)      
     

                            
                     Complete API Data
                            

                    REDUX STATE LAYER                        
     
    vehicle.masterData                                     
     vehicleTypes: [VT001, VT002, ...]   Stored      
     fuelTypes: [FT001, FT002, ...]      Stored      
     usageTypes: [UT001, UT002, ...]     Stored      
     engineTypes: [ET001, ET002, ...]    Stored      
     coverageTypes: [CT001-CT008]        STORED!     
     

                            
                     Components Use API Data
                            

                  FRONTEND COMPONENTS                        
                                                             
      
    BasicInformationTab.jsx                               
     const vehicleTypes = masterData?.vehicleTypes     
     <CustomSelect                                      
         options={vehicleTypes}   API DATA!              
         value={formData.vehicleType}                     
       />                                                  
     User selects: VT001 (correct ID)                   
      
                                                             
      
    SpecificationsTab.jsx                                 
     const fuelTypes = masterData?.fuelTypes            
     <CustomSelect                                      
         options={fuelTypes}   API DATA!                 
         value={formData.fuelType}                        
       />                                                  
     User selects: FT001 (correct ID)                   
      
                                                             
      
    DocumentUploadModal.jsx                               
     <StatusSelect                                      
         options={[                                       
           { value: "", label: "Select..." },             
           ...(masterData.coverageTypes || [])            
         ]}   API DATA!                                  
         value={currentDocument.coverageType}             
       />                                                  
     User selects: CT001 (correct ID)                   
      

                            
                     Valid Database IDs
                            

                    FORM SUBMISSION                          
     
    POST /api/vehicles                                     
    {                                                      
      vehicleType: "VT001",     Valid (exists in DB)    
      fuelType: "FT001",        Valid (exists in DB)    
      usageType: "UT001",       Valid (exists in DB)    
      engineType: "ET001",      Valid (exists in DB)    
      documents: [                                         
        { coverageType: "CT001" }  Valid (exists!)      
      ]                                                    
    }                                                      
     

                            
                     Foreign Keys Valid
                            

                    DATABASE SUCCESS                         
     
     201 Created                                         
    Vehicle saved successfully!                            
                                                           
    Foreign key constraints satisfied:                     
     VT001 exists in vehicle_type_master                
     FT001 exists in fuel_type_master                   
     UT001 exists in usage_type_master                  
     ET001 exists in engine_type_master                 
     CT001 exists in coverage_type_master               
                                                           
     SUCCESS: Vehicle record created!                   
     

`

---

##  **FIX IMPLEMENTATION BREAKDOWN**

### Fix #1: Backend API Enhancement
`javascript
// BEFORE: Missing coverage types
res.json({
  data: {
    vehicleTypes,
    fuelTypes,
    usageTypes,
    engineTypes
    //  No coverageTypes
  }
});

// AFTER: Added coverage types
const coverageTypes = await db('coverage_type_master')
  .where('status', 'ACTIVE')
  .select('coverage_type_id as value', 'coverage_type as label');

res.json({
  data: {
    vehicleTypes,
    fuelTypes,
    usageTypes,
    engineTypes,
    coverageTypes  //  Added
  }
});
`

### Fix #2: Redux State Update
`javascript
// BEFORE: Missing coverage types
masterData: {
  vehicleTypes: [],
  fuelTypes: [],
  usageTypes: [],
  engineTypes: []
  //  No coverageTypes
}

// AFTER: Added coverage types
masterData: {
  vehicleTypes: [],
  fuelTypes: [],
  usageTypes: [],
  engineTypes: [],
  coverageTypes: []  //  Added
}
`

### Fix #3: Component Updates
`javascript
// BEFORE: Hardcoded constants
import { VEHICLE_TYPES } from "../../../utils/vehicleConstants";
const VEHICLE_TYPES = [{ value: "HCV", label: "..." }];  //  Wrong ID
<CustomSelect options={VEHICLE_TYPES} />

// AFTER: API master data
const vehicleTypes = masterData?.vehicleTypes || [
  { value: 'VT001', label: 'HCV - Heavy Commercial Vehicle' }
];  //  Correct ID
<CustomSelect options={vehicleTypes} />
`

### Fix #4: Text Input to Dropdown
`javascript
// BEFORE: Free text input
<input 
  type="text" 
  placeholder="Full/Third Party"  //  User can type anything
  onChange={(e) => setCoverageType(e.target.value)}
/>

// AFTER: Controlled dropdown
<StatusSelect
  options={[
    { value: "", label: "Select Coverage Type" },
    ...(masterData.coverageTypes || [])  //  Only valid IDs
  ]}
  onChange={(value) => setCoverageType(value)}
/>
`

---

##  **COMPONENT INTERACTION MAP**

`

                     USER INTERFACE                           
                                                              
  Vehicle Create Page                                         
    
                                                            
    Tab 1: Basic Information                               
     Vehicle Type Dropdown    masterData.vehicleTypes  
     Usage Type Dropdown      masterData.usageTypes    
                                                            
    Tab 2: Specifications                                  
     Fuel Type Dropdown       masterData.fuelTypes     
     Engine Type Dropdown     masterData.engineTypes   
                                                            
    Tab 4: Documents                                       
     Document Upload Modal                              
        Coverage Type Dropdown  masterData.coverageTypes 
                                                            
    
                                                             
                  ALL COMPONENTS USE                          
                 SAME masterData SOURCE                       
                                                             

                             
                             

                    REDUX STORE                               
  vehicle.masterData (Single Source of Truth)                 
   vehicleTypes: [VT001, VT002, ...]                       
   fuelTypes: [FT001, FT002, ...]                          
   usageTypes: [UT001, UT002, ...]                         
   engineTypes: [ET001, ET002, ...]                        
   coverageTypes: [CT001, CT002, ...]                      

                             
                             

                    API LAYER                                 
  GET /api/vehicles/master-data                               
  Returns: All master data with correct IDs                   

                             
                             

                    DATABASE LAYER                            
  Master Tables (Source of Truth)                             
   vehicle_type_master                                      
   fuel_type_master                                         
   usage_type_master                                        
   engine_type_master                                       
   coverage_type_master                                     

`

---

##  **KEY PRINCIPLES**

### 1. Single Source of Truth
-  Database master tables are the ONLY source
-  API fetches from database
-  Redux stores API response
-  Components read from Redux
-  NO hardcoded values
-  NO free text inputs

### 2. Data Flow Direction
`
Database  API  Redux  Components  User
                                       
    Form Submission 
`

### 3. Validation Layers
`
Layer 1: Frontend Dropdown  Only allows selection from masterData
Layer 2: Frontend Validation  Checks ID exists in masterData
Layer 3: Backend Validation  Checks ID exists in database
Layer 4: Database Constraints  Foreign key constraints enforce validity
`

---

##  **REFERENCE**

### Master Data ID Formats

| Master Table | ID Pattern | Range | Example |
|--------------|-----------|--------|---------|
| vehicle_type_master | VT### | VT001-VT008 | VT001 |
| fuel_type_master | FT### | FT001-FT004 | FT001 |
| usage_type_master | UT### | UT001-UT004 | UT001 |
| engine_type_master | ET### | ET001-ET004 | ET001 |
| coverage_type_master | CT### | CT001-CT008 | CT001 |

### Foreign Key Relationships

`sql
vehicle_basic_information_hdr
   vehicle_type_id   vehicle_type_master.vehicle_type_id
   fuel_type_id      fuel_type_master.fuel_type_id
   usage_type_id     usage_type_master.usage_type_id
   engine_type_id    engine_type_master.engine_type_id

vehicle_documents
   coverage_type_id  coverage_type_master.coverage_type_id
`

---

**Date**: January 10, 2025  
**Purpose**: Visual representation of vehicle foreign key fix  
**Status**:  **COMPLETE - ALL FLOWS FIXED**
