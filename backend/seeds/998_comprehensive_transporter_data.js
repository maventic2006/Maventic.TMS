/**
 * Comprehensive Transporter Data Population
 * 
 * This seed:
 * 1. Updates existing transporter IDs to follow backend pattern (T###)
 * 2. Populates 50+ transporters with complete relational data
 * 3. Maintains referential integrity across all tables
 * 
 * Tables populated:
 * - transporter_general_info (50+ transporters)
 * - tms_address (50+ addresses, linked via user_reference_id)
 * - transporter_contact (50+ contacts)
 * - transporter_service_area_hdr (50+ service areas)
 * - transporter_service_area_itm (150+ service states)
 * - transporter_documents (100+ documents)
 * - document_upload (100+ document uploads)
 * 
 * ID Generation Pattern (from backend):
 * - Transporter ID: T### (e.g., T001, T002, T003)
 * - Address ID: ADDR#### (e.g., ADDR0001, ADDR0002)
 * - Contact ID: TC#### (e.g., TC0001, TC0002)
 * - Service Area Header ID: SAH#### (e.g., SAH0001)
 * - Service Area Item ID: SAI#### (e.g., SAI0001)
 * - Document ID: DOC#### (e.g., DOC0001)
 * - Document Upload ID: DU#### (e.g., DU0001)
 */

exports.seed = async function (knex) {
  console.log('\n🌱 Starting comprehensive transporter data population...\n');

  try {
    // Step 1: Fix existing transporter IDs to follow T### pattern
    console.log('📋 Step 1: Updating existing transporter IDs to follow T### pattern...');
    
    const existingTransporters = await knex('transporter_general_info')
      .select('transporter_unique_id', 'transporter_id')
      .orderBy('transporter_unique_id');
    
    console.log(`Found ${existingTransporters.length} existing transporters`);
    
    // Update existing IDs in dependent tables first, then main table
    for (let i = 0; i < existingTransporters.length; i++) {
      const oldId = existingTransporters[i].transporter_id;
      const newId = `T${(i + 1).toString().padStart(3, '0')}`;
      
      if (oldId !== newId) {
        console.log(`  Updating ${oldId} → ${newId}`);
        
        // Update in transporter_contact
        await knex('transporter_contact')
          .where('transporter_id', oldId)
          .update({ transporter_id: newId });
        
        // Update in transporter_service_area_hdr
        await knex('transporter_service_area_hdr')
          .where('transporter_id', oldId)
          .update({ transporter_id: newId });
        
        // Update in transporter_general_info
        await knex('transporter_general_info')
          .where('transporter_id', oldId)
          .update({ transporter_id: newId });
      }
    }
    
    console.log('✅ Existing transporter IDs updated\n');
    
    // Step 2: Generate 50 new transporters with complete data
    console.log('📦 Step 2: Generating 50 new transporters with complete data...\n');
    
    const startIndex = existingTransporters.length + 1;
    const totalTransporters = 50;
    
    // Sample data arrays for realistic generation
    const businessTypes = [
      'Logistics Provider', 'Freight Forwarder', 'Express Courier',
      'Road Transport', 'Cold Chain Logistics', 'Warehousing & Distribution',
      'Last Mile Delivery', 'Heavy Haul Transport', 'Specialized Cargo',
      'International Freight', 'Domestic Courier', '3PL Provider'
    ];
    
    const businessNames = [
      'Express', 'Swift', 'Global', 'Metro', 'Coastal', 'Northern',
      'Eastern', 'Western', 'Central', 'Prime', 'Rapid', 'Elite',
      'Apex', 'Summit', 'Pioneer', 'Velocity', 'Dynamic', 'Phoenix',
      'Zenith', 'Titan', 'Vertex', 'Nexus', 'Quantum', 'Stellar'
    ];
    
    const businessSuffixes = [
      'Logistics', 'Transport', 'Freight', 'Cargo', 'Express',
      'Solutions', 'Services', 'Network', 'Systems', 'Corporation'
    ];
    
    const indianStates = [
      'Maharashtra', 'Gujarat', 'Karnataka', 'Tamil Nadu', 'Kerala',
      'Andhra Pradesh', 'Telangana', 'West Bengal', 'Uttar Pradesh',
      'Delhi', 'Haryana', 'Punjab', 'Rajasthan', 'Madhya Pradesh',
      'Odisha', 'Bihar', 'Jharkhand', 'Chhattisgarh', 'Goa'
    ];
    
    const indianCities = {
      'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad'],
      'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar'],
      'Karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum'],
      'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'],
      'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam'],
      'Delhi': ['New Delhi', 'Delhi Cantonment', 'Dwarka', 'Rohini'],
      'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Noida'],
      'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Siliguri', 'Asansol'],
      'Haryana': ['Gurgaon', 'Faridabad', 'Panipat', 'Ambala', 'Rohtak'],
      'Punjab': ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala']
    };
    
    const documentTypes = [
      'PAN Card', 'GST Certificate', 'Business License', 'Transport License',
      'Insurance Certificate', 'ISO Certification', 'Trade License'
    ];
    
    const personNames = [
      'Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sunita Reddy',
      'Vikram Singh', 'Anjali Gupta', 'Rahul Verma', 'Neha Agarwal',
      'Suresh Nair', 'Kavita Iyer', 'Manoj Desai', 'Pooja Joshi',
      'Arun Mehta', 'Divya Shah', 'Kiran Rao', 'Sanjay Malhotra',
      'Meera Menon', 'Ravi Krishnan', 'Deepa Bhat', 'Ashok Pandey'
    ];
    
    const roles = [
      'Operations Manager', 'Fleet Manager', 'General Manager',
      'Logistics Coordinator', 'Regional Manager', 'Branch Manager',
      'Operations Head', 'Business Development Manager'
    ];
    
    const statuses = ['Active', 'Pending', 'Inactive'];
    const statusWeights = [70, 20, 10]; // 70% Active, 20% Pending, 10% Inactive
    
    // Helper function to get weighted random status
    const getRandomStatus = () => {
      const random = Math.random() * 100;
      let cumulative = 0;
      for (let i = 0; i < statuses.length; i++) {
        cumulative += statusWeights[i];
        if (random < cumulative) return statuses[i];
      }
      return 'Active';
    };
    
    // Helper function to generate Indian GST number
    const generateGST = (stateCode) => {
      const randomPAN = String(Math.random()).slice(2, 7).toUpperCase();
      const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      return `${stateCode}${randomPAN}${randomNum}1Z5`;
    };
    
    // State code mapping for GST
    const stateCodes = {
      'Maharashtra': '27', 'Gujarat': '24', 'Karnataka': '29', 'Tamil Nadu': '33',
      'Kerala': '32', 'Delhi': '07', 'Uttar Pradesh': '09', 'West Bengal': '19',
      'Haryana': '06', 'Punjab': '03'
    };
    
    const transporters = [];
    const addresses = [];
    const contacts = [];
    const serviceAreaHeaders = [];
    const serviceAreaItems = [];
    const documents = [];
    const documentUploads = [];
    
    for (let i = 0; i < totalTransporters; i++) {
      const index = startIndex + i;
      const transporterId = `T${index.toString().padStart(3, '0')}`;
      const addressId = `ADDR${index.toString().padStart(4, '0')}`;
      const contactId = `TC${index.toString().padStart(4, '0')}`;
      const serviceAreaHdrId = `SAH${index.toString().padStart(4, '0')}`;
      
      // Random data generation
      const businessType = businessTypes[Math.floor(Math.random() * businessTypes.length)];
      const businessName = `${businessNames[Math.floor(Math.random() * businessNames.length)]} ${businessSuffixes[Math.floor(Math.random() * businessSuffixes.length)]}`;
      const state = indianStates[Math.floor(Math.random() * indianStates.length)];
      const citiesInState = indianCities[state] || ['Mumbai'];
      const city = citiesInState[Math.floor(Math.random() * citiesInState.length)];
      const status = getRandomStatus();
      const rating = (3.5 + Math.random() * 1.5).toFixed(1);
      const stateCode = stateCodes[state] || '27';
      const gstNumber = generateGST(stateCode);
      
      // Transport modes (70% have Road, 30% multi-modal)
      const hasRoad = Math.random() < 0.95;
      const hasRail = Math.random() < 0.30;
      const hasAir = Math.random() < 0.25;
      const hasSea = Math.random() < 0.15;
      
      // Transporter general info
      transporters.push({
        transporter_id: transporterId,
        user_type: businessType,
        business_name: businessName,
        trans_mode_road: hasRoad,
        trans_mode_rail: hasRail,
        trans_mode_air: hasAir,
        trans_mode_sea: hasSea,
        active_flag: status === 'Active',
        from_date: '2024-01-01',
        to_date: '2025-12-31',
        address_id: addressId,
        avg_rating: parseFloat(rating),
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM',
        status: status
      });
      
      // Address
      addresses.push({
        address_id: addressId,
        user_reference_id: transporterId,
        user_type: 'Transporter',
        country: 'India',
        vat_number: gstNumber,
        street_1: `${Math.floor(Math.random() * 500) + 1}, ${['MG Road', 'Ring Road', 'Bypass Road', 'Main Street', 'Industrial Area'][Math.floor(Math.random() * 5)]}`,
        street_2: `${['Sector', 'Phase', 'Block', 'Zone'][Math.floor(Math.random() * 4)]} ${Math.floor(Math.random() * 50) + 1}`,
        city: city,
        district: city,
        state: state,
        postal_code: (400000 + Math.floor(Math.random() * 100000)).toString(),
        is_primary: true,
        address_type_id: 'AT001',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM',
        status: 'ACTIVE'
      });
      
      // Contact
      const contactPerson = personNames[Math.floor(Math.random() * personNames.length)];
      const role = roles[Math.floor(Math.random() * roles.length)];
      const phoneNumber = `+91-${9800000000 + Math.floor(Math.random() * 99999999)}`;
      const emailPrefix = contactPerson.toLowerCase().replace(' ', '.');
      const emailDomain = businessName.toLowerCase().replace(' ', '').slice(0, 15);
      
      contacts.push({
        tcontact_id: contactId,
        transporter_id: transporterId,
        contact_person_name: contactPerson,
        role: role,
        phone_number: phoneNumber,
        alternate_phone_number: `+91-${9800000000 + Math.floor(Math.random() * 99999999)}`,
        whats_app_number: phoneNumber,
        email_id: `${emailPrefix}@${emailDomain}.com`,
        alternate_email_id: `${emailPrefix.split('.')[0]}@${emailDomain}.com`,
        address_id: addressId,
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM'
      });
      
      // Service Area Header
      serviceAreaHeaders.push({
        service_area_hdr_id: serviceAreaHdrId,
        transporter_id: transporterId,
        service_country: 'India',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM'
      });
      
      // Service Area Items (2-4 states per transporter)
      const numStates = Math.floor(Math.random() * 3) + 2;
      const selectedStates = [...indianStates]
        .sort(() => 0.5 - Math.random())
        .slice(0, numStates);
      
      selectedStates.forEach((serviceState, stateIndex) => {
        const serviceAreaItemId = `SAI${(index * 10 + stateIndex).toString().padStart(4, '0')}`;
        serviceAreaItems.push({
          service_area_itm_id: serviceAreaItemId,
          service_area_hdr_id: serviceAreaHdrId,
          service_state: serviceState,
          created_by: 'SYSTEM',
          updated_by: 'SYSTEM'
        });
      });
      
      // Documents (2 documents per transporter)
      for (let docIndex = 0; docIndex < 2; docIndex++) {
        const documentUniqueId = `DU${(index * 10 + docIndex).toString().padStart(5, '0')}`;
        const documentId = `DOC${(index * 10 + docIndex).toString().padStart(4, '0')}`;
        const docType = documentTypes[Math.floor(Math.random() * documentTypes.length)];
        const docNumber = `${docType.slice(0, 3).toUpperCase()}-${Math.floor(Math.random() * 1000000)}`;
        
        documents.push({
          document_unique_id: documentUniqueId,
          document_id: documentId,
          document_type_id: `DT00${docIndex + 1}`,
          document_number: docNumber,
          reference_number: transporterId, // Store transporter_id for relationship
          country: 'India',
          valid_from: '2024-01-01',
          valid_to: '2025-12-31',
          active: true,
          user_type: 'Transporter',
          created_by: 'SYSTEM',
          updated_by: 'SYSTEM',
          status: 'ACTIVE'
        });
        
        documentUploads.push({
          document_id: documentId,
          file_name: `${transporterId}_${docType.replace(' ', '_')}.pdf`,
          file_type: 'application/pdf',
          file_xstring_value: `BASE64_ENCODED_CONTENT_${documentId}`,
          system_reference_id: transporterId,
          is_verified: Math.random() < 0.8, // 80% verified
          valid_from: '2024-01-01',
          valid_to: '2025-12-31',
          created_by: 'SYSTEM',
          updated_by: 'SYSTEM',
          status: 'ACTIVE'
        });
      }
    }
    
    // Step 3: Insert all data with proper error handling
    console.log('💾 Step 3: Inserting data into database...\n');
    
    // Insert transporters
    console.log(`  📦 Inserting ${transporters.length} transporters...`);
    for (const transporter of transporters) {
      await knex('transporter_general_info')
        .insert(transporter)
        .onConflict('transporter_id')
        .merge();
    }
    console.log(`  ✅ Transporters inserted`);
    
    // Insert addresses
    console.log(`  📍 Inserting ${addresses.length} addresses...`);
    for (const address of addresses) {
      await knex('tms_address')
        .insert(address)
        .onConflict('address_id')
        .merge();
    }
    console.log(`  ✅ Addresses inserted`);
    
    // Insert contacts
    console.log(`  📞 Inserting ${contacts.length} contacts...`);
    for (const contact of contacts) {
      await knex('transporter_contact')
        .insert(contact)
        .onConflict('tcontact_id')
        .merge();
    }
    console.log(`  ✅ Contacts inserted`);
    
    // Insert service area headers
    console.log(`  🗺️  Inserting ${serviceAreaHeaders.length} service area headers...`);
    for (const header of serviceAreaHeaders) {
      await knex('transporter_service_area_hdr')
        .insert(header)
        .onConflict('service_area_hdr_id')
        .merge();
    }
    console.log(`  ✅ Service area headers inserted`);
    
    // Insert service area items
    console.log(`  📍 Inserting ${serviceAreaItems.length} service area items...`);
    for (const item of serviceAreaItems) {
      await knex('transporter_service_area_itm')
        .insert(item)
        .onConflict('service_area_itm_id')
        .merge();
    }
    console.log(`  ✅ Service area items inserted`);
    
    // Insert documents
    console.log(`  📄 Inserting ${documents.length} documents...`);
    for (const doc of documents) {
      await knex('transporter_documents')
        .insert(doc)
        .onConflict('document_unique_id')
        .merge();
    }
    console.log(`  ✅ Documents inserted`);
    
    // Insert document uploads
    console.log(`  📤 Inserting ${documentUploads.length} document uploads...`);
    for (const upload of documentUploads) {
      await knex('document_upload')
        .insert(upload)
        .onConflict('document_id')
        .merge();
    }
    console.log(`  ✅ Document uploads inserted`);
    
    console.log('\n🎉 Data population completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Total Transporters: ${existingTransporters.length + totalTransporters}`);
    console.log(`   - New Transporters: ${totalTransporters}`);
    console.log(`   - Addresses: ${addresses.length}`);
    console.log(`   - Contacts: ${contacts.length}`);
    console.log(`   - Service Area Headers: ${serviceAreaHeaders.length}`);
    console.log(`   - Service Area Items: ${serviceAreaItems.length}`);
    console.log(`   - Documents: ${documents.length}`);
    console.log(`   - Document Uploads: ${documentUploads.length}\n`);
    
    // Verification
    const totalTransportersInDB = await knex('transporter_general_info').count('* as count').first();
    const totalAddressesInDB = await knex('tms_address').where('user_type', 'Transporter').count('* as count').first();
    const totalContactsInDB = await knex('transporter_contact').count('* as count').first();
    
    console.log('✅ Verification:');
    console.log(`   - Transporters in DB: ${totalTransportersInDB.count}`);
    console.log(`   - Addresses in DB: ${totalAddressesInDB.count}`);
    console.log(`   - Contacts in DB: ${totalContactsInDB.count}\n`);
    
  } catch (error) {
    console.error('❌ Error populating transporter data:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  }
};
