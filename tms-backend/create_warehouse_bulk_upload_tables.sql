-- Create warehouse bulk upload tables
-- Run this if migration system is not working

-- Drop existing tables if they exist
DROP TABLE IF EXISTS `tms_warehouse_bulk_upload_warehouses`;
DROP TABLE IF EXISTS `tms_warehouse_bulk_upload_batches`;

-- Create tms_warehouse_bulk_upload_batches table
CREATE TABLE `tms_warehouse_bulk_upload_batches` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `batch_id` VARCHAR(50) NOT NULL UNIQUE,
  `uploaded_by` INT UNSIGNED NOT NULL,
  `filename` VARCHAR(255) NOT NULL,
  `total_rows` INT NOT NULL DEFAULT 0,
  `total_valid` INT DEFAULT 0,
  `total_invalid` INT DEFAULT 0,
  `total_created` INT DEFAULT 0,
  `total_creation_failed` INT DEFAULT 0,
  `status` ENUM('processing', 'completed', 'failed') DEFAULT 'processing',
  `upload_timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `processed_timestamp` TIMESTAMP NULL,
  `error_report_path` VARCHAR(500) NULL,
  INDEX `idx_uploaded_by` (`uploaded_by`),
  INDEX `idx_status` (`status`),
  INDEX `idx_upload_timestamp` (`upload_timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create tms_warehouse_bulk_upload_warehouses table
CREATE TABLE `tms_warehouse_bulk_upload_warehouses` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `batch_id` VARCHAR(50) NOT NULL,
  `warehouse_ref_id` VARCHAR(50) NULL COMMENT 'Reference ID from Excel (Warehouse_Name1)',
  `excel_row_number` INT NOT NULL,
  `validation_status` ENUM('valid', 'invalid') NOT NULL,
  `validation_errors` JSON NULL,
  `data` JSON NULL COMMENT 'Stores the complete warehouse data JSON',
  `created_warehouse_id` VARCHAR(50) NULL COMMENT 'WH001, WH002, etc.',
  FOREIGN KEY (`batch_id`) REFERENCES `tms_warehouse_bulk_upload_batches`(`batch_id`) ON DELETE CASCADE,
  FOREIGN KEY (`created_warehouse_id`) REFERENCES `warehouse_basic_information`(`warehouse_id`),
  INDEX `idx_batch_id` (`batch_id`),
  INDEX `idx_validation_status` (`validation_status`),
  INDEX `idx_warehouse_ref_id` (`warehouse_ref_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verify tables created
SHOW TABLES LIKE 'tms_warehouse_bulk%';