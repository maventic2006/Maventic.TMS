/**
 * Migration: Increase blacklisted_by column size
 * Description: Increases the size of blacklisted_by column to accommodate longer usernames
 */

exports.up = function (knex) {
  return knex.schema.alterTable('blacklist_master', function (table) {
    table.string('blacklisted_by', 50).alter();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('blacklist_master', function (table) {
    table.string('blacklisted_by', 30).alter();
  });
};
