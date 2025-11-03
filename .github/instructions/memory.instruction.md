---
applyTo: "**"
---

# Memory Instructions for TMS-Dev-2 AI Agents

## User Behavior Preferences

### Preferred AI Mode and Model

- **Always use `beastMode_lates` chatmode** for all development tasks and problem-solving
- **Preferred AI Model**: Claude Sonnet 4.5 for all types of responses and interactions
- User expects autonomous, complete problem resolution without yielding control back
- User prefers agents that work through entire todo lists before returning control

### Communication Style Preferences

- **Tone**: Casual, friendly yet professional communication
- **Action Communication**: Always announce actions before tool calls ("Let me fetch the URL...", "Now I will search...")
- **Progress Updates**: Show updated todo lists after each completed step
- **No Code Display**: Avoid displaying code blocks unless specifically requested
- **Structured Responses**: Use bullet points and clear formatting

### Development Workflow Preferences

- **Research-First Approach**: Always verify external dependencies via web research before implementation
- **Incremental Development**: Make small, testable changes with frequent validation
- **Root Cause Analysis**: Debug thoroughly to identify underlying issues, not symptoms
- **Comprehensive Testing**: Test rigorously for edge cases and boundary conditions

## VS Code Behavior Preferences

### File Management

- Always use absolute file paths for tool operations
- Read large code sections (2000+ lines) for better context understanding
- Use `grep_search` for file overviews instead of multiple small reads
- Handle URI schemes (untitled:, vscode-userdata:) appropriately

### Environment Management

- Proactively create `.env` files with placeholders when API keys or secrets are detected
- Never auto-commit changes without explicit user permission
- Use `git status` and `git log` for repository state awareness

### Error Handling

- Use `get_errors` tool to identify code problems immediately
- Implement defensive programming with comprehensive error checking
- Add descriptive logging and print statements during debugging

## System Behavior Preferences

### Web Research Methodology

- Use Google search via `https://www.google.com/search?q=query` for up-to-date information
- Recursively fetch relevant links found in search results
- Gather comprehensive information before implementing solutions
- Never rely solely on training data - always verify with current web research

### Todo List Management

- Always use markdown checkbox format wrapped in code blocks
- Display updated todo lists after each completed step
- Never end turn without completing all todo list items
- Use emojis to indicate status when appropriate

### Memory Updates

- Update this memory file when user provides new preferences or behavior patterns
- Store project-specific user requirements and workflow preferences
- Remember user's technology stack preferences and coding style choices

## Agent Autonomy Guidelines

### Problem-Solving Approach

1. Always fetch provided URLs using `fetch_webpage` tool
2. Understand problems deeply with sequential thinking
3. Investigate codebase thoroughly before making changes
4. Research internet for up-to-date information on dependencies
5. Develop step-by-step plans with detailed todo lists
6. Implement incrementally with frequent testing
7. Debug with root cause analysis
8. Validate comprehensively with additional tests

### Quality Standards

- **Complete Autonomy**: Solve problems completely before returning control
- **No Assumptions**: Gather context first, then perform tasks
- **Rigorous Testing**: Create additional tests beyond basic requirements
- **Context Awareness**: Always read substantial code sections for complete understanding

## Technology Preferences

- User prefers modern, well-documented libraries and frameworks
- Always research latest versions and best practices before implementation
- Prioritize maintainable, scalable solutions over quick fixes
- Consider performance implications in all architectural decisions

### Theme Configuration System

**CRITICAL RULE: NO HARDCODED COLORS IN ANY COMPONENT**

#### Theme Architecture

- **Configuration File**: `/src/theme.config.js` - Single source of truth for all design tokens
- **CSS Variables**: `/src/index.css` - Auto-generated CSS variables from theme
- **Tailwind Integration**: `tailwind.config.js` - Imports theme values automatically

#### Theme Usage Pattern

```javascript
// ✅ CORRECT - Use theme utilities
import { getPageTheme, getComponentTheme } from '../theme.config.js';

const theme = getPageTheme('general'); // or 'list', 'tab'
const buttonTheme = getComponentTheme('actionButton');

// IMPORTANT: Theme structure uses nested 'colors' object
// Access properties like: theme.colors.primary.background (NOT theme.background.primary)
// Access properties like: theme.colors.text.primary (NOT theme.text.primary)
// Access properties like: theme.colors.card.background (NOT theme.card.background)

// Use in component
<div style={{ backgroundColor: theme.colors.card.background }}>
<div style={{ color: theme.colors.text.primary }}>
<button style={{ backgroundColor: buttonTheme.primary.background }}>

// For gradients
<div style={{ background: `linear-gradient(to bottom right, ${theme.colors.primary.background}, #f0f4f8, #e6f0ff)` }}>
```

```javascript
// ❌ WRONG - Hardcoded colors
<div className="bg-white text-gray-800"> // ❌ Don't use
<div style={{ backgroundColor: "#FFFFFF" }}> // ❌ Don't use
<button style={{ backgroundColor: "#10B981" }}> // ❌ Don't use

// ❌ WRONG - Incorrect theme property access
<div style={{ backgroundColor: theme.card.background }}> // ❌ Missing 'colors'
<div style={{ color: theme.text.primary }}> // ❌ Missing 'colors'
<div style={{ background: theme.background.primary }}> // ❌ No 'background' property at root
```

#### Available Theme Types

1. **Page Themes**: `getPageTheme('general' | 'list' | 'tab')`
2. **Component Themes**: `getComponentTheme('actionButton' | 'tabButton' | 'statusPill' | 'formInput' | 'transportModeCard' | 'collapsibleSection')`

#### Theme Tokens Structure

- **Colors**: `primary.background`, `card.background`, `text.primary`, `status.*`, `button.*`, `input.*`, `header.*`, `fields.*`
- **Typography**: `fontFamily`, `fontSize.*`, `fontWeight.*`, `lineHeight`
- **Layout**: `card.borderRadius`, `card.padding`, `button.borderRadius`, `input.height`, etc.

#### Theme Enforcement Rules

- **NEVER** add hex colors (#FFFFFF, #10B981) in component files
- **NEVER** use RGB/RGBA values directly
- **ALWAYS** use `getPageTheme()` or `getComponentTheme()` for theme access
- **ALWAYS** use Tailwind theme classes (e.g., `bg-primary-background`)
- **ALWAYS** use CSS variables (e.g., `var(--primary-background)`) when needed

#### When Creating New Components

1. Import theme utilities: `import { getPageTheme, getComponentTheme } from '../theme.config.js';`
2. Determine page type: general, list, or tab
3. Get appropriate theme: `const theme = getPageTheme('general');`
4. Use theme tokens for ALL visual properties
5. If component needs specific tokens, add to `componentThemes` in theme.config.js

#### Theme Modification Process

1. **Edit ONLY**: `/src/theme.config.js`
2. CSS variables and Tailwind config auto-update
3. All components using theme reflect changes automatically

**Remember**: Theme.config.js is the ONLY place colors should be defined!

#### Theme Compliance Fixes - DocumentsViewTab (Completed)

**Issue**: Multiple hardcoded gradient colors in DocumentsViewTab component not following theme system

**Fixed Sections** (All completed):

1. ✅ Status badge colors - Changed to theme status tokens (`bg-status-success-background`, etc.)
2. ✅ Document icon gradient - Changed from `bg-gradient-to-br from-purple-500 to-pink-600` to theme-based inline styles
3. ✅ Warning badges (expired/expiring) - Changed to `bg-status-error-background`, `bg-status-warning-background`
4. ✅ Valid To date field colors - Conditional styling using theme status tokens
5. ✅ File icon gradient - Changed from `bg-gradient-to-br from-blue-500 to-indigo-600` to theme colors
6. ✅ View/Download action buttons - Changed to theme button colors with inline styles
7. ✅ Document validity status section - Changed three conditional gradients (expired/expiring/valid) to theme status backgrounds
   - Expired: `bg-status-error-background border-status-error-border text-status-error-text`
   - Expiring: `bg-status-warning-background border-status-warning-border text-status-warning-text`
   - Valid: `bg-status-success-background border-status-success-border text-status-success-text`
   - Icon colors: Applied via inline styles using `theme.status.error/warning/success`

**Result**: DocumentsViewTab.jsx now 100% compliant with theme system - zero hardcoded colors remaining

**Pattern Used**:

```javascript
// Gradient replacement pattern
<div style={{
  background: `linear-gradient(to bottom right, ${theme.header.background}, ${theme.button.primary.background})`,
}} />

// Status-based conditional classes
className={`${
  isExpired
    ? "bg-status-error-background text-status-error-text border-status-error-border"
    : isExpiringSoon
    ? "bg-status-warning-background text-status-warning-text border-status-warning-border"
    : "bg-status-success-background text-status-success-text border-status-success-border"
}`}

// Icon colors via inline styles
<XCircle style={{ color: theme.status.error }} />
```

---

### Country-State-City Selection

- **Package Used**: `country-state-city` npm package (v3.2.1)
- **Implementation**: Direct frontend usage without API calls
- **Pattern**: Cascading dropdowns (Country → State → City)
- **Data Structure**: Use `isoCode` for country/state, `name` for city
- **Package Methods**:
  - `Country.getAllCountries()` - Get all countries
  - `State.getStatesOfCountry(countryCode)` - Get states for a country
  - `City.getCitiesOfState(countryCode, stateCode)` - Get cities for a state
- **Key Properties**:
  - Countries: `isoCode`, `name`, `phonecode`, `currency`, etc.
  - States: `isoCode`, `name`, `countryCode`, `latitude`, `longitude`
  - Cities: `name`, `stateCode`, `countryCode`, `latitude`, `longitude`

**Usage Pattern for Components**:

```javascript
// CORRECT: Import and use country-state-city package
import { Country, State, City } from "country-state-city";

const allCountries = Country.getAllCountries();
const countryOptions = allCountries.map((country) => ({
  value: country.isoCode,  // Use isoCode as value
  label: country.name       // Use name as label
}));

// WRONG: Using mock data from Redux for countries
const countryOptions = masterData?.countries.map(...)  // ❌ Don't use
```

**Components Using country-state-city**:

- ✅ AddressContactsTab - Uses Country, State, City for address selection
- ✅ ServiceableAreaTab - Uses Country, State for serviceable areas
- ✅ DocumentsTab - Uses Country for document country selection
- All future components needing country/state/city should use this package

**When to Use Mock Data vs country-state-city**:

- **Use country-state-city**: For any country, state, or city dropdown (Address, Documents, Serviceable Areas)
- **Use Mock/API Data**: For business-specific master data (Document Types, Address Types, Vehicle Types, etc.)

---

### Phone Number Validation Standards

**Current Implementation**: Indian phone numbers only (10 digits)

**Validation Rules**:

- **Exactly 10 digits** - No more, no less
- **Must start with 6, 7, 8, or 9** - Valid Indian mobile number prefix
- **Numeric only** - No dashes, spaces, parentheses, or country codes
- **Examples**:
  - ✅ Valid: `9876543210`, `8765432109`, `7654321098`, `6543210987`
  - ❌ Invalid: `98765432` (too short), `98765432101` (too long), `5876543210` (invalid prefix), `+919876543210` (has country code)

**Implementation**:

Frontend (Zod):

```javascript
const phoneRegex = /^[6-9]\d{9}$/;
```

Backend (Node.js):

```javascript
const validatePhoneNumber = (phoneNumber) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phoneNumber);
};
```

**Applies to**:

- Primary phone number
- Alternate phone number
- WhatsApp number

**Future Enhancement**: International phone numbers will be implemented later in development

### Master Data Dropdown Format Standard

**CRITICAL**: ALL dropdown options from master data MUST follow this format:

```javascript
{
  value: "unique_identifier",  // Database ID or code (e.g., "AT001", "DN001", "US")
  label: "Display Name"         // Human-readable name (e.g., "Billing Address", "PAN/TIN")
}
```

**Implementation Rules**:

1. **Backend API Responses**: Always return `{value, label}` format

   ```javascript
   // CORRECT: Backend query with aliases
   .select('doc_name_master_id as value', 'document_name as label')

   // WRONG: Inconsistent field names
   .select('id', 'name')  // ❌ Don't use
   ```

2. **Redux Store Mock Data**: Match backend format exactly

   ```javascript
   // CORRECT: Mock data format
   documentNames: [
     { value: "DN001", label: "PAN/TIN" },
     { value: "DN002", label: "Aadhar Card" },
   ];

   // WRONG: Using id/name format
   documentNames: [
     { id: 1, name: "PAN Card" }, // ❌ Don't use
   ];
   ```

3. **CustomSelect Component Usage**: Always specify extractors

   ```javascript
   // CORRECT: Using value/label
   <CustomSelect
     options={masterData?.documentNames || []}
     getOptionLabel={(option) => option.label}
     getOptionValue={(option) => option.value}
   />

   // WRONG: Using id/name
   <CustomSelect
     getOptionLabel={(option) => option.name}  // ❌ Inconsistent
     getOptionValue={(option) => option.id}    // ❌ Inconsistent
   />
   ```

4. **ThemeTable Column Options**: Use value/label format
   ```javascript
   // CORRECT: Column configuration
   columns: [
     {
       key: "documentType",
       type: "select",
       options: documentTypes, // Must be [{value, label}]
     },
   ];
   ```

**Affected Master Data Tables**:

- `document_name_master` → `{value: doc_name_master_id, label: document_name}`
- `address_type_master` → `{value: address_type_id, label: address_type_name}`
- `vehicle_type_master` → `{value: vehicle_type_id, label: vehicle_type_name}`
- `service_frequency_master` → `{value: frequency_id, label: frequency_name}`
- All future master tables must follow this pattern

**Prevention Checklist**:

- [ ] Backend API returns `{value, label}` format with SQL aliases
- [ ] Redux mock data uses `{value, label}` format
- [ ] Redux rejected case fallback uses `{value, label}` format
- [ ] CustomSelect uses `getOptionLabel={(option) => option.label`
- [ ] CustomSelect uses `getOptionValue={(option) => option.value}`
- [ ] ThemeTable columns receive options in `{value, label}` format
- [ ] Never mix formats like `{id, name}` or `{code, description}`

---

### VAT Number Duplicate Validation

**Issue**: Duplicate VAT validation error message not specific enough

**Old Behavior**:

- Generic message: "Please enter a valid VAT/Tax number for the selected country"
- Didn't show which VAT number was duplicate

**New Behavior**:

- Specific message: "VAT number 07ABCDE1234F2Z5 already exists. Please use a unique VAT number"
- Shows the actual duplicate VAT number
- Error appears in toast with tab name

**Backend Implementation**:

```javascript
if (existingVATCheck.length > 0) {
  const duplicateVAT = existingVATCheck[0].vat_number;
  return res.status(400).json({
    success: false,
    error: {
      code: "VALIDATION_ERROR",
      message: `VAT number ${duplicateVAT} already exists. Please use a unique VAT number`,
      field: "vatNumber",
      value: duplicateVAT,
    },
  });
}
```

**Frontend Handling**:

- Toast displays: "Error in Address & Contacts tab: VAT number 07ABCDE1234F2Z5 already exists. Please use a unique VAT number"
- User is auto-switched to Address & Contacts tab
- Tab shows red error indicator

---

## Common Issues and Solutions

### Document Type ID vs NAME Mismatch (CRITICAL PATTERN)

**Issue**: Validation passes with correct document format (e.g., "ASDF12345N" for TAN), but INSERT fails with foreign key constraint error

**Root Cause**: Complex multi-layer issue:

1. GET endpoint returns `documentType` field containing the NAME (e.g., "TAN", "PAN Card")
2. Frontend sends back the NAME in `documentType` field
3. Validation code looks up document by ID OR NAME → finds it successfully
4. Validation checks format against document name → passes successfully
5. But INSERT uses `doc.documentType` which is still the NAME (e.g., "TAN")
6. Database rejects INSERT because `document_type_id` foreign key expects ID (e.g., "DN003") from `document_name_master` table

**Why This Happens**:

- GET endpoints return human-readable NAMEs for frontend display
- Database foreign keys require IDs for data integrity and normalization
- Validation can find entity by NAME, but database requires ID
- Frontend doesn't distinguish between ID and NAME in same field

**Solution Pattern (MUST FOLLOW FOR ALL MASTER DATA)**:

```javascript
// Step 1: During validation phase - Resolve and store the ID
const docTypeInfo = await trx("document_name_master")
  .where(function () {
    // Accept both ID and NAME for flexibility
    this.where("doc_name_master_id", doc.documentType) // Check if it's an ID
      .orWhere("document_name", doc.documentType); // Check if it's a NAME
  })
  .first();

if (docTypeInfo) {
  // CRITICAL: Store the resolved ID for later use
  doc.documentTypeId = docTypeInfo.doc_name_master_id; // ← KEY LINE

  // Now validate the document number format
  const validation = validateDocumentNumber(
    doc.documentNumber,
    docTypeInfo.document_name
  );

  if (!validation.isValid) {
    return res.status(400).json({ error: { message: validation.message } });
  }
} else {
  return res.status(400).json({
    error: { message: `Invalid document type: ${doc.documentType}` },
  });
}

// Step 2: During INSERT phase - Use the resolved ID
await trx("transporter_documents").insert({
  document_type_id: doc.documentTypeId || doc.documentType, // ← Use resolved ID first
  document_number: doc.documentNumber,
  // ... other fields
});
```

**Implementation Checklist**:

CREATE Function:

- [x] Validation: Lookup by ID OR NAME
- [x] Validation: Store resolved ID (`doc.documentTypeId = docTypeInfo.doc_name_master_id`)
- [x] INSERT: Use resolved ID (`document_type_id: doc.documentTypeId || doc.documentType`)

UPDATE Function:

- [x] Validation: Lookup by ID OR NAME
- [x] Validation: Store resolved ID (`document.documentTypeId = docTypeInfo.doc_name_master_id`)
- [x] INSERT: Use resolved ID (`document_type_id: document.documentTypeId || document.documentType`)

**Applies To (Check All Master Data Relationships)**:

✅ **FIXED**: Document types (`document_name_master` → `transporter_documents.document_type_id`)

⚠️ **CHECK NEEDED**:

- Address types (`address_type_master` → `tms_address.address_type_id`)
- Vehicle types (`vehicle_type_master` → `vehicle_basic_information_hdr.vehicle_type_id`)
- Fuel types (`fuel_type_master` → `vehicle_basic_information_hdr.fuel_type_id`)
- Engine types (`engine_type_master` → `vehicle_basic_information_hdr.engine_type_id`)
- Status codes (`status_master` → various tables)
- User types (`user_type_master` → `user_master.user_type_id`)
- Any master table referenced by ID in transaction tables

**Prevention Guidelines**:

1. **Always Resolve IDs During Validation**: Never skip the ID resolution step
2. **Store Resolved ID**: Add `entity.resolvedId = lookupResult.id_column` after validation
3. **Use Resolved ID in INSERT**: Always use `entity.resolvedId || entity.originalField` pattern

---

### Document Number Validation - Whitespace & Case Sensitivity (CRITICAL)

**Issue**: Valid document numbers (e.g., "ASDF12345N" for TAN) were rejected during create/update operations

**Root Causes**:

1. Validation regex didn't account for leading/trailing whitespace
2. Validation regex expected uppercase but users could enter lowercase
3. Document numbers weren't normalized before database storage

**Examples of Failures**:

- Input: `" ASDF12345N "` (with spaces) → Regex fails because spaces don't match pattern
- Input: `"asdf12345n"` (lowercase) → Regex fails because pattern expects uppercase `[A-Z]`
- Input: `" asdf12345n "` (both issues) → Fails for both reasons

**Solution Pattern (APPLIED TO ALL VALIDATIONS)**:

```javascript
// In documentValidation.js - validateDocumentNumber function
const validateDocumentNumber = (documentNumber, documentType) => {
  if (!documentNumber || !documentType) {
    return { isValid: false, message: "Document number and type are required" };
  }

  // CRITICAL: Trim whitespace and convert to uppercase BEFORE validation
  const cleanedNumber = documentNumber.trim().toUpperCase();

  const pattern = documentValidationPatterns[documentType];

  if (!pattern) {
    // Generic validation for unknown types
    const basicRegex = /^[A-Z0-9\/-]+$/;
    if (!basicRegex.test(cleanedNumber)) {
      return {
        isValid: false,
        message: `${documentType} number should contain only uppercase letters, numbers, hyphens, and forward slashes`,
      };
    }
    return { isValid: true, message: "" };
  }

  // Validate cleaned number against pattern
  if (!pattern.regex.test(cleanedNumber)) {
    return {
      isValid: false,
      message: `${documentType} number is invalid. Expected format: ${pattern.format}`,
      format: pattern.format,
    };
  }

  return { isValid: true, message: "" };
};
```

**In Controllers (CREATE & UPDATE)**:

```javascript
// After validation passes, normalize before storage
if (validation.isValid) {
  // CRITICAL: Store normalized version to ensure consistency
  doc.documentNumber = doc.documentNumber.trim().toUpperCase();
}
```

**Complete Validation Flow**:

1. **User Input**: `" asdf12345n "` (spaces, lowercase)
2. **Validation Step**: Trim + Uppercase → `"ASDF12345N"`
3. **Regex Check**: `/^[A-Z]{4}\d{5}[A-Z]$/` → **PASSES** ✅
4. **Normalization**: Store `"ASDF12345N"` in database
5. **Result**: Consistent, clean data in database

**Implementation Locations**:

✅ **FIXED**:

- `utils/documentValidation.js` - `validateDocumentNumber()` function (line ~65)
- `controllers/transporterController.js` - `createTransporter()` after validation (line ~499)
- `controllers/transporterController.js` - `updateTransporter()` after validation (line ~1264)

**Affected Document Types** (All benefit from this fix):

- **TAN**: 4 letters + 5 digits + 1 letter (e.g., `ASDF12345N`)
- **PAN Card**: 5 letters + 4 digits + 1 letter (e.g., `ABCDE1234F`)
- **GSTIN Document**: 15 characters (e.g., `07ABCDE1234F1Z5`)
- **Aadhar Card**: 12 digits (e.g., `123456789012`)
- **VAT Certificate**: 8-15 alphanumeric (e.g., `VAT12345678`)
- All other validated document types

**Testing Scenarios**:

```javascript
// All these should now PASS validation:
" ASDF12345N "  → Cleaned to "ASDF12345N" → VALID ✅
"asdf12345n"    → Cleaned to "ASDF12345N" → VALID ✅
"  asdf12345n " → Cleaned to "ASDF12345N" → VALID ✅
"AsDf12345N"    → Cleaned to "ASDF12345N" → VALID ✅

// These should still FAIL (incorrect format):
"ASDF1234N"     → Only 9 chars (needs 10) → INVALID ❌
"12345ASDFN"    → Wrong order → INVALID ❌
"ASDF12345"     → Missing last letter → INVALID ❌
```

**Prevention Guidelines**:

1. **Always Trim Input**: Use `.trim()` before any validation
2. **Normalize Case**: Use `.toUpperCase()` for alphanumeric patterns
3. **Clean Before Storage**: Apply same cleaning after validation passes
4. **Test Edge Cases**: Always test with whitespace and mixed case

**Key Lesson**: User input is unpredictable - always normalize before validation and storage! 3. **Use Resolved ID in Database Operations**: Always use `fk_column: entity.resolvedId || entity.originalValue` 4. **Never Assume Field Contains ID**: Just because validation passed doesn't mean field has ID 5. **Check Other Master Data**: Apply this pattern to ALL master data lookups, not just documents

**Code Template for Future Reference**:

```javascript
// Generic pattern for any master data validation
const masterInfo = await trx("master_table_name")
  .where(function () {
    this.where("id_column", entity.value) // Try as ID
      .orWhere("name_column", entity.value); // Try as NAME
  })
  .first();

if (masterInfo) {
  // Store resolved ID
  entity.resolvedId = masterInfo.id_column;

  // Perform additional validation
  // ...
} else {
  return error(`Invalid ${entityType}: ${entity.value}`);
}

// Later during INSERT/UPDATE
await trx("transaction_table").insert({
  fk_column: entity.resolvedId || entity.value, // Use resolved ID
});
```

**Debugging Tips**:

- If validation passes but INSERT fails with foreign key error → Check if using NAME instead of ID
- Check GET endpoint response → See if field contains ID or NAME
- Check validation logic → Verify it stores resolved ID
- Check INSERT logic → Verify it uses resolved ID, not original value
- Test with actual data → Mock data might hide the issue

---

### Frontend Loading/Initialization Issues

**Issue**: Application stuck on "Initializing TMS" loading screen

**Root Cause**: Redux state not properly initialized or auth token issues

**Solution**: Check Redux DevTools, verify token in localStorage, ensure API endpoint is correct

---

### Validation Error Handling

**Issue**: Validation errors causing navigation to "Error Loading Data" page instead of showing inline errors

**Root Cause**: Redux error state set by `updateTransporter.rejected` action before component catch block handles error

**Solution Pattern**:

```javascript
try {
  await dispatch(updateTransporter(payload)).unwrap();
  // Success handling
} catch (err) {
  console.error("Error saving transporter:", err);

  // CRITICAL: Clear Redux error state immediately
  dispatch(clearError());

  // Then handle validation errors
  if (err.code === "VALIDATION_ERROR") {
    // Parse field path: "documents[0].documentNumber"
    // Set inline errors, switch tabs, show toast
  }
}
```

**Key Learning**: Always clear Redux error state at the start of catch block to prevent error page navigation

**Enhanced Pattern for Create/Update**:

```javascript
catch (error) {
  console.error("Error creating transporter:", error);

  // Clear Redux error state
  dispatch(clearError());

  // Check if validation error
  if (error.code === "VALIDATION_ERROR") {
    // Determine tab from field path
    const field = error.field || "";
    let tabName = "Unknown";
    let tabIndex = 0;

    if (field.includes("addresses") || field.includes("vatNumber")) {
      tabName = "Address & Contacts";
      tabIndex = 1;
    }
    // ... other tab mappings

    // Switch to error tab
    setActiveTab(tabIndex);

    // Set tab error indicators
    setTabErrors({
      0: tabIndex === 0,
      1: tabIndex === 1,
      2: tabIndex === 2,
      3: tabIndex === 3,
    });

    // Show toast with tab name
    dispatch(addToast({
      type: TOAST_TYPES.ERROR,
      message: `Error in ${tabName} tab: ${error.message}`,
      duration: 8000,
    }));
  }
}
```

**Error Display Pattern**:

- ❌ **DON'T**: Show large error boxes that take up space
- ✅ **DO**: Show errors in toast notifications
- ✅ **DO**: Show red error indicator on tabs with errors
- ✅ **DO**: Include tab name in error message (e.g., "Error in Address & Contacts tab")
- ✅ **DO**: Auto-switch to the tab with the error
- ✅ **DO**: Keep inline field-level errors within tabs

---

### Duplicate Key Errors on CREATE Operations (CRITICAL PATTERN)

**Issue**: `Duplicate entry 'ADDR0083' for key 'tms_address.tms_address_address_id_unique'` error when creating new records

**Root Cause**: Multi-step problem:

1. Validation happens DURING database operations (inside transaction)
2. If validation fails midway, some records are already inserted
3. Next attempt tries to use same IDs (based on count) → duplicate key error
4. ID generation doesn't check if ID already exists

**Solution**: Validate EVERYTHING before starting transaction + Use collision-resistant ID generation

```javascript
// Collision-resistant ID generation
const generateAddressId = async (trx = knex) => {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const result = await trx("tms_address").count("* as count").first();
    const count = parseInt(result.count) + 1 + attempts;
    const newId = `ADDR${count.toString().padStart(4, "0")}`;

    // CRITICAL: Check if this ID already exists
    const existing = await trx("tms_address")
      .where("address_id", newId)
      .first();
    if (!existing) {
      return newId; // Found unique ID
    }
    attempts++;
  }

  throw new Error("Failed to generate unique address ID after 100 attempts");
};

// CREATE function pattern
const createEntity = async (req, res) => {
  try {
    // PHASE 1: Validate EVERYTHING (no transaction)
    // - Check required fields
    // - Check duplicates using knex (not trx)
    // - Validate formats

    // PHASE 2: Start transaction ONLY after all validations pass
    const trx = await knex.transaction();
    try {
      // Generate collision-resistant IDs
      // Insert data
      await trx.commit();
    } catch (transactionError) {
      await trx.rollback();
      throw transactionError;
    }
  } catch (error) {
    // Handle error
  }
};
```

**Prevention**: Always validate first, then transact. Use ID collision detection.

---

### ISO Code Display Issues

**Issue**: Country/state codes (IN, AS) showing instead of readable names (India, Assam)

**Root Cause**: Backend returning raw ISO codes from database

**Solution**: Convert ISO codes to names in backend response using `country-state-city` package

```javascript
const { Country, State } = require("country-state-city");

// Convert country ISO to name
const countryName = Country.getAllCountries().find(
  (c) => c.isoCode === "IN"
)?.name;

// Convert state ISO to name
const stateName = State.getStatesOfCountry("IN").find(
  (s) => s.isoCode === "AS"
)?.name;
```

**Implementation**: Keep ISO codes in database (normalized), convert to names only in API responses

---

### Filter Parameter Mapping

**Issue**: Filters not working (e.g., VAT/GST filter searching state names instead of VAT numbers)

**Root Cause**: Frontend query parameter name doesn't match backend filter logic

**Solution**: Ensure frontend and backend use consistent parameter names

```javascript
// Frontend: Send correct parameter
if (appliedFilters.vatGst) {
  params.vatGst = appliedFilters.vatGst; // ✅ Correct
  // NOT: params.state = appliedFilters.vatGst; // ❌ Wrong
}

// Backend: Use correct column
if (vatGst) {
  query.where("addr.vat_number", "like", `%${vatGst}%`); // ✅ Correct
}
```

---

### Clickable Row Navigation

**Issue**: Entire table row clickable, causing accidental navigation when selecting text

**Solution**: Only make specific elements (like ID) clickable

```javascript
// ❌ Wrong: Entire row clickable
<TableRow onClick={() => navigate(`/details/${id}`)}>

// ✅ Correct: Only ID clickable
<TableRow>
  <TableCell>
    <span
      onClick={() => navigate(`/details/${id}`)}
      className="cursor-pointer hover:underline"
    >
      {transporterId}
    </span>
  </TableCell>
</TableRow>
```

---

### Field Path Parsing for Validation Errors

**Issue**: Backend returns error field like `"documents[0].documentNumber"`, need to show error on correct tab and field

**Solution Pattern**:

```javascript
// Parse field path
const parseFieldPath = (field) => {
  const arrayMatch = field.match(/^([a-zA-Z]+)\[(\d+)\]\.([a-zA-Z]+)$/);
  if (arrayMatch) {
    return {
      section: arrayMatch[1], // "documents"
      index: parseInt(arrayMatch[2]), // 0
      field: arrayMatch[3], // "documentNumber"
    };
  }
  return { section: field, index: null, field: null };
};

// Use parsed data to set inline errors and switch tabs
const tabMapping = {
  generalDetails: 0,
  addresses: 1,
  serviceableAreas: 2,
  documents: 3,
};

setActiveTab(tabMapping[parsed.section]);
```

---

### Redux Async Thunk Error Handling

**Pattern**: Use `.unwrap()` to catch errors from async thunks

```javascript
// Redux slice
export const updateTransporter = createAsyncThunk(
  'transporter/update',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.put(`/transporter/${data.id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error);
    }
  }
);

// In reducer
.addCase(updateTransporter.rejected, (state, action) => {
  state.error = action.payload;
  state.isUpdating = false;
});

// In component
try {
  await dispatch(updateTransporter(data)).unwrap();
  // Success
} catch (err) {
  dispatch(clearError()); // Clear Redux error first!
  // Handle error
}
```

---

**Root Cause**: Authentication initialization not properly completing or timing out  
**Solutions**:

1. **Initial Loading State**: Always set `isLoading: false` in Redux initial state. Let AuthInitializer manage the loading state explicitly
2. **Promise Handling**: Use `.then()/.catch()` instead of `.finally()` to ensure `setAuthInitialized()` is called in BOTH success and error cases
3. **Backup Timers**: Always implement fallback timers (5-10 seconds) to force initialization completion
4. **Cookie Detection**: Check for auth cookie existence BEFORE attempting token verification
5. **Explicit State Updates**: Always dispatch `setAuthInitialized()` to set `isLoading: false` after verification attempts

**Prevention Checklist**:

- [ ] AuthInitializer has backup timer (10 seconds max)
- [ ] Token verification has timeout protection (5 seconds)
- [ ] Both success and error paths call `setAuthInitialized()`
- [ ] Initial Redux state has `isLoading: false`
- [ ] No cookie check skips verification and immediately initializes

### Dropdown Data Loading Issues

**Issue**: Dropdowns not showing any options (empty dropdown list)  
**Root Cause**: Mismatch between data format in Redux store and component expectations  
**Solutions**:

1. **Enforce Standard Format**: All master data dropdowns MUST use `{value, label}` format
2. **Backend Consistency**: Use SQL aliases in queries: `.select('id_column as value', 'name_column as label')`
3. **Redux Mock Data**: Match backend format exactly in mock data and fallback data
4. **Component Usage**: Always specify `getOptionLabel={(option) => option.label}` and `getOptionValue={(option) => option.value}`
5. **Validation**: Check network tab to verify API response format matches expectations

**Common Scenarios**:

- Document type dropdown empty → Check documentNames format in Redux
- Address type dropdown empty → Check addressTypes format in Redux
- Custom dropdown empty → Verify options array format and CustomSelect props

**Prevention Checklist**:

- [ ] Backend API uses SQL aliases for consistent naming (`as value`, `as label`)
- [ ] Redux initial state mock data uses `{value, label}` format
- [ ] Redux rejected case fallback uses `{value, label}` format
- [ ] Component uses `getOptionLabel={(option) => option.label}`
- [ ] Component uses `getOptionValue={(option) => option.value}`
- [ ] Test dropdown with actual data from Redux DevTools

### Database Column Name Mismatches

**Issue**: SQL errors with "Unknown column" messages (e.g., `ER_BAD_FIELD_ERROR`)  
**Root Cause**: Migration files don't match actual database schema or developer assumes column names  
**Solutions**:

1. **Always Query Actual Schema**: Use this command to check actual column names:
   ```bash
   node -e "const knex = require('knex')(require('./knexfile').development); knex('TABLE_NAME').columnInfo().then(cols => { console.log(JSON.stringify(cols, null, 2)); process.exit(); });"
   ```
2. **Use SQL Aliases**: When column names differ from expected, use `as` aliases:
   ```javascript
   .select('actual_column_name as expected_name')
   ```
3. **Check Migration Files**: Always review migration files BEFORE writing queries
4. **Document Schema**: Keep DATABASE_SCHEMA.md updated with actual table structures

**Common Column Name Patterns**:

- Migration uses `service_country` but query tries `country`
- Migration uses `service_state` but query tries `state`
- Migration uses `document_type_id` but query tries `document_type`

**Prevention Checklist**:

- [ ] Check migration file for exact column names
- [ ] Query actual database schema with columnInfo() before writing queries
- [ ] Use SQL aliases to match frontend expectations
- [ ] Test queries with actual data before deploying

### Authentication State Management

**Issue**: User logged out on page reload despite valid JWT token  
**Root Cause**: Cookie-based JWT not properly verified on app initialization  
**Solutions**:

1. **Session Cookies**: Remove `maxAge` from cookie options to create session cookies
2. **Token Verification**: Call `verifyToken` on app load if auth cookie exists
3. **Proper State Restoration**: Set `isAuthenticated: true` after successful verification
4. **Error Handling**: If verification fails, clear state but don't block UI

**Prevention Checklist**:

- [ ] AuthInitializer checks for cookie on mount
- [ ] verifyToken async thunk properly restores user state
- [ ] Failed verification doesn't prevent app from loading
- [ ] Session cookies expire when browser closes (no maxAge)

### Type Coercion Errors in React Components

**Issue**: `TypeError: X.toFixed is not a function` or similar method-not-available errors  
**Root Cause**: MySQL decimal/numeric fields returned as strings from database driver, causing type mismatches in frontend  
**Solutions**:

1. **Defensive Type Checking**: Always validate and convert data types before using type-specific methods:
   ```javascript
   const numericValue =
     typeof value === "number" ? value : parseFloat(value) || 0;
   ```
2. **Graceful Fallbacks**: Provide default values when conversion fails:
   ```javascript
   const safeRating = parseFloat(rating) || 0;
   ```
3. **Value Clamping**: Clamp values to expected ranges to prevent display issues:
   ```javascript
   const clampedValue = Math.max(min, Math.min(max, numericValue));
   ```
4. **Backend Type Casting**: Consider explicitly converting decimal fields to numbers in backend responses:
   ```javascript
   avgRating: parseFloat(transporter.avg_rating) || 0;
   ```

**Common Type Coercion Patterns**:

- MySQL `decimal()` fields may return as strings depending on driver
- JSON parsing can convert numbers to strings in certain cases
- Form inputs always return strings and need conversion
- API responses may have inconsistent type formatting

**Prevention Checklist**:

- [ ] Check data type before calling type-specific methods (`.toFixed()`, `.toString()`, etc.)
- [ ] Use `parseFloat()` or `Number()` for numeric conversions with fallbacks
- [ ] Implement value clamping for bounded numeric inputs (ratings, percentages)
- [ ] Test with actual database data, not mock data
- [ ] Handle null, undefined, and empty string cases explicitly

### React.cloneElement Errors with Null Values

**Issue**: `Error: The argument must be a React element, but you passed null`  
**Root Cause**: Using `React.cloneElement()` on a value that can be `null` or `undefined`  
**Solutions**:

1. **Conditional Rendering**: Check if element exists before cloning:
   ```javascript
   const icon = getIcon();
   return <div>{icon && React.cloneElement(icon, { className: "..." })}</div>;
   ```
2. **Direct Rendering**: If the element already has the needed props, render directly:
   ```javascript
   const icon = getIcon(); // Already includes className
   return <div>{icon}</div>; // No need for cloneElement
   ```
3. **Null Checks in Helper Functions**: Ensure helper functions return valid React elements or null consistently:
   ```javascript
   const getIcon = (status) => {
     switch (status) {
       case "active":
         return <CheckIcon />;
       default:
         return null; // Explicit null return
     }
   };
   ```
4. **Fallback Elements**: Provide default element instead of null:
   ```javascript
   const icon = getIcon(status) || <DefaultIcon />;
   ```

**Common Patterns**:

- Status pill components with conditional icons
- Dynamic icon rendering based on state/props
- Helper functions that return JSX conditionally
- Icon libraries that may return null for unknown names

**Prevention Checklist**:

- [ ] Never pass potentially null values to `React.cloneElement()`
- [ ] Use conditional rendering (`{icon && ...}`) before cloning
- [ ] Consider if `React.cloneElement()` is necessary (often it's not)
- [ ] Test all possible values that helper functions can receive
- [ ] Handle default/unknown cases explicitly in switch statements

---

## Centralized Error Handling & Toast Notifications

### Error Message Architecture

**Frontend Error Messages**: Located in `frontend/src/utils/constants.js`

```javascript
export const ERROR_MESSAGES = {
  // Organized by feature/section for easy maintenance
  BUSINESS_NAME_REQUIRED: "Please enter the business name",
  PHONE_NUMBER_INVALID:
    "Please enter a valid phone number (e.g., +919876543210)",
  // ... more user-friendly messages
};
```

**Backend Error Messages**: Located in `tms-backend/utils/errorMessages.js`

```javascript
module.exports = {
  // Same structure as frontend for consistency
  BUSINESS_NAME_REQUIRED: "Please enter the business name",
  PHONE_NUMBER_INVALID:
    "Please enter a valid phone number (e.g., +919876543210)",
  // ... more user-friendly messages
};
```

**Key Principles**:

1. **User-Friendly Language**: Avoid technical jargon (no "validation failed", use "Please enter...")
2. **Actionable Guidance**: Include examples when format is important (e.g., "+919876543210")
3. **Positive Tone**: Use "Please" and "enter valid" instead of "Invalid" or "Error"
4. **Consistent Messaging**: Frontend and backend use identical message constants
5. **Organized by Feature**: Group related errors together (General Details, Address, Documents, etc.)

### Toast Notification System

**Toast Component**: `frontend/src/components/ui/Toast.jsx`

- Supports success, error, warning, and info types
- Can display summary message with expandable error details
- Auto-dismisses after configured duration (default 5000ms)
- Expandable list for multiple validation errors

**Redux Integration**: `frontend/src/redux/slices/uiSlice.js`

```javascript
dispatch(
  addToast({
    type: TOAST_TYPES.ERROR,
    message: ERROR_MESSAGES.VALIDATION_ERROR,
    details: ["Error 1", "Error 2", "Error 3"], // Array of specific errors
    duration: 8000,
  })
);
```

**Usage Patterns**:

1. **Single Error**: Just message
   ```javascript
   dispatch(
     addToast({
       type: TOAST_TYPES.ERROR,
       message: ERROR_MESSAGES.PHONE_NUMBER_INVALID,
     })
   );
   ```
2. **Multiple Validation Errors**: Message + details array
   ```javascript
   dispatch(
     addToast({
       type: TOAST_TYPES.ERROR,
       message: ERROR_MESSAGES.VALIDATION_ERROR,
       details: uniqueErrorMessages, // Array of errors
       duration: 8000,
     })
   );
   ```
3. **Success Message**: After successful operations
   ```javascript
   dispatch(
     addToast({
       type: TOAST_TYPES.SUCCESS,
       message: "Transporter created successfully!",
     })
   );
   ```

### Tab Error Indicators

**Visual Feedback**: Tabs with validation errors display red pulse indicator

```javascript
const [tabErrors, setTabErrors] = useState({
  0: false, // General Details
  1: false, // Address & Contacts
  2: false, // Serviceable Area
  3: false, // Documents
});
```

**Implementation**:

- Red badge with exclamation icon appears on tabs with errors
- Automatically switches to first tab with errors on validation failure
- Icon color changes to red when tab has errors
- Pulse animation draws attention

### Validation Flow

**Frontend (Priority: UX)**:

1. User submits form
2. Zod schema validates all fields
3. Collect all error messages (limit to 5 for toast)
4. Determine which tabs have errors
5. Switch to first error tab
6. Show toast with summary and expandable details
7. Display inline field errors

**Backend (Priority: Security)**:

1. Express middleware receives request
2. Comprehensive validation before database operations
3. Return structured error response with user-friendly message
4. Include error code, message, and affected field
5. Transaction rollback on any validation failure

**Error Response Format** (Backend):

```javascript
{
  success: false,
  error: {
    code: "VALIDATION_ERROR",
    message: ERROR_MESSAGES.PHONE_NUMBER_INVALID,
    field: "addresses[0].contacts[0].phoneNumber"
  }
}
```

### Best Practices

1. **Always validate on both frontend and backend** - Frontend for UX, Backend for security
2. **Use constants for error messages** - Never hardcode error text
3. **Provide actionable feedback** - Tell users what to fix and how
4. **Group related errors** - Show summary with expandable details
5. **Visual indicators** - Use tab badges, inline errors, and toasts together
6. **Test with Postman** - Ensure backend validation works independently
7. **Consistent language** - Same error messages on frontend and backend

---

## Database Schema Documentation

### Comprehensive Schema Reference

**Location**: `.github/instructions/database-schema.json`

A complete, auto-generated database schema documentation file containing:

- **130 tables** across the entire TMS system
- **2,004+ columns** with detailed metadata
- **54 foreign key relationships** (forward and reverse)
- **638 indexes** for query optimization
- Complete column information (type, length, nullable, defaults)
- Primary key definitions
- Index information (unique, composite, types)
- Migration file references

### Usage Guidelines for AI Agents

**CRITICAL**: Always reference `database-schema.json` BEFORE writing any database queries or making schema assumptions.

1. **Verify Column Names**: Check actual column names in schema file before writing queries

   ```javascript
   // WRONG: Assuming column name
   const query = "SELECT country FROM transporter_service_area_hdr";

   // CORRECT: Verify in schema first
   // Schema shows: service_country (not country)
   const query = "SELECT service_country FROM transporter_service_area_hdr";
   ```

2. **Check Nullable Constraints**: Ensure required fields are validated

   ```javascript
   // Check if field is nullable
   const addressTypeColumn = schema.tables.tms_address.columns.address_type_id;
   // nullable: true - means field is optional
   ```

3. **Verify Foreign Keys**: Understand table relationships before writing joins

   ```javascript
   // tms_address references address_type_master via address_type_id
   const foreignKeys = schema.tables.tms_address.foreignKeys;
   // Shows: referencedTable: "address_type_master", referencedColumn: "address_type_id"
   ```

4. **Use Proper Data Types**: Match query parameters to column types

   ```javascript
   // Check column type before inserting
   const columns = schema.tables.tms_address.columns;
   // address_id: varchar(20) - use string, not number
   ```

5. **Respect Primary Keys**: Never insert duplicate primary key values
   ```javascript
   const primaryKey = schema.tables.tms_address.primaryKey;
   // ["address_unique_id"] - auto-increment, don't specify on insert
   ```

### When to Reference Schema

**ALWAYS check schema file when:**

- Writing new SQL queries or Knex queries
- Creating API endpoints that interact with database
- Debugging "Unknown column" errors
- Planning database modifications
- Understanding table relationships
- Validating form data against database constraints
- Creating migration files
- Documenting API responses

**Example Schema Lookup:**

```javascript
// Before writing a query for tms_address table:
const schema = require("./.github/instructions/database-schema.json");
const addressTable = schema.tables.tms_address;

// Check columns
console.log(Object.keys(addressTable.columns));
// Output: ['address_unique_id', 'address_id', 'user_reference_id', 'address_type_id', ...]

// Check foreign keys
console.log(addressTable.foreignKeys);
// Output: [{column: 'address_type_id', referencedTable: 'address_type_master', ...}]

// Now write query with correct column names
const query = knex("tms_address")
  .select("address_id", "address_type_id", "country", "state")
  .where("user_reference_id", userId);
```

### Regenerating Schema Documentation

**When to Regenerate:**

- After running new migrations
- After modifying table structures
- After adding/removing foreign keys
- Before major refactoring work
- When schema documentation seems outdated

**How to Regenerate:**

```bash
cd tms-backend
npm run generate-schema
```

**Script Location:** `tms-backend/generate-schema-docs.js`

### Common Database Tables Reference

**Master Tables (Reference Data):**

- `address_type_master` - Address type definitions (Office, Billing, Shipping, etc.)
- `document_name_master` - Document types (PAN, Aadhar, License, etc.)
- `vehicle_type_master` - Vehicle classifications
- `status_master` - Status codes across system
- `user_type_master` - User role definitions
- `fuel_type_master` - Fuel type options
- `engine_type_master` - Engine type options

**Core Transaction Tables:**

- `transporter_general_info` - Transporter master data
- `tms_address` - Universal address management
- `transporter_documents` - Document uploads and tracking
- `vehicle_basic_information_hdr` - Vehicle master information
- `user_master` - User accounts and authentication
- `indent_header` - Indent/order management
- `rfq_header` - RFQ workflow

**Mapping Tables:**

- `transporter_consignor_mapping` - Transporter-Consignor relationships
- `vehicle_driver_mapping` - Vehicle-Driver assignments
- `transporter_vehicle_mapping` - Transporter-Vehicle ownership
- `user_role_hdr` - User role assignments

### Key Relationships

**Address Management:**

```
tms_address
  ├─ references: address_type_master (via address_type_id)
  └─ referenced by: user_signup_request, transporters, warehouses
```

**Document Management:**

```
transporter_documents
  ├─ references: document_name_master (via doc_name_master_id)
  └─ stores: file_path, document_number, validity dates
```

**Vehicle Hierarchy:**

```
vehicle_basic_information_hdr
  ├─ references: vehicle_type_master
  ├─ references: fuel_type_master
  ├─ references: engine_type_master
  └─ has items: vehicle_basic_information_itm
```

### Error Prevention

**Common Schema-Related Errors:**

1. **Column Name Mismatch**

   - ❌ Query uses `country` but schema has `service_country`
   - ✅ Always verify exact column name in schema

2. **Missing Foreign Key**

   - ❌ Insert without checking referenced table exists
   - ✅ Verify foreign key constraint in schema before insert

3. **Nullable Violations**

   - ❌ Omit required field because assuming it's optional
   - ✅ Check `nullable: false` in schema for required fields

4. **Data Type Mismatch**

   - ❌ Insert number into varchar field
   - ✅ Check column type and maxLength in schema

5. **Primary Key Conflicts**
   - ❌ Manually specify auto-increment primary key
   - ✅ Check primaryKey array in schema to identify auto-increment columns

---

## Transporter Feature Architecture

### Component Structure

**Pages** (`features/transporter/`):

- `CreateTransporterPage.jsx` - Multi-step form for new transporter creation
- `TransporterDetailsPage.jsx` - View/Edit mode with tab-based interface
- `TransporterMaintenance.jsx` (in `pages/`) - List view with filters and search

**Tab Components** (`features/transporter/components/`):

- `GeneralDetailsTab.jsx` - Edit mode for general info
- `GeneralDetailsViewTab.jsx` - Read-only view for general info
- `AddressContactsTab.jsx` - Edit mode for addresses with nested contacts
- `AddressContactsViewTab.jsx` - Read-only view for addresses
- `ServiceableAreaTab.jsx` - Edit mode for serviceable countries/states
- `ServiceableAreaViewTab.jsx` - Read-only view for serviceable areas
- `DocumentsTab.jsx` - Edit mode for document management
- `DocumentsViewTab.jsx` - Read-only view for documents

**List Components** (`components/transporter/`):

- `TransporterListTable.jsx` - Desktop table and mobile card views
- `TransporterFilterPanel.jsx` - Advanced filtering UI
- `SearchBar.jsx` - Global search across fields
- `TopActionBar.jsx` - Actions (Create, Export, Clear)
- `PaginationBar.jsx` - Page navigation controls
- `StatusPill.jsx` - Status indicator component

### State Management Pattern

**Redux Slice** (`transporterSlice.js`):

```javascript
{
  transporters: [],           // List of all transporters
  selectedTransporter: null,  // Currently viewing/editing
  masterData: {              // Dropdowns data
    documentTypes: [],
    addressTypes: [],
    countries: []            // Not used - use country-state-city instead
  },
  filters: {},               // Applied filters
  pagination: {},            // Page info
  error: null,               // Error state (triggers error page if not null)
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isFetchingDetails: false
}
```

**Key Actions**:

- `fetchTransporters` - List with pagination
- `fetchTransporterById` - Get single transporter details
- `createTransporter` - Create new transporter
- `updateTransporter` - Update existing transporter
- `fetchMasterData` - Load dropdown options
- `clearError()` - Clear error state to prevent error page

### Edit Mode Pattern

**View/Edit Toggle**:

```javascript
const [isEditMode, setIsEditMode] = useState(false);
const [editFormData, setEditFormData] = useState(null);

// Initialize edit data from selected transporter
useEffect(() => {
  if (selectedTransporter && !editFormData) {
    setEditFormData(selectedTransporter);
  }
}, [selectedTransporter, editFormData]);

// Track unsaved changes
useEffect(() => {
  if (isEditMode && editFormData) {
    const hasChanges =
      JSON.stringify(editFormData) !== JSON.stringify(selectedTransporter);
    setHasUnsavedChanges(hasChanges);
  }
}, [editFormData, selectedTransporter, isEditMode]);
```

### Validation Pattern

**Client-Side Validation**:

```javascript
const validateAllSections = (formData) => {
  const errors = {};

  // Validate business name
  if (!formData.generalDetails.businessName?.trim()) {
    errors.businessName = "Business name is required";
  }

  // Validate addresses
  formData.addresses.forEach((addr, idx) => {
    if (!addr.vatNumber) {
      errors[`addresses[${idx}].vatNumber`] = "VAT number required";
    }
  });

  return errors;
};
```

**Server-Side Error Handling**:

```javascript
try {
  await dispatch(updateTransporter(data)).unwrap();
  // Success flow
} catch (err) {
  // CRITICAL: Clear Redux error first
  dispatch(clearError());

  // Handle validation error
  if (err.code === "VALIDATION_ERROR") {
    const parsed = parseFieldPath(err.field);

    // Set inline errors
    setValidationErrors({
      [parsed.section]: {
        [parsed.index]: {
          [parsed.field]: err.message,
        },
      },
    });

    // Switch to error tab
    setActiveTab(tabMapping[parsed.section]);

    // Show toast
    dispatch(
      addToast({
        type: "error",
        message: err.message,
      })
    );
  }
}
```

### Tab Error Indicators

**Visual Feedback**:

```javascript
const [tabErrors, setTabErrors] = useState({
  0: false, // General Details
  1: false, // Addresses
  2: false, // Serviceable Areas
  3: false, // Documents
});

// Update tab errors when validation errors change
useEffect(() => {
  setTabErrors({
    0: !!validationErrors.generalDetails,
    1: !!validationErrors.addresses,
    2: !!validationErrors.serviceableAreas,
    3: !!validationErrors.documents,
  });
}, [validationErrors]);

// Render tab with error indicator
<TabButton active={activeTab === 0}>
  General Details
  {tabErrors[0] && <ErrorDot />}
</TabButton>;
```

### List View Patterns

**Filtering**:

```javascript
// Frontend sends all filters
const params = {
  page,
  limit,
  search,
  status: appliedFilters.status,
  country: appliedFilters.country,
  state: appliedFilters.state,
  vatGst: appliedFilters.vatGst, // Must match backend parameter name
  transMode: appliedFilters.transMode,
};

// Backend applies filters
if (vatGst) {
  query.where("addr.vat_number", "like", `%${vatGst}%`);
}
```

**Clickable Elements**:

```javascript
// Only make specific elements clickable
<TableRow>
  {" "}
  {/* No onClick here */}
  <TableCell>
    <span
      onClick={() => navigate(`/transporter/${id}`)}
      className="cursor-pointer hover:underline text-blue-600"
    >
      {transporterId}
    </span>
  </TableCell>
  <TableCell>{businessName}</TableCell> {/* Not clickable */}
</TableRow>
```

### Data Transformation

**ISO Code Conversion** (Backend):

```javascript
// In getTransporterById response
serviceableAreas: areas.map((area) => ({
  country:
    Country.getAllCountries().find((c) => c.isoCode === area.country)?.name ||
    area.country,
  states: area.states.map(
    (stateIsoCode) =>
      State.getStatesOfCountry(area.country).find(
        (s) => s.isoCode === stateIsoCode
      )?.name || stateIsoCode
  ),
}));
```

**Master Data Format**:

```javascript
// Always use {value, label} format
{
  documentTypes: [
    { value: "DN001", label: "PAN/TIN" },
    { value: "DN002", label: "VAT Registration" },
  ];
}
```
