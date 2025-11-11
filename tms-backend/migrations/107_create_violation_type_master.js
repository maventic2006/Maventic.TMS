exports.up = function(knex) {
  return knex.schema.createTable('violation_type_master', (table) => {
    table.string('violation_type_id', 10).primary().notNullable();
    table.string('violation_type', 30).notNullable();
    table.date('created_at');
    table.time('created_on');
    table.string('created_by', 10);
    table.date('updated_at');
    table.time('updated_on');
    table.string('updated_by', 10);
    table.string('status', 10).defaultTo('ACTIVE');
  }).then(() => {
    // Insert default records
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];
    
    return knex('violation_type_master').insert([
      {
        violation_type_id: 'VT001',
        violation_type: 'Accident',
        created_at: dateStr,
        created_on: timeStr,
        created_by: 'SYSTEM',
        status: 'ACTIVE'
      },
      {
        violation_type_id: 'VT002',
        violation_type: 'Violation',
        created_at: dateStr,
        created_on: timeStr,
        created_by: 'SYSTEM',
        status: 'ACTIVE'
      }
    ]);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('violation_type_master');
};
