const db = require('./config/database');

async function findTablesWithoutAuditFields() {
  try {
    console.log('\n🔍 FINDING TABLES WITHOUT AUDIT FIELDS\n');
    console.log('=' .repeat(70));

    // Get all tables except system tables
    const tables = await db.raw("SHOW TABLES");
    const tableNames = tables[0]
      .map(row => Object.values(row)[0])
      .filter(name => !name.startsWith('knex_'));

    const auditFields = ['created_at', 'created_by', 'updated_at', 'updated_by', 'status'];
    const missingAuditTables = [];

    console.log(`📊 Checking ${tableNames.length} tables for audit fields...\n`);

    for (const tableName of tableNames) {
      try {
        const columns = await db(tableName).columnInfo();
        const columnNames = Object.keys(columns);
        
        const missingFields = auditFields.filter(field => 
          !columnNames.includes(field) && 
          !columnNames.includes(field.replace('status', 'status_audit'))
        );

        if (missingFields.length > 0) {
          missingAuditTables.push({
            table: tableName,
            missingFields: missingFields,
            hasPartialAudit: missingFields.length < auditFields.length
          });
        }

        const status = missingFields.length === 0 ? '✅' : 
                      missingFields.length < auditFields.length ? '⚠️' : '❌';
        
        console.log(`${status} ${tableName}: ${5 - missingFields.length}/5 audit fields present`);
        
        if (missingFields.length > 0) {
          console.log(`    Missing: ${missingFields.join(', ')}`);
        }

      } catch (error) {
        console.log(`❌ ${tableName}: Error checking columns - ${error.message}`);
      }
    }

    console.log('\n📋 SUMMARY OF TABLES NEEDING AUDIT FIELDS');
    console.log('-'.repeat(50));
    
    if (missingAuditTables.length === 0) {
      console.log('✅ All tables have complete audit fields!');
    } else {
      console.log(`❌ ${missingAuditTables.length} tables need audit field updates:\n`);
      
      missingAuditTables.forEach(({table, missingFields, hasPartialAudit}) => {
        const status = hasPartialAudit ? '⚠️ PARTIAL' : '❌ NONE';
        console.log(`${status} ${table}`);
        console.log(`    Missing: ${missingFields.join(', ')}\n`);
      });
    }

    return missingAuditTables;

  } catch (error) {
    console.error('❌ Error during audit field check:', error.message);
  } finally {
    await db.destroy();
  }
}

// Run the check
findTablesWithoutAuditFields();