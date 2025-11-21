# Complete Backend Updates for Consignor Module

## Date: 2025-11-14

##  All Backend Changes Completed

### Overview
Backend has been updated to support frontend Contact and Organization tab changes, including multi-select states and updated field mappings.

---

## Changes Made

### 1. Database Migration 
**File:** \	ms-backend/migrations/20251114153838_alter_consignor_organization_business_area.js\

- Converts \usiness_area\ from VARCHAR(30) to TEXT
- Stores JSON array: \["Maharashtra", "Karnataka", "Tamil Nadu"]\
- Preserves existing data (converts strings to single-element arrays)
- Removes UNIQUE constraint on business_area
- Includes rollback functionality

**Migration Commands:**
\\\ash
cd tms-backend
npm run migrate:latest   # Apply
npm run migrate:rollback # Undo if needed
\\\

### 2. Validation Schema Updates 
**File:** \	ms-backend/validation/consignorValidation.js\

#### Contact Field Names Updated
| Old Field | New Field | Change |
|-----------|-----------|--------|
| \contact_designation\ | \designation\ |  Renamed |
| \contact_name\ | \
ame\ |  Renamed |
| \contact_number\ | \
umber\ |  Renamed + Required |
| \email_id\ | \email\ |  Renamed |
| \contact_team\ | \	eam\ |  Renamed |
| \contact_role\ | \ole\ |  Renamed + Required |
| \contact_photo\ | \photo\ |  Renamed |
| \country_code\ | \country_code\ |  Now Optional |

#### Organization Validation Updated
\\\javascript
// Before: Accepts string OR array
business_area: Joi.alternatives().try(
  Joi.string(),
  Joi.array()
)

// After: Requires array with min 1 state
business_area: Joi.array()
  .items(Joi.string().min(2).max(50))
  .min(1)
  .required()
\\\

### 3. Service Layer Updates 
**File:** \	ms-backend/services/consignorService.js\

#### \createConsignor()\ - Updated
- Maps frontend field names to database columns
- Serializes \usiness_area\ array to JSON string
- Stores in TEXT column

#### \getConsignorById()\ - Updated
- Parses \usiness_area\ JSON string to array
- Maps database columns to frontend field names
- Returns contacts with correct field names

#### \updateConsignor()\ - Updated
- Soft deletes existing contacts
- Inserts new contacts with updated mapping
- Handles \usiness_area\ JSON serialization

---

## API Contract Changes

### POST /api/consignors - Create

**Request Body:**
\\\json
{
  "general": { ... },
  "contacts": [
    {
      "designation": "Manager",          //  Updated
      "name": "John Doe",                //  Updated
      "number": "+919876543210",         //  Updated, Required
      "country_code": "+91",             //  Optional now
      "email": "john@example.com",       //  Updated
      "role": "Lead",                    //  Updated, Required
      "team": "Sales",                   //  Updated
      "linkedin_link": "https://...",
      "photo": "base64_or_url",          //  Updated
      "status": "ACTIVE"
    }
  ],
  "organization": {
    "company_code": "ABC-MFG-001",
    "business_area": ["Maharashtra", "Karnataka"]  //  MUST be array
  }
}
\\\

### GET /api/consignors/:id - Retrieve

**Response:**
\\\json
{
  "status": "success",
  "data": {
    "general": { ... },
    "contacts": [
      {
        "contact_id": "CON00001",
        "designation": "Manager",
        "name": "John Doe",
        "number": "+919876543210",      //  Updated field name
        "email": "john@example.com",    //  Updated field name
        "role": "Lead",                 //  Updated field name
        "photo": "url_or_base64",       //  Updated field name
        "status": "ACTIVE"
      }
    ],
    "organization": {
      "company_code": "ABC-MFG-001",
      "business_area": ["Maharashtra", "Karnataka"],  //  Returns as array
      "status": "ACTIVE"
    }
  }
}
\\\

### PUT /api/consignors/:id - Update

Same format as POST. All contacts replaced on update.

---

## Validation Error Examples

### Contact Validation Errors
\\\json
{
  "type": "VALIDATION_ERROR",
  "details": [
    {
      "field": "contacts[0].designation",
      "message": "Designation is required"
    },
    {
      "field": "contacts[0].number",
      "message": "Phone number is required"
    }
  ]
}
\\\

### Organization Validation Errors
\\\json
{
  "type": "VALIDATION_ERROR",
  "details": [
    {
      "field": "organization.business_area",
      "message": "At least one state must be selected"
    }
  ]
}
\\\

---

## Testing Checklist

### Database
- [ ] Run migration: \
pm run migrate:latest\
- [ ] Verify business_area column is TEXT type
- [ ] Check existing data migrated correctly
- [ ] Test rollback migration works

### API Endpoints
- [ ] POST /api/consignors with array business_area
- [ ] GET /api/consignors/:id returns array
- [ ] PUT /api/consignors/:id with updated states
- [ ] Validate required field errors (number, role)
- [ ] Validate business_area array min length
- [ ] Test empty business_area array (should fail)

### Data Integrity
- [ ] Existing consignors still load correctly
- [ ] Old string business_area converted to array
- [ ] Contact photos stored/retrieved correctly
- [ ] All contact fields map correctly

---

## Breaking Changes 

### Frontend Must Update

1. **Contact Field Names**
   - Send \
umber\ not \phone\
   - Send \photo\ not \photo_url\
   - Send \designation\, \
ame\, \ole\ (required)

2. **Business Area Format**
   - Must send array: \["State1", "State2"]\
   - Cannot send string: \"State1"\ 
   - Cannot send empty array: \[]\ 

3. **Required Fields Added**
   - \contacts[].number\ - now required
   - \contacts[].role\ - now required

---

## Rollback Instructions

If deployment issues occur:

\\\ash
# 1. Rollback migration
cd tms-backend
npm run migrate:rollback

# 2. Revert code changes
git log --oneline  # Find commit hash
git revert <hash>

# 3. Restart backend
npm run dev
\\\

---

## Files Modified

### New Files
1. \	ms-backend/migrations/20251114153838_alter_consignor_organization_business_area.js\
2. \docs/BACKEND_UPDATES_SUMMARY.md\

### Updated Files
1. \	ms-backend/validation/consignorValidation.js\
2. \	ms-backend/services/consignorService.js\

---

## Next Steps

1.  Review all changes
2.  Run database migration
3.  Deploy backend to dev environment
4.  Test with frontend integration
5.  Monitor for errors
6.  Deploy to production

---

## Support

For issues or questions:
- Check validation error messages in API responses
- Review migration logs for database errors
- Verify frontend sends correct field names
- Ensure business_area is always an array

**All backend changes are complete and ready for deployment!** 
