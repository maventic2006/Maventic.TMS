# Draft API Testing Guide - Quick Reference

## Server Status
 Backend running on: http://localhost:5000
 All endpoints protected with JWT authentication

---

## Step 1: Get JWT Token

**POST** http://localhost:5000/api/auth/login

Body:
\\\json
{
  \"username\": \"PO001\",
  \"password\": \"password123\"
}
\\\

Copy the token from the response.

---

## Step 2: Test Create Draft

**POST** http://localhost:5000/api/transporter/save-draft

Headers:
\\\
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
\\\

Body (Minimal):
\\\json
{
  \"generalDetails\": {
    \"businessName\": \"Test Draft Company\"
  }
}
\\\

Expected: 200 OK with transporterId

---

## Step 3: Test List Drafts

**GET** http://localhost:5000/api/transporter?status=SAVE_AS_DRAFT

Headers:
\\\
Authorization: Bearer YOUR_JWT_TOKEN
\\\

Expected: Only your drafts visible

---

## Step 4: Test Update Draft

**PUT** http://localhost:5000/api/transporter/TR0001/update-draft

Headers:
\\\
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
\\\

Body:
\\\json
{
  \"generalDetails\": {
    \"businessName\": \"Updated Draft Name\"
  }
}
\\\

Expected: 200 OK

---

## Step 5: Test Delete Draft

**DELETE** http://localhost:5000/api/transporter/TR0001/delete-draft

Headers:
\\\
Authorization: Bearer YOUR_JWT_TOKEN
\\\

Expected: 200 OK (hard delete)

---

## Step 6: Test Ownership Validation

Login as PO002, try to update PO001's draft:

Expected: 403 Forbidden

---

## All Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /api/transporter/save-draft | Create draft (minimal validation) |
| PUT | /api/transporter/:id/update-draft | Update draft (owner only) |
| DELETE | /api/transporter/:id/delete-draft | Delete draft (owner only) |
| GET | /api/transporter?status=SAVE_AS_DRAFT | List user's drafts |
| GET | /api/transporter | List all (includes user's drafts) |

---

 **Phase 1 Backend Complete - Ready for Manual Testing**
