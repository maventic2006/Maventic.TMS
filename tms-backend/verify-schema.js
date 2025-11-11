require("dotenv").config();
const knex = require("knex");
const knexConfig = require("./knexfile");

const environment = process.env.NODE_ENV || "development";
const config = knexConfig[environment];
const db = knex(config);

async function verifySchema() {
  try {
    console.log("🔍 Checking driver_basic_information table schema...\n");

    const columns = await db.raw(
      `
      SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'driver_basic_information'
      ORDER BY ORDINAL_POSITION
    `,
      [process.env.DB_NAME]
    );

    console.log("Table: driver_basic_information");
    console.log("=".repeat(80));

    const phoneRelatedColumns = columns[0].filter(
      (col) =>
        col.COLUMN_NAME.includes("phone") ||
        col.COLUMN_NAME.includes("contact") ||
        col.COLUMN_NAME.includes("whats")
    );

    console.log("\n📱 Phone/Contact Related Columns:");
    phoneRelatedColumns.forEach((col) => {
      const indicator =
        col.COLUMN_NAME === "emergency_contact"
          ? "✅ NEW"
          : col.COLUMN_NAME === "whats_app_number"
          ? "❌ OLD (should be removed)"
          : "  ";
      console.log(
        `${indicator} ${col.COLUMN_NAME.padEnd(30)} | ${col.COLUMN_TYPE.padEnd(
          20
        )} | ${col.IS_NULLABLE === "YES" ? "NULL" : "NOT NULL"}`
      );
    });

    const hasEmergencyContact = phoneRelatedColumns.some(
      (col) => col.COLUMN_NAME === "emergency_contact"
    );
    const hasWhatsAppNumber = phoneRelatedColumns.some(
      (col) => col.COLUMN_NAME === "whats_app_number"
    );

    console.log("\n" + "=".repeat(80));
    console.log("Migration Status:");
    console.log(
      `✅ emergency_contact column: ${
        hasEmergencyContact ? "EXISTS" : "❌ MISSING"
      }`
    );
    console.log(
      `${hasWhatsAppNumber ? "❌" : "✅"} whats_app_number column: ${
        hasWhatsAppNumber ? "STILL EXISTS (should be removed)" : "REMOVED"
      }`
    );

    if (hasEmergencyContact && !hasWhatsAppNumber) {
      console.log("\n🎉 SUCCESS! Migration completed successfully!");
      console.log("   - emergency_contact column added");
      console.log("   - whats_app_number column removed");
    } else if (hasEmergencyContact && hasWhatsAppNumber) {
      console.log(
        "\n⚠️  PARTIAL SUCCESS: emergency_contact added but whats_app_number not removed"
      );
    } else {
      console.log("\n❌ MIGRATION FAILED: emergency_contact column not found");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

verifySchema();
