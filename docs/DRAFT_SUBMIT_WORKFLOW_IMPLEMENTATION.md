# Draft Transporter Submit Workflow - Complete Implementation

**Date**: November 22, 2025  
**Feature**: Draft transporter submission workflow with creator-based access control

---

## Overview

Implemented a comprehensive draft transporter workflow that allows product owners to:
1. Save transporters as drafts with minimal validation
2. Edit only their own drafts  
3. Update drafts (keep as SAVE_AS_DRAFT) with minimal validation
4. Submit drafts for approval (change to PENDING) with full validation
5. Distinguish between draft and non-draft transporters in the UI

---

## Implementation Summary

###  Backend Changes

#### 1. New Controller Function: submitTransporterFromDraft

**File**: 	ms-backend/controllers/transporterController.js

**Features**:
- Validates transporter status is SAVE_AS_DRAFT
- Verifies creator ownership (only creator can submit their drafts)
- Performs full validation (same as createTransporter)
- Updates status from SAVE_AS_DRAFT to PENDING
- Updates both transporter_general_info and user_master tables
- Re-inserts all related data (addresses, contacts, service areas, documents)

**Validation Requirements**:
- Business name required (minimum 2 characters)
- At least one transport mode selected
- At least one address required
- At least one address must be primary
- At least one serviceable area required

**API Endpoint**:
`
PUT /api/transporter/:id/submit-draft
`

**Request Body**:
`json
{
   generalDetails: { ...complete general info... },
  addresses: [ ...complete address data... ],
  serviceableAreas: [ ...complete service areas... ],
  documents: [ ...optional documents... ]
}
`

**Success Response**:
`json
{
  success: true,
  message: Draft submitted for approval successfully. Status changed to PENDING.,
  data: {
    transporterId: T001,
    status: PENDING
  }
}
`

**Error Responses**:
- 404: Transporter not found
- 400: Invalid status (not a draft)
- 403: Forbidden (not the creator)
- 400: Validation errors

#### 2. Route Addition

**File**: 	ms-backend/routes/transporter.js

Added new route:
`javascript
router.put(
  /:id/submit-draft,
  authenticateToken,
  checkProductOwnerAccess,
  submitTransporterFromDraft
);
`

#### 3. Module Export

Updated exports to include:
`javascript
module.exports = {
  // ...existing exports...
  submitTransporterFromDraft,
};
`

---

###  Frontend Changes

#### 1. New Component: SubmitDraftModal

**File**: rontend/src/components/ui/SubmitDraftModal.jsx

**Features**:
- Framer Motion animations
- Two action buttons:
  - **Update Draft**: Minimal validation, keeps status as SAVE_AS_DRAFT
  - **Submit for Approval**: Full validation, changes status to PENDING
- Explanatory text for each option
- Loading states
- Keyboard shortcuts (ESC to close)
- Accessible ARIA labels

**Props**:
`javascript
{
  isOpen: boolean,
  onUpdateDraft: function,
  onSubmitForApproval: function,
  onCancel: function,
  isLoading: boolean,
  title: string,
  message: string
}
`

**Visual Design**:
- Blue header with AlertCircle icon
- Two-column layout explaining both options
- Amber Update Draft button (minimal validation)
- Green Submit for Approval button (full validation)
- Matches SaveAsDraftModal styling

#### 2. Redux Slice Updates

**File**: rontend/src/redux/slices/transporterSlice.js

**New Async Thunk**:
`javascript
export const submitTransporterFromDraft = createAsyncThunk(
  transporter/submitFromDraft,
  async ({ transporterId, transporterData }, { rejectWithValue }) => {
    // API call to submit draft
  }
);
`

**New State Properties**:
`javascript
{
  isSubmittingDraft: false,
  lastDraftAction: submitted // added 'submitted' option
}
`

**Reducers**:
- submitTransporterFromDraft.pending: Sets isSubmittingDraft to true
- submitTransporterFromDraft.fulfilled: Updates transporter status to PENDING in state
- submitTransporterFromDraft.rejected: Handles errors

#### 3. TransporterDetailsPage Updates

**File**: rontend/src/features/transporter/TransporterDetailsPage.jsx

**New Imports**:
`javascript
import { 
  updateTransporterDraft, 
  submitTransporterFromDraft 
} from ../../redux/slices/transporterSlice;
import SubmitDraftModal from ../../components/ui/SubmitDraftModal;
`

**New State Variables**:
`javascript
const [showSubmitModal, setShowSubmitModal] = useState(false);
`

**New Redux Selectors**:
`javascript
const { isUpdatingDraft, isSubmittingDraft } = useSelector(
  (state) => state.transporter
);
`

**Helper Variables**:
`javascript
const isDraftTransporter = selectedTransporter?.generalDetails?.status === SAVE_AS_DRAFT;
const isCreator = selectedTransporter?.generalDetails?.createdBy === user?.user_id;
const canEdit = isDraftTransporter ? isCreator : true;
`

**New Functions**:

1. **handleSaveChanges** (Updated):
   - Checks if transporter is draft
   - Shows SubmitDraftModal if draft
   - Otherwise proceeds with normal update

2. **handleUpdateDraft** (New):
   - Minimal validation (only business name)
   - Calls updateTransporterDraft API
   - Keeps status as SAVE_AS_DRAFT
   - Shows success/error toasts
   - Refreshes data and exits edit mode

3. **handleSubmitForApproval** (New):
   - Full validation using validateAllSections
   - Calls submitTransporterFromDraft API
   - Changes status to PENDING
   - Shows success/error toasts
   - Handles validation errors with tab switching
   - Refreshes data and exits edit mode

4. **handleNormalUpdate** (Renamed):
   - Original handleSaveChanges logic
   - For non-draft transporters

**UI Changes**:

1. **Edit Button Label**:
   - Shows Edit Draft for SAVE_AS_DRAFT status
   - Shows Edit Details for other statuses

2. **Save Button Label**:
   - Shows Submit Changes for SAVE_AS_DRAFT status
   - Shows Save Changes for other statuses

3. **Access Control**:
   - Edit button only shown if user canEdit
   - For drafts: only creator can edit
   - For non-drafts: any product owner can edit

4. **Loading States**:
   - Save button disabled when isUpdating, isUpdatingDraft, or isSubmittingDraft
   - Shows Processing... for drafts, Saving... for non-drafts

5. **Modal Integration**:
   - SubmitDraftModal added before closing div
   - Triggered when clicking Submit Changes on draft transporter

---

## User Workflow

### Scenario 1: Creating and Saving Draft

1. User fills out transporter create form
2. Clicks Save as Draft
3. Transporter saved with status SAVE_AS_DRAFT
4. Minimal validation (only business name required)
5. User sees draft in transporter list

### Scenario 2: Editing Own Draft

1. Creator clicks on their draft transporter
2. Sees Edit Draft button (other users don't see this button)
3. Clicks Edit Draft button
4. Makes changes
5. Clicks Submit Changes button
6. **Modal appears** with two options:
   - **Update Draft**: Keeps as draft, minimal validation
   - **Submit for Approval**: Changes to PENDING, full validation

### Scenario 3: Update Draft (Keep as Draft)

1. In modal, clicks Update Draft
2. Minimal validation performed
3. If valid:
   - Draft updated with new data
   - Status remains SAVE_AS_DRAFT
   - Success toast shown
   - Returns to view mode
4. If invalid:
   - Error toast shown
   - Stays in edit mode

### Scenario 4: Submit for Approval

1. In modal, clicks Submit for Approval
2. Full validation performed
3. If valid:
   - All data saved
   - Status changed to PENDING
   - Success toast: Draft submitted for approval successfully! Status changed to PENDING.
   - Returns to view mode
   - Edit button no longer shown (non-creator can''t edit PENDING)
4. If invalid:
   - Validation errors shown
   - Tab with errors highlighted
   - Auto-switch to first tab with errors
   - Error toast shown
   - Stays in edit mode

### Scenario 5: Non-Creator Views Draft

1. Different product owner opens draft transporter
2. Sees transporter details in view mode
3. **No Edit button shown** (not the creator)
4. Cannot modify the draft

### Scenario 6: Editing Non-Draft Transporter

1. Any product owner opens PENDING/ACTIVE transporter
2. Sees Edit Details button
3. Clicks edit, makes changes
4. Clicks Save Changes
5. Normal update flow (no modal)
6. Full validation applied

---

## Access Control Rules

| Status | Creator | Non-Creator Product Owner |
|--------|---------|---------------------------|
| SAVE_AS_DRAFT | Can view & edit | Can view only (no edit button) |
| PENDING | Can view only | Can view only (approval flow) |
| ACTIVE | Can view & edit | Can view & edit |

---

## Validation Levels

### Minimal Validation (Update Draft)
- Business name required (min 2 characters)
- No other requirements
- Allows saving incomplete data

### Full Validation (Submit for Approval)
- Business name required (min 2 characters)
- At least one transport mode selected
- At least one address required
- At least one address must be primary
- Address must have country, state, city
- At least one serviceable area required
- Service area must have country and states
- Same validation as createTransporter

---

## Status Transitions

`
CREATE  SAVE_AS_DRAFT (Save as Draft button)
         
SAVE_AS_DRAFT  SAVE_AS_DRAFT (Update Draft button in modal)
         
SAVE_AS_DRAFT  PENDING (Submit for Approval button in modal)
         
PENDING  ACTIVE (Approval by another product owner)
`

---

## Testing Checklist

### Backend Testing

- [ ] POST /api/transporter/save-draft works
- [ ] PUT /api/transporter/:id/update-draft works for creator
- [ ] PUT /api/transporter/:id/submit-draft validates status
- [ ] PUT /api/transporter/:id/submit-draft validates creator
- [ ] PUT /api/transporter/:id/submit-draft performs full validation
- [ ] PUT /api/transporter/:id/submit-draft changes status to PENDING
- [ ] PUT /api/transporter/:id/submit-draft updates user_master
- [ ] 403 error when non-creator tries to submit draft
- [ ] 400 error when trying to submit non-draft
- [ ] Validation errors have correct field paths

### Frontend Testing

- [ ] SubmitDraftModal renders correctly
- [ ] SubmitDraftModal shows on Submit Changes click for drafts
- [ ] Update Draft button works with minimal validation
- [ ] Submit for Approval button works with full validation
- [ ] Validation errors show in correct tabs
- [ ] Tab switching on validation errors
- [ ] Success toast on update draft
- [ ] Success toast on submit for approval
- [ ] Error toast on validation failure
- [ ] Loading states work correctly
- [ ] Modal closes on cancel/ESC
- [ ] Edit button shows Edit Draft for drafts
- [ ] Edit button shows Edit Details for non-drafts
- [ ] Save button shows Submit Changes for drafts
- [ ] Save button shows Save Changes for non-drafts
- [ ] Creator can edit own drafts
- [ ] Non-creator cannot see edit button for drafts
- [ ] Any product owner can edit ACTIVE transporters
- [ ] Status changes from SAVE_AS_DRAFT to PENDING after submit

### Integration Testing

- [ ] End-to-end: Create draft  Edit  Update Draft  Edit  Submit for Approval
- [ ] Creator logs in, creates draft, sees it in list with SAVE_AS_DRAFT badge
- [ ] Creator clicks draft, sees Edit Draft button
- [ ] Creator edits, clicks Submit Changes, modal appears
- [ ] Creator clicks Update Draft, draft updated, still SAVE_AS_DRAFT
- [ ] Creator edits again, clicks Submit Changes, clicks Submit for Approval
- [ ] Full validation runs, status changes to PENDING
- [ ] Non-creator logs in, sees draft in list
- [ ] Non-creator clicks draft, does NOT see edit button
- [ ] Non-creator clicks PENDING transporter, sees approval flow

---

## Files Modified

### Backend
1. 	ms-backend/controllers/transporterController.js
   - Added submitTransporterFromDraft function
   - Updated module.exports

2. 	ms-backend/routes/transporter.js
   - Added PUT /:id/submit-draft route
   - Updated require imports

### Frontend
1. rontend/src/components/ui/SubmitDraftModal.jsx
   - New component created

2. rontend/src/redux/slices/transporterSlice.js
   - Added submitTransporterFromDraft async thunk
   - Added isSubmittingDraft state
   - Added submit draft reducers

3. rontend/src/features/transporter/TransporterDetailsPage.jsx
   - Added imports for draft functions and modal
   - Added state for showSubmitModal
   - Added helper variables (isDraftTransporter, isCreator, canEdit)
   - Updated handleSaveChanges to check for drafts
   - Added handleUpdateDraft function
   - Added handleSubmitForApproval function
   - Renamed original logic to handleNormalUpdate
   - Updated Edit button label logic
   - Updated Save button label logic
   - Added access control to Edit button
   - Added SubmitDraftModal to JSX

---

## Database Impact

### Tables Updated on Submit

1. **transporter_general_info**
   - status: SAVE_AS_DRAFT  PENDING
   - All other fields updated with complete data

2. **user_master**
   - status: SAVE_AS_DRAFT  PENDING
   - user_full_name updated

3. **Cascading Updates** (Delete & Re-insert):
   - tms_address
   - transporter_contact
   - transporter_service_area_hdr
   - transporter_service_area_itm
   - transporter_documents
   - document_upload

---

## Error Handling

### Backend Errors

| Error Code | HTTP Status | Message | Cause |
|------------|-------------|---------|-------|
| NOT_FOUND | 404 | Transporter not found | Invalid ID |
| INVALID_STATUS | 400 | Can only submit drafts for approval | Status is not SAVE_AS_DRAFT |
| FORBIDDEN | 403 | You can only submit your own drafts | User is not creator |
| VALIDATION_ERROR | 400 | Specific validation message | Missing required fields |
| SUBMIT_DRAFT_ERROR | 500 | Failed to submit draft | Server error |

### Frontend Error Handling

1. **Validation Errors**:
   - Parsed to extract field path
   - Mapped to correct tab
   - Tab highlighted with error indicator
   - Auto-switch to tab with error
   - Inline error messages shown
   - Error toast displayed

2. **Network Errors**:
   - Generic error toast
   - Stay in edit mode
   - Allow retry

3. **Access Errors** (403):
   - Error toast: You can only submit your own drafts
   - Return to view mode

---

## Known Limitations

1. **Creator Identification**:
   - Based on created_by field from backend
   - Assumes user_id from JWT matches created_by

2. **Concurrent Editing**:
   - No locking mechanism
   - Last save wins
   - Consider adding optimistic locking in future

3. **Draft Expiration**:
   - No automatic cleanup of old drafts
   - Consider adding draft expiration policy

---

## Future Enhancements

1. **Draft Auto-Save**:
   - Periodic auto-save every 30 seconds
   - Prevent data loss

2. **Draft Ownership Transfer**:
   - Allow assigning draft to another user
   - Useful for delegation

3. **Draft Comments**:
   - Add comments/notes to drafts
   - Track review feedback

4. **Draft History**:
   - Track all changes to draft
   - Show revision history

5. **Batch Submit**:
   - Submit multiple drafts at once
   - Useful for bulk operations

---

## Troubleshooting

### Issue: Modal doesn''t appear on draft submit

**Solution**: Check if status is exactly SAVE_AS_DRAFT (case-sensitive)

### Issue: Non-creator can edit draft

**Solution**: Verify created_by field is properly set and user_id from JWT matches

### Issue: Validation errors not showing

**Solution**: Check Redux state clearError() is being called to prevent stale errors

### Issue: Status not changing to PENDING

**Solution**: Check backend submitTransporterFromDraft function updates both tables

---

## Conclusion

The draft transporter submit workflow is now fully implemented with:
-  Creator-based access control
-  Two-action modal (Update Draft / Submit for Approval)
-  Minimal vs full validation
-  Status transition from SAVE_AS_DRAFT to PENDING
-  UI indicators for draft vs non-draft
-  Comprehensive error handling
-  No breaking changes to existing functionality

All requirements from the user have been successfully implemented.
