/**
 * Migration: Create master_currency_type table
 * Description: Stores currency type master data for consignor transactions
 */

exports.up = function (knex) {
  return knex.schema.createTable('master_currency_type', function (table) {
    table.increments('currency_type_unique_id').primary();
    table.string('currency_type_id', 30).notNullable().unique();
    table.string('currency_type_name', 100).notNullable();
    table.string('currency_code', 10).notNullable();
    table.string('currency_symbol', 10).nullable();
    table.text('description').nullable();
    table.string('status', 10).notNullable().defaultTo('ACTIVE');
    table.datetime('created_at').defaultTo(knex.fn.now());
    table.string('created_by', 10).notNullable().defaultTo('SYSTEM');
    table.datetime('updated_at').defaultTo(knex.fn.now());
    table.string('updated_by', 10).notNullable().defaultTo('SYSTEM');

    table.index(['currency_type_id'], 'idx_currency_type_id');
    table.index(['currency_code'], 'idx_currency_code');
    table.index(['status'], 'idx_currency_status');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('master_currency_type');
};
// Stub migration - already applied to database
exports.up = function (knex) {
  return Promise.resolve();
};

exports.down = function (knex) {
  return Promise.resolve();
};
