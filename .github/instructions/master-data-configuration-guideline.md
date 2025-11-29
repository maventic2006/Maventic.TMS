# TMS MASTER DATA CONFIGURATION — AI EXECUTION GUIDELINE  
**(FINAL OPTIMIZED VERSION — MARKDOWN FORMAT)**

This document defines the **complete, strict, and non-negotiable rules** the AI must follow for generating, modifying, and maintaining **global master configuration screens** and backend logic inside the Transport Management System (TMS).

---

# 1. Scope & Purpose

This guideline applies to **every master data table** in the TMS.

The AI must follow this guideline **before performing any task** related to:

- Master table creation
- Master table configuration
- CRUD operations
- Backend API generation
- Frontend UI generation
- Database schema detection
- Configuration JSON generation

The objective is to enable:

- A **single global master configuration screen** in React
- Fully dynamic UI without hard-coded fields
- Backend-driven field definitions and validations

---

# 2. Master Table Identification Rules

A table is a **master table** if:

## 2.1 Naming Convention
- Table ends with `_master` (primary rule)

## 2.2 Metadata-Based
- Table appears in the metadata registry table

## 2.3 Manual Declaration
- User explicitly marks it as a master table

---

# 3. Automatic Master Table Detection

AI must:

1. Scan the database schema  
2. Detect all `_master` tables  
3. Read metadata registry  
4. Merge results  
5. Remove duplicates  

Final output = **authoritative list of master tables**

---

# 4. Master Configuration JSON (Source of Truth)

AI must generate **one configuration JSON per master table**, stored in the backend.

This JSON controls:

- Dynamic UI rendering  
- Field definitions  
- Validations  
- Inline editing  
- Sorting + filtering  
- Backend enforcement  

### ❗ No hard-coded field names allowed.

---

# 5. Required Configuration JSON Structure

Each master table config must include:

---

## 5.1 Basic Metadata

```json
{
  "tableName": "",
  "displayName": "",
  "primaryKey": "",
  "autoIncrement": true,
  "isMasterTable": true
}
5.2 Field Metadata
Each field must include:

json
Copy code
"fields": [
  {
    "name": "",
    "displayName": "",
    "type": "string | number | boolean | date | enum | fk_dropdown",
    "inputType": "text | number | textarea | checkbox | select | date",
    "editable": true,
    "required": false,
    "nullable": true,
    "maxLength": 255,
    "minLength": 0,
    "minValue": null,
    "maxValue": null,
    "regex": "",
    "fkTable": "",
    "fkKey": "",
    "fkDisplayColumn": "",
    "sortable": true,
    "filterable": true,
    "filterType": "text | dropdown | date | number",
    "defaultValue": "",
    "fieldOrder": 1
  }
]
5.3 UI Configuration
json
Copy code
"uiConfig": {
  "showSearchbar": true,
  "showAddButton": true,
  "inlineEditing": true,
  "pagination": true,
  "pageSize": 20
}
5.4 Soft Delete Rules
json
Copy code
"softDelete": {
  "enabled": true,
  "fieldName": "is_active",
  "activeValue": true,
  "inactiveValue": false
}
If is_active is missing → AI must add it.

5.5 Sorting Rules
json
Copy code
"defaultSort": {
  "column": "",
  "order": "asc"
}
5.6 Optional Derived Fields
json
Copy code
"derivedFields": [
  { "name": "", "expression": "" }
]
5.7 Config Version
json
Copy code
"configVersion": "1.0"
6. Table Schema Detection Rules
AI must detect:

Primary key

Auto-increment

Nullable vs non-nullable

Default values

Foreign keys

is_active existence

Existing timestamp fields

AI must never rename or delete existing columns.

7. Inline Editing UI Rules (React)
Single common screen for all master tables

Inline row editing (not modal-based)

Use existing TMS styles and components

Only state/UI changes based on config JSON

7.1 Primary Key Rules
Primary key never editable

User cannot enter PK during creation

Auto-increment handled by backend/DB

7.2 Row Actions
Save (for new rows)

Update (for existing rows)

Delete (soft delete)

8. Foreign Key & Soft Delete Protection
8.1 FK Protection
Backend must block deletion if referenced via FK.

8.2 Soft Delete Only
Delete = set is_active = false
Never hard delete.

8.3 Dropdown Behavior
Soft-deleted items must:

Not appear in dropdowns

Still appear in historical data

9. Audit Logging
Audit logging is fully disabled.

AI must NOT generate:

Audit tables

Audit logs

Audit trail middleware

10. Display Name Generation
Convert table name to display name using:

Replace _ with space

Capitalize each word

Append or maintain “Master” meaningfully

Examples:

driver_category → Driver Category

document_type_master → Document Type Master

11. Access Control Rules
Full CRUD allowed only for:

Super Admin

Product Owner

Future module admins = not yet implemented

Frontend must hide UI controls when unauthorized.
Backend must enforce RBAC checks.

12. Backend Enforcement Rules
Backend must enforce:

Editable vs non-editable rules

Required field validation

Data type validation

Regex/min/max constraints

Soft delete behavior

FK protection

RBAC authorization

Frontend must never bypass backend validation.

13. Backend API Requirements
For each master table:

13.1 GET
Returns active rows

Optional: ?includeInactive=true

13.2 POST (Insert)
PK must not be provided

Auto-increment handled by DB

New entries default to is_active = true

13.3 PUT (Update)
Only editable fields updated

Non-editable fields ignored even if sent

13.4 DELETE (Soft Delete)
is_active = false

Block deletion if FK references exist

13.5 Universal Rules
Consistent error messages

No breaking changes

Backward compatible

14. Required Backend Config Endpoint
Each master table must have:

GET /config/master/:tableName
Returns the configuration JSON required for generating the UI.

15. Stability & Backward Compatibility Rules
AI must NEVER:

Rename columns

Delete columns

Change datatypes

Change UI layout

Modify existing API behavior

Allowed DB changes:

Add is_active if missing

Create missing master tables

16. AI Execution Order (Strict Sequence)
AI must follow this order exactly:

Step 1 — Database Scan
Detect master tables.

Step 2 — Build Configuration JSON
Generate full JSON: field types, validations, UI rules, sorting, filters, FK metadata.

Step 3 — Create Missing Master Tables
Follow naming rules and soft delete requirements.

Step 4 — Backend Updates
Generate CRUD + config endpoints.

Step 5 — Frontend Updates
Render dynamic UI based on JSON.

Step 6 — Validation & Stability Checks
Ensure:

No UI regressions

No DB conflicts

No broken FK references

No backward compatibility issues

17. Standard User Messages
Backend and frontend must use these messages:

Record created successfully.

Record updated successfully.

Record deleted successfully.

Unable to process the request.

An unexpected error occurred.

Please contact the administrator.
