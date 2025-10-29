/**
 * Seed file to add addresses for the first 10 transporters (T001-T010)
 * These transporters were updated from old IDs but didn't get addresses created
 */

exports.seed = async function (knex) {
  console.log('\n=== Adding Addresses for T001-T010 ===\n');

  // Indian cities and states for realistic data
  const indianLocations = [
    { city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai Suburban' },
    { city: 'Delhi', state: 'Delhi', district: 'New Delhi' },
    { city: 'Bangalore', state: 'Karnataka', district: 'Bangalore Urban' },
    { city: 'Hyderabad', state: 'Telangana', district: 'Hyderabad' },
    { city: 'Chennai', state: 'Tamil Nadu', district: 'Chennai' },
    { city: 'Kolkata', state: 'West Bengal', district: 'Kolkata' },
    { city: 'Pune', state: 'Maharashtra', district: 'Pune' },
    { city: 'Ahmedabad', state: 'Gujarat', district: 'Ahmedabad' },
    { city: 'Jaipur', state: 'Rajasthan', district: 'Jaipur' },
    { city: 'Surat', state: 'Gujarat', district: 'Surat' },
  ];

  const streets = [
    'MG Road', 'Ring Road', 'Industrial Area', 'Main Street', 
    'Station Road', 'Park Street', 'Nehru Road', 'Gandhi Nagar',
    'Commercial Complex', 'Bypass Road'
  ];

  // Generate GST number based on state code
  const stateGSTCodes = {
    'Maharashtra': '27', 'Delhi': '07', 'Karnataka': '29', 'Telangana': '36',
    'Tamil Nadu': '33', 'West Bengal': '19', 'Gujarat': '24', 'Rajasthan': '08'
  };

  const generateGSTNumber = (state) => {
    const stateCode = stateGSTCodes[state] || '27';
    const panLike = String(Math.random()).substring(2, 7).toUpperCase();
    const random4 = String(Math.random()).substring(2, 6);
    return `${stateCode}${panLike}${random4}Z1A${Math.floor(Math.random() * 10)}`;
  };

  // Prepare addresses data
  const addresses = [];
  
  for (let i = 1; i <= 10; i++) {
    const transporterId = `T${String(i).padStart(3, '0')}`;
    const addressId = `ADDR000${i}`;
    const location = indianLocations[i - 1];
    const street = streets[Math.floor(Math.random() * streets.length)];
    const houseNo = Math.floor(Math.random() * 500) + 1;

    addresses.push({
      address_id: addressId,
      user_reference_id: transporterId,
      user_type: 'TRANSPORTER',
      address_type_id: 'AT001', // Business address
      street_1: `${houseNo}, ${street}`,
      street_2: `Sector ${Math.floor(Math.random() * 20) + 1}`,
      city: location.city,
      state: location.state,
      country: 'India',
      district: location.district,
      postal_code: `${400000 + i * 1000}`,
      vat_number: generateGSTNumber(location.state),
      is_primary: true,
      created_at: new Date(),
      created_on: new Date(),
      created_by: 'SYSTEM',
      updated_at: new Date(),
      updated_on: new Date(),
      updated_by: 'SYSTEM',
      status: 'ACTIVE',
    });
  }

  // Insert addresses with upsert logic
  console.log('Inserting addresses for T001-T010...');
  
  await knex('tms_address')
    .insert(addresses)
    .onConflict('address_id')
    .merge();

  console.log(`✅ Successfully added ${addresses.length} addresses for T001-T010`);
  
  // Verify
  const count = await knex('tms_address')
    .where('user_type', 'TRANSPORTER')
    .whereBetween('user_reference_id', ['T001', 'T010'])
    .count('* as count')
    .first();
  
  console.log(`✅ Verification: ${count.count} addresses found for T001-T010\n`);
};
