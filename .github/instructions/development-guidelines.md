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
│   ├── assets/
│   ├── components/
│   │   ├── ui/                 # Design system (Buttons, Cards, Inputs, Pills)
│   │   ├── layout/             # Navbar, Tabs, Footer, etc.
│   │   ├── forms/              # Reusable form elements
│   │   └── charts/             # Graphs & analytics components
│   ├── features/
│   │   ├── auth/               # Login, role-based routing
│   │   ├── dashboard/          # KPI Cards, Graphs, Tiles
│   │   ├── indent/
│   │   ├── rfq/
│   │   ├── contract/
│   │   ├── tracking/
│   │   └── epod/
│   ├── hooks/                  # Custom hooks (e.g., useFetch, useSocket)
│   ├── redux/                  # Store, slices, and middleware
│   ├── utils/                  # Constants, helpers, formatters
│   ├── routes/                 # App route configuration
│   ├── App.jsx
│   └── main.jsx
└── package.json
```

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
backend/
├── src/
│   ├── config/           # Database, environment, JWT configuration
│   ├── db/               # Knex instance, migrations, seeds
│   ├── models/           # Data access layer via Knex
│   ├── routes/           # REST endpoints per module
│   ├── controllers/      # Business logic layer
│   ├── services/         # External integrations & complex business logic
│   ├── middlewares/      # Authentication, validation, error handling
│   ├── validations/      # Zod schemas for request validation
│   ├── sockets/          # Socket.io event handlers
│   ├── utils/            # Helper functions and constants
│   └── server.js         # Application entry point
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

### 5. Database Layer (Knex + MySQL)

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
