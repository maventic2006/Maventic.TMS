/**
 * Migration: Increase file_name and contact field lengths
 * Description: Fixes DATA_TOO_LONG errors by increasing field lengths for:
 *              - document_upload.file_name (255 → 500 chars)
 *              - contact.contact_role (40 → 100 chars)
 *              - contact.contact_team (20 → 100 chars)
 *              - contact.linkedin_link (200 → 500 chars)
 * 
 * Reason: Document file names can be very long (especially with timestamps,
 *         descriptions, version numbers). Contact fields also need more space
 *         for detailed role/team descriptions.
 * 
 * Date: November 17, 2025
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  console.log('🔧 Increasing field lengths to prevent DATA_TOO_LONG errors...');
  
  // 1. Increase document_upload.file_name from VARCHAR(255) to VARCHAR(500)
  console.log('  📄 Updating document_upload.file_name: VARCHAR(255) → VARCHAR(500)');
  await knex.raw('ALTER TABLE document_upload MODIFY COLUMN file_name VARCHAR(500)');
  
  // 2. Increase contact.contact_role from VARCHAR(40) to VARCHAR(100)
  console.log('  👤 Updating contact.contact_role: VARCHAR(40) → VARCHAR(100)');
  await knex.raw('ALTER TABLE contact MODIFY COLUMN contact_role VARCHAR(100)');
  
  // 3. Increase contact.contact_team from VARCHAR(20) to VARCHAR(100)
  console.log('  👥 Updating contact.contact_team: VARCHAR(20) → VARCHAR(100)');
  await knex.raw('ALTER TABLE contact MODIFY COLUMN contact_team VARCHAR(100)');
  
  // 4. Increase contact.linkedin_link from VARCHAR(200) to VARCHAR(500)
  console.log('  🔗 Updating contact.linkedin_link: VARCHAR(200) → VARCHAR(500)');
  await knex.raw('ALTER TABLE contact MODIFY COLUMN linkedin_link VARCHAR(500)');
  
  console.log('✅ Field length increases completed successfully!');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  console.log('🔄 Rolling back field length increases...');
  
  // Rollback in reverse order
  await knex.raw('ALTER TABLE contact MODIFY COLUMN linkedin_link VARCHAR(200)');
  await knex.raw('ALTER TABLE contact MODIFY COLUMN contact_team VARCHAR(20)');
  await knex.raw('ALTER TABLE contact MODIFY COLUMN contact_role VARCHAR(40)');
  await knex.raw('ALTER TABLE document_upload MODIFY COLUMN file_name VARCHAR(255)');
  
  console.log('✅ Rollback completed');
};
