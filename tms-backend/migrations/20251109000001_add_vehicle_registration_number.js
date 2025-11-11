exports.up = function (knex) {
  return knex.schema.alterTable('vehicle_basic_information_hdr', function (table) {
    table.string('vehicle_registration_number', 50).after('vin_chassis_no');
    table.unique(['vehicle_registration_number'], 'vehicle_reg_number_unique');
    table.index(['vehicle_registration_number'], 'idx_vehicle_reg_number');
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('vehicle_basic_information_hdr', function (table) {
    table.dropIndex(['vehicle_registration_number'], 'idx_vehicle_reg_number');
    table.dropUnique(['vehicle_registration_number'], 'vehicle_reg_number_unique');
    table.dropColumn('vehicle_registration_number');
  });
};
