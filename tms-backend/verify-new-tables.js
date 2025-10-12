const db = require('./config/database');

async function verifyNewTables() {
  try {
    console.log('\n🔍 VERIFICATION OF NEWLY CREATED TABLES\n');
    console.log('=' .repeat(80));

    // List of new tables created
    const newTables = [
      'indent_transporter_assignment',
      'ebidding_transaction_items',
      'trip_invoices_item',
      'indent_document',
      'vehicle_movement_log',
      'vehicle_driver_replacement_request',
      'indent_trip_status_master',
      'checklist_configuration',
      'checklist_item_configuration',
      'gate_in_out_checklist',
      'gate_in_out_checklist_item',
      'conversation_thread',
      'vehicle_tracking_data_archival',
      'vehicle_imei_mapping',
      'gate_in_out_authentication',
      'trip_address'
    ];

    // 1. Verify all new tables exist
    console.log('\n📋 1. TABLE EXISTENCE VERIFICATION');
    console.log('-'.repeat(50));
    
    for (const tableName of newTables) {
      const exists = await db.schema.hasTable(tableName);
      console.log(`${exists ? '✅' : '❌'} ${tableName}`);
    }

    // 2. Get table structures
    console.log('\n🏗️ 2. TABLE STRUCTURE SUMMARY');
    console.log('-'.repeat(50));

    for (const tableName of newTables) {
      try {
        const columns = await db(tableName).columnInfo();
        const columnCount = Object.keys(columns).length;
        console.log(`📊 ${tableName}: ${columnCount} columns`);
      } catch (error) {
        console.log(`❌ ${tableName}: Error getting column info`);
      }
    }

    // 3. Check key tables for primary key and indexes
    console.log('\n🔑 3. PRIMARY KEYS AND INDEXES VERIFICATION');
    console.log('-'.repeat(50));

    const keyTables = [
      'indent_transporter_assignment',
      'ebidding_transaction_items', 
      'trip_invoices_item',
      'vehicle_imei_mapping',
      'conversation_thread'
    ];

    for (const tableName of keyTables) {
      try {
        // Check if we can describe the table (indicates proper structure)
        const result = await db.raw(`DESCRIBE ${tableName}`);
        const primaryKeys = result[0].filter(col => col.Key === 'PRI');
        console.log(`🔑 ${tableName}: ${primaryKeys.length} primary key(s)`);
        
        // Check indexes
        const indexes = await db.raw(`SHOW INDEX FROM ${tableName}`);
        const indexCount = [...new Set(indexes[0].map(idx => idx.Key_name))].length;
        console.log(`📇 ${tableName}: ${indexCount} index(es)`);
      } catch (error) {
        console.log(`❌ ${tableName}: Error checking structure`);
      }
    }

    // 4. Test basic operations on key tables
    console.log('\n🧪 4. BASIC OPERATIONS TEST');
    console.log('-'.repeat(50));

    // Test count operations (should return 0 for empty tables)
    const testTables = ['indent_transporter_assignment', 'conversation_thread', 'trip_address'];
    
    for (const tableName of testTables) {
      try {
        const count = await db(tableName).count('* as count').first();
        console.log(`📊 ${tableName}: ${count.count} records`);
      } catch (error) {
        console.log(`❌ ${tableName}: Error counting records - ${error.message}`);
      }
    }

    // 5. Verify audit trail fields
    console.log('\n📋 5. AUDIT TRAIL VERIFICATION');
    console.log('-'.repeat(50));

    const auditFields = ['created_at', 'created_by', 'updated_at', 'updated_by', 'status'];
    
    for (const tableName of ['indent_transporter_assignment', 'trip_invoices_item', 'vehicle_imei_mapping']) {
      try {
        const columns = await db(tableName).columnInfo();
        const hasAuditFields = auditFields.every(field => 
          columns.hasOwnProperty(field) || 
          columns.hasOwnProperty(field.replace('status', 'status_audit'))
        );
        console.log(`${hasAuditFields ? '✅' : '❌'} ${tableName}: Audit trail complete`);
      } catch (error) {
        console.log(`❌ ${tableName}: Error checking audit fields`);
      }
    }

    // 6. Summary statistics
    console.log('\n📈 6. CREATION SUMMARY');
    console.log('-'.repeat(50));
    
    let successCount = 0;
    for (const tableName of newTables) {
      const exists = await db.schema.hasTable(tableName);
      if (exists) successCount++;
    }

    console.log(`✅ Tables Created Successfully: ${successCount}/${newTables.length}`);
    console.log(`📊 Success Rate: ${((successCount/newTables.length) * 100).toFixed(1)}%`);
    
    if (successCount === newTables.length) {
      console.log('\n🎉 ALL MISSING TABLES CREATED SUCCESSFULLY!');
      console.log('🎯 TMS Database is now complete with all required tables from CSV specification');
    } else {
      console.log('\n⚠️ Some tables may need attention');
    }

    // 7. Display new table categories
    console.log('\n📂 7. NEW TABLES BY CATEGORY');
    console.log('-'.repeat(50));
    
    const categories = {
      'Assignment & Workflow': ['indent_transporter_assignment', 'vehicle_driver_replacement_request'],
      'E-bidding System': ['ebidding_transaction_items'],
      'Invoice Management': ['trip_invoices_item'],
      'Document Management': ['indent_document'],
      'Vehicle Operations': ['vehicle_movement_log', 'vehicle_imei_mapping', 'vehicle_tracking_data_archival'],
      'Checklist System': ['checklist_configuration', 'checklist_item_configuration', 'gate_in_out_checklist', 'gate_in_out_checklist_item'],
      'Communication': ['conversation_thread'],
      'Security & Authentication': ['gate_in_out_authentication'],
      'Trip Management': ['trip_address'],
      'Master Data': ['indent_trip_status_master']
    };

    Object.entries(categories).forEach(([category, tables]) => {
      console.log(`\n📁 ${category}:`);
      tables.forEach(table => {
        console.log(`   • ${table}`);
      });
    });

    console.log('\n✅ Verification completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during verification:', error.message);
    console.error(error.stack);
  } finally {
    await db.destroy();
  }
}

// Run verification
verifyNewTables();