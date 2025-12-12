# User Management Module

Complete backend implementation for User Management with role-based access control, integrating with existing TMS database structure.

## 📋 Table of Contents

- [Overview](#overview)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Installation](#installation)
- [Usage Examples](#usage-examples)
- [Testing](#testing)
- [Security](#security)

---

## 🎯 Overview

This module provides comprehensive user management functionality:

- ✅ Create users with initial passwords
- ✅ List users with pagination, filtering, and search
- ✅ Update user information
- ✅ Deactivate users (soft delete)
- ✅ Force password change (first-time login)
- ✅ Role-based access control with application-level permissions
- ✅ Field-level validation with detailed error messages
- ✅ Password policy enforcement (min 8 chars, digit + special char required)

---

## 📊 Database Schema

### Existing Tables (Used)

#### `user_master_log`
Main users table - stores all user authentication and profile data.

```sql
- user_master_log_id (PK, auto increment)
- user_id (varchar(10)) - Generated ID: USR000001, USR000002, etc.
- user_type_id (varchar(10)) - FK to user_type_master
- user_full_name (varchar(50)) - Combined first + last name
- email_id (varchar(30)) - Unique email
- mobile_number (varchar(10)) - Unique mobile
- alternet_mobile (varchar(10))
- whats_app_number (varchar(10))
- from_date (date)
- to_date (date)
- is_active (tinyint(1)) - 1=Active, 0=Inactive
- password (text) - Bcrypt hashed password
- password_type (varchar(50)) - 'initial' or 'actual'
- consignor_id (varchar(10))
- approval_cycle (varchar(10))
- status (varchar(10)) - 'ACTIVE' or 'INACTIVE'
- created_by, created_at, updated_by, updated_at
```

#### `user_type_master`
User type/role definitions (Admin, Manager, User, etc.)

```sql
- user_type_id (varchar(10), PK)
- user_type (varchar(30))
- created_at, updated_at, created_by, updated_by, status
```

### New Tables (Created by Migrations)

#### `application`
Applications that users can have access to.

```sql
- id (PK, auto increment)
- app_id (varchar(20), unique) - 'TMS', 'WMS', 'BILLING'
- name (varchar(100)) - Application display name
- description (text)
- app_url (varchar(255))
- is_active (boolean)
- status (varchar(10))
- created_at, updated_at, created_by, updated_by
```

#### `user_role_header`
Maps users to roles with warehouse-based scoping.

```sql
- user_role_id (PK, auto increment)
- user_id (varchar(10)) - FK to user_master_log.user_id
- role (varchar(50)) - Role name (admin, manager, warehouse_manager, etc.)
- warehouse_id (varchar(10), nullable) - FK to warehouse_basic_information.warehouse_id (NULL for global roles)
- is_active (boolean)
- status (varchar(10))
- created_at, updated_at, created_by, updated_by
- UNIQUE(user_id, role, warehouse_id)
```

---

## 🔌 API Endpoints

### User Management

#### Create User
```http
POST /api/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "userTypeId": "UT03",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "mobileNumber": "9876543210",
  "alternateMobile": "9000000000",
  "whatsappNumber": "9876543210",
  "fromDate": "2025-01-01",
  "toDate": "2025-12-31",
  "password": "S3cr3t!23"
}

Response 201:
{
  "success": true,
  "user": {
    "userId": "USR000012",
    "userTypeId": "UT03",
    "fullName": "John Doe",
    "email": "john@example.com",
    "mobileNumber": "9876543210",
    "isActive": true,
    "status": "ACTIVE",
    "passwordType": "initial"
  },
  "initialPassword": "S3cr3t!23"
}
```

#### List Users (Paginated)
```http
GET /api/users?page=1&limit=20&isActive=1&search=john
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": [
    {
      "userId": "USR000012",
      "userTypeId": "UT03",
      "userType": "User",
      "fullName": "John Doe",
      "email": "john@example.com",
      "mobileNumber": "9876543210",
      "isActive": true,
      "status": "ACTIVE",
      "passwordType": "initial",
      "createdAt": "2025-12-09T10:30:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

#### Get User by ID
```http
GET /api/users/:userId
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "userId": "USR000012",
    "userTypeId": "UT03",
    "userType": "User",
    "fullName": "John Doe",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "mobileNumber": "9876543210",
    "alternateMobile": "9000000000",
    "whatsappNumber": "9876543210",
    "fromDate": "2025-01-01",
    "toDate": "2025-12-31",
    "isActive": true,
    "status": "ACTIVE",
    "passwordType": "initial"
  }
}
```

#### Update User
```http
PUT /api/users/:userId
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Johnny",
  "lastName": "Doe",
  "mobileNumber": "9999999999"
}

Response 200:
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "userId": "USR000012",
    "fullName": "Johnny Doe",
    "firstName": "Johnny",
    "lastName": "Doe",
    "mobileNumber": "9999999999",
    "updatedAt": "2025-12-09T11:00:00.000Z"
  }
}
```

#### Deactivate User
```http
PATCH /api/users/:userId/deactivate
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "message": "User deactivated successfully"
}
```

#### Force Password Change
```http
POST /api/users/:userId/force-change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "newPassword": "NewP@ssw0rd!"
}

Response 200:
{
  "success": true,
  "message": "Password updated successfully",
  "passwordType": "actual"
}
```

### Role Management

#### Assign Role(s)
```http
POST /api/users/:userId/roles
Authorization: Bearer <token>
Content-Type: application/json

// Single role
{
  "roleName": "warehouse_manager",
  "warehouseId": "WH001"
}

// Multiple roles (warehouse-specific and global)
[
  {
    "roleName": "warehouse_manager",
    "warehouseId": "WH001"
  },
  {
    "roleName": "admin",
    "warehouseId": null
  }
]

Response 201:
{
  "success": true,
  "message": "Successfully assigned 2 role(s)",
  "data": [
    {
      "user_role_id": 123,
      "user_id": "USR000012",
      "role": "warehouse_manager",
      "warehouse_id": "WH001",
      "warehouse_name": "Main Warehouse",
      "is_active": true,
      "status": "ACTIVE"
    }
  ]
}
```

#### Get User Roles
```http
GET /api/users/:userId/roles
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": [
    {
      "userRoleId": 123,
      "userId": "USR000012",
      "role": "warehouse_manager",
      "warehouseId": "WH001",
      "warehouseName": "Main Warehouse",
      "isActive": true,
      "status": "ACTIVE"
    },
    {
      "userRoleId": 124,
      "userId": "USR000012",
      "role": "admin",
      "warehouseId": null,
      "warehouseName": null,
      "isActive": true,
      "status": "ACTIVE"
    }
  ],
  "count": 2
}
```

#### Remove Role
```http
DELETE /api/users/:userId/roles/:roleId
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "message": "Role removed successfully"
}
```

### Application Management

#### List Applications
```http
GET /api/applications?isActive=1
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "appId": "TMS",
      "name": "Transportation Management System",
      "description": "Manage transporters, drivers, vehicles",
      "appUrl": "http://localhost:5173",
      "isActive": true,
      "status": "ACTIVE"
    }
  ],
  "count": 3
}
```

---

## 🚀 Installation

### 1. Run Migrations

```bash
cd backend
npm run migrate
```

This will create:
- `user_role_header` table

Note: Uses existing `application_master` and `warehouse_basic_information` tables

### 2. Run Seeders

```bash
npm run seed
```

This will populate:
- 3 sample applications (TMS, WMS, BILLING)
- 1 admin user (email: `admin@tms.com`, password: `Admin@123`)

### 3. Update server.js

Add the new routes to your Express server:

```javascript
// In backend/server.js

// Import new routes
const userManagementRoutes = require('./modules/user/user.routes');
const applicationRoutes = require('./modules/application/application.routes');

// Register routes (after existing routes)
app.use('/api/users', userManagementRoutes);
app.use('/api/applications', applicationRoutes);
```

### 4. Restart Server

```bash
npm run dev
```

---

## 📝 Usage Examples

### Creating a User (Postman/Thunder Client)

```javascript
// Request
POST http://localhost:5000/api/users
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
  Content-Type: application/json

Body:
{
  "userTypeId": "UT03",
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@company.com",
  "mobileNumber": "9876543211",
  "fromDate": "2025-01-01",
  "password": "Secure@Pass123"
}
```

### Listing Users with Filters

```javascript
// Active users only
GET http://localhost:5000/api/users?isActive=1&page=1&limit=10

// Search by name or email
GET http://localhost:5000/api/users?search=john&page=1&limit=10

// Combine filters
GET http://localhost:5000/api/users?isActive=1&search=admin&page=1&limit=20
```

### Assigning Multiple Roles

```javascript
POST http://localhost:5000/api/users/USR000012/roles
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
  Content-Type: application/json

Body:
[
  {
    "roleName": "warehouse_manager",
    "warehouseId": "WH001"
  },
  {
    "roleName": "admin",
    "warehouseId": null
  }
]
```

---

## 🧪 Testing

### Run Tests

```bash
# Install test dependencies (if not already installed)
npm install --save-dev jest supertest

# Run tests
npm test
```

### Test Coverage

The test suite includes:
- ✅ User creation with valid/invalid data
- ✅ Email uniqueness validation
- ✅ Password policy enforcement
- ✅ User listing with pagination
- ✅ User update operations
- ✅ Password change functionality
- ✅ Role assignment and removal
- ✅ Application listing

---

## 🔒 Security

### Password Policy

- ✅ Minimum 8 characters
- ✅ At least 1 digit
- ✅ At least 1 special character (!@#$%^&*...)
- ✅ Bcrypt hashing with 10 salt rounds

### Password Types

- **`initial`**: Creator-set password - user MUST change on first login
- **`actual`**: User-changed password - no forced change required

### Authentication

All endpoints require:
- Valid JWT token in `Authorization: Bearer <token>` header
- Token obtained from `/api/auth/login`

### Authorization (/* ADAPT: Customize */)

- **Create User**: Admin/Manager only
- **Update User**: Admin/Manager only
- **Deactivate User**: Admin only
- **Assign Roles**: Admin/Manager only
- **Change Password**: User themselves or Admin

---

## 📁 File Structure

```
backend/
├── modules/
│   ├── user/
│   │   ├── user.service.js         # Business logic layer
│   │   ├── user.controller.js      # HTTP request handlers
│   │   ├── user.routes.js          # Express routes
│   │   ├── user.validator.js       # Joi validation schemas
│   │   └── tests/
│   │       └── user.test.js        # Jest unit tests
│   └── application/
│       ├── application.service.js
│       ├── application.controller.js
│       └── application.routes.js
├── utils/
│   ├── passwordUtil.js             # Password hashing & validation
│   └── dbFieldMapper.js            # API ↔ DB field mapping
├── middleware/
│   └── authorizeManageUsers.js     # Role-based authorization
├── migrations/
│   └── 20251209000001_create_user_role_header.js
└── seeds/
    ├── 01_seed_applications.js  # Seeds existing application_master table
    └── 02_seed_admin_user.js    # Seeds admin user with global role
```

---

## 🛠️ Troubleshooting

### Migration Errors

If migrations fail due to existing tables:

```bash
# Rollback last migration
npm run rollback

# Run migrations again
npm run migrate
```

### Duplicate Email/Mobile

API returns field-specific error:

```json
{
  "success": false,
  "message": "Email already exists",
  "error": {
    "field": "email",
    "details": "Email already exists"
  }
}
```

### Password Policy Violations

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "password",
      "message": "Password must contain at least one digit and one special character"
    }
  ]
}
```

---

## 🔄 Integration Notes

### Existing User Routes (backend/routes/users.js)

⚠️ **IMPORTANT**: This module creates NEW routes under `/api/users` in the `modules` folder.

Your existing `backend/routes/users.js` may conflict. Options:

1. **Rename existing routes** to `/api/user-legacy` or similar
2. **Merge functionality** from old routes into new module
3. **Use different base path** for new module (e.g., `/api/user-management`)

### Adapting to Your System

Look for `/* ADAPT: ... */` comments throughout the code for areas that may need customization:

- User ID generation format
- Authentication middleware integration
- Role-based authorization logic
- Logger integration
- Email notification system (replace plain password in response)

---

## 📧 Support

For issues or questions:
1. Check existing GitHub issues
2. Review error logs in console
3. Verify database schema matches documentation
4. Ensure all migrations and seeds ran successfully

---

## ✅ Checklist

Before deploying to production:

- [ ] Run all migrations successfully
- [ ] Run seeders for applications and admin user
- [ ] Update server.js to register new routes
- [ ] Test all endpoints with Postman/Thunder Client
- [ ] Replace plain password in response with email notification
- [ ] Configure role-based authorization middleware
- [ ] Set up proper logging system
- [ ] Enable HTTPS for production API
- [ ] Review and customize `/* ADAPT: */` sections
- [ ] Run test suite and ensure all tests pass
- [ ] Set strong JWT_SECRET in production .env
- [ ] Configure database backups

---

**Generated**: December 9, 2025  
**Module Version**: 1.0.0  
**Database**: MySQL (Knex.js)  
**Framework**: Node.js + Express 5.1.0
