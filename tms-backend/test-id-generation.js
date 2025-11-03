const knex = require('./config/database');

async function testIdGeneration() {
  const trx = await knex.transaction();
  try {
    // Simulate generating multiple header IDs
    const ids = [];
    for (let i = 0; i < 3; i++) {
      const result = await trx('transporter_service_area_hdr').count('* as count').first();
      const count = parseInt(result.count) + 1;
      const id = `SAH`;
      console.log(`Generated ID : , count was: `);
      ids.push(id);
    }
    
    console.log('All IDs:', ids);
    await trx.rollback();
  } catch (error) {
    console.error('Error:', error);
    await trx.rollback();
  }
  await knex.destroy();
}

testIdGeneration();
