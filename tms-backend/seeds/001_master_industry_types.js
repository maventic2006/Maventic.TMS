/**
 * Seed: Master Industry Types
 * Populates master_industry_type table with common industry classifications
 */

exports.seed = async function (knex) {
  // Delete existing entries
  await knex('master_industry_type').del();

  // Insert industry types
  return knex('master_industry_type').insert([
    {
      industry_type_id: 'IND_AUTOMOTIVE',
      industry_type_name: 'Automotive',
      industry_type_code: 'AUTO',
      description: 'Automotive and vehicle manufacturing industry',
      status: 'ACTIVE',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      industry_type_id: 'IND_FMCG',
      industry_type_name: 'FMCG (Fast Moving Consumer Goods)',
      industry_type_code: 'FMCG',
      description: 'Fast-moving consumer goods industry',
      status: 'ACTIVE',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      industry_type_id: 'IND_PHARMA',
      industry_type_name: 'Pharmaceutical',
      industry_type_code: 'PHARMA',
      description: 'Pharmaceutical and healthcare industry',
      status: 'ACTIVE',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      industry_type_id: 'IND_RETAIL',
      industry_type_name: 'Retail & E-commerce',
      industry_type_code: 'RETAIL',
      description: 'Retail and e-commerce industry',
      status: 'ACTIVE',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      industry_type_id: 'IND_ELECTRONICS',
      industry_type_name: 'Electronics & Technology',
      industry_type_code: 'ELEC',
      description: 'Electronics and technology manufacturing',
      status: 'ACTIVE',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      industry_type_id: 'IND_TEXTILE',
      industry_type_name: 'Textile & Apparel',
      industry_type_code: 'TEXTILE',
      description: 'Textile and apparel manufacturing',
      status: 'ACTIVE',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      industry_type_id: 'IND_FOOD',
      industry_type_name: 'Food & Beverage',
      industry_type_code: 'FOOD',
      description: 'Food and beverage production and distribution',
      status: 'ACTIVE',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      industry_type_id: 'IND_CHEMICAL',
      industry_type_name: 'Chemical & Petrochemical',
      industry_type_code: 'CHEM',
      description: 'Chemical and petrochemical industry',
      status: 'ACTIVE',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      industry_type_id: 'IND_CONSTRUCTION',
      industry_type_name: 'Construction & Building Materials',
      industry_type_code: 'CONST',
      description: 'Construction and building materials industry',
      status: 'ACTIVE',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      industry_type_id: 'IND_LOGISTICS',
      industry_type_name: 'Logistics & Supply Chain',
      industry_type_code: 'LOG',
      description: 'Logistics and supply chain services',
      status: 'ACTIVE',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      industry_type_id: 'IND_AGRICULTURE',
      industry_type_name: 'Agriculture & Agribusiness',
      industry_type_code: 'AGRI',
      description: 'Agriculture and agribusiness sector',
      status: 'ACTIVE',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      industry_type_id: 'IND_ENERGY',
      industry_type_name: 'Energy & Utilities',
      industry_type_code: 'ENERGY',
      description: 'Energy and utilities sector',
      status: 'ACTIVE',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      industry_type_id: 'IND_MANUFACTURING',
      industry_type_name: 'General Manufacturing',
      industry_type_code: 'MFG',
      description: 'General manufacturing sector',
      status: 'ACTIVE',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      industry_type_id: 'IND_TELECOM',
      industry_type_name: 'Telecommunications',
      industry_type_code: 'TELECOM',
      description: 'Telecommunications industry',
      status: 'ACTIVE',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      industry_type_id: 'IND_OTHER',
      industry_type_name: 'Other',
      industry_type_code: 'OTHER',
      description: 'Other industries not listed above',
      status: 'ACTIVE',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    }
  ]);
};
