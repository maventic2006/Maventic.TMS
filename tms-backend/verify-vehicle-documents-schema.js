const knex = require("knex")(require("./knexfile").development);

knex.raw("DESCRIBE vehicle_documents")
  .then(([rows]) => {
    console.log("\nvehicle_documents table structure:");
    console.log("=====================================");
    rows.forEach(r => {
      const key = r.Key ? "[" + r.Key + "]" : "";
      console.log(r.Field.padEnd(30) + " " + r.Type.padEnd(20) + " " + key);
    });
    process.exit(0);
  })
  .catch(err => {
    console.error("Error:", err.message);
    process.exit(1);
  });
