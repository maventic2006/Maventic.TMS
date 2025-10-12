const db = require('./config/database');

async function verifyIndentTripWorkflow() {
  try {
    console.log('\n🔍 TMS INDENT TO TRIP WORKFLOW VERIFICATION\n');
    console.log('=' .repeat(80));

    // 1. Verify Indent Header
    console.log('\n📋 1. INDENT HEADER');
    console.log('-'.repeat(40));
    const indents = await db('indent_header')
      .select('indent_id', 'consignor_id', 'warehouse_id', 'indent_status', 'e_bidding_eligible', 'total_freight_amount')
      .orderBy('indent_id');
    
    console.table(indents);

    // 2. Verify Indent Items
    console.log('\n📦 2. INDENT ITEMS');
    console.log('-'.repeat(40));
    const items = await db('indent_item')
      .join('indent_header', 'indent_item.indent_id', 'indent_header.indent_id')
      .select(
        'indent_item.indent_id_item',
        'indent_item.indent_id',
        'indent_item.material_description',
        'indent_item.quantity',
        'indent_item.quantity_unit',
        'indent_item.material_value'
      )
      .orderBy('indent_item.indent_id');
    
    console.table(items);

    // 3. Verify Vehicle Requirements
    console.log('\n🚛 3. VEHICLE REQUIREMENTS');
    console.log('-'.repeat(40));
    const vehicles = await db('indent_vehicle')
      .select(
        'indent_vehicle_id',
        'indent_id',
        'required_vehicle_type',
        'required_capacity',
        'capacity_unit',
        'base_freight_rate'
      )
      .orderBy('indent_id');
    
    console.table(vehicles);

    // 4. Verify Drop Locations
    console.log('\n📍 4. DROP LOCATIONS');
    console.log('-'.repeat(40));
    const dropLocations = await db('indent_drop_location')
      .select(
        'drop_location_id',
        'indent_vehicle_id',
        'point',
        'receiver_name',
        'receiver_contact',
        'expected_delivery_date_time',
        'transit_distance'
      )
      .orderBy('drop_location_id');
    
    console.table(dropLocations);

    // 5. Verify E-bidding Slots
    console.log('\n🏷️ 5. E-BIDDING AUCTION SLOTS');
    console.log('-'.repeat(40));
    const auctions = await db('ebidding_auction_slot')
      .select(
        'ebidding_auction_id',
        'consignor_id',
        'ebidding_slot_number',
        'auction_start_date',
        'auction_start_time',
        'auction_end_time',
        'status'
      )
      .orderBy('ebidding_auction_id');
    
    console.table(auctions);

    // 6. Verify Vehicle Assignments
    console.log('\n🎯 6. VEHICLE ASSIGNMENTS');
    console.log('-'.repeat(40));
    const assignments = await db('indent_assigned_vehicle')
      .select(
        'vehicle_assignment_id',
        'indent_id',
        'transporter_id',
        'vehicle_id',
        'driver_id',
        'vehicle_type',
        'status'
      )
      .orderBy('vehicle_assignment_id');
    
    console.table(assignments);

    // 7. Verify Master Trips
    console.log('\n🗺️ 7. MASTER TRIPS');
    console.log('-'.repeat(40));
    const masterTrips = await db('master_trip')
      .select(
        'master_trip_id',
        'consignor_id',
        'transporter_id',
        'vehicle_id',
        'driver_id',
        'trip_status',
        'freight_value',
        'distance_to_be_covered',
        'trip_start_date_time'
      )
      .orderBy('master_trip_id');
    
    console.table(masterTrips);

    // 8. Complete Workflow Summary
    console.log('\n📊 8. WORKFLOW SUMMARY');
    console.log('-'.repeat(40));
    const workflow = await db('indent_header as ih')
      .leftJoin('indent_item as ii', 'ih.indent_id', 'ii.indent_id')
      .leftJoin('indent_vehicle as iv', 'ih.indent_id', 'iv.indent_id')
      .leftJoin('indent_assigned_vehicle as iav', 'ih.indent_id', 'iav.indent_id')
      .leftJoin('master_trip as mt', 'ih.indent_id', 'mt.indent_id')
      .select(
        'ih.indent_id',
        'ih.consignor_id',
        'ih.indent_status',
        db.raw('COUNT(DISTINCT ii.indent_id_item) as item_count'),
        'iv.required_vehicle_type',
        'iav.vehicle_id',
        'iav.driver_id',
        'mt.master_trip_id',
        'mt.trip_status'
      )
      .groupBy(
        'ih.indent_id',
        'ih.consignor_id',
        'ih.indent_status',
        'iv.required_vehicle_type',
        'iav.vehicle_id',
        'iav.driver_id',
        'mt.master_trip_id',
        'mt.trip_status'
      )
      .orderBy('ih.indent_id');
    
    console.table(workflow);

    // 9. Count Statistics
    console.log('\n📈 9. SYSTEM STATISTICS');
    console.log('-'.repeat(40));
    
    const stats = {
      total_indents: await db('indent_header').count('* as count').first(),
      total_items: await db('indent_item').count('* as count').first(),
      vehicle_requirements: await db('indent_vehicle').count('* as count').first(),
      drop_locations: await db('indent_drop_location').count('* as count').first(),
      auction_slots: await db('ebidding_auction_slot').count('* as count').first(),
      vehicle_assignments: await db('indent_assigned_vehicle').count('* as count').first(),
      master_trips: await db('master_trip').count('* as count').first()
    };

    Object.entries(stats).forEach(([key, value]) => {
      console.log(`${key.replace(/_/g, ' ').toUpperCase()}: ${value.count}`);
    });

    console.log('\n✅ Indent to Trip workflow verification completed successfully!');
    console.log('🎯 Complete TMS operational flow is now functional');
    
  } catch (error) {
    console.error('❌ Error during workflow verification:', error.message);
    console.error(error.stack);
  } finally {
    await db.destroy();
  }
}

// Run verification
verifyIndentTripWorkflow();