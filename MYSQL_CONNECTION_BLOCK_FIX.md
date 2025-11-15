# MySQL Connection Block Error - Resolution Guide

##  Error Details

**Error Message**: `Host ''190.1.3.117'' is blocked because of many connection errors; unblock with ''mysqladmin flush-hosts''`

**Impact**: 
- Consignor list page returns 500 Internal Server Error
- All database queries failing
- Application cannot connect to MySQL database

##  Root Cause

MySQL has a built-in security mechanism that blocks hosts after detecting too many connection errors. This typically happens due to:

1. **Repeated Connection Failures**: Application retrying failed connections
2. **Network Instability**: Intermittent network issues causing partial connections
3. **Improper Connection Cleanup**: Application not closing connections properly
4. **Configuration Mismatch**: Wrong credentials being used repeatedly

##  Immediate Solutions (In Priority Order)

### Solution 1: Flush MySQL Hosts (RECOMMENDED - Fastest)

**If you have MySQL admin access:**

```bash
# From command line
mysqladmin -h 192.168.2.27 -u root -p flush-hosts

# Or connect to MySQL and run:
mysql -h 192.168.2.27 -u root -p
mysql> FLUSH HOSTS;
```

**What this does**: Clears the host cache and immediately unblocks your IP address.

---

### Solution 2: Restart MySQL Server

**If you have server access:**

```bash
# Windows
net stop MySQL80
net start MySQL80

# Linux
sudo systemctl restart mysql
# or
sudo service mysql restart
```

**What this does**: Resets all connections and clears the block list.

---

### Solution 3: Increase max_connect_errors (PERMANENT FIX)

**Edit MySQL configuration file** (`my.cnf` or `my.ini`):

```ini
[mysqld]
max_connect_errors = 1000000
```

**Default value**: 100 (too low for development)
**Recommended value**: 1000000

After editing, restart MySQL server.

**What this does**: Prevents future blocks by increasing the error threshold.

---

### Solution 4: Add Connection Pool Configuration

**Update `knexfile.js`** to properly manage connections:

```javascript
development: {
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "tms_dev",
  },
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 100,
  },
  migrations: {
    directory: "./migrations",
  },
  seeds: {
    directory: "./seeds",
  },
},
```

**What this does**: Properly manages database connections to prevent errors.

---

##  Diagnosis Commands

### Check Current Connection Status

```bash
# Connect to MySQL
mysql -h 192.168.2.27 -u root -p

# Check host cache
mysql> SELECT * FROM performance_schema.host_cache WHERE HOST = ''190.1.3.117'';

# Check max_connect_errors setting
mysql> SHOW VARIABLES LIKE ''max_connect_errors'';

# Check current connections
mysql> SHOW PROCESSLIST;

# Check connection errors
mysql> SHOW STATUS LIKE ''Aborted_connects'';
```

---

##  Application-Level Fixes

### 1. Add Connection Retry Logic

**Create `tms-backend/utils/databaseHealthCheck.js`:**

```javascript
const knex = require(''../config/database'');

const checkDatabaseConnection = async () => {
  try {
    await knex.raw(''SELECT 1'');
    console.log('' Database connection successful'');
    return true;
  } catch (error) {
    console.error('' Database connection failed:'', error.message);
    return false;
  }
};

module.exports = { checkDatabaseConnection };
```

### 2. Add Startup Health Check

**Update `server.js`:**

```javascript
const { checkDatabaseConnection } = require(''./utils/databaseHealthCheck'');

// ... other imports ...

const startServer = async () => {
  try {
    // Check database connection before starting
    const dbConnected = await checkDatabaseConnection();
    if (!dbConnected) {
      console.error(''Failed to connect to database. Exiting...'');
      process.exit(1);
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(''Server startup error:'', error);
    process.exit(1);
  }
};

startServer();
```

### 3. Graceful Shutdown

**Add to `server.js`:**

```javascript
// Graceful shutdown
process.on(''SIGINT'', async () => {
  console.log(''\\n Shutting down gracefully...'');
  await knex.destroy();
  process.exit(0);
});

process.on(''SIGTERM'', async () => {
  console.log(''\\n Shutting down gracefully...'');
  await knex.destroy();
  process.exit(0);
});
```

---

##  Quick Fix Steps (For Immediate Resolution)

1. **Stop your backend server** (Ctrl+C)

2. **Run MySQL flush command:**
   ```bash
   mysqladmin -h 192.168.2.27 -u root -p flush-hosts
   ```
   Password: `Ventic*2025#`

3. **Restart your backend server:**
   ```bash
   cd tms-backend
   npm run dev
   ```

4. **Reload the consignor maintenance page**

---

##  Security Considerations

### Why This Error Happens in Development

- **Hot Reload**: Vite/Nodemon restarts cause connection churning
- **Multiple Terminals**: Running multiple dev servers simultaneously
- **Debugging**: Stopping/starting server frequently
- **Connection Leaks**: Not properly closing database connections

### Production Best Practices

1. Use connection pooling (already configured in production mode)
2. Set appropriate `max_connect_errors` (1000000+)
3. Implement proper error handling
4. Use health checks and monitoring
5. Configure proper timeouts
6. Implement circuit breaker patterns

---

##  Monitoring

### Add Connection Monitoring

```javascript
// In server.js or a middleware
app.use((req, res, next) => {
  const pool = knex.client.pool;
  console.log('' DB Pool Status:'', {
    used: pool.numUsed(),
    free: pool.numFree(),
    pending: pool.numPendingAcquires(),
    total: pool.numUsed() + pool.numFree()
  });
  next();
});
```

---

##  Next Steps After Fixing

1.  Flush MySQL hosts to unblock IP
2.  Add connection pool configuration
3.  Implement health checks
4.  Add graceful shutdown
5.  Configure MySQL `max_connect_errors`
6.  Test consignor list page
7.  Monitor connection pool usage

---

##  Verification

After applying fixes, verify with:

```bash
# Backend terminal should show:
 Database connection successful
Server running on port 5000

# Test endpoint:
curl http://localhost:5000/api/consignors?page=1&limit=25

# Should return 200 OK with data
```

---

**Status**: Ready to implement
**Priority**: HIGH - Blocking all database operations
**Estimated Fix Time**: 5 minutes (if you have MySQL admin access)
