exports.up = function(knex) {
  return knex.schema.createTable('violation_type_master', function(table) {
    table.increments('violation_type_id').primary();
    table.string('violation_code', 50).notNullable().unique();
    table.string('violation_description', 200).notNullable();
    table.string('severity', 20); // MINOR, MAJOR, CRITICAL
    table.integer('penalty_points').defaultTo(0);
    table.string('status', 10).defaultTo('ACTIVE');
    table.datetime('created_at').defaultTo(knex.fn.now());
    table.datetime('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('violation_type_master');
};
