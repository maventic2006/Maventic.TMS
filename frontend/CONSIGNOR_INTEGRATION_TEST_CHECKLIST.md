# Consignor Integration - Testing Checklist

## Quick Start
**Backend:** `http://localhost:5000` ✅ RUNNING  
**Frontend:** `http://localhost:5173` ✅ RUNNING

---

## Test Suite 1: List Page (`/consignor/maintenance`)

### Basic Loading
- [ ] **T1.1:** Page loads without errors
- [ ] **T1.2:** Table displays header row correctly
- [ ] **T1.3:** "Create New Consignor" button visible
- [ ] **T1.4:** Filter panel toggle works
- [ ] **T1.5:** Pagination controls visible (if data exists)

### Data Display
- [ ] **T1.6:** Customer ID clickable and blue
- [ ] **T1.7:** Customer Name displays correctly
- [ ] **T1.8:** Industry Type shows readable label
- [ ] **T1.9:** Status pill shows correct color (green=ACTIVE, red=INACTIVE, yellow=PENDING)
- [ ] **T1.10:** Created/Updated dates formatted properly

### Filters
- [ ] **T1.11:** Status filter dropdown works
- [ ] **T1.12:** Industry Type filter works (if populated)
- [ ] **T1.13:** Search by Customer ID filters results
- [ ] **T1.14:** Search by Customer Name filters results
- [ ] **T1.15:** Clear filters button resets all filters

### Pagination
- [ ] **T1.16:** Next page button works
- [ ] **T1.17:** Previous page button works
- [ ] **T1.18:** Page number displays correctly
- [ ] **T1.19:** Total count shows correct number
- [ ] **T1.20:** Items per page: 25

### Navigation
- [ ] **T1.21:** Click Customer ID → navigates to details page
- [ ] **T1.22:** Click "Create New" → navigates to create page
- [ ] **T1.23:** Click "Back to Portal" → returns to TMS portal

---

## Test Suite 2: Create Page (`/consignor/create`)

### Page Load
- [ ] **T2.1:** Page loads without errors
- [ ] **T2.2:** All 4 tabs visible (General, Contact, Organization, Documents)
- [ ] **T2.3:** General Information tab selected by default
- [ ] **T2.4:** Submit and Clear buttons visible

### Master Data Dropdowns
- [ ] **T2.5:** Industry Type dropdown populated (15 options)
- [ ] **T2.6:** Currency Type dropdown populated (12 options)
- [ ] **T2.7:** Payment Term dropdown populated (8 options)
- [ ] **T2.8:** Document Type dropdown populated (35 options)

### General Information Tab
- [ ] **T2.9:** Customer Name field accepts input
- [ ] **T2.10:** Search Term field accepts input
- [ ] **T2.11:** Industry Type dropdown selectable
- [ ] **T2.12:** Currency Type dropdown selectable
- [ ] **T2.13:** Payment Term dropdown selectable
- [ ] **T2.14:** Website URL field accepts valid URL
- [ ] **T2.15:** Remark textarea accepts input
- [ ] **T2.16:** Status defaults to "ACTIVE"

### Contact Information Tab
- [ ] **T2.17:** "Add Contact" button works
- [ ] **T2.18:** Contact form shows all fields
- [ ] **T2.19:** Contact Designation accepts input
- [ ] **T2.20:** Contact Name accepts input
- [ ] **T2.21:** Contact Number accepts 10 digits
- [ ] **T2.22:** Country Code dropdown works
- [ ] **T2.23:** Email validates format
- [ ] **T2.24:** Can add multiple contacts
- [ ] **T2.25:** Can remove contact

### Organization Details Tab
- [ ] **T2.26:** Company Code field accepts input
- [ ] **T2.27:** Business Area accepts comma-separated or array
- [ ] **T2.28:** Status defaultsto "ACTIVE"

### Documents Tab
- [ ] **T2.29:** "Add Document" button works
- [ ] **T2.30:** Document Type dropdown works
- [ ] **T2.31:** Document Number field accepts input
- [ ] **T2.32:** Valid From date picker works
- [ ] **T2.33:** Valid To date picker works
- [ ] **T2.34:** File upload button works
- [ ] **T2.35:** Can select PDF file
- [ ] **T2.36:** Can select DOC/DOCX file
- [ ] **T2.37:** Can select XLS/XLSX file
- [ ] **T2.38:** Can select PNG/JPG file
- [ ] **T2.39:** File size validation (max 10MB)
- [ ] **T2.40:** File type validation (correct types only)

### Form Validation
- [ ] **T2.41:** Required fields show error if empty
- [ ] **T2.42:** Email format validated
- [ ] **T2.43:** Phone number format validated
- [ ] **T2.44:** URL format validated
- [ ] **T2.45:** Date range validated (valid_from < valid_to)
- [ ] **T2.46:** Validation errors show in red
- [ ] **T2.47:** Tab indicator shows error (red dot)

### Form Submission
- [ ] **T2.48:** Submit button disabled if validation fails
- [ ] **T2.49:** Submit button shows loading state
- [ ] **T2.50:** Success: Redirects to details page
- [ ] **T2.51:** Success: Shows success toast message
- [ ] **T2.52:** Error: Shows error message
- [ ] **T2.53:** Error: Stays on form with errors highlighted

### Clear Form
- [ ] **T2.54:** Clear button shows confirmation dialog
- [ ] **T2.55:** Confirm clear resets all fields
- [ ] **T2.56:** Cancel clear keeps form data

---

## Test Suite 3: Details Page (`/consignor/:id`)

### Page Load
- [ ] **T3.1:** Page loads without errors
- [ ] **T3.2:** Customer ID displays in header
- [ ] **T3.3:** Customer Name displays in header
- [ ] **T3.4:** Status pill shows correct color
- [ ] **T3.5:** All 4 tabs visible
- [ ] **T3.6:** Edit button visible
- [ ] **T3.7:** Delete button visible (if implemented)

### View Mode - General Tab
- [ ] **T3.8:** All general information displayed
- [ ] **T3.9:** Fields are read-only (not editable)
- [ ] **T3.10:** Industry Type shows readable label
- [ ] **T3.11:** Currency Type shows readable label
- [ ] **T3.12:** Payment Term shows readable label
- [ ] **T3.13:** Website URL is clickable link
- [ ] **T3.14:** Dates formatted properly

### View Mode - Contact Tab
- [ ] **T3.15:** All contacts displayed
- [ ] **T3.16:** Contact cards show all fields
- [ ] **T3.17:** Email is clickable (mailto:)
- [ ] **T3.18:** Phone number formatted correctly
- [ ] **T3.19:** LinkedIn link works (if provided)

### View Mode - Organization Tab
- [ ] **T3.20:** Company Code displayed
- [ ] **T3.21:** Business Area displayed
- [ ] **T3.22:** Fields are read-only

### View Mode - Documents Tab
- [ ] **T3.23:** All documents displayed
- [ ] **T3.24:** Document Type shows label
- [ ] **T3.25:** Document Number displayed
- [ ] **T3.26:** Valid From/To dates displayed
- [ ] **T3.27:** File download link works (if file exists)
- [ ] **T3.28:** Document expiry indicator shows (red=expired, yellow=expiring soon)

### Edit Mode Toggle
- [ ] **T3.29:** Click Edit button enters edit mode
- [ ] **T3.30:** Edit button changes to "Cancel Edit"
- [ ] **T3.31:** Save Changes button appears
- [ ] **T3.32:** All fields become editable

### Edit Mode - General Tab
- [ ] **T3.33:** Can modify Customer Name
- [ ] **T3.34:** Can modify Search Term
- [ ] **T3.35:** Can change Industry Type
- [ ] **T3.36:** Can change Currency Type
- [ ] **T3.37:** Can change Payment Term
- [ ] **T3.38:** Can modify Website URL
- [ ] **T3.39:** Can modify Remark
- [ ] **T3.40:** Can change Status

### Edit Mode - Contact Tab
- [ ] **T3.41:** Can edit existing contacts
- [ ] **T3.42:** Can add new contacts
- [ ] **T3.43:** Can remove contacts
- [ ] **T3.44:** Changes tracked properly

### Edit Mode - Organization Tab
- [ ] **T3.45:** Can edit Company Code
- [ ] **T3.46:** Can edit Business Area
- [ ] **T3.47:** Changes tracked properly

### Edit Mode - Documents Tab
- [ ] **T3.48:** Can add new documents
- [ ] **T3.49:** Can upload new files
- [ ] **T3.50:** Can modify document metadata
- [ ] **T3.51:** Existing documents remain intact

### Save Changes
- [ ] **T3.52:** Save button validates all fields
- [ ] **T3.53:** Save button shows loading state
- [ ] **T3.54:** Success: Shows success toast
- [ ] **T3.55:** Success: Exits edit mode
- [ ] **T3.56:** Success: Displays updated data
- [ ] **T3.57:** Error: Shows error message
- [ ] **T3.58:** Error: Remains in edit mode

### Cancel Edit
- [ ] **T3.59:** Cancel button shows confirmation (if unsaved changes)
- [ ] **T3.60:** Confirm cancel reverts all changes
- [ ] **T3.61:** Cancel cancel keeps editing

---

## Test Suite 4: File Uploads

### Valid File Types
- [ ] **T4.1:** PDF upload succeeds
- [ ] **T4.2:** DOC upload succeeds
- [ ] **T4.3:** DOCX upload succeeds
- [ ] **T4.4:** XLS upload succeeds
- [ ] **T4.5:** XLSX upload succeeds
- [ ] **T4.6:** PNG upload succeeds
- [ ] **T4.7:** JPG/JPEG upload succeeds

### Invalid File Types
- [ ] **T4.8:** TXT file rejected with error
- [ ] **T4.9:** ZIP file rejected with error
- [ ] **T4.10:** EXE file rejected with error
- [ ] **T4.11:** Video files rejected with error

### File Size Validation
- [ ] **T4.12:** File < 10MB uploads successfully
- [ ] **T4.13:** File = 10MB uploads successfully
- [ ] **T4.14:** File > 10MB rejected with error

### Upload Progress
- [ ] **T4.15:** Progress bar shows during upload
- [ ] **T4.16:** Upload completes successfully
- [ ] **T4.17:** File name displays after upload
- [ ] **T4.18:** Can remove uploaded file before submit

---

## Test Suite 5: Error Handling

### Network Errors
- [ ] **T5.1:** Backend offline → shows error message
- [ ] **T5.2:** Timeout → shows timeout error
- [ ] **T5.3:** 500 error → shows server error message
- [ ] **T5.4:** 404 error → shows not found message

### Validation Errors
- [ ] **T5.5:** Empty required field → shows "required" error
- [ ] **T5.6:** Invalid email → shows email format error
- [ ] **T5.7:** Invalid URL → shows URL format error
- [ ] **T5.8:** Duplicate customer ID → shows duplicate error
- [ ] **T5.9:** Date range invalid → shows date error

### Authentication Errors
- [ ] **T5.10:** Expired token → redirects to login
- [ ] **T5.11:** Invalid token → shows auth error
- [ ] **T5.12:** Insufficient permissions → shows access denied

### Backend Errors
- [ ] **T5.13:** Validation error from backend → shows field errors
- [ ] **T5.14:** Database error → shows user-friendly message
- [ ] **T5.15:** Duplicate key error → shows duplicate message
- [ ] **T5.16:** Foreign key error → shows relationship error

---

## Test Suite 6: Edge Cases

### Empty States
- [ ] **T6.1:** Empty list shows "No consignors found" message
- [ ] **T6.2:** Empty contacts shows "No contacts" message
- [ ] **T6.3:** Empty documents shows "No documents" message

### Long Content
- [ ] **T6.4:** Long customer name displays correctly (no overflow)
- [ ] **T6.5:** Long remark text wraps properly
- [ ] **T6.6:** Long business area displays correctly

### Special Characters
- [ ] **T6.7:** Customer name with special chars saves correctly
- [ ] **T6.8:** Search with special chars works
- [ ] **T6.9:** URL with query params saves correctly

### Concurrent Operations
- [ ] **T6.10:** Multiple tabs open → data stays in sync
- [ ] **T6.11:** Quick successive saves handled properly
- [ ] **T6.12:** Browser back button works correctly

### Browser Compatibility
- [ ] **T6.13:** Chrome → all features work
- [ ] **T6.14:** Firefox → all features work
- [ ] **T6.15:** Edge → all features work
- [ ] **T6.16:** Safari → all features work (Mac only)

---

## Test Suite 7: Performance

### Loading Times
- [ ] **T7.1:** List page loads < 1 second
- [ ] **T7.2:** Details page loads < 1 second
- [ ] **T7.3:** Master data loads < 500ms
- [ ] **T7.4:** Create form submits < 2 seconds
- [ ] **T7.5:** File upload (5MB) < 5 seconds

### Memory Usage
- [ ] **T7.6:** No memory leaks after 100 operations
- [ ] **T7.7:** Page remains responsive after multiple navigation
- [ ] **T7.8:** No console warnings or errors

---

## Browser Console Checks

### During All Tests, Verify:
- [ ] **C1:** No JavaScript errors in console (red messages)
- [ ] **C2:** No 404 errors in Network tab
- [ ] **C3:** No CORS errors
- [ ] **C4:** API calls use correct base URL (`http://localhost:5000/api`)
- [ ] **C5:** Authorization header present in all requests
- [ ] **C6:** Request payloads formatted correctly
- [ ] **C7:** Response status codes correct (200, 201, 400, 404, etc.)
- [ ] **C8:** Response bodies have `success: true/false`
- [ ] **C9:** Redux state updates properly (use Redux DevTools)
- [ ] **C10:** No infinite render loops

---

## Regression Testing

### After Each Code Change, Re-test:
- [ ] **R1:** List page still loads
- [ ] **R2:** Create still works
- [ ] **R3:** Details page still displays
- [ ] **R4:** Edit still saves
- [ ] **R5:** Filters still work
- [ ] **R6:** File upload still works

---

## Sign-Off Checklist

### Before Production Deployment:
- [ ] All Test Suites 1-7 completed
- [ ] No console errors
- [ ] All network requests successful
- [ ] Performance benchmarks met
- [ ] Cross-browser tested
- [ ] Mobile responsiveness checked (if applicable)
- [ ] Documentation updated
- [ ] Known issues documented

---

## Test Results Summary

**Date:** _______________  
**Tester:** _______________  
**Browser:** _______________  
**OS:** _______________

**Tests Passed:** _____ / _____  
**Tests Failed:** _____  
**Tests Skipped:** _____

**Critical Issues Found:** _____  
**Minor Issues Found:** _____

**Overall Status:** ⬜ PASS | ⬜ FAIL | ⬜ NEEDS REVIEW

---

**Notes:**
_Add any additional observations, bugs found, or suggestions here_

---

**Next Steps:**
1. Fix any critical issues
2. Re-test failed cases
3. Update documentation if needed
4. Deploy to staging environment
5. Perform UAT (User Acceptance Testing)

