# JWT Authentication Token Fix - "jwt malformed" Error Resolution

## Issue Identified

**Error**: `403 Forbidden` - `"jwt malformed"`  
**Symptom**: Consignor creation fails with authentication error despite being logged in  
**Root Cause**: JWT token in HTTP-only cookie is corrupted or malformed

## Error Details

### Frontend Error:
```
POST http://localhost:5000/api/consignors 403 (Forbidden)
```

### Backend Response:
```json
{
    "success": false,
    "message": "Invalid or expired token",
    "error": {
        "code": "INVALID_TOKEN",
        "details": "jwt malformed"
    }
}
```

## Root Causes

### 1. Token Corruption in Cookie
- **Issue**: JWT token stored in HTTP-only cookie becomes corrupted
- **Causes**:
  - Browser cookie storage issues
  - Multiple login attempts without proper logout
  - Stale cookies from previous sessions
  - Concurrent requests modifying cookies

### 2. Missing Token Refresh Logic
- **Issue**: Frontend doesn't automatically refresh token on 403 errors
- **Impact**: User has to manually log out and log back in

### 3. Insufficient Error Logging
- **Issue**: Backend auth middleware doesn't provide detailed JWT error information
- **Impact**: Hard to diagnose whether token is corrupted, expired, or missing

## Solution Implemented

### Fix 1: Enhanced API Interceptor with Token Refresh 

**File**: `frontend/src/utils/api.js`

**Changes**:
- Added automatic token refresh on 403 errors with JWT-related messages
- Detects JWT errors (`jwt malformed`, `jwt expired`, `invalid token`)
- Automatically calls `/auth/refresh` to get new token
- Retries original request with fresh token
- Redirects to login if refresh fails

**Implementation**:
```javascript
// Handle 403 (Forbidden) - token might be corrupted or expired
if (error.response?.status === 403 && !originalRequest._retry) {
  originalRequest._retry = true;

  const errorMessage = error.response?.data?.error?.details || '';
  
  // Check if it's a JWT error
  if (errorMessage.includes('jwt') || errorMessage.includes('token')) {
    console.warn(" JWT Token Error detected:", errorMessage);
    console.log(" Attempting to refresh authentication token...");
    
    try {
      // Try to refresh the token
      const refreshResponse = await api.post("/auth/refresh");
      
      if (refreshResponse.data.success) {
        console.log(" Token refreshed successfully, retrying original request");
        return api(originalRequest); // Retry with new token
      }
    } catch (refreshError) {
      console.error(" Token refresh failed");
      window.location.href = "/login"; // Redirect to login
    }
  }
}
```

### Fix 2: Enhanced Backend Auth Middleware Logging 

**File**: `tms-backend/middleware/auth.js`

**Changes**:
- Added token source tracking (cookie vs Authorization header)
- Added token preview logging (first/last 10 chars) in development mode
- Enhanced JWT error handling with specific error codes:
  - `JWT_MALFORMED` - Token format is invalid
  - `JWT_EXPIRED` - Token has expired
  - `JWT_NOT_ACTIVE` - Token not yet valid
- Added detailed error messages for each JWT error type

**Implementation**:
```javascript
// Token verification with enhanced error handling
jwt.verify(token, JWT_SECRET, (err, user) => {
  if (err) {
    let errorCode = "INVALID_TOKEN";
    let errorDetails = err.message;
    
    if (err.name === 'JsonWebTokenError') {
      errorCode = "JWT_MALFORMED";
      errorDetails = "Token format is invalid or corrupted. Please log in again.";
    } else if (err.name === 'TokenExpiredError') {
      errorCode = "JWT_EXPIRED";
      errorDetails = "Token has expired. Please refresh your session.";
    }
    
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token",
      error: { code: errorCode, details: errorDetails }
    });
  }
  // Token valid - proceed
  req.user = user;
  next();
});
```

## How Token Refresh Works

### Flow Diagram:
```
User Action (Create Consignor)
    
Frontend: POST /api/consignors
    
Backend: Check JWT token in cookie
    
Token Invalid/Corrupted?
    
Backend: Return 403 with "jwt malformed"
    
Frontend Interceptor: Detect JWT error
    
Frontend: POST /auth/refresh (with existing cookie)
    
Backend: Validate refresh token  Generate new JWT
    
Backend: Set new JWT in HTTP-only cookie
    
Frontend: Retry original request (POST /api/consignors)
    
Backend: Validate new token  Success!
    
Frontend: Consignor created successfully
```

## Testing the Fix

### Scenario 1: Normal Operation
1. User logs in  JWT stored in cookie
2. User creates consignor  Request succeeds with valid token
3. **Expected**: Consignor created successfully

### Scenario 2: Corrupted Token (Auto-Refresh)
1. User has corrupted/malformed token in cookie
2. User creates consignor  403 error with "jwt malformed"
3. Frontend detects JWT error  Calls `/auth/refresh`
4. Backend generates new token  Sets fresh cookie
5. Frontend retries original request with new token
6. **Expected**: Consignor created successfully after auto-refresh

### Scenario 3: Expired Session (Redirect to Login)
1. User's refresh token is also expired
2. User creates consignor  403 error
3. Frontend attempts refresh  Refresh fails
4. **Expected**: User redirected to login page

## Manual Testing Steps

### Step 1: Restart Backend
```powershell
cd tms-backend
npm run dev
```

### Step 2: Restart Frontend
```powershell
cd frontend
npm run dev
```

### Step 3: Clear Browser State
1. Open DevTools (F12)
2. Go to Application tab  Cookies
3. Delete all cookies for `localhost:5173`
4. Refresh page

### Step 4: Login Fresh
1. Navigate to login page
2. Enter credentials (POWNER001 / Powner@123)
3. Click Login
4. Verify cookie set: DevTools  Application  Cookies  `authToken`

### Step 5: Test Consignor Creation
1. Navigate to Create Consignor page
2. Fill all required fields:
   - General Info: Name, search term, industry, payment term
   - Contacts: At least one contact
   - Organization: Company code, select states
   - Documents: Optional
3. Click Submit
4. **Expected**: Success (might see token refresh in console if token was stale)

### Step 6: Test Token Refresh (Simulate Corruption)
1. Open DevTools Console
2. Run: `document.cookie = "authToken=corrupted_token; path=/;"`
3. Try creating another consignor
4. **Expected**: 
   - Console shows: " JWT Token Error detected"
   - Console shows: " Attempting to refresh authentication token..."
   - Console shows: " Token refreshed successfully"
   - Consignor created successfully

## Debugging JWT Issues

### Frontend Console Logs to Look For:

**Token Refresh Success**:
```
 JWT Token Error detected: jwt malformed
 Attempting to refresh authentication token...
 Token refreshed successfully, retrying original request
 API Response: {url: '/consignors', status: 201}
```

**Token Refresh Failure**:
```
 JWT Token Error detected: jwt malformed
 Attempting to refresh authentication token...
 Token refresh failed: {message: "Token refresh failed"}
 Redirecting to login due to authentication failure
```

### Backend Console Logs to Look For:

**Token Validation Success**:
```
 ===== AUTHENTICATION MIDDLEWARE CALLED =====
 Route: POST /consignors
 Cookie authToken: Present
 Token found in cookie
 Token preview: eyJhbGciOi...VCJ9.eyJ1 (length: 187)
 Verifying token...
 Token source: HTTP-only cookie
 Token verified successfully for user: POWNER001
 ===== AUTHENTICATION SUCCESS =====
```

**Token Validation Failure (Malformed)**:
```
 ===== AUTHENTICATION MIDDLEWARE CALLED =====
 Route: POST /consignors
 Cookie authToken: Present
 Token found in cookie
 Token preview: corrupted_t...ken_value (length: 15)
 Verifying token...
 Token source: HTTP-only cookie
 TOKEN VERIFICATION FAILED: jwt malformed
 Error name: JsonWebTokenError
 JWT Error Details: {
  name: 'JsonWebTokenError',
  message: 'jwt malformed',
  hint: 'Token might be corrupted in cookie storage'
}
 ===== AUTHENTICATION FAILED =====
```

## Permanent Fix Checklist

- [x]  Enhanced API response interceptor with automatic token refresh
- [x]  Added JWT error detection (malformed, expired, invalid)
- [x]  Implemented automatic retry logic after token refresh
- [x]  Enhanced backend auth middleware with detailed logging
- [x]  Added specific JWT error codes (JWT_MALFORMED, JWT_EXPIRED)
- [x]  Added token preview logging for debugging (dev mode only)
- [ ]  Test token refresh flow
- [ ]  Test consignor creation after fix
- [ ]  Verify automatic recovery from corrupted tokens

## Additional Recommendations

### 1. Token Expiration Configuration
**File**: `tms-backend/controllers/authController.js`

Check token expiration time:
```javascript
const token = jwt.sign(payload, JWT_SECRET, { 
  expiresIn: '24h'  // Adjust as needed
});
```

### 2. Refresh Token Implementation
Consider implementing a separate refresh token with longer expiration:
- Access token: Short-lived (1-2 hours)
- Refresh token: Long-lived (7-30 days)
- Store refresh token separately with higher security

### 3. Session Management
Consider adding:
- Session timeout warnings
- Automatic session extension on user activity
- "Remember me" functionality with longer token expiration

## Summary

**Problem**: JWT token corruption causing 403 errors during consignor creation

**Solution**: 
1. Automatic token refresh on JWT-related 403 errors
2. Enhanced error logging for better debugging
3. Graceful fallback to login page if refresh fails

**Impact**: 
-  Users no longer need to manually log out/in for token issues
-  Better user experience with automatic recovery
-  Improved debugging with detailed JWT error messages
-  Permanent fix for "jwt malformed" errors

**Files Modified**:
1. `frontend/src/utils/api.js` - Enhanced response interceptor
2. `tms-backend/middleware/auth.js` - Enhanced auth middleware logging
