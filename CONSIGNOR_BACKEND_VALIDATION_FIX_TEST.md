#  Test Consignor Creation - Backend Validation Fixed!

> **Backend validation schema updated to match frontend payload - restart backend and test!**

---

##  **What Was Fixed**

**Backend Validation Schema (\consignorValidation.js\):**
-  Added NDA/MSA upload fields
-  Added document metadata fields (country, status, fileName, fileType)
-  Added consignorId field
-  Made customer_id optional with auto-generation

**Backend Service (\consignorService.js\):**
-  Auto-generates customer_id if not provided (CON0001, CON0002, etc.)

---

##  **Test Steps**

### **1. Restart Backend** (REQUIRED - validation schema cached)

\\\powershell
# Stop backend if running (Ctrl+C)
cd "d:\tms developement 11 nov\Maventic.TMS\tms-backend"
npm start
\\\

### **2. Open Frontend**

- Navigate to: http://localhost:5173/consignor/create
- Or refresh if already open: \Ctrl+Shift+R\

### **3. Fill Create Form**

**General Information:**
- Customer Name: \Acme Corporation\
- Search Term: \ACME\
- Industry Type: \Manufacturing\ (select from dropdown)
- Currency: \INR\ (select from dropdown)
- Payment Term: \NET_30\ (select from dropdown)
- Website: \https://www.acme.com\
- Status: \ACTIVE\

**Contact Information:**
- Click \"Add Contact\"
- Designation: \Manager\
- Name: \John Smith\
- Phone: \9876543210\
- Email: \john.smith@acme.com\
- Role: \PRIMARY_CONTACT\

**Organization Details:**
- Company Code: \ACME2024\
- Business Area: Select at least one state (e.g., \Maharashtra\, \Karnataka\)

**Documents:** (Optional)
- Click \"Add Document\"
- Document Type: Select from dropdown
- Document Number: \DOC123456\
- Valid From: Select date
- Valid To: Select date
- Country: \India\

### **4. Click Submit**

---

##  **Expected Backend Logs**

You should see:

\\\
 Auto-generated customer_id: CON0001

 ===== AUTHENTICATION MIDDLEWARE CALLED =====
 Route: POST /api/consignors
 Token found in cookie
 Token verified successfully for user: POWNER001

 ===== PRODUCT OWNER ACCESS CHECK =====
 Product Owner access granted

 ===== CREATE CONSIGNOR =====
 Consignor created successfully
\\\

---

##  **Success Indicators**

-  **No validation errors** in backend logs
-  **Auto-generated customer_id** shown in logs
-  **201 Created** response in browser Network tab
-  **Success toast** appears in frontend
-  **Redirect to list page** after 2 seconds
-  **New consignor visible** in list with CON0001 ID

---

##  **If It Still Fails**

### **Check Backend Logs:**

**If you see validation errors:**
-  Backend not restarted  Restart with \
pm start\
-  Old validation schema cached  Clear node cache: \
pm cache clean --force\

**If you see "NO TOKEN FOUND":**
-  Cookie not sent  Check browser cookies (F12  Application  Cookies)
-  Frontend issue  Refresh browser with \Ctrl+Shift+R\

### **Check Frontend Console (F12):**

**Look for:**
- Network tab  POST /api/consignors
- Request headers should include: \Cookie: authToken=...\
- Response should be 201 (not 422 or 403)

---

##  **Validation Fixes Summary**

| Issue | Before | After |
|-------|--------|-------|
| **customer_id** |  Required (not sent) |  Auto-generated (CON0001) |
| **upload_nda** |  Not allowed |  Accepted (optional) |
| **nda_validity** |  Not allowed |  Accepted (optional) |
| **upload_msa** |  Not allowed |  Accepted (optional) |
| **msa_validity** |  Not allowed |  Accepted (optional) |
| **address_id** |  Not allowed |  Accepted (optional) |
| **documents[].country** |  Not allowed |  Accepted (optional) |
| **documents[].status** |  Not allowed |  Accepted (boolean) |
| **documents[].fileName** |  Not allowed |  Accepted (optional) |
| **documents[].fileType** |  Not allowed |  Accepted (optional) |
| **consignorId** |  Not allowed |  Accepted (optional) |

---

##  **Next Consignor Will Be**

- 1st creation: **CON0001**
- 2nd creation: **CON0002**
- 3rd creation: **CON0003**
- And so on...

---

**Ready to test!** Just restart the backend and try creating a consignor! 
