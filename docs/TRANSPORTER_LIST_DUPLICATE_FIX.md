# Transporter List Duplicate Rows Fix

**Date**: November 14, 2025  
**Issue**: Duplicate transporter rows in list when multiple addresses/contacts exist  
**Root Cause**: SQL JOIN cartesian product creating multiple rows per transporter  
**Status**:  RESOLVED

---

## Problem Description

When creating a transporter with multiple addresses and/or multiple contacts, the transporter list was showing duplicate entries with the same transporter ID but different data.

### Example Scenario
- **Transporter ID**: T089
- **Configuration**: 2 addresses with 2 contacts each
- **Expected Result**: 1 row in transporter list
- **Actual Result**: 4 rows in transporter list (2 addresses  2 contacts = 4 combinations)

### Database State
- 	ransporter_general_info table: **1 row** (correct)
- Transporter list display: **4 rows** (incorrect - duplicates)

---

## Root Cause Analysis

The issue was in the getTransporters function in 	ransporterController.js. The SQL query was using LEFT JOIN on both addresses and contacts without proper row deduplication:

### Original Query Structure (INCORRECT)
`javascript
knex('transporter_general_info as tgi')
  .leftJoin('tms_address as addr', ...) // Multiple addresses
  .leftJoin('transporter_contact as tc', ...) // Multiple contacts
  .groupBy(
    'tgi.transporter_id',
    'addr.country', 'addr.state', // Address fields in GROUP BY
    'tc.contact_person_name', 'tc.phone_number' // Contact fields in GROUP BY
  )
`

**Why This Failed:**
1. **Cartesian Product**: LEFT JOIN with multiple addresses creates multiple rows
2. **Multiplication Effect**: Each address row  each contact row = exponential duplication
3. **GROUP BY Problem**: Grouping by address and contact fields creates unique combinations
4. **Result**: One transporter  Multiple rows (one per address-contact combination)

**Example with 2 addresses, 2 contacts:**
`
T089 + Address1 + Contact1  Row 1
T089 + Address1 + Contact2  Row 2
T089 + Address2 + Contact1  Row 3
T089 + Address2 + Contact2  Row 4
`

---

## Solution Implemented

### Strategy: Show Primary Address + First Contact Only

The fix ensures each transporter appears **exactly once** in the list by:
1. Joining only the **primary address** (is_primary = 1)
2. Joining only the **first contact** (lowest 	contact_id)
3. Removing GROUP BY clause (not needed anymore)

### New Query Structure (CORRECT)
`javascript
knex('transporter_general_info as tgi')
  // Join ONLY primary address
  .leftJoin('tms_address as addr', function() {
    this.on('tgi.transporter_id', '=', 'addr.user_reference_id')
      .andOn('addr.user_type', '=', knex.raw(" TRANSPORTER \))
 .andOn('addr.is_primary', '=', knex.raw('1')); // PRIMARY ADDRESS ONLY
 })
 // Join ONLY first contact using subquery
 .leftJoin(
 knex.raw(\(
 SELECT tc1.*
 FROM transporter_contact tc1
 INNER JOIN (
 SELECT transporter_id, MIN(tcontact_id) as min_contact_id
 FROM transporter_contact
 WHERE status = 'ACTIVE'
 GROUP BY transporter_id
 ) tc2 ON tc1.transporter_id = tc2.transporter_id 
 AND tc1.tcontact_id = tc2.min_contact_id
 ) as tc\),
 'tgi.transporter_id',
 'tc.transporter_id'
 )
 .select(...) // No GROUP BY needed
`

**How This Works:**
1. **Primary Address Filter**: is_primary = 1 ensures max 1 address per transporter
2. **First Contact Subquery**: 
 - Inner query finds MIN(tcontact_id) per transporter
 - Outer query joins only that specific contact
3. **One-to-One Relationship**: Each transporter 1 address 1 contact **1 row**

---

## Files Modified

### 1. ms-backend/controllers/transporterController.js

**Lines ~1887-1933** (Main Query):
- **BEFORE**: 
 - LEFT JOIN on all addresses
 - LEFT JOIN on all contacts
 - GROUP BY with 20+ fields
 
- **AFTER**:
 - LEFT JOIN on primary address only (is_primary = 1)
 - LEFT JOIN on first contact only (subquery with MIN(tcontact_id))
 - Removed GROUP BY clause
 - Updated CONCAT to use COALESCE for null safety

**Lines ~2035-2047** (Count Query):
- **BEFORE**: 
 - Always joined addresses and contacts (unnecessary)
 
- **AFTER**:
 - Conditional address join (only when needed for filters)
 - Removed contact join entirely (not needed for count)
 - Count distinct ransporter_id only

---

## Impact & Benefits

### Before Fix
 Multiple rows per transporter in list 
 Pagination incorrect (counting duplicate rows) 
 Confusing UX (same ID appearing multiple times) 
 Performance degradation with GROUP BY on many fields 

### After Fix
 Exactly 1 row per transporter in list 
 Accurate pagination counts 
 Clean, professional list display 
 Better query performance (no GROUP BY) 
 Primary address displayed (most relevant) 
 First contact displayed (consistent ordering) 

---

## Testing Performed

### Test Case 1: Single Address, Single Contact
- **Setup**: Create transporter with 1 address, 1 contact
- **Result**: 1 row in list

### Test Case 2: Multiple Addresses, Single Contact Each
- **Setup**: Create transporter with 2 addresses, 1 contact each
- **Result**: 1 row in list (primary address shown)

### Test Case 3: Single Address, Multiple Contacts
- **Setup**: Create transporter with 1 address, 3 contacts
- **Result**: 1 row in list (first contact shown)

### Test Case 4: Multiple Addresses, Multiple Contacts (Original Issue)
- **Setup**: Create transporter with 2 addresses, 2 contacts each
- **Expected**: 4 rows (BEFORE fix)
- **Result**: 1 row (AFTER fix)

### Test Case 5: No Address, No Contact
- **Setup**: Create transporter with no addresses/contacts
- **Result**: 1 row in list (null values for address/contact fields)

### Test Case 6: Pagination
- **Setup**: Create 30 transporters with varying address/contact counts
- **Result**: Correct pagination (25 per page, accurate total count)

### Test Case 7: Filters (VAT, TAN, State, City)
- **Setup**: Apply filters on address fields
- **Result**: Correct filtering, no duplicates

---

## Database Expectations

### Required for Proper Display

1. **Primary Address Flag**:
 - At least one address should have is_primary = 1
 - If no primary address exists, list shows null address fields

2. **Contact Ordering**:
 - First contact is determined by MIN(tcontact_id)
 - Ensures consistent ordering across queries

3. **Status Field**:
 - Only ACTIVE contacts are considered
 - Inactive contacts are excluded

---

## Migration Notes

### No Database Changes Required
This fix is **query-only** and requires no schema migrations.

### Backward Compatibility
 Existing data works without modification 
 No API contract changes 
 Frontend requires no updates 

---

## Known Limitations

1. **List Shows Primary Address Only**:
 - Users see only the primary address in the list
 - All addresses visible in details page
 
2. **List Shows First Contact Only**:
 - Users see only the first contact (by ID) in the list
 - All contacts visible in details page

3. **Non-Primary Address Filters**:
 - If filtering by a non-primary address field, transporter may appear with different address data
 - This is expected behavior (filter uses all addresses, display uses primary)

---

## Future Enhancements (Optional)

- [ ] Add column selector to choose which address to display
- [ ] Add column selector to choose which contact to display
- [ ] Show address/contact count badges in list (e.g., \2 addresses 3 contacts\)
- [ ] Add tooltip on hover to preview all addresses/contacts

---

## Related Files

- ms-backend/controllers/transporterController.js - Main fix location
- ms-backend/migrations/010_create_tms_address.js - Address schema (is_primary field)
- ms-backend/migrations/012_create_transporter_contact.js - Contact schema
- rontend/src/pages/TransporterMaintenance.jsx - List display component

---

## Prevention Guidelines

### For Future List Queries

1. **Avoid Multiple JOINs Without Aggregation**:
 - Don't join 1-to-many relationships without GROUP BY or DISTINCT
 - Use subqueries to get single records before joining

2. **Primary Record Pattern**:
 - Always use primary flags (is_primary) for list displays
 - Use MIN(id) or MAX(id) for deterministic ordering

3. **Test with Multiple Records**:
 - Always test list queries with multiple addresses/contacts
 - Verify row count matches transporter count

4. **COUNT Query Optimization**:
 - Only join tables needed for filters
 - Use COUNT(DISTINCT transporter_id) when joins are present

---

## Verification Commands

### Check for Duplicates in List
\\\sql
-- This should return 0 rows if fix is working
SELECT transporter_id, COUNT(*) as count
FROM (
 -- Paste the actual query here
) as result
GROUP BY transporter_id
HAVING count > 1;
\\\

### Verify Primary Address Flag
\\\sql
-- Check transporters with no primary address
SELECT tgi.transporter_id, COUNT(addr.address_id) as addr_count
FROM transporter_general_info tgi
LEFT JOIN tms_address addr ON tgi.transporter_id = addr.user_reference_id
 AND addr.user_type = 'TRANSPORTER'
 AND addr.is_primary = 1
GROUP BY tgi.transporter_id
HAVING addr_count = 0;
\\\

---

## Summary

This fix resolves the duplicate transporter list issue by changing the JOIN strategy from \all addresses + all contacts\ to \primary address + first contact\. The solution is efficient, backward-compatible, and requires no database changes.

**Key Achievement**: Transporter list now displays exactly 1 row per transporter, regardless of how many addresses or contacts exist.

