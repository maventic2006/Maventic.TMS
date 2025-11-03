const knex = require('./config/database');

async function testQuery() {
  try {
    const results = await knex('transporter_service_area_hdr as hdr')
      .leftJoin('transporter_service_area_itm as itm', function() {
        this.on('hdr.service_area_hdr_id', '=', 'itm.service_area_hdr_id')
            .andOn('itm.status', '=', knex.raw('?', ['ACTIVE']));
      })
      .where('hdr.transporter_id', 'T063')
      .where('hdr.status', 'ACTIVE')
      .select(
        'hdr.service_area_hdr_id as header_id',
        'hdr.service_country as country',
        'itm.service_area_itm_id as item_id',
        'itm.service_state as state'
      );
    
    console.log('Raw query results:');
    console.log(JSON.stringify(results, null, 2));
    
    await knex.destroy();
  } catch (error) {
    console.error('Error:', error);
    await knex.destroy();
  }
}

testQuery();
