const knex = require("./config/database");

async function fixMigrations() {
  try {
    const result = await knex("knex_migrations")
      .where("name", "like", "20251112%")
      .del();

    console.log(`Deleted ${result} orphaned migration records`);
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

fixMigrations();
