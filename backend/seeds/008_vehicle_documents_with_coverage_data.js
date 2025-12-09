exports.seed = async function(knex) {
  // Delete existing entries
  await knex('vehicle_documents').del();

  // Insert vehicle documents with proper coverage type foreign key references
  await knex('vehicle_documents').insert([
    {
      document_id: 'DOC001',
      document_type_id: 'INSURANCE',
      reference_number: 'INS-2024-001234',
      permit_category: 'Vehicle Insurance',
      permit_code: 'VI001',
      document_provider: 'National Insurance Company',
      coverage_type_id: 'CT001', // Comprehensive Insurance
      premium_amount: 25000.00,
      valid_from: '2024-01-01',
      valid_to: '2024-12-31',
      remarks: 'Annual comprehensive insurance policy',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      document_id: 'DOC002',
      document_type_id: 'LIABILITY',
      reference_number: 'LIB-2024-005678',
      permit_category: 'Third Party Coverage',
      permit_code: 'TP001',
      document_provider: 'State Transport Insurance',
      coverage_type_id: 'CT002', // Third Party Liability
      premium_amount: 8500.00,
      valid_from: '2024-01-01',
      valid_to: '2024-12-31',
      remarks: 'Third party liability insurance as per Motor Vehicle Act',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      document_id: 'DOC003',
      document_type_id: 'CARGO',
      reference_number: 'CGO-2024-009876',
      permit_category: 'Cargo Protection',
      permit_code: 'CP001',
      document_provider: 'Cargo Insurance Ltd',
      coverage_type_id: 'CT004', // Cargo Insurance
      premium_amount: 15000.00,
      valid_from: '2024-01-01',
      valid_to: '2024-12-31',
      remarks: 'Insurance coverage for transported goods',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      document_id: 'DOC004',
      document_type_id: 'WARRANTY',
      reference_number: 'WAR-2024-112233',
      permit_category: 'Extended Service',
      permit_code: 'ES001',
      document_provider: 'Vehicle Service Solutions',
      coverage_type_id: 'CT007', // Extended Warranty
      premium_amount: 12000.00,
      valid_from: '2024-01-01',
      valid_to: '2026-12-31',
      remarks: 'Extended warranty coverage for vehicle components',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      document_id: 'DOC005',
      document_type_id: 'ASSISTANCE',
      reference_number: 'RSA-2024-445566',
      permit_category: 'Emergency Support',
      permit_code: 'RS001',
      document_provider: 'Highway Assistance Services',
      coverage_type_id: 'CT008', // Roadside Assistance
      premium_amount: 3500.00,
      valid_from: '2024-01-01',
      valid_to: '2024-12-31',
      remarks: '24/7 roadside assistance and emergency services',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    }
  ]);

  console.log('✅ Vehicle Documents with Coverage Type references sample data seeded successfully!');
};