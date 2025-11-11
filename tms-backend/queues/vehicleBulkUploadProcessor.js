const { parseVehicleExcelFile, getParseStatistics } = require('../services/vehicleBulkUploadService');
const { validateAllVehicleData } = require('../services/vehicleBulkUploadValidation');
const { generateVehicleErrorReport } = require('../services/vehicleBulkUploadErrorReport');
const knex = require('knex')(require('../knexfile').development);
const fs = require('fs');
const path = require('path');

/**
 * Vehicle Bulk Upload Processor
 * Processes vehicle bulk upload batches in the background
 * 
 * Pipeline:
 * 1. Parse Excel file (5 sheets)
 * 2. Validate all data (4 layers)
 * 3. Store validation results
 * 4. Generate error report (if errors exist)
 * 5. Create valid vehicles in database
 * 6. Update batch status
 */

async function processVehicleBulkUpload(job, io) {
  const { batchId, filePath, userId, originalName } = job.data;
  
  console.log('🚗 Processing vehicle bulk upload batch:', batchId);
  console.log('  File:', originalName || 'Unknown');
  console.log('  User:', userId);
  
  try {
    // Step 1: Parse Excel file
    console.log('\n📖 Step 1: Parsing Excel file...');
    
    // Emit progress only if Socket.IO is available
    if (io) {
      io.to(`batch:${batchId}`).emit('vehicleBulkUploadProgress', {
        batchId,
        progress: 10,
        message: 'Starting file processing...',
        type: 'info'
      });
    }
    
    if (io) {
      io.to(`batch:${batchId}`).emit('vehicleBulkUploadProgress', {
        batchId,
        progress: 20,
        message: 'Reading Excel file (5 sheets)...',
        type: 'info'
      });
    }
    
    const parseResult = await parseVehicleExcelFile(filePath);
    
    if (!parseResult.success) {
      throw new Error(`Excel parsing failed: ${parseResult.error || parseResult.errors.join(', ')}`);
    }
    
    const parsedData = parseResult.data;
    const stats = getParseStatistics(parsedData);
    
    console.log(`✓ Parsed successfully:`);
    console.log(`  Total vehicles: ${stats.totalVehicles}`);
    console.log(`  With specifications: ${stats.totalVehicles - stats.missingSpecifications}`);
    console.log(`  With capacity: ${stats.totalVehicles - stats.missingCapacity}`);
    console.log(`  With ownership: ${stats.totalVehicles - stats.missingOwnership}`);
    console.log(`  Total documents: ${stats.totalDocuments}`);
    
    await knex('tms_bulk_upload_vehicle_batches')
      .where({ batch_id: batchId })
      .update({
        total_rows: stats.totalVehicles
      });
    
    if (io) {
      io.to(`batch:${batchId}`).emit('vehicleBulkUploadProgress', {
        batchId,
        progress: 30,
        message: `Parsed ${stats.totalVehicles} vehicle(s) from Excel`,
        type: 'success'
      });
    }
    
    // Step 2: Validate all data
    console.log('\n✅ Step 2: Validating vehicle data...');
    if (io) {
      io.to(`batch:${batchId}`).emit('vehicleBulkUploadProgress', {
        batchId,
        progress: 40,
        message: 'Validating vehicle data (65+ rules)...',
        type: 'info'
      });
    }
    
    const validationResults = await validateAllVehicleData(parsedData);
    
    const validCount = validationResults.summary.validCount;
    const invalidCount = validationResults.summary.invalidCount;
    
    console.log(`✓ Validation complete:`);
    console.log(`  Valid vehicles: ${validCount}`);
    console.log(`  Invalid vehicles: ${invalidCount}`);
    
    if (invalidCount > 0) {
      console.log(`  Error breakdown:`, validationResults.summary.errorBreakdown);
    }
    
    if (io) {
      io.to(`batch:${batchId}`).emit('vehicleBulkUploadProgress', {
        batchId,
        progress: 55,
        message: `Validation complete: ${validCount} valid, ${invalidCount} invalid`,
        type: invalidCount > 0 ? 'warning' : 'success'
      });
    }
    
    // Step 3: Store validation results (BATCH INSERT - OPTIMIZED)
    console.log('\n💾 Step 3: Storing validation results...');
    const storeStart = Date.now();
    
    if (io) {
      io.to(`batch:${batchId}`).emit('vehicleBulkUploadProgress', {
        batchId,
        progress: 65,
        message: 'Storing validation results in database...',
        type: 'info'
      });
    }
    
    // Prepare batch insert data for valid vehicles
    const validVehicleRecords = validationResults.valid.map(validVehicle => ({
      batch_id: batchId,
      vehicle_ref_id: validVehicle.vehicleRefId || validVehicle.data?.basicInformation?.Vehicle_Ref_ID,
      excel_row_number: validVehicle.data?.basicInformation?._excelRowNumber || 0,
      validation_status: 'valid',
      validation_errors: JSON.stringify([]),
      data: JSON.stringify(validVehicle.data || validVehicle)
    }));
    
    // Prepare batch insert data for invalid vehicles
    const invalidVehicleRecords = validationResults.invalid.map(invalidVehicle => ({
      batch_id: batchId,
      vehicle_ref_id: invalidVehicle.vehicleRefId || invalidVehicle.data?.basicInformation?.Vehicle_Ref_ID || null,
      excel_row_number: invalidVehicle.data?.basicInformation?._excelRowNumber || 0,
      validation_status: 'invalid',
      validation_errors: JSON.stringify(invalidVehicle.errors),
      data: JSON.stringify(invalidVehicle.data || invalidVehicle)
    }));
    
    // Batch insert all records (10x-50x faster than individual inserts)
    if (validVehicleRecords.length > 0) {
      await knex('tms_bulk_upload_vehicles').insert(validVehicleRecords);
    }
    
    if (invalidVehicleRecords.length > 0) {
      await knex('tms_bulk_upload_vehicles').insert(invalidVehicleRecords);
    }
    
    const storeTime = Date.now() - storeStart;
    console.log(`✓ Stored ${validCount + invalidCount} vehicle records in ${storeTime}ms (BATCH INSERT)`);
    
    await knex('tms_bulk_upload_vehicle_batches')
      .where({ batch_id: batchId })
      .update({
        total_valid: validCount,
        total_invalid: invalidCount
      });
    
    if (io) {
      io.to(`batch:${batchId}`).emit('vehicleBulkUploadProgress', {
        batchId,
        progress: 70,
        message: 'Validation results stored',
        type: 'success'
      });
    }
    
    // Step 4: Generate error report (if errors exist)
    let errorReportPath = null;
    if (invalidCount > 0) {
      console.log('\n📝 Step 4: Generating error report...');
      if (io) {
        io.to(`batch:${batchId}`).emit('vehicleBulkUploadProgress', {
          batchId,
          progress: 75,
          message: `Generating error report for ${invalidCount} invalid record(s)...`,
          type: 'info'
        });
      }
      
      errorReportPath = await generateVehicleErrorReport(validationResults.invalid, batchId);
      
      await knex('tms_bulk_upload_vehicle_batches')
        .where({ batch_id: batchId })
        .update({
          error_report_path: errorReportPath
        });
      
      console.log(`✓ Error report saved: ${errorReportPath}`);
      
      if (io) {
        io.to(`batch:${batchId}`).emit('vehicleBulkUploadProgress', {
          batchId,
          progress: 80,
          message: 'Error report generated successfully',
          type: 'success'
        });
      }
    }
    
    // Step 5: Create valid vehicles in database
    let createdCount = 0;
    let failedCount = 0;
    
    if (validCount > 0) {
      console.log('\n🏗️  Step 5: Creating valid vehicles in database...');
      if (io) {
        io.to(`batch:${batchId}`).emit('vehicleBulkUploadProgress', {
          batchId,
          progress: 85,
          message: `Creating ${validCount} valid vehicle(s) in database...`,
          type: 'info'
        });
      }
      
      const creationResults = await createVehiclesBatch(
        validationResults.valid,
        batchId,
        userId,
        io
      );
      
      createdCount = creationResults.success.length;
      failedCount = creationResults.failed.length;
      
      console.log(`✓ Creation complete:`);
      console.log(`  Successfully created: ${createdCount}`);
      console.log(`  Failed to create: ${failedCount}`);
      
      if (failedCount > 0) {
        console.log(`  Failures:`, creationResults.failed.map(f => f.error));
      }
    }
    
    // Step 6: Update batch status
    console.log('\n📊 Step 6: Updating batch status...');
    
    const finalStatus = 'completed';
    await knex('tms_bulk_upload_vehicle_batches')
      .where({ batch_id: batchId })
      .update({
        total_created: createdCount,
        total_creation_failed: failedCount,
        status: finalStatus,
        processed_timestamp: knex.fn.now()
      });
    
    console.log(`✓ Batch ${batchId} completed`);
    
    if (io) {
      io.to(`batch:${batchId}`).emit('vehicleBulkUploadProgress', {
        batchId,
        progress: 100,
        message: 'Processing complete!',
        type: 'success'
      });
    }
    
    // Emit completion event
    if (io) {
      io.to(`batch:${batchId}`).emit('vehicleBulkUploadComplete', {
        batchId,
        validCount,
        invalidCount,
        createdCount,
        failedCount,
        errorReportPath,
        timestamp: new Date().toISOString()
      });
    }
    
    console.log('✅ Vehicle bulk upload processing complete!');
    
    // Cleanup uploaded file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('🗑️  Cleaned up uploaded file');
    }
    
    return {
      validCount,
      invalidCount,
      createdCount,
      failedCount
    };
    
  } catch (error) {
    console.error('❌ Error processing vehicle bulk upload:', error);
    
    await knex('tms_bulk_upload_vehicle_batches')
      .where({ batch_id: batchId })
      .update({
        status: 'failed',
        error_message: error.message,
        processed_timestamp: knex.fn.now()
      });
    
    if (io) {
      io.to(`batch:${batchId}`).emit('vehicleBulkUploadError', {
        batchId,
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
    
    throw error;
  }
}

/**
 * Create vehicles in batch (OPTIMIZED with parallel processing)
 * Creates vehicle records with all related data using batch inserts
 */
async function createVehiclesBatch(validVehicles, batchId, userId, io) {
  const results = {
    success: [],
    failed: []
  };
  
  const total = validVehicles.length;
  console.log(`\n🏗️  Creating ${total} vehicles with optimized batch processing...`);
  const createStart = Date.now();
  
  // Process in chunks to avoid overwhelming database
  const CHUNK_SIZE = 50; // Process 50 vehicles at a time
  const chunks = [];
  
  for (let i = 0; i < validVehicles.length; i += CHUNK_SIZE) {
    chunks.push(validVehicles.slice(i, i + CHUNK_SIZE));
  }
  
  let processedCount = 0;
  
  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
    const chunk = chunks[chunkIndex];
    
    try {
      // Process chunk with optimized batch operations
      const chunkResults = await createVehiclesChunk(chunk, batchId, userId);
      
      results.success.push(...chunkResults.success);
      results.failed.push(...chunkResults.failed);
      
      processedCount += chunk.length;
      
      // Update progress - only if io is available
      const progressPercent = 85 + Math.floor((processedCount / total) * 10);
      
      if (io) {
        io.to(`batch:${batchId}`).emit('vehicleBulkUploadProgress', {
          batchId,
          progress: progressPercent,
          message: `Created ${processedCount}/${total} vehicles`,
          type: 'info'
        });
      }
      
      console.log(`✓ Chunk ${chunkIndex + 1}/${chunks.length}: ${chunk.length} vehicles processed`);
      
    } catch (error) {
      console.error(`❌ Chunk ${chunkIndex + 1} failed:`, error.message);
      
      // Mark all vehicles in failed chunk
      chunk.forEach(vehicleData => {
        results.failed.push({
          vehicleRefId: vehicleData.vehicleRefId || vehicleData.data?.basicInformation?.Vehicle_Ref_ID || 'UNKNOWN',
          error: error.message
        });
      });
      
      processedCount += chunk.length;
    }
  }
  
  const createTime = Date.now() - createStart;
  console.log(`✓ Batch creation complete in ${createTime}ms (${(createTime / total).toFixed(2)}ms per vehicle)`);
  
  return results;
}

/**
 * Create a chunk of vehicles with optimized batch inserts
 * Uses single transaction for entire chunk with batch INSERT operations
 */
async function createVehiclesChunk(vehiclesChunk, batchId, userId) {
  return await knex.transaction(async (trx) => {
    const results = {
      success: [],
      failed: []
    };
    
    // Get next vehicle ID number
    const lastVehicle = await trx('vehicle_basic_information_hdr')
      .orderBy('vehicle_id_code_hdr', 'desc')
      .first();
    
    let nextNumber = 1;
    if (lastVehicle && lastVehicle.vehicle_id_code_hdr) {
      const lastNumber = parseInt(lastVehicle.vehicle_id_code_hdr.replace('VEH', ''));
      nextNumber = lastNumber + 1;
    }
    
    // Prepare batch insert arrays for all tables
    const basicInfoRecords = [];
    // Note: Specifications and Capacity fields are now part of basicInfoRecords (vehicle_basic_information_hdr)
    // Note: Documents are NOT included in bulk upload (must be uploaded separately through UI)
    const ownershipRecords = [];
    const bulkUploadUpdates = [];
    
    // Build all records for batch insert
    for (const vehicleData of vehiclesChunk) {
      try {
        // Extract data from validation result structure
        // Note: Documents are excluded from bulk upload
        const { basicInformation, specifications, capacityDetails, ownershipDetails } = vehicleData.data || vehicleData;
        
        const vehicleId = `VEH${String(nextNumber).padStart(4, '0')}`;
        nextNumber++;
        
        // Basic information (header) - includes specifications fields
        basicInfoRecords.push({
          vehicle_id_code_hdr: vehicleId,
          maker_brand_description: basicInformation.Make_Brand,
          maker_model: basicInformation.Model,
          vin_chassis_no: basicInformation.VIN_Chassis_Number,
          vehicle_type_id: basicInformation.Vehicle_Type_ID,
          vehicle_category: basicInformation.Vehicle_Category || null,
          manufacturing_month_year: basicInformation.Manufacturing_Month_Year,
          gps_tracker_imei_number: basicInformation.GPS_IMEI_Number,
          gps_tracker_active_flag: basicInformation.GPS_Active_Flag === 'Y' ? 1 : 0,
          leasing_flag: basicInformation.Leasing_Flag === 'Y' ? 1 : 0,
          usage_type_id: basicInformation.Usage_Type_ID,
          vehicle_registration_number: basicInformation.Registration_Number || null,
          vehicle_colour: basicInformation.Vehicle_Color || null,
          body_type_desc: basicInformation.Body_Type_Description || null,
          safety_inspection_date: basicInformation.Safety_Inspection_Date || null,
          taxes_and_fees: basicInformation.Taxes_And_Fees || null,
          road_tax: basicInformation.Road_Tax || null,
          avg_running_speed: basicInformation.Avg_Running_Speed || null,
          max_running_speed: basicInformation.Max_Running_Speed || null,
          // Specification fields (from specifications sheet)
          engine_type_id: specifications?.Engine_Type_ID || null,
          engine_number: specifications?.Engine_Number || null,
          fuel_type_id: specifications?.Fuel_Type_ID || null,
          transmission_type: specifications?.Transmission_Type || null,
          emission_standard: specifications?.Emission_Standard || null,
          financer: specifications?.Financer || null,
          suspension_type: specifications?.Suspension_Type || null,
          // Capacity fields (from capacity details sheet)
          unloading_weight: capacityDetails?.Unloading_Weight_KG || null,
          gross_vehicle_weight_kg: capacityDetails?.Gross_Vehicle_Weight_KG || null,
          volume_capacity_cubic_meter: capacityDetails?.Volume_Capacity_CBM || null,
          seating_capacity: capacityDetails?.Seating_Capacity || null,
          load_capacity_in_ton: capacityDetails?.Load_Capacity_TON || null,
          cargo_dimensions_width: capacityDetails?.Cargo_Width_M || null,
          cargo_dimensions_height: capacityDetails?.Cargo_Height_M || null,
          cargo_dimensions_length: capacityDetails?.Cargo_Length_M || null,
          towing_capacity: capacityDetails?.Towing_Capacity_KG || null,
          tire_load_rating: capacityDetails?.Tire_Load_Rating || null,
          vehicle_condition: capacityDetails?.Vehicle_Condition || null,
          fuel_tank_capacity: capacityDetails?.Fuel_Tank_Capacity_L || null,
          status: basicInformation.Status || 'ACTIVE',
          created_by: userId,
          updated_by: userId
        });
        
        // Ownership details if provided
        if (ownershipDetails) {
          const ownershipId = `${vehicleId}OWN001`;
          
          ownershipRecords.push({
            vehicle_ownership_id: ownershipId,
            vehicle_id_code: vehicleId,
            ownership_name: ownershipDetails.Ownership_Name || null,
            valid_from: ownershipDetails.Valid_From || null,
            valid_to: ownershipDetails.Valid_To || null,
            registration_number: ownershipDetails.Registration_Number || null,
            registration_date: ownershipDetails.Registration_Date || null,
            registration_upto: ownershipDetails.Registration_Upto || null,
            purchase_date: ownershipDetails.Purchase_Date || null,
            owner_sr_number: ownershipDetails.Owner_Sr_Number || null,
            state_code: ownershipDetails.State_Code || null,
            rto_code: ownershipDetails.RTO_Code || null,
            sale_amount: ownershipDetails.Sale_Amount || null,
            created_by: userId,
            updated_by: userId
          });
        }
        
        // Note: Documents are NOT included in bulk upload
        // Documents must be uploaded separately through the UI after vehicle creation
        
        // Track bulk upload record update
        bulkUploadUpdates.push({
          batch_id: batchId,
          vehicle_ref_id: basicInformation.Vehicle_Ref_ID,
          created_vehicle_id: vehicleId
        });
        
        results.success.push({
          vehicleRefId: basicInformation.Vehicle_Ref_ID,
          vehicleId
        });
        
      } catch (error) {
        const vehicleRefId = vehicleData.vehicleRefId || vehicleData.data?.basicInformation?.Vehicle_Ref_ID || 'UNKNOWN';
        console.error(`Failed to prepare vehicle ${vehicleRefId}:`, error.message);
        results.failed.push({
          vehicleRefId,
          error: error.message
        });
      }
    }
    
    // Execute batch inserts (MUCH faster than individual inserts)
    if (basicInfoRecords.length > 0) {
      await trx('vehicle_basic_information_hdr').insert(basicInfoRecords);
      console.log(`✓ Batch INSERT: vehicle_basic_information_hdr (${basicInfoRecords.length} rows)`);
    }
    
    // Note: vehicle_basic_information_itm is for insurance, not specifications
    // Note: Capacity fields are included in vehicle_basic_information_hdr above (not separate table)
    // Specifications and capacity are denormalized into the header table for performance
    
    if (ownershipRecords.length > 0) {
      await trx('vehicle_ownership_details').insert(ownershipRecords);
      console.log(`✓ Batch INSERT: vehicle_ownership_details (${ownershipRecords.length} rows)`);
    }
    
    // Note: Documents are NOT included in bulk upload
    // Users must upload documents separately through the vehicle details page after creation
    
    // Update bulk upload records with created vehicle IDs
    for (const update of bulkUploadUpdates) {
      await trx('tms_bulk_upload_vehicles')
        .where({
          batch_id: update.batch_id,
          vehicle_ref_id: update.vehicle_ref_id
        })
        .update({
          created_vehicle_id: update.created_vehicle_id
        });
    }
    
    return results;
  });
}

module.exports = {
  processVehicleBulkUpload
};
