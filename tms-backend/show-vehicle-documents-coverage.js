require('dotenv').config();
const knexConfig = require('./knexfile');
const knex = require('knex')(knexConfig.development);

async function showVehicleDocumentsWithCoverage() {
  try {
    console.log('🚀 Showing Vehicle Documents with Coverage Type Relationships...\n');

    // Show Vehicle Documents with their coverage types
    const documents = await knex('vehicle_documents as vd')
      .leftJoin('coverage_type_master as ctm', 'vd.coverage_type_id', 'ctm.coverage_type_id')
      .select(
        'vd.document_id',
        'vd.document_type_id',
        'vd.reference_number',
        'vd.document_provider',
        'vd.coverage_type_id',
        'ctm.coverage_type as coverage_type_name',
        'vd.premium_amount',
        'vd.valid_from',
        'vd.valid_to',
        'vd.remarks'
      )
      .orderBy('vd.document_id');

    console.log('📄 VEHICLE DOCUMENTS WITH COVERAGE TYPE REFERENCES:');
    console.log(`   Total documents: ${documents.length}`);
    documents.forEach(doc => {
      console.log(`   - ${doc.document_id}: ${doc.document_type_id} (${doc.reference_number})`);
      console.log(`     Provider: ${doc.document_provider}`);
      console.log(`     Coverage: ${doc.coverage_type_name} (${doc.coverage_type_id})`);
      console.log(`     Premium: ₹${doc.premium_amount} | Valid: ${doc.valid_from} to ${doc.valid_to}`);
      console.log(`     Remarks: ${doc.remarks}`);
      console.log('');
    });

    // Show Coverage Type Master summary
    const coverageTypes = await knex('coverage_type_master')
      .select('coverage_type_id', 'coverage_type', 'status')
      .orderBy('coverage_type_id');
    
    console.log('📋 COVERAGE TYPE MASTER SUMMARY:');
    console.log(`   Total coverage types: ${coverageTypes.length}`);
    coverageTypes.forEach(type => {
      console.log(`   - ${type.coverage_type_id}: ${type.coverage_type} (${type.status})`);
    });
    console.log('');

    // Show foreign key constraint verification
    const constraints = await knex.raw(`
      SELECT 
        CONSTRAINT_NAME,
        TABLE_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND REFERENCED_TABLE_NAME = 'coverage_type_master'
    `);

    console.log('🔗 FOREIGN KEY CONSTRAINT:');
    if (constraints[0].length > 0) {
      constraints[0].forEach(constraint => {
        console.log(`   ✅ ${constraint.TABLE_NAME}.${constraint.COLUMN_NAME} → ${constraint.REFERENCED_TABLE_NAME}.${constraint.REFERENCED_COLUMN_NAME}`);
        console.log(`      Constraint: ${constraint.CONSTRAINT_NAME}`);
      });
    }
    console.log('');

    // Summary statistics
    const stats = await Promise.all([
      knex('coverage_type_master').count('* as count'),
      knex('vehicle_documents').count('* as count'),
      knex('vehicle_documents').sum('premium_amount as total_premium')
    ]);

    console.log('📊 STATISTICS:');
    console.log(`   - Coverage Types Available: ${stats[0][0].count}`);
    console.log(`   - Vehicle Documents: ${stats[1][0].count}`);
    console.log(`   - Total Premium Amount: ₹${stats[2][0].total_premium || 0}`);
    console.log(`   - Average Premium: ₹${stats[1][0].count > 0 ? (stats[2][0].total_premium / stats[1][0].count).toFixed(2) : 0}`);

    console.log('\n✅ Vehicle Documents with Coverage Type relationships displayed successfully!');

  } catch (error) {
    console.error('❌ Error showing vehicle documents with coverage:', error.message);
  } finally {
    await knex.destroy();
  }
}

showVehicleDocumentsWithCoverage();