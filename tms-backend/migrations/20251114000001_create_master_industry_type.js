/**
 * Migration: Create master_industry_type table
 * Description: Stores industry type master data for consignor classification
 */

exports.up = function (knex) {
  return knex.schema.createTable('master_industry_type', function (table) {
    table.increments('industry_type_unique_id').primary();
    table.string('industry_type_id', 30).notNullable().unique();
    table.string('industry_type_name', 100).notNullable();
    table.string('industry_type_code', 20).nullable();
    table.text('description').nullable();
    table.string('status', 10).notNullable().defaultTo('ACTIVE');
    table.datetime('created_at').defaultTo(knex.fn.now());
    table.string('created_by', 10).notNullable().defaultTo('SYSTEM');
    table.datetime('updated_at').defaultTo(knex.fn.now());
    table.string('updated_by', 10).notNullable().defaultTo('SYSTEM');

    table.index(['industry_type_id'], 'idx_industry_type_id');
    table.index(['status'], 'idx_industry_status');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('master_industry_type');
};
