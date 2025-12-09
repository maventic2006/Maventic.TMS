const ExcelJS = require("exceljs");
const path = require("path");

/**
 * Create test Excel file with warehouse data
 */
async function createWarehouseTestFile(filename, testType = "valid") {
  const workbook = new ExcelJS.Workbook();

  // Sheet 1: Warehouse Basic Information
  const basicInfoSheet = workbook.addWorksheet("Warehouse Basic Information");

  // Headers (Row 1)
  basicInfoSheet.columns = [
    { header: "Warehouse_Unique_Id", key: "warehouse_unique_id", width: 20 },
    { header: "Warehouse_ID", key: "warehouse_id", width: 15 },
    { header: "Consignor_ID", key: "consignor_id", width: 15 },
    { header: "Warehouse_Type", key: "warehouse_type", width: 25 },
    { header: "Warehouse_Name1", key: "warehouse_name1", width: 35 },
    { header: "Warehouse_Name2", key: "warehouse_name2", width: 35 },
    { header: "Language", key: "language", width: 12 },
    { header: "Vehicle_Capacity", key: "vehicle_capacity", width: 18 },
    { header: "Virtual_Yard_In", key: "virtual_yard_in", width: 18 },
    {
      header: "Radius_Virtual_Yard_In",
      key: "radius_virtual_yard_in",
      width: 25,
    },
    { header: "Speed_Limit", key: "speed_limit", width: 15 },
    { header: "Weigh_Bridge_Availability", key: "weigh_bridge", width: 28 },
    { header: "Gatepass_System_Available", key: "gatepass_system", width: 28 },
    { header: "Fuel_Availability", key: "fuel_availability", width: 20 },
    { header: "Staging_Area", key: "staging_area", width: 18 },
    { header: "Driver_Waiting_Area", key: "driver_waiting_area", width: 22 },
    { header: "Gate_In_Checklist_Auth", key: "gate_in_checklist", width: 25 },
    { header: "Gate_Out_Checklist_Auth", key: "gate_out_checklist", width: 25 },
    { header: "Country", key: "country", width: 12 },
    { header: "State", key: "state", width: 12 },
    { header: "City", key: "city", width: 20 },
    { header: "District", key: "district", width: 20 },
    { header: "Street_1", key: "street_1", width: 35 },
    { header: "Street_2", key: "street_2", width: 35 },
    { header: "Postal_Code", key: "postal_code", width: 15 },
    { header: "VAT_Number", key: "vat_number", width: 20 },
    { header: "TIN_PAN", key: "tin_pan", width: 20 },
    { header: "TAN", key: "tan", width: 15 },
    { header: "Address_Type", key: "address_type", width: 20 },
    { header: "Material_Type", key: "material_type", width: 25 },
  ];

  // Sample Row (Row 2)
  basicInfoSheet.addRow({
    warehouse_unique_id: "AUTO-GENERATED",
    warehouse_id: "AUTO-GENERATED",
    consignor_id: "AUTO-FILLED",
    warehouse_type: "Manufacturing",
    warehouse_name1: "Sample Warehouse",
    warehouse_name2: "SW",
    language: "EN",
    vehicle_capacity: 50,
    virtual_yard_in: "Yes",
    radius_virtual_yard_in: 500,
    speed_limit: 20,
    weigh_bridge: "Yes",
    gatepass_system: "Yes",
    fuel_availability: "Yes",
    staging_area: "Yes",
    driver_waiting_area: "Yes",
    gate_in_checklist: "Admin",
    gate_out_checklist: "Admin",
    country: "IN",
    state: "KA",
    city: "Bangalore",
    district: "Bangalore Urban",
    street_1: "123 Industrial Area",
    street_2: "Phase 1",
    postal_code: "560001",
    vat_number: "VAT123456",
    tin_pan: "ABCDE1234F",
    tan: "BLRA12345A",
    address_type: "Registered",
    material_type: "General Cargo",
  });

  // Test data based on test type
  if (testType === "valid_3") {
    // 3 valid warehouses
    for (let i = 1; i <= 3; i++) {
      basicInfoSheet.addRow({
        warehouse_unique_id: "",
        warehouse_id: "",
        consignor_id: "CUST00001", // Use actual seeded consignor ID
        warehouse_type: "Manufacturing",
        warehouse_name1: `Test Warehouse Alpha ${i}`,
        warehouse_name2: `TWA${i}`,
        language: "EN",
        vehicle_capacity: 50 + i * 10,
        virtual_yard_in: "Yes",
        radius_virtual_yard_in: 500,
        speed_limit: 20,
        weigh_bridge: "Yes",
        gatepass_system: "Yes",
        fuel_availability: "Yes",
        staging_area: "Yes",
        driver_waiting_area: "Yes",
        gate_in_checklist: "Admin",
        gate_out_checklist: "Admin",
        country: "IN",
        state: "KA",
        city: "Bangalore",
        district: "Bangalore Urban",
        street_1: `${100 + i} Industrial Area`,
        street_2: "Phase 1",
        postal_code: "560001",
        vat_number: `VAT12345${i}`,
        tin_pan: `ABCDE1234${i}`, // Unique TIN/PAN for each warehouse
        tan: `BLRA1234${i}A`, // Unique TAN for each warehouse
        address_type: "Registered",
        material_type: "General Cargo",
      });
    }
  } else if (testType === "invalid_3") {
    // 3 invalid warehouses with different errors
    basicInfoSheet.addRow({
      warehouse_unique_id: "",
      warehouse_id: "",
      consignor_id: "",
      warehouse_type: "Manufacturing",
      warehouse_name1: "", // Missing name (ERROR)
      warehouse_name2: "",
      language: "EN",
      vehicle_capacity: 50,
      virtual_yard_in: "Yes",
      radius_virtual_yard_in: 500,
      speed_limit: 20,
      weigh_bridge: "Yes",
      gatepass_system: "Yes",
      fuel_availability: "Yes",
      staging_area: "Yes",
      driver_waiting_area: "Yes",
      gate_in_checklist: "Admin",
      gate_out_checklist: "Admin",
      country: "IN",
      state: "KA",
      city: "Bangalore",
      district: "Bangalore Urban",
      street_1: "123 Industrial Area",
      street_2: "Phase 1",
      postal_code: "560001",
      vat_number: "VAT123456",
      tin_pan: "ABCDE1234F",
      tan: "BLRA12345A",
      address_type: "Registered",
      material_type: "General Cargo",
    });

    basicInfoSheet.addRow({
      warehouse_unique_id: "",
      warehouse_id: "",
      consignor_id: "",
      warehouse_type: "Manufacturing",
      warehouse_name1: "Invalid Warehouse No VAT",
      warehouse_name2: "IWNV",
      language: "EN",
      vehicle_capacity: 50,
      virtual_yard_in: "Yes",
      radius_virtual_yard_in: 500,
      speed_limit: 20,
      weigh_bridge: "Yes",
      gatepass_system: "Yes",
      fuel_availability: "Yes",
      staging_area: "Yes",
      driver_waiting_area: "Yes",
      gate_in_checklist: "Admin",
      gate_out_checklist: "Admin",
      country: "IN",
      state: "KA",
      city: "Bangalore",
      district: "Bangalore Urban",
      street_1: "123 Industrial Area",
      street_2: "Phase 1",
      postal_code: "560001",
      vat_number: "", // Missing VAT (ERROR)
      tin_pan: "ABCDE1234F",
      tan: "BLRA12345A",
      address_type: "Registered",
      material_type: "General Cargo",
    });

    basicInfoSheet.addRow({
      warehouse_unique_id: "",
      warehouse_id: "",
      consignor_id: "",
      warehouse_type: "", // Missing type (ERROR)
      warehouse_name1: "Invalid Warehouse No Type",
      warehouse_name2: "IWNT",
      language: "EN",
      vehicle_capacity: 50,
      virtual_yard_in: "Yes",
      radius_virtual_yard_in: 500,
      speed_limit: 20,
      weigh_bridge: "Yes",
      gatepass_system: "Yes",
      fuel_availability: "Yes",
      staging_area: "Yes",
      driver_waiting_area: "Yes",
      gate_in_checklist: "Admin",
      gate_out_checklist: "Admin",
      country: "IN",
      state: "KA",
      city: "Bangalore",
      district: "Bangalore Urban",
      street_1: "123 Industrial Area",
      street_2: "Phase 1",
      postal_code: "560001",
      vat_number: "VAT789012",
      tin_pan: "ABCDE1234F",
      tan: "BLRA12345A",
      address_type: "Registered",
      material_type: "General Cargo",
    });
  } else if (testType === "mixed_6") {
    // 3 valid + 3 invalid
    for (let i = 1; i <= 3; i++) {
      basicInfoSheet.addRow({
        warehouse_unique_id: "",
        warehouse_id: "",
        consignor_id: "CUST00001", // Explicitly provide consignor_id
        warehouse_type: "Manufacturing",
        warehouse_name1: `Valid Warehouse ${i}`,
        warehouse_name2: `VW${i}`,
        language: "EN",
        vehicle_capacity: 50 + i * 10,
        virtual_yard_in: "Yes",
        radius_virtual_yard_in: 500,
        speed_limit: 20,
        weigh_bridge: "Yes",
        gatepass_system: "Yes",
        fuel_availability: "Yes",
        staging_area: "Yes",
        driver_waiting_area: "Yes",
        gate_in_checklist: "Admin",
        gate_out_checklist: "Admin",
        country: "IN",
        state: "KA",
        city: "Bangalore",
        district: "Bangalore Urban",
        street_1: `${200 + i} Industrial Area`,
        street_2: "Phase 1",
        postal_code: "560001",
        vat_number: `VAT20000${i}`,
        tin_pan: `FGHIJ5678${i}`, // Unique TIN/PAN
        tan: `BLRA5678${i}A`, // Unique TAN
        address_type: "Registered",
        material_type: "General Cargo",
      });
    }

    // 3 invalid
    basicInfoSheet.addRow({
      warehouse_unique_id: "",
      warehouse_id: "",
      consignor_id: "CUST00001", // Provide consignor_id even for invalid
      warehouse_type: "Manufacturing",
      warehouse_name1: "", // ERROR: Missing name
      warehouse_name2: "",
      language: "EN",
      vehicle_capacity: 50,
      virtual_yard_in: "Yes",
      radius_virtual_yard_in: 500,
      speed_limit: 20,
      weigh_bridge: "Yes",
      gatepass_system: "Yes",
      fuel_availability: "Yes",
      staging_area: "Yes",
      driver_waiting_area: "Yes",
      gate_in_checklist: "Admin",
      gate_out_checklist: "Admin",
      country: "IN",
      state: "KA",
      city: "Bangalore",
      district: "Bangalore Urban",
      street_1: "400 Industrial Area",
      street_2: "Phase 1",
      postal_code: "560001",
      vat_number: "VAT300001",
      tin_pan: "KLMNO9012F", // Unique TIN/PAN
      tan: "BLRA90121A", // Unique TAN
      address_type: "Registered",
      material_type: "General Cargo",
    });

    basicInfoSheet.addRow({
      warehouse_unique_id: "",
      warehouse_id: "",
      consignor_id: "CUST00001", // Provide consignor_id
      warehouse_type: "Manufacturing",
      warehouse_name1: "Invalid No VAT",
      warehouse_name2: "INV",
      language: "EN",
      vehicle_capacity: 50,
      virtual_yard_in: "Yes",
      radius_virtual_yard_in: 500,
      speed_limit: 20,
      weigh_bridge: "Yes",
      gatepass_system: "Yes",
      fuel_availability: "Yes",
      staging_area: "Yes",
      driver_waiting_area: "Yes",
      gate_in_checklist: "Admin",
      gate_out_checklist: "Admin",
      country: "IN",
      state: "KA",
      city: "Bangalore",
      district: "Bangalore Urban",
      street_1: "500 Industrial Area",
      street_2: "Phase 1",
      postal_code: "560001",
      vat_number: "", // ERROR: Missing VAT
      tin_pan: "PQRST3456F", // Unique TIN/PAN
      tan: "BLRA34561A", // Unique TAN
      address_type: "Registered",
      material_type: "General Cargo",
    });

    basicInfoSheet.addRow({
      warehouse_unique_id: "",
      warehouse_id: "",
      consignor_id: "CUST00001", // Provide consignor_id
      warehouse_type: "", // ERROR: Missing type
      warehouse_name1: "Invalid No Type",
      warehouse_name2: "INT",
      language: "EN",
      vehicle_capacity: 50,
      virtual_yard_in: "Yes",
      radius_virtual_yard_in: 500,
      speed_limit: 20,
      weigh_bridge: "Yes",
      gatepass_system: "Yes",
      fuel_availability: "Yes",
      staging_area: "Yes",
      driver_waiting_area: "Yes",
      gate_in_checklist: "Admin",
      gate_out_checklist: "Admin",
      country: "IN",
      state: "KA",
      city: "Bangalore",
      district: "Bangalore Urban",
      street_1: "600 Industrial Area",
      street_2: "Phase 1",
      postal_code: "560001",
      vat_number: "VAT300003",
      tin_pan: "UVWXY6789F", // Unique TIN/PAN
      tan: "BLRA67891A", // Unique TAN
      address_type: "Registered",
      material_type: "General Cargo",
    });
  }

  // Sheet 2: Sub Location Header (Empty for basic tests)
  const subLocHeaderSheet = workbook.addWorksheet("Sub Location Header");
  subLocHeaderSheet.columns = [
    { header: "Ref_ID", key: "ref_id", width: 20 },
    { header: "Sub_Location_Type", key: "sub_location_type", width: 20 },
    { header: "Sub_Location_ID", key: "sub_location_id", width: 20 },
    { header: "Sub_Location_Name", key: "sub_location_name", width: 30 },
    { header: "Active", key: "active", width: 10 },
  ];

  // Sheet 3: Sub Location Item (Empty for basic tests)
  const subLocItemSheet = workbook.addWorksheet("Sub Location Item");
  subLocItemSheet.columns = [
    { header: "Ref_ID", key: "ref_id", width: 20 },
    { header: "Sub_Location_Type", key: "sub_location_type", width: 20 },
    { header: "Sub_Location_ID", key: "sub_location_id", width: 20 },
    { header: "Latitude", key: "latitude", width: 15 },
    { header: "Longitude", key: "longitude", width: 15 },
    { header: "Sequence", key: "sequence", width: 12 },
  ];

  // Save file
  const outputPath = path.join(__dirname, filename);
  await workbook.xlsx.writeFile(outputPath);
  console.log(`✅ Test file created: ${outputPath}`);
}

// Generate test files
async function generateAllTestFiles() {
  try {
    console.log("🔧 Generating warehouse test Excel files...\n");

    await createWarehouseTestFile("test-warehouse-3-valid.xlsx", "valid_3");
    console.log(
      "✅ Created: test-warehouse-3-valid.xlsx (3 valid warehouses)\n"
    );

    await createWarehouseTestFile("test-warehouse-3-invalid.xlsx", "invalid_3");
    console.log(
      "✅ Created: test-warehouse-3-invalid.xlsx (3 invalid warehouses)\n"
    );

    await createWarehouseTestFile("test-warehouse-6-mixed.xlsx", "mixed_6");
    console.log(
      "✅ Created: test-warehouse-6-mixed.xlsx (3 valid + 3 invalid)\n"
    );

    console.log("🎉 All test files generated successfully!");
    console.log("\n📋 Test files created:");
    console.log(
      "  1. test-warehouse-3-valid.xlsx - For testing successful upload"
    );
    console.log(
      "  2. test-warehouse-3-invalid.xlsx - For testing error reporting"
    );
    console.log(
      "  3. test-warehouse-6-mixed.xlsx - For testing mixed scenarios"
    );
  } catch (error) {
    console.error("❌ Error generating test files:", error);
  }
}

// Run if called directly
if (require.main === module) {
  generateAllTestFiles();
}

module.exports = { createWarehouseTestFile, generateAllTestFiles };
