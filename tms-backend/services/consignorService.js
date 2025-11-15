/**
 * Consignor Service Layer
 * Handles all business logic, validations, and database transactions for consignor operations
 */

const knex = require('../config/database');
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

    // Get documents with file information and document type name
    const documents = await knex('consignor_documents as cd')
      .leftJoin('document_upload as du', 'cd.document_id', 'du.document_id')
      .leftJoin('doc_type_configuration as dtc', 'cd.document_type_id', 'dtc.document_type_id')
      .leftJoin('document_name_master as dnm', 'dtc.doc_name_master_id', 'dnm.doc_name_master_id')
      .where('cd.customer_id', customerId)
      .where('cd.status', 'ACTIVE')
      .select(
        'cd.document_unique_id',
        'cd.document_type_id',
        'dnm.document_name as document_type',      // Get actual document name from master table
        'cd.document_number',
        'cd.valid_from',
        'cd.valid_to',
        'du.document_id',
        'du.file_name',                            // Keep file name
        'du.file_type'                             // Keep file type
      );

    console.log(`📄 Found ${documents.length} documents for customer ${customerId}`);
    if (documents.length > 0) {
      console.log('Document details:', JSON.stringify(documents, null, 2));
    }

    console.log(`📸 Found ${contacts.length} contacts for customer ${customerId}`);
    console.log(`📋 NDA: ${consignor.upload_nda}, MSA: ${consignor.upload_msa}`);

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
        upload_nda: consignor.upload_nda,          // Add NDA document ID
        nda_expiry_date: consignor.nda_expiry_date, // Add NDA expiry
        upload_msa: consignor.upload_msa,          // Add MSA document ID
        msa_expiry_date: consignor.msa_expiry_date, // Add MSA expiry
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
        contact_photo: c.contact_photo,            // Keep as contact_photo for API endpoint
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
        document_type: d.document_type,            // Document name from master table
        document_number: d.document_number,
        valid_from: d.valid_from,
        valid_to: d.valid_to,
        document_id: d.document_id,                // Document upload ID for download
        file_name: d.file_name,                    // Original file name
        file_type: d.file_type,                    // MIME type
        status: 'ACTIVE'                           // Add status for frontend
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

    // 2. Insert contacts (photo upload handled separately in step 6)
    if (contacts && contacts.length > 0) {
      const contactInserts = contacts.map((contact) => {
        const contactId = `CON${Math.random().toString(36).substr(2, 9).toUpperCase()}`; // Temp ID, will be replaced
        
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
          contact_photo: null,  // Will be updated in step 6 if photo exists
          status: contact.status || 'ACTIVE',
          created_by: userId,
          updated_by: userId,
          created_at: knex.fn.now(),
          updated_at: knex.fn.now()
        };
      });

      // Generate proper contact IDs sequentially
      for (let i = 0; i < contactInserts.length; i++) {
        contactInserts[i].contact_id = await generateContactId(trx);
        contacts[i].contact_id = contactInserts[i].contact_id; // Store for later use
      }

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
    if (documents && documents.length > 0) {
      console.log(`📄 Processing ${documents.length} documents with files...`);
      
      for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];
        console.log(`  Document ${i}: fileKey=${doc.fileKey}, has file=${!!files[doc.fileKey]}`);
        
        // Find corresponding file if fileKey is specified
        if (doc.fileKey && files[doc.fileKey]) {
          const file = files[doc.fileKey];
          console.log(`  Uploading file: ${file.originalname}, size: ${file.size}, type: ${file.mimetype}`);
          
          // Convert file buffer to base64
          const base64Data = file.buffer.toString('base64');

          // Insert into document_upload table with base64 data
          const documentUploadId = await generateDocumentUploadId(trx);
          await trx('document_upload').insert({
            document_id: documentUploadId,
            file_name: file.originalname,                    // Original filename
            file_type: file.mimetype,                        // MIME type
            file_xstring_value: base64Data,                  // Base64 encoded file data
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
            document_type_id: doc.document_type_id,
            document_number: doc.document_number || null,
            valid_from: doc.valid_from,
            valid_to: doc.valid_to || null,
            status: 'ACTIVE',
            created_by: userId,
            updated_by: userId,
            created_at: knex.fn.now(),
            updated_at: knex.fn.now()
          });
          
          console.log(`  ✅ Document saved: ${documentUniqueId} -> ${documentUploadId}`);
        } else {
          console.log(`  ⚠️  No file provided for document ${i}`);
        }
      }
    }

    // 5. Handle NDA/MSA uploads
    if (general) {
      // Handle NDA upload
      if (files['general_nda']) {
        const ndaFile = files['general_nda'];
        console.log(`📄 Uploading NDA: ${ndaFile.originalname}`);
        
        const ndaBase64 = ndaFile.buffer.toString('base64');
        const ndaDocId = await generateDocumentUploadId(trx);
        
        await trx('document_upload').insert({
          document_id: ndaDocId,
          file_name: ndaFile.originalname,
          file_type: ndaFile.mimetype,
          file_xstring_value: ndaBase64,
          created_by: userId,
          updated_by: userId,
          created_at: knex.fn.now(),
          updated_at: knex.fn.now()
        });
        
        // Update consignor_basic_information with NDA document ID
        await trx('consignor_basic_information')
          .where('customer_id', general.customer_id)
          .update({
            upload_nda: ndaDocId,
            nda_expiry_date: general.nda_expiry_date || null,
            updated_by: userId,
            updated_at: knex.fn.now()
          });
          
        console.log(`  ✅ NDA saved: ${ndaDocId}`);
      }
      
      // Handle MSA upload
      if (files['general_msa']) {
        const msaFile = files['general_msa'];
        console.log(`📄 Uploading MSA: ${msaFile.originalname}`);
        
        const msaBase64 = msaFile.buffer.toString('base64');
        const msaDocId = await generateDocumentUploadId(trx);
        
        await trx('document_upload').insert({
          document_id: msaDocId,
          file_name: msaFile.originalname,
          file_type: msaFile.mimetype,
          file_xstring_value: msaBase64,
          created_by: userId,
          updated_by: userId,
          created_at: knex.fn.now(),
          updated_at: knex.fn.now()
        });
        
        // Update consignor_basic_information with MSA document ID
        await trx('consignor_basic_information')
          .where('customer_id', general.customer_id)
          .update({
            upload_msa: msaDocId,
            msa_expiry_date: general.msa_expiry_date || null,
            updated_by: userId,
            updated_at: knex.fn.now()
          });
          
        console.log(`  ✅ MSA saved: ${msaDocId}`);
      }
    }

    // 6. Handle contact photo uploads
    if (contacts && contacts.length > 0) {
      for (let i = 0; i < contacts.length; i++) {
        const photoFileKey = `contact_${i}_photo`;
        
        if (files[photoFileKey]) {
          const photoFile = files[photoFileKey];
          console.log(`📸 Uploading contact photo ${i}: ${photoFile.originalname}`);
          
          const photoBase64 = photoFile.buffer.toString('base64');
          const photoDocId = await generateDocumentUploadId(trx);
          
          await trx('document_upload').insert({
            document_id: photoDocId,
            file_name: photoFile.originalname,
            file_type: photoFile.mimetype,
            file_xstring_value: photoBase64,
            created_by: userId,
            updated_by: userId,
            created_at: knex.fn.now(),
            updated_at: knex.fn.now()
          });
          
          // Update contact with photo document ID
          const contactId = contacts[i].contact_id || contacts[i].contactId;
          if (contactId) {
            await trx('contact')
              .where('customer_id', general.customer_id)
              .where('contact_id', contactId)
              .update({
                contact_photo: photoDocId,
                updated_by: userId,
                updated_at: knex.fn.now()
              });
              
            console.log(`  ✅ Contact photo saved: ${photoDocId}`);
          }
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

/**
 * Get document file for download
 */
const getDocumentFile = async (customerId, documentId) => {
  try {
    console.log(`📄 Fetching document: ${documentId} for customer: ${customerId}`);

    // Get document metadata and file data
    const document = await knex('consignor_documents as cd')
      .join('document_upload as du', 'cd.document_id', 'du.document_id')
      .where('cd.customer_id', customerId)
      .where('cd.document_unique_id', documentId)
      .where('cd.status', 'ACTIVE')
      .select(
        'du.file_name',
        'du.file_type',
        'du.file_xstring_value'
      )
      .first();

    if (!document) {
      console.log('❌ Document not found in database');
      return null;
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(document.file_xstring_value, 'base64');

    console.log(`✅ Document found: ${document.file_name} (${buffer.length} bytes)`);

    return {
      fileName: document.file_name,
      mimeType: document.file_type,
      buffer
    };
  } catch (error) {
    console.error('❌ Get document file error:', error);
    throw error;
  }
};

/**
 * Get contact photo for download/display
 */
const getContactPhoto = async (customerId, contactId) => {
  try {
    console.log(`📸 Fetching photo for contact: ${contactId}`);

    // Get contact with photo reference
    const contact = await knex('contact')
      .where('customer_id', customerId)
      .where('contact_id', contactId)
      .where('status', 'ACTIVE')
      .first();

    if (!contact || !contact.contact_photo) {
      console.log('❌ Contact or photo not found');
      return null;
    }

    // Get photo file data from document_upload table
    const photo = await knex('document_upload')
      .where('document_id', contact.contact_photo)
      .first();

    if (!photo) {
      console.log('❌ Photo file not found in document_upload');
      return null;
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(photo.file_xstring_value, 'base64');

    console.log(`✅ Photo found: ${photo.file_name} (${buffer.length} bytes)`);

    return {
      fileName: photo.file_name,
      mimeType: photo.file_type,
      buffer
    };
  } catch (error) {
    console.error('❌ Get contact photo error:', error);
    throw error;
  }
};

/**
 * Get general document (NDA or MSA) for download
 */
const getGeneralDocument = async (customerId, fileType) => {
  try {
    console.log(`📄 Fetching ${fileType.toUpperCase()} for customer: ${customerId}`);

    const fieldName = fileType.toLowerCase() === 'nda' ? 'upload_nda' : 'upload_msa';

    // Get consignor basic info with document reference
    const consignor = await knex('consignor_basic_information')
      .where('customer_id', customerId)
      .first();

    if (!consignor || !consignor[fieldName]) {
      console.log(`❌ ${fileType.toUpperCase()} document not found for consignor`);
      return null;
    }

    // Get file from document_upload table
    const file = await knex('document_upload')
      .where('document_id', consignor[fieldName])
      .first();

    if (!file) {
      console.log(`❌ ${fileType.toUpperCase()} file not found in document_upload`);
      return null;
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(file.file_xstring_value, 'base64');

    console.log(`✅ ${fileType.toUpperCase()} found: ${file.file_name} (${buffer.length} bytes)`);

    return {
      fileName: file.file_name,
      mimeType: file.file_type,
      buffer
    };
  } catch (error) {
    console.error(`❌ Get ${fileType} document error:`, error);
    throw error;
  }
};

module.exports = {
  getConsignorList,
  getConsignorById,
  createConsignor,
  updateConsignor,
  deleteConsignor,
  getMasterData,
  getDocumentFile,
  getContactPhoto,
  getGeneralDocument
};
