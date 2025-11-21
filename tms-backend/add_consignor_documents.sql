-- Add NDA and MSA to document_name_master
INSERT INTO document_name_master (doc_name_master_id, document_name, user_type, created_at, created_on, created_by, updated_at, updated_on, updated_by, status)
VALUES 
('DN019', 'NDA', 'CONSIGNOR', NOW(), NOW(), 'SYSTEM', NOW(), NOW(), 'SYSTEM', 'ACTIVE'),
('DN020', 'MSA', 'CONSIGNOR', NOW(), NOW(), 'SYSTEM', NOW(), NOW(), 'SYSTEM', 'ACTIVE');

-- Add document type configurations for CONSIGNOR
INSERT INTO doc_type_configuration (document_type_id, doc_name_master_id, user_type, service_area_country, is_mandatory, is_expiry_required, is_verification_required, created_at, created_on, created_by, updated_at, updated_on, updated_by, status)
VALUES 
('DTCONS001', 'DN001', 'CONSIGNOR', NULL, 0, 0, 1, NOW(), NOW(), 'SYSTEM', NOW(), NOW(), 'SYSTEM', 'ACTIVE'),
('DTCONS002', 'DN002', 'CONSIGNOR', NULL, 0, 0, 1, NOW(), NOW(), 'SYSTEM', NOW(), NOW(), 'SYSTEM', 'ACTIVE'),
('DTCONS003', 'DN003', 'CONSIGNOR', NULL, 0, 0, 1, NOW(), NOW(), 'SYSTEM', NOW(), NOW(), 'SYSTEM', 'ACTIVE'),
('DTCONS004', 'DN004', 'CONSIGNOR', NULL, 1, 1, 1, NOW(), NOW(), 'SYSTEM', NOW(), NOW(), 'SYSTEM', 'ACTIVE'),
('DTCONS005', 'DN005', 'CONSIGNOR', NULL, 0, 1, 1, NOW(), NOW(), 'SYSTEM', NOW(), NOW(), 'SYSTEM', 'ACTIVE'),
('DTCONS006', 'DN006', 'CONSIGNOR', NULL, 0, 1, 0, NOW(), NOW(), 'SYSTEM', NOW(), NOW(), 'SYSTEM', 'ACTIVE'),
('DTCONS007', 'DN007', 'CONSIGNOR', NULL, 0, 1, 0, NOW(), NOW(), 'SYSTEM', NOW(), NOW(), 'SYSTEM', 'ACTIVE'),
('DTCONS008', 'DN008', 'CONSIGNOR', NULL, 0, 0, 1, NOW(), NOW(), 'SYSTEM', NOW(), NOW(), 'SYSTEM', 'ACTIVE'),
('DTCONS009', 'DN019', 'CONSIGNOR', NULL, 0, 1, 0, NOW(), NOW(), 'SYSTEM', NOW(), NOW(), 'SYSTEM', 'ACTIVE'),
('DTCONS010', 'DN020', 'CONSIGNOR', NULL, 0, 1, 0, NOW(), NOW(), 'SYSTEM', NOW(), NOW(), 'SYSTEM', 'ACTIVE');

SELECT ' Successfully added NDA and MSA documents + CONSIGNOR configurations' AS Result;
