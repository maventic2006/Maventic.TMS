#  Quick Test Guide - Contact Photo Upload

## Start the Application

### Backend
\\\ash
cd tms-backend
npm run dev
\\\
Expected: Server running on http://localhost:5000

### Frontend
\\\ash
cd frontend
npm run dev
\\\
Expected: Frontend running on http://localhost:5173

---

## Test Steps

### 1. Create Consignor with Photo
1. Go to: http://localhost:5173/consignor/create
2. Fill General Information tab
3. Go to Contact Information tab
4. Click 'Upload Image' in photo column
5. Select a JPEG/PNG file (< 5MB)
6.  Verify: Image preview shows immediately
7. Fill contact details (name, designation, phone, role)
8. Go to Organization tab - add business area
9. Click 'Create Consignor'
10.  Verify: Success toast appears

### 2. View Photo
1. Go to consignor list page
2. Click on the created consignor
3. Go to Contact Information tab
4.  Verify: Photo displays in contact card

### 3. Check Backend
1. Open: http://localhost:5000/uploads/consignor/contacts/
2.  Verify: Photo file exists with timestamp-hash filename
3. Open photo URL directly in browser
4.  Verify: Image displays correctly

---

## Expected File Structure

\\\
tms-backend/uploads/consignor/contacts/
 1731596847123-abc123def456.jpg   Your uploaded photo
\\\

---

## Database Check

\\\sql
SELECT contact_photo FROM contact WHERE customer_id = 'YOUR_CUSTOMER_ID';
\\\

Expected result:
\\\
/uploads/consignor/contacts/1731596847123-abc123def456.jpg
\\\

---

## Common Issues

### Photo Not Showing
- Check browser console for 404 errors
- Verify uploads directory exists
- Check static file middleware in server.js

### Upload Fails
- File too large (max 5MB)
- Wrong file type (must be JPEG/PNG)
- Check backend logs for errors

---

##  Success Criteria

- [x] Can select image file from file picker
- [x] Image preview shows immediately after selection
- [x] Can remove uploaded image
- [x] Consignor creates successfully with photo
- [x] Photo displays in view mode
- [x] Photo accessible via direct URL
- [x] File stored in correct uploads directory
- [x] Database contains correct file path

---

##  All features working? Implementation successful!
