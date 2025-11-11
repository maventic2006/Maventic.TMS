#  Consignor Warehouse Maintenance Module - Complete Implementation Guide

> **Version:** 1.0.0  
> **Last Updated:** November 11, 2025  
> **Author:** TMS Development Team

---

##  Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Database Schema](#database-schema)
4. [Backend Implementation](#backend-implementation)
5. [Frontend Implementation](#frontend-implementation)
6. [Integration & Testing](#integration--testing)
7. [Deployment Checklist](#deployment-checklist)

---

##  Overview

The **Consignor Warehouse Maintenance Module** is a comprehensive warehouse management system that allows users with Consignor roles to:

- **List & Search** warehouses with advanced filtering
- **Create & Edit** warehouse information
- **Manage** warehouse documents and geofencing
- **Configure** warehouse facilities and capabilities
- **Track** warehouse status and approvals

### Key Features

 **Role-Based Access Control (RBAC)** - Only Consignor roles can access  
 **Advanced Filtering** - Multi-select dropdowns and checkbox filters  
 **Fuzzy Search** - Client-side search for instant results  
 **Pagination** - 25 items per page with smooth navigation  
 **Validation** - Zod schemas on both frontend and backend  
 **Document Management** - Upload and manage warehouse documents  
 **Geofencing** - Configure warehouse boundaries and sub-locations  
 **Toast Notifications** - Real-time feedback for user actions  

---

##  Technology Stack

### Frontend
- **Framework:** React 19.1.1
- **Build Tool:** Vite 7.1.7
- **Styling:** Tailwind CSS 4.1.14
- **UI Components:** ShadCN UI + Radix UI
- **State Management:** Redux Toolkit 2.9.0
- **Routing:** React Router DOM 7.9.4
- **Validation:** Zod 4.1.12
- **HTTP Client:** Axios 1.12.2
- **Icons:** Lucide React 0.545.0
- **Animations:** Framer Motion 12.23.24

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js 5.1.0
- **Database:** MySQL 8.0
- **Query Builder:** Knex.js 3.1.0
- **Authentication:** JWT 9.0.2
- **Validation:** Zod 4.1.12
- **Security:** Helmet 8.1.0, CORS 2.8.5
- **Password Hashing:** bcrypt 6.0.0

---

##  Database Schema

### Primary Tables

#### 1. **warehouse_basic_information**

\\\sql
CREATE TABLE warehouse_basic_information (
  warehouse_id VARCHAR(10) PRIMARY KEY,
  consignor_id VARCHAR(10) NOT NULL,
  warehouse_type_id VARCHAR(10),
  warehouse_name1 VARCHAR(30),
  warehouse_name2 VARCHAR(30),
  language_id VARCHAR(10),
  vehicle_capacity INT,
  virtual_yard_in BOOLEAN,
  radius_for_virtual_yard_in DECIMAL(3,2),
  speed_limit INT,
  weigh_bridge_availability BOOLEAN,
  gatepass_system_available BOOLEAN,
  fuel_availability BOOLEAN,
  staging_area_for_goods_organization BOOLEAN,
  driver_waiting_area BOOLEAN,
  gate_in_checklist_auth BOOLEAN,
  gate_out_checklist_auth BOOLEAN,
  address_id VARCHAR(40),
  created_at DATE,
  created_on TIME,
  created_by VARCHAR(10),
  updated_at DATE,
  updated_on TIME,
  updated_by VARCHAR(10),
  status VARCHAR(10),
  INDEX idx_consignor (consignor_id),
  INDEX idx_warehouse (warehouse_id)
);
\\\

#### 2. **warehouse_documents**

\\\sql
CREATE TABLE warehouse_documents (
  document_unique_id VARCHAR(10) PRIMARY KEY,
  warehouse_id VARCHAR(10),
  document_id VARCHAR(10),
  document_type_id VARCHAR(10),
  document_number VARCHAR(50),
  issue_date DATE,
  valid_to DATE,
  created_at DATE,
  created_on TIME,
  created_by VARCHAR(10),
  updated_at DATE,
  updated_on TIME,
  updated_by VARCHAR(10),
  status VARCHAR(10)
);
\\\

#### 3. **warehouse_sub_location_header**

\\\sql
CREATE TABLE warehouse_sub_location_header (
  sub_location_hdr_id VARCHAR(10) PRIMARY KEY,
  warehouse_unique_id VARCHAR(10) NOT NULL,
  consignor_id VARCHAR(10) NOT NULL,
  sub_location_id VARCHAR(10) NOT NULL,
  subtype_name VARCHAR(25),
  description VARCHAR(40),
  created_at DATE,
  created_on TIME,
  created_by VARCHAR(10),
  updated_at DATE,
  updated_on TIME,
  updated_by VARCHAR(10),
  status VARCHAR(10),
  INDEX idx_warehouse (warehouse_unique_id),
  INDEX idx_consignor (consignor_id)
);
\\\

#### 4. **warehouse_sub_location_item**

\\\sql
CREATE TABLE warehouse_sub_location_item (
  geo_fence_item_id VARCHAR(10),
  sub_location_hdr_id VARCHAR(10),
  sequence VARCHAR(10),
  latitude VARCHAR(40),
  longitude VARCHAR(40),
  created_at DATE,
  created_on TIME,
  created_by VARCHAR(10),
  updated_at DATE,
  updated_on TIME,
  updated_by VARCHAR(10),
  status VARCHAR(10)
);
\\\

#### 5. **warehouse_type_master**

\\\sql
CREATE TABLE warehouse_type_master (
  warehouse_type_id VARCHAR(10) UNIQUE NOT NULL,
  warehouse_type VARCHAR(30) NOT NULL,
  created_at DATE,
  created_on TIME,
  created_by VARCHAR(10),
  updated_at DATE,
  updated_on TIME,
  updated_by VARCHAR(10),
  status VARCHAR(10) DEFAULT 'ACTIVE'
);
\\\

### Master Data Tables (Reference)

- **tms_address** - Address information
- **document_upload** - Document file storage
- **language_master** - Language codes
- **warehouse_sub_location_master** - Sub-location types

---

##  Backend Implementation

### File Structure

\\\
tms-backend/
 controllers/
    warehouseController.js          # Main business logic
 routes/
    warehouseRoutes.js              # API route definitions
 middleware/
    auth.js                         # JWT authentication
    roleCheck.js                    # Role-based access control
 validation/
    warehouseValidation.js          # Zod validation schemas
 utils/
     errorMessages.js                # Centralized error messages
     idGenerators.js                 # ID generation utilities
\\\

### 1. **Validation Schema** (\alidation/warehouseValidation.js\)

\\\javascript
const { z } = require('zod');

// Warehouse list query validation
const warehouseListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(25),
  warehouseId: z.string().optional(),
  warehouseName: z.string().optional(),
  weighBridge: z.coerce.boolean().optional(),
  virtualYardIn: z.coerce.boolean().optional(),
  geoFencing: z.coerce.boolean().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'APPROVED', 'REJECTED']).optional(),
});

// Warehouse creation validation
const warehouseCreateSchema = z.object({
  consignorId: z.string().min(1, 'Consignor ID is required'),
  warehouseTypeId: z.string().optional(),
  warehouseName1: z.string().min(2, 'Warehouse name must be at least 2 characters').max(30),
  warehouseName2: z.string().max(30).optional(),
  languageId: z.string().optional(),
  vehicleCapacity: z.number().int().positive().optional(),
  virtualYardIn: z.boolean().default(false),
  radiusForVirtualYardIn: z.number().min(0).max(999.99).optional(),
  speedLimit: z.number().int().min(0).optional(),
  weighBridgeAvailability: z.boolean().default(false),
  gatepassSystemAvailable: z.boolean().default(false),
  fuelAvailability: z.boolean().default(false),
  stagingAreaForGoodsOrganization: z.boolean().default(false),
  driverWaitingArea: z.boolean().default(false),
  gateInChecklistAuth: z.boolean().default(false),
  gateOutChecklistAuth: z.boolean().default(false),
  addressId: z.string().optional(),
  documents: z.array(z.object({
    documentTypeId: z.string(),
    documentNumber: z.string(),
    issueDate: z.string().optional(),
    validTo: z.string().optional(),
  })).optional(),
  geoFencing: z.array(z.object({
    subLocationId: z.string(),
    subtypeName: z.string().optional(),
    description: z.string().optional(),
    coordinates: z.array(z.object({
      latitude: z.string(),
      longitude: z.string(),
      sequence: z.number().int(),
    })),
  })).optional(),
});

// Warehouse update validation
const warehouseUpdateSchema = warehouseCreateSchema.partial();

module.exports = {
  warehouseListQuerySchema,
  warehouseCreateSchema,
  warehouseUpdateSchema,
};
\\\

### 2. **Controller** (\controllers/warehouseController.js\)

\\\javascript
const knex = require('../config/database');
const { Country, State, City } = require('country-state-city');
const {
  warehouseListQuerySchema,
  warehouseCreateSchema,
  warehouseUpdateSchema,
} = require('../validation/warehouseValidation');

// Helper: Generate unique warehouse ID
const generateWarehouseId = async (trx = knex) => {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const result = await trx('warehouse_basic_information')
      .count('* as count')
      .first();
    const count = parseInt(result.count) + 1 + attempts;
    const newId = \WH\\;

    const existing = await trx('warehouse_basic_information')
      .where('warehouse_id', newId)
      .first();
    
    if (!existing) {
      return newId;
    }
    attempts++;
  }

  throw new Error('Failed to generate unique warehouse ID after 100 attempts');
};

// Helper: Generate document unique ID
const generateDocumentUniqueId = async (trx = knex) => {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const result = await trx('warehouse_documents')
      .count('* as count')
      .first();
    const count = parseInt(result.count) + 1 + attempts;
    const newId = \WDOC\\;

    const existing = await trx('warehouse_documents')
      .where('document_unique_id', newId)
      .first();
    
    if (!existing) {
      return newId;
    }
    attempts++;
  }

  throw new Error('Failed to generate unique document ID after 100 attempts');
};

// Helper: Generate sub-location header ID
const generateSubLocationHeaderId = async (trx = knex) => {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const result = await trx('warehouse_sub_location_header')
      .count('* as count')
      .first();
    const count = parseInt(result.count) + 1 + attempts;
    const newId = \WSLH\\;

    const existing = await trx('warehouse_sub_location_header')
      .where('sub_location_hdr_id', newId)
      .first();
    
    if (!existing) {
      return newId;
    }
    attempts++;
  }

  throw new Error('Failed to generate unique sub-location header ID after 100 attempts');
};

// @desc    Get warehouse list with filters and pagination
// @route   GET /api/warehouse/list
// @access  Private (Consignor only)
const getWarehouseList = async (req, res) => {
  try {
    // Validate query parameters
    const validatedQuery = warehouseListQuerySchema.parse(req.query);
    const { page, limit, warehouseId, warehouseName, weighBridge, virtualYardIn, geoFencing, status } = validatedQuery;

    // Build query
    let query = knex('warehouse_basic_information as wbi')
      .leftJoin('tms_address as addr', 'wbi.address_id', 'addr.address_id')
      .leftJoin('warehouse_type_master as wtm', 'wbi.warehouse_type_id', 'wtm.warehouse_type_id')
      .select(
        'wbi.warehouse_id',
        'wbi.consignor_id',
        'wtm.warehouse_type',
        'wbi.warehouse_name1',
        'wbi.warehouse_name2',
        'wbi.weigh_bridge_availability',
        'wbi.virtual_yard_in',
        'wbi.gatepass_system_available',
        'wbi.fuel_availability',
        'addr.city',
        'addr.state',
        'addr.country',
        'wbi.created_by',
        'wbi.created_at',
        'wbi.status'
      );

    // Apply filters
    if (warehouseId) {
      const ids = warehouseId.split(',').map(id => id.trim());
      query = query.whereIn('wbi.warehouse_id', ids);
    }

    if (warehouseName) {
      const names = warehouseName.split(',').map(name => name.trim());
      query = query.where(function() {
        names.forEach(name => {
          this.orWhere('wbi.warehouse_name1', 'like', \%\%\)
              .orWhere('wbi.warehouse_name2', 'like', \%\%\);
        });
      });
    }

    if (weighBridge !== undefined) {
      query = query.where('wbi.weigh_bridge_availability', weighBridge);
    }

    if (virtualYardIn !== undefined) {
      query = query.where('wbi.virtual_yard_in', virtualYardIn);
    }

    if (geoFencing !== undefined) {
      // Check if warehouse has geofencing records
      if (geoFencing) {
        query = query.whereExists(function() {
          this.select('*')
            .from('warehouse_sub_location_header')
            .whereRaw('warehouse_sub_location_header.warehouse_unique_id = wbi.warehouse_id');
        });
      } else {
        query = query.whereNotExists(function() {
          this.select('*')
            .from('warehouse_sub_location_header')
            .whereRaw('warehouse_sub_location_header.warehouse_unique_id = wbi.warehouse_id');
        });
      }
    }

    if (status) {
      query = query.where('wbi.status', status);
    }

    // Get total count before pagination
    const countQuery = query.clone();
    const totalResult = await countQuery.count('* as count').first();
    const total = parseInt(totalResult.count);

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.limit(limit).offset(offset);

    // Execute query
    const warehouses = await query;

    // Check if warehouse has geofencing for each record
    const warehousesWithGeoFencing = await Promise.all(
      warehouses.map(async (warehouse) => {
        const geoFencingCount = await knex('warehouse_sub_location_header')
          .where('warehouse_unique_id', warehouse.warehouse_id)
          .count('* as count')
          .first();
        
        return {
          ...warehouse,
          geo_fencing: parseInt(geoFencingCount.count) > 0,
        };
      })
    );

    // Convert ISO codes to readable names for country and state
    const enrichedWarehouses = warehousesWithGeoFencing.map(warehouse => {
      let countryName = warehouse.country;
      let stateName = warehouse.state;

      if (warehouse.country && warehouse.country.length === 2) {
        const country = Country.getCountryByCode(warehouse.country);
        countryName = country ? country.name : warehouse.country;
      }

      if (warehouse.country && warehouse.state && warehouse.state.length === 2) {
        const state = State.getStateByCodeAndCountry(warehouse.state, warehouse.country);
        stateName = state ? state.name : warehouse.state;
      }

      return {
        ...warehouse,
        country: countryName,
        state: stateName,
      };
    });

    res.status(200).json({
      success: true,
      data: enrichedWarehouses,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching warehouse list:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid query parameters',
          details: error.errors,
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch warehouse list',
      },
    });
  }
};

// @desc    Get warehouse by ID
// @route   GET /api/warehouse/:id
// @access  Private (Consignor only)
const getWarehouseById = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch warehouse basic information
    const warehouse = await knex('warehouse_basic_information as wbi')
      .leftJoin('tms_address as addr', 'wbi.address_id', 'addr.address_id')
      .leftJoin('warehouse_type_master as wtm', 'wbi.warehouse_type_id', 'wtm.warehouse_type_id')
      .where('wbi.warehouse_id', id)
      .select(
        'wbi.*',
        'wtm.warehouse_type',
        'addr.address_line1',
        'addr.address_line2',
        'addr.city',
        'addr.state',
        'addr.country',
        'addr.zip_code'
      )
      .first();

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Warehouse not found',
        },
      });
    }

    // Fetch warehouse documents
    const documents = await knex('warehouse_documents')
      .where('warehouse_id', id)
      .select('*');

    // Fetch geofencing data
    const geoFencing = await knex('warehouse_sub_location_header as wslh')
      .where('wslh.warehouse_unique_id', id)
      .select('wslh.*');

    // Fetch coordinates for each geofencing header
    const geoFencingWithCoordinates = await Promise.all(
      geoFencing.map(async (header) => {
        const coordinates = await knex('warehouse_sub_location_item')
          .where('sub_location_hdr_id', header.sub_location_hdr_id)
          .select('*')
          .orderBy('sequence', 'asc');
        
        return {
          ...header,
          coordinates,
        };
      })
    );

    // Convert ISO codes to readable names
    let countryName = warehouse.country;
    let stateName = warehouse.state;

    if (warehouse.country && warehouse.country.length === 2) {
      const country = Country.getCountryByCode(warehouse.country);
      countryName = country ? country.name : warehouse.country;
    }

    if (warehouse.country && warehouse.state && warehouse.state.length === 2) {
      const state = State.getStateByCodeAndCountry(warehouse.state, warehouse.country);
      stateName = state ? state.name : warehouse.state;
    }

    res.status(200).json({
      success: true,
      data: {
        ...warehouse,
        country: countryName,
        state: stateName,
        documents,
        geoFencing: geoFencingWithCoordinates,
      },
    });
  } catch (error) {
    console.error('Error fetching warehouse details:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch warehouse details',
      },
    });
  }
};

// @desc    Create new warehouse
// @route   POST /api/warehouse
// @access  Private (Consignor only)
const createWarehouse = async (req, res) => {
  const trx = await knex.transaction();

  try {
    // Validate request body
    const validatedData = warehouseCreateSchema.parse(req.body);

    // Generate unique warehouse ID
    const warehouseId = await generateWarehouseId(trx);

    // Insert warehouse basic information
    await trx('warehouse_basic_information').insert({
      warehouse_id: warehouseId,
      consignor_id: validatedData.consignorId,
      warehouse_type_id: validatedData.warehouseTypeId,
      warehouse_name1: validatedData.warehouseName1,
      warehouse_name2: validatedData.warehouseName2,
      language_id: validatedData.languageId,
      vehicle_capacity: validatedData.vehicleCapacity,
      virtual_yard_in: validatedData.virtualYardIn,
      radius_for_virtual_yard_in: validatedData.radiusForVirtualYardIn,
      speed_limit: validatedData.speedLimit,
      weigh_bridge_availability: validatedData.weighBridgeAvailability,
      gatepass_system_available: validatedData.gatepassSystemAvailable,
      fuel_availability: validatedData.fuelAvailability,
      staging_area_for_goods_organization: validatedData.stagingAreaForGoodsOrganization,
      driver_waiting_area: validatedData.driverWaitingArea,
      gate_in_checklist_auth: validatedData.gateInChecklistAuth,
      gate_out_checklist_auth: validatedData.gateOutChecklistAuth,
      address_id: validatedData.addressId,
      created_at: knex.fn.now(),
      created_on: knex.raw('CURRENT_TIME'),
      created_by: req.user?.id || 'SYSTEM',
      status: 'PENDING',
    });

    // Insert documents if provided
    if (validatedData.documents && validatedData.documents.length > 0) {
      for (const doc of validatedData.documents) {
        const documentUniqueId = await generateDocumentUniqueId(trx);
        await trx('warehouse_documents').insert({
          document_unique_id: documentUniqueId,
          warehouse_id: warehouseId,
          document_type_id: doc.documentTypeId,
          document_number: doc.documentNumber,
          issue_date: doc.issueDate,
          valid_to: doc.validTo,
          created_at: knex.fn.now(),
          created_on: knex.raw('CURRENT_TIME'),
          created_by: req.user?.id || 'SYSTEM',
          status: 'ACTIVE',
        });
      }
    }

    // Insert geofencing if provided
    if (validatedData.geoFencing && validatedData.geoFencing.length > 0) {
      for (const geoFence of validatedData.geoFencing) {
        const subLocationHeaderId = await generateSubLocationHeaderId(trx);
        await trx('warehouse_sub_location_header').insert({
          sub_location_hdr_id: subLocationHeaderId,
          warehouse_unique_id: warehouseId,
          consignor_id: validatedData.consignorId,
          sub_location_id: geoFence.subLocationId,
          subtype_name: geoFence.subtypeName,
          description: geoFence.description,
          created_at: knex.fn.now(),
          created_on: knex.raw('CURRENT_TIME'),
          created_by: req.user?.id || 'SYSTEM',
          status: 'ACTIVE',
        });

        // Insert coordinates
        if (geoFence.coordinates && geoFence.coordinates.length > 0) {
          for (const coord of geoFence.coordinates) {
            await trx('warehouse_sub_location_item').insert({
              geo_fence_item_id: \GFI\\,
              sub_location_hdr_id: subLocationHeaderId,
              sequence: coord.sequence.toString(),
              latitude: coord.latitude,
              longitude: coord.longitude,
              created_at: knex.fn.now(),
              created_on: knex.raw('CURRENT_TIME'),
              created_by: req.user?.id || 'SYSTEM',
              status: 'ACTIVE',
            });
          }
        }
      }
    }

    await trx.commit();

    res.status(201).json({
      success: true,
      data: {
        warehouseId,
        message: 'Warehouse created successfully',
      },
    });
  } catch (error) {
    await trx.rollback();
    console.error('Error creating warehouse:', error);

    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid warehouse data',
          details: error.errors,
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create warehouse',
      },
    });
  }
};

// @desc    Update warehouse
// @route   PUT /api/warehouse/:id
// @access  Private (Consignor only)
const updateWarehouse = async (req, res) => {
  const trx = await knex.transaction();

  try {
    const { id } = req.params;
    const validatedData = warehouseUpdateSchema.parse(req.body);

    // Check if warehouse exists
    const existingWarehouse = await trx('warehouse_basic_information')
      .where('warehouse_id', id)
      .first();

    if (!existingWarehouse) {
      await trx.rollback();
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Warehouse not found',
        },
      });
    }

    // Update warehouse basic information
    const updateData = {
      ...validatedData,
      updated_at: knex.fn.now(),
      updated_on: knex.raw('CURRENT_TIME'),
      updated_by: req.user?.id || 'SYSTEM',
    };

    // Remove documents and geoFencing from update data
    delete updateData.documents;
    delete updateData.geoFencing;

    await trx('warehouse_basic_information')
      .where('warehouse_id', id)
      .update(updateData);

    await trx.commit();

    res.status(200).json({
      success: true,
      data: {
        warehouseId: id,
        message: 'Warehouse updated successfully',
      },
    });
  } catch (error) {
    await trx.rollback();
    console.error('Error updating warehouse:', error);

    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid warehouse data',
          details: error.errors,
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update warehouse',
      },
    });
  }
};

// @desc    Get master data (warehouse types, etc.)
// @route   GET /api/warehouse/master-data
// @access  Private (Consignor only)
const getMasterData = async (req, res) => {
  try {
    const [warehouseTypes, subLocationTypes] = await Promise.all([
      knex('warehouse_type_master')
        .where('status', 'ACTIVE')
        .select('warehouse_type_id as value', 'warehouse_type as label'),
      knex('warehouse_sub_location_master')
        .where('status', 'ACTIVE')
        .select('sub_location_id as value', 'warehouse_sub_location_description as label'),
    ]);

    res.status(200).json({
      success: true,
      data: {
        warehouseTypes,
        subLocationTypes,
      },
    });
  } catch (error) {
    console.error('Error fetching master data:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch master data',
      },
    });
  }
};

module.exports = {
  getWarehouseList,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  getMasterData,
};
\\\


### 3. **Routes** (\outes/warehouseRoutes.js\)

\\\javascript
const express = require('express');
const router = express.Router();
const {
  getWarehouseList,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  getMasterData,
} = require('../controllers/warehouseController');
const { authenticateToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

// All routes require authentication and Consignor role
router.use(authenticateToken);
router.use(checkRole(['CONSIGNOR', 'ADMIN']));

// Routes
router.get('/list', getWarehouseList);
router.get('/master-data', getMasterData);
router.get('/:id', getWarehouseById);
router.post('/', createWarehouse);
router.put('/:id', updateWarehouse);

module.exports = router;
\\\

### 4. **Middleware** (\middleware/roleCheck.js\)

\\\javascript
/**
 * Role-based access control middleware
 * @param {string[]} allowedRoles - Array of roles allowed to access the route
 */
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied - no role assigned',
        },
      });
    }

    const userRole = req.user.role.toUpperCase();
    const hasAccess = allowedRoles.some(
      (role) => role.toUpperCase() === userRole
    );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: \Access denied - requires one of: \\,
        },
      });
    }

    next();
  };
};

module.exports = { checkRole };
\\\

### 5. **Server Integration** (\server.js\)

\\\javascript
// Add to existing server.js

const warehouseRoutes = require('./routes/warehouseRoutes');

// Register warehouse routes
app.use('/api/warehouse', warehouseRoutes);
\\\

---

##  Frontend Implementation

### File Structure

\\\
frontend/src/
 components/
    warehouse/
        TopActionBar.jsx              # Header with search and actions
        WarehouseFilterPanel.jsx      # Filter controls
        WarehouseListTable.jsx        # Main data table
        PaginationBar.jsx             # Pagination controls
        StatusPill.jsx                # Status indicator
 features/
    warehouse/
        components/
           BasicInfoTab.jsx          # Edit mode - basic info
           BasicInfoViewTab.jsx      # View mode - basic info
           DocumentsTab.jsx          # Edit mode - documents
           DocumentsViewTab.jsx      # View mode - documents
           GeoFencingTab.jsx         # Edit mode - geofencing
           GeoFencingViewTab.jsx     # View mode - geofencing
        pages/
           WarehouseCreatePage.jsx   # Create warehouse
           WarehouseDetailsPage.jsx  # View/edit warehouse
        validation.js                 # Zod validation schemas
 pages/
    WarehouseMaintenance.jsx          # Main list page
 redux/
    slices/
        warehouseSlice.js             # Redux state management
 routes/
     AppRoutes.jsx                     # Route definitions
\\\

### 1. **Redux Slice** (\edux/slices/warehouseSlice.js\)

\\\javascript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { API_ENDPOINTS } from '../../utils/constants';

// Async thunks
export const fetchWarehouses = createAsyncThunk(
  'warehouse/fetchWarehouses',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get(API_ENDPOINTS.WAREHOUSE.LIST, { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          code: 'NETWORK_ERROR',
          message: 'Failed to fetch warehouses',
        }
      );
    }
  }
);

export const fetchWarehouseById = createAsyncThunk(
  'warehouse/fetchWarehouseById',
  async (warehouseId, { rejectWithValue }) => {
    try {
      const response = await api.get(\\/\\);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          code: 'NETWORK_ERROR',
          message: 'Failed to fetch warehouse details',
        }
      );
    }
  }
);

export const createWarehouse = createAsyncThunk(
  'warehouse/createWarehouse',
  async (warehouseData, { rejectWithValue }) => {
    try {
      const response = await api.post(
        API_ENDPOINTS.WAREHOUSE.CREATE,
        warehouseData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          code: 'NETWORK_ERROR',
          message: 'Failed to create warehouse',
        }
      );
    }
  }
);

export const updateWarehouse = createAsyncThunk(
  'warehouse/updateWarehouse',
  async ({ warehouseId, warehouseData }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        \\/\\,
        warehouseData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          code: 'NETWORK_ERROR',
          message: 'Failed to update warehouse',
        }
      );
    }
  }
);

export const fetchMasterData = createAsyncThunk(
  'warehouse/fetchMasterData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(API_ENDPOINTS.WAREHOUSE.MASTER_DATA);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          code: 'NETWORK_ERROR',
          message: 'Failed to fetch master data',
        }
      );
    }
  }
);

// Initial state
const initialState = {
  warehouses: [],
  currentWarehouse: null,
  masterData: {
    warehouseTypes: [],
    subLocationTypes: [],
  },
  pagination: {
    page: 1,
    limit: 25,
    total: 0,
    pages: 0,
  },
  isFetching: false,
  isCreating: false,
  isUpdating: false,
  error: null,
  validationErrors: {},
};

// Warehouse slice
const warehouseSlice = createSlice({
  name: 'warehouse',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.validationErrors = {};
    },
    clearCurrentWarehouse: (state) => {
      state.currentWarehouse = null;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch warehouses
      .addCase(fetchWarehouses.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(fetchWarehouses.fulfilled, (state, action) => {
        state.isFetching = false;
        state.warehouses = action.payload.data;
        state.pagination = action.payload.meta;
      })
      .addCase(fetchWarehouses.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload;
      })
      
      // Fetch warehouse by ID
      .addCase(fetchWarehouseById.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(fetchWarehouseById.fulfilled, (state, action) => {
        state.isFetching = false;
        state.currentWarehouse = action.payload.data;
      })
      .addCase(fetchWarehouseById.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload;
      })
      
      // Create warehouse
      .addCase(createWarehouse.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(createWarehouse.fulfilled, (state) => {
        state.isCreating = false;
      })
      .addCase(createWarehouse.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
        if (action.payload?.details) {
          state.validationErrors = action.payload.details;
        }
      })
      
      // Update warehouse
      .addCase(updateWarehouse.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(updateWarehouse.fulfilled, (state) => {
        state.isUpdating = false;
      })
      .addCase(updateWarehouse.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
        if (action.payload?.details) {
          state.validationErrors = action.payload.details;
        }
      })
      
      // Fetch master data
      .addCase(fetchMasterData.fulfilled, (state, action) => {
        state.masterData = action.payload.data;
      });
  },
});

export const { clearError, clearCurrentWarehouse, setPage } = warehouseSlice.actions;
export default warehouseSlice.reducer;
\\\

### 2. **API Constants** (\utils/constants.js\)

\\\javascript
// Add to existing constants.js

export const API_ENDPOINTS = {
  // ... existing endpoints
  WAREHOUSE: {
    LIST: '/api/warehouse/list',
    GET: '/api/warehouse',
    CREATE: '/api/warehouse',
    UPDATE: '/api/warehouse',
    MASTER_DATA: '/api/warehouse/master-data',
  },
};
\\\

### 3. **Main List Page** (\pages/WarehouseMaintenance.jsx\)

\\\javascript
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import TMSHeader from '../components/layout/TMSHeader';
import { getPageTheme } from '../theme.config';
import TopActionBar from '../components/warehouse/TopActionBar';
import WarehouseFilterPanel from '../components/warehouse/WarehouseFilterPanel';
import WarehouseListTable from '../components/warehouse/WarehouseListTable';
import PaginationBar from '../components/warehouse/PaginationBar';
import { fetchWarehouses } from '../redux/slices/warehouseSlice';

// Fuzzy search utility function
const fuzzySearch = (searchText, warehouses) => {
  if (!searchText || searchText.trim() === '') {
    return warehouses;
  }

  const searchLower = searchText.toLowerCase().trim();

  return warehouses.filter((warehouse) => {
    const searchableFields = [
      warehouse.warehouse_id,
      warehouse.warehouse_name1,
      warehouse.warehouse_name2,
      warehouse.warehouse_type,
      warehouse.city,
      warehouse.state,
      warehouse.country,
      warehouse.consignor_id,
      warehouse.status,
      warehouse.created_by,
    ];

    return searchableFields.some((field) => {
      if (field === null || field === undefined) return false;
      return String(field).toLowerCase().includes(searchLower);
    });
  });
};

// Main Warehouse Maintenance Component
const WarehouseMaintenance = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = getPageTheme('list');

  // Redux state
  const { warehouses, pagination, isFetching, error } = useSelector(
    (state) => state.warehouse
  );

  // Local state
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Separate state for filter inputs and applied filters
  const [filters, setFilters] = useState({
    warehouseId: '',
    warehouseName: '',
    weighBridge: false,
    virtualYardIn: false,
    geoFencing: false,
    status: '',
  });

  const [appliedFilters, setAppliedFilters] = useState({
    warehouseId: '',
    warehouseName: '',
    weighBridge: false,
    virtualYardIn: false,
    geoFencing: false,
    status: '',
  });

  // Fetch warehouses when component mounts or when appliedFilters change
  useEffect(() => {
    const fetchData = () => {
      const params = {
        page: pagination.page,
        limit: pagination.limit || 25,
      };

      // Only add applied filter parameters
      if (appliedFilters.warehouseId) {
        params.warehouseId = appliedFilters.warehouseId;
      }
      if (appliedFilters.warehouseName) {
        params.warehouseName = appliedFilters.warehouseName;
      }
      if (appliedFilters.weighBridge) {
        params.weighBridge = appliedFilters.weighBridge;
      }
      if (appliedFilters.virtualYardIn) {
        params.virtualYardIn = appliedFilters.virtualYardIn;
      }
      if (appliedFilters.geoFencing) {
        params.geoFencing = appliedFilters.geoFencing;
      }
      if (appliedFilters.status) {
        params.status = appliedFilters.status;
      }

      dispatch(fetchWarehouses(params));
    };

    fetchData();
  }, [dispatch, appliedFilters, pagination.page]);

  // Initial load
  useEffect(() => {
    dispatch(fetchWarehouses({ page: 1, limit: 25 }));
  }, [dispatch]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const handleApplyFilters = useCallback(() => {
    setAppliedFilters({ ...filters });
  }, [filters]);

  const handleClearFilters = useCallback(() => {
    const emptyFilters = {
      warehouseId: '',
      warehouseName: '',
      weighBridge: false,
      virtualYardIn: false,
      geoFencing: false,
      status: '',
    };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
  }, []);

  const handleSearchChange = useCallback((text) => {
    setSearchText(text);
  }, []);

  // Apply client-side fuzzy search filtering
  const filteredWarehouses = useMemo(() => {
    return fuzzySearch(searchText, warehouses);
  }, [searchText, warehouses]);

  const handleWarehouseClick = useCallback(
    (warehouseId) => {
      navigate(\/warehouse/\\);
    },
    [navigate]
  );

  const handleCreateNew = useCallback(() => {
    navigate('/warehouse/create');
  }, [navigate]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    navigate('/login');
  }, [navigate]);

  const handleBack = useCallback(() => {
    navigate('/tms-portal');
  }, [navigate]);

  const handlePageChange = useCallback(
    (page) => {
      const params = {
        page,
        limit: pagination.limit || 25,
      };

      if (appliedFilters.warehouseId) {
        params.warehouseId = appliedFilters.warehouseId;
      }
      if (appliedFilters.warehouseName) {
        params.warehouseName = appliedFilters.warehouseName;
      }
      if (appliedFilters.weighBridge) {
        params.weighBridge = appliedFilters.weighBridge;
      }
      if (appliedFilters.virtualYardIn) {
        params.virtualYardIn = appliedFilters.virtualYardIn;
      }
      if (appliedFilters.geoFencing) {
        params.geoFencing = appliedFilters.geoFencing;
      }
      if (appliedFilters.status) {
        params.status = appliedFilters.status;
      }

      dispatch(fetchWarehouses(params));
    },
    [dispatch, pagination.limit, appliedFilters]
  );

  const handleToggleFilters = useCallback(() => {
    setShowFilters(!showFilters);
  }, [showFilters]);

  return (
    <div className=\"min-h-screen bg-[#F5F7FA]\">
      <TMSHeader theme={theme} />
      <div className=\"px-4 py-1 lg:px-6 lg:py-1\">
        <div className=\"max-w-7xl mx-auto space-y-0\">
          <TopActionBar
            onCreateNew={handleCreateNew}
            onLogout={handleLogout}
            onBack={handleBack}
            totalCount={pagination.total || 0}
            showFilters={showFilters}
            onToggleFilters={handleToggleFilters}
            searchText={searchText}
            onSearchChange={handleSearchChange}
          />

          <WarehouseFilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
            showFilters={showFilters}
          />

          <WarehouseListTable
            warehouses={filteredWarehouses}
            loading={isFetching}
            onWarehouseClick={handleWarehouseClick}
            currentPage={pagination.page}
            totalPages={pagination.pages}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
            onPageChange={handlePageChange}
            filteredCount={filteredWarehouses.length}
            searchText={searchText}
            onSearchChange={handleSearchChange}
          />

          {error && (
            <div
              className=\"bg-[#FEE2E2] border border-[#EF4444] rounded-xl p-6 text-[#EF4444]\"
              style={{ boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.05)' }}
            >
              <p className=\"font-semibold text-sm\">Error loading warehouses:</p>
              <p className=\"text-sm mt-1\">
                {error.message || 'Something went wrong'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WarehouseMaintenance;
\\\


### 4. **Filter Panel Component** (\components/warehouse/WarehouseFilterPanel.jsx\)

\\\javascript
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPageTheme } from '../../theme.config';
import { Filter, X, Check } from 'lucide-react';

const WarehouseFilterPanel = ({
  filters,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
  showFilters,
}) => {
  const theme = getPageTheme('list');

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
  ];

  return (
    <AnimatePresence>
      {showFilters && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className=\"overflow-hidden\"
        >
          <div
            className=\"rounded-xl p-6 mb-4\"
            style={{
              backgroundColor: theme.colors.card.background,
              border: \1px solid \\,
              boxShadow: theme.colors.card.shadow,
            }}
          >
            <div className=\"flex items-center justify-between mb-4\">
              <div className=\"flex items-center gap-2\">
                <Filter
                  size={20}
                  style={{ color: theme.colors.text.primary }}
                />
                <h3
                  className=\"font-semibold text-base\"
                  style={{ color: theme.colors.text.primary }}
                >
                  Filter Warehouses
                </h3>
              </div>
              <button
                onClick={onClearFilters}
                className=\"flex items-center gap-2 px-4 py-2 rounded-lg transition-all\"
                style={{
                  backgroundColor: 'transparent',
                  border: \1px solid \\,
                  color: theme.colors.button.secondary.text,
                }}
              >
                <X size={16} />
                Clear All
              </button>
            </div>

            <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4\">
              {/* Warehouse ID */}
              <div>
                <label
                  className=\"block text-sm font-medium mb-2\"
                  style={{ color: theme.colors.text.secondary }}
                >
                  Warehouse ID
                </label>
                <input
                  type=\"text\"
                  value={filters.warehouseId}
                  onChange={(e) => onFilterChange('warehouseId', e.target.value)}
                  placeholder=\"Enter Warehouse ID\"
                  className=\"w-full px-4 py-2 rounded-lg border outline-none transition-all\"
                  style={{
                    backgroundColor: theme.colors.input.background,
                    border: \1px solid \\,
                    color: theme.colors.text.primary,
                  }}
                />
              </div>

              {/* Warehouse Name */}
              <div>
                <label
                  className=\"block text-sm font-medium mb-2\"
                  style={{ color: theme.colors.text.secondary }}
                >
                  Warehouse Name
                </label>
                <input
                  type=\"text\"
                  value={filters.warehouseName}
                  onChange={(e) => onFilterChange('warehouseName', e.target.value)}
                  placeholder=\"Enter Warehouse Name\"
                  className=\"w-full px-4 py-2 rounded-lg border outline-none transition-all\"
                  style={{
                    backgroundColor: theme.colors.input.background,
                    border: \1px solid \\,
                    color: theme.colors.text.primary,
                  }}
                />
              </div>

              {/* Status */}
              <div>
                <label
                  className=\"block text-sm font-medium mb-2\"
                  style={{ color: theme.colors.text.secondary }}
                >
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => onFilterChange('status', e.target.value)}
                  className=\"w-full px-4 py-2 rounded-lg border outline-none transition-all\"
                  style={{
                    backgroundColor: theme.colors.input.background,
                    border: \1px solid \\,
                    color: theme.colors.text.primary,
                  }}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Checkboxes */}
            <div className=\"grid grid-cols-1 md:grid-cols-3 gap-4 mb-4\">
              <label className=\"flex items-center gap-2 cursor-pointer\">
                <input
                  type=\"checkbox\"
                  checked={filters.weighBridge}
                  onChange={(e) => onFilterChange('weighBridge', e.target.checked)}
                  className=\"w-4 h-4 rounded\"
                />
                <span
                  className=\"text-sm font-medium\"
                  style={{ color: theme.colors.text.primary }}
                >
                  WeighBridge Available
                </span>
              </label>

              <label className=\"flex items-center gap-2 cursor-pointer\">
                <input
                  type=\"checkbox\"
                  checked={filters.virtualYardIn}
                  onChange={(e) => onFilterChange('virtualYardIn', e.target.checked)}
                  className=\"w-4 h-4 rounded\"
                />
                <span
                  className=\"text-sm font-medium\"
                  style={{ color: theme.colors.text.primary }}
                >
                  Virtual Yard In
                </span>
              </label>

              <label className=\"flex items-center gap-2 cursor-pointer\">
                <input
                  type=\"checkbox\"
                  checked={filters.geoFencing}
                  onChange={(e) => onFilterChange('geoFencing', e.target.checked)}
                  className=\"w-4 h-4 rounded\"
                />
                <span
                  className=\"text-sm font-medium\"
                  style={{ color: theme.colors.text.primary }}
                >
                  Geo Fencing Enabled
                </span>
              </label>
            </div>

            {/* Apply Button */}
            <div className=\"flex justify-end\">
              <button
                onClick={onApplyFilters}
                className=\"flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all\"
                style={{
                  backgroundColor: theme.colors.button.primary.background,
                  color: theme.colors.button.primary.text,
                }}
              >
                <Check size={16} />
                Apply Filters
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WarehouseFilterPanel;
\\\

### 5. **List Table Component** (\components/warehouse/WarehouseListTable.jsx\)

\\\javascript
import React from 'react';
import { getPageTheme } from '../../theme.config';
import { CheckCircle2, XCircle, Warehouse, MapPin, TrendingUp } from 'lucide-react';
import StatusPill from './StatusPill';

const WarehouseListTable = ({
  warehouses,
  loading,
  onWarehouseClick,
  filteredCount,
}) => {
  const theme = getPageTheme('list');

  if (loading) {
    return (
      <div
        className=\"rounded-xl p-12 text-center\"
        style={{
          backgroundColor: theme.colors.card.background,
          border: \1px solid \\,
          boxShadow: theme.colors.card.shadow,
        }}
      >
        <div className=\"flex flex-col items-center gap-4\">
          <div className=\"animate-spin rounded-full h-12 w-12 border-b-2\"
            style={{ borderColor: theme.colors.button.primary.background }}
          ></div>
          <p style={{ color: theme.colors.text.secondary }}>
            Loading warehouses...
          </p>
        </div>
      </div>
    );
  }

  if (warehouses.length === 0) {
    return (
      <div
        className=\"rounded-xl p-12 text-center\"
        style={{
          backgroundColor: theme.colors.card.background,
          border: \1px solid \\,
          boxShadow: theme.colors.card.shadow,
        }}
      >
        <Warehouse
          size={48}
          style={{ color: theme.colors.text.disabled }}
          className=\"mx-auto mb-4\"
        />
        <p
          className=\"text-lg font-medium\"
          style={{ color: theme.colors.text.primary }}
        >
          No warehouses found
        </p>
        <p
          className=\"text-sm mt-2\"
          style={{ color: theme.colors.text.secondary }}
        >
          Try adjusting your filters or search criteria
        </p>
      </div>
    );
  }

  return (
    <div
      className=\"rounded-xl overflow-hidden\"
      style={{
        backgroundColor: theme.colors.card.background,
        border: \1px solid \\,
        boxShadow: theme.colors.card.shadow,
      }}
    >
      {/* Results count */}
      <div className=\"px-6 py-3 border-b\"
        style={{ borderColor: theme.colors.card.border }}
      >
        <p
          className=\"text-sm font-medium\"
          style={{ color: theme.colors.text.secondary }}
        >
          Showing {filteredCount} warehouse{filteredCount !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Table */}
      <div className=\"overflow-x-auto\">
        <table className=\"w-full\">
          <thead>
            <tr style={{ backgroundColor: '#F9FAFB' }}>
              <th className=\"px-6 py-3 text-left text-xs font-bold uppercase tracking-wider\"
                style={{ color: theme.colors.text.primary }}
              >
                Warehouse ID
              </th>
              <th className=\"px-6 py-3 text-left text-xs font-bold uppercase tracking-wider\"
                style={{ color: theme.colors.text.primary }}
              >
                Warehouse Name
              </th>
              <th className=\"px-6 py-3 text-left text-xs font-bold uppercase tracking-wider\"
                style={{ color: theme.colors.text.primary }}
              >
                Type
              </th>
              <th className=\"px-6 py-3 text-left text-xs font-bold uppercase tracking-wider\"
                style={{ color: theme.colors.text.primary }}
              >
                Location
              </th>
              <th className=\"px-6 py-3 text-center text-xs font-bold uppercase tracking-wider\"
                style={{ color: theme.colors.text.primary }}
              >
                WeighBridge
              </th>
              <th className=\"px-6 py-3 text-center text-xs font-bold uppercase tracking-wider\"
                style={{ color: theme.colors.text.primary }}
              >
                Virtual Yard
              </th>
              <th className=\"px-6 py-3 text-center text-xs font-bold uppercase tracking-wider\"
                style={{ color: theme.colors.text.primary }}
              >
                Geo Fencing
              </th>
              <th className=\"px-6 py-3 text-left text-xs font-bold uppercase tracking-wider\"
                style={{ color: theme.colors.text.primary }}
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {warehouses.map((warehouse, index) => (
              <tr
                key={warehouse.warehouse_id}
                className=\"border-b transition-colors\"
                style={{
                  borderColor: theme.colors.card.border,
                  backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F9FAFB',
                }}
              >
                <td className=\"px-6 py-4\">
                  <button
                    onClick={() => onWarehouseClick(warehouse.warehouse_id)}
                    className=\"font-medium hover:underline\"
                    style={{ color: theme.colors.button.primary.background }}
                  >
                    {warehouse.warehouse_id}
                  </button>
                </td>
                <td className=\"px-6 py-4\">
                  <p
                    className=\"font-medium\"
                    style={{ color: theme.colors.text.primary }}
                  >
                    {warehouse.warehouse_name1}
                  </p>
                  {warehouse.warehouse_name2 && (
                    <p
                      className=\"text-sm\"
                      style={{ color: theme.colors.text.secondary }}
                    >
                      {warehouse.warehouse_name2}
                    </p>
                  )}
                </td>
                <td className=\"px-6 py-4\">
                  <p
                    className=\"text-sm\"
                    style={{ color: theme.colors.text.secondary }}
                  >
                    {warehouse.warehouse_type || 'N/A'}
                  </p>
                </td>
                <td className=\"px-6 py-4\">
                  <div className=\"flex items-start gap-2\">
                    <MapPin
                      size={16}
                      style={{ color: theme.colors.text.secondary }}
                      className=\"mt-1\"
                    />
                    <div>
                      <p
                        className=\"text-sm\"
                        style={{ color: theme.colors.text.primary }}
                      >
                        {warehouse.city || 'N/A'}
                      </p>
                      <p
                        className=\"text-xs\"
                        style={{ color: theme.colors.text.secondary }}
                      >
                        {warehouse.state}, {warehouse.country}
                      </p>
                    </div>
                  </div>
                </td>
                <td className=\"px-6 py-4 text-center\">
                  {warehouse.weigh_bridge_availability ? (
                    <CheckCircle2
                      size={20}
                      style={{ color: theme.colors.status.success.text }}
                      className=\"mx-auto\"
                    />
                  ) : (
                    <XCircle
                      size={20}
                      style={{ color: theme.colors.text.disabled }}
                      className=\"mx-auto\"
                    />
                  )}
                </td>
                <td className=\"px-6 py-4 text-center\">
                  {warehouse.virtual_yard_in ? (
                    <CheckCircle2
                      size={20}
                      style={{ color: theme.colors.status.success.text }}
                      className=\"mx-auto\"
                    />
                  ) : (
                    <XCircle
                      size={20}
                      style={{ color: theme.colors.text.disabled }}
                      className=\"mx-auto\"
                    />
                  )}
                </td>
                <td className=\"px-6 py-4 text-center\">
                  {warehouse.geo_fencing ? (
                    <CheckCircle2
                      size={20}
                      style={{ color: theme.colors.status.success.text }}
                      className=\"mx-auto\"
                    />
                  ) : (
                    <XCircle
                      size={20}
                      style={{ color: theme.colors.text.disabled }}
                      className=\"mx-auto\"
                    />
                  )}
                </td>
                <td className=\"px-6 py-4\">
                  <StatusPill status={warehouse.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WarehouseListTable;
\\\

### 6. **Top Action Bar Component** (\components/warehouse/TopActionBar.jsx\)

\\\javascript
import React from 'react';
import { motion } from 'framer-motion';
import { getPageTheme } from '../../theme.config';
import {
  Plus,
  LogOut,
  ArrowLeft,
  Filter,
  Search,
  Warehouse,
} from 'lucide-react';

const TopActionBar = ({
  onCreateNew,
  onLogout,
  onBack,
  totalCount,
  showFilters,
  onToggleFilters,
  searchText,
  onSearchChange,
}) => {
  const theme = getPageTheme('list');

  return (
    <div
      className=\"rounded-xl p-6 mb-4\"
      style={{
        backgroundColor: theme.colors.card.background,
        border: \1px solid \\,
        boxShadow: theme.colors.card.shadow,
      }}
    >
      {/* Top Row - Title and Actions */}
      <div className=\"flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4\">
        <div className=\"flex items-center gap-3\">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className=\"p-3 rounded-lg\"
            style={{
              background: \linear-gradient(135deg, \, #059669)\,
            }}
          >
            <Warehouse size={24} className=\"text-white\" />
          </motion.div>
          <div>
            <h1
              className=\"text-2xl font-bold\"
              style={{ color: theme.colors.text.primary }}
            >
              Warehouse Maintenance
            </h1>
            <p
              className=\"text-sm\"
              style={{ color: theme.colors.text.secondary }}
            >
              Manage warehouse information, documents, and geofencing
            </p>
          </div>
        </div>

        <div className=\"flex items-center gap-2\">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className=\"flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all\"
            style={{
              backgroundColor: 'transparent',
              border: \1px solid \\,
              color: theme.colors.button.secondary.text,
            }}
          >
            <ArrowLeft size={16} />
            Back
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCreateNew}
            className=\"flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all\"
            style={{
              backgroundColor: theme.colors.button.primary.background,
              color: theme.colors.button.primary.text,
            }}
          >
            <Plus size={16} />
            Create Warehouse
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLogout}
            className=\"flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all\"
            style={{
              backgroundColor: 'transparent',
              border: \1px solid \\,
              color: theme.colors.button.danger.text,
            }}
          >
            <LogOut size={16} />
            Logout
          </motion.button>
        </div>
      </div>

      {/* Bottom Row - Search and Filter */}
      <div className=\"flex flex-col sm:flex-row gap-3\">
        {/* Search Bar */}
        <div className=\"flex-1 relative\">
          <Search
            size={20}
            className=\"absolute left-3 top-1/2 transform -translate-y-1/2\"
            style={{ color: theme.colors.text.disabled }}
          />
          <input
            type=\"text\"
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder=\"Search by ID, name, location, or status...\"
            className=\"w-full pl-10 pr-4 py-2 rounded-lg border outline-none transition-all\"
            style={{
              backgroundColor: theme.colors.input.background,
              border: \1px solid \\,
              color: theme.colors.text.primary,
            }}
          />
        </div>

        {/* Filter Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleFilters}
          className={\lex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all \\}
          style={{
            backgroundColor: showFilters
              ? theme.colors.button.primary.background
              : 'transparent',
            border: \1px solid \\,
            color: showFilters
              ? theme.colors.button.primary.text
              : theme.colors.button.secondary.text,
            ringColor: showFilters
              ? theme.colors.button.primary.background
              : 'transparent',
          }}
        >
          <Filter size={16} />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </motion.button>

        {/* Total Count Badge */}
        <div
          className=\"flex items-center gap-2 px-4 py-2 rounded-lg\"
          style={{
            backgroundColor: theme.colors.status.info.background,
            border: \1px solid \\,
          }}
        >
          <span
            className=\"font-semibold\"
            style={{ color: theme.colors.status.info.text }}
          >
            Total: {totalCount}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TopActionBar;
\\\


### 7. **Pagination Component** (\components/warehouse/PaginationBar.jsx\)

\\\javascript
import React from 'react';
import { motion } from 'framer-motion';
import { getPageTheme } from '../../theme.config';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const PaginationBar = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const theme = getPageTheme('list');

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
    }
  };

  return (
    <div
      className=\"rounded-xl p-4 mt-4\"
      style={{
        backgroundColor: theme.colors.card.background,
        border: \1px solid \\,
        boxShadow: theme.colors.card.shadow,
      }}
    >
      <div className=\"flex items-center justify-between\">
        <p
          className=\"text-sm font-medium\"
          style={{ color: theme.colors.text.secondary }}
        >
          Page {currentPage} of {totalPages}
        </p>

        <div className=\"flex items-center gap-2\">
          {/* First Page */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className=\"p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed\"
            style={{
              backgroundColor: 'transparent',
              border: \1px solid \\,
              color: theme.colors.button.secondary.text,
            }}
          >
            <ChevronsLeft size={16} />
          </motion.button>

          {/* Previous Page */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className=\"p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed\"
            style={{
              backgroundColor: 'transparent',
              border: \1px solid \\,
              color: theme.colors.button.secondary.text,
            }}
          >
            <ChevronLeft size={16} />
          </motion.button>

          {/* Page Numbers */}
          {[...Array(Math.min(5, totalPages))].map((_, index) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = index + 1;
            } else if (currentPage <= 3) {
              pageNum = index + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + index;
            } else {
              pageNum = currentPage - 2 + index;
            }

            return (
              <motion.button
                key={pageNum}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePageChange(pageNum)}
                className=\"px-4 py-2 rounded-lg font-medium transition-all min-w-[40px]\"
                style={{
                  backgroundColor:
                    currentPage === pageNum
                      ? theme.colors.button.primary.background
                      : 'transparent',
                  border: \1px solid \\,
                  color:
                    currentPage === pageNum
                      ? theme.colors.button.primary.text
                      : theme.colors.button.secondary.text,
                }}
              >
                {pageNum}
              </motion.button>
            );
          })}

          {/* Next Page */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className=\"p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed\"
            style={{
              backgroundColor: 'transparent',
              border: \1px solid \\,
              color: theme.colors.button.secondary.text,
            }}
          >
            <ChevronRight size={16} />
          </motion.button>

          {/* Last Page */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className=\"p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed\"
            style={{
              backgroundColor: 'transparent',
              border: \1px solid \\,
              color: theme.colors.button.secondary.text,
            }}
          >
            <ChevronsRight size={16} />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default PaginationBar;
\\\

### 8. **Status Pill Component** (\components/warehouse/StatusPill.jsx\)

\\\javascript
import React from 'react';
import { getPageTheme } from '../../theme.config';

const StatusPill = ({ status }) => {
  const theme = getPageTheme('list');

  const getStatusStyle = () => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
      case 'APPROVED':
        return {
          backgroundColor: theme.colors.status.success.background,
          color: theme.colors.status.success.text,
          border: \1px solid \\,
        };
      case 'PENDING':
        return {
          backgroundColor: theme.colors.status.pending.background,
          color: theme.colors.status.pending.text,
          border: \1px solid \\,
        };
      case 'REJECTED':
      case 'INACTIVE':
        return {
          backgroundColor: theme.colors.status.error.background,
          color: theme.colors.status.error.text,
          border: \1px solid \\,
        };
      default:
        return {
          backgroundColor: theme.colors.status.info.background,
          color: theme.colors.status.info.text,
          border: \1px solid \\,
        };
    }
  };

  return (
    <span
      className=\"inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide\"
      style={getStatusStyle()}
    >
      {status || 'N/A'}
    </span>
  );
};

export default StatusPill;
\\\

### 9. **Routes Configuration** (\outes/AppRoutes.jsx\)

\\\javascript
// Add to existing AppRoutes.jsx

import WarehouseMaintenance from '../pages/WarehouseMaintenance';
import WarehouseCreatePage from '../features/warehouse/pages/WarehouseCreatePage';
import WarehouseDetailsPage from '../features/warehouse/pages/WarehouseDetailsPage';

// Add routes
<Route
  path=\"/warehouse\"
  element={
    <ProtectedRoute roles={['CONSIGNOR', 'ADMIN']}>
      <WarehouseMaintenance />
    </ProtectedRoute>
  }
/>
<Route
  path=\"/warehouse/create\"
  element={
    <ProtectedRoute roles={['CONSIGNOR', 'ADMIN']}>
      <WarehouseCreatePage />
    </ProtectedRoute>
  }
/>
<Route
  path=\"/warehouse/:id\"
  element={
    <ProtectedRoute roles={['CONSIGNOR', 'ADMIN']}>
      <WarehouseDetailsPage />
    </ProtectedRoute>
  }
/>
\\\

### 10. **Redux Store Configuration** (\edux/store.js\)

\\\javascript
// Add to existing store.js

import warehouseReducer from './slices/warehouseSlice';

export const store = configureStore({
  reducer: {
    // ... existing reducers
    warehouse: warehouseReducer,
  },
});
\\\

---

##  Integration & Testing

### Backend Testing

#### 1. **Test Warehouse List API**

\\\ash
# Get all warehouses (page 1, limit 25)
curl -X GET \"http://localhost:5000/api/warehouse/list?page=1&limit=25\" \\
  -H \"Authorization: Bearer YOUR_JWT_TOKEN\"

# Filter by warehouse ID
curl -X GET \"http://localhost:5000/api/warehouse/list?warehouseId=WH0001\" \\
  -H \"Authorization: Bearer YOUR_JWT_TOKEN\"

# Filter by status
curl -X GET \"http://localhost:5000/api/warehouse/list?status=ACTIVE\" \\
  -H \"Authorization: Bearer YOUR_JWT_TOKEN\"

# Filter by facilities
curl -X GET \"http://localhost:5000/api/warehouse/list?weighBridge=true&virtualYardIn=true\" \\
  -H \"Authorization: Bearer YOUR_JWT_TOKEN\"
\\\

#### 2. **Test Warehouse Creation API**

\\\ash
curl -X POST \"http://localhost:5000/api/warehouse\" \\
  -H \"Authorization: Bearer YOUR_JWT_TOKEN\" \\
  -H \"Content-Type: application/json\" \\
  -d '{
    \"consignorId\": \"C001\",
    \"warehouseTypeId\": \"WT001\",
    \"warehouseName1\": \"Central Warehouse\",
    \"warehouseName2\": \"Main Distribution Center\",
    \"vehicleCapacity\": 100,
    \"virtualYardIn\": true,
    \"radiusForVirtualYardIn\": 2.5,
    \"weighBridgeAvailability\": true,
    \"fuelAvailability\": true,
    \"addressId\": \"ADDR0001\"
  }'
\\\

#### 3. **Test Get Warehouse by ID**

\\\ash
curl -X GET \"http://localhost:5000/api/warehouse/WH0001\" \\
  -H \"Authorization: Bearer YOUR_JWT_TOKEN\"
\\\

### Frontend Testing

#### 1. **Test List Page**

- Navigate to \/warehouse\
- Verify warehouse table loads with pagination
- Test search functionality (fuzzy search)
- Apply filters and verify results
- Click warehouse ID to navigate to details page

#### 2. **Test Filter Functionality**

- Toggle filter panel
- Enter warehouse ID filter
- Select status filter
- Check/uncheck facility filters (weighbridge, virtual yard, geofencing)
- Click \"Apply Filters\" and verify API call
- Click \"Clear All\" and verify reset

#### 3. **Test Pagination**

- Navigate through pages using arrow buttons
- Click specific page numbers
- Verify \"First\" and \"Last\" buttons work
- Check page count display

#### 4. **Test Create Functionality**

- Click \"Create Warehouse\" button
- Fill all required fields
- Submit form
- Verify toast notification
- Check database for new record

### Integration Testing Checklist

- [ ] Backend API endpoints return correct status codes
- [ ] JWT authentication works on all routes
- [ ] Role-based access control blocks unauthorized users
- [ ] Zod validation rejects invalid data
- [ ] Database transactions rollback on errors
- [ ] Frontend Redux state updates correctly
- [ ] Toast notifications appear on actions
- [ ] Theme configuration is applied consistently
- [ ] Responsive design works on mobile/tablet
- [ ] Error handling displays user-friendly messages

---

##  Deployment Checklist

### Backend Deployment

- [ ] Environment variables configured (\.env\)
  - \DATABASE_HOST\
  - \DATABASE_USER\
  - \DATABASE_PASSWORD\
  - \DATABASE_NAME\
  - \JWT_SECRET\
  - \PORT\
- [ ] Database migrations run successfully
- [ ] Master data seeded (warehouse types, sub-location types)
- [ ] CORS configured for frontend domain
- [ ] Helmet security middleware enabled
- [ ] Rate limiting configured
- [ ] Logging middleware active (morgan)

### Frontend Deployment

- [ ] Environment variables configured (\.env\)
  - \VITE_API_BASE_URL\
- [ ] Build process completes without errors
- [ ] Theme configuration loaded correctly
- [ ] Redux store configured with warehouse slice
- [ ] Routes registered in AppRoutes
- [ ] Protected routes enforce authentication
- [ ] Assets optimized for production
- [ ] Service worker configured (if using PWA)

### Database Deployment

- [ ] All warehouse-related tables created
- [ ] Indexes applied for performance
- [ ] Foreign key constraints configured
- [ ] Audit trail fields populated
- [ ] Sample data inserted for testing

### Security Checklist

- [ ] JWT tokens have appropriate expiration
- [ ] Passwords hashed with bcrypt
- [ ] SQL injection prevented (parameterized queries)
- [ ] XSS protection enabled
- [ ] CSRF tokens configured
- [ ] HTTPS enforced in production
- [ ] Rate limiting on API endpoints
- [ ] Input validation on both frontend and backend

---

##  Additional Resources

### File Locations Quick Reference

\\\
Backend Files:
 controllers/warehouseController.js
 routes/warehouseRoutes.js
 middleware/roleCheck.js
 validation/warehouseValidation.js
 server.js (register routes)

Frontend Files:
 pages/WarehouseMaintenance.jsx
 redux/slices/warehouseSlice.js
 components/warehouse/
    TopActionBar.jsx
    WarehouseFilterPanel.jsx
    WarehouseListTable.jsx
    PaginationBar.jsx
    StatusPill.jsx
 routes/AppRoutes.jsx (register routes)
\\\

### API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | \/api/warehouse/list\ | Get warehouses with filters | Yes (Consignor/Admin) |
| GET | \/api/warehouse/:id\ | Get warehouse by ID | Yes (Consignor/Admin) |
| POST | \/api/warehouse\ | Create new warehouse | Yes (Consignor/Admin) |
| PUT | \/api/warehouse/:id\ | Update warehouse | Yes (Consignor/Admin) |
| GET | \/api/warehouse/master-data\ | Get master data | Yes (Consignor/Admin) |

### Database Tables Summary

| Table | Purpose | Key Fields |
|-------|---------|------------|
| \warehouse_basic_information\ | Main warehouse data | warehouse_id, consignor_id, warehouse_name1, status |
| \warehouse_documents\ | Warehouse documents | document_unique_id, warehouse_id, document_number |
| \warehouse_sub_location_header\ | Geofencing headers | sub_location_hdr_id, warehouse_unique_id |
| \warehouse_sub_location_item\ | Geofencing coordinates | geo_fence_item_id, latitude, longitude |
| \warehouse_type_master\ | Warehouse types | warehouse_type_id, warehouse_type |

---

##  Implementation Steps Summary

### Phase 1: Backend Setup (2-3 days)

1.  Create validation schemas (\warehouseValidation.js\)
2.  Implement controller methods (\warehouseController.js\)
3.  Define API routes (\warehouseRoutes.js\)
4.  Add role-based middleware (\oleCheck.js\)
5.  Register routes in \server.js\
6.  Test all API endpoints with Postman/cURL

### Phase 2: Frontend Setup (3-4 days)

1.  Create Redux slice (\warehouseSlice.js\)
2.  Build main list page (\WarehouseMaintenance.jsx\)
3.  Create filter panel component
4.  Build list table component
5.  Add pagination component
6.  Create status pill component
7.  Add routes to \AppRoutes.jsx\

### Phase 3: Integration & Testing (2-3 days)

1.  Test API integration with Redux
2.  Verify filter and search functionality
3.  Test pagination with backend
4.  Validate theme consistency
5.  Test responsive design
6.  Verify role-based access control

### Phase 4: Details & Create Pages (3-4 days)

1.  Create \WarehouseDetailsPage.jsx\
2.  Build view/edit tabs (Basic Info, Documents, GeoFencing)
3.  Create \WarehouseCreatePage.jsx\
4.  Implement multi-step form
5.  Add document upload functionality
6.  Integrate geofencing map component

### Phase 5: Polish & Deploy (1-2 days)

1.  Final UI polish and animations
2.  Performance optimization
3.  Error handling improvements
4.  Documentation updates
5.  Production deployment

---

##  Next Steps

1. **Start with Backend**: Implement controller and routes first
2. **Test API Endpoints**: Use Postman to verify all endpoints work
3. **Build Frontend Components**: Create list page components one by one
4. **Integrate**: Connect Redux to backend APIs
5. **Test Thoroughly**: Verify filters, search, and pagination
6. **Extend**: Add create/details pages following the same pattern

---

##  Support & Troubleshooting

### Common Issues

**Issue**: \"Access denied - requires Consignor role\"
- **Solution**: Verify JWT token contains correct role claim

**Issue**: Filter not working
- **Solution**: Check if \ppliedFilters\ state is being updated correctly

**Issue**: Theme colors not applied
- **Solution**: Ensure \getPageTheme('list')\ is called and theme values used

**Issue**: Pagination not changing data
- **Solution**: Verify Redux \etchWarehouses\ is dispatched with new page number

---

##  Completion Criteria

The Warehouse Maintenance Module is considered complete when:

- [ ] All API endpoints return correct data
- [ ] Role-based access control enforces permissions
- [ ] List page displays warehouses with filters and search
- [ ] Pagination works smoothly with backend
- [ ] Theme configuration is applied consistently
- [ ] Responsive design works on all devices
- [ ] Error handling provides user-friendly messages
- [ ] Toast notifications appear on all actions
- [ ] Integration tests pass successfully
- [ ] Documentation is complete and accurate

---

**End of Implementation Guide**

> For questions or issues, refer to the TMS Development Guidelines and existing module implementations (Transporter, Driver, Vehicle).

