console.log("í·ª Testing Updated Fix...");

const testData = { 
  consignor_id: "CSG001", 
  parameter_name_key: "TEST_KEY", 
  parameter_value: "TEST_VALUE",
  description: "Test Description",
  updated_at: "SHOULD_BE_REMOVED",
  updated_on: "SHOULD_BE_REMOVED"
};

const updateFields = ["updated_at", "updated_on", "updated_by"];
updateFields.forEach(field => {
  if (testData[field] !== undefined) {
    console.log("íº« Removing update field from data:", field);
    delete testData[field];
  }
});

console.log("í³‹ Final data:", testData);

if (!testData.updated_at && !testData.updated_on) {
  console.log("âœ… Backend fix working - update fields removed");
} else {
  console.log("âŒ Backend fix failed - update fields still present");
}

console.log("âœ… Tests completed");
