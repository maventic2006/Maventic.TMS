# Driver Module - Frontend Completion Guide

## Quick Reference for Building Remaining Components

---

## 🎯 APPROACH

**Copy existing Transporter components and adapt for Driver structure:**

1. Find corresponding Transporter component
2. Copy to Driver folder
3. Replace all "Transporter" with "Driver"
4. Update Redux slice import from `transporterSlice` to `driverSlice`
5. Update field mappings to match driver schema
6. Remove any driver-specific fields (like transport modes, serviceable areas)
7. Update validation rules if needed

---

## 📂 FILE MAPPING TABLE

| Driver Component        | Copy From Transporter        | Location                           |
| ----------------------- | ---------------------------- | ---------------------------------- |
| `DriverListPage.jsx`    | `TransporterListPage.jsx`    | `features/transporter/`            |
| `DriverCreatePage.jsx`  | `TransporterCreatePage.jsx`  | `features/transporter/`            |
| `DriverDetailsPage.jsx` | `TransporterDetailsPage.jsx` | `features/transporter/`            |
| `BasicInfoTab.jsx`      | `GeneralInfoTab.jsx`         | `features/transporter/components/` |
| `AddressTab.jsx`        | `AddressContactsTab.jsx`     | `features/transporter/components/` |
| `DocumentsTab.jsx`      | `DocumentsTab.jsx`           | `features/transporter/components/` |
| `BasicInfoViewTab.jsx`  | `GeneralInfoViewTab.jsx`     | `features/transporter/components/` |
| `AddressViewTab.jsx`    | `AddressContactsViewTab.jsx` | `features/transporter/components/` |
| `DocumentsViewTab.jsx`  | `DocumentsViewTab.jsx`       | `features/transporter/components/` |

---

## 🔄 FIELD MAPPING REFERENCE

### Basic Info Tab

**Transporter Fields → Driver Fields:**

```javascript
// Remove these Transporter-specific fields:
businessName; // ❌ Remove
tinPan; // ❌ Remove
tan; // ❌ Remove
vatNumber; // ❌ Remove
transportModes; // ❌ Remove (Road, Rail, Air, Sea)
avgRating; // ✅ Keep (both have)
status; // ✅ Keep (both have)

// Add these Driver-specific fields:
fullName; // ✅ Add (driver name)
dateOfBirth; // ✅ Add
gender; // ✅ Add (dropdown: Male, Female, Others)
bloodGroup; // ✅ Add (dropdown: A+, A-, B+, B-, AB+, AB-, O+, O-)

// Keep these common fields:
phoneNumber; // ✅ Keep
emailId; // ✅ Keep
whatsAppNumber; // ✅ Keep
alternatePhoneNumber; // ✅ Keep
```

### Address Tab

**Transporter Structure → Driver Structure:**

```javascript
// Address fields are IDENTICAL between Transporter and Driver
// Both use tms_address table with user_type field

addresses: [
  {
    addressTypeId, // ✅ Same
    country, // ✅ Same
    state, // ✅ Same
    city, // ✅ Same
    district, // ✅ Same
    street1, // ✅ Same
    street2, // ✅ Same
    postalCode, // ✅ Same
    isPrimary, // ✅ Same
  },
];

// Only difference: user_type = "DRIVER" instead of "TRANSPORTER"
```

### Documents Tab

**Transporter Documents → Driver Documents:**

```javascript
// Transporter has these document types:
Registration Certificate
Insurance Policy
PAN Card
GST Certificate
Transport License

// Driver has these document types (from document_name_master):
LIC001: LMV (Light Motor Vehicle)
LIC002: TRANS (Transport Vehicle)
LIC003: HGMV (Heavy Goods Motor Vehicle)
LIC004: HMV (Heavy Motor Vehicle)
LIC005: HPMV (Heavy Passenger Motor Vehicle)
LIC006: LDRXCV (Light Drive RX Commercial Vehicle)
ID001: Pan
ID002: Aadhar

// Document fields structure is IDENTICAL:
documents: [
  {
    documentType,       // ✅ Same structure (but different types)
    documentNumber,     // ✅ Same
    issuingCountry,     // ✅ Same
    issuingState,       // ✅ Same
    validFrom,          // ✅ Same
    validTo,            // ✅ Same
    status,             // ✅ Same
    remarks             // ✅ Same
  }
]
```

---

## 🛠️ STEP-BY-STEP CONVERSION EXAMPLE

### Example: Converting GeneralInfoTab → BasicInfoTab

**Step 1: Copy File**

```bash
Copy-Item "frontend/src/features/transporter/components/GeneralInfoTab.jsx" `
          "frontend/src/features/driver/components/BasicInfoTab.jsx"
```

**Step 2: Update Imports**

```javascript
// OLD:
import { useSelector, useDispatch } from "react-redux";
import { fetchMasterData } from "../../../redux/slices/transporterSlice";

// NEW:
import { useSelector, useDispatch } from "react-redux";
import { fetchMasterData } from "../../../redux/slices/driverSlice";
```

**Step 3: Update Redux State Access**

```javascript
// OLD:
const { masterData } = useSelector((state) => state.transporter);

// NEW:
const { masterData } = useSelector((state) => state.driver);
```

**Step 4: Remove Transporter-Specific Fields**

```javascript
// Remove these entire field groups:
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <CustomInput
    label="Business Name"
    name="businessName"
    // ... remove entire field
  />
  <CustomInput
    label="TIN/PAN"
    name="tinPan"
    // ... remove entire field
  />
</div>

// Remove transport mode selection section
<div className="transport-mode-section">
  {/* Remove entire section */}
</div>
```

**Step 5: Add Driver-Specific Fields**

```javascript
// Add new fields:
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <CustomInput
    label="Full Name *"
    name="fullName"
    value={formData.fullName || ""}
    onChange={handleChange}
    error={errors.fullName}
  />

  <CustomInput
    label="Date of Birth"
    name="dateOfBirth"
    type="date"
    value={formData.dateOfBirth || ""}
    onChange={handleChange}
  />

  <CustomSelect
    label="Gender"
    name="gender"
    value={formData.gender || ""}
    onChange={handleChange}
    options={masterData?.genderOptions || []}
  />

  <CustomSelect
    label="Blood Group"
    name="bloodGroup"
    value={formData.bloodGroup || ""}
    onChange={handleChange}
    options={masterData?.bloodGroupOptions || []}
  />
</div>
```

**Step 6: Update Validation**

```javascript
// OLD:
if (!formData.businessName || formData.businessName.trim().length < 2) {
  newErrors.businessName = "Business name must be at least 2 characters";
  hasErrors = true;
}

// NEW:
if (!formData.fullName || formData.fullName.trim().length < 2) {
  newErrors.fullName = "Full name must be at least 2 characters";
  hasErrors = true;
}
```

---

## 🎨 THEME COMPLIANCE CHECKLIST

For **EVERY** component you create, ensure:

```javascript
// ✅ DO THIS:
import { getPageTheme, getComponentTheme } from '../../../theme.config.js';

const BasicInfoTab = () => {
  const theme = getPageTheme('general'); // or 'list' or 'tab'
  const buttonTheme = getComponentTheme('actionButton');

  return (
    <div style={{ backgroundColor: theme.colors.primary.background }}>
      <button style={{
        backgroundColor: buttonTheme.primary.background,
        color: buttonTheme.primary.text
      }}>
        Save
      </button>
    </div>
  );
};

// ❌ NEVER DO THIS:
<div className="bg-white text-gray-800">        // ❌ Hardcoded
<button style={{ backgroundColor: "#10B981" }}> // ❌ Hardcoded
<div className="bg-blue-500">                   // ❌ Hardcoded
```

---

## 🧪 TESTING CHECKLIST (Per Component)

### For Each Page/Component:

```markdown
- [ ] Imports updated (driver slice instead of transporter)
- [ ] Redux selectors updated (state.driver instead of state.transporter)
- [ ] Field names match driver schema
- [ ] Validation rules implemented
- [ ] Theme configuration imported and used
- [ ] NO hardcoded colors
- [ ] Phone validation (10-digit, 6-9 starting)
- [ ] Email validation
- [ ] Duplicate checking for phone/email
- [ ] Success toast on save
- [ ] Error toast on failure
- [ ] Loading states handled
- [ ] Responsive design (mobile-first)
```

---

## 🚀 RECOMMENDED BUILD ORDER

### Phase 1: List Page (1-2 hours)

1. Create `DriverListPage.jsx` from Transporter list
2. Update columns: ID, Name, Phone, Email, Gender, Blood Group, Status
3. Test pagination and filtering

### Phase 2: View Components (2-3 hours)

1. Create `BasicInfoViewTab.jsx` - Display driver basic info
2. Create `AddressViewTab.jsx` - Display addresses (copy from transporter)
3. Create `DocumentsViewTab.jsx` - Display documents (copy from transporter)

### Phase 3: Form Components (2-3 hours)

1. Create `BasicInfoTab.jsx` - Driver info form
2. Create `AddressTab.jsx` - Multi-address form (copy from transporter)
3. Create `DocumentsTab.jsx` - Documents form (copy from transporter, update doc types)

### Phase 4: Pages Integration (2-3 hours)

1. Create `DriverCreatePage.jsx` - Multi-tab form
2. Create `DriverDetailsPage.jsx` - View/Edit tabs
3. Add routing in `App.jsx`

### Phase 5: Testing & Polish (1-2 hours)

1. End-to-end testing
2. Theme compliance verification
3. Validation testing
4. Toast notifications
5. Error handling

**Total Estimated Time: 8-13 hours**

---

## 📚 REFERENCE FILES

**Best Reference Components:**

- `frontend/src/features/transporter/TransporterListPage.jsx`
- `frontend/src/features/transporter/TransporterCreatePage.jsx`
- `frontend/src/features/transporter/TransporterDetailsPage.jsx`
- `frontend/src/features/transporter/components/GeneralInfoTab.jsx`
- `frontend/src/features/transporter/components/AddressContactsTab.jsx`
- `frontend/src/features/transporter/components/DocumentsTab.jsx`

**Theme Reference:**

- `frontend/src/theme.config.js` - All color tokens and theme functions

**Validation Reference:**

- `tms-backend/controllers/driverController.js` - Backend validation rules

---

## 💡 PRO TIPS

1. **Use Find & Replace**:

   - Find: `transporter` → Replace: `driver`
   - Find: `Transporter` → Replace: `Driver`
   - Find: `TRANSPORTER` → Replace: `DRIVER`

2. **Keep Address/Documents Logic Identical**: These tabs can be copy-pasted with minimal changes since they use shared tables

3. **Focus on Basic Info Tab**: This is where most customization happens (driver-specific fields)

4. **Test Incrementally**: Build one component, test it, then move to next

5. **Use Browser DevTools**: Check Redux state and API responses in browser console

---

## 🆘 TROUBLESHOOTING

**Issue**: Form not submitting  
**Fix**: Check Redux thunk names (`createDriver` not `createTransporter`)

**Issue**: Validation errors not showing  
**Fix**: Ensure error field paths match backend response (`basicInfo.fullName` vs `generalDetails.businessName`)

**Issue**: Dropdowns empty  
**Fix**: Check `fetchMasterData` is called on component mount

**Issue**: Theme colors not working  
**Fix**: Import and call `getPageTheme()` or `getComponentTheme()`

**Issue**: 403 Access Denied on API calls  
**Fix**: Ensure user token has `user_type_id = "UT001"` (Owner role)

---

**Ready to Continue?** Start with Phase 1 (Driver List Page) and work through each phase systematically.
