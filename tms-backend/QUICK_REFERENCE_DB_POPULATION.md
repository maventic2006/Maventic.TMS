# Quick Reference: Database Population

## 🚀 Quick Commands

### Seed Database
```bash
# Option 1: Use seed files directly
cd tms-backend
npx knex seed:run --specific=999_transporter_complete_sample_data.js

# Option 2: Use helper script (recommended)
node populate-data.js seed-transporter
```

### Check Data
```bash
# View transporter data in terminal
node populate-data.js check-transporter

# View all table statistics
node populate-data.js check-all
```

### Clear Data
```bash
# Clear transporter data
node populate-data.js clear-transporter
```

### See All Options
```bash
node populate-data.js help
```

---

## 📊 What Gets Populated

### Transporter Module (999_transporter_complete_sample_data.js)

- **8 Transporters**:
  - TRP001: Swift Express Logistics (Active, Rating 4.7)
  - TRP002: Global Freight Solutions (Active, Rating 4.5)
  - TRP003: Metro City Transporters (Pending, Rating 4.2)
  - TRP004: Coastal Cargo Services (Active, Rating 4.8)
  - TRP005: Air Express Couriers (Active, Rating 4.9)
  - TRP006: Northern Rail Logistics (Inactive, Rating 3.8)
  - TRP007: Eastern Express Transport (Pending, Rating 4.4)
  - TRP008: Western Highway Movers (Active, Rating 4.1)

- **5 Contacts** with realistic names, phone numbers, emails

- **16 Service Areas** covering major Indian states:
  - West: Maharashtra, Gujarat, Goa
  - North: Delhi, UP, Haryana, Punjab
  - South: Karnataka, Tamil Nadu, Kerala, AP
  - East: West Bengal, Odisha

---

## 💡 Most Useful Commands

| What You Want | Command |
|---------------|---------|
| Add sample data | `node populate-data.js seed-transporter` |
| Check what's in DB | `node populate-data.js check-transporter` |
| Remove all transporter data | `node populate-data.js clear-transporter` |
| See all options | `node populate-data.js help` |
| Completely reset DB | `node populate-data.js reset-db` ⚠️ |

---

## 🎯 Typical Workflow

1. **First time setup**:
   ```bash
   npx knex migrate:latest
   node populate-data.js seed-transporter
   ```

2. **Check if data is there**:
   ```bash
   node populate-data.js check-transporter
   ```

3. **Test your frontend** with the populated data

4. **Need to start fresh**:
   ```bash
   node populate-data.js clear-transporter
   node populate-data.js seed-transporter
   ```

---

## 📝 Files Created

### 1. Seed File
**Location**: `tms-backend/seeds/999_transporter_complete_sample_data.js`
- Populates transporter data
- Uses upsert to avoid duplicates
- Can be run multiple times safely

### 2. Helper Script
**Location**: `tms-backend/populate-data.js`
- Easy-to-use commands
- Check data without SQL
- Clear specific modules

### 3. Guide Document
**Location**: `tms-backend/DATABASE_POPULATION_GUIDE.md`
- Complete documentation
- Troubleshooting tips
- Best practices

---

## 🔧 Troubleshooting

### "Cannot find module"
```bash
cd tms-backend
npm install
```

### "Table doesn't exist"
```bash
npx knex migrate:latest
```

### "Duplicate entry"
The seed uses upsert - it's safe to run multiple times

### "Foreign key constraint"
Run seeds in order:
1. Master data first
2. Transporter data second
3. Transactional data last

---

## ✅ Verification

After seeding, verify in your frontend:
1. Start backend: `npm run dev` (in tms-backend)
2. Start frontend: `npm run dev` (in frontend)
3. Navigate to Transporter Maintenance page
4. You should see 8 transporters!
5. Test the fuzzy search with "Express" - should find 3 transporters
6. Test filters with Status "Active" - should find 5 transporters

---

**Need help?** Check `DATABASE_POPULATION_GUIDE.md` for detailed documentation!
