/**
 * Comprehensive Transporter Sample Data Seed
 * This seed file populates the database with realistic transporter data
 * Run with: npx knex seed:run --specific=999_transporter_complete_sample_data.js
 */

exports.seed = async function (knex) {
  console.log('🌱 Starting transporter data seeding...');

  try {
    // 1. Insert Transporters (without deleting to avoid FK issues)
    console.log('📦 Seeding transporters...');
    
    const transporters = [
      {
        transporter_id: 'TRP001',
        user_type: 'Logistics Provider',
        business_name: 'Swift Express Logistics',
        trans_mode_road: true,
        trans_mode_rail: false,
        trans_mode_air: true,
        trans_mode_sea: false,
        active_flag: true,
        from_date: '2024-01-01',
        to_date: '2025-12-31',
        address_id: 'A001',
        avg_rating: 4.7,
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM',
        status: 'Active',
      },
      {
        transporter_id: 'TRP002',
        user_type: 'Freight Forwarder',
        business_name: 'Global Freight Solutions',
        trans_mode_road: true,
        trans_mode_rail: true,
        trans_mode_air: true,
        trans_mode_sea: true,
        active_flag: true,
        from_date: '2024-01-01',
        to_date: '2025-12-31',
        address_id: 'A002',
        avg_rating: 4.5,
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM',
        status: 'Active',
      },
      {
        transporter_id: 'TRP003',
        user_type: 'Road Transport',
        business_name: 'Metro City Transporters',
        trans_mode_road: true,
        trans_mode_rail: false,
        trans_mode_air: false,
        trans_mode_sea: false,
        active_flag: true,
        from_date: '2024-02-01',
        to_date: '2025-12-31',
        address_id: 'A003',
        avg_rating: 4.2,
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM',
        status: 'Pending',
      },
      {
        transporter_id: 'TRP004',
        user_type: 'Logistics Provider',
        business_name: 'Coastal Cargo Services',
        trans_mode_road: true,
        trans_mode_rail: false,
        trans_mode_air: false,
        trans_mode_sea: true,
        active_flag: true,
        from_date: '2024-01-15',
        to_date: '2025-12-31',
        address_id: 'A004',
        avg_rating: 4.8,
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM',
        status: 'Active',
      },
      {
        transporter_id: 'TRP005',
        user_type: 'Express Courier',
        business_name: 'Air Express Couriers',
        trans_mode_road: true,
        trans_mode_rail: false,
        trans_mode_air: true,
        trans_mode_sea: false,
        active_flag: true,
        from_date: '2024-03-01',
        to_date: '2025-12-31',
        address_id: 'A005',
        avg_rating: 4.9,
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM',
        status: 'Active',
      },
      {
        transporter_id: 'TRP006',
        user_type: 'Logistics Provider',
        business_name: 'Northern Rail Logistics',
        trans_mode_road: true,
        trans_mode_rail: true,
        trans_mode_air: false,
        trans_mode_sea: false,
        active_flag: false,
        from_date: '2024-01-01',
        to_date: '2024-06-30',
        address_id: 'A006',
        avg_rating: 3.8,
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM',
        status: 'Inactive',
      },
      {
        transporter_id: 'TRP007',
        user_type: 'Freight Forwarder',
        business_name: 'Eastern Express Transport',
        trans_mode_road: true,
        trans_mode_rail: false,
        trans_mode_air: true,
        trans_mode_sea: false,
        active_flag: true,
        from_date: '2024-02-15',
        to_date: '2025-12-31',
        address_id: 'A007',
        avg_rating: 4.4,
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM',
        status: 'Pending',
      },
      {
        transporter_id: 'TRP008',
        user_type: 'Road Transport',
        business_name: 'Western Highway Movers',
        trans_mode_road: true,
        trans_mode_rail: false,
        trans_mode_air: false,
        trans_mode_sea: false,
        active_flag: true,
        from_date: '2024-01-20',
        to_date: '2025-12-31',
        address_id: 'A008',
        avg_rating: 4.1,
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM',
        status: 'Active',
      },
    ];

    // Insert with upsert logic to avoid duplicates
    for (const transporter of transporters) {
      await knex('transporter_general_info')
        .insert(transporter)
        .onConflict('transporter_id')
        .merge();
    }

    console.log(`✅ Inserted ${transporters.length} transporters`);

    // 2. Insert Transporter Contacts
    console.log('📞 Seeding transporter contacts...');
    
    const contacts = [
      {
        tcontact_id: 'TC001',
        transporter_id: 'TRP001',
        contact_person_name: 'Rajesh Kumar',
        role: 'Operations Manager',
        phone_number: '+91-9876543210',
        alternate_phone_number: '+91-9876543211',
        whats_app_number: '+91-9876543210',
        email_id: 'rajesh.kumar@swiftexpress.com',
        alternate_email_id: 'r.kumar@swiftexpress.com',
        address_id: 'A001',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM',
      },
      {
        tcontact_id: 'TC002',
        transporter_id: 'TRP002',
        contact_person_name: 'Priya Sharma',
        role: 'Fleet Manager',
        phone_number: '+91-9876543220',
        alternate_phone_number: '+91-9876543221',
        whats_app_number: '+91-9876543220',
        email_id: 'priya.sharma@globalfreight.com',
        alternate_email_id: 'p.sharma@globalfreight.com',
        address_id: 'A002',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM',
      },
      {
        tcontact_id: 'TC003',
        transporter_id: 'TRP003',
        contact_person_name: 'Amit Patel',
        role: 'General Manager',
        phone_number: '+91-9876543230',
        alternate_phone_number: '+91-9876543231',
        whats_app_number: '+91-9876543230',
        email_id: 'amit.patel@metrocity.com',
        alternate_email_id: 'a.patel@metrocity.com',
        address_id: 'A003',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM',
      },
      {
        tcontact_id: 'TC004',
        transporter_id: 'TRP004',
        contact_person_name: 'Sunita Reddy',
        role: 'Logistics Coordinator',
        phone_number: '+91-9876543240',
        alternate_phone_number: '+91-9876543241',
        whats_app_number: '+91-9876543240',
        email_id: 'sunita.reddy@coastalcargo.com',
        alternate_email_id: 's.reddy@coastalcargo.com',
        address_id: 'A004',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM',
      },
      {
        tcontact_id: 'TC005',
        transporter_id: 'TRP005',
        contact_person_name: 'Vikram Singh',
        role: 'Regional Manager',
        phone_number: '+91-9876543250',
        alternate_phone_number: '+91-9876543251',
        whats_app_number: '+91-9876543250',
        email_id: 'vikram.singh@airexpress.com',
        alternate_email_id: 'v.singh@airexpress.com',
        address_id: 'A005',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM',
      },
    ];

    for (const contact of contacts) {
      await knex('transporter_contact')
        .insert(contact)
        .onConflict('tcontact_id')
        .merge();
    }

    console.log(`✅ Inserted ${contacts.length} contacts`);

    // 3. Insert Service Area Headers
    console.log('🗺️  Seeding service areas...');
    
    const serviceAreaHeaders = [
      {
        service_area_hdr_id: 'SAH001',
        transporter_id: 'TRP001',
        service_country: 'India',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM',
      },
      {
        service_area_hdr_id: 'SAH002',
        transporter_id: 'TRP002',
        service_country: 'India',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM',
      },
      {
        service_area_hdr_id: 'SAH003',
        transporter_id: 'TRP003',
        service_country: 'India',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM',
      },
      {
        service_area_hdr_id: 'SAH004',
        transporter_id: 'TRP004',
        service_country: 'India',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM',
      },
      {
        service_area_hdr_id: 'SAH005',
        transporter_id: 'TRP005',
        service_country: 'India',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM',
      },
    ];

    for (const header of serviceAreaHeaders) {
      await knex('transporter_service_area_hdr')
        .insert(header)
        .onConflict('service_area_hdr_id')
        .merge();
    }

    console.log(`✅ Inserted ${serviceAreaHeaders.length} service area headers`);

    // 4. Insert Service Area Items
    const serviceAreaItems = [
      // TRP001 - Swift Express - operates in West India
      { service_area_itm_id: 'SAI001', service_area_hdr_id: 'SAH001', service_state: 'Maharashtra', created_by: 'SYSTEM', updated_by: 'SYSTEM' },
      { service_area_itm_id: 'SAI002', service_area_hdr_id: 'SAH001', service_state: 'Gujarat', created_by: 'SYSTEM', updated_by: 'SYSTEM' },
      { service_area_itm_id: 'SAI003', service_area_hdr_id: 'SAH001', service_state: 'Goa', created_by: 'SYSTEM', updated_by: 'SYSTEM' },
      
      // TRP002 - Global Freight - pan India
      { service_area_itm_id: 'SAI004', service_area_hdr_id: 'SAH002', service_state: 'Delhi', created_by: 'SYSTEM', updated_by: 'SYSTEM' },
      { service_area_itm_id: 'SAI005', service_area_hdr_id: 'SAH002', service_state: 'Karnataka', created_by: 'SYSTEM', updated_by: 'SYSTEM' },
      { service_area_itm_id: 'SAI006', service_area_hdr_id: 'SAH002', service_state: 'Tamil Nadu', created_by: 'SYSTEM', updated_by: 'SYSTEM' },
      { service_area_itm_id: 'SAI007', service_area_hdr_id: 'SAH002', service_state: 'West Bengal', created_by: 'SYSTEM', updated_by: 'SYSTEM' },
      
      // TRP003 - Metro City - North India
      { service_area_itm_id: 'SAI008', service_area_hdr_id: 'SAH003', service_state: 'Uttar Pradesh', created_by: 'SYSTEM', updated_by: 'SYSTEM' },
      { service_area_itm_id: 'SAI009', service_area_hdr_id: 'SAH003', service_state: 'Haryana', created_by: 'SYSTEM', updated_by: 'SYSTEM' },
      { service_area_itm_id: 'SAI010', service_area_hdr_id: 'SAH003', service_state: 'Punjab', created_by: 'SYSTEM', updated_by: 'SYSTEM' },
      
      // TRP004 - Coastal Cargo - Coastal regions
      { service_area_itm_id: 'SAI011', service_area_hdr_id: 'SAH004', service_state: 'Kerala', created_by: 'SYSTEM', updated_by: 'SYSTEM' },
      { service_area_itm_id: 'SAI012', service_area_hdr_id: 'SAH004', service_state: 'Andhra Pradesh', created_by: 'SYSTEM', updated_by: 'SYSTEM' },
      { service_area_itm_id: 'SAI013', service_area_hdr_id: 'SAH004', service_state: 'Odisha', created_by: 'SYSTEM', updated_by: 'SYSTEM' },
      
      // TRP005 - Air Express - Major cities
      { service_area_itm_id: 'SAI014', service_area_hdr_id: 'SAH005', service_state: 'Maharashtra', created_by: 'SYSTEM', updated_by: 'SYSTEM' },
      { service_area_itm_id: 'SAI015', service_area_hdr_id: 'SAH005', service_state: 'Karnataka', created_by: 'SYSTEM', updated_by: 'SYSTEM' },
      { service_area_itm_id: 'SAI016', service_area_hdr_id: 'SAH005', service_state: 'Delhi', created_by: 'SYSTEM', updated_by: 'SYSTEM' },
    ];

    for (const item of serviceAreaItems) {
      await knex('transporter_service_area_itm')
        .insert(item)
        .onConflict('service_area_itm_id')
        .merge();
    }

    console.log(`✅ Inserted ${serviceAreaItems.length} service area items`);

    console.log('🎉 Transporter data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${transporters.length} Transporters`);
    console.log(`   - ${contacts.length} Contacts`);
    console.log(`   - ${serviceAreaHeaders.length} Service Areas`);
    console.log(`   - ${serviceAreaItems.length} Service States`);

  } catch (error) {
    console.error('❌ Error seeding transporter data:', error.message);
    throw error;
  }
};
