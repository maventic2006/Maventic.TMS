# VAT/GST Filter Fix - Documentation

## Issue Description

**Problem**: When filtering transporters by VAT/GST number, the system returned "No transporter found" even for existing transporters with matching VAT/GST numbers.

**Root Cause**: The VAT/GST filter was incorrectly mapped to search by **state name** (`addr.state`) instead of **VAT number** (`addr.vat_number`).

---

## Solution

### Backend Changes
**File**: `tms-backend/controllers/transporterController.js`

1. Added `vatGst` query parameter
2. Added filter: `if (vatGst) { query.where("addr.vat_number", "like", \`%${vatGst}%\`) }`

### Frontend Changes  
**File**: `frontend/src/pages/TransporterMaintenance.jsx`

Changed parameter mapping (2 locations):
```javascript
// BEFORE ❌
if (appliedFilters.vatGst) {
  params.state = appliedFilters.vatGst; // Wrong - searched state names
}

// AFTER ✅
if (appliedFilters.vatGst) {
  params.vatGst = appliedFilters.vatGst; // Correct - searches VAT numbers
}
```

---

## How It Works Now

1. User enters VAT/GST number: `27AABCU9603R1ZX`
2. Frontend sends: `?vatGst=27AABCU9603R1ZX`
3. Backend queries: `WHERE addr.vat_number LIKE '%27AABCU9603R1ZX%'`
4. Returns matching transporter from **any page** (not just current page)

---

## Testing

- ✅ Full VAT/GST number search
- ✅ Partial VAT/GST number search  
- ✅ Cross-page search (finds results on any page)
- ✅ Combined filters (Status + Mode + VAT/GST)
- ✅ Case-insensitive search

---

**Status**: ✅ **COMPLETED**

