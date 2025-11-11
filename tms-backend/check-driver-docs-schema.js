require("dotenv").config();
const knex = require("knex");
const knexConfig = require("./knexfile");

const environment = process.env.NODE_ENV || "development";
const config = knexConfig[environment];
const db = knex(config);

async function checkSchema() {
  try {
    console.log("🔍 Checking driver_documents table schema...\n");

    const columns = await db.raw(
      `
      SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'driver_documents'
      ORDER BY ORDINAL_POSITION
    `,
      [process.env.DB_NAME]
    );

    console.log("Table: driver_documents");
    console.log("=".repeat(100));
    console.log(
      `${"Column Name".padEnd(30)} | ${"Type".padEnd(25)} | ${"Nullable".padEnd(
        10
      )} | Key`
    );
    console.log("=".repeat(100));

    columns[0].forEach((col) => {
      const nullable = col.IS_NULLABLE === "YES" ? "NULL" : "NOT NULL";
      console.log(
        `${col.COLUMN_NAME.padEnd(30)} | ${col.COLUMN_TYPE.padEnd(
          25
        )} | ${nullable.padEnd(10)} | ${col.COLUMN_KEY || ""}`
      );
    });

    console.log("\n" + "=".repeat(100));
    console.log(`Total columns: ${columns[0].length}`);

    // Check for file-related columns
    const fileColumns = columns[0].filter(
      (col) =>
        col.COLUMN_NAME.includes("file") ||
        col.COLUMN_NAME.includes("data") ||
        col.COLUMN_NAME.includes("name") ||
        col.COLUMN_NAME.includes("type")
    );

    console.log("\n📄 File-related columns found:");
    if (fileColumns.length > 0) {
      fileColumns.forEach((col) => {
        console.log(`  - ${col.COLUMN_NAME} (${col.COLUMN_TYPE})`);
      });
    } else {
      console.log(
        "  ❌ No file-related columns (file_data, file_name, file_type) found"
      );
      console.log(
        "  ✅ This is correct - file storage should use document_upload table"
      );
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

checkSchema();
