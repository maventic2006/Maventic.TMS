const knex = require("../config/database");
const { Country, State, City } = require("country-state-city");
const fs = require("fs").promises;
const path = require("path");
const bcrypt = require("bcrypt");
const ERROR_MESSAGES = require("../utils/errorMessages");
const { validateDocumentNumber } = require("../utils/documentValidation");

// Helper function to generate unique IDs
const generateTransporterId = async () => {
  const result = await knex("transporter_general_info")
    .count("* as count")
    .first();
  const count = parseInt(result.count) + 1;
  return `T${count.toString().padStart(3, "0")}`;
};

// Collision-resistant ID generation - checks if ID exists before returning
// Uses in-memory tracking to avoid duplicates within same transaction
const generateAddressId = async (trx = knex, generatedIds = new Set()) => {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const result = await trx("tms_address").count("* as count").first();
    const count = parseInt(result.count) + 1 + attempts;
    const newId = `ADDR${count.toString().padStart(4, "0")}`;

    console.log(`  🔍 Checking address ID: ${newId} (attempt ${attempts + 1})`);

    // Check if this ID already exists in database OR in current generation batch
    const existsInDb = await trx("tms_address")
      .where("address_id", newId)
      .first();

    if (!existsInDb && !generatedIds.has(newId)) {
      console.log(`  ✅ Address ID ${newId} is unique`);
      generatedIds.add(newId); // Track this ID to prevent duplicates in same batch
      return newId;
    }

    console.log(`  ❌ Address ID ${newId} already exists, trying next...`);
    attempts++;
  }

  throw new Error("Failed to generate unique address ID after 100 attempts");
};

const generateContactId = async (trx = knex, generatedIds = new Set()) => {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const result = await trx("transporter_contact").count("* as count").first();
    const count = parseInt(result.count) + 1 + attempts;
    const newId = `TC${count.toString().padStart(4, "0")}`;

    // Check if this ID already exists in database OR in current generation batch
    const existsInDb = await trx("transporter_contact")
      .where("tcontact_id", newId)
      .first();

    if (!existsInDb && !generatedIds.has(newId)) {
      generatedIds.add(newId); // Track this ID to prevent duplicates in same batch
      return newId;
    }

    attempts++;
  }

  throw new Error("Failed to generate unique contact ID after 100 attempts");
};

const generateServiceAreaHeaderId = async (trx = knex) => {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const result = await trx("transporter_service_area_hdr")
      .count("* as count")
      .first();
    const count = parseInt(result.count) + 1 + attempts;
    const newId = `SAH${count.toString().padStart(4, "0")}`;

    const existing = await trx("transporter_service_area_hdr")
      .where("service_area_hdr_id", newId)
      .first();
    if (!existing) {
      return newId;
    }

    attempts++;
  }

  throw new Error(
    "Failed to generate unique service area header ID after 100 attempts"
  );
};

const generateServiceAreaItemId = async (trx = knex) => {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const result = await trx("transporter_service_area_itm")
      .count("* as count")
      .first();
    const count = parseInt(result.count) + 1 + attempts;
    const newId = `SAI${count.toString().padStart(4, "0")}`;

    const existing = await trx("transporter_service_area_itm")
      .where("service_area_itm_id", newId)
      .first();
    if (!existing) {
      return newId;
    }

    attempts++;
  }

  throw new Error(
    "Failed to generate unique service area item ID after 100 attempts"
  );
};

const generateDocumentId = async (trx = knex, generatedIds = new Set()) => {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const result = await trx("transporter_documents")
      .count("* as count")
      .first();
    const count = parseInt(result.count) + 1 + attempts;
    const newId = `DOC${count.toString().padStart(4, "0")}`;

    // Check if this ID already exists in database OR in current generation batch
    const existsInDb = await trx("transporter_documents")
      .where("document_id", newId)
      .first();

    if (!existsInDb && !generatedIds.has(newId)) {
      generatedIds.add(newId); // Track this ID to prevent duplicates in same batch
      return newId;
    }

    attempts++;
  }

  throw new Error("Failed to generate unique document ID after 100 attempts");
};

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

// Generate Transporter Admin User ID (format: TA0001, TA0002, etc.)
const generateTransporterAdminUserId = async (trx = knex) => {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const result = await trx("user_master")
      .where("user_type_id", "UT002") // Transporter Admin type
      .count("* as count")
      .first();
    const count = parseInt(result.count) + 1 + attempts;
    const newId = `TA${count.toString().padStart(4, "0")}`;

    const existsInDb = await trx("user_master").where("user_id", newId).first();
    if (!existsInDb) {
      return newId;
    }

    attempts++;
  }

  throw new Error(
    "Failed to generate unique Transporter Admin user ID after 100 attempts"
  );
};

// Generate Approval Flow Transaction ID (format: AF0001, AF0002, etc.)
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
    "Failed to generate unique Approval Flow ID after 100 attempts"
  );
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

const validateVATNumber = (vatNumber, country) => {
  const vatPatterns = {
    IN: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    US: /^[0-9]{2}-[0-9]{7}$/,
    GB: /^GB[0-9]{9}$/,
    DE: /^DE[0-9]{9}$/,
    FR: /^FR[A-Z0-9]{2}[0-9]{9}$/,
  };

  const pattern = vatPatterns[country];
  return pattern ? pattern.test(vatNumber) : /^[A-Z0-9]{8,15}$/.test(vatNumber);
};

// Create Transporter Controller
const createTransporter = async (req, res) => {
  try {
    const { generalDetails, addresses, serviceableAreas, documents } = req.body;

    console.log("🔍 Starting transporter creation - VALIDATION PHASE");
    console.log(
      "Serviceable Areas Payload:",
      JSON.stringify(serviceableAreas, null, 2)
    );

    // ========================================
    // PHASE 1: COMPLETE VALIDATION (NO DATABASE OPERATIONS)
    // ========================================

    // Validate general details
    if (
      !generalDetails.businessName ||
      generalDetails.businessName.trim().length < 2
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: ERROR_MESSAGES.BUSINESS_NAME_TOO_SHORT,
          field: "businessName",
        },
      });
    }

    if (!generalDetails.fromDate) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: ERROR_MESSAGES.FROM_DATE_REQUIRED,
          field: "fromDate",
        },
      });
    }

    // Validate transport modes - at least one must be selected
    const transportModes = [
      generalDetails.transMode.road,
      generalDetails.transMode.rail,
      generalDetails.transMode.air,
      generalDetails.transMode.sea,
    ];

    if (!transportModes.some((mode) => mode)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: ERROR_MESSAGES.TRANSPORT_MODE_REQUIRED,
          field: "transportModes",
        },
      });
    }

    // Validate addresses
    if (!addresses || addresses.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: ERROR_MESSAGES.ADDRESS_REQUIRED,
          field: "addresses",
        },
      });
    }

    // Validate each address
    for (let i = 0; i < addresses.length; i++) {
      const address = addresses[i];

      if (
        !address.vatNumber ||
        !validateVATNumber(address.vatNumber, address.country)
      ) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: ERROR_MESSAGES.VAT_NUMBER_INVALID,
            field: `addresses[${i}].vatNumber`,
          },
        });
      }

      if (!address.country || !address.state || !address.city) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: ERROR_MESSAGES.COUNTRY_STATE_CITY_REQUIRED,
            field: `addresses[${i}]`,
          },
        });
      }

      // Validate contacts for each address
      if (!address.contacts || address.contacts.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: ERROR_MESSAGES.CONTACT_REQUIRED,
            field: `addresses[${i}].contacts`,
          },
        });
      }

      // Validate each contact
      for (let j = 0; j < address.contacts.length; j++) {
        const contact = address.contacts[j];

        if (!contact.name || contact.name.trim().length < 2) {
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: ERROR_MESSAGES.CONTACT_NAME_REQUIRED,
              field: `addresses[${i}].contacts[${j}].name`,
            },
          });
        }

        if (!contact.phoneNumber || !validatePhoneNumber(contact.phoneNumber)) {
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: ERROR_MESSAGES.PHONE_NUMBER_INVALID,
              field: `addresses[${i}].contacts[${j}].phoneNumber`,
            },
          });
        }

        if (
          contact.alternatePhoneNumber &&
          !validatePhoneNumber(contact.alternatePhoneNumber)
        ) {
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: ERROR_MESSAGES.ALTERNATE_PHONE_INVALID,
              field: `addresses[${i}].contacts[${j}].alternatePhoneNumber`,
            },
          });
        }

        if (!contact.email || !validateEmail(contact.email)) {
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: ERROR_MESSAGES.EMAIL_INVALID,
              field: `addresses[${i}].contacts[${j}].email`,
            },
          });
        }
      }
    }

    // Validate serviceable areas
    if (!serviceableAreas || serviceableAreas.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: ERROR_MESSAGES.SERVICEABLE_AREA_REQUIRED,
          field: "serviceableAreas",
        },
      });
    }

    // Check for duplicate countries in serviceable areas
    const countries = serviceableAreas.map((area) => area.country);
    const uniqueCountries = [...new Set(countries)];
    if (countries.length !== uniqueCountries.length) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: ERROR_MESSAGES.SERVICEABLE_AREA_DUPLICATE,
          field: "serviceableAreas",
        },
      });
    }

    // Validate each serviceable area
    for (let i = 0; i < serviceableAreas.length; i++) {
      const area = serviceableAreas[i];

      if (!area.country) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: `Country is required for serviceable area ${i + 1}`,
            field: `serviceableAreas[${i}].country`,
          },
        });
      }

      if (!area.states || area.states.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: `At least one state must be selected for serviceable area ${
              i + 1
            }`,
            field: `serviceableAreas[${i}].states`,
          },
        });
      }

      // Validate that states belong to the specified country
      const country = Country.getAllCountries().find(
        (c) => c.name === area.country
      );
      if (!country) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: `Invalid country: ${area.country}`,
            field: `serviceableAreas[${i}].country`,
          },
        });
      }

      const validStates = State.getStatesOfCountry(country.isoCode);
      const validStateNames = validStates.map((s) => s.name);

      for (const stateName of area.states) {
        if (!validStateNames.includes(stateName)) {
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: `State "${stateName}" does not belong to country "${area.country}". Please select valid states for this country.`,
              field: `serviceableAreas[${i}].states`,
            },
          });
        }
      }
    }

    // Validate documents
    if (!documents || documents.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: ERROR_MESSAGES.DOCUMENT_REQUIRED,
          field: "documents",
        },
      });
    }

    // Validate each document
    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];

      if (!doc.documentType) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: ERROR_MESSAGES.DOCUMENT_TYPE_REQUIRED,
            field: `documents[${i}].documentType`,
          },
        });
      }

      if (!doc.documentNumber) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: ERROR_MESSAGES.DOCUMENT_NUMBER_REQUIRED,
            field: `documents[${i}].documentNumber`,
          },
        });
      }

      // Validate document number format based on document type
      // First, get the document type name from the document_name_master
      const docTypeInfo = await knex("document_name_master")
        .where(function () {
          // Check if documentType is an ID (like "DN003") or a name (like "TAN")
          this.where("doc_name_master_id", doc.documentType).orWhere(
            "document_name",
            doc.documentType
          );
        })
        .first();

      if (docTypeInfo) {
        // Store the resolved document type ID for database insertion
        doc.documentTypeId = docTypeInfo.doc_name_master_id;

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
      } else {
        // Document type not found in master table
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: `Invalid document type: ${doc.documentType}`,
            field: `documents[${i}].documentType`,
          },
        });
      }

      if (!doc.country) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: ERROR_MESSAGES.DOCUMENT_COUNTRY_REQUIRED,
            field: `documents[${i}].country`,
          },
        });
      }

      if (!doc.validFrom) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: ERROR_MESSAGES.DOCUMENT_VALID_FROM_REQUIRED,
            field: `documents[${i}].validFrom`,
          },
        });
      }

      if (!doc.validTo) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: ERROR_MESSAGES.DOCUMENT_VALID_TO_REQUIRED,
            field: `documents[${i}].validTo`,
          },
        });
      }

      // Validate date range
      const validFrom = new Date(doc.validFrom);
      const validTo = new Date(doc.validTo);

      if (validTo <= validFrom) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: ERROR_MESSAGES.DOCUMENT_DATE_INVALID,
            field: `documents[${i}].validTo`,
          },
        });
      }
    }

    // Check for duplicate VAT numbers (uses transaction for consistent reads)
    const vatNumbers = addresses.map((addr) => addr.vatNumber);
    const existingVATCheck = await knex("tms_address")
      .whereIn("vat_number", vatNumbers)
      .andWhere("status", "ACTIVE");

    if (existingVATCheck.length > 0) {
      const duplicateVAT = existingVATCheck[0].vat_number;
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: `VAT number ${duplicateVAT} already exists. Please use a unique VAT number`,
          field: "vatNumber",
          value: duplicateVAT,
        },
      });
    }

    // Check for duplicate document numbers
    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      const documentTypeId = doc.documentTypeId || doc.documentType; // Use resolved ID

      const existingDoc = await knex("transporter_documents")
        .where("document_number", doc.documentNumber)
        .andWhere("document_type_id", documentTypeId)
        .andWhere("status", "ACTIVE")
        .first();

      if (existingDoc) {
        // Get document type name for better error message
        const docTypeInfo = await knex("document_name_master")
          .where("doc_name_master_id", documentTypeId)
          .first();

        const docTypeName = docTypeInfo
          ? docTypeInfo.document_name
          : "this document type";

        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: `Document number ${doc.documentNumber} already exists for ${docTypeName}. Please use a unique document number`,
            field: `documents[${i}].documentNumber`,
            value: doc.documentNumber,
          },
        });
      }
    }

    console.log("✅ ALL VALIDATIONS PASSED - Starting transaction");

    // ========================================
    // PHASE 2: DATABASE OPERATIONS (WITH TRANSACTION)
    // ========================================

    const trx = await knex.transaction();

    try {
      // All validations passed, start creating the transporter
      const transporterId = await generateTransporterId();
      const currentUser = req.user?.user_id || "SYSTEM";
      const currentTimestamp = new Date();

      // Pre-generate all IDs to avoid race conditions
      console.log("🔑 Generating unique IDs...");
      const addressIds = [];
      const generatedAddressIds = new Set(); // Track generated IDs to prevent duplicates
      for (let i = 0; i < addresses.length; i++) {
        const newAddressId = await generateAddressId(trx, generatedAddressIds);
        console.log(`  📍 Generated address ID ${i + 1}: ${newAddressId}`);
        addressIds.push(newAddressId);
      }

      const contactIds = [];
      const generatedContactIds = new Set(); // Track generated IDs to prevent duplicates
      let contactIndex = 0;
      for (const address of addresses) {
        for (const contact of address.contacts) {
          contactIds.push(await generateContactId(trx, generatedContactIds));
          contactIndex++;
        }
      }

      const serviceAreaHeaderIds = [];
      const baseServiceAreaHeaderCount =
        parseInt(
          (
            await trx("transporter_service_area_hdr")
              .count("* as count")
              .first()
          ).count
        ) + 1;
      for (let i = 0; i < serviceableAreas.length; i++) {
        serviceAreaHeaderIds.push(
          `SAH${(baseServiceAreaHeaderCount + i).toString().padStart(4, "0")}`
        );
      }

      const serviceAreaItemIds = [];
      const baseServiceAreaItemCount =
        parseInt(
          (
            await trx("transporter_service_area_itm")
              .count("* as count")
              .first()
          ).count
        ) + 1;
      let itemIdOffset = 0;
      for (const area of serviceableAreas) {
        for (const state of area.states) {
          serviceAreaItemIds.push(
            `SAI${(baseServiceAreaItemCount + itemIdOffset)
              .toString()
              .padStart(4, "0")}`
          );
          itemIdOffset++;
        }
      }

      const documentIds = [];
      const generatedDocumentIds = new Set(); // Track generated IDs to prevent duplicates
      for (let i = 0; i < documents.length; i++) {
        documentIds.push(await generateDocumentId(trx, generatedDocumentIds));
      }

      // 1. Create transporter general info
      await trx("transporter_general_info").insert({
        transporter_id: transporterId,
        user_type: "TRANSPORTER",
        business_name: generalDetails.businessName.trim(),
        trans_mode_road: generalDetails.transMode.road || false,
        trans_mode_rail: generalDetails.transMode.rail || false,
        trans_mode_air: generalDetails.transMode.air || false,
        trans_mode_sea: generalDetails.transMode.sea || false,
        active_flag:
          generalDetails.activeFlag !== undefined
            ? generalDetails.activeFlag
            : true,
        from_date: generalDetails.fromDate,
        to_date: generalDetails.toDate || null,
        avg_rating: generalDetails.avgRating || 0,
        created_by: currentUser,
        updated_by: currentUser,
        created_at: currentTimestamp,
        updated_at: currentTimestamp,
        created_on: currentTimestamp,
        updated_on: currentTimestamp,
        status: "ACTIVE",
      });

      // 2. Create addresses and contacts
      let addressIndex = 0;
      let globalContactIndex = 0;

      for (const address of addresses) {
        const addressId = addressIds[addressIndex];

        // Insert address
        await trx("tms_address").insert({
          address_id: addressId,
          user_reference_id: transporterId,
          user_type: "TRANSPORTER",
          country: address.country,
          vat_number: address.vatNumber,
          street_1: address.street1 || null,
          street_2: address.street2 || null,
          city: address.city,
          district: address.district || null,
          state: address.state,
          postal_code: address.postalCode || null,
          is_primary: address.isPrimary || false,
          address_type_id: "AT001", // Default address type
          created_by: currentUser,
          updated_by: currentUser,
          created_at: currentTimestamp,
          updated_at: currentTimestamp,
          created_on: currentTimestamp,
          updated_on: currentTimestamp,
          status: "ACTIVE",
        });

        // Insert contacts for this address
        for (const contact of address.contacts) {
          const contactId = contactIds[globalContactIndex];

          await trx("transporter_contact").insert({
            tcontact_id: contactId,
            transporter_id: transporterId,
            contact_person_name: contact.name.trim(),
            role: contact.role || null,
            phone_number: contact.phoneNumber,
            alternate_phone_number: contact.alternatePhoneNumber || null,
            whats_app_number: contact.whatsappNumber || null,
            email_id: contact.email,
            alternate_email_id: contact.alternateEmail || null,
            address_id: addressId,
            created_by: currentUser,
            updated_by: currentUser,
            created_at: currentTimestamp,
            updated_at: currentTimestamp,
            created_on: currentTimestamp,
            updated_on: currentTimestamp,
            status: "ACTIVE",
          });

          globalContactIndex++;
        }

        addressIndex++;
      }

      // 3. Create serviceable areas
      let serviceAreaHeaderIndex = 0;
      let serviceAreaItemIndex = 0;

      for (const area of serviceableAreas) {
        const serviceAreaHeaderId =
          serviceAreaHeaderIds[serviceAreaHeaderIndex];

        console.log(
          `Creating service area header for country: ${area.country}, header ID: ${serviceAreaHeaderId}`
        );

        // Insert service area header
        await trx("transporter_service_area_hdr").insert({
          service_area_hdr_id: serviceAreaHeaderId,
          transporter_id: transporterId,
          service_country: area.country,
          created_by: currentUser,
          updated_by: currentUser,
          created_at: currentTimestamp,
          updated_at: currentTimestamp,
          created_on: currentTimestamp,
          updated_on: currentTimestamp,
          status: "ACTIVE",
        });

        // Insert service area items (states)
        for (const state of area.states) {
          const serviceAreaItemId = serviceAreaItemIds[serviceAreaItemIndex];

          console.log(
            `  - Creating service area item for state: ${state}, item ID: ${serviceAreaItemId}, linked to header: ${serviceAreaHeaderId}`
          );

          await trx("transporter_service_area_itm").insert({
            service_area_itm_id: serviceAreaItemId,
            service_area_hdr_id: serviceAreaHeaderId,
            service_state: state,
            created_by: currentUser,
            updated_by: currentUser,
            created_at: currentTimestamp,
            updated_at: currentTimestamp,
            created_on: currentTimestamp,
            updated_on: currentTimestamp,
            status: "ACTIVE",
          });

          serviceAreaItemIndex++;
        }

        serviceAreaHeaderIndex++;
      }

      // 4. Create documents and file uploads
      let documentIndex = 0;

      for (const doc of documents) {
        const documentId = documentIds[documentIndex];
        const documentUniqueId = `${transporterId}_${documentId}`;

        // Insert transporter document - use resolved documentTypeId
        await trx("transporter_documents").insert({
          document_unique_id: documentUniqueId,
          document_id: documentId,
          document_type_id: doc.documentTypeId || doc.documentType, // Use resolved ID
          document_number: doc.documentNumber,
          reference_number: doc.referenceNumber || null,
          country: doc.country,
          valid_from: doc.validFrom,
          valid_to: doc.validTo,
          active: doc.status !== undefined ? doc.status : true,
          user_type: "TRANSPORTER",
          created_by: currentUser,
          updated_by: currentUser,
          created_at: currentTimestamp,
          updated_at: currentTimestamp,
          created_on: currentTimestamp,
          updated_on: currentTimestamp,
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
            valid_from: doc.validFrom,
            valid_to: doc.validTo,
            created_by: currentUser,
            updated_by: currentUser,
            created_at: currentTimestamp,
            updated_at: currentTimestamp,
            created_on: currentTimestamp,
            updated_on: currentTimestamp,
            status: "ACTIVE",
          });
        }

        documentIndex++;
      }

      // ========================================
      // PHASE 4: CREATE TRANSPORTER ADMIN USER & APPROVAL WORKFLOW
      // ========================================

      console.log(
        "📝 Creating Transporter Admin user for approval workflow..."
      );

      // Generate user ID for Transporter Admin
      const transporterAdminUserId = await generateTransporterAdminUserId(trx);
      console.log(`  Generated user ID: ${transporterAdminUserId}`);

      // Get creator details from request (current logged-in Product Owner)
      const creatorUserId = req.user?.user_id || "SYSTEM";
      const creatorName = req.user?.user_full_name || "System";

      // Generate initial password (based on business name + random number)
      const businessNameClean = generalDetails.businessName.replace(
        /[^a-zA-Z0-9]/g,
        ""
      );
      // const randomNum = Math.floor(1000 + Math.random() * 9000);
      const initialPassword = `${businessNameClean}@123`;
      const hashedPassword = await bcrypt.hash(initialPassword, 10);

      // Extract contact details from first address (primary contact)
      const primaryAddress =
        addresses.find((addr) => addr.addressType === "AT001") || addresses[0];
      const userEmail =
        primaryAddress?.emailId ||
        `${transporterId.toLowerCase()}@transporter.com`;
      const userMobile = primaryAddress?.mobileNumber || "0000000000";

      // Create user in user_master with PENDING status (max 20 chars)
      await trx("user_master").insert({
        user_id: transporterAdminUserId,
        user_type_id: "UT002", // Transporter Admin
        user_full_name: `${generalDetails.businessName} - Admin`,
        email_id: userEmail,
        mobile_number: userMobile,
        from_date: generalDetails.fromDate,
        to_date: generalDetails.toDate || null,
        is_active: false, // Inactive until approved
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
        `  ✅ Created user: ${transporterAdminUserId} (PENDING approval)`
      );

      // Get approval configuration for Transporter Admin (Level 1 only)
      const approvalConfig = await trx("approval_configuration")
        .where({
          approval_type_id: "AT001", // Transporter Admin
          approver_level: 1,
          status: "ACTIVE",
        })
        .first();

      if (!approvalConfig) {
        throw new Error(
          "Approval configuration not found for Transporter Admin"
        );
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
        approval_type_id: "AT001", // Transporter Admin
        user_id_reference_id: transporterAdminUserId, // FIXED: Use Transporter Admin user ID, not transporter ID
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
      console.log(
        `  📧 Pending with: ${pendingWithName} (${pendingWithUserId})`
      );
      console.log(
        `  🔑 Initial Password: ${initialPassword} (MUST BE SHARED SECURELY)`
      );

      // Commit the transaction
      await trx.commit();

      console.log("✅ Transaction committed successfully");

      res.status(201).json({
        success: true,
        data: {
          transporterId: transporterId,
          userId: transporterAdminUserId,
          userEmail: userEmail,
          initialPassword: initialPassword,
          message:
            "Transporter created successfully. Transporter Admin user created and pending approval.",
          approvalStatus: "PENDING",
          pendingWith: pendingWithName,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (transactionError) {
      // Rollback the transaction on any database error
      await trx.rollback();
      console.error(
        "❌ Transaction rolled back due to error:",
        transactionError
      );
      throw transactionError; // Re-throw to outer catch
    }
  } catch (error) {
    console.error("Error creating transporter:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to create transporter",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      timestamp: new Date().toISOString(),
    });
  }
};

// Update Transporter Controller
const updateTransporter = async (req, res) => {
  const trx = await knex.transaction();

  try {
    const { id } = req.params;
    const { generalDetails, addresses, serviceableAreas, documents } = req.body;

    // Validate transporter exists
    const existingTransporter = await trx("transporter_general_info")
      .where("transporter_id", id)
      .first();

    if (!existingTransporter) {
      await trx.rollback();
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Transporter not found",
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Validate general details (only if provided)
    if (generalDetails) {
      if (
        generalDetails.businessName &&
        generalDetails.businessName.trim().length < 2
      ) {
        await trx.rollback();
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Business name must be at least 2 characters long",
            field: "businessName",
          },
          timestamp: new Date().toISOString(),
        });
      }

      if (!generalDetails.fromDate) {
        await trx.rollback();
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "From date is required",
            field: "fromDate",
          },
          timestamp: new Date().toISOString(),
        });
      }

      // Validate transport modes - at least one must be selected
      const transportModes = [
        generalDetails.transMode?.road,
        generalDetails.transMode?.rail,
        generalDetails.transMode?.air,
        generalDetails.transMode?.sea,
      ];

      if (!transportModes.some((mode) => mode)) {
        await trx.rollback();
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "At least one transport mode must be selected",
            field: "transMode",
          },
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Validate addresses (only if provided)
    if (addresses && addresses.length > 0) {
      for (let i = 0; i < addresses.length; i++) {
        const address = addresses[i];

        if (!address.vatNumber || address.vatNumber.trim().length === 0) {
          await trx.rollback();
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: `VAT number is required for address ${i + 1}`,
              field: `addresses[${i}].vatNumber`,
            },
            timestamp: new Date().toISOString(),
          });
        }

        if (!address.country || address.country.trim().length === 0) {
          await trx.rollback();
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: `Country is required for address ${i + 1}`,
              field: `addresses[${i}].country`,
            },
            timestamp: new Date().toISOString(),
          });
        }

        // Validate VAT number format
        const countryCode = Country.getAllCountries().find(
          (c) => c.name === address.country
        )?.isoCode;
        if (countryCode && !validateVATNumber(address.vatNumber, countryCode)) {
          await trx.rollback();
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: `Invalid VAT number format for ${address.country}`,
              field: `addresses[${i}].vatNumber`,
            },
            timestamp: new Date().toISOString(),
          });
        }

        // Validate contacts
        if (!address.contacts || address.contacts.length === 0) {
          await trx.rollback();
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: `At least one contact is required for address ${i + 1}`,
              field: `addresses[${i}].contacts`,
            },
            timestamp: new Date().toISOString(),
          });
        }

        for (let j = 0; j < address.contacts.length; j++) {
          const contact = address.contacts[j];

          if (
            !contact.phoneNumber ||
            !validatePhoneNumber(contact.phoneNumber)
          ) {
            await trx.rollback();
            return res.status(400).json({
              success: false,
              error: {
                code: "VALIDATION_ERROR",
                message: `Valid phone number is required for contact ${
                  j + 1
                } in address ${i + 1}`,
                field: `addresses[${i}].contacts[${j}].phoneNumber`,
              },
              timestamp: new Date().toISOString(),
            });
          }

          if (!contact.email || !validateEmail(contact.email)) {
            await trx.rollback();
            return res.status(400).json({
              success: false,
              error: {
                code: "VALIDATION_ERROR",
                message: `Valid email is required for contact ${
                  j + 1
                } in address ${i + 1}`,
                field: `addresses[${i}].contacts[${j}].email`,
              },
              timestamp: new Date().toISOString(),
            });
          }
        }
      }
    }

    // Validate serviceable areas (only if provided)
    if (serviceableAreas && serviceableAreas.length > 0) {
      const countries = serviceableAreas.map((area) => area.country);
      const uniqueCountries = [...new Set(countries)];
      if (countries.length !== uniqueCountries.length) {
        await trx.rollback();
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Duplicate countries found in serviceable areas",
            field: "serviceableAreas",
          },
          timestamp: new Date().toISOString(),
        });
      }

      for (let i = 0; i < serviceableAreas.length; i++) {
        const area = serviceableAreas[i];

        if (!area.country || area.country.trim().length === 0) {
          await trx.rollback();
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: `Country is required for serviceable area ${i + 1}`,
              field: `serviceableAreas[${i}].country`,
            },
            timestamp: new Date().toISOString(),
          });
        }

        if (!area.states || area.states.length === 0) {
          await trx.rollback();
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: `At least one state is required for ${area.country}`,
              field: `serviceableAreas[${i}].states`,
            },
            timestamp: new Date().toISOString(),
          });
        }

        // Validate states belong to the country
        const countryData = Country.getAllCountries().find(
          (c) => c.name === area.country
        );
        if (!countryData) {
          await trx.rollback();
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: `Invalid country: ${area.country}`,
              field: `serviceableAreas[${i}].country`,
            },
            timestamp: new Date().toISOString(),
          });
        }

        const validStates = State.getStatesOfCountry(countryData.isoCode).map(
          (s) => s.name
        );
        const invalidStates = area.states.filter(
          (state) => !validStates.includes(state)
        );

        if (invalidStates.length > 0) {
          await trx.rollback();
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: `Invalid states for ${
                area.country
              }: ${invalidStates.join(", ")}`,
              field: `serviceableAreas[${i}].states`,
            },
            timestamp: new Date().toISOString(),
          });
        }
      }
    }

    // Validate documents (only if provided)
    if (documents && documents.length > 0) {
      for (let i = 0; i < documents.length; i++) {
        const document = documents[i];

        if (
          !document.documentType ||
          document.documentType.trim().length === 0
        ) {
          await trx.rollback();
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: `Document type is required for document ${i + 1}`,
              field: `documents[${i}].documentType`,
            },
            timestamp: new Date().toISOString(),
          });
        }

        if (
          !document.documentNumber ||
          document.documentNumber.trim().length === 0
        ) {
          await trx.rollback();
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: `Document number is required for document ${i + 1}`,
              field: `documents[${i}].documentNumber`,
            },
            timestamp: new Date().toISOString(),
          });
        }

        // Validate document number format based on document type
        const docTypeInfo = await trx("document_name_master")
          .where(function () {
            // Check if documentType is an ID (like "DN003") or a name (like "TAN")
            this.where("doc_name_master_id", document.documentType).orWhere(
              "document_name",
              document.documentType
            );
          })
          .first();

        console.log(`\n🔍 DOCUMENT VALIDATION DEBUG - Document ${i + 1}:`);
        console.log(`Document Type from payload: ${document.documentType}`);
        console.log(`Document Number from payload: ${document.documentNumber}`);
        console.log(`DocTypeInfo found:`, docTypeInfo);

        if (docTypeInfo) {
          // Store the resolved document type ID for database insertion
          document.documentTypeId = docTypeInfo.doc_name_master_id;

          console.log(`Resolved Document Type ID: ${document.documentTypeId}`);
          console.log(
            `Document Type Name for validation: ${docTypeInfo.document_name}`
          );

          const validation = validateDocumentNumber(
            document.documentNumber,
            docTypeInfo.document_name
          );

          console.log(`Validation result:`, validation);

          if (!validation.isValid) {
            console.log(`❌ VALIDATION FAILED: ${validation.message}`);
            await trx.rollback();
            return res.status(400).json({
              success: false,
              error: {
                code: "VALIDATION_ERROR",
                message: validation.message,
                field: `documents[${i}].documentNumber`,
                expectedFormat: validation.format,
              },
              timestamp: new Date().toISOString(),
            });
          }

          // Clean and normalize document number after validation
          document.documentNumber = document.documentNumber
            .trim()
            .toUpperCase();
          console.log(`✅ VALIDATION PASSED for document ${i + 1}`);
        } else {
          // Document type not found in master table
          await trx.rollback();
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: `Invalid document type: ${document.documentType}`,
              field: `documents[${i}].documentType`,
            },
            timestamp: new Date().toISOString(),
          });
        }

        if (!document.validFrom) {
          await trx.rollback();
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: `Valid from date is required for document ${i + 1}`,
              field: `documents[${i}].validFrom`,
            },
            timestamp: new Date().toISOString(),
          });
        }

        if (!document.validTo) {
          await trx.rollback();
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: `Valid to date is required for document ${i + 1}`,
              field: `documents[${i}].validTo`,
            },
            timestamp: new Date().toISOString(),
          });
        }

        const validFrom = new Date(document.validFrom);
        const validTo = new Date(document.validTo);
        if (validTo <= validFrom) {
          await trx.rollback();
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: `Valid to date must be after valid from date for document ${
                i + 1
              }`,
              field: `documents[${i}].validTo`,
            },
            timestamp: new Date().toISOString(),
          });
        }
      }

      // Check for duplicate document numbers (excluding current transporter's documents)
      for (let i = 0; i < documents.length; i++) {
        const document = documents[i];
        const documentTypeId = document.documentTypeId || document.documentType;

        const existingDoc = await trx("transporter_documents")
          .where("document_number", document.documentNumber)
          .andWhere("document_type_id", documentTypeId)
          .andWhere("status", "ACTIVE")
          .andWhereNot("document_unique_id", "like", `${id}_%`) // Exclude current transporter's docs
          .first();

        if (existingDoc) {
          // Get document type name for better error message
          const docTypeInfo = await trx("document_name_master")
            .where("doc_name_master_id", documentTypeId)
            .first();

          const docTypeName = docTypeInfo
            ? docTypeInfo.document_name
            : "this document type";

          await trx.rollback();
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: `Document number ${document.documentNumber} already exists for ${docTypeName}. Please use a unique document number`,
              field: `documents[${i}].documentNumber`,
              value: document.documentNumber,
            },
            timestamp: new Date().toISOString(),
          });
        }
      }
    }

    const currentUser = req.user?.user_id || "SYSTEM";
    const currentTimestamp = new Date();

    // Update general details if provided
    if (generalDetails) {
      await trx("transporter_general_info")
        .where("transporter_id", id)
        .update({
          business_name: generalDetails.businessName,
          from_date: generalDetails.fromDate,
          to_date: generalDetails.toDate || null,
          avg_rating: generalDetails.avgRating || 0,
          trans_mode_road: generalDetails.transMode.road ? 1 : 0,
          trans_mode_rail: generalDetails.transMode.rail ? 1 : 0,
          trans_mode_air: generalDetails.transMode.air ? 1 : 0,
          trans_mode_sea: generalDetails.transMode.sea ? 1 : 0,
          active_flag: generalDetails.activeFlag !== false ? 1 : 0,
          updated_at: currentTimestamp,
          updated_on: currentTimestamp,
          updated_by: currentUser,
        });
    }

    // Update addresses if provided
    if (addresses && addresses.length > 0) {
      // Get existing addresses
      const existingAddresses = await trx("tms_address")
        .where("user_reference_id", id)
        .where("user_type", "TRANSPORTER")
        .select("address_id");

      const existingAddressIds = existingAddresses.map((a) => a.address_id);

      // Track which addresses are being updated
      const updatedAddressIds = [];

      // Process each address from the request
      for (const address of addresses) {
        const countryCode = Country.getAllCountries().find(
          (c) => c.name === address.country
        )?.isoCode;

        const addressData = {
          address_type_id: address.addressType || "AT001",
          vat_number: address.vatNumber,
          country: countryCode,
          state: address.state,
          city: address.city,
          district: address.district,
          street_1: address.street1,
          street_2: address.street2,
          postal_code: address.postalCode,
          is_primary: address.isPrimary ? 1 : 0,
          updated_at: currentTimestamp,
          updated_on: currentTimestamp,
          updated_by: currentUser,
        };

        // If address has an ID and it exists, UPDATE it
        if (
          address.addressId &&
          existingAddressIds.includes(address.addressId)
        ) {
          await trx("tms_address")
            .where("address_id", address.addressId)
            .update(addressData);

          updatedAddressIds.push(address.addressId);

          // Handle contacts for this address
          const existingContacts = await trx("transporter_contact")
            .where("address_id", address.addressId)
            .select("tcontact_id");

          const existingContactIds = existingContacts.map((c) => c.tcontact_id);
          const updatedContactIds = [];

          // Process each contact
          for (const contact of address.contacts) {
            const contactData = {
              contact_person_name: contact.name,
              role: contact.role,
              phone_number: contact.phoneNumber,
              alternate_phone_number: contact.alternatePhoneNumber,
              email_id: contact.email,
              alternate_email_id: contact.alternateEmail,
              whats_app_number: contact.whatsappNumber,
              updated_at: currentTimestamp,
              updated_on: currentTimestamp,
              updated_by: currentUser,
            };

            // If contact has an ID and it exists, UPDATE it
            if (
              contact.contactId &&
              existingContactIds.includes(contact.contactId)
            ) {
              await trx("transporter_contact")
                .where("tcontact_id", contact.contactId)
                .update(contactData);

              updatedContactIds.push(contact.contactId);
            } else {
              // INSERT new contact
              const contactId = await generateContactId(trx);

              await trx("transporter_contact").insert({
                tcontact_id: contactId,
                transporter_id: id,
                address_id: address.addressId,
                ...contactData,
                created_at: currentTimestamp,
                created_on: currentTimestamp,
                created_by: currentUser,
                status: "ACTIVE",
              });

              updatedContactIds.push(contactId);
            }
          }

          // Delete contacts that were removed
          const contactsToDelete = existingContactIds.filter(
            (cid) => !updatedContactIds.includes(cid)
          );
          if (contactsToDelete.length > 0) {
            await trx("transporter_contact")
              .whereIn("tcontact_id", contactsToDelete)
              .del();
          }
        } else {
          // INSERT new address
          const addressId = await generateAddressId(trx);

          await trx("tms_address").insert({
            address_id: addressId,
            user_reference_id: id,
            user_type: "TRANSPORTER",
            ...addressData,
            created_at: currentTimestamp,
            created_on: currentTimestamp,
            created_by: currentUser,
            status: "ACTIVE",
          });

          updatedAddressIds.push(addressId);

          // Insert contacts for new address
          for (const contact of address.contacts) {
            const contactId = await generateContactId(trx);

            await trx("transporter_contact").insert({
              tcontact_id: contactId,
              transporter_id: id,
              address_id: addressId,
              contact_person_name: contact.name,
              role: contact.role,
              phone_number: contact.phoneNumber,
              alternate_phone_number: contact.alternatePhoneNumber,
              email_id: contact.email,
              alternate_email_id: contact.alternateEmail,
              whats_app_number: contact.whatsappNumber,
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
      }

      // Delete addresses that were removed (not in the updated list)
      const addressesToDelete = existingAddressIds.filter(
        (aid) => !updatedAddressIds.includes(aid)
      );
      if (addressesToDelete.length > 0) {
        // Delete contacts first
        await trx("transporter_contact")
          .whereIn("address_id", addressesToDelete)
          .del();

        // Then delete addresses
        await trx("tms_address").whereIn("address_id", addressesToDelete).del();
      }
    }

    // Update serviceable areas if provided
    if (serviceableAreas && serviceableAreas.length > 0) {
      // Delete existing serviceable areas
      const existingHeaders = await trx("transporter_service_area_hdr")
        .where("transporter_id", id)
        .select("service_area_hdr_id");

      for (const header of existingHeaders) {
        await trx("transporter_service_area_itm")
          .where("service_area_hdr_id", header.service_area_hdr_id)
          .del();
      }

      await trx("transporter_service_area_hdr")
        .where("transporter_id", id)
        .del();

      // Insert new serviceable areas
      const baseHeaderCount =
        parseInt(
          (
            await trx("transporter_service_area_hdr")
              .count("* as count")
              .first()
          ).count
        ) + 1;
      const baseItemCount =
        parseInt(
          (
            await trx("transporter_service_area_itm")
              .count("* as count")
              .first()
          ).count
        ) + 1;

      let headerCount = baseHeaderCount;
      let itemCount = baseItemCount;

      for (const area of serviceableAreas) {
        const headerIdNum = headerCount++;
        const serviceAreaHeaderId = `SAH${headerIdNum
          .toString()
          .padStart(4, "0")}`;
        const countryCode = Country.getAllCountries().find(
          (c) => c.name === area.country
        )?.isoCode;

        await trx("transporter_service_area_hdr").insert({
          service_area_hdr_id: serviceAreaHeaderId,
          transporter_id: id,
          service_country: countryCode,
          created_at: currentTimestamp,
          created_on: currentTimestamp,
          created_by: currentUser,
          updated_at: currentTimestamp,
          updated_on: currentTimestamp,
          updated_by: currentUser,
          status: "ACTIVE",
        });

        for (const state of area.states) {
          const itemIdNum = itemCount++;
          const serviceAreaItemId = `SAI${itemIdNum
            .toString()
            .padStart(4, "0")}`;
          const stateCode = State.getStatesOfCountry(countryCode).find(
            (s) => s.name === state
          )?.isoCode;

          await trx("transporter_service_area_itm").insert({
            service_area_itm_id: serviceAreaItemId,
            service_area_hdr_id: serviceAreaHeaderId,
            service_state: stateCode,
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
    }

    // Update documents if provided
    if (documents && documents.length > 0) {
      // Delete existing documents and file uploads
      // First get the document_unique_ids for this transporter
      const existingDocs = await trx("transporter_documents")
        .where("document_unique_id", "like", `${id}_%`)
        .select("document_unique_id");

      // Delete associated file uploads
      for (const doc of existingDocs) {
        await trx("document_upload")
          .where("system_reference_id", doc.document_unique_id)
          .del();
      }

      // Delete transporter documents
      await trx("transporter_documents")
        .where("document_unique_id", "like", `${id}_%`)
        .del();

      // Insert new documents
      for (const document of documents) {
        const documentId = await generateDocumentId(trx);
        const documentUniqueId = `${id}_${documentId}`;

        await trx("transporter_documents").insert({
          document_unique_id: documentUniqueId,
          document_id: documentId,
          document_type_id: document.documentTypeId || document.documentType, // Use resolved ID
          document_number: document.documentNumber,
          reference_number: document.referenceNumber || null,
          country: document.country,
          valid_from: document.validFrom,
          valid_to: document.validTo,
          active: document.status !== false ? 1 : 0,
          user_type: "TRANSPORTER",
          created_at: currentTimestamp,
          created_on: currentTimestamp,
          created_by: currentUser,
          updated_at: currentTimestamp,
          updated_on: currentTimestamp,
          updated_by: currentUser,
          status: "ACTIVE",
        });

        // Handle file upload if present
        if (document.fileData) {
          const docUploadId = await generateDocumentUploadId();

          await trx("document_upload").insert({
            document_id: docUploadId,
            file_name: document.fileName,
            file_type: document.fileType,
            file_xstring_value: document.fileData, // base64 encoded file data
            system_reference_id: documentUniqueId,
            is_verified: false,
            valid_from: document.validFrom,
            valid_to: document.validTo,
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
    }

    await trx.commit();

    res.status(200).json({
      success: true,
      message: "Transporter updated successfully",
      data: {
        transporterId: id,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    await trx.rollback();

    console.error("Error updating transporter:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to update transporter",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
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

    // Get address types
    const addressTypes = await knex("address_type_master")
      .select("address_type_id as value", "address as label")
      .where("status", "ACTIVE")
      .orderBy("address");

    res.json({
      success: true,
      data: {
        countries,
        documentTypes,
        documentNames,
        addressTypes,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching master data:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch master data",
      },
      timestamp: new Date().toISOString(),
    });
  }
};

// Get states by country
const getStatesByCountry = async (req, res) => {
  try {
    const { countryCode } = req.params;

    if (!countryCode) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Country code is required",
        },
      });
    }

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

    if (!countryCode || !stateCode) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Country code and state code are required",
        },
      });
    }

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

// Get all transporters with pagination and filters
const getTransporters = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 25,
      search = "",
      transporterId = "",
      status = "",
      businessName = "",
      state = "",
      city = "",
      transportMode = "",
      vatGst = "",
      tan = "",
      createdOnStart = "",
      createdOnEnd = "",
    } = req.query;

    const userId = req.user?.user_id; // Get current user from JWT

    // Convert page and limit to integers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Base query
    let query = knex("transporter_general_info as tgi")
      .leftJoin("tms_address as addr", function () {
        this.on("tgi.transporter_id", "=", "addr.user_reference_id")
          .andOn("addr.user_type", "=", knex.raw("'TRANSPORTER'"))
          .andOn("addr.is_primary", "=", knex.raw("1"));
      })
      .leftJoin(
        knex.raw(`(
          SELECT tc1.*
          FROM transporter_contact tc1
          INNER JOIN (
            SELECT transporter_id, MIN(tcontact_id) as min_contact_id, MIN(contact_unique_id) as min_unique_id
            FROM transporter_contact
            WHERE status = 'ACTIVE'
            GROUP BY transporter_id
          ) tc2 ON tc1.transporter_id = tc2.transporter_id 
               AND tc1.tcontact_id = tc2.min_contact_id
               AND tc1.contact_unique_id = tc2.min_unique_id
        ) as tc`),
        "tgi.transporter_id",
        "tc.transporter_id"
      )
      .select(
        "tgi.transporter_id",
        "tgi.business_name",
        "tgi.trans_mode_road",
        "tgi.trans_mode_rail",
        "tgi.trans_mode_air",
        "tgi.trans_mode_sea",
        "tgi.active_flag",
        "tgi.from_date",
        "tgi.to_date",
        "tgi.avg_rating",
        "tgi.status",
        "tgi.created_by",
        "tgi.created_on",
        "tgi.updated_on",
        "addr.country",
        "addr.state",
        "addr.city",
        "addr.district",
        "addr.vat_number",
        "addr.tin_pan",
        "addr.tan",
        knex.raw(
          "CONCAT(COALESCE(addr.street_1, ''), ', ', COALESCE(addr.city, ''), ', ', COALESCE(addr.state, ''), ', ', COALESCE(addr.country, '')) as address"
        ),
        "tc.contact_person_name",
        "tc.phone_number",
        "tc.email_id"
      );

    // Search
    if (search) {
      query = query.where(function () {
        this.where("tgi.business_name", "like", `%${search}%`)
          .orWhere("tgi.transporter_id", "like", `%${search}%`)
          .orWhere("addr.city", "like", `%${search}%`)
          .orWhere("addr.state", "like", `%${search}%`);
      });
    }

    // All other existing filters...
    if (transporterId)
      query = query.where("tgi.transporter_id", "like", `%${transporterId}%`);

    // DRAFT FILTERING LOGIC: Only show drafts created by current user
    if (status) {
      if (status === "SAVE_AS_DRAFT") {
        // If filtering for drafts, only show user's own drafts
        query = query
          .where("tgi.status", status)
          .where("tgi.created_by", userId);
      } else {
        // For other statuses, show all records
        query = query.where("tgi.status", status);
      }
    } else {
      // If no status filter, exclude drafts OR show only user's drafts
      query = query.where(function () {
        this.where("tgi.status", "!=", "SAVE_AS_DRAFT").orWhere(function () {
          this.where("tgi.status", "SAVE_AS_DRAFT").where(
            "tgi.created_by",
            userId
          );
        });
      });
    }

    if (businessName)
      query = query.where("tgi.business_name", "like", `%${businessName}%`);
    if (state) query = query.where("addr.state", "like", `%${state}%`);
    if (city) query = query.where("addr.city", "like", `%${city}%`);
    if (vatGst) query = query.where("addr.vat_number", "like", `%${vatGst}%`);
    if (tan) query = query.where("addr.tan", "like", `%${tan}%`);

    if (transportMode) {
      const modes = transportMode.split(",");
      query = query.where(function () {
        modes.forEach((mode) => {
          switch (mode.toUpperCase()) {
            case "R":
            case "ROAD":
              this.orWhere("tgi.trans_mode_road", true);
              break;
            case "RL":
            case "RAIL":
              this.orWhere("tgi.trans_mode_rail", true);
              break;
            case "A":
            case "AIR":
              this.orWhere("tgi.trans_mode_air", true);
              break;
            case "S":
            case "SEA":
              this.orWhere("tgi.trans_mode_sea", true);
              break;
          }
        });
      });
    }

    //Created On Date Range Filter
    if (createdOnStart) {
      query = query.where("tgi.created_on", ">=", createdOnStart);
    }
    if (createdOnEnd) {
      query = query.where("tgi.created_on", "<=", createdOnEnd);
    }

    // Count query (with same date filters)
    let countQuery = knex("transporter_general_info as tgi");

    if (search || state || city || vatGst || tan) {
      countQuery = countQuery.leftJoin("tms_address as addr", function () {
        this.on("tgi.transporter_id", "=", "addr.user_reference_id").andOn(
          "addr.user_type",
          "=",
          knex.raw("'TRANSPORTER'")
        );
      });
    }

    // Reapply filters
    if (search) {
      countQuery = countQuery.where(function () {
        this.where("tgi.business_name", "like", `%${search}%`)
          .orWhere("tgi.transporter_id", "like", `%${search}%`)
          .orWhere("addr.city", "like", `%${search}%`)
          .orWhere("addr.state", "like", `%${search}%`);
      });
    }

    if (transporterId)
      countQuery = countQuery.where(
        "tgi.transporter_id",
        "like",
        `%${transporterId}%`
      );
    if (businessName)
      countQuery = countQuery.where(
        "tgi.business_name",
        "like",
        `%${businessName}%`
      );

    // Apply same draft filtering logic to count query
    if (status) {
      if (status === "SAVE_AS_DRAFT") {
        countQuery = countQuery
          .where("tgi.status", status)
          .where("tgi.created_by", userId);
      } else {
        countQuery = countQuery.where("tgi.status", status);
      }
    } else {
      countQuery = countQuery.where(function () {
        this.where("tgi.status", "!=", "SAVE_AS_DRAFT").orWhere(function () {
          this.where("tgi.status", "SAVE_AS_DRAFT").where(
            "tgi.created_by",
            userId
          );
        });
      });
    }

    if (state)
      countQuery = countQuery.where("addr.state", "like", `%${state}%`);
    if (city) countQuery = countQuery.where("addr.city", "like", `%${city}%`);
    if (vatGst)
      countQuery = countQuery.where("addr.vat_number", "like", `%${vatGst}%`);
    if (tan) countQuery = countQuery.where("addr.tan", "like", `%${tan}%`);

    if (transportMode) {
      const modes = transportMode.split(",");
      countQuery = countQuery.where(function () {
        modes.forEach((mode) => {
          switch (mode.toUpperCase()) {
            case "R":
            case "ROAD":
              this.orWhere("tgi.trans_mode_road", true);
              break;
            case "RL":
            case "RAIL":
              this.orWhere("tgi.trans_mode_rail", true);
              break;
            case "A":
            case "AIR":
              this.orWhere("tgi.trans_mode_air", true);
              break;
            case "S":
            case "SEA":
              this.orWhere("tgi.trans_mode_sea", true);
              break;
          }
        });
      });
    }

    // Date Filters for Count Query
    if (createdOnStart) {
      countQuery = countQuery.where("tgi.created_on", ">=", createdOnStart);
    }
    if (createdOnEnd) {
      countQuery = countQuery.where("tgi.created_on", "<=", createdOnEnd);
    }

    const totalResult = await countQuery
      .countDistinct("tgi.transporter_id as count")
      .first();
    const total = parseInt(totalResult.count);

    const transporters = await query
      .orderBy("tgi.transporter_id", "asc")
      .limit(limitNum)
      .offset(offset);

    const transformedTransporters = transporters.map((transporter) => {
      const transportModes = [];
      if (transporter.trans_mode_road) transportModes.push("R");
      if (transporter.trans_mode_rail) transportModes.push("RL");
      if (transporter.trans_mode_air) transportModes.push("A");
      if (transporter.trans_mode_sea) transportModes.push("S");

      return {
        id: transporter.transporter_id,
        businessName: transporter.business_name,
        transportMode: transportModes,
        status: transporter.status,
        avgRating: transporter.avg_rating,
        country: transporter.country,
        state: transporter.state,
        city: transporter.city,
        district: transporter.district,
        address: transporter.address,
        tinPan: transporter.tin_pan,
        tan: transporter.tan,
        vatGst: transporter.vat_number,
        contactPersonName: transporter.contact_person_name,
        mobileNumber: transporter.phone_number,
        emailId: transporter.email_id,
        createdBy: transporter.created_by,
        createdOn: transporter.created_on
          ? new Date(transporter.created_on).toISOString().split("T")[0]
          : null,
        updatedOn: transporter.updated_on
          ? new Date(transporter.updated_on).toISOString().split("T")[0]
          : null,
        activeFlag: transporter.active_flag,
        fromDate: transporter.from_date,
        toDate: transporter.to_date,
      };
    });

    res.json({
      success: true,
      data: transformedTransporters,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching transporters:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "FETCH_ERROR",
        message: "Failed to fetch transporters",
        details: error.message,
      },
      timestamp: new Date().toISOString(),
    });
  }
};

// Get single transporter by ID with full details
const getTransporterById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get general info
    const transporter = await knex("transporter_general_info")
      .where("transporter_id", id)
      .first();

    if (!transporter) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Transporter not found",
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Get addresses for this transporter
    const addresses = await knex("tms_address")
      .where("user_reference_id", id)
      .where("user_type", "TRANSPORTER")
      .where("status", "ACTIVE")
      .select("*");

    // Get contacts for this transporter
    const contacts = await knex("transporter_contact")
      .where("transporter_id", id)
      .where("status", "ACTIVE")
      .select("*");

    // Get serviceable areas with proper filtering
    const serviceableAreas = await knex("transporter_service_area_hdr as hdr")
      .leftJoin("transporter_service_area_itm as itm", function () {
        this.on(
          "hdr.service_area_hdr_id",
          "=",
          "itm.service_area_hdr_id"
        ).andOn("itm.status", "=", knex.raw("?", ["ACTIVE"]));
      })
      .where("hdr.transporter_id", id)
      .where("hdr.status", "ACTIVE")
      .select(
        "hdr.service_area_hdr_id as header_id",
        "hdr.service_country as country",
        "itm.service_area_itm_id as item_id",
        "itm.service_state as state"
      );

    // Debug logging
    console.log(
      "Raw serviceable areas from DB:",
      JSON.stringify(serviceableAreas, null, 2)
    );

    // Group serviceable areas by header_id first, then by country
    // This ensures states stay with their correct country header
    const groupedByHeader = serviceableAreas.reduce((acc, area) => {
      if (!area.header_id || !area.country) return acc; // Skip invalid entries

      // Initialize header if not already done
      if (!acc[area.header_id]) {
        // Database stores country ISO code
        const countryFromDB = area.country; // This is the ISO code from service_country

        // Find country data by ISO code
        let countryData = Country.getAllCountries().find(
          (c) => c.isoCode === countryFromDB
        );

        // If not found by ISO code, search by name (fallback)
        if (!countryData) {
          countryData = Country.getAllCountries().find(
            (c) => c.name === countryFromDB
          );
        }

        const countryIsoCode = countryData
          ? countryData.isoCode
          : countryFromDB;
        const countryName = countryData ? countryData.name : countryFromDB;

        acc[area.header_id] = {
          country: countryName, // Store the country name for display
          countryCode: countryIsoCode, // Store the ISO code (e.g., "IN", "AL")
          states: [],
        };
      }

      // Convert state ISO code to state name and add it
      // Only process if we have a state value
      if (area.state) {
        // Get the country ISO code from the already processed header
        const countryIsoCode = acc[area.header_id].countryCode;

        const stateFromDB = area.state; // This is the ISO code from service_state

        // Try to find state by ISO code using the HEADER's country
        let stateData = State.getStatesOfCountry(countryIsoCode).find(
          (s) => s.isoCode === stateFromDB
        );

        // If not found by ISO code, search by name (fallback)
        if (!stateData) {
          stateData = State.getStatesOfCountry(countryIsoCode).find(
            (s) => s.name === stateFromDB
          );
        }

        const stateName = stateData ? stateData.name : stateFromDB;

        // Add state name only if it isn't already in the array
        if (!acc[area.header_id].states.includes(stateName)) {
          acc[area.header_id].states.push(stateName);
        }
      }

      return acc;
    }, {});

    // Convert grouped object to array
    const groupedServiceableAreas = Object.values(groupedByHeader);

    // Debug logging
    console.log(
      "Grouped serviceable areas:",
      JSON.stringify(groupedServiceableAreas, null, 2)
    );

    // Get documents with document type names - documents are linked via document_unique_id which contains transporterId
    const documents = await knex("transporter_documents as td")
      .leftJoin(
        "document_upload as du",
        "td.document_unique_id",
        "du.system_reference_id"
      )
      .leftJoin(
        "document_name_master as dnm",
        "td.document_type_id",
        "dnm.doc_name_master_id"
      )
      .where("td.document_unique_id", "like", `${id}_%`)
      .where("td.status", "ACTIVE")
      .select(
        "td.document_unique_id",
        "td.document_type_id",
        "dnm.document_name as documentTypeName",
        "td.document_number",
        "td.reference_number",
        "td.country",
        "td.valid_from",
        "td.valid_to",
        "td.active",
        "du.file_name",
        "du.file_type",
        "du.file_xstring_value as file_data"
      );

    // Transform transport modes
    const transportModes = {
      road: transporter.trans_mode_road,
      rail: transporter.trans_mode_rail,
      air: transporter.trans_mode_air,
      sea: transporter.trans_mode_sea,
    };

    // Group contacts by address_id
    const contactsByAddress = contacts.reduce((acc, contact) => {
      if (!acc[contact.address_id]) {
        acc[contact.address_id] = [];
      }
      acc[contact.address_id].push({
        contactId: contact.tcontact_id, // Include contact ID for updates
        name: contact.contact_person_name,
        role: contact.role,
        phoneNumber: contact.phone_number,
        alternatePhoneNumber: contact.alternate_phone_number,
        email: contact.email_id,
        alternateEmail: contact.alternate_email_id,
        whatsappNumber: contact.whats_app_number,
      });
      return acc;
    }, {});

    // Build addresses with their contacts - convert country ISO codes to country names
    const addressesWithContacts = addresses.map((address) => {
      // Convert country ISO code to country name
      let countryName = address.country;
      if (address.country && address.country.length <= 3) {
        // It's an ISO code, convert to name
        const countryData = Country.getAllCountries().find(
          (c) => c.isoCode === address.country
        );
        if (countryData) {
          countryName = countryData.name;
        }
      }

      return {
        addressId: address.address_id, // Include address ID for updates
        vatNumber: address.vat_number,
        country: countryName,
        state: address.state,
        city: address.city,
        street1: address.street_1,
        street2: address.street_2,
        district: address.district,
        postalCode: address.postal_code,
        isPrimary: address.is_primary,
        addressType: address.address_type_id || "",
        contacts: contactsByAddress[address.address_id] || [],
      };
    });

    // Helper function to format date to YYYY-MM-DD
    const formatDateForInput = (dateValue) => {
      if (!dateValue) return null;
      const date = new Date(dateValue);
      // Check if date is valid
      if (isNaN(date.getTime())) return null;
      return date.toISOString().split("T")[0];
    };

    // Build response
    const response = {
      transporterId: transporter.transporter_id,
      generalDetails: {
        businessName: transporter.business_name,
        fromDate: formatDateForInput(transporter.from_date),
        toDate: formatDateForInput(transporter.to_date),
        avgRating: transporter.avg_rating || 0,
        transMode: transportModes,
        activeFlag: transporter.active_flag,
        createdBy: transporter.created_by,
        createdOn: formatDateForInput(transporter.created_on),
        updatedBy: transporter.updated_by,
        updatedOn: formatDateForInput(transporter.updated_on),
        status: transporter.status,
      },
      addresses: addressesWithContacts,
      serviceableAreas: groupedServiceableAreas,
      documents: documents.map((doc) => ({
        documentUniqueId: doc.document_unique_id,
        documentType: doc.documentTypeName || doc.document_type_id,
        documentTypeId: doc.document_type_id,
        documentNumber: doc.document_number,
        referenceNumber: doc.reference_number,
        country: doc.country,
        validFrom: formatDateForInput(doc.valid_from),
        validTo: formatDateForInput(doc.valid_to),
        status: doc.active,
        fileName: doc.file_name,
        fileType: doc.file_type,
        // Don't send file data in the list to reduce response size
        // fileData: doc.file_data,
      })),
    };

    // NEW: Get user approval status for this transporter
    // Find the associated Transporter Admin user by checking user_master
    // Assumption: User records will have a reference or we query by creation timing
    // For now, we'll query approval_flow_trans for any user created around same time as transporter

    let userApprovalStatus = null;
    let approvalHistory = [];

    try {
      // Try to find user created for this transporter
      // We can identify by checking approval_flow_trans for users created by same creator
      // OR by finding user_master entries created around the same time

      // Better approach: Find TA#### user that was created closest in time to this transporter
      const transporterCreatedAt = transporter.created_on;

      // Get all Transporter Admin users created around the same time (within 1 minute)
      const potentialUsers = await knex("user_master")
        .where("user_type_id", "UT002")
        .where("user_id", "like", "TA%")
        .whereBetween("created_at", [
          knex.raw("DATE_SUB(?, INTERVAL 1 MINUTE)", [transporterCreatedAt]),
          knex.raw("DATE_ADD(?, INTERVAL 1 MINUTE)", [transporterCreatedAt]),
        ])
        .select(
          "user_id",
          "email_id",
          "mobile_number",
          "status",
          "is_active",
          "created_at"
        );

      if (potentialUsers.length > 0) {
        // Take the first user (most likely to be the associated one)
        const associatedUser = potentialUsers[0];

        // Get approval flow for this user
        const approvalFlows = await knex("approval_flow_trans as aft")
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
      }
    } catch (approvalError) {
      console.error("Error fetching user approval status:", approvalError);
      // Don't fail the entire request if approval fetch fails
    }

    // Add approval status to response if available
    if (userApprovalStatus) {
      response.userApprovalStatus = userApprovalStatus;
      response.approvalHistory = approvalHistory;
    }

    res.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching transporter details:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "FETCH_ERROR",
        message: "Failed to fetch transporter details",
        details: error.message,
      },
      timestamp: new Date().toISOString(),
    });
  }
};

// Get document file by document unique ID
const getDocumentFile = async (req, res) => {
  try {
    const { documentId } = req.params;

    console.log(`🔍 Fetching document file for ID: ${documentId}`);

    // Fetch document details with file data
    const document = await knex("transporter_documents as td")
      .leftJoin(
        "document_upload as du",
        "td.document_unique_id",
        "du.system_reference_id"
      )
      .leftJoin(
        "document_name_master as dnm",
        "td.document_type_id",
        "dnm.doc_name_master_id"
      )
      .where("td.document_unique_id", documentId)
      .where("td.status", "ACTIVE")
      .select(
        "td.document_type_id",
        "dnm.document_name as documentTypeName",
        "td.document_number",
        "td.reference_number",
        "td.country",
        "td.valid_from",
        "td.valid_to",
        "td.active",
        "du.file_name",
        "du.file_type",
        "du.file_xstring_value as fileData"
      )
      .first();

    if (!document) {
      return res.status(404).json({
        success: false,
        error: {
          code: "DOCUMENT_NOT_FOUND",
          message: "Document not found",
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Helper function to format date to YYYY-MM-DD
    const formatDateForInput = (dateValue) => {
      if (!dateValue) return null;
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return null;
      return date.toISOString().split("T")[0];
    };

    const response = {
      documentType: document.documentTypeName || document.document_type_id,
      documentTypeId: document.document_type_id,
      documentNumber: document.document_number,
      referenceNumber: document.reference_number,
      country: document.country,
      validFrom: formatDateForInput(document.valid_from),
      validTo: formatDateForInput(document.valid_to),
      status: document.active,
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
    console.error("Error fetching document file:", error);
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

// ========================================
// SAVE AS DRAFT CONTROLLER
// ========================================
const saveTransporterAsDraft = async (req, res) => {
  try {
    const { generalDetails, addresses, serviceableAreas, documents } = req.body;
    const userId = req.user?.user_id; // Get from JWT token

    const currentTimestamp = new Date();

    console.log("📝 Starting save as draft - User:", userId);

    // Minimal validation - only business name required
    if (
      !generalDetails?.businessName ||
      generalDetails.businessName.trim().length < 2
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Business name is required (minimum 2 characters)",
          field: "businessName",
        },
      });
    }

    const trx = await knex.transaction();

    try {
      // Generate transporter ID
      const transporterId = await generateTransporterId();

      // Generate user_id for user_master
      const userMasterId = `UM${transporterId.slice(1)}`; // UM001, UM002, etc.

      console.log("🆔 Generated IDs:", { transporterId, userMasterId, userId });

      // Insert into transporter_general_info with SAVE_AS_DRAFT status
      await trx("transporter_general_info").insert({
        transporter_id: transporterId,
        user_type: "TRANSPORTER",
        business_name: generalDetails.businessName,
        trans_mode_road: generalDetails.transMode?.road || false,
        trans_mode_rail: generalDetails.transMode?.rail || false,
        trans_mode_air: generalDetails.transMode?.air || false,
        trans_mode_sea: generalDetails.transMode?.sea || false,
        active_flag:
          generalDetails.activeFlag !== undefined
            ? generalDetails.activeFlag
            : true,
        from_date: generalDetails.fromDate || null,
        to_date: generalDetails.toDate || null,
        avg_rating: generalDetails.avgRating || 0,
        status: "SAVE_AS_DRAFT", // Draft status
        created_by: userId,
        updated_by: userId,
        created_at: knex.fn.now(),
        updated_at: knex.fn.now(),
      });

      // Generate default password for draft user (will be reset on approval)
      const defaultPassword = await bcrypt.hash("TempDraft@123", 10);
      const currentTimestamp = knex.fn.now();

      // Insert into user_master with SAVE_AS_DRAFT status
      await trx("user_master").insert({
        user_id: userMasterId,
        user_type_id: "UT002", // Transporter user type (using user_type_id not user_type)
        user_full_name: generalDetails.businessName || "Draft Transporter",
        email_id: addresses?.[0]?.contacts?.[0]?.email || null,
        mobile_number:
          addresses?.[0]?.contacts?.[0]?.phoneNumber || "0000000000",
        from_date: generalDetails.fromDate || knex.raw("CURDATE()"),
        to_date: generalDetails.toDate || null,
        password: defaultPassword,
        password_type: "initial",
        status: "SAVE_AS_DRAFT", // Draft status
        created_by: userId,
        updated_by: userId,
        created_by_user_id: userId,
        created_at: currentTimestamp,
        updated_at: currentTimestamp,
        created_on: currentTimestamp,
        updated_on: currentTimestamp,
        is_active: false, // Inactive until approved
      });

      // Save partial address data if provided
      const generatedAddressIds = new Set();
      if (addresses && addresses.length > 0) {
        for (const address of addresses) {
          if (address.country || address.state || address.city) {
            const addressId = await generateAddressId(trx, generatedAddressIds);
            generatedAddressIds.add(addressId);

            await trx("tms_address").insert({
              address_id: addressId,
              user_reference_id: transporterId,
              user_type: "TRANSPORTER",
              country: address.country || null,
              state: address.state || null,
              city: address.city || null,
              district: address.district || null,
              street_1: address.street1 || null,
              street_2: address.street2 || null,
              postal_code: address.postalCode || null,
              vat_number: address.vatNumber || null,
              is_primary: address.isPrimary || false,
              address_type_id: "AT001",
              status: "ACTIVE",
              created_by: userId,
              updated_by: userId,
              created_at: currentTimestamp,
              updated_at: currentTimestamp,
              created_on: currentTimestamp,
              updated_on: currentTimestamp,
            });

            // Save contacts if provided
            if (address.contacts && address.contacts.length > 0) {
              const generatedContactIds = new Set();
              for (const contact of address.contacts) {
                if (contact.name || contact.phoneNumber || contact.email) {
                  const contactId = await generateContactId(
                    trx,
                    generatedContactIds
                  );
                  generatedContactIds.add(contactId);

                  await trx("transporter_contact").insert({
                    tcontact_id: contactId,
                    transporter_id: transporterId,
                    address_id: addressId,
                    contact_person_name: contact.name || null,
                    role: contact.role || null,
                    phone_number: contact.phoneNumber || null,
                    alternate_phone_number:
                      contact.alternatePhoneNumber || null,
                    whats_app_number: contact.whatsappNumber || null,
                    email_id: contact.email || null,
                    alternate_email_id: contact.alternateEmail || null,
                    status: "ACTIVE",
                    created_by: userId,
                    updated_by: userId,
                    created_at: currentTimestamp,
                    updated_at: currentTimestamp,
                    created_on: currentTimestamp,
                    updated_on: currentTimestamp,
                  });
                }
              }
            }
          }
        }
      }

      // Save partial serviceable areas if provided
      if (serviceableAreas && serviceableAreas.length > 0) {
        for (const area of serviceableAreas) {
          if (area.country && area.states && area.states.length > 0) {
            const headerId = await generateServiceAreaHeaderId(trx);

            await trx("transporter_service_area_hdr").insert({
              service_area_hdr_id: headerId,
              transporter_id: transporterId,
              service_country: area.country,
              status: "ACTIVE",
              created_by: userId,
              updated_by: userId,
              created_at: currentTimestamp,
              updated_at: currentTimestamp,
              created_on: currentTimestamp,
              updated_on: currentTimestamp,
            });

            for (const state of area.states) {
              const itemId = await generateServiceAreaItemId(trx);
              await trx("transporter_service_area_itm").insert({
                service_area_itm_id: itemId,
                service_area_hdr_id: headerId,
                service_state: state,
                status: "ACTIVE",
                created_by: userId,
                updated_by: userId,
                created_at: currentTimestamp,
                updated_at: currentTimestamp,
                created_on: currentTimestamp,
                updated_on: currentTimestamp,
              });
            }
          }
        }
      }

      // Save partial documents if provided
      const generatedDocIds = new Set();
      if (documents && documents.length > 0) {
        for (const doc of documents) {
          if (doc.documentNumber || doc.documentType) {
            const docId = await generateDocumentId(trx, generatedDocIds);
            generatedDocIds.add(docId);
            const documentUniqueId = `${transporterId}_${docId}`;

            await trx("transporter_documents").insert({
              document_unique_id: documentUniqueId,
              document_id: docId,
              document_type_id: doc.documentType || null,
              document_number: doc.documentNumber || null,
              reference_number: doc.referenceNumber || null,
              country: doc.country || null,
              valid_from: doc.validFrom || null,
              valid_to: doc.validTo || null,
              active: doc.status !== undefined ? doc.status : true,
              user_type: "TRANSPORTER",
              status: "ACTIVE",
              created_by: userId,
              updated_by: userId,
              created_at: currentTimestamp,
              updated_at: currentTimestamp,
              created_on: currentTimestamp,
              updated_on: currentTimestamp,
            });

            // Handle file upload if provided
            if (doc.fileName && doc.fileData) {
              const uploadId = await generateDocumentUploadId(trx);

              await trx("document_upload").insert({
                document_id: uploadId,
                file_name: doc.fileName,
                file_type: doc.fileType || "application/pdf",
                file_xstring_value: doc.fileData,
                system_reference_id: documentUniqueId,
                status: "ACTIVE",
                created_by: userId,
                updated_by: userId,
                created_at: currentTimestamp,
                updated_at: currentTimestamp,
                created_on: currentTimestamp,
                updated_on: currentTimestamp,
              });
            }
          }
        }
      }

      await trx.commit();

      console.log("✅ Draft saved successfully:", transporterId);

      return res.status(200).json({
        success: true,
        message: "Transporter saved as draft successfully",
        data: {
          transporterId,
          userMasterId,
          status: "SAVE_AS_DRAFT",
        },
      });
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    console.error("❌ Save as draft error:", error);
    return res.status(500).json({
      success: false,
      error: {
        code: "SAVE_DRAFT_ERROR",
        message: "Failed to save transporter as draft",
        details: error.message,
      },
    });
  }
};

// ========================================
// UPDATE DRAFT CONTROLLER
// ========================================
const updateTransporterDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const { generalDetails, addresses, serviceableAreas, documents } = req.body;
    const userId = req.user?.user_id;

    const currentTimestamp = new Date();

    console.log("📝 Updating draft:", id, "User:", userId);

    // Verify it's a draft and belongs to the user
    const existing = await knex("transporter_general_info")
      .where("transporter_id", id)
      .first();

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Transporter not found",
        },
      });
    }

    if (existing.status !== "SAVE_AS_DRAFT") {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_STATUS",
          message:
            "Can only update drafts. Use regular update endpoint for active transporters",
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

    // Minimal validation
    if (
      !generalDetails?.businessName ||
      generalDetails.businessName.trim().length < 2
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Business name is required (minimum 2 characters)",
          field: "businessName",
        },
      });
    }

    const trx = await knex.transaction();

    try {
      // Update general info
      await trx("transporter_general_info")
        .where("transporter_id", id)
        .update({
          business_name: generalDetails.businessName,
          trans_mode_road: generalDetails.transMode?.road || false,
          trans_mode_rail: generalDetails.transMode?.rail || false,
          trans_mode_air: generalDetails.transMode?.air || false,
          trans_mode_sea: generalDetails.transMode?.sea || false,
          from_date: generalDetails.fromDate || null,
          to_date: generalDetails.toDate || null,
          avg_rating: generalDetails.avgRating || 0,
          updated_by: userId,
          updated_at: knex.fn.now(),
        });

      // Delete existing related data and re-insert
      await trx("tms_address").where("user_reference_id", id).del();
      await trx("transporter_contact").where("transporter_id", id).del();
      await trx("transporter_service_area_itm")
        .whereIn("service_area_hdr_id", function () {
          this.select("service_area_hdr_id")
            .from("transporter_service_area_hdr")
            .where("transporter_id", id);
        })
        .del();
      await trx("transporter_service_area_hdr")
        .where("transporter_id", id)
        .del();
      await trx("document_upload")
        .whereIn("system_reference_id", function () {
          this.select("document_unique_id")
            .from("transporter_documents")
            .where("document_unique_id", "like", `${id}_%`);
        })
        .del();
      await trx("transporter_documents")
        .where("document_unique_id", "like", `${id}_%`)
        .del();

      // Re-insert partial data (same logic as save draft)
      const generatedAddressIds = new Set();
      if (addresses && addresses.length > 0) {
        for (const address of addresses) {
          if (address.country || address.state || address.city) {
            const addressId = await generateAddressId(trx, generatedAddressIds);
            generatedAddressIds.add(addressId);

            await trx("tms_address").insert({
              address_id: addressId,
              user_reference_id: id,
              user_type: "TRANSPORTER",
              country: address.country || null,
              state: address.state || null,
              city: address.city || null,
              district: address.district || null,
              street_1: address.street1 || null,
              street_2: address.street2 || null,
              postal_code: address.postalCode || null,
              vat_number: address.vatNumber || null,
              is_primary: address.isPrimary || false,
              address_type_id: "AT001",
              status: "ACTIVE",
              created_by: userId,
              updated_by: userId,
              created_at: currentTimestamp,
              updated_at: currentTimestamp,
              created_on: currentTimestamp,
              updated_on: currentTimestamp,
            });

            if (address.contacts && address.contacts.length > 0) {
              const generatedContactIds = new Set();
              for (const contact of address.contacts) {
                if (contact.name || contact.phoneNumber || contact.email) {
                  const contactId = await generateContactId(
                    trx,
                    generatedContactIds
                  );
                  generatedContactIds.add(contactId);

                  await trx("transporter_contact").insert({
                    tcontact_id: contactId,
                    transporter_id: id,
                    address_id: addressId,
                    contact_person_name: contact.name || null,
                    role: contact.role || null,
                    phone_number: contact.phoneNumber || null,
                    alternate_phone_number:
                      contact.alternatePhoneNumber || null,
                    whats_app_number: contact.whatsappNumber || null,
                    email_id: contact.email || null,
                    alternate_email_id: contact.alternateEmail || null,
                    status: "ACTIVE",
                    created_by: userId,
                    updated_by: userId,
                    created_at: currentTimestamp,
                    updated_at: currentTimestamp,
                    created_on: currentTimestamp,
                    updated_on: currentTimestamp,
                  });
                }
              }
            }
          }
        }
      }

      // Re-insert serviceable areas
      if (serviceableAreas && serviceableAreas.length > 0) {
        for (const area of serviceableAreas) {
          if (area.country && area.states && area.states.length > 0) {
            const headerId = await generateServiceAreaHeaderId(trx);

            await trx("transporter_service_area_hdr").insert({
              service_area_hdr_id: headerId,
              transporter_id: id,
              service_country: area.country,
              status: "ACTIVE",
              created_by: userId,
              updated_by: userId,
              created_at: currentTimestamp,
              updated_at: currentTimestamp,
              created_on: currentTimestamp,
              updated_on: currentTimestamp,
            });

            for (const state of area.states) {
              const itemId = await generateServiceAreaItemId(trx);
              await trx("transporter_service_area_itm").insert({
                service_area_itm_id: itemId,
                service_area_hdr_id: headerId,
                service_state: state,
                status: "ACTIVE",
                created_by: userId,
                updated_by: userId,
                created_at: currentTimestamp,
                updated_at: currentTimestamp,
                created_on: currentTimestamp,
                updated_on: currentTimestamp,
              });
            }
          }
        }
      }

      // Re-insert documents
      const generatedDocIds = new Set();
      if (documents && documents.length > 0) {
        for (const doc of documents) {
          if (doc.documentNumber || doc.documentType) {
            const docId = await generateDocumentId(trx, generatedDocIds);
            generatedDocIds.add(docId);
            const documentUniqueId = `${id}_${docId}`;

            await trx("transporter_documents").insert({
              document_unique_id: documentUniqueId,
              document_id: docId,
              document_type_id: doc.documentType || null,
              document_number: doc.documentNumber || null,
              reference_number: doc.referenceNumber || null,
              country: doc.country || null,
              valid_from: doc.validFrom || null,
              valid_to: doc.validTo || null,
              active: doc.status !== undefined ? doc.status : true,
              user_type: "TRANSPORTER",
              status: "ACTIVE",
              created_by: userId,
              updated_by: userId,
              created_at: currentTimestamp,
              updated_at: currentTimestamp,
              created_on: currentTimestamp,
              updated_on: currentTimestamp,
            });

            if (doc.fileName && doc.fileData) {
              const uploadId = await generateDocumentUploadId(trx);

              await trx("document_upload").insert({
                document_id: uploadId,
                file_name: doc.fileName,
                file_type: doc.fileType || "application/pdf",
                file_xstring_value: doc.fileData,
                system_reference_id: documentUniqueId,
                status: "ACTIVE",
                created_by: userId,
                updated_by: userId,
                created_at: currentTimestamp,
                updated_at: currentTimestamp,
                created_on: currentTimestamp,
                updated_on: currentTimestamp,
              });
            }
          }
        }
      }

      await trx.commit();

      console.log("✅ Draft updated successfully:", id);

      return res.status(200).json({
        success: true,
        message: "Draft updated successfully",
        data: {
          transporterId: id,
          status: "SAVE_AS_DRAFT",
        },
      });
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    console.error("❌ Update draft error:", error);
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

// ========================================
// SUBMIT DRAFT FOR APPROVAL CONTROLLER
// ========================================
const submitTransporterFromDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const { generalDetails, addresses, serviceableAreas, documents } = req.body;
    const userId = req.user?.user_id;

    const currentTimestamp = new Date();

    console.log("📤 Submitting draft for approval:", id, "User:", userId);

    // Verify it's a draft and belongs to the user
    const existing = await knex("transporter_general_info")
      .where("transporter_id", id)
      .first();

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Transporter not found",
        },
      });
    }

    if (existing.status !== "SAVE_AS_DRAFT") {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_STATUS",
          message:
            "Can only submit drafts for approval. This transporter is already submitted.",
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

    // ========================================
    // COMPREHENSIVE VALIDATION - Same as createTransporter
    // ========================================

    console.log("🔍 Starting submit-draft validation - VALIDATION PHASE");

    // Validate general details - business name
    if (
      !generalDetails?.businessName ||
      generalDetails.businessName.trim().length < 2
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: ERROR_MESSAGES.BUSINESS_NAME_TOO_SHORT,
          field: "generalDetails.businessName",
        },
      });
    }

    // Validate from date
    if (!generalDetails.fromDate) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: ERROR_MESSAGES.FROM_DATE_REQUIRED,
          field: "generalDetails.fromDate",
        },
      });
    }

    // Validate transport modes - at least one must be selected
    const transportModes = [
      generalDetails.transMode?.road,
      generalDetails.transMode?.rail,
      generalDetails.transMode?.air,
      generalDetails.transMode?.sea,
    ];

    if (!transportModes.some((mode) => mode)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: ERROR_MESSAGES.TRANSPORT_MODE_REQUIRED,
          field: "generalDetails.transMode",
        },
      });
    }

    // Validate addresses
    if (!addresses || addresses.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: ERROR_MESSAGES.ADDRESS_REQUIRED,
          field: "addresses",
        },
      });
    }

    // Validate each address comprehensively
    for (let i = 0; i < addresses.length; i++) {
      const address = addresses[i];

      // Validate VAT number
      if (
        !address.vatNumber ||
        !validateVATNumber(address.vatNumber, address.country)
      ) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: ERROR_MESSAGES.VAT_NUMBER_INVALID,
            field: `addresses[${i}].vatNumber`,
          },
        });
      }

      // Validate country, state, city
      if (!address.country || !address.state || !address.city) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: ERROR_MESSAGES.COUNTRY_STATE_CITY_REQUIRED,
            field: `addresses[${i}]`,
          },
        });
      }

      // Validate contacts for each address
      if (!address.contacts || address.contacts.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: ERROR_MESSAGES.CONTACT_REQUIRED,
            field: `addresses[${i}].contacts`,
          },
        });
      }

      // Validate each contact
      for (let j = 0; j < address.contacts.length; j++) {
        const contact = address.contacts[j];

        // Validate contact name
        if (!contact.name || contact.name.trim().length < 2) {
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: ERROR_MESSAGES.CONTACT_NAME_REQUIRED,
              field: `addresses[${i}].contacts[${j}].name`,
            },
          });
        }

        // Validate phone number
        if (!contact.phoneNumber || !validatePhoneNumber(contact.phoneNumber)) {
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: ERROR_MESSAGES.PHONE_NUMBER_INVALID,
              field: `addresses[${i}].contacts[${j}].phoneNumber`,
            },
          });
        }

        // Validate alternate phone if provided
        if (
          contact.alternatePhoneNumber &&
          !validatePhoneNumber(contact.alternatePhoneNumber)
        ) {
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: ERROR_MESSAGES.ALTERNATE_PHONE_INVALID,
              field: `addresses[${i}].contacts[${j}].alternatePhoneNumber`,
            },
          });
        }

        // Validate email
        if (!contact.email || !validateEmail(contact.email)) {
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: ERROR_MESSAGES.EMAIL_INVALID,
              field: `addresses[${i}].contacts[${j}].email`,
            },
          });
        }
      }
    }

    // Validate primary address exists
    const primaryAddress = addresses.find((addr) => addr.isPrimary);
    if (!primaryAddress) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "At least one address must be marked as primary",
          field: "addresses",
        },
      });
    }

    // Validate serviceable areas
    if (!serviceableAreas || serviceableAreas.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: ERROR_MESSAGES.SERVICEABLE_AREA_REQUIRED,
          field: "serviceableAreas",
        },
      });
    }

    // Check for duplicate countries in serviceable areas
    const countries = serviceableAreas.map((area) => area.country);
    const uniqueCountries = [...new Set(countries)];
    if (countries.length !== uniqueCountries.length) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: ERROR_MESSAGES.SERVICEABLE_AREA_DUPLICATE,
          field: "serviceableAreas",
        },
      });
    }

    // Validate each serviceable area
    for (let i = 0; i < serviceableAreas.length; i++) {
      const area = serviceableAreas[i];

      if (!area.country) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: `Country is required for serviceable area ${i + 1}`,
            field: `serviceableAreas[${i}].country`,
          },
        });
      }

      if (!area.states || area.states.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: `At least one state must be selected for serviceable area ${
              i + 1
            }`,
            field: `serviceableAreas[${i}].states`,
          },
        });
      }

      // Validate that states belong to the specified country
      const country = Country.getAllCountries().find(
        (c) => c.name === area.country
      );
      if (!country) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: `Invalid country: ${area.country}`,
            field: `serviceableAreas[${i}].country`,
          },
        });
      }

      const validStates = State.getStatesOfCountry(country.isoCode);
      const validStateNames = validStates.map((s) => s.name);

      for (const stateName of area.states) {
        if (!validStateNames.includes(stateName)) {
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: `State "${stateName}" does not belong to country "${area.country}". Please select valid states for this country.`,
              field: `serviceableAreas[${i}].states`,
            },
          });
        }
      }
    }

    // Validate documents
    if (!documents || documents.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: ERROR_MESSAGES.DOCUMENT_REQUIRED,
          field: "documents",
        },
      });
    }

    // Validate each document
    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];

      if (!doc.documentType) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: ERROR_MESSAGES.DOCUMENT_TYPE_REQUIRED,
            field: `documents[${i}].documentType`,
          },
        });
      }

      if (!doc.documentNumber) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: ERROR_MESSAGES.DOCUMENT_NUMBER_REQUIRED,
            field: `documents[${i}].documentNumber`,
          },
        });
      }

      // Validate document number format based on document type
      const docTypeInfo = await knex("document_name_master")
        .where(function () {
          this.where("doc_name_master_id", doc.documentType).orWhere(
            "document_name",
            doc.documentType
          );
        })
        .first();

      if (docTypeInfo) {
        doc.documentTypeId = docTypeInfo.doc_name_master_id;

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

        doc.documentNumber = doc.documentNumber.trim().toUpperCase();
      } else {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: `Invalid document type: ${doc.documentType}`,
            field: `documents[${i}].documentType`,
          },
        });
      }

      if (!doc.country) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: ERROR_MESSAGES.DOCUMENT_COUNTRY_REQUIRED,
            field: `documents[${i}].country`,
          },
        });
      }

      if (!doc.validFrom) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: ERROR_MESSAGES.DOCUMENT_VALID_FROM_REQUIRED,
            field: `documents[${i}].validFrom`,
          },
        });
      }

      if (!doc.validTo) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: ERROR_MESSAGES.DOCUMENT_VALID_TO_REQUIRED,
            field: `documents[${i}].validTo`,
          },
        });
      }

      // Validate date range
      const validFrom = new Date(doc.validFrom);
      const validTo = new Date(doc.validTo);

      if (validTo <= validFrom) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: ERROR_MESSAGES.DOCUMENT_DATE_INVALID,
            field: `documents[${i}].validTo`,
          },
        });
      }
    }

    // Check for duplicate VAT numbers (exclude current transporter's addresses)
    const vatNumbers = addresses.map((addr) => addr.vatNumber);
    const existingVATCheck = await knex("tms_address")
      .whereIn("vat_number", vatNumbers)
      .whereNot("user_reference_id", id)
      .andWhere("status", "ACTIVE");

    if (existingVATCheck.length > 0) {
      const duplicateVAT = existingVATCheck[0].vat_number;
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: `VAT number ${duplicateVAT} already exists. Please use a unique VAT number`,
          field: "vatNumber",
          value: duplicateVAT,
        },
      });
    }

    // Check for duplicate document numbers (exclude current transporter's documents)
    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      const documentTypeId = doc.documentTypeId || doc.documentType;

      const existingDoc = await knex("transporter_documents")
        .where("document_number", doc.documentNumber)
        .andWhere("document_type_id", documentTypeId)
        .whereNot("document_unique_id", "like", `${id}_%`)
        .andWhere("status", "ACTIVE")
        .first();

      if (existingDoc) {
        const docTypeInfo = await knex("document_name_master")
          .where("doc_name_master_id", documentTypeId)
          .first();

        const docTypeName = docTypeInfo
          ? docTypeInfo.document_name
          : "this document type";

        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: `Document number ${doc.documentNumber} already exists for ${docTypeName}. Please use a unique document number`,
            field: `documents[${i}].documentNumber`,
            value: doc.documentNumber,
          },
        });
      }
    }

    console.log(
      "✅ ALL VALIDATIONS PASSED - Starting submit-draft transaction"
    );

    const trx = await knex.transaction();

    try {
      // Update general info to PENDING status
      await trx("transporter_general_info")
        .where("transporter_id", id)
        .update({
          business_name: generalDetails.businessName,
          trans_mode_road: generalDetails.transMode?.road || false,
          trans_mode_rail: generalDetails.transMode?.rail || false,
          trans_mode_air: generalDetails.transMode?.air || false,
          trans_mode_sea: generalDetails.transMode?.sea || false,
          from_date: generalDetails.fromDate || null,
          to_date: generalDetails.toDate || null,
          avg_rating: generalDetails.avgRating || 0,
          status: "PENDING", // Change status to PENDING
          updated_by: userId,
          updated_at: knex.fn.now(),
        });

      // Update user_master to PENDING status
      const userMasterId = `UM${id.slice(1)}`;
      await trx("user_master").where("user_id", userMasterId).update({
        user_full_name: generalDetails.businessName,
        status: "PENDING",
        updated_by: userId,
        updated_at: knex.fn.now(),
      });

      // Delete existing related data and re-insert with complete data
      await trx("tms_address").where("user_reference_id", id).del();
      await trx("transporter_contact").where("transporter_id", id).del();
      await trx("transporter_service_area_itm")
        .whereIn("service_area_hdr_id", function () {
          this.select("service_area_hdr_id")
            .from("transporter_service_area_hdr")
            .where("transporter_id", id);
        })
        .del();
      await trx("transporter_service_area_hdr")
        .where("transporter_id", id)
        .del();
      await trx("document_upload")
        .whereIn("system_reference_id", function () {
          this.select("document_unique_id")
            .from("transporter_documents")
            .where("document_unique_id", "like", `${id}_%`);
        })
        .del();
      await trx("transporter_documents")
        .where("document_unique_id", "like", `${id}_%`)
        .del();

      // Re-insert complete data (same logic as createTransporter)
      const generatedAddressIds = new Set();
      for (const address of addresses) {
        const addressId = await generateAddressId(trx, generatedAddressIds);
        generatedAddressIds.add(addressId);

        await trx("tms_address").insert({
          address_id: addressId,
          user_reference_id: id,
          user_type: "TRANSPORTER",
          country: address.country,
          state: address.state,
          city: address.city,
          district: address.district || null,
          street_1: address.street1 || null,
          street_2: address.street2 || null,
          postal_code: address.postalCode || null,
          vat_number: address.vatNumber || null,
          is_primary: address.isPrimary || false,
          address_type_id: "AT001",
          status: "ACTIVE",
          created_by: userId,
          updated_by: userId,
          created_at: currentTimestamp,
          updated_at: currentTimestamp,
          created_on: currentTimestamp,
          updated_on: currentTimestamp,
        });

        if (address.contacts && address.contacts.length > 0) {
          const generatedContactIds = new Set();
          for (const contact of address.contacts) {
            const contactId = await generateContactId(trx, generatedContactIds);
            generatedContactIds.add(contactId);

            await trx("transporter_contact").insert({
              tcontact_id: contactId,
              transporter_id: id,
              address_id: addressId,
              contact_person_name: contact.name,
              role: contact.role || null,
              phone_number: contact.phoneNumber,
              alternate_phone_number: contact.alternatePhoneNumber || null,
              whats_app_number: contact.whatsappNumber || null,
              email_id: contact.email || null,
              alternate_email_id: contact.alternateEmail || null,
              status: "ACTIVE",
              created_by: userId,
              updated_by: userId,
              created_at: currentTimestamp,
              updated_at: currentTimestamp,
              created_on: currentTimestamp,
              updated_on: currentTimestamp,
            });
          }
        }
      }

      // Re-insert serviceable areas
      for (const area of serviceableAreas) {
        const headerId = await generateServiceAreaHeaderId(trx);

        await trx("transporter_service_area_hdr").insert({
          service_area_hdr_id: headerId,
          transporter_id: id,
          service_country: area.country,
          status: "ACTIVE",
          created_by: userId,
          updated_by: userId,
          created_at: currentTimestamp,
          updated_at: currentTimestamp,
          created_on: currentTimestamp,
          updated_on: currentTimestamp,
        });

        for (const state of area.states) {
          const itemId = await generateServiceAreaItemId(trx);
          await trx("transporter_service_area_itm").insert({
            service_area_itm_id: itemId,
            service_area_hdr_id: headerId,
            service_state: state,
            status: "ACTIVE",
            created_by: userId,
            updated_by: userId,
            created_at: currentTimestamp,
            updated_at: currentTimestamp,
            created_on: currentTimestamp,
            updated_on: currentTimestamp,
          });
        }
      }

      // Re-insert documents if provided
      if (documents && documents.length > 0) {
        const generatedDocIds = new Set();
        for (const doc of documents) {
          const docId = await generateDocumentId(trx, generatedDocIds);
          generatedDocIds.add(docId);
          const documentUniqueId = `${id}_${docId}`;

          await trx("transporter_documents").insert({
            document_unique_id: documentUniqueId,
            document_id: docId,
            document_type_id: doc.documentType,
            document_number: doc.documentNumber,
            reference_number: doc.referenceNumber || null,
            country: doc.country || null,
            valid_from: doc.validFrom || null,
            valid_to: doc.validTo || null,
            active: doc.status !== undefined ? doc.status : true,
            user_type: "TRANSPORTER",
            created_by: userId,
            updated_by: userId,
            created_at: currentTimestamp,
            updated_at: currentTimestamp,
            created_on: currentTimestamp,
            updated_on: currentTimestamp,
            status: "ACTIVE",
          });

          if (doc.fileData) {
            const uploadId = await generateDocumentUploadId(trx);
            await trx("document_upload").insert({
              document_id: uploadId,
              file_xstring_value: doc.fileData,
              file_name: doc.fileName || "document",
              file_type: doc.fileType || "application/pdf",
              system_reference_id: documentUniqueId,
              status: "ACTIVE",
              created_by: userId,
              updated_by: userId,
              created_at: currentTimestamp,
              updated_at: currentTimestamp,
              created_on: currentTimestamp,
              updated_on: currentTimestamp,
            });
          }
        }
      }

      await trx.commit();

      console.log("✅ Draft submitted for approval successfully:", id);

      return res.status(200).json({
        success: true,
        message:
          "Draft submitted for approval successfully. Status changed to PENDING.",
        data: {
          transporterId: id,
          status: "PENDING",
        },
      });
    } catch (error) {
      await trx.rollback();
      console.error("❌ Submit draft transaction error:", error);
      throw error;
    }
  } catch (error) {
    console.error("❌ Submit draft error:", error);
    return res.status(500).json({
      success: false,
      error: {
        code: "SUBMIT_DRAFT_ERROR",
        message: "Failed to submit draft for approval",
        details: error.message,
      },
    });
  }
};

// ========================================
// DELETE DRAFT CONTROLLER
// ========================================
const deleteTransporterDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.user_id;

    console.log("🗑️ Deleting draft:", id, "User:", userId);

    // Verify it's a draft and belongs to the user
    const existing = await knex("transporter_general_info")
      .where("transporter_id", id)
      .first();

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Transporter not found",
        },
      });
    }

    if (existing.status !== "SAVE_AS_DRAFT") {
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

    const trx = await knex.transaction();

    try {
      // Delete all related data
      await trx("tms_address").where("user_reference_id", id).del();
      await trx("transporter_contact").where("transporter_id", id).del();
      await trx("transporter_service_area_itm")
        .whereIn("service_area_hdr_id", function () {
          this.select("service_area_hdr_id")
            .from("transporter_service_area_hdr")
            .where("transporter_id", id);
        })
        .del();
      await trx("transporter_service_area_hdr")
        .where("transporter_id", id)
        .del();
      await trx("document_upload")
        .whereIn("system_reference_id", function () {
          this.select("document_unique_id")
            .from("transporter_documents")
            .where("document_unique_id", "like", `${id}_%`);
        })
        .del();
      await trx("transporter_documents")
        .where("document_unique_id", "like", `${id}_%`)
        .del();

      // Delete from user_master
      const userMasterId = `UM${id.slice(1)}`;
      await trx("user_master").where("user_id", userMasterId).del();

      // Delete transporter record
      await trx("transporter_general_info").where("transporter_id", id).del();

      await trx.commit();

      console.log("✅ Draft deleted successfully:", id);

      return res.status(200).json({
        success: true,
        message: "Draft deleted successfully",
      });
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    console.error("❌ Delete draft error:", error);
    return res.status(500).json({
      success: false,
      error: {
        code: "DELETE_DRAFT_ERROR",
        message: "Failed to delete draft",
        details: error.message,
      },
    });
  }
};

module.exports = {
  createTransporter,
  updateTransporter,
  getMasterData,
  getStatesByCountry,
  getCitiesByCountryAndState,
  getTransporters,
  getTransporterById,
  getDocumentFile,
  saveTransporterAsDraft,
  updateTransporterDraft,
  deleteTransporterDraft,
  submitTransporterFromDraft,
};
