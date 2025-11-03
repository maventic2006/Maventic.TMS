# Driver API Testing Guide

## Quick Test Commands for Postman/Thunder Client

---

## 🔑 AUTHENTICATION

**All driver API endpoints require authentication.**

### Get Auth Token

```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@tms.com",
  "password": "your_password"
}
```

**Response:**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": "U001",
    "user_type_id": "UT001", // Must be UT001 (Owner) for driver access
    "role": "admin"
  }
}
```

**Use this token in all subsequent requests:**

```
Authorization: Bearer <your_token_here>
```

---

## 📋 API ENDPOINTS

### 1. Get Master Data

```http
GET http://localhost:5000/api/driver/master-data
Authorization: Bearer <token>
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "countries": [
      { "code": "IN", "name": "India" },
      { "code": "US", "name": "United States" }
    ],
    "documentTypes": [
      { "value": "DT001", "label": "License" },
      { "value": "DT002", "label": "ID Proof" }
    ],
    "documentNames": [
      { "value": "LIC001", "label": "LMV (Light Motor Vehicle)" },
      { "value": "LIC002", "label": "TRANS (Transport Vehicle)" },
      { "value": "ID001", "label": "Pan" },
      { "value": "ID002", "label": "Aadhar" }
    ],
    "addressTypes": [
      { "value": "AT001", "label": "Primary" },
      { "value": "AT002", "label": "Permanent" }
    ],
    "genderOptions": [
      { "value": "M", "label": "Male" },
      { "value": "F", "label": "Female" },
      { "value": "O", "label": "Others" }
    ],
    "bloodGroupOptions": [
      { "value": "A+", "label": "A+" },
      { "value": "O+", "label": "O+" }
    ]
  },
  "timestamp": "2025-11-02T14:00:00.000Z"
}
```

---

### 2. Create Driver

```http
POST http://localhost:5000/api/driver
Authorization: Bearer <token>
Content-Type: application/json

{
  "basicInfo": {
    "fullName": "Rajesh Kumar",
    "dateOfBirth": "1990-05-15",
    "gender": "M",
    "bloodGroup": "O+",
    "phoneNumber": "9876543210",
    "emailId": "rajesh.kumar@example.com",
    "whatsAppNumber": "9876543210",
    "alternatePhoneNumber": "9123456789"
  },
  "addresses": [
    {
      "addressTypeId": "AT001",
      "country": "India",
      "state": "Maharashtra",
      "city": "Mumbai",
      "district": "Mumbai Suburban",
      "street1": "123 MG Road",
      "street2": "Near Railway Station",
      "postalCode": "400001",
      "isPrimary": true
    }
  ],
  "documents": [
    {
      "documentType": "LIC001",
      "documentNumber": "MH0220190012345",
      "issuingCountry": "India",
      "issuingState": "Maharashtra",
      "validFrom": "2020-01-15",
      "validTo": "2040-01-15",
      "status": true,
      "remarks": "Valid LMV License"
    },
    {
      "documentType": "ID001",
      "documentNumber": "ABCDE1234F",
      "issuingCountry": "India",
      "validFrom": "2015-01-01",
      "status": true,
      "remarks": "PAN Card"
    }
  ]
}
```

**Expected Success Response:**

```json
{
  "success": true,
  "message": "Driver created successfully",
  "data": {
    "driverId": "DRV0001"
  },
  "timestamp": "2025-11-02T14:00:00.000Z"
}
```

**Expected Error Response (Validation):**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please enter a valid 10-digit phone number starting with 6, 7, 8, or 9",
    "field": "phoneNumber"
  },
  "timestamp": "2025-11-02T14:00:00.000Z"
}
```

---

### 3. Get Drivers (List with Filters)

```http
GET http://localhost:5000/api/driver?page=1&limit=25
Authorization: Bearer <token>
```

**With Filters:**

```http
GET http://localhost:5000/api/driver?page=1&limit=25&status=ACTIVE&gender=M&bloodGroup=O+&search=rajesh
Authorization: Bearer <token>
```

**Query Parameters:**

- `page` (default: 1)
- `limit` (default: 25)
- `search` - Search in ID, name, phone, email
- `driverId` - Filter by driver ID
- `fullName` - Filter by full name
- `phoneNumber` - Filter by phone
- `emailId` - Filter by email
- `status` - Filter by status (ACTIVE, INACTIVE)
- `gender` - Filter by gender (M, F, O)
- `bloodGroup` - Filter by blood group

**Expected Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "DRV0001",
      "fullName": "Rajesh Kumar",
      "dateOfBirth": "1990-05-15",
      "gender": "M",
      "bloodGroup": "O+",
      "phoneNumber": "9876543210",
      "emailId": "rajesh.kumar@example.com",
      "whatsAppNumber": "9876543210",
      "alternatePhoneNumber": "9123456789",
      "avgRating": 0.0,
      "status": "ACTIVE",
      "country": "India",
      "state": "Maharashtra",
      "city": "Mumbai",
      "district": "Mumbai Suburban",
      "postalCode": "400001",
      "createdBy": "SYSTEM",
      "createdOn": "2025-11-02",
      "updatedOn": "2025-11-02"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 1,
    "pages": 1
  },
  "timestamp": "2025-11-02T14:00:00.000Z"
}
```

---

### 4. Get Driver By ID

```http
GET http://localhost:5000/api/driver/DRV0001
Authorization: Bearer <token>
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "driverId": "DRV0001",
    "basicInfo": {
      "fullName": "Rajesh Kumar",
      "dateOfBirth": "1990-05-15",
      "gender": "M",
      "bloodGroup": "O+",
      "phoneNumber": "9876543210",
      "emailId": "rajesh.kumar@example.com",
      "whatsAppNumber": "9876543210",
      "alternatePhoneNumber": "9123456789",
      "avgRating": 0.0,
      "status": "ACTIVE",
      "createdBy": "SYSTEM",
      "createdOn": "2025-11-02",
      "updatedBy": "SYSTEM",
      "updatedOn": "2025-11-02"
    },
    "addresses": [
      {
        "addressId": "ADDR0001",
        "addressTypeId": "AT001",
        "country": "India",
        "state": "Maharashtra",
        "city": "Mumbai",
        "district": "Mumbai Suburban",
        "street1": "123 MG Road",
        "street2": "Near Railway Station",
        "postalCode": "400001",
        "isPrimary": true
      }
    ],
    "documents": [
      {
        "documentType": "LMV (Light Motor Vehicle)",
        "documentTypeId": "LIC001",
        "documentNumber": "MH0220190012345",
        "issuingCountry": "India",
        "issuingState": "Maharashtra",
        "validFrom": "2020-01-15",
        "validTo": "2040-01-15",
        "status": true,
        "remarks": "Valid LMV License"
      },
      {
        "documentType": "Pan",
        "documentTypeId": "ID001",
        "documentNumber": "ABCDE1234F",
        "issuingCountry": "India",
        "issuingState": null,
        "validFrom": "2015-01-01",
        "validTo": null,
        "status": true,
        "remarks": "PAN Card"
      }
    ]
  },
  "timestamp": "2025-11-02T14:00:00.000Z"
}
```

---

### 5. Update Driver

```http
PUT http://localhost:5000/api/driver/DRV0001
Authorization: Bearer <token>
Content-Type: application/json

{
  "basicInfo": {
    "fullName": "Rajesh Kumar Updated",
    "dateOfBirth": "1990-05-15",
    "gender": "M",
    "bloodGroup": "O+",
    "phoneNumber": "9876543210",
    "emailId": "rajesh.kumar.updated@example.com",
    "whatsAppNumber": "9876543210",
    "alternatePhoneNumber": "9123456789"
  },
  "addresses": [
    {
      "addressTypeId": "AT001",
      "country": "India",
      "state": "Maharashtra",
      "city": "Mumbai",
      "district": "Mumbai Suburban",
      "street1": "456 Updated Street",
      "street2": "Near New Location",
      "postalCode": "400002",
      "isPrimary": true
    }
  ],
  "documents": [
    {
      "documentType": "LIC001",
      "documentNumber": "MH0220190012345",
      "issuingCountry": "India",
      "issuingState": "Maharashtra",
      "validFrom": "2020-01-15",
      "validTo": "2040-01-15",
      "status": true,
      "remarks": "Valid LMV License - Updated"
    }
  ]
}
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Driver updated successfully",
  "data": {
    "driverId": "DRV0001"
  },
  "timestamp": "2025-11-02T14:00:00.000Z"
}
```

---

### 6. Get States By Country

```http
GET http://localhost:5000/api/driver/states/IN
Authorization: Bearer <token>
```

**Expected Response:**

```json
{
  "success": true,
  "data": [
    { "code": "MH", "name": "Maharashtra" },
    { "code": "DL", "name": "Delhi" },
    { "code": "KA", "name": "Karnataka" }
  ],
  "timestamp": "2025-11-02T14:00:00.000Z"
}
```

---

### 7. Get Cities By Country and State

```http
GET http://localhost:5000/api/driver/cities/IN/MH
Authorization: Bearer <token>
```

**Expected Response:**

```json
{
  "success": true,
  "data": [{ "name": "Mumbai" }, { "name": "Pune" }, { "name": "Nagpur" }],
  "timestamp": "2025-11-02T14:00:00.000Z"
}
```

---

## ⚠️ VALIDATION ERRORS

### Phone Number Validation Error

```http
POST http://localhost:5000/api/driver
{
  "basicInfo": {
    "phoneNumber": "12345"  // Invalid: Too short
  }
}
```

**Response:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please enter a valid 10-digit phone number starting with 6, 7, 8, or 9",
    "field": "phoneNumber"
  }
}
```

### Duplicate Phone Number Error

```http
POST http://localhost:5000/api/driver
{
  "basicInfo": {
    "phoneNumber": "9876543210"  // Already exists
  }
}
```

**Response:**

```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_PHONE",
    "message": "Phone number 9876543210 already exists. Please use a unique phone number",
    "field": "phoneNumber"
  }
}
```

### Duplicate Email Error

```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_EMAIL",
    "message": "Email rajesh.kumar@example.com already exists. Please use a unique email",
    "field": "emailId"
  }
}
```

### Duplicate Document Error

```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_DOCUMENT",
    "message": "Document 1: LMV (Light Motor Vehicle) number MH0220190012345 already exists",
    "field": "documents[0].documentNumber"
  }
}
```

---

## 🧪 TESTING SCENARIOS

### Scenario 1: Complete Driver Creation Flow

```javascript
// 1. Get master data
GET /api/driver/master-data

// 2. Get states for India
GET /api/driver/states/IN

// 3. Get cities for Maharashtra
GET /api/driver/cities/IN/MH

// 4. Create driver with all data
POST /api/driver

// 5. Verify driver was created
GET /api/driver/DRV0001

// 6. List all drivers
GET /api/driver?page=1&limit=25
```

### Scenario 2: Update Driver Flow

```javascript
// 1. Get driver details
GET / api / driver / DRV0001;

// 2. Update driver
PUT / api / driver / DRV0001;

// 3. Verify update
GET / api / driver / DRV0001;
```

### Scenario 3: Validation Testing

```javascript
// Test 1: Invalid phone (too short)
POST /api/driver { phoneNumber: "12345" }

// Test 2: Invalid phone (wrong prefix)
POST /api/driver { phoneNumber: "5123456789" }

// Test 3: Invalid email
POST /api/driver { emailId: "invalid-email" }

// Test 4: Duplicate phone
POST /api/driver { phoneNumber: "9876543210" } // Already exists

// Test 5: Duplicate email
POST /api/driver { emailId: "rajesh.kumar@example.com" } // Already exists

// Test 6: Duplicate document
POST /api/driver { documents: [{ documentNumber: "MH0220190012345" }] } // Already exists
```

---

## 🔍 DEBUGGING TIPS

### Check Backend Logs

```bash
# In tms-backend folder
npm run dev

# Look for console logs:
🔍 Starting driver creation - VALIDATION PHASE
✅ All validations passed - proceeding to database operations
📝 Generated driver ID: DRV0001
✅ Driver basic information inserted for DRV0001
✅ Address ADDR0001 inserted for driver DRV0001
✅ Document DDOC0001 inserted for driver DRV0001
```

### Test Database Directly

```sql
-- Check if driver was created
SELECT * FROM driver_basic_information WHERE driver_id = 'DRV0001';

-- Check addresses
SELECT * FROM tms_address WHERE user_reference_id = 'DRV0001' AND user_type = 'DRIVER';

-- Check documents
SELECT * FROM driver_documents WHERE driver_id = 'DRV0001';
```

---

## 📊 POSTMAN COLLECTION

Create a Postman collection with the following structure:

```
Driver API Tests/
├── 1. Authentication/
│   └── Login
├── 2. Master Data/
│   ├── Get Master Data
│   ├── Get States by Country
│   └── Get Cities by State
├── 3. CRUD Operations/
│   ├── Create Driver
│   ├── Get All Drivers
│   ├── Get Driver By ID
│   └── Update Driver
└── 4. Validation Tests/
    ├── Invalid Phone Number
    ├── Duplicate Phone Number
    ├── Duplicate Email
    └── Duplicate Document
```

**Environment Variables:**

```
base_url: http://localhost:5000/api
token: <paste_token_after_login>
```

---

## ✅ SUCCESS CRITERIA

All tests should pass:

- [x] Authentication successful
- [x] Master data loaded
- [x] Driver created with valid data
- [x] Validation errors caught correctly
- [x] Duplicate checks working
- [x] Driver list retrieved with pagination
- [x] Driver details retrieved by ID
- [x] Driver updated successfully
- [x] States/Cities loaded dynamically

---

**Ready to Test!** Start the backend server and use these endpoints to verify everything is working correctly.
