/**
 * Consignor Controller
 * Handles HTTP requests and responses for consignor endpoints
 * Delegates business logic to consignorService
 */

const consignorService = require("../services/consignorService");
const {
  successResponse,
  validationErrorResponse,
  databaseErrorResponse,
  notFoundResponse,
  internalServerErrorResponse,
  getPaginationMeta,
} = require("../utils/responseHelper");

/**
 * GET /api/consignors
 * Get list of consignors with filters, search, and pagination
 */
const getConsignors = async (req, res) => {
  try {
    console.log("\n📋 ===== GET CONSIGNORS LIST =====");
    console.log("Query params:", req.query);

    const result = await consignorService.getConsignorList(req.query);

    console.log(`✅ Retrieved ${result.data.length} consignors`);
    return successResponse(res, result.data, result.meta, 200);
  } catch (error) {
    console.error("❌ Get consignors error:", error);

    if (error.type === "VALIDATION_ERROR") {
      return validationErrorResponse(res, { details: error.details });
    }

    return internalServerErrorResponse(res, error);
  }
};

/**
 * GET /api/consignors/:id
 * Get consignor details by customer ID
 */
const getConsignorById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`\n📄 ===== GET CONSIGNOR BY ID: ${id} =====`);

    const consignor = await consignorService.getConsignorById(id);

    console.log("✅ Consignor retrieved successfully");
    return successResponse(res, consignor, null, 200);
  } catch (error) {
    console.error("❌ Get consignor by ID error:", error);

    if (error.type === "NOT_FOUND") {
      return notFoundResponse(res, "Consignor", req.params.id);
    }

    return internalServerErrorResponse(res, error);
  }
};

/**
 * POST /api/consignors
 * Create new consignor with contacts, organization, and documents
 */
const createConsignor = async (req, res) => {
  try {
    console.log("\n➕ ===== CREATE CONSIGNOR =====");
    console.log("User ID:", req.user.user_id);

    // Parse JSON payload from body field (for multipart/form-data)
    let payload = req.body;
    if (req.body.payload && typeof req.body.payload === "string") {
      try {
        payload = JSON.parse(req.body.payload);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        return validationErrorResponse(res, {
          details: [
            {
              field: "payload",
              message: "Invalid JSON format in payload field",
            },
          ],
        });
      }
    }

    console.log("Payload:", JSON.stringify(payload, null, 2));

    // 🔍 DETAILED FILE DEBUG LOGGING
    console.log("\n🔍 ===== FILE DEBUG INFO =====");
    console.log("req.files type:", typeof req.files);
    console.log("req.files is array?", Array.isArray(req.files));
    console.log("req.files exists?", !!req.files);

    if (req.files) {
      if (Array.isArray(req.files)) {
        console.log(`📎 Total files received: ${req.files.length}`);
        req.files.forEach((file, idx) => {
          console.log(`  File ${idx}:`);
          console.log(`    - fieldname: ${file.fieldname}`);
          console.log(`    - originalname: ${file.originalname}`);
          console.log(`    - mimetype: ${file.mimetype}`);
          console.log(`    - size: ${file.size} bytes`);
          console.log(`    - buffer exists: ${!!file.buffer}`);
        });
      } else {
        console.log("req.files keys:", Object.keys(req.files));
      }
    } else {
      console.log("❌ No files received!");
    }
    console.log("===========================\n");

    // Convert array to object keyed by fieldname for easier access
    const filesObj = {};
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file) => {
        filesObj[file.fieldname] = file;
      });
      console.log("📦 Files object created with keys:", Object.keys(filesObj));
    }

    const consignor = await consignorService.createConsignor(
      payload,
      filesObj,
      req.user.user_id
    );

    console.log("✅ Consignor created successfully");

    // Extract approval info if present
    if (consignor.approvalInfo) {
      const { approvalInfo, ...consignorData } = consignor;

      return res.status(201).json({
        success: true,
        data: {
          ...consignorData,
          userId: approvalInfo.userId,
          userEmail: approvalInfo.userEmail,
          initialPassword: approvalInfo.initialPassword,
          message:
            "Consignor created successfully. Consignor Admin user created and pending approval.",
          approvalStatus: approvalInfo.approvalStatus,
          pendingWith: approvalInfo.pendingWith,
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Fallback for backward compatibility (if no approval info)
    return successResponse(res, consignor, null, 201);
  } catch (error) {
    console.error("❌ Create consignor error:", error);

    if (error.type === "VALIDATION_ERROR") {
      return validationErrorResponse(res, { details: error.details });
    }

    if (error.errno || error.code) {
      return databaseErrorResponse(res, error);
    }

    return internalServerErrorResponse(res, error);
  }
};

/**
 * PUT /api/consignors/:id
 * Update existing consignor (full or partial update)
 */
const updateConsignor = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`\n✏️  ===== UPDATE CONSIGNOR: ${id} =====`);
    console.log("User ID:", req.user.user_id);

    // Parse JSON payload from body field (for multipart/form-data)
    let payload = req.body;
    if (req.body.payload && typeof req.body.payload === "string") {
      try {
        payload = JSON.parse(req.body.payload);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        return validationErrorResponse(res, {
          details: [
            {
              field: "payload",
              message: "Invalid JSON format in payload field",
            },
          ],
        });
      }
    }

    console.log("Payload:", JSON.stringify(payload, null, 2));
    console.log("Files:", req.files ? Object.keys(req.files) : "No files");

    const consignor = await consignorService.updateConsignor(
      id,
      payload,
      req.files || {},
      req.user.user_id,
      req.user.role // Pass user role for permission checks
    );

    console.log("✅ Consignor updated successfully");
    return successResponse(res, consignor, null, 200);
  } catch (error) {
    console.error("❌ Update consignor error:", error);

    if (error.type === "NOT_FOUND") {
      return notFoundResponse(res, "Consignor", req.params.id);
    }

    if (error.type === "FORBIDDEN") {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: error.message,
        },
        timestamp: new Date().toISOString(),
      });
    }

    if (error.type === "VALIDATION_ERROR") {
      return validationErrorResponse(res, { details: error.details });
    }

    if (error.errno || error.code) {
      return databaseErrorResponse(res, error);
    }

    return internalServerErrorResponse(res, error);
  }
};

/**
 * DELETE /api/consignors/:id
 * Soft delete consignor (sets status to INACTIVE)
 */
const deleteConsignor = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`\n🗑️  ===== DELETE CONSIGNOR: ${id} =====`);
    console.log("User ID:", req.user.user_id);

    const result = await consignorService.deleteConsignor(id, req.user.user_id);

    console.log("✅ Consignor deleted successfully");
    return successResponse(res, result, null, 200);
  } catch (error) {
    console.error("❌ Delete consignor error:", error);

    if (error.type === "NOT_FOUND") {
      return notFoundResponse(res, "Consignor", req.params.id);
    }

    return internalServerErrorResponse(res, error);
  }
};

/**
 * GET /api/consignors/master-data
 * Get master data for dropdowns (industries, currencies, document types)
 */
const getMasterData = async (req, res) => {
  try {
    console.log("\n📊 ===== GET MASTER DATA =====");

    const masterData = await consignorService.getMasterData();

    console.log("✅ Master data retrieved successfully");
    return successResponse(res, masterData, null, 200);
  } catch (error) {
    console.error("❌ Get master data error:", error);
    return internalServerErrorResponse(res, error);
  }
};

/**
 * GET /api/consignors/:customerId/documents/:documentId/download
 * Download a consignor document file
 */
const downloadDocument = async (req, res) => {
  try {
    const { customerId, documentId } = req.params;
    console.log(`\n📥 ===== DOWNLOAD DOCUMENT =====`);
    console.log("Customer ID:", customerId);
    console.log("Document ID:", documentId);

    const file = await consignorService.getDocumentFile(customerId, documentId);

    if (!file) {
      console.log("❌ Document not found");
      return notFoundResponse(res, "Document", documentId);
    }

    // Set headers for file download
    res.setHeader("Content-Type", file.mimeType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${file.fileName}"`
    );
    res.setHeader("Content-Length", file.buffer.length);

    console.log("✅ Document sent successfully");
    return res.send(file.buffer);
  } catch (error) {
    console.error("❌ Download document error:", error);
    return internalServerErrorResponse(res, error);
  }
};

/**
 * GET /api/consignors/:customerId/contacts/:contactId/photo
 * Download a contact photo
 */
const downloadContactPhoto = async (req, res) => {
  try {
    const { customerId, contactId } = req.params;
    console.log(`\n📸 ===== DOWNLOAD CONTACT PHOTO =====`);
    console.log("Customer ID:", customerId);
    console.log("Contact ID:", contactId);

    const file = await consignorService.getContactPhoto(customerId, contactId);

    if (!file) {
      console.log("❌ Photo not found");
      return notFoundResponse(res, "Contact Photo", contactId);
    }

    // Set headers for inline display (not download)
    res.setHeader("Content-Type", file.mimeType);
    res.setHeader("Content-Disposition", `inline; filename="${file.fileName}"`);
    res.setHeader("Content-Length", file.buffer.length);
    res.setHeader("Cache-Control", "public, max-age=31536000"); // Cache for 1 year

    console.log("✅ Photo sent successfully");
    return res.send(file.buffer);
  } catch (error) {
    console.error("❌ Download photo error:", error);
    return internalServerErrorResponse(res, error);
  }
};

/**
 * GET /api/consignors/:customerId/general/:fileType/download
 * Download NDA or MSA document
 * fileType: 'nda' | 'msa'
 */
const downloadGeneralDocument = async (req, res) => {
  try {
    const { customerId, fileType } = req.params;
    console.log(`\n📄 ===== DOWNLOAD GENERAL DOCUMENT =====`);
    console.log("Customer ID:", customerId);
    console.log("File Type:", fileType);

    if (!["nda", "msa"].includes(fileType.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_FILE_TYPE",
          message: 'File type must be either "nda" or "msa"',
        },
      });
    }

    const file = await consignorService.getGeneralDocument(
      customerId,
      fileType
    );

    if (!file) {
      console.log("❌ Document not found");
      return notFoundResponse(
        res,
        `${fileType.toUpperCase()} Document`,
        customerId
      );
    }

    // Set headers for file download
    res.setHeader("Content-Type", file.mimeType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${file.fileName}"`
    );
    res.setHeader("Content-Length", file.buffer.length);

    console.log("✅ Document sent successfully");
    return res.send(file.buffer);
  } catch (error) {
    console.error("❌ Download general document error:", error);
    return internalServerErrorResponse(res, error);
  }
};

/**
 * GET /api/consignors/:customerId/warehouses
 * Get list of warehouses mapped to a consignor with filters
 */
const getConsignorWarehouses = async (req, res) => {
  try {
    const { customerId } = req.params;
    console.log(`\n🏭 ===== GET CONSIGNOR WAREHOUSES: ${customerId} =====`);
    console.log("Query params:", req.query);

    const result = await consignorService.getConsignorWarehouses(
      customerId,
      req.query
    );

    console.log(`✅ Retrieved ${result.data.length} warehouses`);
    return successResponse(res, result.data, result.meta, 200);
  } catch (error) {
    console.error("❌ Get consignor warehouses error:", error);
    return internalServerErrorResponse(res, error);
  }
};

// ==================== DRAFT WORKFLOW FUNCTIONS ====================

/**
 * POST /api/consignors/save-draft
 * Save consignor as draft with minimal validation (business_name only)
 * Status: SAVE_AS_DRAFT
 */
const saveConsignorAsDraft = async (req, res) => {
  const db = require("../config/database");

  try {
    console.log("\n💾 ===== SAVE CONSIGNOR AS DRAFT =====");
    console.log("User ID:", req.user.user_id);

    // Parse JSON payload
    let payload = req.body;
    if (req.body.payload && typeof req.body.payload === "string") {
      try {
        payload = JSON.parse(req.body.payload);
      } catch (parseError) {
        return validationErrorResponse(res, {
          details: [{ field: "payload", message: "Invalid JSON format" }],
        });
      }
    }

    // Extract customer_name from general section (frontend sends nested structure)
    const customerName =
      payload.general?.customer_name ||
      payload.customer_name ||
      payload.business_name;

    // ✅ MINIMAL VALIDATION - only customer_name required
    if (!customerName || customerName.trim().length < 2) {
      return validationErrorResponse(res, {
        details: [
          {
            field: "general.customer_name",
            message: "Customer name is required (minimum 2 characters)",
          },
        ],
      });
    }

    // Generate consignor ID with collision resistance
    const generateConsignorId = async (trx) => {
      let attempts = 0;
      const maxAttempts = 100;

      // First, find the highest valid CON#### ID in the database
      const allConsignors = await trx("consignor_basic_information")
        .select("customer_id")
        .where("customer_id", "like", "CON%")
        .orderBy("customer_id", "desc");

      let maxNumber = 0;

      // Parse all CON#### IDs to find the maximum number
      for (const consignor of allConsignors) {
        const id = consignor.customer_id;
        if (id && id.startsWith("CON") && id.length === 7) {
          const numericPart = id.substring(3);
          const parsedNumber = parseInt(numericPart, 10);

          if (!isNaN(parsedNumber) && parsedNumber > maxNumber) {
            maxNumber = parsedNumber;
          }
        }
      }

      console.log(`  📊 Highest existing CON ID number: ${maxNumber}`);

      // Start from max + 1 and try to find an available ID
      while (attempts < maxAttempts) {
        const nextNumber = maxNumber + 1 + attempts;
        const newId = `CON${nextNumber.toString().padStart(4, "0")}`;

        console.log(
          `  🔍 Checking consignor ID: ${newId} (attempt ${attempts + 1})`
        );

        // Check if this ID already exists in database
        const existsInDb = await trx("consignor_basic_information")
          .where("customer_id", newId)
          .first();

        if (!existsInDb) {
          console.log(`  ✅ Consignor ID ${newId} is unique`);
          return newId;
        }

        console.log(
          `  ❌ Consignor ID ${newId} already exists, trying next...`
        );
        attempts++;
      }

      throw new Error(
        "Failed to generate unique consignor ID after 100 attempts"
      );
    };

    const result = await db.transaction(async (trx) => {
      const customerId = await generateConsignorId(trx);

      // Extract general information fields
      const general = payload.general || {};

      // Insert consignor basic information with status SAVE_AS_DRAFT
      await trx("consignor_basic_information").insert({
        customer_id: customerId,
        customer_name: customerName.trim(),
        search_term: general.search_term || customerName.trim(), // Default to customer_name if not provided
        industry_type: general.industry_type || "GENERAL", // Default value
        currency_type: general.currency_type || null,
        payment_term: general.payment_term || "NET30", // Default value
        website_url: general.website_url || null,
        remark: general.remark || null,
        name_on_po: general.name_on_po || null,
        approved_by: general.approved_by || null,
        approved_date: general.approved_date || null,
        upload_nda: null, // File uploads handled separately
        upload_msa: null, // File uploads handled separately
        address_id: general.address_id || null,
        status: "SAVE_AS_DRAFT",
        created_by: req.user.user_id,
        created_at: new Date(),
        updated_by: req.user.user_id,
        updated_at: new Date(),
      });

      // Optional: Insert contacts if provided
      if (payload.contacts && Array.isArray(payload.contacts)) {
        for (let i = 0; i < payload.contacts.length; i++) {
          const contact = payload.contacts[i];
          if (contact.contact_name || contact.name) {
            // ✅ Generate unique contact ID in format: CON##### (max 10 chars)
            // Find the highest existing numeric ID and increment from there
            const generateUniqueContactId = async () => {
              let attempts = 0;
              const maxAttempts = 10;

              // Get all existing contact IDs to find the max numeric value
              const existingIds = await trx("contact").select("contact_id");

              let maxNumericId = 0;
              if (existingIds && existingIds.length > 0) {
                maxNumericId = Math.max(
                  ...existingIds.map((row) => {
                    const numPart = row.contact_id.replace("CON", "");
                    return parseInt(numPart) || 0;
                  })
                );
              }

              while (attempts < maxAttempts) {
                const nextId = maxNumericId + 1 + attempts;
                const contactId = `CON${nextId.toString().padStart(5, "0")}`;

                // Double-check ID doesn't exist (should be unique on first try)
                const existing = await trx("contact")
                  .where("contact_id", contactId)
                  .first();

                if (!existing) {
                  return contactId;
                }
                attempts++;
              }

              throw new Error("Failed to generate unique contact ID");
            };

            const contactId = await generateUniqueContactId();

            await trx("contact").insert({
              contact_id: contactId,
              customer_id: customerId,
              contact_name: contact.contact_name || contact.name,
              contact_designation:
                contact.contact_designation || contact.designation || "N/A", // Required field
              contact_number:
                contact.contact_number ||
                contact.phone_number ||
                contact.phone ||
                null,
              email_id: contact.email_id || contact.email || null,
              contact_role: contact.contact_role || contact.role || null,
              contact_team: contact.contact_team || contact.team || null,
              country_code: contact.country_code || null,
              linkedin_link: contact.linkedin_link || null,
              contact_photo: null, // File uploads handled separately
              status: "Active", // ✅ FIX: Changed from "SAVE_AS_DRAFT" (15 chars) to "DRAFT" (5 chars) to fit varchar(10) constraint
              created_by: req.user.user_id,
              created_at: new Date(),
              updated_by: req.user.user_id,
              updated_at: new Date(),
            });
          }
        }
      }

      // Optional: Insert organization details if provided (and both required fields are present)
      if (payload.organization) {
        const org = payload.organization;
        // Only insert if BOTH company_code AND business_area are provided (both are required in schema)
        if (org.company_code && org.business_area) {
          // Convert business_area array to JSON string for database storage
          const businessAreaJson = Array.isArray(org.business_area)
            ? JSON.stringify(org.business_area)
            : org.business_area;

          await trx("consignor_organization").insert({
            customer_id: customerId,
            company_code: org.company_code,
            business_area: businessAreaJson,
            status: "Active", // ✅ FIX: Changed from "SAVE_AS_DRAFT" (15 chars) to "DRAFT" (5 chars) to fit varchar(10) constraint
            created_by: req.user.user_id,
            created_at: new Date(),
            updated_by: req.user.user_id,
            updated_at: new Date(),
          });
        }
      }

      return { customerId };
    });

    console.log("✅ Consignor draft saved successfully");
    return res.status(201).json({
      success: true,
      data: { customerId: result.customerId, status: "SAVE_AS_DRAFT" },
      message: "Consignor saved as draft successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Save consignor draft error:", error);
    return internalServerErrorResponse(res, error);
  }
};

/**
 * PUT /api/consignors/:id/update-draft
 * Update consignor draft with NO validation
 * Only allows updating drafts created by current user
 */
const updateConsignorDraft = async (req, res) => {
  const db = require("../config/database");

  try {
    const { id } = req.params;
    console.log(`\n✏️  ===== UPDATE CONSIGNOR DRAFT: ${id} =====`);
    console.log("User ID:", req.user.user_id);

    // Parse JSON payload
    let payload = req.body;
    if (req.body.payload && typeof req.body.payload === "string") {
      try {
        payload = JSON.parse(req.body.payload);
      } catch (parseError) {
        return validationErrorResponse(res, {
          details: [{ field: "payload", message: "Invalid JSON format" }],
        });
      }
    }

    console.log("📦 Payload structure:", JSON.stringify(payload, null, 2));

    // Extract data from nested structure (frontend sends { general, contacts, organization, documents })
    const generalData = payload.general || payload;
    const contactsData = payload.contacts || [];
    const organizationData = payload.organization || {};

    const result = await db.transaction(async (trx) => {
      // Check if consignor exists and is a draft
      const existing = await trx("consignor_basic_information")
        .where({ customer_id: id })
        .first();

      if (!existing) {
        throw { type: "NOT_FOUND", message: "Consignor not found" };
      }

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

      // Update consignor general information (NO VALIDATION)
      const updateFields = {};

      if (generalData.customer_name !== undefined)
        updateFields.customer_name = generalData.customer_name;
      if (generalData.search_term !== undefined)
        updateFields.search_term = generalData.search_term;
      if (generalData.industry_type !== undefined)
        updateFields.industry_type = generalData.industry_type;
      if (generalData.currency_type !== undefined)
        updateFields.currency_type = generalData.currency_type;
      if (generalData.payment_term !== undefined)
        updateFields.payment_term = generalData.payment_term;
      if (generalData.website_url !== undefined)
        updateFields.website_url = generalData.website_url;
      if (generalData.remark !== undefined)
        updateFields.remark = generalData.remark;
      if (generalData.name_on_po !== undefined)
        updateFields.name_on_po = generalData.name_on_po;

      updateFields.updated_by = req.user.user_id;
      updateFields.updated_at = new Date();

      await trx("consignor_basic_information")
        .where({ customer_id: id })
        .update(updateFields);

      // Update contacts if provided (delete & re-insert)
      if (
        contactsData &&
        Array.isArray(contactsData) &&
        contactsData.length > 0
      ) {
        // Delete existing contacts
        await trx("contact").where({ customer_id: id }).del();

        // Generate unique contact ID helper (same as saveConsignorAsDraft)
        const generateUniqueContactId = async () => {
          let attempts = 0;
          const maxAttempts = 10;

          // Get all existing contact IDs to find the max numeric value
          const existingIds = await trx("contact").select("contact_id");

          let maxNumericId = 0;
          if (existingIds && existingIds.length > 0) {
            maxNumericId = Math.max(
              ...existingIds.map((row) => {
                const numPart = row.contact_id.replace("CON", "");
                return parseInt(numPart) || 0;
              })
            );
          }

          while (attempts < maxAttempts) {
            const nextId = maxNumericId + 1 + attempts;
            const contactId = `CON${nextId.toString().padStart(5, "0")}`;

            // Double-check ID doesn't exist
            const existing = await trx("contact")
              .where("contact_id", contactId)
              .first();

            if (!existing) {
              return contactId;
            }
            attempts++;
          }

          throw new Error("Failed to generate unique contact ID");
        };

        // Insert new contacts
        for (const contact of contactsData) {
          if (contact.contact_name || contact.name) {
            const contactId = await generateUniqueContactId();

            await trx("contact").insert({
              contact_id: contactId,
              customer_id: id,
              contact_name: contact.contact_name || contact.name,
              contact_designation:
                contact.contact_designation || contact.designation || "N/A",
              contact_number:
                contact.contact_number ||
                contact.phone_number ||
                contact.phone ||
                contact.number ||
                null,
              email_id: contact.email_id || contact.email || null,
              contact_role: contact.contact_role || contact.role || null,
              contact_team: contact.contact_team || contact.team || null,
              country_code: contact.country_code || null,
              linkedin_link: contact.linkedin_link || null,
              contact_photo: null,
              status: "Active",
              created_by: req.user.user_id,
              created_at: new Date(),
              updated_by: req.user.user_id,
              updated_at: new Date(),
            });
          }
        }
      }

      // Update organization if provided
      if (organizationData && Object.keys(organizationData).length > 0) {
        const existingOrg = await trx("consignor_organization")
          .where({ customer_id: id })
          .first();

        const orgUpdateFields = {};
        if (organizationData.company_code !== undefined)
          orgUpdateFields.company_code = organizationData.company_code;
        if (organizationData.business_area !== undefined) {
          // Convert business_area array to JSON string for database storage
          orgUpdateFields.business_area = Array.isArray(
            organizationData.business_area
          )
            ? JSON.stringify(organizationData.business_area)
            : organizationData.business_area;
        }
        orgUpdateFields.updated_by = req.user.user_id;
        orgUpdateFields.updated_at = new Date();

        if (existingOrg) {
          // Update existing
          await trx("consignor_organization")
            .where({ customer_id: id })
            .update(orgUpdateFields);
        } else if (organizationData.company_code) {
          // Insert new - ensure business_area is JSON string
          const businessAreaJson = Array.isArray(organizationData.business_area)
            ? JSON.stringify(organizationData.business_area)
            : organizationData.business_area || null;

          await trx("consignor_organization").insert({
            customer_id: id,
            company_code: organizationData.company_code,
            business_area: businessAreaJson,
            status: "Active",
            created_by: req.user.user_id,
            created_at: new Date(),
            updated_by: req.user.user_id,
            updated_at: new Date(),
          });
        }
      }

      // Update documents if provided (metadata updates only, no file uploads in draft mode)
      const documentsData = payload.documents || [];
      if (
        documentsData &&
        Array.isArray(documentsData) &&
        documentsData.length > 0
      ) {
        console.log(
          `📄 Processing ${documentsData.length} document metadata updates...`
        );

        // Helper to generate unique document ID
        const generateDocumentId = async () => {
          let attempts = 0;
          const maxAttempts = 10;

          // Get all existing document IDs to find the max numeric value
          const existingIds = await trx("consignor_documents").select(
            "document_unique_id"
          );

          let maxNumericId = 0;
          existingIds.forEach((row) => {
            const match = row.document_unique_id?.match(/^CDOC(\d+)$/);
            if (match) {
              const numericPart = parseInt(match[1], 10);
              if (numericPart > maxNumericId) {
                maxNumericId = numericPart;
              }
            }
          });

          while (attempts < maxAttempts) {
            const nextId = maxNumericId + 1 + attempts;
            const newId = `CDOC${nextId.toString().padStart(5, "0")}`;

            const exists = await trx("consignor_documents")
              .where({ document_unique_id: newId })
              .first();

            if (!exists) {
              return newId;
            }
            attempts++;
          }

          throw new Error("Failed to generate unique document ID");
        };

        // Delete existing documents for this consignor
        await trx("consignor_documents").where({ customer_id: id }).del();

        // Re-insert documents with updated metadata
        for (const doc of documentsData) {
          // Only process if document has required fields
          if (doc.documentType && doc.documentNumber && doc.validFrom) {
            const documentUniqueId = await generateDocumentId();

            // Build insert object conditionally
            const insertData = {
              document_unique_id: documentUniqueId,
              customer_id: id,
              document_type_id: doc.documentType, // Frontend sends "documentType"
              document_number: doc.documentNumber,
              valid_from: doc.validFrom,
              valid_to: doc.validTo || null,
              status:
                doc.status === true || doc.status === "ACTIVE"
                  ? "ACTIVE"
                  : "DRAFT",
              created_by: req.user.user_id,
              created_at: new Date(),
              updated_by: req.user.user_id,
              updated_at: new Date(),
            };

            // Only include document_id if it exists (file was uploaded)
            if (doc.documentId) {
              insertData.document_id = doc.documentId;
            }

            await trx("consignor_documents").insert(insertData);

            console.log(
              `  ✅ Document saved: ${documentUniqueId} (${doc.documentType} - ${doc.documentNumber})`
            );
          }
        }
      }

      return { customerId: id };
    });

    // Handle early returns from transaction
    if (result.success === false) {
      return result;
    }

    console.log("✅ Consignor draft updated successfully");
    return res.status(200).json({
      success: true,
      data: { customerId: result.customerId, status: "DRAFT" },
      message: "Consignor draft updated successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Update consignor draft error:", error);

    if (error.type === "NOT_FOUND") {
      return notFoundResponse(res, "Consignor", id);
    }

    return internalServerErrorResponse(res, error);
  }
};

/**
 * PUT /api/consignors/:id/submit-draft
 * Submit consignor draft for approval (DRAFT → PENDING)
 * Performs FULL validation
 */
const submitConsignorFromDraft = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`\n🚀 ===== SUBMIT CONSIGNOR DRAFT: ${id} =====`);
    console.log("User ID:", req.user.user_id);

    // Parse JSON payload
    let payload = req.body;
    if (req.body.payload && typeof req.body.payload === "string") {
      try {
        payload = JSON.parse(req.body.payload);
      } catch (parseError) {
        return validationErrorResponse(res, {
          details: [{ field: "payload", message: "Invalid JSON format" }],
        });
      }
    }

    const db = require("../config/database");

    // Check if consignor exists and is a draft
    const existing = await db("consignor_basic_information")
      .where({ customer_id: id })
      .first();

    if (!existing) {
      return notFoundResponse(res, "Consignor", id);
    }

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

    // ✅ FULL VALIDATION (same as createConsignor)
    // Use the existing createConsignor service with validation
    // Then update status from ACTIVE to PENDING

    // For now, delegate to service layer with files
    const filesObj = {};
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file) => {
        filesObj[file.fieldname] = file;
      });
    }

    console.log("📦 Payload for submit:", JSON.stringify(payload, null, 2));

    // Update using service (which has full validation)
    const consignor = await consignorService.updateConsignor(
      id,
      payload,
      filesObj,
      req.user.user_id
    );

    // Change status from SAVE_AS_DRAFT to PENDING
    await db("consignor_basic_information").where({ customer_id: id }).update({
      status: "PENDING",
      updated_by: req.user.user_id,
      updated_at: new Date(),
    });

    // Update child records status to ACTIVE (using correct table name: contact)
    await db("contact").where({ customer_id: id }).update({
      status: "ACTIVE",
      updated_by: req.user.user_id,
      updated_at: new Date(),
    });

    // Update organization status if exists
    const orgExists = await db("consignor_organization")
      .where({ customer_id: id })
      .first();

    if (orgExists) {
      await db("consignor_organization").where({ customer_id: id }).update({
        status: "ACTIVE",
        updated_by: req.user.user_id,
        updated_at: new Date(),
      });
    }

    // ========================================
    // CREATE CONSIGNOR ADMIN USER & APPROVAL WORKFLOW (IF NOT EXISTS)
    // ========================================
    console.log(
      "📝 Checking for Consignor Admin user and approval workflow..."
    );

    // Check if Consignor Admin user already exists
    const existingUser = await db("user_master")
      .where("consignor_id", id)
      .where("user_type_id", "UT006") // Consignor Admin
      .first();

    let consignorAdminUserId = null;

    if (!existingUser) {
      // Generate user ID for Consignor Admin (format: CA0001, CA0002, etc.)
      const bcrypt = require("bcrypt");

      const lastUser = await db("user_master")
        .select("user_id")
        .where("user_id", "like", "CA%")
        .orderBy("user_id", "desc")
        .first();

      let userIdNumber = 1;
      if (lastUser && lastUser.user_id) {
        const lastNumber = parseInt(lastUser.user_id.substring(2));
        if (!isNaN(lastNumber)) {
          userIdNumber = lastNumber + 1;
        }
      }
      consignorAdminUserId = `CA${String(userIdNumber).padStart(4, "0")}`;

      console.log(`  Generated user ID: ${consignorAdminUserId}`);

      // Get creator details
      const creator = await db("user_master")
        .where("user_id", req.user.user_id)
        .first();
      const creatorName = creator?.user_full_name || "System";

      // Get consignor details for user creation
      const consignorDetails = await db("consignor_basic_information")
        .where("customer_id", id)
        .first();

      // Get primary contact for email/mobile
      const primaryContact = await db("contact")
        .where("customer_id", id)
        .orderBy("created_at", "asc")
        .first();

      const userEmail =
        primaryContact?.email_id || `${id.toLowerCase()}@consignor.com`;
      const userMobile = primaryContact?.contact_number || "0000000000";

      // Generate initial password
      const customerNameClean = consignorDetails.customer_name.replace(
        /[^a-zA-Z0-9]/g,
        ""
      );
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const initialPassword = `${customerNameClean}@${randomNum}`;
      const hashedPassword = await bcrypt.hash(initialPassword, 10);

      // Create user in user_master
      await db("user_master").insert({
        user_id: consignorAdminUserId,
        user_type_id: "UT006", // Consignor Admin
        user_full_name: `${consignorDetails.customer_name} - Admin`,
        email_id: userEmail,
        mobile_number: userMobile,
        consignor_id: id,
        is_active: false, // Inactive until approved
        created_by_user_id: req.user.user_id,
        password: hashedPassword,
        password_type: "initial",
        status: "Pending for Approval",
        created_by: req.user.user_id,
        updated_by: req.user.user_id,
        created_at: new Date(),
        updated_at: new Date(),
      });

      console.log(`  ✅ Created Consignor Admin user: ${consignorAdminUserId}`);
      console.log(
        `  🔑 Initial Password: ${initialPassword} (MUST BE SHARED SECURELY)`
      );
    } else {
      consignorAdminUserId = existingUser.user_id;
      console.log(
        `  ℹ️  Consignor Admin user already exists: ${consignorAdminUserId}`
      );
    }

    // Check if approval flow already exists
    const existingApprovalFlow = await db("approval_flow_trans")
      .where("user_id_reference_id", consignorAdminUserId)
      .where("approval_type_id", "AT002") // Consignor Admin
      .first();

    if (!existingApprovalFlow) {
      // Get approval configuration for Consignor Admin (Level 1)
      const approvalConfig = await db("approval_configuration")
        .where({
          approval_type_id: "AT002", // Consignor Admin
          approver_level: 1,
          status: "ACTIVE",
        })
        .first();

      if (!approvalConfig) {
        throw new Error(
          "Approval configuration not found for Consignor Admin. Please run migration to add AC0002."
        );
      }

      // Determine pending approver (Product Owner who did NOT create this)
      let pendingWithUserId = null;
      let pendingWithName = null;

      if (req.user.user_id === "PO001") {
        const po2 = await db("user_master").where("user_id", "PO002").first();
        pendingWithUserId = "PO002";
        pendingWithName = po2?.user_full_name || "Product Owner 2";
      } else if (req.user.user_id === "PO002") {
        const po1 = await db("user_master").where("user_id", "PO001").first();
        pendingWithUserId = "PO001";
        pendingWithName = po1?.user_full_name || "Product Owner 1";
      } else {
        // Default to PO001 if creator is neither
        const po1 = await db("user_master").where("user_id", "PO001").first();
        pendingWithUserId = "PO001";
        pendingWithName = po1?.user_full_name || "Product Owner 1";
      }

      // Generate approval flow trans ID (format: AF0001, AF0002, etc.)
      const lastApprovalFlow = await db("approval_flow_trans")
        .select("approval_flow_trans_id")
        .where("approval_flow_trans_id", "like", "AF%")
        .orderBy("approval_flow_trans_id", "desc")
        .first();

      let approvalFlowNumber = 1;
      if (lastApprovalFlow && lastApprovalFlow.approval_flow_trans_id) {
        const lastNumber = parseInt(
          lastApprovalFlow.approval_flow_trans_id.substring(2)
        );
        if (!isNaN(lastNumber)) {
          approvalFlowNumber = lastNumber + 1;
        }
      }
      const approvalFlowId = `AF${String(approvalFlowNumber).padStart(4, "0")}`;

      // Get creator details
      const creator = await db("user_master")
        .where("user_id", req.user.user_id)
        .first();
      const creatorName = creator?.user_full_name || "System";

      // Create approval flow transaction entry
      await db("approval_flow_trans").insert({
        approval_flow_trans_id: approvalFlowId,
        approval_config_id: approvalConfig.approval_config_id,
        approval_type_id: "AT002", // Consignor Admin
        user_id_reference_id: consignorAdminUserId,
        s_status: "Pending for Approval",
        approver_level: 1,
        pending_with_role_id: "RL001", // Product Owner role
        pending_with_user_id: pendingWithUserId,
        pending_with_name: pendingWithName,
        created_by_user_id: req.user.user_id,
        created_by_name: creatorName,
        created_by: req.user.user_id,
        updated_by: req.user.user_id,
        created_at: new Date(),
        updated_at: new Date(),
        status: "ACTIVE",
      });

      console.log(`  ✅ Created approval workflow: ${approvalFlowId}`);
      console.log(
        `  📧 Pending with: ${pendingWithName} (${pendingWithUserId})`
      );
    } else {
      console.log(
        `  ℹ️  Approval flow already exists: ${existingApprovalFlow.approval_flow_trans_id}`
      );
    }

    console.log("✅ Consignor draft submitted successfully");
    return res.status(200).json({
      success: true,
      data: { customerId: id, status: "PENDING" },
      message: "Consignor submitted for approval successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Submit consignor draft error:", error);

    if (error.type === "VALIDATION_ERROR") {
      return validationErrorResponse(res, { details: error.details });
    }

    if (error.type === "NOT_FOUND") {
      return notFoundResponse(res, "Consignor", req.params.id);
    }

    return internalServerErrorResponse(res, error);
  }
};

/**
 * DELETE /api/consignors/:id/delete-draft
 * Hard delete consignor draft (permanent removal)
 * Only allows deleting drafts created by current user
 */
const deleteConsignorDraft = async (req, res) => {
  const db = require("../config/database");

  try {
    const { id } = req.params;
    console.log(`\n🗑️  ===== DELETE CONSIGNOR DRAFT: ${id} =====`);
    console.log("User ID:", req.user.user_id);

    const result = await db.transaction(async (trx) => {
      // Check if consignor exists and is a draft
      const existing = await trx("consignor_basic_information")
        .where({ customer_id: id })
        .first();

      if (!existing) {
        throw { type: "NOT_FOUND", message: "Consignor not found" };
      }

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
      // 1. Delete document uploads
      const documentIds = await trx("consignor_documents")
        .where({ customer_id: id })
        .pluck("document_upload_file_id");

      if (documentIds.length > 0) {
        await trx("document_upload")
          .whereIn("upload_file_id", documentIds)
          .del();
      }

      // 2. Delete business areas
      await trx("consignor_business_area").where({ customer_id: id }).del();

      // 3. Delete contact photos
      const contactPhotoIds = await trx("consignor_contact_person")
        .where({ customer_id: id })
        .whereNotNull("photo_upload_file_id")
        .pluck("photo_upload_file_id");

      if (contactPhotoIds.length > 0) {
        await trx("document_upload")
          .whereIn("upload_file_id", contactPhotoIds)
          .del();
      }

      // 4. Delete contacts
      await trx("consignor_contact_person").where({ customer_id: id }).del();

      // 5. Delete documents table records
      await trx("consignor_documents").where({ customer_id: id }).del();

      // 6. Delete NDA/MSA files if they exist
      if (existing.nda_upload_file_id) {
        await trx("document_upload")
          .where({ upload_file_id: existing.nda_upload_file_id })
          .del();
      }
      if (existing.msa_upload_file_id) {
        await trx("document_upload")
          .where({ upload_file_id: existing.msa_upload_file_id })
          .del();
      }

      // 7. Finally, delete the main consignor record
      await trx("consignor_basic_information").where({ customer_id: id }).del();

      return { customerId: id };
    });

    // Handle early returns from transaction
    if (result.success === false) {
      return result;
    }

    console.log("✅ Consignor draft deleted successfully");
    return res.status(200).json({
      success: true,
      message: "Consignor draft deleted successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Delete consignor draft error:", error);

    if (error.type === "NOT_FOUND") {
      return notFoundResponse(res, "Consignor", req.params.id);
    }

    return internalServerErrorResponse(res, error);
  }
};

module.exports = {
  getConsignors,
  getConsignorById,
  createConsignor,
  updateConsignor,
  deleteConsignor,
  getMasterData,
  downloadDocument,
  downloadContactPhoto,
  downloadGeneralDocument,
  getConsignorWarehouses,
  // Draft workflow functions
  saveConsignorAsDraft,
  updateConsignorDraft,
  submitConsignorFromDraft,
  deleteConsignorDraft,
};
