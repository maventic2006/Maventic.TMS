exports.up = function (knex) {
  return knex.schema.createTable("vehicle_tracking_data", function (table) {
    table.increments("vehicle_tracking_unique_id").primary();
    table.string("tracking_id", 10).notNullable().unique();
    table.string("vehicle_assignment_id", 10).notNullable().unique();
    table.string("indent_id", 10);
    table.string("vehicle_id", 10).notNullable().unique();
    table.string("imei_number", 10);
    table.string("ignition", 10);
    table.string("vehicle_speed", 10);
    table.string("object_class", 10); // (2 = unit)
    table.string("unit_id", 10);
    table.string("measurement_unit", 10); // (0 usually means default)
    table.string("timestamp_utc_seconds", 10);
    table.string("position_validity_flag", 10); // (1 = valid, 0 = invalid)
    table.string("location_source", 10); // (0 = GPS)
    table.string("latitude", 10);
    table.string("longitude", 10);
    table.string("course_in_degrees", 10);
    table.string("altitude_in_meters", 10);
    table.string("satellites_count", 10);
    table.string("message_type", 10); // (e.g., 'ud' = user data)
    table.string("record_time", 10);
    table.string("message_priority", 10);
    table.string("io_event_id", 10); // ID of triggered I/O event
    table.string("total_io_elements", 10); // Total number of I/O elements
    table.string("io_element_239", 10); // I/O element 239 (custom)
    table.string("io_element_240", 10); // I/O element 240 (custom)
    table.string("gsm_signal_strength", 10); // (0–5 scale)
    table.string("fuel_level", 10); // Fuel level or external parameter
    table.string("power_supply_status", 10); // Power supply status or similar
    table.string("digital_input_1", 10);
    table.string("position_dilution_precision", 10);
    table.string("engine_rpm", 10); // Engine RPM or internal parameter
    table.string("horizontal_dilution_precision", 10);
    table.string("vehicle_battery_level", 10); // Vehicle battery level or internal voltage
    table.string("external_power_voltage", 10); // External power voltage (V)
    table.string("raw_external_power", 10); // Raw external power (mV)
    table.string("digital_input_alarm", 10); // Digital input or alarm status
    table.string("internal_battery_voltage", 10); // Internal battery voltage (V)
    table.string("raw_internal_power", 10); // Raw internal power (mV)
    table.string("digital_status_reserved", 10); // Digital status / reserved
    table.string("mobile_country_code", 10);
    table.string("mobile_network_code", 10);
    table.string("mobile_network_id", 10); // Mobile network ID (MCC + MNC combined)
    table.string("fuel_consumption", 10); // Fuel consumption or custom input
    table.string("odometer_meters", 10); // Odometer (meters)
    table.string("decoded_digital_status", 10); // Decoded digital status or binary flags
    table.string("hex_digital_status", 10); // Hex representation of digital status
    table.string("sim_serial_part1", 10); // SIM card serial number (part 1)
    table.string("unknown_reserved", 10); // Unknown/Reserved
    table.string("sim_serial_part2", 10); // SIM card serial number (part 2)
    table.string("full_sim_iccid", 10); // Full SIM card ICCID
    table.string("access_control_uid", 10); // Unique access control list or UID
    table.string("operational_idle", 10); // Operational/Idle
    table.string("idle_time", 10);
    table.string("panic_button", 10);
    table.string("millage", 10);
    table.string("km_since_ignition", 10); // KM ran since last ignition on
    table.string("over_speeding", 10);
    table.string("avg_speed", 10);
    table.string("km_since_service", 10); // KM drove since last service
    table.string("tyre_pressure", 10);
    
    // Audit trail properties
    table.date("created_at").notNullable();
    table.time("created_on").notNullable();
    table.string("created_by", 10).notNullable();
    table.date("updated_at").notNullable();
    table.time("updated_on").notNullable();
    table.string("updated_by", 10).notNullable();
    table.string("status", 10).nullable();

    // Indexes
    table.index(["tracking_id"]);
    table.index(["vehicle_assignment_id"]);
    table.index(["indent_id"]);
    table.index(["vehicle_id"]);
    table.index(["imei_number"]);
    table.index(["timestamp_utc_seconds"]);
    table.index(["status"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("vehicle_tracking_data");
};