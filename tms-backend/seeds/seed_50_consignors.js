/**
 * Seed: Populate 50 Consignors
 * Populates consignor tables with 50 comprehensive consignor records
 * Tables: consignor_basic_information, consignor_organization, contact, 
 *         consignor_documents, tms_address, document_upload
 */

const { faker } = require('@faker-js/faker');

exports.seed = async function (knex) {
  console.log('🌱 Starting consignor data population...');
  
  // Delete existing entries in reverse order of dependencies
  console.log('🗑️  Cleaning up existing data...');
  await knex('consignor_documents').del();
  await knex('contact').where('customer_id', 'like', 'CUST%').del();
  await knex('consignor_organization').del();
  await knex('consignor_basic_information').del();
  await knex('document_upload').where('system_reference_id', 'like', 'CUST%').del();
  await knex('tms_address').where('user_type', 'CONSIGNOR').del();
  console.log('✅ Cleanup complete');
  
  // Helper data
  const industryTypes = ['IND_AUTOMOTIVE', 'IND_PHARMA', 'IND_FMCG', 'IND_RETAIL', 'IND_ELECTRONICS', 
                         'IND_TEXTILE', 'IND_FOOD', 'IND_CHEMICAL', 'IND_CONSTRUCTION', 'IND_LOGISTICS',
                         'IND_AGRICULTURE', 'IND_ENERGY', 'IND_MANUFACTURING', 'IND_TELECOM'];
  const currencyTypes = ['INR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD', 'AED'];
  const paymentTerms = ['NET15', 'NET30', 'NET45', 'NET60', 'NET90', 'COD', 'ADVANCE', 'LC'];
  // Use existing TRANSPORTER document types (DTM001-DTM013) for consignor documents
  const documentTypes = ['DTM001', 'DTM002', 'DTM003', 'DTM004', 'DTM005', 
                          'DTM006', 'DTM007', 'DTM008', 'DTM009', 'DTM010'];
  const contactDesignations = ['CEO', 'CFO', 'COO', 'Managing Director', 'Operations Manager',
                                 'Logistics Manager', 'Supply Chain Manager', 'Purchase Manager'];
  const contactRoles = ['Decision Maker', 'Approver', 'Coordinator', 'Operations', 'Finance'];
  const contactTeams = ['Leadership', 'Operations', 'Finance', 'Logistics', 'Procurement'];
  const locations = [
    { state: 'Maharashtra', cities: ['Mumbai', 'Pune', 'Nagpur'] },
    { state: 'Karnataka', cities: ['Bangalore', 'Mysore', 'Hubli'] },
    { state: 'Tamil Nadu', cities: ['Chennai', 'Coimbatore', 'Madurai'] },
    { state: 'Delhi', cities: ['New Delhi', 'Delhi'] },
    { state: 'Gujarat', cities: ['Ahmedabad', 'Surat', 'Vadodara'] },
    { state: 'Rajasthan', cities: ['Jaipur', 'Jodhpur', 'Udaipur'] },
    { state: 'Uttar Pradesh', cities: ['Lucknow', 'Kanpur', 'Agra'] },
    { state: 'West Bengal', cities: ['Kolkata', 'Howrah', 'Durgapur'] },
    { state: 'Telangana', cities: ['Hyderabad', 'Warangal'] },
    { state: 'Punjab', cities: ['Ludhiana', 'Amritsar', 'Jalandhar'] }
  ];

  console.log('🔨 Generating data for 50 consignors...');

  // Arrays for batch insert
  const addresses = [];
  const documentUploads = [];
  const basicInfo = [];
  const organizations = [];
  const contacts = [];
  const documents = [];

  // Generate 50 consignors
  for (let i = 1; i <= 50; i++) {
    const customerId = 'CUST' + String(i).padStart(5, '0');
    const companyName = faker.company.name();
    const searchTerm = companyName.substring(0, 20).toUpperCase().replace(/[^A-Z0-9]/g, '');
    const status = i <= 45 ? 'ACTIVE' : (i <= 48 ? 'INACTIVE' : 'PENDING');
    const location = faker.helpers.arrayElement(locations);
    const city = faker.helpers.arrayElement(location.cities);
    
    // Address
    const addressId = 'ADDR' + String(i).padStart(6, '0');
    addresses.push({
      address_id: addressId,
      user_reference_id: customerId,
      user_type: 'CONSIGNOR',
      country: 'India',
      vat_number: 'VAT' + faker.string.numeric(12),
      street_1: faker.location.streetAddress(),
      street_2: faker.location.secondaryAddress(),
      city: city,
      district: city,
      state: location.state,
      postal_code: faker.location.zipCode('######'),
      is_primary: true,
      address_type_id: 'AT001', // Headquarters address type
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM',
      status: 'ACTIVE'
    });
    
    // NDA and MSA Documents
    const ndaDocId = 'DU' + String(i * 2 - 1).padStart(6, '0');
    const msaDocId = 'DU' + String(i * 2).padStart(6, '0');
    
    documentUploads.push({
      document_id: ndaDocId,
      file_name: 'NDA_' + customerId + '.pdf',
      file_type: 'application/pdf',
      file_xstring_value: Buffer.from('Sample NDA Content').toString('base64'),
      system_reference_id: customerId,
      is_verified: true,
      valid_from: faker.date.past({ years: 1 }),
      valid_to: faker.date.future({ years: 2 }),
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM',
      status: 'ACTIVE'
    });
    
    documentUploads.push({
      document_id: msaDocId,
      file_name: 'MSA_' + customerId + '.pdf',
      file_type: 'application/pdf',
      file_xstring_value: Buffer.from('Sample MSA Content').toString('base64'),
      system_reference_id: customerId,
      is_verified: true,
      valid_from: faker.date.past({ years: 1 }),
      valid_to: faker.date.future({ years: 3 }),
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM',
      status: 'ACTIVE'
    });
    
    // Basic Information
    basicInfo.push({
      customer_id: customerId,
      customer_name: companyName,
      search_term: searchTerm,
      industry_type: faker.helpers.arrayElement(industryTypes),
      currency_type: faker.helpers.arrayElement(currencyTypes),
      payment_term: faker.helpers.arrayElement(paymentTerms),
      remark: faker.lorem.sentence(),
      upload_nda: ndaDocId,
      upload_msa: msaDocId,
      website_url: faker.internet.url(),
      name_on_po: companyName.substring(0, 30),
      approved_by: status === 'ACTIVE' ? 'ADMIN001' : null,
      approved_date: status === 'ACTIVE' ? faker.date.past({ years: 1 }) : null,
      address_id: addressId,
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM',
      status: status
    });
    
    // Organization
    organizations.push({
      customer_id: customerId,
      company_code: 'CC' + String(i).padStart(4, '0'),
      business_area: 'BA' + String(i).padStart(4, '0'),
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM',
      status: 'ACTIVE'
    });
    
    // 2-3 Contacts per consignor
    const numContacts = faker.number.int({ min: 2, max: 3 });
    for (let j = 1; j <= numContacts; j++) {
      const contactId = 'CON' + String((i - 1) * 3 + j).padStart(5, '0');
      contacts.push({
        contact_id: contactId,
        customer_id: customerId,
        contact_designation: faker.helpers.arrayElement(contactDesignations),
        contact_name: faker.person.fullName(),
        contact_number: '98' + faker.string.numeric(8), // Generate 10-digit number
        contact_photo: null,
        contact_role: faker.helpers.arrayElement(contactRoles),
        contact_team: faker.helpers.arrayElement(contactTeams),
        country_code: '+91',
        email_id: faker.internet.email(),
        linkedin_link: faker.internet.url(),
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM',
        status: 'ACTIVE'
      });
    }
    
    // 2-4 Documents per consignor
    const numDocs = faker.number.int({ min: 2, max: 4 });
    for (let k = 1; k <= numDocs; k++) {
      const docUniqueId = 'CDOC' + String((i - 1) * 4 + k).padStart(5, '0');
      const docUploadId = 'DU' + String(100 + (i - 1) * 4 + k).padStart(6, '0');
      const docType = faker.helpers.arrayElement(documentTypes);
      
      documentUploads.push({
        document_id: docUploadId,
        file_name: docType + '_' + customerId + '_' + k + '.pdf',
        file_type: 'application/pdf',
        file_xstring_value: Buffer.from('Sample ' + docType).toString('base64'),
        system_reference_id: customerId,
        is_verified: faker.datatype.boolean(),
        valid_from: faker.date.past({ years: 1 }),
        valid_to: faker.date.future({ years: 2 }),
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM',
        status: 'ACTIVE'
      });
      
      documents.push({
        document_unique_id: docUniqueId,
        document_id: docUploadId,
        customer_id: customerId,
        document_type_id: docType,
        document_number: 'DOC' + faker.string.numeric(10),
        valid_from: faker.date.past({ years: 1 }),
        valid_to: faker.date.future({ years: 2 }),
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM',
        status: 'ACTIVE'
      });
    }
  }

  // Insert data
  console.log('📤 Inserting addresses...');
  await knex('tms_address').insert(addresses);
  
  console.log('📤 Inserting document uploads...');
  await knex('document_upload').insert(documentUploads);
  
  console.log('📤 Inserting basic information...');
  await knex('consignor_basic_information').insert(basicInfo);
  
  console.log('📤 Inserting organizations...');
  await knex('consignor_organization').insert(organizations);
  
  console.log('📤 Inserting contacts...');
  await knex('contact').insert(contacts);
  
  console.log('📤 Inserting documents...');
  await knex('consignor_documents').insert(documents);
  
  console.log('');
  console.log('🎉 Successfully populated 50 consignors!');
  console.log('📊 Summary:');
  console.log('   - Consignors: 50');
  console.log('   - Addresses: ' + addresses.length);
  console.log('   - Organizations: ' + organizations.length);
  console.log('   - Contacts: ' + contacts.length);
  console.log('   - Documents: ' + documents.length);
  console.log('   - Document Uploads: ' + documentUploads.length);
};
