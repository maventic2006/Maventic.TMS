# Consignor Document Handling - Complete Implementation Guide

> **Goal:** Implement complete document upload, view, and download functionality for consignor module  
> **Status:**  IN PROGRESS  

---

##  Overview

The consignor module has three types of file uploads:
1. **General Info Tab**: NDA & MSA documents
2. **Contacts Tab**: Contact photos
3. **Documents Tab**: General documents (licenses, certificates, etc.)

### Current State

 **Upload Functionality**: Files are uploaded successfully in create page  
 **View Functionality**: Files cannot be viewed/downloaded in details page  
 **Contact Display**: Not all contact fields are visible in view tab  

---

##  Implementation Plan

### Phase 1: Backend - File Serving Endpoints

#### 1.1 Create File Download Route

\\\javascript
// tms-backend/routes/consignor.js

/**
 * GET /api/consignors/:customerId/documents/:documentId/download
 * Download a document file
 */
router.get(
  '/:customerId/documents/:documentId/download',
  authenticate,
  consignorController.downloadDocument
);

/**
 * GET /api/consignors/:customerId/contacts/:contactId/photo
 * Download contact photo
 */
router.get(
  '/:customerId/contacts/:contactId/photo',
  authenticate,
  consignorController.downloadContactPhoto
);

/**
 * GET /api/consignors/:customerId/general/:fileType/download
 * Download NDA or MSA file
 * fileType: 'nda' | 'msa'
 */
router.get(
  '/:customerId/general/:fileType/download',
  authenticate,
  consignorController.downloadGeneralDocument
);
\\\

#### 1.2 Implement Controller Methods

\\\javascript
// tms-backend/controllers/consignorController.js

const downloadDocument = async (req, res) => {
  try {
    const { customerId, documentId } = req.params;
    
    const file = await consignorService.getDocumentFile(customerId, documentId);
    
    if (!file) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    
    // Set headers for file download
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', \ttachment; filename=\"\\"\);
    
    // Stream file
    res.send(file.buffer);
  } catch (error) {
    console.error('Download document error:', error);
    return res.status(500).json({ success: false, message: 'Failed to download document' });
  }
};

const downloadContactPhoto = async (req, res) => {
  try {
    const { customerId, contactId } = req.params;
    
    const file = await consignorService.getContactPhoto(customerId, contactId);
    
    if (!file) {
      return res.status(404).json({ success: false, message: 'Photo not found' });
    }
    
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', \inline; filename=\"\\"\);
    res.send(file.buffer);
  } catch (error) {
    console.error('Download photo error:', error);
    return res.status(500).json({ success: false, message: 'Failed to download photo' });
  }
};

const downloadGeneralDocument = async (req, res) => {
  try {
    const { customerId, fileType } = req.params;
    
    const file = await consignorService.getGeneralDocument(customerId, fileType);
    
    if (!file) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', \ttachment; filename=\"\\"\);
    res.send(file.buffer);
  } catch (error) {
    console.error('Download general document error:', error);
    return res.status(500).json({ success: false, message: 'Failed to download document' });
  }
};
\\\

#### 1.3 Implement Service Methods

\\\javascript
// tms-backend/services/consignorService.js

const getDocumentFile = async (customerId, documentId) => {
  try {
    // Get document metadata
    const document = await knex('consignor_documents as cd')
      .join('document_upload as du', 'cd.document_id', 'du.document_id')
      .where('cd.customer_id', customerId)
      .where('cd.document_unique_id', documentId)
      .select(
        'du.file_name',
        'du.file_type',
        'du.file_xstring_value' // LONGTEXT column containing base64 or binary data
      )
      .first();
    
    if (!document) return null;
    
    // Convert base64 to buffer if needed
    const buffer = Buffer.from(document.file_xstring_value, 'base64');
    
    return {
      fileName: document.file_name,
      mimeType: document.file_type,
      buffer
    };
  } catch (error) {
    console.error('Get document file error:', error);
    throw error;
  }
};

const getContactPhoto = async (customerId, contactId) => {
  try {
    const contact = await knex('contact')
      .where('customer_id', customerId)
      .where('contact_id', contactId)
      .first();
    
    if (!contact || !contact.contact_photo) return null;
    
    // If contact_photo is stored in document_upload table (reference)
    const photo = await knex('document_upload')
      .where('document_id', contact.contact_photo)
      .first();
    
    if (!photo) return null;
    
    const buffer = Buffer.from(photo.file_xstring_value, 'base64');
    
    return {
      fileName: photo.file_name,
      mimeType: photo.file_type,
      buffer
    };
  } catch (error) {
    console.error('Get contact photo error:', error);
    throw error;
  }
};

const getGeneralDocument = async (customerId, fileType) => {
  try {
    const fieldName = fileType === 'nda' ? 'upload_nda' : 'upload_msa';
    
    const consignor = await knex('consignor_basic_information')
      .where('customer_id', customerId)
      .first();
    
    if (!consignor || !consignor[fieldName]) return null;
    
    // Get file from document_upload table
    const file = await knex('document_upload')
      .where('document_id', consignor[fieldName])
      .first();
    
    if (!file) return null;
    
    const buffer = Buffer.from(file.file_xstring_value, 'base64');
    
    return {
      fileName: file.file_name,
      mimeType: file.file_type,
      buffer
    };
  } catch (error) {
    console.error('Get general document error:', error);
    throw error;
  }
};
\\\

---

### Phase 2: Frontend - Document Display Components

#### 2.1 Update GeneralInfoViewTab - Add File Display

\\\javascript
// frontend/src/features/consignor/components/GeneralInfoViewTab.jsx

// Add download handler
const handleDownloadDocument = async (fileType) => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const response = await fetch(
      \\/api/consignors/\/general/\/download\,
      { credentials: 'include' }
    );
    
    if (!response.ok) throw new Error('Download failed');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \\_\\;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download error:', error);
    alert('Failed to download document');
  }
};

// In the NDA/MSA Documents section, add download buttons
{consignor.upload_nda && (
  <div>
    <label>NDA Document</label>
    <button onClick={() => handleDownloadDocument('nda')}>
      <Download size={16} />
      Download NDA
    </button>
  </div>
)}

{consignor.upload_msa && (
  <div>
    <label>MSA Document</label>
    <button onClick={() => handleDownloadDocument('msa')}>
      <Download size={16} />
      Download MSA
    </button>
  </div>
)}
\\\

#### 2.2 Update ContactViewTab - Display All Fields

\\\javascript
// frontend/src/features/consignor/components/ContactViewTab.jsx

// Add photo display with download
const getPhotoUrl = (contactId) => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return \\/api/consignors/\/contacts/\/photo\;
};

// In contact card, always display photo
{contact.photo ? (
  <img
    src={getPhotoUrl(contact.contact_id)}
    alt={contact.name}
    style={{
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      objectFit: 'cover'
    }}
  />
) : (
  <User size={24} />
)}

// Ensure ALL fields are displayed (remove conditionals)
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
  <div>
    <label>Contact ID</label>
    <p>{contact.contact_id || 'N/A'}</p>
  </div>
  
  <div>
    <label>Name</label>
    <p>{contact.name || 'N/A'}</p>
  </div>
  
  <div>
    <label>Designation</label>
    <p>{contact.designation || 'N/A'}</p>
  </div>
  
  <div>
    <label>Phone Number</label>
    <p>
      {contact.country_code && \\ \}
      {contact.number || 'N/A'}
    </p>
  </div>
  
  <div>
    <label>Email</label>
    <p>{contact.email || 'N/A'}</p>
  </div>
  
  <div>
    <label>Role</label>
    <p>{contact.role || 'N/A'}</p>
  </div>
  
  <div>
    <label>Team</label>
    <p>{contact.team || 'N/A'}</p>
  </div>
  
  <div>
    <label>Country Code</label>
    <p>{contact.country_code || 'N/A'}</p>
  </div>
  
  <div>
    <label>LinkedIn</label>
    {contact.linkedin_link ? (
      <a href={contact.linkedin_link} target=\"_blank\" rel=\"noopener noreferrer\">
        View Profile
      </a>
    ) : (
      <p>N/A</p>
    )}
  </div>
  
  <div>
    <label>Status</label>
    <p>{contact.status || 'N/A'}</p>
  </div>
</div>
\\\

#### 2.3 Update DocumentsViewTab - Add Download Buttons

\\\javascript
// frontend/src/features/consignor/components/DocumentsViewTab.jsx

const handleDownloadDocument = async (documentId, fileName) => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const response = await fetch(
      \\/api/consignors/\/documents/\/download\,
      { credentials: 'include' }
    );
    
    if (!response.ok) throw new Error('Download failed');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download error:', error);
    alert('Failed to download document');
  }
};

// In document card, add download button
<button
  onClick={() => handleDownloadDocument(
    document.document_unique_id,
    document.original_file_name || 'document.pdf'
  )}
  style={{
    padding: '8px 16px',
    backgroundColor: theme.colors.primary.background,
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  }}
>
  <Download size={16} style={{ marginRight: '8px' }} />
  Download
</button>
\\\

---

### Phase 3: Testing Checklist

#### 3.1 Create Page Testing

- [ ] Upload NDA file in General Info tab
- [ ] Upload MSA file in General Info tab
- [ ] Upload contact photo in Contacts tab
- [ ] Upload multiple documents in Documents tab
- [ ] Verify all files are stored in database
- [ ] Verify file metadata is correct

#### 3.2 Details Page Testing

- [ ] View General Info tab - see NDA/MSA download buttons
- [ ] Download NDA file successfully
- [ ] Download MSA file successfully
- [ ] View Contacts tab - see all contact fields
- [ ] View contact photos inline
- [ ] View Documents tab - see all document details
- [ ] Download document files successfully
- [ ] Verify file previews work (for images/PDFs)

#### 3.3 Edge Cases

- [ ] Test with no files uploaded
- [ ] Test with large files (> 5MB - should fail validation)
- [ ] Test with invalid file types
- [ ] Test file download with no auth token
- [ ] Test concurrent downloads

---

##  Implementation Priority

**Priority 1 (High):**
1. Backend download endpoints
2. ContactViewTab - display all fields
3. DocumentsViewTab - download buttons

**Priority 2 (Medium):**
4. GeneralInfoViewTab - NDA/MSA downloads
5. Contact photo inline display

**Priority 3 (Low):**
6. Document preview/thumbnails
7. Progress indicators for downloads

---

##  Database Schema Reference

### Tables Involved:

1. **consignor_basic_information**
   - \upload_nda\: Document ID reference (nullable)
   - \upload_msa\: Document ID reference (nullable)

2. **contact**
   - \contact_photo\: Document ID reference (nullable)

3. **consignor_documents**
   - \document_unique_id\: Primary identifier
   - \document_id\: Foreign key to document_upload
   - \customer_id\: Foreign key to consignor

4. **document_upload**
   - \document_id\: Primary key
   - \ile_name\: Original filename
   - \ile_type\: MIME type
   - \ile_xstring_value\: LONGTEXT - base64 encoded file data

---

##  Next Steps

1. Implement backend download routes
2. Update view components with download functionality
3. Test thoroughly with various file types
4. Add error handling and loading states
5. Document API endpoints in project docs

---

**Current Status:** Ready for implementation  
**Estimated Time:** 4-6 hours for complete implementation  
**Dependencies:** None - all required infrastructure exists  
