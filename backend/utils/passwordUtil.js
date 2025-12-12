const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

/**
 * Password validation regex
 * - Minimum 8 characters
 * - At least one digit
 * - At least one special character
 */
const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?]).{8,}$/;

/**
 * Validate password against policy
 * @param {string} password - Plain text password
 * @returns {Object} - { valid: boolean, message?: string }
 */
const validatePasswordPolicy = (password) => {
  if (!password || password.length < 8) {
    return {
      valid: false,
      message: 'Password must be at least 8 characters long'
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one digit'
    };
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one special character'
    };
  }

  return { valid: true };
};

/**
 * Hash password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
const hashPassword = async (password) => {
  const validation = validatePasswordPolicy(password);
  if (!validation.valid) {
    throw new Error(validation.message);
  }
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare plain text password with hashed password
 * @param {string} plainPassword - Plain text password
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} - True if passwords match
 */
const comparePassword = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

module.exports = {
  hashPassword,
  comparePassword,
  validatePasswordPolicy,
  PASSWORD_REGEX
};
