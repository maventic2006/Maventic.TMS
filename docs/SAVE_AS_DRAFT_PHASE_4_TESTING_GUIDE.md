# Save as Draft - Phase 4: Complete Testing Guide

**Date**: November 22, 2025  
**Phase**: Phase 4 - Testing & Documentation  
**Status**:  IN PROGRESS  
**Purpose**: Comprehensive end-to-end testing before production deployment

---

##  Testing Overview

This guide covers all testing scenarios for the save-as-draft feature across:
-  Browser navigation blocking
-  In-app navigation handling
-  Draft CRUD operations
-  Cross-user security
-  Mobile responsiveness
-  Error handling
-  Integration with existing features

---

##  Test Environment Setup

### Prerequisites
1. Backend server running on http://localhost:5001
2. Frontend dev server running on http://localhost:5173
3. Database with transporter_master table
4. At least 2 test users (for cross-user testing)
5. Browser dev tools open (Console + Network tabs)

### Test Users
- **User A**: Product Owner (UT001) - Primary tester
- **User B**: Product Owner (UT001) - Cross-user tester

### Test Data
- Use realistic transporter data
- Include valid VAT numbers, emails, phone numbers
- Test with both minimal and complete data sets

---

##  SECTION 1: Browser Navigation Blocking

### Test 1.1: Browser Close with Unsaved Changes 
**Steps**:
1. Login as User A
2. Navigate to /transporters/create
3. Fill in Business Name: "Test Transport Co"
4. Try to close browser tab (Ctrl+W or click X)

**Expected Result**:
-  Browser shows native warning dialog
-  Dialog says "Changes you made may not be saved"
-  User can choose "Leave" or "Stay"
-  If "Stay" selected, data is preserved

**Actual Result**: ________________

**Status**:  Pass  Fail

---

### Test 1.2: Browser Refresh with Unsaved Changes 
**Steps**:
1. Login as User A
2. Navigate to /transporters/create
3. Fill in Business Name: "Test Transport Co"
4. Press F5 or Ctrl+R to refresh

**Expected Result**:
-  Browser shows native warning dialog
-  User can choose "Reload" or "Cancel"
-  If "Cancel" selected, data is preserved

**Actual Result**: ________________

**Status**:  Pass  Fail

---

### Test 1.3: Browser Navigation with Unsaved Changes 
**Steps**:
1. Login as User A
2. Navigate to /transporters/create
3. Fill in Business Name: "Test Transport Co"
4. Press browser back button or Alt+Left Arrow

**Expected Result**:
-  Browser shows native warning dialog
-  User can navigate back or stay

**Actual Result**: ________________

**Status**:  Pass  Fail

---

### Test 1.4: No Warning Without Changes 
**Steps**:
1. Navigate to /transporters/create
2. Don't fill any fields
3. Try to close tab

**Expected Result**:
-  Tab closes immediately
-  No warning shown

**Actual Result**: ________________

**Status**:  Pass  Fail

---

##  SECTION 2: In-App Navigation

### Test 2.1: Back Button with Unsaved Changes 
**Steps**:
1. Navigate to /transporters/create
2. Fill in Business Name: "Test Transport Co"
3. Fill in From Date: "2025-01-01"
4. Click the back arrow button (top left)

**Expected Result**:
-  SaveAsDraftModal appears
-  Modal title: "Unsaved Changes"
-  Modal message explains options
-  Three buttons visible: "Save Draft", "Discard Changes", "Cancel"
-  Framer Motion animation plays

**Actual Result**: ________________

**Status**:  Pass  Fail

---

### Test 2.2: Back Button without Changes 
**Steps**:
1. Navigate to /transporters/create
2. Don't fill any fields
3. Click back arrow button

**Expected Result**:
-  Navigates to /transporters immediately
-  No modal shown
-  Smooth navigation

**Actual Result**: ________________

**Status**:  Pass  Fail

---

### Test 2.3: Modal - Cancel Button 
**Steps**:
1. Navigate to /transporters/create
2. Fill in some data
3. Click back button
4. Modal appears
5. Click "Cancel" button

**Expected Result**:
-  Modal closes with fade-out animation
-  User stays on /transporters/create
-  All filled data preserved
-  Can continue editing

**Actual Result**: ________________

**Status**:  Pass  Fail

---

### Test 2.4: Modal - ESC Key 
**Steps**:
1. Navigate to /transporters/create
2. Fill in some data
3. Click back button
4. Modal appears
5. Press ESC key

**Expected Result**:
-  Modal closes
-  Stays on create page
-  Data preserved

**Actual Result**: ________________

**Status**:  Pass  Fail

---

### Test 2.5: Modal - Backdrop Click 
**Steps**:
1. Navigate to /transporters/create
2. Fill in some data
3. Click back button
4. Modal appears
5. Click outside modal (on dark backdrop)

**Expected Result**:
-  Modal closes
-  Stays on create page
-  Data preserved

**Actual Result**: ________________

**Status**:  Pass  Fail

---

##  SECTION 3: Save Draft Functionality

### Test 3.1: Save Draft - Minimal Data 
**Steps**:
1. Navigate to /transporters/create
2. Fill only Business Name: "Draft Transport 1"
3. Click back button
4. Click "Save Draft"

**Expected Result**:
-  Modal shows loading spinner on button
-  Network request: POST /api/transporter/save-draft
-  Response status: 201
-  Response contains transporter_id
-  Toast notification: "Draft saved successfully"
-  Navigates to /transporters
-  Draft appears in list with "Draft" status pill

**Actual Result**: ________________

**Status**:  Pass  Fail

---

### Test 3.2: Save Draft - Complete Data 
**Steps**:
1. Navigate to /transporters/create
2. Fill all tabs with complete data:
   - General Details: Business name, dates, transport modes
   - Address: Complete address with contact
   - Serviceable Areas: India, multiple states
   - Documents: Upload at least one document
3. Click back button
4. Click "Save Draft"

**Expected Result**:
-  All data saved in draft
-  Toast notification shown
-  Navigates to list
-  Draft visible in list

**Actual Result**: ________________

**Status**:  Pass  Fail

---

### Test 3.3: Save Draft - Duplicate VAT Number 
**Steps**:
1. Navigate to /transporters/create
2. Fill Business Name: "Draft Transport Dup"
3. Fill VAT Number: [Use existing VAT number]
4. Click back button
5. Click "Save Draft"

**Expected Result**:
-  Draft saves successfully (drafts allow duplicates)
-  No validation error
-  Toast notification shown
-  Navigates to list

**Actual Result**: ________________

**Status**:  Pass  Fail

---

### Test 3.4: Discard Changes 
**Steps**:
1. Navigate to /transporters/create
2. Fill Business Name: "Will Discard"
3. Fill From Date: "2025-01-01"
4. Click back button
5. Click "Discard Changes"

**Expected Result**:
-  Navigates to /transporters immediately
-  No API call made (check Network tab)
-  No toast notification
-  Data NOT saved in database
-  Draft does NOT appear in list

**Actual Result**: ________________

**Status**:  Pass  Fail

---

##  SECTION 4: Update Draft Functionality

### Test 4.1: Open Existing Draft 
**Steps**:
1. Navigate to /transporters
2. Filter by status: "Draft"
3. Click on a draft transporter ID

**Expected Result**:
-  Navigates to /transporters/:id
-  Details page loads
-  All saved data visible in view tabs
-  Status pill shows "Draft"

**Actual Result**: ________________

**Status**:  Pass  Fail

---

### Test 4.2: Edit Draft and Update 
**Steps**:
1. Open a draft (from Test 4.1)
2. Click "Edit" button
3. Change Business Name to "Updated Draft Name"
4. Add a new address
5. Click back button
6. Click "Save Draft"

**Expected Result**:
-  Network request: PUT /api/transporter/:id/update-draft
-  Response status: 200
-  Toast: "Draft updated successfully"
-  Navigates to list
-  Updated data visible when reopened

**Actual Result**: ________________

**Status**:  Pass  Fail

---

### Test 4.3: Submit Draft (Convert to Active) 
**Steps**:
1. Open a draft with complete data
2. Click "Edit" button
3. Fill all required fields
4. Click "Submit" button (not "Save Draft")

**Expected Result**:
-  Validation runs
-  If valid: Creates transporter with "Pending" status
-  Draft is removed from database
-  Toast: "Transporter created successfully"
-  Navigates to list
-  Transporter appears with "Pending" status
-  Draft no longer visible

**Actual Result**: ________________

**Status**:  Pass  Fail

---

##  SECTION 5: Delete Draft Functionality

### Test 5.1: Delete Draft from List (Desktop) 
**Steps**:
1. Navigate to /transporters
2. Filter by status: "Draft"
3. Find a draft in table
4. Click delete (trash icon) button in Actions column
5. Confirm in dialog

**Expected Result**:
-  Confirmation dialog appears: "Are you sure you want to delete this draft?"
-  Click "OK"
-  Network request: DELETE /api/transporter/:id/delete-draft
-  Response status: 200
-  Draft removed from list immediately (Redux removes it)
-  Toast: "Draft deleted successfully"
-  List auto-refreshes

**Actual Result**: ________________

**Status**:  Pass  Fail

---

### Test 5.2: Delete Draft from List (Mobile) 
**Steps**:
1. Resize browser to mobile width (< 768px)
2. Navigate to /transporters
3. Filter by status: "Draft"
4. Find draft card
5. Click delete button next to status pill
6. Confirm in dialog

**Expected Result**:
-  Same as Test 5.1
-  Delete button visible in mobile card
-  Card animates out when deleted

**Actual Result**: ________________

**Status**:  Pass  Fail

---

### Test 5.3: Cancel Delete Draft 
**Steps**:
1. Navigate to /transporters
2. Filter by "Draft"
3. Click delete button
4. Click "Cancel" in confirmation dialog

**Expected Result**:
-  Dialog closes
-  No API call made
-  Draft remains in list
-  No changes

**Actual Result**: ________________

**Status**:  Pass  Fail

---

### Test 5.4: Delete Draft - No Button for Active Transporters 
**Steps**:
1. Navigate to /transporters
2. Filter by status: "Active"
3. Look at Actions column for active transporters

**Expected Result**:
-  No delete button shown for Active transporters
-  Delete button ONLY visible for Drafts

**Actual Result**: ________________

**Status**:  Pass  Fail

---

##  SECTION 6: Cross-User Security

### Test 6.1: Update Draft - Different User 
**Steps**:
1. User A: Create a draft
2. Note the transporter_id
3. Logout User A
4. Login as User B
5. User B: Manually navigate to draft details page
6. User B: Try to edit and save

**Expected Result**:
-  Error response: 403 Forbidden
-  Toast: "You can only update your own drafts"
-  Draft not updated
-  Network response contains ownership error

**Actual Result**: ________________

**Status**:  Pass  Fail

---

### Test 6.2: Delete Draft - Different User 
**Steps**:
1. User A: Create a draft
2. Note the transporter_id
3. Logout User A
4. Login as User B
5. User B: Navigate to drafts list
6. User B: Try to delete User A's draft

**Expected Result**:
-  Delete button visible (UI doesn't know ownership yet)
-  Click delete
-  Confirm dialog
-  API call returns 403 Forbidden
-  Toast: "You can only delete your own drafts"
-  Draft remains in list

**Actual Result**: ________________

**Status**:  Pass  Fail

---

### Test 6.3: View Draft - Different User 
**Steps**:
1. User A: Create a draft
2. Logout User A
3. Login as User B
4. User B: Navigate to drafts list
5. User B: Click on User A's draft ID

**Expected Result**:
-  Details page loads successfully
-  All data visible in view mode
-  User B can VIEW draft (read-only)
-  Edit button available but will fail on save (Test 6.1)

**Actual Result**: ________________

**Status**:  Pass  Fail

---

##  SECTION 7: Mobile Responsiveness

### Test 7.1: Create Page on Mobile 
**Steps**:
1. Resize browser to 375px width (iPhone SE)
2. Navigate to /transporters/create
3. Fill form fields
4. Click back button

**Expected Result**:
-  Form is responsive
-  Modal appears correctly
-  All buttons visible and clickable
-  Text is readable
-  No horizontal scroll

**Actual Result**: ________________

**Status**:  Pass  Fail

---

### Test 7.2: List Page on Mobile - Draft Filter 
**Steps**:
1. Resize to mobile width
2. Navigate to /transporters
3. Click filter button
4. Select "Draft" status

**Expected Result**:
-  Filter panel slides in
-  "Draft" option visible
-  Can select and apply
-  Drafts filter correctly

**Actual Result**: ________________

**Status**:  Pass  Fail

---

### Test 7.3: Mobile Card - Delete Button 
**Steps**:
1. Resize to mobile width
2. Navigate to /transporters
3. Filter by "Draft"
4. Find draft card

**Expected Result**:
-  Delete button visible next to status pill
-  Button is touch-friendly (adequate size)
-  Hover effect works
-  Click works correctly

**Actual Result**: ________________

**Status**:  Pass  Fail

---

### Test 7.4: Modal on Mobile 
**Steps**:
1. Resize to mobile width
2. Create transporter with data
3. Trigger save-as-draft modal

**Expected Result**:
-  Modal is centered
-  Backdrop covers entire screen
-  All buttons visible
-  Text is readable
-  Can close with X button
-  Can interact with all buttons

**Actual Result**: ________________

**Status**:  Pass  Fail

---

##  SECTION 8: Error Handling

### Test 8.1: Save Draft - Network Error 
**Steps**:
1. Stop backend server
2. Navigate to /transporters/create
3. Fill data
4. Click back  Save Draft

**Expected Result**:
-  Loading spinner shows
-  After timeout: Error toast appears
-  Toast: "Failed to save draft"
-  User stays on create page
-  Data preserved
-  Can try again

**Actual Result**: ________________

**Status**:  Pass  Fail

---

### Test 8.2: Delete Draft - Network Error 
**Steps**:
1. Stop backend server
2. Navigate to drafts list
3. Try to delete a draft

**Expected Result**:
-  Error toast appears
-  Toast: "Failed to delete draft"
-  Draft remains in list
-  No list corruption

**Actual Result**: ________________

**Status**:  Pass  Fail

---

### Test 8.3: Update Draft - Invalid Status 
**Steps**:
1. Manually change draft status to "PENDING" in database
2. Try to update via UI

**Expected Result**:
-  API returns 400 Bad Request
-  Toast: "Only drafts can be updated via this endpoint"
-  Helpful error message

**Actual Result**: ________________

**Status**:  Pass  Fail

---

##  SECTION 9: Integration Tests

### Test 9.1: Create  Save Draft  Edit  Submit 
**Steps**:
1. Create transporter with partial data
2. Save as draft
3. Reopen draft
4. Complete all fields
5. Click Submit

**Expected Result**:
-  Entire flow works smoothly
-  Draft transitions to Pending
-  All data preserved
-  Validation works
-  Approval flow triggered

**Actual Result**: ________________

**Status**:  Pass  Fail

---

### Test 9.2: Bulk Upload Integration 
**Steps**:
1. Navigate to /transporters/create
2. Click "Bulk Upload" button
3. Upload CSV/Excel
4. Don't submit
5. Try to navigate away

**Expected Result**:
-  No interference with bulk upload modal
-  Bulk upload works normally
-  Save-as-draft doesn't trigger during bulk upload

**Actual Result**: ________________

**Status**:  Pass  Fail

---

### Test 9.3: Validation Integration 
**Steps**:
1. Create transporter with invalid data (invalid email)
2. Click Submit
3. Validation fails
4. Try to navigate away

**Expected Result**:
-  isDirty still true (validation doesn't clear dirty state)
-  Modal appears
-  Can save draft with invalid data
-  Can discard changes

**Actual Result**: ________________

**Status**:  Pass  Fail

---

##  SECTION 10: Browser Compatibility

### Test 10.1: Chrome/Edge (Chromium) 
**Browser**: Chrome 120+ or Edge 120+

**Expected Result**:
-  All features work
-  Animations smooth
-  No console errors

**Actual Result**: ________________

**Status**:  Pass  Fail

---

### Test 10.2: Firefox 
**Browser**: Firefox 121+

**Expected Result**:
-  All features work
-  beforeunload warning shows
-  Modal animations work

**Actual Result**: ________________

**Status**:  Pass  Fail

---

### Test 10.3: Safari 
**Browser**: Safari 17+

**Expected Result**:
-  All features work
-  beforeunload warning shows
-  Framer Motion animations work

**Actual Result**: ________________

**Status**:  Pass  Fail

---

##  Test Summary

### Overall Status

| Category | Total Tests | Passed | Failed | Skipped |
|----------|-------------|--------|--------|---------|
| Browser Navigation | 4 | ___ | ___ | ___ |
| In-App Navigation | 5 | ___ | ___ | ___ |
| Save Draft | 4 | ___ | ___ | ___ |
| Update Draft | 3 | ___ | ___ | ___ |
| Delete Draft | 4 | ___ | ___ | ___ |
| Cross-User Security | 3 | ___ | ___ | ___ |
| Mobile Responsive | 4 | ___ | ___ | ___ |
| Error Handling | 3 | ___ | ___ | ___ |
| Integration | 3 | ___ | ___ | ___ |
| Browser Compatibility | 3 | ___ | ___ | ___ |
| **TOTAL** | **36** | **___** | **___** | **___** |

### Critical Bugs Found
1. ________________
2. ________________
3. ________________

### Minor Issues Found
1. ________________
2. ________________
3. ________________

### Suggestions for Improvement
1. ________________
2. ________________
3. ________________

---

##  Sign-Off

### Testing Completed By
- **Name**: ________________
- **Date**: ________________
- **Test Environment**: ________________
- **Browser(s) Used**: ________________

### Approval
- **QA Lead**: ________________ (Date: ______)
- **Dev Lead**: ________________ (Date: ______)
- **Product Owner**: ________________ (Date: ______)

### Production Readiness
-  All critical tests passed
-  No blocking bugs found
-  Performance acceptable
-  Security tests passed
-  Mobile responsive verified
-  Cross-browser compatible
-  Documentation complete

**Status**:  READY FOR PRODUCTION  NEEDS FIXES

---

##  Notes

(Add any additional observations, edge cases found, or recommendations here)

________________
________________
________________

