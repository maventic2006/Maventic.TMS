const { parseExcelFile, parseExcelFileStreaming } = require('../services/bulkUpload/excelParserService');
const { validateAllData } = require('../services/bulkUpload/bulkValidationService');
const { generateErrorReport } = require('../services/bulkUpload/errorReportService');
const { createTransportersBatch } = require('../services/bulkUpload/transporterCreationService');
const knex = require('knex')(require('../knexfile').development);
const fs = require('fs');
const path = require('path');

async function processBulkUpload(job, io) {
  const { batchId, filePath, userId, originalName } = job.data;
  
  console.log('Processing bulk upload batch:', batchId);
  
  try {
    io.to(`batch:${batchId}`).emit('bulkUploadProgress', {
      progress: 10,
      message: 'Starting file processing...',
      type: 'info'
    });
    
    console.log('Step 1: Parsing Excel file...');
    io.to(`batch:${batchId}`).emit('bulkUploadProgress', {
      progress: 20,
      message: 'Reading Excel file...',
      type: 'info'
    });
    
    const parseResult = await parseExcelFile(filePath);
    
    // Check if parsing was successful
    if (!parseResult.success) {
      throw new Error(`Excel parsing failed: ${parseResult.error}`);
    }
    
    const parsedData = parseResult.data;
    const totalTransporters = parsedData.generalDetails ? parsedData.generalDetails.length : 0;
    
    console.log('Found transporters:', totalTransporters);
    
    await knex('tms_bulk_upload_batches')
      .where({ batch_id: batchId })
      .update({
        total_rows: totalTransporters
      });
    
    io.to(`batch:${batchId}`).emit('bulkUploadProgress', {
      progress: 40,
      message: `Parsed ${totalTransporters} transporter(s)`,
      type: 'success'
    });
    
    console.log('Step 2: Validating data...');
    io.to(`batch:${batchId}`).emit('bulkUploadProgress', {
      progress: 60,
      message: 'Validating transporter data...',
      type: 'info'
    });
    
    const validationResults = await validateAllData(parsedData);
    
    const validCount = validationResults.summary.validCount;
    const invalidCount = validationResults.summary.invalidCount;
    
    console.log('Valid:', validCount);
    console.log('Invalid:', invalidCount);
    
    io.to(`batch:${batchId}`).emit('bulkUploadProgress', {
      progress: 80,
      message: `Validation complete: ${validCount} valid, ${invalidCount} invalid`,
      type: invalidCount > 0 ? 'warning' : 'success'
    });
    
    console.log('Step 3: Storing validation results...');
    
    // Store valid transporters
    for (const validTransporter of validationResults.valid) {
      await knex('tms_bulk_upload_transporters').insert({
        batch_id: batchId,
        transporter_ref_id: validTransporter.transporterRefId,
        excel_row_number: validTransporter.data.generalDetails._excelRowNumber,
        validation_status: 'valid',
        validation_errors: JSON.stringify([]),
        data: JSON.stringify(validTransporter.data)
      });
    }
    
    // Store invalid transporters
    for (const invalidTransporter of validationResults.invalid) {
      await knex('tms_bulk_upload_transporters').insert({
        batch_id: batchId,
        transporter_ref_id: invalidTransporter.transporterRefId,
        excel_row_number: invalidTransporter.data.generalDetails._excelRowNumber,
        validation_status: 'invalid',
        validation_errors: JSON.stringify(invalidTransporter.errors),
        data: JSON.stringify(invalidTransporter.data)
      });
    }
    
    const batchStatus = 'completed'; // Always set to completed after validation
    await knex('tms_bulk_upload_batches')
      .where({ batch_id: batchId })
      .update({
        total_valid: validCount,
        total_invalid: invalidCount,
        status: batchStatus,
        processed_timestamp: knex.fn.now()
      });
    
    if (invalidCount > 0) {
      console.log('Step 4: Generating error report...');
      io.to(`batch:${batchId}`).emit('bulkUploadProgress', {
        progress: 90,
        message: 'Generating error report...',
        type: 'info'
      });
      
      // Generate error report with invalid records
      const errorReportPath = await generateErrorReport(validationResults.invalid, batchId);
      
      await knex('tms_bulk_upload_batches')
        .where({ batch_id: batchId })
        .update({
          error_report_path: errorReportPath
        });
      
      console.log('Error report saved:', errorReportPath);
    }
    
    // Step 5: Create valid transporters in database
    let creationResults = { success: [], failed: [] };
    
    if (validCount > 0) {
      console.log('Step 5: Creating valid transporters...');
      io.to(`batch:${batchId}`).emit('bulkUploadProgress', {
        progress: 80,
        message: `Creating ${validCount} valid transporter(s)...`,
        type: 'info'
      });
      
      // Get only valid transporters with their full data
      const validTransporters = validationResults.valid.map(v => v.data);
      
      // Create transporters in batches
      creationResults = await createTransportersBatch(
        validTransporters,
        batchId,
        userId,
        io,
        (processed, total) => {
          console.log(`Progress: ${processed}/${total} transporters created`);
        }
      );
      
      console.log(`Creation Results: ${creationResults.success.length} created, ${creationResults.failed.length} failed`);
      
      // Update batch with creation results
      await knex('tms_bulk_upload_batches')
        .where({ batch_id: batchId })
        .update({
          total_created: creationResults.success.length,
          total_creation_failed: creationResults.failed.length
        });
    }
    
    io.to(`batch:${batchId}`).emit('bulkUploadProgress', {
      progress: 100,
      message: 'Processing complete!',
      type: 'success'
    });
    
    io.to(`batch:${batchId}`).emit('validationComplete', {
      batchId,
      validationResults: {
        valid: validCount,
        invalid: invalidCount,
        created: creationResults.success.length,
        creationFailed: creationResults.failed.length,
        hasErrors: invalidCount > 0
      }
    });
    
    io.to(`batch:${batchId}`).emit('processingComplete', {
      batchId,
      message: `Batch complete: ${creationResults.success.length} created, ${invalidCount} invalid, ${creationResults.failed.length} failed`
    });
    
    console.log('Batch processed successfully:', batchId);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    return {
      success: true,
      validCount: validationResults.valid,
      invalidCount: validationResults.invalid
    };
    
  } catch (error) {
    console.error('Error processing batch:', batchId, error);
    
    await knex('tms_bulk_upload_batches')
      .where({ batch_id: batchId })
      .update({
        status: 'failed',
        error_message: error.message,
        processed_timestamp: knex.fn.now()
      });
    
    io.to(`batch:${batchId}`).emit('processingError', {
      batchId,
      error: error.message
    });
    
    throw error;
  }
}

module.exports = { processBulkUpload };
