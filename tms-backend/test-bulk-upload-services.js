require('dotenv').config();
const { generateBulkUploadTemplate } = require('./utils/bulkUpload/excelTemplateGenerator');
const { parseExcelFile } = require('./services/bulkUpload/excelParserService');
const { validateAllData } = require('./services/bulkUpload/bulkValidationService');
const { generateErrorReport } = require('./services/bulkUpload/errorReportService');
const fs = require('fs');
const path = require('path');

async function testBulkUploadServices() {
  console.log('🧪 Testing Bulk Upload Services\n');
  console.log('='.repeat(60));
  
  try {
    // Step 1: Generate template
    console.log('\n📝 Step 1: Generating Excel Template...');
    const templateBuffer = await generateBulkUploadTemplate();
    
    const testDir = path.join(__dirname, 'test-uploads');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    
    const templatePath = path.join(testDir, 'test-template.xlsx');
    fs.writeFileSync(templatePath, templateBuffer);
    
    console.log(`✓ Template generated: ${templatePath}`);
    console.log(`  File size: ${(templateBuffer.length / 1024).toFixed(2)} KB`);
    
    // Step 2: Parse the template (it has sample data)
    console.log('\n📖 Step 2: Parsing Excel File...');
    const parseResult = await parseExcelFile(templatePath);
    
    if (!parseResult.success) {
      console.error('✗ Parsing failed:', parseResult.error);
      console.error('  Errors:', parseResult.errors);
      return;
    }
    
    console.log('✓ Parsing completed successfully');
    console.log(`  General Details: ${parseResult.data.generalDetails.length} rows`);
    console.log(`  Addresses: ${parseResult.data.addresses.length} rows`);
    console.log(`  Contacts: ${parseResult.data.contacts.length} rows`);
    console.log(`  Serviceable Areas: ${parseResult.data.serviceableAreas.length} rows`);
    console.log(`  Documents: ${parseResult.data.documents.length} rows`);
    
    // Display sample parsed data
    if (parseResult.data.generalDetails.length > 0) {
      console.log('\n📋 Sample General Details:');
      console.log(JSON.stringify(parseResult.data.generalDetails[0], null, 2));
    }
    
    // Step 3: Validate the data
    console.log('\n🔍 Step 3: Validating Data...');
    const validationResult = await validateAllData(parseResult.data);
    
    console.log('✓ Validation completed');
    console.log(`  Total Transporters: ${validationResult.summary.totalTransporters}`);
    console.log(`  Valid: ${validationResult.summary.validCount}`);
    console.log(`  Invalid: ${validationResult.summary.invalidCount}`);
    
    if (validationResult.summary.invalidCount > 0) {
      console.log('\n❌ Validation Errors Found:');
      console.log('  Error Breakdown:', validationResult.summary.errorBreakdown);
      
      // Show first invalid record errors
      if (validationResult.invalid.length > 0) {
        console.log('\n  First Invalid Record:');
        console.log(`    Transporter Ref ID: ${validationResult.invalid[0].transporterRefId}`);
        console.log(`    Errors:`);
        validationResult.invalid[0].errors.forEach(err => {
          console.log(`      - [${err.type}] ${err.message}`);
        });
      }
      
      // Step 4: Generate error report
      console.log('\n📄 Step 4: Generating Error Report...');
      const errorReportPath = await generateErrorReport(
        validationResult.invalid,
        'TEST-BATCH-001'
      );
      
      console.log(`✓ Error report generated: ${errorReportPath}`);
    } else {
      console.log('\n✅ All records are valid!');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 All tests completed successfully!\n');
    
    console.log('📝 Next Steps:');
    console.log('  1. Check the generated template at:', templatePath);
    console.log('  2. Fill it with test data (multiple transporters)');
    console.log('  3. Re-run this test with your filled template');
    console.log('  4. Verify error report generation\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

testBulkUploadServices();