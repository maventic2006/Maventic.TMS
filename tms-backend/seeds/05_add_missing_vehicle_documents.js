/**
 * Seed file to add missing vehicle document types
 * 
 * This adds 6 missing vehicle document types identified during verification:
 * 1. AIP (All India Permit)
 * 2. Temp Vehicle Permit
 * 3. Tax Certificate
 * 4. Vehicle Warranty
 * 5. Vehicle Service Bill
 * 6. Leasing Agreement
 * 
 * @param { import('knex').Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Check if documents already exist
  const existingDocs = await knex('document_name_master')
    .whereIn('document_name', [
      'AIP',
      'Temp Vehicle Permit',
      'Tax Certificate',
      'Vehicle Warranty',
      'Vehicle Service Bill',
      'Leasing Agreement'
    ])
    .select('document_name');

  if (existingDocs.length > 0) {
    console.log(' Vehicle documents already exist, skipping insert');
    return;
  }

  // Get the next available doc_name_master_id
  const allDocs = await knex('document_name_master')
    .select('doc_name_master_id');

  // Extract numeric IDs and find max
  const numericIds = allDocs
    .map(doc => {
      const match = doc.doc_name_master_id.match(/\d+/);
      return match ? parseInt(match[0]) : 0;
    })
    .filter(n => !isNaN(n));

  const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 0;
  const startId = maxId + 1;

  // Insert missing vehicle document types
  await knex('document_name_master').insert([
    {
      doc_name_master_id: `DN${String(startId).padStart(3, '0')}`,
      document_name: 'AIP',
      user_type: 'VEHICLE',
      created_at: knex.fn.now(),
      created_on: knex.fn.now(),
      created_by: 'SYSTEM',
      updated_at: knex.fn.now(),
      updated_on: knex.fn.now(),
      updated_by: 'SYSTEM',
      status: 'ACTIVE',
    },
    {
      doc_name_master_id: `DN${String(startId + 1).padStart(3, '0')}`,
      document_name: 'Temp Vehicle Permit',
      user_type: 'VEHICLE',
      created_at: knex.fn.now(),
      created_on: knex.fn.now(),
      created_by: 'SYSTEM',
      updated_at: knex.fn.now(),
      updated_on: knex.fn.now(),
      updated_by: 'SYSTEM',
      status: 'ACTIVE',
    },
    {
      doc_name_master_id: `DN${String(startId + 2).padStart(3, '0')}`,
      document_name: 'Tax Certificate',
      user_type: 'VEHICLE',
      created_at: knex.fn.now(),
      created_on: knex.fn.now(),
      created_by: 'SYSTEM',
      updated_at: knex.fn.now(),
      updated_on: knex.fn.now(),
      updated_by: 'SYSTEM',
      status: 'ACTIVE',
    },
    {
      doc_name_master_id: `DN${String(startId + 3).padStart(3, '0')}`,
      document_name: 'Vehicle Warranty',
      user_type: 'VEHICLE',
      created_at: knex.fn.now(),
      created_on: knex.fn.now(),
      created_by: 'SYSTEM',
      updated_at: knex.fn.now(),
      updated_on: knex.fn.now(),
      updated_by: 'SYSTEM',
      status: 'ACTIVE',
    },
    {
      doc_name_master_id: `DN${String(startId + 4).padStart(3, '0')}`,
      document_name: 'Vehicle Service Bill',
      user_type: 'VEHICLE',
      created_at: knex.fn.now(),
      created_on: knex.fn.now(),
      created_by: 'SYSTEM',
      updated_at: knex.fn.now(),
      updated_on: knex.fn.now(),
      updated_by: 'SYSTEM',
      status: 'ACTIVE',
    },
    {
      doc_name_master_id: `DN${String(startId + 5).padStart(3, '0')}`,
      document_name: 'Leasing Agreement',
      user_type: 'VEHICLE',
      created_at: knex.fn.now(),
      created_on: knex.fn.now(),
      created_by: 'SYSTEM',
      updated_at: knex.fn.now(),
      updated_on: knex.fn.now(),
      updated_by: 'SYSTEM',
      status: 'ACTIVE',
    },
  ]);

  console.log(' Successfully added 6 missing vehicle document types');
};
