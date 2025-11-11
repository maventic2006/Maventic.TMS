const db = require('./config/database');

/**
 * COMPLETE Vehicle Data Population Script
 * Step 1: Populate master tables
 * Step 2: Populate 50 vehicles with all relationships
 */

const getCurrentTimestamp = () => {
  const now = new Date();
  return {
    date: now.toISOString().split('T')[0],
    time: now.toTimeString().split(' ')[0],
    datetime: now.toISOString().slice(0, 19).replace('T', ' ')
  };
};

// Master Data
const masterData = {
  vehicleTypes: [
    { id: 'VT001', desc: 'HCV - Heavy Commercial Vehicle' },
    { id: 'VT002', desc: 'MCV - Medium Commercial Vehicle' },
    { id: 'VT003', desc: 'LCV - Light Commercial Vehicle' },
    { id: 'VT004', desc: 'TRAILER - Trailer' },
    { id: 'VT005', desc: 'CONTAINER - Container' },
    { id: 'VT006', desc: 'TANKER - Tanker' },
    { id: 'VT007', desc: 'REFRIGERATED - Refrigerated Vehicle' },
    { id: 'VT008', desc: 'FLATBED - Flatbed' }
  ],
  fuelTypes: [
    { id: 'FT001', type: 'DIESEL' },
    { id: 'FT002', type: 'CNG' },
    { id: 'FT003', type: 'ELECTRIC' },
    { id: 'FT004', type: 'LNG' }
  ],
  usageTypes: [
    { id: 'UT001', type: 'COMMERCIAL' },
    { id: 'UT002', type: 'PRIVATE' },
    { id: 'UT003', type: 'RENTAL' },
    { id: 'UT004', type: 'LEASE' }
  ],
  engineTypes: [
    { id: 'ET001', type: 'BS4' },
    { id: 'ET002', type: 'BS6' },
    { id: 'ET003', type: 'EURO5' },
    { id: 'ET004', type: 'EURO6' }
  ]
};

const populate = async () => {
  const trx = await db.transaction();
  
  try {
    console.log('\n VEHICLE DATA POPULATION\n');
    console.log('Step 1: Populating Master Tables...\n');
    
    const { datetime } = getCurrentTimestamp();
    
    // Populate master tables
    for (const vt of masterData.vehicleTypes) {
      await trx('vehicle_type_master').insert({
        vehicle_type_id: vt.id,
        vehicle_type_description: vt.desc,
        created_at: datetime,
        created_on: datetime,
        created_by: 'SYSTEM',
        updated_at: datetime,
        updated_on: datetime,
        updated_by: 'SYSTEM',
        status: 'ACTIVE'
      });
    }
    console.log(` Vehicle Types: ${masterData.vehicleTypes.length}`);
    
    for (const ft of masterData.fuelTypes) {
      await trx('fuel_type_master').insert({
        fuel_type_id: ft.id,
        fuel_type: ft.type,
        created_at: datetime,
        created_on: datetime,
        created_by: 'SYSTEM',
        updated_at: datetime,
        updated_on: datetime,
        updated_by: 'SYSTEM',
        status: 'ACTIVE'
      });
    }
    console.log(` Fuel Types: ${masterData.fuelTypes.length}`);
    
    for (const ut of masterData.usageTypes) {
      await trx('usage_type_master').insert({
        usage_type_id: ut.id,
        usage_type: ut.type,
        created_at: datetime,
        created_on: datetime,
        created_by: 'SYSTEM',
        updated_at: datetime,
        updated_on: datetime,
        updated_by: 'SYSTEM',
        status: 'ACTIVE'
      });
    }
    console.log(` Usage Types: ${masterData.usageTypes.length}`);
    
    for (const et of masterData.engineTypes) {
      await trx('engine_type_master').insert({
        engine_type_id: et.id,
        engine_type: et.type,
        created_at: datetime,
        created_on: datetime,
        created_by: 'SYSTEM',
        updated_at: datetime,
        updated_on: datetime,
        updated_by: 'SYSTEM',
        status: 'ACTIVE'
      });
    }
    console.log(` Engine Types: ${masterData.engineTypes.length}`);
    
    console.log('\nStep 2: Creating 50 Vehicles...\n');
    
    // Helper functions
    const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const rnum = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const vinGen = () => 'VIN' + Math.random().toString(36).substring(2, 15).toUpperCase();
    const engGen = () => 'ENG' + Math.random().toString(36).substring(2, 15).toUpperCase();
    const imeiGen = () => '86' + Array.from({length: 13}, () => rnum(0, 9)).join('');
    
    const makes = ['Tata', 'Ashok Leyland', 'Mahindra', 'BharatBenz', 'Volvo'];
    const models = ['LPT 1918', 'Partner', 'Bolero', '3123R', 'FM440'];
    const rtos = ['MH01', 'GJ01', 'DL01', 'KA01', 'TN01', 'UP14', 'HR26', 'RJ01', 'WB01', 'MP09'];
    const owners = ['ABC Transport', 'XYZ Logistics', 'PQR Fleet', 'LMN Transport'];
    const insurers = ['ICICI Lombard', 'HDFC ERGO', 'Bajaj Allianz', 'TATA AIG'];
    
    let permitCnt = 1, mntCnt = 1;
    
    for (let i = 0; i < 50; i++) {
      const vid = `VEH${String(i + 1).padStart(4, '0')}`;
      const rto = rnd(rtos);
      const regNo = `${rto}${String.fromCharCode(65+rnum(0,25))}${String.fromCharCode(65+rnum(0,25))}${rnum(1000,9999)}`;
      
      // HDR
      await trx('vehicle_basic_information_hdr').insert({
        vehicle_id_code_hdr: vid,
        maker_brand_description: rnd(makes),
        maker_model: rnd(models),
        vin_chassis_no: vinGen(),
        engine_number: engGen(),
        engine_type_id: rnd(masterData.engineTypes).id,
        fuel_type_id: rnd(masterData.fuelTypes).id,
        vehicle_type_id: rnd(masterData.vehicleTypes).id,
        usage_type_id: rnd(masterData.usageTypes).id,
        manufacturing_month_year: `${rnum(2018,2024)}-${String(rnum(1,12)).padStart(2,'0')}-01`,
        gps_tracker_imei_number: imeiGen(),
        gps_tracker_active_flag: rnum(0,1),
        unloading_weight: rnum(1000,25000),
        gross_vehicle_weight_kg: rnum(3000,40000),
        transmission_type: rnd(['MANUAL','AUTOMATIC','AMT']),
        suspension_type: rnd(['LEAF_SPRING','AIR_SUSPENSION','HYDRAULIC']),
        vehicle_condition: rnd(['EXCELLENT','GOOD','FAIR']),
        seating_capacity: rnum(2,7),
        financer: rnd(['HDFC','ICICI','SBI','Self']),
        leasing_flag: rnum(0,1),
        load_capacity_in_ton: rnum(1,25),
        volume_capacity_cubic_meter: rnum(10,60),
        fuel_tank_capacity: rnum(100,500),
        blacklist_status: 0,
        created_at: datetime,
        created_on: datetime,
        created_by: 'SYSTEM',
        updated_at: datetime,
        updated_on: datetime,
        updated_by: 'SYSTEM',
        status: 'ACTIVE'
      });
      
      // Ownership
      await trx('vehicle_ownership_details').insert({
        vehicle_ownership_id: `OWN${String(i+1).padStart(4,'0')}`,
        vehicle_id_code: vid,
        ownership_name: rnd(owners),
        registration_number: regNo,
        registration_date: '2023-01-01',
        registration_upto: '2026-01-01',
        purchase_date: '2023-01-01',
        owner_sr_number: 1,
        state_code: rto.substring(0,2),
        rto_code: rto,
        sale_amount: rnum(500000,3000000),
        valid_from: '2023-01-01',
        valid_to: '2026-01-01',
        created_at: datetime,
        created_on: datetime,
        created_by: 'SYSTEM',
        updated_at: datetime,
        updated_on: datetime,
        updated_by: 'SYSTEM',
        status: 'ACTIVE'
      });
      
      // Insurance
      await trx('vehicle_basic_information_itm').insert({
        vehicle_id_code_hdr: vid,
        vehicle_id_code_itm: `INS${String(i+1).padStart(4,'0')}`,
        insurance_provider: rnd(insurers),
        policy_number: `POL${rnum(100000,999999)}`,
        coverage_type: rnd(['COMPREHENSIVE','THIRD_PARTY']),
        policy_expiry_date: '2026-12-31',
        premium_amount: rnum(15000,80000),
        created_at: datetime,
        created_on: datetime,
        created_by: 'SYSTEM',
        updated_at: datetime,
        updated_on: datetime,
        updated_by: 'SYSTEM',
        status: 'ACTIVE'
      });
      
      // Permits (2 per vehicle)
      for (let p = 0; p < 2; p++) {
        await trx('vehicle_special_permit').insert({
          vehicle_permit_id: `PRM${String(permitCnt++).padStart(4,'0')}`,
          vehicle_id_code_hdr: vid,
          permit_category: rnd(['NATIONAL','STATE']),
          permit_code: 'NAT',
          permit_number: `PER${rnum(10000,99999)}`,
          permit_type: rnd(['TEMPORARY','PERMANENT']),
          permit_issue_date: '2023-01-01',
          valid_from: '2023-01-01',
          valid_to: '2026-01-01',
          created_at: datetime,
          created_on: datetime,
          created_by: 'SYSTEM',
          updated_at: datetime,
          updated_on: datetime,
          updated_by: 'SYSTEM',
          status: 'ACTIVE'
        });
      }
      
      // Maintenance (3 per vehicle)
      for (let m = 0; m < 3; m++) {
        await trx('vehicle_maintenance_service_history').insert({
          vehicle_maintenance_id: `MNT${String(mntCnt++).padStart(4,'0')}`,
          vehicle_id_code: vid,
          service_date: '2024-01-01',
          upcoming_service_date: '2025-01-01',
          type_of_service: rnd(['ROUTINE','MAJOR','MINOR']),
          service_expense: rnum(5000,50000),
          service_remark: 'Service completed',
          created_at: datetime,
          created_on: datetime,
          created_by: 'SYSTEM',
          updated_at: datetime,
          updated_on: datetime,
          updated_by: 'SYSTEM',
          status: 'ACTIVE'
        });
      }
      
      // Service Frequency (3 per vehicle)
      for (let s = 1; s <= 3; s++) {
        await trx('service_frequency_master').insert({
          vehicle_id: vid,
          sequence_number: s,
          time_period: rnd(['3 MONTHS','6 MONTHS','12 MONTHS']),
          km_drove: rnd([5000,10000,15000]),
          created_at: datetime,
          created_on: datetime,
          created_by: 'SYSTEM',
          updated_at: datetime,
          updated_on: datetime,
          updated_by: 'SYSTEM',
          status: 'ACTIVE'
        });
      }
      
      if ((i+1) % 10 === 0) console.log(` Completed: ${i+1}/50 vehicles`);
    }
    
    await trx.commit();
    
    console.log('\n ============================================');
    console.log(' COMPLETED!');
    console.log('============================================');
    console.log(` Summary:`);
    console.log(`   - Master Data: 24 records`);
    console.log(`   - Vehicles: 50`);
    console.log(`   - Ownership: 50`);
    console.log(`   - Insurance: 50`);
    console.log(`   - Permits: 100`);
    console.log(`   - Maintenance: 150`);
    console.log(`   - Service Schedules: 150`);
    console.log(`   - TOTAL: 574 records`);
    console.log('============================================\n');
    
    process.exit(0);
  } catch (error) {
    await trx.rollback();
    console.error(' Error:', error.message);
    process.exit(1);
  }
};

populate();
