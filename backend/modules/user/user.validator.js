const Joi = require('joi');

/**
 * Validation schema for creating a new user
 */
const createUserSchema = Joi.object({
  userTypeId: Joi.string().max(10).required()
    .messages({
      'string.empty': 'User type is required',
      'any.required': 'User type is required'
    }),
  
  firstName: Joi.string().min(2).max(25).required()
    .messages({
      'string.empty': 'First name is required',
      'string.min': 'First name must be at least 2 characters',
      'any.required': 'First name is required'
    }),
  
  lastName: Joi.string().min(2).max(25).required()
    .messages({
      'string.empty': 'Last name is required',
      'string.min': 'Last name must be at least 2 characters',
      'any.required': 'Last name is required'
    }),
  
  email: Joi.string().email().max(30).required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email is required',
      'any.required': 'Email is required'
    }),
  
  mobileNumber: Joi.string().pattern(/^[0-9]{10}$/).required()
    .messages({
      'string.pattern.base': 'Mobile number must be exactly 10 digits',
      'string.empty': 'Mobile number is required',
      'any.required': 'Mobile number is required'
    }),
  
  alternateMobile: Joi.string().pattern(/^[0-9]{10}$/).allow(null, '')
    .messages({
      'string.pattern.base': 'Alternate mobile must be exactly 10 digits'
    }),
  
  whatsappNumber: Joi.string().pattern(/^[0-9]{10}$/).allow(null, '')
    .messages({
      'string.pattern.base': 'WhatsApp number must be exactly 10 digits'
    }),
  
  fromDate: Joi.date().required()
    .messages({
      'date.base': 'Valid from date is required',
      'any.required': 'From date is required'
    }),
  
  toDate: Joi.date().allow(null).greater(Joi.ref('fromDate'))
    .messages({
      'date.greater': 'To date must be after from date'
    }),
  
  isActive: Joi.boolean().default(true),
  
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?])/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one digit and one special character',
      'string.empty': 'Password is required',
      'any.required': 'Password is required'
    }),
  
  consignorId: Joi.string().max(10).allow(null),
  createdByUserId: Joi.string().max(10).allow(null)
});

/**
 * Validation schema for updating user
 */
const updateUserSchema = Joi.object({
  firstName: Joi.string().min(2).max(25),
  lastName: Joi.string().min(2).max(25),
  email: Joi.string().email().max(30),
  mobileNumber: Joi.string().pattern(/^[0-9]{10}$/),
  alternateMobile: Joi.string().pattern(/^[0-9]{10}$/).allow(null, ''),
  whatsappNumber: Joi.string().pattern(/^[0-9]{10}$/).allow(null, ''),
  fromDate: Joi.date(),
  toDate: Joi.date().allow(null),
  userTypeId: Joi.string().max(10),
  isActive: Joi.boolean()
}).min(1); // At least one field must be provided

/**
 * Validation schema for password change
 */
const changePasswordSchema = Joi.object({
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?])/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one digit and one special character',
      'string.empty': 'New password is required',
      'any.required': 'New password is required'
    })
});

/**
 * Validation schema for assigning roles
 */
const assignRoleSchema = Joi.object({
  roleId: Joi.string().allow(null),
  roleName: Joi.string().max(50).allow(null),
  warehouseId: Joi.string().max(10).allow(null)
    .messages({
      'string.max': 'Warehouse ID cannot exceed 10 characters'
    })
}).or('roleId', 'roleName'); // At least one of roleId or roleName must be provided

/**
 * Validation schema for bulk role assignment (array)
 */
const bulkAssignRolesSchema = Joi.alternatives().try(
  assignRoleSchema,
  Joi.array().items(assignRoleSchema)
);

/**
 * Middleware to validate request body
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true // Remove unknown fields
    });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    // Replace req.body with validated and sanitized value
    req.body = value;
    next();
  };
};

module.exports = {
  createUserSchema,
  updateUserSchema,
  changePasswordSchema,
  assignRoleSchema,
  bulkAssignRolesSchema,
  validate
};
