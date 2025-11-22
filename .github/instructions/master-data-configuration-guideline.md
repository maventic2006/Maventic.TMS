# TMS MASTER DATA CONFIGURATION — AI EXECUTION GUIDELINE (FULL VERSION)

This document defines the _complete, strict, and non-negotiable_ rules the AI must follow when generating or modifying master data configuration features inside the TMS application.

---

## 1. Scope & Purpose

This guideline applies to **all master tables** in the Transport Management System (TMS).  
The AI must follow this guideline **before performing any task** related to:

- Master table creation
- Master table configuration screens
- CRUD operations
- Backend APIs
- UI updates
- Database schema detection
- Config JSON generation

The AI must produce stable, non-breaking code compatible with the existing TMS system.

---

## 2. Master Table Identification Rules

A table is considered a **master table** if:

### 2.1 Naming Convention Rules

- Table ends with `_master` (primary rule)
- OR table is listed inside the metadata registry table
- OR table is manually provided by the user

### 2.2 Automatic Master Table Detection

AI must:

- Scan DB schema
- Detect all tables ending with `_master`
- Read metadata registry table
- Combine both sources
- De-duplicate

Result = the authoritative list of master tables.

---

## 3. Configuration JSON Requirements

After detecting master tables, AI must generate a **single configuration JSON** stored **in the backend**.  
This JSON becomes the **source of truth** for rendering UI and generating backend code.

### 3.1 JSON Must Contain:

For each master table:

- Table name
- Display name (auto-generated)
- List of columns
- Editable columns
- Non-editable columns
- Required fields
- Primary key column
- Default values
- Soft delete rules
- UI rendering instructions

### 3.2 JSON Must Be Strictly Followed

Backend and frontend must use this JSON to:

- Auto-generate fields
- Enforce non-editable fields
- Render inline editing UI
- Create dynamic forms
- Validate incoming data

The AI must **never** hardcode field names.

---

## 4. Table Schema Detection Rules

AI must read schema dynamically:

- Determine primary key column
- Detect auto-increment fields
- Detect nullable vs non-nullable
- Detect FK relationships
- Detect existing columns like:
  - `created_at`
  - `created_on`
  - `updated_at`
  - `updated_on`
  - `status`
  - `table_name_master_id`

AI must not alter existing column names.

If `is_active` is missing → **add it**.

---

## 5. Inline Editing UI Rules

The UI must use **inline table-row editing** with the following constraints:

### 5.1 Primary Key Rules

- Primary key **must NOT be editable**

### 5.2 Auto-Increment Behavior

- Auto-increment must continue naturally for new rows
- User must not manually enter primary key values

### 5.3 Row-Level Actions

Each table row must have:

- **Save** button (for newly added rows)
- **Update** button (for existing rows)

### 5.4 UI Styling Rules

The UI must:

- Follow **existing TMS styling rules**
- Follow **existing TMS layout**
- Use **existing UI components**
- Follow **existing TMS visual language**
- Never introduce breaking UI changes

---

## 6. Foreign Key + Soft Delete Protection

### 6.1 Foreign Key Protection

The backend must:

- Maintain FK integrity
- Block hard delete permanently
- Prevent deleting referenced master values

### 6.2 Soft Delete Only — Mandatory Rule

Deleting a master row must:

- Set `is_active = false`
- Never remove the row
- Never cascade delete children
- Never corrupt historical data

### 6.3 Dropdown Behavior

Soft-deleted items:

- Must disappear from dropdowns
- Must remain available for historical records

---

## 7. Audit Logging

### Audit logging is **disabled**

AI must:

- Not generate audit tables
- Not generate audit trail middleware
- Not add audit fields
- Not implement logging logic

---

## 8. Display Name Auto-Generation Rules

AI must automatically convert table names to human-readable titles using:

1. Replace `_` with space
2. Capitalize each word
3. If table name contains `_master`, append “Master” meaningfully

### Examples:

- `document_type_master` → **Document Type Master**
- `driver_category` → **Driver Category**
- `warehouse_zone_master` → **Warehouse Zone Master**

---

## 9. Access Control Rules

### 9.1 Current State

Only:

- **Super Admin**
- **Product Owner**

have full CRUD access.

### 9.2 Future Support

Module admins will be added later (NOT now).

### 9.3 Enforcement Rules

Backend must enforce RBAC.  
Frontend must hide UI controls if user lacks permissions.

---

## 10. Backend Enforcement Rules

Backend must validate and enforce:

- Editable vs non-editable fields
- Soft delete logic
- FK protection
- Role-based access control
- Schema consistency
- Data integrity

Frontend must **never bypass** backend validation.

---

## 11. Backend API Structure (Required Endpoints)

Backend must provide the following endpoints for each master table:

### 11.1 GET (Read)

Returns:

- All active rows by default
- Optional flag to return inactive rows

### 11.2 POST (Insert)

Rules:

- Primary key must not be supplied
- Auto-increment must handle ID
- Soft delete fields default to active

### 11.3 PUT (Update)

Rules:

- Update only editable fields
- Ignore non-editable fields even if sent

### 11.4 DELETE (Soft Delete)

Rules:

- Set `is_active = false`
- Do not remove row
- Do not cascade delete
- Block if FK references exist

### 11.5 Universal Rules

- Maintain backward compatibility
- Avoid breaking existing UIs
- Ensure consistent error handling

---

## 12. AI Task Execution Order (Must Follow in Exact Sequence)

AI must follow these steps **every time**:

### Step 1 — Database Scan

- Detect all master tables
- Combine naming-based detection + metadata-based detection

### Step 2 — Build Configuration JSON

- Fetch column metadata
- Categorize editable vs restricted fields
- Add missing `is_active`
- Store everything in config JSON (backend only)

### Step 3 — Create Missing Master Tables

AI must:

- Use user context
- Follow naming patterns
- Follow soft delete rules
- Preserve system stability
- Avoid breaking existing TMS functionality

### Step 4 — Backend Update

- Create new endpoints
- Implement RBAC
- Add soft delete protection
- Add validation rules

### Step 5 — Frontend Update

- Render inline editing UI
- Use config JSON for dynamic field rendering
- Respect existing UI theme and layout
- Hide controls for unauthorized users

### Step 6 — Validation & Stability Checks

AI must ensure:

- No UI regressions
- No DB conflicts
- No broken FK constraints
- No backward compatibility issues

---

## 13. Standard User Messages

AI must use consistent, generic messages:

- “Record created successfully.”
- “Record updated successfully.”
- “Record deleted successfully.”
- “Unable to process the request.”
- “An unexpected error occurred.”
- “Please contact the administrator.”

These messages apply to backend responses and frontend alerts.

---

## 14. Stability & Backward Compatibility Rules

AI must ensure:

- No renaming existing columns
- No deleting columns
- No UI behavior changes
- No DB structural changes except:
  - Adding `is_active`
  - Creating missing master tables

AI must:

- Protect FK constraints
- Prevent data loss
- Maintain full TMS stability

---

## 15. AI Behavioral Expectations

AI must:

- Read and apply this guideline **before executing any task**
- Use configuration JSON as the **source of truth**
- Maintain backward compatibility
- Generate stable, predictable code
- Avoid repeating requirements
- Produce outputs fully aligned with this guideline
- Not introduce unnecessary assumptions

---
