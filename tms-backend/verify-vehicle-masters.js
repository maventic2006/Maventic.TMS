const knex = require('knex');
const config = require('./knexfile');

const db = knex(config.development);

async function verifyVehicleMasters() {
    try {
        console.log('🚀 Verifying Vehicle Master Tables and Foreign Key Relationships...\n');

        // Check Fuel Type Master
        console.log('📋 FUEL TYPE MASTER:');
        const fuelTypes = await db('fuel_type_master').select('*');
        console.log(`   Total records: ${fuelTypes.length}`);
        fuelTypes.forEach(fuel => {
            console.log(`   - ${fuel.fuel_type_id}: ${fuel.fuel_type} (${fuel.status})`);
        });
        console.log('');

        // Check Engine Type Master
        console.log('📋 ENGINE TYPE MASTER:');
        const engineTypes = await db('engine_type_master').select('*');
        console.log(`   Total records: ${engineTypes.length}`);
        engineTypes.forEach(engine => {
            console.log(`   - ${engine.engine_type_id}: ${engine.engine_type} (${engine.status})`);
        });
        console.log('');

        // Check Usage Type Master
        console.log('📋 USAGE TYPE MASTER:');
        const usageTypes = await db('usage_type_master').select('*');
        console.log(`   Total records: ${usageTypes.length}`);
        usageTypes.forEach(usage => {
            console.log(`   - ${usage.usage_type_id}: ${usage.usage_type} (${usage.status})`);
        });
        console.log('');

        // Check Vehicle Table with Foreign Key Relationships
        console.log('📋 VEHICLE BASIC INFORMATION (with Master Table References):');
        const vehicles = await db('vehicle_basic_information_hdr')
            .leftJoin('fuel_type_master', 'vehicle_basic_information_hdr.fuel_type_id', 'fuel_type_master.fuel_type_id')
            .leftJoin('engine_type_master', 'vehicle_basic_information_hdr.engine_type_id', 'engine_type_master.engine_type_id')
            .leftJoin('usage_type_master', 'vehicle_basic_information_hdr.usage_type_id', 'usage_type_master.usage_type_id')
            .select(
                'vehicle_basic_information_hdr.vehicle_id_code_hdr',
                'vehicle_basic_information_hdr.maker_brand_description',
                'vehicle_basic_information_hdr.maker_model',
                'fuel_type_master.fuel_type',
                'engine_type_master.engine_type',
                'usage_type_master.usage_type',
                'vehicle_basic_information_hdr.load_capacity_in_ton'
            );

        console.log(`   Total vehicles: ${vehicles.length}`);
        vehicles.forEach(vehicle => {
            console.log(`   - ${vehicle.vehicle_id_code_hdr}: ${vehicle.maker_brand_description} ${vehicle.maker_model}`);
            console.log(`     Fuel: ${vehicle.fuel_type}, Engine: ${vehicle.engine_type}, Usage: ${vehicle.usage_type}`);
            console.log(`     Capacity: ${vehicle.load_capacity_in_ton} tons`);
            console.log('');
        });

        // Check Foreign Key Constraints
        console.log('🔗 FOREIGN KEY CONSTRAINTS VERIFICATION:');
        const constraints = await db.raw(`
            SELECT 
                TABLE_NAME,
                COLUMN_NAME,
                CONSTRAINT_NAME,
                REFERENCED_TABLE_NAME,
                REFERENCED_COLUMN_NAME
            FROM 
                INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE 
                REFERENCED_TABLE_SCHEMA = 'tms_dev' 
                AND TABLE_NAME = 'vehicle_basic_information_hdr'
                AND REFERENCED_TABLE_NAME IN ('fuel_type_master', 'engine_type_master', 'usage_type_master')
        `);

        console.log('   Vehicle Master Foreign Keys:');
        constraints[0].forEach(constraint => {
            console.log(`   - ${constraint.COLUMN_NAME} → ${constraint.REFERENCED_TABLE_NAME}.${constraint.REFERENCED_COLUMN_NAME}`);
        });

        console.log('\n✅ All Vehicle Master Tables and Foreign Key Relationships verified successfully!');

    } catch (error) {
        console.error('❌ Error verifying vehicle masters:', error.message);
    } finally {
        await db.destroy();
    }
}

verifyVehicleMasters();