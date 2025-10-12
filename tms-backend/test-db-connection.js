const mysql = require("mysql2/promise");
require("dotenv").config();

async function testConnection() {
  console.log("Testing MySQL connection...");
  console.log("DB_HOST:", process.env.DB_HOST);
  console.log("DB_PORT:", process.env.DB_PORT);
  console.log("DB_USER:", process.env.DB_USER);
  console.log("DB_NAME:", process.env.DB_NAME);
  console.log(
    "DB_PASSWORD:",
    process.env.DB_PASSWORD ? "***SET***" : "NOT SET"
  );

  try {
    // First try to connect without specifying database to create it
    const connectionConfig = {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
    };

    console.log("\n1. Connecting to MySQL server...");
    const connection = await mysql.createConnection(connectionConfig);
    console.log("✅ Successfully connected to MySQL server");

    // Create database if it doesn't exist
    console.log("\n2. Creating database if it doesn't exist...");
    await connection.execute(
      `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`
    );
    console.log(`✅ Database '${process.env.DB_NAME}' is ready`);

    // Test connection to specific database
    console.log("\n3. Testing connection to specific database...");
    await connection.query(`USE ${process.env.DB_NAME}`);
    console.log("✅ Successfully connected to database");

    await connection.end();
    console.log("\n🎉 All database tests passed!");
  } catch (error) {
    console.error("\n❌ Database connection failed:");
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);

    if (error.code === "ER_ACCESS_DENIED_ERROR") {
      console.log("\n🔧 Possible solutions:");
      console.log("1. Check if MySQL password is correct");
      console.log("2. Verify MySQL user exists and has proper permissions");
      console.log(
        "3. Try connecting with empty password (remove DB_PASSWORD from .env)"
      );
      console.log("4. Check if MySQL server is running");
    }

    process.exit(1);
  }
}

testConnection();
