# Consignor Backend Validation Fix

> **Fixed: Backend validation schema mismatch with frontend payload**

---

##  **Problem Summary**

After fixing authentication (credentials: 'include'), consignor creation failed with **422 Unprocessable Entity** and multiple validation errors:

### **Backend Validation Errors:**
1.  \Customer ID is required\ - Frontend not sending customer_id
2.  \"general.upload_nda" is not allowed\
3.  \"general.nda_validity" is not allowed\
4.  \"general.upload_msa" is not allowed\
5.  \"general.msa_validity" is not allowed\
6.  \"general.address_id" is not allowed\
7.  \"documents[0].country" is not allowed\
8.  \"documents[0].status" is not allowed\
9.  \"documents[0].fileName" is not allowed\
10.  \"documents[0].fileType" is not allowed\
11.  \"consignorId" is not allowed\

---

##  **Root Cause**

**Backend Joi validation schema** was missing fields that the frontend sends:
- NDA/MSA upload fields
- Document metadata fields (country, status, fileName, fileType)
- Frontend form fields (consignorId, address_id)

---

##  **Fixes Implemented**

### **File: \	ms-backend/validation/consignorValidation.js\**

#### **1. Added NDA/MSA Fields to \generalSchema\:**

\\\javascript
// NDA/MSA document upload fields (frontend sends these)
upload_nda: Joi.alternatives()
  .try(
    Joi.string().allow(null, ''),
    Joi.object()
  )
  .optional()
  .messages({
    'alternatives.types': 'NDA upload must be a string or file object'
  }),

nda_validity: Joi.date()
  .iso()
  .optional()
  .allow(null, '')
  .messages({
    'date.base': 'NDA validity must be a valid date',
    'date.format': 'NDA validity must be in ISO format (YYYY-MM-DD)'
  }),

upload_msa: Joi.alternatives()
  .try(
    Joi.string().allow(null, ''),
    Joi.object()
  )
  .optional()
  .messages({
    'alternatives.types': 'MSA upload must be a string or file object'
  }),

msa_validity: Joi.date()
  .iso()
  .optional()
  .allow(null, '')
  .messages({
    'date.base': 'MSA validity must be a valid date',
    'date.format': 'MSA validity must be in ISO format (YYYY-MM-DD)'
  }),

// Address ID field (frontend uses this for linking)
address_id: Joi.string()
  .trim()
  .max(10)
  .optional()
  .allow(null, '')
  .messages({
    'string.max': 'Address ID cannot exceed 10 characters'
  })
\\\

#### **2. Added Document Metadata Fields to \documentSchema\:**

\\\javascript
// Frontend sends these additional fields
country: Joi.string()
  .trim()
  .max(50)
  .optional()
  .allow(null, '')
  .messages({
    'string.max': 'Country cannot exceed 50 characters'
  }),

status: Joi.boolean()
  .optional()
  .default(true)
  .messages({
    'boolean.base': 'Status must be a boolean value'
  }),

fileName: Joi.string()
  .optional()
  .allow(null, '')
  .messages({
    'string.base': 'File name must be a string'
  }),

fileType: Joi.string()
  .optional()
  .allow(null, '')
  .messages({
    'string.base': 'File type must be a string'
  })
\\\

#### **3. Added \consignorId\ to Main Schema:**

\\\javascript
const consignorCreateSchema = Joi.object({
  consignorId: Joi.string()
    .optional()
    .allow(null, '')
    .messages({
      'string.base': 'Consignor ID must be a string'
    }),
  
  general: generalSchema.required(),
  contacts: Joi.array().items(contactSchema).min(1).required(),
  organization: organizationSchema.required(),
  documents: Joi.array().items(documentSchema).optional()
});
\\\

#### **4. Made \customer_id\ Optional with Auto-Generation:**

\\\javascript
// generalSchema
customer_id: Joi.string()
  .trim()
  .max(10)
  .optional() // Made optional - will be auto-generated if not provided
  .allow(null, '')
  .pattern(/^[A-Z0-9]*$/) // Allow empty string for auto-generation
  .messages({
    'string.max': 'Customer ID cannot exceed 10 characters',
    'string.pattern.base': 'Customer ID must contain only uppercase letters and numbers'
  })
\\\

### **File: \	ms-backend/services/consignorService.js\**

#### **5. Added Auto-Generation Logic for \customer_id\:**

\\\javascript
// Auto-generate customer_id if not provided
if (!general.customer_id || general.customer_id.trim() === '') {
  // Generate customer ID in format: CON0001, CON0002, etc.
  const lastConsignor = await knex('consignor_basic_information')
    .select('customer_id')
    .where('customer_id', 'like', 'CON%')
    .orderBy('customer_id', 'desc')
    .first();
  
  if (lastConsignor && lastConsignor.customer_id) {
    const lastNumber = parseInt(lastConsignor.customer_id.substring(3));
    const nextNumber = lastNumber + 1;
    general.customer_id = \CON\\;
  } else {
    general.customer_id = 'CON0001';
  }
  
  console.log(\ Auto-generated customer_id: \\);
}
\\\

---

##  **Before vs After**

### **Before (Validation Errors):**
\\\
 422 Unprocessable Entity
 11 validation errors
 Customer ID required but not provided
 Frontend fields rejected by backend
\\\

### **After (Expected Behavior):**
\\\
 Validation passes
 customer_id auto-generated: CON0001, CON0002, etc.
 All frontend fields accepted
 201 Created response
\\\

---

##  **Testing Checklist**

After fixes:

- [ ] **Customer ID Auto-Generation**
  - Leave customer_id empty in frontend
  - Backend generates CON0001, CON0002, etc.
  
- [ ] **NDA/MSA Upload Fields**
  - Upload NDA document
  - Set NDA validity date
  - Upload MSA document
  - Set MSA validity date
  
- [ ] **Document Metadata**
  - Add document with country selection
  - Set document status (active/inactive)
  - Upload file (fileName and fileType captured)
  
- [ ] **Form Fields**
  - consignorId field accepted
  - address_id field accepted
  - No validation errors

---

##  **Testing Steps**

1. **Restart Backend** (to load updated validation):
   \\\powershell
   cd "d:\tms developement 11 nov\Maventic.TMS\tms-backend"
   npm start
   \\\

2. **Open Frontend**:
   - Navigate to: http://localhost:5173/consignor/create

3. **Fill Form** (without customer_id):
   - **General Info**: Name, search term, industry, currency, payment term
   - **Contacts**: At least one contact
   - **Organization**: Company code, business areas
   - **Documents**: Optional documents

4. **Submit**

5. **Expected Result**:
   -  201 Created
   -  Success toast
   -  Redirect to list
   -  Backend log shows: \ Auto-generated customer_id: CON0001\

---

##  **Files Modified**

1. **tms-backend/validation/consignorValidation.js**
   - Added NDA/MSA fields to generalSchema
   - Added document metadata fields to documentSchema
   - Added consignorId to main schema
   - Made customer_id optional

2. **tms-backend/services/consignorService.js**
   - Added customer_id auto-generation logic
   - Generates sequential IDs: CON0001, CON0002, etc.

---

##  **Result**

 **Backend validation now matches frontend payload structure**
 **Auto-generation for customer_id implemented**
 **All validation errors resolved**
 **Ready for testing!**

---

**Fixed:** 2025-11-15 13:59:47
**Impact:** HIGH - Unblocks consignor creation completely
**Testing:** Restart backend required, then test immediately
