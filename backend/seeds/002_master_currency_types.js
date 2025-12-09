/**
 * Seed: Master Currency Types
 * Populates master_currency_type table with major world currencies
 */

exports.seed = async function (knex) {
  // Delete existing entries
  await knex('master_currency_type').del();

  // Insert currency types
  return knex('master_currency_type').insert([
    {
      currency_type_id: 'CUR_INR',
      currency_type_name: 'Indian Rupee',
      currency_code: 'INR',
      currency_symbol: '₹',
      description: 'Official currency of India',
      status: 'ACTIVE',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      currency_type_id: 'CUR_USD',
      currency_type_name: 'US Dollar',
      currency_code: 'USD',
      currency_symbol: '$',
      description: 'Official currency of United States',
      status: 'ACTIVE',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      currency_type_id: 'CUR_EUR',
      currency_type_name: 'Euro',
      currency_code: 'EUR',
      currency_symbol: '€',
      description: 'Official currency of European Union',
      status: 'ACTIVE',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      currency_type_id: 'CUR_GBP',
      currency_type_name: 'British Pound',
      currency_code: 'GBP',
      currency_symbol: '£',
      description: 'Official currency of United Kingdom',
      status: 'ACTIVE',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      currency_type_id: 'CUR_JPY',
      currency_type_name: 'Japanese Yen',
      currency_code: 'JPY',
      currency_symbol: '¥',
      description: 'Official currency of Japan',
      status: 'ACTIVE',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      currency_type_id: 'CUR_AUD',
      currency_type_name: 'Australian Dollar',
      currency_code: 'AUD',
      currency_symbol: 'A$',
      description: 'Official currency of Australia',
      status: 'ACTIVE',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      currency_type_id: 'CUR_CAD',
      currency_type_name: 'Canadian Dollar',
      currency_code: 'CAD',
      currency_symbol: 'C$',
      description: 'Official currency of Canada',
      status: 'ACTIVE',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      currency_type_id: 'CUR_CHF',
      currency_type_name: 'Swiss Franc',
      currency_code: 'CHF',
      currency_symbol: 'Fr',
      description: 'Official currency of Switzerland',
      status: 'ACTIVE',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      currency_type_id: 'CUR_CNY',
      currency_type_name: 'Chinese Yuan',
      currency_code: 'CNY',
      currency_symbol: '¥',
      description: 'Official currency of China',
      status: 'ACTIVE',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      currency_type_id: 'CUR_SGD',
      currency_type_name: 'Singapore Dollar',
      currency_code: 'SGD',
      currency_symbol: 'S$',
      description: 'Official currency of Singapore',
      status: 'ACTIVE',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      currency_type_id: 'CUR_AED',
      currency_type_name: 'UAE Dirham',
      currency_code: 'AED',
      currency_symbol: 'د.إ',
      description: 'Official currency of United Arab Emirates',
      status: 'ACTIVE',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      currency_type_id: 'CUR_SAR',
      currency_type_name: 'Saudi Riyal',
      currency_code: 'SAR',
      currency_symbol: '﷼',
      description: 'Official currency of Saudi Arabia',
      status: 'ACTIVE',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    }
  ]);
};
