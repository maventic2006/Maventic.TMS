/**
 * Storage Service for File Upload/Download
 * Supports both local filesystem and AWS S3 storage
 * 
 * Configuration via environment variables:
 * - STORAGE_TYPE: 'local' or 's3' (default: 'local')
 * - LOCAL_UPLOAD_PATH: Path for local storage (default: './uploads')
 * - AWS_S3_BUCKET: S3 bucket name
 * - AWS_REGION: AWS region
 * - AWS_ACCESS_KEY_ID: AWS access key
 * - AWS_SECRET_ACCESS_KEY: AWS secret key
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Storage configuration
const STORAGE_TYPE = process.env.STORAGE_TYPE || 'local';
const LOCAL_UPLOAD_PATH = process.env.LOCAL_UPLOAD_PATH || './uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB default

// Allowed MIME types for documents
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
  'image/jpg'
];

// File extension mapping
const MIME_TO_EXT = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg'
};

/**
 * Validate file before upload
 * @param {Object} file - Multer file object
 * @returns {Object} - { valid: boolean, error: string }
 */
const validateFile = (file) => {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    };
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG`
    };
  }

  return { valid: true };
};

/**
 * Generate unique filename
 * @param {String} originalName - Original filename
 * @param {String} mimeType - File MIME type
 * @returns {String} - Unique filename
 */
const generateUniqueFilename = (originalName, mimeType) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const extension = MIME_TO_EXT[mimeType] || path.extname(originalName);
  
  return `${timestamp}-${randomString}${extension}`;
};

/**
 * Ensure upload directory exists
 * @param {String} dirPath - Directory path
 */
const ensureDirectoryExists = async (dirPath) => {
  try {
    await fs.access(dirPath);
  } catch (error) {
    // Directory doesn't exist, create it
    await fs.mkdir(dirPath, { recursive: true });
  }
};

/**
 * Upload file to local storage
 * @param {Object} file - Multer file object
 * @param {String} subfolder - Subfolder path (e.g., 'consignor/documents')
 * @returns {Object} - { filePath, fileName, fileUrl }
 */
const uploadLocalFile = async (file, subfolder = 'consignor/documents') => {
  try {
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Generate unique filename
    const uniqueFilename = generateUniqueFilename(file.originalname, file.mimetype);
    
    // Create full directory path
    const uploadDir = path.join(LOCAL_UPLOAD_PATH, subfolder);
    await ensureDirectoryExists(uploadDir);
    
    // Full file path
    const filePath = path.join(uploadDir, uniqueFilename);
    
    // Write file to disk
    await fs.writeFile(filePath, file.buffer);
    
    // Return file info
    return {
      filePath: filePath.replace(/\\/g, '/'), // Normalize path for cross-platform
      fileName: uniqueFilename,
      fileUrl: `/uploads/${subfolder}/${uniqueFilename}`,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size
    };
  } catch (error) {
    console.error('Local file upload error:', error);
    throw error;
  }
};

/**
 * Upload file to AWS S3 (placeholder - requires aws-sdk)
 * @param {Object} file - Multer file object
 * @param {String} subfolder - S3 subfolder path
 * @returns {Object} - { filePath, fileName, fileUrl }
 */
const uploadS3File = async (file, subfolder = 'consignor/documents') => {
  // This is a placeholder implementation
  // To use S3, install aws-sdk: npm install @aws-sdk/client-s3
  throw new Error('S3 upload not implemented. Please set STORAGE_TYPE=local or implement S3 integration.');
  
  /*
  // Example S3 implementation:
  const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
  
  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });
  
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  const uniqueFilename = generateUniqueFilename(file.originalname, file.mimetype);
  const s3Key = `${subfolder}/${uniqueFilename}`;
  
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: s3Key,
    Body: file.buffer,
    ContentType: file.mimetype
  });
  
  await s3Client.send(command);
  
  return {
    filePath: s3Key,
    fileName: uniqueFilename,
    fileUrl: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size
  };
  */
};

/**
 * Main upload function - routes to appropriate storage
 * @param {Object} file - Multer file object
 * @param {String} subfolder - Subfolder path
 * @returns {Object} - File upload result
 */
const uploadFile = async (file, subfolder = 'consignor/documents') => {
  if (STORAGE_TYPE === 's3') {
    return await uploadS3File(file, subfolder);
  } else {
    return await uploadLocalFile(file, subfolder);
  }
};

/**
 * Upload multiple files
 * @param {Array} files - Array of Multer file objects
 * @param {String} subfolder - Subfolder path
 * @returns {Array} - Array of upload results
 */
const uploadMultipleFiles = async (files, subfolder = 'consignor/documents') => {
  if (!files || files.length === 0) {
    return [];
  }

  const uploadPromises = files.map(file => uploadFile(file, subfolder));
  return await Promise.all(uploadPromises);
};

/**
 * Delete file from local storage
 * @param {String} filePath - File path to delete
 */
const deleteLocalFile = async (filePath) => {
  try {
    const fullPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
    await fs.unlink(fullPath);
    return { success: true };
  } catch (error) {
    console.error('Error deleting local file:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete file from S3 (placeholder)
 * @param {String} s3Key - S3 key to delete
 */
const deleteS3File = async (s3Key) => {
  throw new Error('S3 delete not implemented. Please set STORAGE_TYPE=local or implement S3 integration.');
  
  /*
  // Example S3 implementation:
  const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
  
  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });
  
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: s3Key
  });
  
  await s3Client.send(command);
  return { success: true };
  */
};

/**
 * Main delete function - routes to appropriate storage
 * @param {String} filePath - File path or S3 key to delete
 */
const deleteFile = async (filePath) => {
  if (STORAGE_TYPE === 's3') {
    return await deleteS3File(filePath);
  } else {
    return await deleteLocalFile(filePath);
  }
};

/**
 * Get signed URL for file download (S3 only)
 * For local storage, returns the direct file path
 * @param {String} filePath - File path or S3 key
 * @param {Number} expiresIn - URL expiration time in seconds (default: 3600)
 */
const getFileUrl = async (filePath, expiresIn = 3600) => {
  if (STORAGE_TYPE === 's3') {
    // S3 signed URL implementation would go here
    throw new Error('S3 signed URLs not implemented. Please set STORAGE_TYPE=local.');
  } else {
    // For local storage, return direct path
    return filePath;
  }
};

module.exports = {
  uploadFile,
  uploadMultipleFiles,
  deleteFile,
  getFileUrl,
  validateFile,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE
};
