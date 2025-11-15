# TMS Development Guidelines

> **Comprehensive Development Standards for Frontend & Backend Architecture**

This document establishes the mandatory development patterns, architectural decisions, and implementation standards for the TMS (Transportation Management System) project.

---

## 🎨 PART 1 — FRONTEND GUIDELINES

### 1. Folder Structure

```
frontend/
├── public/
├── src/
│   ├── assets/                 # Images, fonts, static files
│   ├── components/
│   │   ├── ui/                 # Design system (Buttons, Cards, Inputs, Pills)
│   │   ├── layout/             # Navbar, Sidebar, Footer, TabNavigation, Header
│   │   ├── forms/              # Reusable form elements
│   │   ├── charts/             # Graphs & analytics components
│   │   ├── transporter/        # Transporter-specific list components
│   │   ├── driver/             # Driver-specific list components
│   │   └── warehouse/          # Warehouse-specific list/details tab components
│   ├── features/               # Feature-based modules (one per domain)
│   │   ├── auth/               # Login, JWT management, role-based access
│   │   ├── dashboard/          # KPI Cards, Graphs, Analytics
│   │   ├── transporter/        # Transporter CRUD operations
│   │   │   ├── components/     # Tab components (Edit mode)
│   │   │   │   ├── GeneralDetailsTab.jsx
│   │   │   │   ├── AddressContactsTab.jsx
│   │   │   │   ├── ServiceableAreaTab.jsx
│   │   │   │   ├── DocumentsTab.jsx
│   │   │   │   ├── GeneralDetailsViewTab.jsx  # View mode
│   │   │   │   ├── AddressContactsViewTab.jsx # View mode
│   │   │   │   └── ... (View tabs for all edit tabs)
│   │   │   ├── pages/
│   │   │   │   ├── CreateTransporterPage.jsx
│   │   │   │   └── TransporterDetailsPage.jsx
│   │   │   └── validation.js   # Zod validation schemas
│   │   ├── driver/             # Driver CRUD operations
│   │   │   ├── components/     # Tab components (Edit & View modes)
│   │   │   │   ├── BasicInfoTab.jsx          # Edit mode
│   │   │   │   ├── BasicInfoViewTab.jsx      # View mode (collapsible)
│   │   │   │   ├── DocumentsTab.jsx
│   │   │   │   ├── DocumentsViewTab.jsx
│   │   │   │   ├── HistoryTab.jsx
│   │   │   │   ├── HistoryViewTab.jsx
│   │   │   │   ├── AccidentViolationTab.jsx
│   │   │   │   └── AccidentViolationViewTab.jsx
│   │   │   ├── pages/
│   │   │   │   ├── DriverCreatePage.jsx
│   │   │   │   └── DriverDetailsPage.jsx
│   │   │   └── validation.js   # Zod validation schemas
│   │   ├── warehouse/          # Warehouse CRUD operations
│   │   │   ├── components/     # Tab components (Edit & View modes)
│   │   │   │   ├── GeneralDetailsTab.jsx
│   │   │   │   ├── FacilitiesTab.jsx
│   │   │   │   ├── AddressTab.jsx
│   │   │   │   ├── DocumentsTab.jsx
│   │   │   │   └── GeofencingTab.jsx
│   │   │   ├── pages/
│   │   │   │   └── WarehouseCreatePage.jsx
│   │   │   └── validation.js   # Zod validation schemas
│   │   ├── indent/             # Indent management
│   │   ├── rfq/                # Request for quotation
│   │   ├── contract/           # Contract management
│   │   ├── tracking/           # Shipment tracking
│   │   └── epod/               # Electronic proof of delivery
│   ├── hooks/                  # Custom hooks (e.g., useFetch, useSocket)
│   ├── pages/                  # Top-level pages (not feature-specific)
│   │   ├── TMSLandingPage.jsx
│   │   ├── TransporterMaintenance.jsx  # List/table view
│   │   ├── DriverMaintenance.jsx       # List/table view
│   │   ├── WarehouseMaintenance.jsx    # List/table view
│   │   └── WarehouseDetails.jsx        # Warehouse details with tabs
│   ├── redux/                  # State management with RTK
│   │   ├── store.js            # Root store configuration
│   │   └── slices/             # Redux slices (one per feature)
│   │       ├── authSlice.js
│   │       ├── uiSlice.js
│   │       ├── transporterSlice.js
│   │       ├── driverSlice.js
│   │       ├── warehouseSlice.js
│   │       ├── dashboardSlice.js
│   │       ├── indentSlice.js
│   │       ├── rfqSlice.js
│   │       └── contractSlice.js
│   ├── routes/                 # App routing configuration
│   │   ├── AppRoutes.jsx       # Main route definitions
│   │   └── ProtectedRoute.jsx  # Role-based route protection
│   ├── utils/                  # Constants, helpers, formatters
│   │   └── api.js              # Axios instance & API calls
│   ├── theme.config.js         # Centralized theme configuration
│   ├── App.jsx
│   ├── index.css               # Global styles & CSS variables
│   └── main.jsx
├── .env                        # Environment configuration
└── package.json
```

**Key Folder Organization Principles:**

1. **`features/[module]`** - Complete feature modules with components, pages, and validation
2. **`components/[module]`** - Shared list/table components used across pages
3. **`pages/`** - Top-level maintenance/list pages that use feature components
4. **Dual Component Pattern** - Every edit tab has a corresponding view tab with `ViewTab` suffix
5. **`validation.js`** - Each feature module has its own Zod schemas

### 1.1 Module Architecture Pattern (Standard for All Features)

Each feature module follows this consistent structure:

```
features/[module]/
├── components/           # Tab components for create/edit/view pages
│   ├── [SectionName]Tab.jsx       # Edit mode component
│   ├── [SectionName]ViewTab.jsx   # View mode component (read-only)
│   └── ... (additional tabs)
├── pages/
│   ├── [Module]CreatePage.jsx     # Create new record page
│   └── [Module]DetailsPage.jsx    # View/edit existing record page
└── validation.js         # Zod validation schemas for the module
```

**Dual Component Pattern (Edit + View):**

- **Edit Components** (e.g., `BasicInfoTab.jsx`) - Used in create and edit modes with input fields
- **View Components** (e.g., `BasicInfoViewTab.jsx`) - Read-only display with collapsible sections
- All view components implement collapsible sections using Framer Motion for smooth animations
- View components use `ChevronUp`/`ChevronDown` icons to indicate expand/collapse state

**Example Implementation:**

```javascript
// Edit Mode Component (BasicInfoTab.jsx)
const BasicInfoTab = ({ formData, onFormDataChange, validationErrors, ... }) => {
  return (
    <div>
      <input value={formData.fullName} onChange={...} />
      <input value={formData.phoneNumber} onChange={...} />
      {/* Editable form fields */}
    </div>
  );
};

// View Mode Component (BasicInfoViewTab.jsx)
const BasicInfoViewTab = ({ driver }) => {
  const [expandedSections, setExpandedSections] = useState({ basic: true, address: true });

  return (
    <CollapsibleSection title="Basic Information" isExpanded={expandedSections.basic}>
      <InfoItem label="Full Name" value={driver.fullName} />
      <InfoItem label="Phone Number" value={driver.phoneNumber} />
      {/* Read-only display fields */}
    </CollapsibleSection>
  );
};
```

### 1.2 Collapsible Sections Implementation

All view tabs MUST implement collapsible sections for better UX:

**Required Components:**

- `useState` for managing expansion state
- `framer-motion` for smooth animations (AnimatePresence, motion.div)
- `ChevronUp` and `ChevronDown` icons from lucide-react

**Animation Pattern:**

```javascript
<AnimatePresence>
  {isExpanded && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Content */}
    </motion.div>
  )}
</AnimatePresence>
```

**Benefits:**

- Cleaner UI - users can focus on relevant sections
- Performance - only visible content is rendered
- Consistency - matches design across all detail pages
- Accessibility - proper button elements with hover states

### 2. Design System Rules

#### Naming Convention

- **Components**: CamelCase (e.g., `TmsButton`, `TmsCard`)
- **Files**: CamelCase for components, kebab-case for utilities
- **Folders**: lowercase

#### Component Library Location

- **Path**: `/src/components/ui`

#### Core Reusable Components

- `TmsButton` - Primary/secondary/outlined variants
- `TmsCard` - Container with consistent styling
- `TmsInput` - Form input with validation states
- `TmsSelect` - Dropdown with search functionality
- `TmsModal` - Overlay dialogs
- `TmsTable` - Data tables with sorting/pagination
- `TmsStatusPill` - Status indicators
- `TmsToast` - Notification system

#### ⚠️ CRITICAL: Theme Configuration System

**The TMS application uses a centralized theme configuration system. ALL components MUST use theme values - NO HARDCODED COLORS ALLOWED.**

##### Theme File Location

- **Configuration File**: `/src/theme.config.js`
- **CSS Variables**: `/src/index.css` (auto-generated CSS variables)
- **Tailwind Integration**: `tailwind.config.js` (imports theme values)

##### Theme Usage Rules

**❌ NEVER DO THIS:**

```javascript
// ❌ WRONG - Hardcoded colors
<div className="bg-white text-gray-800 border-gray-200">
<button style={{ backgroundColor: "#10B981", color: "#FFFFFF" }}>
```

**✅ ALWAYS DO THIS:**

```javascript
// ✅ CORRECT - Use theme utilities
import { getPageTheme, getComponentTheme } from '../theme.config.js';

const theme = getPageTheme('general'); // or 'list', 'tab'
const buttonTheme = getComponentTheme('actionButton');

// Use Tailwind classes with theme colors
<div className="bg-primary-background text-text-primary border-card-border">

// Or use CSS variables
<div style={{
  backgroundColor: 'var(--primary-background)',
  color: 'var(--text-primary)'
}}>

// Or use theme object directly
<button style={{
  backgroundColor: buttonTheme.primary.background,
  color: buttonTheme.primary.text
}}>
```

##### Theme Structure

The theme is organized by:

1. **Page Types**: `general`, `list`, `tab`
2. **Component Types**: `actionButton`, `tabButton`, `statusPill`, `formInput`, etc.

```javascript
// Get page-specific theme
const generalTheme = getPageTheme("general");
const listTheme = getPageTheme("list");
const tabTheme = getPageTheme("tab");

// Get component-specific theme
const actionButtonTheme = getComponentTheme("actionButton");
const statusPillTheme = getComponentTheme("statusPill");
const transportModeTheme = getComponentTheme("transportModeCard");
```

##### Available Theme Tokens

**Colors:**

- `primary.background`, `primary.text`
- `card.background`, `card.border`, `card.shadow`
- `text.primary`, `text.secondary`, `text.disabled`
- `header.background`, `header.text`
- `input.background`, `input.border.default`, `input.border.focus`, `input.border.error`
- `status.pending`, `status.approve`, `status.reject`, `status.success`, `status.warning`, `status.error`
- `button.primary`, `button.secondary`, `button.danger`
- `fields.requested`, `fields.approved`

**Typography:**

- `fontFamily`, `fontSize.*`, `fontWeight.*`, `lineHeight`

**Layout:**

- `card.borderRadius`, `card.padding`, `button.borderRadius`, `input.borderRadius`

##### Tailwind Class Mapping

Theme values are automatically mapped to Tailwind classes:

```javascript
// Background colors
bg-primary-background → #F5F7FA
bg-card-background → #FFFFFF

// Text colors
text-text-primary → #0D1A33
text-text-secondary → #4A5568

// Button colors
bg-button-primary-background → #10B981
bg-button-secondary-border → #E5E7EB

// Status colors
bg-status-success-background → #D1FAE5
text-status-success-text → #10B981
```

##### CSS Variables

All theme values are available as CSS variables:

```css
/* Use in component styles */
.my-component {
  background-color: var(--primary-background);
  color: var(--text-primary);
  border: 1px solid var(--card-border);
  border-radius: var(--card-border-radius);
  padding: var(--card-padding);
}
```

##### Theme Enforcement Checklist

Before committing any component, verify:

- [ ] No hex color codes in JSX/JS files (e.g., `#FFFFFF`, `#10B981`)
- [ ] No RGB/RGBA values (e.g., `rgb(255, 255, 255)`)
- [ ] Uses `getPageTheme()` or `getComponentTheme()` for dynamic values
- [ ] Uses Tailwind theme classes (e.g., `bg-primary-background`)
- [ ] Uses CSS variables (e.g., `var(--primary-background)`)
- [ ] No inline style objects with hardcoded colors

##### Updating the Theme

To modify colors or design tokens:

1. **Edit**: `src/theme.config.js` (single source of truth)
2. **Rebuild**: CSS variables auto-update on save
3. **Test**: All components using theme automatically reflect changes

**NEVER edit colors in:**

- ❌ Individual component files
- ❌ `tailwind.config.js` (imports from theme.config.js)
- ❌ `index.css` variables (auto-generated)

#### Design Tokens & Theme Specifications

**✅ All theme specifications are now centralized in `/src/theme.config.js`**

The application uses three main theme configurations:

1. **General Pages Theme** - Default theme for most pages (forms, details, etc.)
2. **List Pages Theme** - For list/table views with filters and pagination
3. **Tab Pages Theme** - For tabbed interfaces with navigation

**To view or modify theme specifications:**

- See `/src/theme.config.js` for complete theme definitions
- All color palettes, typography, layout values, and UI element specifications are defined there

**Key Theme Features:**

- Centralized color management
- Consistent typography across all pages
- Standardized spacing and layout values
- Component-specific theme tokens
- CSS variable support for runtime access
- Tailwind integration for utility classes

#### Motion & Animations

- Use **Framer Motion** for complex animations
- Standard transitions: `fadeIn`, `slideUp`, `scaleIn`
- Duration: 200ms for micro-interactions, 300ms for larger movements

### 3. State Management (Redux Toolkit)

#### Store Structure

```javascript
store.js; // → Root store configuration
authSlice.js; // → JWT & role management
uiSlice.js; // → Sidebar, toast, theme state
moduleSlice.js; // → CRUD + filters + pagination (per feature)
```

#### API Integration Pattern

```javascript
// Use createAsyncThunk for all API calls
export const fetchIndents = createAsyncThunk(
  "indent/fetchIndents",
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/indent", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
```

#### Axios Interceptors

- **Request**: Automatically attach JWT tokens
- **Response**: Handle token refresh and global error handling

### 4. Routing & Access Control

#### Route Configuration

```javascript
// /routes/appRoutes.js
const routes = [
  {
    path: "/dashboard",
    component: Dashboard,
    roles: ["consignor", "transporter", "driver"],
  },
  {
    path: "/indent",
    component: IndentModule,
    roles: ["consignor"],
  },
];
```

#### Protected Route Implementation

```javascript
<ProtectedRoute roles={["consignor", "transporter"]}>
  <IndentModule />
</ProtectedRoute>
```

#### Login Flow

1. **Authentication** → Fetch user role from API
2. **Authorization** → Load accessible tabs/tiles based on role
3. **State Management** → Store permissions in Redux
4. **UI Rendering** → Conditionally render components

### 5. Real-Time Integration (WebSocket)

#### Custom Hook Pattern

```javascript
// hooks/useSocket.js
const useSocket = (roomId) => {
  useEffect(() => {
    socket.emit("joinRoom", roomId);

    socket.on("statusUpdated", handleStatusUpdate);
    socket.on("newIndent", handleNewIndent);
    socket.on("deliveryComplete", handleDeliveryComplete);

    return () => {
      socket.off("statusUpdated");
      socket.off("newIndent");
      socket.off("deliveryComplete");
    };
  }, [roomId]);
};
```

### 6. Form Handling & Validation

#### Validation Schema Pattern

```javascript
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm({
  resolver: zodResolver(loginSchema),
});
```

#### Error Display Standards

- **Inline errors** below each input field
- **Color**: Red (#DC2626)
- **Icon**: Warning icon for visibility
- **Animation**: Fade in error messages

### 7. Responsive Design Patterns

#### Breakpoint Behavior

- **Tabs**: Collapse into dropdown below `md` breakpoint (768px)
- **Tiles**: Stack vertically (1 per row) on mobile
- **Tables**: Convert to card lists on mobile devices
- **Charts**: Use Recharts `ResponsiveContainer` for automatic resizing

#### Mobile-First Approach

```javascript
// Tailwind responsive classes
className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4";
```

### 8. UX Component Architecture

#### Primary Layout Structure

```
┌─────────────────────────────────────┐
│ Top Bar (Logo + Role + Profile)     │
├─────────────────────────────────────┤
│ Tabs (Indent | RFQ | Contract...)   │
├─────────────────────────────────────┤
│ Tiles Grid (per tab)                │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│ │ Tile 1  │ │ Tile 2  │ │ Tile 3  │ │
│ └─────────┘ └─────────┘ └─────────┘ │
├─────────────────────────────────────┤
│ Table/List View (inside tile)       │
├─────────────────────────────────────┤
│ Modal (Create/Edit)                 │
│ Toasts (success/error)              │
└─────────────────────────────────────┘
```

---

## ⚙️ PART 2 — BACKEND GUIDELINES

### 1. Folder Structure

```
tms-backend/
├── config/               # Database, environment, JWT configuration
│   └── database.js       # Knex database connection
├── controllers/          # Business logic layer
│   ├── authController.js
│   ├── transporterController.js
│   └── driverController.js
├── routes/               # REST endpoints per module
│   ├── auth.js
│   ├── transporter.js
│   └── driver.js
├── middleware/           # Authentication, validation, error handling
│   └── auth.js           # JWT authentication middleware
├── migrations/           # Database schema migrations (140+ files)
├── seeds/                # Test data population scripts
├── utils/                # Helper functions and constants
│   ├── errorMessages.js
│   └── documentValidation.js
├── .env                  # Backend environment variables
├── server.js             # Application entry point
└── package.json
```

### 2. API Design Standards

#### RESTful Endpoint Structure

```
GET    /api/:module           # List resources
POST   /api/:module           # Create resource
GET    /api/:module/:id       # Get specific resource
PUT    /api/:module/:id       # Update resource
DELETE /api/:module/:id       # Delete resource
```

#### Example Endpoints

```
/api/auth/login
/api/auth/refresh
/api/indent
/api/indent/:id
/api/rfq
/api/contract
/api/tracking
```

#### Query Parameters Standards

```javascript
// Pagination
?page=1&limit=10

// Filters
?status=active&dateFrom=2025-01-01&dateTo=2025-01-31

// Sorting
?sort=created_at&order=desc

// Search
?search=keyword&fields=name,description
```

### 3. Authentication & Authorization

#### JWT Token Flow

```javascript
// Login generates JWT
const token = jwt.sign({ userId, role, permissions }, process.env.JWT_SECRET, {
  expiresIn: "24h",
});

// Middleware verifies and attaches user data
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded;
  next();
};
```

#### Role-Based Authorization

```javascript
const authorize = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: "Access denied" });
  }
  next();
};

// Usage
router.get("/admin-only", authenticate, authorize(["admin"]), controller);
```

### 4. Request Validation (Zod)

#### Validation Middleware Pattern

```javascript
import { z } from "zod";

const indentSchema = z.object({
  body: z.object({
    indentId: z.string().min(1),
    origin: z.string().min(1),
    destination: z.string().min(1),
    status: z.enum(["pending", "approved", "rejected"]),
  }),
  query: z.object({
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    res.status(400).json({ errors: error.errors });
  }
};
```

### 4.1. Transporter Management API

#### Base Route: `/api/transporter`

All transporter endpoints require:

- **Authentication**: `authenticateToken` middleware (JWT verification)
- **Authorization**: `checkProductOwnerAccess` middleware (UT001 only)

#### Endpoints

**1. GET `/api/transporter/master-data`**

- **Purpose**: Get dropdown data (document types, address types, etc.)
- **Response**: Master data objects for form dropdowns
- **Authentication**: Required

**2. GET `/api/transporter/states/:country`**

- **Purpose**: Get states/provinces for a country
- **Parameters**:
  - `country` (path) - Country code (e.g., "IN", "US")
- **Response**: Array of state objects with ISO codes and names
- **Authentication**: Required

**3. GET `/api/transporter/cities/:country/:state`**

- **Purpose**: Get cities for a state/province
- **Parameters**:
  - `country` (path) - Country code
  - `state` (path) - State code
- **Response**: Array of city objects
- **Authentication**: Required

**4. GET `/api/transporter`**

- **Purpose**: List transporters with pagination, filtering, and search
- **Query Parameters**:
  - `page` (number) - Page number (default: 1)
  - `limit` (number) - Items per page (default: 10)
  - `search` (string) - Search term for business name
  - `status` (string) - Filter by status
  - `country` (string) - Filter by country
  - `state` (string) - Filter by state
  - `vat` (string) - Filter by VAT/GST number
- **Response**: Paginated list with total count
- **Authentication**: Required

**5. GET `/api/transporter/:id`**

- **Purpose**: Get single transporter details
- **Parameters**:
  - `id` (path) - Transporter ID
- **Response**: Complete transporter object with:
  - ISO codes converted to readable names (countries, states, cities)
  - All addresses, contacts, documents, serviceable areas
- **Authentication**: Required

**6. POST `/api/transporter`**

- **Purpose**: Create new transporter
- **Body**: Complete transporter object with validation
- **Validation**:
  - Business name (required, unique)
  - VAT numbers (unique per country)
  - Phone numbers (10-digit Indian format `/^[6-9]\d{9}$/`)
  - Email addresses (standard email validation)
  - Document numbers (unique)
  - Addresses (at least one required)
- **Response**: Created transporter with auto-generated ID
- **Authentication**: Required

**7. PUT `/api/transporter/:id`**

- **Purpose**: Update existing transporter
- **Parameters**:
  - `id` (path) - Transporter ID
- **Body**: Partial or complete transporter object
- **Validation**: Same as POST, checks uniqueness excluding current record
- **Response**: Updated transporter object
- **Authentication**: Required

#### Validation Patterns

```javascript
// Phone validation (Indian 10-digit)
const validatePhoneNumber = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// Email validation
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Duplicate checking
const checkDuplicateVAT = async (vat, country, excludeId = null) => {
  const query = db("transporter_vat_details").where({
    vat_number: vat,
    country_code: country,
  });
  if (excludeId) query.whereNot("transporter_id", excludeId);
  return await query.first();
};
```

#### Error Response Format

```javascript
// Field-level validation errors
{
  "error": "Validation failed",
  "details": [
    {
      "field": "documents[0].documentNumber",
      "message": "Document number already exists"
    },
    {
      "field": "contacts[0].phoneNumber",
      "message": "Invalid phone number format"
    }
  ]
}

// General errors
{
  "error": "Transporter not found"
}
```

### 4.2. Driver Management API

#### Base Route: `/api/driver`

All driver endpoints require:

- **Authentication**: `authenticateToken` middleware (JWT verification)
- **Authorization**: `checkProductOwnerAccess` middleware (UT001 only)

#### Endpoints

**1. GET `/api/driver/master-data`**

- **Purpose**: Get dropdown data for driver forms
- **Response**: Master data objects including:
  - Gender types
  - Blood group types
  - License types
  - Document types
  - Address types
- **Authentication**: Required
- **Usage**: Populates dropdowns in create/edit forms

**2. GET `/api/driver/states/:countryCode`**

- **Purpose**: Get states/provinces for a country
- **Parameters**:
  - `countryCode` (path) - Country code (e.g., "IN", "US")
- **Response**: Array of state objects with ISO codes and names
- **Authentication**: Required
- **Usage**: Cascading dropdown for address selection

**3. GET `/api/driver/cities/:countryCode/:stateCode`**

- **Purpose**: Get cities for a state/province
- **Parameters**:
  - `countryCode` (path) - Country code (e.g., "IN")
  - `stateCode` (path) - State code (e.g., "AS" for Assam)
- **Response**: Array of city objects
- **Authentication**: Required
- **Usage**: Cascading dropdown for address selection

**4. GET `/api/driver`**

- **Purpose**: List drivers with pagination, filtering, and search
- **Query Parameters**:
  - `page` (number) - Page number (default: 1)
  - `limit` (number) - Items per page (default: 10)
  - `search` (string) - Search term for driver name, ID, or license number
  - `status` (string) - Filter by status (active, inactive)
  - `licenseType` (string) - Filter by license type
  - `transporter` (string) - Filter by transporter mapping
  - `bloodGroup` (string) - Filter by blood group
- **Response**: Paginated list with total count
  ```javascript
  {
    "drivers": [
      {
        "driver_id": "DRV0001",
        "driver_name": "John Doe",
        "license_number": "DL1234567890",
        "phone_number": "9876543210",
        "status": "active",
        // ... other fields
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 10,
      "totalPages": 15
    }
  }
  ```
- **Authentication**: Required

**5. GET `/api/driver/:id`**

- **Purpose**: Get single driver details with all related data
- **Parameters**:
  - `id` (path) - Driver ID (e.g., "DRV0001")
- **Response**: Complete driver object including:
  - Basic information (name, DOB, gender, blood group, etc.)
  - ISO codes converted to readable names (countries, states, cities)
  - All addresses with full location names
  - All documents (license, Aadhaar, PAN, medical certificates, etc.)
  - Historical data
  - Accident and violation records
  - Transporter mappings
  - Vehicle mappings
  - Blacklist mappings
- **Authentication**: Required
- **Example Response**:
  ```javascript
  {
    "driver_id": "DRV0001",
    "driver_name": "John Doe",
    "date_of_birth": "1990-05-15",
    "gender": "Male",
    "blood_group": "O+",
    "phone_number": "9876543210",
    "email": "john.doe@example.com",
    "addresses": [
      {
        "address_id": "ADDR001",
        "address_type": "Permanent",
        "country": "India",  // Converted from ISO
        "state": "Assam",    // Converted from ISO
        "city": "Guwahati",  // Converted from ISO
        // ... other address fields
      }
    ],
    "documents": [...],
    "history": [...],
    "accidents": [...],
    "violations": [...],
    "transporters": [...],
    "vehicles": [...]
  }
  ```

**6. POST `/api/driver`**

- **Purpose**: Create new driver
- **Body**: Complete driver object with validation
  ```javascript
  {
    "driver_name": "John Doe",
    "date_of_birth": "1990-05-15",
    "gender": "Male",
    "blood_group": "O+",
    "phone_number": "9876543210",
    "email": "john.doe@example.com",
    "addresses": [
      {
        "address_type": "Permanent",
        "address_line1": "123 Main St",
        "country_code": "IN",
        "state_code": "AS",
        "city": "Guwahati",
        "pincode": "781001"
      }
    ],
    "documents": [
      {
        "document_type": "Driving License",
        "document_number": "DL1234567890",
        "issue_date": "2020-01-01",
        "expiry_date": "2030-01-01"
      }
    ]
    // ... other sections
  }
  ```
- **Validation**:
  - Driver name (required, 3-100 characters)
  - Date of birth (required, must be 18+ years old)
  - Phone number (required, 10-digit Indian format `/^[6-9]\d{9}$/`, unique)
  - Email (required, valid email format, unique)
  - License number (required, unique)
  - At least one address required
  - Document numbers (unique)
  - Document expiry dates (future dates for licenses/medical certs)
- **Auto-generation**:
  - `driver_id` - Auto-generated (DRV0001, DRV0002, etc.)
  - `address_id` - Auto-generated with collision resistance (100 attempts)
  - `document_id` - Auto-generated with collision resistance (100 attempts)
- **Response**: Created driver with all generated IDs
- **Authentication**: Required

**7. PUT `/api/driver/:id`**

- **Purpose**: Update existing driver
- **Parameters**:
  - `id` (path) - Driver ID (e.g., "DRV0001")
- **Body**: Partial or complete driver object
- **Validation**: Same as POST, checks uniqueness excluding current record
  - Phone/email uniqueness checks exclude current driver
  - License number uniqueness check excludes current driver
  - Document number uniqueness checks within driver's documents
- **Response**: Updated driver object with all related data
- **Authentication**: Required

#### ID Generation Patterns

```javascript
// Driver ID generation (DRV0001, DRV0002, etc.)
const generateDriverId = async () => {
  const lastDriver = await db("driver_master")
    .orderBy("driver_id", "desc")
    .first();

  if (!lastDriver) return "DRV0001";

  const lastNumber = parseInt(lastDriver.driver_id.replace("DRV", ""));
  const newNumber = (lastNumber + 1).toString().padStart(4, "0");
  return `DRV${newNumber}`;
};

// Address ID generation (collision-resistant)
const generateAddressId = async () => {
  let attempts = 0;
  while (attempts < 100) {
    const id = `ADDR${Date.now()}${Math.random().toString(36).substr(2, 5)}`;
    const exists = await db("driver_address").where("address_id", id).first();
    if (!exists) return id;
    attempts++;
  }
  throw new Error("Failed to generate unique address ID");
};

// Document ID generation (collision-resistant)
const generateDocumentId = async () => {
  let attempts = 0;
  while (attempts < 100) {
    const id = `DDOC${Date.now()}${Math.random().toString(36).substr(2, 5)}`;
    const exists = await db("driver_documents")
      .where("document_id", id)
      .first();
    if (!exists) return id;
    attempts++;
  }
  throw new Error("Failed to generate unique document ID");
};
```

#### Validation Functions

```javascript
// Phone validation (Indian 10-digit, starts with 6-9)
const validatePhoneNumber = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// Email validation
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Age validation (must be 18+)
const validateAge = (dob) => {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age >= 18;
};

// Duplicate phone check
const checkDuplicatePhone = async (phone, excludeId = null) => {
  const query = db("driver_master").where("phone_number", phone);
  if (excludeId) query.whereNot("driver_id", excludeId);
  return await query.first();
};

// Duplicate email check
const checkDuplicateEmail = async (email, excludeId = null) => {
  const query = db("driver_master").where("email", email);
  if (excludeId) query.whereNot("driver_id", excludeId);
  return await query.first();
};

// Duplicate license check
const checkDuplicateLicense = async (licenseNumber, excludeId = null) => {
  const query = db("driver_documents")
    .where("document_type", "Driving License")
    .where("document_number", licenseNumber);
  if (excludeId) {
    query.whereNot("driver_id", excludeId);
  }
  return await query.first();
};
```

#### Error Response Format

```javascript
// Field-level validation errors
{
  "error": "Validation failed",
  "details": [
    {
      "field": "phone_number",
      "message": "Phone number already exists"
    },
    {
      "field": "documents[0].document_number",
      "message": "License number already exists"
    },
    {
      "field": "date_of_birth",
      "message": "Driver must be at least 18 years old"
    }
  ]
}

// General errors
{
  "error": "Driver not found"
}

// Success response
{
  "message": "Driver created successfully",
  "driver": { /* driver object */ }
}
```

#### Transaction Support

All create/update operations use database transactions:

```javascript
await db.transaction(async (trx) => {
  // Insert driver_master
  await trx("driver_master").insert(driverData);

  // Insert addresses
  for (const address of addresses) {
    await trx("driver_address").insert(address);
  }

  // Insert documents
  for (const document of documents) {
    await trx("driver_documents").insert(document);
  }

  // Commit transaction
});
```

This ensures data consistency - if any operation fails, all changes are rolled back.

### 5. Database Layer (Knex + MySQL)

#### Warehouse Module Database Tables

The warehouse maintenance module references the following database tables:

**Primary Warehouse Tables:**

1. **warehouse_basic_information** - Core warehouse data

   - Warehouse Unique Id, Warehouse ID, Consignor ID
   - Warehouse Type, Warehouse Name1, Warehouse Name2
   - Language, Vehicle Capacity, Virtual Yard-In settings
   - Radius for Virtual Yard-In, Speed Limit
   - Facility flags: Weigh Bridge, Gatepass System, Fuel Availability
   - Operational areas: Staging Area, Driver Waiting Area
   - Security: Gate-In/Gate-Out Checklist Auth
   - Warehouse Address Id (foreign key)

2. **warehouse_sub_location_header** - Geofencing header records

   - SubLocation Hdr Id, Warehouse_Unique Id, Consignor Id
   - SubLocation ID, Subtype Name, Description

3. **warehouse_sub_location_item** - GPS coordinates for geofencing

   - GeoFence Item Id, SubLocation Hdr Id, Sequence
   - Latitude, Longitude coordinates

4. **warehouse_sublocation_master** - Sub-location configuration

   - SubLocation ID, Warehouse SubLocation description
   - Is Mandatory flag

5. **warehouse_documents** - Document management
   - Document_Unique_Id, Warehouse ID, Document Id
   - Document Type Id, Document Number
   - Valid From, Valid To, Active status

**Configuration Tables:**

6. **consignor_general_config_master** - General warehouse configuration

   - GConfig Id, Consignor ID, Warehouse ID
   - Parameter Name Key, Parameter Value, Description
   - Active status, Valid From/To dates

7. **consignor_general_config_parameter_name** - Configuration parameters

   - Parameter Name Key, Parameter Name Description
   - Probable Values

8. **e_bidding_config** - E-bidding configuration per warehouse
   - e-bidding Config Id, Consignor ID, Warehouse ID
   - Vehicle Type, Max rate, Min rate, Freight Unit
   - e-bidding Tolerance Value

**Approval & Access Control:**

9. **consignor_approval_hierarchy_configuration** - Approval workflows
   - Approval Hierarchy Id, Consignor ID, Transporter ID
   - Approval type, Approval Level, Approval Control
   - Role of, Role, User ID

**Material Management:**

10. **consignor_material_master_information** - Material specifications per warehouse
    - CMaterial Master Id, Material Master Id, Consignor Id
    - Volumetric Weight per Unit, Net Weight per Unit
    - Dimensions: L, B, H
    - Timing: Avg Packaging/Loading/Unloading Time (minutes)
    - Packing Type, Material Description

**Database Relationships:**

- Primary keys use auto-increment or generated IDs
- Foreign key relationships between warehouse → consignor → documents
- Address data linked via warehouse_address_id
- Multi-table transactions for data consistency
- Audit fields: created_at, created_by, updated_at, updated_by

#### Migration Pattern

```javascript
// migrations/001_create_indents.js
exports.up = function (knex) {
  return knex.schema.createTable("indents", (table) => {
    table.increments("id").primary();
    table.string("indent_id").unique().notNullable();
    table.string("origin").notNullable();
    table.string("destination").notNullable();
    table
      .enum("status", ["pending", "approved", "rejected"])
      .defaultTo("pending");
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("indents");
};
```

#### Model Pattern

```javascript
// models/Indent.js
class Indent {
  static tableName = "indents";

  static async findAll(filters = {}) {
    let query = knex(this.tableName);

    if (filters.status) query = query.where("status", filters.status);
    if (filters.search)
      query = query.where("origin", "like", `%${filters.search}%`);

    return query.select("*");
  }

  static async create(data) {
    const [id] = await knex(this.tableName).insert(data);
    return this.findById(id);
  }

  static async findById(id) {
    return knex(this.tableName).where("id", id).first();
  }

  static async update(id, data) {
    await knex(this.tableName).where("id", id).update(data);
    return this.findById(id);
  }

  static async delete(id) {
    return knex(this.tableName).where("id", id).del();
  }
}
```

### 6. WebSocket Integration

#### Socket.io Event Handling

```javascript
// sockets/index.js
const handleConnection = (io) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Room management
    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
    });

    // Business events
    socket.on("indentCreated", (data) => {
      io.to(data.roomId).emit("indentCreated", data);
    });

    socket.on("statusUpdate", (data) => {
      io.to(data.roomId).emit("statusChanged", data);
    });

    socket.on("podUploaded", (data) => {
      io.to(data.roomId).emit("podUploaded", data);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
```

### 7. Error Handling

#### Global Error Handler

```javascript
// middlewares/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation Error",
      details: err.details,
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      error: "Invalid token",
    });
  }

  // Database errors
  if (err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      error: "Duplicate entry",
    });
  }

  // Default server error
  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
};
```

### 8. Logging & Monitoring

#### Winston Logger Configuration

```javascript
// config/logger.js
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});
```

#### HTTP Request Logging

```javascript
// Use Morgan for HTTP request logging
import morgan from "morgan";

app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);
```

### 9. Deployment & Environment

#### Environment Configuration

```javascript
// .env file structure
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=tms_dev
DB_USER=root
DB_PASSWORD=password
JWT_SECRET=your-secret-key
REDIS_URL=redis://localhost:6379
```

#### Production Deployment Pattern

```javascript
// server.js - Serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/dist/index.html"));
  });
}
```

### 10. Future-Proofing Architecture

#### Background Jobs (BullMQ)

```javascript
// services/emailQueue.js
import Queue from "bull";

const emailQueue = new Queue("email processing");

emailQueue.process(async (job) => {
  const { to, subject, body } = job.data;
  // Send email logic
});

// Usage
emailQueue.add("welcome-email", {
  to: "user@example.com",
  subject: "Welcome to TMS",
  body: "Welcome message",
});
```

#### Audit Logging

```javascript
// Create audit_logs table for tracking changes
const auditLog = {
  user_id: req.user.id,
  action: "UPDATE",
  table_name: "indents",
  record_id: indentId,
  old_values: JSON.stringify(oldData),
  new_values: JSON.stringify(newData),
  timestamp: new Date(),
};
```

#### Role-Permission Mapping

```javascript
// Database structure for scalable permissions
roles: {
  id, name, description;
}
permissions: {
  id, name, resource, action;
}
role_permissions: {
  role_id, permission_id;
}
user_roles: {
  user_id, role_id;
}
```

---

## 🔗 Integration Standards

### API Response Format

```javascript
// Success Response
{
  "success": true,
  "data": {...},
  "message": "Operation completed successfully",
  "timestamp": "2025-01-01T00:00:00Z"
}

// Error Response
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message",
  "details": {...},
  "timestamp": "2025-01-01T00:00:00Z"
}

// Paginated Response
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

### Code Quality Standards

#### ESLint Configuration

- Use Prettier for code formatting
- Enforce consistent import ordering
- Require JSDoc comments for functions
- No unused variables or imports

#### Git Workflow

- **Branches**: `feature/module-name`, `bugfix/issue-description`
- **Commits**: Conventional commits (feat:, fix:, docs:, etc.)
- **Pull Requests**: Require code review and tests

#### Testing Requirements

- **Frontend**: Jest + React Testing Library
- **Backend**: Jest + Supertest
- **Coverage**: Minimum 80% code coverage
- **E2E**: Cypress for critical user flows

---

## 📋 Implementation Checklist

### Before Starting Development

- [ ] Review and understand all guidelines
- [ ] Set up development environment
- [ ] Configure ESLint and Prettier
- [ ] Set up database with migrations
- [ ] Implement authentication middleware
- [ ] Create base components in design system

### For Each Feature Development

- [ ] Create Zod validation schemas
- [ ] Implement database models
- [ ] Build API endpoints with proper error handling
- [ ] Create Redux slices for state management
- [ ] Develop UI components following design system
- [ ] Add real-time functionality if needed
- [ ] Write unit and integration tests
- [ ] Update API documentation

### Before Deployment

- [ ] Run full test suite
- [ ] Check code coverage requirements
- [ ] Verify environment configuration
- [ ] Test in production-like environment
- [ ] Update deployment documentation

---

**This document should be referenced for all development decisions and updated as the project evolves.**
