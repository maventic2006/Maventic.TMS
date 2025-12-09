exports.seed = async function(knex) {
  // Delete existing entries
  await knex('coverage_type_master').del();

  // Coverage Type Master data - Transportation/Vehicle Insurance focused
  await knex('coverage_type_master').insert([
    {
      coverage_type_id: 'CT001',
      coverage_type: 'Comprehensive Insurance',
      created_at: knex.fn.now(),
      created_on: knex.fn.now(),
      created_by: 'SYSTEM',
      updated_at: knex.fn.now(),
      updated_on: knex.fn.now(),
      updated_by: 'SYSTEM',
      status: 'ACTIVE'
    },
    {
      coverage_type_id: 'CT002',
      coverage_type: 'Third Party Liability',
      created_at: knex.fn.now(),
      created_on: knex.fn.now(),
      created_by: 'SYSTEM',
      updated_at: knex.fn.now(),
      updated_on: knex.fn.now(),
      updated_by: 'SYSTEM',
      status: 'ACTIVE'
    },
    {
      coverage_type_id: 'CT003',
      coverage_type: 'Collision Coverage',
      created_at: knex.fn.now(),
      created_on: knex.fn.now(),
      created_by: 'SYSTEM',
      updated_at: knex.fn.now(),
      updated_on: knex.fn.now(),
      updated_by: 'SYSTEM',
      status: 'ACTIVE'
    },
    {
      coverage_type_id: 'CT004',
      coverage_type: 'Cargo Insurance',
      created_at: knex.fn.now(),
      created_on: knex.fn.now(),
      created_by: 'SYSTEM',
      updated_at: knex.fn.now(),
      updated_on: knex.fn.now(),
      updated_by: 'SYSTEM',
      status: 'ACTIVE'
    },
    {
      coverage_type_id: 'CT005',
      coverage_type: 'Personal Accident',
      created_at: knex.fn.now(),
      created_on: knex.fn.now(),
      created_by: 'SYSTEM',
      updated_at: knex.fn.now(),
      updated_on: knex.fn.now(),
      updated_by: 'SYSTEM',
      status: 'ACTIVE'
    },
    {
      coverage_type_id: 'CT006',
      coverage_type: 'Fire & Theft',
      created_at: knex.fn.now(),
      created_on: knex.fn.now(),
      created_by: 'SYSTEM',
      updated_at: knex.fn.now(),
      updated_on: knex.fn.now(),
      updated_by: 'SYSTEM',
      status: 'ACTIVE'
    },
    {
      coverage_type_id: 'CT007',
      coverage_type: 'Extended Warranty',
      created_at: knex.fn.now(),
      created_on: knex.fn.now(),
      created_by: 'SYSTEM',
      updated_at: knex.fn.now(),
      updated_on: knex.fn.now(),
      updated_by: 'SYSTEM',
      status: 'ACTIVE'
    },
    {
      coverage_type_id: 'CT008',
      coverage_type: 'Roadside Assistance',
      created_at: knex.fn.now(),
      created_on: knex.fn.now(),
      created_by: 'SYSTEM',
      updated_at: knex.fn.now(),
      updated_on: knex.fn.now(),
      updated_by: 'SYSTEM',
      status: 'ACTIVE'
    }
  ]);

  console.log('✅ Coverage Type Master sample data seeded successfully!');
};