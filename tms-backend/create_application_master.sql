-- Create application_master table
CREATE TABLE IF NOT EXISTS application_master (
    app_unique_id INT AUTO_INCREMENT PRIMARY KEY,
    application_id VARCHAR(20) UNIQUE NOT NULL,
    application_name VARCHAR(100) NOT NULL,
    application_description VARCHAR(255),
    application_url VARCHAR(255),
    application_icon VARCHAR(50),
    application_category VARCHAR(50),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_on DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(10),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_on DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by VARCHAR(10),
    status VARCHAR(10) DEFAULT 'ACTIVE',
    INDEX(application_id),
    INDEX(application_category),
    INDEX(status)
);

-- Insert sample applications
INSERT INTO application_master (application_id, application_name, application_description, application_url, application_icon, application_category, display_order, created_by) VALUES
-- Maintenance Tab
('APP001', 'Transporter Management', 'Manage transporter details and information', '/transporter-management', 'truck', 'maintenance', 1, 'SYSTEM'),
('APP002', 'Vehicle Management', 'Manage vehicle fleet and maintenance', '/vehicle-management', 'car', 'maintenance', 2, 'SYSTEM'),
('APP003', 'Driver Management', 'Manage driver profiles and licenses', '/driver-management', 'user', 'maintenance', 3, 'SYSTEM'),
('APP004', 'Route Management', 'Configure transportation routes', '/route-management', 'map', 'maintenance', 4, 'SYSTEM'),

-- Approval Tab
('APP005', 'Trip Approvals', 'Approve pending trip requests', '/trip-approvals', 'check-circle', 'approval', 1, 'SYSTEM'),
('APP006', 'Cost Approvals', 'Review and approve cost estimates', '/cost-approvals', 'dollar', 'approval', 2, 'SYSTEM'),
('APP007', 'Document Approvals', 'Verify and approve documents', '/document-approvals', 'document', 'approval', 3, 'SYSTEM'),

-- Configuration Tab
('APP008', 'System Settings', 'Configure system parameters', '/system-settings', 'settings', 'configuration', 1, 'SYSTEM'),
('APP009', 'Rate Management', 'Configure transportation rates', '/rate-management', 'calculator', 'configuration', 2, 'SYSTEM'),
('APP010', 'Location Master', 'Manage locations and addresses', '/location-master', 'location', 'configuration', 3, 'SYSTEM'),

-- User Maintenance Tab
('APP011', 'User Management', 'Manage user accounts and profiles', '/user-management', 'user-group', 'user-maintenance', 1, 'SYSTEM'),
('APP012', 'Role Management', 'Configure user roles and permissions', '/role-management', 'shield', 'user-maintenance', 2, 'SYSTEM'),
('APP013', 'Access Control', 'Manage user access and security', '/access-control', 'lock', 'user-maintenance', 3, 'SYSTEM');

-- Insert application access for test users (all users get access to all apps for testing)
INSERT INTO user_application_access (application_access_id, user_role_id, application_id, access_control, valid_from, valid_to, is_active, created_at, created_on, created_by, status) VALUES
-- USER001 access
('UAA001_APP001', 'USER001', 'APP001', 'FULL', '2025-01-01', '2025-12-31', 1, NOW(), NOW(), 'SYSTEM', 'ACTIVE'),
('UAA001_APP002', 'USER001', 'APP002', 'FULL', '2025-01-01', '2025-12-31', 1, NOW(), NOW(), 'SYSTEM', 'ACTIVE'),
('UAA001_APP003', 'USER001', 'APP003', 'FULL', '2025-01-01', '2025-12-31', 1, NOW(), NOW(), 'SYSTEM', 'ACTIVE'),
('UAA001_APP004', 'USER001', 'APP004', 'FULL', '2025-01-01', '2025-12-31', 1, NOW(), NOW(), 'SYSTEM', 'ACTIVE'),
('UAA001_APP005', 'USER001', 'APP005', 'FULL', '2025-01-01', '2025-12-31', 1, NOW(), NOW(), 'SYSTEM', 'ACTIVE'),
('UAA001_APP006', 'USER001', 'APP006', 'FULL', '2025-01-01', '2025-12-31', 1, NOW(), NOW(), 'SYSTEM', 'ACTIVE'),
('UAA001_APP007', 'USER001', 'APP007', 'FULL', '2025-01-01', '2025-12-31', 1, NOW(), NOW(), 'SYSTEM', 'ACTIVE'),
('UAA001_APP008', 'USER001', 'APP008', 'FULL', '2025-01-01', '2025-12-31', 1, NOW(), NOW(), 'SYSTEM', 'ACTIVE'),
('UAA001_APP009', 'USER001', 'APP009', 'FULL', '2025-01-01', '2025-12-31', 1, NOW(), NOW(), 'SYSTEM', 'ACTIVE'),
('UAA001_APP010', 'USER001', 'APP010', 'FULL', '2025-01-01', '2025-12-31', 1, NOW(), NOW(), 'SYSTEM', 'ACTIVE'),
('UAA001_APP011', 'USER001', 'APP011', 'FULL', '2025-01-01', '2025-12-31', 1, NOW(), NOW(), 'SYSTEM', 'ACTIVE'),
('UAA001_APP012', 'USER001', 'APP012', 'FULL', '2025-01-01', '2025-12-31', 1, NOW(), NOW(), 'SYSTEM', 'ACTIVE'),
('UAA001_APP013', 'USER001', 'APP013', 'FULL', '2025-01-01', '2025-12-31', 1, NOW(), NOW(), 'SYSTEM', 'ACTIVE'),

-- USER002 access
('UAA002_APP001', 'USER002', 'APP001', 'FULL', '2025-01-01', '2025-12-31', 1, NOW(), NOW(), 'SYSTEM', 'ACTIVE'),
('UAA002_APP002', 'USER002', 'APP002', 'FULL', '2025-01-01', '2025-12-31', 1, NOW(), NOW(), 'SYSTEM', 'ACTIVE'),
('UAA002_APP003', 'USER002', 'APP003', 'FULL', '2025-01-01', '2025-12-31', 1, NOW(), NOW(), 'SYSTEM', 'ACTIVE'),
('UAA002_APP004', 'USER002', 'APP004', 'FULL', '2025-01-01', '2025-12-31', 1, NOW(), NOW(), 'SYSTEM', 'ACTIVE'),
('UAA002_APP005', 'USER002', 'APP005', 'FULL', '2025-01-01', '2025-12-31', 1, NOW(), NOW(), 'SYSTEM', 'ACTIVE'),
('UAA002_APP006', 'USER002', 'APP006', 'FULL', '2025-01-01', '2025-12-31', 1, NOW(), NOW(), 'SYSTEM', 'ACTIVE'),
('UAA002_APP007', 'USER002', 'APP007', 'FULL', '2025-01-01', '2025-12-31', 1, NOW(), NOW(), 'SYSTEM', 'ACTIVE'),
('UAA002_APP008', 'USER002', 'APP008', 'FULL', '2025-01-01', '2025-12-31', 1, NOW(), NOW(), 'SYSTEM', 'ACTIVE'),
('UAA002_APP009', 'USER002', 'APP009', 'FULL', '2025-01-01', '2025-12-31', 1, NOW(), NOW(), 'SYSTEM', 'ACTIVE'),
('UAA002_APP010', 'USER002', 'APP010', 'FULL', '2025-01-01', '2025-12-31', 1, NOW(), NOW(), 'SYSTEM', 'ACTIVE'),
('UAA002_APP011', 'USER002', 'APP011', 'FULL', '2025-01-01', '2025-12-31', 1, NOW(), NOW(), 'SYSTEM', 'ACTIVE'),
('UAA002_APP012', 'USER002', 'APP012', 'FULL', '2025-01-01', '2025-12-31', 1, NOW(), NOW(), 'SYSTEM', 'ACTIVE'),
('UAA002_APP013', 'USER002', 'APP013', 'FULL', '2025-01-01', '2025-12-31', 1, NOW(), NOW(), 'SYSTEM', 'ACTIVE'),

-- USER003 access
('UAA003_APP001', 'USER003', 'APP001', 'FULL', '2025-01-01', '2025-12-31', 1, NOW(), NOW(), 'SYSTEM', 'ACTIVE'),
('UAA003_APP002', 'USER003', 'APP002', 'FULL', '2025-01-01', '2025-12-31', 1, NOW(), NOW(), 'SYSTEM', 'ACTIVE'),
('UAA003_APP003', 'USER003', 'APP003', 'FULL', '2025-01-01', '2025-12-31', 1, NOW(), NOW(), 'SYSTEM', 'ACTIVE'),
('UAA003_APP004', 'USER003', 'APP004', 'FULL', '2025-01-01', '2025-12-31', 1, NOW(), NOW(), 'SYSTEM', 'ACTIVE'),
('UAA003_APP005', 'USER003', 'APP005', 'FULL', '2025-01-01', '2025-12-31', 1, NOW(), NOW(), 'SYSTEM', 'ACTIVE'),
('UAA003_APP006', 'USER003', 'APP006', 'FULL', '2025-01-01', '2025-12-31', 1, NOW(), NOW(), 'SYSTEM', 'ACTIVE'),
('UAA003_APP007', 'USER003', 'APP007', 'FULL', '2025-01-01', '2025-12-31', 1, NOW(), NOW(), 'SYSTEM', 'ACTIVE'),
('UAA003_APP008', 'USER003', 'APP008', 'FULL', '2025-01-01', '2025-12-31', 1, NOW(), NOW(), 'SYSTEM', 'ACTIVE'),
('UAA003_APP009', 'USER003', 'APP009', 'FULL', '2025-01-01', '2025-12-31', 1, NOW(), NOW(), 'SYSTEM', 'ACTIVE'),
('UAA003_APP010', 'USER003', 'APP010', 'FULL', '2025-01-01', '2025-12-31', 1, NOW(), NOW(), 'SYSTEM', 'ACTIVE'),
('UAA003_APP011', 'USER003', 'APP011', 'FULL', '2025-01-01', '2025-12-31', 1, NOW(), NOW(), 'SYSTEM', 'ACTIVE'),
('UAA003_APP012', 'USER003', 'APP012', 'FULL', '2025-01-01', '2025-12-31', 1, NOW(), NOW(), 'SYSTEM', 'ACTIVE'),
('UAA003_APP013', 'USER003', 'APP013', 'FULL', '2025-01-01', '2025-12-31', 1, NOW(), NOW(), 'SYSTEM', 'ACTIVE');