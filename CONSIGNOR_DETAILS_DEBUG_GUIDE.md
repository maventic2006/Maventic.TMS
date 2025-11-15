#  Consignor Details Page - Debug & Testing Guide

> **Issue:** Details page still not showing data after Redux fix  
> **Added:** Console logging to track data flow  
> **Action Required:** Hard refresh browser and check console  

---

##  **CRITICAL: Hard Refresh Required!**

The Redux code has changed, so you **MUST** do a hard refresh to clear the old cached JavaScript:

### **Windows/Linux:**
\\\
Press: Ctrl + Shift + R
Or: Ctrl + F5
\\\

### **Mac:**
\\\
Press: Cmd + Shift + R
Or: Cmd + Option + R
\\\

### **Alternative (Nuclear Option):**
1. Press F12 to open DevTools
2. Right-click the refresh button
3. Select \"Empty Cache and Hard Reload\"

---

##  **Testing Steps with Console Logging**

### 1. Open Browser Console

\\\
Press: F12
Go to: Console tab
\\\

### 2. Navigate to Details Page

\\\
http://localhost:5173/consignor/CON0001
\\\

Or click on a consignor ID from the list page.

### 3. Check Console Output

You should see these log messages:

#### ** Expected Logs (Data Flattened Correctly):**

\\\
 ===== CONSIGNOR FETCH DEBUG =====
Raw API payload: {
  general: {
    customer_id: \"CON0001\",
    customer_name: \"Maventic\",
    ...
  },
  contacts: [...],
  organization: {...},
  documents: []
}

Flattened data: {
  customer_id: \"CON0001\",        //  At top level now!
  customer_name: \"Maventic\",
  search_term: \"maventic\",
  industry_type: \"Technology\",
  ...
  contacts: [...],
  organization: {...},
  documents: []
}

 Data should now be accessible at top level
===================================

 ===== CONSIGNOR DETAILS PAGE DEBUG =====
currentConsignor from Redux: {
  customer_id: \"CON0001\",
  customer_name: \"Maventic\",
  ...
}
Has customer_id? CON0001
Has customer_name? Maventic
Has contacts? [Array]
Has organization? {Object}
==========================================
\\\

#### ** Bad Logs (Data Still Nested - Hard Refresh Needed):**

\\\
 ===== CONSIGNOR FETCH DEBUG =====
Raw API payload: { general: {...}, contacts: [...], ... }

Flattened data: {
  general: {...},  //  Still nested! Old code running!
  contacts: [...],
  ...
}

 ===== CONSIGNOR DETAILS PAGE DEBUG =====
Has customer_id? undefined  //  Not found at top level!
Has customer_name? undefined
\\\

**If you see this**, the old JavaScript is still cached. Do a hard refresh!

---

##  **What Should Happen**

### **After Successful Hard Refresh:**

1. **Console shows flattened data** with fields at top level
2. **Details page header** shows:
   - Customer name: \"Maventic\"
   - Status badge: \"ACTIVE\" (green)
   - Customer ID: \"CON0001\"

3. **All tabs display data:**

#### **General Information Tab:**
\\\
 Customer ID: CON0001
 Customer Name: Maventic
 Search Term: maventic
 Industry Type: Technology
 Currency Type: INR
 Payment Term: NET_90
 Name on PO: shubham
 Approved By: shubam
 Approved Date: Jul 25, 2025
 Status: ACTIVE
\\\

#### **Contact Information Tab:**
\\\
 Contact ID: CON00135
 Name: shubham
 Designation: staff
 Phone: +91 9876543219
 Email: werqwer@gmail.com
 LinkedIn: https://example.com
 Team: maventic
 Role: staff
 Status: ACTIVE
\\\

#### **Organization Details Tab:**
\\\
 Company Code: ACME-98
 Business Areas:
    Andaman and Nicobar Islands
    Andhra Pradesh
    Arunachal Pradesh
 Status: ACTIVE
\\\

#### **Documents Tab:**
\\\
? No documents found
Document information will appear here once uploaded
\\\

---

##  **Troubleshooting**

### **Issue 1: Still Seeing Nested Data in Console**

**Symptom:**
\\\
Flattened data: { general: {...}, contacts: [...] }
\\\

**Solution:**
1. Close browser completely
2. Reopen browser
3. Navigate directly to: http://localhost:5173/consignor/CON0001
4. Check console again

### **Issue 2: No Console Logs Appearing**

**Symptom:**
No debug logs showing in console

**Possible Causes:**
- Console filter is on (check \"All levels\" is selected)
- Wrong browser tab open
- Frontend not running

**Solution:**
\\\ash
# Check if frontend is running
# Should be on http://localhost:5173

# Restart frontend if needed
cd d:\\tms developement 11 nov\\Maventic.TMS\\frontend
npm run dev
\\\

### **Issue 3: Data Showing in Console But Not in UI**

**Symptom:**
\\\
Console: Has customer_name? Maventic  
UI: Shows \"N/A\" or blank fields  
\\\

**Possible Cause:**
View tab components might have errors

**Solution:**
Check browser console for React errors:
\\\
Look for red error messages
Check \"Errors\" filter in console
\\\

### **Issue 4: 404 Error on Details Page**

**Symptom:**
\\\
Cannot GET /consignor/CON0001
\\\

**Solution:**
Use the correct route format. Check your router configuration.

### **Issue 5: \"Error Loading Data\" Message**

**Symptom:**
Red error message instead of data

**Solution:**
1. Check Network tab for API response
2. Verify backend is running (http://localhost:5000)
3. Check backend console for errors

---

##  **Redux DevTools Inspection**

If you have Redux DevTools extension:

### 1. Open Redux DevTools

\\\
F12  Redux tab
\\\

### 2. Check State

\\\
State  consignor  currentConsignor
\\\

### 3. Verify Structure

** Correct (Flattened):**
\\\json
{
  consignor: {
    currentConsignor: {
      customer_id: \"CON0001\",     // At top level!
      customer_name: \"Maventic\",
      contacts: [...],
      organization: {...}
    }
  }
}
\\\

** Wrong (Still Nested):**
\\\json
{
  consignor: {
    currentConsignor: {
      general: {                   // Still nested!
        customer_id: \"CON0001\",
        customer_name: \"Maventic\"
      },
      contacts: [...]
    }
  }
}
\\\

---

##  **Manual Cache Clearing (If Hard Refresh Doesn't Work)**

### Chrome/Edge:
1. Settings (three dots)
2. More Tools  Clear Browsing Data
3. Select \"Cached images and files\"
4. Time range: \"Last hour\"
5. Clear data
6. Restart browser

### Firefox:
1. Settings (three lines)
2. Privacy & Security
3. Cookies and Site Data  Clear Data
4. Select \"Cached Web Content\"
5. Clear
6. Restart browser

---

##  **Success Indicators**

You'll know it's working when you see:

- [x] Console shows: \" ===== CONSIGNOR FETCH DEBUG =====\"
- [x] Console shows: \"Flattened data:\" with fields at top level
- [x] Console shows: \"Has customer_name? Maventic\"
- [x] Details page header shows customer name
- [x] All tabs display actual data (not \"N/A\")
- [x] Green \"ACTIVE\" status badge visible
- [x] No React errors in console

---

##  **Quick Test Sequence**

\\\markdown
1.   Hard refresh: Ctrl+Shift+R
2.  Open console: F12
3.  Navigate: http://localhost:5173/consignor/CON0001
4.  Check console for debug logs
5.  Verify data shows in all tabs
\\\

---

##  **After Testing**

Once confirmed working, we can remove the debug console.log statements to clean up the code.

**Report back with:**
1. What console logs you see
2. Which tabs show data
3. Any error messages

This will help diagnose if there's a caching issue or another problem!

---

**Remember: The most common issue is cached JavaScript. Hard refresh solves 90% of problems!** 
