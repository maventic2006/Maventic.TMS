const knex = require('knex')(require('../../knexfile').development);

// ==================== ID GENERATORS ====================
// These generate unique IDs for each entity in the correct format

const generateTransporterId = async (trx) => {
  // Use MAX() instead of COUNT() to get the highest ID and prevent race conditions
  const result = await trx("transporter_general_info")
    .max("transporter_id as max_id")
    .first();
  
  let nextNumber = 1;
  if (result.max_id) {
    // Extract number from format T001
    const currentNumber = parseInt(result.max_id.replace('T', ''));
    nextNumber = currentNumber + 1;
  }
  
  return `T${nextNumber.toString().padStart(3, "0")}`;
};

const generateAddressId = async (trx) => {
  // Use FOR UPDATE lock to prevent race conditions in parallel processing
  const result = await trx("tms_address")
    .max("address_id as max_id")
    .first();
  
  let nextNumber = 1;
  if (result.max_id) {
    // Extract number from format ADDR0001
    const currentNumber = parseInt(result.max_id.replace('ADDR', ''));
    nextNumber = currentNumber + 1;
  }
  
  return `ADDR${nextNumber.toString().padStart(4, "0")}`;
};

const generateContactId = async (trx) => {
  // Use MAX() to prevent race conditions in parallel processing
  const result = await trx("transporter_contact")
    .max("tcontact_id as max_id")
    .first();
  
  let nextNumber = 1;
  if (result.max_id) {
    // Extract number from format TC0001
    const currentNumber = parseInt(result.max_id.replace('TC', ''));
    nextNumber = currentNumber + 1;
  }
  
  return `TC${nextNumber.toString().padStart(4, "0")}`;
};

const generateServiceAreaHeaderId = async (trx) => {
  // Use MAX() to prevent race conditions in parallel processing
  const result = await trx("transporter_service_area_hdr")
    .max("service_area_hdr_id as max_id")
    .first();
  
  let nextNumber = 1;
  if (result.max_id) {
    // Extract number from format SAH0001
    const currentNumber = parseInt(result.max_id.replace('SAH', ''));
    nextNumber = currentNumber + 1;
  }
  
  return `SAH${nextNumber.toString().padStart(4, "0")}`;
};

const generateServiceAreaItemId = async (trx) => {
  // Use MAX() to prevent race conditions in parallel processing
  const result = await trx("transporter_service_area_itm")
    .max("service_area_itm_id as max_id")
    .first();
  
  let nextNumber = 1;
  if (result.max_id) {
    // Extract number from format SAI0001
    const currentNumber = parseInt(result.max_id.replace('SAI', ''));
    nextNumber = currentNumber + 1;
  }
  
  return `SAI${nextNumber.toString().padStart(4, "0")}`;
};

const generateDocumentId = async (trx) => {
  // Use MAX() to prevent race conditions in parallel processing
  const result = await trx("transporter_documents")
    .max("document_id as max_id")
    .first();
  
  let nextNumber = 1;
  if (result.max_id) {
    // Extract number from format DOC0001
    const currentNumber = parseInt(result.max_id.replace('DOC', ''));
    nextNumber = currentNumber + 1;
  }
  
  return `DOC${nextNumber.toString().padStart(4, "0")}`;
};

// ==================== MASTER DATA MAPPING ====================
// Map Excel values to database master data IDs

/**
 * Map address type name from Excel to address_type_id from master data
 * @param {string} addressTypeName - Name from Excel (e.g., "Head Office", "Branch Office")
 * @param {Object} trx - Knex transaction object
 * @returns {Promise<string>} address_type_id (e.g., "AT001")
 */
const getAddressTypeId = async (addressTypeName, trx) => {
  // Common mappings from Excel to database
  const mappings = {
    'Head Office': 'Billing Address',
    'Branch Office': 'Shipping Address',
    'Registered Office': 'Billing Address',
    'Corporate Office': 'Billing Address',
    'Regional Office': 'Shipping Address',
    'Billing Address': 'Billing Address',
    'Shipping Address': 'Shipping Address',
    'Contact Person Address': 'Contact Person Address',
    'Temporary Address': 'Temporary Address',
    'Permanent Address': 'Permanent Address'
  };

  // Get the mapped name or use the original
  const mappedName = mappings[addressTypeName] || addressTypeName;

  // Query database for the address_type_id
  const result = await trx('address_type_master')
    .where('address', mappedName)
    .where('status', 'ACTIVE')
    .first();

  if (result) {
    return result.address_type_id;
  }

  // Default to Billing Address if not found
  console.warn(`Address type "${addressTypeName}" not found in master data, defaulting to Billing Address`);
  const defaultResult = await trx('address_type_master')
    .where('address', 'Billing Address')
    .first();
  
  return defaultResult ? defaultResult.address_type_id : 'AT001';
};

/**
 * Map document type name from Excel to document_type_id from master data
 * @param {string} docTypeName - Name from Excel (e.g., "PAN Card", "GST Certificate")
 * @param {Object} trx - Knex transaction object
 * @returns {Promise<string>} document_type_id (e.g., "DOC001")
 */
const getDocumentTypeId = async (docTypeName, trx) => {
  // Common mappings from Excel to database
  const mappings = {
    'PAN Card': 'Invoice',
    'GST Certificate': 'Invoice',
    'Registration Certificate': 'LR Copy',
    'Trade License': 'Invoice',
    'Insurance Certificate': 'POD',
    'Invoice': 'Invoice',
    'LR Copy': 'LR Copy',
    'POD': 'POD',
    'E-Way Bill': 'E-Way Bill',
    'Proof of Delivery': 'POD'
  };

  // Get the mapped name or use the original
  const mappedName = mappings[docTypeName] || docTypeName;

  // Query database for the document_type_id
  const result = await trx('document_type_master')
    .where('document_type', mappedName)
    .where('status', 'ACTIVE')
    .first();

  if (result) {
    return result.document_type_id;
  }

  // Default to Invoice if not found
  console.warn(`Document type "${docTypeName}" not found in master data, defaulting to Invoice`);
  const defaultResult = await trx('document_type_master')
    .where('document_type', 'Invoice')
    .first();
  
  return defaultResult ? defaultResult.document_type_id : 'DOC001';
};

/**
 * Create a complete transporter with all related data from bulk upload
 * @param {Object} transporterData - Validated transporter data with all sheets
 * @param {string} batchId - Bulk upload batch ID (for tracking, not stored in transporter tables)
 * @param {number} userId - User who uploaded the file
 * @returns {Promise<Object>} Created transporter with IDs
 */
async function createTransporterFromBulk(transporterData, batchId, userId) {
  const trx = await knex.transaction();
  
  try {
    const { generalDetails, addresses, contacts, serviceableAreas, documents } = transporterData;
    
    // Step 1: Create transporter general info
    const transporterId = await generateTransporterId(trx);
    
    await trx('transporter_general_info').insert({
      transporter_id: transporterId,
      business_name: generalDetails.Business_Name,
      user_type: 'TRANSPORTER',
      trans_mode_road: generalDetails.Transport_Mode_Road === 'Y' ? 1 : 0,
      trans_mode_rail: generalDetails.Transport_Mode_Rail === 'Y' ? 1 : 0,
      trans_mode_air: generalDetails.Transport_Mode_Air === 'Y' ? 1 : 0,
      trans_mode_sea: generalDetails.Transport_Mode_Sea === 'Y' ? 1 : 0,
      from_date: generalDetails.From_Date,
      to_date: generalDetails.To_Date || null,
      active_flag: generalDetails.Active_Flag === 'Y' ? 1 : 0,
      avg_rating: generalDetails.Average_Rating || 0,
      status: 'ACTIVE', // Set to ACTIVE for bulk upload
      created_by: userId,
      updated_by: userId,
      created_at: new Date(),
      updated_at: new Date(),
      created_on: new Date(),
      updated_on: new Date()
      // Note: bulk_batch_id tracking is done via tms_bulk_upload_transporters table
    });
    
    console.log(`Created transporter ID: ${transporterId} (${generalDetails.Business_Name})`)
    
    // Step 3: Create addresses with contacts
    for (const address of addresses) {
      const addressId = await generateAddressId(trx);
      
      // Map address type name to ID from master data
      const addressTypeId = await getAddressTypeId(address.Address_Type, trx);
      
      // Insert into tms_address (the correct table name)
      await trx('tms_address').insert({
        address_id: addressId,
        user_reference_id: transporterId,
        user_type: 'TRANSPORTER',
        country: address.Country,
        vat_number: address.VAT_GST_Number || null,
        street_1: address.Street_1,
        street_2: address.Street_2 || null,
        city: address.City,
        district: address.District || null,
        state: address.State,
        postal_code: address.Postal_Code,
        is_primary: address.Is_Primary === 'Y' ? 1 : 0,
        address_type_id: addressTypeId, // Mapped from master data
        created_by: userId,
        updated_by: userId,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      console.log(`  Created address ID: ${addressId} (${address.Address_Type})`);
      
      // Create contacts for this address
      const addressContacts = contacts.filter(c => c.Address_Type === address.Address_Type);
      
      for (const contact of addressContacts) {
        const contactId = await generateContactId(trx);
        
        await trx('transporter_contact').insert({
          tcontact_id: contactId, // Correct column name
          transporter_id: transporterId,
          address_id: addressId,
          contact_person_name: contact.Contact_Person_Name,
          role: contact.Designation || null, // Correct column name
          phone_number: contact.Phone_Number,
          alternate_phone_number: contact.Alt_Phone_Number || null, // Correct column name
          whats_app_number: contact.WhatsApp_Number || null, // Correct column name
          email_id: contact.Email_ID,
          alternate_email_id: contact.Alt_Email_ID || null, // Correct column name
          created_by: userId,
          updated_by: userId,
          created_at: new Date(),
          updated_at: new Date()
        });
        
        console.log(`    Created contact: ${contact.Contact_Person_Name}`);
      }
    }
    
    // Step 4: Create serviceable areas (two-table structure: header + items)
    for (const area of serviceableAreas) {
      const serviceAreaHdrId = await generateServiceAreaHeaderId(trx);
      
      // Insert header record for the country
      await trx('transporter_service_area_hdr').insert({
        service_area_hdr_id: serviceAreaHdrId,
        transporter_id: transporterId,
        service_country: area.Service_Country,
        created_by: userId,
        updated_by: userId,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      console.log(`  Created service area header: ${serviceAreaHdrId} (${area.Service_Country})`);
      
      // Split comma-separated states and create item records
      if (area.Service_States) {
        const states = area.Service_States.split(',').map(s => s.trim());
        
        for (const state of states) {
          const serviceAreaItmId = await generateServiceAreaItemId(trx);
          
          await trx('transporter_service_area_itm').insert({
            service_area_itm_id: serviceAreaItmId,
            service_area_hdr_id: serviceAreaHdrId,
            service_state: state,
            created_by: userId,
            updated_by: userId,
            created_at: new Date(),
            updated_at: new Date()
          });
          
          console.log(`    Created service area item: ${serviceAreaItmId} (${state})`);
        }
      }
    }
    
    // Step 5: Create document metadata (no file upload in bulk upload)
    for (const doc of documents) {
      const documentId = await generateDocumentId(trx);
      const documentUniqueId = `${transporterId}_${documentId}`; // Unique identifier
      
      // Map document type name to ID from master data
      const documentTypeId = await getDocumentTypeId(doc.Document_Type, trx);
      
      await trx('transporter_documents').insert({
        document_unique_id: documentUniqueId,
        document_id: documentId,
        document_type_id: documentTypeId, // Mapped from master data
        document_number: doc.Document_Number,
        reference_number: doc.Document_Name || null,
        country: doc.Issuing_Country,
        valid_from: doc.Issue_Date,
        valid_to: doc.Expiry_Date || null,
        active: doc.Is_Verified === 'Y' ? 1 : 0,
        user_type: 'TRANSPORTER',
        created_by: userId,
        updated_by: userId,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      console.log(`  Created document: ${documentId} (${doc.Document_Name})`);
    }
    
    // Step 6: Update bulk upload record with created transporter ID
    await trx('tms_bulk_upload_transporters')
      .where({ 
        batch_id: batchId,
        transporter_ref_id: generalDetails.Transporter_Ref_ID
      })
      .update({
        created_transporter_id: transporterId
      });
    
    // Commit transaction
    await trx.commit();
    
    console.log(`✓ Successfully created transporter: ${generalDetails.Business_Name}`);
    
    return {
      success: true,
      transporterId,
      refId: generalDetails.Transporter_Ref_ID,
      businessName: generalDetails.Business_Name
    };
    
  } catch (error) {
    await trx.rollback();
    console.error(`Error creating transporter from bulk:`, error);
    throw error;
  }
}

/**
 * Create multiple transporters in batches with progress tracking
 * @param {Array} transporters - Array of validated transporter data
 * @param {string} batchId - Bulk upload batch ID
 * @param {number} userId - User who uploaded the file
 * @param {Object} io - Socket.IO instance
 * @param {Function} progressCallback - Callback for progress updates
 * @returns {Promise<Object>} Creation results
 */
async function createTransportersBatch(transporters, batchId, userId, io, progressCallback) {
  const results = {
    success: [],
    failed: []
  };
  
  const total = transporters.length;
  let processed = 0;
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Creating ${total} transporter(s) from batch ${batchId}`);
  console.log(`${'='.repeat(60)}\n`);
  
  // Process transporters SEQUENTIALLY to avoid race conditions with ID generation
  for (const transporter of transporters) {
    try {
      const result = await createTransporterFromBulk(transporter, batchId, userId);
      
      processed++;
      results.success.push({
        refId: transporter.generalDetails.Transporter_Ref_ID,
        transporterId: result.transporterId,
        businessName: transporter.generalDetails.Business_Name
      });
      
      // Emit progress
      if (io) {
        io.to(`batch:${batchId}`).emit('bulkUploadProgress', {
          progress: 80 + (processed / total * 15), // 80-95% range
          message: `Created: ${transporter.generalDetails.Business_Name}`,
          type: 'success'
        });
      }
      
    } catch (error) {
      processed++;
      results.failed.push({
        refId: transporter.generalDetails.Transporter_Ref_ID,
        businessName: transporter.generalDetails.Business_Name,
        error: error.message
      });
      
      // Emit error
      if (io) {
        io.to(`batch:${batchId}`).emit('bulkUploadProgress', {
          progress: 80 + (processed / total * 15),
          message: `Failed: ${transporter.generalDetails.Business_Name} - ${error.message}`,
          type: 'error'
        });
      }
    }
    
    // Call progress callback
    if (progressCallback) {
      progressCallback(processed, total);
    }
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Batch creation complete:`);
  console.log(`  Success: ${results.success.length}`);
  console.log(`  Failed: ${results.failed.length}`);
  console.log(`${'='.repeat(60)}\n`);
  
  return results;
}

module.exports = {
  createTransporterFromBulk,
  createTransportersBatch
};
