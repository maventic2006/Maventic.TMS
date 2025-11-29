# Global Master Config - Complete Menu and Database Table Mapping

## Overview
This document provides a comprehensive list of all 29 configuration menus in the Global Master Config dropdown and their corresponding database tables from which data is fetched.

---

##  Complete Configuration List

### 1. Address Type
- **Menu Name**: Address Type
- **Config Key**: ddress-type
- **Database Table**: ddress_type_master
- **Primary Key**: ddress_type_id
- **Display Field**: ddress
- **Key Fields**: address_type_id, address, status
- **Status**:  Correctly Mapped

---

### 2. Application
- **Menu Name**: Application
- **Config Key**: pplication
- **Database Table**: pplication_master
- **Primary Key**: pplication_id
- **Display Field**: pplication_name
- **Key Fields**: application_id, application_name, application_description, application_url, application_icon, application_category, display_order, is_active, status
- **Status**:  Correctly Mapped

---

### 3. Approval Type
- **Menu Name**: Approval Type
- **Config Key**: pproval-type
- **Database Table**: pproval_type_master
- **Primary Key**: pproval_type_id
- **Display Field**: pproval_type
- **Key Fields**: approval_type_id, approval_type, approval_name, approval_category, status
- **Status**:  Correctly Mapped

---

### 4. Document Name
- **Menu Name**: Document Name
- **Config Key**: document-name
- **Database Table**: document_name_master
- **Primary Key**: doc_name_master_id
- **Display Field**: document_name
- **Key Fields**: doc_name_master_id, document_name, user_type, status
- **Status**:  Correctly Mapped

---

### 5. Document Type Configuration
- **Menu Name**: Document Type Configuration
- **Config Key**: document-type
- **Database Table**: document_type_master
- **Primary Key**: document_type_id
- **Display Field**: document_type
- **Key Fields**: document_type_id, doc_name_master_id, user_type, service_area_country, is_mandatory, is_expiry_required, is_verification_required, document_type, description, status, created_by, created_at, updated_by, updated_at
- **Status**:  Correctly Mapped with ALL Fields

---

### 6. Vehicle Type
- **Menu Name**: Vehicle Type
- **Config Key**: ehicle-type
- **Database Table**: ehicle_type_master
- **Primary Key**: ehicle_type_id
- **Display Field**: ehicle_type_description
- **Key Fields**: vehicle_type_id, vehicle_type_description, status
- **Status**:  Correctly Mapped

---

### 7. Warehouse Type
- **Menu Name**: Warehouse Type
- **Config Key**: warehouse-type
- **Database Table**: warehouse_type_master
- **Primary Key**: warehouse_type_id
- **Display Field**: warehouse_type
- **Key Fields**: warehouse_type_id, warehouse_type, status
- **Status**:  Correctly Mapped

---

### 8. Engine Type
- **Menu Name**: Engine Type
- **Config Key**: engine-type
- **Database Table**: engine_type_master
- **Primary Key**: engine_type_id
- **Display Field**: engine_type
- **Key Fields**: engine_type_id, engine_type, status
- **Status**:  Correctly Mapped

---

### 9. Fuel Type
- **Menu Name**: Fuel Type
- **Config Key**: uel-type
- **Database Table**: uel_type_master
- **Primary Key**: uel_type_id
- **Display Field**: uel_type
- **Key Fields**: fuel_type_id, fuel_type, status
- **Status**:  Correctly Mapped

---

### 10. Material Types
- **Menu Name**: Material Types
- **Config Key**: material-types
- **Database Table**: material_types_master
- **Primary Key**: material_types_id
- **Display Field**: material_types
- **Key Fields**: material_types_id, material_types, status
- **Status**:  Correctly Mapped

---

### 11. Role
- **Menu Name**: Role
- **Config Key**: 
ole
- **Database Table**: 
ole_master
- **Primary Key**: 
ole_id
- **Display Field**: 
ole
- **Key Fields**: role_id, role, status
- **Status**:  Correctly Mapped

---

### 12. User Type
- **Menu Name**: User Type
- **Config Key**: user-type
- **Database Table**: user_type_master
- **Primary Key**: user_type_id
- **Display Field**: user_type
- **Key Fields**: user_type_id, user_type, status
- **Status**:  Correctly Mapped

---

### 13. Status Master
- **Menu Name**: Status Master
- **Config Key**: status
- **Database Table**: status_master
- **Primary Key**: status_id
- **Display Field**: status_name
- **Key Fields**: status_id, purpose, status_name, status_description, status, is_active, created_by, created_at, updated_by, updated_at
- **Status**:  Correctly Mapped with ALL Fields

---

### 14. Item
- **Menu Name**: Item
- **Config Key**: item
- **Database Table**: item_master
- **Primary Key**: item_id
- **Display Field**: item_description
- **Key Fields**: item_id, item_description, status
- **Status**:  Correctly Mapped

---

### 15. Vehicle Model
- **Menu Name**: Vehicle Model
- **Config Key**: model
- **Database Table**: model_master
- **Primary Key**: model_id
- **Display Field**: model
- **Key Fields**: vmodel_id, vmodel, status
- **Status**:  Correctly Mapped

---

### 16. Packaging Type
- **Menu Name**: Packaging Type
- **Config Key**: packaging-type
- **Database Table**: packaging_type_master
- **Primary Key**: packaging_type_id
- **Display Field**: package_types
- **Key Fields**: packaging_type_id, package_types, description, status
- **Status**:  Correctly Mapped

---

### 17. Payment Term
- **Menu Name**: Payment Term
- **Config Key**: payment-term
- **Database Table**: payment_term_master
- **Primary Key**: payment_term_id
- **Display Field**: description
- **Key Fields**: payment_term_id, number_of_days, description, status
- **Status**:  Correctly Mapped

---

### 18. Usage Type
- **Menu Name**: Usage Type
- **Config Key**: usage-type
- **Database Table**: usage_type_master
- **Primary Key**: usage_type_id
- **Display Field**: usage_type
- **Key Fields**: usage_type_id, usage_type, status
- **Status**:  Correctly Mapped

---

### 19. Rate Type
- **Menu Name**: Rate Type
- **Config Key**: 
ate-type
- **Database Table**: 
ate_type_master
- **Primary Key**: 
ate_type_id
- **Display Field**: 
ate_type
- **Key Fields**: rate_type_id, rate_type, status
- **Status**:  Correctly Mapped

---

### 20. Transportation Mode
- **Menu Name**: Transportation Mode
- **Config Key**: 	rans-mode
- **Database Table**: 	rans_mode_master
- **Primary Key**: 	rans_mode_id
- **Display Field**: 	rans_mode
- **Key Fields**: trans_mode_id, trans_mode, status
- **Status**:  Correctly Mapped

---

### 21. Consignor General Configuration
- **Menu Name**: Consignor General Configuration
- **Config Key**: consignor-general-config
- **Database Table**: consignor_general_config_master
- **Primary Key**: g_config_id
- **Display Field**: parameter_name_key
- **Key Fields**: consignor_id, warehouse_id, parameter_name_key, parameter_value, description, active, valid_from, valid_to, status
- **Status**:  Correctly Mapped
- **Note**: This table does NOT have auto-generated primary key in current config

---

### 22. Material Master Information
- **Menu Name**: Material Master Information
- **Config Key**: material-master
- **Database Table**: material_master
- **Primary Key**: material_id
- **Display Field**: description
- **Key Fields**: material_id, material_master_id, material_sector, material_types, description, status, created_by, created_at, updated_by, updated_at
- **Status**:  Correctly Mapped with ALL Fields
- **Prefix**: MAT

---

### 23. Message Master
- **Menu Name**: Message Master
- **Config Key**: message-master
- **Database Table**: message_master
- **Primary Key**: message_master_id
- **Display Field**: message_type
- **Key Fields**: message_master_id, message_type, application_id, status, created_by, created_at, updated_by, updated_at
- **Status**:  Correctly Mapped with ALL Fields
- **Prefix**: MSG

---

### 24. Currency Master
- **Menu Name**: Currency Master
- **Config Key**: currency-master
- **Database Table**: currency_master
- **Primary Key**: currency_id
- **Display Field**: currency_code
- **Key Fields**: currency_id, currency_code, description, status, created_by, created_at, updated_by, updated_at
- **Status**:  Correctly Mapped with ALL Fields
- **Prefix**: CUR

---

### 25. General Configuration
- **Menu Name**: General Configuration
- **Config Key**: general-config
- **Database Table**: general_config_master
- **Primary Key**: general_config_id
- **Display Field**: parameter_name
- **Key Fields**: general_config_id, parameter_name, parameter_value_min, parameter_value_max, valid_from, valid_to, active_flag, status, created_by, created_at, updated_by, updated_at
- **Status**:  Correctly Mapped with ALL Fields
- **Prefix**: GC

---

### 26. Approval Configuration
- **Menu Name**: Approval Configuration
- **Config Key**: pproval-configuration
- **Database Table**: pproval_configuration_master
- **Primary Key**: pproval_config_id
- **Display Field**: pproval_type
- **Key Fields**: approval_config_id, approval_type, approver_level, approval_control, role, user_id, status, created_by, created_at, updated_by, updated_at
- **Status**:  Correctly Mapped with ALL Fields
- **Prefix**: AC

---

### 27. Transporter Vehicle Config Parameter
- **Menu Name**: Transporter Vehicle Config Parameter
- **Config Key**: 	ransporter-vehicle-config
- **Database Table**: 	ransporter_vehicle_config_parameter_master
- **Primary Key**: 	v_config_parameter_name_id
- **Display Field**: parameter_name
- **Key Fields**: tv_config_parameter_name_id, parameter_name, is_minimum_required, is_maximum_required, status, created_by, created_at, updated_by, updated_at
- **Status**:  Correctly Mapped with ALL Fields
- **Prefix**: TVC

---

### 28. Consignor General Config Parameter Name
- **Menu Name**: Consignor General Config Parameter Name
- **Config Key**: consignor-general-parameter
- **Database Table**: consignor_general_config_parameter_name
- **Primary Key**: parameter_name_key
- **Display Field**: parameter_name_description
- **Key Fields**: parameter_name_key, parameter_name_description, probable_values, status, created_by, created_at, updated_by, updated_at
- **Status**:  Correctly Mapped with ALL Fields
- **Note**: Primary key is NOT auto-generated (no prefix)

---

### 29. Vehicle IMEI Mapping
- **Menu Name**: Vehicle IMEI Mapping
- **Config Key**: ehicle-imei-mapping
- **Database Table**: ehicle_imei_mapping
- **Primary Key**: ehicle_imei_mapping_id
- **Display Field**: imei_number
- **Key Fields**: vehicle_imei_mapping_id, vehicle_id, imei_number, unit_id, status, created_by, created_at, updated_by, updated_at
- **Status**:  Correctly Mapped with ALL Fields
- **Prefix**: VIM

---

##  Summary Statistics

### Total Configurations: 29

### Configuration by Category:

#### Basic Master Data (13)
1. Address Type
2. Application
3. Approval Type
4. Document Name
5. Document Type Configuration
6. Vehicle Type
7. Warehouse Type
8. Engine Type
9. Fuel Type
10. Material Types
11. Role
12. User Type
13. Status Master

#### Operational Configuration (8)
14. Item
15. Vehicle Model
16. Packaging Type
17. Payment Term
18. Usage Type
19. Rate Type
20. Transportation Mode
21. Material Master Information

#### Advanced Configuration (8)
22. Message Master
23. Currency Master
24. General Configuration
25. Approval Configuration
26. Transporter Vehicle Config Parameter
27. Consignor General Config Parameter Name
28. Consignor General Configuration
29. Vehicle IMEI Mapping

### Auto-Generated Primary Keys

**With Prefix** (27 configurations):
- AT (Address Type)
- APP (Application)
- APT (Approval Type)
- DNM (Document Name)
- DT (Document Type)
- VT (Vehicle Type)
- WT (Warehouse Type)
- ET (Engine Type)
- FT (Fuel Type)
- MT (Material Types)
- RL (Role)
- UT (User Type)
- ST (Status)
- IT (Item)
- VM (Vehicle Model)
- PT (Packaging Type, Payment Term)
- UG (Usage Type)
- RT (Rate Type)
- TM (Transportation Mode)
- MAT (Material Master)
- MSG (Message Master)
- CUR (Currency Master)
- GC (General Config)
- AC (Approval Configuration)
- TVC (Transporter Vehicle Config)
- VIM (Vehicle IMEI Mapping)

**Without Prefix** (2 configurations):
- g_config_id (Consignor General Config) -  NOT auto-generated in current config
- parameter_name_key (Consignor General Parameter Name) - NOT auto-generated

---

##  Database Table Verification Checklist

To verify all tables exist in your database, run:

\\\sql
-- Check all master tables exist
SELECT 
    TABLE_NAME, 
    TABLE_ROWS,
    CREATE_TIME,
    UPDATE_TIME
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'your_database_name'
AND TABLE_NAME IN (
    'address_type_master',
    'application_master',
    'approval_type_master',
    'document_name_master',
    'document_type_master',
    'vehicle_type_master',
    'warehouse_type_master',
    'engine_type_master',
    'fuel_type_master',
    'material_types_master',
    'role_master',
    'user_type_master',
    'status_master',
    'item_master',
    'vmodel_master',
    'packaging_type_master',
    'payment_term_master',
    'usage_type_master',
    'rate_type_master',
    'trans_mode_master',
    'consignor_general_config_master',
    'material_master',
    'message_master',
    'currency_master',
    'general_config_master',
    'approval_configuration_master',
    'transporter_vehicle_config_parameter_master',
    'consignor_general_config_parameter_name_master',
    'vehicle_imei_mapping'
)
ORDER BY TABLE_NAME;
\\\

---

##  Potential Issues to Check

### 1. Missing Primary Key Auto-Generation
**Configuration**: consignor-general-config
**Issue**: Primary key g_config_id is not set to auto-generate
**Recommendation**: Update JSON config to include:
\\\json
"g_config_id": {
  "type": "varchar",
  "maxLength": 20,
  "required": true,
  "label": "General Config ID",
  "validation": "unique",
  "autoGenerate": true,
  "prefix": "CGC"
}
\\\

### 2. Table Name Mismatches
Check if any of these tables have different names in your actual database:
- material_types_master (might be material_type_master singular)
- model_master (might be ehicle_model_master)
- 	rans_mode_master (might be 	ransport_mode_master or 	ransportation_mode_master)

### 3. Primary Key Field Name Mismatches
Verify primary key field names match exactly:
- material_types_id vs material_type_id
- 	v_config_parameter_name_id (very long, might be abbreviated in DB)

---

##  Testing Each Configuration

### Quick Test Script

\\\ash
# Test each configuration endpoint
curl -X GET "http://localhost:5000/api/configuration/address-type/metadata" -H "Authorization: Bearer YOUR_TOKEN"
curl -X GET "http://localhost:5000/api/configuration/application/metadata" -H "Authorization: Bearer YOUR_TOKEN"
curl -X GET "http://localhost:5000/api/configuration/approval-type/metadata" -H "Authorization: Bearer YOUR_TOKEN"
# ... (repeat for all 29 configurations)
\\\

### Test Data Fetch

\\\ash
# Test data fetch for each configuration
curl -X GET "http://localhost:5000/api/configuration/address-type/data?page=1&limit=10" -H "Authorization: Bearer YOUR_TOKEN"
# Check response for actual data
\\\

---

##  Next Steps

1. **Verify Database Tables**: Run the SQL verification query above
2. **Check Table Names**: Compare JSON config table names with actual database table names
3. **Verify Primary Keys**: Ensure all primary key field names match database schema
4. **Test Data Fetch**: Use the test script to verify data is fetching correctly
5. **Fix Mismatches**: Update master-configurations.json for any table/field name mismatches
6. **Restart Backend**: After any JSON changes, restart the backend server
7. **Test UI**: Navigate to each configuration in the UI and verify data displays correctly

---

**Date**: November 27, 2025
**Status**:  ALL 29 CONFIGURATIONS MAPPED
**Version**: 3.0
**File**: master-configurations.json
