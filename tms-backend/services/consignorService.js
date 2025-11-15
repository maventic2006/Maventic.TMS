/**
 * Consignor Service Layer
 * Handles all business logic, validations, and database transactions for consignor operations
 */

const knex = require('../config/database');
const { uploadFile, deleteFile } = require('../utils/storageService');
const {
  consignorCreateSchema,
  consignorUpdateSchema,
  listQuerySchema
} = require('../validation/consignorValidation');

/**
 * Generate unique contact ID
 */
const generateContactId = async (trx = knex) => {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const result = await trx('contact').count('* as count').first();
    const count = parseInt(result.count) + 1 + attempts;
    const newId = `CON${count.toString().padStart(5, '0')}`;

    const existing = await trx('contact').where('contact_id', newId).first();
    if (!existing) {
      return newId;
    }
    attempts++;
  }

  throw new Error('Failed to generate unique contact ID');
};

/**
 * Generate unique document ID
 */
const generateDocumentId = async (trx = knex) => {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const result = await trx('consignor_documents').count('* as count').first();
    const count = parseInt(result.count) + 1 + attempts;
    const newId = `CDOC${count.toString().padStart(5, '0')}`;

    const existing = await trx('consignor_documents')
      .where('document_unique_id', newId)
      .first();
    if (!existing) {
      return newId;
    }
    attempts++;
  }

  throw new Error('Failed to generate unique document ID');
};

/**
 * Generate unique document upload ID
 */
const generateDocumentUploadId = async (trx = knex) => {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    // Assuming document_upload table exists
    const result = await trx('document_upload').count('* as count').first();
    const count = parseInt(result.count) + 1 + attempts;
    const newId = `DU${count.toString().padStart(6, '0')}`;

    const existing = await trx('document_upload')
      .where('document_id', newId)
      .first();
    if (!existing) {
      return newId;
    }
    attempts++;
  }

  throw new Error('Failed to generate unique document upload ID');
};

/**
 * Check if customer ID is unique
 */
const isCustomerIdUnique = async (customerId, excludeUniqueId = null) => {
  const query = knex('consignor_basic_information')
    .where('customer_id', customerId);

  if (excludeUniqueId) {
    query.where('consignor_unique_id', '!=', excludeUniqueId);
  }

  const existing = await query.first();
  return !existing;
};

/**
 * Check if company code is unique
 */
const isCompanyCodeUnique = async (companyCode, excludeCustomerId = null) => {
  const query = knex('consignor_organization')
    .where('company_code', companyCode);

  if (excludeCustomerId) {
    query.where('customer_id', '!=', excludeCustomerId);
  }

  const existing = await query.first();
  return !existing;
};

/**
 * Get Consignor List with Filters, Search, Pagination
 */
const getConsignorList = async (queryParams) => {
  try {
    // Validate query parameters
    const { error, value } = listQuerySchema.validate(queryParams);
    if (error) {
      throw {
        type: 'VALIDATION_ERROR',
        details: error.details,
        message: 'Invalid query parameters'
      };
    }

    const {
      page,
      limit,
      search,
      customer_id,
      status,
      industry_type,
      currency_type,
      sortBy,
      sortOrder
    } = value;

    // Build base query with filters
    const baseQuery = knex('consignor_basic_information');

    // Apply filters
    if (customer_id) {
      baseQuery.where('customer_id', 'like', `%${customer_id}%`);
    }

    if (status) {
      baseQuery.where('status', status);
    }

    if (industry_type) {
      baseQuery.where('industry_type', 'like', `%${industry_type}%`);
    }

    if (currency_type) {
      baseQuery.where('currency_type', 'like', `%${currency_type}%`);
    }

    // Apply search (searches across customer_id, customer_name, search_term)
    if (search) {
      baseQuery.where(function () {
        this.where('customer_id', 'like', `%${search}%`)
          .orWhere('customer_name', 'like', `%${search}%`)
          .orWhere('search_term', 'like', `%${search}%`);
      });
    }

    // Get total count with a separate query
    const countQuery = baseQuery.clone().count('* as total').first();
    const totalResult = await countQuery;
    const total = parseInt(totalResult.total);

    // Build data query with select columns
    const dataQuery = baseQuery.clone().select(
      'consignor_unique_id',
      'customer_id',
      'customer_name',
      'search_term',
      'industry_type',
      'currency_type',
      'payment_term',
      'status',
      'approved_by',
      'approved_date',
      'created_at',
      'updated_at'
    );

    // Apply sorting
    const sortColumn = sortBy || 'created_at';
    const sortDirection = (sortOrder || 'desc').toUpperCase();
    dataQuery.orderBy(sortColumn, sortDirection);

    // Apply pagination
    const offset = (page - 1) * limit;
    dataQuery.limit(limit).offset(offset);

    // Execute query
    const consignors = await dataQuery;

    // Return with metadata
    return {
      data: consignors,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    };
  } catch (error) {
    console.error('Get consignor list error:', error);
    throw error;
  }
};

/**
 * Get Consignor by ID with all related data
 */
const getConsignorById = async (customerId) => {
  try {
    // Get basic information
    const consignor = await knex('consignor_basic_information')
      .where('customer_id', customerId)
      .first();

    if (!consignor) {
      throw {
        type: 'NOT_FOUND',
        message: `Consignor with ID '${customerId}' not found`
      };
    }

    // Get contacts with field mapping for frontend
    const contacts = await knex('contact')
      .where('customer_id', customerId)
      .where('status', 'ACTIVE')
      .select(
        'contact_id',
        'contact_designation',
        'contact_name',
        'contact_number',
        'country_code',
        'email_id',
        'linkedin_link',
        'contact_team',
        'contact_role',
        'contact_photo',
        'status'
      );

    // Get organization with JSON parsed business_area
    const organization = await knex('consignor_organization')
      .where('customer_id', customerId)
      .where('status', 'ACTIVE')
      .first();

    // Parse business_area JSON
    let businessAreaArray = [];
    if (organization && organization.business_area) {
      try {
        businessAreaArray = JSON.parse(organization.business_area);
      } catch (error) {
        console.warn('Failed to parse business_area JSON:', error);
        // Fallback: if it's a string, convert to array
        businessAreaArray = [organization.business_area];
      }
    }

    // Get documents with file information
    const documents = await knex('consignor_documents as cd')
      .leftJoin('document_upload as du', 'cd.document_id', 'du.document_id')
      .leftJoin('doc_type_configuration as dtc', 'cd.document_type_id', 'dtc.document_type_id')
      .where('cd.customer_id', customerId)
      .where('cd.status', 'ACTIVE')
      .select(
        'cd.document_unique_id',
        'cd.document_type_id',
        'dtc.document_type_id as document_type_name', // Use document_type_id as name since no name column exists
        'cd.document_number',
        'cd.valid_from',
        'cd.valid_to',
        'du.document_id',
        'du.file_name as document_path',           // Actual column is file_name, alias as document_path
        'du.file_name as original_file_name',      // Reuse file_name for original name
        knex.raw('NULL as file_size'),             // Column doesn't exist, return NULL
        'du.file_type as mime_type'                // Actual column is file_type, alias as mime_type
      );

    // Construct response with frontend field names
    return {
      general: {
        customer_id: consignor.customer_id,
        customer_name: consignor.customer_name,
        search_term: consignor.search_term,
        industry_type: consignor.industry_type,
        currency_type: consignor.currency_type,
        payment_term: consignor.payment_term,
        remark: consignor.remark,
        website_url: consignor.website_url,
        name_on_po: consignor.name_on_po,
        approved_by: consignor.approved_by,
        approved_date: consignor.approved_date,
        status: consignor.status
      },
      // Map database column names to frontend field names
      contacts: contacts.map(c => ({
        contact_id: c.contact_id,
        designation: c.contact_designation,
        name: c.contact_name,
        number: c.contact_number,
        country_code: c.country_code,
        email: c.email_id,
        linkedin_link: c.linkedin_link,
        team: c.contact_team,
        role: c.contact_role,
        photo: c.contact_photo,
        status: c.status
      })),
      organization: organization ? {
        company_code: organization.company_code,
        business_area: businessAreaArray,  // Return as parsed array
        status: organization.status
      } : null,
      documents: documents.map(d => ({
        document_unique_id: d.document_unique_id,
        document_type_id: d.document_type_id,
        document_type_name: d.document_type_name,
        document_number: d.document_number,
        valid_from: d.valid_from,
        valid_to: d.valid_to,
        file_path: d.document_path,
        original_name: d.original_file_name,
        file_size: d.file_size,
        mime_type: d.mime_type
      }))
    };
  } catch (error) {
    console.error('Get consignor by ID error:', error);
    throw error;
  }
};

/**
 * Create new consignor with all related data
 */
const createConsignor = async (payload, files, userId) => {
  const trx = await knex.transaction();

  try {
    // Validate payload
    const { error, value } = consignorCreateSchema.validate(payload, {
      abortEarly: false
    });

    if (error) {
      throw {
        type: 'VALIDATION_ERROR',
        details: error.details,
        message: 'Validation failed'
      };
    }

    const { general, contacts, organization, documents } = value;

    // Auto-generate customer_id if not provided
    if (!general.customer_id || general.customer_id.trim() === '') {
      // Generate customer ID in format: CON0001, CON0002, etc.
      const lastConsignor = await knex('consignor_basic_information')
        .select('customer_id')
        .where('customer_id', 'like', 'CON%')
        .orderBy('customer_id', 'desc')
        .first();
      
      if (lastConsignor && lastConsignor.customer_id) {
        const lastNumber = parseInt(lastConsignor.customer_id.substring(3));
        const nextNumber = lastNumber + 1;
        general.customer_id = `CON${String(nextNumber).padStart(4, '0')}`;
      } else {
        general.customer_id = 'CON0001';
      }
      
      console.log(`🆔 Auto-generated customer_id: ${general.customer_id}`);
    }

    // Check if customer_id is unique
    const isUnique = await isCustomerIdUnique(general.customer_id);
    if (!isUnique) {
      throw {
        type: 'VALIDATION_ERROR',
        details: [
          {
            field: 'general.customer_id',
            message: 'Customer ID already exists. Please use a different ID.'
          }
        ],
        message: 'Duplicate customer ID'
      };
    }

    // Check if company_code is unique
    if (organization) {
      const isCompanyUnique = await isCompanyCodeUnique(organization.company_code);
      if (!isCompanyUnique) {
        throw {
          type: 'VALIDATION_ERROR',
          details: [
            {
              field: 'organization.company_code',
              message: 'Company code already exists. Please use a different code.'
            }
          ],
          message: 'Duplicate company code'
        };
      }
    }

    // 1. Insert basic information
    const [consignorUniqueId] = await trx('consignor_basic_information').insert({
      customer_id: general.customer_id,
      customer_name: general.customer_name,
      search_term: general.search_term,
      industry_type: general.industry_type,
      currency_type: general.currency_type || null,
      payment_term: general.payment_term,
      remark: general.remark || null,
      website_url: general.website_url || null,
      name_on_po: general.name_on_po || null,
      approved_by: general.approved_by || null,
      approved_date: general.approved_date || null,
      status: general.status || 'ACTIVE',
      created_by: userId,
      updated_by: userId,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    });

    // 2. Insert contacts with photo upload handling
    if (contacts && contacts.length > 0) {
      const contactInserts = await Promise.all(
        contacts.map(async (contact, index) => {
          const contactId = await generateContactId(trx);
          
          // Handle photo upload if file exists
          let photoUrl = contact.photo || null;
          const photoFileKey = `contact_${index}_photo`;
          
          if (files && files[photoFileKey]) {
            try {
              const uploadResult = await uploadFile(files[photoFileKey], 'consignor/contacts');
              photoUrl = uploadResult.fileUrl;  // Store the URL path
            } catch (uploadError) {
              console.error(`Error uploading photo for contact ${index}:`, uploadError);
              // Continue without photo if upload fails
            }
          }
          
          return {
            contact_id: contactId,
            customer_id: general.customer_id,
            // Map frontend field names to database column names
            contact_designation: contact.designation,
            contact_name: contact.name,
            contact_number: contact.number || null,
            country_code: contact.country_code || null,
            email_id: contact.email || null,
            linkedin_link: contact.linkedin_link || null,
            contact_team: contact.team || null,
            contact_role: contact.role,
            contact_photo: photoUrl,  // Store uploaded file URL
            status: contact.status || 'ACTIVE',
            created_by: userId,
            updated_by: userId,
            created_at: knex.fn.now(),
            updated_at: knex.fn.now()
          };
        })
      );

      await trx('contact').insert(contactInserts);
    }

    // 3. Insert organization with JSON array for business_area
    if (organization) {
      // Ensure business_area is JSON string array
      const businessAreaJson = JSON.stringify(organization.business_area);

      await trx('consignor_organization').insert({
        customer_id: general.customer_id,
        company_code: organization.company_code,
        business_area: businessAreaJson,  // Store as JSON string
        status: organization.status || 'ACTIVE',
        created_by: userId,
        updated_by: userId,
        created_at: knex.fn.now(),
        updated_at: knex.fn.now()
      });
    }

    // 4. Handle document uploads
    if (documents && documents.length > 0 && files) {
      for (const doc of documents) {
        // Find corresponding file if fileKey is specified
        const file = files[doc.fileKey];
        
        if (file) {
          // Upload file to storage
          const uploadResult = await uploadFile(file, 'consignor/documents');

          // Insert into document_upload table
          const documentUploadId = await generateDocumentUploadId(trx);
          await trx('document_upload').insert({
            document_id: documentUploadId,
            file_name: uploadResult.filePath,        // Actual column is file_name (not document_path)
            file_type: uploadResult.mimeType,        // Actual column is file_type (not mime_type)
            file_xstring_value: null,                // Optional metadata field
            created_by: userId,
            updated_by: userId,
            created_at: knex.fn.now(),
            updated_at: knex.fn.now()
          });

          // Insert into consignor_documents table
          const documentUniqueId = await generateDocumentId(trx);
          await trx('consignor_documents').insert({
            document_unique_id: documentUniqueId,
            document_id: documentUploadId,
            customer_id: general.customer_id,
            document_type_id: doc.document_type_id || doc.documentTypeId,
            document_number: doc.document_number || doc.documentNumber || null,
            valid_from: doc.valid_from || doc.validFrom,
            valid_to: doc.valid_to || doc.validTo || null,
            status: 'ACTIVE',
            created_by: userId,
            updated_by: userId,
            created_at: knex.fn.now(),
            updated_at: knex.fn.now()
          });
        }
      }
    }

    // Commit transaction
    await trx.commit();

    // Fetch and return complete consignor data
    const createdConsignor = await getConsignorById(general.customer_id);
    return createdConsignor;
  } catch (error) {
    // Rollback transaction on error
    await trx.rollback();
    console.error('Create consignor error:', error);
    throw error;
  }
};

/**
 * Update existing consignor
 */
const updateConsignor = async (customerId, payload, files, userId) => {
  const trx = await knex.transaction();

  try {
    // Check if consignor exists
    const existing = await trx('consignor_basic_information')
      .where('customer_id', customerId)
      .first();

    if (!existing) {
      throw {
        type: 'NOT_FOUND',
        message: `Consignor with ID '${customerId}' not found`
      };
    }

    // Validate payload
    const { error, value } = consignorUpdateSchema.validate(payload, {
      abortEarly: false
    });

    if (error) {
      throw {
        type: 'VALIDATION_ERROR',
        details: error.details,
        message: 'Validation failed'
      };
    }

    const { general, contacts, organization, documents } = value;

    // 1. Update basic information if provided
    if (general) {
      // Check customer_id uniqueness if it's being changed
      if (general.customer_id && general.customer_id !== customerId) {
        const isUnique = await isCustomerIdUnique(
          general.customer_id,
          existing.consignor_unique_id
        );
        if (!isUnique) {
          throw {
            type: 'VALIDATION_ERROR',
            details: [
              {
                field: 'general.customer_id',
                message: 'Customer ID already exists'
              }
            ],
            message: 'Duplicate customer ID'
          };
        }
      }

      await trx('consignor_basic_information')
        .where('customer_id', customerId)
        .update({
          ...general,
          updated_by: userId,
          updated_at: knex.fn.now()
        });
    }

    // 2. Update contacts if provided with photo upload handling
    if (contacts) {
      // Soft delete existing contacts
      await trx('contact')
        .where('customer_id', customerId)
        .update({ status: 'INACTIVE', updated_at: knex.fn.now() });

      // Insert new contacts with frontend field mapping and photo uploads
      if (contacts.length > 0) {
        const contactInserts = await Promise.all(
          contacts.map(async (contact, index) => {
            const contactId = contact.contact_id || (await generateContactId(trx));
            
            // Handle photo upload if file exists
            let photoUrl = contact.photo || null;
            const photoFileKey = `contact_${index}_photo`;
            
            if (files && files[photoFileKey]) {
              try {
                const uploadResult = await uploadFile(files[photoFileKey], 'consignor/contacts');
                photoUrl = uploadResult.fileUrl;  // Store the URL path
              } catch (uploadError) {
                console.error(`Error uploading photo for contact ${index}:`, uploadError);
                // Keep existing photo URL if upload fails
              }
            }
            
            return {
              contact_id: contactId,
              customer_id: customerId,
              // Map frontend field names to database columns
              contact_designation: contact.designation,
              contact_name: contact.name,
              contact_number: contact.number || null,
              country_code: contact.country_code || null,
              email_id: contact.email || null,
              linkedin_link: contact.linkedin_link || null,
              contact_team: contact.team || null,
              contact_role: contact.role,
              contact_photo: photoUrl,  // Store uploaded file URL
              status: contact.status || 'ACTIVE',
              created_by: userId,
              updated_by: userId,
              created_at: knex.fn.now(),
              updated_at: knex.fn.now()
            };
          })
        );

        await trx('contact').insert(contactInserts);
      }
    }

    // 3. Update organization with JSON array for business_area
    if (organization) {
      // Convert business_area array to JSON string
      const businessAreaJson = JSON.stringify(organization.business_area);

      // Check if organization record exists
      const existingOrg = await trx('consignor_organization')
        .where('customer_id', customerId)
        .first();

      if (existingOrg) {
        await trx('consignor_organization')
          .where('customer_id', customerId)
          .update({
            company_code: organization.company_code,
            business_area: businessAreaJson,
            status: organization.status || 'ACTIVE',
            updated_by: userId,
            updated_at: knex.fn.now()
          });
      } else {
        await trx('consignor_organization').insert({
          customer_id: customerId,
          company_code: organization.company_code,
          business_area: businessAreaJson,
          status: organization.status || 'ACTIVE',
          created_by: userId,
          updated_by: userId,
          created_at: knex.fn.now(),
          updated_at: knex.fn.now()
        });
      }
    }

    // 4. Handle document updates if provided
    if (documents && files) {
      for (const doc of documents) {
        const file = files[doc.fileKey];
        
        if (file) {
          const uploadResult = await uploadFile(file, 'consignor/documents');

          const documentUploadId = await generateDocumentUploadId(trx);
          await trx('document_upload').insert({
            document_id: documentUploadId,
            file_name: uploadResult.filePath,        // Actual column is file_name (not document_path)
            file_type: uploadResult.mimeType,        // Actual column is file_type (not mime_type)
            file_xstring_value: null,                // Optional metadata field
            created_by: userId,
            updated_by: userId,
            created_at: knex.fn.now(),
            updated_at: knex.fn.now()
          });

          const documentUniqueId = await generateDocumentId(trx);
          await trx('consignor_documents').insert({
            document_unique_id: documentUniqueId,
            document_id: documentUploadId,
            customer_id: customerId,
            document_type_id: doc.document_type_id || doc.documentTypeId,
            document_number: doc.document_number || doc.documentNumber || null,
            valid_from: doc.valid_from || doc.validFrom,
            valid_to: doc.valid_to || doc.validTo || null,
            status: 'ACTIVE',
            created_by: userId,
            updated_by: userId,
            created_at: knex.fn.now(),
            updated_at: knex.fn.now()
          });
        }
      }
    }

    // Commit transaction
    await trx.commit();

    // Fetch and return updated consignor data
    const updatedConsignor = await getConsignorById(customerId);
    return updatedConsignor;
  } catch (error) {
    await trx.rollback();
    console.error('Update consignor error:', error);
    throw error;
  }
};

/**
 * Soft delete consignor
 */
const deleteConsignor = async (customerId, userId) => {
  try {
    // Check if consignor exists
    const existing = await knex('consignor_basic_information')
      .where('customer_id', customerId)
      .first();

    if (!existing) {
      throw {
        type: 'NOT_FOUND',
        message: `Consignor with ID '${customerId}' not found`
      };
    }

    // Soft delete (set status to INACTIVE)
    await knex('consignor_basic_information')
      .where('customer_id', customerId)
      .update({
        status: 'INACTIVE',
        updated_by: userId,
        updated_at: knex.fn.now()
      });

    return { success: true, message: 'Consignor deleted successfully' };
  } catch (error) {
    console.error('Delete consignor error:', error);
    throw error;
  }
};

/**
 * Get master data for dropdowns
 */
const getMasterData = async () => {
  try {
    // Get industry types from master table or enum
    const industries = await knex('master_industry_type')
      .select('industry_type_id as id', 'industry_type_name as label')
      .where('status', 'ACTIVE')
      .orderBy('industry_type_name');

    // Get currency types
    const currencies = await knex('master_currency_type')
      .select('currency_type_id as id', 'currency_type_name as label', 'currency_code as code')
      .where('status', 'ACTIVE')
      .orderBy('currency_type_name');

    // Get document types for CONSIGNOR with proper names
    const documentTypes = await knex('doc_type_configuration as dtc')
      .leftJoin('document_name_master as dnm', 'dtc.doc_name_master_id', 'dnm.doc_name_master_id')
      .select(
        'dtc.document_type_id as value',
        'dnm.document_name as label',
        'dtc.is_mandatory',
        'dtc.is_expiry_required',
        'dtc.is_verification_required'
      )
      .where('dtc.user_type', 'CONSIGNOR')
      .where('dtc.status', 'ACTIVE')
      .orderBy('dnm.document_name');

    return {
      industries,
      currencies,
      documentTypes
    };
  } catch (error) {
    console.error('Get master data error:', error);
    throw error;
  }
};

module.exports = {
  getConsignorList,
  getConsignorById,
  createConsignor,
  updateConsignor,
  deleteConsignor,
  getMasterData
};
