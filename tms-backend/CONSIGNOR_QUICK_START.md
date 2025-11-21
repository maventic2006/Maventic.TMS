# Consignor API - Quick Start Guide

## 🚀 Getting Started

### Prerequisites

1. ✅ Node.js 16+ installed
2. ✅ MySQL database running
3. ✅ Redis (optional, for caching)
4. ✅ Environment variables configured

### Installation & Setup

```bash
# 1. Install dependencies (if not already done)
cd tms-backend
npm install

# 2. Run migrations
npm run migrate

# 3. Seed master data
npm run seed

# 4. Start the server
npm run dev
```

**Server will start on:** `http://localhost:5000`

---

## 🧪 Quick Test

Run the automated test script to verify everything is working:

```bash
cd tms-backend
node test-consignor-api.js
```

**Expected Output:**
```
✅ ===== ALL TESTS PASSED =====
```

---

## 📡 API Endpoints Overview

### Base URL
```
http://localhost:5000/api/consignors
```

### Authentication
All endpoints require JWT authentication:
- **Header:** `Authorization: Bearer <token>`
- **Cookie:** `token=<jwt_token>`

### Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/consignors` | Get paginated list with filters |
| GET | `/api/consignors/master-data` | Get master data for dropdowns |
| GET | `/api/consignors/:id` | Get consignor by customer ID |
| POST | `/api/consignors` | Create new consignor |
| PUT | `/api/consignors/:id` | Update existing consignor |
| DELETE | `/api/consignors/:id` | Soft delete consignor |

---

## 💻 Example Usage

### 1. Get Master Data (For Dropdowns)

**Request:**
```bash
curl -X GET "http://localhost:5000/api/consignors/master-data" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "industries": [
      { "id": "IND_LOGISTICS", "name": "Logistics & Transportation" },
      { "id": "IND_FMCG", "name": "FMCG (Fast Moving Consumer Goods)" }
    ],
    "currencies": [
      { "id": "CUR_INR", "name": "Indian Rupee", "symbol": "₹" },
      { "id": "CUR_USD", "name": "US Dollar", "symbol": "$" }
    ],
    "documentTypes": [
      { "id": "DOC001", "name": "GST Certificate" },
      { "id": "DOC002", "name": "PAN Card" }
    ]
  }
}
```

---

### 2. Create Consignor

**Request:**
```bash
curl -X POST "http://localhost:5000/api/consignors" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F 'payload={
    "general": {
      "customer_id": "CUST001",
      "customer_name": "ABC Logistics Pvt Ltd",
      "search_term": "abc logistics",
      "industry_type": "IND_LOGISTICS",
      "currency_type": "CUR_INR",
      "payment_term": "NET30",
      "website_url": "https://abclogistics.com",
      "remark": "Premium logistics partner",
      "status": "ACTIVE"
    },
    "contacts": [
      {
        "contact_designation": "General Manager",
        "contact_name": "Rajesh Kumar",
        "contact_number": "9876543210",
        "country_code": "+91",
        "email_id": "rajesh@abclogistics.com",
        "contact_team": "Operations",
        "contact_role": "Primary Contact"
      }
    ],
    "organization": {
      "company_code": "ABC001",
      "business_area": ["Logistics", "Warehousing", "Transportation"]
    },
    "documents": [
      {
        "document_type_id": "DOC001",
        "document_number": "GST123456",
        "valid_from": "2024-01-01",
        "valid_to": "2025-12-31",
        "fileKey": "file0"
      }
    ]
  }' \
  -F "file0=@/path/to/gst-certificate.pdf"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "general": {
      "customer_id": "CUST001",
      "customer_name": "ABC Logistics Pvt Ltd",
      "industry_type": "IND_LOGISTICS",
      "status": "ACTIVE"
    },
    "contacts": [...],
    "organization": {...},
    "documents": [...]
  }
}
```

---

### 3. Get Consignor List with Filters

**Request:**
```bash
curl -X GET "http://localhost:5000/api/consignors?page=1&limit=10&status=ACTIVE&industry_type=IND_LOGISTICS" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "customer_id": "CUST001",
      "customer_name": "ABC Logistics Pvt Ltd",
      "industry_type": "IND_LOGISTICS",
      "status": "ACTIVE"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

### 4. Get Consignor by ID

**Request:**
```bash
curl -X GET "http://localhost:5000/api/consignors/CUST001" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "general": {
      "customer_id": "CUST001",
      "customer_name": "ABC Logistics Pvt Ltd",
      "search_term": "abc logistics",
      "industry_type": "IND_LOGISTICS",
      "currency_type": "CUR_INR",
      "payment_term": "NET30",
      "website_url": "https://abclogistics.com",
      "status": "ACTIVE"
    },
    "contacts": [
      {
        "contact_id": "CON00001",
        "designation": "General Manager",
        "name": "Rajesh Kumar",
        "phone": "9876543210",
        "country_code": "+91",
        "email": "rajesh@abclogistics.com"
      }
    ],
    "organization": {
      "company_code": "ABC001",
      "business_area": "Logistics,Warehousing,Transportation"
    },
    "documents": [
      {
        "document_unique_id": "CDOC00001",
        "document_type_id": "DOC001",
        "document_type_name": "GST Certificate",
        "document_number": "GST123456",
        "valid_from": "2024-01-01",
        "valid_to": "2025-12-31",
        "file_path": "uploads/consignor/documents/gst-cert-123.pdf"
      }
    ]
  }
}
```

---

### 5. Update Consignor

**Request:**
```bash
curl -X PUT "http://localhost:5000/api/consignors/CUST001" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F 'payload={
    "general": {
      "customer_id": "CUST001",
      "customer_name": "ABC Logistics Pvt Ltd (Updated)",
      "search_term": "abc logistics updated",
      "industry_type": "IND_LOGISTICS",
      "payment_term": "NET45",
      "remark": "Updated to NET45 payment terms",
      "status": "ACTIVE"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "general": {
      "customer_id": "CUST001",
      "customer_name": "ABC Logistics Pvt Ltd (Updated)",
      "payment_term": "NET45",
      "remark": "Updated to NET45 payment terms"
    }
  }
}
```

---

### 6. Delete Consignor (Soft Delete)

**Request:**
```bash
curl -X DELETE "http://localhost:5000/api/consignors/CUST001" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Consignor deleted successfully",
    "customer_id": "CUST001"
  }
}
```

---

## ⚠️ Error Handling

### Validation Error Example

**Request with Invalid Data:**
```bash
curl -X POST "http://localhost:5000/api/consignors" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F 'payload={
    "general": {
      "customer_name": "A"
    }
  }'
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "general.customer_id",
        "message": "Customer ID is required"
      },
      {
        "field": "general.customer_name",
        "message": "Customer name must be at least 2 characters"
      },
      {
        "field": "general.industry_type",
        "message": "Industry type is required"
      }
    ]
  }
}
```

### Database Error Example

**Duplicate Customer ID:**
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_ENTRY",
    "message": "A record with this value already exists",
    "details": [
      {
        "field": "customer_id",
        "message": "Customer ID 'CUST001' already exists"
      }
    ]
  }
}
```

### Not Found Error

**Non-existent Consignor ID:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Consignor with ID 'CUST999' not found"
  }
}
```

---

## 🔍 Query Parameters

### List Endpoint Filters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number (min: 1) |
| `limit` | integer | 25 | Records per page (1-100) |
| `search` | string | - | Search in customer_id, customer_name, search_term |
| `customer_id` | string | - | Filter by customer ID (partial match) |
| `status` | string | - | Filter by status (ACTIVE, INACTIVE, PENDING) |
| `industry_type` | string | - | Filter by industry type |
| `currency_type` | string | - | Filter by currency type |
| `sortBy` | string | created_at | Column to sort by |
| `sortOrder` | string | desc | Sort direction (asc, desc) |

**Example with Multiple Filters:**
```bash
curl -X GET "http://localhost:5000/api/consignors?page=1&limit=10&status=ACTIVE&industry_type=IND_LOGISTICS&search=logistics&sortBy=customer_name&sortOrder=asc" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📄 File Upload

### Supported File Types
- **Documents:** PDF, DOC, DOCX
- **Spreadsheets:** XLS, XLSX
- **Images:** PNG, JPG, JPEG

### File Size Limit
- **Maximum:** 10MB per file

### Upload Format

Files must be uploaded as `multipart/form-data` with:
1. **payload** field containing JSON data
2. **fileN** fields containing file data (where N is referenced in document.fileKey)

**Example:**
```javascript
const formData = new FormData();
formData.append('payload', JSON.stringify({
  general: {...},
  contacts: [...],
  documents: [
    { document_type_id: "DOC001", fileKey: "file0" },
    { document_type_id: "DOC002", fileKey: "file1" }
  ]
}));
formData.append('file0', gstCertFile);
formData.append('file1', panCardFile);

fetch('/api/consignors', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

---

## 🔐 Authentication

### Getting a JWT Token

**Login Endpoint:**
```bash
curl -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "user_id": "USER001",
      "username": "admin",
      "user_type_id": "UT001"
    }
  }
}
```

### Using the Token

Include token in **Authorization header**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Or in **Cookie**:
```
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🧰 Testing with Postman

### Import Collection

1. Create a new Postman Collection named "Consignor API"
2. Set environment variables:
   - `baseUrl`: `http://localhost:5000`
   - `token`: Your JWT token
3. Add requests for each endpoint (see examples above)

### Collection Variables

```json
{
  "baseUrl": "http://localhost:5000",
  "token": "{{token}}",
  "customerId": "CUST001"
}
```

### Pre-request Script (for auth)

```javascript
pm.request.headers.add({
  key: 'Authorization',
  value: `Bearer ${pm.environment.get('token')}`
});
```

---

## 📊 Master Data Reference

### Industry Types (15)

| ID | Name |
|----|------|
| IND_AUTOMOTIVE | Automotive & Vehicle Manufacturing |
| IND_FMCG | FMCG (Fast Moving Consumer Goods) |
| IND_PHARMA | Pharmaceutical & Healthcare |
| IND_RETAIL | Retail & E-commerce |
| IND_ELECTRONICS | Electronics & Technology |
| IND_TEXTILE | Textile & Apparel |
| IND_FOOD | Food & Beverages |
| IND_CHEMICAL | Chemical & Petrochemical |
| IND_CONSTRUCTION | Construction & Building Materials |
| IND_LOGISTICS | Logistics & Transportation |
| IND_AGRICULTURE | Agriculture & Agro-products |
| IND_ENERGY | Energy & Utilities |
| IND_MANUFACTURING | General Manufacturing |
| IND_TELECOM | Telecommunication |
| IND_OTHER | Other |

### Currency Types (12)

| ID | Name | Symbol |
|----|------|--------|
| CUR_INR | Indian Rupee | ₹ |
| CUR_USD | US Dollar | $ |
| CUR_EUR | Euro | € |
| CUR_GBP | British Pound | £ |
| CUR_JPY | Japanese Yen | ¥ |
| CUR_AUD | Australian Dollar | A$ |
| CUR_CAD | Canadian Dollar | C$ |
| CUR_CHF | Swiss Franc | Fr |
| CUR_CNY | Chinese Yuan | ¥ |
| CUR_SGD | Singapore Dollar | S$ |
| CUR_AED | UAE Dirham | د.إ |
| CUR_SAR | Saudi Riyal | ﷼ |

### Payment Terms

- NET15
- NET30
- NET45
- NET60
- NET90
- ADVANCE
- COD (Cash on Delivery)
- LC (Letter of Credit)

---

## 🐛 Troubleshooting

### Issue: "Unknown column in field list"

**Solution:** Run migrations to ensure database schema is up to date
```bash
npm run migrate
```

### Issue: "Master data not found"

**Solution:** Run seeds to populate master tables
```bash
npm run seed
```

### Issue: "File upload failed"

**Check:**
1. File size is under 10MB
2. File type is supported (PDF, DOC, DOCX, XLS, XLSX, PNG, JPG)
3. `uploads/consignor/documents/` directory exists and is writable

### Issue: "JWT token expired"

**Solution:** Login again to get a new token
```bash
curl -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password123"}'
```

### Issue: "Validation error on update"

**Note:** When updating the `general` section, all required fields must be provided. For partial updates, update only specific sections (contacts, organization, documents).

---

## 📚 Additional Resources

- **Full API Documentation:** See `CONSIGNOR_API_DOCUMENTATION.md`
- **Implementation Details:** See `CONSIGNOR_MODULE_COMPLETION_SUMMARY.md`
- **Future Enhancements:** See `CONSIGNOR_NEXT_STEPS.md`
- **Test Script:** Run `node test-consignor-api.js`

---

## 🎯 Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│ CONSIGNOR API - QUICK REFERENCE                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Base URL: http://localhost:5000/api/consignors             │
│ Auth: Bearer Token in Authorization header                 │
│                                                             │
│ GET    /                      → List with filters          │
│ GET    /master-data           → Master data dropdowns      │
│ GET    /:id                   → Get by customer ID         │
│ POST   /                      → Create (multipart)         │
│ PUT    /:id                   → Update (multipart)         │
│ DELETE /:id                   → Soft delete                │
│                                                             │
│ Test: node test-consignor-api.js                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

**Last Updated:** November 14, 2025  
**Status:** Production Ready ✅
