exports.up = function (knex) {
  return knex.schema.createTable("transporter_contact", function (table) {
    table.increments("contact_unique_id").primary();
    table.string("tcontact_id", 10).notNullable();
    table.string("transporter_id", 10).notNullable();
    table.string("contact_person_name", 200);
    table.string("role", 100);
    table.string("phone_number", 20);
    table.string("alternate_phone_number", 20);
    table.string("whats_app_number", 20);
    table.string("email_id", 100);
    table.string("alternate_email_id", 100);
    table.string("address_id", 10);

    // Audit trail properties
    table.datetime("created_at").defaultTo(knex.fn.now());
    table.datetime("created_on").defaultTo(knex.fn.now());
    table.string("created_by", 10);
    table.datetime("updated_at").defaultTo(knex.fn.now());
    table.datetime("updated_on").defaultTo(knex.fn.now());
    table.string("updated_by", 10);
    table.string("status", 10).defaultTo("ACTIVE");

    // Foreign key relationships (disabled for initial setup)
    // table.foreign("transporter_id").references("transporter_id").inTable("transporter_general_info");

    // Indexes
    table.index(["transporter_id"], "idx_trans_contact_trans_id");
    table.index(["tcontact_id"], "idx_trans_contact_tcontact_id");
    table.index(["email_id"], "idx_trans_contact_email");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("transporter_contact");
};
