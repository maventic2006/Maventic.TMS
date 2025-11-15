# Document Upload Test Plan

**Feature**: Transporter Document Upload Fix  
**Date**: November 15, 2025

---

## Test Scenarios

### Scenario 1: Create Transporter with Small Document (< 1MB)

**Steps:**

1. Navigate to "Create Transporter" page
2. Fill in General Details (business name, dates, transport modes)
3. Add Address & Contacts
4. Add Serviceable Areas
5. In Documents tab, click "Add Row"
6. Fill document details (type, number, validity dates)
7. Upload a small PDF file (< 1MB)
8. Click "Submit"

**Expected Result:**
✅ Transporter created successfully  
✅ Toast notification shows success message  
✅ Redirected to transporter details page  
✅ Document appears in Documents tab

**Actual Result:** _To be tested_

---

### Scenario 2: Create Transporter with Large Document (3-5MB)

**Steps:**

1. Navigate to "Create Transporter" page
2. Fill in all required sections
3. In Documents tab, upload a large PDF file (3-5MB)
4. Click "Submit"

**Expected Result:**
✅ Transporter created successfully (no database error)  
✅ Document saved with full file data  
✅ Can view document in details page

**Actual Result:** _To be tested_

---

### Scenario 3: View Uploaded Document (Image)

**Steps:**

1. Navigate to transporter details page with uploaded image document
2. Go to Documents tab
3. Click "View" button on an image document (JPEG/PNG)

**Expected Result:**
✅ Preview modal opens  
✅ Image displays correctly  
✅ Close button works

**Actual Result:** _To be tested_

---

### Scenario 4: View Uploaded Document (PDF)

**Steps:**

1. Navigate to transporter details page with uploaded PDF document
2. Go to Documents tab
3. Click "View" button on a PDF document

**Expected Result:**
✅ Preview modal opens  
✅ PDF displays in iframe  
✅ Can scroll through PDF pages  
✅ Close button works

**Actual Result:** _To be tested_

---

### Scenario 5: Download Document

**Steps:**

1. Navigate to transporter details page with uploaded document
2. Go to Documents tab
3. Click "Download" button on any document

**Expected Result:**
✅ Browser download starts automatically  
✅ File downloads with correct name  
✅ File opens correctly after download  
✅ File content matches original upload

**Actual Result:** _To be tested_

---

### Scenario 6: Multiple Documents Upload

**Steps:**

1. Create transporter with 3 documents:
   - GST Certificate (PDF, 2MB)
   - PAN Card (Image, 500KB)
   - Trade License (PDF, 1MB)
2. Submit and view in details page

**Expected Result:**
✅ All 3 documents saved successfully  
✅ All documents appear in Documents tab  
✅ Each document can be viewed individually  
✅ Each document can be downloaded

**Actual Result:** _To be tested_

---

### Scenario 7: Loading States

**Steps:**

1. Navigate to transporter details with documents
2. Click "View" button
3. Observe loading state
4. Wait for document to load

**Expected Result:**
✅ Button shows spinner during load  
✅ Button disabled during load  
✅ Preview modal opens after load completes

**Actual Result:** _To be tested_

---

### Scenario 8: Error Handling - Network Failure

**Steps:**

1. Navigate to transporter details
2. Disconnect internet
3. Click "View" button

**Expected Result:**
✅ Error alert appears  
✅ User-friendly error message shown  
✅ Button returns to normal state

**Actual Result:** _To be tested_

---

### Scenario 9: Error Handling - Missing Document

**Steps:**

1. Manually delete document from database
2. Try to view document in frontend

**Expected Result:**
✅ 404 error from API  
✅ User-friendly error message  
✅ No app crash

**Actual Result:** _To be tested_

---

### Scenario 10: File Type Validation

**Steps:**

1. Try to upload unsupported file type (e.g., .exe, .bat)
2. Observe validation

**Expected Result:**
✅ Frontend validation rejects file  
✅ Error message shows allowed file types

**Actual Result:** _To be tested_

---

### Scenario 11: File Size Validation

**Steps:**

1. Try to upload file > 5MB
2. Observe validation

**Expected Result:**
✅ Frontend validation rejects file  
✅ Error message shows max file size (5MB)

**Actual Result:** _To be tested_

---

### Scenario 12: Existing Data Compatibility

**Steps:**

1. Fetch existing transporter with documents (created before fix)
2. View documents tab

**Expected Result:**
✅ Old documents still accessible  
✅ View/Download buttons work for old documents  
✅ No errors or warnings

**Actual Result:** _To be tested_

---

## Performance Tests

### Test 1: Large File Upload (5MB)

**Metric**: Time to create transporter with 5MB PDF  
**Target**: < 10 seconds  
**Actual**: _To be measured_

### Test 2: Document Fetch Speed

**Metric**: Time to fetch and display 3MB document  
**Target**: < 3 seconds  
**Actual**: _To be measured_

### Test 3: Multiple Documents

**Metric**: Time to load details page with 5 documents  
**Target**: < 5 seconds  
**Actual**: _To be measured_

---

## Browser Compatibility Tests

| Browser | Version | Create | View | Download | Status  |
| ------- | ------- | ------ | ---- | -------- | ------- |
| Chrome  | 120+    | ⬜     | ⬜   | ⬜       | Pending |
| Firefox | 120+    | ⬜     | ⬜   | ⬜       | Pending |
| Edge    | 120+    | ⬜     | ⬜   | ⬜       | Pending |
| Safari  | 17+     | ⬜     | ⬜   | ⬜       | Pending |

---

## Regression Tests

### Areas to Verify (No Breaking Changes)

- [ ] Transporter list page loads correctly
- [ ] Transporter filter/search works
- [ ] Transporter update functionality works
- [ ] Address & Contacts tabs work
- [ ] Serviceable Areas tab works
- [ ] General Details tab works
- [ ] Other modules (Driver, Warehouse, Vehicle) unaffected

---

## API Testing

### Test API Endpoint Directly

**Endpoint**: `GET /api/transporter/document/:documentId`

**Test 1: Valid Document**

```bash
curl -X GET http://localhost:5000/api/transporter/document/T001_DOC0001 \
  -H "Authorization: Bearer <token>"
```

**Expected**: 200 OK with document data

**Test 2: Invalid Document ID**

```bash
curl -X GET http://localhost:5000/api/transporter/document/INVALID_ID \
  -H "Authorization: Bearer <token>"
```

**Expected**: 404 Not Found

**Test 3: No Authorization**

```bash
curl -X GET http://localhost:5000/api/transporter/document/T001_DOC0001
```

**Expected**: 401 Unauthorized

---

## Test Data Requirements

### Sample Documents Needed

1. **Small PDF** (500KB) - GST Certificate
2. **Large PDF** (4-5MB) - Trade License
3. **Small Image** (200KB) - PAN Card JPEG
4. **Large Image** (2-3MB) - High-res scan PNG
5. **Medium PDF** (1-2MB) - Company Registration

---

## Checklist Before Production

- [ ] All test scenarios passed
- [ ] No console errors in browser
- [ ] No backend errors in logs
- [ ] Migration ran successfully in dev
- [ ] Migration ran successfully in staging (if applicable)
- [ ] Database backup taken
- [ ] Documentation updated
- [ ] Code reviewed
- [ ] Error handling tested
- [ ] Loading states verified
- [ ] Mobile responsiveness checked
- [ ] API authentication verified
- [ ] File size limits enforced

---

## Test Results Summary

**Date Tested**: ********\_********  
**Tester**: ********\_********  
**Environment**: Development / Staging / Production

**Overall Status**: ⬜ Pass / ⬜ Fail / ⬜ Partial

**Issues Found**: ********\_********  
**Issues Resolved**: ********\_********  
**Outstanding Issues**: ********\_********

---

## Sign-off

**Developer**: ********\_********  
**QA Tester**: ********\_********  
**Product Owner**: ********\_********

**Approved for Production**: ⬜ Yes / ⬜ No  
**Date**: ********\_********
