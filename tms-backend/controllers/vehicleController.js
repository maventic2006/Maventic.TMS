const db = require("../config/database");
const axios = require("axios");

/**
 * Vehicle Controller
 * Handles all CRUD operations for vehicle maintenance
 * Implements industry-standard patterns with comprehensive validation
 * @module vehicleController
 */

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert ISO datetime string to MySQL-compatible datetime format
 * Handles ISO strings with timezone (e.g., '2026-01-15T18:30:00.000Z')
 * Returns MySQL DATETIME format: 'YYYY-MM-DD HH:mm:ss'
 */
const formatDateTimeForMySQL = (isoDateString) => {
  if (!isoDateString || isoDateString === "") return null;

  try {
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) {
      console.warn(
        `[Vehicle Controller] Invalid datetime string: ${isoDateString}`
      );
      return null;
    }

    // Convert to MySQL datetime format (YYYY-MM-DD HH:mm:ss)
    // Use UTC to maintain consistency with input timezone
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    const seconds = String(date.getUTCSeconds()).padStart(2, "0");

    const result = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    console.log(
      `[Vehicle Controller] Date converted: ${isoDateString} → ${result}`
    );
    return result;
  } catch (error) {
    console.warn(
      `[Vehicle Controller] Error formatting datetime ${isoDateString}:`,
      error.message
    );
    return null;
  }
};

/**
 * Convert ISO date string to MySQL date format (YYYY-MM-DD)
 * Handles both date-only and datetime strings
 */
const formatDateForMySQL = (isoDateString) => {
  if (!isoDateString || isoDateString === "") return null;

  try {
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) {
      console.warn(
        `[Vehicle Controller] Invalid date string: ${isoDateString}`
      );
      return null;
    }

    // Convert to MySQL date format (YYYY-MM-DD)
    // Use UTC to maintain consistency
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");

    const result = `${year}-${month}-${day}`;
    console.log(
      `[Vehicle Controller] Date converted: ${isoDateString} → ${result}`
    );
    return result;
  } catch (error) {
    console.warn(
      `[Vehicle Controller] Error formatting date ${isoDateString}:`,
      error.message
    );
    return null;
  }
};

/**
 * Generate unique vehicle ID
 * Format: VEH0001, VEH0002, etc.
 */
const generateVehicleId = async () => {
  try {
    const result = await db("vehicle_basic_information_hdr")
      .max("vehicle_id_code_hdr as max_id")
      .first();

    if (!result.max_id) {
      return "VEH0001";
    }

    const numPart = parseInt(result.max_id.substring(3)) + 1;
    return "VEH" + numPart.toString().padStart(4, "0");
  } catch (error) {
    console.error("Error generating vehicle ID:", error);
    throw new Error("Failed to generate vehicle ID");
  }
};

/**
 * Generate unique ownership ID
 * Format: OWN0001, OWN0002, etc.
 */
// const generateOwnershipId = async () => {
//   try {
//     const result = await db('vehicle_ownership_details')
//       .max('vehicle_ownership_id as max_id')
//       .first();

//     if (!result.max_id) {
//       return 'OWN0001';
//     }

//     const numPart = parseInt(result.max_id.substring(3)) + 1;
//     return 'OWN' + numPart.toString().padStart(4, '0');
//   } catch (error) {
//     console.error('Error generating ownership ID:', error);
//     throw new Error('Failed to generate ownership ID');
//   }
// };

const generateOwnershipId = async () => {
  try {
    // Get all existing IDs and find the highest numeric part
    const result = await db("vehicle_ownership_details")
      .select("vehicle_ownership_id")
      .where("vehicle_ownership_id", "like", "OWN%")
      .orderBy("vehicle_ownership_id");

    if (!result || result.length === 0) {
      return "OWN0001";
    }

    // Extract numeric parts and find maximum
    const maxNum = result.reduce((max, row) => {
      const numPart = parseInt(row.vehicle_ownership_id.substring(3));
      return Math.max(max, numPart || 0);
    }, 0);

    const nextNum = maxNum + 1;
    return "OWN" + nextNum.toString().padStart(4, "0");
  } catch (error) {
    console.error("Error generating ownership ID:", error);
    throw new Error("Failed to generate ownership ID");
  }
};

/**
 * Generate unique maintenance ID
 * Format: MNT0001, MNT0002, etc.
 */
const generateMaintenanceId = async () => {
  try {
    // Get all existing IDs and find the highest numeric part
    const result = await db("vehicle_maintenance_service_history")
      .select("vehicle_maintenance_id")
      .where("vehicle_maintenance_id", "like", "MNT%")
      .orderBy("vehicle_maintenance_id");

    if (!result || result.length === 0) {
      return "MNT0001";
    }

    // Extract numeric parts and find maximum
    const maxNum = result.reduce((max, row) => {
      const numPart = parseInt(row.vehicle_maintenance_id.substring(3));
      return Math.max(max, numPart || 0);
    }, 0);

    const nextNum = maxNum + 1;
    return "MNT" + nextNum.toString().padStart(4, "0");
  } catch (error) {
    console.error("Error generating maintenance ID:", error);
    throw new Error("Failed to generate maintenance ID");
  }
};

/**
 * Generate unique permit ID
 * Format: PRM0001, PRM0002, etc.
 */
const generatePermitId = async () => {
  try {
    const result = await db("vehicle_special_permit")
      .max("vehicle_permit_id as max_id")
      .first();

    if (!result.max_id) {
      return "PRM0001";
    }

    const numPart = parseInt(result.max_id.substring(3)) + 1;
    return "PRM" + numPart.toString().padStart(4, "0");
  } catch (error) {
    console.error("Error generating permit ID:", error);
    throw new Error("Failed to generate permit ID");
  }
};

/**
 * Generate unique document ID
 * Format: DOC0001, DOC0002, etc.
 */
const generateDocumentId = async () => {
  try {
    // Get all existing IDs and find the highest numeric part
    const result = await db("vehicle_documents")
      .select("document_id")
      .where("document_id", "like", "DOC%")
      .orderBy("document_id");

    if (!result || result.length === 0) {
      return "DOC0001";
    }

    // Extract numeric parts and find maximum
    const maxNum = result.reduce((max, row) => {
      const numPart = parseInt(row.document_id.substring(3));
      return Math.max(max, numPart || 0);
    }, 0);

    const nextNum = maxNum + 1;
    return `DOC${nextNum.toString().padStart(4, "0")}`;
  } catch (error) {
    console.error("Error generating document ID:", error);
    throw new Error("Failed to generate document ID");
  }
};

/**
 * Generate unique document upload ID
 * Format: DU0001, DU0002, etc.
 * Uses collision-resistant logic to prevent duplicate IDs
 */
const generateDocumentUploadId = async (trx) => {
  try {
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
  } catch (error) {
    console.error("Error generating document upload ID:", error);
    throw new Error("Failed to generate document upload ID");
  }
};

/**
 * Generate unique sequence number for service frequency
 */
const generateSequenceNumber = async (vehicleId) => {
  try {
    const result = await db("service_frequency_master")
      .where("vehicle_id", vehicleId)
      .max("sequence_number as max_seq")
      .first();

    return (result.max_seq || 0) + 1;
  } catch (error) {
    console.error("Error generating sequence number:", error);
    return 1;
  }
};

/**
 * Generate unique Vehicle Owner User ID
 * Format: VO0001, VO0002, etc.
 */
const generateVehicleOwnerUserId = async () => {
  try {
    const result = await db("user_master")
      .where("user_id", "like", "VO%")
      .max("user_id as max_id")
      .first();

    if (!result.max_id) {
      return "VO0001";
    }

    const numPart = parseInt(result.max_id.substring(2)) + 1;
    return "VO" + numPart.toString().padStart(4, "0");
  } catch (error) {
    console.error("Error generating vehicle owner user ID:", error);
    throw new Error("Failed to generate vehicle owner user ID");
  }
};

/**
 * Generate unique Approval Flow ID
 * Format: AF0001, AF0002, etc.
 */
const generateApprovalFlowId = async () => {
  try {
    const result = await db("approval_flow_trans")
      .max("approval_flow_trans_id as max_id")
      .first();

    if (!result.max_id) {
      return "AF0001";
    }

    const numPart = parseInt(result.max_id.substring(2)) + 1;
    return "AF" + numPart.toString().padStart(4, "0");
  } catch (error) {
    console.error("Error generating approval flow ID:", error);
    throw new Error("Failed to generate approval flow ID");
  }
};

/**
 * Generate initial password for vehicle owner
 * Format: {RegistrationNumber}@{Random4Digits}
 * Example: MH12AB1234@4729
 */
const generateVehicleOwnerPassword = (registrationNumber) => {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const cleanRegNo = registrationNumber.replace(/\s+/g, "").substring(0, 15);
  return `${cleanRegNo}@${randomNum}`;
};

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate vehicle basic information
 */
const validateBasicInformation = (data) => {
  const errors = [];

  if (!data.maker_brand_description?.trim()) {
    errors.push({
      field: "basicInformation.make",
      message: "Make/Brand is required",
    });
  }

  if (!data.maker_model?.trim()) {
    errors.push({
      field: "basicInformation.model",
      message: "Maker Model is required",
    });
  }

  if (!data.vin_chassis_no?.trim()) {
    errors.push({
      field: "basicInformation.vin",
      message: "VIN/Chassis Number is required",
    });
  }

  if (!data.vehicle_type_id) {
    errors.push({
      field: "basicInformation.vehicleType",
      message: "Vehicle Type is required",
    });
  }

  if (!data.manufacturing_month_year) {
    errors.push({
      field: "basicInformation.manufacturingMonthYear",
      message: "Manufacturing Month & Year is required",
    });
  }

  if (!data.gps_tracker_imei_number?.trim()) {
    errors.push({
      field: "basicInformation.gpsIMEI",
      message: "GPS Tracker IMEI Number is required",
    });
  }

  if (
    data.gps_tracker_active_flag === undefined ||
    data.gps_tracker_active_flag === null
  ) {
    errors.push({
      field: "basicInformation.gpsActive",
      message: "GPS Tracker Active Flag is required",
    });
  }

  if (!data.usage_type_id) {
    errors.push({
      field: "basicInformation.usageType",
      message: "Usage Type is required",
    });
  }

  return errors;
};

/**
 * Validate vehicle specifications
 */
const validateSpecifications = (data) => {
  const errors = [];

  if (!data.engine_type_id?.trim()) {
    errors.push({
      field: "specifications.engineType",
      message: "Engine Type is required",
    });
  }

  if (!data.engine_number?.trim()) {
    errors.push({
      field: "specifications.engineNumber",
      message: "Engine Number is required",
    });
  }

  if (!data.fuel_type_id) {
    errors.push({
      field: "specifications.fuelType",
      message: "Fuel Type is required",
    });
  }

  if (!data.transmission_type) {
    errors.push({
      field: "specifications.transmission",
      message: "Transmission Type is required",
    });
  }

  if (!data.financer?.trim()) {
    errors.push({
      field: "specifications.financer",
      message: "Financer is required",
    });
  }

  if (!data.suspension_type) {
    errors.push({
      field: "specifications.suspensionType",
      message: "Suspension Type is required",
    });
  }

  return errors;
};

/**
 * Check for duplicate VIN/Chassis Number
 */
const checkDuplicateVIN = async (vin, excludeVehicleId = null) => {
  try {
    let query = db("vehicle_basic_information_hdr").where(
      "vin_chassis_no",
      vin
    );

    if (excludeVehicleId) {
      query = query.whereNot("vehicle_id_code_hdr", excludeVehicleId);
    }

    const existing = await query.first();
    return !!existing;
  } catch (error) {
    console.error("Error checking duplicate VIN:", error);
    return false;
  }
};

/**
 * Check for duplicate Registration Number in vehicle_basic_information_hdr
 */
const checkDuplicateRegistration = async (
  regNumber,
  excludeVehicleId = null
) => {
  try {
    let query = db("vehicle_basic_information_hdr").where(
      "vehicle_registration_number",
      regNumber
    );

    if (excludeVehicleId) {
      query = query.where("vehicle_id_code_hdr", "!=", excludeVehicleId);
    }

    const existing = await query.first();
    return !!existing;
  } catch (error) {
    console.error("Error checking duplicate registration:", error);
    return false;
  }
};

/**
 * Check for duplicate GPS IMEI
 */
const checkDuplicateGPSIMEI = async (imei, excludeVehicleId = null) => {
  try {
    let query = db("vehicle_basic_information_hdr").where(
      "gps_tracker_imei_number",
      imei
    );

    if (excludeVehicleId) {
      query = query.whereNot("vehicle_id_code_hdr", excludeVehicleId);
    }

    const existing = await query.first();
    return !!existing;
  } catch (error) {
    console.error("Error checking duplicate GPS IMEI:", error);
    return false;
  }
};

/**
 * Validate foreign key references
 */
const validateForeignKeys = async (vehicleData) => {
  const errors = [];

  // Validate fuel_type_id
  if (vehicleData.fuel_type_id) {
    const fuelType = await db("fuel_type_master")
      .where("fuel_type_id", vehicleData.fuel_type_id)
      .where("status", "ACTIVE")
      .first();
    if (!fuelType) {
      // Log available fuel types for debugging when validation fails
      const availableFuelTypes = await db("fuel_type_master")
        .where("status", "ACTIVE")
        .select("fuel_type_id", "fuel_type");
      console.log("❌ Invalid fuel_type_id:", vehicleData.fuel_type_id);
      console.log(
        "✅ Valid fuel types:",
        availableFuelTypes
          .map((ft) => `${ft.fuel_type_id}:${ft.fuel_type}`)
          .join(", ")
      );

      errors.push({
        field: "specifications.fuelType",
        message: `Invalid fuel type ID: ${vehicleData.fuel_type_id}. Please select a valid fuel type.`,
      });
    }
  }

  // Validate vehicle_type_id
  if (vehicleData.vehicle_type_id) {
    const vehicleType = await db("vehicle_type_master")
      .where("vehicle_type_id", vehicleData.vehicle_type_id)
      .where("status", "ACTIVE")
      .first();
    if (!vehicleType) {
      errors.push({
        field: "basicInformation.vehicleType",
        message: `Invalid vehicle type ID: ${vehicleData.vehicle_type_id}. Please select a valid vehicle type.`,
      });
    }
  }

  // Validate usage_type_id
  if (vehicleData.usage_type_id) {
    const usageType = await db("usage_type_master")
      .where("usage_type_id", vehicleData.usage_type_id)
      .where("status", "ACTIVE")
      .first();
    if (!usageType) {
      errors.push({
        field: "basicInformation.usageType",
        message: `Invalid usage type ID: ${vehicleData.usage_type_id}. Please select a valid usage type.`,
      });
    }
  }

  // Validate engine_type_id
  if (vehicleData.engine_type_id) {
    const engineType = await db("engine_type_master")
      .where("engine_type_id", vehicleData.engine_type_id)
      .where("status", "ACTIVE")
      .first();
    if (!engineType) {
      errors.push({
        field: "specifications.engineType",
        message: `Invalid engine type ID: ${vehicleData.engine_type_id}. Please select a valid engine type.`,
      });
    }
  }

  return errors;
};

// ============================================================================
// CREATE VEHICLE
// ============================================================================

/**
 * Create a new vehicle with all related information
 * @route POST /api/vehicle
 */
const createVehicle = async (req, res) => {
  const trx = await db.transaction();

  try {
    const {
      basicInformation,
      specifications,
      capacityDetails,
      ownershipDetails,
      maintenanceHistory,
      serviceFrequency,
      documents,
    } = req.body;

    // Combine basic information and specifications for validation
    const vehicleData = {
      ...basicInformation,
      ...specifications,
    };

    // Validate required fields
    const validationErrors = [
      ...validateBasicInformation(vehicleData),
      ...validateSpecifications(vehicleData),
    ];

    // Validate foreign key references
    const foreignKeyErrors = await validateForeignKeys(vehicleData);
    validationErrors.push(...foreignKeyErrors);

    if (validationErrors.length > 0) {
      await trx.rollback();
      console.log("❌ Validation errors found:", validationErrors);
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: validationErrors,
      });
    }

    // Check for duplicates
    if (vehicleData.vin_chassis_no) {
      const isDuplicate = await checkDuplicateVIN(vehicleData.vin_chassis_no);
      if (isDuplicate) {
        return res.status(400).json({
          success: false,
          message: "VIN/Chassis Number already exists",
          field: "basicInformation.vin",
        });
      }
    }

    if (vehicleData.gps_tracker_imei_number) {
      const isDuplicate = await checkDuplicateGPSIMEI(
        vehicleData.gps_tracker_imei_number
      );
      if (isDuplicate) {
        return res.status(400).json({
          success: false,
          message: "GPS IMEI Number already exists",
          field: "basicInformation.gpsIMEI",
        });
      }
    }

    // Check for duplicate vehicle registration number (from basic information)
    if (vehicleData?.vehicle_registration_number) {
      const isDuplicate = await checkDuplicateRegistration(
        vehicleData.vehicle_registration_number
      );
      if (isDuplicate) {
        return res.status(400).json({
          success: false,
          message: "Vehicle Registration Number already exists",
          field: "basicInformation.registrationNumber",
        });
      }
    }

    // Generate vehicle ID
    const vehicleId = await generateVehicleId();

    // Insert vehicle basic information header
    await trx("vehicle_basic_information_hdr").insert({
      vehicle_id_code_hdr: vehicleId,
      vehicle_registration_number:
        vehicleData.vehicle_registration_number || null,
      maker_brand_description: vehicleData.maker_brand_description,
      maker_model: vehicleData.maker_model,
      vin_chassis_no: vehicleData.vin_chassis_no,
      vehicle_type_id: vehicleData.vehicle_type_id,
      vehicle_category: vehicleData.vehicle_category,
      vehicle_class_description: vehicleData.vehicle_class_description,
      engine_number: vehicleData.engine_number,
      body_type_desc: vehicleData.body_type_desc,
      fuel_type_id: vehicleData.fuel_type_id,
      vehicle_colour: vehicleData.vehicle_colour,
      engine_type_id: vehicleData.engine_type_id,
      emission_standard: vehicleData.emission_standard,
      financer: vehicleData.financer,
      manufacturing_month_year: vehicleData.manufacturing_month_year,
      unloading_weight: capacityDetails?.unloading_weight || 0,
      gross_vehicle_weight_kg: capacityDetails?.gross_vehicle_weight_kg || 0,
      volume_capacity_cubic_meter:
        capacityDetails?.volume_capacity_cubic_meter || 0,
      seating_capacity: capacityDetails?.seating_capacity || 0,
      vehicle_registered_at: vehicleData.vehicle_registered_at,
      transmission_type: vehicleData.transmission_type,
      usage_type_id: vehicleData.usage_type_id,
      safety_inspection_date: formatDateTimeForMySQL(
        vehicleData.safety_inspection_date
      ),
      taxes_and_fees: vehicleData.taxes_and_fees || 0,
      load_capacity_in_ton: capacityDetails?.load_capacity_in_ton || 0,
      cargo_dimensions_width: capacityDetails?.cargo_dimensions_width || 0,
      cargo_dimensions_height: capacityDetails?.cargo_dimensions_height || 0,
      cargo_dimensions_length: capacityDetails?.cargo_dimensions_length || 0,
      towing_capacity: capacityDetails?.towing_capacity || 0,
      suspension_type: vehicleData.suspension_type,
      tire_load_rating: capacityDetails?.tire_load_rating,
      vehicle_condition: capacityDetails?.vehicle_condition,
      fuel_tank_capacity: capacityDetails?.fuel_tank_capacity || 0,
      blacklist_status: false,
      road_tax: vehicleData.road_tax || 0,
      gps_tracker_imei_number: vehicleData.gps_tracker_imei_number,
      gps_tracker_active_flag: vehicleData.gps_tracker_active_flag || false,
      leasing_flag: vehicleData.leasing_flag || false,
      avg_running_speed: vehicleData.avg_running_speed || 0,
      max_running_speed: vehicleData.max_running_speed || 0,
      created_by: req.user?.user_id || "SYSTEM",
      updated_by: req.user?.user_id || "SYSTEM",
      status: "ACTIVE",
    });

    // Insert ownership details if provided
    if (ownershipDetails && Object.keys(ownershipDetails).length > 0) {
      const ownershipId = await generateOwnershipId();

      await trx("vehicle_ownership_details").insert({
        vehicle_ownership_id: ownershipId,
        vehicle_id_code: vehicleId,
        ownership_name: ownershipDetails.ownershipName,
        valid_from: formatDateForMySQL(ownershipDetails.validFrom),
        valid_to: formatDateForMySQL(ownershipDetails.validTo),
        registration_number: ownershipDetails.registrationNumber,
        registration_date: formatDateForMySQL(
          ownershipDetails.registrationDate
        ),
        registration_upto: formatDateForMySQL(
          ownershipDetails.registrationUpto
        ),
        purchase_date: formatDateForMySQL(ownershipDetails.purchaseDate),
        owner_sr_number: ownershipDetails.ownerSrNumber,
        state_code: ownershipDetails.stateCode,
        rto_code: ownershipDetails.rtoCode,
        present_address_id: ownershipDetails.presentAddressId,
        permanent_address_id: ownershipDetails.permanentAddressId,
        sale_amount: ownershipDetails.saleAmount || 0,
        created_by: req.user?.user_id || "SYSTEM",
        updated_by: req.user?.user_id || "SYSTEM",
        status: "ACTIVE",
      });
    }

    // Insert maintenance history if provided
    if (maintenanceHistory && Object.keys(maintenanceHistory).length > 0) {
      const maintenanceId = await generateMaintenanceId();

      await trx("vehicle_maintenance_service_history").insert({
        vehicle_maintenance_id: maintenanceId,
        vehicle_id_code: vehicleId,
        service_date: formatDateForMySQL(maintenanceHistory.serviceDate),
        service_remark: maintenanceHistory.serviceRemark,
        upcoming_service_date: formatDateForMySQL(
          maintenanceHistory.upcomingServiceDate
        ),
        type_of_service: maintenanceHistory.typeOfService,
        service_expense: maintenanceHistory.serviceExpense || 0,
        created_by: req.user?.user_id || "SYSTEM",
        updated_by: req.user?.user_id || "SYSTEM",
        status: "ACTIVE",
      });
    }

    // Insert service frequency if provided
    if (serviceFrequency && Object.keys(serviceFrequency).length > 0) {
      const sequenceNumber = await generateSequenceNumber(vehicleId);

      await trx("service_frequency_master").insert({
        vehicle_id: vehicleId,
        sequence_number: sequenceNumber,
        time_period: serviceFrequency.timePeriod,
        km_drove: serviceFrequency.kmDrove || 0,
        created_by: req.user?.user_id || "SYSTEM",
        updated_by: req.user?.user_id || "SYSTEM",
        status: "ACTIVE",
      });
    }

    // Insert documents if provided
    if (documents && Array.isArray(documents) && documents.length > 0) {
      for (const doc of documents) {
        const documentId = await generateDocumentId();

        // Insert document metadata
        await trx("vehicle_documents").insert({
          document_id: documentId,
          vehicle_id_code: vehicleId,
          document_type_id: doc.documentType,
          reference_number: doc.referenceNumber,
          vehicle_maintenance_id: doc.vehicleMaintenanceId,
          permit_category: doc.permitCategory,
          permit_code: doc.permitCode,
          document_provider: doc.documentProvider,
          coverage_type_id: doc.coverageType,
          premium_amount: doc.premiumAmount || 0,
          valid_from: formatDateForMySQL(doc.validFrom),
          valid_to: formatDateForMySQL(doc.validTo),
          remarks: doc.remarks,
          created_by: req.user?.user_id || "SYSTEM",
          updated_by: req.user?.user_id || "SYSTEM",
          status: "ACTIVE",
        });

        // Insert document file if provided
        if (doc.fileData && doc.fileName) {
          const uploadId = await generateDocumentUploadId(trx);

          await trx("document_upload").insert({
            document_id: uploadId,

            file_name: doc.fileName,
            file_type: doc.fileType || "application/pdf",
            file_xstring_value: doc.fileData, // Base64 encoded file
            system_reference_id: documentId,
            is_verified: false,
            valid_from: formatDateForMySQL(doc.validFrom),
            valid_to: formatDateForMySQL(doc.validTo),
            created_by: req.user?.user_id || "SYSTEM",
            updated_by: req.user?.user_id || "SYSTEM",
            created_at: new Date(),
            updated_at: new Date(),
            status: "ACTIVE",
          });
        }
      }
    }

    // ========================================================================
    // CREATE VEHICLE OWNER USER (NEW)
    // ========================================================================

    const bcrypt = require("bcrypt");
    const currentUser = req.user;
    const creatorUserId = currentUser?.user_id || "SYSTEM";
    const creatorName = currentUser?.name || currentUser?.user_id || "System";

    // Generate vehicle owner user ID
    const vehicleOwnerUserId = await generateVehicleOwnerUserId();

    // Generate initial password
    const initialPassword = generateVehicleOwnerPassword(
      vehicleData.vehicle_registration_number || `VEH${vehicleId.substring(3)}`
    );
    const hashedPassword = await bcrypt.hash(initialPassword, 10);

    // Cross-approval logic
    let pendingWithUserId, pendingWithName;
    if (creatorUserId === "PO001") {
      pendingWithUserId = "PO002";
      pendingWithName = "Product Owner 2";
    } else if (creatorUserId === "PO002") {
      pendingWithUserId = "PO001";
      pendingWithName = "Product Owner 1";
    } else {
      pendingWithUserId = "PO001";
      pendingWithName = "Product Owner 1";
    }

    // Insert vehicle owner user
    await trx("user_master").insert({
      user_id: vehicleOwnerUserId,
      user_type_id: "UT005",
      user_full_name: `Vehicle Owner - ${vehicleId}`,
      email_id: `${vehicleOwnerUserId.toLowerCase()}@vehicle.tms.com`,
      mobile_number: "0000000000",
      from_date: new Date(),
      is_active: false,
      password: hashedPassword,
      password_type: "initial",
      created_by_user_id: creatorUserId,
      status: "PENDING",
      created_at: db.fn.now(),
      updated_at: db.fn.now(),
    });

    console.log(`✅ Vehicle Owner user created: ${vehicleOwnerUserId}`);

    // Create approval flow entry
    const approvalFlowId = await generateApprovalFlowId();

    await trx("approval_flow_trans").insert({
      approval_flow_trans_id: approvalFlowId,
      approval_config_id: "AC0004",
      approval_type_id: "AT004",
      user_id_reference_id: vehicleOwnerUserId,
      s_status: "Pending for Approval",
      approver_level: 1,
      pending_with_role_id: "RL001",
      pending_with_user_id: pendingWithUserId,
      pending_with_name: pendingWithName,
      created_by_user_id: creatorUserId,
      created_by_name: creatorName,
      created_at: db.fn.now(),
      updated_at: db.fn.now(),
    });

    console.log(
      `✅ Approval flow created: ${approvalFlowId} → Pending with ${pendingWithUserId}`
    );

    // ========================================================================
    // COMMIT TRANSACTION
    // ========================================================================

    await trx.commit();

    res.status(201).json({
      success: true,
      message:
        "Vehicle created successfully. Vehicle Owner user created and pending approval.",
      data: {
        vehicleId: vehicleId,
        userApproval: {
          userId: vehicleOwnerUserId,
          userType: "Independent Vehicle Owner",
          initialPassword: initialPassword,
          status: "Pending for Approval",
          pendingWith: pendingWithName,
        },
      },
    });
  } catch (error) {
    await trx.rollback();
    console.error("Error creating vehicle:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create vehicle",
      error: error.message,
    });
  }
};

// ============================================================================
// GET ALL VEHICLES WITH FILTERS
// ============================================================================

/**
 * Get all vehicles with pagination and filtering
 * @route GET /api/vehicle
 */
const getAllVehicles = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 25,
      search = "",
      registrationNumber = "",
      vehicleType = "",
      make = "",
      model = "",
      yearFrom = "",
      yearTo = "",
      status = "",
      registrationState = "",
      fuelType = "",
      leasingFlag = "",
      towingCapacityMin = "",
      towingCapacityMax = "",
      ownership = "",
      gpsEnabled = "",
      vehicleCondition = "",
      engineType = "",
      emissionStandard = "",
      bodyType = "",
      sortBy = "created_at",
      sortOrder = "asc", // Changed to 'asc' so newest vehicles appear at the end of the list
      createdOnStart = "",
      createdOnEnd = "",
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build query without the non-existent vehicle_capacity_details table
    let query = db("vehicle_basic_information_hdr as vbih")
      .leftJoin(
        "vehicle_ownership_details as vod",
        "vbih.vehicle_id_code_hdr",
        "vod.vehicle_id_code"
      )
      .leftJoin(
        "vehicle_type_master as vtm",
        "vbih.vehicle_type_id",
        "vtm.vehicle_type_id"
      )
      .leftJoin(
        "fuel_type_master as ftm",
        "vbih.fuel_type_id",
        "ftm.fuel_type_id"
      )
      .leftJoin(
        db.raw(`(
          SELECT aft1.*
          FROM approval_flow_trans aft1
          INNER JOIN (
            SELECT user_id_reference_id, MAX(approval_flow_unique_id) as max_id
            FROM approval_flow_trans
            WHERE approval_type_id = 'AT004'
              AND s_status IN ('Approve', 'Reject', 'PENDING')
            GROUP BY user_id_reference_id
          ) aft2 ON aft1.user_id_reference_id = aft2.user_id_reference_id
               AND aft1.approval_flow_unique_id = aft2.max_id
        ) as aft`),
        db.raw(
          "CONCAT('VEH', CAST(SUBSTRING(aft.user_id_reference_id, 3) AS UNSIGNED))"
        ),
        "vbih.vehicle_id_code_hdr"
      )
      .select(
        "vbih.vehicle_id_code_hdr as vehicleId",
        "vbih.vehicle_registration_number as registrationNumber",
        "vbih.maker_brand_description as make",
        "vbih.maker_model as model",
        "vbih.vin_chassis_no as vin",
        "vbih.vehicle_type_id as vehicleTypeId",
        "vtm.vehicle_type_description as vehicleType",
        "vbih.vehicle_category",
        "vbih.fuel_type_id as fuelTypeId",
        "ftm.fuel_type as fuelType", // Get fuel type name from master
        "vbih.transmission_type",
        "vbih.manufacturing_month_year as year",
        "vbih.gross_vehicle_weight_kg as gvw",
        "vbih.gps_tracker_imei_number as gpsIMEI",
        "vbih.gps_tracker_active_flag as gpsEnabled",
        "vbih.blacklist_status",
        "vbih.status",
        "vbih.created_at",
        "vbih.created_by as createdBy",
        "vbih.leasing_flag as leasingFlag",
        "vbih.vehicle_condition",
        "vbih.fuel_tank_capacity as fuelCapacity",
        "vbih.engine_type_id",
        "vbih.emission_standard",
        "vbih.body_type_desc as bodyType",
        "vbih.vehicle_colour as color",
        "vbih.engine_number",
        "vbih.vehicle_registered_at as registrationState",
        "vod.ownership_name",
        "vod.registration_date",
        // Get towing capacity from the basic info header table
        "vbih.towing_capacity as towingCapacity",
        db.raw(
          "COALESCE(aft.actioned_by_name, aft.pending_with_name) as approver_name"
        ),
        "aft.approved_on",
        "aft.s_status as approval_status"
      );

    // Apply search filter
    if (search) {
      query = query.where(function () {
        this.where("vbih.vehicle_id_code_hdr", "like", `%${search}%`)
          .orWhere("vbih.vehicle_registration_number", "like", `%${search}%`)
          .orWhere("vbih.maker_brand_description", "like", `%${search}%`)
          .orWhere("vbih.maker_model", "like", `%${search}%`)
          .orWhere("vbih.vin_chassis_no", "like", `%${search}%`)
          .orWhere("vbih.engine_number", "like", `%${search}%`)
          .orWhere("vtm.vehicle_type_description", "like", `%${search}%`)
          .orWhere("ftm.fuel_type", "like", `%${search}%`)
          .orWhere("vod.ownership_name", "like", `%${search}%`);
      });
    }

    // Apply filters
    if (registrationNumber) {
      query = query.where(
        "vbih.vehicle_registration_number",
        "like",
        `%${registrationNumber}%`
      );
    }

    if (vehicleType) {
      query = query.where("vbih.vehicle_type_id", vehicleType);
    }

    if (make) {
      query = query.where("vbih.maker_brand_description", "like", `%${make}%`);
    }

    if (model) {
      query = query.where("vbih.maker_model", "like", `%${model}%`);
    }

    if (yearFrom) {
      query = query.where("vbih.manufacturing_month_year", ">=", yearFrom);
    }

    if (yearTo) {
      query = query.where("vbih.manufacturing_month_year", "<=", yearTo);
    }

    if (status) {
      query = query.where("vbih.status", status);
    }

    // 🔒 DRAFT FILTERING LOGIC
    // Only show draft vehicles to their creator
    // Show all non-draft vehicles to everyone
    const userId = req.user?.user_id;
    query = query.where(function () {
      this.where("vbih.status", "!=", "DRAFT") // All non-draft vehicles
        .orWhere(function () {
          this.where("vbih.status", "DRAFT").andWhere(
            "vbih.created_by",
            userId
          ); // Only creator's drafts
        });
    });

    if (registrationState) {
      query = query.where(
        "vbih.vehicle_registered_at",
        "like",
        `%${registrationState}%`
      );
    }

    if (fuelType) {
      // Check if it's an ID or name
      if (fuelType.startsWith("FT")) {
        query = query.where("vbih.fuel_type_id", fuelType);
      } else {
        query = query.where("ftm.fuel_type", "like", `%${fuelType}%`);
      }
    }

    if (leasingFlag) {
      // Convert string to boolean for database query
      const isLeased = leasingFlag === "true" || leasingFlag === "1";
      query = query.where("vbih.leasing_flag", isLeased);
    }

    if (gpsEnabled) {
      // Convert string to boolean for database query
      const gpsActive = gpsEnabled === "true" || gpsEnabled === "1";
      query = query.where("vbih.gps_tracker_active_flag", gpsActive);
    }

    if (ownership) {
      query = query.where("vod.ownership_name", "like", `%${ownership}%`);
    }

    if (vehicleCondition) {
      query = query.where("vbih.vehicle_condition", vehicleCondition);
    }

    if (engineType) {
      query = query.where("vbih.engine_type_id", engineType);
    }

    if (emissionStandard) {
      query = query.where("vbih.emission_standard", emissionStandard);
    }

    if (bodyType) {
      query = query.where("vbih.body_type_desc", "like", `%${bodyType}%`);
    }

    if (towingCapacityMin) {
      query = query.where(
        "vbih.towing_capacity",
        ">=",
        parseInt(towingCapacityMin)
      );
    }

    if (towingCapacityMax) {
      query = query.where(
        "vbih.towing_capacity",
        "<=",
        parseInt(towingCapacityMax)
      );
    }

    // if (registrationDate) {
    //   // Filter by registration date - exact match on date part
    //   query = query.whereRaw("DATE(vod.registration_date) = ?", [
    //     registrationDate,
    //   ]);
    // }

    //Created On Date Range Filter
    if (createdOnStart) {
      query = query.where("vbhi.created_on", ">=", createdOnStart);
    }
    if (createdOnEnd) {
      query = query.where("vbhi.created_on", "<=", createdOnEnd);
    }

    // Get total count for pagination
    const countQuery = query
      .clone()
      .clearSelect()
      .clearOrder()
      .count("* as total")
      .first();

    // Date Filters for Count Query
    if (createdOnStart) {
      countQuery = countQuery.where("vbhi.created_on", ">=", createdOnStart);
    }
    if (createdOnEnd) {
      countQuery = countQuery.where("vbhi.created_on", "<=", createdOnEnd);
    }

    const { total } = await countQuery;

    // Apply sorting and pagination
    query = query
      .orderBy(sortBy, sortOrder)
      .limit(parseInt(limit))
      .offset(offset);

    const vehicles = await query;

    // Transform the data to match frontend expectations
    const transformedVehicles = vehicles.map((vehicle) => ({
      vehicleId: vehicle.vehicleId,
      registrationNumber: vehicle.registrationNumber || "N/A",
      make: vehicle.make,
      model: vehicle.model,
      vin: vehicle.vin,
      vehicleTypeId: vehicle.vehicleTypeId,
      vehicleType: vehicle.vehicleType,
      vehicleCategory: vehicle.vehicle_category,
      fuelTypeId: vehicle.fuelTypeId,
      fuelType: vehicle.fuelType, // Now comes from master table
      transmissionType: vehicle.transmission_type,
      year: vehicle.year ? new Date(vehicle.year).getFullYear() : null,
      gvw: vehicle.gvw,
      gpsIMEI: vehicle.gpsIMEI,
      gpsEnabled: Boolean(vehicle.gpsEnabled), // Convert 0/1 to boolean
      blacklistStatus: vehicle.blacklist_status,
      status: vehicle.status,
      createdAt: vehicle.created_at,
      createdBy: vehicle.createdBy,
      leasingFlag: Boolean(vehicle.leasingFlag), // Convert 0/1 to boolean
      vehicleCondition: vehicle.vehicle_condition,
      fuelCapacity: parseFloat(vehicle.fuelCapacity) || 0,
      engineTypeId: vehicle.engine_type_id,
      emissionStandard: vehicle.emission_standard,
      bodyType: vehicle.bodyType,
      color: vehicle.color,
      engineNumber: vehicle.engine_number,
      registrationState: vehicle.registrationState,
      ownershipName: vehicle.ownership_name,
      registrationDate: vehicle.registration_date,
      towingCapacity: parseFloat(vehicle.towingCapacity) || 0,
      approver: vehicle.approver_name || null,
      approvedOn:
        vehicle.approved_on && vehicle.approval_status === "Approve"
          ? new Date(vehicle.approved_on).toISOString().split("T")[0]
          : null,
    }));

    res.json({
      success: true,
      data: transformedVehicles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch vehicles",
      error: error.message,
    });
  }
};

// ============================================================================
// GET VEHICLE BY ID
// ============================================================================

/**
 * Get vehicle details by ID
 * @route GET /api/vehicle/:id
 */
const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get vehicle basic information
    const vehicle = await db("vehicle_basic_information_hdr")
      .where("vehicle_id_code_hdr", id)
      .first();

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    // Get ownership details (array - can have multiple ownership records)
    const ownershipRecords = await db("vehicle_ownership_details")
      .where("vehicle_id_code", id)
      .orderBy("valid_from", "desc");

    // Get maintenance history (array - all service records)
    const maintenanceRecords = await db("vehicle_maintenance_service_history")
      .where("vehicle_id_code", id)
      .orderBy("service_date", "desc");

    // Get service frequency (array - all frequency schedules)
    const serviceFrequencyRecords = await db("service_frequency_master")
      .where("vehicle_id", id)
      .orderBy("sequence_number", "asc");

    // Get documents with file data and document type names
    // Fix: Use DISTINCT to avoid duplicate rows from multiple document_upload entries
    const documents = await db("vehicle_documents as vd")
      .leftJoin(
        function() {
          // Subquery to get the latest/most recent document upload for each system_reference_id
          this.select([
            "system_reference_id",
            "file_name", 
            "file_type",
            "file_xstring_value"
          ])
          .from("document_upload")
          .whereRaw("(system_reference_id, created_at) IN (SELECT system_reference_id, MAX(created_at) FROM document_upload GROUP BY system_reference_id)")
          .as("du");
        },
        "vd.document_id",
        "du.system_reference_id"
      )
      .leftJoin(
        "document_name_master as dnm",
        "vd.document_type_id",
        "dnm.doc_name_master_id"
      )
      .where("vd.vehicle_id_code", id)
      .where("vd.status", "ACTIVE")
      .select(
        "vd.document_id",
        "vd.document_type_id",
        "dnm.document_name as document_type_name",
        "vd.reference_number",
        "vd.vehicle_maintenance_id",
        "vd.permit_category",
        "vd.permit_code",
        "vd.document_provider",
        "vd.coverage_type_id",
        "vd.premium_amount",
        "vd.valid_from",
        "vd.valid_to",
        "vd.remarks",
        "du.file_name",
        "du.file_type",
        "du.file_xstring_value as file_data"
      )
      .orderBy("vd.created_at", "desc");

    // Get vehicle type description
    let vehicleTypeDesc = null;
    if (vehicle.vehicle_type_id) {
      const vehicleType = await db("vehicle_type_master")
        .where("vehicle_type_id", vehicle.vehicle_type_id)
        .first();
      vehicleTypeDesc = vehicleType?.vehicle_type_description;
    }

    // ========================================================================
    // FETCH USER APPROVAL STATUS FOR VEHICLE OWNER USERS
    // ========================================================================

    let userApprovalStatus = null;
    let approvalHistory = [];

    try {
      // Find Vehicle Owner user associated with this vehicle
      // Vehicle Owner users have names like "Vehicle Owner - VEH0062"
      const associatedUser = await db("user_master")
        .where("user_type_id", "UT005") // Vehicle Owner user type
        .where("user_full_name", "like", `%${id}%`) // Match vehicle ID in name
        .first();

      if (associatedUser) {
        console.log(
          `✅ Found associated Vehicle Owner user: ${associatedUser.user_id} for vehicle ${id}`
        );

        // Get approval flow for this user
        const approvalFlows = await db("approval_flow_trans as aft")
          .leftJoin(
            "approval_type_master as atm",
            "aft.approval_type_id",
            "atm.approval_type_id"
          )
          .where("aft.user_id_reference_id", associatedUser.user_id)
          .select(
            "aft.*",
            "atm.approval_type as approval_category",
            "atm.approval_name"
          )
          .orderBy("aft.created_at", "desc");

        userApprovalStatus = {
          approvalFlowTransId: approvalFlows[0]?.approval_flow_trans_id || null,
          userId: associatedUser.user_id,
          userEmail: associatedUser.email_id,
          userMobile: associatedUser.mobile_number,
          userStatus: associatedUser.status,
          isActive: associatedUser.is_active,
          currentApprovalStatus:
            approvalFlows[0]?.s_status || associatedUser.status,
          pendingWith: approvalFlows[0]?.pending_with_name || null,
          pendingWithUserId: approvalFlows[0]?.pending_with_user_id || null,
          createdByUserId: approvalFlows[0]?.created_by_user_id || null,
          createdByName: approvalFlows[0]?.created_by_name || null,
        };

        approvalHistory = approvalFlows;

        console.log(
          `✅ Found approval status for vehicle ${id}:`,
          userApprovalStatus
        );
      } else {
        console.log(`⚠️  No Vehicle Owner user found for vehicle ${id}`);
      }
    } catch (approvalError) {
      console.error(
        "❌ Error fetching vehicle approval status:",
        approvalError.message
      );
    }

    // Format response
    const response = {
      vehicleId: vehicle.vehicle_id_code_hdr,
      basicInformation: {
        registrationNumber: vehicle.vehicle_registration_number,
        make: vehicle.maker_brand_description,
        model: vehicle.maker_model,
        vin: vehicle.vin_chassis_no,
        vehicleType: vehicle.vehicle_type_id,
        vehicleTypeDescription: vehicleTypeDesc,
        vehicleCategory: vehicle.vehicle_category,
        manufacturingMonthYear: vehicle.manufacturing_month_year,
        year: vehicle.manufacturing_month_year
          ? new Date(vehicle.manufacturing_month_year).getFullYear()
          : null,
        gpsIMEI: vehicle.gps_tracker_imei_number,
        gpsActive: vehicle.gps_tracker_active_flag,
        gpsEnabled: vehicle.gps_tracker_active_flag,
        gpsProvider: vehicle.gps_provider || "", // Add GPS provider
        leasingFlag: vehicle.leasing_flag,
        leasedFrom: vehicle.leased_from || "", // Add leased from
        leaseStartDate: vehicle.lease_start_date || "", // Add lease start
        leaseEndDate: vehicle.lease_end_date || "", // Add lease end
        avgRunningSpeed: vehicle.avg_running_speed,
        maxRunningSpeed: vehicle.max_running_speed,
        usageType: vehicle.usage_type_id,
        safetyInspectionDate: vehicle.safety_inspection_date,
        taxesAndFees: vehicle.taxes_and_fees,
        vehicleRegisteredAt: vehicle.vehicle_registered_at,
        vehicleRegisteredAtCountry: vehicle.vehicle_registered_at_country || "",
        vehicleRegisteredAtState: vehicle.vehicle_registered_at_state || "",
        color: vehicle.vehicle_colour,
        roadTax: vehicle.road_tax,
        fitnessUpto: vehicle.fitness_upto,
        taxUpto: vehicle.tax_upto,
        mileage: vehicle.mileage || 0, // Add mileage
        currentDriver: vehicle.current_driver || "", // Add current driver
        transporterId: vehicle.transporter_id || "", // Add transporter ID
        transporterName: vehicle.transporter_name || "", // Add transporter name
      },
      specifications: {
        engineType: vehicle.engine_type_id,
        engineNumber: vehicle.engine_number,
        bodyTypeDescription: vehicle.body_type_desc,
        fuelType: vehicle.fuel_type_id,
        transmission: vehicle.transmission_type,
        color: vehicle.vehicle_colour,
        emissionStandard: vehicle.emission_standard,
        financer: vehicle.financer,
        suspensionType: vehicle.suspension_type,
        fuelTankCapacity: vehicle.fuel_tank_capacity,
        vehicleClass: vehicle.vehicle_class_description,
        noOfGears: vehicle.no_of_gears || 0, // Add no of gears
        wheelbase: vehicle.wheelbase || 0, // Add wheelbase
        noOfAxles: vehicle.no_of_axles || 0, // Add no of axles
        // Note: These fields don't exist in DB - will default to 0
      },
      capacityDetails: {
        unloadingWeight: vehicle.unloading_weight,
        unladenWeight: vehicle.unloading_weight, // Map to form field name
        gvw: vehicle.gross_vehicle_weight_kg,
        payloadCapacity:
          vehicle.load_capacity_in_ton ||
          (vehicle.gross_vehicle_weight_kg && vehicle.unloading_weight
            ? vehicle.gross_vehicle_weight_kg - vehicle.unloading_weight
            : null),
        volumeCapacity: vehicle.volume_capacity_cubic_meter,
        loadingCapacityVolume: vehicle.volume_capacity_cubic_meter, // Map to form field name
        loadingCapacityUnit: "CBM", // Default unit
        cargoWidth: vehicle.cargo_dimensions_width,
        cargoHeight: vehicle.cargo_dimensions_height,
        cargoLength: vehicle.cargo_dimensions_length,
        towingCapacity: vehicle.towing_capacity,
        tireLoadRating: vehicle.tire_load_rating,
        vehicleCondition: vehicle.vehicle_condition,
        fuelTankCapacity: vehicle.fuel_tank_capacity,
        seatingCapacity: vehicle.seating_capacity,
        doorType: vehicle.door_type || "", // Add door type
        noOfPallets: vehicle.no_of_pallets || 0, // Add no of pallets
        // Note: doorType, noOfPallets don't exist in DB - will default to empty/0
      },
      ownershipDetails: ownershipRecords.map((ownership) => ({
        ownerId: ownership.vehicle_ownership_id,
        ownershipName: ownership.ownership_name,
        validFrom: ownership.valid_from,
        validTo: ownership.valid_to,
        registrationNumber: ownership.registration_number,
        registrationDate: ownership.registration_date,
        registrationUpto: ownership.registration_upto,
        purchaseDate: ownership.purchase_date,
        ownerSrNumber: ownership.owner_sr_number,
        stateCode: ownership.state_code,
        rtoCode: ownership.rto_code,
        presentAddressId: ownership.present_address_id,
        permanentAddressId: ownership.permanent_address_id,
        saleAmount: ownership.sale_amount,
        contactNumber: ownership.contact_number || "", // Add contact number
        email: ownership.email || "", // Add email
      })),
      maintenanceHistory: maintenanceRecords.map((maintenance) => ({
        vehicleMaintenanceId: maintenance.vehicle_maintenance_id,
        serviceDate: maintenance.service_date,
        serviceRemark: maintenance.service_remark,
        upcomingServiceDate: maintenance.upcoming_service_date,
        typeOfService: maintenance.type_of_service,
        serviceExpense: maintenance.service_expense,
        lastInspectionDate: maintenance.last_inspection_date || "", // Add last inspection date
      })),
      serviceFrequency: serviceFrequencyRecords.map((freq) => ({
        sequenceNumber: freq.sequence_number,
        timePeriod: freq.time_period,
        kmDrove: freq.km_drove,
      })),
      documents: documents.map((doc) => ({
        documentId: doc.document_id,
        documentType: doc.document_type_name || doc.document_type_id, // Use document name instead of ID
        documentTypeId: doc.document_type_id, // Keep ID for reference
        documentNumber: doc.reference_number, // Map to documentNumber for frontend
        referenceNumber: doc.reference_number,
        vehicleMaintenanceId: doc.vehicle_maintenance_id,
        permitCategory: doc.permit_category,
        permitCode: doc.permit_code,
        documentProvider: doc.document_provider,
        issuingAuthority: doc.document_provider, // Map to issuingAuthority for frontend
        coverageType: doc.coverage_type_id,
        premiumAmount: doc.premium_amount,
        issuedDate: doc.valid_from, // Map to issuedDate for frontend
        expiryDate: doc.valid_to, // Map to expiryDate for frontend
        validFrom: doc.valid_from,
        validTo: doc.valid_to,
        remarks: doc.remarks,
        fileName: doc.file_name,
        fileType: doc.file_type,
        fileData: doc.file_data, // base64 encoded file data
      })),
      status: vehicle.status,
      blacklistStatus: vehicle.blacklist_status,
      createdAt: vehicle.created_at,
      createdBy: vehicle.created_by,
      updatedAt: vehicle.updated_at,
    };

    // Add approval status to response if available
    if (userApprovalStatus) {
      response.userApprovalStatus = userApprovalStatus;
      response.approvalHistory = approvalHistory;
    }

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch vehicle details",
      error: error.message,
    });
  }
};

// ============================================================================
// UPDATE VEHICLE
// ============================================================================

/**
 * Update vehicle information
 * @route PUT /api/vehicle/:id
 */
const updateVehicle = async (req, res) => {
  const trx = await db.transaction();

  try {
    const { id } = req.params;
    const {
      basicInformation,
      specifications,
      capacityDetails,
      ownershipDetails,
      maintenanceHistory,
      serviceFrequency,
      documents,
    } = req.body;

    // Check if vehicle exists
    const existingVehicle = await db("vehicle_basic_information_hdr")
      .where("vehicle_id_code_hdr", id)
      .first();

    if (!existingVehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    // Combine basic information and specifications for validation
    const vehicleData = {
      ...basicInformation,
      ...specifications,
    };

    // Check for duplicate VIN (excluding current vehicle)
    if (
      vehicleData.vin_chassis_no &&
      vehicleData.vin_chassis_no !== existingVehicle.vin_chassis_no
    ) {
      const isDuplicate = await checkDuplicateVIN(
        vehicleData.vin_chassis_no,
        id
      );
      if (isDuplicate) {
        return res.status(400).json({
          success: false,
          message: "VIN/Chassis Number already exists",
          field: "basicInformation.vin",
        });
      }
    }

    // Check for duplicate GPS IMEI (excluding current vehicle)
    if (
      vehicleData.gps_tracker_imei_number &&
      vehicleData.gps_tracker_imei_number !==
        existingVehicle.gps_tracker_imei_number
    ) {
      const isDuplicate = await checkDuplicateGPSIMEI(
        vehicleData.gps_tracker_imei_number,
        id
      );
      if (isDuplicate) {
        return res.status(400).json({
          success: false,
          message: "GPS IMEI Number already exists",
          field: "basicInformation.gpsIMEI",
        });
      }
    }

    // Update vehicle basic information
    await trx("vehicle_basic_information_hdr")
      .where("vehicle_id_code_hdr", id)
      .update({
        maker_brand_description: vehicleData.maker_brand_description,
        maker_model: vehicleData.maker_model,
        vin_chassis_no: vehicleData.vin_chassis_no,
        vehicle_type_id: vehicleData.vehicle_type_id,
        vehicle_category: vehicleData.vehicle_category,
        vehicle_class_description: vehicleData.vehicle_class_description,
        engine_number: vehicleData.engine_number,
        body_type_desc: vehicleData.body_type_desc,
        fuel_type_id: vehicleData.fuel_type_id,
        vehicle_colour: vehicleData.vehicle_colour,
        engine_type_id: vehicleData.engine_type_id,
        emission_standard: vehicleData.emission_standard,
        financer: vehicleData.financer,
        manufacturing_month_year: vehicleData.manufacturing_month_year,
        unloading_weight: capacityDetails?.unloading_weight || 0,
        gross_vehicle_weight_kg: capacityDetails?.gross_vehicle_weight_kg || 0,
        volume_capacity_cubic_meter:
          capacityDetails?.volume_capacity_cubic_meter || 0,
        seating_capacity: capacityDetails?.seating_capacity || 0,
        transmission_type: vehicleData.transmission_type,
        usage_type_id: vehicleData.usage_type_id,
        safety_inspection_date: formatDateTimeForMySQL(
          vehicleData.safety_inspection_date
        ),
        taxes_and_fees: vehicleData.taxes_and_fees || 0,
        load_capacity_in_ton: capacityDetails?.load_capacity_in_ton || 0,
        cargo_dimensions_width: capacityDetails?.cargo_dimensions_width || 0,
        cargo_dimensions_height: capacityDetails?.cargo_dimensions_height || 0,
        cargo_dimensions_length: capacityDetails?.cargo_dimensions_length || 0,
        towing_capacity: capacityDetails?.towing_capacity || 0,
        suspension_type: vehicleData.suspension_type,
        tire_load_rating: capacityDetails?.tire_load_rating,
        vehicle_condition: capacityDetails?.vehicle_condition,
        fuel_tank_capacity: capacityDetails?.fuel_tank_capacity || 0,
        gps_tracker_imei_number: vehicleData.gps_tracker_imei_number,
        gps_tracker_active_flag: vehicleData.gps_tracker_active_flag || false,
        leasing_flag: vehicleData.leasing_flag || false,
        avg_running_speed: vehicleData.avg_running_speed || 0,
        max_running_speed: vehicleData.max_running_speed || 0,
        updated_by: req.user?.user_id || "SYSTEM",
        updated_at: db.fn.now(),
      });

    // Update or insert ownership details
    if (ownershipDetails && Object.keys(ownershipDetails).length > 0) {
      const existingOwnership = await db("vehicle_ownership_details")
        .where("vehicle_id_code", id)
        .first();

      // Check for duplicate registration number (excluding current)
      if (ownershipDetails.registrationNumber) {
        const isDuplicate = await checkDuplicateRegistration(
          ownershipDetails.registrationNumber,
          id
        );
        if (isDuplicate) {
          return res.status(400).json({
            success: false,
            message: "Registration Number already exists",
            field: "ownershipDetails.registrationNumber",
          });
        }
      }

      if (existingOwnership) {
        await trx("vehicle_ownership_details")
          .where("vehicle_id_code", id)
          .update({
            ownership_name: ownershipDetails.ownershipName,
            valid_from: formatDateForMySQL(ownershipDetails.validFrom),
            valid_to: formatDateForMySQL(ownershipDetails.validTo),
            registration_number: ownershipDetails.registrationNumber,
            registration_date: formatDateForMySQL(
              ownershipDetails.registrationDate
            ),
            registration_upto: formatDateForMySQL(
              ownershipDetails.registrationUpto
            ),
            purchase_date: formatDateForMySQL(ownershipDetails.purchaseDate),
            owner_sr_number: ownershipDetails.ownerSrNumber,
            state_code: ownershipDetails.stateCode,
            rto_code: ownershipDetails.rtoCode,
            present_address_id: ownershipDetails.presentAddressId,
            permanent_address_id: ownershipDetails.permanentAddressId,
            sale_amount: ownershipDetails.saleAmount || 0,
            updated_by: req.user?.user_id || "SYSTEM",
            updated_at: db.fn.now(),
          });
      } else {
        const ownershipId = await generateOwnershipId();
        await trx("vehicle_ownership_details").insert({
          vehicle_ownership_id: ownershipId,
          vehicle_id_code: id,
          ownership_name: ownershipDetails.ownershipName,
          valid_from: formatDateForMySQL(ownershipDetails.validFrom),
          valid_to: formatDateForMySQL(ownershipDetails.validTo),
          registration_number: ownershipDetails.registrationNumber,
          registration_date: formatDateForMySQL(
            ownershipDetails.registrationDate
          ),
          registration_upto: formatDateForMySQL(
            ownershipDetails.registrationUpto
          ),
          purchase_date: formatDateForMySQL(ownershipDetails.purchaseDate),
          owner_sr_number: ownershipDetails.ownerSrNumber,
          state_code: ownershipDetails.stateCode,
          rto_code: ownershipDetails.rtoCode,
          present_address_id: ownershipDetails.presentAddressId,
          permanent_address_id: ownershipDetails.permanentAddressId,
          sale_amount: ownershipDetails.saleAmount || 0,
          created_by: req.user?.user_id || "SYSTEM",
          updated_by: req.user?.user_id || "SYSTEM",
          status: "ACTIVE",
        });
      }
    }

    // Update or insert maintenance history
    if (maintenanceHistory && Object.keys(maintenanceHistory).length > 0) {
      const existingMaintenance = await db(
        "vehicle_maintenance_service_history"
      )
        .where("vehicle_id_code", id)
        .first();

      if (existingMaintenance) {
        await trx("vehicle_maintenance_service_history")
          .where("vehicle_id_code", id)
          .update({
            service_date: formatDateForMySQL(maintenanceHistory.serviceDate),
            service_remark: maintenanceHistory.serviceRemark,
            upcoming_service_date: formatDateForMySQL(
              maintenanceHistory.upcomingServiceDate
            ),
            type_of_service: maintenanceHistory.typeOfService,
            service_expense: maintenanceHistory.serviceExpense || 0,
            updated_by: req.user?.user_id || "SYSTEM",
            updated_at: db.fn.now(),
          });
      } else {
        const maintenanceId = await generateMaintenanceId();
        await trx("vehicle_maintenance_service_history").insert({
          vehicle_maintenance_id: maintenanceId,
          vehicle_id_code: id,
          service_date: formatDateForMySQL(maintenanceHistory.serviceDate),
          service_remark: maintenanceHistory.serviceRemark,
          upcoming_service_date: formatDateForMySQL(
            maintenanceHistory.upcomingServiceDate
          ),
          type_of_service: maintenanceHistory.typeOfService,
          service_expense: maintenanceHistory.serviceExpense || 0,
          created_by: req.user?.user_id || "SYSTEM",
          updated_by: req.user?.user_id || "SYSTEM",
          status: "ACTIVE",
        });
      }
    }

    // Handle documents (add new, update existing, or delete)
    if (documents && Array.isArray(documents)) {
      for (const doc of documents) {
        // If document has an ID, it's an existing document - update it
        if (doc.documentId) {
          // Update document metadata
          await trx("vehicle_documents")
            .where("document_id", doc.documentId)
            .update({
              document_type_id: doc.documentType,
              reference_number: doc.referenceNumber,
              valid_from: formatDateForMySQL(doc.validFrom),
              valid_to: formatDateForMySQL(doc.validTo),
              remarks: doc.remarks,
              updated_by: req.user?.user_id || "SYSTEM",
              updated_at: db.fn.now(),
            });

          // If new file data is provided, update the file
          if (doc.fileData && doc.fileName) {
            // Check if file exists
            const existingFile = await trx("document_upload")
              .where("system_reference_id", doc.documentId)
              .first();

            if (existingFile) {
              // Update existing file
              await trx("document_upload")
                .where("system_reference_id", doc.documentId)
                .update({
                  file_name: doc.fileName,
                  file_type: doc.fileType || "application/pdf",
                  file_xstring_value: doc.fileData,
                  updated_by: req.user?.user_id || "SYSTEM",
                  updated_at: db.fn.now(),
                });
            } else {
              // Insert new file
              const uploadId = await generateDocumentUploadId(trx);
              await trx("document_upload").insert({
                document_id: uploadId,
                file_name: doc.fileName,
                file_type: doc.fileType || "application/pdf",
                file_xstring_value: doc.fileData,
                system_reference_id: doc.documentId,
                is_verified: false,
                valid_from: formatDateForMySQL(doc.validFrom),
                valid_to: formatDateForMySQL(doc.validTo),
                created_by: req.user?.user_id || "SYSTEM",
                updated_by: req.user?.user_id || "SYSTEM",
                created_at: new Date(),
                updated_at: new Date(),
                status: "ACTIVE",
              });
            }
          }
        } else {
          // New document - insert it
          const documentId = await generateDocumentId();

          await trx("vehicle_documents").insert({
            document_id: documentId,
            vehicle_id_code: id,
            document_type_id: doc.documentType,
            reference_number: doc.referenceNumber,
            vehicle_maintenance_id: doc.vehicleMaintenanceId,
            permit_category: doc.permitCategory,
            permit_code: doc.permitCode,
            document_provider: doc.documentProvider,
            coverage_type_id: doc.coverageType,
            premium_amount: doc.premiumAmount || 0,
            valid_from: formatDateForMySQL(doc.validFrom),
            valid_to: formatDateForMySQL(doc.validTo),
            remarks: doc.remarks,
            created_by: req.user?.user_id || "SYSTEM",
            updated_by: req.user?.user_id || "SYSTEM",
            status: "ACTIVE",
          });

          // Insert document file if provided
          if (doc.fileData && doc.fileName) {
            const uploadId = await generateDocumentUploadId(trx);

            await trx("document_upload").insert({
              document_id: uploadId,
              file_name: doc.fileName,
              file_type: doc.fileType || "application/pdf",
              file_xstring_value: doc.fileData,
              system_reference_id: documentId,
              is_verified: false,
              valid_from: formatDateForMySQL(doc.validFrom),
              valid_to: formatDateForMySQL(doc.validTo),
              created_by: req.user?.user_id || "SYSTEM",
              updated_by: req.user?.user_id || "SYSTEM",
              created_at: new Date(),
              updated_at: new Date(),
              status: "ACTIVE",
            });
          }
        }
      }
    }

    await trx.commit();

    res.json({
      success: true,
      message: "Vehicle updated successfully",
      data: { vehicleId: id },
    });
  } catch (error) {
    await trx.rollback();
    console.error("Error updating vehicle:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update vehicle",
      error: error.message,
    });
  }
};

// ============================================================================
// DELETE VEHICLE (Soft Delete)
// ============================================================================

/**
 * Soft delete vehicle
 * @route DELETE /api/vehicle/:id
 */
const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if vehicle exists
    const vehicle = await db("vehicle_basic_information_hdr")
      .where("vehicle_id_code_hdr", id)
      .first();

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    // Soft delete - update status to INACTIVE
    await db("vehicle_basic_information_hdr")
      .where("vehicle_id_code_hdr", id)
      .update({
        status: "INACTIVE",
        updated_by: req.user?.user_id || "SYSTEM",
        updated_at: db.fn.now(),
      });

    res.json({
      success: true,
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete vehicle",
      error: error.message,
    });
  }
};

// ============================================================================
// GET MASTER DATA
// ============================================================================

/**
 * Get master data for vehicle dropdowns
 * @route GET /api/vehicle/master-data
 */

const getMasterData = async (req, res) => {
  try {
    // Get vehicle types
    const vehicleTypes = await db("vehicle_type_master")
      .where("status", "ACTIVE")
      .select("vehicle_type_id as value", "vehicle_type_description as label")
      .timeout(5000)
      .catch((err) => {
        // Fallback data matching actual database seed values
        return [
          { value: "VT001", label: "Heavy Duty Truck" },
          { value: "VT002", label: "Light Commercial Vehicle" },
          { value: "VT003", label: "Container Truck" },
        ];
      });

    // Get document types with configuration metadata (joined with doc_type_configuration)
    const vehicleDocuments = await db("document_name_master as dnm")
      .leftJoin("doc_type_configuration as dtc", function () {
        this.on("dnm.doc_name_master_id", "=", "dtc.doc_name_master_id").andOn(
          "dtc.user_type",
          "=",
          db.raw("?", ["VEHICLE"])
        );
      })
      .where("dnm.status", "ACTIVE")
      .whereIn("dnm.user_type", ["VEHICLE", "TRANSPORTER"])
      .where(function () {
        this.where("dnm.user_type", "VEHICLE").orWhere(function () {
          this.where("dnm.user_type", "TRANSPORTER").whereIn(
            "dnm.document_name",
            [
              "Vehicle Registration Certificate",
              "Vehicle Insurance",
              "PUC certificate",
              "Permit certificate",
              "Fitness Certificate",
              "Insurance Policy",
            ]
          );
        });
      })
      .select(
        "dnm.doc_name_master_id as value",
        "dnm.document_name as label",
        db.raw("COALESCE(dtc.is_mandatory, false) as isMandatory"),
        db.raw("COALESCE(dtc.is_expiry_required, false) as isExpiryRequired"),
        db.raw(
          "COALESCE(dtc.is_verification_required, false) as isVerificationRequired"
        )
      )
      .orderBy("dnm.document_name")
      .timeout(5000)
      .catch((err) => {
        // Silently use fallback data with configurations when database is unavailable
        // NOTE: Only 2 documents are mandatory as per current requirements
        return [
          {
            value: "DN001",
            label: "Vehicle Registration Certificate",
            isMandatory: true,
            isExpiryRequired: false,
            isVerificationRequired: true,
          },
          {
            value: "DN009",
            label: "Vehicle Insurance",
            isMandatory: false,
            isExpiryRequired: true,
            isVerificationRequired: true,
          },
          {
            value: "DN010",
            label: "PUC certificate",
            isMandatory: false,
            isExpiryRequired: true,
            isVerificationRequired: false,
          },
          {
            value: "DN012",
            label: "Fitness Certificate",
            isMandatory: true,
            isExpiryRequired: true,
            isVerificationRequired: false,
          },
          {
            value: "DN005",
            label: "Tax Certificate",
            isMandatory: false,
            isExpiryRequired: true,
            isVerificationRequired: false,
          },
          {
            value: "DN011",
            label: "Permit certificate",
            isMandatory: false,
            isExpiryRequired: true,
            isVerificationRequired: false,
          },
          {
            value: "DN006",
            label: "Service Bill",
            isMandatory: false,
            isExpiryRequired: false,
            isVerificationRequired: false,
          },
          {
            value: "DN007",
            label: "Inspection Report",
            isMandatory: false,
            isExpiryRequired: true,
            isVerificationRequired: false,
          },
          {
            value: "DN008",
            label: "Maintenance Contract",
            isMandatory: false,
            isExpiryRequired: true,
            isVerificationRequired: false,
          },
          {
            value: "DN010",
            label: "Vehicle Photos",
            isMandatory: false,
            isExpiryRequired: false,
            isVerificationRequired: false,
          },
          {
            value: "DN011",
            label: "Leasing Agreement",
            isMandatory: false,
            isExpiryRequired: true,
            isVerificationRequired: true,
          },
          {
            value: "DN012",
            label: "Hypothecation Certificate",
            isMandatory: false,
            isExpiryRequired: false,
            isVerificationRequired: false,
          },
        ];
      });

    const documentTypes = vehicleDocuments;

    // Engine types from database
    const engineTypes = await db("engine_type_master")
      .where("status", "ACTIVE")
      .select("engine_type_id as value", "engine_type as label")
      .orderBy("engine_type")
      .timeout(5000)
      .catch((err) => {
        // Fallback data when database is unavailable
        // Use short IDs matching database schema (VARCHAR(20) but typically ET001, ET002, etc.)
        return [
          { value: "ET001", label: "BS6 Diesel" },
          { value: "ET002", label: "BS6 Petrol" },
          { value: "ET003", label: "BS4 Diesel" },
          { value: "ET004", label: "BS4 Petrol" },
          { value: "ET005", label: "Euro 6 Diesel" },
          { value: "ET006", label: "Euro 6 Petrol" },
          { value: "ET007", label: "Electric Motor" },
          { value: "ET008", label: "CNG Engine" },
        ];
      });

    // Fuel types from database
    const fuelTypes = await db("fuel_type_master")
      .where("status", "ACTIVE")
      .select("fuel_type_id as value", "fuel_type as label")
      .orderBy("fuel_type")
      .timeout(5000)
      .catch((err) => {
        // Fallback data matching actual database seed values
        return [
          { value: "FT001", label: "Diesel" },
          { value: "FT002", label: "Petrol/Gasoline" },
          { value: "FT003", label: "CNG (Compressed Natural Gas)" },
          { value: "FT004", label: "LPG (Liquefied Petroleum Gas)" },
          { value: "FT005", label: "Electric" },
          { value: "FT006", label: "Hybrid (Petrol-Electric)" },
          { value: "FT007", label: "Hybrid (Diesel-Electric)" },
          { value: "FT008", label: "Hydrogen" },
        ];
      });

    // Transmission types
    const transmissionTypes = [
      { value: "MANUAL", label: "Manual" },
      { value: "AUTOMATIC", label: "Automatic" },
      { value: "AMT", label: "AMT (Automated Manual Transmission)" },
      { value: "CVT", label: "CVT (Continuously Variable Transmission)" },
      { value: "DCT", label: "DCT (Dual Clutch Transmission)" },
    ];

    // Emission standards
    const emissionStandards = [
      { value: "BS4", label: "BS4" },
      { value: "BS6", label: "BS6" },
      { value: "EURO4", label: "Euro 4" },
      { value: "EURO5", label: "Euro 5" },
      { value: "EURO6", label: "Euro 6" },
    ];

    // Usage types from database
    const usageTypes = await db("usage_type_master")
      .where("status", "ACTIVE")
      .select("usage_type_id as value", "usage_type as label")
      .orderBy("usage_type")
      .timeout(5000)
      .catch((err) => {
        // Fallback data matching actual database seed values
        return [
          { value: "UT001", label: "Commercial Transport" },
          { value: "UT002", label: "Personal Use" },
          { value: "UT003", label: "Rental Services" },
          { value: "UT004", label: "Goods Transportation" },
          { value: "UT005", label: "Construction/Mining" },
        ];
      });

    // Suspension types
    const suspensionTypes = [
      { value: "LEAF_SPRING", label: "Leaf Spring" },
      { value: "AIR_SUSPENSION", label: "Air Suspension" },
      { value: "COIL_SPRING", label: "Coil Spring" },
      { value: "TORSION_BAR", label: "Torsion Bar" },
      { value: "HYDRAULIC", label: "Hydraulic" },
    ];

    // Vehicle conditions
    const vehicleConditions = [
      { value: "EXCELLENT", label: "Excellent" },
      { value: "GOOD", label: "Good" },
      { value: "FAIR", label: "Fair" },
      { value: "POOR", label: "Poor" },
    ];

    // Loading capacity units
    const loadingCapacityUnits = [
      { value: "CBM", label: "Cubic Meter (CBM)" },
      { value: "CFT", label: "Cubic Feet (CFT)" },
      { value: "SQM", label: "Square Meter (SQM)" },
      { value: "SQF", label: "Square Feet (SQF)" },
    ];

    // Door types
    const doorTypes = [
      { value: "ROLL_UP", label: "Roll-up" },
      { value: "SWING", label: "Swing" },
      { value: "SLIDING", label: "Sliding" },
      { value: "NONE", label: "None" },
    ];

    // ? Coverage Types - Get from database
    const coverageTypes = await db("coverage_type_master")
      .where("status", "ACTIVE")
      .select("coverage_type_id as value", "coverage_type as label")
      .orderBy("coverage_type")
      .timeout(5000)
      .catch((err) => {
        console.error("Error fetching coverage types:", err);
        return [
          { value: "CT001", label: "Comprehensive Insurance" },
          { value: "CT002", label: "Third Party Liability" },
          { value: "CT003", label: "Collision Coverage" },
          { value: "CT004", label: "Cargo Insurance" },
        ];
      });

    res.json({
      success: true,
      data: {
        vehicleTypes,
        documentTypes,
        engineTypes,
        fuelTypes,
        transmissionTypes,
        emissionStandards,
        usageTypes,
        suspensionTypes,
        vehicleConditions,
        loadingCapacityUnits,
        doorTypes,
        coverageTypes, // ? Added coverage types
      },
    });
  } catch (error) {
    console.error("Error fetching master data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch master data",
      error: error.message,
    });
  }
};

// ============================================================================
// DRAFT WORKFLOW FUNCTIONS
// ============================================================================

/**
 * Save vehicle as draft
 * @route POST /api/vehicle/save-draft
 */
const saveVehicleAsDraft = async (req, res) => {
  const trx = await db.transaction();

  try {
    const {
      basicInformation,
      specifications,
      capacityDetails,
      ownershipDetails,
      maintenanceHistory,
      documents,
    } = req.body;

    const userId = req.user?.user_id || "SYSTEM";
    console.log("📝 Saving vehicle as draft - User:", userId);

    // ✅ MINIMAL VALIDATION - No required fields for draft (allow saving incomplete data)
    // Only check for duplicate registration if provided
    if (basicInformation?.vehicle_registration_number?.trim()) {
      const isDuplicate = await checkDuplicateRegistration(
        basicInformation.vehicle_registration_number.trim()
      );
      if (isDuplicate) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Vehicle Registration Number already exists",
            field: "basicInformation.vehicle_registration_number",
          },
        });
      }
    }

    // Generate vehicle ID
    const vehicleId = await generateVehicleId();

    // Combine basic information and specifications
    const vehicleData = {
      ...basicInformation,
      ...specifications,
    };

    // Insert vehicle basic information header with DRAFT status
    await trx("vehicle_basic_information_hdr").insert({
      vehicle_id_code_hdr: vehicleId,
      vehicle_registration_number: vehicleData.vehicle_registration_number,
      maker_brand_description: vehicleData.maker_brand_description || null,
      maker_model: vehicleData.maker_model || null,
      vin_chassis_no: vehicleData.vin_chassis_no || null,
      vehicle_type_id: vehicleData.vehicle_type_id || null,
      vehicle_category: vehicleData.vehicle_category || null,
      vehicle_class_description: vehicleData.vehicle_class_description || null,
      engine_number: vehicleData.engine_number || null,
      body_type_desc: vehicleData.body_type_desc || null,
      fuel_type_id: vehicleData.fuel_type_id || null,
      vehicle_colour: vehicleData.vehicle_colour || null,
      engine_type_id: vehicleData.engine_type_id || null,
      emission_standard: vehicleData.emission_standard || null,
      financer: vehicleData.financer || null,
      manufacturing_month_year: vehicleData.manufacturing_month_year || null,
      unloading_weight: capacityDetails?.unloading_weight || 0,
      gross_vehicle_weight_kg: capacityDetails?.gross_vehicle_weight_kg || 0,
      volume_capacity_cubic_meter:
        capacityDetails?.volume_capacity_cubic_meter || 0,
      seating_capacity: capacityDetails?.seating_capacity || 0,
      vehicle_registered_at: vehicleData.vehicle_registered_at || null,
      vehicle_registered_at_country:
        vehicleData.vehicle_registered_at_country || null,
      vehicle_registered_at_state:
        vehicleData.vehicle_registered_at_state || null,
      transmission_type: vehicleData.transmission_type || null,
      usage_type_id: vehicleData.usage_type_id || null,
      safety_inspection_date: formatDateTimeForMySQL(
        vehicleData.safety_inspection_date
      ),
      taxes_and_fees: vehicleData.taxes_and_fees || 0,
      load_capacity_in_ton: capacityDetails?.load_capacity_in_ton || 0,
      cargo_dimensions_width: capacityDetails?.cargo_dimensions_width || 0,
      cargo_dimensions_height: capacityDetails?.cargo_dimensions_height || 0,
      cargo_dimensions_length: capacityDetails?.cargo_dimensions_length || 0,
      towing_capacity: capacityDetails?.towing_capacity || 0,
      suspension_type: vehicleData.suspension_type || null,
      tire_load_rating: capacityDetails?.tire_load_rating || null,
      vehicle_condition: capacityDetails?.vehicle_condition || null,
      fuel_tank_capacity: capacityDetails?.fuel_tank_capacity || 0,
      blacklist_status: false,
      road_tax: vehicleData.road_tax || 0,
      fitness_upto: formatDateForMySQL(vehicleData.fitness_upto),
      tax_upto: formatDateForMySQL(vehicleData.tax_upto),
      gps_tracker_imei_number: vehicleData.gps_tracker_imei_number || null,
      gps_tracker_active_flag: vehicleData.gps_tracker_active_flag || false,
      gps_provider: vehicleData.gps_provider || null,
      leasing_flag: vehicleData.leasing_flag || false,
      leased_from: vehicleData.leased_from || null,
      lease_start_date: formatDateForMySQL(vehicleData.lease_start_date),
      lease_end_date: formatDateForMySQL(vehicleData.lease_end_date),
      mileage: vehicleData.mileage || 0,
      current_driver: vehicleData.current_driver || null,
      transporter_id: vehicleData.transporter_id || null,
      transporter_name: vehicleData.transporter_name || null,
      avg_running_speed: vehicleData.avg_running_speed || 0,
      max_running_speed: vehicleData.max_running_speed || 0,
      created_by: userId,
      updated_by: userId,
      status: "DRAFT", // Draft status
    });

    // Insert partial ownership details if provided
    if (ownershipDetails && Object.keys(ownershipDetails).length > 0) {
      const ownershipId = await generateOwnershipId();

      await trx("vehicle_ownership_details").insert({
        vehicle_ownership_id: ownershipId,
        vehicle_id_code: vehicleId,
        ownership_name: ownershipDetails.ownershipName || null,
        valid_from: formatDateForMySQL(ownershipDetails.validFrom),
        valid_to: formatDateForMySQL(ownershipDetails.validTo),
        registration_number: ownershipDetails.registrationNumber || null,
        registration_date: formatDateForMySQL(
          ownershipDetails.registrationDate
        ),
        registration_upto: formatDateForMySQL(
          ownershipDetails.registrationUpto
        ),
        purchase_date: formatDateForMySQL(ownershipDetails.purchaseDate),
        owner_sr_number: ownershipDetails.ownerSrNumber || null,
        state_code: ownershipDetails.stateCode || null,
        rto_code: ownershipDetails.rtoCode || null,
        present_address_id: ownershipDetails.presentAddressId || null,
        permanent_address_id: ownershipDetails.permanentAddressId || null,
        sale_amount: ownershipDetails.saleAmount || 0,
        created_by: userId,
        updated_by: userId,
        status: "DRAFT",
      });
    }

    // Insert partial maintenance history if provided
    if (maintenanceHistory && Object.keys(maintenanceHistory).length > 0) {
      const maintenanceId = await generateMaintenanceId();

      await trx("vehicle_maintenance_service_history").insert({
        vehicle_maintenance_id: maintenanceId,
        vehicle_id_code: vehicleId,
        service_date: formatDateForMySQL(maintenanceHistory.serviceDate),
        service_remark: maintenanceHistory.serviceRemark || null,
        upcoming_service_date: formatDateForMySQL(
          maintenanceHistory.upcomingServiceDate
        ),
        type_of_service: maintenanceHistory.typeOfService || null,
        service_expense: maintenanceHistory.serviceExpense || 0,
        created_by: userId,
        updated_by: userId,
        status: "DRAFT",
      });
    }

    // Insert partial documents if provided
    if (documents && Array.isArray(documents) && documents.length > 0) {
      for (const doc of documents) {
        if (doc.documentType || doc.referenceNumber) {
          const documentId = await generateDocumentId();

          await trx("vehicle_documents").insert({
            document_id: documentId,
            vehicle_id_code: vehicleId,
            document_type_id: doc.documentType || null,
            reference_number: doc.referenceNumber || null,
            vehicle_maintenance_id: doc.vehicleMaintenanceId || null,
            permit_category: doc.permitCategory || null,
            permit_code: doc.permitCode || null,
            document_provider: doc.documentProvider || null,
            coverage_type_id: doc.coverageType || null,
            premium_amount: doc.premiumAmount || 0,
            valid_from: formatDateForMySQL(doc.validFrom) || null,
            valid_to: formatDateForMySQL(doc.validTo) || null,
            remarks: doc.remarks || null,
            created_by: userId,
            updated_by: userId,
            status: "DRAFT",
          });

          if (doc.fileData && doc.fileName) {
            const uploadId = await generateDocumentUploadId(trx);

            await trx("document_upload").insert({
              document_id: uploadId,
              file_name: doc.fileName,
              file_type: doc.fileType || "application/pdf",
              file_xstring_value: doc.fileData,
              system_reference_id: documentId,
              is_verified: false,
              valid_from: formatDateForMySQL(doc.validFrom) || null,
              valid_to: formatDateForMySQL(doc.validTo) || null,
              created_by: userId,
              updated_by: userId,
              created_at: new Date(),
              updated_at: new Date(),
              status: "DRAFT",
            });
          }
        }
      }
    }

    await trx.commit();

    console.log("✅ Vehicle draft saved successfully:", vehicleId);

    return res.status(200).json({
      success: true,
      message: "Vehicle saved as draft successfully",
      data: {
        vehicleId,
        status: "DRAFT",
      },
    });
  } catch (error) {
    await trx.rollback();
    console.error("❌ Save vehicle draft error:", error);
    return res.status(500).json({
      success: false,
      error: {
        code: "SAVE_DRAFT_ERROR",
        message: "Failed to save vehicle as draft",
        details: error.message,
      },
    });
  }
};

/**
 * Update vehicle draft
 * @route PUT /api/vehicle/:id/update-draft
 */
const updateVehicleDraft = async (req, res) => {
  const trx = await db.transaction();

  try {
    const { id } = req.params;
    const {
      basicInformation,
      specifications,
      capacityDetails,
      ownershipDetails,
      maintenanceHistory,
      documents,
    } = req.body;

    const userId = req.user?.user_id || "SYSTEM";

    console.log("📝 Updating vehicle draft:", id, "User:", userId);

    // Verify it's a draft and belongs to the user
    const existing = await db("vehicle_basic_information_hdr")
      .where("vehicle_id_code_hdr", id)
      .first();

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Vehicle not found",
        },
      });
    }

    if (existing.status !== "DRAFT") {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_STATUS",
          message:
            "Can only update drafts. Use regular update endpoint for active vehicles",
        },
      });
    }

    if (existing.created_by !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You can only update your own drafts",
        },
      });
    }

    // No validation - allow updating any fields

    const vehicleData = {
      ...basicInformation,
      ...specifications,
    };

    // Update vehicle basic information
    await trx("vehicle_basic_information_hdr")
      .where("vehicle_id_code_hdr", id)
      .update({
        vehicle_registration_number:
          vehicleData.vehicle_registration_number || null,
        maker_brand_description: vehicleData.maker_brand_description || null,
        maker_model: vehicleData.maker_model || null,
        vin_chassis_no: vehicleData.vin_chassis_no || null,
        vehicle_type_id: vehicleData.vehicle_type_id || null,
        vehicle_category: vehicleData.vehicle_category || null,
        vehicle_class_description:
          vehicleData.vehicle_class_description || null,
        engine_number: vehicleData.engine_number || null,
        body_type_desc: vehicleData.body_type_desc || null,
        fuel_type_id: vehicleData.fuel_type_id || null,
        vehicle_colour: vehicleData.vehicle_colour || null,
        engine_type_id: vehicleData.engine_type_id || null,
        emission_standard: vehicleData.emission_standard || null,
        financer: vehicleData.financer || null,
        manufacturing_month_year: vehicleData.manufacturing_month_year || null,
        unloading_weight: capacityDetails?.unloading_weight || 0,
        gross_vehicle_weight_kg: capacityDetails?.gross_vehicle_weight_kg || 0,
        volume_capacity_cubic_meter:
          capacityDetails?.volume_capacity_cubic_meter || 0,
        seating_capacity: capacityDetails?.seating_capacity || 0,
        vehicle_registered_at: vehicleData.vehicle_registered_at || null,
        vehicle_registered_at_country:
          vehicleData.vehicle_registered_at_country || null,
        vehicle_registered_at_state:
          vehicleData.vehicle_registered_at_state || null,
        transmission_type: vehicleData.transmission_type || null,
        usage_type_id: vehicleData.usage_type_id || null,
        safety_inspection_date: formatDateTimeForMySQL(
          vehicleData.safety_inspection_date
        ),
        taxes_and_fees: vehicleData.taxes_and_fees || 0,
        load_capacity_in_ton: capacityDetails?.load_capacity_in_ton || 0,
        cargo_dimensions_width: capacityDetails?.cargo_dimensions_width || 0,
        cargo_dimensions_height: capacityDetails?.cargo_dimensions_height || 0,
        cargo_dimensions_length: capacityDetails?.cargo_dimensions_length || 0,
        towing_capacity: capacityDetails?.towing_capacity || 0,
        suspension_type: vehicleData.suspension_type || null,
        tire_load_rating: capacityDetails?.tire_load_rating || null,
        vehicle_condition: capacityDetails?.vehicle_condition || null,
        fuel_tank_capacity: capacityDetails?.fuel_tank_capacity || 0,
        road_tax: vehicleData.road_tax || 0,
        fitness_upto: formatDateForMySQL(vehicleData.fitness_upto),
        tax_upto: formatDateForMySQL(vehicleData.tax_upto),
        gps_tracker_imei_number: vehicleData.gps_tracker_imei_number || null,
        gps_tracker_active_flag: vehicleData.gps_tracker_active_flag || false,
        gps_provider: vehicleData.gps_provider || null,
        leasing_flag: vehicleData.leasing_flag || false,
        leased_from: vehicleData.leased_from || null,
        lease_start_date: formatDateForMySQL(vehicleData.lease_start_date),
        lease_end_date: formatDateForMySQL(vehicleData.lease_end_date),
        mileage: vehicleData.mileage || 0,
        current_driver: vehicleData.current_driver || null,
        transporter_id: vehicleData.transporter_id || null,
        transporter_name: vehicleData.transporter_name || null,
        avg_running_speed: vehicleData.avg_running_speed || 0,
        max_running_speed: vehicleData.max_running_speed || 0,
        updated_by: userId,
        updated_at: db.fn.now(),
      });

    // Update or insert ownership details
    if (ownershipDetails && Object.keys(ownershipDetails).length > 0) {
      const existingOwnership = await trx("vehicle_ownership_details")
        .where("vehicle_id_code", id)
        .first();

      if (existingOwnership) {
        // Update existing ownership record
        await trx("vehicle_ownership_details")
          .where("vehicle_id_code", id)
          .update({
            ownership_name: ownershipDetails.ownershipName || null,
            valid_from: formatDateForMySQL(ownershipDetails.validFrom),
            valid_to: formatDateForMySQL(ownershipDetails.validTo),
            registration_number: ownershipDetails.registrationNumber || null,
            registration_date: formatDateForMySQL(
              ownershipDetails.registrationDate
            ),
            registration_upto: formatDateForMySQL(
              ownershipDetails.registrationUpto
            ),
            purchase_date: formatDateForMySQL(ownershipDetails.purchaseDate),
            owner_sr_number: ownershipDetails.ownerSrNumber || null,
            state_code: ownershipDetails.stateCode || null,
            rto_code: ownershipDetails.rtoCode || null,
            present_address_id: ownershipDetails.presentAddressId || null,
            permanent_address_id: ownershipDetails.permanentAddressId || null,
            sale_amount: ownershipDetails.saleAmount || 0,
            updated_by: userId,
            updated_at: db.fn.now(),
          });
      } else {
        // Insert new ownership record only if none exists
        const ownershipId = await generateOwnershipId();

        await trx("vehicle_ownership_details").insert({
          vehicle_ownership_id: ownershipId,
          vehicle_id_code: id,
          ownership_name: ownershipDetails.ownershipName || null,
          valid_from: formatDateForMySQL(ownershipDetails.validFrom),
          valid_to: formatDateForMySQL(ownershipDetails.validTo),
          registration_number: ownershipDetails.registrationNumber || null,
          registration_date: formatDateForMySQL(
            ownershipDetails.registrationDate
          ),
          registration_upto: formatDateForMySQL(
            ownershipDetails.registrationUpto
          ),
          purchase_date: formatDateForMySQL(ownershipDetails.purchaseDate),
          owner_sr_number: ownershipDetails.ownerSrNumber || null,
          state_code: ownershipDetails.stateCode || null,
          rto_code: ownershipDetails.rtoCode || null,
          present_address_id: ownershipDetails.presentAddressId || null,
          permanent_address_id: ownershipDetails.permanentAddressId || null,
          sale_amount: ownershipDetails.saleAmount || 0,
          created_by: userId,
          updated_by: userId,
          status: "DRAFT",
        });
      }
    }

    // Update or insert maintenance history
    if (maintenanceHistory && Object.keys(maintenanceHistory).length > 0) {
      const existingMaintenance = await trx(
        "vehicle_maintenance_service_history"
      )
        .where("vehicle_id_code", id)
        .first();

      if (existingMaintenance) {
        // Update existing maintenance record
        await trx("vehicle_maintenance_service_history")
          .where("vehicle_id_code", id)
          .update({
            service_date: formatDateForMySQL(maintenanceHistory.serviceDate),
            service_remark: maintenanceHistory.serviceRemark || null,
            upcoming_service_date: formatDateForMySQL(
              maintenanceHistory.upcomingServiceDate
            ),
            type_of_service: maintenanceHistory.typeOfService || null,
            service_expense: maintenanceHistory.serviceExpense || 0,
            updated_by: userId,
            updated_at: db.fn.now(),
          });
      } else {
        // Insert new maintenance record only if none exists
        const maintenanceId = await generateMaintenanceId();

        await trx("vehicle_maintenance_service_history").insert({
          vehicle_maintenance_id: maintenanceId,
          vehicle_id_code: id,
          service_date: formatDateForMySQL(maintenanceHistory.serviceDate),
          service_remark: maintenanceHistory.serviceRemark || null,
          upcoming_service_date: formatDateForMySQL(
            maintenanceHistory.upcomingServiceDate
          ),
          type_of_service: maintenanceHistory.typeOfService || null,
          service_expense: maintenanceHistory.serviceExpense || 0,
          created_by: userId,
          updated_by: userId,
          status: "DRAFT",
        });
      }
    }

    // Handle documents - for drafts, we'll replace all documents to allow flexible editing
    if (documents && Array.isArray(documents)) {
      // Delete existing documents for this vehicle (since documents can be added/removed freely in drafts)
      await trx("document_upload")
        .whereIn("system_reference_id", function () {
          this.select("document_id")
            .from("vehicle_documents")
            .where("vehicle_id_code", id);
        })
        .del();
      await trx("vehicle_documents").where("vehicle_id_code", id).del();

      // Insert all documents from the payload
      for (const doc of documents) {
        if (doc.documentType) {
          // Only insert if documentType is specified
          const documentId = await generateDocumentId();

          await trx("vehicle_documents").insert({
            document_id: documentId,
            vehicle_id_code: id,
            document_type_id: doc.documentType || null,
            reference_number: doc.referenceNumber || null,
            vehicle_maintenance_id: doc.vehicleMaintenanceId || null,
            permit_category: doc.permitCategory || null,
            permit_code: doc.permitCode || null,
            document_provider: doc.documentProvider || null,
            coverage_type_id: doc.coverageType || null,
            premium_amount: doc.premiumAmount || 0,
            valid_from: formatDateForMySQL(doc.validFrom) || null,
            valid_to: formatDateForMySQL(doc.validTo) || null,
            remarks: doc.remarks || null,
            created_by: userId,
            updated_by: userId,
            status: "DRAFT",
          });

          if (doc.fileData && doc.fileName) {
            const uploadId = await generateDocumentUploadId(trx);

            await trx("document_upload").insert({
              document_id: uploadId,
              file_name: doc.fileName,
              file_type: doc.fileType || "application/pdf",
              file_xstring_value: doc.fileData,
              system_reference_id: documentId,
              is_verified: false,
              valid_from: formatDateForMySQL(doc.validFrom) || null,
              valid_to: formatDateForMySQL(doc.validTo) || null,
              created_by: userId,
              updated_by: userId,
              created_at: new Date(),
              updated_at: new Date(),
              status: "DRAFT",
            });
          }
        }
      }
    }

    await trx.commit();

    console.log("✅ Vehicle draft updated successfully:", id);

    return res.status(200).json({
      success: true,
      message: "Draft updated successfully",
      data: {
        vehicleId: id,
        status: "DRAFT",
      },
    });
  } catch (error) {
    await trx.rollback();
    console.error("❌ Update vehicle draft error:", error);
    return res.status(500).json({
      success: false,
      error: {
        code: "UPDATE_DRAFT_ERROR",
        message: "Failed to update draft",
        details: error.message,
      },
    });
  }
};

/**
 * Submit vehicle draft for approval
 * @route PUT /api/vehicle/:id/submit-draft
 */
const submitVehicleFromDraft = async (req, res) => {
  const trx = await db.transaction();

  try {
    const { id } = req.params;
    const {
      basicInformation,
      specifications,
      capacityDetails,
      ownershipDetails,
      maintenanceHistory,
      serviceFrequency,
      documents,
    } = req.body;

    const userId = req.user?.user_id || "SYSTEM";

    console.log(
      "📤 Submitting vehicle draft for approval:",
      id,
      "User:",
      userId
    );

    // Verify it's a draft and belongs to the user
    const existing = await db("vehicle_basic_information_hdr")
      .where("vehicle_id_code_hdr", id)
      .first();

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Vehicle not found",
        },
      });
    }

    if (existing.status !== "DRAFT") {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_STATUS",
          message:
            "Can only submit drafts for approval. This vehicle is already submitted.",
        },
      });
    }

    if (existing.created_by !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You can only submit your own drafts",
        },
      });
    }

    // Combine basic information and specifications for validation
    const vehicleData = {
      ...basicInformation,
      ...specifications,
    };

    // Full validation - Same as createVehicle
    const validationErrors = [
      ...validateBasicInformation(vehicleData),
      ...validateSpecifications(vehicleData),
    ];

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: validationErrors,
      });
    }

    // Check for duplicates (excluding current vehicle)
    if (vehicleData.vin_chassis_no) {
      const isDuplicate = await checkDuplicateVIN(
        vehicleData.vin_chassis_no,
        id
      );
      if (isDuplicate) {
        return res.status(400).json({
          success: false,
          message: "VIN/Chassis Number already exists",
          field: "basicInformation.vin",
        });
      }
    }

    if (vehicleData.gps_tracker_imei_number) {
      const isDuplicate = await checkDuplicateGPSIMEI(
        vehicleData.gps_tracker_imei_number,
        id
      );
      if (isDuplicate) {
        return res.status(400).json({
          success: false,
          message: "GPS IMEI Number already exists",
          field: "basicInformation.gpsIMEI",
        });
      }
    }

    if (vehicleData?.vehicle_registration_number) {
      const isDuplicate = await checkDuplicateRegistration(
        vehicleData.vehicle_registration_number,
        id
      );
      if (isDuplicate) {
        return res.status(400).json({
          success: false,
          message: "Vehicle Registration Number already exists",
          field: "basicInformation.registrationNumber",
        });
      }
    }

    // Update vehicle basic information to PENDING status
    await trx("vehicle_basic_information_hdr")
      .where("vehicle_id_code_hdr", id)
      .update({
        vehicle_registration_number: vehicleData.vehicle_registration_number,
        maker_brand_description: vehicleData.maker_brand_description,
        maker_model: vehicleData.maker_model,
        vin_chassis_no: vehicleData.vin_chassis_no,
        vehicle_type_id: vehicleData.vehicle_type_id,
        vehicle_category: vehicleData.vehicle_category,
        vehicle_class_description: vehicleData.vehicle_class_description,
        engine_number: vehicleData.engine_number,
        body_type_desc: vehicleData.body_type_desc,
        fuel_type_id: vehicleData.fuel_type_id,
        vehicle_colour: vehicleData.vehicle_colour,
        engine_type_id: vehicleData.engine_type_id,
        emission_standard: vehicleData.emission_standard,
        financer: vehicleData.financer,
        manufacturing_month_year: vehicleData.manufacturing_month_year,
        unloading_weight: capacityDetails?.unloading_weight || 0,
        gross_vehicle_weight_kg: capacityDetails?.gross_vehicle_weight_kg || 0,
        volume_capacity_cubic_meter:
          capacityDetails?.volume_capacity_cubic_meter || 0,
        seating_capacity: capacityDetails?.seating_capacity || 0,
        vehicle_registered_at: vehicleData.vehicle_registered_at,
        transmission_type: vehicleData.transmission_type,
        usage_type_id: vehicleData.usage_type_id,
        safety_inspection_date: formatDateTimeForMySQL(
          vehicleData.safety_inspection_date
        ),
        taxes_and_fees: vehicleData.taxes_and_fees || 0,
        load_capacity_in_ton: capacityDetails?.load_capacity_in_ton || 0,
        cargo_dimensions_width: capacityDetails?.cargo_dimensions_width || 0,
        cargo_dimensions_height: capacityDetails?.cargo_dimensions_height || 0,
        cargo_dimensions_length: capacityDetails?.cargo_dimensions_length || 0,
        towing_capacity: capacityDetails?.towing_capacity || 0,
        suspension_type: vehicleData.suspension_type,
        tire_load_rating: capacityDetails?.tire_load_rating,
        vehicle_condition: capacityDetails?.vehicle_condition,
        fuel_tank_capacity: capacityDetails?.fuel_tank_capacity || 0,
        road_tax: vehicleData.road_tax || 0,
        gps_tracker_imei_number: vehicleData.gps_tracker_imei_number,
        gps_tracker_active_flag: vehicleData.gps_tracker_active_flag || false,
        leasing_flag: vehicleData.leasing_flag || false,
        avg_running_speed: vehicleData.avg_running_speed || 0,
        max_running_speed: vehicleData.max_running_speed || 0,
        updated_by: userId,
        updated_at: db.fn.now(),
        status: "PENDING", // Change to PENDING
      });

    // Delete existing related data and re-insert with ACTIVE status
    await trx("vehicle_ownership_details").where("vehicle_id_code", id).del();
    await trx("vehicle_maintenance_service_history")
      .where("vehicle_id_code", id)
      .del();
    await trx("service_frequency_master").where("vehicle_id", id).del();
    await trx("document_upload")
      .whereIn("system_reference_id", function () {
        this.select("document_id")
          .from("vehicle_documents")
          .where("vehicle_id_code", id);
      })
      .del();
    await trx("vehicle_documents").where("vehicle_id_code", id).del();

    // Re-insert ownership details with ACTIVE status
    if (ownershipDetails && Object.keys(ownershipDetails).length > 0) {
      const ownershipId = await generateOwnershipId();

      await trx("vehicle_ownership_details").insert({
        vehicle_ownership_id: ownershipId,
        vehicle_id_code: id,
        ownership_name: ownershipDetails.ownershipName,
        valid_from: formatDateForMySQL(ownershipDetails.validFrom),
        valid_to: formatDateForMySQL(ownershipDetails.validTo),
        registration_number: ownershipDetails.registrationNumber,
        registration_date: formatDateForMySQL(
          ownershipDetails.registrationDate
        ),
        registration_upto: formatDateForMySQL(
          ownershipDetails.registrationUpto
        ),
        purchase_date: formatDateForMySQL(ownershipDetails.purchaseDate),
        owner_sr_number: ownershipDetails.ownerSrNumber,
        state_code: ownershipDetails.stateCode,
        rto_code: ownershipDetails.rtoCode,
        present_address_id: ownershipDetails.presentAddressId,
        permanent_address_id: ownershipDetails.permanentAddressId,
        sale_amount: ownershipDetails.saleAmount || 0,
        created_by: userId,
        updated_by: userId,
        status: "ACTIVE",
      });
    }

    // Re-insert maintenance history with ACTIVE status
    if (maintenanceHistory && Object.keys(maintenanceHistory).length > 0) {
      const maintenanceId = await generateMaintenanceId();

      await trx("vehicle_maintenance_service_history").insert({
        vehicle_maintenance_id: maintenanceId,
        vehicle_id_code: id,
        service_date: formatDateForMySQL(maintenanceHistory.serviceDate),
        service_remark: maintenanceHistory.serviceRemark,
        upcoming_service_date: formatDateForMySQL(
          maintenanceHistory.upcomingServiceDate
        ),
        type_of_service: maintenanceHistory.typeOfService,
        service_expense: maintenanceHistory.serviceExpense || 0,
        created_by: userId,
        updated_by: userId,
        status: "ACTIVE",
      });
    }

    // Re-insert service frequency with ACTIVE status
    if (serviceFrequency && Object.keys(serviceFrequency).length > 0) {
      const sequenceNumber = await generateSequenceNumber(id);

      await trx("service_frequency_master").insert({
        vehicle_id: id,
        sequence_number: sequenceNumber,
        time_period: serviceFrequency.timePeriod,
        km_drove: serviceFrequency.kmDrove || 0,
        created_by: userId,
        updated_by: userId,
        status: "ACTIVE",
      });
    }

    // Re-insert documents with ACTIVE status
    if (documents && Array.isArray(documents) && documents.length > 0) {
      for (const doc of documents) {
        const documentId = await generateDocumentId();

        await trx("vehicle_documents").insert({
          document_id: documentId,
          vehicle_id_code: id,
          document_type_id: doc.documentType,
          reference_number: doc.referenceNumber,
          vehicle_maintenance_id: doc.vehicleMaintenanceId,
          permit_category: doc.permitCategory,
          permit_code: doc.permitCode,
          document_provider: doc.documentProvider,
          coverage_type_id: doc.coverageType,
          premium_amount: doc.premiumAmount || 0,
          valid_from: formatDateForMySQL(doc.validFrom),
          valid_to: formatDateForMySQL(doc.validTo),
          remarks: doc.remarks,
          created_by: userId,
          updated_by: userId,
          status: "ACTIVE",
        });

        if (doc.fileData && doc.fileName) {
          const uploadId = await generateDocumentUploadId(trx);

          await trx("document_upload").insert({
            document_id: uploadId,
            file_name: doc.fileName,
            file_type: doc.fileType || "application/pdf",
            file_xstring_value: doc.fileData,
            system_reference_id: documentId,
            is_verified: false,
            valid_from: formatDateForMySQL(doc.validFrom),
            valid_to: formatDateForMySQL(doc.validTo),
            created_by: userId,
            updated_by: userId,
            created_at: new Date(),
            updated_at: new Date(),
            status: "ACTIVE",
          });
        }
      }
    }

    await trx.commit();

    console.log("✅ Vehicle draft submitted for approval successfully:", id);

    return res.status(200).json({
      success: true,
      message:
        "Vehicle draft submitted for approval successfully. Status changed to PENDING.",
      data: {
        vehicleId: id,
        status: "PENDING",
      },
    });
  } catch (error) {
    await trx.rollback();
    console.error("❌ Submit vehicle draft error:", error);
    return res.status(500).json({
      success: false,
      error: {
        code: "SUBMIT_DRAFT_ERROR",
        message: "Failed to submit vehicle draft for approval",
        details: error.message,
      },
    });
  }
};

/**
 * Delete vehicle draft
 * @route DELETE /api/vehicle/:id/delete-draft
 */
const deleteVehicleDraft = async (req, res) => {
  const trx = await db.transaction();

  try {
    const { id } = req.params;
    const userId = req.user?.user_id || "SYSTEM";

    console.log("🗑️ Deleting vehicle draft:", id, "User:", userId);

    // Verify it's a draft and belongs to the user
    const existing = await db("vehicle_basic_information_hdr")
      .where("vehicle_id_code_hdr", id)
      .first();

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Vehicle not found",
        },
      });
    }

    if (existing.status !== "DRAFT") {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_STATUS",
          message: "Can only delete drafts",
        },
      });
    }

    if (existing.created_by !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You can only delete your own drafts",
        },
      });
    }

    // Delete all related data (hard delete)
    await trx("vehicle_ownership_details").where("vehicle_id_code", id).del();
    await trx("vehicle_maintenance_service_history")
      .where("vehicle_id_code", id)
      .del();
    await trx("service_frequency_master").where("vehicle_id", id).del();
    await trx("document_upload")
      .whereIn("system_reference_id", function () {
        this.select("document_id")
          .from("vehicle_documents")
          .where("vehicle_id_code", id);
      })
      .del();
    await trx("vehicle_documents").where("vehicle_id_code", id).del();
    await trx("vehicle_basic_information_hdr")
      .where("vehicle_id_code_hdr", id)
      .del();

    await trx.commit();

    console.log("✅ Vehicle draft deleted successfully:", id);

    return res.status(200).json({
      success: true,
      message: "Vehicle draft deleted successfully",
    });
  } catch (error) {
    await trx.rollback();
    console.error("❌ Delete vehicle draft error:", error);
    return res.status(500).json({
      success: false,
      error: {
        code: "DELETE_DRAFT_ERROR",
        message: "Failed to delete vehicle draft",
        details: error.message,
      },
    });
  }
};

/**
 * Lookup vehicle details from RC database
 * This function integrates with external RC API to fetch vehicle information
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const lookupVehicleByRC = async (req, res) => {
  try {
    const { registrationNumber } = req.params;

    // Validate registration number
    if (!registrationNumber || registrationNumber.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Valid registration number is required (minimum 8 characters)",
      });
    }

    // Clean and format registration number
    const cleanRegNumber = registrationNumber.trim().toUpperCase();

    // Call actual RC API
    const axios = require("axios");
    const apiUrl = `https://api.maventic.in/mapi/getVehicleDetailsByVehicleNumber`;

    try {
      const response = await axios.get(apiUrl, {
        timeout: 30000, // 30 second timeout
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${process.env.VEHICLE_API_KEY}`,
        },
        data: {
          vehiclenumber: cleanRegNumber,
        },
        // Add SSL configuration to handle certificate issues
        httpsAgent: new (require("https").Agent)({
          rejectUnauthorized: false,
        }),
      });

      console.log("RC API Response:", response.data);
      // Check if response has data
      if (
        response.data &&
        response.data.response &&
        response.data.response.length > 0
      ) {
        const rcResponse = response.data.response[0];

        if (
          rcResponse.responseStatus === "SUCCESS" &&
          rcResponse.jsonResponse?.VehicleDetails
        ) {
          // Return successful response
          res.json({
            success: true,
            message: "Vehicle details fetched successfully",
            response: response.data.response,
          });
        } else {
          // Vehicle not found
          return res.status(404).json({
            success: false,
            message: "Registration number not found in RC database",
          });
        }
      } else {
        // No data found
        return res.status(404).json({
          success: false,
          message: "Registration number not found in RC database",
        });
      }
    } catch (apiError) {
      console.error("RC API Error:", apiError.message);

      // Handle different types of API errors
      if (apiError.code === "ECONNABORTED") {
        return res.status(408).json({
          success: false,
          message: "Request timeout - RC API is taking too long to respond",
        });
      } else if (apiError.response?.status === 404) {
        return res.status(404).json({
          success: false,
          message: "Registration number not found in RC database",
        });
      } else if (apiError.response?.status >= 500) {
        return res.status(502).json({
          success: false,
          message: "Server error occurred while fetching vehicle details",
        });
      } else {
        return res.status(502).json({
          success: false,
          message: "Error occurred in server while fetching vehicle details",
        });
      }
    }
  } catch (error) {
    console.error("Error in RC lookup:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred in server while processing request",
      error: error.message,
    });
  }
};

module.exports = {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  getMasterData,
  lookupVehicleByRC,
  saveVehicleAsDraft,
  deleteVehicleDraft,
  submitVehicleFromDraft,
  updateVehicleDraft,
};
