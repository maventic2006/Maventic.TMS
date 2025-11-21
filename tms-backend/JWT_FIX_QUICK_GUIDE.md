# Quick Test Guide - JWT Authentication Fix

## Issue You Reported

**Error**: `403 Forbidden` - `"jwt malformed"`
**Message**: `"Invalid or expired token"`

## Root Cause

Your JWT authentication token stored in the browser cookie became corrupted or malformed. This prevented the backend from validating your identity.

## What We Fixed

### 1. Automatic Token Refresh (Frontend)
- When a 403 error occurs with JWT-related messages, the frontend now:
  1. Detects the JWT error automatically
  2. Calls `/auth/refresh` to get a new token
  3. Retries your original request with the fresh token
  4. **You don't need to do anything - it happens automatically!**

### 2. Better Error Logging (Backend)
- Backend now provides detailed JWT error information:
  - `JWT_MALFORMED` - Token is corrupted
  - `JWT_EXPIRED` - Token has expired  
  - `JWT_NOT_ACTIVE` - Token not yet valid
  - Shows token source (cookie vs header)
  - Shows token preview for debugging

## Quick Fix Steps

### Option 1: Simple Browser Refresh (Try This First!)
1. **Clear browser cookies**:
   - Press `Ctrl+Shift+Delete`
   - Select "Cookies and other site data"
   - Click "Clear data"

2. **Refresh the page**: Press `F5`

3. **If you're logged out, log back in**:
   - Username: `POWNER001`
   - Password: `Powner@123`

4. **Try creating the consignor again**

### Option 2: Full Restart (If Option 1 Doesn't Work)

**Step 1: Restart Backend**
```powershell
# Open terminal in tms-backend folder
cd tms-backend
npm run dev
```

**Step 2: Restart Frontend**
```powershell
# Open NEW terminal in frontend folder
cd frontend
npm run dev
```

**Step 3: Clear Browser & Login**
1. Clear cookies (Ctrl+Shift+Delete)
2. Navigate to: http://localhost:5173/login
3. Login with POWNER001 / Powner@123

**Step 4: Test Consignor Creation**
1. Go to Create Consignor page
2. Fill all the data you had before:
   ```
   General Info:
   - Customer name: maventic
   - Search term: maventic
   - Industry type: Technology
   - Currency: INR
   - Payment term: NET_60
   - Remark: wertyuio
   - Name on PO: shubham
   - Approved by: aditya
   - Approved date: 2025-11-14
   - Upload NDA: Theme Details (1).pdf
   - Upload MSA: Theme Details.pdf
   
   Contacts:
   - Designation: staff
   - Name: shubham
   - Number: 9876543218
   - Photo: maventic-logo.png
   - Role: staff
   - Team: maventic
   - Country code: +91
   - Email: qewr@gmail.com
   
   Organization:
   - Company code: ACME89898
   - Business area: Andhra Pradesh, Arunachal Pradesh, Bihar, Chandigarh
   
   Documents:
   - Document type: DTCONS006 (whatever it is)
   - Document number: 345678
   - Valid from: 2025-07-04
   - Valid to: 2026-09-04
   - Country: India
   - Upload: Theme Details (1).pdf
   ```
3. Click "Submit"

## What to Watch For

### Expected Behavior (Success):

**In Browser Console** (Press F12):
```
 Making API Request: {url: '/consignors', method: 'POST'}
 API Response: {url: '/consignors', status: 201, data: {...}}
 Consignor created successfully!
```

### Expected Behavior (Auto-Refresh - Also Success!):

If your token was stale, you might see:
```
 Making API Request: {url: '/consignors', method: 'POST'}
 JWT Token Error detected: jwt malformed
 Attempting to refresh authentication token...
 Making API Request: {url: '/auth/refresh', method: 'POST'}
 Token refreshed successfully, retrying original request
 Making API Request: {url: '/consignors', method: 'POST'}
 API Response: {url: '/consignors', status: 201, data: {...}}
 Consignor created successfully!
```

**In Backend Console**:
```
 ===== AUTHENTICATION MIDDLEWARE CALLED =====
 Route: POST /consignors
 Cookie authToken: Present
 Token found in cookie
 Token preview: eyJhbGciOi...xyz (length: 187)
 Verifying token...
 Token verified successfully for user: POWNER001
 ===== AUTHENTICATION SUCCESS =====

 ===== CREATE CONSIGNOR =====
User ID: POWNER001
Payload: {consignorId: null, general: {...}, contacts: [...], ...}
Files: contact_0_photo, document_0_file
 Consignor created successfully
```

### If It Still Fails:

**Check Backend Console for These Logs**:
```
 TOKEN VERIFICATION FAILED: jwt malformed
 Error name: JsonWebTokenError
 JWT Error Details: {name: 'JsonWebTokenError', message: 'jwt malformed'}
```

**If you see this**, it means:
1. Your cookie is still corrupted
2. Try logging out completely: http://localhost:5173/login
3. Clear ALL browser data (not just cookies)
4. Login fresh

## Why This Happened

JWT tokens can become corrupted due to:
1. **Browser cache issues** - Old token stored incorrectly
2. **Multiple login attempts** - Overlapping tokens
3. **Concurrent requests** - Race conditions modifying cookies
4. **Browser extensions** - Interfering with cookies
5. **Network issues** - Incomplete token transmission

## The Permanent Fix

With our changes:
-  **Automatic Recovery**: Frontend detects and fixes corrupted tokens automatically
-  **No Manual Action**: You don't need to log out/in manually anymore
-  **Better Debugging**: Detailed logs help identify exact issue
-  **Improved UX**: Seamless token refresh without user interaction

## Still Having Issues?

If consignor creation still fails after:
1. Clearing cookies
2. Restarting backend/frontend
3. Logging in fresh

**Check these**:
1. **Backend running?**: http://localhost:5000/api/health should return `{"status": "ok"}`
2. **Frontend running?**: http://localhost:5173 should load
3. **Cookie present?**: DevTools  Application  Cookies  `authToken` should exist
4. **Console errors?**: Press F12  Console  Look for red error messages

**Share the following if still broken**:
- Full browser console logs (F12  Console  Screenshot)
- Full backend terminal output (copy/paste)
- DevTools Network tab for the failed request (F12  Network  Click failed request  Preview)

## Summary

**What you need to do NOW**:
1. Clear browser cookies (Ctrl+Shift+Delete)
2. Refresh page or restart frontend/backend
3. Login fresh if logged out
4. Try creating consignor again
5. **It should work now!** 

**What happens automatically**:
- Token corrupted? Frontend refreshes it automatically
- Token expired? Frontend gets a new one
- Refresh fails? Frontend redirects to login

**You're all set!** The fix is permanent and will handle JWT token issues automatically from now on.
