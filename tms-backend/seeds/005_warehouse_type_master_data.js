exports.seed = async function(knex) {
  // Clean up existing data
  await knex('warehouse_type_master').del();

  // Insert warehouse type master data
  await knex('warehouse_type_master').insert([
    {
      warehouse_type_id: 'WT001',
      warehouse_type: 'Cold Storage Warehouse',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      warehouse_type_id: 'WT002',
      warehouse_type: 'Dry Goods Warehouse',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      warehouse_type_id: 'WT003',
      warehouse_type: 'Distribution Center',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      warehouse_type_id: 'WT004',
      warehouse_type: 'Cross-Docking Facility',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      warehouse_type_id: 'WT005',
      warehouse_type: 'Hazardous Materials Storage',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      warehouse_type_id: 'WT006',
      warehouse_type: 'Automated Warehouse',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      warehouse_type_id: 'WT007',
      warehouse_type: 'Bulk Storage Facility',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      warehouse_type_id: 'WT008',
      warehouse_type: 'Transit Warehouse',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    }
  ]);

  console.log('✅ Warehouse Type Master sample data seeded successfully!');
};