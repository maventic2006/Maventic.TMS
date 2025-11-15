/**
 * Migration: Alter consignor_organization business_area to JSON
 * Description: Changes business_area from string to JSON to support multiple states
 * Date: 2025-11-14
 */

exports.up = async function (knex) {
  // First, convert existing string data to JSON arrays
  const organizations = await knex('consignor_organization').select('*');
  
  // Change column type to TEXT (for JSON storage)
  await knex.schema.alterTable('consignor_organization', function (table) {
    table.text('business_area_temp').comment('Temporary column for business areas (JSON array of state names)');
  });

  // Migrate existing data - convert strings to JSON arrays
  for (const org of organizations) {
    const businessAreaArray = org.business_area ? [org.business_area] : [];
    await knex('consignor_organization')
      .where('organization_unique_id', org.organization_unique_id)
      .update({
        business_area_temp: JSON.stringify(businessAreaArray)
      });
  }

  // Drop old column and rename temp column
  await knex.schema.alterTable('consignor_organization', function (table) {
    table.dropColumn('business_area');
  });

  await knex.schema.alterTable('consignor_organization', function (table) {
    table.renameColumn('business_area_temp', 'business_area');
  });

  // Remove unique constraint since multiple consignors can operate in same states
  await knex.schema.alterTable('consignor_organization', function (table) {
    table.dropIndex(['business_area'], 'idx_consignor_org_business_area');
  });

  console.log(' Successfully migrated business_area to JSON format');
};

exports.down = async function (knex) {
  // Revert back to string - take first state from array
  const organizations = await knex('consignor_organization').select('*');

  await knex.schema.alterTable('consignor_organization', function (table) {
    table.string('business_area_temp', 30);
  });

  for (const org of organizations) {
    try {
      const businessAreaArray = JSON.parse(org.business_area || '[]');
      const businessAreaString = businessAreaArray[0] || '';
      await knex('consignor_organization')
        .where('organization_unique_id', org.organization_unique_id)
        .update({
          business_area_temp: businessAreaString
        });
    } catch (error) {
      console.error('Error reverting business_area for org:', org.organization_unique_id, error);
    }
  }

  await knex.schema.alterTable('consignor_organization', function (table) {
    table.dropColumn('business_area');
  });

  await knex.schema.alterTable('consignor_organization', function (table) {
    table.renameColumn('business_area_temp', 'business_area');
  });

  await knex.schema.alterTable('consignor_organization', function (table) {
    table.index(['business_area'], 'idx_consignor_org_business_area');
  });

  console.log(' Reverted business_area to string format');
};
