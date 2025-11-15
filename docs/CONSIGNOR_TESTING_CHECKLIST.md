# Consignor Module - Complete Testing Checklist

**Date**: November 12, 2025  
**Module**: Consignor Management  
**Status**: ✅ All Fixes Applied - Ready for Testing

---

## 🎯 Testing Overview

This checklist covers all aspects of the Consignor Management module after comprehensive bug fixes:
- ✅ Props mismatch issues resolved
- ✅ Theme access errors fixed
- ✅ Validation schema synchronized
- ✅ Navigation routes added
- ✅ All components properly integrated

---

## 📋 Test Scenarios

### **1. Navigation Tests**

#### 1.1 From TMSHeader Dropdown
- [ ] Login to application
- [ ] Click "Master Data Maintenance" in top navigation bar
- [ ] Click "Consignor Maintenance" from dropdown
- [ ] **Expected**: Navigate to `/consignor` route
- [ ] **Expected**: ConsignorMaintenance page loads without errors
- [ ] **Expected**: Mock data displays (3 consignors)

#### 1.2 From TMSLandingPage Dropdown  
- [ ] Navigate to landing page (`/tms-portal`)
- [ ] Click "Master Data Maintenance" card
- [ ] Click "Consignor Maintenance" from menu
- [ ] **Expected**: Navigate to `/consignor` route
- [ ] **Expected**: ConsignorMaintenance page loads

#### 1.3 Direct URL Navigation
- [ ] Type `/consignor` in browser address bar
- [ ] **Expected**: ConsignorMaintenance page loads if authenticated
- [ ] **Expected**: Redirect to login if not authenticated

---

### **2. Consignor List Page Tests**

#### 2.1 Initial Load
- [ ] Page loads without JavaScript errors
- [ ] Mock data displays (3 consignors: CONS001, CONS002, CONS003)
- [ ] Table headers visible: Customer ID, Name, Industry, Currency, etc.
- [ ] Status pills display with correct colors (Active=Green, Pending=Yellow)
- [ ] No "Cannot read properties of undefined" errors in console

#### 2.2 Filter Panel
- [ ] Click "Filters" button to expand filter panel
- [ ] All input fields render without errors
- [ ] Customer ID search field works
- [ ] Customer Name search field works
- [ ] Industry Type dropdown populates
- [ ] Status dropdown has options (All, Active, Inactive, Pending)
- [ ] Theme colors applied correctly (no border errors)
- [ ] **Expected**: No theme.colors.input.border errors

#### 2.3 Filter Functionality
- [ ] Enter "CONS001" in Customer ID → Should filter to 1 result
- [ ] Enter "Acme" in Customer Name → Should filter to 1 result
- [ ] Select "Manufacturing" in Industry Type → Should filter correctly
- [ ] Select "Active" in Status → Should show only active consignors
- [ ] Click "Clear Filters" → Should reset all filters
- [ ] **Expected**: Filter state updates in Redux

#### 2.4 Pagination
- [ ] Pagination bar displays when data available
- [ ] Page numbers shown correctly
- [ ] "Previous" and "Next" buttons work
- [ ] Items per page displays correctly
- [ ] Total count matches mock data (3 items)

#### 2.5 Summary Cards
- [ ] "Total Consignors" card shows correct count (3)
- [ ] "Active Consignors" card shows correct count
- [ ] "Pending Approval" card shows correct count
- [ ] "Inactive Consignors" card shows correct count
- [ ] Cards use theme colors (no hardcoded colors)

#### 2.6 Top Action Bar
- [ ] "Create New Consignor" button visible
- [ ] "Refresh" button visible
- [ ] Click "Refresh" → Should refetch data
- [ ] Click "Create New Consignor" → Navigate to `/consignor/create`

#### 2.7 Table Row Interaction
- [ ] Click on Customer ID (CONS001) → Navigate to `/consignor/details/CONS001`
- [ ] Clicking other columns does NOT navigate (only ID is clickable)
- [ ] Hover effect shows on Customer ID column

---

### **3. Create Consignor Page Tests**

#### 3.1 Page Load
- [ ] Navigate to `/consignor/create`
- [ ] Page loads without errors
- [ ] TMSHeader displays at top
- [ ] "Back to List" button visible
- [ ] "Clear Form" button visible
- [ ] "Create Consignor" button visible
- [ ] Four tabs visible: General Information, Contact Information, Organization Details, Documents
- [ ] **Expected**: No "Cannot read properties of undefined" errors

#### 3.2 General Information Tab
- [ ] Tab loads without errors
- [ ] All input fields render:
  - [ ] Customer Name (required field marked with *)
  - [ ] Search Term (required)
  - [ ] Industry Type (required dropdown)
  - [ ] Currency Type (optional dropdown)
  - [ ] Payment Term (required dropdown)
  - [ ] Website URL (optional)
  - [ ] Remark (optional textarea)
- [ ] NDA Upload section renders
- [ ] MSA Upload section renders
- [ ] Additional Information section renders:
  - [ ] Name on Purchase Order
  - [ ] Approved By
  - [ ] Approved Date (date picker)
  - [ ] Status (dropdown: Active/Inactive/Pending)
- [ ] **Expected**: No theme.colors.input.border errors
- [ ] **Expected**: All borders render correctly with fallbacks

#### 3.3 General Tab - Data Entry
- [ ] Enter "Test Company" in Customer Name
- [ ] Enter "TEST" in Search Term  
- [ ] Select "Manufacturing" from Industry Type
- [ ] Select "USD" from Currency Type
- [ ] Select "NET30" from Payment Term
- [ ] Enter "https://test.com" in Website URL
- [ ] Enter "Test remark" in Remark field
- [ ] **Expected**: Form data updates in local state
- [ ] **Expected**: onChange callbacks work correctly

#### 3.4 General Tab - Validation
- [ ] Leave Customer Name empty and try to submit
- [ ] **Expected**: Red border on Customer Name field
- [ ] **Expected**: Error message displays below field
- [ ] **Expected**: Tab shows error count badge
- [ ] Enter invalid URL format (e.g., "not-a-url")
- [ ] **Expected**: Error message for invalid URL

#### 3.5 Contact Information Tab
- [ ] Switch to "Contact Information" tab
- [ ] Tab loads without errors
- [ ] "Add Contact" button visible
- [ ] Click "Add Contact"
- [ ] **Expected**: New contact form appears
- [ ] Contact form fields render:
  - [ ] Designation (required)
  - [ ] Name (required)
  - [ ] Phone Number (required)
  - [ ] Role (required)
  - [ ] Email (optional)
  - [ ] LinkedIn Link (optional)
  - [ ] Photo Upload section
- [ ] "Remove" button visible for each contact
- [ ] Can add multiple contacts
- [ ] Can remove contacts

#### 3.6 Organization Details Tab
- [ ] Switch to "Organization Details" tab
- [ ] Tab loads without errors
- [ ] Company Code field renders (required)
- [ ] Business Area field renders (required)
- [ ] Can enter data in both fields
- [ ] **Expected**: onChange works correctly

#### 3.7 Documents Tab
- [ ] Switch to "Documents" tab
- [ ] Tab loads without errors
- [ ] "Add Document" button visible
- [ ] Click "Add Document"
- [ ] **Expected**: New document form appears
- [ ] Document fields render:
  - [ ] Document Type (dropdown)
  - [ ] Document Number
  - [ ] Valid From (date)
  - [ ] Valid To (date)
  - [ ] File Upload section
- [ ] Can add multiple documents
- [ ] Can remove documents

#### 3.8 Tab Switching
- [ ] Switch between all 4 tabs multiple times
- [ ] **Expected**: No errors when switching
- [ ] **Expected**: Form data persists when switching back
- [ ] **Expected**: Active tab highlighted correctly

#### 3.9 Form Validation Summary
- [ ] Fill only some required fields
- [ ] Click "Create Consignor"
- [ ] **Expected**: Validation summary displays at top
- [ ] **Expected**: Lists all tabs with errors
- [ ] **Expected**: Shows error count per tab
- [ ] **Expected**: Automatically switches to first tab with errors
- [ ] **Expected**: Tab badges show error counts

#### 3.10 Clear Form
- [ ] Enter data in multiple fields across tabs
- [ ] Click "Clear Form" button
- [ ] **Expected**: Confirmation dialog (if implemented)
- [ ] **Expected**: All form data clears
- [ ] **Expected**: Returns to initial state

#### 3.11 Successful Submission
- [ ] Fill all required fields correctly
- [ ] Click "Create Consignor"
- [ ] **Expected**: Loading spinner shows
- [ ] **Expected**: Button disabled during submission
- [ ] **Expected**: Success toast notification (if implemented)
- [ ] **Expected**: Navigates to details page on success
- [ ] **Expected**: New consignor created in Redux state

---

### **4. Consignor Details Page Tests**

#### 4.1 Page Load
- [ ] Click on a consignor ID from list (e.g., CONS001)
- [ ] **Expected**: Navigate to `/consignor/details/CONS001`
- [ ] Page loads without errors
- [ ] TMSHeader displays
- [ ] "Back to List" button visible
- [ ] Consignor data displays correctly

#### 4.2 View Mode (Default)
- [ ] Four tabs visible: General, Contacts, Organization, Documents
- [ ] GeneralInfoViewTab loads with collapsible sections
- [ ] All data displays in read-only format
- [ ] No input fields visible
- [ ] "Edit" button visible (if edit mode implemented)

#### 4.3 Edit Mode Toggle (If Implemented)
- [ ] Click "Edit" button
- [ ] **Expected**: Switches to edit mode
- [ ] **Expected**: Shows GeneralInfoTab (not ViewTab)
- [ ] **Expected**: Input fields become editable
- [ ] **Expected**: "Save" and "Cancel" buttons appear

#### 4.4 View Tab Components
- [ ] GeneralInfoViewTab:
  - [ ] Collapsible sections work (expand/collapse)
  - [ ] ChevronUp/ChevronDown icons show
  - [ ] Smooth animation on expand/collapse
  - [ ] Data displays correctly
- [ ] ContactViewTab:
  - [ ] All contacts display
  - [ ] Collapsible sections work
- [ ] OrganizationViewTab:
  - [ ] Company code and business area display
  - [ ] Collapsible sections work
- [ ] DocumentsViewTab:
  - [ ] All documents display
  - [ ] Document status pills show
  - [ ] Collapsible sections work

---

### **5. Redux State Management Tests**

#### 5.1 State Structure
- [ ] Open Redux DevTools
- [ ] Navigate to `state.consignor`
- [ ] Verify state structure:
  ```javascript
  {
    consignors: [],
    currentConsignor: null,
    masterData: { industryTypes, currencyTypes, paymentTerms, documentTypes, countries },
    pagination: { page, limit, total, pages },
    filters: { customerId, customerName, industryType, status },
    isFetching: false,
    isCreating: false,
    isUpdating: false,
    error: null,
    lastCreatedConsignor: null
  }
  ```

#### 5.2 Actions Dispatch
- [ ] **fetchConsignors**: Dispatches when page loads
- [ ] **setFilters**: Dispatches when filter changes
- [ ] **clearFilters**: Dispatches when clearing filters
- [ ] **createConsignor**: Dispatches on form submit
- [ ] **fetchConsignorById**: Dispatches on details page load

#### 5.3 Loading States
- [ ] `isFetching` set to `true` during data fetch
- [ ] `isFetching` set to `false` after fetch completes
- [ ] Loading spinner shows when `isFetching: true`
- [ ] `isCreating` set to `true` during create operation

#### 5.4 Error Handling
- [ ] `error` state set when API call fails
- [ ] Error message displays on screen
- [ ] Error clears when new request succeeds

---

### **6. Mock Data Service Tests**

#### 6.1 Service Configuration
- [ ] Open `frontend/src/services/consignorService.js`
- [ ] Verify `USE_MOCK_DATA = true`
- [ ] Verify `API_BASE_URL` uses `import.meta.env.VITE_API_BASE_URL`
- [ ] **Expected**: No `process.env` references

#### 6.2 Mock Data Functions
- [ ] `getConsignors()` returns 3 mock consignors
- [ ] `getConsignorById()` returns specific consignor
- [ ] `createConsignor()` simulates creating new consignor
- [ ] `updateConsignor()` simulates update
- [ ] `deleteConsignor()` simulates delete
- [ ] `getMasterData()` returns dropdown options

#### 6.3 Mock Consignors
- [ ] CONS001 - Acme Corporation (Manufacturing, Active)
- [ ] CONS002 - Global Logistics Ltd (Logistics, Active)
- [ ] CONS003 - Tech Innovations Inc (Technology, Pending)

---

### **7. Theme Integration Tests**

#### 7.1 GeneralInfoTab Theme Usage
- [ ] No `theme.colors.input.border.default` direct access
- [ ] Uses fallback: `theme.colors.input?.border?.default || theme.colors.card.border`
- [ ] No "Cannot read properties of undefined" errors
- [ ] Border colors render correctly

#### 7.2 ConsignorFilterPanel Theme Usage
- [ ] Same safe access pattern implemented
- [ ] All input borders render correctly
- [ ] No theme access errors in console

#### 7.3 All Tab Components
- [ ] ContactTab uses safe theme access
- [ ] OrganizationTab uses safe theme access
- [ ] DocumentsTab uses safe theme access
- [ ] No hardcoded colors found

---

### **8. Error Scenarios**

#### 8.1 Network Errors (Simulated)
- [ ] Temporarily set `USE_MOCK_DATA = false`
- [ ] **Expected**: Error message displays
- [ ] **Expected**: Loading stops
- [ ] **Expected**: User can retry

#### 8.2 Invalid Data
- [ ] Try to submit form with invalid email format
- [ ] Try to submit form with invalid URL format
- [ ] Try to submit form with future date for "Valid From"
- [ ] **Expected**: Validation errors display correctly

#### 8.3 Missing Required Fields
- [ ] Submit form without Customer Name
- [ ] Submit form without Search Term
- [ ] Submit form without Industry Type
- [ ] Submit form without Payment Term
- [ ] **Expected**: All validation errors show
- [ ] **Expected**: Tab error badges appear

---

### **9. Browser Console Tests**

#### 9.1 No Errors on Load
- [ ] Open browser console (F12)
- [ ] Navigate to `/consignor`
- [ ] **Expected**: No errors in console
- [ ] **Expected**: No "Cannot read properties of undefined" errors
- [ ] **Expected**: No "process is not defined" errors

#### 9.2 No Errors During Interaction
- [ ] Fill out create form
- [ ] Switch between tabs
- [ ] Apply filters
- [ ] Click pagination buttons
- [ ] **Expected**: No errors throughout interaction

#### 9.3 No Theme Errors
- [ ] **Expected**: No "reading 'border'" errors
- [ ] **Expected**: No "reading 'error'" errors
- [ ] **Expected**: All theme properties access safely

---

### **10. Performance Tests**

#### 10.1 Page Load Time
- [ ] ConsignorMaintenance loads in < 2 seconds
- [ ] ConsignorCreatePage loads in < 2 seconds
- [ ] ConsignorDetailsPage loads in < 2 seconds

#### 10.2 Smooth Interactions
- [ ] Tab switching is instant
- [ ] Filter application is smooth
- [ ] Pagination changes quickly
- [ ] Form data updates responsively

---

## 🐛 Known Issues to Watch For

### **Fixed Issues (Should NOT Occur)**
- ❌ "Cannot read properties of undefined (reading 'error')"
- ❌ "Cannot read properties of undefined (reading 'border')"
- ❌ "process is not defined" in consignorService.js
- ❌ Navigation not working from dropdown menus
- ❌ Validation errors not displaying
- ❌ Props mismatch between parent and child components

### **Issues to Report**
If you encounter:
- Any JavaScript errors in console
- Theme access errors
- Validation not working
- Navigation failures
- Redux state not updating
- Components not rendering

**Report to**: Development team with:
- Browser used (Chrome, Firefox, Safari, Edge)
- Console error messages (screenshot)
- Steps to reproduce
- Expected vs actual behavior

---

## ✅ Sign-Off Checklist

### **Developer Sign-Off**
- [ ] All 6 component files fixed (props + theme)
- [ ] Validation schema synchronized
- [ ] Routes added to App.jsx
- [ ] No compilation errors
- [ ] No console errors during build
- [ ] Documentation updated

### **QA Sign-Off**
- [ ] All navigation tests passed
- [ ] All list page tests passed
- [ ] All create page tests passed
- [ ] All details page tests passed
- [ ] Redux state verified
- [ ] Mock data service verified
- [ ] Theme integration verified
- [ ] Browser console clean

### **Product Owner Sign-Off**
- [ ] Feature meets requirements
- [ ] User experience is smooth
- [ ] No blocking bugs
- [ ] Ready for backend integration

---

## 📝 Test Results Template

```
Date: _______________
Tester: _______________
Browser: _______________
OS: _______________

Navigation Tests: PASS / FAIL
List Page Tests: PASS / FAIL
Create Page Tests: PASS / FAIL
Details Page Tests: PASS / FAIL
Redux Tests: PASS / FAIL
Theme Tests: PASS / FAIL
Performance Tests: PASS / FAIL

Bugs Found: _______________
Notes: _______________
```

---

## 🎓 Testing Tips

1. **Use Redux DevTools**: Monitor state changes in real-time
2. **Check Console Frequently**: Catch errors early
3. **Test in Multiple Browsers**: Chrome, Firefox, Safari, Edge
4. **Test Mobile Responsive**: Use browser dev tools responsive mode
5. **Clear Cache**: Hard refresh (Ctrl+Shift+R) if seeing old bugs
6. **Network Tab**: Check API calls (even though using mock data)
7. **React DevTools**: Inspect component props and state

---

**Status**: ✅ **ALL FIXES APPLIED - READY FOR COMPREHENSIVE TESTING**

**Last Updated**: November 12, 2025
**Version**: 2.0 (After Validation Schema Fix)
