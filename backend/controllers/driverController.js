const knex = require("../config/database");
const { Country, State, City } = require("country-state-city");
const bcrypt = require("bcrypt");
const ERROR_MESSAGES = require("../utils/errorMessages");
const { validateDocumentNumber } = require("../utils/documentValidation");
const axios = require("axios");
const https = require("https");
// const bcrypt = require("bcrypt");

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

const generateHistoryId = async (trx = knex) => {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const result = await trx("driver_history_information")
      .count("* as count")
      .first();
    const count = parseInt(result.count) + 1 + attempts;
    const newId = `DHIS${count.toString().padStart(4, "0")}`;

    const existing = await trx("driver_history_information")
      .where("driver_history_id", newId)
      .first();
    if (!existing) {
      return newId;
    }

    attempts++;
  }

  throw new Error("Failed to generate unique history ID after 100 attempts");
};

const generateAccidentId = async (trx = knex) => {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const result = await trx("driver_accident_violation")
      .count("* as count")
      .first();
    const count = parseInt(result.count) + 1 + attempts;
    const newId = `DACC${count.toString().padStart(4, "0")}`;

    const existing = await trx("driver_accident_violation")
      .where("driver_violation_id", newId)
      .first();
    if (!existing) {
      return newId;
    }

    attempts++;
  }

  throw new Error(
    "Failed to generate unique accident/violation ID after 100 attempts"
  );
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

// Generate Driver Admin User ID (format: DA0001, DA0002, etc.)
const generateDriverAdminUserId = async (trx = knex) => {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const result = await trx("user_master")
      .where("user_type_id", "UT004") // Driver user type
      .andWhere("user_id", "like", "DA%")
      .count("* as count")
      .first();
    const count = parseInt(result.count) + 1 + attempts;
    const newId = `DA${count.toString().padStart(4, "0")}`;

    const existing = await trx("user_master").where("user_id", newId).first();
    if (!existing) {
      return newId;
    }

    attempts++;
  }

  throw new Error(
    "Failed to generate unique Driver Admin user ID after 100 attempts"
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

    const existing = await trx("approval_flow_trans")
      .where("approval_flow_trans_id", newId)
      .first();
    if (!existing) {
      return newId;
    }

    attempts++;
  }

  throw new Error(
    "Failed to generate unique approval flow ID after 100 attempts"
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

const validatePostalCode = (postalCode) => {
  // Indian postal code: 6 digits
  const postalRegex = /^\d{6}$/;
  return postalRegex.test(postalCode);
};

const validateDateOfBirth = (dateOfBirth) => {
  if (!dateOfBirth) {
    return { isValid: false, message: "Date of birth is required" };
  }

  const dob = new Date(dateOfBirth);
  const today = new Date();

  // Check if date is in the future
  if (dob > today) {
    return { isValid: false, message: "Date of birth cannot be in the future" };
  }

  // Calculate age
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  // Check if driver is at least 18 years old
  if (age < 18) {
    return {
      isValid: false,
      message: "Driver must be at least 18 years old",
    };
  }

  return { isValid: true, message: "" };
};

const validateVehicleRegistrationNumber = (regNumber) => {
  if (!regNumber) {
    return {
      isValid: false,
      message: "Vehicle registration number is required",
    };
  }

  // Indian vehicle registration format: XX00XX0000 or XX-00-XX-0000
  // Examples: MH12AB1234, DL1CAB1234, KA01MH1234
  const regRegex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$/;
  const cleanedReg = regNumber.trim().toUpperCase().replace(/[-\s]/g, "");

  if (!regRegex.test(cleanedReg)) {
    return {
      isValid: false,
      message:
        "Invalid vehicle registration number format. Expected format: XX00XX0000 (e.g., MH12AB1234)",
    };
  }

  return { isValid: true, message: "" };
};

const validateDateRange = (fromDate, toDate, fieldName = "Date") => {
  if (!fromDate || !toDate) {
    return { isValid: true, message: "" }; // Allow if dates are optional
  }

  const from = new Date(fromDate);
  const to = new Date(toDate);

  if (from > to) {
    return {
      isValid: false,
      message: `${fieldName}: From date must be before To date`,
    };
  }

  return { isValid: true, message: "" };
};

// Date formatting helper
// Helper function to format date to YYYY-MM-DD
// Fixed to handle timezone issues - prevents date shifting
const formatDateForInput = (dateValue) => {
  if (!dateValue) return null;

  // If already a string in YYYY-MM-DD format, return as-is
  if (typeof dateValue === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return dateValue;
  }

  // Handle Date objects or datetime strings
  const date = new Date(dateValue);
  // Check if date is valid
  if (isNaN(date.getTime())) return null;

  // ✅ FIX: Use local timezone methods to match MySQL DATE behavior
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// Create Driver Controller
const createDriver = async (req, res) => {
  const trx = await knex.transaction();

  try {
    const { basicInfo, addresses, documents, history, accidents } = req.body;

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
          message: ERROR_MESSAGES.DRIVER_NAME_TOO_SHORT,
          field: "fullName",
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Validate date of birth
    const dobValidation = validateDateOfBirth(basicInfo.dateOfBirth);
    if (!dobValidation.isValid) {
      await trx.rollback();
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: dobValidation.message,
          field: "dateOfBirth",
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
          message: ERROR_MESSAGES.DRIVER_PHONE_INVALID,
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
          message: ERROR_MESSAGES.DRIVER_EMAIL_INVALID,
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
          message: ERROR_MESSAGES.ALTERNATE_PHONE_DRIVER_INVALID,
          field: "alternatePhoneNumber",
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Validate emergency contact
    if (!basicInfo.emergencyContact) {
      await trx.rollback();
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: ERROR_MESSAGES.EMERGENCY_CONTACT_REQUIRED,
          field: "emergencyContact",
        },
        timestamp: new Date().toISOString(),
      });
    }

    if (!validatePhoneNumber(basicInfo.emergencyContact)) {
      await trx.rollback();
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: ERROR_MESSAGES.EMERGENCY_CONTACT_INVALID,
          field: "emergencyContact",
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
          message: ERROR_MESSAGES.DUPLICATE_PHONE_DRIVER,
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
            message: ERROR_MESSAGES.DUPLICATE_EMAIL_DRIVER,
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
          message: ERROR_MESSAGES.ADDRESS_REQUIRED,
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
            message: ERROR_MESSAGES.ADDRESS_TYPE_REQUIRED,
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
            message: ERROR_MESSAGES.COUNTRY_REQUIRED,
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
            message: ERROR_MESSAGES.STATE_REQUIRED,
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
            message: ERROR_MESSAGES.CITY_REQUIRED,
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
            message: ERROR_MESSAGES.POSTAL_CODE_REQUIRED,
            field: `addresses[${i}].postalCode`,
          },
          timestamp: new Date().toISOString(),
        });
      }

      // Validate postal code format
      if (!validatePostalCode(address.postalCode)) {
        await trx.rollback();
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: ERROR_MESSAGES.POSTAL_CODE_INVALID,
            field: `addresses[${i}].postalCode`,
          },
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Validate documents if provided
    // if (documents && documents.length > 0) {
    //   for (let i = 0; i < documents.length; i++) {
    //     const doc = documents[i];

    //     if (!doc.documentType) {
    //       await trx.rollback();
    //       return res.status(400).json({
    //         success: false,
    //         error: {
    //           code: "VALIDATION_ERROR",
    //           message: `Document ${i + 1}: Document type is required`,
    //           field: `documents[${i}].documentType`,
    //         },
    //         timestamp: new Date().toISOString(),
    //       });
    //     }

    //     if (!doc.documentNumber || doc.documentNumber.trim().length === 0) {
    //       await trx.rollback();
    //       return res.status(400).json({
    //         success: false,
    //         error: {
    //           code: "VALIDATION_ERROR",
    //           message: `Document ${i + 1}: Document number is required`,
    //           field: `documents[${i}].documentNumber`,
    //         },
    //         timestamp: new Date().toISOString(),
    //       });
    //     }

    //     // Validate document name exists in document_name_master and resolve ID
    //     const docNameInfo = await trx("document_name_master")
    //       .where(function () {
    //         this.where("doc_name_master_id", doc.documentType).orWhere(
    //           "document_name",
    //           doc.documentType
    //         );
    //       })
    //       .where("status", "ACTIVE")
    //       .first();

    //     if (!docNameInfo) {
    //       await trx.rollback();
    //       return res.status(400).json({
    //         success: false,
    //         error: {
    //           code: "VALIDATION_ERROR",
    //           message: `Document ${i + 1}: Invalid document type "${
    //             doc.documentType
    //           }"`,
    //           field: `documents[${i}].documentType`,
    //         },
    //         timestamp: new Date().toISOString(),
    //       });
    //     }

    //     // Store resolved ID and name for later use
    //     doc.documentTypeId = docNameInfo.doc_name_master_id;
    //     doc.documentTypeName = docNameInfo.document_name;

    //     // Validate document number format
    //     const docValidation = validateDocumentNumber(
    //       doc.documentNumber,
    //       doc.documentTypeName
    //     );
    //     if (!docValidation.isValid) {
    //       await trx.rollback();
    //       return res.status(400).json({
    //         success: false,
    //         error: {
    //           code: "VALIDATION_ERROR",
    //           message: `Document ${i + 1}: ${docValidation.message}`,
    //           field: `documents[${i}].documentNumber`,
    //         },
    //         timestamp: new Date().toISOString(),
    //       });
    //     }

    //     // Check for duplicate document number
    //     const existingDocCheck = await trx("driver_documents")
    //       .where("document_type_id", doc.documentTypeId)
    //       .where("document_number", doc.documentNumber)
    //       .first();

    //     if (existingDocCheck) {
    //       await trx.rollback();
    //       return res.status(400).json({
    //         success: false,
    //         error: {
    //           code: "DUPLICATE_DOCUMENT",
    //           message: `Document ${i + 1}: ${doc.documentTypeName} number ${
    //             doc.documentNumber
    //           } already exists`,
    //           field: `documents[${i}].documentNumber`,
    //         },
    //         timestamp: new Date().toISOString(),
    //       });
    //     }
    //   }
    // }

    // ========================================
    // DOCUMENT VALIDATION + DRIVER LICENSE CHECK
    // ========================================
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

        // Validate document exists in master
        const docNameInfo = await trx("document_name_master")
          .where(function () {
            this.where("doc_name_master_id", doc.documentType).orWhere(
              "document_name",
              doc.documentType
            );
          })
          .where("status", "ACTIVE")
          .first();

        if (!docNameInfo) {
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

        // Store resolved details
        doc.documentTypeId = docNameInfo.doc_name_master_id;
        doc.documentTypeName = docNameInfo.document_name;

        // Validate document format
        const docValidation = validateDocumentNumber(
          doc.documentNumber,
          doc.documentTypeName
        );
        if (!docValidation.isValid) {
          await trx.rollback();
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: `Document ${i + 1}: ${docValidation.message}`,
              field: `documents[${i}].documentNumber`,
            },
            timestamp: new Date().toISOString(),
          });
        }

        // ============================================
        // 🔍 DRIVER LICENSE AUTHENTICATION API CHECK
        // ============================================
        if (doc.documentTypeName.toLowerCase() === "driver license") {
          console.log("🔍 Validating Driver License using external API...");

          try {
            // Use axios to support GET request with body (non-standard but required by this API)
            // Create HTTPS agent that bypasses SSL certificate verification for this specific API
            const httpsAgent = new https.Agent({
              rejectUnauthorized: false, // Disable SSL verification for this API only
            });

            // Format date to YYYY-MM-DD as required by the API
            const formattedDob = formatDateForInput(basicInfo.dateOfBirth);

            if (!formattedDob) {
              await trx.rollback();
              return res.status(400).json({
                success: false,
                error: {
                  code: "VALIDATION_ERROR",
                  message: "Invalid date of birth format",
                  field: "basicInfo.dateOfBirth",
                },
                timestamp: new Date().toISOString(),
              });
            }

            console.log("🔍 Formatted DOB for API:", formattedDob);

            const apiResponse = await axios({
              method: "GET",
              url: "https://api.maventic.in/mapi/getDLDetails",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.DL_API_KEY || ""}`,
              },
              data: {
                dlnumber: doc.documentNumber,
                dob: formattedDob,
              },
              httpsAgent: httpsAgent, // Apply custom agent to bypass SSL verification
            });

            const result = apiResponse.data;
            console.log("📡 DL API Response:", result);

            // Check for API-level errors
            // API returns: { error: "false", code: "200", message: "Success", data: {...} }
            if (result.error === "true" || result.code !== "200") {
              await trx.rollback();

              // Determine user-friendly message based on response
              let userMessage =
                "Driver license number is invalid or could not be found";
              if (
                result.message &&
                result.message.toLowerCase().includes("expired")
              ) {
                userMessage =
                  "Driver license has expired. Please renew your license";
              } else if (
                result.message &&
                result.message.toLowerCase().includes("not found")
              ) {
                userMessage =
                  "Driver license number could not be found in the system";
              } else if (
                result.message &&
                result.message.toLowerCase().includes("format")
              ) {
                userMessage = "Driver license number format is invalid";
              }

              return res.status(400).json({
                success: false,
                error: {
                  code: "INVALID_DRIVER_LICENSE",
                  message: userMessage,
                  field: `documents[${i}].documentNumber`,
                },
                timestamp: new Date().toISOString(),
              });
            }

            // Success check - verify both error flag and message
            if (result.error !== "false" || result.message !== "Success") {
              await trx.rollback();
              return res.status(400).json({
                success: false,
                error: {
                  code: "INVALID_DRIVER_LICENSE",
                  message:
                    result.message ||
                    "Driver license number is invalid or could not be verified",
                  field: `documents[${i}].documentNumber`,
                },
                timestamp: new Date().toISOString(),
              });
            }

            console.log("✅ Driver License validated successfully");
          } catch (err) {
            console.error("❌ DL API ERROR:", err);
            await trx.rollback();
            return res.status(500).json({
              success: false,
              error: {
                code: "DL_API_ERROR",
                message:
                  "Unable to validate driver license. Please try again later",
              },
              timestamp: new Date().toISOString(),
            });
          }
        }

        // Check duplicate DL
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

    // Validate history information if provided
    if (history && history.length > 0) {
      for (let i = 0; i < history.length; i++) {
        const hist = history[i];

        // Validate date range
        if (hist.fromDate && hist.toDate) {
          const dateValidation = validateDateRange(
            hist.fromDate,
            hist.toDate,
            `History ${i + 1}`
          );
          if (!dateValidation.isValid) {
            await trx.rollback();
            return res.status(400).json({
              success: false,
              error: {
                code: "VALIDATION_ERROR",
                message: dateValidation.message,
                field: `history[${i}].fromDate`,
              },
              timestamp: new Date().toISOString(),
            });
          }
        }
      }
    }

    // Validate accident/violation information if provided
    if (accidents && accidents.length > 0) {
      for (let i = 0; i < accidents.length; i++) {
        const accident = accidents[i];

        // Validate type is required
        if (!accident.type || accident.type.trim() === "") {
          await trx.rollback();
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: `Accident/Violation ${i + 1}: Type is required`,
              field: `accidents[${i}].type`,
            },
            timestamp: new Date().toISOString(),
          });
        }

        // Validate date is required
        if (!accident.date || accident.date.trim() === "") {
          await trx.rollback();
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: `Accident/Violation ${i + 1}: Date is required`,
              field: `accidents[${i}].date`,
            },
            timestamp: new Date().toISOString(),
          });
        }

        // Validate vehicle registration number is required
        if (
          !accident.vehicleRegistrationNumber ||
          accident.vehicleRegistrationNumber.trim() === ""
        ) {
          await trx.rollback();
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: `Accident/Violation ${
                i + 1
              }: Vehicle registration number is required`,
              field: `accidents[${i}].vehicleRegistrationNumber`,
            },
            timestamp: new Date().toISOString(),
          });
        }

        // Validate description is required
        if (!accident.description || accident.description.trim() === "") {
          await trx.rollback();
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: `Accident/Violation ${i + 1}: Description is required`,
              field: `accidents[${i}].description`,
            },
            timestamp: new Date().toISOString(),
          });
        }

        // Validate vehicle registration number format
        const regValidation = validateVehicleRegistrationNumber(
          accident.vehicleRegistrationNumber
        );
        if (!regValidation.isValid) {
          await trx.rollback();
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: `Accident/Violation ${i + 1}: ${regValidation.message}`,
              field: `accidents[${i}].vehicleRegistrationNumber`,
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
      emergency_contact: basicInfo.emergencyContact,
      alternate_phone_number: basicInfo.alternatePhoneNumber || null,
      avg_rating: 0.0,
      created_at: currentTimestamp,
      created_on: currentTimestamp,
      created_by: currentUser,
      updated_at: currentTimestamp,
      updated_on: currentTimestamp,
      updated_by: currentUser,
      status: "PENDING", // Set to PENDING until approval workflow completes
    });

    console.log(
      `✅ Driver basic information inserted for ${driverId} (PENDING approval)`
    );

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
        // ✅ FIX: Use underscore for consistency with saveDriverAsDraft and submitDriverFromDraft
        const documentUniqueId = `${driverId}_${documentId}`;

        await trx("driver_documents").insert({
          document_unique_id: documentUniqueId,
          driver_id: driverId,
          document_id: documentId,
          document_type_id: doc.documentTypeId || doc.documentType,
          document_number: doc.documentNumber,
          issuing_country: doc.issuingCountry || null,
          issuing_state: doc.issuingState || null,
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

        // If file data is provided, insert into document_upload table
        if (doc.fileData) {
          const docUploadId = await generateDocumentUploadId(trx);

          await trx("document_upload").insert({
            // document_upload_unique_id: docUploadId,
            document_id: docUploadId,
            file_name: doc.fileName || null,
            file_type: doc.fileType || null,
            file_xstring_value: doc.fileData,
            system_reference_id: documentUniqueId,
            is_verified: false,
            valid_from: doc.validFrom || null,
            valid_to: doc.validTo || null,
            created_at: currentTimestamp,
            created_on: currentTimestamp,
            created_by: currentUser,
            updated_at: currentTimestamp,
            updated_on: currentTimestamp,
            updated_by: currentUser,
            status: "ACTIVE",
          });

          console.log(
            `✅ Document upload ${docUploadId} inserted for document ${documentId}`
          );
        }
      }
    }

    // Insert history information if provided
    if (history && history.length > 0) {
      for (const hist of history) {
        const historyId = await generateHistoryId(trx);

        await trx("driver_history_information").insert({
          driver_history_id: historyId,
          driver_id: driverId,
          employer: hist.employer || null,
          employment_status: hist.employmentStatus || null,
          from_date: hist.fromDate || null,
          to_date: hist.toDate || null,
          job_title: hist.jobTitle || null,
          created_at: currentTimestamp,
          created_on: currentTimestamp,
          created_by: currentUser,
          updated_at: currentTimestamp,
          updated_on: currentTimestamp,
          updated_by: currentUser,
          status: "ACTIVE",
        });

        console.log(`✅ History ${historyId} inserted for driver ${driverId}`);
      }
    }

    // Insert accidents/violations if provided
    if (accidents && accidents.length > 0) {
      for (const accident of accidents) {
        const accidentId = await generateAccidentId(trx);

        await trx("driver_accident_violation").insert({
          driver_violation_id: accidentId,
          driver_id: driverId,
          type: accident.type,
          date: accident.date,
          vehicle_regn_number: accident.vehicleRegistrationNumber || null,
          description: accident.description || null,
          created_at: currentTimestamp,
          created_on: currentTimestamp,
          created_by: currentUser,
          updated_at: currentTimestamp,
          updated_on: currentTimestamp,
          updated_by: currentUser,
          status: "ACTIVE",
        });

        console.log(
          `✅ Accident/Violation ${accidentId} inserted for driver ${driverId}`
        );
      }
    }

    // ========================================
    // PHASE 8: CREATE DRIVER USER ACCOUNT & APPROVAL FLOW
    // ========================================
    console.log("🔍 Creating driver user account and approval flow...");

    // FIXED: Generate user ID based on driver ID pattern (DRV001 -> DA0001)
    // This ensures consistent derivation in getDriverById
    const driverNumber = driverId.substring(3); // Remove 'DRV' prefix
    const driverAdminUserId = `DA${driverNumber.padStart(4, "0")}`;
    console.log(
      `  Generated user ID: ${driverAdminUserId} (derived from ${driverId})`
    );

    // Get creator details from request (current logged-in Product Owner)
    const creatorUserId = req.user?.user_id || "SYSTEM";
    const creatorName = req.user?.user_full_name || "System";

    // Generate initial password (based on full name + random number)
    const fullNameClean = basicInfo.fullName.replace(/[^a-zA-Z0-9]/g, "");
    const initialPassword = `${fullNameClean}@123`;
    const hashedPassword = await bcrypt.hash(initialPassword, 10);

    // Use driver details for user account
    const userEmail =
      basicInfo.emailId || `${driverId.toLowerCase()}@driver.com`;
    const userMobile = basicInfo.phoneNumber || "0000000000";

    // Create user in user_master with PENDING status
    await trx("user_master").insert({
      user_id: driverAdminUserId,
      user_type_id: "UT004", // Driver user type
      user_full_name: basicInfo.fullName,
      email_id: userEmail,
      mobile_number: userMobile,
      from_date: currentTimestamp,
      to_date: null,
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

    console.log(`  ✅ Created user: ${driverAdminUserId} (PENDING approval)`);

    // Get approval configuration for Driver (Level 1 only)
    const approvalConfig = await trx("approval_configuration")
      .where({
        approval_type_id: "AT003", // Driver User
        approver_level: 1,
        status: "ACTIVE",
      })
      .first();

    if (!approvalConfig) {
      throw new Error("Approval configuration not found for Driver User");
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
      approval_type_id: "AT003", // Driver User
      user_id_reference_id: driverId, // 🔥 FIX: Store actual driver entity ID instead of admin user ID
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

    await trx.commit();

    console.log("✅ Transaction committed successfully");

    res.status(201).json({
      success: true,
      message: "Driver created successfully",
      data: {
        driverId,
        userId: driverAdminUserId,
        userEmail: userEmail,
        initialPassword: initialPassword,
        pendingWith: pendingWithName,
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

// ======================================================
// 🎯 DRIVER LICENSE VALIDATION LOGIC
// ======================================================
// const validateDriverLicenseNumber = (number) => {
//   // EXAMPLE RULE: DL Format = 2 Letters + 2 Digits + 11 Digits
//   // KA01 20240000123  → KA0120240000123
//   const regex = /^[A-Z]{2}[0-9]{2}[0-9]{11}$/;

//   if (!regex.test(number)) {
//     return {
//       isValid: false,
//       message:
//         "Invalid Driver License Number. Please check the format. (e.g., KA0120240000123)",
//     };
//   }

//   return { isValid: true };
// };

// // ======================================================
// // 🎯 UNIFIED VALIDATION RESPONSE HANDLER
// // ======================================================
// const validationError = (res, field, message) => {
//   return res.status(400).json({
//     success: false,
//     error: {
//       code: "VALIDATION_ERROR",
//       message,
//       field,
//     },
//     timestamp: new Date().toISOString(),
//   });
// };

// // ======================================================
// // 🎯 DOCUMENT VALIDATION LOGIC
// // ======================================================
// const validateDocuments = async (trx, documents) => {
//   if (!documents || documents.length === 0) return { isValid: true };

//   for (let i = 0; i < documents.length; i++) {
//     const doc = documents[i];

//     if (!doc.documentType) {
//       return {
//         isValid: false,
//         field: `documents[${i}].documentType`,
//         message: `Document ${i + 1}: Document type is required`,
//       };
//     }

//     if (!doc.documentNumber || doc.documentNumber.trim().length === 0) {
//       return {
//         isValid: false,
//         field: `documents[${i}].documentNumber`,
//         message: `Document ${i + 1}: Document number is required`,
//       };
//     }

//     // Get document type from master
//     const docInfo = await trx("document_name_master")
//       .where(function () {
//         this.where("doc_name_master_id", doc.documentType).orWhere(
//           "document_name",
//           doc.documentType
//         );
//       })
//       .where("status", "ACTIVE")
//       .first();

//     if (!docInfo) {
//       return {
//         isValid: false,
//         field: `documents[${i}].documentType`,
//         message: `Document ${i + 1}: Invalid document type`,
//       };
//     }

//     // Attach normalized values
//     doc.documentTypeId = docInfo.doc_name_master_id;
//     doc.documentTypeName = docInfo.document_name;

//     // ================================
//     // 🎯 SPECIAL VALIDATION FOR DRIVER LICENSE
//     // ================================
//     if (doc.documentTypeName.toLowerCase() === "driver license") {
//       const dlCheck = validateDriverLicenseNumber(doc.documentNumber);

//       if (!dlCheck.isValid) {
//         return {
//           isValid: false,
//           field: `documents[${i}].documentNumber`,
//           message: `Document ${i + 1}: ${dlCheck.message}`,
//         };
//       }
//     }

//     // Duplicate check
//     const duplicate = await trx("driver_documents")
//       .where("document_type_id", doc.documentTypeId)
//       .where("document_number", doc.documentNumber)
//       .first();

//     if (duplicate) {
//       return {
//         isValid: false,
//         field: `documents[${i}].documentNumber`,
//         message: `Document ${i + 1}: ${
//           doc.documentTypeName
//         } number already exists`,
//       };
//     }
//   }

//   return { isValid: true };
// };

// const createDriver = async (req, res) => {
//   const trx = await knex.transaction();

//   try {
//     const { basicInfo, addresses, documents, history, accidents } = req.body;

//     // ----------------------------------------------------
//     // 1. BASIC INFO VALIDATION
//     // ----------------------------------------------------
//     if (!basicInfo.fullName || basicInfo.fullName.trim().length < 2)
//       return validationError(res, "fullName", ERROR.DRIVER_NAME_TOO_SHORT);

//     const dobResult = validateDateOfBirth(basicInfo.dateOfBirth);
//     if (!dobResult.isValid)
//       return validationError(res, "dateOfBirth", dobResult.message);

//     if (!validatePhoneNumber(basicInfo.phoneNumber))
//       return validationError(res, "phoneNumber", ERROR.DRIVER_PHONE_INVALID);

//     if (basicInfo.emailId && !validateEmail(basicInfo.emailId))
//       return validationError(res, "emailId", ERROR.DRIVER_EMAIL_INVALID);

//     if (
//       basicInfo.alternatePhoneNumber &&
//       !validatePhoneNumber(basicInfo.alternatePhoneNumber)
//     )
//       return validationError(
//         res,
//         "alternatePhoneNumber",
//         ERROR.ALTERNATE_PHONE_DRIVER_INVALID
//       );

//     if (!basicInfo.emergencyContact)
//       return validationError(
//         res,
//         "emergencyContact",
//         ERROR.EMERGENCY_CONTACT_REQUIRED
//       );

//     if (!validatePhoneNumber(basicInfo.emergencyContact))
//       return validationError(
//         res,
//         "emergencyContact",
//         ERROR.EMERGENCY_CONTACT_INVALID
//       );

//     // Duplicate phone
//     const phoneExists = await trx("driver_basic_information")
//       .where("phone_number", basicInfo.phoneNumber)
//       .first();
//     if (phoneExists)
//       return validationError(res, "phoneNumber", ERROR.DUPLICATE_PHONE_DRIVER);

//     // Duplicate Email
//     if (basicInfo.emailId) {
//       const emailExists = await trx("driver_basic_information")
//         .where("email_id", basicInfo.emailId)
//         .first();

//       if (emailExists)
//         return validationError(res, "emailId", ERROR.DUPLICATE_EMAIL_DRIVER);
//     }

//     // ----------------------------------------------------
//     // 2. ADDRESS VALIDATION
//     // ----------------------------------------------------
//     if (!addresses || addresses.length === 0)
//       return validationError(res, "addresses", ERROR.ADDRESS_REQUIRED);

//     for (let i = 0; i < addresses.length; i++) {
//       const a = addresses[i];

//       if (!a.addressTypeId)
//         return validationError(
//           res,
//           `addresses[${i}].addressTypeId`,
//           ERROR.ADDRESS_TYPE_REQUIRED
//         );
//       if (!a.country)
//         return validationError(
//           res,
//           `addresses[${i}].country`,
//           ERROR.COUNTRY_REQUIRED
//         );
//       if (!a.state)
//         return validationError(
//           res,
//           `addresses[${i}].state`,
//           ERROR.STATE_REQUIRED
//         );
//       if (!a.city)
//         return validationError(
//           res,
//           `addresses[${i}].city`,
//           ERROR.CITY_REQUIRED
//         );
//       if (!a.postalCode)
//         return validationError(
//           res,
//           `addresses[${i}].postalCode`,
//           ERROR.POSTAL_CODE_REQUIRED
//         );
//       if (!validatePostalCode(a.postalCode))
//         return validationError(
//           res,
//           `addresses[${i}].postalCode`,
//           ERROR.POSTAL_CODE_INVALID
//         );
//     }

//     // ----------------------------------------------------
//     // 3. DOCUMENT VALIDATION (INCL. DRIVER LICENSE)
//     // ----------------------------------------------------
//     const docValidation = await validateDocuments(trx, documents);
//     if (!docValidation.isValid)
//       return validationError(res, docValidation.field, docValidation.message);

//     // ----------------------------------------------------
//     // (4 & 5) HISTORY + ACCIDENT VALIDATION — SAME STYLE
//     // KEEP as-is (omitted for brevity)
//     // ----------------------------------------------------

//     // ----------------------------------------------------
//     // 6. INSERT INTO DATABASE (After full validation success)
//     // ----------------------------------------------------

//     // Insert basic info → get driver_id
//     const [driverId] = await trx("driver_basic_information")
//       .insert({
//         full_name: basicInfo.fullName,
//         phone_number: basicInfo.phoneNumber,
//         email_id: basicInfo.emailId ?? null,
//         date_of_birth: basicInfo.dateOfBirth,
//         emergency_contact: basicInfo.emergencyContact,
//       })
//       .returning("driver_id");

//     // Insert addresses
//     for (const a of addresses) {
//       await trx("driver_addresses").insert({
//         driver_id: driverId.driver_id,
//         address_type_id: a.addressTypeId,
//         country: a.country,
//         state: a.state,
//         city: a.city,
//         postal_code: a.postalCode,
//         address_line_1: a.addressLine1,
//         address_line_2: a.addressLine2,
//       });
//     }

//     // Insert documents
//     for (const doc of documents) {
//       await trx("driver_documents").insert({
//         driver_id: driverId.driver_id,
//         document_type_id: doc.documentTypeId,
//         document_number: doc.documentNumber,
//       });
//     }

//     await trx.commit();

//     return res.status(201).json({
//       success: true,
//       message: "Driver created successfully",
//       driverId: driverId.driver_id,
//     });
//   } catch (err) {
//     console.error("❌ DRIVER CREATE ERROR:", err);
//     await trx.rollback();
//     return res.status(500).json({
//       success: false,
//       message: "Something went wrong while creating the driver.",
//     });
//   }
// };

// Update Driver Controller
const updateDriver = async (req, res) => {
  const trx = await knex.transaction();

  try {
    const { id } = req.params;
    const { basicInfo, addresses, documents, history, accidents } = req.body;
    const userId = req.user?.user_id;
    const userRole = req.user?.role;

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

    // ✅ PERMISSION CHECKS - Rejection/Resubmission Workflow
    const currentStatus = existingDriver.status;
    const createdBy = existingDriver.created_by;

    // INACTIVE entities: Only creator can edit
    if (currentStatus === "INACTIVE" && createdBy !== userId) {
      await trx.rollback();
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Only the creator can edit rejected entities",
        },
        timestamp: new Date().toISOString(),
      });
    }

    // PENDING entities: No one can edit (locked during approval)
    if (currentStatus === "PENDING") {
      await trx.rollback();
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Cannot edit entity during approval process",
        },
        timestamp: new Date().toISOString(),
      });
    }

    // ACTIVE entities: Only approvers can edit
    if (currentStatus === "ACTIVE") {
      const isApprover = userRole === "product_owner" || userRole === "admin";
      if (!isApprover) {
        await trx.rollback();
        return res.status(403).json({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Only approvers can edit active entities",
          },
          timestamp: new Date().toISOString(),
        });
      }
    }

    const currentTimestamp = new Date();
    const currentUser = req.user?.user_id || "SYSTEM";

    // Update basic info if provided
    if (basicInfo) {
      // Validate date of birth
      if (basicInfo.dateOfBirth) {
        const dobValidation = validateDateOfBirth(basicInfo.dateOfBirth);
        if (!dobValidation.isValid) {
          await trx.rollback();
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: dobValidation.message,
              field: "dateOfBirth",
            },
            timestamp: new Date().toISOString(),
          });
        }
      }

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

      // ✅ RESUBMISSION DETECTION - Check if status is changing from INACTIVE to PENDING
      const isResubmission =
        currentStatus === "INACTIVE" && basicInfo.status === "PENDING";

      if (isResubmission) {
        console.log(`🔄 Resubmission detected for driver ${id}`);

        // Get driver admin user ID (DRV0001 → DA0001)
        const driverNumber = id.substring(3); // Remove 'DRV' prefix
        const driverAdminUserId = `DA${driverNumber}`; // DA0001

        // Find existing approval flow record
        const approvalFlow = await trx("approval_flow_trans")
          .where("user_id_reference_id", id) // 🔥 FIX: Use driver entity ID instead of admin user ID
          .where("approval_type_id", "AT003") // Driver Admin
          .orderBy("created_at", "desc")
          .first();

        if (approvalFlow) {
          // Update approval flow to restart from Level 1
          await trx("approval_flow_trans")
            .where(
              "approval_flow_unique_id",
              approvalFlow.approval_flow_unique_id
            )
            .update({
              s_status: "PENDING",
              approver_level: 1,
              actioned_by_id: null,
              actioned_by_name: null,
              approved_on: null,
              // Keep remarks from rejection for history
              updated_at: currentTimestamp,
            });

          console.log(`✅ Approval flow restarted for ${driverAdminUserId}`);
        }

        // Update user status to Pending for Approval
        await trx("user_master").where("user_id", driverAdminUserId).update({
          status: "Pending for Approval",
          updated_at: currentTimestamp,
        });

        console.log(
          `✅ User status updated to Pending for Approval: ${driverAdminUserId}`
        );
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
          emergency_contact: basicInfo.emergencyContact || null,
          alternate_phone_number: basicInfo.alternatePhoneNumber || null,
          status: basicInfo.status || currentStatus, // Update status if provided
          updated_at: currentTimestamp,
          updated_on: currentTimestamp,
          updated_by: currentUser,
        });
    }

    // Update addresses if provided
    if (addresses && addresses.length > 0) {
      // Validate addresses first
      for (let i = 0; i < addresses.length; i++) {
        const address = addresses[i];

        // Validate postal code format
        if (address.postalCode && !validatePostalCode(address.postalCode)) {
          await trx.rollback();
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: `Address ${
                i + 1
              }: Invalid postal code format. Must be 6 digits`,
              field: `addresses[${i}].postalCode`,
            },
            timestamp: new Date().toISOString(),
          });
        }
      }

      // Update or insert addresses
      for (const address of addresses) {
        if (address.addressId) {
          // Update existing address
          await trx("tms_address")
            .where("address_id", address.addressId)
            .where("user_reference_id", id)
            .where("user_type", "DRIVER")
            .update({
              country: address.country,
              state: address.state,
              city: address.city,
              district: address.district || null,
              street_1: address.street1 || null,
              street_2: address.street2 || null,
              postal_code: address.postalCode,
              address_type_id: address.addressTypeId,
              is_primary: address.isPrimary || false,
              updated_at: currentTimestamp,
              updated_on: currentTimestamp,
              updated_by: currentUser,
              status: "ACTIVE",
            });
        } else {
          // Insert new address
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
    }

    // Update documents if provided
    if (documents && documents.length > 0) {
      // First, delete all existing documents with empty document_number
      // Do this BEFORE validation to clean up any existing empty records
      await trx("driver_documents")
        .where("driver_id", id)
        .where(function () {
          this.whereNull("document_number")
            .orWhere("document_number", "")
            .orWhere("document_number", "");
        })
        .delete();

      // Validate documents (only non-empty ones)
      for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];

        // Skip validation for empty documents (they'll be filtered out later)
        if (!doc.documentNumber || doc.documentNumber.trim() === "") {
          continue;
        }

        // Validate document type is provided
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

        // Validate document name exists in document_name_master and resolve ID
        const docNameInfo = await trx("document_name_master")
          .where(function () {
            this.where("doc_name_master_id", doc.documentType).orWhere(
              "document_name",
              doc.documentType
            );
          })
          .where("status", "ACTIVE")
          .first();

        if (!docNameInfo) {
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

        // Store resolved ID and name for later use
        doc.documentTypeId = docNameInfo.doc_name_master_id;
        doc.documentTypeName = docNameInfo.document_name;

        // Validate document number format - MANDATORY
        const docValidation = validateDocumentNumber(
          doc.documentNumber,
          doc.documentTypeName
        );
        if (!docValidation.isValid) {
          await trx.rollback();
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: `Document ${i + 1}: ${docValidation.message}`,
              field: `documents[${i}].documentNumber`,
            },
            timestamp: new Date().toISOString(),
          });
        }

        // ============================================
        // 🔍 DRIVER LICENSE VALIDATION FOR UPDATE
        // ============================================
        if (doc.documentTypeName.toLowerCase() === "driver license") {
          // Check if license number has changed (skip validation if unchanged)
          let shouldValidate = true;

          if (doc.documentId) {
            // Existing document - check if number changed
            const existingDoc = await trx("driver_documents")
              .where("document_id", doc.documentId)
              .where("driver_id", id)
              .first();

            if (
              existingDoc &&
              existingDoc.document_number === doc.documentNumber
            ) {
              shouldValidate = false; // License number unchanged, skip API validation
              console.log(
                "✓ Driver License number unchanged, skipping validation"
              );
            }
          }

          if (shouldValidate) {
            console.log(
              "🔍 Validating Driver License using external API (UPDATE)..."
            );

            try {
              // Get driver's date of birth
              const driverInfo = await trx("driver_basic_information")
                .where("driver_id", id)
                .first();

              if (!driverInfo || !driverInfo.date_of_birth) {
                await trx.rollback();
                return res.status(400).json({
                  success: false,
                  error: {
                    code: "VALIDATION_ERROR",
                    message:
                      "Driver date of birth is required for license validation",
                    field: `documents[${i}].documentNumber`,
                  },
                  timestamp: new Date().toISOString(),
                });
              }

              // Use axios to support GET request with body (non-standard but required by this API)
              // Create HTTPS agent that bypasses SSL certificate verification for this specific API
              const httpsAgent = new https.Agent({
                rejectUnauthorized: false, // Disable SSL verification for this API only
              });

              // Format date to YYYY-MM-DD as required by the API
              const formattedDob = formatDateForInput(driverInfo.date_of_birth);

              if (!formattedDob) {
                await trx.rollback();
                return res.status(400).json({
                  success: false,
                  error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid date of birth format",
                    field: `documents[${i}].documentNumber`,
                  },
                  timestamp: new Date().toISOString(),
                });
              }

              console.log("🔍 Formatted DOB for API:", formattedDob);

              const apiResponse = await axios({
                method: "GET",
                url: "https://api.maventic.in/mapi/getDLDetails",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${process.env.DL_API_KEY || ""}`,
                },
                data: {
                  dlnumber: doc.documentNumber,
                  dob: formattedDob,
                },
                httpsAgent: httpsAgent, // Apply custom agent to bypass SSL verification
              });

              const result = apiResponse.data;
              console.log("📡 DL API Response (UPDATE):", result);

              // Check for API-level errors
              // API returns: { error: "false", code: "200", message: "Success", data: {...} }
              if (result.error === "true" || result.code !== "200") {
                await trx.rollback();

                // Determine user-friendly message based on response
                let userMessage =
                  "Driver license number is invalid or could not be found";
                if (
                  result.message &&
                  result.message.toLowerCase().includes("expired")
                ) {
                  userMessage =
                    "Driver license has expired. Please renew your license";
                } else if (
                  result.message &&
                  result.message.toLowerCase().includes("not found")
                ) {
                  userMessage =
                    "Driver license number could not be found in the system";
                } else if (
                  result.message &&
                  result.message.toLowerCase().includes("format")
                ) {
                  userMessage = "Driver license number format is invalid";
                }

                return res.status(400).json({
                  success: false,
                  error: {
                    code: "INVALID_DRIVER_LICENSE",
                    message: userMessage,
                    field: `documents[${i}].documentNumber`,
                  },
                  timestamp: new Date().toISOString(),
                });
              }

              // Success check - verify both error flag and message
              if (result.error !== "false" || result.message !== "Success") {
                await trx.rollback();
                return res.status(400).json({
                  success: false,
                  error: {
                    code: "INVALID_DRIVER_LICENSE",
                    message:
                      result.message ||
                      "Driver license number is invalid or could not be verified",
                    field: `documents[${i}].documentNumber`,
                  },
                  timestamp: new Date().toISOString(),
                });
              }

              console.log("✅ Driver License validated successfully (UPDATE)");
            } catch (err) {
              console.error("❌ DL API ERROR (UPDATE):", err);
              await trx.rollback();
              return res.status(500).json({
                success: false,
                error: {
                  code: "DL_API_ERROR",
                  message:
                    "Unable to validate driver license. Please try again later",
                },
                timestamp: new Date().toISOString(),
              });
            }
          }
        }

        // Check for duplicate document number (excluding the current document being updated)
        const duplicateCheck = await trx("driver_documents")
          .where("document_type_id", doc.documentTypeId)
          .where("document_number", doc.documentNumber)
          .where("driver_id", "!=", id)
          .first();

        if (duplicateCheck) {
          await trx.rollback();
          return res.status(400).json({
            success: false,
            error: {
              code: "DUPLICATE_DOCUMENT",
              message: `Document ${i + 1}: ${doc.documentTypeName} number ${
                doc.documentNumber
              } already exists for another driver`,
              field: `documents[${i}].documentNumber`,
            },
            timestamp: new Date().toISOString(),
          });
        }
      }

      // 🔍 DEBUG: Log all received documents to diagnose duplication issue
      console.log("📋 ========================================");
      console.log("📋 RECEIVED DOCUMENTS PAYLOAD (UPDATE DRIVER):");
      console.log("📋 Total documents received:", documents.length);
      documents.forEach((doc, idx) => {
        console.log(`📋 Document ${idx}:`, {
          documentId: doc.documentId,
          documentType: doc.documentType,
          documentTypeId: doc.documentTypeId,
          documentNumber: doc.documentNumber,
          hasDocumentId: !!doc.documentId,
          documentIdType: typeof doc.documentId,
          documentIdValue: doc.documentId,
        });
      });
      console.log("📋 ========================================");

      // Update or insert documents
      for (const doc of documents) {
        // Skip documents without document number (empty documents)
        if (!doc.documentNumber || doc.documentNumber.trim() === "") {
          continue;
        }

        console.log("🔍 Processing document:", {
          documentId: doc.documentId,
          documentNumber: doc.documentNumber,
          willUpdate: !!doc.documentId,
          willInsert: !doc.documentId,
        });

        if (doc.documentId) {
          console.log("✅ UPDATE path - documentId:", doc.documentId);
          // Update existing document
          await trx("driver_documents")
            .where("document_id", doc.documentId)
            .where("driver_id", id)
            .update({
              document_type_id: doc.documentTypeId || doc.documentType,
              document_number: doc.documentNumber,
              issuing_country: doc.issuingCountry || null,
              issuing_state: doc.issuingState || null,
              valid_from: doc.validFrom || null,
              valid_to: doc.validTo || null,
              active_flag: doc.status !== false,
              remarks: doc.remarks || null,
              updated_at: currentTimestamp,
              updated_on: currentTimestamp,
              updated_by: currentUser,
              status: "ACTIVE",
            });

          // Handle file upload for existing document
          if (doc.fileData) {
            // ✅ FIX: Search by system_reference_id, not document_id
            // document_id in document_upload is a different auto-generated ID
            // system_reference_id links to driver_documents.document_unique_id
            const documentUniqueId = `${id}_${doc.documentId}`;

            const existingUpload = await trx("document_upload")
              .where("system_reference_id", documentUniqueId)
              .first();

            if (existingUpload) {
              // Update existing upload
              await trx("document_upload")
                .where("system_reference_id", documentUniqueId)
                .update({
                  file_name: doc.fileName || null,
                  file_type: doc.fileType || null,
                  file_xstring_value: doc.fileData,
                  is_verified: false,
                  valid_from: doc.validFrom || null,
                  valid_to: doc.validTo || null,
                  updated_at: currentTimestamp,
                  updated_on: currentTimestamp,
                  updated_by: currentUser,
                });

              console.log(
                `✅ Document upload updated for document ${doc.documentId} (system_reference_id: ${documentUniqueId})`
              );
            } else {
              // Insert new upload for existing document
              const docUploadId = await generateDocumentUploadId(trx);

              await trx("document_upload").insert({
                document_id: docUploadId,
                file_name: doc.fileName || null,
                file_type: doc.fileType || null,
                file_xstring_value: doc.fileData,
                system_reference_id: documentUniqueId,
                is_verified: false,
                valid_from: doc.validFrom || null,
                valid_to: doc.validTo || null,
                created_at: currentTimestamp,
                created_on: currentTimestamp,
                created_by: currentUser,
                updated_at: currentTimestamp,
                updated_on: currentTimestamp,
                updated_by: currentUser,
                status: "ACTIVE",
              });

              console.log(
                `✅ Document upload ${docUploadId} inserted for document ${doc.documentId} (system_reference_id: ${documentUniqueId})`
              );
            }
          }
        } else {
          console.log("⚠️ INSERT path - NO documentId, creating new document");
          // Insert new document
          const documentId = await generateDocumentId(trx);
          // ✅ FIX: Use underscore for consistency
          const documentUniqueId = `${id}_${documentId}`;

          await trx("driver_documents").insert({
            document_unique_id: documentUniqueId,
            driver_id: id,
            document_id: documentId,
            document_type_id: doc.documentTypeId || doc.documentType,
            document_number: doc.documentNumber,
            issuing_country: doc.issuingCountry || null,
            issuing_state: doc.issuingState || null,
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

          // If file data is provided for new document, insert into document_upload table
          if (doc.fileData) {
            const docUploadId = await generateDocumentUploadId(trx);

            await trx("document_upload").insert({
              document_id: docUploadId,
              file_name: doc.fileName || null,
              file_type: doc.fileType || null,
              file_xstring_value: doc.fileData,
              system_reference_id: documentUniqueId,
              is_verified: false,
              valid_from: doc.validFrom || null,
              valid_to: doc.validTo || null,
              created_at: currentTimestamp,
              created_on: currentTimestamp,
              created_by: currentUser,
              updated_at: currentTimestamp,
              updated_on: currentTimestamp,
              updated_by: currentUser,
              status: "ACTIVE",
            });

            console.log(
              `✅ Document upload ${docUploadId} inserted for document ${documentId}`
            );
          }
        }
      }
    }

    // Update history if provided
    if (history && history.length > 0) {
      // First, delete all existing history records with all null fields (empty records)
      await trx("driver_history_information")
        .where("driver_id", id)
        .where(function () {
          this.whereNull("employer")
            .whereNull("employment_status")
            .whereNull("from_date")
            .whereNull("to_date")
            .whereNull("job_title");
        })
        .delete();

      for (const hist of history) {
        // Skip empty history records (no meaningful data)
        if (
          !hist.employer &&
          !hist.employmentStatus &&
          !hist.fromDate &&
          !hist.toDate &&
          !hist.jobTitle
        ) {
          continue;
        }

        if (hist.historyId) {
          // Update existing history record
          await trx("driver_history_information")
            .where("driver_history_id", hist.historyId)
            .where("driver_id", id)
            .update({
              employer: hist.employer || null,
              employment_status: hist.employmentStatus || null,
              from_date: hist.fromDate || null,
              to_date: hist.toDate || null,
              job_title: hist.jobTitle || null,
              updated_at: currentTimestamp,
              updated_on: currentTimestamp,
              updated_by: currentUser,
              status: "ACTIVE",
            });
        } else {
          // Insert new history record
          const historyId = await generateHistoryId(trx);

          await trx("driver_history_information").insert({
            driver_history_id: historyId,
            driver_id: id,
            employer: hist.employer || null,
            employment_status: hist.employmentStatus || null,
            from_date: hist.fromDate || null,
            to_date: hist.toDate || null,
            job_title: hist.jobTitle || null,
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

    // Update accidents/violations if provided
    if (accidents && accidents.length > 0) {
      // Validate accidents first
      for (let i = 0; i < accidents.length; i++) {
        const accident = accidents[i];

        // Skip validation for empty records that will be deleted
        if (!accident.type && !accident.date) {
          continue;
        }

        // Validate type is required
        if (!accident.type || accident.type.trim() === "") {
          await trx.rollback();
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: `Accident/Violation ${i + 1}: Type is required`,
              field: `accidents[${i}].type`,
            },
            timestamp: new Date().toISOString(),
          });
        }

        // Validate date is required
        if (!accident.date || accident.date.trim() === "") {
          await trx.rollback();
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: `Accident/Violation ${i + 1}: Date is required`,
              field: `accidents[${i}].date`,
            },
            timestamp: new Date().toISOString(),
          });
        }

        // Validate vehicle registration number is required
        const vehicleRegNum =
          accident.vehicleRegnNumber || accident.vehicleRegistrationNumber;
        if (!vehicleRegNum || vehicleRegNum.trim() === "") {
          await trx.rollback();
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: `Accident/Violation ${
                i + 1
              }: Vehicle registration number is required`,
              field: `accidents[${i}].vehicleRegnNumber`,
            },
            timestamp: new Date().toISOString(),
          });
        }

        // Validate description is required
        if (!accident.description || accident.description.trim() === "") {
          await trx.rollback();
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: `Accident/Violation ${i + 1}: Description is required`,
              field: `accidents[${i}].description`,
            },
            timestamp: new Date().toISOString(),
          });
        }

        // Validate vehicle registration number format
        const regValidation = validateVehicleRegistrationNumber(vehicleRegNum);
        if (!regValidation.isValid) {
          await trx.rollback();
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: `Accident/Violation ${i + 1}: ${regValidation.message}`,
              field: `accidents[${i}].vehicleRegnNumber`,
            },
            timestamp: new Date().toISOString(),
          });
        }
      }

      // First, delete all existing accident records with missing required fields (empty records)
      await trx("driver_accident_violation")
        .where("driver_id", id)
        .where(function () {
          this.whereNull("type").orWhereNull("date").orWhere("type", "");
          // Don't check for date = '' as DATE column can't be empty string
        })
        .delete();

      for (const accident of accidents) {
        // Skip empty accident records (missing required fields)
        if (!accident.type || !accident.date) {
          continue;
        }

        if (accident.violationId) {
          // Update existing accident/violation record
          await trx("driver_accident_violation")
            .where("driver_violation_id", accident.violationId)
            .where("driver_id", id)
            .update({
              type: accident.type,
              date: accident.date,
              vehicle_regn_number: accident.vehicleRegnNumber || null,
              description: accident.description || null,
              updated_at: currentTimestamp,
              updated_on: currentTimestamp,
              updated_by: currentUser,
              status: "ACTIVE",
            });
        } else {
          // Insert new accident/violation record
          const accidentId = await generateAccidentId(trx);

          await trx("driver_accident_violation").insert({
            driver_violation_id: accidentId,
            driver_id: id,
            type: accident.type,
            date: accident.date,
            vehicle_regn_number: accident.vehicleRegnNumber || null,
            description: accident.description || null,
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
// const getDrivers = async (req, res) => {
//   try {
//     const {
//       page = 1,
//       limit = 25,
//       search = "",
//       driverId = "",
//       status = "",
//       fullName = "",
//       phoneNumber = "",
//       emailId = "",
//       gender = "",
//       bloodGroup = "",
//       licenseNumber = "",
//       country = "",
//       state = "",
//       city = "",
//       postalCode = "",
//       avgRating = "",
//       createdOnStart = "",
//       createdOnEnd = "",
//     } = req.query;

//     // Convert page and limit to integers
//     const pageNum = parseInt(page);
//     const limitNum = parseInt(limit);
//     const offset = (pageNum - 1) * limitNum;

//     // Build base query with address and primary license
//     let query = knex("driver_basic_information as dbi")
//       .leftJoin("tms_address as addr", function () {
//         this.on("dbi.driver_id", "=", "addr.user_reference_id")
//           .andOn("addr.user_type", "=", knex.raw("'DRIVER'"))
//           .andOn("addr.status", "=", knex.raw("'ACTIVE'"))
//           .andOn("addr.is_primary", "=", knex.raw("true"));
//       })
//       .leftJoin(
//         knex("driver_documents")
//           .select(
//             "driver_id",
//             knex.raw(
//               "GROUP_CONCAT(document_number SEPARATOR ', ') as license_numbers"
//             )
//           )
//           .where("status", "ACTIVE")
//           .groupBy("driver_id")
//           .as("dd"),
//         "dbi.driver_id",
//         "dd.driver_id"
//       )
//       .select(
//         "dbi.driver_id",
//         "dbi.full_name",
//         "dbi.date_of_birth",
//         "dbi.gender",
//         "dbi.blood_group",
//         "dbi.phone_number",
//         "dbi.email_id",
//         "dbi.emergency_contact",
//         "dbi.alternate_phone_number",
//         "dbi.avg_rating",
//         "dbi.status",
//         "dbi.created_by",
//         "dbi.created_on",
//         "dbi.updated_on",
//         "addr.country",
//         "addr.state",
//         "addr.city",
//         "addr.district",
//         "addr.postal_code",
//         "dd.license_numbers"
//       );

//     // Count query for total records
//     let countQuery = knex("driver_basic_information as dbi");

//     // Apply filters
//     if (search) {
//       const searchPattern = `%${search}%`;
//       query.where(function () {
//         this.where("dbi.driver_id", "like", searchPattern)
//           .orWhere("dbi.full_name", "like", searchPattern)
//           .orWhere("dbi.phone_number", "like", searchPattern)
//           .orWhere("dbi.email_id", "like", searchPattern);
//       });
//       countQuery.where(function () {
//         this.where("dbi.driver_id", "like", searchPattern)
//           .orWhere("dbi.full_name", "like", searchPattern)
//           .orWhere("dbi.phone_number", "like", searchPattern)
//           .orWhere("dbi.email_id", "like", searchPattern);
//       });
//     }

//     if (driverId) {
//       query.where("dbi.driver_id", "like", `%${driverId}%`);
//       countQuery.where("dbi.driver_id", "like", `%${driverId}%`);
//     }

//     if (fullName) {
//       query.where("dbi.full_name", "like", `%${fullName}%`);
//       countQuery.where("dbi.full_name", "like", `%${fullName}%`);
//     }

//     if (phoneNumber) {
//       query.where("dbi.phone_number", "like", `%${phoneNumber}%`);
//       countQuery.where("dbi.phone_number", "like", `%${phoneNumber}%`);
//     }

//     if (emailId) {
//       query.where("dbi.email_id", "like", `%${emailId}%`);
//       countQuery.where("dbi.email_id", "like", `%${emailId}%`);
//     }

//     if (status) {
//       query.where("dbi.status", status);
//       countQuery.where("dbi.status", status);
//     }

//     if (gender) {
//       query.where("dbi.gender", gender);
//       countQuery.where("dbi.gender", gender);
//     }

//     if (bloodGroup) {
//       query.where("dbi.blood_group", bloodGroup);
//       countQuery.where("dbi.blood_group", bloodGroup);
//     }

//     // New filters for license number and address fields
//     if (licenseNumber) {
//       query.whereRaw(
//         `dbi.driver_id IN (SELECT driver_id FROM driver_documents WHERE document_number LIKE ? AND status = 'ACTIVE')`,
//         [`%${licenseNumber}%`]
//       );
//       countQuery.whereRaw(
//         `dbi.driver_id IN (SELECT driver_id FROM driver_documents WHERE document_number LIKE ? AND status = 'ACTIVE')`,
//         [`%${licenseNumber}%`]
//       );
//     }

//     //Created On Date Range Filter
//     if (createdOnStart) {
//       query = query.where("dbi.created_on", ">=", createdOnStart);
//     }
//     if (createdOnEnd) {
//       query = query.where("dbi.created_on", "<=", createdOnEnd);
//     }

//     if (country) {
//       // Convert ISO code to country name if it's a code (2 characters)
//       let countryValue = country;
//       if (country.length === 2) {
//         const countryObj = Country.getCountryByCode(country);
//         countryValue = countryObj ? countryObj.name : country;
//       }

//       query.whereRaw(
//         `dbi.driver_id IN (SELECT user_reference_id FROM tms_address WHERE user_type = 'DRIVER' AND country LIKE ? AND status = 'ACTIVE' AND is_primary = true)`,
//         [`%${countryValue}%`]
//       );
//       countQuery.whereRaw(
//         `dbi.driver_id IN (SELECT user_reference_id FROM tms_address WHERE user_type = 'DRIVER' AND country LIKE ? AND status = 'ACTIVE' AND is_primary = true)`,
//         [`%${countryValue}%`]
//       );
//     }

//     if (state) {
//       // Convert ISO code to state name if we have country context
//       let stateValue = state;
//       if (country && state.length <= 3) {
//         // Get country code for state lookup
//         let countryCode = country;
//         if (country.length !== 2) {
//           // If country is a name, try to find its code
//           const countryObj = Country.getAllCountries().find(
//             (c) => c.name.toLowerCase() === country.toLowerCase()
//           );
//           countryCode = countryObj ? countryObj.isoCode : country;
//         }

//         // Get state name from ISO code
//         const stateObj = State.getStateByCodeAndCountry(state, countryCode);
//         stateValue = stateObj ? stateObj.name : state;
//       }

//       query.whereRaw(
//         `dbi.driver_id IN (SELECT user_reference_id FROM tms_address WHERE user_type = 'DRIVER' AND state LIKE ? AND status = 'ACTIVE' AND is_primary = true)`,
//         [`%${stateValue}%`]
//       );
//       countQuery.whereRaw(
//         `dbi.driver_id IN (SELECT user_reference_id FROM tms_address WHERE user_type = 'DRIVER' AND state LIKE ? AND status = 'ACTIVE' AND is_primary = true)`,
//         [`%${stateValue}%`]
//       );
//     }

//     if (city) {
//       query.whereRaw(
//         `dbi.driver_id IN (SELECT user_reference_id FROM tms_address WHERE user_type = 'DRIVER' AND city LIKE ? AND status = 'ACTIVE' AND is_primary = true)`,
//         [`%${city}%`]
//       );
//       countQuery.whereRaw(
//         `dbi.driver_id IN (SELECT user_reference_id FROM tms_address WHERE user_type = 'DRIVER' AND city LIKE ? AND status = 'ACTIVE' AND is_primary = true)`,
//         [`%${city}%`]
//       );
//     }

//     if (postalCode) {
//       query.whereRaw(
//         `dbi.driver_id IN (SELECT user_reference_id FROM tms_address WHERE user_type = 'DRIVER' AND postal_code LIKE ? AND status = 'ACTIVE' AND is_primary = true)`,
//         [`%${postalCode}%`]
//       );
//       countQuery.whereRaw(
//         `dbi.driver_id IN (SELECT user_reference_id FROM tms_address WHERE user_type = 'DRIVER' AND postal_code LIKE ? AND status = 'ACTIVE' AND is_primary = true)`,
//         [`%${postalCode}%`]
//       );
//     }

//     if (avgRating) {
//       const rating = parseFloat(avgRating);
//       if (!isNaN(rating)) {
//         query.where("dbi.avg_rating", ">=", rating);
//         countQuery.where("dbi.avg_rating", ">=", rating);
//       }
//     }

//     // Date Filters for Count Query
//     if (createdOnStart) {
//       countQuery = countQuery.where("dbi.created_on", ">=", createdOnStart);
//     }
//     if (createdOnEnd) {
//       countQuery = countQuery.where("dbi.created_on", "<=", createdOnEnd);
//     }

//     // Get total count
//     const [{ count: total }] = await countQuery.count("* as count");

//     // Get paginated results
//     const drivers = await query
//       .orderBy("dbi.driver_id", "asc")
//       .limit(limitNum)
//       .offset(offset);

//     // Transform data to match frontend expected format
//     const transformedDrivers = drivers.map((driver) => ({
//       id: driver.driver_id,
//       fullName: driver.full_name,
//       dateOfBirth: formatDateForInput(driver.date_of_birth),
//       gender: driver.gender,
//       bloodGroup: driver.blood_group,
//       phoneNumber: driver.phone_number,
//       emailId: driver.email_id,
//       emergencyContact: driver.emergency_contact,
//       alternatePhoneNumber: driver.alternate_phone_number,
//       avgRating: driver.avg_rating || 0,
//       status: driver.status,
//       licenseNumbers: driver.license_numbers || "N/A",
//       country: driver.country,
//       state: driver.state,
//       city: driver.city,
//       district: driver.district,
//       postalCode: driver.postal_code,
//       createdBy: driver.created_by,
//       createdOn: formatDateForInput(driver.created_on),
//       updatedOn: formatDateForInput(driver.updated_on),
//     }));

//     res.json({
//       success: true,
//       data: transformedDrivers,
//       pagination: {
//         page: pageNum,
//         limit: limitNum,
//         total,
//         pages: Math.ceil(total / limitNum),
//       },
//       timestamp: new Date().toISOString(),
//     });
//   } catch (error) {
//     console.error("Error fetching drivers:", error);
//     res.status(500).json({
//       success: false,
//       error: {
//         code: "FETCH_ERROR",
//         message: "Failed to fetch drivers",
//         details: error.message,
//       },
//       timestamp: new Date().toISOString(),
//     });
//   }
// };

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
      createdOnStart = "",
      createdOnEnd = "",
      licenseValidityDate = "", // Filter by Driver License (DOC002) expiry date
    } = req.query;

    // Get current user ID for draft filtering
    const currentUserId = req.user?.user_id;

    console.log("🔍 DRAFT FILTER DEBUG:");
    console.log("  Current User ID:", currentUserId);
    console.log("  User Type:", req.user?.user_type_id);
    console.log("  Filters:", { status, driverId, fullName });
    console.log("  License Validity Date Filter:", licenseValidityDate);

    // Convert page and limit
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Base Query - Modified to join addresses and documents with status IN ('ACTIVE', 'DRAFT')
    let query = knex("driver_basic_information as dbi")
      .leftJoin("tms_address as addr", function () {
        this.on("dbi.driver_id", "=", "addr.user_reference_id")
          .andOn("addr.user_type", "=", knex.raw("'DRIVER'"))
          .andOn(knex.raw("addr.status IN ('ACTIVE', 'DRAFT')")) // ✅ Include DRAFT addresses
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
          .whereIn("status", ["ACTIVE", "DRAFT"]) // ✅ Include DRAFT documents
          .groupBy("driver_id")
          .as("dd"),
        "dbi.driver_id",
        "dd.driver_id"
      )
      .leftJoin(
        knex.raw(`(
          SELECT aft1.*
          FROM approval_flow_trans aft1
          INNER JOIN (
            SELECT user_id_reference_id, MAX(approval_flow_unique_id) as max_id
            FROM approval_flow_trans
            WHERE approval_type_id = 'AT003'
              AND s_status IN ('Approve', 'Reject', 'PENDING')
            GROUP BY user_id_reference_id
          ) aft2 ON aft1.user_id_reference_id = aft2.user_id_reference_id
               AND aft1.approval_flow_unique_id = aft2.max_id
        ) as aft`),
        knex.raw(
          "CONCAT('DRV', LPAD(CAST(SUBSTRING(aft.user_id_reference_id, 3) AS UNSIGNED), 4, '0'))"
        ),
        "dbi.driver_id"
      )
      .select(
        "dbi.driver_id",
        "dbi.full_name",
        "dbi.date_of_birth",
        "dbi.gender",
        "dbi.blood_group",
        "dbi.phone_number",
        "dbi.email_id",
        "dbi.emergency_contact",
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
        "dd.license_numbers",
        knex.raw(
          "COALESCE(aft.actioned_by_name, aft.pending_with_name) as approver_name"
        ),
        "aft.approved_on",
        "aft.s_status as approval_status"
      );

    // Count query
    let countQuery = knex("driver_basic_information as dbi");

    // ------- SEARCH FILTER -------
    if (search) {
      const searchPattern = `%${search}%`;
      query.where(function () {
        this.orWhere("dbi.driver_id", "like", searchPattern)
          .orWhere("dbi.full_name", "like", searchPattern)
          .orWhere("dbi.phone_number", "like", searchPattern)
          .orWhere("dbi.email_id", "like", searchPattern);
      });

      countQuery.where(function () {
        this.orWhere("dbi.driver_id", "like", searchPattern)
          .orWhere("dbi.full_name", "like", searchPattern)
          .orWhere("dbi.phone_number", "like", searchPattern)
          .orWhere("dbi.email_id", "like", searchPattern);
      });
    }

    // ------- BASIC FILTERS -------
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

    // ------- LICENSE NUMBER -------
    if (licenseNumber) {
      const rawCondition = `
        dbi.driver_id IN (
          SELECT driver_id 
          FROM driver_documents 
          WHERE document_number LIKE ? 
            AND status IN ('ACTIVE', 'DRAFT')
        )
      `;

      query.whereRaw(rawCondition, [`%${licenseNumber}%`]);
      countQuery.whereRaw(rawCondition, [`%${licenseNumber}%`]);
    }

    // ------- LICENSE VALIDITY DATE (DRIVER LICENSE DOC002) -------
    // Filter drivers whose Driver License (DOC002) expires on or after the selected date
    // Use Case: "Show drivers whose licenses expire after Jan 1, 2026"
    if (licenseValidityDate) {
      console.log("🔍 LICENSE VALIDITY FILTER APPLIED:", licenseValidityDate);

      // Ensure date is in YYYY-MM-DD format for MySQL DATE comparison
      const dateValue = licenseValidityDate.includes("T")
        ? licenseValidityDate.split("T")[0]
        : licenseValidityDate;

      console.log("🔍 Formatted date for query:", dateValue);

      // Only filter by Driver License (DOC002)
      // Include drivers regardless of their status (ACTIVE, INACTIVE, PENDING, DRAFT)
      // Show drivers whose license expires on or after the selected date (valid_to >= date)
      const rawCondition = `
        dbi.driver_id IN (
          SELECT driver_id 
          FROM driver_documents 
          WHERE document_type_id = 'DOC002'
            AND valid_to >= ?
        )
      `;

      query.whereRaw(rawCondition, [dateValue]);
      countQuery.whereRaw(rawCondition, [dateValue]);

      console.log(
        "✅ License validity filter added - DOC002 with valid_to >=",
        dateValue
      );
    }

    // ------- CREATED ON DATE RANGE (NEW) -------
    if (createdOnStart) {
      query.where("dbi.created_on", ">=", createdOnStart);
      countQuery.where("dbi.created_on", ">=", createdOnStart);
    }

    if (createdOnEnd) {
      // Add end of day time (23:59:59) to include entire day
      const endDateWithTime = createdOnEnd.includes("T")
        ? createdOnEnd
        : `${createdOnEnd} 23:59:59`;
      query.where("dbi.created_on", "<=", endDateWithTime);
      countQuery.where("dbi.created_on", "<=", endDateWithTime);
    }

    // ------- ADDRESS FILTERS -------
    if (country) {
      let countryValue = country;

      if (country.length === 2) {
        const obj = Country.getCountryByCode(country);
        countryValue = obj ? obj.name : country;
      }

      const rawFilter = `
        dbi.driver_id IN (
          SELECT user_reference_id 
          FROM tms_address 
          WHERE user_type = 'DRIVER' 
            AND country LIKE ? 
            AND status IN ('ACTIVE', 'DRAFT')
            AND is_primary = true
        )
      `;

      query.whereRaw(rawFilter, [`%${countryValue}%`]);
      countQuery.whereRaw(rawFilter, [`%${countryValue}%`]);
    }

    if (state) {
      let stateValue = state;

      if (country && state.length <= 3) {
        let countryCode = country;

        if (country.length !== 2) {
          const obj = Country.getAllCountries().find(
            (c) => c.name.toLowerCase() === country.toLowerCase()
          );
          countryCode = obj ? obj.isoCode : country;
        }

        const stateObj = State.getStateByCodeAndCountry(state, countryCode);
        stateValue = stateObj ? stateObj.name : state;
      }

      const rawFilter = `
        dbi.driver_id IN (
          SELECT user_reference_id 
          FROM tms_address 
          WHERE user_type = 'DRIVER' 
            AND state LIKE ? 
            AND status IN ('ACTIVE', 'DRAFT')
            AND is_primary = true
        )
      `;

      query.whereRaw(rawFilter, [`%${stateValue}%`]);
      countQuery.whereRaw(rawFilter, [`%${stateValue}%`]);
    }

    if (city) {
      const rawFilter = `
        dbi.driver_id IN (
          SELECT user_reference_id 
          FROM tms_address 
          WHERE user_type = 'DRIVER' 
            AND city LIKE ? 
            AND status IN ('ACTIVE', 'DRAFT')
            AND is_primary = true
        )
      `;

      query.whereRaw(rawFilter, [`%${city}%`]);
      countQuery.whereRaw(rawFilter, [`%${city}%`]);
    }

    if (postalCode) {
      const rawFilter = `
        dbi.driver_id IN (
          SELECT user_reference_id 
          FROM tms_address 
          WHERE user_type = 'DRIVER' 
            AND postal_code LIKE ? 
            AND status IN ('ACTIVE', 'DRAFT')
            AND is_primary = true
        )
      `;

      query.whereRaw(rawFilter, [`%${postalCode}%`]);
      countQuery.whereRaw(rawFilter, [`%${postalCode}%`]);
    }

    // ------- RATING FILTER -------
    if (avgRating) {
      const rating = parseFloat(avgRating);
      if (!isNaN(rating)) {
        query.where("dbi.avg_rating", ">=", rating);
        countQuery.where("dbi.avg_rating", ">=", rating);
      }
    }

    // ✅ DRAFT VISIBILITY FILTER - Only show DRAFT drivers to their creator
    // This ensures that draft drivers are private and only visible to the user who created them
    // Handle both "DRAFT" and "SAVE_AS_DRAFT" statuses for backward compatibility
    query.where(function () {
      this.where(function () {
        // Show all non-draft drivers to everyone
        this.whereNotIn("dbi.status", ["DRAFT", "SAVE_AS_DRAFT"]);
      }).orWhere(function () {
        // For DRAFT drivers, only show if user is the creator
        this.whereIn("dbi.status", ["DRAFT", "SAVE_AS_DRAFT"]).where(
          "dbi.created_by",
          "=",
          currentUserId
        );
      });
    });

    countQuery.where(function () {
      this.where(function () {
        this.whereNotIn("dbi.status", ["DRAFT", "SAVE_AS_DRAFT"]);
      }).orWhere(function () {
        this.whereIn("dbi.status", ["DRAFT", "SAVE_AS_DRAFT"]).where(
          "dbi.created_by",
          "=",
          currentUserId
        );
      });
    });

    // ------- TOTAL COUNT -------
    const [{ count: total }] = await countQuery.count("* as count");

    // ------- FETCH RESULTS -------
    const drivers = await query
      .orderBy("dbi.driver_id", "asc")
      .limit(limitNum)
      .offset(offset);

    const transformedDrivers = drivers.map((driver) => ({
      id: driver.driver_id,
      fullName: driver.full_name,
      dateOfBirth: formatDateForInput(driver.date_of_birth),
      gender: driver.gender,
      bloodGroup: driver.blood_group,
      phoneNumber: driver.phone_number,
      emailId: driver.email_id,
      emergencyContact: driver.emergency_contact,
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
      approver: driver.approver_name || null,
      approvedOn:
        driver.approved_on && driver.approval_status === "Approve"
          ? new Date(driver.approved_on).toISOString().split("T")[0]
          : null,
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

// Get driver status counts
const getDriverStatusCounts = async (req, res) => {
  try {
    const userId = req.user?.user_id; // Get current user from JWT

    // Query to get counts for each status
    const counts = await knex("driver_basic_information")
      .select("status")
      .count("* as count")
      .where(function () {
        // Only show SAVE_AS_DRAFT records created by current user
        this.where(function () {
          this.whereNot("status", "SAVE_AS_DRAFT");
        }).orWhere(function () {
          this.where("status", "SAVE_AS_DRAFT").where(
            "created_by",
            "=",
            userId
          );
        });
      })
      .groupBy("status");

    // Transform to object with UPPERCASE status keys to match frontend expectations
    const statusCounts = {
      ACTIVE: 0,
      INACTIVE: 0,
      PENDING: 0,
      DRAFT: 0,
      total: 0,
    };

    counts.forEach((item) => {
      const count = parseInt(item.count);
      statusCounts.total += count;

      // Database stores status in UPPERCASE (ACTIVE, INACTIVE, PENDING, SAVE_AS_DRAFT)
      if (item.status === "ACTIVE") {
        statusCounts.ACTIVE = count;
      } else if (item.status === "INACTIVE") {
        statusCounts.INACTIVE = count;
      } else if (item.status === "PENDING") {
        statusCounts.PENDING = count;
      } else if (item.status === "SAVE_AS_DRAFT") {
        statusCounts.DRAFT = count;
      }
    });

    res.json({
      success: true,
      data: statusCounts,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching driver status counts:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "FETCH_ERROR",
        message: "Failed to fetch status counts",
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

    // Get addresses for this driver with address type name
    // Include both ACTIVE and draft statuses (SAVE_AS_DRAFT and DRAFT)
    const addresses = await knex("tms_address as ta")
      .leftJoin(
        "address_type_master as atm",
        "ta.address_type_id",
        "atm.address_type_id"
      )
      .where("ta.user_reference_id", id)
      .where("ta.user_type", "DRIVER")
      .whereIn("ta.status", ["ACTIVE", "SAVE_AS_DRAFT", "DRAFT"])
      .select("ta.*", "atm.address as addressTypeName");

    // Get documents for this driver with file upload information
    // Include both ACTIVE and draft statuses (SAVE_AS_DRAFT and DRAFT)
    const documents = await knex("driver_documents as dd")
      .leftJoin(
        "document_name_master as dnm",
        "dd.document_type_id",
        "dnm.doc_name_master_id"
      )
      .leftJoin(
        "document_upload as du",
        "dd.document_unique_id",
        "du.system_reference_id"
      )
      .where("dd.driver_id", id)
      .whereIn("dd.status", ["ACTIVE", "SAVE_AS_DRAFT", "DRAFT"])
      .select(
        "dd.*",
        "dnm.document_name as documentTypeName",
        "du.file_name as fileName",
        "du.file_type as fileType",
        "du.file_xstring_value as fileData",
        "du.is_verified as isVerified"
      );

    // Get history information
    // Include both ACTIVE and draft statuses (SAVE_AS_DRAFT and DRAFT)
    const history = await knex("driver_history_information")
      .where("driver_id", id)
      .whereIn("status", ["ACTIVE", "SAVE_AS_DRAFT", "DRAFT"])
      .orderBy("from_date", "desc")
      .select("*");

    // Get accident/violation records with violation type name
    // Include both ACTIVE and draft statuses (SAVE_AS_DRAFT and DRAFT)
    const accidents = await knex("driver_accident_violation as dav")
      .leftJoin(
        "violation_type_master as vtm",
        "dav.type",
        "vtm.violation_type_id"
      )
      .where("dav.driver_id", id)
      .whereIn("dav.status", ["ACTIVE", "SAVE_AS_DRAFT", "DRAFT"])
      .orderBy("dav.date", "desc")
      .select("dav.*", "vtm.violation_type as violationTypeName");

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

    // Calculate dashboard metrics
    const totalAccidents = accidents.filter(
      (acc) => acc.type === "VT001" || acc.violationTypeName === "Accident"
    ).length;

    const totalViolations = accidents.filter(
      (acc) => acc.type === "VT002" || acc.violationTypeName === "Violation"
    ).length;

    const avgRating = driver.avg_rating || "0.00";

    // Dashboard metrics object
    const dashboardMetrics = {
      avgRating: parseFloat(avgRating),
      totalTrips: 0, // No trips table available yet
      tripsOnTime: 0, // No trips table available yet
      totalAccidents,
      totalViolations,
    };

    // ========================================================================
    // FETCH USER APPROVAL STATUS FOR DRIVER USERS
    // ========================================================================
    // Only fetch approval status for drivers that are not in DRAFT status
    // DRAFT drivers should not have approval flows until they are submitted

    let userApprovalStatus = null;
    let approvalHistory = [];

    // Check if driver is in DRAFT status (including both "DRAFT" and "SAVE_AS_DRAFT")
    const isDraftStatus =
      driver.status === "DRAFT" || driver.status === "SAVE_AS_DRAFT";

    if (!isDraftStatus) {
      // Only proceed with approval flow lookup for non-draft drivers
      try {
        // Find Driver User associated with this driver
        // IMPORTANT: Use pattern-based ID derivation (DRV001 → DA0001, DRV109 → DA0109)
        const driverNumber = id.substring(3); // Remove 'DRV' prefix
        const driverAdminUserId = `DA${driverNumber.padStart(4, "0")}`;

        console.log(
          `🔍 Looking for Driver user with derived ID: ${driverAdminUserId} (from driver ${id})`
        );

        // Get user record - Try derived ID first
        let associatedUser = await knex("user_master")
          .where("user_id", driverAdminUserId)
          .first();

        // BACKWARD COMPATIBILITY: If not found with derived ID, search by full name pattern
        // This handles old records created before the ID pattern fix
        if (!associatedUser) {
          console.log(
            `⚠️ No user found with derived ID ${driverAdminUserId}, searching by name pattern...`
          );

          // Get the driver's full name
          const driverFullName = driver.full_name;
          const expectedUserName = driverFullName; // Driver user has same name as driver

          // Look for DA user with matching name pattern
          associatedUser = await knex("user_master")
            .where("user_type_id", "UT004") // Driver user type
            .where("user_full_name", expectedUserName)
            .where("user_id", "like", "DA%")
            .first();

          if (associatedUser) {
            console.log(
              `  ✅ Found associated user via name match: ${associatedUser.user_id}`
            );
          } else {
            console.warn(
              `  ⚠️ No DA user found for driver name: ${expectedUserName}`
            );
          }
        }

        if (associatedUser) {
          console.log(`✅ Found associated user: ${associatedUser.user_id}`);

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

          console.log(
            `✅ Found ${approvalFlows.length} approval flow records for ${associatedUser.user_id}`
          );

          if (approvalFlows.length > 0) {
            userApprovalStatus = {
              approvalFlowTransId:
                approvalFlows[0]?.approval_flow_trans_id || null,
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
              remarks: approvalFlows[0]?.remarks || null, // ✅ FIX: Include rejection remarks
            };

            approvalHistory = approvalFlows;

            console.log(
              `✅ Found approval status for driver ${id}:`,
              userApprovalStatus
            );
          } else {
            console.warn(
              `⚠️ No approval flow found for user: ${driverAdminUserId}`
            );
          }
        } else {
          console.warn(`⚠️ No DA user found with ID: ${driverAdminUserId}`);
        }
      } catch (approvalError) {
        console.error(
          "❌ Error fetching driver approval status:",
          approvalError.message
        );
      }
    } else {
      console.log(`📝 Skipping approval flow lookup for DRAFT driver: ${id}`);
    }

    // Format response
    const response = {
      driverId: driver.driver_id,
      dashboard: dashboardMetrics,
      basicInfo: {
        fullName: driver.full_name,
        dateOfBirth: formatDateForInput(driver.date_of_birth),
        gender: driver.gender,
        bloodGroup: driver.blood_group,
        phoneNumber: driver.phone_number,
        emailId: driver.email_id,
        emergencyContact: driver.emergency_contact,
        alternatePhoneNumber: driver.alternate_phone_number,
        avgRating: driver.avg_rating,
        status: driver.status,
        createdBy: driver.created_by,
        createdOn: formatDateForInput(driver.created_on),
        updatedBy: driver.updated_by,
        updatedOn: formatDateForInput(driver.updated_on),
      },
      addresses: addresses.map((addr) => {
        // Convert ISO codes to names for display
        let countryName = addr.country;
        let stateName = addr.state;

        // Get country name from ISO code
        if (addr.country && addr.country.length === 2) {
          const countryObj = Country.getCountryByCode(addr.country);
          countryName = countryObj ? countryObj.name : addr.country;
        }

        // Get state name from ISO code
        if (addr.state && addr.state.length <= 3 && addr.country) {
          const stateObj = State.getStateByCodeAndCountry(
            addr.state,
            addr.country
          );
          stateName = stateObj ? stateObj.name : addr.state;
        }

        return {
          addressId: addr.address_id,
          addressTypeId: addr.address_type_id,
          addressType: addr.addressTypeName || addr.address_type_id,
          country: countryName,
          state: stateName,
          city: addr.city,
          district: addr.district,
          street1: addr.street_1,
          street2: addr.street_2,
          postalCode: addr.postal_code,
          isPrimary: addr.is_primary,
        };
      }),
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
        fileName: doc.fileName,
        fileType: doc.fileType,
        fileData: doc.fileData,
        isVerified: doc.isVerified,
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
        type: acc.violationTypeName || acc.type,
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

    // Get document names (driver-specific: licenses, ID proofs) from document_name_master
    let documentTypes = [];
    try {
      documentTypes = await knex("document_name_master")
        .select("doc_name_master_id as value", "document_name as label")
        .where("status", "ACTIVE")
        .orderBy("document_name");
    } catch (err) {
      console.warn("document_name_master table error:", err.message);
      documentTypes = [
        { value: "LIC001", label: "Driving License" },
        { value: "ID001", label: "PAN Card" },
        { value: "ID002", label: "Aadhar Card" },
        { value: "ID003", label: "Passport" },
        { value: "ID004", label: "Voter ID" },
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

    // Get gender options (static - no database table needed)
    const genderOptions = [
      { value: "MALE", label: "Male" },
      { value: "FEMALE", label: "Female" },
      { value: "OTHERS", label: "Others" },
    ];

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

    // Get violation types with fallback
    let violationTypes = [];
    try {
      violationTypes = await knex("violation_type_master")
        .select("violation_type_id as value", "violation_type as label")
        .where("status", "ACTIVE")
        .orderBy("violation_type");
    } catch (err) {
      console.warn("violation_type_master table error:", err.message);
      violationTypes = [
        { value: "VT001", label: "Accident" },
        { value: "VT002", label: "Violation" },
      ];
    }

    // Get mandatory documents for DRIVER user type
    const mandatoryDocuments = await knex("doc_type_configuration as dtc")
      .join(
        "document_name_master as dnm",
        "dtc.doc_name_master_id",
        "dnm.doc_name_master_id"
      )
      .select(
        "dtc.doc_name_master_id as value",
        "dnm.document_name as label",
        "dtc.is_mandatory",
        "dtc.is_expiry_required",
        "dtc.is_verification_required"
      )
      .where("dtc.user_type", "DRIVER")
      .where("dtc.status", "ACTIVE")
      .where("dnm.status", "ACTIVE")
      .where("dtc.is_mandatory", 1)
      .orderBy("dnm.document_name");

    res.json({
      success: true,
      data: {
        countries,
        documentTypes,
        addressTypes,
        genderOptions,
        bloodGroupOptions,
        violationTypes,
        mandatoryDocuments,
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

// Get mandatory documents for drivers from doc_type_configuration
const getMandatoryDocuments = async (req, res) => {
  try {
    console.log("📋 Fetching mandatory documents for Driver...");

    // Query doc_type_configuration for DRIVER user type
    const mandatoryDocs = await knex("doc_type_configuration as dtc")
      .join(
        "document_name_master as dnm",
        "dtc.doc_name_master_id",
        "dnm.doc_name_master_id"
      )
      .where("dtc.user_type", "DRIVER")
      .where("dtc.is_mandatory", 1)
      .where("dtc.status", "ACTIVE")
      .where("dnm.status", "ACTIVE")
      .select(
        "dnm.doc_name_master_id as documentTypeId",
        "dnm.document_name as documentTypeName",
        "dtc.is_mandatory as isMandatory"
      );

    console.log(`✅ Found ${mandatoryDocs.length} mandatory documents`);

    res.json({
      success: true,
      data: mandatoryDocs,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error fetching mandatory documents:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "FETCH_ERROR",
        message: "Failed to fetch mandatory documents",
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

// ========================================
// SAVE AS DRAFT CONTROLLER
// ========================================
// const saveDriverAsDraft = async (req, res) => {
//   try {
//     const {
//       basicInfo,
//       addresses,
//       documents,
//       employmentHistory,
//       accidentsViolations,
//     } = req.body;
//     const userId = req.user?.user_id; // Get from JWT token

//     const currentTimestamp = new Date();

//     console.log("📝 Starting save driver as draft - User:", userId);

//     // Minimal validation - only full name and date of birth required
//     if (!basicInfo?.fullName || basicInfo.fullName.trim().length < 2) {
//       return res.status(400).json({
//         success: false,
//         error: {
//           code: "VALIDATION_ERROR",
//           message: "Full name is required (minimum 2 characters)",
//           field: "fullName",
//         },
//       });
//     }

//     if (!basicInfo?.dateOfBirth) {
//       return res.status(400).json({
//         success: false,
//         error: {
//           code: "VALIDATION_ERROR",
//           message: "Date of birth is required",
//           field: "dateOfBirth",
//         },
//       });
//     }

//     const trx = await knex.transaction();

//     try {
//       // Generate driver ID
//       const driverId = await generateDriverId();

//       console.log("🆔 Generated Driver ID:", driverId);

//       // Insert into driver_basic_information with SAVE_AS_DRAFT status
//       await trx("driver_basic_information").insert({
//         driver_id: driverId,
//         full_name: basicInfo.fullName,
//         date_of_birth: basicInfo.dateOfBirth,
//         gender: basicInfo.gender || null,
//         blood_group: basicInfo.bloodGroup || null,
//         phone_number: basicInfo.phoneNumber || null,
//         email_id: basicInfo.emailId || null,
//         whats_app_number: basicInfo.whatsAppNumber || null,
//         alternate_phone_number: basicInfo.alternatePhoneNumber || null,
//         driver_license_number: basicInfo.driverLicenseNumber || null,
//         license_type: basicInfo.licenseType || null,
//         license_expiry_date: basicInfo.licenseExpiryDate || null,
//         license_issuing_authority: basicInfo.licenseIssuingAuthority || null,
//         aadhar_number: basicInfo.aadharNumber || null,
//         pan_number: basicInfo.panNumber || null,
//         passport_number: basicInfo.passportNumber || null,
//         status: "SAVE_AS_DRAFT", // Draft status
//         created_by: userId,
//         updated_by: userId,
//         created_at: knex.fn.now(),
//         updated_at: knex.fn.now(),
//         created_on: knex.fn.now(),
//         updated_on: knex.fn.now(),
//       });

//       // Save partial address data if provided
//       if (addresses && addresses.length > 0) {
//         for (const address of addresses) {
//           if (address.country || address.state || address.city) {
//             const addressId = await generateAddressId(trx);

//             await trx("tms_address").insert({
//               address_id: addressId,
//               user_reference_id: driverId,
//               user_type: "DRIVER",
//               country: address.country || null,
//               state: address.state || null,
//               city: address.city || null,
//               district: address.district || null,
//               street_1: address.street1 || null,
//               street_2: address.street2 || null,
//               postal_code: address.postalCode || null,
//               is_primary: address.isPrimary || false,
//               address_type_id: address.addressTypeId || "AT001",
//               status: "ACTIVE",
//               created_by: userId,
//               updated_by: userId,
//               created_at: currentTimestamp,
//               updated_at: currentTimestamp,
//               created_on: currentTimestamp,
//               updated_on: currentTimestamp,
//             });
//           }
//         }
//       }

//       // Save partial documents if provided
//       if (documents && documents.length > 0) {
//         for (const doc of documents) {
//           if (doc.documentNumber || doc.documentType) {
//             const docId = await generateDocumentId(trx);
//             const documentUniqueId = `${driverId}_${docId}`;

//             await trx("driver_documents").insert({
//               document_unique_id: documentUniqueId,
//               document_id: docId,
//               driver_id: driverId,
//               document_type_id: doc.documentType || null,
//               document_number: doc.documentNumber || null,
//               issue_date: doc.issueDate || null,
//               expiry_date: doc.expiryDate || null,
//               issuing_authority: doc.issuingAuthority || null,
//               status: doc.status !== undefined ? doc.status : "ACTIVE",
//               created_by: userId,
//               updated_by: userId,
//               created_at: currentTimestamp,
//               updated_at: currentTimestamp,
//               created_on: currentTimestamp,
//               updated_on: currentTimestamp,
//             });

//             // Handle file upload if provided
//             if (doc.fileName && doc.fileData) {
//               const uploadId = await generateDocumentUploadId(trx);

//               await trx("document_upload").insert({
//                 document_id: uploadId,
//                 file_name: doc.fileName,
//                 file_type: doc.fileType || "application/pdf",
//                 file_xstring_value: doc.fileData,
//                 system_reference_id: documentUniqueId,
//                 status: "ACTIVE",
//                 created_by: userId,
//                 updated_by: userId,
//                 created_at: currentTimestamp,
//                 updated_at: currentTimestamp,
//                 created_on: currentTimestamp,
//                 updated_on: currentTimestamp,
//               });
//             }
//           }
//         }
//       }

//       // Save partial employment history if provided
//       if (employmentHistory && employmentHistory.length > 0) {
//         for (const history of employmentHistory) {
//           if (history.employerName || history.fromDate) {
//             const historyId = await generateHistoryId(trx);

//             await trx("driver_history_information").insert({
//               history_id: historyId,
//               driver_id: driverId,
//               employer_name: history.employerName || null,
//               from_date: history.fromDate || null,
//               to_date: history.toDate || null,
//               position: history.position || null,
//               vehicle_type: history.vehicleType || null,
//               reason_for_leaving: history.reasonForLeaving || null,
//               status: "ACTIVE",
//               created_by: userId,
//               updated_by: userId,
//               created_at: currentTimestamp,
//               updated_at: currentTimestamp,
//               created_on: currentTimestamp,
//               updated_on: currentTimestamp,
//             });
//           }
//         }
//       }

//       // Save partial accidents/violations if provided
//       if (accidentsViolations && accidentsViolations.length > 0) {
//         for (const incident of accidentsViolations) {
//           if (incident.incidentDate || incident.violationType) {
//             const accidentId = await generateAccidentId(trx);

//             await trx("driver_accident_violation").insert({
//               accident_id: accidentId,
//               driver_id: driverId,
//               incident_date: incident.incidentDate || null,
//               violation_type: incident.violationType || null,
//               description: incident.description || null,
//               severity: incident.severity || null,
//               penalty_amount: incident.penaltyAmount || null,
//               status: "ACTIVE",
//               created_by: userId,
//               updated_by: userId,
//               created_at: currentTimestamp,
//               updated_at: currentTimestamp,
//               created_on: currentTimestamp,
//               updated_on: currentTimestamp,
//             });
//           }
//         }
//       }

//       await trx.commit();

//       console.log("✅ Driver draft saved successfully:", driverId);

//       return res.status(200).json({
//         success: true,
//         message: "Driver saved as draft successfully",
//         data: {
//           driverId,
//           status: "SAVE_AS_DRAFT",
//         },
//       });
//     } catch (error) {
//       await trx.rollback();
//       throw error;
//     }
//   } catch (error) {
//     console.error("❌ Save driver as draft error:", error);
//     return res.status(500).json({
//       success: false,
//       error: {
//         code: "SAVE_DRAFT_ERROR",
//         message: "Failed to save driver as draft",
//         details: error.message,
//       },
//     });
//   }
// };

// SAVE AS DRAFT CONTROLLER
// const saveDriverAsDraft = async (req, res) => {
//   const trx = await knex.transaction();

//   try {
//     const { basicInfo, addresses, documents } = req.body;

//     const timestamp = new Date();
//     const user = req.user?.user_id || "SYSTEM";

//     // ===========================================================
//     // 1️⃣ Generate driver_id
//     // ===========================================================
//     const driverId = await generateDriverId(trx);

//     // ===========================================================
//     // 2️⃣ INSERT DRIVER BASIC INFO  (driver_basic_information)
//     // ===========================================================
//     await trx("driver_basic_information").insert({
//       driver_id: driverId,
//       full_name: basicInfo?.fullName || null,
//       date_of_birth: basicInfo?.dateOfBirth || null,
//       gender: basicInfo?.gender || null,
//       blood_group: basicInfo?.bloodGroup || null,
//       phone_number: basicInfo?.phoneNumber || null,
//       email_id: basicInfo?.emailId || null,
//       emergency_contact: basicInfo?.emergencyContact || null,
//       alternate_phone_number: basicInfo?.alternatePhoneNumber || null,

//       created_at: timestamp,
//       created_on: timestamp,
//       created_by: user,

//       updated_at: timestamp,
//       updated_on: timestamp,
//       updated_by: user,

//       status: "DRAFT",
//     });

//     // ===========================================================
//     // 3️⃣ INSERT ADDRESSES  (tms_address)
//     // ===========================================================
//     if (addresses && addresses.length > 0) {
//       for (const addr of addresses) {
//         const addressId = await generateAddressId(trx);

//         await trx("tms_address").insert({
//           address_id: addressId,
//           user_reference_id: driverId,
//           user_type: "DRIVER",

//           country: addr.country || null,
//           state: addr.state || null,
//           city: addr.city || null,
//           district: addr.district || null,
//           street_1: addr.street1 || null,
//           street_2: addr.street2 || null,
//           postal_code: addr.postalCode || null,

//           address_type_id: addr.addressTypeId || null,
//           is_primary: addr.isPrimary || false,

//           created_at: timestamp,
//           created_on: timestamp,
//           created_by: user,

//           updated_at: timestamp,
//           updated_on: timestamp,
//           updated_by: user,

//           status: "ACTIVE",
//         });
//       }
//     }

//     // ===========================================================
//     // 4️⃣ INSERT DOCUMENTS  (driver_documents)
//     // ===========================================================
//     if (documents && documents.length > 0) {
//       for (const doc of documents) {
//         // Skip empty docs (same as update flow)
//         if (!doc.documentNumber || doc.documentNumber.trim() === "") {
//           continue;
//         }

//         const documentId = await generateDocumentId(trx);

//         await trx("driver_documents").insert({
//           document_id: documentId,
//           driver_id: driverId,

//           document_type_id: doc.documentType || null,
//           document_number: doc.documentNumber || null,
//           document_file: doc.documentFile || null, // xstring or base64

//           // issue_date: doc.issueDate || null,
//           // expiry_date: doc.expiryDate || null,

//           created_at: timestamp,
//           created_on: timestamp,
//           created_by: user,

//           updated_at: timestamp,
//           updated_on: timestamp,
//           updated_by: user,

//           status: "ACTIVE",
//         });
//       }
//     }

//     await trx.commit();
//     return res.status(201).json({
//       success: true,
//       message: "Driver saved as draft successfully",
//       driver_id: driverId,
//       timestamp: new Date().toISOString(),
//     });
//   } catch (err) {
//     console.error("❌ SAVE DRAFT ERROR:", err);
//     await trx.rollback();
//     return res.status(500).json({
//       success: false,
//       error: {
//         code: "INTERNAL_SERVER_ERROR",
//         message: "Failed to save driver draft",
//       },
//       timestamp: new Date().toISOString(),
//     });
//   }
// };

const saveDriverAsDraft = async (req, res) => {
  const trx = await knex.transaction();

  try {
    // ✅ FIX: Accept both "history"/"employmentHistory" and "accidents"/"accidentsViolations"
    // Frontend sends "history" and "accidents" from DriverCreatePage
    // DriverDetailsPage sends "employmentHistory" and "accidentsViolations"
    const {
      basicInfo,
      addresses,
      documents,
      employmentHistory,
      accidentsViolations,
      history,
      accidents,
    } = req.body;

    // Use whichever field name was provided
    const historyData = employmentHistory || history || [];
    const accidentsData = accidentsViolations || accidents || [];

    console.log("📝 SAVE AS DRAFT - Payload Analysis:");
    console.log(
      "  - employmentHistory:",
      employmentHistory ? employmentHistory.length : "not provided"
    );
    console.log("  - history:", history ? history.length : "not provided");
    console.log(
      "  - accidentsViolations:",
      accidentsViolations ? accidentsViolations.length : "not provided"
    );
    console.log(
      "  - accidents:",
      accidents ? accidents.length : "not provided"
    );
    console.log("  - Using historyData:", historyData.length, "records");
    console.log("  - Using accidentsData:", accidentsData.length, "records");

    const timestamp = new Date();
    const user = req.user?.user_id || "SYSTEM";

    // ===========================================================
    // 1️⃣ Generate driver_id
    // ===========================================================
    const driverId = await generateDriverId(trx);

    // ===========================================================
    // 2️⃣ INSERT DRIVER BASIC INFO  (driver_basic_information)
    // ===========================================================
    // NOTE: For DRAFT drivers, we only create the core driver record
    // User accounts and approval flows are created later when the draft is submitted
    // ===========================================================
    await trx("driver_basic_information").insert({
      driver_id: driverId,
      full_name: basicInfo?.fullName || null,
      date_of_birth: basicInfo?.dateOfBirth || null,
      gender: basicInfo?.gender || null,
      blood_group: basicInfo?.bloodGroup || null,
      phone_number: basicInfo?.phoneNumber || null,
      email_id: basicInfo?.emailId || null,
      emergency_contact: basicInfo?.emergencyContact || null,
      alternate_phone_number: basicInfo?.alternatePhoneNumber || null,

      status: "DRAFT",

      created_at: timestamp,
      created_on: timestamp,
      created_by: user,
      updated_at: timestamp,
      updated_on: timestamp,
      updated_by: user,
    });

    // ===========================================================
    // 4️⃣ INSERT ADDRESSES  (tms_address)
    // ===========================================================
    if (addresses && addresses.length > 0) {
      for (const addr of addresses) {
        const addressId = await generateAddressId(trx);

        await trx("tms_address").insert({
          address_id: addressId,
          user_reference_id: driverId,
          user_type: "DRIVER",

          country: addr.country || null,
          state: addr.state || null,
          city: addr.city || null,
          district: addr.district || null,
          street_1: addr.street1 || null,
          street_2: addr.street2 || null,
          postal_code: addr.postalCode || null,

          address_type_id: addr.addressTypeId || null,
          is_primary: addr.isPrimary || false,

          status: "DRAFT", // ✅ Set to DRAFT for draft drivers

          created_at: timestamp,
          created_on: timestamp,
          created_by: user,
          updated_at: timestamp,
          updated_on: timestamp,
          updated_by: user,
        });
      }
    }

    // ===========================================================
    // 5️⃣ INSERT DOCUMENTS  (driver_documents + document_upload)
    // ===========================================================
    if (documents && documents.length > 0) {
      for (const doc of documents) {
        if (!doc.documentNumber?.trim()) continue;

        const documentId = await generateDocumentId(trx);

        const documentUniqueId = `${driverId}_${documentId}`;

        await trx("driver_documents").insert({
          document_unique_id: documentUniqueId,
          document_id: documentId,
          driver_id: driverId,

          document_type_id: doc.documentTypeId || doc.documentType || null, // Fixed: Use documentTypeId first
          document_number: doc.documentNumber || null,
          issuing_country: doc.issuingCountry || null,
          issuing_state: doc.issuingState || null,
          valid_from: doc.validFrom || null,
          valid_to: doc.validTo || null,
          active_flag: doc.status !== false,
          remarks: doc.remarks || null,

          status: "DRAFT", // ✅ Set to DRAFT for draft drivers

          created_at: timestamp,
          created_on: timestamp,
          created_by: user,
          updated_at: timestamp,
          updated_on: timestamp,
          updated_by: user,
        });

        // ✅ FIX Issue 3: Save document upload if fileData provided
        if (doc.fileData) {
          const docUploadId = await generateDocumentUploadId(trx);

          await trx("document_upload").insert({
            document_id: docUploadId,
            file_name: doc.fileName || null,
            file_type: doc.fileType || "application/pdf",
            file_xstring_value: doc.fileData,
            system_reference_id: documentUniqueId,
            is_verified: false,
            valid_from: doc.validFrom || null,
            valid_to: doc.validTo || null,
            created_at: timestamp,
            created_on: timestamp,
            created_by: user,
            updated_at: timestamp,
            updated_on: timestamp,
            updated_by: user,
            status: "DRAFT",
          });
        }
      }
    }

    // ===========================================================
    // 6️⃣ INSERT HISTORY  (driver_history_information)
    // ===========================================================
    if (historyData && historyData.length > 0) {
      console.log(`✅ Saving ${historyData.length} history record(s)...`);
      for (const history of historyData) {
        // Only insert if meaningful data present
        // ✅ FIX: Accept both 'employer' and 'employerName' field names
        if (history.employer || history.employerName || history.fromDate) {
          const historyId = await generateHistoryId(trx);

          await trx("driver_history_information").insert({
            driver_history_id: historyId,
            driver_id: driverId,
            employer: history.employer || history.employerName || null,
            employment_status: history.employmentStatus || null,
            from_date: history.fromDate || null,
            to_date: history.toDate || null,
            job_title: history.jobTitle || null,
            created_at: timestamp,
            created_on: timestamp,
            created_by: user,
            updated_at: timestamp,
            updated_on: timestamp,
            updated_by: user,
            status: "DRAFT",
          });
          console.log(
            `  ✓ History saved: ${historyId} - ${
              history.employer || history.employerName
            }`
          );
        }
      }
    } else {
      console.log("⚠️ No history data to save");
    }

    // ===========================================================
    // 7️⃣ INSERT ACCIDENTS/VIOLATIONS  (driver_accident_violation)
    // ===========================================================
    if (accidentsData && accidentsData.length > 0) {
      console.log(
        `✅ Saving ${accidentsData.length} accident/violation record(s)...`
      );
      for (const incident of accidentsData) {
        // Only insert if meaningful data present
        // ✅ FIX: Accept both 'date'/'incidentDate' and 'type'/'violationType' field names
        if (
          incident.date ||
          incident.incidentDate ||
          incident.type ||
          incident.violationType
        ) {
          const accidentId = await generateAccidentId(trx);

          await trx("driver_accident_violation").insert({
            driver_violation_id: accidentId,
            driver_id: driverId,
            type: incident.type || incident.violationType || null,
            date: incident.date || incident.incidentDate || null,
            vehicle_regn_number:
              incident.vehicleRegnNumber ||
              incident.vehicleRegistrationNumber ||
              null,
            description: incident.description || null,
            created_at: timestamp,
            created_on: timestamp,
            created_by: user,
            updated_at: timestamp,
            updated_on: timestamp,
            updated_by: user,
            status: "DRAFT",
          });
          console.log(
            `  ✓ Accident saved: ${accidentId} - ${
              incident.type || incident.violationType
            } on ${incident.date || incident.incidentDate}`
          );
        }
      }
    } else {
      console.log("⚠️ No accident/violation data to save");
    }

    await trx.commit();
    return res.status(201).json({
      success: true,
      message:
        "Driver saved as draft successfully. User account will be created when submitted for approval.",
      driver_id: driverId,
      status: "DRAFT",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("❌ SAVE DRAFT ERROR:", err);
    await trx.rollback();
    return res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to save driver draft",
      },
      timestamp: new Date().toISOString(),
    });
  }
};

// ========================================
// UPDATE DRAFT CONTROLLER
// ========================================
// Update Driver Draft Controller (fixed table/field names)
// Update Driver Draft Controller (schema-corrected)
const updateDriverDraft = async (req, res) => {
  try {
    const { id } = req.params;
    // ✅ FIX: Accept both "history"/"employmentHistory" and "accidents"/"accidentsViolations"
    const {
      basicInfo,
      addresses,
      documents,
      employmentHistory,
      accidentsViolations,
      history,
      accidents,
    } = req.body;

    // Use whichever field name was provided
    const historyData = employmentHistory || history || [];
    const accidentsData = accidentsViolations || accidents || [];

    const userId = req.user?.user_id;

    const currentTimestamp = new Date();

    console.log("📝 Updating driver draft:", id, "User:", userId);
    console.log(
      "  - employmentHistory:",
      employmentHistory ? employmentHistory.length : "not provided"
    );
    console.log("  - history:", history ? history.length : "not provided");
    console.log(
      "  - accidentsViolations:",
      accidentsViolations ? accidentsViolations.length : "not provided"
    );
    console.log(
      "  - accidents:",
      accidents ? accidents.length : "not provided"
    );
    console.log("  - Using historyData:", historyData.length, "records");
    console.log("  - Using accidentsData:", accidentsData.length, "records");

    // Verify driver exists
    const existing = await knex("driver_basic_information")
      .where("driver_id", id)
      .first();

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Driver not found",
        },
      });
    }

    // Accept both "SAVE_AS_DRAFT" and "DRAFT" statuses for backward compatibility
    if (existing.status !== "SAVE_AS_DRAFT" && existing.status !== "DRAFT") {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_STATUS",
          message:
            "Can only update drafts. Use regular update endpoint for active drivers",
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
    if (!basicInfo?.fullName || basicInfo.fullName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Full name is required (minimum 2 characters)",
          field: "fullName",
        },
      });
    }

    if (!basicInfo?.dateOfBirth) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Date of birth is required",
          field: "dateOfBirth",
        },
      });
    }

    const trx = await knex.transaction();

    try {
      // ---------------------------
      // Update driver_basic_information
      // NOTE: only keep columns that actually exist in the table per create/update controllers
      // ---------------------------
      await trx("driver_basic_information")
        .where("driver_id", id)
        .update({
          full_name: basicInfo.fullName,
          date_of_birth: basicInfo.dateOfBirth,
          gender: basicInfo.gender || null,
          blood_group: basicInfo.bloodGroup || null,
          phone_number: basicInfo.phoneNumber || null,
          email_id: basicInfo.emailId || null,
          emergency_contact: basicInfo.emergencyContact || null,
          alternate_phone_number: basicInfo.alternatePhoneNumber || null,
          // avg_rating is not updated here (it's managed elsewhere)
          updated_by: userId,
          updated_at: knex.fn.now(),
          updated_on: knex.fn.now(),
        });

      // ---------------------------
      // Delete existing related data and re-insert (addresses, documents, history, accidents)
      // Canonical document_unique_id format: `${driverId}-${documentId}`
      // ---------------------------
      await trx("tms_address").where("user_reference_id", id).del();

      // Delete document_upload entries referencing this driver's document_unique_id pattern
      // Handle both underscore and hyphen patterns for backward compatibility
      await trx("document_upload")
        .whereIn("system_reference_id", function () {
          this.select("document_unique_id")
            .from("driver_documents")
            .where("driver_id", id); // Delete all documents for this driver regardless of pattern
        })
        .del();

      // Delete ALL driver_documents for this driver (handles both patterns)
      await trx("driver_documents").where("driver_id", id).del();

      // Delete history entries
      await trx("driver_history_information").where("driver_id", id).del();

      // Delete accidents/violations
      await trx("driver_accident_violation").where("driver_id", id).del();

      // ---------------------------
      // Re-insert addresses (tms_address)
      // ---------------------------
      if (addresses && addresses.length > 0) {
        for (const address of addresses) {
          // Only insert if some meaningful address data present
          if (address.country || address.state || address.city) {
            const addressId = await generateAddressId(trx);

            await trx("tms_address").insert({
              address_id: addressId,
              user_reference_id: id,
              user_type: "DRIVER",
              country: address.country || null,
              state: address.state || null,
              city: address.city || null,
              district: address.district || null,
              street_1: address.street1 || null,
              street_2: address.street2 || null,
              postal_code: address.postalCode || null,
              is_primary: address.isPrimary || false,
              address_type_id: address.addressTypeId || "AT001",
              status: "DRAFT",
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

      // ---------------------------
      // Re-insert documents (driver_documents + document_upload)
      // ---------------------------
      if (documents && documents.length > 0) {
        for (const doc of documents) {
          // Only insert if any meaningful doc data present
          if (doc.documentNumber || doc.documentType) {
            const docId = await generateDocumentId(trx);
            const documentUniqueId = `${id}_${docId}`;

            await trx("driver_documents").insert({
              document_unique_id: documentUniqueId,
              document_id: docId,
              driver_id: id,
              document_type_id: doc.documentTypeId || doc.documentType || null, // Fixed: Use documentTypeId first
              document_number: doc.documentNumber || null,
              issuing_country: doc.issuingCountry || null,
              issuing_state: doc.issuingState || null,
              valid_from: doc.validFrom || null,
              valid_to: doc.validTo || null,
              active_flag: doc.status !== false,
              remarks: doc.remarks || null,
              created_by: userId,
              updated_by: userId,
              created_at: currentTimestamp,
              updated_at: currentTimestamp,
              created_on: currentTimestamp,
              updated_on: currentTimestamp,
              status: "DRAFT",
            });

            // If file data provided, insert into document_upload
            if (doc.fileData) {
              const docUploadId = await generateDocumentUploadId(trx);

              await trx("document_upload").insert({
                document_id: docUploadId,
                file_name: doc.fileName || null,
                file_type: doc.fileType || "application/pdf",
                file_xstring_value: doc.fileData,
                system_reference_id: documentUniqueId,
                is_verified: false,
                valid_from: doc.validFrom || null,
                valid_to: doc.validTo || null,
                created_at: currentTimestamp,
                created_on: currentTimestamp,
                created_by: userId,
                updated_at: currentTimestamp,
                updated_on: currentTimestamp,
                updated_by: userId,
                status: "DRAFT",
              });
            }
          }
        }
      }

      // ---------------------------
      // Re-insert history (driver_history_information)
      // ---------------------------
      if (historyData && historyData.length > 0) {
        console.log(`✅ Updating ${historyData.length} history record(s)...`);
        for (const history of historyData) {
          // Only insert if meaningful data present
          // ✅ FIX: Accept both 'employer' and 'employerName' field names
          if (history.employer || history.employerName || history.fromDate) {
            const historyId = await generateHistoryId(trx);

            await trx("driver_history_information").insert({
              driver_history_id: historyId,
              driver_id: id,
              employer: history.employer || history.employerName || null,
              employment_status: history.employmentStatus || null,
              from_date: history.fromDate || null,
              to_date: history.toDate || null,
              job_title: history.jobTitle || null,
              created_at: currentTimestamp,
              created_on: currentTimestamp,
              created_by: userId,
              updated_at: currentTimestamp,
              updated_on: currentTimestamp,
              updated_by: userId,
              status: "DRAFT",
            });
            console.log(
              `  ✓ History updated: ${historyId} - ${
                history.employer || history.employerName
              }`
            );
          }
        }
      } else {
        console.log("⚠️ No history data to update");
      }

      // ---------------------------
      // Re-insert accidents/violations (driver_accident_violation)
      // ---------------------------
      if (accidentsData && accidentsData.length > 0) {
        console.log(
          `✅ Updating ${accidentsData.length} accident/violation record(s)...`
        );
        for (const incident of accidentsData) {
          // Only insert if meaningful data present
          // ✅ FIX: Accept both 'date'/'incidentDate' and 'type'/'violationType' field names
          if (
            incident.date ||
            incident.incidentDate ||
            incident.type ||
            incident.violationType
          ) {
            const accidentId = await generateAccidentId(trx);

            await trx("driver_accident_violation").insert({
              driver_violation_id: accidentId,
              driver_id: id,
              type: incident.type || incident.violationType || null,
              date: incident.date || incident.incidentDate || null,
              vehicle_regn_number:
                incident.vehicleRegnNumber ||
                incident.vehicleRegistrationNumber ||
                null,
              description: incident.description || null,
              created_at: currentTimestamp,
              created_on: currentTimestamp,
              created_by: userId,
              updated_at: currentTimestamp,
              updated_on: currentTimestamp,
              updated_by: userId,
              status: "DRAFT",
            });
            console.log(
              `  ✓ Accident updated: ${accidentId} - ${
                incident.type || incident.violationType
              } on ${incident.date || incident.incidentDate}`
            );
          }
        }
      } else {
        console.log("⚠️ No accident/violation data to update");
      }

      await trx.commit();

      console.log("✅ Driver draft updated successfully:", id);

      return res.status(200).json({
        success: true,
        message: "Driver draft updated successfully",
        data: {
          driver_id: id,
          status: "DRAFT",
        },
      });
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    console.error("❌ Update driver draft error:", error);
    return res.status(500).json({
      success: false,
      error: {
        code: "UPDATE_DRAFT_ERROR",
        message: "Failed to update driver draft",
        details: error.message,
      },
    });
  }
};

// ========================================
// SUBMIT DRAFT FOR APPROVAL CONTROLLER
// ========================================
const submitDriverFromDraft = async (req, res) => {
  try {
    const { id } = req.params;
    // ✅ FIX: Accept both "history"/"employmentHistory" and "accidents"/"accidentsViolations"
    const {
      basicInfo,
      addresses,
      documents,
      employmentHistory,
      accidentsViolations,
      history,
      accidents,
    } = req.body;

    // Use whichever field name was provided
    const historyData = employmentHistory || history || [];
    const accidentsData = accidentsViolations || accidents || [];

    const userId = req.user?.user_id;

    const currentTimestamp = new Date();

    console.log(
      "📤 Submitting driver draft for approval:",
      id,
      "User:",
      userId
    );
    console.log(
      "  - employmentHistory:",
      employmentHistory ? employmentHistory.length : "not provided"
    );
    console.log("  - history:", history ? history.length : "not provided");
    console.log(
      "  - accidentsViolations:",
      accidentsViolations ? accidentsViolations.length : "not provided"
    );
    console.log(
      "  - accidents:",
      accidents ? accidents.length : "not provided"
    );
    console.log("  - Using historyData:", historyData.length, "records");
    console.log("  - Using accidentsData:", accidentsData.length, "records");

    // Verify it's a draft and belongs to the user
    const existing = await knex("driver_basic_information")
      .where("driver_id", id)
      .first();

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Driver not found",
        },
      });
    }

    // Accept both "SAVE_AS_DRAFT" and "DRAFT" statuses for backward compatibility
    if (existing.status !== "SAVE_AS_DRAFT" && existing.status !== "DRAFT") {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_STATUS",
          message:
            "Can only submit drafts for approval. This driver is already submitted.",
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
    // COMPREHENSIVE VALIDATION - Same as createDriver
    // ========================================

    // Validate basic info - full name
    if (!basicInfo?.fullName || basicInfo.fullName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Full name is required (minimum 2 characters)",
          field: "basicInfo.fullName",
        },
      });
    }

    // Validate date of birth with age check
    const dobValidation = validateDateOfBirth(basicInfo.dateOfBirth);
    if (!dobValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: dobValidation.message,
          field: "basicInfo.dateOfBirth",
        },
      });
    }

    // Validate phone number
    if (!basicInfo.phoneNumber || !validatePhoneNumber(basicInfo.phoneNumber)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Valid phone number is required",
          field: "basicInfo.phoneNumber",
        },
      });
    }

    // Check for duplicate phone number (exclude current driver)
    const existingPhoneCheck = await knex("driver_basic_information")
      .where("phone_number", basicInfo.phoneNumber)
      .whereNot("driver_id", id)
      .first();

    if (existingPhoneCheck) {
      return res.status(400).json({
        success: false,
        error: {
          code: "DUPLICATE_PHONE",
          message: "Phone number already exists for another driver",
          field: "basicInfo.phoneNumber",
        },
      });
    }

    // Validate email if provided
    if (basicInfo.emailId && !validateEmail(basicInfo.emailId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid email format",
          field: "basicInfo.emailId",
        },
      });
    }

    // Check for duplicate email (exclude current driver)
    if (basicInfo.emailId) {
      const existingEmailCheck = await knex("driver_basic_information")
        .where("email_id", basicInfo.emailId)
        .whereNot("driver_id", id)
        .first();

      if (existingEmailCheck) {
        return res.status(400).json({
          success: false,
          error: {
            code: "DUPLICATE_EMAIL",
            message: "Email already exists for another driver",
            field: "basicInfo.emailId",
          },
        });
      }
    }

    // Validate alternate phone number if provided
    if (
      basicInfo.alternatePhoneNumber &&
      !validatePhoneNumber(basicInfo.alternatePhoneNumber)
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid alternate phone number",
          field: "basicInfo.alternatePhoneNumber",
        },
      });
    }

    // Validate emergency contact
    if (!basicInfo.emergencyContact) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Emergency contact is required",
          field: "basicInfo.emergencyContact",
        },
      });
    }

    if (!validatePhoneNumber(basicInfo.emergencyContact)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid emergency contact number",
          field: "basicInfo.emergencyContact",
        },
      });
    }

    // Validate at least one address
    if (!addresses || addresses.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "At least one address is required",
          field: "addresses",
        },
      });
    }

    // Validate each address
    for (let i = 0; i < addresses.length; i++) {
      const address = addresses[i];

      if (!address.addressTypeId) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Address type is required",
            field: `addresses[${i}].addressTypeId`,
          },
        });
      }

      if (!address.country) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Country is required",
            field: `addresses[${i}].country`,
          },
        });
      }

      if (!address.state) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "State is required",
            field: `addresses[${i}].state`,
          },
        });
      }

      if (!address.city) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "City is required",
            field: `addresses[${i}].city`,
          },
        });
      }

      if (!address.postalCode || address.postalCode.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Postal code is required",
            field: `addresses[${i}].postalCode`,
          },
        });
      }

      if (!validatePostalCode(address.postalCode)) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid postal code format",
            field: `addresses[${i}].postalCode`,
          },
        });
      }
    }

    // Validate documents if provided
    if (documents && documents.length > 0) {
      for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];

        // Skip empty documents
        if (!doc.documentNumber || doc.documentNumber.trim() === "") {
          continue;
        }

        if (!doc.documentType) {
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: `Document ${i + 1}: Document type is required`,
              field: `documents[${i}].documentType`,
            },
          });
        }

        // Validate document exists in master and resolve ID
        const docNameInfo = await knex("document_name_master")
          .where(function () {
            this.where("doc_name_master_id", doc.documentType).orWhere(
              "document_name",
              doc.documentType
            );
          })
          .where("status", "ACTIVE")
          .first();

        if (!docNameInfo) {
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: `Document ${i + 1}: Invalid document type "${
                doc.documentType
              }"`,
              field: `documents[${i}].documentType`,
            },
          });
        }

        // Store resolved document type ID and name
        doc.documentTypeId = docNameInfo.doc_name_master_id;
        doc.documentTypeName = docNameInfo.document_name;

        // Validate document format
        const docValidation = validateDocumentNumber(
          doc.documentNumber,
          doc.documentTypeName
        );
        if (!docValidation.isValid) {
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: `Document ${i + 1}: ${docValidation.message}`,
              field: `documents[${i}].documentNumber`,
            },
          });
        }

        // Check for duplicate document numbers (exclude current driver's documents)
        const duplicateDoc = await knex("driver_documents")
          .where("document_type_id", doc.documentTypeId)
          .where("document_number", doc.documentNumber)
          .whereNot("driver_id", id)
          .first();

        if (duplicateDoc) {
          return res.status(400).json({
            success: false,
            error: {
              code: "DUPLICATE_DOCUMENT",
              message: `Document ${i + 1}: This ${
                doc.documentTypeName
              } number already exists`,
              field: `documents[${i}].documentNumber`,
            },
          });
        }

        // ============================================
        // 🔍 FIX Issue 1: DRIVER LICENSE VALIDATION VIA API FOR SUBMIT FROM DRAFT
        // ============================================
        if (doc.documentTypeName.toLowerCase() === "driver license") {
          console.log(
            "🔍 Validating Driver License using external API (SUBMIT FROM DRAFT)..."
          );

          try {
            // Create HTTPS agent that bypasses SSL certificate verification for this specific API
            const httpsAgent = new https.Agent({
              rejectUnauthorized: false, // Disable SSL verification for this API only
            });

            // Format date to YYYY-MM-DD as required by the API
            const formattedDob = formatDateForInput(basicInfo.dateOfBirth);

            if (!formattedDob) {
              return res.status(400).json({
                success: false,
                error: {
                  code: "VALIDATION_ERROR",
                  message:
                    "Driver date of birth is required for license validation",
                  field: "basicInfo.dateOfBirth",
                },
                timestamp: new Date().toISOString(),
              });
            }

            console.log("🔍 Formatted DOB for API:", formattedDob);

            const apiResponse = await axios({
              method: "GET",
              url: "https://api.maventic.in/mapi/getDLDetails",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.DL_API_KEY || ""}`,
              },
              data: {
                dlnumber: doc.documentNumber,
                dob: formattedDob,
              },
              httpsAgent: httpsAgent, // Apply custom agent to bypass SSL verification
            });

            const result = apiResponse.data;
            console.log("📡 DL API Response (Submit From Draft):", result);

            // Check for API-level errors
            // API returns: { error: "false", code: "200", message: "Success", data: {...} }
            if (result.error === "true" || result.code !== "200") {
              // Determine user-friendly message based on response
              let userMessage =
                "Driver license number is invalid or could not be found";
              if (
                result.message &&
                result.message.toLowerCase().includes("expired")
              ) {
                userMessage =
                  "Driver license has expired. Please renew your license";
              } else if (
                result.message &&
                result.message.toLowerCase().includes("not found")
              ) {
                userMessage =
                  "Driver license number could not be found in the system";
              } else if (
                result.message &&
                result.message.toLowerCase().includes("format")
              ) {
                userMessage = "Driver license number format is invalid";
              }

              return res.status(400).json({
                success: false,
                error: {
                  code: "INVALID_DRIVER_LICENSE",
                  message: userMessage,
                  field: `documents[${i}].documentNumber`,
                },
                timestamp: new Date().toISOString(),
              });
            }

            // Success check - verify both error flag and message
            if (result.error !== "false" || result.message !== "Success") {
              return res.status(400).json({
                success: false,
                error: {
                  code: "INVALID_DRIVER_LICENSE",
                  message:
                    result.message ||
                    "Driver license number is invalid or could not be verified",
                  field: `documents[${i}].documentNumber`,
                },
                timestamp: new Date().toISOString(),
              });
            }

            console.log(
              "✅ Driver License validated successfully (Submit From Draft)"
            );
          } catch (err) {
            console.error("❌ DL API ERROR (Submit From Draft):", err);
            return res.status(500).json({
              success: false,
              error: {
                code: "DL_API_ERROR",
                message:
                  "Unable to validate driver license. Please try again later",
                field: `documents[${i}].documentNumber`,
              },
              timestamp: new Date().toISOString(),
            });
          }
        }
      }
    }

    const trx = await knex.transaction();

    try {
      // Update general info to PENDING status
      await trx("driver_basic_information")
        .where("driver_id", id)
        .update({
          full_name: basicInfo.fullName,
          date_of_birth: basicInfo.dateOfBirth,
          gender: basicInfo.gender || null,
          blood_group: basicInfo.bloodGroup || null,
          phone_number: basicInfo.phoneNumber || null,
          email_id: basicInfo.emailId || null,
          emergency_contact: basicInfo.emergencyContact || null,
          alternate_phone_number: basicInfo.alternatePhoneNumber || null,
          status: "PENDING", // Change status to PENDING
          updated_by: userId,
          updated_at: knex.fn.now(),
          updated_on: knex.fn.now(),
        });

      // Delete existing related data and re-insert with complete data
      await trx("tms_address").where("user_reference_id", id).del();
      await trx("document_upload")
        .whereIn("system_reference_id", function () {
          this.select("document_unique_id")
            .from("driver_documents")
            .where("driver_id", id); // Delete all documents for this driver regardless of pattern
        })
        .del();
      await trx("driver_documents").where("driver_id", id).del();
      await trx("driver_history_information").where("driver_id", id).del();
      await trx("driver_accident_violation").where("driver_id", id).del();

      // Re-insert complete data
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
          postal_code: address.postalCode || null,
          is_primary: address.isPrimary || false,
          address_type_id: address.addressTypeId || "AT001",
          status: "ACTIVE",
          created_by: userId,
          updated_by: userId,
          created_at: currentTimestamp,
          updated_at: currentTimestamp,
          created_on: currentTimestamp,
          updated_on: currentTimestamp,
        });
      }

      // Re-insert documents if provided
      if (documents && documents.length > 0) {
        for (const doc of documents) {
          const docId = await generateDocumentId(trx);
          const documentUniqueId = `${id}_${docId}`;

          await trx("driver_documents").insert({
            document_unique_id: documentUniqueId,
            document_id: docId,
            driver_id: id,
            document_type_id: doc.documentTypeId || doc.documentType, // Use resolved ID
            document_number: doc.documentNumber,
            issuing_country: doc.issuingCountry || null,
            issuing_state: doc.issuingState || null,
            valid_from: doc.validFrom || null,
            valid_to: doc.validTo || null,
            active_flag: doc.status !== false,
            remarks: doc.remarks || null,
            status: "ACTIVE",
            created_by: userId,
            updated_by: userId,
            created_at: currentTimestamp,
            updated_at: currentTimestamp,
            created_on: currentTimestamp,
            updated_on: currentTimestamp,
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

      // Re-insert employment history if provided
      if (historyData && historyData.length > 0) {
        console.log(
          `✅ Submitting ${historyData.length} history record(s) for approval...`
        );
        for (const history of historyData) {
          const historyId = await generateHistoryId(trx);

          await trx("driver_history_information").insert({
            driver_history_id: historyId,
            driver_id: id,
            employer: history.employer || history.employerName || null,
            employment_status: history.employmentStatus || null,
            from_date: history.fromDate,
            to_date: history.toDate || null,
            job_title: history.jobTitle || history.position || null,
            status: "ACTIVE",
            created_by: userId,
            updated_by: userId,
            created_at: currentTimestamp,
            updated_at: currentTimestamp,
            created_on: currentTimestamp,
            updated_on: currentTimestamp,
          });
          console.log(
            `  ✓ History submitted: ${historyId} - ${
              history.employer || history.employerName
            }`
          );
        }
      } else {
        console.log("⚠️ No history data to submit");
      }

      // Re-insert accidents/violations if provided
      if (accidentsData && accidentsData.length > 0) {
        console.log(
          `✅ Submitting ${accidentsData.length} accident/violation record(s) for approval...`
        );
        for (const incident of accidentsData) {
          const accidentId = await generateAccidentId(trx);

          await trx("driver_accident_violation").insert({
            driver_violation_id: accidentId,
            driver_id: id,
            type: incident.type || incident.violationType || null,
            date: incident.date || incident.incidentDate || null,
            vehicle_regn_number:
              incident.vehicleRegistrationNumber ||
              incident.vehicleRegnNumber ||
              null,
            description: incident.description || null,
            status: "ACTIVE",
            created_by: userId,
            updated_by: userId,
            created_at: currentTimestamp,
            updated_at: currentTimestamp,
            created_on: currentTimestamp,
            updated_on: currentTimestamp,
          });
          console.log(
            `  ✓ Accident submitted: ${accidentId} - ${
              incident.type || incident.violationType
            } on ${incident.date || incident.incidentDate}`
          );
        }
      } else {
        console.log("⚠️ No accident/violation data to submit");
      }

      // ========================================
      // CREATE DRIVER USER ACCOUNT & APPROVAL FLOW
      // ========================================
      console.log("🔍 Creating driver user account and approval flow...");

      // Generate user ID based on driver ID pattern (DRV001 -> DA0001)
      const driverNumber = id.substring(3); // Remove 'DRV' prefix
      const driverAdminUserId = `DA${driverNumber.padStart(4, "0")}`;
      console.log(
        `  Generated user ID: ${driverAdminUserId} (derived from ${id})`
      );

      // Check if user already exists (in case this is a re-submission or update)
      const existingUser = await trx("user_master")
        .where("user_id", driverAdminUserId)
        .first();

      if (!existingUser) {
        // Create new user account for the driver
        console.log(`  Creating new user account: ${driverAdminUserId}`);

        // Get creator details from request (current logged-in Product Owner)
        const creatorUserId = userId;
        const creatorName = req.user?.user_full_name || "Product Owner";

        // Generate initial password (based on full name + random number)
        const fullNameClean = basicInfo.fullName.replace(/[^a-zA-Z0-9]/g, "");
        const initialPassword = `${fullNameClean}@123`;
        const hashedPassword = await bcrypt.hash(initialPassword, 10);

        // Use driver details for user account
        const userEmail = basicInfo.emailId || `${id.toLowerCase()}@driver.com`;
        const userMobile = basicInfo.phoneNumber || "0000000000";

        // Create user in user_master with PENDING status
        await trx("user_master").insert({
          user_id: driverAdminUserId,
          user_type_id: "UT004", // Driver user type
          user_full_name: basicInfo.fullName,
          email_id: userEmail,
          mobile_number: userMobile,
          from_date: currentTimestamp,
          to_date: null,
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
          `  ✅ Created user: ${driverAdminUserId} (PENDING approval)`
        );

        // Get approval configuration for Driver (Level 1 only)
        const approvalConfig = await trx("approval_configuration")
          .where({
            approval_type_id: "AT003", // Driver User
            approver_level: 1,
            status: "ACTIVE",
          })
          .first();

        if (!approvalConfig) {
          throw new Error("Approval configuration not found for Driver User");
        }

        // Determine pending approver (Product Owner who did NOT create this)
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
          // If creator is neither PO1 nor PO2, default to PO001
          const po1 = await trx("user_master")
            .where("user_id", "PO001")
            .first();
          pendingWithUserId = "PO001";
          pendingWithName = po1?.user_full_name || "Product Owner 1";
        }

        // Generate approval flow trans ID
        const approvalFlowId = await generateApprovalFlowId(trx);

        // Create approval flow transaction entry
        await trx("approval_flow_trans").insert({
          approval_flow_trans_id: approvalFlowId,
          approval_config_id: approvalConfig.approval_config_id,
          approval_type_id: "AT003", // Driver User
          user_id_reference_id: id, // 🔥 FIX: Store actual driver entity ID instead of admin user ID
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
      } else {
        // User already exists - update status and ensure approval flow exists
        console.log(`  ✅ User account already exists: ${driverAdminUserId}`);

        // Always update user status to PENDING when submitting draft
        await trx("user_master")
          .where("user_id", driverAdminUserId)
          .update({
            status: "PENDING",
            full_name: basicInfo.fullName, // Update with latest data
            email_id: basicInfo.emailId || existingUser.email_id,
            mobile_number: basicInfo.phoneNumber || existingUser.mobile_number,
            updated_by: userId,
            updated_at: currentTimestamp,
            updated_on: currentTimestamp,
          });
        console.log(
          `  ✅ Updated user status to PENDING: ${driverAdminUserId}`
        );
      }

      // ========================================
      // ENSURE APPROVAL FLOW EXISTS (ALWAYS)
      // ========================================
      // Check if approval flow already exists for this user
      const existingApprovalFlow = await trx("approval_flow_trans")
        .where("user_id_reference_id", driverAdminUserId)
        .where("s_status", "PENDING")
        .where("status", "ACTIVE")
        .first();

      if (!existingApprovalFlow) {
        console.log(
          `  🔄 Creating approval flow for driver user: ${driverAdminUserId}`
        );

        // Get current user details
        const creatorUserId = userId;
        const creatorName = req.user?.user_full_name || "Product Owner";

        // Get approval configuration
        const approvalConfig = await trx("approval_configuration")
          .where({
            approval_type_id: "AT003", // Driver User
            approver_level: 1,
            status: "ACTIVE",
          })
          .first();

        if (!approvalConfig) {
          throw new Error("Approval configuration not found for Driver User");
        }

        // Determine pending approver (Product Owner who did NOT create this)
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
          // If creator is neither PO1 nor PO2, default to PO001
          const po1 = await trx("user_master")
            .where("user_id", "PO001")
            .first();
          pendingWithUserId = "PO001";
          pendingWithName = po1?.user_full_name || "Product Owner 1";
        }

        // Generate approval flow trans ID
        const approvalFlowId = await generateApprovalFlowId(trx);

        // Create approval flow transaction entry
        await trx("approval_flow_trans").insert({
          approval_flow_trans_id: approvalFlowId,
          approval_config_id: approvalConfig.approval_config_id,
          approval_type_id: "AT003", // Driver User
          user_id_reference_id: driverAdminUserId,
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

        console.log(
          `  ✅ Created approval workflow: ${approvalFlowId} for ${driverAdminUserId}`
        );
        console.log(
          `  📧 Pending with: ${pendingWithName} (${pendingWithUserId})`
        );
      } else {
        console.log(
          `  ✅ Approval flow already exists: ${existingApprovalFlow.approval_flow_trans_id}`
        );
      }

      await trx.commit();

      console.log("✅ Driver draft submitted for approval successfully:", id);

      return res.status(200).json({
        success: true,
        message:
          "Driver draft submitted for approval successfully. Status changed to PENDING.",
        data: {
          driverId: id,
          status: "PENDING",
        },
      });
    } catch (error) {
      await trx.rollback();
      console.error("❌ Submit driver draft transaction error:", error);
      throw error;
    }
  } catch (error) {
    console.error("❌ Submit driver draft error:", error);
    return res.status(500).json({
      success: false,
      error: {
        code: "SUBMIT_DRAFT_ERROR",
        message: "Failed to submit driver draft for approval",
        details: error.message,
      },
    });
  }
};

// ========================================
// DELETE DRAFT CONTROLLER
// ========================================
const deleteDriverDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.user_id;

    console.log("🗑️ Deleting driver draft:", id, "User:", userId);

    // Verify it's a draft and belongs to the user
    const existing = await knex("driver_basic_information")
      .where("driver_id", id)
      .first();

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Driver not found",
        },
      });
    }

    // Accept both "SAVE_AS_DRAFT" and "DRAFT" statuses for backward compatibility
    if (existing.status !== "SAVE_AS_DRAFT" && existing.status !== "DRAFT") {
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
      await trx("document_upload")
        .whereIn("system_reference_id", function () {
          this.select("document_unique_id")
            .from("driver_documents")
            .where("driver_id", id); // Delete all documents for this driver regardless of pattern
        })
        .del();
      await trx("driver_documents").where("driver_id", id).del();
      await trx("driver_history_information").where("driver_id", id).del();
      await trx("driver_accident_violation").where("driver_id", id).del();

      // Delete driver record
      await trx("driver_basic_information").where("driver_id", id).del();

      await trx.commit();

      console.log("✅ Driver draft deleted successfully:", id);

      return res.status(200).json({
        success: true,
        message: "Driver draft deleted successfully",
      });
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    console.error("❌ Delete driver draft error:", error);
    return res.status(500).json({
      success: false,
      error: {
        code: "DELETE_DRAFT_ERROR",
        message: "Failed to delete driver draft",
        details: error.message,
      },
    });
  }
};

module.exports = {
  createDriver,
  updateDriver,
  getDrivers,
  getDriverStatusCounts,
  getDriverById,
  getMasterData,
  getMandatoryDocuments,
  getStatesByCountry,
  getCitiesByCountryAndState,
  saveDriverAsDraft,
  updateDriverDraft,
  deleteDriverDraft,
  submitDriverFromDraft,
};
