/**
 * Test Script for Consignor API
 * Quick test to verify endpoints are working correctly
 */

const knex = require('./config/database');
const consignorService = require('./services/consignorService');

const TEST_USER_ID = 'TESTUSER';

async function testConsignorAPI() {
  console.log('\n🧪 ===== CONSIGNOR API TEST SUITE =====\n');

  try {
    // Test 1: Get Master Data
    console.log('Test 1: Get Master Data');
    const masterData = await consignorService.getMasterData();
    console.log('✅ Master Data Retrieved:');
    console.log(`   - Industries: ${masterData.industries.length}`);
    console.log(`   - Currencies: ${masterData.currencies.length}`);
    console.log(`   - Document Types: ${masterData.documentTypes.length}`);

    // Test 2: Create Consignor
    console.log('\nTest 2: Create Consignor');
    const testConsignor = {
      general: {
        customer_id: 'TEST001',
        customer_name: 'Test Logistics Company',
        search_term: 'test logistics',
        industry_type: 'IND_LOGISTICS',
        currency_type: 'CUR_INR',
        payment_term: 'NET30',
        remark: 'Test consignor for API verification',
        status: 'ACTIVE'
      },
      contacts: [
        {
          contact_designation: 'Manager',
          contact_name: 'John Doe',
          contact_number: '9876543210',
          country_code: '+91',
          email_id: 'john@test.com'
        }
      ],
      organization: {
        company_code: 'TEST001',
        business_area: ['Logistics', 'Warehousing']
      },
      documents: []
    };

    const createdConsignor = await consignorService.createConsignor(
      testConsignor,
      {},
      TEST_USER_ID
    );
    console.log('✅ Consignor Created:');
    console.log(`   - Customer ID: ${createdConsignor.general.customer_id}`);
    console.log(`   - Name: ${createdConsignor.general.customer_name}`);
    console.log(`   - Contacts: ${createdConsignor.contacts.length}`);

    // Test 3: Get Consignor by ID
    console.log('\nTest 3: Get Consignor by ID');
    const retrievedConsignor = await consignorService.getConsignorById('TEST001');
    console.log('✅ Consignor Retrieved:');
    console.log(`   - Customer ID: ${retrievedConsignor.general.customer_id}`);
    console.log(`   - Name: ${retrievedConsignor.general.customer_name}`);

    // Test 4: Update Consignor
    console.log('\nTest 4: Update Consignor');
    const updatePayload = {
      general: {
        customer_id: 'TEST001',
        customer_name: 'Test Logistics Company (Updated)',
        search_term: 'test logistics updated',
        industry_type: 'IND_LOGISTICS',
        payment_term: 'NET30',
        remark: 'Updated test consignor',
        status: 'ACTIVE'
      }
    };

    const updatedConsignor = await consignorService.updateConsignor(
      'TEST001',
      updatePayload,
      {},
      TEST_USER_ID
    );
    console.log('✅ Consignor Updated:');
    console.log(`   - Name: ${updatedConsignor.general.customer_name}`);
    console.log(`   - Remark: ${updatedConsignor.general.remark}`);

    // Test 5: Get Consignor List
    console.log('\nTest 5: Get Consignor List');
    const listResult = await consignorService.getConsignorList({
      page: 1,
      limit: 10,
      status: 'ACTIVE'
    });
    console.log('✅ Consignor List Retrieved:');
    console.log(`   - Total Records: ${listResult.meta.total}`);
    console.log(`   - Current Page: ${listResult.meta.page}`);
    console.log(`   - Records Returned: ${listResult.data.length}`);

    // Test 6: Delete Consignor
    console.log('\nTest 6: Delete Consignor (Soft Delete)');
    const deleteResult = await consignorService.deleteConsignor('TEST001', TEST_USER_ID);
    console.log('✅ Consignor Deleted:');
    console.log(`   - Success: ${deleteResult.success}`);

    // Cleanup: Permanently delete test data
    console.log('\n🧹 Cleaning up test data...');
    await knex('contact').where('customer_id', 'TEST001').del();
    await knex('consignor_organization').where('customer_id', 'TEST001').del();
    await knex('consignor_documents').where('customer_id', 'TEST001').del();
    await knex('consignor_basic_information').where('customer_id', 'TEST001').del();
    console.log('✅ Test data cleaned up');

    console.log('\n✅ ===== ALL TESTS PASSED =====\n');
  } catch (error) {
    console.error('\n❌ ===== TEST FAILED =====');
    console.error('Error:', error);

    if (error.details) {
      console.error('Validation Details:', error.details);
    }

    // Cleanup on error
    try {
      await knex('contact').where('customer_id', 'TEST001').del();
      await knex('consignor_organization').where('customer_id', 'TEST001').del();
      await knex('consignor_documents').where('customer_id', 'TEST001').del();
      await knex('consignor_basic_information').where('customer_id', 'TEST001').del();
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
  } finally {
    // Close database connection
    await knex.destroy();
  }
}

// Run tests
testConsignorAPI();
