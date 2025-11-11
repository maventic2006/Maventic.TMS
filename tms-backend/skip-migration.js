require("dotenv").config();
const knex = require("knex");
const knexConfig = require("./knexfile");

const environment = process.env.NODE_ENV || "development";
const config = knexConfig[environment];
const db = knex(config);

async function skipMigrations() {
  try {
    const migrationsToSkip = [
      "026_create_warehouse_documents.js",
      "027_alter_e_bidding_config_freight_unit.js",
      "028_alter_consignor_config_master_parameter.js",
      "029_create_approval_type_master.js",
      "030_create_user_type_master.js",
      "031_create_role_master.js",
      "032_alter_packaging_type_master.js",
      "033_alter_consignor_approval_hierarchy.js",
      "034_alter_consignor_material_master.js",
      "035_add_foreign_key_constraints.js",
      "107_create_violation_type_master.js",
      "20251009062418_create_user_master.js",
      "20251009062437_create_user_master_log.js",
      "20251009103612_create_application_master.js",
      "20251029124044_add_tin_pan_tan_to_tms_address.js",
      "20251030120140_create_bulk_upload_tables.js",
      "20251030124449_add_bulk_upload_columns.js",
    ];

    let batch = 122;

    for (const migration of migrationsToSkip) {
      await db("knex_migrations").insert({
        name: migration,
        batch: batch,
        migration_time: new Date(),
      });
      console.log(`✅ Marked ${migration} as completed`);
      batch++;
    }

    console.log("\n✅ Successfully marked all migrations as completed");
    console.log("Now you can run: npm run migrate");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

skipMigrations();
