# Consignor Management Module - Implementation Guide

## Overview

The Consignor Management Module is a complete CRUD application for managing consignors (customers/shippers) in the TMS system. It follows the same design patterns and architecture as the Transporter and Driver modules.

## Module Structure

```
frontend/
├── src/
│   ├── redux/
│   │   └── slices/
│   │       └── consignorSlice.js          # State management
│   ├── services/
│   │   └── consignorService.js            # API service layer
│   ├── features/
│   │   └── consignor/
│   │       ├── validation.js              # Zod validation schemas
│   │       └── components/
│   │           ├── GeneralInfoTab.jsx     # Edit: General information
│   │           ├── ContactTab.jsx         # Edit: Contact details
│   │           ├── OrganizationTab.jsx    # Edit: Organization details
│   │           ├── DocumentsTab.jsx       # Edit: Documents
│   │           ├── GeneralInfoViewTab.jsx # View: General information
│   │           ├── ContactViewTab.jsx     # View: Contact details
│   │           ├── OrganizationViewTab.jsx# View: Organization details
│   │           └── DocumentsViewTab.jsx   # View: Documents
│   ├── components/
│   │   └── consignor/
│   │       ├── ConsignorListTable.jsx     # List: Data table
│   │       ├── ConsignorFilterPanel.jsx   # List: Filter sidebar
│   │       ├── TopActionBar.jsx           # List: Action buttons
│   │       └── PaginationBar.jsx          # List: Pagination controls
│   └── pages/
│       ├── ConsignorMaintenance.jsx       # List page
│       ├── ConsignorDetailsPage.jsx       # View/Edit page
│       └── ConsignorCreatePage.jsx        # Create page
```

## Database Schema

The module integrates with 4 database tables:

### 1. `consignor_basic_information`
- **Primary Key**: `id` (UUID)
- **Unique Key**: `customer_id` (auto-generated)
- **Fields**: customer_name, search_term, industry_type, currency_type, payment_term, website_url, upload_nda, nda_validity, upload_msa, msa_validity, approved_by, approved_date, status, created_at, updated_at

### 2. `consignor_organization`
- **Primary Key**: `id` (UUID)
- **Foreign Key**: `consignor_id` → `consignor_basic_information.id`
- **Fields**: company_code, business_area

### 3. `contact`
- **Primary Key**: `id` (UUID)
- **Foreign Key**: `consignor_id` → `consignor_basic_information.id`
- **Fields**: designation, name, number, email, role, linkedin_link, photo

### 4. `consignor_documents`
- **Primary Key**: `id` (UUID)
- **Foreign Key**: `consignor_id` → `consignor_basic_information.id`
- **Fields**: document_type_id, document_number, valid_from, valid_to, file

## Component Architecture

### State Management (`consignorSlice.js`)

**Async Thunks:**
- `fetchConsignors` - Fetch paginated list with filters
- `fetchConsignorById` - Fetch single consignor details
- `createConsignor` - Create new consignor
- `updateConsignor` - Update existing consignor
- `deleteConsignor` - Delete consignor
- `uploadConsignorDocument` - Upload document with progress tracking
- `fetchConsignorMasterData` - Fetch dropdown options
- `deleteConsignorDocument` - Delete document

**State:**
```javascript
{
  consignors: [],              // List of consignors
  currentConsignor: null,      // Selected consignor for details
  masterData: {},              // Dropdown options
  pagination: { page, limit, total, pages },
  filters: { customerId, customerName, industryType, status },
  isFetching: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isUploadingDocument: false,
  uploadProgress: 0,
  error: null,
  lastCreatedId: null,
  lastUpdatedId: null
}
```

**Actions:**
- `setFilters` - Update filter values
- `clearFilters` - Reset filters
- `setCurrentConsignor` - Set selected consignor
- `clearCurrentConsignor` - Clear selected consignor
- `clearError` - Clear error message
- `resetLastCreated` - Reset last created ID
- `resetLastUpdated` - Reset last updated ID
- `setUploadProgress` - Update document upload progress
- `resetUploadProgress` - Reset upload progress

### API Service (`consignorService.js`)

**Mock Data:**
- 3 sample consignors (CONS001, CONS002, CONS003)
- Master data: industryTypes, currencyTypes, paymentTerms, documentTypes, countries
- Toggle: `USE_MOCK_DATA = true` (switch to false for backend API)

**Functions:**
- `getConsignors(params)` - GET /api/consignors (pagination + filters)
- `getConsignorById(id)` - GET /api/consignors/:id
- `createConsignor(data)` - POST /api/consignors
- `updateConsignor(id, data)` - PUT /api/consignors/:id
- `deleteConsignor(id)` - DELETE /api/consignors/:id
- `uploadDocument(consignorId, file, onProgress)` - POST /api/consignors/:id/documents
- `getMasterData()` - GET /api/consignors/master-data
- `getConsignorDocuments(consignorId)` - GET /api/consignors/:id/documents
- `deleteDocument(consignorId, documentId)` - DELETE /api/consignors/:id/documents/:documentId

### Validation (`validation.js`)

**Zod Schemas:**
- `generalInfoSchema` - Validates general information tab
- `contactSchema` - Validates single contact (nested in contacts array)
- `contactsArraySchema` - Validates contacts array (min 1 required)
- `organizationSchema` - Validates organization details
- `documentSchema` - Validates single document (nested in documents array)
- `consignorFormSchema` - Combines all schemas

**Helper Functions:**
- `validateConsignorForm(formData)` - Returns `{ isValid, errors }`
- `validateTab(tabName, data)` - Validates single tab
- `getFieldError(errors, fieldName)` - Extract field error message
- `hasTabErrors(tabErrors)` - Check if tab has any errors
- `getTabErrorCount(tabErrors)` - Count errors in tab

## Page Components

### 1. ConsignorMaintenance (List Page)

**URL:** `/consignor`

**Features:**
- Displays paginated list of consignors
- Filter panel: customerId, customerName, industryType, status
- Document status indicators (expired/expiring/valid)
- Summary cards: total, active, pending, inactive counts
- Click row to navigate to details page
- Refresh button
- "Create New Consignor" button

**Redux Integration:**
```javascript
const { consignors, pagination, filters, isFetching, error, masterData } = 
  useSelector((state) => state.consignor);

// Fetch consignors when filters or pagination change
useEffect(() => {
  dispatch(fetchConsignors({ ...filters, page: pagination.page }));
}, [filters, pagination.page]);
```

### 2. ConsignorDetailsPage (View/Edit Page)

**URL:** `/consignor/details/:id`

**Features:**
- View mode: Display consignor details with collapsible sections
- Edit mode: Edit consignor details with validation
- Tab navigation: General Info, Contact, Organization, Documents
- Edit/Save/Cancel buttons
- Success message on save
- Error message display
- Validation error display

**Mode Toggle:**
```javascript
const [isEditMode, setIsEditMode] = useState(false);

// Render different tab components based on mode
{isEditMode ? (
  <GeneralInfoTab data={formData.general} onChange={handleFormChange} />
) : (
  <GeneralInfoViewTab consignor={currentConsignor} />
)}
```

### 3. ConsignorCreatePage (Create Page)

**URL:** `/consignor/create`

**Features:**
- Multi-step form with 4 tabs
- Tab error indicators (show count of errors per tab)
- Validation summary (list of errors by tab)
- Clear Form button
- Create Consignor button
- Navigate to details page on success
- All tabs use Edit mode components

**Validation Display:**
```javascript
// Show error count badge on tab
{tabHasErrors && (
  <span style={{ position: "absolute", ... }}>
    {tabErrorCount}
  </span>
)}

// Show validation summary
{showValidationSummary && Object.keys(validationErrors).length > 0 && (
  <div>
    <ul>
      {Object.entries(validationErrors).map(([tab, errors]) => (
        <li>{tab}: {getTabErrorCount(errors)} errors</li>
      ))}
    </ul>
  </div>
)}
```

## Tab Components

### Edit Mode Tabs

Used in: ConsignorDetailsPage (edit mode), ConsignorCreatePage

#### GeneralInfoTab
- Customer name (required, max 100 chars)
- Search term
- Industry type (dropdown)
- Currency type (dropdown)
- Payment term (dropdown)
- Website URL (URL validation)
- NDA upload with validity date
- MSA upload with validity date
- Approved by & date

#### ContactTab
- Dynamic contact list (add/remove)
- Each contact: designation, name, number (phone regex), email, role, LinkedIn, photo
- Photo upload with preview
- Minimum 1 contact required

#### OrganizationTab
- Company code (uppercase enforced)
- Business area
- Information card

#### DocumentsTab
- Dynamic document list (add/remove)
- Each document: type (dropdown), number, valid from/to dates, file upload
- File upload with progress bar
- Expiry warnings (red/yellow/green indicators)

### View Mode Tabs

Used in: ConsignorDetailsPage (view mode)

#### GeneralInfoViewTab
- 3 collapsible sections: Basic Info, Documents (NDA/MSA), Additional Info
- NDA/MSA status with expiry indicators
- View/Download buttons for documents

#### ContactViewTab
- Contact cards with expand/collapse animation
- Photo display
- Clickable phone/email/LinkedIn links

#### OrganizationViewTab
- Organization details with collapsible section
- Information note

#### DocumentsViewTab
- Document cards with expand/collapse animation
- Validity status alerts (expired/expiring soon/valid)
- View/Download buttons

## List Components

### ConsignorListTable
- 10 columns: S.No, Customer ID, Name, Industry, Currency, Payment Term, NDA Status, MSA Status, Created Date, Status
- Row click navigation to details page
- Document status helpers: `isDocumentExpired()`, `isDocumentExpiringSoon()`, `getDocumentStatusIcon()`
- Loading state with spinner
- Empty state with icon

### ConsignorFilterPanel
- Collapsible with AnimatePresence
- 4 filter fields: customerId (text), customerName (text), industryType (dropdown), status (dropdown)
- Active filter count badge
- "Clear All" button

### TopActionBar
- Page title and description
- Refresh button (spinning icon when refreshing)
- "Create New Consignor" button

### PaginationBar
- Smart pagination with ellipsis
- Shows "X - Y of Z consignors"
- First/Previous/Next/Last buttons
- Dynamic page number buttons (max 5 visible)

## Theme Integration

All components use the centralized theme system:

```javascript
import { getPageTheme, getComponentTheme } from "../theme.config";

// Page-level theme
const theme = getPageTheme("list"); // or "details", "create"

// Component-level theme
const theme = getComponentTheme("card"); // or "button", "input", etc.

// Usage
<div style={{ backgroundColor: theme.colors.card.background }}>
```

**Never use hardcoded colors!** Always reference theme properties.

## Backend Integration Guide

### Step 1: Create Backend API Endpoints

The frontend expects these endpoints:

```
GET    /api/consignors                     # List with pagination & filters
GET    /api/consignors/:id                 # Get single consignor
POST   /api/consignors                     # Create consignor
PUT    /api/consignors/:id                 # Update consignor
DELETE /api/consignors/:id                 # Delete consignor
POST   /api/consignors/:id/documents       # Upload document
GET    /api/consignors/:id/documents       # List documents
DELETE /api/consignors/:id/documents/:docId # Delete document
GET    /api/consignors/master-data         # Get dropdown options
```

### Step 2: Update API Service

In `consignorService.js`, change:
```javascript
const USE_MOCK_DATA = false; // Switch to backend API
```

### Step 3: Update API Base URL

Ensure `API_BASE_URL` points to your backend:
```javascript
const API_BASE_URL = "http://localhost:5000"; // Update as needed
```

### Step 4: Request/Response Format

**Create/Update Request:**
```json
{
  "customer_name": "Acme Corporation",
  "search_term": "ACME",
  "industry_type": "Manufacturing",
  "currency_type": "USD",
  "payment_term": "NET30",
  "website_url": "https://acme.com",
  "upload_nda": "base64_or_file_url",
  "nda_validity": "2025-12-31",
  "upload_msa": "base64_or_file_url",
  "msa_validity": "2026-12-31",
  "approved_by": "John Doe",
  "approved_date": "2025-01-15",
  "company_code": "ACME001",
  "business_area": "Global Logistics",
  "contacts": [
    {
      "designation": "Manager",
      "name": "Jane Smith",
      "number": "+1234567890",
      "email": "jane@acme.com",
      "role": "Primary Contact",
      "linkedin_link": "https://linkedin.com/in/janesmith",
      "photo": "base64_or_file_url"
    }
  ],
  "documents": [
    {
      "document_type_id": "GST",
      "document_number": "GST123456",
      "valid_from": "2024-01-01",
      "valid_to": "2025-12-31",
      "file": "base64_or_file_url"
    }
  ],
  "status": "PENDING"
}
```

**List Response:**
```json
{
  "data": [...], // Array of consignors
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 100,
    "pages": 4
  }
}
```

### Step 5: Handle File Uploads

The frontend sends files as:
- File objects (for new uploads)
- Base64 strings (alternative)
- URLs (for existing files)

Backend should:
1. Store files in a secure location
2. Return file URL/path in response
3. Handle file validation (size, type)

### Step 6: Error Handling

Backend should return errors in this format:
```json
{
  "error": "Validation failed",
  "details": {
    "customer_name": "Customer name is required",
    "contacts": "At least one contact is required"
  }
}
```

The frontend will display these errors in the appropriate form fields.

## Testing Checklist

### Unit Testing (Frontend)

- [ ] Redux slice actions
- [ ] Redux slice reducers
- [ ] Validation schemas
- [ ] API service functions (with mock data)

### Component Testing

- [ ] GeneralInfoTab - form inputs, validation errors
- [ ] ContactTab - add/remove contacts, photo upload
- [ ] OrganizationTab - company code uppercase
- [ ] DocumentsTab - add/remove documents, file upload
- [ ] View tabs - collapsible sections, data display
- [ ] ConsignorListTable - row click, sorting, pagination
- [ ] ConsignorFilterPanel - filter changes, clear all
- [ ] PaginationBar - page navigation

### Integration Testing

- [ ] Create new consignor flow (all tabs)
- [ ] Edit existing consignor flow
- [ ] View consignor details (all tabs)
- [ ] List page with filters and pagination
- [ ] Document upload with progress tracking
- [ ] Validation error display (tab indicators, field errors)
- [ ] Navigation between pages (list → create, list → details)
- [ ] Success/error message display

### Manual Testing Scenarios

1. **Create Flow:**
   - Navigate to /consignor
   - Click "Create New Consignor"
   - Fill General Info tab (leave customer_name empty)
   - Click "Create Consignor"
   - Verify: validation error shows, tab has error badge
   - Fill customer_name
   - Switch to Contact tab
   - Click "Create Consignor"
   - Verify: validation error "At least one contact is required"
   - Add contact
   - Fill Organization tab
   - Click "Create Consignor"
   - Verify: success, navigate to details page

2. **Edit Flow:**
   - Navigate to /consignor
   - Click on a consignor row
   - Verify: details page opens, data displayed correctly
   - Click "Edit"
   - Verify: all tabs switch to edit mode
   - Modify customer name
   - Click "Save Changes"
   - Verify: success message, data updated

3. **Filter Flow:**
   - Navigate to /consignor
   - Expand filter panel
   - Enter customer ID
   - Verify: list updates, filter count badge shows "1"
   - Add status filter
   - Verify: list updates, filter count badge shows "2"
   - Click "Clear All"
   - Verify: filters reset, full list displays

4. **Pagination Flow:**
   - Navigate to /consignor (with >25 consignors)
   - Verify: page 1 displayed, pagination shows total
   - Click page 2
   - Verify: page 2 loads, URL updates
   - Click "Last Page"
   - Verify: last page loads
   - Click "Previous"
   - Verify: previous page loads

5. **Document Upload Flow:**
   - Create/Edit consignor
   - Go to Documents tab
   - Click "Add Document"
   - Select file (>5MB)
   - Verify: validation error "File size must be less than 5MB"
   - Select valid file
   - Verify: progress bar shows, file uploads, preview displays

## Troubleshooting

### Issue: "Module not found: consignorSlice"
**Solution:** Check import path in store.js:
```javascript
import consignorSlice from "./slices/consignorSlice";
```

### Issue: "Cannot read property 'consignor' of undefined"
**Solution:** Ensure consignor reducer is added to store:
```javascript
export const store = configureStore({
  reducer: {
    ...
    consignor: consignorSlice,
  },
});
```

### Issue: Routes not working
**Solution:** Check AppRoutes.jsx:
- Imports are correct
- Routes are wrapped in ProtectedRoute
- Route paths match navigation links

### Issue: Theme colors not applying
**Solution:** 
- Import theme: `import { getPageTheme } from "../theme.config";`
- Use theme properties: `theme.colors.card.background` (not hardcoded colors)

### Issue: Validation not working
**Solution:**
- Check validation.js import
- Ensure validation helper functions are called correctly
- Check error state management in form components

### Issue: API calls failing
**Solution:**
- Check USE_MOCK_DATA flag in consignorService.js
- Verify API_BASE_URL matches backend
- Check network tab for request/response
- Verify backend CORS settings

## Future Enhancements

1. **Bulk Upload:**
   - Excel/CSV import for multiple consignors
   - Template download
   - Validation and error reporting

2. **Advanced Filtering:**
   - Date range filters (created_at)
   - Multi-select filters
   - Saved filter presets

3. **Export:**
   - Export to Excel/PDF
   - Bulk export with filters

4. **Audit Trail:**
   - Track changes (who, when, what)
   - View history of updates

5. **Document Management:**
   - Document expiry notifications
   - Bulk document upload
   - Document templates

6. **Relationship Management:**
   - Link consignors to indents
   - View consignor activity (indents, contracts)
   - Consignor performance metrics

## Maintenance Guidelines

### Adding New Fields

1. Update database schema
2. Add field to Redux state (consignorSlice.js)
3. Add field to API service (consignorService.js mock data)
4. Add field to validation schema (validation.js)
5. Add field to appropriate tab component (Edit + View)
6. Update backend API integration

### Modifying Validation Rules

1. Open `validation.js`
2. Locate appropriate schema (generalInfoSchema, contactSchema, etc.)
3. Modify Zod schema:
   ```javascript
   customer_name: z.string()
     .min(3, "Name must be at least 3 characters")
     .max(100, "Name must be less than 100 characters")
   ```
4. Test validation in Create and Edit pages

### Updating Theme

1. Open `theme.config.js`
2. Modify color values in theme object
3. All components will automatically update (no code changes needed)

### Adding New Tab

1. Create new tab component (Edit mode)
2. Create new tab component (View mode)
3. Add validation schema
4. Update formData state in Create/Details pages
5. Add tab to tabs array
6. Add tab to renderTabContent() switch statement

## Contact & Support

For questions or issues:
- Check this documentation first
- Review existing Transporter/Driver modules for reference
- Check console for error messages
- Verify Redux DevTools for state issues

---

**Last Updated:** January 2025
**Version:** 1.0.0
**Module Status:** ✅ Complete and Integration-Ready
