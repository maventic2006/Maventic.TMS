const knex = require("knex");
const knexConfig = require("./knexfile");
require("dotenv").config();

const environment = process.env.NODE_ENV || "development";
const config = knexConfig[environment];
const db = knex(config);

async function cleanupTables() {
  console.log("🧹 Cleaning up existing tables...");

  try {
    // Drop tables in reverse order (to handle foreign keys)
    const tables = [
      "consignor_material_master_information",
      "consignor_approval_hierarchy_configuration",
      "e_bidding_config",
      "consignor_general_config_parameter_value",
      "consignor_general_config_parameter_name",
      "consignor_general_config_master",
      "warehouse_sub_location_master",
      "warehouse_sub_location_item",
      "warehouse_sub_location_header",
      "warehouse_basic_information",
    ];

    for (const table of tables) {
      try {
        await db.schema.dropTableIfExists(table);
        console.log(`✅ Dropped table: ${table}`);
      } catch (error) {
        console.log(`⚠️  Table ${table} doesn't exist or couldn't be dropped`);
      }
    }

    // Also clean up migration tables to start fresh
    await db.schema.dropTableIfExists("knex_migrations");
    await db.schema.dropTableIfExists("knex_migrations_lock");
    console.log("✅ Dropped migration tables");

    console.log("🎉 Database cleanup completed!");
  } catch (error) {
    console.error("❌ Cleanup failed:", error.message);
  } finally {
    await db.destroy();
  }
}

cleanupTables();
