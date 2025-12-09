exports.seed = async function(knex) {
  try {
    // Delete existing entries in dependency order
    await knex('trip_invoices_header').del();
    await knex('trip').del();
    await knex('master_trip').del();
    await knex('vehicle_tracking_data').del();
    await knex('indent_assigned_vehicle').del();
    await knex('ebidding_transaction_hdr').del();
    await knex('ebidding_header').del();
    await knex('ebidding_auction_slot').del();
    await knex('additional_service').del();
    await knex('indent_drop_location').del();
    await knex('indent_vehicle').del();
    await knex('indent_item').del();
    await knex('indent_header').del();

    // 1. Indent Header - Main order
    await knex('indent_header').insert([
      {
        indent_id: 'IND001',
        consignor_id: 'CON001',
        warehouse_id: 'WH001',
        creation_medium: 'WEB_PORTAL',
        warehouse_gate_sub_type_id: 'GATE001',
        goods_loading_point_id: 'LP001',
        priority_order_identifier: 1,
        e_bidding_eligible: true,
        ebidding_slot_number: 'SLOT001',
        comments: 'Urgent delivery required for manufacturing unit',
        indent_status: 'APPROVED',
        total_freight_amount: 25000.00,
        currency: 'INR',
        created_at: knex.fn.now(),
        created_on: knex.fn.now(),
        created_by: 'SYSTEM',
        updated_at: knex.fn.now(),
        updated_on: knex.fn.now(),
        updated_by: 'SYSTEM',
        status: 'ACTIVE'
      },
      {
        indent_id: 'IND002',
        consignor_id: 'CON002',
        warehouse_id: 'WH002',
        creation_medium: 'MOBILE_APP',
        warehouse_gate_sub_type_id: 'GATE002',
        goods_loading_point_id: 'LP002',
        priority_order_identifier: 2,
        e_bidding_eligible: false,
        ebidding_slot_number: null,
        comments: 'Regular delivery schedule',
        indent_status: 'PENDING',
        total_freight_amount: 18500.00,
        currency: 'INR',
        created_at: knex.fn.now(),
        created_on: knex.fn.now(),
        created_by: 'SYSTEM',
        updated_at: knex.fn.now(),
        updated_on: knex.fn.now(),
        updated_by: 'SYSTEM',
        status: 'ACTIVE'
      }
    ]);

    // 2. Indent Items - Line items
    await knex('indent_item').insert([
      {
        indent_id_item: 'IND001_ITM001',
        indent_id: 'IND001',
        material_id: 'MAT001',
        material_master_id: 'MM001',
        quantity: 1000.000,
        quantity_unit: 'KG',
        material_description: 'Steel rods for construction',
        material_value: 50000.00,
        material_value_currency: 'INR',
        volumetric_weight: 1200.000,
        volumetric_unit: 'KG',
        gross_weight: 1100.000,
        net_weight: 1000.000,
        weight_unit: 'KG',
        created_at: knex.fn.now(),
        created_on: knex.fn.now(),
        created_by: 'SYSTEM',
        updated_at: knex.fn.now(),
        updated_on: knex.fn.now(),
        updated_by: 'SYSTEM',
        status: 'ACTIVE'
      }
    ]);

    // 3. Indent Vehicle Requirements
    await knex('indent_vehicle').insert([
      {
        indent_vehicle_id: 'IND001_VEH001',
        indent_id: 'IND001',
        required_vehicle_type: 'Heavy Duty Truck',
        required_capacity: 16.20,
        capacity_unit: 'TONS',
        vehicle_quantity: 1,
        reporting_timestamp: '2024-01-15 08:00:00',
        dispatch_timestamp: '2024-01-15 10:00:00',
        base_freight_rate: 25.00,
        base_freight_unit: 'PER_KM',
        tolerance_amount: 2.50,
        currency: 'INR',
        created_at: knex.fn.now(),
        created_on: knex.fn.now(),
        created_by: 'SYSTEM',
        updated_at: knex.fn.now(),
        updated_on: knex.fn.now(),
        updated_by: 'SYSTEM',
        status: 'ACTIVE'
      }
    ]);

    // 4. Drop Locations
    await knex('indent_drop_location').insert([
      {
        drop_location_id: 'IND001_DROP001',
        indent_vehicle_id: 'IND001_VEH001',
        vehicle_drop_serial: 1,
        point: 'Manufacturing Plant - Pune',
        drop_latitude: 18.520430,
        drop_longitude: 73.856744,
        drop_address: 'Plot No. 123, MIDC Industrial Area, Pune, Maharashtra 411019',
        drop_warehouse_id: 'DWH001',
        warehouse_gate_sub_type_id: 'DGATE001',
        goods_unloading_point_id: 'ULP001',
        receiver_name: 'Rajesh Kumar',
        receiver_contact: '+91-9876543210',
        expected_delivery_date_time: '2024-01-16 14:00:00',
        alternate_mobile: '+91-9876543211',
        email_id: 'rajesh.kumar@manufacturing.com',
        expected_transit_time: 18,
        estimated_transit_time: 20,
        transit_distance: 450.50,
        gross_weight: 1100.000,
        status: 'PLANNED',
        delayed_reason: null,
        created_at: knex.fn.now(),
        created_on: knex.fn.now(),
        created_by: 'SYSTEM',
        updated_at: knex.fn.now(),
        updated_on: knex.fn.now(),
        updated_by: 'SYSTEM',
        status_audit: 'ACTIVE'
      }
    ]);

    // 5. E-bidding Auction Slot
    await knex('ebidding_auction_slot').insert([
      {
        ebidding_auction_id: 'AUC001',
        consignor_id: 'CON001',
        ebidding_slot_number: 'SLOT001',
        warehouse_id: 'WH001',
        auction_start_date: '2024-01-14',
        auction_start_time: '09:00:00',
        auction_end_date: '2024-01-14',
        auction_end_time: '11:00:00',
        auction_duration: 120,
        status: 'COMPLETED',
        created_at: knex.fn.now(),
        created_on: knex.fn.now(),
        created_by: 'SYSTEM',
        updated_at: knex.fn.now(),
        updated_on: knex.fn.now(),
        updated_by: 'SYSTEM',
        status_audit: 'ACTIVE'
      }
    ]);

    // 6. Assigned Vehicle
    await knex('indent_assigned_vehicle').insert([
      {
        vehicle_assignment_id: 'VA001',
        indent_id: 'IND001',
        indent_vehicle_id: 'IND001_VEH001',
        transporter_id: 'TR001',
        vehicle_type: 'Heavy Duty Truck',
        vehicle_id: 'VH001',
        driver_id: 'DRV001',
        driver_temp_mobile_number: '+91-9876543220',
        vehicle_owner_id: 'OWN001',
        status: 'ASSIGNED',
        created_at: knex.fn.now(),
        created_on: knex.fn.now(),
        created_by: 'SYSTEM',
        updated_at: knex.fn.now(),
        updated_on: knex.fn.now(),
        updated_by: 'SYSTEM',
        status_audit: 'ACTIVE'
      }
    ]);

    // 7. Master Trip
    await knex('master_trip').insert([
      {
        master_trip_id: 'MT001',
        consignor_id: 'CON001',
        trip_status: 'IN_PROGRESS',
        status: 'ACTIVE',
        currency: 'INR',
        start_date: '2024-01-15',
        start_time: '10:00:00',
        transporter_id: 'TR001',
        vehicle_id: 'VH001',
        driver_id: 'DRV001',
        mode_of_transportation: 'ROAD',
        pick_up_warehouse_id: 'WH001',
        pick_up_warehouse_gate_sub_type_id: 'GATE001',
        goods_loading_point_id: 'LP001',
        distance_to_be_covered: 450.50,
        is_round_trip: false,
        trip_start_date_time: '2024-01-15 10:30:00',
        lr_number: 'LR001234567',
        freight_rate: 25.00,
        freight_rate_unit: 'PER_KM',
        freight_value: 11262.50,
        freight_value_currency: 'INR',
        indent_id: 'IND001',
        reference_master_trip_id: null,
        priority_order_identifier: 1,
        yard_entry_number: 'YE001',
        gate_in_timestamp: '2024-01-15 09:45:00',
        gate_out_timestamp: '2024-01-15 10:30:00',
        created_at: knex.fn.now(),
        created_on: knex.fn.now(),
        created_by: 'SYSTEM',
        updated_at: knex.fn.now(),
        updated_on: knex.fn.now(),
        updated_by: 'SYSTEM',
        status_audit: 'ACTIVE'
      }
    ]);

    console.log('✅ Indent and Trip workflow sample data seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding indent and trip data:', error.message);
    throw error;
  }
};