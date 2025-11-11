# Memurai Setup Guide for TMS Bulk Upload

**Purpose**: Install and configure Redis-compatible server for Windows development  
**Required For**: Vehicle bulk upload feature (Phase 5 testing)  
**Installation Time**: 5-10 minutes

---

## 📋 Why Memurai?

**Memurai** is a Redis-compatible server optimized for Windows. The TMS vehicle bulk upload feature uses **Bull Queue**, which requires Redis to manage background job processing.

### Benefits

- ✅ **Native Windows Support** - Runs as Windows service
- ✅ **Redis Compatible** - Works with all Redis clients
- ✅ **Free for Development** - No cost for single-node deployment
- ✅ **Auto-start** - Starts automatically with Windows
- ✅ **Easy Installation** - Simple installer, no configuration needed

---

## 🚀 Installation Steps

### Step 1: Download Memurai

1. Open browser and visit: **https://www.memurai.com/**
2. Click **"Download"** button
3. Select **"Memurai Developer"** (free version)
4. Download the installer (`.msi` file, ~15 MB)

### Step 2: Run Installer

1. **Double-click** the downloaded `.msi` file
2. **User Account Control** will prompt - Click **"Yes"**
3. Follow installation wizard:
   - Click **"Next"**
   - Accept license agreement
   - Choose installation path (default: `C:\Program Files\Memurai`)
   - Click **"Install"**
4. Wait for installation to complete (~30 seconds)
5. Click **"Finish"**

### Step 3: Verify Installation

Memurai installs as a Windows service and starts automatically.

#### Check Service Status:

```powershell
# Open PowerShell and run:
Get-Service -Name "Memurai"

# Expected output:
# Status   Name       DisplayName
# ------   ----       -----------
# Running  Memurai    Memurai
```

#### Test Connection:

```powershell
# Test Redis connection with ping command
& "C:\Program Files\Memurai\redis-cli.exe" ping

# Expected output:
PONG
```

### Step 4: Verify with TMS Setup Script

```powershell
# Navigate to TMS project root
cd "d:\tms dev 12 oct"

# Run setup verification script
.\setup-redis-windows.ps1
```

#### Expected Output:

```
=========================================
TMS Bulk Upload - Redis Setup Helper
=========================================

✅ Memurai found at: C:\Program Files\Memurai\redis-cli.exe
✅ Memurai service is RUNNING
Testing connection...
✅ Redis is working! Connection successful!

You're ready to test the bulk upload functionality!
Next step: Start the backend server and upload test files
```

---

## 🔧 Configuration

### Default Configuration

Memurai uses these default settings (perfect for TMS development):

```properties
Host: localhost
Port: 6379
Password: (none)
Max Memory: 256 MB
Persistence: Disabled (for dev)
```

These match the TMS backend `.env` configuration:

```properties
REDIS_HOST=localhost
REDIS_PORT=6379
# REDIS_PASSWORD=  # Not needed for local dev
```

**No additional configuration required!** ✅

### Custom Configuration (Optional)

If you need to customize Memurai settings:

1. Open configuration file:
   ```
   C:\Program Files\Memurai\memurai.conf
   ```

2. Edit settings (restart service after changes):
   ```properties
   # Change port (if 6379 is in use)
   port 6380
   
   # Set password for security
   requirepass your_secure_password
   
   # Increase max memory
   maxmemory 512mb
   ```

3. Update TMS backend `.env`:
   ```properties
   REDIS_PORT=6380
   REDIS_PASSWORD=your_secure_password
   ```

4. Restart Memurai service:
   ```powershell
   Restart-Service Memurai
   ```

---

## 🛠️ Common Operations

### Start Memurai Service

```powershell
Start-Service Memurai
```

### Stop Memurai Service

```powershell
Stop-Service Memurai
```

### Restart Memurai Service

```powershell
Restart-Service Memurai
```

### Check Memurai Status

```powershell
Get-Service -Name "Memurai" | Select-Object Name, Status, StartType
```

### Enable Auto-start on Boot

```powershell
# Run as Administrator
Set-Service -Name "Memurai" -StartupType Automatic
```

### Disable Auto-start

```powershell
# Run as Administrator
Set-Service -Name "Memurai" -StartupType Manual
```

---

## 🧪 Testing Redis Connection

### Using redis-cli (Command Line)

```powershell
# Navigate to Memurai folder
cd "C:\Program Files\Memurai"

# Open Redis CLI
.\redis-cli.exe

# Test commands:
127.0.0.1:6379> PING
PONG

127.0.0.1:6379> SET test_key "Hello TMS"
OK

127.0.0.1:6379> GET test_key
"Hello TMS"

127.0.0.1:6379> DEL test_key
(integer) 1

127.0.0.1:6379> EXIT
```

### Using Node.js (Test Script)

Create `test-redis.js` in project root:

```javascript
const Redis = require('ioredis');

const redis = new Redis({
  host: 'localhost',
  port: 6379,
});

redis.on('connect', () => {
  console.log('✅ Connected to Redis');
});

redis.on('error', (error) => {
  console.error('❌ Redis connection error:', error);
});

// Test operations
async function testRedis() {
  try {
    // PING
    const pong = await redis.ping();
    console.log('PING:', pong);
    
    // SET
    await redis.set('test_key', 'Hello from TMS');
    console.log('✓ SET test_key');
    
    // GET
    const value = await redis.get('test_key');
    console.log('✓ GET test_key:', value);
    
    // DELETE
    await redis.del('test_key');
    console.log('✓ DEL test_key');
    
    console.log('\n✅ All Redis operations successful!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Redis test failed:', error);
    process.exit(1);
  }
}

testRedis();
```

Run test:
```powershell
node test-redis.js
```

---

## 🐛 Troubleshooting

### Problem: Service Not Starting

**Error**: Memurai service won't start

**Solutions**:

1. **Check if port 6379 is already in use**:
   ```powershell
   Get-NetTCPConnection -LocalPort 6379
   ```
   
   If in use, either:
   - Stop the conflicting process
   - Change Memurai port in `memurai.conf`

2. **Check Windows Event Viewer**:
   - Open Event Viewer
   - Navigate to: Windows Logs → Application
   - Look for Memurai errors

3. **Reinstall Memurai**:
   ```powershell
   # Uninstall via Windows Settings
   # Then reinstall from fresh download
   ```

### Problem: "PONG" Not Received

**Error**: `redis-cli ping` returns error or timeout

**Solutions**:

1. **Verify service is running**:
   ```powershell
   Get-Service -Name "Memurai"
   # Should show Status: Running
   ```

2. **Check firewall**:
   ```powershell
   # Allow Memurai through Windows Firewall
   New-NetFirewallRule -DisplayName "Memurai Redis" -Direction Inbound -LocalPort 6379 -Protocol TCP -Action Allow
   ```

3. **Test with localhost**:
   ```powershell
   & "C:\Program Files\Memurai\redis-cli.exe" -h 127.0.0.1 -p 6379 ping
   ```

### Problem: TMS Backend Still Shows Redis Error

**Error**: Backend logs show Redis connection error after Memurai installation

**Solutions**:

1. **Restart TMS backend server**:
   ```powershell
   # Stop server (Ctrl+C in terminal)
   # Start again:
   cd "d:\tms dev 12 oct\tms-backend"
   npm start
   ```

2. **Check backend logs for**:
   ```
   ✅ Vehicle bulk upload queue connected to Redis successfully
   ```

3. **Verify .env configuration**:
   ```properties
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

4. **Clear Node.js cache**:
   ```powershell
   cd "d:\tms dev 12 oct\tms-backend"
   rm -r node_modules/.cache
   npm start
   ```

---

## 📊 Monitoring Memurai

### View Current Connections

```powershell
& "C:\Program Files\Memurai\redis-cli.exe" CLIENT LIST
```

### View Memory Usage

```powershell
& "C:\Program Files\Memurai\redis-cli.exe" INFO memory
```

### View All Keys (Development Only)

```powershell
& "C:\Program Files\Memurai\redis-cli.exe" KEYS *
```

### Monitor Real-time Commands

```powershell
& "C:\Program Files\Memurai\redis-cli.exe" MONITOR
# Press Ctrl+C to stop
```

---

## 🔄 After Installation

Once Memurai is running, follow these steps to resume Phase 5 testing:

### 1. Restart TMS Backend

```powershell
cd "d:\tms dev 12 oct\tms-backend"

# Stop current server (Ctrl+C)

# Start fresh
npm start
```

**Look for this in logs**:
```
✅ Vehicle bulk upload queue connected to Redis successfully
```

### 2. Test Upload Again

1. Open browser: `http://localhost:5173`
2. Navigate to **Vehicle Maintenance**
3. Click **"Bulk Upload"** button
4. Upload `test-vehicle-all-valid-10.xlsx`
5. Watch for:
   - ✅ No 500 error
   - ✅ Progress bar appears
   - ✅ Real-time logs updating
   - ✅ Success message displays

### 3. Proceed with Phase 5 Testing

Now you can test all 7 test files:

```
✅ test-vehicle-all-valid-10.xlsx (10 vehicles)
✅ test-vehicle-all-invalid-10.xlsx (validation testing)
✅ test-vehicle-mixed-5valid-5invalid.xlsx (mixed scenario)
✅ test-vehicle-mixed-15valid-5invalid.xlsx (majority valid)
✅ test-vehicle-mixed-8valid-2invalid.xlsx (high success rate)
✅ test-vehicle-all-valid-50.xlsx (medium batch)
✅ test-vehicle-all-valid-100.xlsx (large batch)
```

---

## 📚 Additional Resources

- **Memurai Documentation**: https://docs.memurai.com/
- **Redis Commands Reference**: https://redis.io/commands
- **Bull Queue Documentation**: https://github.com/OptimalBits/bull
- **TMS Phase 5 Testing Guide**: `docs/VEHICLE_BULK_UPLOAD_PHASE_5_TESTING.md`
- **Error Fix Documentation**: `docs/VEHICLE_BULK_UPLOAD_500_ERROR_FIX.md`

---

## ✅ Installation Checklist

Before proceeding with bulk upload testing:

- [ ] Downloaded Memurai installer from memurai.com
- [ ] Ran installer and completed installation
- [ ] Service shows "Running" status
- [ ] `redis-cli ping` returns "PONG"
- [ ] `setup-redis-windows.ps1` shows ✅ connection successful
- [ ] TMS backend restarted
- [ ] Backend logs show ✅ queue connected to Redis
- [ ] Test upload successful (no 500 error)

**All checked? You're ready for Phase 5 testing!** 🚀

---

## 💡 Pro Tips

1. **Always keep Memurai running** during development (set to auto-start)
2. **Monitor memory usage** - Memurai defaults to 256MB (enough for testing)
3. **Use redis-cli** for debugging Bull Queue jobs
4. **Check `bull:` keys** to see queued jobs: `KEYS bull:*`
5. **Clear old jobs** periodically: `FLUSHDB` (development only!)

---

**Installation Complete!** Memurai is now running and ready for TMS bulk upload testing. 🎉
