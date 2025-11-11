#  Vehicle Database ERD - Visual Relationship Summary

**Date**: November 6, 2025  
**Purpose**: Quick Visual Reference for Vehicle Table Relationships

---

##  ENTITY RELATIONSHIP DIAGRAM (Text Format)

`

                    MASTER REFERENCE TABLES                           
                                                                      
                   
   vehicle_type_master        usage_type_master                
                   
   PK: vehicle_type_id        PK: usage_type_id                
       vehicle_type               usage_type                   
                   
                                                                    
            (Referenced by)              (Referenced by)            
                                                                    

                                         
                                         
─
                 CENTRAL HUB - PARENT TABLE                            
                                                                       
        
    vehicle_basic_information_hdr (HDR)                            
        
    PK: vehicle_id_code_hdr (VEH0001)                              
               
    UNIQUE: vin_chassis_no                                         
    UNIQUE: gps_tracker_imei_number                                
               
    FK: vehicle_type_id  vehicle_type_master                      
    FK: usage_type_id  usage_type_master                          
    FK: engine_type_id  engine_type_master                        
    FK: fuel_type_id  fuel_type_master                            
               
     maker_brand_description (Make)                               
     maker_model (Model)                                          
     engine_number                                                
     manufacturing_month_year                                     
     gps_tracker_active_flag                                      
     unloading_weight, gross_vehicle_weight_kg                    
     transmission_type, suspension_type                           
        
                                                                      
              (Parent to ALL child tables)                           
                                                                      

              
              [1:1]
                                                                       
                      
                 vehicle_basic_information_itm                     
                      
                 PK: vehicle_item_unique_id                        
                 UK: vehicle_id_code_itm                           
                 FK: vehicle_id_code_hdr  HDR                     
                      
                  insurance_provider                              
                  policy_number                                   
                  coverage_type                                   
                  policy_expiry_date                              
                      
                            Insurance Details (1:1)                   
                                                                       
              [1:N]
                                                                       
                      
                 vehicle_special_permit                            
                      
                 PK: vehicle_permit_unique_id                      
                 UK: vehicle_permit_id (PRM0001)                   
                 UK: permit_number                                 
                 FK: vehicle_id_code_hdr  HDR                     
                      
                  permit_category (National/State)                
                  permit_code                                     
                  permit_issue_date                               
                  permit_expiry_date                              
                  issuing_authority                               
                      
                      Special Permits (One vehicle  Many permits)     
                                                                       
              [1:N]
                                                                       
                      
                 vehicle_ownership_details                         
                      
                 PK: vehicle_ownership_unique_id                   
                 UK: vehicle_ownership_id (OWN0001)                
                 UK: registration_number  CRITICAL               
                 FK: vehicle_id_code  HDR                         
                      
                  ownership_name                                  
                  registration_date                               
                  registration_upto                               
                  purchase_date, sale_amount                      
                  state_code, rto_code                            
                  valid_from, valid_to                            
                      
                  Ownership History (One vehicle  Many owners)       
                   Registration Number stored HERE, not in HDR!     
                                                                       
              [1:N]
                                                                       
                      
                 vehicle_maintenance_service_history               
                      
                 PK: vehicle_maintenance_unique_id                 
                 UK: vehicle_maintenance_id (MNT0001)              
                 FK: vehicle_id_code  HDR                         
                      
                  service_date (REQUIRED)                         
                  upcoming_service_date (REQUIRED)                
                  type_of_service                                 
                  service_expense                                 
                  service_remark (REQUIRED)                       
                      
                  Service Records (One vehicle  Many services)       
                                                                       
              [1:N]
                                                                       
                      
                 service_frequency_master                          
                      
                 PK: (vehicle_id, sequence_number)                 
                 FK: vehicle_id  HDR (implicit)                   
                      
                  time_period (e.g., "6 months")                  
                  km_drove (e.g., 10000)                          
                      
                  Service Schedule (One vehicle  Many schedules)     
                                                                       
              [1:N]
                             
                             
                               
                                vehicle_documents                           
                             
                                 PK: document_unique_id                      
                                 UK: document_id (DOC0001)                   
                                 FK: vehicle_id_code  HDR (implicit)        
                                 FK: document_type_id  document_type_master 
                                 FK: coverage_type_id  coverage_type_master 
                                
                                  reference_number                          
                                  permit_category, permit_code              
                                  document_provider                         
                                  premium_amount                            
                                  valid_from (REQUIRED)                     
                                  valid_to (REQUIRED)                       
                                  remarks (REQUIRED)                        
                                  vehicle_maintenance_id (optional)         
                                
                                  Documents (One vehicle  Many documents)
`

---

##  KEY RELATIONSHIP PATTERNS

### Pattern 1: Direct Foreign Key (Explicit)
`
vehicle_basic_information_itm.vehicle_id_code_hdr
                     (FK)
vehicle_basic_information_hdr.vehicle_id_code_hdr
`
**Enforcement**: Database-level foreign key constraint

### Pattern 2: Implicit Foreign Key (By Convention)
`
service_frequency_master.vehicle_id
                     (implicit reference)
vehicle_basic_information_hdr.vehicle_id_code_hdr
`
**Enforcement**: Application-level (backend controller)

### Pattern 3: Column Name Variation
`
vehicle_ownership_details.vehicle_id_code
                     (FK, different column name)
vehicle_basic_information_hdr.vehicle_id_code_hdr
`
**Note**: Child uses ehicle_id_code, Parent uses ehicle_id_code_hdr

---

##  CARDINALITY CHEAT SHEET

| Relationship | Description | Example |
|--------------|-------------|---------|
| **1:1** | One parent  One child | Vehicle HDR  Insurance Item |
| **1:N** | One parent  Many children | Vehicle HDR  Permits (multiple permits) |
| **1:N** | One parent  Many children | Vehicle HDR  Ownership (ownership history) |
| **1:N** | One parent  Many children | Vehicle HDR  Maintenance (service history) |
| **1:N** | One parent  Many children | Vehicle HDR  Service Frequency (multiple schedules) |
| **1:N** | One parent  Many children | Vehicle HDR  Documents (multiple documents) |
| **N:1** | Many children  One parent | Vehicles  Vehicle Type Master |
| **N:1** | Many children  One parent | Vehicles  Usage Type Master |

---

##  QUICK REFERENCE: Field Locations

### Where is Registration Number stored?
 NOT in ehicle_basic_information_hdr  
 IN ehicle_ownership_details.registration_number (UNIQUE)

### Where is Insurance Policy Number stored?
 NOT in ehicle_basic_information_hdr  
 IN ehicle_basic_information_itm.policy_number

### Where is Permit Number stored?
 NOT in ehicle_basic_information_hdr  
 IN ehicle_special_permit.permit_number (UNIQUE)

### Where is Service History stored?
 NOT in ehicle_basic_information_hdr  
 IN ehicle_maintenance_service_history (Multiple records)

### Where are Vehicle Documents stored?
 NOT in ehicle_basic_information_hdr  
 IN ehicle_documents (Multiple records)

---

##  INSERT ORDER (Transaction Flow)

`
1. vehicle_basic_information_hdr (FIRST - REQUIRED)
              
2. vehicle_ownership_details (SECOND - Registration number)
              
3. vehicle_maintenance_service_history (OPTIONAL)
              
4. service_frequency_master (OPTIONAL)
              
5. vehicle_documents (OPTIONAL)
              
6. vehicle_special_permit (OPTIONAL)
              
7. vehicle_basic_information_itm (OPTIONAL - Insurance)
`

** RULE**: Always insert HDR first, then child records

---

##  UNIQUE CONSTRAINT SUMMARY

| Table | Unique Field | Purpose |
|-------|-------------|---------|
| HDR | ehicle_id_code_hdr | Primary vehicle identifier |
| HDR | in_chassis_no | Prevent duplicate vehicles |
| HDR | gps_tracker_imei_number | Prevent duplicate GPS devices |
| Ownership | egistration_number | Prevent duplicate registrations |
| Permit | permit_number | Prevent duplicate permits |
| ITM | ehicle_id_code_itm | Insurance item identifier |
| Ownership | ehicle_ownership_id | Ownership record identifier |
| Maintenance | ehicle_maintenance_id | Maintenance record identifier |
| Permit | ehicle_permit_id | Permit record identifier |

---

##  RELATED DOCUMENTS

- **Full Analysis**: VEHICLE_DATABASE_RELATIONSHIPS.md
- **Backend API**: 	ms-backend/controllers/vehicleController.js
- **Integration Guide**: VEHICLE_INTEGRATION_SUMMARY.md
- **Field Mapping**: VEHICLE_FIELD_MAPPING.md

---

**Document Version**: 1.0  
**Last Updated**: November 6, 2025  
**Type**: Visual Reference Guide
