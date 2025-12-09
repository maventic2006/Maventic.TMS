const knex = require("../config/database");
const bcrypt = require("bcrypt");
const { Country, State } = require("country-state-city");
const {
  validateWarehouseListQuery,
  validateWarehouseCreate,
  validateWarehouseUpdate,
} = require("../validation/warehouseValidation");
const { validateDocumentNumber } = require("../utils/documentValidation");

// Helper: Generate unique warehouse ID (WH001, WH002, etc.)
const generateWarehouseId = async (trx = knex) => {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const result = await trx("warehouse_basic_information")
      .count("* as count")
      .first();
    const count = parseInt(result.count) + 1 + attempts;
    const newId = `WH${count.toString().padStart(3, "0")}`;

    const existing = await trx("warehouse_basic_information")
      .where("warehouse_id", newId)
      .first();
    if (!existing) {
      return newId;
    }

    attempts++;
  }

  throw new Error("Failed to generate unique warehouse ID after 100 attempts");
};

// Helper: Generate document ID (for warehouse_documents table)
const generateDocumentId = async (trx = knex, generatedIds = new Set()) => {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const result = await trx("warehouse_documents").count("* as count").first();
    const count = parseInt(result.count) + 1 + attempts;
    const newId = `WDOC${count.toString().padStart(4, "0")}`;

    // Check if this ID already exists in database (check document_unique_id as it's the PK)
    const existsInDb = await trx("warehouse_documents")
      .where("document_unique_id", newId)
      .first();

    if (!existsInDb && !generatedIds.has(newId)) {
      generatedIds.add(newId); // Track this ID to prevent duplicates in same batch
      return newId;
    }

    attempts++;
  }

  throw new Error("Failed to generate unique document ID after 100 attempts");
};

// Helper: Generate document upload ID (for document_upload table)
// const generateDocumentUploadId = async () => {
//   const result = await knex("document_upload").count("* as count").first();
//   const count = parseInt(result.count) + 1;
//   return `DU${count.toString().padStart(4, "0")}`;
// };

const generateDocumentUploadId = async (trx) => {
  const result = await trx("document_upload")
    .select("document_id")
    .whereNotNull("document_id")
    .andWhere("document_id", "like", "DU%")
    .orderByRaw("CAST(SUBSTRING(document_id, 3) AS UNSIGNED) DESC")
    .first();

  let next = 1;

  if (result?.document_id) {
    const numeric = parseInt(result.document_id.substring(2)); // Skip "DU"
    if (!isNaN(numeric)) {
      next = numeric + 1;
    }
  }

  return `DU${next.toString().padStart(4, "0")}`;
};

// Helper: Generate address ID (for tms_address table)
const generateAddressId = async (trx = knex, generatedIds = new Set()) => {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const result = await trx("tms_address").count("* as count").first();
    const count = parseInt(result.count) + 1 + attempts;
    const newId = `ADDR${count.toString().padStart(4, "0")}`;

    // Check if this ID already exists in database OR in current generation batch
    const existsInDb = await trx("tms_address")
      .where("address_id", newId)
      .first();

    if (!existsInDb && !generatedIds.has(newId)) {
      generatedIds.add(newId); // Track this ID to prevent duplicates in same batch
      return newId;
    }

    attempts++;
  }

  throw new Error("Failed to generate unique address ID after 100 attempts");
};

// Helper: Generate Consignor Warehouse Manager User ID (format: CW0001, CW0002, etc.)
const generateWarehouseManagerUserId = async (trx = knex) => {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const result = await trx("user_master")
      .where("user_type_id", "UT007") // Consignor WH Manager type
      .count("* as count")
      .first();
    const count = parseInt(result.count) + 1 + attempts;
    const newId = `CW${count.toString().padStart(4, "0")}`;

    const existsInDb = await trx("user_master").where("user_id", newId).first();
    if (!existsInDb) {
      return newId;
    }

    attempts++;
  }

  throw new Error(
    "Failed to generate unique Warehouse Manager user ID after 100 attempts"
  );
};

// Helper: Generate Approval Flow Transaction ID (format: AF0001, AF0002, etc.)
const generateApprovalFlowId = async (trx = knex) => {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const result = await trx("approval_flow_trans").count("* as count").first();
    const count = parseInt(result.count) + 1 + attempts;
    const newId = `AF${count.toString().padStart(4, "0")}`;

    const existsInDb = await trx("approval_flow_trans")
      .where("approval_flow_trans_id", newId)
      .first();
    if (!existsInDb) {
      return newId;
    }

    attempts++;
  }

  throw new Error(
    "Failed to generate unique approval flow ID after 100 attempts"
  );
};

// Helper: Generate Sub-Location Header ID (format: SLH0001, SLH0002, etc.)
const generateSubLocationId = async (trx = knex) => {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const result = await trx("warehouse_sub_location_header")
      .count("* as count")
      .first();
    const count = parseInt(result.count) + 1 + attempts;
    const newId = `SLH${count.toString().padStart(4, "0")}`;

    const existsInDb = await trx("warehouse_sub_location_header")
      .where("sub_location_hdr_id", newId)
      .first();
    if (!existsInDb) {
      return newId;
    }

    attempts++;
  }

  throw new Error(
    "Failed to generate unique sub-location header ID after 100 attempts"
  );
};

// Helper: Generate Geo Fence Item ID (format: GFI0001, GFI0002, etc.)
const generateGeoFenceItemId = async (trx = knex) => {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const result = await trx("warehouse_sub_location_item")
      .count("* as count")
      .first();
    const count = parseInt(result.count) + 1 + attempts;
    const newId = `GFI${count.toString().padStart(4, "0")}`;

    const existsInDb = await trx("warehouse_sub_location_item")
      .where("geo_fence_item_id", newId)
      .first();
    if (!existsInDb) {
      return newId;
    }

    attempts++;
  }

  throw new Error(
    "Failed to generate unique geo fence item ID after 100 attempts"
  );
};

// Helper: Format date to MySQL DATE format (YYYY-MM-DD)
// Converts ISO date strings or Date objects to MySQL-compatible format
// Fixed to handle timezone issues - prevents date shifting
const formatDateForMySQL = (dateValue) => {
  if (!dateValue) return null;

  // If it's already in YYYY-MM-DD format, return as-is
  if (typeof dateValue === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return dateValue;
  }

  // Convert to Date object and format
  const date = new Date(dateValue);

  // Check if date is valid
  if (isNaN(date.getTime())) return null;

  // Use UTC methods to avoid timezone shifts
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// @desc    Get warehouse list with filters and pagination
// @route   GET /api/warehouse
// @access  Private (Consignor, Admin, Super Admin)
// const getWarehouseList = async (req, res) => {
//   try {
//     console.log("📦 Warehouse List API called");
//     console.log("Query params:", req.query);
//     console.log("User:", req.user);

//     // Validate query parameters
//     const validation = validateWarehouseListQuery(req.query);
//     if (!validation.isValid) {
//       return res.status(400).json({
//         success: false,
//         message: "Validation failed",
//         errors: validation.errors,
//       });
//     }

//     // Extract query parameters
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 25;
//     const offset = (page - 1) * limit;

//     // Filter by consignor ID only if user has consignor_id (not for product_owner/admin)
//     const consignorId = req.user.consignor_id || null;

//     // Build query with address join for city/state/country
//     let query = knex("warehouse_basic_information as w")
//       .leftJoin("tms_address as addr", function () {
//         this.on("w.warehouse_id", "=", "addr.user_reference_id").andOn(
//           "addr.user_type",
//           "=",
//           knex.raw("'WH'")
//         );
//       })
//       .leftJoin(
//         "warehouse_type_master as wtm",
//         "w.warehouse_type",
//         "wtm.warehouse_type_id"
//       )
//       .leftJoin(
//         "material_types_master as mtm",
//         "w.material_type_id",
//         "mtm.material_types_id"
//       )
//       .select(
//         "w.warehouse_id",
//         "w.consignor_id",
//         "w.warehouse_type",
//         "wtm.warehouse_type as warehouse_type_name",
//         "w.material_type_id",
//         "mtm.material_types as material_type_name",
//         "w.warehouse_name1",
//         knex.raw("0 as geo_fencing"), // Field doesn't exist in table, default to 0
//         "w.weigh_bridge_availability",
//         "w.virtual_yard_in",
//         "w.gatepass_system_available",
//         "w.fuel_availability",
//         knex.raw("COALESCE(addr.city, 'N/A') as city"),
//         knex.raw("COALESCE(addr.state, 'N/A') as state"),
//         knex.raw("COALESCE(addr.country, 'N/A') as country"),
//         "w.region",
//         "w.zone",
//         "w.created_by",
//         "w.created_at",
//         knex.raw("'N/A' as approver"), // Field doesn't exist in table, default to N/A
//         knex.raw("NULL as approved_on"), // Field doesn't exist in table, default to NULL
//         "w.status"
//       );

//     // Filter by consignor ID (user's own warehouses)
//     if (consignorId) {
//       query = query.where("w.consignor_id", consignorId);
//     }

//     // Apply filters
//     if (req.query.warehouseId) {
//       query = query.where(
//         "w.warehouse_id",
//         "like",
//         `%${req.query.warehouseId}%`
//       );
//     }
//     if (req.query.warehouseName) {
//       query = query.where(
//         "w.warehouse_name1",
//         "like",
//         `%${req.query.warehouseName}%`
//       );
//     }
//     if (req.query.status) {
//       query = query.where("w.status", req.query.status);
//     }
//     if (req.query.weighBridge !== undefined) {
//       query = query.where(
//         "w.weigh_bridge_availability",
//         req.query.weighBridge === "true"
//       );
//     }
//     if (req.query.virtualYardIn !== undefined) {
//       query = query.where(
//         "w.virtual_yard_in",
//         req.query.virtualYardIn === "true"
//       );
//     }
//     if (req.query.fuelAvailability !== undefined) {
//       query = query.where(
//         "w.fuel_availability",
//         req.query.fuelAvailability === "true"
//       );
//     }

//     // Get total count (create separate query for counting)
//     const countResult = await knex("warehouse_basic_information as w")
//       .count("* as count")
//       .where((builder) => {
//         // Apply same filters as main query
//         if (consignorId) {
//           builder.where("w.consignor_id", consignorId);
//         }
//         if (req.query.warehouseId) {
//           builder.where("w.warehouse_id", "like", `%${req.query.warehouseId}%`);
//         }
//         if (req.query.warehouseName) {
//           builder.where(
//             "w.warehouse_name1",
//             "like",
//             `%${req.query.warehouseName}%`
//           );
//         }
//         if (req.query.status) {
//           builder.where("w.status", req.query.status);
//         }
//         if (req.query.weighBridge !== undefined) {
//           builder.where(
//             "w.weigh_bridge_availability",
//             req.query.weighBridge === "true"
//           );
//         }
//         if (req.query.virtualYardIn !== undefined) {
//           builder.where(
//             "w.virtual_yard_in",
//             req.query.virtualYardIn === "true"
//           );
//         }
//         if (req.query.fuelAvailability !== undefined) {
//           builder.where(
//             "w.fuel_availability",
//             req.query.fuelAvailability === "true"
//           );
//         }
//       })
//       .first();

//     const total = parseInt(countResult.count);

//     // Get paginated results
//     const warehouses = await query
//       .orderBy("w.warehouse_id", "asc")
//       .limit(limit)
//       .offset(offset);

//     console.log(`✅ Found ${warehouses.length} warehouses`);

//     res.json({
//       success: true,
//       warehouses,
//       pagination: {
//         page,
//         limit,
//         total,
//         totalPages: Math.ceil(total / limit),
//       },
//     });
//   } catch (error) {
//     console.error("❌ Error fetching warehouses:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch warehouses",
//       error: error.message,
//     });
//   }
// };

const getWarehouseList = async (req, res) => {
  try {
    console.log("📦 Warehouse List API called");
    console.log("Query params:", req.query);
    console.log("User:", req.user);

    // Validate query parameters
    const validation = validateWarehouseListQuery(req.query);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    // Extract pagination params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const offset = (page - 1) * limit;

    // Extract date filters
    const { createdOnStart = "", createdOnEnd = "" } = req.query;

    // Filter by consignor ID (for non-admin users)
    const consignorId = req.user.consignor_id || null;

    // MAIN QUERY
    let query = knex("warehouse_basic_information as w")
      .leftJoin("tms_address as addr", function () {
        this.on("w.warehouse_id", "=", "addr.user_reference_id").andOn(
          "addr.user_type",
          "=",
          knex.raw("'WH'")
        );
      })
      .leftJoin(
        "warehouse_type_master as wtm",
        "w.warehouse_type",
        "wtm.warehouse_type_id"
      )
      .leftJoin(
        "material_types_master as mtm",
        "w.material_type_id",
        "mtm.material_types_id"
      )
      .leftJoin(
        knex.raw(`(
          SELECT aft1.*
          FROM approval_flow_trans aft1
          INNER JOIN (
            SELECT user_id_reference_id, MAX(approval_flow_unique_id) as max_id
            FROM approval_flow_trans
            WHERE approval_type_id = 'AT005'
              AND s_status IN ('Approve', 'Reject', 'PENDING')
            GROUP BY user_id_reference_id
          ) aft2 ON aft1.user_id_reference_id = aft2.user_id_reference_id
               AND aft1.approval_flow_unique_id = aft2.max_id
        ) as aft`),
        knex.raw(
          "CONCAT('WH', LPAD(CAST(SUBSTRING(aft.user_id_reference_id, 3) AS UNSIGNED), 3, '0'))"
        ),
        "w.warehouse_id"
      )
      .select(
        "w.warehouse_id",
        "w.consignor_id",
        "w.warehouse_type",
        "wtm.warehouse_type as warehouse_type_name",
        "w.material_type_id",
        "mtm.material_types as material_type_name",
        "w.warehouse_name1",
        "w.geo_fencing",
        "w.weigh_bridge_availability",
        "w.virtual_yard_in",
        "w.gatepass_system_available",
        "w.fuel_availability",
        knex.raw("COALESCE(addr.city, 'N/A') as city"),
        knex.raw("COALESCE(addr.state, 'N/A') as state"),
        knex.raw("COALESCE(addr.country, 'N/A') as country"),
        "w.region",
        "w.zone",
        "w.created_by",

        // Fixed: Use SUBSTRING to extract date without timezone conversion
        // DATE(created_at) converts to server timezone (IST +5:30), showing wrong date
        // SUBSTRING extracts YYYY-MM-DD directly from UTC timestamp
        knex.raw("SUBSTRING(w.created_at, 1, 10) as created_on"),

        knex.raw(
          "COALESCE(aft.actioned_by_name, aft.pending_with_name) as approver_name"
        ),
        "aft.approved_on",
        "aft.s_status as approval_status",
        "w.status"
      );

    // FILTER: Consignor
    if (consignorId) {
      query.where("w.consignor_id", consignorId);
    }

    // ✅ FILTER: Drafts should only be visible to their creator
    // For SAVE_AS_DRAFT status, filter by created_by (user_id)
    // This ensures super admin can only see their own drafts
    query.where(function () {
      this.where("w.status", "!=", "SAVE_AS_DRAFT").orWhere(function () {
        this.where("w.status", "=", "SAVE_AS_DRAFT").andWhere(
          "w.created_by",
          req.user.user_id
        );
      });
    });

    // FILTERS
    if (req.query.warehouseId) {
      query.where("w.warehouse_id", "like", `%${req.query.warehouseId}%`);
    }

    if (req.query.warehouseName) {
      query.where("w.warehouse_name1", "like", `%${req.query.warehouseName}%`);
    }

    if (req.query.status) {
      query.where("w.status", req.query.status);
    }

    if (req.query.weighBridge !== undefined) {
      query.where(
        "w.weigh_bridge_availability",
        req.query.weighBridge === "true"
      );
    }

    if (req.query.virtualYardIn !== undefined) {
      query.where("w.virtual_yard_in", req.query.virtualYardIn === "true");
    }

    if (req.query.fuelAvailability !== undefined) {
      query.where("w.fuel_availability", req.query.fuelAvailability === "true");
    }

    if (req.query.geoFencing !== undefined) {
      query.where("w.geo_fencing", req.query.geoFencing === "true");
    }

    // -------------------------------
    // DATE RANGE FILTERS (using created_at, exposing as created_on)
    // Fix: Explicitly use UTC timezone to prevent IST offset issues
    // -------------------------------
    if (createdOnStart) {
      // Convert date to UTC timestamp to avoid timezone shifts
      // Add 'Z' to indicate UTC timezone
      const startDateUTC = createdOnStart.includes("T")
        ? createdOnStart
        : `${createdOnStart}T00:00:00Z`;
      query.where("w.created_at", ">=", startDateUTC);
    }

    if (createdOnEnd) {
      // Convert date to UTC timestamp to avoid timezone shifts
      // Add 'Z' to indicate UTC timezone
      const endDateUTC = createdOnEnd.includes("T")
        ? createdOnEnd
        : `${createdOnEnd}T23:59:59Z`;
      query.where("w.created_at", "<=", endDateUTC);
    }

    // COUNT QUERY
    const countResult = await knex("warehouse_basic_information as w")
      .count("* as count")
      .where((builder) => {
        if (consignorId) {
          builder.where("w.consignor_id", consignorId);
        }

        // ✅ FILTER: Drafts should only be visible to their creator
        builder.where(function () {
          this.where("w.status", "!=", "SAVE_AS_DRAFT").orWhere(function () {
            this.where("w.status", "=", "SAVE_AS_DRAFT").andWhere(
              "w.created_by",
              req.user.user_id
            );
          });
        });

        if (req.query.warehouseId) {
          builder.where("w.warehouse_id", "like", `%${req.query.warehouseId}%`);
        }

        if (req.query.warehouseName) {
          builder.where(
            "w.warehouse_name1",
            "like",
            `%${req.query.warehouseName}%`
          );
        }

        if (req.query.status) {
          builder.where("w.status", req.query.status);
        }

        if (req.query.weighBridge !== undefined) {
          builder.where(
            "w.weigh_bridge_availability",
            req.query.weighBridge === "true"
          );
        }

        if (req.query.virtualYardIn !== undefined) {
          builder.where(
            "w.virtual_yard_in",
            req.query.virtualYardIn === "true"
          );
        }

        if (req.query.fuelAvailability !== undefined) {
          builder.where(
            "w.fuel_availability",
            req.query.fuelAvailability === "true"
          );
        }

        // ✅ Add geo fencing filter to count query (was missing)
        if (req.query.geoFencing !== undefined) {
          builder.where("w.geo_fencing", req.query.geoFencing === "true");
        }

        // DATE FILTERS FOR COUNT
        // Fix: Explicitly use UTC timezone to prevent IST offset issues
        if (createdOnStart) {
          // Convert date to UTC timestamp to avoid timezone shifts
          const startDateUTC = createdOnStart.includes("T")
            ? createdOnStart
            : `${createdOnStart}T00:00:00Z`;
          builder.where("w.created_at", ">=", startDateUTC);
        }

        if (createdOnEnd) {
          // Convert date to UTC timestamp to avoid timezone shifts
          const endDateUTC = createdOnEnd.includes("T")
            ? createdOnEnd
            : `${createdOnEnd}T23:59:59Z`;
          builder.where("w.created_at", "<=", endDateUTC);
        }
      })
      .first();

    const total = parseInt(countResult.count);

    // PAGINATION
    const warehouses = await query
      .orderBy("w.warehouse_id", "asc")
      .limit(limit)
      .offset(offset);

    // Transform warehouses to include approver fields and convert ISO codes to names
    const transformedWarehouses = warehouses.map((warehouse) => {
      // Convert country code to country name
      let countryName = warehouse.country;
      if (warehouse.country && warehouse.country.length === 2) {
        const countryObj = Country.getCountryByCode(warehouse.country);
        countryName = countryObj ? countryObj.name : warehouse.country;
      }

      // Convert state code to state name
      let stateName = warehouse.state;
      if (warehouse.state && warehouse.state.length <= 3 && warehouse.country) {
        // Get country code for state lookup
        let countryCode = warehouse.country;
        if (warehouse.country.length !== 2) {
          // If country is already a name, find its code
          const countryObj = Country.getAllCountries().find(
            (c) => c.name.toLowerCase() === warehouse.country.toLowerCase()
          );
          countryCode = countryObj ? countryObj.isoCode : warehouse.country;
        }

        // Get state by code
        const stateObj = State.getStateByCodeAndCountry(
          warehouse.state,
          countryCode
        );
        stateName = stateObj ? stateObj.name : warehouse.state;
      }

      return {
        ...warehouse,
        country: countryName,
        state: stateName,
        approver: warehouse.approver_name || null,
        approvedOn:
          warehouse.approved_on && warehouse.approval_status === "Approve"
            ? new Date(warehouse.approved_on).toISOString().split("T")[0]
            : null,
      };
    });

    console.log(`✅ Found ${transformedWarehouses.length} warehouses`);

    res.json({
      success: true,
      warehouses: transformedWarehouses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("❌ Error fetching warehouses:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch warehouses",
      error: error.message,
    });
  }
};

// @desc    Get warehouse by ID
// @route   GET /api/warehouse/:id
// @access  Private (Consignor, Admin, Super Admin)
const getWarehouseById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📦 Fetching warehouse: ${id}`);

    const warehouse = await knex("warehouse_basic_information as w")
      .leftJoin(
        "warehouse_type_master as wtm",
        "w.warehouse_type",
        "wtm.warehouse_type_id"
      )
      .leftJoin(
        "material_types_master as mtm",
        "w.material_type_id",
        "mtm.material_types_id"
      )
      .select(
        "w.*",
        "wtm.warehouse_type as warehouse_type_name",
        "mtm.material_types as material_type_name"
      )
      .where("w.warehouse_id", id)
      .first();

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found",
      });
    }

    console.log(`✅ Warehouse found: ${warehouse.warehouse_name1}`);

    // Fetch address data with LEFT JOIN
    const address = await knex("tms_address as addr")
      .leftJoin(
        "address_type_master as atm",
        "addr.address_type_id",
        "atm.address_type_id"
      )
      .where("addr.user_reference_id", id)
      .where("addr.user_type", "WH")
      .where("addr.status", "ACTIVE")
      .select(
        "addr.address_id",
        "addr.address_type_id",
        "atm.address as address_type_name",
        "addr.country",
        "addr.state",
        "addr.city",
        "addr.district",
        "addr.street_1",
        "addr.street_2",
        "addr.postal_code",
        "addr.vat_number",
        "addr.tin_pan",
        "addr.tan",
        "addr.is_primary"
      )
      .first();

    console.log(`📍 Address data: ${address ? "Found" : "Not found"}`);

    // Convert ISO codes to full names for address (if address exists)
    if (address) {
      // Convert country code to country name
      if (address.country && address.country.length === 2) {
        const countryObj = Country.getCountryByCode(address.country);
        address.country = countryObj ? countryObj.name : address.country;
      }

      // Convert state code to state name
      if (address.state && address.state.length <= 3 && address.country) {
        // Get country code for state lookup
        let countryCode = address.country;
        if (address.country.length !== 2) {
          // If country is already a name, find its code
          const countryObj = Country.getAllCountries().find(
            (c) => c.name.toLowerCase() === address.country.toLowerCase()
          );
          countryCode = countryObj ? countryObj.isoCode : address.country;
        }

        // Get state by code
        const stateObj = State.getStateByCodeAndCountry(
          address.state,
          countryCode
        );
        address.state = stateObj ? stateObj.name : address.state;
      }
    }

    // Fetch documents with LEFT JOIN to document_upload and document_name_master
    // ✅ FIX: Use subquery to get only the LATEST document_upload per warehouse_documents
    // This prevents duplicates when multiple document_upload records exist for same system_reference_id
    const documents = await knex("warehouse_documents as wd")
      .leftJoin(
        knex.raw(`(
          SELECT du1.*
          FROM document_upload du1
          INNER JOIN (
            SELECT system_reference_id, MAX(created_at) as max_created_at
            FROM document_upload
            GROUP BY system_reference_id
          ) du2 ON du1.system_reference_id = du2.system_reference_id 
               AND du1.created_at = du2.max_created_at
        ) as du`),
        "wd.document_unique_id",
        "du.system_reference_id"
      )
      .leftJoin(
        "document_name_master as dnm",
        "wd.document_type_id",
        "dnm.doc_name_master_id"
      )
      .where("wd.warehouse_id", id)
      .where("wd.status", "ACTIVE")
      .select(
        "wd.document_unique_id",
        "wd.document_type_id",
        "dnm.document_name as documentTypeName",
        "wd.document_number",
        "wd.valid_from",
        "wd.valid_to",
        "wd.active",
        "du.file_name",
        "du.file_type",
        "du.file_xstring_value as file_data"
      );

    console.log(`📄 Found ${documents.length} documents for warehouse ${id}`);

    // Fetch geofencing data
    const geofencing = await knex("warehouse_sub_location_header as wslh")
      .leftJoin(
        "warehouse_sub_location_item as wsli",
        "wslh.sub_location_hdr_id",
        "wsli.sub_location_hdr_id"
      )
      .leftJoin(
        "warehouse_sub_location_master as wslm",
        "wslh.sub_location_id",
        "wslm.sub_location_id"
      )
      .where("wslh.warehouse_unique_id", id)
      .where("wslh.status", "ACTIVE")
      .select(
        "wslh.sub_location_hdr_id",
        "wslh.sub_location_id",
        "wslm.warehouse_sub_location_description as subLocationType",
        "wslh.description as description",
        "wsli.geo_fence_item_id",
        "wsli.latitude",
        "wsli.longitude",
        "wsli.sequence"
      )
      .orderBy("wslh.sub_location_hdr_id")
      .orderBy("wsli.sequence");

    console.log(`🗺️ Found ${geofencing.length} geofencing coordinates`);

    // Group geofencing data by sub-location header
    const groupedGeofencing = geofencing.reduce((acc, item) => {
      if (!acc[item.sub_location_hdr_id]) {
        acc[item.sub_location_hdr_id] = {
          subLocationHdrId: item.sub_location_hdr_id,
          subLocationId: item.sub_location_id,
          subLocationType: item.subLocationType,
          description: item.description,
          coordinates: [],
        };
      }
      if (item.geo_fence_item_id) {
        acc[item.sub_location_hdr_id].coordinates.push({
          latitude: item.latitude,
          longitude: item.longitude,
          sequence: item.sequence,
        });
      }
      return acc;
    }, {});

    const subLocations = Object.values(groupedGeofencing);

    // Map documents to response format
    const mappedDocuments = documents.map((doc) => ({
      documentUniqueId: doc.document_unique_id,
      documentType: doc.documentTypeName || doc.document_type_id,
      documentTypeId: doc.document_type_id,
      documentNumber: doc.document_number,
      validFrom: doc.valid_from,
      validTo: doc.valid_to,
      status: doc.active,
      fileName: doc.file_name,
      fileType: doc.file_type,
      fileData: doc.file_data, // Base64 encoded file content
    }));

    // 🔍 DEBUG: Log document mapping details
    console.log(
      `📄 Mapped ${mappedDocuments.length} documents for warehouse ${id}`
    );
    if (mappedDocuments.length > 0) {
      console.log("📄 First document details:", {
        documentUniqueId: mappedDocuments[0].documentUniqueId,
        documentType: mappedDocuments[0].documentType,
        fileName: mappedDocuments[0].fileName,
        fileType: mappedDocuments[0].fileType,
        hasFileData: !!mappedDocuments[0].fileData,
        fileDataLength: mappedDocuments[0].fileData
          ? mappedDocuments[0].fileData.length
          : 0,
      });
    }

    // ========================================
    // FETCH USER APPROVAL STATUS
    // ========================================
    // ✅ USING TRANSPORTER PATTERN: ID derivation with fallback for robustness

    console.log(`🔍 Fetching approval status for warehouse ${id}`);

    let userApprovalStatus = null;
    let approvalHistory = [];

    try {
      // STEP 1: Derive CW (Consignor Warehouse Manager) user ID from warehouse ID
      // WH001 → CW0001, WH002 → CW0002, etc.
      const warehouseNumber = id.substring(2); // Remove 'WH' prefix
      const warehouseManagerUserId = `CW${warehouseNumber.padStart(4, "0")}`;

      console.log(
        `  🔍 Looking for warehouse manager user: ${warehouseManagerUserId}`
      );

      // STEP 2: Primary lookup - Derived ID (most reliable)
      let warehouseManagerUser = await knex("user_master")
        .where("user_id", warehouseManagerUserId)
        .first();

      // STEP 3: Fallback - Name and consignor matching (backward compatibility)
      if (!warehouseManagerUser) {
        console.log(`  ⚠️ No user found with derived ID, searching by name...`);
        console.log(`     - user_type_id: UT007`);
        console.log(`     - consignor_id: ${warehouse.consignor_id}`);
        console.log(`     - user_full_name: ${warehouse.warehouse_name1}`);

        warehouseManagerUser = await knex("user_master")
          .where("user_type_id", "UT007") // Consignor WH Manager
          .where("consignor_id", warehouse.consignor_id)
          .where("user_full_name", warehouse.warehouse_name1)
          .first();
      }

      // STEP 4: If user found, fetch ALL approval flows
      if (warehouseManagerUser) {
        console.log(
          `  ✅ Found associated user: ${warehouseManagerUser.user_id}`
        );
        console.log(
          `     - User Full Name: ${warehouseManagerUser.user_full_name}`
        );
        console.log(`     - User Status: ${warehouseManagerUser.status}`);
        console.log(`     - Created At: ${warehouseManagerUser.created_at}`);

        // Fetch ALL approval flows (not just first) ordered by most recent
        const approvalFlows = await knex("approval_flow_trans as aft")
          .leftJoin(
            "approval_type_master as atm",
            "aft.approval_type_id",
            "atm.approval_type_id"
          )
          .where("aft.user_id_reference_id", id) // 🔥 FIX: Use warehouse entity ID instead of manager user ID
          .select(
            "aft.*",
            "atm.approval_type as approval_category",
            "atm.approval_name"
          )
          .orderBy("aft.created_at", "desc"); // Get ALL flows, ordered

        console.log(`  ✅ Found ${approvalFlows.length} approval flow records`);

        // STEP 5: Use most recent approval flow (array [0], not .first())
        if (approvalFlows.length > 0) {
          console.log(
            `  ✅ Most recent approval flow: ${approvalFlows[0]?.approval_flow_trans_id}`
          );
          console.log(`     - Status: ${approvalFlows[0]?.s_status}`);
          console.log(
            `     - Pending With: ${approvalFlows[0]?.pending_with_name} (${approvalFlows[0]?.pending_with_user_id})`
          );
          console.log(
            `     - Created By: ${approvalFlows[0]?.created_by_name} (${approvalFlows[0]?.created_by_user_id})`
          );

          userApprovalStatus = {
            approvalFlowTransId: approvalFlows[0]?.approval_flow_trans_id, // ✅ CRITICAL: Include for approval API
            userId: warehouseManagerUser.user_id,
            userEmail: warehouseManagerUser.email_id,
            userName: warehouseManagerUser.user_full_name,
            userStatus: warehouseManagerUser.status,
            isActive: warehouseManagerUser.is_active,
            currentApprovalStatus: approvalFlows[0]?.s_status, // Match consignor pattern
            approvalStatus: approvalFlows[0]?.s_status,
            approverLevel: approvalFlows[0]?.approver_level,
            pendingWith: approvalFlows[0]?.pending_with_name, // Match consignor pattern
            pendingWithUserId: approvalFlows[0]?.pending_with_user_id,
            pendingWithName: approvalFlows[0]?.pending_with_name,
            createdByUserId: approvalFlows[0]?.created_by_user_id,
            createdByName: approvalFlows[0]?.created_by_name,
            actionedByUserId: approvalFlows[0]?.actioned_by_id,
            actionedByName: approvalFlows[0]?.actioned_by_name,
            approvedOn: approvalFlows[0]?.approved_on,
            remarks: approvalFlows[0]?.remarks,
          };

          // Save complete approval history
          approvalHistory = approvalFlows;

          console.log(
            `📋 User Approval Status Object:`,
            JSON.stringify(userApprovalStatus, null, 2)
          );
          console.log(
            `📋 Approval status: ${approvalFlows[0]?.s_status}, Level: ${approvalFlows[0]?.approver_level}`
          );
        }
      } else {
        console.log(`  ⚠️ No associated user found for warehouse ${id}`);
        console.log(`  ℹ️  This usually means:`);
        console.log(
          `     1. Warehouse has not been submitted for approval yet (still in SAVE_AS_DRAFT)`
        );
        console.log(
          `     2. Warehouse manager user was not created during submission`
        );
        console.log(
          `     3. Neither derived ID (${warehouseManagerUserId}) nor name matching worked`
        );
      }
    } catch (approvalError) {
      console.error("Error fetching warehouse approval status:", approvalError);
      // Don't fail entire request if approval fetch fails
    }

    console.log(`📤 Sending response for warehouse ${id}:`);
    console.log(`   - Warehouse Status: ${warehouse.status}`);
    console.log(
      `   - User Approval Status: ${userApprovalStatus ? "YES" : "NO"}`
    );
    if (userApprovalStatus) {
      console.log(
        `   - Approval Status: ${userApprovalStatus.currentApprovalStatus}`
      );
      console.log(`   - Pending With: ${userApprovalStatus.pendingWith}`);
    }

    res.json({
      success: true,
      warehouse: {
        ...warehouse,
        address: address || null,
        documents: mappedDocuments,
        subLocations: subLocations,
      },
      userApprovalStatus,
      approvalHistory,
    });
  } catch (error) {
    console.error("❌ Error fetching warehouse:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch warehouse",
      error: error.message,
    });
  }
};

// @desc    Create new warehouse
// @route   POST /api/warehouse or POST /api/warehouse/create
// @access  Private (Consignor, Admin, Super Admin)
const createWarehouse = async (req, res) => {
  let trx;
  try {
    console.log("📦 Creating new warehouse");
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    console.log("User:", req.user);

    const { generalDetails, facilities, address, documents, subLocations } =
      req.body;
    const currentTimestamp = new Date();

    // ========================================
    // PHASE 1: VALIDATION
    // ========================================

    // Validate general details
    if (
      !generalDetails?.warehouseName ||
      generalDetails.warehouseName.trim().length < 2 ||
      generalDetails.warehouseName.length > 30
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Warehouse name must be 2-30 characters",
          field: "warehouseName",
        },
      });
    }

    if (!generalDetails.warehouseType) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Warehouse type is required",
          field: "warehouseType",
        },
      });
    }

    if (!generalDetails.materialType) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Material type is required",
          field: "materialType",
        },
      });
    }

    if (
      generalDetails.vehicleCapacity < 0 ||
      !Number.isInteger(generalDetails.vehicleCapacity)
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Vehicle capacity must be a non-negative integer",
          field: "vehicleCapacity",
        },
      });
    }

    if (generalDetails.speedLimit < 1 || generalDetails.speedLimit > 80) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Speed limit must be between 1-80 KM/H",
          field: "speedLimit",
        },
      });
    }

    // Validate address
    if (!address) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Address information is required",
          field: "address",
        },
      });
    }

    if (!address.country || !address.state || !address.city) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Country, state, and city are required",
          field: "address",
        },
      });
    }

    // Validate GST/VAT number format
    if (!address.vatNumber) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "GST/VAT number is required",
          field: "vatNumber",
        },
      });
    }

    const normalizedVat = address.vatNumber.trim().toUpperCase();

    // Indian GST format: 15 characters
    // Pattern: 2 digits (state) + 10 chars (PAN) + 1 digit (entity) + 1 letter (Z) + 1 digit (checksum)
    // Example: 27AAPFU0939F1ZV
    const gstRegex =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;

    // International VAT format: 2 letter country code + 8-15 alphanumeric
    // Examples: GB123456789, DE123456789, FR12345678901
    const vatRegex = /^[A-Z]{2}[A-Z0-9]{8,15}$/;

    if (!gstRegex.test(normalizedVat) && !vatRegex.test(normalizedVat)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message:
            "Invalid GST/VAT format. Indian GST must be 15 characters (e.g., 27AAPFU0939F1ZV). International VAT: Country code + 8-15 alphanumeric characters",
          field: "vatNumber",
          expectedFormats: [
            "Indian GST: 27AAPFU0939F1ZV (15 characters)",
            "International VAT: GB123456789 (2 letter country code + 8-15 chars)",
          ],
        },
      });
    }

    // Normalize VAT number to uppercase
    address.vatNumber = normalizedVat;

    // Validate postal code (must be exactly 6 digits)
    if (!address.postalCode || !/^\d{6}$/.test(address.postalCode)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Postal code must be exactly 6 digits",
          field: "postalCode",
        },
      });
    }

    // Validate TIN/PAN if provided (optional, but must match PAN format if entered)
    if (address.tinPan && address.tinPan.trim() !== "") {
      const panRegex = /^[A-Z]{5}\d{4}[A-Z]$/;
      if (!panRegex.test(address.tinPan.trim().toUpperCase())) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message:
              "TIN/PAN must match format: 5 letters + 4 digits + 1 letter (e.g., ABCDE1234F)",
            field: "tinPan",
            expectedFormat: "ABCDE1234F",
          },
        });
      }
    }

    if (!address.addressType) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Address type is required",
          field: "addressType",
        },
      });
    }

    // Validate documents if provided
    if (documents && documents.length > 0) {
      for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];

        // Validate document type
        if (!doc.documentType) {
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Document type is required",
              field: `documents[${i}].documentType`,
            },
          });
        }

        // Validate document number
        if (!doc.documentNumber) {
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Document number is required",
              field: `documents[${i}].documentNumber`,
            },
          });
        }

        // Fetch document type name for validation
        const docTypeInfo = await knex("document_name_master")
          .where("doc_name_master_id", doc.documentType)
          .first();

        if (docTypeInfo) {
          // Validate document number format based on document type
          const validation = validateDocumentNumber(
            doc.documentNumber,
            docTypeInfo.document_name
          );

          if (!validation.isValid) {
            return res.status(400).json({
              success: false,
              error: {
                code: "VALIDATION_ERROR",
                message: validation.message,
                field: `documents[${i}].documentNumber`,
                expectedFormat: validation.format,
              },
            });
          }

          // Clean and normalize document number after validation
          doc.documentNumber = doc.documentNumber.trim().toUpperCase();
        }

        // Validate valid from date
        if (!doc.validFrom) {
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Valid from date is required",
              field: `documents[${i}].validFrom`,
            },
          });
        }

        // Validate valid from date is not in future
        const validFromDate = new Date(doc.validFrom);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (validFromDate > today) {
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Valid from date cannot be in the future",
              field: `documents[${i}].validFrom`,
            },
          });
        }

        // Validate valid to date
        if (!doc.validTo) {
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Valid to date is required",
              field: `documents[${i}].validTo`,
            },
          });
        }

        // Validate date range (validTo must be after validFrom)
        const validToDate = new Date(doc.validTo);
        if (validToDate <= validFromDate) {
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Valid to date must be after valid from date",
              field: `documents[${i}].validTo`,
            },
          });
        }
      }
    }

    // Get consignor ID - prioritize from request body (for super admin), fallback to logged-in user
    // Super admin can select any consignor, regular consignor uses their own ID
    const consignorId =
      generalDetails.consignorId || req.user.consignor_id || "SYSTEM";
    const userId = req.user.user_id || "SYSTEM";

    console.log("✅ Validation passed, starting database transaction");
    console.log(
      "✅ Using consignor ID:",
      consignorId,
      "(from request body or user token)"
    );

    // ========================================
    // PHASE 2: DATABASE OPERATIONS
    // ========================================

    trx = await knex.transaction();

    // Generate unique warehouse ID
    const warehouseId = await generateWarehouseId(trx);
    console.log("✅ Generated warehouse ID:", warehouseId);

    // ✅ FIX: Use currentTimestamp for all inserts to ensure consistent timestamps
    // This ensures the warehouse, user, and approval_flow_trans all have matching timestamps
    // which is required for the getWarehouseList JOIN to work correctly

    // ✅ Determine geo_fencing flag based on subLocations data
    const hasGeoFencing =
      subLocations &&
      subLocations.length > 0 &&
      subLocations.some((sl) => sl.coordinates && sl.coordinates.length > 0);

    // Insert warehouse basic information
    await trx("warehouse_basic_information").insert({
      warehouse_id: warehouseId,
      consignor_id: consignorId,
      warehouse_type: generalDetails.warehouseType,
      material_type_id: generalDetails.materialType,
      warehouse_name1: generalDetails.warehouseName.trim(),
      warehouse_name2: generalDetails.warehouseName2?.trim() || null,
      language: generalDetails.language || "EN",
      vehicle_capacity: generalDetails.vehicleCapacity,
      virtual_yard_in: generalDetails.virtualYardIn || false,
      radius_for_virtual_yard_in: generalDetails.radiusVirtualYardIn || 0,
      speed_limit: generalDetails.speedLimit || 20,
      weigh_bridge_availability: facilities?.weighBridge || false,
      gatepass_system_available: facilities?.gatepassSystem || false,
      fuel_availability: facilities?.fuelAvailability || false,
      staging_area_for_goods_organization: facilities?.stagingArea || false,
      driver_waiting_area: facilities?.driverWaitingArea || false,
      gate_in_checklist_auth: facilities?.gateInChecklistAuth || false,
      gate_out_checklist_auth: facilities?.gateOutChecklistAuth || false,
      geo_fencing: hasGeoFencing, // ✅ Set geo_fencing based on subLocations data
      status: "PENDING", // ✅ FIXED: Set to PENDING (will be updated to ACTIVE after approval)
      created_by: userId,
      created_at: currentTimestamp, // ✅ Use currentTimestamp instead of knex.fn.now()
    });

    console.log("✅ Warehouse basic information inserted");

    // Insert address with generated address_id
    const addressId = await generateAddressId(trx); // ✅ Use proper ID generation
    await trx("tms_address").insert({
      address_id: addressId,
      user_reference_id: warehouseId,
      user_type: "WH",
      // address_type: address.addressType,
      address_type_id: "AT001", // Default address type
      country: address.country,
      state: address.state,
      city: address.city,
      district: address.district || null,
      street_1: address.street1,
      street_2: address.street2 || null,
      postal_code: address.postalCode || null,
      vat_number: address.vatNumber,
      is_primary: address.isPrimary !== false,
      status: "ACTIVE",
      created_by: userId,
      created_at: currentTimestamp, // ✅ Use currentTimestamp instead of knex.fn.now()
    });

    console.log("✅ Address inserted");

    // Insert documents if provided
    if (documents && documents.length > 0) {
      const generatedDocumentIds = new Set(); // Track generated IDs in this batch

      for (const doc of documents) {
        if (doc.documentType && doc.documentNumber) {
          // Generate document ID for warehouse_documents table
          const documentId = await generateDocumentId(
            trx,
            generatedDocumentIds
          );
          // Use documentId directly as document_unique_id (max 10 chars: WDOC0001)
          const documentUniqueId = documentId;

          // Insert warehouse document metadata
          await trx("warehouse_documents").insert({
            document_unique_id: documentUniqueId,
            warehouse_id: warehouseId,
            document_id: documentId,
            document_type_id: doc.documentType, // This is the documentTypeId from frontend
            document_number: doc.documentNumber,
            valid_from: formatDateForMySQL(doc.validFrom),
            valid_to: formatDateForMySQL(doc.validTo),
            active: doc.status !== false,
            created_by: userId,
            created_at: currentTimestamp, // ✅ Use currentTimestamp instead of knex.fn.now()
            status: "ACTIVE",
          });

          // If file is uploaded, save to document_upload table
          if (doc.fileData) {
            const docUploadId = await generateDocumentUploadId(trx);

            await trx("document_upload").insert({
              document_id: docUploadId,
              file_name: doc.fileName,
              file_type: doc.fileType,
              file_xstring_value: doc.fileData, // base64 encoded file data
              system_reference_id: documentUniqueId,
              is_verified: false,
              valid_from: formatDateForMySQL(doc.validFrom),
              valid_to: formatDateForMySQL(doc.validTo),
              created_by: userId,
              updated_by: userId,
              created_at: currentTimestamp, // ✅ Use currentTimestamp instead of knex.fn.now()
              updated_at: currentTimestamp, // ✅ Use currentTimestamp instead of knex.fn.now()
            });
          }
        }
      }
      console.log(`✅ ${documents.length} documents inserted`);
    }

    // Insert sub-locations (geofencing) if provided
    if (subLocations && subLocations.length > 0) {
      for (let i = 0; i < subLocations.length; i++) {
        const subLoc = subLocations[i];
        if (subLoc.subLocationType && subLoc.coordinates?.length > 0) {
          const subLocationHdrId = await generateSubLocationHeaderId(trx);

          // Insert header
          await trx("warehouse_sub_location_header").insert({
            sub_location_hdr_id: subLocationHdrId,
            warehouse_unique_id: warehouseId,
            consignor_id: consignorId,
            sub_location_id: subLoc.subLocationType,
            description: subLoc.description || null,
            status: "ACTIVE",
            created_by: userId,
            created_at: currentTimestamp, // ✅ Use currentTimestamp instead of knex.fn.now()
          });

          // Insert coordinates
          for (let j = 0; j < subLoc.coordinates.length; j++) {
            const coord = subLoc.coordinates[j];
            await trx("warehouse_sub_location_item").insert({
              geo_fence_item_id: `${subLocationHdrId}_${j + 1}`,
              sub_location_hdr_id: subLocationHdrId,
              latitude: coord.latitude,
              longitude: coord.longitude,
              sequence: j + 1,
              status: "ACTIVE",
              created_by: userId,
              created_at: currentTimestamp, // ✅ Use currentTimestamp instead of knex.fn.now()
            });
          }
        }
      }
      console.log(
        `✅ ${subLocations.length} sub-locations with geofencing inserted`
      );
    }

    // ========================================
    // PHASE 5: CREATE WAREHOUSE MANAGER USER & APPROVAL WORKFLOW
    // ========================================

    console.log("📝 Creating Warehouse Manager user for approval workflow...");

    // ✅ FIXED: Derive user ID from warehouse ID (WH001 -> CW0001)
    // This ensures consistent lookup in getWarehouseById (matching transporter pattern)
    const warehouseNumber = warehouseId.substring(2); // Remove 'WH' prefix
    const warehouseManagerUserId = `CW${warehouseNumber.padStart(4, "0")}`;
    console.log(
      `  Generated user ID: ${warehouseManagerUserId} (derived from ${warehouseId})`
    );

    // Get creator details from request (current logged-in Product Owner)
    const creatorUserId = req.user?.user_id || "SYSTEM";
    const creatorName = req.user?.user_full_name || "System";

    // Generate initial password (warehouseName@123)
    const warehouseNameClean = generalDetails.warehouseName.replace(
      /[^a-zA-Z0-9]/g,
      ""
    );
    const initialPassword = `${warehouseNameClean}@123`;
    const hashedPassword = await bcrypt.hash(initialPassword, 10);

    // Generate user email
    const userEmail = `${warehouseId.toLowerCase()}@warehouse.com`;
    const userMobile = address?.mobileNumber || "0000000000";

    // Create user in user_master with PENDING status
    await trx("user_master").insert({
      user_id: warehouseManagerUserId,
      user_type_id: "UT007", // Consignor WH Manager
      user_full_name: `${generalDetails.warehouseName} - Manager`,
      email_id: userEmail,
      mobile_number: userMobile,
      from_date: generalDetails.fromDate || currentTimestamp,
      to_date: generalDetails.toDate || null,
      is_active: false, // Inactive until approved
      consignor_id: consignorId, // Link to consignor
      created_by_user_id: creatorUserId,
      password: hashedPassword,
      password_type: "initial",
      status: "PENDING", // VARCHAR(20) limit - use short status
      created_by: creatorUserId,
      updated_by: creatorUserId,
      created_at: currentTimestamp,
      updated_at: currentTimestamp,
      created_on: currentTimestamp,
      updated_on: currentTimestamp,
    });

    console.log(
      `  ✅ Created user: ${warehouseManagerUserId} (PENDING approval)`
    );

    // Get approval configuration for Warehouse Manager (Level 1 only)
    const approvalConfig = await trx("approval_configuration")
      .where({
        approval_type_id: "AT005", // Warehouse Manager
        approver_level: 1,
        status: "ACTIVE",
      })
      .first();

    if (!approvalConfig) {
      throw new Error("Approval configuration not found for Consignor Admin");
    }

    // Determine pending approver (Product Owner who did NOT create this)
    // If PO001 created, pending with PO002; if PO002 created, pending with PO001
    let pendingWithUserId = null;
    let pendingWithName = null;

    if (creatorUserId === "PO001") {
      const po2 = await trx("user_master").where("user_id", "PO002").first();
      pendingWithUserId = "PO002";
      pendingWithName = po2?.user_full_name || "Product Owner 2";
    } else if (creatorUserId === "PO002") {
      const po1 = await trx("user_master").where("user_id", "PO001").first();
      pendingWithUserId = "PO001";
      pendingWithName = po1?.user_full_name || "Product Owner 1";
    } else {
      // If creator is neither PO1 nor PO2, default to PO001
      const po1 = await trx("user_master").where("user_id", "PO001").first();
      pendingWithUserId = "PO001";
      pendingWithName = po1?.user_full_name || "Product Owner 1";
    }

    // Generate approval flow trans ID
    const approvalFlowId = await generateApprovalFlowId(trx);

    // Create approval flow transaction entry
    await trx("approval_flow_trans").insert({
      approval_flow_trans_id: approvalFlowId,
      approval_config_id: approvalConfig.approval_config_id,
      approval_type_id: "AT005", // Warehouse Manager
      user_id_reference_id: warehouseId, // 🔥 FIX: Store actual warehouse entity ID instead of manager user ID
      s_status: "PENDING",
      approver_level: 1,
      pending_with_role_id: "RL001", // Product Owner role
      pending_with_user_id: pendingWithUserId,
      pending_with_name: pendingWithName,
      created_by_user_id: creatorUserId,
      created_by_name: creatorName,
      created_by: creatorUserId,
      updated_by: creatorUserId,
      created_at: currentTimestamp,
      updated_at: currentTimestamp,
      created_on: currentTimestamp,
      updated_on: currentTimestamp,
      status: "ACTIVE",
    });

    console.log(`  ✅ Created approval workflow: ${approvalFlowId}`);
    console.log(`  📧 Pending with: ${pendingWithName} (${pendingWithUserId})`);
    console.log(
      `  🔑 Initial Password: ${initialPassword} (MUST BE SHARED SECURELY)`
    );

    // Commit transaction
    await trx.commit();
    console.log("✅ Transaction committed successfully");

    // Fetch the created warehouse with all related data including type names
    const createdWarehouse = await knex("warehouse_basic_information as w")
      .leftJoin("tms_address as addr", function () {
        this.on("w.warehouse_id", "=", "addr.user_reference_id").andOn(
          "addr.user_type",
          "=",
          knex.raw("'WH'")
        );
      })
      .leftJoin(
        "warehouse_type_master as wtm",
        "w.warehouse_type",
        "wtm.warehouse_type_id"
      )
      .leftJoin(
        "material_types_master as mtm",
        "w.material_type_id",
        "mtm.material_types_id"
      )
      .leftJoin(
        "address_type_master as atm",
        "addr.address_type_id",
        "atm.address_type_id"
      )
      .select(
        "w.*",
        "addr.country",
        "addr.state",
        "addr.city",
        "addr.street_1",
        "addr.postal_code",
        "wtm.warehouse_type as warehouse_type_name",
        "mtm.material_types as material_type_name",
        "atm.address as address_type_name"
      )
      .where("w.warehouse_id", warehouseId)
      .first();

    res.status(201).json({
      success: true,
      message:
        "Warehouse created successfully. Warehouse Manager user created and pending approval.",
      data: {
        warehouse: createdWarehouse,
        userId: warehouseManagerUserId,
        userEmail: userEmail,
        initialPassword: initialPassword,
        approvalStatus: "PENDING",
        pendingWith: pendingWithName,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Rollback transaction on error
    if (trx) await trx.rollback();

    console.error("❌ Error creating warehouse:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create warehouse",
      error: error.message,
    });
  }
};

// Helper: Generate sub-location header ID
const generateSubLocationHeaderId = async (trx = knex) => {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const result = await trx("warehouse_sub_location_header")
      .count("* as count")
      .first();
    const count = parseInt(result.count) + 1 + attempts;
    const newId = `WSLH${count.toString().padStart(4, "0")}`;

    const existing = await trx("warehouse_sub_location_header")
      .where("sub_location_hdr_id", newId)
      .first();
    if (!existing) {
      return newId;
    }

    attempts++;
  }

  throw new Error(
    "Failed to generate unique sub-location header ID after 100 attempts"
  );
};

// @desc    Update warehouse
// @route   PUT /api/warehouse/:id
// @access  Private (Consignor, Admin, Super Admin)
const updateWarehouse = async (req, res) => {
  let trx;
  try {
    const { id } = req.params;
    const userId = req.user?.user_id || "SYSTEM";
    const userRole = req.user?.role;

    console.log(`📦 Updating warehouse: ${id}`);
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    // Validate request body
    const validation = validateWarehouseUpdate(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    // Check if warehouse exists
    const existingWarehouse = await knex("warehouse_basic_information")
      .where("warehouse_id", id)
      .first();

    if (!existingWarehouse) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found",
      });
    }

    // ✅ PERMISSION CHECKS - Rejection/Resubmission Workflow
    const currentStatus = existingWarehouse.status;
    const createdBy = existingWarehouse.created_by;

    // INACTIVE entities: Only creator can edit
    if (currentStatus === "INACTIVE" && createdBy !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the creator can edit rejected entities",
      });
    }

    // PENDING entities: No one can edit (locked during approval)
    if (currentStatus === "PENDING") {
      return res.status(403).json({
        success: false,
        message: "Cannot edit entity during approval process",
      });
    }

    // ACTIVE entities: Only approvers can edit
    if (currentStatus === "ACTIVE") {
      const isApprover = userRole === "product_owner" || userRole === "admin";
      if (!isApprover) {
        return res.status(403).json({
          success: false,
          message: "Only approvers can edit active entities",
        });
      }
    }

    console.log("✅ Warehouse found, starting update transaction");

    const {
      warehouse_name1,
      warehouse_name2,
      warehouse_type,
      material_type_id,
      language,
      vehicle_capacity,
      speed_limit,
      virtual_yard_in,
      radius_virtual_yard_in,
      weigh_bridge,
      geo_fencing,
      gate_pass,
      fuel_filling,
      staging_area,
      driver_waiting_area,
      gate_in_checklist_auth,
      gate_out_checklist_auth,
      consignor_id,
      address,
      documents,
      geofencing,
    } = req.body;

    // const userId = req.user.user_id || "SYSTEM";

    // Start transaction
    trx = await knex.transaction();

    // ✅ RESUBMISSION DETECTION - Check if status is changing from INACTIVE to PENDING
    const isResubmission =
      currentStatus === "INACTIVE" && req.body.status === "PENDING";

    if (isResubmission) {
      console.log(`🔄 Resubmission detected for warehouse ${id}`);

      // ✅ FIXED: Derive user ID from warehouse ID (WH056 → CW0056)
      const warehouseNumber = id.substring(2); // Remove 'WH' prefix
      const warehouseManagerUserId = `CW${warehouseNumber.padStart(4, "0")}`;

      console.log(
        `  Looking for warehouse manager user: ${warehouseManagerUserId}`
      );

      // Primary lookup by derived ID
      let warehouseUser = await trx("user_master")
        .where("user_id", warehouseManagerUserId)
        .first();

      // Fallback to name matching for backward compatibility
      if (!warehouseUser) {
        console.log(`  Fallback: Searching by name and consignor`);
        warehouseUser = await trx("user_master")
          .where("user_type_id", "UT007") // Consignor WH Manager
          .where("consignor_id", existingWarehouse.consignor_id)
          .where("user_full_name", existingWarehouse.warehouse_name1)
          .first();
      }

      if (warehouseUser) {
        const warehouseManagerUserId = warehouseUser.user_id;
        console.log(
          `  ✅ Found warehouse manager user: ${warehouseManagerUserId}`
        );

        // Find existing approval flow record
        const approvalFlow = await trx("approval_flow_trans")
          .where("user_id_reference_id", id) // 🔥 FIX: Use warehouse entity ID instead of manager user ID
          .where("approval_type_id", "AT005") // Warehouse Manager
          .orderBy("created_at", "desc")
          .first();

        if (approvalFlow) {
          // Determine pending approver (opposite Product Owner)
          const creatorUserId = existingWarehouse.created_by;
          let pendingWithUserId = null;
          let pendingWithName = null;

          if (creatorUserId === "PO001") {
            const po2 = await trx("user_master")
              .where("user_id", "PO002")
              .first();
            pendingWithUserId = "PO002";
            pendingWithName = po2?.user_full_name || "Product Owner 2";
          } else if (creatorUserId === "PO002") {
            const po1 = await trx("user_master")
              .where("user_id", "PO001")
              .first();
            pendingWithUserId = "PO001";
            pendingWithName = po1?.user_full_name || "Product Owner 1";
          } else {
            // Default to PO001
            const po1 = await trx("user_master")
              .where("user_id", "PO001")
              .first();
            pendingWithUserId = "PO001";
            pendingWithName = po1?.user_full_name || "Product Owner 1";
          }

          // Update approval flow to restart from Level 1
          await trx("approval_flow_trans")
            .where(
              "approval_flow_trans_id",
              approvalFlow.approval_flow_trans_id
            )
            .update({
              s_status: "PENDING",
              approver_level: 1,
              pending_with_user_id: pendingWithUserId,
              pending_with_name: pendingWithName,
              actioned_by_id: null,
              actioned_by_name: null,
              approved_on: null,
              // Keep remarks from rejection for history
              updated_at: knex.fn.now(),
            });

          console.log(
            `  ✅ Approval flow restarted: ${approvalFlow.approval_flow_trans_id}`
          );
          console.log(
            `  ✅ Pending with: ${pendingWithName} (${pendingWithUserId})`
          );
        }

        // Update user status to PENDING (matching user_master status values)
        await trx("user_master")
          .where("user_id", warehouseManagerUserId)
          .update({
            status: "PENDING", // ✅ FIXED: Use "PENDING" not "Pending for Approval"
            is_active: false,
            updated_at: knex.fn.now(),
          });

        console.log(
          `  ✅ User status updated to PENDING: ${warehouseManagerUserId}`
        );
      } else {
        console.warn(
          `  ⚠️ No warehouse manager user found for resubmission of ${id}`
        );
      }
    }

    // Update warehouse basic information
    await trx("warehouse_basic_information")
      .where("warehouse_id", id)
      .update({
        warehouse_name1:
          warehouse_name1?.trim() || existingWarehouse.warehouse_name1,
        warehouse_name2:
          warehouse_name2?.trim() || existingWarehouse.warehouse_name2,
        warehouse_type: warehouse_type || existingWarehouse.warehouse_type,
        material_type_id:
          material_type_id || existingWarehouse.material_type_id,
        language: language || existingWarehouse.language,
        vehicle_capacity:
          vehicle_capacity !== undefined
            ? vehicle_capacity
            : existingWarehouse.vehicle_capacity,
        speed_limit:
          speed_limit !== undefined
            ? speed_limit
            : existingWarehouse.speed_limit,
        virtual_yard_in:
          virtual_yard_in !== undefined
            ? virtual_yard_in
            : existingWarehouse.virtual_yard_in,
        radius_for_virtual_yard_in:
          radius_virtual_yard_in !== undefined
            ? radius_virtual_yard_in
            : existingWarehouse.radius_for_virtual_yard_in,
        weigh_bridge_availability:
          weigh_bridge !== undefined
            ? weigh_bridge
            : existingWarehouse.weigh_bridge_availability,
        gatepass_system_available:
          gate_pass !== undefined
            ? gate_pass
            : existingWarehouse.gatepass_system_available,
        fuel_availability:
          fuel_filling !== undefined
            ? fuel_filling
            : existingWarehouse.fuel_availability,
        staging_area_for_goods_organization:
          staging_area !== undefined
            ? staging_area
            : existingWarehouse.staging_area_for_goods_organization,
        driver_waiting_area:
          driver_waiting_area !== undefined
            ? driver_waiting_area
            : existingWarehouse.driver_waiting_area,
        gate_in_checklist_auth:
          gate_in_checklist_auth !== undefined
            ? gate_in_checklist_auth
            : existingWarehouse.gate_in_checklist_auth,
        gate_out_checklist_auth:
          gate_out_checklist_auth !== undefined
            ? gate_out_checklist_auth
            : existingWarehouse.gate_out_checklist_auth,
        consignor_id: consignor_id || existingWarehouse.consignor_id,
        // ✅ CRITICAL FIX: Update status if resubmission
        status: isResubmission ? "PENDING" : existingWarehouse.status,
        updated_by: userId,
        updated_at: knex.fn.now(),
      });

    console.log("✅ Warehouse basic information updated");
    if (isResubmission) {
      console.log("  ✅ Status updated from INACTIVE to PENDING");
    }

    // Update address if provided
    if (address && Object.keys(address).length > 0) {
      // Validate GST/VAT number format if provided
      if (address.vat_number) {
        const normalizedVat = address.vat_number.trim().toUpperCase();

        // Indian GST format: 15 characters
        const gstRegex =
          /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;

        // International VAT format: 2 letter country code + 8-15 alphanumeric
        const vatRegex = /^[A-Z]{2}[A-Z0-9]{8,15}$/;

        if (!gstRegex.test(normalizedVat) && !vatRegex.test(normalizedVat)) {
          await trx.rollback();
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message:
                "Invalid GST/VAT format. Indian GST must be 15 characters (e.g., 27AAPFU0939F1ZV). International VAT: Country code + 8-15 alphanumeric characters",
              field: "vatNumber",
              expectedFormats: [
                "Indian GST: 27AAPFU0939F1ZV (15 characters)",
                "International VAT: GB123456789 (2 letter country code + 8-15 chars)",
              ],
            },
          });
        }

        // Normalize VAT number to uppercase
        address.vat_number = normalizedVat;
      }

      const existingAddress = await trx("tms_address")
        .where("user_reference_id", id)
        .where("user_type", "WH")
        .where("status", "ACTIVE")
        .first();

      if (existingAddress) {
        // Update existing address
        await trx("tms_address")
          .where("address_id", existingAddress.address_id)
          .update({
            address_type_id:
              address.address_type_id || existingAddress.address_type_id,
            country: address.country || existingAddress.country,
            state: address.state || existingAddress.state,
            city: address.city || existingAddress.city,
            district: address.district || existingAddress.district,
            street_1: address.street_1 || existingAddress.street_1,
            street_2: address.street_2 || existingAddress.street_2,
            postal_code: address.postal_code || existingAddress.postal_code,
            vat_number: address.vat_number || existingAddress.vat_number,
            updated_by: userId,
            updated_at: knex.fn.now(),
          });
        console.log("✅ Address updated");
      } else {
        // Create new address if it doesn't exist with generated address_id
        const addressId = await generateAddressId(trx); // ✅ Use proper ID generation
        await trx("tms_address").insert({
          address_id: addressId,
          user_reference_id: id,
          user_type: "WH",
          address_type_id: address.address_type_id || "AT001",
          country: address.country,
          state: address.state,
          city: address.city,
          district: address.district || null,
          street_1: address.street_1,
          street_2: address.street_2 || null,
          postal_code: address.postal_code || null,
          vat_number: address.vat_number,
          is_primary: true,
          status: "ACTIVE",
          created_by: userId,
          created_at: knex.fn.now(),
        });
        console.log("✅ New address created");
      }
    }

    // Update documents if provided
    if (documents && Array.isArray(documents) && documents.length > 0) {
      // Get existing documents
      const existingDocuments = await trx("warehouse_documents")
        .where("warehouse_id", id)
        .where("status", "ACTIVE");

      const existingDocIds = new Set(
        existingDocuments.map((doc) => doc.document_unique_id)
      );

      // Get the incoming document IDs from UI
      const incomingDocIds = new Set(
        documents
          .filter((doc) => doc.documentUniqueId)
          .map((doc) => doc.documentUniqueId)
      );

      // Find DB documents that the user removed (not in incoming list)
      const removedDocuments = existingDocuments.filter(
        (dbDoc) => !incomingDocIds.has(dbDoc.document_unique_id)
      );

      for (const removed of removedDocuments) {
        await trx("warehouse_documents")
          .where("document_unique_id", removed.document_unique_id)
          .update({
            status: "INACTIVE",
            updated_by: userId,
            updated_at: knex.fn.now(),
          });

        console.log(
          `🗑️ Document ${removed.document_unique_id} set to INACTIVE`
        );
      }

      const generatedDocumentIds = new Set();

      for (const doc of documents) {
        if (doc.documentType && doc.documentNumber) {
          // Check if this is an update (has documentUniqueId) or new document
          if (
            doc.documentUniqueId &&
            existingDocIds.has(doc.documentUniqueId)
          ) {
            // Update existing document
            await trx("warehouse_documents")
              .where("document_unique_id", doc.documentUniqueId)
              .update({
                document_type_id: doc.documentType,
                document_number: doc.documentNumber,
                valid_from: formatDateForMySQL(doc.validFrom),
                valid_to: formatDateForMySQL(doc.validTo),
                active: doc.status !== undefined ? doc.status : true,
                updated_by: userId,
                updated_at: knex.fn.now(),
              });

            // Update file in document_upload if new file data provided
            if (doc.fileData && doc.fileName) {
              const existingDoc = existingDocuments.find(
                (d) => d.document_unique_id === doc.documentUniqueId
              );
              if (existingDoc && existingDoc.document_id) {
                // Check if document upload record exists
                const existingUpload = await trx("document_upload")
                  .where("system_reference_id", doc.documentUniqueId)
                  .first();

                if (existingUpload) {
                  // Update existing document upload
                  await trx("document_upload")
                    .where("system_reference_id", doc.documentUniqueId)
                    .update({
                      file_name: doc.fileName,
                      file_type: doc.fileType || "application/pdf",
                      file_xstring_value: doc.fileData,
                      updated_by: userId,
                      updated_at: knex.fn.now(),
                    });
                  console.log(
                    `  ✅ Document upload updated for ${doc.documentUniqueId}`
                  );
                } else {
                  // Insert new document upload record
                  const uploadId = await generateDocumentUploadId(trx);
                  await trx("document_upload").insert({
                    document_id: uploadId,
                    system_reference_id: doc.documentUniqueId, // ✅ CRITICAL: Link to document
                    file_name: doc.fileName,
                    file_type: doc.fileType || "application/pdf",
                    file_xstring_value: doc.fileData,
                    status: "ACTIVE",
                    created_by: userId,
                    created_at: knex.fn.now(),
                  });
                  console.log(
                    `  ✅ Document upload created for ${doc.documentUniqueId}`
                  );
                }
              }
            }
            console.log(`✅ Document ${doc.documentUniqueId} updated`);
          } else {
            // Insert new document
            const documentId = await generateDocumentId(
              trx,
              generatedDocumentIds
            );
            const documentUniqueId = documentId;
            generatedDocumentIds.add(documentId); // Track generated IDs

            await trx("warehouse_documents").insert({
              document_unique_id: documentUniqueId,
              warehouse_id: id,
              document_type_id: doc.documentType,
              document_number: doc.documentNumber,
              valid_from: formatDateForMySQL(doc.validFrom),
              valid_to: formatDateForMySQL(doc.validTo),
              active: doc.status !== undefined ? doc.status : true,
              document_id: documentId,
              status: "ACTIVE",
              created_by: userId,
              created_at: knex.fn.now(),
            });

            // Insert document file if provided
            if (doc.fileData && doc.fileName) {
              const uploadId = await generateDocumentUploadId(trx);
              await trx("document_upload").insert({
                document_id: uploadId, // Unique upload ID
                system_reference_id: documentUniqueId, // ✅ CRITICAL FIX: Link to warehouse document
                file_name: doc.fileName,
                file_type: doc.fileType || "application/pdf",
                file_xstring_value: doc.fileData,
                status: "ACTIVE",
                created_by: userId,
                created_at: knex.fn.now(),
                updated_by: userId,
                updated_at: knex.fn.now(),
              });
            }
            console.log(`✅ New document ${documentUniqueId} created`);
          }
        }
      }
    }

    // Update geofencing/sub-locations if provided
    if (geofencing && Array.isArray(geofencing) && geofencing.length > 0) {
      // Get existing sub-locations
      const existingSubLocations = await trx("warehouse_sub_location_header")
        .where("warehouse_unique_id", id)
        .where("status", "ACTIVE");

      const existingSubLocationIds = new Set(
        existingSubLocations.map((sl) => sl.sub_location_hdr_id)
      );

      for (const subLocation of geofencing) {
        if (subLocation.subLocationId) {
          // Check if this is an update or new sub-location
          if (
            subLocation.subLocationHdrId &&
            existingSubLocationIds.has(subLocation.subLocationHdrId)
          ) {
            // Update existing sub-location header
            await trx("warehouse_sub_location_header")
              .where("sub_location_hdr_id", subLocation.subLocationHdrId)
              .update({
                sub_location_id: subLocation.subLocationId,
                description: subLocation.description || "",
                updated_by: userId,
                updated_at: knex.fn.now(),
              });

            // Delete existing coordinates for this sub-location
            await trx("warehouse_sub_location_item")
              .where("sub_location_hdr_id", subLocation.subLocationHdrId)
              .del();

            // Insert updated coordinates
            if (
              subLocation.coordinates &&
              Array.isArray(subLocation.coordinates) &&
              subLocation.coordinates.length > 0
            ) {
              for (let i = 0; i < subLocation.coordinates.length; i++) {
                const coord = subLocation.coordinates[i];
                await trx("warehouse_sub_location_item").insert({
                  sub_location_hdr_id: subLocation.subLocationHdrId,
                  latitude: coord.latitude,
                  longitude: coord.longitude,
                  sequence: i + 1,
                  created_by: userId,
                  created_at: knex.fn.now(),
                });
              }
            }
            console.log(
              `✅ Sub-location ${subLocation.subLocationHdrId} updated`
            );
          } else {
            // Insert new sub-location
            const subLocationHdrId = await generateSubLocationHeaderId(trx);

            await trx("warehouse_sub_location_header").insert({
              sub_location_hdr_id: subLocationHdrId,
              warehouse_unique_id: id,
              sub_location_id: subLocation.subLocationId,
              description: subLocation.description || "",
              status: "ACTIVE",
              created_by: userId,
              created_at: knex.fn.now(),
            });

            // Insert coordinates
            if (
              subLocation.coordinates &&
              Array.isArray(subLocation.coordinates) &&
              subLocation.coordinates.length > 0
            ) {
              for (let i = 0; i < subLocation.coordinates.length; i++) {
                const coord = subLocation.coordinates[i];
                await trx("warehouse_sub_location_item").insert({
                  sub_location_hdr_id: subLocationHdrId,
                  latitude: coord.latitude,
                  longitude: coord.longitude,
                  sequence: i + 1,
                  created_by: userId,
                  created_at: knex.fn.now(),
                });
              }
            }
            console.log(`✅ New sub-location ${subLocationHdrId} created`);
          }
        }
      }

      // ✅ UPDATE geo_fencing flag after modifying geofencing data
      const hasGeoFencingAfterUpdate = await trx(
        "warehouse_sub_location_header"
      )
        .where("warehouse_unique_id", id)
        .where("status", "ACTIVE")
        .count("* as count")
        .first();

      await trx("warehouse_basic_information")
        .where("warehouse_id", id)
        .update({
          geo_fencing: hasGeoFencingAfterUpdate.count > 0,
          updated_by: userId,
          updated_at: knex.fn.now(),
        });

      console.log(
        `✅ Geo-fencing flag updated: ${hasGeoFencingAfterUpdate.count > 0}`
      );
    }

    // Commit transaction
    await trx.commit();
    console.log("✅ Transaction committed successfully");

    // Fetch updated warehouse data
    const updatedWarehouse = await knex("warehouse_basic_information as w")
      .leftJoin(
        "warehouse_type_master as wtm",
        "w.warehouse_type",
        "wtm.warehouse_type_id"
      )
      .leftJoin(
        "material_types_master as mtm",
        "w.material_type_id",
        "mtm.material_types_id"
      )
      .select(
        "w.*",
        "wtm.warehouse_type as warehouse_type_name",
        "mtm.material_types as material_type_name"
      )
      .where("w.warehouse_id", id)
      .first();

    res.json({
      success: true,
      message: "Warehouse updated successfully",
      warehouse: updatedWarehouse,
    });
  } catch (error) {
    // Rollback transaction on error
    if (trx) {
      await trx.rollback();
      console.log("❌ Transaction rolled back");
    }

    console.error("❌ Error updating warehouse:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update warehouse",
      error: error.message,
    });
  }
};

// @desc    Get master data (warehouse types, material types, address types, sub-location types)
// @route   GET /api/warehouse/master-data
// @access  Private (Consignor, Admin, Super Admin)
const getMasterData = async (req, res) => {
  try {
    console.log("📦 Fetching warehouse master data");

    // Fetch warehouse types
    const warehouseTypes = await knex("warehouse_type_master")
      .select("warehouse_type_id", "warehouse_type")
      .where("status", "ACTIVE")
      .orderBy("warehouse_type");

    // Fetch material types
    const materialTypes = await knex("material_types_master")
      .select("material_types_id", "material_types")
      .where("status", "ACTIVE")
      .orderBy("material_types");

    // Fetch address types
    const addressTypes = await knex("address_type_master")
      .select("address_type_id", "address")
      .where("status", "ACTIVE")
      .orderBy("address");

    // Fetch sub-location types
    const subLocationTypes = await knex("warehouse_sub_location_master")
      .select("sub_location_id", "warehouse_sub_location_description")
      .where("status", "ACTIVE")
      .orderBy("warehouse_sub_location_description");

    // Get document types
    const documentTypes = await knex("document_type_master")
      .select("document_type_id as value", "document_type as label")
      .where("status", "ACTIVE")
      .orderBy("document_type");

    // Get document names
    const documentNames = await knex("document_name_master")
      .select("doc_name_master_id as value", "document_name as label")
      .where("status", "ACTIVE")
      .orderBy("document_name");

    // Fetch consignors (for super admin dropdown)
    const consignors = await knex("consignor_basic_information")
      .select(
        "customer_id as value",
        "customer_name as label",
        "customer_id",
        "customer_name"
      )
      .where("status", "ACTIVE")
      .orderBy("customer_name");

    console.log(
      `✅ Found ${warehouseTypes.length} warehouse types, ${materialTypes.length} material types, ${addressTypes.length} address types, ${subLocationTypes.length} sub-location types, ${documentTypes.length} document types, ${documentNames.length} document names, ${consignors.length} consignors`
    );

    res.json({
      success: true,
      warehouseTypes,
      materialTypes,
      addressTypes,
      subLocationTypes,
      documentTypes,
      documentNames,
      consignors,
    });
  } catch (error) {
    console.error("❌ Error fetching master data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch master data",
      error: error.message,
    });
  }
};

// @desc    Get document file by document unique ID
// @route   GET /api/warehouse/document/:documentId
// @access  Private (Consignor, Admin, Super Admin)
const getDocumentFile = async (req, res) => {
  try {
    const { documentId } = req.params;

    console.log(`🔍 Fetching warehouse document file for ID: ${documentId}`);

    // Fetch document details with file data
    const document = await knex("warehouse_documents as wd")
      .leftJoin(
        "document_upload as du",
        "wd.document_unique_id",
        "du.system_reference_id"
      )
      .leftJoin(
        "document_name_master as dnm",
        "wd.document_type_id",
        "dnm.doc_name_master_id"
      )
      .where("wd.document_unique_id", documentId)
      .where("wd.status", "ACTIVE")
      .select(
        "wd.document_type_id",
        "dnm.document_name as documentTypeName",
        "wd.document_number",
        "wd.valid_from",
        "wd.valid_to",
        "wd.active",
        "du.file_name",
        "du.file_type",
        "du.file_xstring_value as fileData"
      )
      .first();

    if (!document) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Document not found",
        },
        timestamp: new Date().toISOString(),
      });
    }

    const response = {
      documentType: document.documentTypeName || document.document_type_id,
      documentNumber: document.document_number,
      fileName: document.file_name,
      fileType: document.file_type,
      fileData: document.fileData, // Include base64 file data
    };

    res.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error fetching warehouse document file:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "FETCH_ERROR",
        message: "Failed to fetch document file",
        details: error.message,
      },
      timestamp: new Date().toISOString(),
    });
  }
};

// ==================== DRAFT WORKFLOW FUNCTIONS ====================

/**
 * POST /api/warehouse/save-draft
 * Save warehouse as draft with minimal validation (warehouse_name + consignor_id only)
 * Status: DRAFT
 */
const saveWarehouseAsDraft = async (req, res) => {
  try {
    console.log("\n💾 ===== SAVE WAREHOUSE AS DRAFT =====");
    console.log("User ID:", req.user.user_id);
    console.log("User consignor_id:", req.user.consignor_id);
    console.log("Payload:", JSON.stringify(req.body, null, 2));

    // Extract warehouse data from request body
    const { generalDetails } = req.body;

    // ✅ Get consignorId - prioritize from request body (for super admin), fallback to logged-in user
    // Super admin can select any consignor, regular consignor uses their own ID
    const consignorId =
      generalDetails?.consignorId || req.user.consignor_id || "SYSTEM";
    const userId = req.user.user_id;

    console.log(
      "✅ Using consignor ID:",
      consignorId,
      "(from request body or user token)"
    );

    const warehouse_name =
      generalDetails?.warehouseName || req.body.warehouse_name;

    // ✅ MINIMAL VALIDATION - only warehouse_name required for draft
    if (!warehouse_name || warehouse_name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Warehouse name is required (minimum 2 characters)",
          field: "warehouse_name",
        },
      });
    }

    const result = await knex.transaction(async (trx) => {
      const warehouseId = await generateWarehouseId(trx);

      console.log(`  🆔 Generated warehouse ID: ${warehouseId}`);
      console.log(`  🏢 Consignor ID: ${consignorId}`);
      console.log(`  👤 Created by: ${userId}`);

      // Insert warehouse basic information with status SAVE_AS_DRAFT (matching transporter pattern)
      await trx("warehouse_basic_information").insert({
        warehouse_id: warehouseId,
        consignor_id: consignorId,
        warehouse_name1: generalDetails.warehouseName.trim(),
        warehouse_name2: generalDetails.warehouseName2?.trim() || null,
        warehouse_type:
          generalDetails?.warehouseType || req.body.warehouse_type || null,
        material_type_id:
          generalDetails.materialType || req.body.material_type_id,
        vehicle_capacity:
          generalDetails?.vehicleCapacity || req.body.vehicle_capacity || null,
        radius_for_virtual_yard_in:
          generalDetails.radiusVirtualYardIn ||
          req.body.radiusVirtualYardIn ||
          0,
        speed_limit: generalDetails?.speedLimit || req.body.speed_limit || null,
        weigh_bridge_availability: generalDetails?.weighBridge || false,
        gatepass_system_available: generalDetails?.gatepassSystem || false,
        virtual_yard_in: generalDetails?.virtualYardIn || false,
        fuel_availability: generalDetails?.fuelAvailability || false,
        staging_area_for_goods_organization:
          generalDetails?.stagingArea || false,
        driver_waiting_area: generalDetails?.driverWaitingArea || false,
        gate_in_checklist_auth: generalDetails?.gateInChecklistAuth || false,
        gate_out_checklist_auth: generalDetails?.gateOutChecklistAuth || false,
        status: "SAVE_AS_DRAFT", // ✅ Use SAVE_AS_DRAFT to match transporter pattern
        created_by: userId,
        created_at: new Date(),
        updated_by: userId,
        updated_at: new Date(),
      });

      console.log(`  ✅ Warehouse basic information saved`);

      // ========================================
      // SAVE ADDRESS DATA (if provided)
      // ========================================
      if (req.body.address && Object.keys(req.body.address).length > 0) {
        const addressData = req.body.address;
        console.log(`  📍 Saving address data...`);

        // Generate address ID
        const addressId = await generateAddressId(trx);

        await trx("tms_address").insert({
          address_id: addressId,
          user_reference_id: warehouseId,
          user_type: "WH", // Warehouse address type
          address_type_id: addressData.addressType || "AT001", // Default to primary
          country: addressData.country || null,
          state: addressData.state || null,
          city: addressData.city || null,
          district: addressData.district || null,
          street_1: addressData.street1 || null,
          street_2: addressData.street2 || null,
          postal_code: addressData.postalCode || null,
          vat_number: addressData.vatNumber || null,
          tin_pan: addressData.tinPan || null,
          tan: addressData.tan || null,
          is_primary:
            addressData.isPrimary !== undefined ? addressData.isPrimary : true,
          status: "ACTIVE",
          created_by: userId,
          created_at: new Date(),
          updated_by: userId,
          updated_at: new Date(),
        });

        console.log(`    ✅ Address saved: ${addressId}`);
      }

      // ========================================
      // SAVE DOCUMENTS DATA (if provided)
      // ========================================
      if (
        req.body.documents &&
        Array.isArray(req.body.documents) &&
        req.body.documents.length > 0
      ) {
        console.log(`  📄 Saving ${req.body.documents.length} documents...`);

        for (const doc of req.body.documents) {
          // Generate document unique ID
          const documentUniqueId = await generateDocumentId(trx);

          await trx("warehouse_documents").insert({
            document_unique_id: documentUniqueId,
            warehouse_id: warehouseId,
            document_type_id: doc.documentType || null,
            document_number: doc.documentNumber || null,
            valid_from: doc.validFrom || null,
            valid_to: doc.validTo || null,
            active: doc.status !== undefined ? doc.status : true,
            status: "ACTIVE",
            created_by: userId,
            created_at: new Date(),
            updated_by: userId,
            updated_at: new Date(),
          });

          // ✅ FIX: If file is uploaded, save to document_upload table (matching createWarehouse pattern)
          if (doc.fileData && doc.fileName) {
            const docUploadId = await generateDocumentUploadId(trx);

            await trx("document_upload").insert({
              document_id: docUploadId,
              file_name: doc.fileName,
              file_type: doc.fileType || "application/pdf",
              file_xstring_value: doc.fileData, // base64 encoded file data
              system_reference_id: documentUniqueId,
              is_verified: false,
              valid_from: doc.validFrom || null,
              valid_to: doc.validTo || null,
              created_by: userId,
              updated_by: userId,
              created_at: new Date(),
              updated_at: new Date(),
            });

            console.log(`    ✅ Document file uploaded: ${doc.fileName}`);
          }

          console.log(`    ✅ Document saved: ${documentUniqueId}`);
        }
      }

      // ========================================
      // SAVE SUB-LOCATIONS/GEOFENCING DATA (if provided)
      // ========================================
      if (
        req.body.subLocations &&
        Array.isArray(req.body.subLocations) &&
        req.body.subLocations.length > 0
      ) {
        console.log(
          `  🗺️ Saving ${req.body.subLocations.length} sub-locations...`
        );

        for (const subLoc of req.body.subLocations) {
          // Generate sub-location header ID
          const subLocationHdrId = await generateSubLocationId(trx);

          await trx("warehouse_sub_location_header").insert({
            sub_location_hdr_id: subLocationHdrId,
            warehouse_unique_id: warehouseId,
            sub_location_id: subLoc.subLocationId || null,
            description: subLoc.description || null,
            status: "ACTIVE",
            created_by: userId,
            created_at: new Date(),
            updated_by: userId,
            updated_at: new Date(),
          });

          // Save coordinates if provided
          if (
            subLoc.coordinates &&
            Array.isArray(subLoc.coordinates) &&
            subLoc.coordinates.length > 0
          ) {
            for (const coord of subLoc.coordinates) {
              const geoFenceItemId = await generateGeoFenceItemId(trx);

              await trx("warehouse_sub_location_item").insert({
                geo_fence_item_id: geoFenceItemId,
                sub_location_hdr_id: subLocationHdrId,
                latitude: coord.latitude || null,
                longitude: coord.longitude || null,
                sequence: coord.sequence || 0,
                status: "ACTIVE",
                created_by: userId,
                created_at: new Date(),
                updated_by: userId,
                updated_at: new Date(),
              });
            }
          }

          console.log(`    ✅ Sub-location saved: ${subLocationHdrId}`);
        }
      }

      return { warehouseId };
    });

    console.log("✅ Warehouse draft saved successfully");
    return res.status(201).json({
      success: true,
      data: { warehouseId: result.warehouseId, status: "SAVE_AS_DRAFT" },
      message: "Warehouse saved as draft successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Save warehouse draft error:", error);
    return res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error.message || "Failed to save warehouse as draft",
      },
    });
  }
};

/**
 * PUT /api/warehouse/:id/update-draft
 * Update warehouse draft with NO validation
 * Only allows updating drafts created by current user
 */
const updateWarehouseDraft = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`\n✏️  ===== UPDATE WAREHOUSE DRAFT: ${id} =====`);
    console.log("User ID:", req.user.user_id);

    const result = await knex.transaction(async (trx) => {
      // Check if warehouse exists and is a draft
      const existing = await trx("warehouse_basic_information")
        .where({ warehouse_id: id })
        .first();

      if (!existing) {
        return res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Warehouse not found",
          },
        });
      }

      // ✅ Check for SAVE_AS_DRAFT status (matching transporter pattern)
      if (existing.status !== "SAVE_AS_DRAFT") {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_STATUS",
            message:
              "Can only update drafts. Current status: " + existing.status,
          },
        });
      }

      // Verify creator ownership
      if (existing.created_by !== req.user.user_id) {
        return res.status(403).json({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "You can only update your own drafts",
          },
        });
      }

      // Extract data from nested structure if present
      const { generalDetails } = req.body;

      // Update warehouse basic information (NO VALIDATION)
      await trx("warehouse_basic_information")
        .where({ warehouse_id: id })
        .update({
          warehouse_name1:
            generalDetails?.warehouseName ||
            req.body.warehouse_name1 ||
            existing.warehouse_name1,
          warehouse_name2:
            generalDetails?.warehouseName2 ||
            req.body.warehouse_name2 ||
            existing.warehouse_name2,
          warehouse_type:
            generalDetails?.warehouseType ||
            req.body.warehouse_type !== undefined
              ? req.body.warehouse_type
              : existing.warehouse_type,
          material_type_id:
            generalDetails?.materialType ||
            req.body.material_type_id !== undefined
              ? req.body.material_type_id
              : existing.material_type_id,
          vehicle_capacity:
            generalDetails?.vehicleCapacity ||
            req.body.vehicle_capacity !== undefined
              ? req.body.vehicle_capacity
              : existing.vehicle_capacity,
          radius_for_virtual_yard_in:
            generalDetails?.radiusVirtualYardIn ||
            req.body.radius_for_virtual_yard_in !== undefined
              ? req.body.radius_for_virtual_yard_in
              : existing.radius_for_virtual_yard_in,
          speed_limit:
            generalDetails?.speedLimit || req.body.speed_limit !== undefined
              ? req.body.speed_limit
              : existing.speed_limit,
          weigh_bridge_availability:
            generalDetails?.weighBridge !== undefined
              ? generalDetails.weighBridge
              : existing.weigh_bridge_availability,
          gatepass_system_available:
            generalDetails?.gatepassSystem !== undefined
              ? generalDetails.gatepassSystem
              : existing.gatepass_system_available,
          virtual_yard_in:
            generalDetails?.virtualYardIn !== undefined
              ? generalDetails.virtualYardIn
              : existing.virtual_yard_in,
          fuel_availability:
            generalDetails?.fuelAvailability !== undefined
              ? generalDetails.fuelAvailability
              : existing.fuel_availability,
          staging_area_for_goods_organization:
            generalDetails?.stagingArea !== undefined
              ? generalDetails.stagingArea
              : existing.staging_area_for_goods_organization,
          driver_waiting_area:
            generalDetails?.driverWaitingArea !== undefined
              ? generalDetails.driverWaitingArea
              : existing.driver_waiting_area,
          gate_in_checklist_auth:
            generalDetails?.gateInChecklistAuth !== undefined
              ? generalDetails.gateInChecklistAuth
              : existing.gate_in_checklist_auth,
          gate_out_checklist_auth:
            generalDetails?.gateOutChecklistAuth !== undefined
              ? generalDetails.gateOutChecklistAuth
              : existing.gate_out_checklist_auth,
          updated_by: req.user.user_id,
          updated_at: new Date(),
        });

      // Update address if provided (delete & re-insert)
      if (req.body.address && Object.keys(req.body.address).length > 0) {
        // Delete existing address
        await trx("tms_address")
          .where({
            user_reference_id: id,
            user_type: "WH",
          })
          .del();

        // Insert new address with generated address_id
        const addressData = req.body.address;
        const addressId = await generateAddressId(trx); // ✅ Generate unique address ID

        await trx("tms_address").insert({
          address_id: addressId, // ✅ Add generated address_id
          user_reference_id: id,
          user_type: "WH",
          address_type_id: addressData.address_type_id || null,
          country: addressData.country || null,
          state: addressData.state || null,
          city: addressData.city || null,
          district: addressData.district || null,
          street_1: addressData.street_1 || null,
          street_2: addressData.street_2 || null,
          postal_code: addressData.postal_code || null,
          vat_number: addressData.vat_number || null,
          tin_pan: addressData.tin_pan || null,
          tan: addressData.tan || null,
          created_by: req.user.user_id,
          created_at: new Date(),
          updated_by: req.user.user_id,
          updated_at: new Date(),
        });
      }

      // Update documents if provided (delete & re-insert)
      if (req.body.documents && Array.isArray(req.body.documents)) {
        // ✅ FIX: Get document_unique_id to properly delete uploads
        const existingDocs = await trx("warehouse_documents")
          .where({ warehouse_id: id })
          .select("document_unique_id");

        const documentUniqueIds = existingDocs
          .map((doc) => doc.document_unique_id)
          .filter(Boolean);

        // Delete from document_upload table using system_reference_id (FK to warehouse_documents)
        if (documentUniqueIds.length > 0) {
          await trx("document_upload")
            .whereIn("system_reference_id", documentUniqueIds)
            .del();
          console.log(
            `  🗑️ Deleted ${documentUniqueIds.length} old document uploads`
          );
        }

        // Delete from warehouse_documents
        await trx("warehouse_documents").where({ warehouse_id: id }).del();
        console.log(`  🗑️ Deleted old warehouse documents`);

        // Insert new documents
        const generatedDocIds = new Set();
        for (const doc of req.body.documents) {
          if (!doc.documentType) continue; // Skip empty documents

          // Generate unique document ID
          const documentId = await generateDocumentId(trx, generatedDocIds);
          generatedDocIds.add(documentId);

          // Insert warehouse document metadata
          await trx("warehouse_documents").insert({
            document_unique_id: documentId, // ✅ Primary key
            warehouse_id: id,
            document_id: documentId, // ✅ Document identifier
            document_type_id: doc.documentType,
            document_number: doc.documentNumber || null,
            valid_from: doc.validFrom
              ? formatDateForMySQL(doc.validFrom)
              : null,
            valid_to: doc.validTo ? formatDateForMySQL(doc.validTo) : null,
            active: doc.status !== false, // ✅ Fixed: Use 'active' column instead of 'status'
            created_by: req.user.user_id,
            created_at: new Date(),
            updated_by: req.user.user_id,
            updated_at: new Date(),
            status: "ACTIVE", // ✅ Status field
          });

          // Handle file upload if present
          if (doc.fileData && doc.fileName) {
            const docUploadId = await generateDocumentUploadId(trx);

            await trx("document_upload").insert({
              document_id: docUploadId,
              file_name: doc.fileName,
              file_type: doc.fileType || "application/pdf",
              file_xstring_value: doc.fileData, // ✅ FIXED: Use file_xstring_value (not file_data)
              system_reference_id: documentId, // ✅ FIXED: Link to document_unique_id
              is_verified: false,
              valid_from: doc.validFrom
                ? formatDateForMySQL(doc.validFrom)
                : null,
              valid_to: doc.validTo ? formatDateForMySQL(doc.validTo) : null,
              created_by: req.user.user_id,
              updated_by: req.user.user_id,
              created_at: new Date(),
              updated_at: new Date(),
            });
          }
        }
      }

      // ✅ NOTE: Facilities and geofencing tables don't exist yet in database schema
      // These features will be implemented when the tables are created
      // Skipping facilities update (warehouse_facilities table doesn't exist)
      // Skipping geofencing update (warehouse_geofence_coordinates table doesn't exist)

      return { warehouseId: id };
    });

    // Handle early returns from transaction
    if (result.success === false) {
      return result;
    }

    console.log("✅ Warehouse draft updated successfully");
    return res.status(200).json({
      success: true,
      data: { warehouseId: result.warehouseId, status: "SAVE_AS_DRAFT" },
      message: "Warehouse draft updated successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Update warehouse draft error:", error);
    return res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error.message || "Failed to update warehouse draft",
      },
    });
  }
};

/**
 * PUT /api/warehouse/:id/submit-draft
 * Submit warehouse draft for approval (SAVE_AS_DRAFT → PENDING)
 * - Creates warehouse manager user in user_master
 * - Creates approval flow transaction
 * - Changes status to PENDING
 * - Performs FULL validation (same as createWarehouse)
 */
const submitWarehouseFromDraft = async (req, res) => {
  let trx;
  try {
    const { id } = req.params;
    console.log(`\n🚀 ===== SUBMIT WAREHOUSE DRAFT: ${id} =====`);
    console.log("User ID:", req.user.user_id);
    console.log("Payload:", JSON.stringify(req.body, null, 2));

    // Check if warehouse exists and is a draft
    const existing = await knex("warehouse_basic_information")
      .where({ warehouse_id: id })
      .first();

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Warehouse not found",
        },
      });
    }

    // ✅ Check for SAVE_AS_DRAFT status (matching transporter pattern)
    if (existing.status !== "SAVE_AS_DRAFT") {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_STATUS",
          message: "Can only submit drafts. Current status: " + existing.status,
        },
      });
    }

    // Verify creator ownership
    if (existing.created_by !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You can only submit your own drafts",
        },
      });
    }

    // ✅ FULL VALIDATION (same as createWarehouse)
    const validation = validateWarehouseCreate(req.body);
    if (!validation.isValid) {
      console.log("❌ Validation failed:", validation.errors);
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: validation.errors,
        },
      });
    }

    // Extract data from request body
    const {
      warehouse_name1,
      warehouse_name2,
      warehouse_type,
      material_type_id,
      language,
      vehicle_capacity,
      speed_limit,
      virtual_yard_in,
      radius_for_virtual_yard_in,
      weigh_bridge_availability,
      fuel_availability,
      staging_area_for_goods_organization,
      driver_waiting_area,
      gate_in_checklist_auth,
      gate_out_checklist_auth,
      gatepass_system_available,
      consignor_id,
      address,
      documents,
      geofencing,
    } = req.body;

    const userId = req.user.user_id;
    const currentTimestamp = new Date();

    // ========================================
    // DOCUMENT VALIDATION (matching createWarehouse)
    // ========================================
    if (documents && documents.length > 0) {
      for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];

        // Validate document type
        if (!doc.documentType) {
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Document type is required",
              field: `documents[${i}].documentType`,
            },
          });
        }

        // Validate document number
        if (!doc.documentNumber) {
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Document number is required",
              field: `documents[${i}].documentNumber`,
            },
          });
        }

        // Fetch document type name for validation
        const docTypeInfo = await knex("document_name_master")
          .where("doc_name_master_id", doc.documentType)
          .first();

        if (docTypeInfo) {
          // Validate document number format based on document type
          const validation = validateDocumentNumber(
            doc.documentNumber,
            docTypeInfo.document_name
          );

          if (!validation.isValid) {
            return res.status(400).json({
              success: false,
              error: {
                code: "VALIDATION_ERROR",
                message: validation.message,
                field: `documents[${i}].documentNumber`,
                expectedFormat: validation.format,
              },
            });
          }

          // Clean and normalize document number after validation
          doc.documentNumber = doc.documentNumber.trim().toUpperCase();
        }

        // Validate valid from date
        if (!doc.validFrom) {
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Valid from date is required",
              field: `documents[${i}].validFrom`,
            },
          });
        }

        // Validate valid from date is not in future
        const validFromDate = new Date(doc.validFrom);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (validFromDate > today) {
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Valid from date cannot be in the future",
              field: `documents[${i}].validFrom`,
            },
          });
        }

        // Validate valid to date
        if (!doc.validTo) {
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Valid to date is required",
              field: `documents[${i}].validTo`,
            },
          });
        }

        // Validate date range (validTo must be after validFrom)
        const validToDate = new Date(doc.validTo);
        if (validToDate <= validFromDate) {
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Valid to date must be after valid from date",
              field: `documents[${i}].validTo`,
            },
          });
        }
      }
    }

    console.log(
      "✅ Validation passed (including documents), starting transaction"
    );

    trx = await knex.transaction();

    // ========================================
    // STEP 1: Update warehouse basic information with complete data
    // ========================================
    await trx("warehouse_basic_information")
      .where({ warehouse_id: id })
      .update({
        warehouse_name1: warehouse_name1?.trim(),
        warehouse_name2: warehouse_name2?.trim() || null,
        warehouse_type: warehouse_type,
        material_type_id: material_type_id,
        language: language || "EN",
        vehicle_capacity: vehicle_capacity || 0,
        virtual_yard_in: virtual_yard_in || false,
        radius_for_virtual_yard_in: radius_for_virtual_yard_in || 0,
        speed_limit: speed_limit || 20,
        weigh_bridge_availability: weigh_bridge_availability || false,
        gatepass_system_available: gatepass_system_available || false,
        fuel_availability: fuel_availability || false,
        staging_area_for_goods_organization:
          staging_area_for_goods_organization || false,
        driver_waiting_area: driver_waiting_area || false,
        gate_in_checklist_auth: gate_in_checklist_auth || false,
        gate_out_checklist_auth: gate_out_checklist_auth || false,
        status: "PENDING", // ✅ Change to PENDING
        updated_by: userId,
        updated_at: currentTimestamp,
      });

    console.log(`  ✅ Updated warehouse basic information to PENDING`);

    // ========================================
    // STEP 2: Delete and re-insert address
    // ========================================

    // Validate GST/VAT number format if address is provided
    if (address && address.vat_number) {
      const normalizedVat = address.vat_number.trim().toUpperCase();

      // Indian GST format: 15 characters
      const gstRegex =
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;

      // International VAT format: 2 letter country code + 8-15 alphanumeric
      const vatRegex = /^[A-Z]{2}[A-Z0-9]{8,15}$/;

      if (!gstRegex.test(normalizedVat) && !vatRegex.test(normalizedVat)) {
        await trx.rollback();
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message:
              "Invalid GST/VAT format. Indian GST must be 15 characters (e.g., 27AAPFU0939F1ZV). International VAT: Country code + 8-15 alphanumeric characters",
            field: "vatNumber",
            expectedFormats: [
              "Indian GST: 27AAPFU0939F1ZV (15 characters)",
              "International VAT: GB123456789 (2 letter country code + 8-15 chars)",
            ],
          },
        });
      }

      // Normalize VAT number to uppercase
      address.vat_number = normalizedVat;
    }

    await trx("tms_address")
      .where({ user_reference_id: id, user_type: "WH" })
      .del();

    if (address) {
      const addressId = await generateAddressId(trx);
      await trx("tms_address").insert({
        address_id: addressId,
        user_reference_id: id,
        user_type: "WH",
        address_type_id: address.address_type_id || "AT001",
        country: address.country,
        state: address.state,
        city: address.city,
        district: address.district || null,
        street_1: address.street_1 || null,
        street_2: address.street_2 || null,
        postal_code: address.postal_code || null,
        vat_number: address.vat_number || null,
        is_primary: true,
        status: "ACTIVE",
        created_by: userId,
        created_at: currentTimestamp,
        updated_by: userId,
        updated_at: currentTimestamp,
      });

      console.log(`  ✅ Address updated`);
    }

    // ========================================
    // STEP 3: Delete and re-insert documents
    // ========================================

    // ✅ FIX: Get document_unique_id (not document_id) to properly delete uploads
    const existingDocUniqueIds = await trx("warehouse_documents")
      .where({ warehouse_id: id })
      .pluck("document_unique_id");

    // Delete document uploads using system_reference_id (the FK to warehouse_documents)
    if (existingDocUniqueIds.length > 0) {
      await trx("document_upload")
        .whereIn("system_reference_id", existingDocUniqueIds)
        .del();
      console.log(
        `  🗑️ Deleted ${existingDocUniqueIds.length} old document uploads`
      );
    }

    // Delete warehouse documents
    await trx("warehouse_documents").where({ warehouse_id: id }).del();
    console.log(`  🗑️ Deleted old warehouse documents`);

    if (documents && documents.length > 0) {
      const generatedDocIds = new Set();
      for (const doc of documents) {
        const documentId = await generateDocumentId(trx, generatedDocIds);
        generatedDocIds.add(documentId);
        const documentUniqueId = documentId; // Use documentId directly as document_unique_id

        // ✅ Insert matching createWarehouse pattern - NO country or reference_number
        await trx("warehouse_documents").insert({
          document_unique_id: documentUniqueId,
          warehouse_id: id,
          document_id: documentId,
          document_type_id: doc.documentType,
          document_number: doc.documentNumber?.trim().toUpperCase(),
          valid_from: formatDateForMySQL(doc.validFrom),
          valid_to: formatDateForMySQL(doc.validTo),
          active: doc.status !== false,
          status: "ACTIVE",
          created_by: userId,
          created_at: currentTimestamp,
          updated_by: userId,
          updated_at: currentTimestamp,
        });

        // Handle file upload if provided
        if (doc.fileData) {
          const uploadId = await generateDocumentUploadId(trx);
          await trx("document_upload").insert({
            document_id: uploadId,
            file_xstring_value: doc.fileData,
            file_name: doc.fileName || "document",
            file_type: doc.fileType || "application/pdf",
            system_reference_id: documentUniqueId, // ✅ Use document_unique_id
            status: "ACTIVE",
            created_by: userId,
            created_at: currentTimestamp,
            updated_by: userId,
            updated_at: currentTimestamp,
          });
        }
      }

      console.log(`  ✅ Documents updated (${documents.length} documents)`);
    }

    // ========================================
    // STEP 4: Create Warehouse Manager User (like transporter pattern)
    // ========================================

    // ✅ FIXED: Derive user ID from warehouse ID (WH054 -> CW0054)
    // This ensures consistent lookup in getWarehouseById
    const warehouseNumber = id.substring(2); // Remove 'WH' prefix
    const warehouseManagerUserId = `CW${warehouseNumber.padStart(4, "0")}`;
    console.log(
      `  Generated user ID: ${warehouseManagerUserId} (derived from ${id})`
    );

    // Get creator information
    const creator = await trx("user_master").where("user_id", userId).first();
    const creatorName = creator?.user_full_name || "System";
    const creatorUserId = userId;

    // Get address email for user (if available from warehouse address table)
    const warehouseAddress = await trx("tms_address")
      .where({ user_reference_id: id, user_type: "WH" })
      .first();

    const userEmail = warehouseAddress
      ? `${id.toLowerCase()}@warehouse.com`
      : `${warehouseManagerUserId.toLowerCase()}@warehouse.com`;

    // Generate initial random password
    const generatePassword = () => {
      const chars =
        "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
      let password = "";
      for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
    };

    const initialPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(initialPassword, 10);

    // Insert Consignor Warehouse Manager user
    await trx("user_master").insert({
      user_id: warehouseManagerUserId,
      user_type_id: "UT007", // Consignor WH Manager (fixed to match getWarehouseById and createWarehouse)
      consignor_id: consignor_id,
      user_full_name: warehouse_name1,
      email_id: userEmail,
      mobile_number: "0000000000", // Placeholder
      from_date: currentTimestamp,
      to_date: null,
      password: hashedPassword,
      password_type: "initial",
      status: "PENDING", // User also pending approval
      is_active: false, // Inactive until approved
      created_by: creatorUserId,
      updated_by: creatorUserId,
      created_by_user_id: creatorUserId,
      created_at: currentTimestamp,
      updated_at: currentTimestamp,
      created_on: currentTimestamp,
      updated_on: currentTimestamp,
    });

    console.log(
      `  ✅ Created Warehouse Manager user: ${warehouseManagerUserId}`
    );
    console.log(`  📧 Email: ${userEmail}`);
    console.log(`  🔑 Initial Password: ${initialPassword}`);

    // ========================================
    // STEP 5: Create Approval Flow Transaction
    // ========================================

    // Get approval configuration for Warehouse Manager
    const approvalConfig = await trx("approval_configuration")
      .where({
        approval_type_id: "AT005", // Warehouse Manager
        approver_level: 1,
        status: "ACTIVE",
      })
      .first();

    if (!approvalConfig) {
      throw new Error("Approval configuration not found for Warehouse Manager");
    }

    // Determine pending approver (Product Owner who did NOT create this)
    let pendingWithUserId = null;
    let pendingWithName = null;

    if (creatorUserId === "PO001") {
      const po2 = await trx("user_master").where("user_id", "PO002").first();
      pendingWithUserId = "PO002";
      pendingWithName = po2?.user_full_name || "Product Owner 2";
    } else if (creatorUserId === "PO002") {
      const po1 = await trx("user_master").where("user_id", "PO001").first();
      pendingWithUserId = "PO001";
      pendingWithName = po1?.user_full_name || "Product Owner 1";
    } else {
      // If creator is neither PO1 nor PO2, default to PO001
      const po1 = await trx("user_master").where("user_id", "PO001").first();
      pendingWithUserId = "PO001";
      pendingWithName = po1?.user_full_name || "Product Owner 1";
    }

    // Generate approval flow trans ID
    const approvalFlowId = await generateApprovalFlowId(trx);

    // Create approval flow transaction entry
    await trx("approval_flow_trans").insert({
      approval_flow_trans_id: approvalFlowId,
      approval_config_id: approvalConfig.approval_config_id,
      approval_type_id: "AT005", // Warehouse Manager
      user_id_reference_id: id, // 🔥 FIX: Store actual warehouse entity ID instead of manager user ID
      s_status: "PENDING",
      approver_level: 1,
      pending_with_role_id: "RL001", // Product Owner role
      pending_with_user_id: pendingWithUserId,
      pending_with_name: pendingWithName,
      created_by_user_id: creatorUserId,
      created_by_name: creatorName,
      created_by: creatorUserId,
      updated_by: creatorUserId,
      created_at: currentTimestamp,
      updated_at: currentTimestamp,
      created_on: currentTimestamp,
      updated_on: currentTimestamp,
      status: "ACTIVE",
    });

    console.log(`  ✅ Created approval workflow: ${approvalFlowId}`);
    console.log(`  📧 Pending with: ${pendingWithName} (${pendingWithUserId})`);

    // Commit transaction
    await trx.commit();
    console.log("✅ Warehouse draft submitted for approval successfully");

    return res.status(200).json({
      success: true,
      data: {
        warehouseId: id,
        status: "PENDING",
        userId: warehouseManagerUserId,
        userEmail: userEmail,
        initialPassword: initialPassword,
        approvalStatus: "PENDING",
        pendingWith: pendingWithName,
      },
      message:
        "Warehouse submitted for approval successfully. Warehouse Manager user created and pending approval.",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (trx) await trx.rollback();
    console.error("❌ Submit warehouse draft error:", error);
    return res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error.message || "Failed to submit warehouse for approval",
      },
    });
  }
};

/**
 * DELETE /api/warehouse/:id/delete-draft
 * Hard delete warehouse draft (permanent removal)
 * Only allows deleting drafts created by current user
 */
const deleteWarehouseDraft = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`\n🗑️  ===== DELETE WAREHOUSE DRAFT: ${id} =====`);
    console.log("User ID:", req.user.user_id);

    const result = await knex.transaction(async (trx) => {
      // Check if warehouse exists and is a draft
      const existing = await trx("warehouse_basic_information")
        .where({ warehouse_id: id })
        .first();

      if (!existing) {
        return res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Warehouse not found",
          },
        });
      }

      // ✅ Check for SAVE_AS_DRAFT status (matching transporter pattern)
      if (existing.status !== "SAVE_AS_DRAFT") {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_STATUS",
            message:
              "Can only delete drafts. Current status: " + existing.status,
          },
        });
      }

      // Verify creator ownership
      if (existing.created_by !== req.user.user_id) {
        return res.status(403).json({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "You can only delete your own drafts",
          },
        });
      }

      // Hard delete cascade (order matters: children first, parent last)

      // ✅ Skip non-existent tables (geofence_coordinates, facilities)
      // 1. Delete geofence coordinates - SKIPPED (table doesn't exist)
      // 2. Delete facilities - SKIPPED (table doesn't exist)

      // 3. Delete sub-locations (if table exists)
      // Note: warehouse_sub_locations table may not exist, handle gracefully
      try {
        await trx("warehouse_sub_locations").where({ warehouse_id: id }).del();
      } catch (err) {
        console.log("  ⚠️ Sub-locations table doesn't exist, skipping");
      }

      // 4. Delete document uploads (using correct column name)
      const documentIds = await trx("warehouse_documents")
        .where({ warehouse_id: id })
        .pluck("document_id"); // ✅ Fixed: Use document_id instead of document_upload_file_id

      if (documentIds.length > 0) {
        await trx("document_upload")
          .whereIn("document_id", documentIds) // ✅ Fixed: Use document_id
          .del();
      }

      // 5. Delete warehouse documents
      await trx("warehouse_documents").where({ warehouse_id: id }).del();

      // 6. Delete address (using correct column name)
      await trx("tms_address")
        .where({
          user_reference_id: id, // ✅ Fixed: Use user_reference_id instead of system_reference_id
          user_type: "WH", // ✅ Fixed: Use user_type instead of system_reference_table
        })
        .del();

      // 7. Finally, delete the main warehouse record
      await trx("warehouse_basic_information")
        .where({ warehouse_id: id })
        .del();

      return { warehouseId: id };
    });

    // Handle early returns from transaction
    if (result.success === false) {
      return result;
    }

    console.log("✅ Warehouse draft deleted successfully");
    return res.status(200).json({
      success: true,
      message: "Warehouse draft deleted successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Delete warehouse draft error:", error);
    return res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error.message || "Failed to delete warehouse draft",
      },
    });
  }
};

module.exports = {
  getWarehouseList,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  getMasterData,
  getDocumentFile,
  // Draft workflow functions
  saveWarehouseAsDraft,
  updateWarehouseDraft,
  submitWarehouseFromDraft,
  deleteWarehouseDraft,
};
