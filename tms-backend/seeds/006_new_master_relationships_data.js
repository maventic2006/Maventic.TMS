exports.seed = async function(knex) {
  // Delete existing entries for the tables we're updating
  await knex('message_master').del();
  await knex('material_master_information').del();
  await knex('tms_address').del();

  // Insert addresses with proper foreign key references
  await knex('tms_address').insert([
    {
      address_id: 'ADDR001',
      user_reference_id: 'USR001',
      user_type: 'TRANSPORTER',
      country: 'India',
      vat_number: 'GST001234567890',
      street_1: '123 Transport Hub Street',
      street_2: 'Logistics Park',
      city: 'Mumbai',
      district: 'Mumbai Suburban',
      state: 'Maharashtra',
      postal_code: '400001',
      is_primary: true,
      address_type_id: 'AT002', // Office Address
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      address_id: 'ADDR002',
      user_reference_id: 'USR002',
      user_type: 'SHIPPER',
      country: 'India',
      vat_number: 'GST098765432109',
      street_1: '456 Industrial Area',
      street_2: 'Phase 2',
      city: 'Bangalore',
      district: 'Bangalore Urban',
      state: 'Karnataka',
      postal_code: '560001',
      is_primary: true,
      address_type_id: 'AT003', // Warehouse Address
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      address_id: 'ADDR003',
      user_reference_id: 'USR003',
      user_type: 'CUSTOMER',
      country: 'India',
      vat_number: 'GST567890123456',
      street_1: '789 Delivery Zone',
      street_2: 'Commercial Complex',
      city: 'Delhi',
      district: 'New Delhi',
      state: 'Delhi',
      postal_code: '110001',
      is_primary: true,
      address_type_id: 'AT004', // Delivery Point
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    }
  ]);

  // Insert material master with proper foreign key references
  await knex('material_master_information').insert([
    {
      material_master_id: 'MAT001',
      material_id: 'STEEL001',
      material_sector: 'Manufacturing',
      material_types_id: 'MT001', // Raw Materials
      description: 'Steel rods and bars for construction',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      material_master_id: 'MAT002',
      material_id: 'CHEM001',
      material_sector: 'Chemical',
      material_types_id: 'MT003', // Hazardous Materials
      description: 'Industrial chemicals requiring special handling',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      material_master_id: 'MAT003',
      material_id: 'FOOD001',
      material_sector: 'Food & Beverage',
      material_types_id: 'MT004', // Perishable Goods
      description: 'Fresh produce and packaged food items',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      material_master_id: 'MAT004',
      material_id: 'FRAG001',
      material_sector: 'Electronics',
      material_types_id: 'MT005', // Fragile Items
      description: 'Electronic components and devices',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    }
  ]);

  // Insert message master with proper foreign key references
  await knex('message_master').insert([
    {
      message_master_id: 'MSG001',
      message_type_id: 'MSG001', // Information
      application_id: 'TMS_VEHICLE',
      subject: 'Vehicle Service Due Notification',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      message_master_id: 'MSG002',
      message_type_id: 'MSG002', // Warning
      application_id: 'TMS_DOCUMENT',
      subject: 'Document Expiry Alert',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      message_master_id: 'MSG003',
      message_type_id: 'MSG003', // Error
      application_id: 'TMS_SYSTEM',
      subject: 'System Error Notification',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      message_master_id: 'MSG004',
      message_type_id: 'MSG004', // Success
      application_id: 'TMS_SHIPMENT',
      subject: 'Shipment Delivered Successfully',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      message_master_id: 'MSG005',
      message_type_id: 'MSG005', // Alert
      application_id: 'TMS_TRACKING',
      subject: 'GPS Tracking Alert',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    }
  ]);

  console.log('✅ Address, Material Master, and Message Master sample data with foreign key references seeded successfully!');
};