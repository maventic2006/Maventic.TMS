const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { authenticateToken } = require('../../middleware/auth'); // /* ADAPT: Use your auth middleware */
const { validate, createUserSchema, updateUserSchema, changePasswordSchema, bulkAssignRolesSchema } = require('./user.validator');

/**
 * @route POST /api/users
 * @desc Create a new user
 * @access Protected - Admin/Manager only
 */
router.post(
  '/',
  authenticateToken,
  // /* ADAPT: Add role-based authorization middleware here */
  validate(createUserSchema),
  userController.createUser
);

/**
 * @route GET /api/users
 * @desc Get paginated list of users
 * @access Protected
 */
router.get(
  '/',
  authenticateToken,
  userController.listUsers
);

/**
 * @route GET /api/users/:userId
 * @desc Get user by ID
 * @access Protected
 */
router.get(
  '/:userId',
  authenticateToken,
  userController.getUserById
);

/**
 * @route PUT /api/users/:userId
 * @desc Update user
 * @access Protected - Admin/Manager only
 */
router.put(
  '/:userId',
  authenticateToken,
  // /* ADAPT: Add role-based authorization middleware here */
  validate(updateUserSchema),
  userController.updateUser
);

/**
 * @route PATCH /api/users/:userId/deactivate
 * @desc Deactivate user (soft delete)
 * @access Protected - Admin only
 */
router.patch(
  '/:userId/deactivate',
  authenticateToken,
  // /* ADAPT: Add admin-only authorization middleware here */
  userController.deactivateUser
);

/**
 * @route POST /api/users/:userId/force-change-password
 * @desc Force password change (for first-time login or reset)
 * @access Protected - User themselves or Admin
 */
router.post(
  '/:userId/force-change-password',
  authenticateToken,
  // /* ADAPT: Verify user can only change their own password or is admin */
  validate(changePasswordSchema),
  userController.forceChangePassword
);

/**
 * @route POST /api/users/:userId/roles
 * @desc Assign role(s) to user
 * @access Protected - Admin/Manager only
 */
router.post(
  '/:userId/roles',
  authenticateToken,
  // /* ADAPT: Add role-based authorization middleware here */
  validate(bulkAssignRolesSchema),
  userController.assignRoles
);

/**
 * @route GET /api/users/:userId/roles
 * @desc Get user roles
 * @access Protected
 */
router.get(
  '/:userId/roles',
  authenticateToken,
  userController.getUserRoles
);

/**
 * @route DELETE /api/users/:userId/roles/:roleId
 * @desc Remove role mapping
 * @access Protected - Admin/Manager only
 */
router.delete(
  '/:userId/roles/:roleId',
  authenticateToken,
  // /* ADAPT: Add role-based authorization middleware here */
  userController.removeRole
);

module.exports = router;
