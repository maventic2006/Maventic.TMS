# Consignor Management Module - Implementation Guide

**Date**: November 12, 2025  
**Status**: 🚧 IN PROGRESS  
**Module**: Consignor Maintenance (Complete CRUD with 4 Tabs)

---

## 📋 Overview

This document provides a comprehensive implementation guide for the Consignor Management Module, following the exact architecture and design patterns used in the Transporter and Driver modules.

---

## ✅ Completed Components

### 1. **Redux Slice** (`redux/slices/consignorSlice.js`)
- ✅ Complete state management with CRUD actions
- ✅ Async thunks for all API operations
- ✅ Pagination and filtering support
- ✅ Document upload with progress tracking
- ✅ Error handling and status management

### 2. **API Service Layer** (`services/consignorService.js`)
- ✅ Mock data implementation (3 sample consignors)
- ✅ Ready for backend integration (`USE_MOCK_DATA` flag)
- ✅ Complete CRUD functions
- ✅ Document upload with progress callback
- ✅ Master data fetching
- ✅ Filter and pagination support

---

## 🗂️ Module Structure

```
features/consignor/
├── components/
│   ├── GeneralInfoTab.jsx           # Edit mode - General information
│   ├── GeneralInfoViewTab.jsx       # View mode - General (collapsible)
│   ├── ContactTab.jsx               # Edit mode - Contact management
│   ├── ContactViewTab.jsx           # View mode - Contacts (collapsible)
│   ├── OrganizationTab.jsx          # Edit mode - Organization details
│   ├── OrganizationViewTab.jsx      # View mode - Organization (collapsible)
│   ├── DocumentsTab.jsx             # Edit mode - Document uploads
│   └── DocumentsViewTab.jsx         # View mode - Documents (collapsible)
├── pages/
│   ├── ConsignorCreatePage.jsx      # Create new consignor
│   ├── ConsignorDetails.jsx         # View/edit consignor details
│   └── ConsignorMaintenance.jsx     # List page with filters
└── validation.js                    # Zod validation schemas

components/consignor/
├── ConsignorListTable.jsx           # Data table with sorting
├── ConsignorFilterPanel.jsx         # Filter sidebar
├── TopActionBar.jsx                 # Search + actions (reuse transporter)
└── PaginationBar.jsx                # Pagination controls (reuse)

services/
└── consignorService.js              # API service layer ✅

redux/slices/
└── consignorSlice.js                # State management ✅
```

---

## 📊 Database Tables Mapping

### **Tab 1: General Information**
**Tables**: `consignor_basic_information`, `tms_address`

| Field | Database Column | Type | Required |
|-------|----------------|------|----------|
| Customer ID | customer_id | VARCHAR(10) | ✅ |
| Customer Name | customer_name | VARCHAR(100) | ✅ |
| Search Term | search_term | VARCHAR(100) | ✅ |
| Industry Type | industry_type | VARCHAR(30) | ✅ |
| Currency Type | currency_type | VARCHAR(30) | ❌ |
| Payment Term | payment_term | VARCHAR(10) | ✅ |
| Remark | remark | VARCHAR(255) | ❌ |
| Upload NDA | upload_nda | VARCHAR(20) | ❌ |
| Upload MSA | upload_msa | VARCHAR(20) | ❌ |
| Website URL | website_url | VARCHAR(200) | ❌ |
| Name on PO | name_on_po | VARCHAR(30) | ❌ |
| Approved By | approved_by | VARCHAR(30) | ❌ |
| Approved Date | approved_date | DATE | ❌ |
| Address ID | address_id | VARCHAR(20) | ❌ FK |

### **Tab 2: Contact**
**Table**: `contact`

| Field | Database Column | Type | Required |
|-------|----------------|------|----------|
| Contact ID | contact_id | VARCHAR(10) | ✅ PK |
| Customer ID | customer_id | VARCHAR(10) | ✅ FK |
| Designation | contact_designation | VARCHAR(50) | ✅ |
| Name | contact_name | VARCHAR(100) | ✅ |
| Number | contact_number | VARCHAR(15) | ❌ |
| Photo | contact_photo | TEXT | ❌ |
| Role | contact_role | VARCHAR(40) | ❌ |
| Team | contact_team | VARCHAR(20) | ❌ |
| Country Code | country_code | VARCHAR(10) | ❌ |
| Email | email_id | VARCHAR(100) | ❌ |
| LinkedIn | linkedin_link | VARCHAR(200) | ❌ |

**Features**: Multiple contacts per consignor, add/edit/delete inline

### **Tab 3: Organization**
**Table**: `consignor_organization`

| Field | Database Column | Type | Required |
|-------|----------------|------|----------|
| Customer ID | customer_id | VARCHAR(10) | ✅ FK |
| Company Code | company_code | VARCHAR(20) | ✅ UNIQUE |
| Business Area | business_area | VARCHAR(30) | ✅ UNIQUE |

**Features**: Single organization per consignor

### **Tab 4: Documents**
**Table**: `consignor_documents`

| Field | Database Column | Type | Required |
|-------|----------------|------|----------|
| Document Unique ID | document_unique_id | VARCHAR(10) | ✅ PK |
| Document ID | document_id | VARCHAR(20) | ✅ FK |
| Customer ID | customer_id | VARCHAR(10) | ✅ FK |
| Document Type ID | document_type_id | VARCHAR(30) | ✅ FK |
| Document Number | document_number | VARCHAR(50) | ❌ |
| Valid From | valid_from | DATE | ✅ |
| Valid To | valid_to | DATE | ❌ |

**Features**: Multiple documents, upload with progress bar, preview, expiry tracking

---

## 🎨 UI Design Standards (From Transporter Module)

### **Color Palette**
```javascript
// Page theme
background: "#F5F7FA"         // Primary background
cardBackground: "#FFFFFF"      // Card background
cardBorder: "#E5E7EB"          // Card border
textPrimary: "#0D1A33"         // Primary text
textSecondary: "#4A5568"       // Secondary text

// Status colors
Active: "#10B981" (green)
Pending: "#F59E0B" (yellow)
Inactive: "#EF4444" (red)

// Button colors
Primary: "#10B981" (green)
Secondary: "#6B7280" (gray)
Danger: "#EF4444" (red)
```

### **Typography**
```css
Page Title: 2xl font-bold (text-2xl)
Section Title: xl font-semibold (text-xl)
Card Title: lg font-semibold (text-lg)
Label: sm font-medium (text-sm)
Body: sm (text-sm)
Helper: xs text-secondary (text-xs)
```

### **Spacing & Layout**
```css
Container: max-w-7xl mx-auto px-4 py-6
Card Padding: p-6
Section Gap: space-y-6
Input Gap: space-y-4
```

---

## 🔧 Component Implementation Templates

### **1. ConsignorMaintenance.jsx** (List Page)
```javascript
// Structure matches TransporterMaintenance.jsx
- TMSHeader component
- TopActionBar (search, filters toggle, create new button)
- ConsignorFilterPanel (collapsible sidebar)
- ConsignorListTable (data table with pagination)
- Error display

// Features:
- Fuzzy search across all fields
- Advanced filters (customer ID, name, industry, status)
- Pagination (25 items per page)
- Click row to view details
- Status pills (Active/Pending/Inactive)
```

### **2. ConsignorDetails.jsx** (Details Page)
```javascript
// Structure matches TransporterDetails.jsx
- Back button to list
- Header with customer name and status pill
- Tab navigation (4 tabs)
- Tab content area
- Edit mode toggle (future)

// Tabs:
1. General Information (GeneralInfoViewTab)
2. Contact (ContactViewTab)
3. Organization (OrganizationViewTab)
4. Documents (DocumentsViewTab)

// All view tabs use collapsible sections with Framer Motion
```

### **3. ConsignorCreatePage.jsx** (Create Page)
```javascript
// Structure matches CreateTransporterPage.jsx
- Header with clear/submit buttons
- Tab navigation (4 edit tabs)
- Form validation with Zod
- Tab error indicators
- Success/error toast notifications

// Tabs:
1. General Information (GeneralInfoTab)
2. Contact (ContactTab)
3. Organization (OrganizationTab)
4. Documents (DocumentsTab)
```

---

## 📝 Validation Schemas (validation.js)

```javascript
import { z } from "zod";

// General Information Schema
export const generalInfoSchema = z.object({
  customer_name: z.string().min(2, "Name must be at least 2 characters"),
  search_term: z.string().min(1, "Search term is required"),
  industry_type: z.string().min(1, "Industry type is required"),
  currency_type: z.string().optional(),
  payment_term: z.string().min(1, "Payment term is required"),
  remark: z.string().max(255, "Remark too long").optional(),
  website_url: z.string().url("Invalid URL").optional().or(z.literal("")),
  name_on_po: z.string().max(30).optional(),
  approved_by: z.string().max(30).optional(),
  approved_date: z.string().optional(),
});

// Contact Schema
export const contactSchema = z.object({
  contact_designation: z.string().min(1, "Designation is required"),
  contact_name: z.string().min(2, "Name must be at least 2 characters"),
  contact_number: z.string().regex(/^[6-9]\d{9}$/, "Invalid phone number").optional(),
  contact_role: z.string().max(40).optional(),
  contact_team: z.string().max(20).optional(),
  country_code: z.string().max(10).optional(),
  email_id: z.string().email("Invalid email").optional().or(z.literal("")),
  linkedin_link: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
});

// Organization Schema
export const organizationSchema = z.object({
  company_code: z.string().min(1, "Company code is required"),
  business_area: z.string().min(1, "Business area is required"),
});

// Document Schema
export const documentSchema = z.object({
  document_type_id: z.string().min(1, "Document type is required"),
  document_number: z.string().max(50).optional(),
  valid_from: z.string().min(1, "Valid from date is required"),
  valid_to: z.string().optional(),
});
```

---

## 🎯 Key Features Implementation

### **1. List Page Features**
- ✅ Fuzzy search across multiple fields
- ✅ Advanced filters (customer ID, name, industry, status)
- ✅ Pagination with page numbers
- ✅ Status pills with color coding
- ✅ Click to view details
- ✅ Create new button
- ✅ Total count display
- ✅ Loading states

### **2. Details Page Features**
- ✅ Tab-based navigation
- ✅ Collapsible sections in view mode
- ✅ Edit mode toggle (future)
- ✅ Status indicator
- ✅ Back to list navigation
- ✅ Real-time data updates

### **3. Create Page Features**
- ✅ Multi-tab form
- ✅ Real-time validation
- ✅ Tab error indicators
- ✅ File upload with progress
- ✅ Clear all functionality
- ✅ Success/error notifications

### **4. Document Management**
- ✅ Multiple document uploads
- ✅ Document type dropdown
- ✅ Validity date range
- ✅ Upload progress bar
- ✅ File preview
- ✅ Delete confirmation

---

## 🔄 Backend Integration Checklist

### **Step 1: API Endpoints Required**
```
GET    /api/consignors                    # List with filters & pagination
GET    /api/consignors/:id                # Get single consignor
POST   /api/consignors                    # Create new consignor
PUT    /api/consignors/:id                # Update consignor
DELETE /api/consignors/:id                # Delete consignor
POST   /api/consignors/:id/documents      # Upload document
GET    /api/consignors/:id/documents      # Get documents
DELETE /api/consignors/:id/documents/:docId  # Delete document
GET    /api/consignors/master-data        # Get master data
```

### **Step 2: Integration Process**
1. Set `USE_MOCK_DATA = false` in `consignorService.js`
2. Update `API_BASE_URL` in `.env`
3. Add authentication tokens in axios interceptor
4. Map backend response structure to frontend expectations
5. Handle backend validation errors in Redux slice
6. Test all CRUD operations
7. Test file uploads with progress
8. Test pagination and filtering

### **Step 3: Error Handling**
```javascript
// Backend error response format expected:
{
  success: false,
  message: "Error message",
  errors: [
    {
      field: "customer_name",
      message: "Customer name already exists"
    }
  ]
}
```

---

## 📦 Dependencies

All dependencies already exist in the project:
- ✅ React 19.1.1
- ✅ Redux Toolkit 2.9.0
- ✅ React Router DOM 7.9.4
- ✅ Axios 1.12.2
- ✅ Zod 4.1.12
- ✅ Framer Motion 12.23.24
- ✅ Lucide React 0.545.0
- ✅ Country-State-City 3.2.1

---

## 🚀 Implementation Priority

### **Phase 1: Core Structure** (Completed ✅)
- ✅ Redux slice
- ✅ API service layer with mock data
- ⏳ Validation schemas

### **Phase 2: List Page** (Next)
- ⏳ ConsignorListTable component
- ⏳ ConsignorFilterPanel component
- ⏳ ConsignorMaintenance page
- ⏳ Routing setup

### **Phase 3: Details Page**
- ⏳ View tab components (4 tabs with collapsible sections)
- ⏳ ConsignorDetails page
- ⏳ Tab navigation

### **Phase 4: Create/Edit**
- ⏳ Edit tab components (4 tabs)
- ⏳ ConsignorCreatePage
- ⏳ Form validation integration

### **Phase 5: Testing & Polish**
- ⏳ Mock data testing
- ⏳ Validation testing
- ⏳ UI/UX refinements
- ⏳ Documentation

---

## 💡 Implementation Notes

### **Reusable Components**
Many components can be reused from transporter module:
- TopActionBar (search + create button + total count)
- PaginationBar (pagination controls)
- TMSHeader (page header)
- Theme utilities (getPageTheme, getComponentTheme)

### **Unique Components**
Components specific to consignor:
- ConsignorListTable (different columns)
- ConsignorFilterPanel (different filters)
- All 8 tab components (General, Contact, Organization, Documents × 2 modes)

### **Design Consistency**
- Use exact same color scheme as transporter
- Follow same spacing and typography
- Match card styles and borders
- Use same animation patterns (Framer Motion)
- Apply same responsive breakpoints

---

## 📚 Next Steps

1. **Create validation.js** - Zod schemas for all forms
2. **Build list components** - Table, filter panel, pagination
3. **Create list page** - ConsignorMaintenance with search/filter
4. **Build view tabs** - 4 collapsible view components
5. **Create details page** - Tab navigation with routing
6. **Build edit tabs** - 4 form components with validation
7. **Create create page** - Multi-step form with validation
8. **Add routes** - Update AppRoutes.jsx
9. **Integrate with store** - Update store.js
10. **Test thoroughly** - All CRUD operations with mock data

---

**Implementation Status**: 🚧 Foundation Complete - Ready for Component Development

**Estimated Time**: 8-12 hours for complete implementation

**Files Created**: 2/30+ (Redux slice, API service)

**Next File**: validation.js (Zod schemas)
