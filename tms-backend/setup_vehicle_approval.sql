INSERT INTO approval_type_master (approval_type_id, approval_type, approval_name, approval_category, created_by, created_at, updated_at, status) 
VALUES ('AT004', 'Vehicle Owner', 'Vehicle Owner User Creation', 'User Create', 'SYSTEM', NOW(), NOW(), 'ACTIVE');

INSERT INTO approval_configuration (approval_configuration_id, approval_type_id, approval_level, role_type_id, user_id, created_by, created_at, updated_at, status) 
VALUES ('AC0004', 'AT004', 'Level 1', 'RL001', NULL, 'SYSTEM', NOW(), NOW(), 'ACTIVE');
