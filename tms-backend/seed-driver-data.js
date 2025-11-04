const knex = require("./config/database");

async function seedDriverData() {
  try {
    console.log(" Starting driver data seeding...\n");

    // Get existing drivers
    const drivers = await knex("driver_basic_information")
      .select("driver_id", "full_name")
      .where("status", "ACTIVE")
      .limit(5);

    console.log(` Found ${drivers.length} drivers to seed data for\n`);

    // Get existing transporters
    const transporters = await knex("transporter_general_info")
      .select("transporter_id", "business_name")
      .where("status", "ACTIVE")
      .limit(3);

    console.log(` Found ${transporters.length} transporters for mapping\n`);

    const currentTimestamp = new Date();

    // ========================================
    // 1. SEED ADDRESSES FOR DRIVERS
    // ========================================
    console.log(" Seeding driver addresses...");

    const addressData = [
      {
        driver_id: drivers[0]?.driver_id || "DRV0001",
        country: "IN",
        state: "MH",
        city: "Mumbai",
        district: "Mumbai Suburban",
        street1: "123 Andheri East",
        street2: "Near Metro Station",
        postal_code: "400069",
        is_primary: true,
      },
      {
        driver_id: drivers[1]?.driver_id || "DRV0002",
        country: "IN",
        state: "DL",
        city: "New Delhi",
        district: "South Delhi",
        street1: "45 Nehru Place",
        street2: "Sector 14",
        postal_code: "110019",
        is_primary: true,
      },
      {
        driver_id: drivers[2]?.driver_id || "DRV0003",
        country: "IN",
        state: "KA",
        city: "Bangalore",
        district: "Bangalore Urban",
        street1: "78 Koramangala",
        street2: "4th Block",
        postal_code: "560034",
        is_primary: true,
      },
    ];

    for (const addr of addressData) {
      // Check if address already exists
      const existing = await knex("tms_address")
        .where({
          user_reference_id: addr.driver_id,
          user_type: "DRIVER",
          is_primary: true,
        })
        .first();

      if (!existing) {
        // Generate address ID
        const count = await knex("tms_address").count("* as count").first();
        const addressId = `ADDR${String(parseInt(count.count) + 1).padStart(
          4,
          "0"
        )}`;

        await knex("tms_address").insert({
          address_id: addressId,
          user_reference_id: addr.driver_id,
          user_type: "DRIVER",
          country: addr.country,
          state: addr.state,
          city: addr.city,
          district: addr.district,
          street1: addr.street1,
          street2: addr.street2,
          postal_code: addr.postal_code,
          is_primary: addr.is_primary,
          address_type_id: "CURRENT",
          created_at: currentTimestamp,
          created_on: currentTimestamp,
          created_by: "SYSTEM",
          updated_at: currentTimestamp,
          updated_on: currentTimestamp,
          updated_by: "SYSTEM",
          status: "ACTIVE",
        });

        console.log(`   Created address for ${addr.driver_id}`);
      } else {
        console.log(`    Address already exists for ${addr.driver_id}`);
      }
    }

    // ========================================
    // 2. SEED ACCIDENT/VIOLATION RECORDS
    // ========================================
    console.log("\n⚠️  Seeding accident/violation records...");

    const accidentData = [
      {
        driver_id: drivers[0]?.driver_id || "DRV0001",
        type: "ACCIDENT",
        date: "2023-05-15",
        description: "Minor collision while parking",
        vehicle_regn_number: "MH01AB1234",
      },
      {
        driver_id: drivers[1]?.driver_id || "DRV0002",
        type: "SPEEDING",
        date: "2024-02-20",
        description: "Over speed limit on highway",
        vehicle_regn_number: "DL05CD5678",
      },
      {
        driver_id: drivers[2]?.driver_id || "DRV0003",
        type: "ACCIDENT",
        date: "2023-11-10",
        description: "Rear-end collision in traffic",
        vehicle_regn_number: "KA03EF9012",
      },
    ];

    for (const acc of accidentData) {
      // Check if record already exists
      const existing = await knex("driver_accident_violation")
        .where({
          driver_id: acc.driver_id,
          date: acc.date,
        })
        .first();

      if (!existing) {
        // Generate violation ID
        const count = await knex("driver_accident_violation")
          .count("* as count")
          .first();
        const violationId = `DVIOL${String(parseInt(count.count) + 1).padStart(
          4,
          "0"
        )}`;

        await knex("driver_accident_violation").insert({
          driver_violation_id: violationId,
          driver_id: acc.driver_id,
          type: acc.type,
          date: acc.date,
          description: acc.description,
          vehicle_regn_number: acc.vehicle_regn_number,
          created_at: currentTimestamp,
          created_on: currentTimestamp,
          created_by: "SYSTEM",
          updated_at: currentTimestamp,
          updated_on: currentTimestamp,
          updated_by: "SYSTEM",
          status: "ACTIVE",
        });

        console.log(`   Created accident record for ${acc.driver_id}`);
      } else {
        console.log(`    Accident record already exists for ${acc.driver_id}`);
      }
    }

    // ========================================
    // 3. SEED TRANSPORTER-DRIVER MAPPINGS
    // ========================================
    console.log("\n Seeding transporter-driver mappings...");

    const transporterMappings = [
      {
        transporter_id: transporters[0]?.transporter_id || "T001",
        driver_id: drivers[0]?.driver_id || "DRV0001",
        valid_from: "2024-01-01",
        valid_to: "2025-12-31",
      },
      {
        transporter_id: transporters[1]?.transporter_id || "T002",
        driver_id: drivers[1]?.driver_id || "DRV0002",
        valid_from: "2024-01-01",
        valid_to: "2025-12-31",
      },
      {
        transporter_id: transporters[2]?.transporter_id || "T003",
        driver_id: drivers[2]?.driver_id || "DRV0003",
        valid_from: "2024-01-01",
        valid_to: "2025-12-31",
      },
    ];

    for (const mapping of transporterMappings) {
      // Check if mapping already exists
      const existing = await knex("transporter_driver_mapping")
        .where({
          transporter_id: mapping.transporter_id,
          driver_id: mapping.driver_id,
        })
        .first();

      if (!existing) {
        // Generate mapping ID
        const count = await knex("transporter_driver_mapping")
          .count("* as count")
          .first();
        const mappingId = `TDM${String(parseInt(count.count) + 1).padStart(
          4,
          "0"
        )}`;

        await knex("transporter_driver_mapping").insert({
          td_mapping_id: mappingId,
          transporter_id: mapping.transporter_id,
          driver_id: mapping.driver_id,
          valid_from: mapping.valid_from,
          valid_to: mapping.valid_to,
          active_flag: true,
          created_at: currentTimestamp,
          created_on: currentTimestamp,
          created_by: "SYSTEM",
          updated_at: currentTimestamp,
          updated_on: currentTimestamp,
          updated_by: "SYSTEM",
          status: "ACTIVE",
        });

        console.log(
          `   Created mapping: ${mapping.transporter_id} -> ${mapping.driver_id}`
        );
      } else {
        console.log(
          `    Mapping already exists: ${mapping.transporter_id} -> ${mapping.driver_id}`
        );
      }
    }

    // ========================================
    // 4. SEED BLACKLIST MAPPINGS (Optional - only 1 driver)
    // ========================================
    console.log("\n Seeding blacklist mappings...");

    const blacklistData = [
      {
        user_id: drivers[2]?.driver_id || "DRV0003",
        user_type: "DRIVER",
        blacklisted_by: "Consignor",
        blacklisted_by_id: "CON001",
        valid_from: "2024-06-01",
        valid_to: "2025-06-01",
        remark: "Multiple safety violations - pending review",
      },
    ];

    for (const blacklist of blacklistData) {
      // Check if blacklist already exists
      const existing = await knex("blacklist_mapping")
        .where({
          user_id: blacklist.user_id,
          user_type: blacklist.user_type,
        })
        .first();

      if (!existing) {
        // Generate blacklist ID
        const count = await knex("blacklist_mapping")
          .count("* as count")
          .first();
        const blacklistId = `BLK${String(parseInt(count.count) + 1).padStart(
          4,
          "0"
        )}`;

        await knex("blacklist_mapping").insert({
          blacklist_mapping_id: blacklistId,
          user_id: blacklist.user_id,
          user_type: blacklist.user_type,
          blacklisted_by: blacklist.blacklisted_by,
          blacklisted_by_id: blacklist.blacklisted_by_id,
          valid_from: blacklist.valid_from,
          valid_to: blacklist.valid_to,
          remark: blacklist.remark,
          created_at: currentTimestamp,
          created_on: currentTimestamp,
          created_by: "SYSTEM",
          updated_at: currentTimestamp,
          updated_on: currentTimestamp,
          updated_by: "SYSTEM",
          status: "ACTIVE",
        });

        console.log(`   Created blacklist entry for ${blacklist.user_id}`);
      } else {
        console.log(
          `    Blacklist entry already exists for ${blacklist.user_id}`
        );
      }
    }

    // ========================================
    // 5. DISPLAY SUMMARY
    // ========================================
    console.log("\n" + "=".repeat(60));
    console.log(" DATA SEEDING SUMMARY");
    console.log("=".repeat(60));

    const addressCount = await knex("tms_address")
      .where("user_type", "DRIVER")
      .count("* as count")
      .first();
    const accidentCount = await knex("driver_accident_violation")
      .count("* as count")
      .first();
    const transporterMappingCount = await knex("transporter_driver_mapping")
      .count("* as count")
      .first();
    const blacklistCount = await knex("blacklist_mapping")
      .where("user_type", "DRIVER")
      .count("* as count")
      .first();

    console.log(`\n Driver Addresses: ${addressCount.count}`);
    console.log(` Accident/Violation Records: ${accidentCount.count}`);
    console.log(
      ` Transporter-Driver Mappings: ${transporterMappingCount.count}`
    );
    console.log(` Blacklist Entries: ${blacklistCount.count}`);

    console.log("\n Driver data seeding completed successfully!\n");
  } catch (error) {
    console.error("\n Error seeding driver data:", error.message);
    console.error(error);
  } finally {
    await knex.destroy();
  }
}

seedDriverData();
