# Vehicle Document Upload - Quick Test Guide

##  Quick Testing Steps

### Phase 1: Upload and Preview (5 minutes)

1. **Navigate to Vehicle Create Page**
   - Click "Add Vehicle" button
   - Fill in Basic Information tab
   - Navigate to Documents tab

2. **Upload Test PDF**
   - Click "Add Row" in documents table
   - Select "AIP" from Document Type dropdown
   - Enter reference number: \AIP123456\
   - Click file upload icon
   - Select a PDF file (under 5MB)
   - **Expected**: File icon and filename appear

3. **Preview During Upload**
   - Click the **Eye icon** (blue) next to uploaded PDF
   - **Expected**: Modal opens with PDF preview in iframe
   - **Expected**: Modal header shows filename
   - **Expected**: Close button works

4. **Submit Form**
   - Fill in other required tabs (Basic Info, Capacity & Ownership, GPS & Operational)
   - Click "Create Vehicle" button
   - **Expected**: Success toast notification
   - **Expected**: Redirects to vehicle list or details page

### Phase 2: View and Download (5 minutes)

5. **Navigate to Vehicle Details**
   - Click on created vehicle from list
   - Go to "Documents" tab
   - **Expected**: Document card appears with PDF icon
   - **Expected**: Document metadata visible (type, reference number, dates)

6. **Preview from Details**
   - Click **"View"** button on document card
   - **Expected**: Modal opens with PDF preview
   - **Expected**: PDF renders in iframe
   - Close modal with X button
   - **Expected**: Modal closes cleanly

7. **Download Document**
   - Click **"Download"** button on document card
   - **Expected**: File downloads to browser's default location
   - **Expected**: Filename matches uploaded file
   - Open downloaded file
   - **Expected**: File opens correctly, content intact

### Phase 3: Image Testing (3 minutes)

8. **Test Image Upload**
   - Create another vehicle (or edit existing)
   - Upload JPG or PNG image as document
   - Preview during upload
   - **Expected**: Image displays in modal (not iframe)
   - Submit and view in details page
   - **Expected**: Image preview works, download works

### Phase 4: Edge Cases (5 minutes)

9. **Multiple Documents**
   - Upload 3 different documents (PDF, JPG, PNG)
   - **Expected**: All appear in details page
   - **Expected**: Each previews correctly based on type

10. **Document Without File**
    - Add document row with metadata only (no file upload)
    - Submit form
    - **Expected**: No errors, document saved without file
    - **Expected**: View/Download buttons disabled or hidden

11. **Remove and Re-upload**
    - Upload file in create page
    - Click X (remove) button
    - Upload different file
    - **Expected**: New file replaces old file
    - **Expected**: Preview shows new file

---

##  Success Criteria

### Upload Phase
- [x] File upload icon appears in table
- [x] File selection dialog opens
- [x] Selected file displays with icon and name
- [x] Preview button (Eye icon) appears
- [x] Preview modal opens on click
- [x] PDF displays in iframe
- [x] Image displays in img tag
- [x] Modal closes properly

### Storage Phase
- [x] POST /api/vehicle returns success
- [x] Database: vehicle_documents record inserted
- [x] Database: document_upload record inserted
- [x] Base64 data stored in file_xstring_value
- [x] system_reference_id links correctly

### Display Phase
- [x] GET /api/vehicle/:id returns documents array
- [x] Documents display in DocumentsViewTab
- [x] Document metadata correct (type, reference, dates)
- [x] File icon matches file type
- [x] Status badge correct (Valid/Expiring/Expired)

### Preview Phase
- [x] View button triggers preview modal
- [x] PDF displays in iframe (full size)
- [x] Image displays with max-width (responsive)
- [x] Modal header shows filename
- [x] Close button works
- [x] Backdrop click closes modal

### Download Phase
- [x] Download button triggers download
- [x] File downloads with correct name
- [x] File opens without corruption
- [x] MIME type correct
- [x] File size matches original

---

##  Common Issues and Solutions

### Issue 1: Preview Modal Doesn't Open
**Symptom**: Click View button, nothing happens  
**Solution**: Check browser console for errors. Verify fileData exists in document object.

### Issue 2: PDF Shows Blank in Preview
**Symptom**: Modal opens but iframe is empty  
**Solution**: 
- Check if base64 string has proper format (no spaces/newlines)
- Verify MIME type is exactly "application/pdf"
- Try downloading and opening (download usually works even if preview doesn't)

### Issue 3: Download Creates Corrupted File
**Symptom**: Downloaded file won't open  
**Solution**:
- Check base64 encoding (should have no line breaks)
- Verify \tob()\ decoding works (check console)
- Ensure MIME type matches file type

### Issue 4: Document Doesn't Save to Database
**Symptom**: Vehicle created but documents missing in details  
**Solution**:
- Check backend logs for transaction errors
- Verify documentType is provided (required field)
- Check if fileData is base64 string (not File object)
- Verify ThemeTable converts File to base64

### Issue 5: Multiple Documents Only Show Last One
**Symptom**: Upload 3 docs, only 1 appears in details  
**Solution**:
- Check backend loop in createVehicle (should iterate all docs)
- Verify transaction doesn't fail midway
- Check if all document IDs are unique

---

##  Database Verification Queries

### Check Vehicle Documents
\\\sql
SELECT * FROM vehicle_documents 
WHERE vehicle_id_code = 'VEH0001'
ORDER BY created_at DESC;
\\\

### Check Document Upload Files
\\\sql
SELECT 
  du.document_id,
  du.file_name,
  du.file_type,
  LENGTH(du.file_xstring_value) as base64_length,
  du.system_reference_id,
  vd.document_type_id,
  vd.reference_number
FROM document_upload du
LEFT JOIN vehicle_documents vd ON du.system_reference_id = vd.document_id
WHERE vd.vehicle_id_code = 'VEH0001';
\\\

### Verify Join Works
\\\sql
SELECT 
  vd.document_id,
  vd.document_type_id,
  vd.reference_number,
  du.file_name,
  du.file_type
FROM vehicle_documents vd
LEFT JOIN document_upload du ON vd.document_id = du.system_reference_id
WHERE vd.vehicle_id_code = 'VEH0001';
\\\

---

##  Test Data

### Sample Document Metadata
\\\json
{
  "documentType": "AIP",
  "referenceNumber": "AIP123456",
  "validFrom": "2024-01-01",
  "validTo": "2025-01-01",
  "remarks": "Annual inspection permit"
}
\\\

### Sample File Types to Test
- **PDF**: test-document.pdf (500KB)
- **Image**: vehicle-photo.jpg (1MB)
- **PNG**: insurance-card.png (200KB)
- **Large**: big-document.pdf (4.5MB - near limit)

---

##  Performance Benchmarks

### Expected Response Times
- File upload (frontend): < 500ms for 1MB file
- Base64 encoding: < 200ms for 1MB file
- POST /api/vehicle: < 2 seconds with documents
- GET /api/vehicle/:id: < 500ms (includes documents)
- Preview modal open: < 100ms (instant)
- Download: < 500ms for 5MB file

### File Size Limits
- **Frontend**: 5MB max (enforced by validation)
- **Base64**: 6.65MB max (5MB  1.33)
- **Database TEXT**: 65,535 bytes  use MEDIUMTEXT or LONGTEXT
- **Backend**: No explicit limit (relies on frontend validation)

---

##  Testing Priorities

### P0 (Critical)
1. Upload PDF and preview during creation 
2. Submit form with document 
3. View document in details page 
4. Download document 

### P1 (High)
5. Upload image and preview 
6. Multiple documents 
7. Preview from details page 

### P2 (Medium)
8. Remove and re-upload 
9. Document without file 
10. Long filename handling 

### P3 (Low)
11. Large file (4.5MB) 
12. Multiple file types 
13. Mobile responsive 

---

**Test Duration**: ~20 minutes for complete testing  
**Test Environment**: Local development (frontend + backend running)  
**Test Tools**: Browser DevTools, MySQL Workbench/phpMyAdmin  
**Test Data**: Sample PDFs and images (under 5MB)

---

**Happy Testing! **
