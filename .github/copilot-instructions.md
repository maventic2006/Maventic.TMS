# GitHub Copilot Instructions for TMS-Dev-2

## Project Overview

TMS-Dev-2 is an AI-agent-driven development project in its initial phase. Currently serves as a foundation for autonomous problem-solving workflows with advanced AI collaboration capabilities.

## Architecture Summary

### Current Project Structure

```
.github/
├── chatmodes/                    # AI agent behavior configurations
│   └── beastMode_lates.chatmode.md  # Autonomous agent workflow definition
├── instructions/                 # Agent memory and behavior storage
│   ├── memory.instruction.md     # User preferences and system behaviors
│   └── development-guidelines.md # Frontend/Backend development standards
└── copilot-instructions.md       # Project architecture documentation (this file)

docs/                             # All implementation documentation
├── DRIVER_CREATE_PAGE_COMPLETION.md
├── DRIVER_DETAILS_COLLAPSIBLE_UPDATE.md
├── TRANSPORTER_FIX.md
├── VAT_GST_FILTER_FIX.md
├── TRANSPORTER_LIST_NAVIGATION_FIX.md
├── FUZZY_SEARCH_FIX.md
└── TRANSPORTER_LIST_TAN_NA_UPDATE.md

frontend/                         # React + Vite frontend application
├── src/
│   ├── components/               # Reusable UI components
│   │   ├── ui/                   # Base UI components
│   │   ├── layout/               # Layout components
│   │   ├── forms/                # Form components
│   │   ├── charts/               # Chart components
│   │   ├── transporter/          # Transporter-specific list components
│   │   └── driver/               # Driver-specific list components
│   ├── features/                 # Feature-based modules
│   │   ├── auth/                 # Authentication module
│   │   ├── transporter/          # Transporter CRUD module
│   │   │   ├── components/       # 4 Edit + 4 View tabs
│   │   │   ├── pages/            # Create & Details pages
│   │   │   └── validation.js
│   │   ├── driver/               # Driver CRUD module
│   │   │   ├── components/       # 8 Edit + 8 View tabs
│   │   │   ├── pages/            # Create & Details pages
│   │   │   └── validation.js
│   │   ├── dashboard/
│   │   ├── indent/
│   │   ├── rfq/
│   │   ├── contract/
│   │   ├── tracking/
│   │   └── epod/
│   ├── pages/                    # Top-level maintenance/list pages
│   │   ├── TransporterMaintenance.jsx
│   │   └── DriverMaintenance.jsx
│   ├── redux/                    # State management with RTK
│   │   ├── slices/               # Feature slices
│   │   └── store.js
│   ├── routes/                   # App routing configuration
│   └── utils/                    # API client and utilities
├── .env                          # Environment configuration
└── package.json

tms-backend/                      # Node.js + Express backend API
├── controllers/                  # Business logic layer
│   ├── authController.js
│   ├── transporterController.js
│   └── driverController.js
├── routes/                       # REST API endpoints
│   ├── auth.js
│   ├── transporter.js
│   └── driver.js
├── middleware/                   # Authentication & error handling
│   └── auth.js
├── migrations/                   # Database schema migrations (140+ files)
├── seeds/                        # Test data population
├── utils/                        # Helper functions
├── config/                       # Database and environment config
├── .env                          # Backend environment variables
└── server.js                     # Application entry point
```

### Core Architectural Patterns

- **Configuration-Driven AI Agents**: Uses chatmode files to define agent behaviors and workflows
- **Memory-Persistent AI Interactions**: Leverages instruction files for maintaining context across sessions
- **Research-Integrated Development**: Architecture supports extensive web research before implementation
- **Autonomous Workflow Management**: Built for complete problem resolution without manual intervention
- **Dual Component Pattern**: All feature modules use Edit + View component pairs for create/view modes
- **Collapsible Sections**: All view tabs implement collapsible sections for better UX

## Current Existing Functionalities

### AI Agent Configuration System

- **Beast Mode Chatmode**: Comprehensive autonomous agent behavior definition in `beastMode_lates.chatmode.md`
  - 10-step problem-solving workflow
  - Web research integration patterns
  - Todo list management system
  - Incremental development approach
  - Root cause debugging methodology

### Memory Management System

- **Persistent Instructions**: User preferences and system behaviors stored in `memory.instruction.md`
- **Cross-Session Context**: Maintains user workflow preferences and technology choices
- **Behavioral Consistency**: Ensures consistent AI agent responses across different sessions
- **Development Guidelines**: Comprehensive frontend/backend standards in `development-guidelines.md`
- **Database Schema Documentation**: Complete schema in `database-schema.json` with 130+ tables

### Frontend Application (React 19 + Vite 7)

#### Core Technologies

- **React 19.1.1** with hooks and modern features
- **Vite 7.1.7** for fast development and optimized builds
- **TailwindCSS 4.1.14** for styling with custom design system
- **Redux Toolkit 2.9.0** for state management
- **React Router DOM 7.9.4** for routing
- **Axios 1.12.2** for API communication
- **Framer Motion 12.23.24** for animations

#### Key Dependencies

- `country-state-city` (3.2.1) - Geographic data for country/state/city dropdowns
- `react-hook-form` (7.65.0) + `zod` (4.1.12) - Form validation
- `@radix-ui` components - Accessible UI primitives (checkbox, select, switch)
- `lucide-react` (0.545.0) - Icon library

#### Feature Modules

- **Authentication** (`features/auth/`) - Login, JWT management, role-based access
- **Transporter Management** (`features/transporter/`) - Complete CRUD with validation
  - Create Transporter Page with multi-step form (General, Address, Serviceable Areas, Documents)
  - Details Page with view/edit modes and tab-based interface
  - List/Maintenance page with filters, search, and pagination
  - Validation error handling with inline errors and toast notifications
  - **Components**: 4 Edit tabs + 4 View tabs (General, Address, Serviceable Areas, Documents)
  - All view tabs have collapsible sections for better UX
- **Driver Management** (`features/driver/`) - Complete CRUD with validation
  - Create Driver Page with multi-step form (8 tabs)
  - Details Page with view/edit modes and tab-based interface
  - List/Maintenance page with filters, search, and pagination
  - Validation error handling with inline errors and toast notifications
  - **Components**: 8 Edit tabs + 8 View tabs
    - BasicInfoTab / BasicInfoViewTab
    - DocumentsTab / DocumentsViewTab
    - HistoryTab / HistoryViewTab
    - AccidentViolationTab / AccidentViolationViewTab
    - TransporterMappingTab / TransporterMappingViewTab
    - VehicleMappingTab / VehicleMappingViewTab
    - BlacklistMappingTab / BlacklistMappingViewTab
    - AdditionalTab / AdditionalViewTab
  - All view tabs have collapsible sections with framer-motion animations
- **Dashboard** (`features/dashboard/`) - KPI cards and analytics
- **Indent** (`features/indent/`) - Indent management module
- **RFQ** (`features/rfq/`) - Request for quotation module
- **Contract** (`features/contract/`) - Contract management
- **Tracking** (`features/tracking/`) - Shipment tracking
- **EPOD** (`features/epod/`) - Electronic proof of delivery

#### Component Library (`components/`)

- **UI Components** (`ui/`) - Button, Card, Input, Select, Modal, Table, StatusPill, Toast, Checkbox, Switch
- **Themed Components** (`ui/themed/`) - ThemedSwitch, ThemedSelect, ThemedCheckbox with design system integration
- **Layout Components** (`layout/`) - Navbar, Sidebar, Footer, TabNavigation, Header, Layout wrapper
- **Form Components** (`forms/`) - Reusable form elements
- **Chart Components** (`charts/`) - Data visualization
- **Transporter Components** (`transporter/`) - SearchBar, FilterPanel, ListTable, TopActionBar, PaginationBar, StatusPill
- **Driver Components** (`driver/`) - SearchBar, FilterPanel, ListTable, TopActionBar, PaginationBar, StatusPill (shared list components)

#### State Management (Redux)

- **authSlice** - JWT tokens, user info, role-based permissions
- **transporterSlice** - Transporter CRUD, master data, validation state
- **driverSlice** - Driver CRUD, master data, validation state
- **uiSlice** - Sidebar state, toast notifications, theme preferences
- **dashboardSlice** - Dashboard data and KPIs
- **indentSlice** - Indent management state
- **rfqSlice** - RFQ data management
- **contractSlice** - Contract state
- **trackingSlice** - Tracking information

#### Recent Fixes & Improvements

- ✅ ISO code to name conversion for serviceable areas (India/Assam instead of IN/AS)
- ✅ Redux error state clearing to prevent "Error Loading Data" page on validation errors
- ✅ Inline validation errors with tab indicators and auto-switching
- ✅ VAT/GST filter fix - now searches VAT numbers instead of state names
- ✅ Transporter list navigation - only ID clickable, not entire row
- ✅ Toast notification system for success/error messages
- ✅ Driver details page collapsible sections - All view tabs implement collapsible sections with framer-motion
- ✅ Driver create page completion - All 8 tabs have complete input fields for data entry

### Backend API (Node.js + Express)

#### Core Technologies

- **Node.js** with **Express 5.1.0**
- **Knex.js 3.1.0** - SQL query builder and migrations
- **MySQL2 3.15.1** - Database driver
- **JWT 9.0.2** - Authentication tokens
- **bcrypt 6.0.0** - Password hashing
- **country-state-city 3.2.1** - Geographic data conversion

#### Security & Middleware

- **helmet 8.1.0** - Security headers
- **cors 2.8.5** - Cross-origin resource sharing
- **morgan 1.10.1** - HTTP request logging
- **cookie-parser 1.4.7** - Cookie handling
- **multer 2.0.2** - File upload handling

#### API Structure

- **Authentication** (`controllers/authController.js`, `routes/auth.js`)
  - POST `/api/auth/login` - JWT-based authentication
  - Token refresh and validation
  - Role-based access control
- **Transporter Management** (`controllers/transporterController.js`, `routes/transporter.js`)
  - GET `/api/transporter` - List with pagination, filters, search
  - POST `/api/transporter` - Create with comprehensive validation
  - GET `/api/transporter/:id` - Get details with ISO code to name conversion
  - PUT `/api/transporter/:id` - Update with validation
  - GET `/api/transporter/master-data` - Document types, address types, etc.
  - GET `/api/transporter/states/:country` - States by country
  - GET `/api/transporter/cities/:country/:state` - Cities by country and state
- **Driver Management** (`controllers/driverController.js`, `routes/driver.js`)
  - GET `/api/driver` - List with pagination, filters, search
  - POST `/api/driver` - Create with comprehensive validation
  - GET `/api/driver/:id` - Get details with ISO code to name conversion
  - PUT `/api/driver/:id` - Update with validation
  - GET `/api/driver/master-data` - Gender, blood group, license types, document types, etc.
  - GET `/api/driver/states/:countryCode` - States by country
  - GET `/api/driver/cities/:countryCode/:stateCode` - Cities by country and state
- **Route Modules**: auth, transporter, driver, consignor, materials, users, vehicles, warehouse

#### Database Architecture

- **130+ Tables** across TMS system
- **2,004+ Columns** with detailed metadata
- **54 Foreign Key Relationships**
- **638 Indexes** for query optimization
- **Migrations System** - 140+ migration files for schema management
- **Seeds** - Test data population scripts
- **Schema Documentation** - Auto-generated `database-schema.json`

#### Key Features

- Comprehensive validation for all transporter and driver data (business name, personal info, addresses, contacts, documents, mappings)
- Duplicate checking (VAT numbers, document numbers, phone numbers, emails, license numbers)
- Field-level validation with specific error messages (`field: "documents[0].documentNumber"`)
- ISO code to readable name conversion in API responses
- Transaction support for multi-table operations
- Auto-generated IDs (DRV0001, DRV0002 for drivers; ADDR, DDOC for addresses/documents)
- Audit fields (created_by, created_at, updated_by, updated_at)

#### Recent Backend Updates

- ✅ ISO code conversion in `getTransporterById` and `getDriverById` for serviceable areas and addresses
- ✅ VAT/GST filter parameter addition
- ✅ Validation error response format with field path parsing
- ✅ Country-state-city integration for geographic data
- ✅ Driver ID auto-generation system (DRV0001 format)
- ✅ Collision-resistant address and document ID generation

### Documentation Architecture

- **Separation of Concerns**: Clear distinction between agent behavior (memory) and project structure (copilot instructions)
- **Scalable Configuration**: Architecture supports adding new chatmodes and instruction sets
- **Version Control Integration**: All configurations tracked in Git for change management
- **Database Schema Docs**: Complete schema documentation in JSON format with regeneration scripts
- **Fix Documentation**: Markdown files documenting major fixes (VAT filter, navigation, validation)

## Testing Strategy

### Current Testing Approach

- **Incremental Validation**: Test after each significant architectural change
- **Configuration Testing**: Validate chatmode and instruction file parsing
- **Cross-Platform Compatibility**: Ensure configurations work across different AI platforms

### Planned Testing Framework

- **Agent Behavior Testing**: Validate autonomous workflow execution
- **Memory Persistence Testing**: Ensure instruction files maintain consistency
- **Integration Testing**: Test interaction between different configuration components

## Development Architecture Guidelines

### File Organization Principles

- **Configuration Isolation**: Keep AI agent configurations separate from application code
- **Hierarchical Structure**: Use nested directories for different types of instructions
- **Clear Naming Conventions**: Use descriptive filenames that indicate purpose and scope

### Scalability Considerations

- **Modular Chatmodes**: Architecture supports multiple specialized chatmode configurations
- **Extensible Instructions**: Memory system designed to accommodate growing complexity
- **Component Separation**: Clear boundaries between different architectural concerns

### Integration Patterns

- **Git-Native Configuration**: All configurations stored and versioned with code
- **Platform-Agnostic Design**: Architecture works across different AI development environments
- **Backward Compatibility**: Changes maintain compatibility with existing configurations

## Future Architecture Planning

### Anticipated Components

- **Application Code Structure**: Will likely include src/, tests/, and config/ directories
- **Build and Deployment**: Architecture will support modern build tools and CI/CD pipelines
- **External Integrations**: Framework ready for API integrations and external service connections

### Architectural Evolution

- **Incremental Growth**: Current foundation supports adding new components without restructuring
- **Configuration Scaling**: Memory and chatmode systems designed for increased complexity
- **Maintainability Focus**: Architecture prioritizes long-term maintainability and clarity
