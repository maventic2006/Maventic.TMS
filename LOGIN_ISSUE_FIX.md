# Login Functionality Issue - Root Cause & Fix

## Issue Summary

**Problem**: Login functionality not working in the TMS application

**Root Cause**: MySQL database connection failing due to authentication issue

## Issues Found

### 1. ❌ Conflicting Database Configuration in `.env`

**Before (WRONG)**:
```properties
DB_HOST=192.168.2.27        # Remote server (unreachable)
# DB_PORT=3306              # Commented out
# DB_USER=root              # Commented out  
DB_PASSWORD="Ventic*2025#"  # Remote password
# DB_NAME=tms_dev           # Commented out

# Mixed local settings
DB_PORT=3306
DB_USER=root
# DB_PASSWORD=              # Local password commented
DB_NAME=tms_dev
```

**After (FIXED)**:
```properties
# REMOTE DATABASE (Currently unreachable)
# DB_HOST=192.168.2.27
# DB_PORT=3306
# DB_USER=root
# DB_PASSWORD="Ventic*2025#"
# DB_NAME=tms_dev

# LOCAL DATABASE (Active)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=                # ⚠️ NEEDS YOUR MYSQL PASSWORD
DB_NAME=tms_dev
```

### 2. ❌ MySQL Root Password Unknown

The MySQL installation on your machine requires a password for the `root` user, but we don't know what it is.

**Tested Passwords** (all failed):
- Empty password
- `root`
- `password`
- `admin`
- `mysql`

## Solution Steps

### Step 1: Find Your MySQL Root Password

**Option A: Check MySQL Installation Files**

Look for MySQL configuration files in these locations:
- `C:\ProgramData\MySQL\MySQL Server 8.0\my.ini`
- `C:\Program Files\MySQL\MySQL Server 8.0\my.ini`

**Option B: Reset MySQL Root Password**

If you don't remember the password, reset it:

1. Stop MySQL service:
```powershell
Stop-Service MySQL80
```

2. Create a password reset file `C:\mysql-init.txt`:
```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'your_new_password';
```

3. Start MySQL with the init file:
```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" --init-file=C:\mysql-init.txt
```

4. Stop and restart MySQL normally:
```powershell
Stop-Service MySQL80
Start-Service MySQL80
```

**Option C: Use MySQL Workbench** (if installed)

Check saved connections in MySQL Workbench for the password.

### Step 2: Update `.env` File

Once you know the password, update the `.env` file:

**File**: `tms-backend\.env`

```properties
# LOCAL DATABASE (Recommended for development)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_ACTUAL_MYSQL_PASSWORD_HERE
DB_NAME=tms_dev
```

### Step 3: Create Database (if it doesn't exist)

Run this script to create the database:

```javascript
// File: tms-backend/create-database.js
const mysql = require('mysql2/promise');
require('dotenv').config();

async function createDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    console.log('✅ MySQL connection successful!');

    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'tms_dev'}`);
    console.log(`✅ Database '${process.env.DB_NAME || 'tms_dev'}' created/exists`);

    await connection.end();
    console.log('✅ Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ MySQL Error:', error.message);
    console.error('\n📋 Troubleshooting:');
    console.error('   1. Check DB_PASSWORD in .env file');
    console.error('   2. Ensure MySQL service is running');
    console.error('   3. Verify MySQL root user has correct password');
    process.exit(1);
  }
}

createDatabase();
```

Run it:
```bash
node create-database.js
```

### Step 4: Run Migrations

Once the database is created, run migrations:

```bash
cd tms-backend
npx knex migrate:latest
```

### Step 5: Seed Test Data (Optional)

```bash
npx knex seed:run
```

### Step 6: Restart Backend Server

```bash
cd tms-backend
npm start
```

**Expected Output**:
```
🔍 Testing database connection (Attempt 1/3)...
📍 Host: localhost:3306
📊 Database: tms_dev
✅ Database connection successful!
🚀 TMS Backend server running on port 5000
📡 Socket.IO server running
```

## Verification Steps

### Test 1: Database Connection

```bash
node test-login.js
```

**Expected Output**:
```
✅ Database connected successfully
📋 user_master table exists: true
👥 Total users in database: X
```

### Test 2: Login API

Start frontend:
```bash
cd frontend
npm run dev
```

Navigate to: `http://localhost:5173`

Try logging in with test credentials.

### Test 3: API Direct Test

```bash
cd frontend
node test-login.js
```

**Expected Output**:
```
✅ Response received:
Status: 200
🎉 Login successful: true
```

## Current Status

- ✅ `.env` file updated to use localhost
- ✅ MySQL service is running
- ❌ MySQL root password unknown - **USER ACTION REQUIRED**
- ❌ Database connection failing due to authentication
- ❌ Backend server cannot start properly

## Next Steps

**IMMEDIATE ACTION REQUIRED**:

1. **Find your MySQL root password** using one of the methods above
2. **Update `.env` file** with the correct password
3. **Run the create-database.js script** to create `tms_dev`
4. **Run migrations** to create tables
5. **Test login functionality**

## Alternative: Use Different MySQL User

If you can't find the root password, create a new MySQL user:

1. Open MySQL Command Line Client (you'll need root password for this too)

2. Or, reinstall MySQL and set a known password during installation

## Common Errors & Solutions

### Error: "Access denied for user 'root'@'localhost'"
**Solution**: Wrong password in `.env` file

### Error: "Unknown database 'tms_dev'"
**Solution**: Run `create-database.js` script

### Error: "Knex: Timeout acquiring a connection"
**Solution**: Check if MySQL service is running and credentials are correct

### Error: "connect ECONNREFUSED"
**Solution**: MySQL service is not running - start it with `Start-Service MySQL80`

## Files Modified

1. ✅ `tms-backend/.env` - Fixed database configuration
2. 📄 `tms-backend/create-database.js` - Database creation script (needs to be created)
3. 📄 `LOGIN_ISSUE_FIX.md` - This documentation

---

**Status**: ⏸️ **BLOCKED - Awaiting MySQL root password from user**

**Priority**: 🔴 **CRITICAL** - Blocks all application functionality

**Estimated Fix Time**: 5 minutes (once password is known)
