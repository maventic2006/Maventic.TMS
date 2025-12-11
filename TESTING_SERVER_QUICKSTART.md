# Testing Server Quick Start Guide

## Ì∫® CRITICAL: Fix 401 Errors on Testing Server

### The Problem

Your frontend is built with `localhost:5000` URLs, but the testing server is at `192.168.2.32:5000`. 

**Current Behavior**:
```
‚ùå Contact Photo API: http://localhost:5000/api/consignors/.../photo (401 Unauthorized)
‚úÖ Document API: http://192.168.2.32:5000/api/consignors/.../download (200 OK)
```

**Why Mixed URLs?**
- The `.env` file has `VITE_API_BASE_URL=http://localhost:5000/api`
- When you run `npm run build`, Vite bakes these URLs into the JavaScript
- The built `dist/` files contain hardcoded `localhost:5000`

### The Solution (3 Steps)

#### Step 1: Build with Testing Server URL

**Option A: Use Build Script (Recommended)**

```bash
cd frontend

# Windows
build-testing.bat

# Linux/Mac
./build-testing.sh
```

**Option B: Manual Build**

```bash
cd frontend

# Copy testing environment
cp .env.testing .env

# Build
npm run build
```

#### Step 2: Verify the Build

```bash
# Check if built files contain testing server IP
cd dist/assets
grep -r "192.168.2.32" *.js

# Should show: http://192.168.2.32:5000
```

#### Step 3: Deploy to Testing Server

```bash
# Copy the entire dist/ folder to your testing server
# Example:
scp -r dist/* user@192.168.2.32:/var/www/html/
```

---

## Ì¥ç Why This Happens

### Vite Environment Variables

Vite replaces `import.meta.env.VITE_API_BASE_URL` with the actual value at **build time**, not runtime:

```javascript
// In your code:
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// After build (if .env has localhost):
const API_BASE_URL = "http://localhost:5000/api"; // ‚ùå Hardcoded!

// After build (if .env.testing has testing IP):
const API_BASE_URL = "http://192.168.2.32:5000/api"; // ‚úÖ Correct!
```

### The Fix

1. ‚úÖ Created `.env.testing` with testing server IP
2. ‚úÖ Created build scripts to automate the process
3. ‚úÖ Copy `.env.testing` ‚Üí `.env` before building
4. ‚úÖ Build creates dist/ with correct URLs
5. ‚úÖ Deploy dist/ to testing server

---

## Ì≥Å Files Created

### 1. `frontend/.env.testing`
```properties
VITE_API_BASE_URL=http://192.168.2.32:5000/api
VITE_API_URL=http://192.168.2.32:5000
NODE_ENV=production
```

### 2. `frontend/build-testing.bat` (Windows)
Automated build script for Windows

### 3. `frontend/build-testing.sh` (Linux/Mac)
Automated build script for Linux/Mac

---

## ‚úÖ Testing Checklist

After deploying the new build:

1. **Clear Browser Cache**
   - Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Or use Incognito/Private mode

2. **Open Browser DevTools**
   - Press `F12`
   - Go to Network tab

3. **Test Document Preview**
   - Navigate to consignor details
   - Click "Edit Draft" button
   - Go to Documents tab
   - Click preview on a document
   - **Expected**: URL should be `http://192.168.2.32:5000/api/consignors/.../download`
   - **Expected**: Status should be `200 OK`

4. **Test Contact Photo Preview**
   - Stay in edit mode
   - Go to Contact tab
   - Click preview on a contact with photo
   - **Expected**: URL should be `http://192.168.2.32:5000/api/consignors/.../photo`
   - **Expected**: Status should be `200 OK` (NOT 401!)

5. **Verify Console**
   - Check browser console for any errors
   - Should see: `Ì¥ß API Configuration: { VITE_API_BASE_URL: "http://192.168.2.32:5000/api" }`

---

## Ì∞õ Troubleshooting

### Still Seeing localhost:5000 in Network Tab

**Cause**: Browser cached old JavaScript files

**Solution**:
```bash
1. Hard refresh: Ctrl+Shift+R
2. Clear browser cache completely
3. Use Incognito/Private mode
4. Check if you deployed the NEW dist/ folder
```

### Still Getting 401 Errors

**Possible Causes**:

1. **Wrong Build Deployed**
   ```bash
   # Verify the deployed files contain testing IP
   grep -r "192.168.2.32" dist/assets/*.js
   ```

2. **Backend Not Running on Testing Server**
   ```bash
   # Test backend directly
   curl http://192.168.2.32:5000/api/consignors/master-data
   ```

3. **CORS Not Configured**
   ```javascript
   // backend/server.js should allow testing server origin
   app.use(cors({
     origin: ['http://192.168.2.32:3000', 'http://192.168.2.32'],
     credentials: true
   }));
   ```

4. **Not Logged In**
   ```bash
   # Clear cookies and re-login
   # JWT token might be for localhost, not testing server
   ```

### Build Script Not Working

**Windows**:
```bash
cd frontend
copy .env.testing .env
npm run build
```

**Linux/Mac**:
```bash
cd frontend
cp .env.testing .env
npm run build
```

---

## Ì≥ã Build Commands Summary

| Command | Purpose | Environment |
|---------|---------|-------------|
| `npm run dev` | Local development | Uses `.env` (localhost) |
| `npm run build` | Build with current .env | Uses `.env` |
| `build-testing.bat` | Build for testing server | Uses `.env.testing` (192.168.2.32) |
| `build-testing.sh` | Build for testing server (Unix) | Uses `.env.testing` (192.168.2.32) |

---

## ÌæØ Quick Commands

**Build for Testing Server (Windows)**:
```bash
cd "d:\tms developement 11 nov\Maventic.TMS\frontend"
build-testing.bat
```

**Build for Testing Server (Linux/Mac)**:
```bash
cd "d:/tms developement 11 nov/Maventic.TMS/frontend"
./build-testing.sh
```

**Verify Build**:
```bash
cd dist/assets
grep -n "192.168.2.32" *.js | head -5
```

---

## Ì¥Ñ Workflow

### Development (localhost)
```bash
# Use default .env with localhost
npm run dev
```

### Testing Server (192.168.2.32)
```bash
# Use .env.testing with testing IP
build-testing.bat  # or build-testing.sh
# Deploy dist/ folder
```

### Production
```bash
# Create .env.production with production domain
cp .env.testing .env.production
# Edit .env.production with production URLs
npm run build
```

---

## ‚úÖ Success Indicators

After deploying the correct build:

‚úÖ Network tab shows: `http://192.168.2.32:5000/api/...` (NOT localhost)
‚úÖ Contact photo preview: Status 200 OK (NOT 401)
‚úÖ Document preview: Status 200 OK
‚úÖ Console shows: `VITE_API_BASE_URL: "http://192.168.2.32:5000/api"`
‚úÖ All preview modals work correctly
‚úÖ No authentication errors

---

## Ì≥û Next Steps

1. Run `build-testing.bat` (or `.sh`)
2. Deploy `dist/` folder to testing server
3. Clear browser cache
4. Test contact photo preview
5. Test document preview
6. Verify no 401 errors

**Status**: Ready to build and deploy! Ì∫Ä
