exports.up = function (knex) {
  return knex.schema
    .alterTable("tms_address", function (table) {
      table.foreign("address_type_id").references("address_type_id").inTable("address_type_master");
    })
    .alterTable("material_master_information", function (table) {
      table.foreign("material_types_id").references("material_types_id").inTable("material_types_master");
    })
    .alterTable("message_master", function (table) {
      table.foreign("message_type_id").references("message_type_id").inTable("message_type_master");
    });
};

exports.down = function (knex) {
  return knex.schema
    .alterTable("tms_address", function (table) {
      table.dropForeign(["address_type_id"]);
    })
    .alterTable("material_master_information", function (table) {
      table.dropForeign(["material_types_id"]);
    })
    .alterTable("message_master", function (table) {
      table.dropForeign(["message_type_id"]);
    });
};