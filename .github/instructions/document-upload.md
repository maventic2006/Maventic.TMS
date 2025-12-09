#  Document Upload Guidelines

> **Updated for TMS-Dev-2 - Node.js + Express + MySQL Architecture**

This document provides implementation and validation standards for the **Document Upload Functionality** within the TMS (Transport Management System) application.

---

##  TMS Application Architecture

### Technology Stack
- **Frontend**: React 19.1.1 + Vite 7.1.7 + TailwindCSS 4.1.14
- **Backend**: Node.js + Express 5.1.0
- **Database**: MySQL 8.0 with Knex.js 3.1.0 ORM
- **File Handling**: Multer 2.0.2
- **Authentication**: JWT 9.0.2

### Document Storage Strategy
**Current**: Local file system storage in `/uploads/documents/{entityType}/`
**Database**: Stores file metadata and paths only (NOT BLOB/XSTRING)
**Future**: AWS S3 integration planned

---

##  Database Tables

### Entity Document Tables
- `transporter_documents`
- `vehicle_documents`
- `driver_documents`
- `warehouse_documents`

### Configuration Tables
- `doc_type_configuration`
- `document_name_master`

**Key Fields**:
- `document_type_id` - Links to configuration
- `file_path` - Local file system path
- `is_mandatory`, `is_expiry_required`, `is_verification_required` - Validation flags

---

##  Frontend Implementation

### File Upload Component Pattern
```jsx
const handleUpload = async () => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('entityType', entityType);
  formData.append('documentTypeId', documentTypeId);
  
  await dispatch(uploadDocument(formData)).unwrap();
};
```

### Validation Rules
- File types: PDF, JPEG, PNG only
- Max size: 10MB
- Required fields: documentTypeId, documentNumber
- Expiry validation: validTo >= validFrom

---

##  Backend Implementation

### Multer Configuration
```javascript
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/documents', req.body.entityType);
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const name = `${req.body.documentTypeId}_${Date.now()}-${Math.random() * 10000}${path.extname(file.originalname)}`;
    cb(null, name);
  }
});
```

### Controller Pattern
- Use Knex transactions for atomicity
- Check for duplicates before insert
- Clean up uploaded files on error
- Soft delete (set active=false)

---

##  Validation & Error Handling

### Frontend Errors
| Scenario | Message |
|----------|---------|
| Invalid type | "Only PDF, JPEG, PNG allowed" |
| Too large | "File exceeds 10MB limit" |
| Missing field | "Document number required" |

### Backend Responses
| Status | Scenario |
|--------|----------|
| 400 | No file uploaded |
| 409 | Duplicate document |
| 413 | File too large |
| 500 | Server error |

---

##  Security Best Practices

1. Validate MIME types on both frontend and backend
2. Sanitize filenames before storage
3. Store files outside web root
4. Use JWT authentication for all endpoints
5. Log all operations for audit trail

---

##  Storage Organization

```
backend/uploads/documents/
 transporter/
 vehicle/
 driver/
 warehouse/
```

**File naming**: `{documentTypeId}_{timestamp}-{random}.{ext}`

---

##  Mandatory Document Handling

```javascript
// Check configuration
const config = await knex('doc_type_configuration')
  .where({ document_type_id, user_type })
  .first();

if (config.is_mandatory && !uploaded) {
  return error('Mandatory document missing');
}

if (config.is_expiry_required && !validTo) {
  return error('Expiry date required');
}
```

---

##  Developer Notes

- Always use transactions for file operations
- Clean up files on error/rollback
- Use soft delete (active=false) not physical delete
- Log user ID, timestamp, operation for audit

---

##  Future Enhancements

1. AWS S3 Integration
2. Document Versioning
3. Thumbnail Generation
4. OCR Text Extraction
5. Virus Scanning (ClamAV)
6. Bulk Upload
7. E-Signature Support
8. Expiry Alerts

---

**Version:** 2.0  
**Last Updated:** 2024-01-23  
**Maintained By:** TMS Development Team
