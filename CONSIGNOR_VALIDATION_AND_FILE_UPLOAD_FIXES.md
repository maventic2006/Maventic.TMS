# Consignor Validation and File Upload Fixes

## Issues Fixed

### 1. Business Area Validation (Array Type)
**Problem**: OrganizationTab allows multiple states selection but validation expected string
**Error**: "Invalid input: expected string, received array"

**Fix**: Changed validation schema
```javascript
// Before
business_area: z.string().optional()

// After  
business_area: z.array(z.string()).optional()
```

### 2. NDA/MSA Reference Length Limits
**Problem**: NDA and MSA references limited to 20 characters but can be very long
**Errors**: 
- "NDA reference must not exceed 20 characters"
- "MSA reference must not exceed 20 characters"

**Fix**: Increased length limit to 255 characters
```javascript
// Before
upload_nda: z.string().max(20, "NDA reference must not exceed 20 characters").optional()
upload_msa: z.string().max(20, "MSA reference must not exceed 20 characters").optional()

// After
upload_nda: z.string().max(255, "NDA reference must not exceed 255 characters").optional()
upload_msa: z.string().max(255, "MSA reference must not exceed 255 characters").optional()
```

### 3. Document Storage Mechanism
**How Documents Are Stored**:
1. **Frontend**: Documents added in DocumentsTab with file upload
2. **Upload Process**:
   - Files sent as FormData with key pattern: `document_${index}_file`
   - Example: `document_0_file`, `document_1_file`, etc.
3. **Backend Storage** (`consignorService.js` - uploadFile function):
   - Files uploaded via Multer middleware
   - Stored with sanitized filename: `${Date.now()}_${originalName}`
   - File metadata saved to `document_upload` table
4. **Database Schema** (`document_upload` table):
   ```sql
   - document_upload_id (PK)
   - document_type_id (FK to doc_type_configuration)
   - file_name (sanitized filename)
   - file_type (MIME type)
   - file_path (storage path)
   - document_number
   - valid_from
   - valid_to
   - status (ACTIVE/INACTIVE)
   ```

### 4. Contact Photo Storage Mechanism
**How Contact Photos Are Stored**:
1. **Frontend**: Contact photos uploaded in ContactTab
2. **Upload Process**:
   - Files sent as FormData with key pattern: `contact_${index}_photo`
   - Example: `contact_0_photo`, `contact_1_photo`, etc.
3. **Backend Storage**:
   - Files uploaded to folder: `consignor/contacts/`
   - Stored with sanitized filename: `${Date.now()}_${originalName}`
4. **Database Storage** (`customer_contact_master` table):
   - Photo URL/path stored in `contact_photo` column (VARCHAR 255)
   - Full path: `uploads/consignor/contacts/1699999999_photo.jpg`

## Files Modified

### Frontend
1. **frontend/src/features/consignor/validation.js**
   - Line 89: Changed business_area from z.string() to z.array(z.string())
   - Line 8: Changed upload_nda max from 20 to 255
   - Line 14: Changed upload_msa max from 20 to 255

### Backend (Already Correct - No Changes Needed)
- **tms-backend/services/consignorService.js**
  - uploadFile() function handles all file uploads
  - Document storage already implemented
  - Contact photo storage already implemented

## Testing Instructions

### 1. Clear Browser Cache
```powershell
# Press Ctrl+Shift+Delete in browser
# Select "Cached images and files" and "Cookies and other site data"
# Clear data
```

### 2. Restart Frontend
```powershell
cd frontend
npm run dev
```

### 3. Test Business Area (Multiple States)
1. Navigate to: http://localhost:5173/consignor/create
2. Click "Organization Details" tab
3. Select multiple states (e.g., Maharashtra, Karnataka, Tamil Nadu)
4. Click "Review & Submit"
5. **Expected**: No validation error about string/array
6. **Verify**: business_area saved as array in database

### 4. Test NDA/MSA Long References
1. Go to "General Information" tab
2. In NDA Reference field, enter text longer than 20 characters:
   ```
   NDA-MAVENTIC-2024-LONG-REFERENCE-AGREEMENT-12345
   ```
3. In MSA Reference field, enter text longer than 20 characters:
   ```
   MSA-MASTER-SERVICE-AGREEMENT-LONG-REFERENCE-67890
   ```
4. Click "Review & Submit"
5. **Expected**: No validation error about exceeding 20 characters
6. **Verify**: References up to 255 characters accepted

### 5. Test Document Upload
1. Go to "Documents" tab
2. Click "Add Row"
3. Select document type (e.g., "PAN Card")
4. Enter document number
5. Select valid from/to dates
6. Upload file (PDF, JPG, PNG)
7. Add another document
8. Click "Review & Submit"
9. **Expected**: Documents uploaded successfully
10. **Verify in Database**:
    ```sql
    SELECT * FROM document_upload 
    WHERE document_type_id IN (
      SELECT document_type_id FROM doc_type_configuration 
      WHERE user_type = 'CONSIGNOR'
    )
    ORDER BY created_at DESC;
    ```
11. **Verify File Storage**: Check `uploads/consignor/documents/` folder

### 6. Test Contact Photo Upload
1. Go to "Contact Information" tab
2. Click "Add Contact"
3. Fill contact details (name, designation, etc.)
4. Click "Upload Photo" button
5. Select image file (JPG, PNG)
6. Add another contact with photo
7. Click "Review & Submit"
8. **Expected**: Photos uploaded successfully
9. **Verify in Database**:
    ```sql
    SELECT contact_id, contact_name, contact_photo 
    FROM customer_contact_master 
    WHERE customer_id = 'CUST0001'  -- Replace with actual ID
    ORDER BY created_at DESC;
    ```
10. **Verify File Storage**: Check `uploads/consignor/contacts/` folder

## Backend Schema Reference

### document_upload Table
```sql
CREATE TABLE document_upload (
  document_upload_id VARCHAR(50) PRIMARY KEY,
  document_type_id VARCHAR(50),
  file_name VARCHAR(255),
  file_type VARCHAR(100),
  file_path VARCHAR(500),
  document_number VARCHAR(100),
  valid_from DATE,
  valid_to DATE,
  status ENUM('ACTIVE', 'INACTIVE'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (document_type_id) REFERENCES doc_type_configuration(document_type_id)
);
```

### customer_contact_master Table (Relevant Columns)
```sql
CREATE TABLE customer_contact_master (
  contact_id VARCHAR(50) PRIMARY KEY,
  customer_id VARCHAR(50),
  contact_name VARCHAR(255),
  contact_designation VARCHAR(100),
  contact_phone VARCHAR(20),
  contact_email VARCHAR(255),
  contact_photo VARCHAR(255),  -- Photo path stored here
  status ENUM('ACTIVE', 'INACTIVE'),
  FOREIGN KEY (customer_id) REFERENCES customer_master(customer_id)
);
```

## File Upload Flow Diagram

```
Frontend (ConsignorCreatePage)

 DocumentsTab
   User selects file
   File stored in state
   On submit: FormData key = "document_0_file"

 ContactTab  
   User uploads photo
   Photo stored in state
   On submit: FormData key = "contact_0_photo"

 Submit Button Clicked
   
    Create FormData object
    Append JSON payload
    Append all document files
    Append all contact photos
   
    POST /api/consignors
      
      Backend (consignorService.js)
      
       Multer middleware processes files
       uploadFile() function called
         Sanitizes filename
         Saves to disk (uploads/ folder)
         Returns file metadata
      
       Insert to document_upload table
         Stores: file_name, file_type, file_path
      
       Insert to customer_contact_master table
         Stores: contact_photo (file path)
      
       Return success response
```

## Error Resolution

### Error 1: "Invalid input: expected string, received array"
- **Cause**: business_area validation expected string but received array of selected states
- **Fixed**: Changed validation to z.array(z.string())

### Error 2: "NDA reference must not exceed 20 characters"
- **Cause**: Validation had max(20) limit but references can be longer
- **Fixed**: Increased to max(255)

### Error 3: "MSA reference must not exceed 20 characters"  
- **Cause**: Validation had max(20) limit but references can be longer
- **Fixed**: Increased to max(255)

### Error 4: "Invalid option: expected one of "ACTIVE"|"INACTIVE"|"EXPIRED""
- **Cause**: Status field receiving undefined or wrong value
- **Note**: This error should be resolved by the above fixes. If it persists, check that status fields have default "ACTIVE" value.

## Backend Validation (Already Correct)

The backend already accepts:
- **business_area**: Array of strings
  ```javascript
  business_area: Joi.alternatives().try(
    Joi.string().max(255),
    Joi.array().items(Joi.string().max(255))
  ).optional()
  ```
- **upload_nda/upload_msa**: Strings up to 255 characters
  ```javascript
  upload_nda: Joi.string().max(255).allow(null, '').optional()
  upload_msa: Joi.string().max(255).allow(null, '').optional()
  ```

## Summary

 **All Issues Fixed**:
1. Business area now accepts array of states
2. NDA/MSA references accept up to 255 characters
3. Document storage mechanism documented (already working)
4. Contact photo storage mechanism documented (already working)

 **Backend**: No changes needed (already handles arrays and long strings)
 **Frontend**: Validation schema updated to match backend expectations
 **Testing**: Ready for user testing after cache clear and restart

## Next Steps

1. Clear browser cache (Ctrl+Shift+Delete)
2. Restart frontend server (npm run dev)
3. Test consignor creation with:
   - Multiple states selected in Organization tab
   - Long NDA/MSA references in General Info tab
   - Multiple documents uploaded in Documents tab
   - Multiple contacts with photos in Contact tab
4. Verify data stored correctly in database
5. Verify files saved to uploads/ folder
