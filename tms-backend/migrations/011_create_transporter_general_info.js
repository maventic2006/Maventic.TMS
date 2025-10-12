exports.up = function (knex) {
  return knex.schema.createTable("transporter_general_info", function (table) {
    table.increments("transporter_unique_id").primary();
    table.string("transporter_id", 10).notNullable();
    table.string("user_type", 50);
    table.string("business_name", 200);
    table.boolean("trans_mode_road").defaultTo(false);
    table.boolean("trans_mode_rail").defaultTo(false);
    table.boolean("trans_mode_air").defaultTo(false);
    table.boolean("trans_mode_sea").defaultTo(false);
    table.boolean("active_flag").defaultTo(true);
    table.date("from_date");
    table.date("to_date");
    table.string("address_id", 10);
    table.decimal("avg_rating", 3, 2);
    
    // Audit trail properties
    table.datetime("created_at").defaultTo(knex.fn.now());
    table.datetime("created_on").defaultTo(knex.fn.now());
    table.string("created_by", 10);
    table.datetime("updated_at").defaultTo(knex.fn.now());
    table.datetime("updated_on").defaultTo(knex.fn.now());
    table.string("updated_by", 10);
    table.string("status", 10).defaultTo("ACTIVE");

    // Indexes
    table.index(["transporter_id"], "idx_trans_gen_trans_id");
    table.index(["business_name"], "idx_trans_gen_business_name");
    table.index(["user_type"], "idx_trans_gen_user_type");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("transporter_general_info");
};
