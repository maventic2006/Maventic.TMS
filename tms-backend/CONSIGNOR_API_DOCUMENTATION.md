# Consignor API Documentation

## Overview

Production-grade RESTful API for Consignor Maintenance module in the TMS (Transportation Management System). Supports complete CRUD operations for consignors with nested entities (contacts, organization, documents) and file upload capabilities.

## Table of Contents

1. [Architecture](#architecture)
2. [Setup Instructions](#setup-instructions)
3. [API Endpoints](#api-endpoints)
4. [Request/Response Formats](#requestresponse-formats)
5. [Validation Rules](#validation-rules)
6. [Error Handling](#error-handling)
7. [File Upload Guide](#file-upload-guide)
8. [Testing Guide](#testing-guide)
9. [Database Schema](#database-schema)

---

## Architecture

### Stack

- **Runtime**: Node.js
- **Framework**: Express 5.1.0
- **Database**: MySQL 2 (via Knex.js 3.1.0)
- **Validation**: Joi
- **File Upload**: Multer 2.0.2
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Storage**: Local filesystem (S3 support placeholder)

### Project Structure

```
tms-backend/
├── controllers/
│   └── consignorController.js       # HTTP request handlers
├── services/
│   └── consignorService.js          # Business logic & transactions
├── validation/
│   └── consignorValidation.js       # Joi schemas
├── utils/
│   ├── responseHelper.js            # Standardized responses
│   └── storageService.js            # File upload/download
├── routes/
│   └── consignor.js                 # Route definitions
├── middleware/
│   └── auth.js                      # JWT authentication
├── migrations/
│   ├── 20251112000001_create_consignor_basic_information.js
│   ├── 20251112000002_create_consignor_organization.js
│   ├── 20251112000003_create_contact.js
│   ├── 20251112000004_create_consignor_documents.js
│   ├── 20251114000001_create_master_industry_type.js
│   └── 20251114000002_create_master_currency_type.js
└── seeds/
    ├── 001_master_industry_types.js
    └── 002_master_currency_types.js
```

### Architectural Patterns

- **Separation of Concerns**: Controllers → Services → Database
- **Transaction Management**: All multi-table operations wrapped in database transactions
- **Field-Level Error Mapping**: Validation errors include field paths for frontend mapping
- **Standardized Response Envelope**: Consistent JSON structure for success/error responses
- **File Upload Abstraction**: Storage service supports local and S3 (placeholder)
- **Collision-Resistant ID Generation**: Auto-generated unique IDs with retry logic

---

## Setup Instructions

### Prerequisites

- Node.js >= 16.x
- MySQL >= 8.0
- npm or yarn

### Installation

1. **Install Dependencies**

```bash
cd tms-backend
npm install
```

2. **Configure Environment Variables**

Create or update `.env` file:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=tms_dev

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production

# Storage Configuration
STORAGE_TYPE=local
LOCAL_UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# Optional: AWS S3 Configuration (if using S3)
# AWS_S3_BUCKET=your-bucket-name
# AWS_REGION=us-east-1
# AWS_ACCESS_KEY_ID=your-access-key
# AWS_SECRET_ACCESS_KEY=your-secret-key
```

3. **Run Database Migrations**

```bash
npm run migrate
```

4. **Seed Master Data**

```bash
npm run seed
```

5. **Start Server**

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

Server will start on `http://localhost:5000`

### Verify Setup

Check health endpoint:

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-11-14T10:00:00.000Z"
}
```

---

## API Endpoints

Base URL: `http://localhost:5000/api/consignors`

All endpoints require authentication. Include JWT token in:
- **Cookie**: `authToken` (HTTP-only)
- **OR Header**: `Authorization: Bearer <token>`

### Summary Table

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/consignors` | List consignors (with filters, pagination) | Yes |
| GET | `/api/consignors/:id` | Get consignor details | Yes |
| POST | `/api/consignors` | Create new consignor | Yes |
| PUT | `/api/consignors/:id` | Update consignor | Yes |
| DELETE | `/api/consignors/:id` | Soft delete consignor | Yes |
| GET | `/api/consignors/master-data` | Get master data (industries, currencies, doc types) | Yes |

---

### 1. List Consignors

**Endpoint**: `GET /api/consignors`

**Query Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 25 | Items per page (max 100) |
| `search` | string | - | Search across customer_id, customer_name, search_term |
| `customer_id` | string | - | Filter by customer ID |
| `status` | string | - | Filter by status (ACTIVE/INACTIVE/PENDING) |
| `industry_type` | string | - | Filter by industry type |
| `currency_type` | string | - | Filter by currency type |
| `sortBy` | string | created_at | Sort field (customer_id, customer_name, industry_type, created_at, approved_date) |
| `sortOrder` | string | desc | Sort order (asc/desc) |

**Example Request**:

```bash
curl -X GET "http://localhost:5000/api/consignors?page=1&limit=10&status=ACTIVE&sortBy=customer_name&sortOrder=asc" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": [
    {
      "consignor_unique_id": 1,
      "customer_id": "C001",
      "customer_name": "Alpha Logistics",
      "search_term": "alpha logistics",
      "industry_type": "IND_LOGISTICS",
      "currency_type": "CUR_INR",
      "payment_term": "NET30",
      "status": "ACTIVE",
      "approved_by": "admin",
      "approved_date": "2025-01-01",
      "created_at": "2025-11-14T10:00:00.000Z",
      "updated_at": "2025-11-14T10:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### 2. Get Consignor Details

**Endpoint**: `GET /api/consignors/:id`

**Path Parameters**:
- `id` (string): Customer ID (e.g., "C001")

**Example Request**:

```bash
curl -X GET "http://localhost:5000/api/consignors/C001" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "general": {
      "customer_id": "C001",
      "customer_name": "Alpha Logistics",
      "search_term": "alpha logistics",
      "industry_type": "IND_LOGISTICS",
      "currency_type": "CUR_INR",
      "payment_term": "NET30",
      "remark": "Priority client",
      "website_url": "https://alpha.example.com",
      "name_on_po": "Alpha Logistics Pvt Ltd",
      "approved_by": "admin",
      "approved_date": "2025-01-01",
      "status": "ACTIVE"
    },
    "contacts": [
      {
        "contact_id": "CON00001",
        "designation": "Manager",
        "name": "Ramesh Kumar",
        "phone": "9876543210",
        "country_code": "+91",
        "email": "ramesh@alpha.com",
        "linkedin": "https://linkedin.com/in/ramesh",
        "team": "Operations",
        "role": "Primary Contact",
        "photo_url": null
      }
    ],
    "organization": {
      "company_code": "ALPHA01",
      "business_area": "Logistics,Warehousing"
    },
    "documents": [
      {
        "document_unique_id": "CDOC00001",
        "document_type_id": "NDA",
        "document_type_name": "Non-Disclosure Agreement",
        "document_number": "NDA-123",
        "valid_from": "2024-01-01",
        "valid_to": "2026-01-01",
        "file_path": "/uploads/consignor/documents/1731576000-abc123def456.pdf",
        "original_name": "NDA_Alpha.pdf",
        "file_size": 245678,
        "mime_type": "application/pdf"
      }
    ]
  }
}
```

**Error Response** (404 Not Found):

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Consignor with identifier 'C001' not found."
  }
}
```

---

### 3. Create Consignor

**Endpoint**: `POST /api/consignors`

**Content-Type**: `multipart/form-data`

**Form Fields**:
- `payload` (string): JSON string with consignor data
- `file1`, `file2`, etc. (files): Document files (referenced by fileKey in documents array)

**Payload Structure**:

```json
{
  "general": {
    "customer_id": "C001",
    "customer_name": "Alpha Logistics",
    "search_term": "alpha logistics",
    "industry_type": "IND_LOGISTICS",
    "currency_type": "CUR_INR",
    "payment_term": "NET30",
    "remark": "Priority client",
    "website_url": "https://alpha.example.com",
    "name_on_po": "Alpha Logistics Pvt Ltd",
    "approved_by": "admin",
    "approved_date": "2025-01-01",
    "status": "ACTIVE"
  },
  "contacts": [
    {
      "designation": "Manager",
      "name": "Ramesh Kumar",
      "phone": "9876543210",
      "country_code": "+91",
      "email": "ramesh@alpha.com",
      "linkedin": "https://linkedin.com/in/ramesh",
      "team": "Operations",
      "role": "Primary Contact"
    }
  ],
  "organization": {
    "company_code": "ALPHA01",
    "business_area": ["Logistics", "Warehousing"]
  },
  "documents": [
    {
      "document_type_id": "NDA",
      "document_number": "NDA-123",
      "valid_from": "2024-01-01",
      "valid_to": "2026-01-01",
      "fileKey": "file1"
    }
  ]
}
```

**Example Request (cURL)**:

```bash
curl -X POST "http://localhost:5000/api/consignors" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F 'payload={"general":{"customer_id":"C001","customer_name":"Alpha Logistics","search_term":"alpha logistics","industry_type":"IND_LOGISTICS","currency_type":"CUR_INR","payment_term":"NET30","status":"ACTIVE"},"contacts":[{"designation":"Manager","name":"Ramesh Kumar","phone":"9876543210","country_code":"+91","email":"ramesh@alpha.com"}],"organization":{"company_code":"ALPHA01","business_area":["Logistics"]},"documents":[{"document_type_id":"NDA","document_number":"NDA-123","valid_from":"2024-01-01","valid_to":"2026-01-01","fileKey":"file1"}]}' \
  -F "file1=@/path/to/nda_document.pdf"
```

**Success Response** (201 Created):

```json
{
  "success": true,
  "data": {
    "general": { ... },
    "contacts": [ ... ],
    "organization": { ... },
    "documents": [ ... ]
  }
}
```

**Validation Error Response** (422 Unprocessable Entity):

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed. Please check your input.",
    "details": [
      {
        "field": "general.customer_name",
        "message": "Customer name is required"
      },
      {
        "field": "contacts[0].country_code",
        "message": "Country code is required"
      }
    ]
  }
}
```

---

### 4. Update Consignor

**Endpoint**: `PUT /api/consignors/:id`

**Content-Type**: `multipart/form-data`

**Path Parameters**:
- `id` (string): Customer ID

**Form Fields**:
- `payload` (string): JSON string with fields to update (partial update supported)
- Files (optional): New document files

**Example Request**:

```bash
curl -X PUT "http://localhost:5000/api/consignors/C001" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F 'payload={"general":{"status":"INACTIVE"},"contacts":[{"designation":"Manager","name":"Ramesh Kumar Updated","phone":"9876543210","country_code":"+91","email":"ramesh@alpha.com"}]}' \
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "general": { ... },
    "contacts": [ ... ],
    "organization": { ... },
    "documents": [ ... ]
  }
}
```

---

### 5. Delete Consignor

**Endpoint**: `DELETE /api/consignors/:id`

**Path Parameters**:
- `id` (string): Customer ID

**Example Request**:

```bash
curl -X DELETE "http://localhost:5000/api/consignors/C001" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Consignor deleted successfully"
  }
}
```

---

### 6. Get Master Data

**Endpoint**: `GET /api/consignors/master-data`

**Example Request**:

```bash
curl -X GET "http://localhost:5000/api/consignors/master-data" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "industries": [
      {
        "id": "IND_AUTOMOTIVE",
        "label": "Automotive"
      },
      {
        "id": "IND_FMCG",
        "label": "FMCG (Fast Moving Consumer Goods)"
      }
    ],
    "currencies": [
      {
        "id": "CUR_INR",
        "label": "Indian Rupee",
        "code": "INR"
      },
      {
        "id": "CUR_USD",
        "label": "US Dollar",
        "code": "USD"
      }
    ],
    "documentTypes": [
      {
        "id": "NDA",
        "label": "Non-Disclosure Agreement"
      },
      {
        "id": "MSA",
        "label": "Master Service Agreement"
      }
    ]
  }
}
```

---

## Validation Rules

### General Section

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| customer_id | string | Yes | Max 10 chars, uppercase alphanumeric, unique |
| customer_name | string | Yes | Min 2, max 100 chars |
| search_term | string | Yes | Max 100 chars |
| industry_type | string | Yes | Max 30 chars, must exist in master table |
| currency_type | string | No | Max 30 chars |
| payment_term | string | Yes | Max 10 chars |
| remark | string | No | Max 255 chars |
| website_url | string | No | Valid URL, max 200 chars |
| name_on_po | string | No | Max 30 chars |
| approved_by | string | No | Max 30 chars |
| approved_date | date | No | ISO date, cannot be future |
| status | string | No | ACTIVE/INACTIVE/PENDING (default: ACTIVE) |

### Contact Section

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| designation | string | Yes | Max 50 chars |
| name | string | Yes | Min 2, max 100 chars |
| phone | string | No | 7-15 digits with optional + prefix |
| country_code | string | Yes | Format: +1 to +999 |
| email | string | No | Valid email, max 100 chars |
| linkedin | string | No | Valid URL, max 200 chars |
| team | string | No | Max 20 chars |
| role | string | No | Max 40 chars |

### Organization Section

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| company_code | string | Yes | Max 20 chars, unique |
| business_area | string or array | Yes | Max 30 chars per item |

### Document Section

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| document_type_id | string | Yes | Must exist in master table |
| document_number | string | No | Max 50 chars |
| valid_from | date | Yes | ISO date |
| valid_to | date | No | ISO date, must be after valid_from |
| fileKey | string | Optional | Reference to uploaded file |

---

## Error Handling

### Error Response Structure

All errors follow this structure:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-friendly message",
    "details": [
      {
        "field": "path.to.field",
        "message": "Field-specific error message"
      }
    ]
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 422 | Input validation failed |
| NOT_FOUND | 404 | Resource not found |
| DUPLICATE_ENTRY | 409 | Unique constraint violation |
| UNAUTHORIZED | 401 | Authentication required |
| FORBIDDEN | 403 | Insufficient permissions |
| FILE_TOO_LARGE | 400 | File size exceeds 10MB |
| UPLOAD_ERROR | 400 | File upload failed |
| DATABASE_ERROR | 500 | Database operation failed |
| INTERNAL_SERVER_ERROR | 500 | Unexpected server error |

---

## File Upload Guide

### Supported File Types

- **Documents**: PDF, DOC, DOCX, XLS, XLSX
- **Images**: PNG, JPG, JPEG

### File Size Limit

- Maximum: 10MB per file

### Upload Process

1. **Multipart Form Data**: Use `multipart/form-data` encoding
2. **Payload Field**: Include JSON data in `payload` field
3. **File Fields**: Upload files with field names matching `fileKey` in documents array

### Example with JavaScript (Axios)

```javascript
const formData = new FormData();

// Add JSON payload
const payload = {
  general: { ... },
  contacts: [ ... ],
  organization: { ... },
  documents: [
    {
      document_type_id: 'NDA',
      document_number: 'NDA-123',
      valid_from: '2024-01-01',
      valid_to: '2026-01-01',
      fileKey: 'file1'
    }
  ]
};

formData.append('payload', JSON.stringify(payload));

// Add file
const fileInput = document.querySelector('#fileInput');
formData.append('file1', fileInput.files[0]);

// Send request
axios.post('http://localhost:5000/api/consignors', formData, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'multipart/form-data'
  }
});
```

### Storage Configuration

**Local Storage** (default):
- Files stored in `./uploads/consignor/documents/`
- Accessible via direct file path

**AWS S3** (optional):
- Set `STORAGE_TYPE=s3` in `.env`
- Configure AWS credentials
- Files stored with signed URLs (TODO: implement S3 integration)

---

## Testing Guide

### Manual Testing with Postman

1. **Import Environment**

Create Postman environment with:
```json
{
  "base_url": "http://localhost:5000/api",
  "auth_token": "YOUR_JWT_TOKEN"
}
```

2. **Test Authentication**

First, get JWT token via login endpoint:
```
POST {{base_url}}/auth/login
Body: { "username": "admin", "password": "password" }
```

Save token from response.

3. **Test Master Data**

```
GET {{base_url}}/consignors/master-data
Headers: Authorization: Bearer {{auth_token}}
```

4. **Test List Endpoint**

```
GET {{base_url}}/consignors?page=1&limit=10&status=ACTIVE
Headers: Authorization: Bearer {{auth_token}}
```

5. **Test Create Endpoint**

```
POST {{base_url}}/consignors
Headers: Authorization: Bearer {{auth_token}}
Body (form-data):
  - payload: {JSON payload}
  - file1: {File}
```

### Automated Testing

Run integration tests (TODO: implement with Jest/Supertest):

```bash
npm test
```

---

## Database Schema

### Tables

1. **consignor_basic_information**
   - Primary table with general consignor information
   - PK: `consignor_unique_id` (auto-increment)
   - Business Key: `customer_id` (unique)

2. **contact**
   - Contact persons for consignor
   - FK: `customer_id` → consignor_basic_information
   - Business Key: `contact_id`

3. **consignor_organization**
   - Organization details (company code, business area)
   - FK: `customer_id` → consignor_basic_information
   - Unique: `company_code`, `business_area`

4. **consignor_documents**
   - Document metadata
   - FK: `customer_id` → consignor_basic_information
   - FK: `document_id` → document_upload
   - FK: `document_type_id` → doc_type_configuration

5. **document_upload**
   - Physical file information
   - Stores file path, size, MIME type

6. **master_industry_type**
   - Industry classification master data

7. **master_currency_type**
   - Currency master data

8. **doc_type_configuration**
   - Document type master data

### Indexes

For performance, the following indexes are created:
- `customer_id` (consignor_basic_information)
- `customer_name` (consignor_basic_information)
- `search_term` (consignor_basic_information)
- `status` (all tables)
- `company_code` (consignor_organization)
- `document_type_id` (consignor_documents)

---

## Next Steps

1. **Implement Bulk Import**
   - CSV/Excel upload endpoint
   - Asynchronous processing with job status API
   - Validation and error reporting

2. **Add Document Management Endpoints**
   - `POST /api/consignors/:id/documents` - Upload additional document
   - `PUT /api/consignors/:id/documents/:docId` - Update document
   - `DELETE /api/consignors/:id/documents/:docId` - Delete document
   - `GET /api/consignors/:id/documents/:docId/download` - Download document

3. **Implement OpenAPI Specification**
   - Generate Swagger documentation
   - Interactive API explorer

4. **Add Comprehensive Tests**
   - Unit tests for service layer
   - Integration tests for endpoints
   - Test coverage reporting

5. **Performance Optimization**
   - Implement caching (Redis)
   - Query optimization
   - Rate limiting

---

## Support

For issues or questions, contact the development team or create an issue in the project repository.

**Version**: 1.0.0  
**Last Updated**: November 14, 2025
