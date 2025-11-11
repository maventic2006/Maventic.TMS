exports.up = async function(knex) {
  const hasVehicleIdCode = await knex.schema.hasColumn('vehicle_documents', 'vehicle_id_code');
  const hasMaintenanceId = await knex.schema.hasColumn('vehicle_documents', 'vehicle_maintenance_id');
  
  if (!hasVehicleIdCode || !hasMaintenanceId) {
    return knex.schema.alterTable('vehicle_documents', function(table) {
      // Add vehicle_id_code column after document_id (only if doesn't exist)
      if (!hasVehicleIdCode) {
        table.string('vehicle_id_code', 20).after('document_id');
      }
      
      // Add vehicle_maintenance_id column after reference_number (only if doesn't exist)
      if (!hasMaintenanceId) {
        table.string('vehicle_maintenance_id', 20).after('reference_number');
      }
      
      // Add foreign key constraint to vehicle_basic_information_hdr (only if vehicle_id_code was added)
      if (!hasVehicleIdCode) {
        table.foreign('vehicle_id_code')
             .references('vehicle_id_code_hdr')
             .inTable('vehicle_basic_information_hdr')
             .onDelete('CASCADE')
             .onUpdate('CASCADE');
      }
    });
  }
  return Promise.resolve();
};

exports.down = function(knex) {
  return knex.schema.alterTable('vehicle_documents', function(table) {
    // Drop foreign key first
    table.dropForeign('vehicle_id_code');
    
    // Drop columns
    table.dropColumn('vehicle_id_code');
    table.dropColumn('vehicle_maintenance_id');
  });
};
