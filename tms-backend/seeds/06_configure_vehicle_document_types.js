exports.seed = async function (knex) {
  const existingConfigs = await knex('doc_type_configuration')
    .where('user_type', 'VEHICLE')
    .select('document_type_id');

  if (existingConfigs.length > 0) {
    console.log('Vehicle document configurations already exist');
    return;
  }

  const vehicleDocs = await knex('document_name_master')
    .where('status', 'ACTIVE')
    .whereIn('user_type', ['VEHICLE', 'TRANSPORTER'])
    .where(function() {
      this.where('user_type', 'VEHICLE')
        .orWhere(function() {
          this.where('user_type', 'TRANSPORTER')
            .whereIn('document_name', [
              'Vehicle Registration Certificate',
              'Vehicle Insurance',
              'PUC certificate',
              'Permit certificate',
              'Fitness Certificate',
              'Insurance Policy'
            ]);
        });
    })
    .select('doc_name_master_id', 'document_name');

  const allConfigs = await knex('doc_type_configuration')
    .select('document_type_id');

  const numericIds = allConfigs
    .map(config => {
      const match = config.document_type_id.match(/\d+/);
      return match ? parseInt(match[0]) : 0;
    })
    .filter(n => !isNaN(n));

  const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 0;
  let currentId = maxId + 1;

  const documentRules = {
    'Vehicle Registration Certificate': { isMandatory: true, isExpiryRequired: false, isVerificationRequired: true },
    'Vehicle Insurance': { isMandatory: true, isExpiryRequired: true, isVerificationRequired: true },
    'Insurance Policy': { isMandatory: false, isExpiryRequired: true, isVerificationRequired: true },
    'PUC certificate': { isMandatory: true, isExpiryRequired: true, isVerificationRequired: false },
    'Permit certificate': { isMandatory: false, isExpiryRequired: true, isVerificationRequired: false },
    'Fitness Certificate': { isMandatory: true, isExpiryRequired: true, isVerificationRequired: false },
    'Tax Certificate': { isMandatory: true, isExpiryRequired: true, isVerificationRequired: false },
    'AIP': { isMandatory: false, isExpiryRequired: true, isVerificationRequired: false },
    'Temp Vehicle Permit': { isMandatory: false, isExpiryRequired: true, isVerificationRequired: false },
    'Vehicle Warranty': { isMandatory: false, isExpiryRequired: true, isVerificationRequired: false },
    'Vehicle Service Bill': { isMandatory: false, isExpiryRequired: false, isVerificationRequired: false },
    'Leasing Agreement': { isMandatory: false, isExpiryRequired: true, isVerificationRequired: true },
  };

  const configsToInsert = vehicleDocs.map(doc => {
    const rules = documentRules[doc.document_name] || {
      isMandatory: false,
      isExpiryRequired: false,
      isVerificationRequired: false,
    };

    const config = {
      document_type_id: 'DTM' + String(currentId).padStart(3, '0'),
      doc_name_master_id: doc.doc_name_master_id,
      user_type: 'VEHICLE',
      service_area_country: null,
      is_mandatory: rules.isMandatory,
      is_expiry_required: rules.isExpiryRequired,
      is_verification_required: rules.isVerificationRequired,
      created_at: knex.fn.now(),
      created_on: knex.fn.now(),
      created_by: 'SYSTEM',
      updated_at: knex.fn.now(),
      updated_on: knex.fn.now(),
      updated_by: 'SYSTEM',
      status: 'ACTIVE',
    };

    currentId++;
    return config;
  });

  await knex('doc_type_configuration').insert(configsToInsert);
  console.log('Successfully configured ' + configsToInsert.length + ' vehicle document types');
};