exports.seed = async function(knex) {
  // Clean up existing data
  await knex('fuel_type_master').del();
  await knex('engine_type_master').del();
  await knex('usage_type_master').del();

  // Insert fuel type master data
  await knex('fuel_type_master').insert([
    {
      fuel_type_id: 'FT001',
      fuel_type: 'Diesel',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      fuel_type_id: 'FT002',
      fuel_type: 'Petrol/Gasoline',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      fuel_type_id: 'FT003',
      fuel_type: 'CNG (Compressed Natural Gas)',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      fuel_type_id: 'FT004',
      fuel_type: 'LPG (Liquefied Petroleum Gas)',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      fuel_type_id: 'FT005',
      fuel_type: 'Electric',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      fuel_type_id: 'FT006',
      fuel_type: 'Hybrid (Petrol-Electric)',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      fuel_type_id: 'FT007',
      fuel_type: 'Hybrid (Diesel-Electric)',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      fuel_type_id: 'FT008',
      fuel_type: 'Hydrogen',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    }
  ]);

  // Insert engine type master data
  await knex('engine_type_master').insert([
    {
      engine_type_id: 'ET001',
      engine_type: 'BS6 Diesel',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      engine_type_id: 'ET002',
      engine_type: 'BS6 Petrol',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      engine_type_id: 'ET003',
      engine_type: 'BS4 Diesel',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      engine_type_id: 'ET004',
      engine_type: 'BS4 Petrol',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      engine_type_id: 'ET005',
      engine_type: 'Euro 6 Diesel',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      engine_type_id: 'ET006',
      engine_type: 'Euro 6 Petrol',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      engine_type_id: 'ET007',
      engine_type: 'Electric Motor',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      engine_type_id: 'ET008',
      engine_type: 'CNG Engine',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    }
  ]);

  // Insert usage type master data
  await knex('usage_type_master').insert([
    {
      usage_type_id: 'UT001',
      usage_type: 'Commercial Transport',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      usage_type_id: 'UT002',
      usage_type: 'Personal Use',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      usage_type_id: 'UT003',
      usage_type: 'Rental/Lease',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      usage_type_id: 'UT004',
      usage_type: 'Fleet Operation',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      usage_type_id: 'UT005',
      usage_type: 'Construction/Mining',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      usage_type_id: 'UT006',
      usage_type: 'Emergency Services',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      usage_type_id: 'UT007',
      usage_type: 'Government/Official',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      usage_type_id: 'UT008',
      usage_type: 'Agricultural Use',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    }
  ]);

  console.log('✅ Vehicle Master Types (Fuel, Engine, Usage) sample data seeded successfully!');
};