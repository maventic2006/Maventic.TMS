/**
 * Seed file: Application Master
 * Populates application table with initial applications
 */
exports.seed = async function (knex) {
  // Clear existing entries (optional - remove if you want to keep existing data)
  // await knex('application').del();
  
  // Check if applications already exist
  const existingApps = await knex('application_master').select('application_id');
  const existingAppIds = existingApps.map(app => app.application_id);
  
  // Applications to insert
  const applications = [
    {
      application_id: 'TMS',
      application_name: 'Transportation Management System',
      application_description: 'Manage transporters, drivers, vehicles, and shipments',
      application_url: 'http://localhost:5173',
      application_icon: 'truck',
      application_category: 'Logistics',
      display_order: 1,
      is_active: true,
      status: 'ACTIVE',
      created_by: 'SYSTEM'
    },
    {
      application_id: 'WMS',
      application_name: 'Warehouse Management System',
      application_description: 'Manage warehouses, inventory, and storage',
      application_url: 'http://localhost:5174',
      application_icon: 'warehouse',
      application_category: 'Logistics',
      display_order: 2,
      is_active: true,
      status: 'ACTIVE',
      created_by: 'SYSTEM'
    },
    {
      application_id: 'BILLING',
      application_name: 'Billing & Invoice System',
      application_description: 'Manage invoices, payments, and billing',
      application_url: 'http://localhost:5175',
      application_icon: 'invoice',
      application_category: 'Finance',
      display_order: 3,
      is_active: true,
      status: 'ACTIVE',
      created_by: 'SYSTEM'
    }
  ];
  
  // Filter out applications that already exist
  const newApplications = applications.filter(app => !existingAppIds.includes(app.application_id));
  
  if (newApplications.length > 0) {
    await knex('application_master').insert(newApplications);
    console.log(`✅ Inserted ${newApplications.length} applications into application_master`);
  } else {
    console.log('ℹ️  All applications already exist in application_master');
  }
};
