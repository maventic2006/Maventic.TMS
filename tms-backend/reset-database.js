const mysql = require("mysql2/promise");
require("dotenv").config();

async function resetDatabase() {
  console.log("🔄 Resetting database completely...");

  try {
    const connectionConfig = {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
    };

    const connection = await mysql.createConnection(connectionConfig);

    // Drop the entire database
    await connection.execute(`DROP DATABASE IF EXISTS ${process.env.DB_NAME}`);
    console.log(`✅ Dropped database: ${process.env.DB_NAME}`);

    // Recreate the database
    await connection.execute(`CREATE DATABASE ${process.env.DB_NAME}`);
    console.log(`✅ Created database: ${process.env.DB_NAME}`);

    await connection.end();
    console.log("🎉 Database reset completed! Ready for migrations.");
  } catch (error) {
    console.error("❌ Database reset failed:", error.message);
    process.exit(1);
  }
}

resetDatabase();
