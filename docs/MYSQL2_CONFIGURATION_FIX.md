# MySQL2 Configuration Warning Fix

## Issue Summary

**Warning Messages:**
```
Ignoring invalid configuration option passed to Connection: timeout
Ignoring invalid configuration option passed to Connection: acquireTimeout
```

## Root Cause

MySQL2 driver (the underlying connection library) **does not support** `timeout` and `acquireTimeout` as direct connection options. These were being passed to the MySQL2 connection object, which only recognizes specific options.

### Valid vs Invalid Options

#### ❌ Invalid MySQL2 Connection Options
```javascript
connection: {
  timeout: 60000,        // NOT recognized by MySQL2
  acquireTimeout: 60000, // NOT recognized by MySQL2
}
```

#### ✅ Valid MySQL2 Connection Options
```javascript
connection: {
  connectTimeout: 60000, // Time to establish initial TCP connection
  // Other valid options:
  // - host, port, user, password, database
  // - ssl, charset, timezone, dateStrings
  // - supportBigNumbers, bigNumberStrings
}
```

## Solution Implemented

### Updated Configuration Structure

**File: `tms-backend/knexfile.js`**

```javascript
development: {
  client: "mysql2",
  connection: {
    // MySQL2 Connection-Level Options (Driver)
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "tms_dev",
    connectTimeout: 60000, // ✅ Valid - TCP connection timeout
  },
  pool: {
    // Knex.js Pool-Level Options (Connection Pooling)
    min: 2,
    max: 10,
    createTimeoutMillis: 60000,   // Time to create new connection
    acquireTimeoutMillis: 60000,  // Time to acquire from pool
    idleTimeoutMillis: 600000,    // Connection idle timeout
    reapIntervalMillis: 1000,     // Check idle connections interval
    createRetryIntervalMillis: 200, // Retry interval
    propagateCreateError: false,  // Don't crash on error
  },
  acquireConnectionTimeout: 60000, // ✅ Knex-level acquire timeout
}
```

## Configuration Layers Explained

### Layer 1: MySQL2 Connection (Driver Level)
- **Purpose**: Configure how the MySQL2 driver establishes TCP connections
- **Valid Options**: `connectTimeout`, `host`, `port`, `user`, `password`, `database`, `ssl`
- **Scope**: Individual connection creation

### Layer 2: Knex.js Pool (Pooling Level)
- **Purpose**: Configure connection pool behavior
- **Valid Options**: `min`, `max`, `createTimeoutMillis`, `acquireTimeoutMillis`, `idleTimeoutMillis`
- **Scope**: Pool management across multiple connections

### Layer 3: Knex.js Client (Query Level)
- **Purpose**: Configure query execution behavior
- **Valid Options**: `acquireConnectionTimeout`, `debug`
- **Scope**: Query execution and connection acquisition

## Timeout Settings Explained

| Setting | Layer | Purpose | Value |
|---------|-------|---------|-------|
| `connectTimeout` | MySQL2 | TCP connection establishment | 60s |
| `createTimeoutMillis` | Pool | Time to create new connection | 60s |
| `acquireTimeoutMillis` | Pool | Time to get connection from pool | 60s |
| `acquireConnectionTimeout` | Knex | Overall acquire timeout | 60s |
| `idleTimeoutMillis` | Pool | Connection idle before removal | 10min |
| `reapIntervalMillis` | Pool | Idle connection check frequency | 1s |

## Query-Level Timeout

For individual query timeouts, use the `.timeout()` method:

```javascript
// In controllers (e.g., authController.js)
const user = await knex("user_master")
  .where({ user_id })
  .timeout(30000) // 30-second query timeout
  .first();
```

## Why This Matters

1. **Eliminates Warnings**: No more deprecation warnings in console
2. **Future-Proof**: Prevents errors in future MySQL2 versions
3. **Correct Configuration**: Uses proper timeout settings at correct layers
4. **Maintainable**: Clear separation of concerns between driver and pool

## Testing the Fix

After applying this fix, you should see:
- ✅ No MySQL2 configuration warnings
- ✅ Clean server startup logs
- ✅ Proper timeout handling at all layers
- ✅ Successful database connections

## Related Documentation

- **Database Connection Timeout Fix**: `docs/DATABASE_CONNECTION_TIMEOUT_FIX.md`
- **Quick Start Guide**: `DATABASE_FIX_QUICK_START.md`
- **MySQL2 Documentation**: https://github.com/sidorares/node-mysql2
- **Knex.js Pool Configuration**: https://knexjs.org/guide/#pool

---

**Status**: ✅ Fixed permanently
**Date**: November 13, 2025
