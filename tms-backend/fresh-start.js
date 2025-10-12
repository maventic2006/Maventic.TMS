const mysql = require("mysql2/promise");
require("dotenv").config();

async function freshStart() {
  console.log("🚀 Starting fresh database setup...");

  try {
    const connectionConfig = {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
    };

    const connection = await mysql.createConnection(connectionConfig);

    // Drop and recreate database
    await connection.execute(`DROP DATABASE IF EXISTS ${process.env.DB_NAME}`);
    console.log(`✅ Dropped database: ${process.env.DB_NAME}`);

    await connection.execute(`CREATE DATABASE ${process.env.DB_NAME}`);
    console.log(`✅ Created database: ${process.env.DB_NAME}`);

    await connection.end();

    // Now run knex migrations
    console.log("🏗️  Running Knex migrations...");
    const { spawn } = require("child_process");

    const migrate = spawn("npm", ["run", "migrate"], {
      stdio: "inherit",
      shell: true,
    });

    migrate.on("close", (code) => {
      if (code === 0) {
        console.log("🎉 All migrations completed successfully!");
      } else {
        console.error("❌ Migration failed with code:", code);
      }
    });
  } catch (error) {
    console.error("❌ Fresh start failed:", error.message);
    process.exit(1);
  }
}

freshStart();
