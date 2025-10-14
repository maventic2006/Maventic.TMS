const knex = require("../config/database");
const { Country, State, City } = require("country-state-city");
const fs = require("fs").promises;
const path = require("path");

// Helper function to generate unique IDs
const generateTransporterId = async () => {
  const result = await knex("transporter_general_info")
    .count("* as count")
    .first();
  const count = parseInt(result.count) + 1;
  return `T${count.toString().padStart(3, "0")}`;
};

const generateAddressId = async () => {
  const result = await knex("tms_address").count("* as count").first();
  const count = parseInt(result.count) + 1;
  return `ADDR${count.toString().padStart(4, "0")}`;
};

const generateContactId = async () => {
  const result = await knex("transporter_contact").count("* as count").first();
  const count = parseInt(result.count) + 1;
  return `TC${count.toString().padStart(4, "0")}`;
};

const generateServiceAreaHeaderId = async () => {
  const result = await knex("transporter_service_area_hdr")
    .count("* as count")
    .first();
  const count = parseInt(result.count) + 1;
  return `SAH${count.toString().padStart(4, "0")}`;
};

const generateServiceAreaItemId = async () => {
  const result = await knex("transporter_service_area_itm")
    .count("* as count")
    .first();
  const count = parseInt(result.count) + 1;
  return `SAI${count.toString().padStart(4, "0")}`;
};

const generateDocumentId = async () => {
  const result = await knex("transporter_documents")
    .count("* as count")
    .first();
  const count = parseInt(result.count) + 1;
  return `DOC${count.toString().padStart(4, "0")}`;
};

const generateDocumentUploadId = async () => {
  const result = await knex("document_upload").count("* as count").first();
  const count = parseInt(result.count) + 1;
  return `DU${count.toString().padStart(4, "0")}`;
};

// Validation functions
const validatePhoneNumber = (phoneNumber) => {
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
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
  const trx = await knex.transaction();

  try {
    const { generalDetails, addresses, serviceableAreas, documents } = req.body;

    // Validate general details
    if (
      !generalDetails.businessName ||
      generalDetails.businessName.trim().length < 2
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message:
            "Business name is required and must be at least 2 characters",
          field: "businessName",
        },
      });
    }

    if (!generalDetails.fromDate) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "From date is required",
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
          message: "At least one transport mode must be selected",
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
          message: "At least one address must be provided",
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
            message: `Invalid VAT number format for address ${i + 1}`,
            field: `addresses[${i}].vatNumber`,
            details: {
              provided: address.vatNumber,
              expected: "Valid VAT number format for the selected country",
            },
          },
        });
      }

      if (!address.country || !address.state || !address.city) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: `Country, state and city are required for address ${
              i + 1
            }`,
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
            message: `At least one contact must be provided for address ${
              i + 1
            }`,
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
              message: `Contact name is required and must be at least 2 characters for address ${
                i + 1
              }, contact ${j + 1}`,
              field: `addresses[${i}].contacts[${j}].name`,
            },
          });
        }

        if (!contact.phoneNumber || !validatePhoneNumber(contact.phoneNumber)) {
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: `Invalid phone number format for address ${
                i + 1
              }, contact ${j + 1}. Use format: +[country code][number]`,
              field: `addresses[${i}].contacts[${j}].phoneNumber`,
              details: {
                provided: contact.phoneNumber,
                expected: "+[country code][number]",
              },
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
              message: `Invalid alternate phone number format for address ${
                i + 1
              }, contact ${j + 1}`,
              field: `addresses[${i}].contacts[${j}].alternatePhoneNumber`,
            },
          });
        }

        if (!contact.email || !validateEmail(contact.email)) {
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: `Invalid email format for address ${i + 1}, contact ${
                j + 1
              }. Use format: example@domain.com`,
              field: `addresses[${i}].contacts[${j}].email`,
              details: {
                provided: contact.email,
                expected: "example@domain.com",
              },
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
          message: "At least one serviceable area must be provided",
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
          message: "Duplicate countries found in serviceable areas",
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
    }

    // Validate documents
    if (!documents || documents.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "At least one document must be provided",
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
            message: `Document type is required for document ${i + 1}`,
            field: `documents[${i}].documentType`,
          },
        });
      }

      if (!doc.documentNumber) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: `Document number is required for document ${i + 1}`,
            field: `documents[${i}].documentNumber`,
          },
        });
      }

      if (!doc.country) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: `Country is required for document ${i + 1}`,
            field: `documents[${i}].country`,
          },
        });
      }

      if (!doc.validFrom) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: `Valid from date is required for document ${i + 1}`,
            field: `documents[${i}].validFrom`,
          },
        });
      }

      if (!doc.validTo) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: `Valid to date is required for document ${i + 1}`,
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
            message: `Valid to date must be after valid from date for document ${
              i + 1
            }`,
            field: `documents[${i}].validTo`,
          },
        });
      }
    }

    // Check for duplicate VAT numbers
    const vatNumbers = addresses.map((addr) => addr.vatNumber);
    const existingVATCheck = await trx("tms_address")
      .whereIn("vat_number", vatNumbers)
      .andWhere("status", "ACTIVE");

    if (existingVATCheck.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: `VAT Number ${existingVATCheck[0].vat_number} already exists`,
          field: "vatNumber",
        },
      });
    }

    // Check for duplicate document numbers
    const docNumbers = documents.map((doc) => ({
      number: doc.documentNumber,
      type: doc.documentType,
    }));
    for (const docInfo of docNumbers) {
      const existingDoc = await trx("transporter_documents")
        .where("document_number", docInfo.number)
        .andWhere("document_type_id", docInfo.type)
        .andWhere("status", "ACTIVE")
        .first();

      if (existingDoc) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: `Document number ${docInfo.number} already exists for this document type`,
            field: "documentNumber",
          },
        });
      }
    }

    // All validations passed, start creating the transporter
    const transporterId = await generateTransporterId();
    const currentUser = req.user?.userId || "SYSTEM";
    const currentTimestamp = new Date();

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
    for (const address of addresses) {
      const addressId = await generateAddressId();

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
        const contactId = await generateContactId();

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
      }
    }

    // 3. Create serviceable areas
    for (const area of serviceableAreas) {
      const serviceAreaHeaderId = await generateServiceAreaHeaderId();

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
        const serviceAreaItemId = await generateServiceAreaItemId();

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
      }
    }

    // 4. Create documents and file uploads
    for (const doc of documents) {
      const documentId = await generateDocumentId();
      const documentUniqueId = `${transporterId}_${documentId}`;

      // Insert transporter document
      await trx("transporter_documents").insert({
        document_unique_id: documentUniqueId,
        document_id: documentId,
        document_type_id: doc.documentType,
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
          created_by: currentUser,
          updated_by: currentUser,
          created_at: currentTimestamp,
          updated_at: currentTimestamp,
          created_on: currentTimestamp,
          updated_on: currentTimestamp,
          status: "ACTIVE",
        });
      }
    }

    // Commit the transaction
    await trx.commit();

    res.status(201).json({
      success: true,
      data: {
        transporterId: transporterId,
        message: "Transporter created successfully",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Rollback the transaction
    await trx.rollback();

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

module.exports = {
  createTransporter,
  getMasterData,
  getStatesByCountry,
  getCitiesByCountryAndState,
};
