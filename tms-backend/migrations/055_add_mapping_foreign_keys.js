exports.up = function (knex) {
  return knex.schema
    // Add foreign key for transporter_consignor_mapping_item referencing its header
    .alterTable("transporter_consignor_mapping_item", function (table) {
      table.foreign("tc_mapping_hdr_id").references("tc_mapping_id").inTable("transporter_consignor_mapping");
    })
    // Add foreign keys for vehicle references
    .alterTable("transporter_vehicle_mapping", function (table) {
      table.foreign("vehicle_id").references("vehicle_id_code_hdr").inTable("vehicle_basic_information_hdr");
    })
    .alterTable("vehicle_driver_mapping", function (table) {
      table.foreign("vehicle_id").references("vehicle_id_code_hdr").inTable("vehicle_basic_information_hdr");
    });
};

exports.down = function (knex) {
  return knex.schema
    .alterTable("transporter_consignor_mapping_item", function (table) {
      table.dropForeign(["tc_mapping_hdr_id"]);
    })
    .alterTable("transporter_vehicle_mapping", function (table) {
      table.dropForeign(["vehicle_id"]);
    })
    .alterTable("vehicle_driver_mapping", function (table) {
      table.dropForeign(["vehicle_id"]);
    });
};