# Vehicle & Transporter List Page Error - Troubleshooting Guide

**Date**: 2025-11-06
**Issue**: Error loading Vehicle and Transporter list pages in frontend

---

##  Problem Diagnosis

### Likely Cause: Authentication Token Missing

The vehicle and transporter list pages require JWT authentication. If you're seeing an error, it's most likely because:

1. **User is not logged in** - No JWT token in localStorage
2. **Token has expired** - JWT token is no longer valid
3. **Token not being sent** - Axios interceptor not attaching token to requests

---

##  Solution Steps

### Step 1: Login to the Application

Before accessing the vehicle or transporter pages, you MUST login first:

**Login Credentials**:
- **Username**: test1
- **Password**: test456

**Login URL**: http://localhost:5173/login

### Step 2: Verify Token is Stored

After logging in, open browser DevTools (F12) and check:

```javascript
// In Console tab, run:
localStorage.getItem('token')

// Should return a JWT token like:
// "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

If this returns `null`, the login didn't work properly.

### Step 3: Check API Calls

In DevTools Network tab, when you visit `/vehicles` page, you should see:

**Request**:
```
GET http://localhost:5000/api/vehicles?page=1&limit=25
Headers:
  Authorization: Bearer eyJhbGc...
```

**Response** (if successful):
```json
{
  "success": true,
  "data": [
    {
      "vehicle_id_code_hdr": "VEH0001",
      "maker_brand_description": "Ashok Leyland",
      ...
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 50,
    "totalPages": 2
  }
}
```

**Response** (if token missing):
```json
{
  "error": "Access denied. No token provided."
}
```

**Response** (if token expired):
```json
{
  "error": "Invalid token"
}
```

---

##  Quick Fix: Manual Token Injection

If you want to test the pages immediately without going through login:

### Option 1: Use Browser Console

```javascript
// Open DevTools Console (F12  Console tab)
// Paste this JWT token:
localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidGVzdDEiLCJ1c2VyX3R5cGVfaWQiOiJVVDAwMSIsInVzZXJfZnVsbF9uYW1lIjoiVGVzdCBVc2VyIDEiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NjI0Mjk3ODgsImV4cCI6MTc2MjUxNjE4OH0.jgs8cKwkV8990w5xFy8s7RXElJ6tN6tRtxauL8wCUNw');

// Then refresh the page
location.reload();
```

### Option 2: Login via API (Postman/curl)

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{"user_id":"test1","password":"test456"}"

# Copy the "token" from the response
# Paste it into localStorage as shown in Option 1
```

---

##  Common Errors & Solutions

### Error 1: "Access denied. No token provided"

**Cause**: User not logged in
**Solution**: Login first or inject token manually

### Error 2: "Invalid token" or "Token expired"

**Cause**: JWT token has expired (24 hour validity)
**Solution**: Login again to get a new token

### Error 3: "Network Error" or "CORS Error"

**Cause**: Backend not running or CORS misconfiguration
**Solution**:
- Check backend is running: `netstat -ano | findstr :5000`
- Start backend if needed: `cd tms-backend && npm start`

### Error 4: 404 Not Found on `/api/vehicles`

**Cause**: API endpoint doesn't exist
**Solution**: This is already working (tested successfully), so this shouldn't happen

### Error 5: Redux state shows `error` but no specific message

**Cause**: API response doesn't match expected format
**Solution**: Check Redux DevTools to see the actual error payload

---

##  Verification Checklist

- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 5173
- [ ] User logged in (token in localStorage)
- [ ] Token is valid (not expired)
- [ ] Network tab shows API calls with Authorization header
- [ ] Redux state shows vehicles array populated (not empty)
- [ ] No console errors in browser DevTools

---

##  Testing the Complete Flow

### 1. Start Both Servers

**Terminal 1 - Backend**:
```bash
cd "d:\tms dev 12 oct\tms-backend"
npm start
```

**Terminal 2 - Frontend**:
```bash
cd "d:\tms dev 12 oct\frontend"
npm run dev
```

### 2. Open Application

Navigate to: http://localhost:5173

### 3. Login

Go to: http://localhost:5173/login

Enter:
- Username: `test1`
- Password: `test456`

### 4. Navigate to Vehicle List

Go to: http://localhost:5173/vehicles

**Expected Result**: Should see 50 vehicles in a table/card layout with pagination

### 5. Check Console Logs

Open DevTools Console and look for:
```
 Fetching vehicles with params: {page: 1, limit: 25}
 Vehicles fetched successfully: {data: Array(25), pagination: {...}}
```

### 6. Verify Data

- Table should show 25 vehicles (first page)
- Pagination should show "Page 1 of 2"
- Total count should show "50 vehicles"
- Each row should have: Vehicle ID, Registration, Make, Model, Type, Status

---

##  Debug Mode

If you're still having issues, enable debug logging:

1. Open `frontend/src/utils/api.js`
2. Check if console logs are enabled
3. Open `frontend/src/redux/slices/vehicleSlice.js`
4. Check the console logs in async thunks

The slice already has extensive logging:
```javascript
console.log(" Fetching vehicles with params:", params);
console.log(" Vehicles fetched successfully:", response.data);
console.error(" Error fetching vehicles:", error);
```

---

##  Expected API Response Format

The backend returns data in this format:

```json
{
  "success": true,
  "data": [
    {
      "vehicle_id_code_hdr": "VEH0001",
      "maker_brand_description": "Ashok Leyland",
      "maker_model": "FM440",
      "vin_chassis_no": "VINQGHMHPOBZH8",
      "vehicle_type_id": "VT008",
      "vehicle_type_description": "FLATBED - Flatbed",
      "fuel_type_id": "FT001",
      "transmission_type": "AUTOMATIC",
      "manufacturing_month_year": "2021-02-01",
      "gross_vehicle_weight_kg": "19329.00",
      "gps_tracker_imei_number": "861469210008306",
      "gps_tracker_active_flag": 1,
      "blacklist_status": 0,
      "vehicle_status": "ACTIVE",
      "registration_number": "WB01EH6678",
      "ownership_name": "ABC Transport",
      "registration_date": "2022-12-31T18:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 50,
    "totalPages": 2
  }
}
```

The frontend expects this to be mapped to:
```javascript
{
  vehicleId: "VEH0001",
  registrationNumber: "WB01EH6678",
  vehicleType: "FLATBED",
  make: "Ashok Leyland",
  model: "FM440",
  // ... etc
}
```

**If there's a mismatch**, the data won't display correctly.

---

##  Next Steps

If you're still seeing an error after following these steps, please provide:

1. **Screenshot of the error message**
2. **Browser console output** (F12  Console tab)
3. **Network tab showing the failed request** (F12  Network tab)
4. **Redux DevTools state** (if installed)

This will help diagnose the exact issue.

---

**Status**: Backend API tested and working 
**Data**: 50 vehicles populated in database 
**Issue**: Frontend needs valid JWT token to access data 

