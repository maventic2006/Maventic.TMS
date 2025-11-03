# WSL2 + Redis Installation Guide for TMS Development

> **Complete step-by-step guide to install WSL2 and Redis for the bulk upload functionality**

This guide will help you set up Windows Subsystem for Linux 2 (WSL2) with Redis - a completely FREE solution that works perfectly for both development and production.

---

## 🎯 **Why WSL2 + Redis?**

✅ **Completely FREE** - No licensing costs ever  
✅ **Official Redis** - The real thing, not a Windows port  
✅ **Production-Ready** - Same setup as Linux servers  
✅ **Easy to Manage** - Simple commands to start/stop  
✅ **Best Performance** - Native Linux performance on Windows  

---

## 📋 **Prerequisites**

- Windows 10 version 2004+ or Windows 11
- Administrator access on your computer
- ~5 GB free disk space
- Internet connection

---

## 🚀 **STEP 1: Install WSL2**

### **Method 1: Quick Install (Recommended)**

**1.1 Open PowerShell as Administrator:**
- Press `Win + X`
- Click "Windows PowerShell (Admin)" or "Terminal (Admin)"
- Click "Yes" on UAC prompt

**1.2 Run the installation command:**
```powershell
wsl --install -d Ubuntu
```

**What happens:**
- Downloads and installs WSL2
- Installs Ubuntu Linux distribution
- Sets WSL2 as default version
- Takes 5-10 minutes depending on internet speed

**1.3 Restart your computer** when prompted

**1.4 After restart:**
- Ubuntu will launch automatically
- You'll be asked to create a username and password
- **IMPORTANT**: Remember this password - you'll need it for `sudo` commands

**Example:**
```
Enter new UNIX username: yourname
New password: ********
Retype new password: ********
```

✅ **WSL2 is now installed!**

---

### **Method 2: Manual Install (If Quick Install Fails)**

**2.1 Enable Windows Features:**
1. Press `Win + R`
2. Type `optionalfeatures` and press Enter
3. Check these boxes:
   - ☑ Windows Subsystem for Linux
   - ☑ Virtual Machine Platform
4. Click OK
5. Restart computer

**2.2 Install Ubuntu from Microsoft Store:**
1. Open Microsoft Store
2. Search for "Ubuntu 22.04 LTS"
3. Click "Get" / "Install"
4. Launch Ubuntu from Start Menu
5. Create username and password when prompted

---

## 🐧 **STEP 2: Update Ubuntu**

**2.1 Open Ubuntu terminal:**
- Search "Ubuntu" in Windows Start Menu
- Or type `wsl` in any PowerShell window

**2.2 Update package lists:**
```bash
sudo apt update
```
*Enter your Ubuntu password when prompted*

**2.3 Upgrade packages:**
```bash
sudo apt upgrade -y
```
*This takes 2-3 minutes*

✅ **Ubuntu is now up to date!**

---

## 📦 **STEP 3: Install Redis on Ubuntu**

**3.1 Install Redis:**
```bash
sudo apt install redis-server -y
```
*Takes 1-2 minutes*

**3.2 Configure Redis to start properly:**
```bash
sudo nano /etc/redis/redis.conf
```

**3.3 Find this line (press Ctrl+W to search):**
```
supervised no
```

**3.4 Change it to:**
```
supervised systemd
```

**3.5 Save and exit:**
- Press `Ctrl + X`
- Press `Y` to confirm
- Press `Enter` to save

**3.6 Restart Redis:**
```bash
sudo service redis-server restart
```

✅ **Redis is now installed and configured!**

---

## ✅ **STEP 4: Verify Redis is Working**

**4.1 Check Redis status:**
```bash
sudo service redis-server status
```

**Expected output:**
```
* redis-server is running
```

**4.2 Test Redis connection:**
```bash
redis-cli ping
```

**Expected output:**
```
PONG
```

🎉 **SUCCESS! Redis is working!**

---

## 🔧 **STEP 5: Configure Redis for TMS Backend**

Your TMS backend needs to connect to Redis. WSL2 Redis is accessible from Windows via `localhost:6379`.

**5.1 Verify your backend .env file:**

Your `tms-backend/.env` should already have:
```env
REDIS_HOST=localhost
REDIS_PORT=6379
# REDIS_PASSWORD=  # No password needed for local Redis
```

✅ **Configuration is correct - no changes needed!**

---

## 🎮 **STEP 6: Redis Management Commands**

Learn these essential commands to control Redis:

### **Start Redis:**
```bash
sudo service redis-server start
```

### **Stop Redis:**
```bash
sudo service redis-server stop
```

### **Restart Redis:**
```bash
sudo service redis-server restart
```

### **Check Status:**
```bash
sudo service redis-server status
```

### **Test Connection:**
```bash
redis-cli ping
```

---

## 🚀 **STEP 7: Auto-Start Redis (Optional)**

Make Redis start automatically when you open WSL:

**7.1 Edit your bash profile:**
```bash
nano ~/.bashrc
```

**7.2 Add this line at the end:**
```bash
# Auto-start Redis
if ! pgrep -x redis-server > /dev/null; then
    sudo service redis-server start > /dev/null 2>&1
fi
```

**7.3 Save and exit:**
- Press `Ctrl + X`
- Press `Y`
- Press `Enter`

**7.4 Apply changes:**
```bash
source ~/.bashrc
```

✅ **Redis will now start automatically!**

---

## 🧪 **STEP 8: Test with TMS Backend**

Now let's verify everything works with your TMS application:

**8.1 Start Redis in WSL (if not running):**
```bash
wsl sudo service redis-server start
```

**8.2 Open PowerShell and navigate to backend:**
```powershell
cd "d:\tms dev 12 oct\tms-backend"
```

**8.3 Test Redis connection from Node.js:**
```powershell
node -e "const redis = require('redis'); const client = redis.createClient({socket: {host: 'localhost', port: 6379}}); client.on('error', err => console.error('Redis Error:', err)); client.connect().then(() => { console.log('✅ Redis connected successfully from Node.js!'); client.disconnect(); }).catch(err => console.error('❌ Redis connection failed:', err));"
```

**Expected output:**
```
✅ Redis connected successfully from Node.js!
```

**8.4 Start your backend server:**
```powershell
node server.js
```

**Expected output:**
```
🚀 TMS Backend server running on port 5000
📡 Socket.IO server running
```

✅ **Backend connects to Redis successfully!**

---

## 📊 **STEP 9: Final Verification**

Run the setup verification script:

**From PowerShell:**
```powershell
cd "d:\tms dev 12 oct"
.\setup-redis-windows.ps1
```

**Expected output:**
```
✅ WSL is installed
✅ Redis is running in WSL!
You're ready to test the bulk upload functionality!
```

---

## 🎯 **STEP 10: Test Bulk Upload**

Now you're ready to test the complete bulk upload feature!

### **10.1 Start Backend (if not running):**
```powershell
cd "d:\tms dev 12 oct\tms-backend"
node server.js
```

### **10.2 Start Frontend (new terminal):**
```powershell
cd "d:\tms dev 12 oct\frontend"
npm run dev
```

### **10.3 Test Upload:**
1. Open browser: http://localhost:5174
2. Navigate to Transporter Maintenance
3. Click "Bulk Upload" button
4. Upload: `test-data/test-valid-5-transporters.xlsx`
5. Watch real-time progress!

**Expected result:**
```
✅ 5 Valid Created | 0 Invalid
```

🎉 **BULK UPLOAD IS WORKING!**

---

## 🔍 **Troubleshooting**

### **Issue 1: WSL command not found**

**Solution:**
- WSL not installed correctly
- Run PowerShell as Admin: `wsl --install`
- Restart computer

---

### **Issue 2: Redis connection refused**

**Check if Redis is running:**
```bash
wsl sudo service redis-server status
```

**If not running:**
```bash
wsl sudo service redis-server start
```

---

### **Issue 3: "sudo: service: command not found"**

**Solution - Install systemd:**
```bash
sudo apt install systemd -y
```

**Alternative start command:**
```bash
sudo redis-server --daemonize yes
```

---

### **Issue 4: Node.js can't connect to Redis**

**Verify Redis is listening:**
```bash
wsl ss -tlnp | grep 6379
```

**Should show:**
```
LISTEN 0 511 127.0.0.1:6379 *:*
```

**Check firewall:**
Windows Firewall might block WSL2. Usually not an issue for localhost, but if problems persist:
1. Open Windows Defender Firewall
2. Allow WSL through firewall

---

### **Issue 5: Password required for Redis**

Your local Redis shouldn't need a password. If it does:

**Option A: Remove password requirement:**
```bash
sudo nano /etc/redis/redis.conf
```
Find and comment out: `requirepass yourpassword`
Restart: `sudo service redis-server restart`

**Option B: Add password to backend .env:**
```env
REDIS_PASSWORD=yourpassword
```

---

## 💡 **Useful Tips**

### **Access WSL from Windows Explorer:**
```
\\wsl$\Ubuntu\home\yourname\
```

### **Access Windows files from WSL:**
```bash
cd /mnt/c/Users/YourName/Desktop
```

### **Check WSL disk usage:**
```bash
df -h
```

### **Stop all WSL instances:**
```powershell
wsl --shutdown
```

### **Restart WSL:**
```powershell
wsl --shutdown
wsl
```

### **Update WSL kernel:**
```powershell
wsl --update
```

---

## 📈 **Performance Optimization**

### **Increase WSL2 Memory (Optional)**

Create `.wslconfig` in Windows user folder:
```powershell
notepad $env:USERPROFILE\.wslconfig
```

Add:
```ini
[wsl2]
memory=4GB
processors=2
```

Save and restart WSL:
```powershell
wsl --shutdown
wsl
```

---

## 🎓 **Redis Basics**

### **Useful Redis CLI Commands:**

**Connect to Redis:**
```bash
redis-cli
```

**Inside redis-cli:**
```redis
PING                    # Test connection
INFO                    # Server info
DBSIZE                  # Number of keys
KEYS *                  # List all keys (dev only)
FLUSHALL                # Clear all data (careful!)
MONITOR                 # Watch commands in real-time
EXIT                    # Exit redis-cli
```

---

## 📚 **Additional Resources**

- **WSL Documentation:** https://docs.microsoft.com/en-us/windows/wsl/
- **Redis Documentation:** https://redis.io/docs/
- **TMS Testing Guide:** `PHASE_5_TESTING_GUIDE.md`

---

## ✅ **Quick Reference Card**

### **Daily Commands:**
```bash
# Start Redis
wsl sudo service redis-server start

# Check Redis status
wsl redis-cli ping

# Start backend
cd "d:\tms dev 12 oct\tms-backend" && node server.js

# Start frontend
cd "d:\tms dev 12 oct\frontend" && npm run dev
```

---

## 🎉 **Congratulations!**

You now have:
- ✅ WSL2 installed
- ✅ Ubuntu Linux running on Windows
- ✅ Redis server running
- ✅ TMS backend connected to Redis
- ✅ Complete bulk upload functionality ready to test

**Next steps:**
1. Upload test Excel files
2. Verify bulk upload works
3. Test with larger batches
4. Deploy to production!

---

**🚀 You're all set! Happy coding!**
