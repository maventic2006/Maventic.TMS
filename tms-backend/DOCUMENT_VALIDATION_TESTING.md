# Document Number Validation Testing Guide

## Overview
Document number format validation has been implemented on both frontend and backend for the following document types:
1. PAN Card
2. TAN
3. Aadhar Card
4. GST Certificate
5. VAT Certificate

Other document types (Any License, Any Agreement Document, Contact Person ID Proof) do not have specific format validation.

## Validation Rules

### 1. PAN Card
- **Format**: ABCDE1234F
- **Pattern**: 5 uppercase letters + 4 digits + 1 uppercase letter
- **Valid Examples**:
  - ABCDE1234F
  - PANCD5678Z
  - BZZPK5678Q
- **Invalid Examples**:
  - abc123 (lowercase)
  - ABCD1234F (only 4 letters)
  - ABCDE12345 (too many digits)
  - ABCDE1234 (missing final letter)

### 2. TAN
- **Format**: ASDF1234N
- **Pattern**: 4 uppercase letters + 5 digits + 1 uppercase letter
- **Valid Examples**:
  - ASDF12345N
  - BANG12345A
  - DELH23456Z
- **Invalid Examples**:
  - ASDF1234N (only 4 digits)
  - ASD12345N (only 3 letters)
  - asdf12345n (lowercase)
  - ASDF123456 (too many digits, no letter)

### 3. Aadhar Card
- **Format**: 123456789012
- **Pattern**: Exactly 12 digits
- **Valid Examples**:
  - 123456789012
  - 987654321098
  - 111122223333
- **Invalid Examples**:
  - 12345678901 (only 11 digits)
  - 1234567890123 (13 digits)
  - 12345678901A (contains letter)
  - 1234-5678-9012 (contains hyphens)

### 4. GST Certificate
- **Format**: 07ABCDE1234F1Z5
- **Pattern**: 2 digits + 10 PAN characters + 1 digit + 1 letter/digit + 1 checksum digit
- **Valid Examples**:
  - 07ABCDE1234F1Z5
  - 27AAPFU0939F1ZV
  - 29AAACD1234M1Z3
- **Invalid Examples**:
  - 7ABCDE1234F1Z5 (only 1 digit at start)
  - 07ABCDE1234F1Z (missing checksum)
  - 07ABCD1234F1Z5 (PAN part too short)
  - 07abcde1234f1z5 (lowercase)

### 5. VAT Certificate
- **Format**: VAT12345678
- **Pattern**: 8-15 alphanumeric characters (uppercase)
- **Valid Examples**:
  - VAT12345678
  - 12345678
  - ABCD1234EFGH
  - VAT123ABC456789
- **Invalid Examples**:
  - VAT123 (less than 8 characters)
  - VAT1234567890123456 (more than 15 characters)
  - vat12345678 (lowercase)
  - VAT123-456 (contains hyphen)

## Testing Steps

### Frontend Testing

1. **Navigate to Create Transporter Page**
   - Go to http://localhost:5173/transporter/create

2. **Fill General Details Tab**
   - Enter valid data for all required fields
   - Business Name, Contact Person, Email, Phone Number

3. **Fill Addresses Tab**
   - Add at least one address with all required fields

4. **Go to Documents Tab**
   - Click "Add Document" button

5. **Test Each Document Type**

#### Test PAN Card:
   - Select "PAN Card" as Document Type
   - Enter invalid format: "ABC123"  Should show error toast on submit: "PAN Card number is invalid. Expected format: ABCDE1234F"
   - Enter valid format: "ABCDE1234F"  Should accept

#### Test TAN:
   - Select "TAN" as Document Type
   - Enter invalid format: "ASDF1234N" (only 4 digits)  Should show error: "TAN number is invalid. Expected format: ASDF1234N"
   - Enter valid format: "ASDF12345N"  Should accept

#### Test Aadhar Card:
   - Select "Aadhar Card" as Document Type
   - Enter invalid format: "12345"  Should show error: "Aadhar Card number is invalid. Expected format: 123456789012"
   - Enter valid format: "123456789012"  Should accept

#### Test GST Certificate:
   - Select "GST Certificate" as Document Type
   - Enter invalid format: "07ABCDE1234"  Should show error: "GST Certificate number is invalid. Expected format: 07ABCDE1234F1Z5"
   - Enter valid format: "07ABCDE1234F1Z5"  Should accept

#### Test VAT Certificate:
   - Select "VAT Certificate" as Document Type
   - Enter invalid format: "VAT123" (too short)  Should show error: "VAT Certificate number is invalid. Expected format: VAT12345678"
   - Enter valid format: "VAT12345678"  Should accept

6. **Submit the Form**
   - Click "Submit" button
   - If any document number is invalid, you should see:
     - Red indicator on Documents tab (tab number 3)
     - Toast notification with error message
     - Form should not submit
   - If all documents are valid, form should submit successfully

### Backend Testing

To test backend validation directly using API calls:

1. **Test Create Transporter with Invalid PAN**
`ash
curl -X POST http://localhost:3000/api/transporter \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_JWT_TOKEN" \
-d '{
  "generalInfo": {...},
  "addresses": [...],
  "documents": [{
    "documentType": "PAN Card",
    "documentNumber": "ABC123",
    "country": "India",
    "validFrom": "2024-01-01",
    "validTo": "2025-01-01"
  }]
}'
`
Expected Response:
`json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "PAN Card number is invalid. Expected format: ABCDE1234F",
    "field": "documents[0].documentNumber",
    "expectedFormat": "ABCDE1234F"
  }
}
`

2. **Test with Valid PAN**
Change "documentNumber": "ABCDE1234F" and it should create successfully.

## Expected Behavior

### Validation Timing
- Frontend validation happens on form submit
- Backend validation happens before database insertion
- User sees immediate feedback via toast notifications
- Tab indicators show which tab has errors

### Error Messages
All error messages follow the format:
`
{DocumentType} number is invalid. Expected format: {FormatExample}
`

Examples:
- "PAN Card number is invalid. Expected format: ABCDE1234F"
- "TAN number is invalid. Expected format: ASDF1234N"
- "Aadhar Card number is invalid. Expected format: 123456789012"

### No Validation Documents
The following document types do NOT have format validation:
- Any License
- Any Agreement Document
- Contact Person ID Proof

These will accept any alphanumeric format with hyphens and slashes.

## Files Modified

### Backend
1. 	ms-backend/utils/documentValidation.js - New utility with validation patterns
2. 	ms-backend/controllers/transporterController.js - Added validation in createTransporter and updateTransporter

### Frontend
1. rontend/src/utils/documentValidation.js - New utility with validation patterns
2. rontend/src/features/transporter/validation.js - Updated documentSchema with custom refinement

## Checklist

- [ ] PAN Card: Test invalid format shows error
- [ ] PAN Card: Test valid format accepts
- [ ] TAN: Test invalid format shows error
- [ ] TAN: Test valid format accepts
- [ ] Aadhar Card: Test invalid format shows error
- [ ] Aadhar Card: Test valid format accepts
- [ ] GST Certificate: Test invalid format shows error
- [ ] GST Certificate: Test valid format accepts
- [ ] VAT Certificate: Test invalid format shows error
- [ ] VAT Certificate: Test valid format accepts
- [ ] Any License: Test any format accepts (no validation)
- [ ] Error toast shows correct format in message
- [ ] Documents tab shows red error indicator
- [ ] Backend API returns correct error format
- [ ] Update transporter also validates document numbers
- [ ] All other validations still working (phone, VAT, etc.)

## Notes
- Document number validation is case-sensitive (must be uppercase for letters)
- No spaces or special characters allowed except for VAT (alphanumeric only)
- Frontend and backend use identical validation patterns
- Validation errors are shown only on submit, not on blur or keystroke
