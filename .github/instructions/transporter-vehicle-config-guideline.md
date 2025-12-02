You are an expert full-stack engineer / code generator. Your job is to produce a complete, production-ready implementation of the Transporter Vehicle Configuration feature for the TMS. The output must include:

1. Database migrations (Knex) — templates that must be reviewed and applied manually.
2. Backend (Node.js + Express + Knex) — routes, controllers, services, validators, and migration templates.
3. Config file — `backend/config/master-config.json` with schema metadata.
4. Frontend (React + Tailwind + Radix + shadcn) — pages/components that strictly reuse existing UI components and theme tokens.
5. Tests skeleton (basic integration/unit examples).
6. README and deployment/checklist.

**Do NOT** change unrelated code. Keep output isolated to the folders specified in Deliverables. Ask no clarifying questions — use DB introspection (knex) where needed and fall back to safe, non-destructive defaults described below.

---

## CONTEXT & SAFETY RULES (MUST FOLLOW)

- Language / style:
  - Backend: Plain JavaScript (CommonJS modules).
  - Frontend: React (JSX), Tailwind classes, use existing Radix/shadcn components where appropriate.
  - Migrations: Knex (generate templates). **Do not auto-run** migrations. Provide `up` and `down`.
- Config location: `backend/config/master-config.json`. This is the single source of truth for master metadata.
- Auth: Use existing `authMiddleware` (it populates `req.user` from JWT). Check role via `req.user.roles` and require either `super_admin` or `transporter_admin`.
- RBAC: Both `super_admin` and `transporter_admin` have full CRUD on this screen.
- Soft delete: Use `status` column to mark rows. Values: use string enum `'active'` / `'inactive'`. When “deleting” set `status = 'inactive'`. Do **not** physically delete rows or drop references.
- Audit fields: Each table must include these fields (datetime and actor info):
  - `created_at` (timestamp)
  - `created_on` (timestamp) — same value as created_at
  - `created_by` (int or varchar depending on user id scheme)
  - `updated_at` (timestamp)
  - `updated_on` (timestamp)
  - `updated_by`
  - `status` (string enum `'active' | 'inactive'`)
- Foreign keys: Always use `ON DELETE RESTRICT` at DB level. Never cascade deletes.
- Validation: Parameter min/max rules must follow `parameter_name_master` flags `is_minimum_required` and `is_maximum_required`.
- UI theme: Strictly reuse existing theme tokens and components — reference other modules for exact tokens (do not invent new token values). Use correct font/spacing via existing classes/components.
- Naming: API paths use kebab-case. Files are placed in the folder structure specified in Deliverables.
- Error format: `{ code: string, success: false, message: string, details?: any }`. Success format: `{ code: string, success: true, data: any, message?: string }`.
- All DB writes and schema changes must be done inside transactions. Migration templates must include backup checklist comments.

---

## FEATURE SUMMARY (what to build)

A single unified screen (split layout):

- Left panel: HDR list + HDR inline form (Transporter Vehicle Configured Data hdr)
- Right panel: For selected HDR, ITM grid inline editor (Transporter Alert itm) + parameter value range editor (links to `parameter_name_master`)

Behavior:

- Super admin & transporter admin can add/edit/deactivate HDR and ITM rows.
- Inline editing for HDR and ITM, but save/update is manual per-row (one contextual Save/Update button).
- ITM rows are independent for soft delete (status) — deactivating HDR does NOT automatically delete ITM (but UI should warn if HDR status changes).
- Parameter master (Transporter vehicle configure parameter name) must be created (full CRUD accessible via Global Master Config); it includes flags `is_minimum_required`, `is_maximum_required`.
- Alert Type Master must be created via migration (no seed). Full CRUD is optional for master screen requirement but include migration + config entry. (No seed data unless requested.)
- Vehicle type values are loaded from `vehicle_type_master`.
- Vehicle lookup maps `vehicle_id` to `vehicle_basic_information_hdr` (introspect actual table name if different).

---

## DATABASE TABLES — exact fields to create/use

Create or use the following (names exact as shown; adapt if introspection shows different actual table names, but update `master-config.json` accordingly):

### 1) `transporter_vehicle_config_data_hdr`

- `vehicle_config_hdr_id` (PK, INT AUTOINCREMENT)
- `vehicle_id` (FK → vehicle_basic_information_hdr PK)
- `transporter_id` (FK → transporter_general_info PK)
- `consignor_id` (FK → consignor_general_info PK) — if table differs, introspect
- `vehicle_type_id` (FK → vehicle_type_master.vehicle_type_id)
- `tvconfig_parameter_name_id` (FK → transporter_vehicle_config_parameter_name.tvconfig_parameter_name_id)
- `parameter_value_min` (DECIMAL or VARCHAR depending on parameter)
- `parameter_value_max` (DECIMAL or VARCHAR)
- `valid_from` (DATETIME)
- `valid_to` (DATETIME)
- `is_alert_required` (BOOLEAN) // if false → hide ITM editor in UI
- Audit fields: `created_at`, `created_on`, `created_by`, `updated_at`, `updated_on`, `updated_by`, `status` (active|inactive)

### 2) `transporter_vehicle_config_data_itm`

- `transporter_alert_itm_id` (PK, INT AUTOINCREMENT)
- `vehicle_config_hdr_id` (FK → transporter_vehicle_config_data_hdr.vehicle_config_hdr_id)
- `mobile_number` (VARCHAR)
- `email_id` (VARCHAR)
- `alert_type_id` (FK → alert_type_master.alert_type_id)
- `user_id` (INT) // user who will receive alert
- Audit fields: same as above

### 3) `transporter_vehicle_config_parameter_name` (parameter master)

- `tvconfig_parameter_name_id` (PK, INT AUTOINCREMENT)
- `parameter_name` (VARCHAR)
- `is_minimum_required` (BOOLEAN)
- `is_maximum_required` (BOOLEAN)
- Audit fields: created_at, created_on, created_by, updated_at, updated_on, updated_by, status

### 4) `alert_type_master`

- `alert_type_id` (PK, INT AUTOINCREMENT)
- `alert_type` (VARCHAR)
- Audit fields: created_at, created_on, created_by, updated_at, updated_on, updated_by, status
- IMPORTANT: **Do not seed data**. Create migration only.

### 5) `vehicle_type_master` — **existing**

- `vehicle_type_id` (PK)
- `vehicle_type_description`
- Audit fields...

**Notes:** For `vehicle_basic_information_hdr`, `transporter_general_info`, `consignor_general_info` — introspect DB to use exact names & PK fields. If names differ, use observed names and update `master-config.json`.

---

## API SPEC (kebab-case) — Base: `/api/v1/transporter-vehicle-config`

All endpoints require `authMiddleware`. Only users with `super_admin` or `transporter_admin` role can write (POST/PUT/PATCH). Read operations allowed for same roles (no further restriction per requirement).

### 1. Config

- `GET /api/v1/transporter-vehicle-config/config`
  - Returns `master-config.json` contents and merged DB schema.

### 2. HDR (Transporter Vehicle Config)

- `GET /api/v1/transporter-vehicle-config/hdr`
  - Query: `page`, `limit`, `search`, `include_inactive` (false by default)
  - Returns paginated HDR rows (default filter `status = 'active'`), sorted by `created_at` DESC.
- `POST /api/v1/transporter-vehicle-config/hdr`
  - Body: HDR fields (exclude PK). Validate `parameter_value_min/max` based on parameter master flags.
  - Use transaction. On success return created row.
- `PUT /api/v1/transporter-vehicle-config/hdr/:pk`
  - Body: editable HDR fields only. PK cannot be changed.
- `PATCH /api/v1/transporter-vehicle-config/hdr/:pk/status`
  - Body: `{ status: 'active' | 'inactive' }` — used for soft delete or reactivation.
  - When setting to 'inactive', return reference counts of ITM rows to warn UI (but do not block).
- `GET /api/v1/transporter-vehicle-config/hdr/:pk`
  - Return HDR with ITM rows and resolved names (vehicle type description, parameter name, etc.)

### 3. ITM (Alerts)

- `GET /api/v1/transporter-vehicle-config/hdr/:pk/alerts`
  - Returns all ITM rows for HDR (respect `status`).
- `POST /api/v1/transporter-vehicle-config/hdr/:pk/alerts`
  - Create a new alert row for HDR.
- `PUT /api/v1/transporter-vehicle-config/hdr/:pk/alerts/:itmPk`
  - Update ITM row (editable fields only).
- `PATCH /api/v1/transporter-vehicle-config/hdr/:pk/alerts/:itmPk/status`
  - Soft delete / reactivate ITM row by updating `status`.

### 4. Master helpers

- `GET /api/v1/transporter-vehicle-config/masters/vehicle-types`
  - Return active vehicle types from `vehicle_type_master`.
- `GET /api/v1/transporter-vehicle-config/masters/parameters`
  - Return parameter master rows.
- `GET /api/v1/transporter-vehicle-config/masters/alert-types`
  - Return alert types.

### 5. Migration template generation

- `POST /api/v1/transporter-vehicle-config/migration-template`
  - Accepts JSON fragment describing a missing table, generates Knex migration template file under `backend/migrations/` and returns filepath. **Do not run migration automatically.**

---

## DB & Validation RULES

- Enforce FK constraints and `ON DELETE RESTRICT`.
- `parameter_value_min` and `parameter_value_max` types depend on parameter — choose numeric decimals by default; allow string if parameter flagged as non-numeric (detect via parameter naming or config overrides).
- If `parameter master.is_minimum_required === true` then `parameter_value_min` is required.
- If `is_maximum_required === true` then `parameter_value_max` is required.
- `valid_from` must be <= `valid_to` if both provided.
- No overlapping validity constraint across HDR for the same vehicle + parameter combination is **NOT** enforced (user chose NO), so allow multiple entries.
- All writes are wrapped in transactions; return good error messages on validation failure.

---

## FRONTEND UI RULES

- One unified split-screen page at route `/master/transporter-vehicle-config`:
  - Left panel: HDR list (table) + quick create form at top (inline fields), default sorted by `created_at DESC`. Each HDR row shows vehicle code/name, transporter name, parameter name, valid_from/to, status, actions.
  - Right panel: When HDR selected → show ITM grid (alerts) and a parameter range editor for that HDR's parameter. If `is_alert_required` is false, show a disabled message and hide ITM create controls.
- Inline editing:
  - For each HDR/ITM row, make editable fields inline. Show a single contextual Save/Update button for the row. Manual save only.
  - On Save click: show generic confirmation modal: “You have made changes. Do you want to save these changes?”; if confirmed, call backend endpoint and show success or error toast.
  - Inline field errors shown beside fields; on Save show combined error summary if multiple errors.
- Dependency & lookups:
  - Vehicle select uses `/masters/vehicle-types` to show vehicle types and also fetch vehicle code/name via vehicle lookup API (introspect actual table).
  - Parameter select uses `/masters/parameters`. When parameter changes, update UI validation for min/max required flags.
  - Alert type select uses `/masters/alert-types`.
- Buttons, modals, table, inputs must use existing components (Shadcn/Radix wrappers). Use Tailwind classes only to augment existing components; do not replace global theme tokens.
- Exactly follow font sizes, spacing, colors from other modules — inspect `frontend/src/theme` or other modules to reuse tokens.

---

## FILE / FOLDER LOCATIONS (write only here)

- `backend/config/master-config.json` — metadata for transporter vehicle module.
- `backend/migrations/master_<timestamp>_create_transporter_vehicle_config_hdr.js` (and similar for itm, parameter master, alert_type_master)
- `backend/routes/transporter-vehicle-config.js`
- `backend/controllers/transporterVehicleConfigController.js`
- `backend/services/transporterVehicleConfigService.js`
- `backend/validators/transporterVehicleConfigValidator.js`
- `frontend/src/features/transporterVehicleConfig/`
  - `index.jsx` route + page
  - `HdrList.jsx`
  - `HdrRowEditor.jsx`
  - `ItmGrid.jsx`
  - `ItmRowEditor.jsx`
  - `ParameterEditor.jsx`
- Tests: `backend/tests/transporterVehicleConfig.spec.js` (skeleton)

---

## MASTER-CONFIG.JSON CONTENT (must be generated & populated)

- Provide entries for:
  - `transporter_vehicle_config_data_hdr`
  - `transporter_vehicle_config_data_itm`
  - `transporter_vehicle_config_parameter_name`
  - `alert_type_master`
  - Reference to existing `vehicle_type_master` with schema info (from introspection)

The AI should merge DB introspection results with this JSON — do not hardcode unknown schemas.

---

## MIGRATION TEMPLATES (requirements)

- Create `up` that creates table with specified columns, PK, FK constraints (`ON DELETE RESTRICT`), indexes, and audit fields.
- Create `down` that drops table.
- Include migration header comments: purpose, author, timestamp, and required pre-apply steps (backup, staging test).
- Do not run migrations — deliver as files.

---

## DELIVERABLES (exact artifacts to output)

1. `backend/config/master-config.json` (complete sample).
2. Knex migration templates for all new/changed tables (up/down).
3. `backend/routes/transporter-vehicle-config.js` (Express router).
4. `backend/controllers/transporterVehicleConfigController.js`.
5. `backend/services/transporterVehicleConfigService.js`.
6. `backend/validators/transporterVehicleConfigValidator.js`.
7. `frontend/src/features/transporterVehicleConfig/*` React components (JSX) that reuse existing UI components.
8. Example curl / Postman payloads for all endpoints.
9. Minimal tests skeleton (Jest).
10. README with install, migration apply steps, and safety checklist.
11. Acceptance Criteria checklist.

---

## ACCEPTANCE CRITERIA (tests / manual checks)

- Super admin or transporter admin can:
  - Create HDR row and save parameter min/max validated by parameter master flags.
  - Select HDR row and create ITM alert rows.
  - Update HDR and ITM rows via inline editing + manual Save.
  - Soft-delete (status → 'inactive') HDR/ITM rows; they disappear from dropdowns and searches by default.
  - View parameter master flags and alert types via masters endpoints.
- All dropdown consumers still function and only show `status = 'active'`.
- Migrations provided, reversible, and not auto-applied.
- All endpoints protected by `authMiddleware` and role checks.
- UI strictly uses existing theme tokens and components; no style regressions.

---

## ERRORS / FAILURE RULES

- If DB introspection finds missing referenced tables or ambiguous column names, return a clear structured message and generate a migration template that creates expected tables — but **do not** apply.
- If a potential destructive action is required (rename/drop), stop and require explicit user confirmation.
- All server errors logged with consistent tags; do not expose stack traces to client.

---

## FINAL NOTE — STRICT REQUIREMENTS

- Follow this prompt exactly. The output must be copy-paste ready into the specified file paths.
- Keep changes isolated to the specified modules and files.
- Use existing `authMiddleware` and JWT role extraction logic.
- Use transactions for writes.
- Ensure `status` soft-delete semantics and FK `ON DELETE RESTRICT`.
- Migration templates must include backup recommendations + staging apply instructions.

---

Now produce the requested artifacts (deliverables 1–11 above) as code blocks and file contents. Keep code plain JS (CommonJS), Knex migrations templates, and React components as described. Do not perform any operations on a live DB — generate files only.
