# TMS APPROVAL SYSTEM — MASTER IMPLEMENTATION GUIDELINE

**Scope:** Applies to all modules where user entities are created (Transporter Admin, Consignor Admin, Driver User, Vehicle User, Warehouse User, and any future user-based modules).

---

# 1. Core Principle

Every user created in the TMS must pass through a configurable, multi-level approval workflow.  
Approval behavior must follow the database configuration and must **not** break:

- existing UI layouts
- API structures
- Redux slices
- permission logic
- existing user creation flows

The approval system must integrate seamlessly without altering current functionality unless explicitly required by this guideline.

---

# 2. Approval Rules

## 2.1 Multi-Level Approvals

- The approval engine must support **1–4 levels**.
- Levels must be read dynamically from **Approval Configuration → Approver Level**.
- No hardcoded approver chains.

## 2.2 Cross-Approval Logic

- If **Product Owner 1** creates a user → **Product Owner 2** must approve.
- If **Product Owner 2** creates a user → **Product Owner 1** must approve.
- The creator can **never** approve their own record.

## 2.3 Visibility Rules

- All pending records are visible to _both_ product owners.
- Only the non-creator approver sees the action buttons (Approve/Reject).
- Approver sees the action buttons only when:
  - they match the approver level
  - they match the approver role
  - the record is pending

---

# 3. Status Lifecycle

| Status               | Meaning                                           |
| -------------------- | ------------------------------------------------- |
| Pending for Approval | User created; waiting on first approver level     |
| Approve              | Approved at current level; not yet final          |
| Sent Back            | Returned or rejected by the approver              |
| Active               | Fully approved; user becomes active in the system |

**Workflow Example:**  
Pending → Approve(L1) → Approve(L2) → Active  
or  
Pending → Sent Back (workflow stops)

---

# 4. Modules Covered

Approval system applies to:

- Transporter Admin
- Consignor Admin
- Driver User
- Vehicle User
- Warehouse User
- Any future TMS user-based modules

No module-specific approval logic may be hardcoded.

---

# 5. Database Write Rules

## 5.1 On User Creation (Before Approval)

When a Product Owner creates a new user:

### User Master

- Insert record with:
  - `Status = Pending for Approval`
  - `Is_Active = 0`
  - Approval cycle initialized

### Approval Flow Trans

Create a new entry:

- `S_status = Pending for Approval`
- `Approver_Level = 1`
- `Pending_with_role`, `Pending_with_id` set from Approval Configuration
- Store creator details
- Store approval type (module)

### User Role HDR, User Application Access, User Master Log

- Must **not** activate any roles yet.
- If created prematurely, they must be marked inactive.

---

## 5.2 On Approval Action

When an approver approves:

### Update Approval Flow Trans

- `S_status = Approve` (or `Active` if final level)
- Set:
  - `Actioned_by_id`
  - `Actioned_by_name`
  - `Approved_on`
  - `Remarks` (optional)

### Multi-Level Logic

- If not final level:
  - Move to next approver level
  - Update `Pending_with_*`
- If final level:
  - Move user to **Active**

### On Final Approval Level

Update:

#### User Master

- `Status = Active`
- `Is_Active = 1`

#### Create final entries into:

- User Role HDR
- User Application Access
- User Master Log

All writes must be **atomic transactions**.

---

## 5.3 On Sent Back / Reject

### Approval Flow Trans

- `S_status = Sent Back`
- Include remarks

### User Master

- `Status = Sent Back`

### Workflow stops

No further progression unless creator edits & re-submits.

---

# 6. Approval Configuration Rules

AI must **always** read approval behavior dynamically from the **Approval Configuration** table.

Required fields include:

- Approval Type (Transporter, Consignor, Driver, etc.)
- Approver Level (1–4)
- Role of Approver
- User ID of Approver
- Approval Control (future scope)

No hardcoded approver logic may be used.

---

# 7. Frontend Implementation Rules

## 7.1 Do Not Break Existing UI

All of the following must remain intact:

- spacing
- typography
- table structure
- layout
- responsive design
- Redux slice structures
- existing pages

## 7.2 Required UI Components for Approval Pages

- Approve button
- Reject button
- Remarks input
- Approval history table (from Approval Flow Trans)

## 7.3 Button Visibility Logic

Buttons appear only when:

- record is `Pending for Approval`
- user is the correct approver (level + role)
- user is not the creator

---

# 8. Backend Implementation Rules

## 8.1 Required API Endpoints

- Create User (existing – integrate approval initialization)
- Approve User
- Reject User
- Fetch Pending Items
- Fetch Approval Configuration
- Fetch Approval History

## 8.2 Validation Rules

- Creator cannot approve their own creation
- Approver must match:
  - approver level
  - approver role
  - approver ID (if configured)
- Cannot skip levels
- Cannot activate users before final approval
- All multi-table writes must use DB transactions

---

# 9. Database Tables & Mandatory Usage

## 9.1 User Master

Maintain full user data with correct approval status fields.

## 9.2 User Master Log

Must contain a final snapshot after the last approval.

## 9.3 User Role HDR

Record must be created only after final approval.

## 9.4 User Application Access

Activated only upon final approval.

## 9.5 Approval Configuration

Must drive ALL approval logic.

## 9.6 Approval Flow Trans

Every workflow step must store:

- `S_status`
- `Approver_Level`
- `Pending_with_role`
- `Pending_with_id`
- `Actioned_by_*`
- `Approved_on`
- `Remarks`

---

# 10. Full Implementation Output Requirements

## 10.1 Backend Deliverables

- Controller logic
- Service logic
- API endpoints
- DB operations (transaction-safe)
- Stored procedures (if needed)
- Validation & error handling

## 10.2 Frontend Deliverables

- React/Next.js UI logic
- Approval button visibility control
- Redux state flows
- Approval history UI
- Pending list pages

## 10.3 Database Deliverables

- SQL insert/update logic
- Constraints
- Triggers (only if necessary)

## 10.4 Tests

- Unit tests
- Integration tests
- Workflow tests for:
  - Create → Approve → Active
  - Create → Sent Back
  - Multi-level approvals

---

# 11. Strict Safety Constraints

AI must **not**:

- Modify unrelated code
- Change UI appearance or break layouts
- Alter existing API response structures
- Modify database schema unexpectedly
- Replace working logic
- Add new tables unless explicitly requested
- Hardcode role IDs or user IDs

---

# 12. Final Rule

**This document is the single authoritative source of truth for implementing or modifying the approval system in the TMS application.**  
The AI must follow it fully, accurately, and without deviation.
