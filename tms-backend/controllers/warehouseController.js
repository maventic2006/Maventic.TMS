const knex = require("../config/database");
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
const generateDocumentUploadId = async () => {
  const result = await knex("document_upload").count("* as count").first();
  const count = parseInt(result.count) + 1;
  return `DU${count.toString().padStart(4, "0")}`;
};

// @desc    Get warehouse list with filters and pagination
// @route   GET /api/warehouse
// @access  Private (Consignor, Admin, Super Admin)
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

    // Extract query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const offset = (page - 1) * limit;

    // Filter by consignor ID only if user has consignor_id (not for product_owner/admin)
    const consignorId = req.user.consignor_id || null;

    // Build query with address join for city/state/country
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
      .select(
        "w.warehouse_id",
        "w.consignor_id",
        "w.warehouse_type",
        "wtm.warehouse_type as warehouse_type_name",
        "w.material_type_id",
        "mtm.material_types as material_type_name",
        "w.warehouse_name1",
        knex.raw("0 as geo_fencing"), // Field doesn't exist in table, default to 0
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
        "w.created_at",
        knex.raw("'N/A' as approver"), // Field doesn't exist in table, default to N/A
        knex.raw("NULL as approved_on"), // Field doesn't exist in table, default to NULL
        "w.status"
      );

    // Filter by consignor ID (user's own warehouses)
    if (consignorId) {
      query = query.where("w.consignor_id", consignorId);
    }

    // Apply filters
    if (req.query.warehouseId) {
      query = query.where(
        "w.warehouse_id",
        "like",
        `%${req.query.warehouseId}%`
      );
    }
    if (req.query.warehouseName) {
      query = query.where(
        "w.warehouse_name1",
        "like",
        `%${req.query.warehouseName}%`
      );
    }
    if (req.query.status) {
      query = query.where("w.status", req.query.status);
    }
    if (req.query.weighBridge !== undefined) {
      query = query.where(
        "w.weigh_bridge_availability",
        req.query.weighBridge === "true"
      );
    }
    if (req.query.virtualYardIn !== undefined) {
      query = query.where(
        "w.virtual_yard_in",
        req.query.virtualYardIn === "true"
      );
    }
    if (req.query.fuelAvailability !== undefined) {
      query = query.where(
        "w.fuel_availability",
        req.query.fuelAvailability === "true"
      );
    }

    // Get total count (create separate query for counting)
    const countResult = await knex("warehouse_basic_information as w")
      .count("* as count")
      .where((builder) => {
        // Apply same filters as main query
        if (consignorId) {
          builder.where("w.consignor_id", consignorId);
        }
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
      })
      .first();

    const total = parseInt(countResult.count);

    // Get paginated results
    const warehouses = await query
      .orderBy("w.warehouse_id", "asc")
      .limit(limit)
      .offset(offset);

    console.log(`✅ Found ${warehouses.length} warehouses`);

    res.json({
      success: true,
      warehouses,
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

    // Fetch documents with LEFT JOIN to document_upload and document_name_master
    const documents = await knex("warehouse_documents as wd")
      .leftJoin("document_upload as du", "wd.document_id", "du.document_id")
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

    res.json({
      success: true,
      warehouse: {
        ...warehouse,
        address: address || null,
        documents: mappedDocuments,
        subLocations: subLocations,
      },
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

    if (
      !address.vatNumber ||
      !/^[A-Z0-9]{8,20}$/.test(address.vatNumber.trim().toUpperCase())
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "VAT number must be 8-20 alphanumeric characters",
          field: "vatNumber",
        },
      });
    }

    // Normalize VAT number to uppercase
    address.vatNumber = address.vatNumber.trim().toUpperCase();

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

    // Validate TAN if provided (optional, but must match TAN format if entered)
    if (address.tan && address.tan.trim() !== "") {
      const tanRegex = /^[A-Z]{4}\d{5}[A-Z]$/;
      if (!tanRegex.test(address.tan.trim().toUpperCase())) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message:
              "TAN must match format: 4 letters + 5 digits + 1 letter (e.g., ASDF12345N)",
            field: "tan",
            expectedFormat: "ASDF12345N",
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

    // Get consignor ID from logged-in user
    const consignorId = req.user.consignor_id || "SYSTEM";
    const userId = req.user.user_id || "SYSTEM";

    console.log("✅ Validation passed, starting database transaction");

    // ========================================
    // PHASE 2: DATABASE OPERATIONS
    // ========================================

    trx = await knex.transaction();

    // Generate unique warehouse ID
    const warehouseId = await generateWarehouseId(trx);
    console.log("✅ Generated warehouse ID:", warehouseId);

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
      status: "ACTIVE",
      created_by: userId,
      created_at: knex.fn.now(),
    });

    console.log("✅ Warehouse basic information inserted");

    // Insert address
    const addressId = `ADDR${Date.now().toString().slice(-6)}`;
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
      tin_pan: address.tinPan || null,
      tan: address.tan || null,
      is_primary: address.isPrimary !== false,
      status: "ACTIVE",
      created_by: userId,
      created_at: knex.fn.now(),
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
            valid_from: doc.validFrom || null,
            valid_to: doc.validTo || null,
            active: doc.status !== false,
            created_by: userId,
            created_at: knex.fn.now(),
            status: "ACTIVE",
          });

          // If file is uploaded, save to document_upload table
          if (doc.fileData) {
            const docUploadId = await generateDocumentUploadId();

            await trx("document_upload").insert({
              document_id: docUploadId,
              file_name: doc.fileName,
              file_type: doc.fileType,
              file_xstring_value: doc.fileData, // base64 encoded file data
              system_reference_id: documentUniqueId,
              is_verified: false,
              valid_from: doc.validFrom,
              valid_to: doc.validTo,
              created_by: userId,
              updated_by: userId,
              created_at: knex.fn.now(),
              updated_at: knex.fn.now(),
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
            created_at: knex.fn.now(),
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
              created_at: knex.fn.now(),
            });
          }
        }
      }
      console.log(
        `✅ ${subLocations.length} sub-locations with geofencing inserted`
      );
    }

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
      message: "Warehouse created successfully",
      warehouse: createdWarehouse,
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
  try {
    const { id } = req.params;
    console.log(`📦 Updating warehouse: ${id}`);

    // Validate request body
    const validation = validateWarehouseUpdate(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    // TODO: Implement warehouse update logic
    res.status(501).json({
      success: false,
      message: "Warehouse update not yet implemented",
    });
  } catch (error) {
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

    console.log(
      `✅ Found ${warehouseTypes.length} warehouse types, ${materialTypes.length} material types, ${addressTypes.length} address types, ${subLocationTypes.length} sub-location types, ${documentTypes.length} document types, ${documentNames.length} document names`
    );

    res.json({
      success: true,
      warehouseTypes,
      materialTypes,
      addressTypes,
      subLocationTypes,
      documentTypes,
      documentNames,
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

module.exports = {
  getWarehouseList,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  getMasterData,
  getDocumentFile,
};
