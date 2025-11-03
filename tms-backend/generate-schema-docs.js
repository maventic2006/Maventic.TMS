/**
 * Database Schema Documentation Generator
 *
 * This script queries the actual database to generate comprehensive schema documentation
 * in JSON format including all tables, columns, data types, constraints, and relationships.
 *
 * Usage: node generate-schema-docs.js
 */

require("dotenv").config();
const knex = require("knex")(require("./knexfile").development);
const fs = require("fs");
const path = require("path");

// Output file path
const OUTPUT_FILE = path.join(
  __dirname,
  "..",
  ".github",
  "instructions",
  "database-schema.json"
);

/**
 * Get all tables in the database
 */
async function getAllTables() {
  const result = await knex.raw("SHOW TABLES");
  return result[0]
    .map((row) => Object.values(row)[0])
    .filter((table) => {
      // Exclude knex migration tables
      return !table.startsWith("knex_migrations");
    });
}

/**
 * Get detailed column information for a table
 */
async function getTableColumns(tableName) {
  const columns = await knex(tableName).columnInfo();
  return columns;
}

/**
 * Get foreign key relationships for a table
 */
async function getForeignKeys(tableName) {
  const query = `
    SELECT 
      COLUMN_NAME as column_name,
      REFERENCED_TABLE_NAME as referenced_table,
      REFERENCED_COLUMN_NAME as referenced_column,
      CONSTRAINT_NAME as constraint_name
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = ? 
      AND REFERENCED_TABLE_NAME IS NOT NULL
  `;

  const result = await knex.raw(query, [
    process.env.DB_NAME || "tms_dev",
    tableName,
  ]);
  return result[0];
}

/**
 * Get indexes for a table
 */
async function getIndexes(tableName) {
  const query = `SHOW INDEX FROM ${tableName}`;
  const result = await knex.raw(query);

  // Group indexes by index name
  const indexes = {};
  result[0].forEach((row) => {
    if (!indexes[row.Key_name]) {
      indexes[row.Key_name] = {
        name: row.Key_name,
        unique: row.Non_unique === 0,
        columns: [],
        type: row.Index_type,
      };
    }
    indexes[row.Key_name].columns.push(row.Column_name);
  });

  return Object.values(indexes);
}

/**
 * Get primary key for a table
 */
async function getPrimaryKey(tableName) {
  const indexes = await getIndexes(tableName);
  const primaryKey = indexes.find((idx) => idx.name === "PRIMARY");
  return primaryKey ? primaryKey.columns : [];
}

/**
 * Parse migration files to extract additional metadata
 */
async function parseMigrationFiles() {
  const migrationsDir = path.join(__dirname, "migrations");
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".js"))
    .sort();

  const migrationMetadata = {};

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const content = fs.readFileSync(filePath, "utf8");

    // Extract table name from filename or content
    const tableMatch = file.match(/create_(.+)\.js$/);
    if (tableMatch) {
      const tableName = tableMatch[1];
      migrationMetadata[tableName] = {
        migrationFile: file,
        migrationOrder: parseInt(file.split("_")[0]),
      };
    }
  }

  return migrationMetadata;
}

/**
 * Generate complete schema documentation
 */
async function generateSchemaDocumentation() {
  console.log("🔍 Starting database schema documentation generation...\n");

  try {
    // Get all tables
    console.log("📋 Fetching all tables...");
    const tables = await getAllTables();
    console.log(`✓ Found ${tables.length} tables\n`);

    // Get migration metadata
    console.log("📄 Parsing migration files...");
    const migrationMetadata = await parseMigrationFiles();
    console.log(`✓ Parsed migration metadata\n`);

    const schema = {
      database: process.env.DB_NAME || "tms_dev",
      generatedAt: new Date().toISOString(),
      totalTables: tables.length,
      tables: {},
    };

    // Process each table
    for (const tableName of tables) {
      process.stdout.write(`Processing: ${tableName}...`);

      const columns = await getTableColumns(tableName);
      const foreignKeys = await getForeignKeys(tableName);
      const indexes = await getIndexes(tableName);
      const primaryKey = await getPrimaryKey(tableName);

      // Build column information
      const columnDetails = {};
      for (const [colName, colInfo] of Object.entries(columns)) {
        columnDetails[colName] = {
          type: colInfo.type,
          maxLength: colInfo.maxLength,
          nullable: colInfo.nullable,
          defaultValue: colInfo.defaultValue,
          comment: colInfo.comment || null,
        };
      }

      schema.tables[tableName] = {
        name: tableName,
        migration: migrationMetadata[tableName] || null,
        columns: columnDetails,
        primaryKey: primaryKey,
        foreignKeys: foreignKeys.map((fk) => ({
          column: fk.column_name,
          referencedTable: fk.referenced_table,
          referencedColumn: fk.referenced_column,
          constraintName: fk.constraint_name,
        })),
        indexes: indexes.map((idx) => ({
          name: idx.name,
          columns: idx.columns,
          unique: idx.unique,
          type: idx.type,
        })),
        // Count relationships
        relationships: {
          referencesTo: foreignKeys.map((fk) => fk.referenced_table),
          referencedBy: [], // Will be populated in next step
        },
      };

      console.log(" ✓");
    }

    // Populate reverse relationships (referencedBy)
    console.log("\n🔗 Building reverse relationships...");
    for (const tableName of tables) {
      const table = schema.tables[tableName];
      table.foreignKeys.forEach((fk) => {
        if (schema.tables[fk.referencedTable]) {
          schema.tables[fk.referencedTable].relationships.referencedBy.push(
            tableName
          );
        }
      });
    }

    // Write to file
    console.log("\n💾 Writing schema documentation to file...");
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(schema, null, 2));

    console.log(`\n✅ Schema documentation generated successfully!`);
    console.log(`📁 Location: ${OUTPUT_FILE}`);
    console.log(`📊 Total tables documented: ${tables.length}`);

    // Generate summary statistics
    const totalColumns = Object.values(schema.tables).reduce(
      (sum, t) => sum + Object.keys(t.columns).length,
      0
    );
    const totalForeignKeys = Object.values(schema.tables).reduce(
      (sum, t) => sum + t.foreignKeys.length,
      0
    );
    const totalIndexes = Object.values(schema.tables).reduce(
      (sum, t) => sum + t.indexes.length,
      0
    );

    console.log(`📈 Total columns: ${totalColumns}`);
    console.log(`🔗 Total foreign keys: ${totalForeignKeys}`);
    console.log(`🔍 Total indexes: ${totalIndexes}`);
  } catch (error) {
    console.error("\n❌ Error generating schema documentation:", error);
    throw error;
  } finally {
    await knex.destroy();
  }
}

// Run the script
generateSchemaDocumentation()
  .then(() => {
    console.log("\n🎉 Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Fatal error:", error);
    process.exit(1);
  });
