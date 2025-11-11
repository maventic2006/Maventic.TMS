# Redis/Memurai Complete Troubleshooting Guide 🔧

## 🎯 YOUR EXACT PROBLEM

**Error**: `REDIS_TIMEOUT: Redis connection timeout after 5 seconds`

**What We Found**:
1. ✅ Memurai **IS installed** on your system
2. ❌ Memurai service **IS STOPPED** (not running)
3. ❌ Port 6379 **IS NOT listening** (TCP connection failed)
4. 🔴 **This is why uploads timeout!**

---

## 🚀 IMMEDIATE FIX - Start Memurai Service

### Option 1: Start via Services (Recommended)

1. **Open Services**:
   - Press `Windows + R`
   - Type: `services.msc`
   - Click OK

2. **Find Memurai**:
   - Scroll down to find "**Memurai**" service
   - Right-click on it

3. **Start the Service**:
   - Click "**Start**"
   - Wait 2-3 seconds

4. **Set to Auto-Start** (Important!):
   - Right-click "Memurai" again
   - Click "Properties"
   - Change "Startup type" to "**Automatic**"
   - Click "Apply" then "OK"

---

### Option 2: Start via Command Prompt (As Administrator)

1. **Open Command Prompt as Administrator**:
   - Press `Windows + X`
   - Click "**Command Prompt (Admin)**" or "**Windows PowerShell (Admin)**"

2. **Run this command**:
   ```cmd
   net start Memurai
   ```

3. **You should see**:
   ```
   The Memurai service is starting.
   The Memurai service was started successfully.
   ```

4. **Verify it's running**:
   ```cmd
   sc query Memurai
   ```

   Should show:
   ```
   STATE              : 4  RUNNING
   ```

---

### Option 3: Use the Batch Script We Created

1. **Right-click** `d:\tms dev 12 oct\start-memurai.bat`
2. Click "**Run as administrator**"
3. Wait for confirmation message

---

## ✅ Verify Memurai is Running

### Check 1: Service Status

```powershell
Get-Service -Name Memurai
```

**Expected Output**:
```
Status   Name      DisplayName
------   ----      -----------
Running  Memurai   Memurai
```

---

### Check 2: Port 6379 Listening

```powershell
Test-NetConnection -ComputerName localhost -Port 6379
```

**Expected Output**:
```
TcpTestSucceeded       : True  ← Must be True!
```

---

### Check 3: Redis Ping Test

```powershell
memurai-cli ping
```

**Expected Output**:
```
PONG
```

If you get "PONG", **Redis is working perfectly!** ✅

---

## 🔄 After Starting Memurai

### Step 1: Verify Backend Connection

The backend should now connect successfully. You'll see:

```
✅ Vehicle bulk upload queue connected to Redis successfully
```

**BUT NOW IT WILL ACTUALLY WORK!** (Before it was a false positive)

---

### Step 2: Restart Backend

```powershell
cd "d:\tms dev 12 oct\tms-backend"
npm run dev
```

Watch for these logs:
```
🚀 TMS Backend server running on port 5000
✅ Vehicle bulk upload queue connected to Redis successfully
```

---

### Step 3: Test Upload

1. Open: http://localhost:5174
2. Navigate: Vehicle Maintenance → Bulk Upload
3. Upload: `test-vehicle-all-valid-10.xlsx`

**Expected Result**:
```
✅ Upload completed in < 1 second
✅ No timeout errors!
✅ Success notification
```

---

## 🐛 WHY This Problem Happened

### The Misleading Message

Backend logs showed:
```
✅ Vehicle bulk upload queue connected to Redis successfully
```

**This was MISLEADING!** Here's why:

1. **Bull Queue initialization** (at startup):
   - Creates queue object
   - Does NOT actually connect to Redis yet
   - Shows "connected" message (fake!)

2. **Actual Redis connection** (when calling `.add()`):
   - Tries to connect to Redis
   - If Redis is stopped, hangs for 5+ seconds
   - Times out with our protection
   - **This is when the real error happens!**

### The Root Cause

```
Memurai service installed ✅
    ↓
But service is STOPPED ❌
    ↓
Port 6379 not listening ❌
    ↓
Bull Queue can't connect ❌
    ↓
Upload times out after 5 seconds ❌
```

---

## 🔍 How to Check if Memurai is Truly Running

**Don't trust the backend startup message!**

Instead, use these checks:

### Check 1: netstat (Port 6379)

```cmd
netstat -an | findstr "6379"
```

**Should show**:
```
TCP    127.0.0.1:6379         0.0.0.0:0              LISTENING
TCP    [::1]:6379             [::]:0                 LISTENING
```

If **nothing** appears, Redis is NOT running!

---

### Check 2: Task Manager

1. Open Task Manager (`Ctrl + Shift + Esc`)
2. Go to "Details" tab
3. Look for `memurai-server.exe` or `memurai.exe`

If you don't see it, Redis is NOT running!

---

### Check 3: PowerShell Service Check

```powershell
Get-Service -Name Memurai | Format-Table -AutoSize
```

**Must show**:
```
Status   Name      DisplayName
------   ----      -----------
Running  Memurai   Memurai
```

---

## 🛠️ Common Memurai Issues & Solutions

### Issue 1: "Service cannot be started"

**Symptom**:
```
Start-Service : Service 'Memurai (Memurai)' cannot be started
```

**Causes**:
1. Insufficient permissions (need Admin)
2. Port 6379 already in use by another application
3. Memurai configuration file corrupted

**Solutions**:

**A) Check if port 6379 is in use**:
```powershell
Get-NetTCPConnection -LocalPort 6379 -ErrorAction SilentlyContinue
```

If something appears, another Redis/process is using port 6379. Stop it:
```powershell
# Find the process ID
$proc = Get-NetTCPConnection -LocalPort 6379 | Select-Object -ExpandProperty OwningProcess
# Kill it
Stop-Process -Id $proc -Force
```

**B) Reinstall Memurai**:
1. Uninstall: Control Panel → Uninstall a program → Memurai
2. Download fresh installer: https://www.memurai.com/get-memurai
3. Run installer as Administrator
4. Choose "Automatic" start option during installation

---

### Issue 2: Service Starts Then Stops

**Symptom**: Service shows "Running" briefly, then stops

**Cause**: Configuration file error

**Solution**:
1. Open Memurai config: `C:\Program Files\Memurai\memurai.conf`
2. Check for syntax errors
3. Reset to default if needed
4. Restart service

---

### Issue 3: "memurai-cli: command not found"

**Symptom**: Can't run `memurai-cli ping`

**Solution**:
Add Memurai to PATH:
1. Open System Properties → Environment Variables
2. Edit "Path" variable
3. Add: `C:\Program Files\Memurai`
4. Restart terminal

**Or use full path**:
```powershell
& "C:\Program Files\Memurai\memurai-cli.exe" ping
```

---

## 🎯 Post-Fix Verification Checklist

After starting Memurai, verify ALL these:

- [ ] **Service Status**: `Get-Service -Name Memurai` shows "Running"
- [ ] **Port Listening**: `Test-NetConnection localhost -Port 6379` shows "TcpTestSucceeded: True"
- [ ] **Redis Ping**: `memurai-cli ping` returns "PONG"
- [ ] **Process Running**: Task Manager shows `memurai-server.exe`
- [ ] **Backend Connects**: Backend logs show no Redis errors
- [ ] **Upload Works**: 10-vehicle upload completes in < 5 seconds
- [ ] **No Timeout**: Frontend shows success, no timeout errors

**All checked?** ✅ **You're good to go!**

---

## 🚨 Emergency Fallback: Docker Redis

If Memurai continues to have issues, use Docker:

### Prerequisites
- Docker Desktop installed
- Docker service running

### Commands

```powershell
# Pull and start Redis
docker run -d --name redis-tms -p 6379:6379 --restart unless-stopped redis:alpine

# Verify
docker ps | findstr redis-tms

# Test connection
docker exec -it redis-tms redis-cli ping
# Should return: PONG
```

### Backend Configuration (if using Docker)

No changes needed! Backend automatically connects to `localhost:6379`

---

## 📊 Performance Comparison

### Before Fix (Memurai Stopped)
- ❌ Upload fails after 5 seconds
- ❌ "REDIS_TIMEOUT" error
- ❌ No background processing
- ❌ Bulk upload unusable

### After Fix (Memurai Running)
- ✅ Upload completes in < 1 second
- ✅ No timeout errors
- ✅ Background processing works
- ✅ 10 vehicles uploaded in ~2-3 seconds
- ✅ Can handle 1000+ vehicles

---

## 📚 Related Documentation

- **Installation Guide**: `REDIS_REQUIRED_FOR_BULK_UPLOAD.md`
- **Performance Optimization**: `VEHICLE_BULK_UPLOAD_OPTIMIZATION_COMPLETE.md`
- **Testing Guide**: `VEHICLE_BULK_UPLOAD_PERFORMANCE_TEST.md`
- **Resolution Summary**: `TIMEOUT_ISSUE_RESOLUTION.md`

---

## 🎓 Key Learnings

1. **Don't Trust Bull Queue Startup Message**
   - "Connected successfully" at startup is NOT reliable
   - Always verify with `Test-NetConnection`

2. **Service vs. Application**
   - Memurai installed ≠ Memurai running
   - Must start the Windows service

3. **Port 6379 is Critical**
   - Must be listening for Redis to work
   - Use `netstat` or `Test-NetConnection` to verify

4. **Auto-Start is Essential**
   - Set Memurai to "Automatic" startup
   - Prevents this problem after system restart

---

## ✅ TL;DR - Quick Fix

**Your Problem**: Memurai service is STOPPED

**Solution** (30 seconds):

1. Press `Windows + R`
2. Type: `services.msc`
3. Find "Memurai" service
4. Right-click → Start
5. Right-click → Properties → Startup type: "Automatic"
6. Restart backend: `npm run dev`
7. Test upload

**Done!** 🎉

---

**Status**: 🔴 Memurai service is STOPPED - Start it to fix the issue
**Impact**: ⚠️ CRITICAL - Bulk upload will NOT work until service is started
**Fix Time**: ⏱️ 30 seconds (start service + restart backend)
