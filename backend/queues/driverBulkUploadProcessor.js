const ExcelJS = require("exceljs");
const knex = require("knex")(require("../knexfile").development);
const fs = require("fs");
const path = require("path");
const { Country, State, City } = require("country-state-city");

/**
 * Generate unique driver ID
 */
const generateDriverId = async (trx = knex) => {
  const result = await trx("driver_basic_information")
    .count("* as count")
    .first();
  const count = parseInt(result.count) + 1;
  return `DRV${count.toString().padStart(4, "0")}`;
};

/**
 * Generate unique address ID
 */
const generateAddressId = async (trx = knex) => {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const result = await trx("tms_address").count("* as count").first();
    const count = parseInt(result.count) + 1 + attempts;
    const newId = `ADDR${count.toString().padStart(4, "0")}`;

    const existing = await trx("tms_address")
      .where("address_id", newId)
      .first();
    if (!existing) return newId;
    attempts++;
  }

  throw new Error("Failed to generate unique address ID after 100 attempts");
};

/**
 * Generate unique document ID
 */
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
    if (!existing) return newId;
    attempts++;
  }

  throw new Error("Failed to generate unique document ID after 100 attempts");
};

/**
 * Generate unique history ID
 */
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
    if (!existing) return newId;
    attempts++;
  }

  throw new Error("Failed to generate unique history ID after 100 attempts");
};

/**
 * Generate unique accident ID
 */
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
    if (!existing) return newId;
    attempts++;
  }

  throw new Error(
    "Failed to generate unique accident/violation ID after 100 attempts"
  );
};

/**
 * Parse Excel file and extract driver data
 */
async function parseDriverExcel(filePath) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const basicInfoSheet = workbook.getWorksheet("Basic Information");
  const addressSheet = workbook.getWorksheet("Addresses");
  const docSheet = workbook.getWorksheet("Documents");
  const historySheet = workbook.getWorksheet("Employment History");
  const accidentSheet = workbook.getWorksheet("Accident & Violation");

  const drivers = {};

  // Parse Basic Information
  basicInfoSheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header

    const driverRefId = row.getCell(1).value;
    if (!driverRefId) return;

    drivers[driverRefId] = {
      refId: driverRefId,
      basicInfo: {
        fullName: row.getCell(2).value,
        dateOfBirth: row.getCell(3).value,
        gender: row.getCell(4).value,
        bloodGroup: row.getCell(5).value,
        phoneNumber: row.getCell(6).value,
        emailId: row.getCell(7).value,
        emergencyContact: row.getCell(8).value,
        alternatePhoneNumber: row.getCell(9).value,
      },
      addresses: [],
      documents: [],
      history: [],
      accidents: [],
    };
  });

  // Parse Addresses
  if (addressSheet) {
    addressSheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const driverRefId = row.getCell(1).value;
      if (!driverRefId || !drivers[driverRefId]) return;

      drivers[driverRefId].addresses.push({
        addressTypeId: row.getCell(2).value,
        street1: row.getCell(3).value,
        street2: row.getCell(4).value,
        city: row.getCell(5).value,
        district: row.getCell(6).value,
        state: row.getCell(7).value,
        country: row.getCell(8).value,
        postalCode: row.getCell(9).value,
        isPrimary: row.getCell(10).value === "Y",
      });
    });
  }

  // Parse Documents
  if (docSheet) {
    docSheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const driverRefId = row.getCell(1).value;
      if (!driverRefId || !drivers[driverRefId]) return;

      drivers[driverRefId].documents.push({
        documentType: row.getCell(2).value,
        documentNumber: row.getCell(3).value,
        issuingCountry: row.getCell(4).value,
        issuingState: row.getCell(5).value,
        validFrom: row.getCell(6).value,
        validTo: row.getCell(7).value,
        remarks: row.getCell(8).value,
        status: row.getCell(9).value === "Y",
      });
    });
  }

  // Parse Employment History
  if (historySheet) {
    historySheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const driverRefId = row.getCell(1).value;
      if (!driverRefId || !drivers[driverRefId]) return;

      drivers[driverRefId].history.push({
        employer: row.getCell(2).value,
        employmentStatus: row.getCell(3).value,
        fromDate: row.getCell(4).value,
        toDate: row.getCell(5).value,
        jobTitle: row.getCell(6).value,
      });
    });
  }

  // Parse Accident & Violation
  if (accidentSheet) {
    accidentSheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const driverRefId = row.getCell(1).value;
      if (!driverRefId || !drivers[driverRefId]) return;

      const type = row.getCell(2).value;
      const description = row.getCell(3).value;

      if (type || description) {
        drivers[driverRefId].accidents.push({
          type,
          description,
          date: row.getCell(4).value,
          vehicleRegistrationNumber: row.getCell(5).value,
        });
      }
    });
  }

  return Object.values(drivers);
}

/**
 * Validate driver data (basic validation - no database checks)
 */
function validateDriverData(driver) {
  const errors = [];

  // Validate basic info
  if (!driver.basicInfo.fullName || driver.basicInfo.fullName.length < 2) {
    errors.push({
      field: "Full_Name",
      message: "Full name is required and must be at least 2 characters",
      sheet: "Basic Information",
    });
  }

  if (!driver.basicInfo.phoneNumber) {
    errors.push({
      field: "Phone_Number",
      message: "Phone number is required",
      sheet: "Basic Information",
    });
  } else if (!/^[6-9]\d{9}$/.test(driver.basicInfo.phoneNumber)) {
    errors.push({
      field: "Phone_Number",
      message: "Phone number must be 10 digits starting with 6-9",
      sheet: "Basic Information",
    });
  }

  // Validate email format if provided
  if (
    driver.basicInfo.emailId &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(driver.basicInfo.emailId)
  ) {
    errors.push({
      field: "Email_ID",
      message: "Invalid email format",
      sheet: "Basic Information",
    });
  }

  if (!driver.basicInfo.emergencyContact) {
    errors.push({
      field: "Emergency_Contact",
      message: "Emergency contact is required",
      sheet: "Basic Information",
    });
  } else if (!/^[6-9]\d{9}$/.test(driver.basicInfo.emergencyContact)) {
    errors.push({
      field: "Emergency_Contact",
      message: "Emergency contact must be 10 digits starting with 6-9",
      sheet: "Basic Information",
    });
  }

  if (!driver.basicInfo.dateOfBirth) {
    errors.push({
      field: "Date_Of_Birth",
      message: "Date of birth is required",
      sheet: "Basic Information",
    });
  } else {
    const dob = new Date(driver.basicInfo.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    if (age < 18 || age > 65) {
      errors.push({
        field: "Date_Of_Birth",
        message: "Driver must be between 18 and 65 years old",
        sheet: "Basic Information",
      });
    }
  }

  // Validate addresses
  if (driver.addresses.length === 0) {
    errors.push({
      field: "Addresses",
      message: "At least one address is required",
      sheet: "Addresses",
    });
  } else {
    const primaryCount = driver.addresses.filter((a) => a.isPrimary).length;
    if (primaryCount === 0) {
      errors.push({
        field: "Is_Primary",
        message: "At least one address must be marked as primary",
        sheet: "Addresses",
      });
    } else if (primaryCount > 1) {
      errors.push({
        field: "Is_Primary",
        message: "Only one address can be marked as primary",
        sheet: "Addresses",
      });
    }

    // Validate each address
    driver.addresses.forEach((addr, idx) => {
      if (!addr.street1 || addr.street1.trim().length === 0) {
        errors.push({
          field: `Street_1 (Address ${idx + 1})`,
          message: "Street 1 is required",
          sheet: "Addresses",
        });
      }
      if (!addr.city || addr.city.trim().length === 0) {
        errors.push({
          field: `City (Address ${idx + 1})`,
          message: "City is required",
          sheet: "Addresses",
        });
      }
      if (!addr.state || addr.state.trim().length === 0) {
        errors.push({
          field: `State (Address ${idx + 1})`,
          message: "State is required",
          sheet: "Addresses",
        });
      }
      if (!addr.country || addr.country.trim().length === 0) {
        errors.push({
          field: `Country (Address ${idx + 1})`,
          message: "Country is required",
          sheet: "Addresses",
        });
      }
      if (!addr.postalCode || !/^\d{6}$/.test(addr.postalCode)) {
        errors.push({
          field: `Postal_Code (Address ${idx + 1})`,
          message: "Postal code must be 6 digits",
          sheet: "Addresses",
        });
      }
    });
  }

  // Validate documents if present
  if (driver.documents && driver.documents.length > 0) {
    driver.documents.forEach((doc, idx) => {
      if (!doc.documentType) {
        errors.push({
          field: `Document_Type (Document ${idx + 1})`,
          message: "Document type is required",
          sheet: "Documents",
        });
      }
      if (!doc.documentNumber || doc.documentNumber.trim().length === 0) {
        errors.push({
          field: `Document_Number (Document ${idx + 1})`,
          message: "Document number is required",
          sheet: "Documents",
        });
      }
    });

    // Check for duplicate document numbers within the same driver
    const docNumbers = driver.documents
      .map((d) => d.documentNumber)
      .filter((n) => n);
    const duplicateDocs = docNumbers.filter(
      (num, idx) => docNumbers.indexOf(num) !== idx
    );
    if (duplicateDocs.length > 0) {
      errors.push({
        field: "Document_Number",
        message: `Duplicate document numbers found: ${[
          ...new Set(duplicateDocs),
        ].join(", ")}`,
        sheet: "Documents",
      });
    }
  }

  return errors;
}

/**
 * Check for duplicate drivers in database
 * @param {Array} drivers - Array of drivers to check
 * @returns {Promise<Object>} Object with phone and email duplicates
 */
async function checkDatabaseDuplicates(drivers) {
  const duplicateErrors = {};

  for (const driver of drivers) {
    const errors = [];

    // Check phone number duplicates
    if (driver.basicInfo.phoneNumber) {
      const existingPhone = await knex("driver_basic_information")
        .where("phone_number", driver.basicInfo.phoneNumber)
        .first();

      if (existingPhone) {
        errors.push({
          field: "Phone_Number",
          message: `Phone number ${driver.basicInfo.phoneNumber} already exists for driver ${existingPhone.driver_id}`,
          sheet: "Basic Information",
        });
      }
    }

    // Check email duplicates (if provided)
    if (driver.basicInfo.emailId) {
      const existingEmail = await knex("driver_basic_information")
        .where("email_id", driver.basicInfo.emailId)
        .first();

      if (existingEmail) {
        errors.push({
          field: "Email_ID",
          message: `Email ${driver.basicInfo.emailId} already exists for driver ${existingEmail.driver_id}`,
          sheet: "Basic Information",
        });
      }
    }

    // Check for duplicate document numbers in database
    if (driver.documents && driver.documents.length > 0) {
      for (const doc of driver.documents) {
        if (doc.documentNumber) {
          const existingDoc = await knex("driver_documents")
            .where("document_number", doc.documentNumber)
            .first();

          if (existingDoc) {
            errors.push({
              field: "Document_Number",
              message: `Document number ${doc.documentNumber} already exists in database`,
              sheet: "Documents",
            });
          }
        }
      }
    }

    if (errors.length > 0) {
      duplicateErrors[driver.refId] = errors;
    }
  }

  return duplicateErrors;
}

/**
 * Check for duplicates within the upload batch itself
 * @param {Array} drivers - Array of drivers to check
 * @returns {Object} Object with duplicate errors by driver refId
 */
function checkBatchDuplicates(drivers) {
  const duplicateErrors = {};
  const phoneNumbers = {};
  const emailIds = {};
  const documentNumbers = {};

  drivers.forEach((driver, index) => {
    const errors = [];

    // Check phone number duplicates within batch
    if (driver.basicInfo.phoneNumber) {
      if (phoneNumbers[driver.basicInfo.phoneNumber]) {
        errors.push({
          field: "Phone_Number",
          message: `Phone number ${
            driver.basicInfo.phoneNumber
          } is duplicated in this batch (also used by ${
            phoneNumbers[driver.basicInfo.phoneNumber]
          })`,
          sheet: "Basic Information",
        });
      } else {
        phoneNumbers[driver.basicInfo.phoneNumber] = driver.refId;
      }
    }

    // Check email duplicates within batch (if provided)
    if (driver.basicInfo.emailId) {
      if (emailIds[driver.basicInfo.emailId]) {
        errors.push({
          field: "Email_ID",
          message: `Email ${
            driver.basicInfo.emailId
          } is duplicated in this batch (also used by ${
            emailIds[driver.basicInfo.emailId]
          })`,
          sheet: "Basic Information",
        });
      } else {
        emailIds[driver.basicInfo.emailId] = driver.refId;
      }
    }

    // Check document number duplicates within batch
    if (driver.documents && driver.documents.length > 0) {
      driver.documents.forEach((doc) => {
        if (doc.documentNumber) {
          if (documentNumbers[doc.documentNumber]) {
            errors.push({
              field: "Document_Number",
              message: `Document number ${
                doc.documentNumber
              } is duplicated in this batch (also used by ${
                documentNumbers[doc.documentNumber]
              })`,
              sheet: "Documents",
            });
          } else {
            documentNumbers[doc.documentNumber] = driver.refId;
          }
        }
      });
    }

    if (errors.length > 0) {
      duplicateErrors[driver.refId] = errors;
    }
  });

  return duplicateErrors;
}

/**
 * Generate error report Excel file for driver bulk upload
 * @param {Array} invalidDrivers - Array of invalid driver records with errors
 * @param {string} batchId - Batch ID for file naming
 * @returns {Promise<string>} Path to generated error report file
 */
async function generateDriverErrorReport(invalidDrivers, batchId) {
  try {
    console.log(`📄 Generating driver error report for batch ${batchId}...`);

    const workbook = new ExcelJS.Workbook();

    // Sheet 1: Error Summary
    const summarySheet = workbook.addWorksheet("Error Summary");

    // Title
    summarySheet.mergeCells("A1:D1");
    const titleCell = summarySheet.getCell("A1");
    titleCell.value = `Driver Bulk Upload Error Report - Batch ${batchId}`;
    titleCell.font = { size: 16, bold: true, color: { argb: "FFFFFFFF" } };
    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD32F2F" },
    };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    summarySheet.getRow(1).height = 30;

    // Stats
    summarySheet.getCell("A3").value = "Total Invalid Records:";
    summarySheet.getCell("B3").value = invalidDrivers.length;
    summarySheet.getCell("A3").font = { bold: true };

    // Headers for error list
    summarySheet.getCell("A5").value = "Driver Ref ID";
    summarySheet.getCell("B5").value = "Full Name";
    summarySheet.getCell("C5").value = "Phone Number";
    summarySheet.getCell("D5").value = "Error Count";
    summarySheet.getRow(5).font = { bold: true };
    summarySheet.getRow(5).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };

    // Error list
    let row = 6;
    invalidDrivers.forEach((item) => {
      summarySheet.getCell(`A${row}`).value = item.driver.refId;
      summarySheet.getCell(`B${row}`).value =
        item.driver.basicInfo.fullName || "N/A";
      summarySheet.getCell(`C${row}`).value =
        item.driver.basicInfo.phoneNumber || "N/A";
      summarySheet.getCell(`D${row}`).value = item.errors.length;
      row++;
    });

    // Column widths
    summarySheet.getColumn("A").width = 20;
    summarySheet.getColumn("B").width = 30;
    summarySheet.getColumn("C").width = 20;
    summarySheet.getColumn("D").width = 15;

    // Sheet 2: Detailed Errors
    const detailSheet = workbook.addWorksheet("Detailed Errors");

    // Headers
    detailSheet.getCell("A1").value = "Driver Ref ID";
    detailSheet.getCell("B1").value = "Full Name";
    detailSheet.getCell("C1").value = "Sheet";
    detailSheet.getCell("D1").value = "Field";
    detailSheet.getCell("E1").value = "Error Message";
    detailSheet.getRow(1).font = { bold: true };
    detailSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };

    // Detailed error list
    row = 2;
    invalidDrivers.forEach((item) => {
      item.errors.forEach((error) => {
        detailSheet.getCell(`A${row}`).value = item.driver.refId;
        detailSheet.getCell(`B${row}`).value =
          item.driver.basicInfo.fullName || "N/A";
        detailSheet.getCell(`C${row}`).value = error.sheet;
        detailSheet.getCell(`D${row}`).value = error.field;
        detailSheet.getCell(`E${row}`).value = error.message;

        // Highlight error rows
        detailSheet.getRow(row).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFF0F0" },
        };

        row++;
      });
    });

    // Column widths
    detailSheet.getColumn("A").width = 20;
    detailSheet.getColumn("B").width = 30;
    detailSheet.getColumn("C").width = 25;
    detailSheet.getColumn("D").width = 30;
    detailSheet.getColumn("E").width = 60;

    // Save to file
    const errorReportsDir = path.join(__dirname, "../uploads/error-reports");
    if (!fs.existsSync(errorReportsDir)) {
      fs.mkdirSync(errorReportsDir, { recursive: true });
    }

    const filename = `driver-error-report-${batchId}-${Date.now()}.xlsx`;
    const filePath = path.join(errorReportsDir, filename);

    await workbook.xlsx.writeFile(filePath);

    console.log(`✅ Driver error report generated: ${filename}`);

    return filePath;
  } catch (error) {
    console.error("Error generating driver error report:", error);
    throw error;
  }
}

/**
 * Map address type name from Excel to address_type_id from master data
 */
const getAddressTypeId = async (addressTypeName, trx) => {
  // Common mappings from Excel to database
  const mappings = {
    Permanent: "Permanent Address",
    Current: "Temporary Address",
    Temporary: "Temporary Address",
    "Permanent Address": "Permanent Address",
    "Temporary Address": "Temporary Address",
    "Contact Person Address": "Contact Person Address",
    "Billing Address": "Billing Address",
    "Shipping Address": "Shipping Address",
  };

  // Get the mapped name or use the original
  const mappedName = mappings[addressTypeName] || addressTypeName;

  // Query database for the address_type_id
  const result = await trx("address_type_master")
    .where("address", mappedName)
    .where("status", "ACTIVE")
    .first();

  if (result) {
    return result.address_type_id;
  }

  // Default to Permanent Address if not found
  console.warn(
    `Address type "${addressTypeName}" not found in master data, defaulting to Permanent Address`
  );
  const defaultResult = await trx("address_type_master")
    .where("address", "Permanent Address")
    .first();

  return defaultResult ? defaultResult.address_type_id : "AT005";
};

/**
 * Map document type name from Excel to document_type_id from master data
 */
const getDocumentTypeId = async (docTypeName, trx) => {
  // Common mappings from Excel to database
  const mappings = {
    License: "Invoice",
    "Driving License": "Invoice",
    Aadhar: "Invoice",
    "PAN Card": "Invoice",
    Passport: "Invoice",
    Invoice: "Invoice",
    "LR Copy": "LR Copy",
    POD: "POD",
    "E-Way Bill": "E-Way Bill",
  };

  // Get the mapped name or use the original
  const mappedName = mappings[docTypeName] || docTypeName;

  // Query database for the document_type_id
  const result = await trx("document_type_master")
    .where("document_type", mappedName)
    .where("status", "ACTIVE")
    .first();

  if (result) {
    return result.document_type_id;
  }

  // Default to Invoice if not found
  console.warn(
    `Document type "${docTypeName}" not found in master data, defaulting to Invoice`
  );
  const defaultResult = await trx("document_type_master")
    .where("document_type", "Invoice")
    .first();

  return defaultResult ? defaultResult.document_type_id : "DOC001";
};

/**
 * Create driver from validated bulk data
 */
async function createDriverFromBulkData(driver, userId, trx) {
  try {
    // Generate driver ID
    const driverId = await generateDriverId(trx);

    // Get country/state names from codes
    const getLocationName = (
      countryCode,
      stateCode = null,
      cityName = null
    ) => {
      const country = Country.getCountryByCode(countryCode);
      if (!country)
        return { countryName: countryCode, stateName: stateCode, cityName };

      if (stateCode) {
        const state = State.getStateByCodeAndCountry(stateCode, countryCode);
        return {
          countryName: country.name,
          stateName: state ? state.name : stateCode,
          cityName: cityName || "",
        };
      }

      return { countryName: country.name, stateName: "", cityName: "" };
    };

    // Insert basic information
    await trx("driver_basic_information").insert({
      driver_id: driverId,
      full_name: driver.basicInfo.fullName,
      date_of_birth: driver.basicInfo.dateOfBirth,
      gender: driver.basicInfo.gender || null,
      blood_group: driver.basicInfo.bloodGroup || null,
      phone_number: driver.basicInfo.phoneNumber,
      email_id: driver.basicInfo.emailId || null,
      emergency_contact: driver.basicInfo.emergencyContact,
      alternate_phone_number: driver.basicInfo.alternatePhoneNumber || null,
      status: "ACTIVE", // Status column max length is 10 chars, using ACTIVE instead of "Pending Approval"
      created_by: userId,
      created_at: trx.fn.now(),
      updated_by: userId,
      updated_at: trx.fn.now(),
    });

    // Insert addresses
    for (const address of driver.addresses) {
      const addressId = await generateAddressId(trx);
      const location = getLocationName(
        address.country,
        address.state,
        address.city
      );

      // Map address type name to ID from master data
      const addressTypeId = await getAddressTypeId(address.addressTypeId, trx);

      await trx("tms_address").insert({
        address_id: addressId,
        user_reference_id: driverId,
        user_type: "DRIVER",
        address_type_id: addressTypeId,
        street_1: address.street1,
        street_2: address.street2 || null,
        city: location.cityName || address.city,
        district: address.district || null,
        state: location.stateName || address.state,
        country: location.countryName || address.country,
        postal_code: address.postalCode,
        is_primary: address.isPrimary ? 1 : 0,
        status: "ACTIVE",
        created_by: userId,
        created_at: trx.fn.now(),
        updated_by: userId,
        updated_at: trx.fn.now(),
      });
    }

    // Insert documents (metadata only - files uploaded later via UI)
    for (const doc of driver.documents) {
      const documentId = await generateDocumentId(trx);
      const documentUniqueId = `${driverId}_${documentId}`;

      // Map document type name to ID from master data
      const documentTypeId = await getDocumentTypeId(doc.documentType, trx);

      await trx("driver_documents").insert({
        document_unique_id: documentUniqueId,
        document_id: documentId,
        driver_id: driverId,
        document_type_id: documentTypeId,
        document_number: doc.documentNumber,
        issuing_country: doc.issuingCountry || null,
        issuing_state: doc.issuingState || null,
        valid_from: doc.validFrom || null,
        valid_to: doc.validTo || null,
        remarks: doc.remarks || null,
        status: "ACTIVE",
        active_flag: 1,
        created_by: userId,
        created_at: trx.fn.now(),
        updated_by: userId,
        updated_at: trx.fn.now(),
      });
    }

    // Insert employment history
    for (const history of driver.history) {
      const historyId = await generateHistoryId(trx);

      await trx("driver_history_information").insert({
        driver_history_id: historyId,
        driver_id: driverId,
        employer: history.employer || null,
        employment_status: history.employmentStatus || null,
        from_date: history.fromDate || null,
        to_date: history.toDate || null,
        job_title: history.jobTitle || null,
        status: "ACTIVE",
        created_by: userId,
        created_at: trx.fn.now(),
        updated_by: userId,
        updated_at: trx.fn.now(),
      });
    }

    // Insert accident/violation records
    for (const accident of driver.accidents) {
      const accidentId = await generateAccidentId(trx);

      await trx("driver_accident_violation").insert({
        driver_violation_id: accidentId,
        driver_id: driverId,
        type: accident.type || null,
        description: accident.description || null,
        date: accident.date || null,
        vehicle_regn_number: accident.vehicleRegistrationNumber || null,
        status: "ACTIVE",
        created_by: userId,
        created_at: trx.fn.now(),
        updated_by: userId,
        updated_at: trx.fn.now(),
      });
    }

    return driverId;
  } catch (error) {
    console.error("Error creating driver from bulk data:", error);
    throw error;
  }
}

/**
 * Process driver bulk upload
 */
async function processDriverBulkUpload(job, io) {
  const { batchId, filePath, userId } = job.data;

  console.log("Processing driver bulk upload batch:", batchId);

  try {
    // Emit progress only if Socket.IO is available
    if (io) {
      io.to(`batch:${batchId}`).emit("bulkUploadProgress", {
        progress: 10,
        message: "Starting file processing...",
        type: "info",
      });
    }

    // Parse Excel file
    console.log("Parsing Excel file...");
    const drivers = await parseDriverExcel(filePath);
    console.log(`Found ${drivers.length} driver(s)`);

    await knex("tms_driver_bulk_upload_batches")
      .where({ batch_id: batchId })
      .update({ total_rows: drivers.length });

    if (io) {
      io.to(`batch:${batchId}`).emit("bulkUploadProgress", {
        progress: 30,
        message: `Parsed ${drivers.length} driver(s)`,
        type: "success",
      });
    }

    // Validate data
    console.log("Validating data...");
    const validDrivers = [];
    const invalidDrivers = [];

    // Step 1: Basic validation (format, required fields)
    for (const driver of drivers) {
      const errors = validateDriverData(driver);
      if (errors.length === 0) {
        validDrivers.push(driver);
      } else {
        invalidDrivers.push({ driver, errors });
      }
    }

    console.log(
      `Basic validation: ${validDrivers.length} valid, ${invalidDrivers.length} invalid`
    );

    // Step 2: Check for duplicates within the batch itself
    const batchDuplicates = checkBatchDuplicates(validDrivers);

    // Move drivers with batch duplicates to invalid list
    const finalValidDrivers = [];
    for (const driver of validDrivers) {
      if (batchDuplicates[driver.refId]) {
        invalidDrivers.push({
          driver,
          errors: batchDuplicates[driver.refId],
        });
      } else {
        finalValidDrivers.push(driver);
      }
    }

    console.log(
      `After batch duplicate check: ${finalValidDrivers.length} valid, ${invalidDrivers.length} invalid`
    );

    // Step 3: Check for duplicates in database
    console.log("Checking database for duplicates...");
    const dbDuplicates = await checkDatabaseDuplicates(finalValidDrivers);

    // Move drivers with database duplicates to invalid list
    const trulyValidDrivers = [];
    for (const driver of finalValidDrivers) {
      if (dbDuplicates[driver.refId]) {
        invalidDrivers.push({
          driver,
          errors: dbDuplicates[driver.refId],
        });
      } else {
        trulyValidDrivers.push(driver);
      }
    }

    console.log(
      `Final validation: ${trulyValidDrivers.length} valid, ${invalidDrivers.length} invalid`
    );

    if (io) {
      io.to(`batch:${batchId}`).emit("bulkUploadProgress", {
        progress: 60,
        message: `Validation complete: ${trulyValidDrivers.length} valid, ${invalidDrivers.length} invalid`,
        type: invalidDrivers.length > 0 ? "warning" : "success",
      });
    }

    // Generate error report if there are invalid drivers
    let errorReportPath = null;
    if (invalidDrivers.length > 0) {
      console.log("Generating error report...");
      errorReportPath = await generateDriverErrorReport(
        invalidDrivers,
        batchId
      );
      console.log(`Error report saved: ${errorReportPath}`);
    }

    // Store results
    for (const driver of trulyValidDrivers) {
      await knex("tms_driver_bulk_upload_drivers").insert({
        batch_id: batchId,
        driver_ref_id: driver.refId,
        excel_row_number: 0, // TODO: Track actual row number
        validation_status: "valid",
        validation_errors: JSON.stringify([]),
        data: JSON.stringify(driver),
      });
    }

    for (const item of invalidDrivers) {
      await knex("tms_driver_bulk_upload_drivers").insert({
        batch_id: batchId,
        driver_ref_id: item.driver.refId,
        excel_row_number: 0,
        validation_status: "invalid",
        validation_errors: JSON.stringify(item.errors),
        data: JSON.stringify(item.driver),
      });
    }

    if (io) {
      io.to(`batch:${batchId}`).emit("bulkUploadProgress", {
        progress: 70,
        message: `Stored validation results. Creating ${trulyValidDrivers.length} driver(s)...`,
        type: "info",
      });
    }

    // Create drivers from valid data
    console.log(
      `Creating ${trulyValidDrivers.length} driver(s) in database...`
    );
    const creationResults = { success: [], failed: [] };

    for (let i = 0; i < trulyValidDrivers.length; i++) {
      const driver = trulyValidDrivers[i];

      try {
        // Use transaction for each driver creation
        const createdDriverId = await knex.transaction(async (trx) => {
          return await createDriverFromBulkData(driver, userId, trx);
        });

        // Update the bulk upload record with created driver ID
        await knex("tms_driver_bulk_upload_drivers")
          .where({ batch_id: batchId, driver_ref_id: driver.refId })
          .update({ created_driver_id: createdDriverId });

        creationResults.success.push({
          refId: driver.refId,
          driverId: createdDriverId,
        });

        console.log(
          `✅ Created driver ${createdDriverId} from ref ${driver.refId}`
        );

        // Emit progress for driver creation (only if Socket.IO available)
        if (io) {
          const creationProgress =
            70 + Math.round(((i + 1) / trulyValidDrivers.length) * 20); // 70% to 90%
          io.to(`batch:${batchId}`).emit("bulkUploadProgress", {
            progress: creationProgress,
            message: `Created ${i + 1} of ${
              trulyValidDrivers.length
            } driver(s)`,
            type: "success",
          });
        }
      } catch (error) {
        console.error(
          `❌ Failed to create driver from ref ${driver.refId}:`,
          error.message
        );
        console.error("Full error details:", error);
        console.error("Stack trace:", error.stack);

        creationResults.failed.push({
          refId: driver.refId,
          error: error.message,
        });

        // Mark as invalid (creation failed) - validation_status only accepts 'valid' or 'invalid'
        await knex("tms_driver_bulk_upload_drivers")
          .where({ batch_id: batchId, driver_ref_id: driver.refId })
          .update({
            validation_status: "invalid", // Can't use 'creation_failed', only 'valid' or 'invalid' allowed
            validation_errors: JSON.stringify([
              `Creation failed: ${error.message}`,
            ]),
          });
      }
    }

    console.log(
      `Driver creation complete: ${creationResults.success.length} created, ${creationResults.failed.length} failed`
    );

    if (io) {
      io.to(`batch:${batchId}`).emit("bulkUploadProgress", {
        progress: 90,
        message: `Created ${creationResults.success.length} driver(s). ${
          creationResults.failed.length > 0
            ? creationResults.failed.length + " creation failed."
            : ""
        }`,
        type: creationResults.failed.length > 0 ? "warning" : "success",
      });
    }

    // Update batch status
    await knex("tms_driver_bulk_upload_batches")
      .where({ batch_id: batchId })
      .update({
        total_valid: trulyValidDrivers.length,
        total_invalid: invalidDrivers.length,
        total_created: creationResults.success.length,
        total_creation_failed: creationResults.failed.length,
        error_report_path: errorReportPath, // Save error report path
        status: "completed",
        processed_timestamp: knex.fn.now(),
      });

    if (io) {
      io.to(`batch:${batchId}`).emit("bulkUploadProgress", {
        progress: 100,
        message: "Processing complete!",
        type: "success",
      });

      io.to(`batch:${batchId}`).emit("validationComplete", {
        batchId,
        validationResults: {
          valid: trulyValidDrivers.length,
          invalid: invalidDrivers.length,
          created: creationResults.success.length,
          creationFailed: creationResults.failed.length,
          hasErrors:
            invalidDrivers.length > 0 || creationResults.failed.length > 0,
        },
      });
    }

    // Clean up file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return {
      success: true,
      validCount: trulyValidDrivers.length,
      invalidCount: invalidDrivers.length,
      createdCount: creationResults.success.length,
      creationFailedCount: creationResults.failed.length,
    };
  } catch (error) {
    console.error("Error processing driver batch:", batchId, error);

    await knex("tms_driver_bulk_upload_batches")
      .where({ batch_id: batchId })
      .update({
        status: "failed",
        processed_timestamp: knex.fn.now(),
      });

    if (io) {
      io.to(`batch:${batchId}`).emit("bulkUploadProgress", {
        progress: 0,
        message: `Error: ${error.message}`,
        type: "error",
      });
    }

    throw error;
  }
}

module.exports = { processDriverBulkUpload };
