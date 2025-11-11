const db = require('../config/database');

/**
 * Vehicle Controller
 * Handles all CRUD operations for vehicle maintenance
 * Implements industry-standard patterns with comprehensive validation
 * @module vehicleController
 */

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate unique vehicle ID
 * Format: VEH0001, VEH0002, etc.
 */
const generateVehicleId = async () => {
  try {
    const result = await db('vehicle_basic_information_hdr')
      .max('vehicle_id_code_hdr as max_id')
      .first();
    
    if (!result.max_id) {
      return 'VEH0001';
    }
    
    const numPart = parseInt(result.max_id.substring(3)) + 1;
    return 'VEH' + numPart.toString().padStart(4, '0');
  } catch (error) {
    console.error('Error generating vehicle ID:', error);
    throw new Error('Failed to generate vehicle ID');
  }
};

/**
 * Generate unique ownership ID
 * Format: OWN0001, OWN0002, etc.
 */
const generateOwnershipId = async () => {
  try {
    const result = await db('vehicle_ownership_details')
      .max('vehicle_ownership_id as max_id')
      .first();
    
    if (!result.max_id) {
      return 'OWN0001';
    }
    
    const numPart = parseInt(result.max_id.substring(3)) + 1;
    return 'OWN' + numPart.toString().padStart(4, '0');
  } catch (error) {
    console.error('Error generating ownership ID:', error);
    throw new Error('Failed to generate ownership ID');
  }
};

/**
 * Generate unique maintenance ID
 * Format: MNT0001, MNT0002, etc.
 */
const generateMaintenanceId = async () => {
  try {
    const result = await db('vehicle_maintenance_service_history')
      .max('vehicle_maintenance_id as max_id')
      .first();
    
    if (!result.max_id) {
      return 'MNT0001';
    }
    
    const numPart = parseInt(result.max_id.substring(3)) + 1;
    return 'MNT' + numPart.toString().padStart(4, '0');
  } catch (error) {
    console.error('Error generating maintenance ID:', error);
    throw new Error('Failed to generate maintenance ID');
  }
};

/**
 * Generate unique permit ID
 * Format: PRM0001, PRM0002, etc.
 */
const generatePermitId = async () => {
  try {
    const result = await db('vehicle_special_permit')
      .max('vehicle_permit_id as max_id')
      .first();
    
    if (!result.max_id) {
      return 'PRM0001';
    }
    
    const numPart = parseInt(result.max_id.substring(3)) + 1;
    return 'PRM' + numPart.toString().padStart(4, '0');
  } catch (error) {
    console.error('Error generating permit ID:', error);
    throw new Error('Failed to generate permit ID');
  }
};

/**
 * Generate unique document ID
 * Format: DOC0001, DOC0002, etc.
 */
const generateDocumentId = async () => {
  try {
    const result = await db('vehicle_documents')
      .max('document_id as max_id')
      .first();
    
    if (!result.max_id) {
      return 'DOC0001';
    }
    
    const numPart = parseInt(result.max_id.substring(3)) + 1;
    return `DOC${numPart.toString().padStart(4, '0')}`;
  } catch (error) {
    console.error('Error generating document ID:', error);
    throw new Error('Failed to generate document ID');
  }
};

/**
 * Generate unique document upload ID
 */
const generateDocumentUploadId = async () => {
  try {
    const result = await db('document_upload')
      .count('* as count')
      .first();
    
    const count = parseInt(result.count) + 1;
    return `DU${count.toString().padStart(4, '0')}`;
  } catch (error) {
    console.error('Error generating document upload ID:', error);
    throw new Error('Failed to generate document upload ID');
  }
};

/**
 * Generate unique sequence number for service frequency
 */
const generateSequenceNumber = async (vehicleId) => {
  try {
    const result = await db('service_frequency_master')
      .where('vehicle_id', vehicleId)
      .max('sequence_number as max_seq')
      .first();
    
    return (result.max_seq || 0) + 1;
  } catch (error) {
    console.error('Error generating sequence number:', error);
    return 1;
  }
};

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate vehicle basic information
 */
const validateBasicInformation = (data) => {
  const errors = [];
  
  if (!data.maker_brand_description?.trim()) {
    errors.push({ field: 'basicInformation.make', message: 'Make/Brand is required' });
  }
  
  if (!data.maker_model?.trim()) {
    errors.push({ field: 'basicInformation.model', message: 'Maker Model is required' });
  }
  
  if (!data.vin_chassis_no?.trim()) {
    errors.push({ field: 'basicInformation.vin', message: 'VIN/Chassis Number is required' });
  }
  
  if (!data.vehicle_type_id) {
    errors.push({ field: 'basicInformation.vehicleType', message: 'Vehicle Type is required' });
  }
  
  if (!data.manufacturing_month_year) {
    errors.push({ field: 'basicInformation.manufacturingMonthYear', message: 'Manufacturing Month & Year is required' });
  }
  
  if (!data.gps_tracker_imei_number?.trim()) {
    errors.push({ field: 'basicInformation.gpsIMEI', message: 'GPS Tracker IMEI Number is required' });
  }
  
  if (data.gps_tracker_active_flag === undefined || data.gps_tracker_active_flag === null) {
    errors.push({ field: 'basicInformation.gpsActive', message: 'GPS Tracker Active Flag is required' });
  }
  
  if (!data.usage_type_id) {
    errors.push({ field: 'basicInformation.usageType', message: 'Usage Type is required' });
  }
  
  return errors;
};

/**
 * Validate vehicle specifications
 */
const validateSpecifications = (data) => {
  const errors = [];
  
  if (!data.engine_type_id?.trim()) {
    errors.push({ field: 'specifications.engineType', message: 'Engine Type is required' });
  }
  
  if (!data.engine_number?.trim()) {
    errors.push({ field: 'specifications.engineNumber', message: 'Engine Number is required' });
  }
  
  if (!data.fuel_type_id) {
    errors.push({ field: 'specifications.fuelType', message: 'Fuel Type is required' });
  }
  
  if (!data.transmission_type) {
    errors.push({ field: 'specifications.transmission', message: 'Transmission Type is required' });
  }
  
  if (!data.financer?.trim()) {
    errors.push({ field: 'specifications.financer', message: 'Financer is required' });
  }
  
  if (!data.suspension_type) {
    errors.push({ field: 'specifications.suspensionType', message: 'Suspension Type is required' });
  }
  
  return errors;
};

/**
 * Check for duplicate VIN/Chassis Number
 */
const checkDuplicateVIN = async (vin, excludeVehicleId = null) => {
  try {
    let query = db('vehicle_basic_information_hdr')
      .where('vin_chassis_no', vin);
    
    if (excludeVehicleId) {
      query = query.whereNot('vehicle_id_code_hdr', excludeVehicleId);
    }
    
    const existing = await query.first();
    return !!existing;
  } catch (error) {
    console.error('Error checking duplicate VIN:', error);
    return false;
  }
};

/**
 * Check for duplicate Registration Number in vehicle_basic_information_hdr
 */
const checkDuplicateRegistration = async (regNumber, excludeVehicleId = null) => {
  try {
    let query = db('vehicle_basic_information_hdr')
      .where('vehicle_registration_number', regNumber);
    
    if (excludeVehicleId) {
      query = query.where('vehicle_id_code_hdr', '!=', excludeVehicleId);
    }
    
    const existing = await query.first();
    return !!existing;
  } catch (error) {
    console.error('Error checking duplicate registration:', error);
    return false;
  }
};

/**
 * Check for duplicate GPS IMEI
 */
const checkDuplicateGPSIMEI = async (imei, excludeVehicleId = null) => {
  try {
    let query = db('vehicle_basic_information_hdr')
      .where('gps_tracker_imei_number', imei);
    
    if (excludeVehicleId) {
      query = query.whereNot('vehicle_id_code_hdr', excludeVehicleId);
    }
    
    const existing = await query.first();
    return !!existing;
  } catch (error) {
    console.error('Error checking duplicate GPS IMEI:', error);
    return false;
  }
};

// ============================================================================
// CREATE VEHICLE
// ============================================================================

/**
 * Create a new vehicle with all related information
 * @route POST /api/vehicle
 */
const createVehicle = async (req, res) => {
  const trx = await db.transaction();
  
  try {
    const { basicInformation, specifications, capacityDetails, ownershipDetails, 
            maintenanceHistory, serviceFrequency, documents } = req.body;
    
    // Combine basic information and specifications for validation
    const vehicleData = {
      ...basicInformation,
      ...specifications,
    };
    
    // Validate required fields
    const validationErrors = [
      ...validateBasicInformation(vehicleData),
      ...validateSpecifications(vehicleData)
    ];
    
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: validationErrors
      });
    }
    
    // Check for duplicates
    if (vehicleData.vin_chassis_no) {
      const isDuplicate = await checkDuplicateVIN(vehicleData.vin_chassis_no);
      if (isDuplicate) {
        return res.status(400).json({
          success: false,
          message: 'VIN/Chassis Number already exists',
          field: 'basicInformation.vin'
        });
      }
    }
    
    if (vehicleData.gps_tracker_imei_number) {
      const isDuplicate = await checkDuplicateGPSIMEI(vehicleData.gps_tracker_imei_number);
      if (isDuplicate) {
        return res.status(400).json({
          success: false,
          message: 'GPS IMEI Number already exists',
          field: 'basicInformation.gpsIMEI'
        });
      }
    }
    
    // Check for duplicate vehicle registration number (from basic information)
    if (vehicleData?.vehicle_registration_number) {
      const isDuplicate = await checkDuplicateRegistration(vehicleData.vehicle_registration_number);
      if (isDuplicate) {
        return res.status(400).json({
          success: false,
          message: 'Vehicle Registration Number already exists',
          field: 'basicInformation.registrationNumber'
        });
      }
    }
    
    // Generate vehicle ID
    const vehicleId = await generateVehicleId();
    
    // Insert vehicle basic information header
    await trx('vehicle_basic_information_hdr').insert({
      vehicle_id_code_hdr: vehicleId,
      vehicle_registration_number: vehicleData.vehicle_registration_number || null,
      maker_brand_description: vehicleData.maker_brand_description,
      maker_model: vehicleData.maker_model,
      vin_chassis_no: vehicleData.vin_chassis_no,
      vehicle_type_id: vehicleData.vehicle_type_id,
      vehicle_category: vehicleData.vehicle_category,
      vehicle_class_description: vehicleData.vehicle_class_description,
      engine_number: vehicleData.engine_number,
      body_type_desc: vehicleData.body_type_desc,
      fuel_type_id: vehicleData.fuel_type_id,
      vehicle_colour: vehicleData.vehicle_colour,
      engine_type_id: vehicleData.engine_type_id,
      emission_standard: vehicleData.emission_standard,
      financer: vehicleData.financer,
      manufacturing_month_year: vehicleData.manufacturing_month_year,
      unloading_weight: capacityDetails?.unloading_weight || 0,
      gross_vehicle_weight_kg: capacityDetails?.gross_vehicle_weight_kg || 0,
      volume_capacity_cubic_meter: capacityDetails?.volume_capacity_cubic_meter || 0,
      seating_capacity: capacityDetails?.seating_capacity || 0,
      vehicle_registered_at: vehicleData.vehicle_registered_at,
      transmission_type: vehicleData.transmission_type,
      usage_type_id: vehicleData.usage_type_id,
      safety_inspection_date: vehicleData.safety_inspection_date,
      taxes_and_fees: vehicleData.taxes_and_fees || 0,
      load_capacity_in_ton: capacityDetails?.load_capacity_in_ton || 0,
      cargo_dimensions_width: capacityDetails?.cargo_dimensions_width || 0,
      cargo_dimensions_height: capacityDetails?.cargo_dimensions_height || 0,
      cargo_dimensions_length: capacityDetails?.cargo_dimensions_length || 0,
      towing_capacity: capacityDetails?.towing_capacity || 0,
      suspension_type: vehicleData.suspension_type,
      tire_load_rating: capacityDetails?.tire_load_rating,
      vehicle_condition: capacityDetails?.vehicle_condition,
      fuel_tank_capacity: capacityDetails?.fuel_tank_capacity || 0,
      blacklist_status: false,
      road_tax: vehicleData.road_tax || 0,
      gps_tracker_imei_number: vehicleData.gps_tracker_imei_number,
      gps_tracker_active_flag: vehicleData.gps_tracker_active_flag || false,
      leasing_flag: vehicleData.leasing_flag || false,
      avg_running_speed: vehicleData.avg_running_speed || 0,
      max_running_speed: vehicleData.max_running_speed || 0,
      created_by: req.user?.userId || 'SYSTEM',
      updated_by: req.user?.userId || 'SYSTEM',
      status: 'ACTIVE'
    });
    
    // Insert ownership details if provided
    if (ownershipDetails && Object.keys(ownershipDetails).length > 0) {
      const ownershipId = await generateOwnershipId();
      
      await trx('vehicle_ownership_details').insert({
        vehicle_ownership_id: ownershipId,
        vehicle_id_code: vehicleId,
        ownership_name: ownershipDetails.ownershipName,
        valid_from: ownershipDetails.validFrom,
        valid_to: ownershipDetails.validTo,
        registration_number: ownershipDetails.registrationNumber,
        registration_date: ownershipDetails.registrationDate,
        registration_upto: ownershipDetails.registrationUpto,
        purchase_date: ownershipDetails.purchaseDate,
        owner_sr_number: ownershipDetails.ownerSrNumber,
        state_code: ownershipDetails.stateCode,
        rto_code: ownershipDetails.rtoCode,
        present_address_id: ownershipDetails.presentAddressId,
        permanent_address_id: ownershipDetails.permanentAddressId,
        sale_amount: ownershipDetails.saleAmount || 0,
        created_by: req.user?.userId || 'SYSTEM',
        updated_by: req.user?.userId || 'SYSTEM',
        status: 'ACTIVE'
      });
    }
    
    // Insert maintenance history if provided
    if (maintenanceHistory && Object.keys(maintenanceHistory).length > 0) {
      const maintenanceId = await generateMaintenanceId();
      
      await trx('vehicle_maintenance_service_history').insert({
        vehicle_maintenance_id: maintenanceId,
        vehicle_id_code: vehicleId,
        service_date: maintenanceHistory.serviceDate,
        service_remark: maintenanceHistory.serviceRemark,
        upcoming_service_date: maintenanceHistory.upcomingServiceDate,
        type_of_service: maintenanceHistory.typeOfService,
        service_expense: maintenanceHistory.serviceExpense || 0,
        created_by: req.user?.userId || 'SYSTEM',
        updated_by: req.user?.userId || 'SYSTEM',
        status: 'ACTIVE'
      });
    }
    
    // Insert service frequency if provided
    if (serviceFrequency && Object.keys(serviceFrequency).length > 0) {
      const sequenceNumber = await generateSequenceNumber(vehicleId);
      
      await trx('service_frequency_master').insert({
        vehicle_id: vehicleId,
        sequence_number: sequenceNumber,
        time_period: serviceFrequency.timePeriod,
        km_drove: serviceFrequency.kmDrove || 0,
        created_by: req.user?.userId || 'SYSTEM',
        updated_by: req.user?.userId || 'SYSTEM',
        status: 'ACTIVE'
      });
    }
    
    // Insert documents if provided
    if (documents && Array.isArray(documents) && documents.length > 0) {
      for (const doc of documents) {
        const documentId = await generateDocumentId();
        
        // Insert document metadata
        await trx('vehicle_documents').insert({
          document_id: documentId,
          vehicle_id_code: vehicleId,
          document_type_id: doc.documentType,
          reference_number: doc.referenceNumber,
          vehicle_maintenance_id: doc.vehicleMaintenanceId,
          permit_category: doc.permitCategory,
          permit_code: doc.permitCode,
          document_provider: doc.documentProvider,
          coverage_type_id: doc.coverageType,
          premium_amount: doc.premiumAmount || 0,
          valid_from: doc.validFrom,
          valid_to: doc.validTo,
          remarks: doc.remarks,
          created_by: req.user?.userId || 'SYSTEM',
          updated_by: req.user?.userId || 'SYSTEM',
          status: 'ACTIVE'
        });
        
        // Insert document file if provided
        if (doc.fileData && doc.fileName) {
          const uploadId = await generateDocumentUploadId();
          
          await trx('document_upload').insert({
            document_id: uploadId,
            file_name: doc.fileName,
            file_type: doc.fileType || 'application/pdf',
            file_xstring_value: doc.fileData, // Base64 encoded file
            system_reference_id: documentId,
            is_verified: false,
            valid_from: doc.validFrom,
            valid_to: doc.validTo,
            created_by: req.user?.userId || 'SYSTEM',
            updated_by: req.user?.userId || 'SYSTEM',
            created_at: new Date(),
            updated_at: new Date(),
            status: 'ACTIVE'
          });
        }
      }
    }
    
    await trx.commit();
    
    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data: {
        vehicleId: vehicleId
      }
    });
    
  } catch (error) {
    await trx.rollback();
    console.error('Error creating vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create vehicle',
      error: error.message
    });
  }
};

// ============================================================================
// GET ALL VEHICLES WITH FILTERS
// ============================================================================

/**
 * Get all vehicles with pagination and filtering
 * @route GET /api/vehicle
 */
const getAllVehicles = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 25,
      search = '',
      vehicleType = '',
      status = '',
      fuelType = '',
      ownership = '',
      sortBy = 'created_at',
      sortOrder = 'asc' // Changed to 'asc' so newest vehicles appear at the end of the list
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    let query = db('vehicle_basic_information_hdr as vbih')
      .leftJoin('vehicle_ownership_details as vod', 'vbih.vehicle_id_code_hdr', 'vod.vehicle_id_code')
      .leftJoin('vehicle_type_master as vtm', 'vbih.vehicle_type_id', 'vtm.vehicle_type_id')
      .select(
        'vbih.vehicle_id_code_hdr',
        'vbih.vehicle_registration_number',
        'vbih.maker_brand_description',
        'vbih.maker_model',
        'vbih.vin_chassis_no',
        'vbih.vehicle_type_id',
        'vtm.vehicle_type_description',
        'vbih.vehicle_category',
        'vbih.fuel_type_id',
        'vbih.transmission_type',
        'vbih.manufacturing_month_year',
        'vbih.gross_vehicle_weight_kg',
        'vbih.gps_tracker_imei_number',
        'vbih.gps_tracker_active_flag',
        'vbih.blacklist_status',
        'vbih.status as vehicle_status',
        'vbih.created_at',
        'vod.ownership_name',
        'vod.registration_date'
      );

    // Apply search filter
    if (search) {
      query = query.where(function() {
        this.where('vbih.vehicle_id_code_hdr', 'like', `%${search}%`)
          .orWhere('vbih.vehicle_registration_number', 'like', `%${search}%`)
          .orWhere('vbih.maker_brand_description', 'like', `%${search}%`)
          .orWhere('vbih.maker_model', 'like', `%${search}%`)
          .orWhere('vbih.vin_chassis_no', 'like', `%${search}%`);
      });
    }

    // Apply filters
    if (vehicleType) {
      query = query.where('vbih.vehicle_type_id', vehicleType);
    }

    if (status) {
      query = query.where('vbih.status', status);
    }

    if (fuelType) {
      query = query.where('vbih.fuel_type_id', fuelType);
    }

    // Get total count for pagination
    const countQuery = query.clone().clearSelect().clearOrder().count('* as total').first();
    const { total } = await countQuery;

    // Apply sorting and pagination
    query = query
      .orderBy(sortBy, sortOrder)
      .limit(parseInt(limit))
      .offset(offset);

    const vehicles = await query;

    res.json({
      success: true,
      data: vehicles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total),
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vehicles',
      error: error.message
    });
  }
};

// ============================================================================
// GET VEHICLE BY ID
// ============================================================================

/**
 * Get vehicle details by ID
 * @route GET /api/vehicle/:id
 */
const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get vehicle basic information
    const vehicle = await db('vehicle_basic_information_hdr')
      .where('vehicle_id_code_hdr', id)
      .first();

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Get ownership details (array - can have multiple ownership records)
    const ownershipRecords = await db('vehicle_ownership_details')
      .where('vehicle_id_code', id)
      .orderBy('valid_from', 'desc');

    // Get maintenance history (array - all service records)
    const maintenanceRecords = await db('vehicle_maintenance_service_history')
      .where('vehicle_id_code', id)
      .orderBy('service_date', 'desc');

    // Get service frequency (array - all frequency schedules)
    const serviceFrequencyRecords = await db('service_frequency_master')
      .where('vehicle_id', id)
      .orderBy('sequence_number', 'asc');

    // Get documents with file data and document type names
    const documents = await db('vehicle_documents as vd')
      .leftJoin('document_upload as du', 'vd.document_id', 'du.system_reference_id')
      .leftJoin('document_name_master as dnm', 'vd.document_type_id', 'dnm.doc_name_master_id')
      .where('vd.vehicle_id_code', id)
      .where('vd.status', 'ACTIVE')
      .select(
        'vd.document_id',
        'vd.document_type_id',
        'dnm.document_name as document_type_name',
        'vd.reference_number',
        'vd.vehicle_maintenance_id',
        'vd.permit_category',
        'vd.permit_code',
        'vd.document_provider',
        'vd.coverage_type_id',
        'vd.premium_amount',
        'vd.valid_from',
        'vd.valid_to',
        'vd.remarks',
        'du.file_name',
        'du.file_type',
        'du.file_xstring_value as file_data'
      )
      .orderBy('vd.created_at', 'desc');

    // Get vehicle type description
    let vehicleTypeDesc = null;
    if (vehicle.vehicle_type_id) {
      const vehicleType = await db('vehicle_type_master')
        .where('vehicle_type_id', vehicle.vehicle_type_id)
        .first();
      vehicleTypeDesc = vehicleType?.vehicle_type_description;
    }

    // Format response
    const response = {
      vehicleId: vehicle.vehicle_id_code_hdr,
      basicInformation: {
        registrationNumber: vehicle.vehicle_registration_number,
        make: vehicle.maker_brand_description,
        model: vehicle.maker_model,
        vin: vehicle.vin_chassis_no,
        vehicleType: vehicle.vehicle_type_id,
        vehicleTypeDescription: vehicleTypeDesc,
        vehicleCategory: vehicle.vehicle_category,
        manufacturingMonthYear: vehicle.manufacturing_month_year,
        gpsIMEI: vehicle.gps_tracker_imei_number,
        gpsActive: vehicle.gps_tracker_active_flag,
        leasingFlag: vehicle.leasing_flag,
        avgRunningSpeed: vehicle.avg_running_speed,
        maxRunningSpeed: vehicle.max_running_speed,
        usageType: vehicle.usage_type_id,
        safetyInspectionDate: vehicle.safety_inspection_date,
        taxesAndFees: vehicle.taxes_and_fees,
      },
      specifications: {
        engineType: vehicle.engine_type_id,
        engineNumber: vehicle.engine_number,
        bodyTypeDescription: vehicle.body_type_desc,
        fuelType: vehicle.fuel_type_id,
        transmission: vehicle.transmission_type,
        color: vehicle.vehicle_colour,
        emissionStandard: vehicle.emission_standard,
        financer: vehicle.financer,
        suspensionType: vehicle.suspension_type,
        weightDimensions: null, // Not stored in single field
      },
      capacityDetails: {
        unloadingWeight: vehicle.unloading_weight,
        gvw: vehicle.gross_vehicle_weight_kg,
        payloadCapacity: vehicle.gross_vehicle_weight_kg - vehicle.unloading_weight,
        volumeCapacity: vehicle.volume_capacity_cubic_meter,
        cargoWidth: vehicle.cargo_dimensions_width,
        cargoHeight: vehicle.cargo_dimensions_height,
        cargoLength: vehicle.cargo_dimensions_length,
        towingCapacity: vehicle.towing_capacity,
        tireLoadRating: vehicle.tire_load_rating,
        vehicleCondition: vehicle.vehicle_condition,
        fuelTankCapacity: vehicle.fuel_tank_capacity,
        seatingCapacity: vehicle.seating_capacity,
      },
      ownershipDetails: ownershipRecords.map(ownership => ({
        ownerId: ownership.vehicle_ownership_id,
        ownershipName: ownership.ownership_name,
        validFrom: ownership.valid_from,
        validTo: ownership.valid_to,
        registrationNumber: ownership.registration_number,
        registrationDate: ownership.registration_date,
        registrationUpto: ownership.registration_upto,
        purchaseDate: ownership.purchase_date,
        ownerSrNumber: ownership.owner_sr_number,
        stateCode: ownership.state_code,
        rtoCode: ownership.rto_code,
        presentAddressId: ownership.present_address_id,
        permanentAddressId: ownership.permanent_address_id,
        saleAmount: ownership.sale_amount,
      })),
      maintenanceHistory: maintenanceRecords.map(maintenance => ({
        vehicleMaintenanceId: maintenance.vehicle_maintenance_id,
        serviceDate: maintenance.service_date,
        serviceRemark: maintenance.service_remark,
        upcomingServiceDate: maintenance.upcoming_service_date,
        typeOfService: maintenance.type_of_service,
        serviceExpense: maintenance.service_expense,
      })),
      serviceFrequency: serviceFrequencyRecords.map(freq => ({
        sequenceNumber: freq.sequence_number,
        timePeriod: freq.time_period,
        kmDrove: freq.km_drove,
      })),
      documents: documents.map(doc => ({
        documentId: doc.document_id,
        documentType: doc.document_type_name || doc.document_type_id, // Use document name instead of ID
        documentTypeId: doc.document_type_id, // Keep ID for reference
        documentNumber: doc.reference_number, // Map to documentNumber for frontend
        referenceNumber: doc.reference_number,
        vehicleMaintenanceId: doc.vehicle_maintenance_id,
        permitCategory: doc.permit_category,
        permitCode: doc.permit_code,
        documentProvider: doc.document_provider,
        issuingAuthority: doc.document_provider, // Map to issuingAuthority for frontend
        coverageType: doc.coverage_type_id,
        premiumAmount: doc.premium_amount,
        issuedDate: doc.valid_from, // Map to issuedDate for frontend
        expiryDate: doc.valid_to, // Map to expiryDate for frontend
        validFrom: doc.valid_from,
        validTo: doc.valid_to,
        remarks: doc.remarks,
        fileName: doc.file_name,
        fileType: doc.file_type,
        fileData: doc.file_data, // base64 encoded file data
      })),
      status: vehicle.status,
      blacklistStatus: vehicle.blacklist_status,
      createdAt: vehicle.created_at,
      updatedAt: vehicle.updated_at,
    };

    res.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vehicle details',
      error: error.message
    });
  }
};

// ============================================================================
// UPDATE VEHICLE
// ============================================================================

/**
 * Update vehicle information
 * @route PUT /api/vehicle/:id
 */
const updateVehicle = async (req, res) => {
  const trx = await db.transaction();

  try {
    const { id } = req.params;
    const { basicInformation, specifications, capacityDetails, ownershipDetails,
            maintenanceHistory, serviceFrequency, documents } = req.body;

    // Check if vehicle exists
    const existingVehicle = await db('vehicle_basic_information_hdr')
      .where('vehicle_id_code_hdr', id)
      .first();

    if (!existingVehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Combine basic information and specifications for validation
    const vehicleData = {
      ...basicInformation,
      ...specifications,
    };

    // Check for duplicate VIN (excluding current vehicle)
    if (vehicleData.vin_chassis_no && vehicleData.vin_chassis_no !== existingVehicle.vin_chassis_no) {
      const isDuplicate = await checkDuplicateVIN(vehicleData.vin_chassis_no, id);
      if (isDuplicate) {
        return res.status(400).json({
          success: false,
          message: 'VIN/Chassis Number already exists',
          field: 'basicInformation.vin'
        });
      }
    }

    // Check for duplicate GPS IMEI (excluding current vehicle)
    if (vehicleData.gps_tracker_imei_number && vehicleData.gps_tracker_imei_number !== existingVehicle.gps_tracker_imei_number) {
      const isDuplicate = await checkDuplicateGPSIMEI(vehicleData.gps_tracker_imei_number, id);
      if (isDuplicate) {
        return res.status(400).json({
          success: false,
          message: 'GPS IMEI Number already exists',
          field: 'basicInformation.gpsIMEI'
        });
      }
    }

    // Update vehicle basic information
    await trx('vehicle_basic_information_hdr')
      .where('vehicle_id_code_hdr', id)
      .update({
        maker_brand_description: vehicleData.maker_brand_description,
        maker_model: vehicleData.maker_model,
        vin_chassis_no: vehicleData.vin_chassis_no,
        vehicle_type_id: vehicleData.vehicle_type_id,
        vehicle_category: vehicleData.vehicle_category,
        vehicle_class_description: vehicleData.vehicle_class_description,
        engine_number: vehicleData.engine_number,
        body_type_desc: vehicleData.body_type_desc,
        fuel_type_id: vehicleData.fuel_type_id,
        vehicle_colour: vehicleData.vehicle_colour,
        engine_type_id: vehicleData.engine_type_id,
        emission_standard: vehicleData.emission_standard,
        financer: vehicleData.financer,
        manufacturing_month_year: vehicleData.manufacturing_month_year,
        unloading_weight: capacityDetails?.unloading_weight || 0,
        gross_vehicle_weight_kg: capacityDetails?.gross_vehicle_weight_kg || 0,
        volume_capacity_cubic_meter: capacityDetails?.volume_capacity_cubic_meter || 0,
        seating_capacity: capacityDetails?.seating_capacity || 0,
        transmission_type: vehicleData.transmission_type,
        usage_type_id: vehicleData.usage_type_id,
        safety_inspection_date: vehicleData.safety_inspection_date,
        taxes_and_fees: vehicleData.taxes_and_fees || 0,
        load_capacity_in_ton: capacityDetails?.load_capacity_in_ton || 0,
        cargo_dimensions_width: capacityDetails?.cargo_dimensions_width || 0,
        cargo_dimensions_height: capacityDetails?.cargo_dimensions_height || 0,
        cargo_dimensions_length: capacityDetails?.cargo_dimensions_length || 0,
        towing_capacity: capacityDetails?.towing_capacity || 0,
        suspension_type: vehicleData.suspension_type,
        tire_load_rating: capacityDetails?.tire_load_rating,
        vehicle_condition: capacityDetails?.vehicle_condition,
        fuel_tank_capacity: capacityDetails?.fuel_tank_capacity || 0,
        gps_tracker_imei_number: vehicleData.gps_tracker_imei_number,
        gps_tracker_active_flag: vehicleData.gps_tracker_active_flag || false,
        leasing_flag: vehicleData.leasing_flag || false,
        avg_running_speed: vehicleData.avg_running_speed || 0,
        max_running_speed: vehicleData.max_running_speed || 0,
        updated_by: req.user?.userId || 'SYSTEM',
        updated_at: db.fn.now()
      });

    // Update or insert ownership details
    if (ownershipDetails && Object.keys(ownershipDetails).length > 0) {
      const existingOwnership = await db('vehicle_ownership_details')
        .where('vehicle_id_code', id)
        .first();

      // Check for duplicate registration number (excluding current)
      if (ownershipDetails.registrationNumber) {
        const isDuplicate = await checkDuplicateRegistration(
          ownershipDetails.registrationNumber,
          id
        );
        if (isDuplicate) {
          return res.status(400).json({
            success: false,
            message: 'Registration Number already exists',
            field: 'ownershipDetails.registrationNumber'
          });
        }
      }

      if (existingOwnership) {
        await trx('vehicle_ownership_details')
          .where('vehicle_id_code', id)
          .update({
            ownership_name: ownershipDetails.ownershipName,
            valid_from: ownershipDetails.validFrom,
            valid_to: ownershipDetails.validTo,
            registration_number: ownershipDetails.registrationNumber,
            registration_date: ownershipDetails.registrationDate,
            registration_upto: ownershipDetails.registrationUpto,
            purchase_date: ownershipDetails.purchaseDate,
            owner_sr_number: ownershipDetails.ownerSrNumber,
            state_code: ownershipDetails.stateCode,
            rto_code: ownershipDetails.rtoCode,
            present_address_id: ownershipDetails.presentAddressId,
            permanent_address_id: ownershipDetails.permanentAddressId,
            sale_amount: ownershipDetails.saleAmount || 0,
            updated_by: req.user?.userId || 'SYSTEM',
            updated_at: db.fn.now()
          });
      } else {
        const ownershipId = await generateOwnershipId();
        await trx('vehicle_ownership_details').insert({
          vehicle_ownership_id: ownershipId,
          vehicle_id_code: id,
          ownership_name: ownershipDetails.ownershipName,
          valid_from: ownershipDetails.validFrom,
          valid_to: ownershipDetails.validTo,
          registration_number: ownershipDetails.registrationNumber,
          registration_date: ownershipDetails.registrationDate,
          registration_upto: ownershipDetails.registrationUpto,
          purchase_date: ownershipDetails.purchaseDate,
          owner_sr_number: ownershipDetails.ownerSrNumber,
          state_code: ownershipDetails.stateCode,
          rto_code: ownershipDetails.rtoCode,
          present_address_id: ownershipDetails.presentAddressId,
          permanent_address_id: ownershipDetails.permanentAddressId,
          sale_amount: ownershipDetails.saleAmount || 0,
          created_by: req.user?.userId || 'SYSTEM',
          updated_by: req.user?.userId || 'SYSTEM',
          status: 'ACTIVE'
        });
      }
    }

    // Update or insert maintenance history
    if (maintenanceHistory && Object.keys(maintenanceHistory).length > 0) {
      const existingMaintenance = await db('vehicle_maintenance_service_history')
        .where('vehicle_id_code', id)
        .first();

      if (existingMaintenance) {
        await trx('vehicle_maintenance_service_history')
          .where('vehicle_id_code', id)
          .update({
            service_date: maintenanceHistory.serviceDate,
            service_remark: maintenanceHistory.serviceRemark,
            upcoming_service_date: maintenanceHistory.upcomingServiceDate,
            type_of_service: maintenanceHistory.typeOfService,
            service_expense: maintenanceHistory.serviceExpense || 0,
            updated_by: req.user?.userId || 'SYSTEM',
            updated_at: db.fn.now()
          });
      } else {
        const maintenanceId = await generateMaintenanceId();
        await trx('vehicle_maintenance_service_history').insert({
          vehicle_maintenance_id: maintenanceId,
          vehicle_id_code: id,
          service_date: maintenanceHistory.serviceDate,
          service_remark: maintenanceHistory.serviceRemark,
          upcoming_service_date: maintenanceHistory.upcomingServiceDate,
          type_of_service: maintenanceHistory.typeOfService,
          service_expense: maintenanceHistory.serviceExpense || 0,
          created_by: req.user?.userId || 'SYSTEM',
          updated_by: req.user?.userId || 'SYSTEM',
          status: 'ACTIVE'
        });
      }
    }

    // Handle documents (add new, update existing, or delete)
    if (documents && Array.isArray(documents)) {
      for (const doc of documents) {
        // If document has an ID, it's an existing document - update it
        if (doc.documentId) {
          // Update document metadata
          await trx('vehicle_documents')
            .where('document_id', doc.documentId)
            .update({
              document_type_id: doc.documentType,
              reference_number: doc.referenceNumber,
              valid_from: doc.validFrom,
              valid_to: doc.validTo,
              remarks: doc.remarks,
              updated_by: req.user?.userId || 'SYSTEM',
              updated_at: db.fn.now()
            });

          // If new file data is provided, update the file
          if (doc.fileData && doc.fileName) {
            // Check if file exists
            const existingFile = await trx('document_upload')
              .where('system_reference_id', doc.documentId)
              .first();

            if (existingFile) {
              // Update existing file
              await trx('document_upload')
                .where('system_reference_id', doc.documentId)
                .update({
                  file_name: doc.fileName,
                  file_type: doc.fileType || 'application/pdf',
                  file_xstring_value: doc.fileData,
                  updated_by: req.user?.userId || 'SYSTEM',
                  updated_at: db.fn.now()
                });
            } else {
              // Insert new file
              const uploadId = await generateDocumentUploadId();
              await trx('document_upload').insert({
                document_id: uploadId,
                file_name: doc.fileName,
                file_type: doc.fileType || 'application/pdf',
                file_xstring_value: doc.fileData,
                system_reference_id: doc.documentId,
                is_verified: false,
                valid_from: doc.validFrom,
                valid_to: doc.validTo,
                created_by: req.user?.userId || 'SYSTEM',
                updated_by: req.user?.userId || 'SYSTEM',
                created_at: new Date(),
                updated_at: new Date(),
                status: 'ACTIVE'
              });
            }
          }
        } else {
          // New document - insert it
          const documentId = await generateDocumentId();
          
          await trx('vehicle_documents').insert({
            document_id: documentId,
            vehicle_id_code: id,
            document_type_id: doc.documentType,
            reference_number: doc.referenceNumber,
            vehicle_maintenance_id: doc.vehicleMaintenanceId,
            permit_category: doc.permitCategory,
            permit_code: doc.permitCode,
            document_provider: doc.documentProvider,
            coverage_type_id: doc.coverageType,
            premium_amount: doc.premiumAmount || 0,
            valid_from: doc.validFrom,
            valid_to: doc.validTo,
            remarks: doc.remarks,
            created_by: req.user?.userId || 'SYSTEM',
            updated_by: req.user?.userId || 'SYSTEM',
            status: 'ACTIVE'
          });
          
          // Insert document file if provided
          if (doc.fileData && doc.fileName) {
            const uploadId = await generateDocumentUploadId();
            
            await trx('document_upload').insert({
              document_id: uploadId,
              file_name: doc.fileName,
              file_type: doc.fileType || 'application/pdf',
              file_xstring_value: doc.fileData,
              system_reference_id: documentId,
              is_verified: false,
              valid_from: doc.validFrom,
              valid_to: doc.validTo,
              created_by: req.user?.userId || 'SYSTEM',
              updated_by: req.user?.userId || 'SYSTEM',
              created_at: new Date(),
              updated_at: new Date(),
              status: 'ACTIVE'
            });
          }
        }
      }
    }

    await trx.commit();

    res.json({
      success: true,
      message: 'Vehicle updated successfully',
      data: { vehicleId: id }
    });

  } catch (error) {
    await trx.rollback();
    console.error('Error updating vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update vehicle',
      error: error.message
    });
  }
};

// ============================================================================
// DELETE VEHICLE (Soft Delete)
// ============================================================================

/**
 * Soft delete vehicle
 * @route DELETE /api/vehicle/:id
 */
const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if vehicle exists
    const vehicle = await db('vehicle_basic_information_hdr')
      .where('vehicle_id_code_hdr', id)
      .first();

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Soft delete - update status to INACTIVE
    await db('vehicle_basic_information_hdr')
      .where('vehicle_id_code_hdr', id)
      .update({
        status: 'INACTIVE',
        updated_by: req.user?.userId || 'SYSTEM',
        updated_at: db.fn.now()
      });

    res.json({
      success: true,
      message: 'Vehicle deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete vehicle',
      error: error.message
    });
  }
};

// ============================================================================
// GET MASTER DATA
// ============================================================================

/**
 * Get master data for vehicle dropdowns
 * @route GET /api/vehicle/master-data
 */
const getMasterData = async (req, res) => {
  try {
    // Get vehicle types
    const vehicleTypes = await db('vehicle_type_master')
      .where('status', 'ACTIVE')
      .select('vehicle_type_id as value', 'vehicle_type_description as label')
      .timeout(5000)
      .catch(err => {
        // Fallback data matching actual database seed values
        return [
          { value: 'VT001', label: 'Heavy Duty Truck' },
          { value: 'VT002', label: 'Light Commercial Vehicle' },
          { value: 'VT003', label: 'Container Truck' }
        ];
      });

    // Get document types with configuration metadata (joined with doc_type_configuration)
    const vehicleDocuments = await db('document_name_master as dnm')
      .leftJoin('doc_type_configuration as dtc', function() {
        this.on('dnm.doc_name_master_id', '=', 'dtc.doc_name_master_id')
          .andOn('dtc.user_type', '=', db.raw('?', ['VEHICLE']));
      })
      .where('dnm.status', 'ACTIVE')
      .whereIn('dnm.user_type', ['VEHICLE', 'TRANSPORTER'])
      .where(function() {
        this.where('dnm.user_type', 'VEHICLE')
          .orWhere(function() {
            this.where('dnm.user_type', 'TRANSPORTER')
              .whereIn('dnm.document_name', [
                'Vehicle Registration Certificate',
                'Vehicle Insurance',
                'PUC certificate',
                'Permit certificate',
                'Fitness Certificate',
                'Insurance Policy'
              ]);
          });
      })
      .select(
        'dnm.doc_name_master_id as value',
        'dnm.document_name as label',
        db.raw('COALESCE(dtc.is_mandatory, false) as isMandatory'),
        db.raw('COALESCE(dtc.is_expiry_required, false) as isExpiryRequired'),
        db.raw('COALESCE(dtc.is_verification_required, false) as isVerificationRequired')
      )
      .orderBy('dnm.document_name')
      .timeout(5000)
      .catch(err => {
        // Silently use fallback data with configurations when database is unavailable
        // NOTE: Only 2 documents are mandatory as per current requirements
        return [
          { value: 'DN001', label: 'Vehicle Registration Certificate', isMandatory: true, isExpiryRequired: false, isVerificationRequired: true },
          { value: 'DN009', label: 'Vehicle Insurance', isMandatory: false, isExpiryRequired: true, isVerificationRequired: true },
          { value: 'DN010', label: 'PUC certificate', isMandatory: false, isExpiryRequired: true, isVerificationRequired: false },
          { value: 'DN012', label: 'Fitness Certificate', isMandatory: true, isExpiryRequired: true, isVerificationRequired: false },
          { value: 'DN005', label: 'Tax Certificate', isMandatory: false, isExpiryRequired: true, isVerificationRequired: false },
          { value: 'DN011', label: 'Permit certificate', isMandatory: false, isExpiryRequired: true, isVerificationRequired: false },
          { value: 'DN006', label: 'Service Bill', isMandatory: false, isExpiryRequired: false, isVerificationRequired: false },
          { value: 'DN007', label: 'Inspection Report', isMandatory: false, isExpiryRequired: true, isVerificationRequired: false },
          { value: 'DN008', label: 'Maintenance Contract', isMandatory: false, isExpiryRequired: true, isVerificationRequired: false },
          { value: 'DN010', label: 'Vehicle Photos', isMandatory: false, isExpiryRequired: false, isVerificationRequired: false },
          { value: 'DN011', label: 'Leasing Agreement', isMandatory: false, isExpiryRequired: true, isVerificationRequired: true },
          { value: 'DN012', label: 'Hypothecation Certificate', isMandatory: false, isExpiryRequired: false, isVerificationRequired: false }
        ];
      });

    const documentTypes = vehicleDocuments;

    // Engine types from database
    const engineTypes = await db('engine_type_master')
      .where('status', 'ACTIVE')
      .select('engine_type_id as value', 'engine_type as label')
      .orderBy('engine_type')
      .timeout(5000)
      .catch(err => {
        // Fallback data when database is unavailable
        // Use short IDs matching database schema (VARCHAR(20) but typically ET001, ET002, etc.)
        return [
          { value: 'ET001', label: 'BS6 Diesel' },
          { value: 'ET002', label: 'BS6 Petrol' },
          { value: 'ET003', label: 'BS4 Diesel' },
          { value: 'ET004', label: 'BS4 Petrol' },
          { value: 'ET005', label: 'Euro 6 Diesel' },
          { value: 'ET006', label: 'Euro 6 Petrol' },
          { value: 'ET007', label: 'Electric Motor' },
          { value: 'ET008', label: 'CNG Engine' }
        ];
      });

    // Fuel types from database
    const fuelTypes = await db('fuel_type_master')
      .where('status', 'ACTIVE')
      .select('fuel_type_id as value', 'fuel_type as label')
      .orderBy('fuel_type')
      .timeout(5000)
      .catch(err => {
        // Fallback data matching actual database seed values
        return [
          { value: 'FT001', label: 'Diesel' },
          { value: 'FT002', label: 'Petrol/Gasoline' },
          { value: 'FT003', label: 'CNG (Compressed Natural Gas)' },
          { value: 'FT004', label: 'LPG (Liquefied Petroleum Gas)' },
          { value: 'FT005', label: 'Electric' },
          { value: 'FT006', label: 'Hybrid (Petrol-Electric)' },
          { value: 'FT007', label: 'Hybrid (Diesel-Electric)' },
          { value: 'FT008', label: 'Hydrogen' }
        ];
      });

    // Transmission types
    const transmissionTypes = [
      { value: 'MANUAL', label: 'Manual' },
      { value: 'AUTOMATIC', label: 'Automatic' },
      { value: 'AMT', label: 'AMT (Automated Manual Transmission)' },
      { value: 'CVT', label: 'CVT (Continuously Variable Transmission)' },
      { value: 'DCT', label: 'DCT (Dual Clutch Transmission)' },
    ];

    // Emission standards
    const emissionStandards = [
      { value: 'BS4', label: 'BS4' },
      { value: 'BS6', label: 'BS6' },
      { value: 'EURO4', label: 'Euro 4' },
      { value: 'EURO5', label: 'Euro 5' },
      { value: 'EURO6', label: 'Euro 6' },
    ];

    // Usage types from database
    const usageTypes = await db('usage_type_master')
      .where('status', 'ACTIVE')
      .select('usage_type_id as value', 'usage_type as label')
      .orderBy('usage_type')
      .timeout(5000)
      .catch(err => {
        // Fallback data matching actual database seed values
        return [
          { value: 'UT001', label: 'Commercial Transport' },
          { value: 'UT002', label: 'Personal Use' },
          { value: 'UT003', label: 'Rental Services' },
          { value: 'UT004', label: 'Goods Transportation' },
          { value: 'UT005', label: 'Construction/Mining' }
        ];
      });

    // Suspension types
    const suspensionTypes = [
      { value: 'LEAF_SPRING', label: 'Leaf Spring' },
      { value: 'AIR_SUSPENSION', label: 'Air Suspension' },
      { value: 'COIL_SPRING', label: 'Coil Spring' },
      { value: 'TORSION_BAR', label: 'Torsion Bar' },
      { value: 'HYDRAULIC', label: 'Hydraulic' },
    ];

    // Vehicle conditions
    const vehicleConditions = [
      { value: 'EXCELLENT', label: 'Excellent' },
      { value: 'GOOD', label: 'Good' },
      { value: 'FAIR', label: 'Fair' },
      { value: 'POOR', label: 'Poor' },
    ];

    // Loading capacity units
    const loadingCapacityUnits = [
      { value: 'CBM', label: 'Cubic Meter (CBM)' },
      { value: 'CFT', label: 'Cubic Feet (CFT)' },
      { value: 'SQM', label: 'Square Meter (SQM)' },
      { value: 'SQF', label: 'Square Feet (SQF)' },
    ];

    // Door types
    const doorTypes = [
      { value: 'ROLL_UP', label: 'Roll-up' },
      { value: 'SWING', label: 'Swing' },
      { value: 'SLIDING', label: 'Sliding' },
      { value: 'NONE', label: 'None' },
    ];

    // ✅ Coverage Types - Get from database
    const coverageTypes = await db('coverage_type_master')
      .where('status', 'ACTIVE')
      .select('coverage_type_id as value', 'coverage_type as label')
      .orderBy('coverage_type')
      .timeout(5000)
      .catch(err => {
        console.error('Error fetching coverage types:', err);
        return [
          { value: 'CT001', label: 'Comprehensive Insurance' },
          { value: 'CT002', label: 'Third Party Liability' },
          { value: 'CT003', label: 'Collision Coverage' },
          { value: 'CT004', label: 'Cargo Insurance' }
        ];
      });

    res.json({
      success: true,
      data: {
        vehicleTypes,
        documentTypes,
        engineTypes,
        fuelTypes,
        transmissionTypes,
        emissionStandards,
        usageTypes,
        suspensionTypes,
        vehicleConditions,
        loadingCapacityUnits,
        doorTypes,
        coverageTypes // ✅ Added coverage types
      }
    });

  } catch (error) {
    console.error('Error fetching master data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch master data',
      error: error.message
    });
  }
};

module.exports = {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  getMasterData
};
