#  Warehouse Module - Quick Reference Card

> **Quick implementation checklist and code snippets**

---

##  Quick Start

### 1. Backend Setup (15 minutes)

\\\ash
# Navigate to backend
cd tms-backend

# Create controller
# File: controllers/warehouseController.js
# Copy from implementation guide sections 2.1-2.5

# Create routes
# File: routes/warehouseRoutes.js
# Copy from implementation guide section 2.3

# Create validation
# File: validation/warehouseValidation.js
# Copy from implementation guide section 2.1

# Register routes in server.js
# Add: app.use('/api/warehouse', warehouseRoutes);
\\\

### 2. Frontend Setup (20 minutes)

\\\ash
# Navigate to frontend
cd frontend

# Create Redux slice
# File: src/redux/slices/warehouseSlice.js
# Copy from implementation guide section 5.1

# Create list page
# File: src/pages/WarehouseMaintenance.jsx
# Copy from implementation guide section 5.3

# Create components folder
mkdir src/components/warehouse

# Copy all components from guide:
# - TopActionBar.jsx
# - WarehouseFilterPanel.jsx
# - WarehouseListTable.jsx
# - PaginationBar.jsx
# - StatusPill.jsx
\\\

### 3. Register Routes (5 minutes)

\\\javascript
// src/routes/AppRoutes.jsx
import WarehouseMaintenance from '../pages/WarehouseMaintenance';

<Route
  path=\"/warehouse\"
  element={
    <ProtectedRoute roles={['CONSIGNOR', 'ADMIN']}>
      <WarehouseMaintenance />
    </ProtectedRoute>
  }
/>
\\\

### 4. Update Redux Store (2 minutes)

\\\javascript
// src/redux/store.js
import warehouseReducer from './slices/warehouseSlice';

export const store = configureStore({
  reducer: {
    // ... existing reducers
    warehouse: warehouseReducer,
  },
});
\\\

---

##  Theme Usage Pattern

\\\javascript
import { getPageTheme } from '../theme.config';

const theme = getPageTheme('list');

// Use in styles
<div style={{
  backgroundColor: theme.colors.card.background,
  border: \1px solid \\,
  color: theme.colors.text.primary,
}} />
\\\

---

##  Key Files Checklist

### Backend
- [ ] \controllers/warehouseController.js\ (500+ lines)
- [ ] \outes/warehouseRoutes.js\ (30 lines)
- [ ] \alidation/warehouseValidation.js\ (100 lines)
- [ ] \middleware/roleCheck.js\ (30 lines)
- [ ] \server.js\ (add 1 line for routes)

### Frontend
- [ ] \edux/slices/warehouseSlice.js\ (200+ lines)
- [ ] \pages/WarehouseMaintenance.jsx\ (250+ lines)
- [ ] \components/warehouse/TopActionBar.jsx\ (150 lines)
- [ ] \components/warehouse/WarehouseFilterPanel.jsx\ (200 lines)
- [ ] \components/warehouse/WarehouseListTable.jsx\ (250 lines)
- [ ] \components/warehouse/PaginationBar.jsx\ (150 lines)
- [ ] \components/warehouse/StatusPill.jsx\ (50 lines)
- [ ] \outes/AppRoutes.jsx\ (add routes)
- [ ] \edux/store.js\ (add warehouse reducer)

---

##  Testing Commands

\\\ash
# Backend - Test warehouse list
curl -X GET \"http://localhost:5000/api/warehouse/list?page=1&limit=25\" \\
  -H \"Authorization: Bearer YOUR_JWT_TOKEN\"

# Backend - Test create warehouse
curl -X POST \"http://localhost:5000/api/warehouse\" \\
  -H \"Authorization: Bearer YOUR_JWT_TOKEN\" \\
  -H \"Content-Type: application/json\" \\
  -d '{\"consignorId\": \"C001\", \"warehouseName1\": \"Test Warehouse\"}'

# Frontend - Run dev server
npm run dev

# Frontend - Navigate to warehouse list
http://localhost:5173/warehouse
\\\

---

##  Database Tables

\\\sql
-- Primary table
warehouse_basic_information (17 fields + 7 audit fields)

-- Related tables
warehouse_documents
warehouse_sub_location_header
warehouse_sub_location_item
warehouse_type_master
\\\

---

##  Filter Fields

| Field | Type | Backend Param |
|-------|------|---------------|
| Warehouse ID | Text Input | \warehouseId\ |
| Warehouse Name | Text Input | \warehouseName\ |
| WeighBridge | Checkbox | \weighBridge\ |
| Virtual Yard In | Checkbox | \irtualYardIn\ |
| Geo Fencing | Checkbox | \geoFencing\ |
| Status | Dropdown | \status\ |

---

##  Required Roles

- **CONSIGNOR** - Full access to warehouse CRUD
- **ADMIN** - Full access to warehouse CRUD

---

##  Component Dependencies

\\\json
{
  \"dependencies\": {
    \"react\": \"^19.1.1\",
    \"react-redux\": \"^9.2.0\",
    \"@reduxjs/toolkit\": \"^2.9.0\",
    \"react-router-dom\": \"^7.9.4\",
    \"framer-motion\": \"^12.23.24\",
    \"lucide-react\": \"^0.545.0\",
    \"axios\": \"^1.12.2\",
    \"country-state-city\": \"^3.2.1\"
  }
}
\\\

---

##  Common Pitfalls

1.  **Hardcoded Colors**: Always use \	heme.colors\
2.  **Missing Role Check**: Add \checkRole(['CONSIGNOR', 'ADMIN'])\
3.  **No Pagination**: Always paginate with 25 items/page
4.  **Fuzzy Search on Backend**: Implement on frontend only
5.  **Applied vs Input Filters**: Maintain separate state

---

##  Success Indicators

- [ ] Warehouse list loads with 25 items per page
- [ ] Filters work correctly (applied on button click)
- [ ] Fuzzy search filters instantly on client side
- [ ] Pagination shows correct page numbers
- [ ] Theme colors applied consistently
- [ ] Only Consignor/Admin can access
- [ ] Toast notifications on actions
- [ ] Responsive on mobile/tablet
- [ ] No console errors
- [ ] Fast page load (<2 seconds)

---

**Time Estimate**: 1-2 days for experienced developer

