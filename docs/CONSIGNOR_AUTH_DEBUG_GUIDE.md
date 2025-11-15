# Consignor API Authentication & Role-Based Access Debug Guide

> **CRITICAL ISSUE FOUND: Frontend not sending authentication cookie with POST requests**

---

##  **ROOT CAUSE IDENTIFIED**

### **The Problem in ConsignorCreatePage.jsx (Line 407-417)**

**Current Broken Code:**
```javascript
// Get token and API URL
const token = localStorage.getItem('token');  //  Token is NOT in localStorage!
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Use fetch directly for multipart/form-data
const response = await fetch(${apiUrl}/api/consignors, {
  method: 'POST',
  headers: {
    'Authorization': Bearer   //  Sends "Bearer null" or "Bearer undefined"
  },
  body: formDataPayload
});
```

**Why This Fails:**
1.  Your app uses **cookie-based authentication** (HTTP-only cookie named \uthToken\)
2.  Token is **NOT** stored in \localStorage\ - it's in an HTTP-only cookie
3.  \localStorage.getItem('token')\ returns \
ull\
4.  Authorization header becomes \Bearer null\
5.  Backend receives no valid token  returns 403 JWT_MALFORMED

**Why GET /api/consignors works:**
- Uses Redux/axios which automatically includes cookies (\credentials: 'include'\)

**Why POST /api/consignors fails:**
- Uses raw \etch()\ without \credentials: 'include'\
- Cookies are NOT sent automatically
- Backend receives no authentication

---

##  **THE FIX**

### **Option 1: Add \credentials: 'include'\ to fetch (Quick Fix)**

```javascript
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const response = await fetch(${apiUrl}/api/consignors, {
  method: 'POST',
  credentials: 'include',  //  ADD THIS LINE!
  body: formDataPayload
});
```

### **Option 2: Use axios api instance (Recommended)**

```javascript
import api from '../../../utils/api';

// Use the configured axios instance
const response = await api.post('/consignors', formDataPayload, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});
```

---

##  **Why This Wasn't Obvious**

1. **GET request uses Redux + axios**  Automatically includes cookies
2. **POST request uses raw fetch**  Does NOT include cookies by default
3. **Same token, different transport mechanisms**
4. **HTTP-only cookies require explicit \credentials: 'include'\ in fetch**

---

##  **Current vs Fixed Flow**

### **Current (Broken) Flow:**
```
Browser  POST /api/consignors
  Headers: (no Cookie header!)
  Body: FormData

Backend  authenticateToken middleware
  Checks cookie:  Not found
  Checks Authorization header:  "Bearer null"
  Result: 403 Forbidden (JWT_MALFORMED)
```

### **Fixed Flow:**
```
Browser  POST /api/consignors
  Credentials: include
  Headers: Cookie: authToken=eyJhbGci...
  Body: FormData

Backend  authenticateToken middleware
  Checks cookie:  Found!
  Verifies JWT:  Valid!
  Checks role:  UT001 (Product Owner)
  Result: 201 Created
```

---

##  **Implementation Steps**

1. Open \rontend/src/features/consignor/pages/ConsignorCreatePage.jsx\
2. Find line ~407 (in handleSubmit function)
3. Either:
   - Add \credentials: 'include'\ to fetch call
   - OR replace with axios api instance
4. Save file
5. Test consignor creation
6.  Should work immediately (no need to clear cookies!)

---

##  **Related Files**

- **Fix Location:** \rontend/src/features/consignor/pages/ConsignorCreatePage.jsx\ (Line 407)
- **Backend Auth:** \	ms-backend/middleware/auth.js\
- **Backend Routes:** \	ms-backend/routes/consignor.js\
- **Axios Config:** \rontend/src/utils/api.js\ (already has \withCredentials: true\)

---

**Status:**  CRITICAL - Fix required in ConsignorCreatePage.jsx
**Impact:** Blocks all consignor creation functionality
**Effort:** 1 line change (add \credentials: 'include'\)
