const knex = require("../config/database");
const { Country, State, City } = require("country-state-city");
const ERROR_MESSAGES = require("../utils/errorMessages");
const { validateDocumentNumber } = require("../utils/documentValidation");

// Helper function to generate unique IDs
const generateDriverId = async () => {
  const result = await knex("driver_basic_information")
    .count("* as count")
    .first();
  const count = parseInt(result.count) + 1;
  return `DRV${count.toString().padStart(4, "0")}`;
};

// Collision-resistant ID generation - checks if ID exists before returning
const generateAddressId = async (trx = knex) => {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const result = await trx("tms_address").count("* as count").first();
    const count = parseInt(result.count) + 1 + attempts;
    const newId = `ADDR${count.toString().padStart(4, "0")}`;

    // Check if this ID already exists
    const existing = await trx("tms_address")
      .where("address_id", newId)
      .first();
    if (!existing) {
      return newId;
    }

    attempts++;
  }

  throw new Error("Failed to generate unique address ID after 100 attempts");
};

const generateDocumentId = async (trx = knex) => {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const result = await trx("driver_documents").count("* as count").first();
    const count = parseInt(result.count) + 1 + attempts;
    const newId = `DDOC${count.toString().padStart(4, "0")}`;

    const existing = await trx("driver_documents")
      .where("document_id", newId)
      .first();
    if (!existing) {
      return newId;
    }

    attempts++;
  }

  throw new Error("Failed to generate unique document ID after 100 attempts");
};

// Validation functions
const validatePhoneNumber = (phoneNumber) => {
  // Allow exactly 10 digits only (no country code, no special characters)
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phoneNumber);
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Date formatting helper
const formatDateForInput = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString().split("T")[0];
};

// Create Driver Controller
const createDriver = async (req, res) => {
  const trx = await knex.transaction();

  try {
    const { basicInfo, addresses, documents } = req.body;

    console.log("🔍 Starting driver creation - VALIDATION PHASE");

    // ========================================
    // PHASE 1: COMPLETE VALIDATION (NO DATABASE OPERATIONS)
    // ========================================

    // Validate basic info
    if (!basicInfo.fullName || basicInfo.fullName.trim().length < 2) {
      await trx.rollback();
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Driver name must be at least 2 characters long",
          field: "fullName",
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Validate phone number
    if (!basicInfo.phoneNumber || !validatePhoneNumber(basicInfo.phoneNumber)) {
      await trx.rollback();
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message:
            "Please enter a valid 10-digit phone number starting with 6, 7, 8, or 9",
          field: "phoneNumber",
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Validate email
    if (basicInfo.emailId && !validateEmail(basicInfo.emailId)) {
      await trx.rollback();
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Please enter a valid email address",
          field: "emailId",
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Validate alternate phone number if provided
    if (
      basicInfo.alternatePhoneNumber &&
      !validatePhoneNumber(basicInfo.alternatePhoneNumber)
    ) {
      await trx.rollback();
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Please enter a valid 10-digit alternate phone number",
          field: "alternatePhoneNumber",
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Validate WhatsApp number if provided
    if (
      basicInfo.whatsAppNumber &&
      !validatePhoneNumber(basicInfo.whatsAppNumber)
    ) {
      await trx.rollback();
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Please enter a valid 10-digit WhatsApp number",
          field: "whatsAppNumber",
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Check for duplicate phone number
    const existingPhoneCheck = await trx("driver_basic_information")
      .where("phone_number", basicInfo.phoneNumber)
      .first();

    if (existingPhoneCheck) {
      await trx.rollback();
      return res.status(400).json({
        success: false,
        error: {
          code: "DUPLICATE_PHONE",
          message: `Phone number ${basicInfo.phoneNumber} already exists. Please use a unique phone number`,
          field: "phoneNumber",
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Check for duplicate email if provided
    if (basicInfo.emailId) {
      const existingEmailCheck = await trx("driver_basic_information")
        .where("email_id", basicInfo.emailId)
        .first();

      if (existingEmailCheck) {
        await trx.rollback();
        return res.status(400).json({
          success: false,
          error: {
            code: "DUPLICATE_EMAIL",
            message: `Email ${basicInfo.emailId} already exists. Please use a unique email`,
            field: "emailId",
          },
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Validate addresses
    if (!addresses || addresses.length === 0) {
      await trx.rollback();
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "At least one address is required",
          field: "addresses",
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Validate address fields
    for (let i = 0; i < addresses.length; i++) {
      const address = addresses[i];

      if (!address.addressTypeId) {
        await trx.rollback();
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: `Address ${i + 1}: Address type is required`,
            field: `addresses[${i}].addressTypeId`,
          },
          timestamp: new Date().toISOString(),
        });
      }

      if (!address.country) {
        await trx.rollback();
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: `Address ${i + 1}: Country is required`,
            field: `addresses[${i}].country`,
          },
          timestamp: new Date().toISOString(),
        });
      }

      if (!address.state) {
        await trx.rollback();
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: `Address ${i + 1}: State is required`,
            field: `addresses[${i}].state`,
          },
          timestamp: new Date().toISOString(),
        });
      }

      if (!address.city) {
        await trx.rollback();
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: `Address ${i + 1}: City is required`,
            field: `addresses[${i}].city`,
          },
          timestamp: new Date().toISOString(),
        });
      }

      if (!address.postalCode || address.postalCode.trim().length === 0) {
        await trx.rollback();
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: `Address ${i + 1}: Postal code is required`,
            field: `addresses[${i}].postalCode`,
          },
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Validate documents if provided
    if (documents && documents.length > 0) {
      for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];

        if (!doc.documentType) {
          await trx.rollback();
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: `Document ${i + 1}: Document type is required`,
              field: `documents[${i}].documentType`,
            },
            timestamp: new Date().toISOString(),
          });
        }

        if (!doc.documentNumber || doc.documentNumber.trim().length === 0) {
          await trx.rollback();
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: `Document ${i + 1}: Document number is required`,
              field: `documents[${i}].documentNumber`,
            },
            timestamp: new Date().toISOString(),
          });
        }

        // Validate document type exists and resolve ID
        const docTypeInfo = await trx("document_name_master")
          .where(function () {
            this.where("doc_name_master_id", doc.documentType).orWhere(
              "document_name",
              doc.documentType
            );
          })
          .where("status", "ACTIVE")
          .first();

        if (!docTypeInfo) {
          await trx.rollback();
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: `Document ${i + 1}: Invalid document type "${
                doc.documentType
              }"`,
              field: `documents[${i}].documentType`,
            },
            timestamp: new Date().toISOString(),
          });
        }

        // Store resolved ID for later use
        doc.documentTypeId = docTypeInfo.doc_name_master_id;
        doc.documentTypeName = docTypeInfo.document_name;

        // Check for duplicate document number
        const existingDocCheck = await trx("driver_documents")
          .where("document_type_id", doc.documentTypeId)
          .where("document_number", doc.documentNumber)
          .first();

        if (existingDocCheck) {
          await trx.rollback();
          return res.status(400).json({
            success: false,
            error: {
              code: "DUPLICATE_DOCUMENT",
              message: `Document ${i + 1}: ${doc.documentTypeName} number ${
                doc.documentNumber
              } already exists`,
              field: `documents[${i}].documentNumber`,
            },
            timestamp: new Date().toISOString(),
          });
        }
      }
    }

    console.log(
      "✅ All validations passed - proceeding to database operations"
    );

    // ========================================
    // PHASE 2: DATABASE OPERATIONS
    // ========================================

    const currentTimestamp = new Date();
    const currentUser = req.user?.user_id || "SYSTEM";

    // Generate driver ID
    const driverId = await generateDriverId();

    console.log(`📝 Generated driver ID: ${driverId}`);

    // Insert basic info
    await trx("driver_basic_information").insert({
      driver_id: driverId,
      full_name: basicInfo.fullName,
      date_of_birth: basicInfo.dateOfBirth || null,
      gender: basicInfo.gender || null,
      blood_group: basicInfo.bloodGroup || null,
      phone_number: basicInfo.phoneNumber,
      email_id: basicInfo.emailId || null,
      whats_app_number: basicInfo.whatsAppNumber || null,
      alternate_phone_number: basicInfo.alternatePhoneNumber || null,
      avg_rating: 0.0,
      created_at: currentTimestamp,
      created_on: currentTimestamp,
      created_by: currentUser,
      updated_at: currentTimestamp,
      updated_on: currentTimestamp,
      updated_by: currentUser,
      status: "ACTIVE",
    });

    console.log(`✅ Driver basic information inserted for ${driverId}`);

    // Insert addresses
    for (const address of addresses) {
      const addressId = await generateAddressId(trx);

      await trx("tms_address").insert({
        address_id: addressId,
        user_reference_id: driverId,
        user_type: "DRIVER",
        country: address.country,
        state: address.state,
        city: address.city,
        district: address.district || null,
        street_1: address.street1 || null,
        street_2: address.street2 || null,
        postal_code: address.postalCode,
        address_type_id: address.addressTypeId,
        is_primary: address.isPrimary || false,
        created_at: currentTimestamp,
        created_on: currentTimestamp,
        created_by: currentUser,
        updated_at: currentTimestamp,
        updated_on: currentTimestamp,
        updated_by: currentUser,
        status: "ACTIVE",
      });

      console.log(`✅ Address ${addressId} inserted for driver ${driverId}`);
    }

    // Insert documents if provided
    if (documents && documents.length > 0) {
      for (const doc of documents) {
        const documentId = await generateDocumentId(trx);
        const documentUniqueId = `${driverId}-${documentId}`;

        await trx("driver_documents").insert({
          document_unique_id: documentUniqueId,
          driver_id: driverId,
          document_id: documentId,
          document_type_id: doc.documentTypeId || doc.documentType,
          document_number: doc.documentNumber,
          issuing_country: doc.country || null,
          issuing_state: doc.state || null,
          valid_from: doc.validFrom || null,
          valid_to: doc.validTo || null,
          active_flag: doc.status !== false,
          remarks: doc.remarks || null,
          created_at: currentTimestamp,
          created_on: currentTimestamp,
          created_by: currentUser,
          updated_at: currentTimestamp,
          updated_on: currentTimestamp,
          updated_by: currentUser,
          status: "ACTIVE",
        });

        console.log(
          `✅ Document ${documentId} inserted for driver ${driverId}`
        );
      }
    }

    await trx.commit();

    res.status(201).json({
      success: true,
      message: "Driver created successfully",
      data: {
        driverId,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    await trx.rollback();

    console.error("Error creating driver:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to create driver",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      timestamp: new Date().toISOString(),
    });
  }
};

// Update Driver Controller
const updateDriver = async (req, res) => {
  const trx = await knex.transaction();

  try {
    const { id } = req.params;
    const { basicInfo, addresses, documents } = req.body;

    // Validate driver exists
    const existingDriver = await trx("driver_basic_information")
      .where("driver_id", id)
      .first();

    if (!existingDriver) {
      await trx.rollback();
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Driver not found",
        },
        timestamp: new Date().toISOString(),
      });
    }

    const currentTimestamp = new Date();
    const currentUser = req.user?.user_id || "SYSTEM";

    // Update basic info if provided
    if (basicInfo) {
      // Validate phone number
      if (
        basicInfo.phoneNumber &&
        !validatePhoneNumber(basicInfo.phoneNumber)
      ) {
        await trx.rollback();
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message:
              "Please enter a valid 10-digit phone number starting with 6, 7, 8, or 9",
            field: "phoneNumber",
          },
          timestamp: new Date().toISOString(),
        });
      }

      // Check for duplicate phone number (excluding current driver)
      if (basicInfo.phoneNumber) {
        const existingPhoneCheck = await trx("driver_basic_information")
          .where("phone_number", basicInfo.phoneNumber)
          .whereNot("driver_id", id)
          .first();

        if (existingPhoneCheck) {
          await trx.rollback();
          return res.status(400).json({
            success: false,
            error: {
              code: "DUPLICATE_PHONE",
              message: `Phone number ${basicInfo.phoneNumber} already exists`,
              field: "phoneNumber",
            },
            timestamp: new Date().toISOString(),
          });
        }
      }

      // Validate email if provided
      if (basicInfo.emailId && !validateEmail(basicInfo.emailId)) {
        await trx.rollback();
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Please enter a valid email address",
            field: "emailId",
          },
          timestamp: new Date().toISOString(),
        });
      }

      // Check for duplicate email (excluding current driver)
      if (basicInfo.emailId) {
        const existingEmailCheck = await trx("driver_basic_information")
          .where("email_id", basicInfo.emailId)
          .whereNot("driver_id", id)
          .first();

        if (existingEmailCheck) {
          await trx.rollback();
          return res.status(400).json({
            success: false,
            error: {
              code: "DUPLICATE_EMAIL",
              message: `Email ${basicInfo.emailId} already exists`,
              field: "emailId",
            },
            timestamp: new Date().toISOString(),
          });
        }
      }

      await trx("driver_basic_information")
        .where("driver_id", id)
        .update({
          full_name: basicInfo.fullName,
          date_of_birth: basicInfo.dateOfBirth || null,
          gender: basicInfo.gender || null,
          blood_group: basicInfo.bloodGroup || null,
          phone_number: basicInfo.phoneNumber,
          email_id: basicInfo.emailId || null,
          whats_app_number: basicInfo.whatsAppNumber || null,
          alternate_phone_number: basicInfo.alternatePhoneNumber || null,
          updated_at: currentTimestamp,
          updated_on: currentTimestamp,
          updated_by: currentUser,
        });
    }

    // Update addresses if provided
    if (addresses && addresses.length > 0) {
      // Mark existing addresses as inactive
      await trx("tms_address")
        .where("user_reference_id", id)
        .where("user_type", "DRIVER")
        .update({ status: "INACTIVE" });

      // Insert new addresses
      for (const address of addresses) {
        const addressId = await generateAddressId(trx);

        await trx("tms_address").insert({
          address_id: addressId,
          user_reference_id: id,
          user_type: "DRIVER",
          country: address.country,
          state: address.state,
          city: address.city,
          district: address.district || null,
          street_1: address.street1 || null,
          street_2: address.street2 || null,
          postal_code: address.postalCode,
          address_type_id: address.addressTypeId,
          is_primary: address.isPrimary || false,
          created_at: currentTimestamp,
          created_on: currentTimestamp,
          created_by: currentUser,
          updated_at: currentTimestamp,
          updated_on: currentTimestamp,
          updated_by: currentUser,
          status: "ACTIVE",
        });
      }
    }

    // Update documents if provided
    if (documents && documents.length > 0) {
      // Mark existing documents as inactive
      await trx("driver_documents")
        .where("driver_id", id)
        .update({ status: "INACTIVE" });

      // Insert new documents
      for (const doc of documents) {
        // Validate and resolve document type
        const docTypeInfo = await trx("document_name_master")
          .where(function () {
            this.where("doc_name_master_id", doc.documentType).orWhere(
              "document_name",
              doc.documentType
            );
          })
          .where("status", "ACTIVE")
          .first();

        if (docTypeInfo) {
          doc.documentTypeId = docTypeInfo.doc_name_master_id;
        }

        const documentId = await generateDocumentId(trx);
        const documentUniqueId = `${id}-${documentId}`;

        await trx("driver_documents").insert({
          document_unique_id: documentUniqueId,
          driver_id: id,
          document_id: documentId,
          document_type_id: doc.documentTypeId || doc.documentType,
          document_number: doc.documentNumber,
          issuing_country: doc.country || null,
          issuing_state: doc.state || null,
          valid_from: doc.validFrom || null,
          valid_to: doc.validTo || null,
          active_flag: doc.status !== false,
          remarks: doc.remarks || null,
          created_at: currentTimestamp,
          created_on: currentTimestamp,
          created_by: currentUser,
          updated_at: currentTimestamp,
          updated_on: currentTimestamp,
          updated_by: currentUser,
          status: "ACTIVE",
        });
      }
    }

    await trx.commit();

    res.status(200).json({
      success: true,
      message: "Driver updated successfully",
      data: {
        driverId: id,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    await trx.rollback();

    console.error("Error updating driver:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to update driver",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      timestamp: new Date().toISOString(),
    });
  }
};

// Get all drivers with pagination and filters
const getDrivers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 25,
      search = "",
      driverId = "",
      status = "",
      fullName = "",
      phoneNumber = "",
      emailId = "",
      gender = "",
      bloodGroup = "",
      licenseNumber = "",
      country = "",
      state = "",
      city = "",
      postalCode = "",
      avgRating = "",
    } = req.query;

    // Convert page and limit to integers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Build base query with address and primary license
    let query = knex("driver_basic_information as dbi")
      .leftJoin("tms_address as addr", function () {
        this.on("dbi.driver_id", "=", "addr.user_reference_id")
          .andOn("addr.user_type", "=", knex.raw("'DRIVER'"))
          .andOn("addr.status", "=", knex.raw("'ACTIVE'"))
          .andOn("addr.is_primary", "=", knex.raw("true"));
      })
      .leftJoin(
        knex("driver_documents")
          .select(
            "driver_id",
            knex.raw(
              "GROUP_CONCAT(document_number SEPARATOR ', ') as license_numbers"
            )
          )
          .where("status", "ACTIVE")
          .groupBy("driver_id")
          .as("dd"),
        "dbi.driver_id",
        "dd.driver_id"
      )
      .select(
        "dbi.driver_id",
        "dbi.full_name",
        "dbi.date_of_birth",
        "dbi.gender",
        "dbi.blood_group",
        "dbi.phone_number",
        "dbi.email_id",
        "dbi.whats_app_number",
        "dbi.alternate_phone_number",
        "dbi.avg_rating",
        "dbi.status",
        "dbi.created_by",
        "dbi.created_on",
        "dbi.updated_on",
        "addr.country",
        "addr.state",
        "addr.city",
        "addr.district",
        "addr.postal_code",
        "dd.license_numbers"
      );

    // Count query for total records
    let countQuery = knex("driver_basic_information as dbi");

    // Apply filters
    if (search) {
      const searchPattern = `%${search}%`;
      query.where(function () {
        this.where("dbi.driver_id", "like", searchPattern)
          .orWhere("dbi.full_name", "like", searchPattern)
          .orWhere("dbi.phone_number", "like", searchPattern)
          .orWhere("dbi.email_id", "like", searchPattern);
      });
      countQuery.where(function () {
        this.where("dbi.driver_id", "like", searchPattern)
          .orWhere("dbi.full_name", "like", searchPattern)
          .orWhere("dbi.phone_number", "like", searchPattern)
          .orWhere("dbi.email_id", "like", searchPattern);
      });
    }

    if (driverId) {
      query.where("dbi.driver_id", "like", `%${driverId}%`);
      countQuery.where("dbi.driver_id", "like", `%${driverId}%`);
    }

    if (fullName) {
      query.where("dbi.full_name", "like", `%${fullName}%`);
      countQuery.where("dbi.full_name", "like", `%${fullName}%`);
    }

    if (phoneNumber) {
      query.where("dbi.phone_number", "like", `%${phoneNumber}%`);
      countQuery.where("dbi.phone_number", "like", `%${phoneNumber}%`);
    }

    if (emailId) {
      query.where("dbi.email_id", "like", `%${emailId}%`);
      countQuery.where("dbi.email_id", "like", `%${emailId}%`);
    }

    if (status) {
      query.where("dbi.status", status);
      countQuery.where("dbi.status", status);
    }

    if (gender) {
      query.where("dbi.gender", gender);
      countQuery.where("dbi.gender", gender);
    }

    if (bloodGroup) {
      query.where("dbi.blood_group", bloodGroup);
      countQuery.where("dbi.blood_group", bloodGroup);
    }

    // New filters for license number and address fields
    if (licenseNumber) {
      query.whereRaw(
        `dbi.driver_id IN (SELECT driver_id FROM driver_documents WHERE document_number LIKE ? AND status = 'ACTIVE')`,
        [`%${licenseNumber}%`]
      );
      countQuery.whereRaw(
        `dbi.driver_id IN (SELECT driver_id FROM driver_documents WHERE document_number LIKE ? AND status = 'ACTIVE')`,
        [`%${licenseNumber}%`]
      );
    }

    if (country) {
      // Convert ISO code to country name if it's a code (2 characters)
      let countryValue = country;
      if (country.length === 2) {
        const countryObj = Country.getCountryByCode(country);
        countryValue = countryObj ? countryObj.name : country;
      }

      query.whereRaw(
        `dbi.driver_id IN (SELECT user_reference_id FROM tms_address WHERE user_type = 'DRIVER' AND country LIKE ? AND status = 'ACTIVE' AND is_primary = true)`,
        [`%${countryValue}%`]
      );
      countQuery.whereRaw(
        `dbi.driver_id IN (SELECT user_reference_id FROM tms_address WHERE user_type = 'DRIVER' AND country LIKE ? AND status = 'ACTIVE' AND is_primary = true)`,
        [`%${countryValue}%`]
      );
    }

    if (state) {
      // Convert ISO code to state name if we have country context
      let stateValue = state;
      if (country && state.length <= 3) {
        // Get country code for state lookup
        let countryCode = country;
        if (country.length !== 2) {
          // If country is a name, try to find its code
          const countryObj = Country.getAllCountries().find(
            (c) => c.name.toLowerCase() === country.toLowerCase()
          );
          countryCode = countryObj ? countryObj.isoCode : country;
        }

        // Get state name from ISO code
        const stateObj = State.getStateByCodeAndCountry(state, countryCode);
        stateValue = stateObj ? stateObj.name : state;
      }

      query.whereRaw(
        `dbi.driver_id IN (SELECT user_reference_id FROM tms_address WHERE user_type = 'DRIVER' AND state LIKE ? AND status = 'ACTIVE' AND is_primary = true)`,
        [`%${stateValue}%`]
      );
      countQuery.whereRaw(
        `dbi.driver_id IN (SELECT user_reference_id FROM tms_address WHERE user_type = 'DRIVER' AND state LIKE ? AND status = 'ACTIVE' AND is_primary = true)`,
        [`%${stateValue}%`]
      );
    }

    if (city) {
      query.whereRaw(
        `dbi.driver_id IN (SELECT user_reference_id FROM tms_address WHERE user_type = 'DRIVER' AND city LIKE ? AND status = 'ACTIVE' AND is_primary = true)`,
        [`%${city}%`]
      );
      countQuery.whereRaw(
        `dbi.driver_id IN (SELECT user_reference_id FROM tms_address WHERE user_type = 'DRIVER' AND city LIKE ? AND status = 'ACTIVE' AND is_primary = true)`,
        [`%${city}%`]
      );
    }

    if (postalCode) {
      query.whereRaw(
        `dbi.driver_id IN (SELECT user_reference_id FROM tms_address WHERE user_type = 'DRIVER' AND postal_code LIKE ? AND status = 'ACTIVE' AND is_primary = true)`,
        [`%${postalCode}%`]
      );
      countQuery.whereRaw(
        `dbi.driver_id IN (SELECT user_reference_id FROM tms_address WHERE user_type = 'DRIVER' AND postal_code LIKE ? AND status = 'ACTIVE' AND is_primary = true)`,
        [`%${postalCode}%`]
      );
    }

    if (avgRating) {
      const rating = parseFloat(avgRating);
      if (!isNaN(rating)) {
        query.where("dbi.avg_rating", ">=", rating);
        countQuery.where("dbi.avg_rating", ">=", rating);
      }
    }

    // Get total count
    const [{ count: total }] = await countQuery.count("* as count");

    // Get paginated results
    const drivers = await query
      .orderBy("dbi.driver_id", "asc")
      .limit(limitNum)
      .offset(offset);

    // Transform data to match frontend expected format
    const transformedDrivers = drivers.map((driver) => ({
      id: driver.driver_id,
      fullName: driver.full_name,
      dateOfBirth: formatDateForInput(driver.date_of_birth),
      gender: driver.gender,
      bloodGroup: driver.blood_group,
      phoneNumber: driver.phone_number,
      emailId: driver.email_id,
      whatsAppNumber: driver.whats_app_number,
      alternatePhoneNumber: driver.alternate_phone_number,
      avgRating: driver.avg_rating || 0,
      status: driver.status,
      licenseNumbers: driver.license_numbers || "N/A",
      country: driver.country,
      state: driver.state,
      city: driver.city,
      district: driver.district,
      postalCode: driver.postal_code,
      createdBy: driver.created_by,
      createdOn: formatDateForInput(driver.created_on),
      updatedOn: formatDateForInput(driver.updated_on),
    }));

    res.json({
      success: true,
      data: transformedDrivers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching drivers:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "FETCH_ERROR",
        message: "Failed to fetch drivers",
        details: error.message,
      },
      timestamp: new Date().toISOString(),
    });
  }
};

// Get single driver by ID with full details
const getDriverById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get basic info
    const driver = await knex("driver_basic_information")
      .where("driver_id", id)
      .first();

    if (!driver) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Driver not found",
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Get addresses for this driver
    const addresses = await knex("tms_address")
      .where("user_reference_id", id)
      .where("user_type", "DRIVER")
      .where("status", "ACTIVE")
      .select("*");

    // Get documents for this driver
    const documents = await knex("driver_documents as dd")
      .leftJoin(
        "document_name_master as dnm",
        "dd.document_type_id",
        "dnm.doc_name_master_id"
      )
      .where("dd.driver_id", id)
      .where("dd.status", "ACTIVE")
      .select("dd.*", "dnm.document_name as documentTypeName");

    // Get history information
    const history = await knex("driver_history_information")
      .where("driver_id", id)
      .where("status", "ACTIVE")
      .orderBy("from_date", "desc")
      .select("*");

    // Get accident/violation records
    const accidents = await knex("driver_accident_violation")
      .where("driver_id", id)
      .where("status", "ACTIVE")
      .orderBy("date", "desc")
      .select("*");

    // Get transporter mappings
    const transporterMappings = await knex("transporter_driver_mapping as tdm")
      .leftJoin(
        "transporter_general_info as tgi",
        "tdm.transporter_id",
        "tgi.transporter_id"
      )
      .where("tdm.driver_id", id)
      .where("tdm.status", "ACTIVE")
      .select("tdm.*", "tgi.business_name as transporterName");

    // Get vehicle mappings
    const vehicleMappings = await knex("vehicle_driver_mapping as vdm")
      .where("vdm.driver_id", id)
      .where("vdm.status", "ACTIVE")
      .select("vdm.*");

    // Get blacklist mappings (where driver is blacklisted)
    const blacklistMappings = await knex("blacklist_mapping")
      .where("user_type", "DRIVER")
      .where("user_id", id)
      .where("status", "ACTIVE")
      .select("*");

    // Format response
    const response = {
      driverId: driver.driver_id,
      basicInfo: {
        fullName: driver.full_name,
        dateOfBirth: formatDateForInput(driver.date_of_birth),
        gender: driver.gender,
        bloodGroup: driver.blood_group,
        phoneNumber: driver.phone_number,
        emailId: driver.email_id,
        whatsAppNumber: driver.whats_app_number,
        alternatePhoneNumber: driver.alternate_phone_number,
        avgRating: driver.avg_rating,
        status: driver.status,
        createdBy: driver.created_by,
        createdOn: formatDateForInput(driver.created_on),
        updatedBy: driver.updated_by,
        updatedOn: formatDateForInput(driver.updated_on),
      },
      addresses: addresses.map((addr) => ({
        addressId: addr.address_id,
        addressTypeId: addr.address_type_id,
        country: addr.country,
        state: addr.state,
        city: addr.city,
        district: addr.district,
        street1: addr.street_1,
        street2: addr.street_2,
        postalCode: addr.postal_code,
        isPrimary: addr.is_primary,
      })),
      documents: documents.map((doc) => ({
        documentId: doc.document_id,
        documentType: doc.documentTypeName || doc.document_type_id,
        documentTypeId: doc.document_type_id,
        documentNumber: doc.document_number,
        issuingCountry: doc.issuing_country,
        issuingState: doc.issuing_state,
        validFrom: formatDateForInput(doc.valid_from),
        validTo: formatDateForInput(doc.valid_to),
        status: doc.active_flag,
        remarks: doc.remarks,
      })),
      history: history.map((hist) => ({
        historyId: hist.driver_history_id,
        employer: hist.employer,
        fromDate: formatDateForInput(hist.from_date),
        toDate: formatDateForInput(hist.to_date),
        employmentStatus: hist.employment_status,
        jobTitle: hist.job_title,
        createdOn: formatDateForInput(hist.created_on),
      })),
      accidents: accidents.map((acc) => ({
        violationId: acc.driver_violation_id,
        type: acc.type,
        description: acc.description,
        date: formatDateForInput(acc.date),
        vehicleRegnNumber: acc.vehicle_regn_number,
        createdOn: formatDateForInput(acc.created_on),
      })),
      transporterMappings: transporterMappings.map((tm) => ({
        mappingId: tm.td_mapping_id,
        transporterId: tm.transporter_id,
        transporterName: tm.transporterName,
        validFrom: formatDateForInput(tm.valid_from),
        validTo: formatDateForInput(tm.valid_to),
        activeFlag: tm.active_flag,
        remark: tm.remark,
      })),
      vehicleMappings: vehicleMappings.map((vm) => ({
        mappingId: vm.vd_mapping_id,
        vehicleId: vm.vehicle_id,
        validFrom: formatDateForInput(vm.valid_from),
        validTo: formatDateForInput(vm.valid_to),
        activeFlag: vm.active_flag,
        remark: vm.remark,
      })),
      blacklistMappings: blacklistMappings.map((bm) => ({
        mappingId: bm.blacklist_mapping_id,
        blacklistedBy: bm.blacklisted_by,
        blacklistedById: bm.blacklisted_by_id,
        validFrom: formatDateForInput(bm.valid_from),
        validTo: formatDateForInput(bm.valid_to),
        remark: bm.remark,
      })),
    };

    res.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching driver details:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "FETCH_ERROR",
        message: "Failed to fetch driver details",
        details: error.message,
      },
      timestamp: new Date().toISOString(),
    });
  }
};

// Get master data for dropdowns
const getMasterData = async (req, res) => {
  try {
    // Get countries
    const countries = Country.getAllCountries().map((country) => ({
      code: country.isoCode,
      name: country.name,
    }));

    // Get document types (driver-specific) with fallback
    let documentTypes = [];
    try {
      documentTypes = await knex("document_type_master")
        .select("document_type_id as value", "document_type as label")
        .where("status", "ACTIVE")
        .orderBy("document_type");
    } catch (err) {
      console.warn("document_type_master table error:", err.message);
      documentTypes = [
        { value: "DT001", label: "License" },
        { value: "DT002", label: "ID Proof" },
      ];
    }

    // Get document names (driver-specific: licenses, ID proofs) with fallback
    let documentNames = [];
    try {
      documentNames = await knex("document_name_master")
        .select("doc_name_master_id as value", "document_name as label")
        .where("status", "ACTIVE")
        .whereIn("doc_name_master_id", [
          "LIC001",
          "LIC002",
          "LIC003",
          "LIC004",
          "LIC005",
          "LIC006",
          "ID001",
          "ID002",
        ])
        .orderBy("document_name");
    } catch (err) {
      console.warn("document_name_master table error:", err.message);
      documentNames = [
        { value: "LIC001", label: "LMV" },
        { value: "LIC002", label: "TRANS" },
        { value: "LIC003", label: "HGMV" },
        { value: "LIC004", label: "HMV" },
        { value: "LIC005", label: "HPMV" },
        { value: "LIC006", label: "LDRXCV" },
        { value: "ID001", label: "Pan" },
        { value: "ID002", label: "Aadhar" },
      ];
    }

    // Get address types with fallback
    let addressTypes = [];
    try {
      addressTypes = await knex("address_type_master")
        .select("address_type_id as value", "address as label")
        .where("status", "ACTIVE")
        .orderBy("address");
    } catch (err) {
      console.warn("address_type_master table error:", err.message);
      addressTypes = [
        { value: "PERM", label: "Permanent" },
        { value: "CURR", label: "Current" },
        { value: "TEMP", label: "Temporary" },
      ];
    }

    // Get gender options with fallback
    let genderOptions = [];
    try {
      genderOptions = await knex("gender_master")
        .select("gender_id as value", "gender_name as label")
        .where("status", "ACTIVE")
        .orderBy("gender_name");
    } catch (err) {
      console.warn("gender_master table error:", err.message);
      genderOptions = [
        { value: "M", label: "Male" },
        { value: "F", label: "Female" },
        { value: "O", label: "Others" },
      ];
    }

    // Get blood group options (static fallback)
    const bloodGroupOptions = [
      { value: "A+", label: "A+" },
      { value: "A-", label: "A-" },
      { value: "B+", label: "B+" },
      { value: "B-", label: "B-" },
      { value: "AB+", label: "AB+" },
      { value: "AB-", label: "AB-" },
      { value: "O+", label: "O+" },
      { value: "O-", label: "O-" },
    ];

    res.json({
      success: true,
      data: {
        countries,
        documentTypes,
        documentNames,
        addressTypes,
        genderOptions,
        bloodGroupOptions,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching master data:", error);
    console.error("Error stack:", error.stack);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
    });
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch master data",
        details: error.message, // Include error message for debugging
      },
      timestamp: new Date().toISOString(),
    });
  }
};

// Get states by country
const getStatesByCountry = async (req, res) => {
  try {
    const { countryCode } = req.params;

    const states = State.getStatesOfCountry(countryCode).map((state) => ({
      code: state.isoCode,
      name: state.name,
    }));

    res.json({
      success: true,
      data: states,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching states:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch states",
      },
      timestamp: new Date().toISOString(),
    });
  }
};

// Get cities by country and state
const getCitiesByCountryAndState = async (req, res) => {
  try {
    const { countryCode, stateCode } = req.params;

    const cities = City.getCitiesOfState(countryCode, stateCode).map(
      (city) => ({
        name: city.name,
      })
    );

    res.json({
      success: true,
      data: cities,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching cities:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch cities",
      },
      timestamp: new Date().toISOString(),
    });
  }
};

module.exports = {
  createDriver,
  updateDriver,
  getDrivers,
  getDriverById,
  getMasterData,
  getStatesByCountry,
  getCitiesByCountryAndState,
};
