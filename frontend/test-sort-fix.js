const consignorConfigurations = require("./config/consignor-configurations.json");

// Test the configuration for consignor_material_state_config
const configName = "consignor_material_state_config";
const config = consignorConfigurations[configName];

console.log(" Testing configuration for:", configName);
console.log(" Primary Key:", config.primaryKey);
console.log(" Available fields:", Object.keys(config.fields));

// Test sortBy validation logic
const testSortBy = "checklist_config_id"; // This should fail
const validSortBy = config.primaryKey; // This should work

let sortField = config.primaryKey; // Default to primaryKey

if (testSortBy && config.fields && config.fields[testSortBy]) {
  sortField = testSortBy;
  console.log(" Valid sortBy field:", testSortBy);
} else if (testSortBy && !config.fields[testSortBy]) {
  console.log(" Invalid sortBy field for this configuration:", testSortBy);
  console.log(" Falling back to primaryKey:", config.primaryKey);
}

console.log(" Final sort field:", sortField);
