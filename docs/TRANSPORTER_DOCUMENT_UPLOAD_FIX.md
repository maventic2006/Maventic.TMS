# Transporter Document Upload Fix

**Date**: November 15, 2025  
**Issue**: Failed to create transporter when uploading documents due to base64 data exceeding TEXT field size limit  
**Solution**: Upgraded database column from TEXT to LONGTEXT and implemented document view/download functionality

---

## Problem Statement

When users attempted to create a transporter with uploaded documents, the transaction would fail with a database error. The root cause was that the `document_upload.file_xstring_value` column was defined as `TEXT`, which has a maximum size of 65,535 bytes (~64KB).

Base64-encoded files (especially PDFs and images) often exceed this limit:

- A 1MB PDF becomes ~1.33MB when base64-encoded (33% overhead)
- A 5MB image becomes ~6.65MB when base64-encoded

Since the frontend allows uploads up to 5MB, the base64 data could be up to ~6.65MB, causing the database insert to fail silently during the transaction.

---

## Solution Overview

### 1. Database Schema Upgrade

Changed `document_upload.file_xstring_value` from `TEXT` to `LONGTEXT` to support larger file data.

**Column Size Comparison:**

- `TEXT`: 65,535 bytes (~64KB) ❌
- `LONGTEXT`: 4,294,967,295 bytes (~4GB) ✅

This allows storing base64-encoded files up to ~3GB raw size (accounting for 33% base64 overhead).

### 2. Document Access API

Created a new API endpoint to fetch individual document files on-demand rather than loading all file data in list queries.

### 3. Frontend View/Download

Implemented View and Download buttons in the transporter details page to display and download uploaded documents.

---

## Implementation Details

### Backend Changes

#### 1. Database Migration

**File**: `tms-backend/migrations/20251115000001_alter_document_upload_file_xstring_value_to_longtext.js`

```javascript
exports.up = function (knex) {
  return knex.schema.alterTable("document_upload", function (table) {
    table.specificType("file_xstring_value", "LONGTEXT").alter();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("document_upload", function (table) {
    table.text("file_xstring_value").alter();
  });
};
```

**Execution:**

```bash
npm run migrate
```

**Verification:**

```sql
SHOW COLUMNS FROM document_upload WHERE Field = 'file_xstring_value';
-- Result: Type = 'longtext'
```

#### 2. Document File API Endpoint

**File**: `tms-backend/controllers/transporterController.js`

Added `getDocumentFile()` function:

- Fetches document by `document_unique_id`
- Returns document metadata + base64 file data
- Includes proper error handling

**Endpoint**: `GET /api/transporter/document/:documentId`

**Request:**

```javascript
GET /api/transporter/document/T001_DOC0001
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "documentType": "GST Certificate",
    "documentNumber": "29ABCDE1234F1Z5",
    "fileName": "gst_certificate.pdf",
    "fileType": "application/pdf",
    "fileData": "JVBERi0xLjQKJeLjz9MK..." // base64 string
  }
}
```

#### 3. Route Configuration

**File**: `tms-backend/routes/transporter.js`

Added route:

```javascript
router.get(
  "/document/:documentId",
  authenticateToken,
  checkProductOwnerAccess,
  getDocumentFile
);
```

#### 4. Updated `getTransporterById` Response

Added `documentUniqueId` field to document objects in the response:

```javascript
documents: documents.map((doc) => ({
  documentUniqueId: doc.document_unique_id, // NEW - needed for fetching file
  documentType: doc.documentTypeName,
  documentNumber: doc.document_number,
  fileName: doc.file_name,
  fileType: doc.file_type,
  // fileData excluded to reduce response size
}));
```

### Frontend Changes

#### 1. DocumentsViewTab Component

**File**: `frontend/src/features/transporter/components/DocumentsViewTab.jsx`

**New Features:**

- View button - Opens document in preview modal
- Download button - Downloads file to user's device
- Preview modal with support for images and PDFs
- Loading states during document fetch

**Key Functions:**

##### `handleViewDocument(documentUniqueId, fileName, fileType)`

- Fetches document data from API
- Opens preview modal with file content
- Shows loading spinner during fetch

##### `handleDownloadDocument(documentUniqueId, fileName, fileType)`

- Fetches document data from API
- Converts base64 to Blob
- Triggers browser download
- Shows loading spinner during fetch

##### Preview Modal Features:

- Image preview (JPEG, PNG, GIF)
- PDF preview (embedded iframe)
- Fallback message for unsupported file types
- Close button
- Responsive design

**UI Enhancements:**

```jsx
<button
  onClick={() =>
    handleViewDocument(doc.documentUniqueId, doc.fileName, doc.fileType)
  }
  disabled={loadingDocument === doc.documentUniqueId}
  className="..."
>
  {loadingDocument === doc.documentUniqueId ? (
    <>
      <Spinner /> Loading...
    </>
  ) : (
    <>
      <Eye /> View
    </>
  )}
</button>
```

---

## File Size Limits

### Current Configuration

**Frontend (ThemeTable.jsx):**

```javascript
const maxSize = 5 * 1024 * 1024; // 5MB
```

**Backend (server.js):**

```javascript
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
```

**Database:**

- `LONGTEXT`: Up to 4GB

### Recommended Limits

- **Images**: 5MB max (current)
- **PDFs**: 10MB max (can be increased if needed)
- **Other documents**: 5MB max

To increase limits:

1. Update `ThemeTable.jsx` maxSize
2. Update `server.js` express limits
3. Update MySQL `max_allowed_packet` if needed

---

## Testing Checklist

### Backend Testing

- [x] Migration runs successfully
- [x] `file_xstring_value` column is LONGTEXT
- [x] Document creation with 5MB file succeeds
- [x] `/api/transporter/document/:documentId` returns file data
- [x] API requires authentication

### Frontend Testing

- [x] Create transporter with document upload (5MB PDF)
- [x] View uploaded document in details page
- [x] Download document works correctly
- [x] Preview modal displays images correctly
- [x] Preview modal displays PDFs correctly
- [x] Loading states work during fetch
- [x] Error handling for failed requests

### Integration Testing

- [x] Create transporter → Upload document → View in details → Download
- [x] Multiple documents per transporter
- [x] Different file types (PDF, JPEG, PNG)
- [x] Large files (close to 5MB limit)

---

## Browser Compatibility

**Tested Browsers:**

- ✅ Chrome 120+
- ✅ Firefox 120+
- ✅ Edge 120+
- ✅ Safari 17+

**Known Issues:**

- None

---

## Performance Considerations

### Optimizations Implemented

1. **Lazy Loading**: File data only loaded when user clicks View/Download
2. **Response Size**: `getTransporterById` excludes file data from list
3. **Streaming**: Could implement streaming for very large files (future enhancement)

### Database Performance

- `LONGTEXT` columns are stored off-page, minimal impact on table scans
- Index on `document_unique_id` ensures fast lookups
- Transaction isolation prevents partial writes

---

## Security Considerations

1. **Authentication**: All document endpoints require valid JWT token
2. **Authorization**: Only product owners can access transporter documents
3. **Data Validation**: File type and size validated on upload
4. **SQL Injection**: Using parameterized queries via Knex
5. **XSS Prevention**: Base64 data rendered in controlled contexts

---

## Future Enhancements

### Potential Improvements

1. **File Compression**: Compress files before base64 encoding (reduce size by 30-50%)
2. **Cloud Storage**: Move to S3/Azure Blob Storage for better scalability
3. **CDN Integration**: Serve files via CDN for faster downloads
4. **Thumbnail Generation**: Auto-generate thumbnails for images
5. **Virus Scanning**: Scan uploaded files for malware
6. **Watermarking**: Add watermarks to downloaded documents
7. **Audit Logging**: Track who viewed/downloaded which documents

### Alternative Approaches Considered

- **Option A**: Store files on disk (rejected - requires file system management)
- **Option B**: Use LONGTEXT (implemented - simple, works well)
- **Option C**: External storage service (future consideration for scale)

---

## Rollback Plan

If issues arise, rollback using:

```bash
cd tms-backend
npm run migrate:rollback
```

This will revert `file_xstring_value` to TEXT. However, any documents with large files will be truncated.

**Safer approach**: Keep LONGTEXT, fix issues in application code.

---

## Related Files Changed

### Backend

- `tms-backend/migrations/20251115000001_alter_document_upload_file_xstring_value_to_longtext.js` (NEW)
- `tms-backend/controllers/transporterController.js` (MODIFIED)
  - Added `getDocumentFile()` function
  - Updated `getTransporterById()` to include `documentUniqueId`
- `tms-backend/routes/transporter.js` (MODIFIED)
  - Added `/document/:documentId` route

### Frontend

- `frontend/src/features/transporter/components/DocumentsViewTab.jsx` (MODIFIED)
  - Added `handleViewDocument()` function
  - Added `handleDownloadDocument()` function
  - Added preview modal
  - Updated View/Download buttons

### Database

- `document_upload.file_xstring_value`: TEXT → LONGTEXT

---

## Summary

**Problem**: Document upload failed due to TEXT column size limit (64KB)  
**Solution**: Upgraded to LONGTEXT (4GB) + on-demand file fetching  
**Impact**: ✅ No breaking changes, backward compatible  
**Result**: Users can now upload and view documents up to 5MB without errors

---

## Troubleshooting

### Issue: "Route not found" Error

**Symptom**: When clicking View/Download, you see error: `{"error":"Route not found"}`

**Cause**: API call includes duplicate `/api` prefix (e.g., `/api/api/transporter/document/...`)

**Solution**:
The axios instance in `frontend/src/utils/api.js` already has `baseURL: "http://localhost:5000/api"`. Therefore, all API calls should use relative paths WITHOUT the `/api` prefix.

✅ **Correct**:

```javascript
api.get("/transporter/document/T001_DOC0001");
// Results in: http://localhost:5000/api/transporter/document/T001_DOC0001
```

❌ **Incorrect**:

```javascript
api.get("/api/transporter/document/T001_DOC0001");
// Results in: http://localhost:5000/api/api/transporter/document/T001_DOC0001
```

**Fix Applied**: Updated `DocumentsViewTab.jsx` to use `/transporter/document/...` instead of `/api/transporter/document/...`

---

## Support

For issues or questions:

1. Check error logs in `tms-backend/logs`
2. Verify migration status: `npm run migrate:status`
3. Test API endpoint: `GET /api/transporter/document/:documentId`
4. Review network tab for failed requests
5. Check console for duplicate `/api` in URLs

---

**Status**: ✅ COMPLETED  
**Tested**: ✅ YES  
**Production Ready**: ✅ YES
