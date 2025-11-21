#  Test Consignor Creation with File Uploads!

> **File upload issue fixed - test immediately (no restart needed)!**

---

##  **What Was Fixed**

**Problem:**
- Frontend was sending filename strings (\\"maventic-logo.png\"\) in JSON payload
- Backend validation rejected them (expects File or null)
- Error: \"One or more fields exceed maximum length\"

**Solution:**
- Set file fields to \
ull\ in JSON payload
- Send actual File objects separately in FormData
- Backend gets filenames automatically from File objects

---

##  **Test Steps**

### **1. Refresh Browser** (Vite hot-reloads automatically)

\\\
Press: Ctrl+Shift+R or F5
\\\

### **2. Navigate to Create Page**

\\\
http://localhost:5173/consignor/create
\\\

### **3. Fill Form with File Uploads**

**General Information:**
- Customer Name: \Acme Corporation\
- Search Term: \ACME\
- Industry Type: \Technology\
- Currency: \INR\
- Payment Term: \NET_30\
- **Upload NDA**:  Select a PDF file (e.g., contract.pdf)
- **Upload MSA**:  Select a PDF file (e.g., agreement.pdf)

**Contact Information:**
- Click \"Add Contact\"
- Name: \John Smith\
- Phone: \9876543210\
- Email: \john@acme.com\
- Role: \Manager\
- **Upload Photo**:  Select an image file (e.g., profile.jpg)

**Organization Details:**
- Company Code: \ACME2024\
- Business Areas: Select \Maharashtra\, \Karnataka\

**Documents:**
- Click \"Add Document\"
- Document Type: \GST Certificate\ (or any type)
- Document Number: \GST123456\
- Valid From: \2025-01-01\
- Valid To: \2026-01-01\
- Country: \India\
- **Upload File**:  Select a PDF file (e.g., certificate.pdf)

### **4. Click Submit**

---

##  **Expected Behavior**

### **Browser Network Tab (F12  Network):**

**Request Payload:**
\\\
Content-Type: multipart/form-data

payload: {
  \"general\": {
    \"upload_nda\": null,    //  Not a filename string!
    \"upload_msa\": null      //  Not a filename string!
  },
  \"contacts\": [{
    \"photo\": null           //  Not a filename string!
  }]
}

contact_0_photo: (binary)    //  Actual File object
document_0_file: (binary)    //  Actual File object
general_nda: (binary)        //  Actual File object
general_msa: (binary)        //  Actual File object
\\\

### **Backend Logs:**

\\\
 Auto-generated customer_id: CON0001

 ===== CREATE CONSIGNOR =====
User ID: POWNER001

Payload: {
  \"general\": {
    \"customer_name\": \"Acme Corporation\",
    \"upload_nda\": null,
    \"upload_msa\": null
  },
  \"contacts\": [{
    \"name\": \"John Smith\",
    \"photo\": null
  }],
  \"documents\": [{
    \"document_type_id\": \"DTCONS007\",
    \"fileKey\": \"document_0_file\"
  }]
}

Files: ['contact_0_photo', 'document_0_file', 'general_nda', 'general_msa']

 Consignor created successfully
\\\

### **Frontend:**

\\\
 Success toast appears
 Redirects to list page after 2 seconds
 New consignor visible with ID: CON0001
 Files successfully uploaded
\\\

---

##  **If You See Errors**

### **Error: \"One or more fields exceed maximum length\"**

**Cause:** Old code still running (browser cache)

**Solution:**
\\\
1. Hard refresh: Ctrl+Shift+R
2. Clear browser cache
3. Close and reopen browser
\\\

### **Error: \"File upload failed\"**

**Cause:** File too large or wrong format

**Solution:**
\\\
- Check file size (should be < 10MB)
- Check file format (PDF for documents, JPG/PNG for photos)
\\\

### **Error: \"Validation failed\"**

**Cause:** Required fields missing

**Solution:**
\\\
- Fill all required fields (red asterisk *)
- Check each tab for validation errors (red dot indicator)
\\\

---

##  **Success Indicators**

- [x] **No \"length exceeded\" error**
- [x] **Files uploaded successfully**
- [x] **201 Created response**
- [x] **Success toast displayed**
- [x] **Redirect to list page**
- [x] **New consignor visible in list**

---

##  **What Changed in Payload**

### **BEFORE (Broken):**
\\\json
{
  \"general\": {
    \"upload_nda\": \"Visily-Transporter_Maintainance_12-06-2025_06-34 (1).pdf\"  //  String
  },
  \"contacts\": [{
    \"photo\": \"maventic-logo.png\"  //  String
  }],
  \"documents\": [{
    \"fileName\": \"Theme Details.pdf\",  //  Extra field
    \"fileType\": \"application/pdf\"     //  Extra field
  }]
}
\\\

### **AFTER (Fixed):**
\\\json
{
  \"general\": {
    \"upload_nda\": null  //  null (file sent separately)
  },
  \"contacts\": [{
    \"photo\": null  //  null (file sent separately)
  }],
  \"documents\": [{
    \"fileKey\": \"document_0_file\"  //  Reference only
  }]
}

// Files sent separately in FormData:
contact_0_photo: (binary)
document_0_file: (binary)
general_nda: (binary)
general_msa: (binary)
\\\

---

**Ready to test!** Just refresh browser and try uploading files! 
