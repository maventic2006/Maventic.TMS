const db = require('./config/database');

(async () => {
  try {
    console.log('\n=== VEHICLE VEH0051 DOCUMENT ANALYSIS ===\n');
    
    const vehicleDocs = await db('vehicle_documents as vd')
      .leftJoin('document_upload as du', 'vd.document_id', 'du.system_reference_id')
      .leftJoin('document_name_master as dnm', 'vd.document_type_id', 'dnm.doc_name_master_id')
      .where('vd.vehicle_id_code', 'VEH0051')
      .select(
        'vd.document_id',
        'vd.document_type_id',
        'dnm.document_name as document_type_name',
        'vd.reference_number',
        'vd.document_provider',
        'vd.valid_from',
        'vd.valid_to',
        'du.file_name',
        'du.file_type',
        db.raw('LENGTH(du.file_xstring_value) as file_size')
      );
    
    console.log('Total Documents Found:', vehicleDocs.length);
    console.log('');
    
    vehicleDocs.forEach((doc, i) => {
      console.log('Document', i + 1 + ':');
      console.log('  - ID:', doc.document_id);
      console.log('  - Type:', doc.document_type_name || doc.document_type_id);
      console.log('  - Reference:', doc.reference_number || 'N/A');
      console.log('  - Provider:', doc.document_provider || 'N/A');
      console.log('  - Valid From:', doc.valid_from ? new Date(doc.valid_from).toISOString().split('T')[0] : 'N/A');
      console.log('  - Valid To:', doc.valid_to ? new Date(doc.valid_to).toISOString().split('T')[0] : 'N/A');
      console.log('  - File Name:', doc.file_name || 'NO FILE UPLOADED');
      console.log('  - File Type:', doc.file_type || 'N/A');
      console.log('  - File Size:', doc.file_size ? (doc.file_size + ' bytes') : 'NO FILE DATA');
      console.log('');
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
