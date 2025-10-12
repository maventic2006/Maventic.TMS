exports.up = function (knex) {
  return knex.schema.createTable("vehicle_basic_information_hdr", function (table) {
    table.increments("vehicle_unique_id").primary();
    table.string("vehicle_id_code_hdr", 20).notNullable().unique();
    table.string("maker_brand_description", 100);
    table.string("maker_model", 100);
    table.string("vin_chassis_no", 50);
    table.unique(["vin_chassis_no"], "vin_chassis_unique");
    table.string("vehicle_type_id", 10);
    table.string("vehicle_category", 50);
    table.string("vehicle_class_description", 100);
    table.string("engine_number", 50);
    table.string("body_type_desc", 100);
    table.string("fuel_type_id", 10);
    table.string("vehicle_colour", 50);
    table.string("engine_type_id", 10);
    table.string("emission_standard", 50);
    table.date("fitness_upto");
    table.date("tax_upto");
    table.string("financer", 100);
    table.string("manufacturing_month_year", 20);
    table.decimal("unloading_weight", 10, 2);
    table.decimal("gross_vehicle_weight_kg", 10, 2);
    table.decimal("volume_capacity_cubic_meter", 10, 2);
    table.integer("seating_capacity");
    table.string("vehicle_registered_at", 100);
    table.string("transmission_type", 50);
    table.string("usage_type_id", 10);
    table.date("safety_inspection_date");
    table.decimal("taxes_and_fees", 10, 2);
    table.decimal("load_capacity_in_ton", 10, 2);
    table.decimal("cargo_dimensions_width", 8, 2);
    table.decimal("cargo_dimensions_height", 8, 2);
    table.decimal("cargo_dimensions_length", 8, 2);
    table.decimal("towing_capacity", 10, 2);
    table.string("suspension_type", 50);
    table.string("tire_load_rating", 50);
    table.string("vehicle_condition", 50);
    table.decimal("fuel_tank_capacity", 8, 2);
    table.boolean("blacklist_status").defaultTo(false);
    table.decimal("road_tax", 10, 2);
    table.string("gps_tracker_imei_number", 50);
    table.boolean("gps_tracker_active_flag").defaultTo(false);
    table.boolean("leasing_flag").defaultTo(false);
    table.decimal("avg_running_speed", 6, 2);
    table.decimal("max_running_speed", 6, 2);
    
    // Audit trail properties
    table.datetime("created_at").defaultTo(knex.fn.now());
    table.datetime("created_on").defaultTo(knex.fn.now());
    table.string("created_by", 10);
    table.datetime("updated_at").defaultTo(knex.fn.now());
    table.datetime("updated_on").defaultTo(knex.fn.now());
    table.string("updated_by", 10);
    table.string("status", 10).defaultTo("ACTIVE");

    // Foreign key constraints
    table.foreign("vehicle_type_id").references("vehicle_type_id").inTable("vehicle_type_master");

    // Indexes
    table.index(["vehicle_id_code_hdr"]);
    table.index(["vehicle_type_id"]);
    table.index(["vin_chassis_no"]);
    table.index(["status"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("vehicle_basic_information_hdr");
};