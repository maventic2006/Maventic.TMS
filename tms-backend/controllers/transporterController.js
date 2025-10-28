const db = require('../config/database');

/**
 * Get all transporters with filtering, searching and pagination
 * GET /api/transporters
 */
const getTransporters = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 25,
      search = '',
      transporterId = '',
      tan = '',
      tinPan = '',
      vatGst = '',
      status = '',
      transportMode = '',
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Calculate offset for pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Base query for transporters - get distinct transporters first, then join with first contact
    let query = db('transporter_general_info as tgi')
      .leftJoin(
        function() {
          this.select(
              'tc.transporter_id',
              'tc.contact_person_name',
              'tc.phone_number',
              'tc.email_id'
            )
            .from('transporter_contact as tc')
            .whereRaw('tc.contact_unique_id = (SELECT MIN(tc2.contact_unique_id) FROM transporter_contact tc2 WHERE tc2.transporter_id = tc.transporter_id AND tc2.status = "ACTIVE")')
            .as('primary_contact');
        },
        'tgi.transporter_id', 'primary_contact.transporter_id'
      )
      .select(
        'tgi.transporter_unique_id',
        'tgi.transporter_id',
        'tgi.business_name',
        'tgi.trans_mode_road',
        'tgi.trans_mode_rail',
        'tgi.trans_mode_air',
        'tgi.trans_mode_sea',
        'tgi.active_flag',
        'tgi.status',
        'tgi.created_at',
        'tgi.created_by',
        'tgi.updated_at',
        'tgi.updated_by',
        'primary_contact.contact_person_name',
        'primary_contact.phone_number',
        'primary_contact.email_id',
        // Mock additional fields for compatibility
        db.raw("'12345678901234' as tin_pan"),
        db.raw("'GST123456789' as vat_gst"),
        db.raw("'TAN123456' as tan"),
        db.raw("'123 Business Address, City, State' as address"),
        db.raw("'USER001' as approver"),
        db.raw("DATE_FORMAT(tgi.created_at, '%Y-%m-%d') as approved_on")
      );

    // Apply filters
    if (transporterId) {
      query = query.where('tgi.transporter_id', 'like', `%${transporterId}%`);
    }

    if (status) {
      query = query.where('tgi.status', status);
    }

    // Transport mode filtering
    if (transportMode) {
      const modes = Array.isArray(transportMode) ? transportMode : transportMode.split(',');
      query = query.where(function() {
        modes.forEach(mode => {
          switch(mode.toUpperCase()) {
            case 'R':
              this.orWhere('tgi.trans_mode_road', true);
              break;
            case 'A':
              this.orWhere('tgi.trans_mode_air', true);
              break;
            case 'RL':
              this.orWhere('tgi.trans_mode_rail', true);
              break;
            case 'S':
              this.orWhere('tgi.trans_mode_sea', true);
              break;
          }
        });
      });
    }

    // Global search across multiple fields
    if (search) {
      query = query.where(function() {
        this.where('tgi.transporter_id', 'like', `%${search}%`)
          .orWhere('tgi.business_name', 'like', `%${search}%`)
          .orWhere('primary_contact.phone_number', 'like', `%${search}%`)
          .orWhere('primary_contact.email_id', 'like', `%${search}%`)
          .orWhere('primary_contact.contact_person_name', 'like', `%${search}%`);
      });
    }

    // Get total count for pagination - just count distinct transporters
    const countQuery = db('transporter_general_info as tgi')
      .count('tgi.transporter_id as total');
    
    // Apply same filters to count query
    if (transporterId) {
      countQuery.where('tgi.transporter_id', 'like', `%${transporterId}%`);
    }
    if (status) {
      countQuery.where('tgi.status', status);
    }
    if (transportMode) {
      const modes = Array.isArray(transportMode) ? transportMode : transportMode.split(',');
      countQuery.where(function() {
        modes.forEach(mode => {
          switch(mode.toUpperCase()) {
            case 'R':
              this.orWhere('tgi.trans_mode_road', true);
              break;
            case 'A':
              this.orWhere('tgi.trans_mode_air', true);
              break;
            case 'RL':
              this.orWhere('tgi.trans_mode_rail', true);
              break;
            case 'S':
              this.orWhere('tgi.trans_mode_sea', true);
              break;
          }
        });
      });
    }
    if (search) {
      countQuery.where(function() {
        this.where('tgi.transporter_id', 'like', `%${search}%`)
          .orWhere('tgi.business_name', 'like', `%${search}%`);
      });
    }
    
    const totalResult = await countQuery.first();
    const total = parseInt(totalResult.total);

    // Apply sorting
    const validSortFields = ['transporter_id', 'business_name', 'created_at', 'status'];
    const sortField = validSortFields.includes(sortBy) ? `tgi.${sortBy}` : 'tgi.created_at';
    const order = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';
    
    query = query.orderBy(sortField, order);

    // Apply pagination
    query = query.limit(parseInt(limit)).offset(offset);

    // Execute query
    const transporters = await query;

    // Transform data to match frontend expectations
    const transformedTransporters = transporters.map(transporter => {
      // Determine transport modes
      const transportModes = [];
      if (transporter.trans_mode_road) transportModes.push('R');
      if (transporter.trans_mode_air) transportModes.push('A');
      if (transporter.trans_mode_rail) transportModes.push('RL');
      if (transporter.trans_mode_sea) transportModes.push('S');

      return {
        id: transporter.transporter_id,
        businessName: transporter.business_name || 'N/A',
        transportMode: transportModes,
        mobileNumber: transporter.phone_number || 'N/A',
        emailId: transporter.email_id || 'N/A',
        tinPan: transporter.tin_pan || 'N/A',
        vatGst: transporter.vat_gst || 'N/A',
        tan: transporter.tan || 'N/A',
        address: transporter.address || 'N/A',
        createdBy: transporter.created_by || 'System',
        createdOn: transporter.created_at ? new Date(transporter.created_at).toISOString().split('T')[0] : 'N/A',
        status: mapStatus(transporter.status, transporter.active_flag),
        approver: transporter.approver || 'N/A',
        approvedOn: transporter.approved_on || 'N/A'
      };
    });

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNext = parseInt(page) < totalPages;
    const hasPrev = parseInt(page) > 1;

    res.json({
      success: true,
      data: transformedTransporters,
      pagination: {
        current_page: parseInt(page),
        per_page: parseInt(limit),
        total: total,
        total_pages: totalPages,
        has_next: hasNext,
        has_prev: hasPrev
      },
      meta: {
        search_term: search,
        filters: {
          transporterId,
          status,
          transportMode
        },
        sort: {
          field: sortBy,
          order: sortOrder
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching transporters:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get single transporter by ID with comprehensive data
 * GET /api/transporters/:id
 */
const getTransporterById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get basic transporter info
    const transporter = await db('transporter_general_info')
      .where('transporter_id', id)
      .first();

    if (!transporter) {
      return res.status(404).json({
        success: false,
        message: 'Transporter not found'
      });
    }

    // Get addresses
    const addresses = await db('tms_address')
      .where('user_reference_id', id)
      .where('user_type', 'TRANSPORTER')
      .where('status', 'ACTIVE');

    // Get contacts
    const contacts = await db('transporter_contact')
      .where('transporter_id', id)
      .where('status', 'ACTIVE');

    // Get documents
    const documents = await db('transporter_documents')
      .where('document_id', id)
      .where('user_type', 'TRANSPORTER')
      .where('status', 'ACTIVE');

    // Get service areas
    const serviceAreas = await db('transporter_service_area_hdr as tsh')
      .leftJoin('transporter_service_area_itm as tsi', 'tsh.service_area_hdr_id', 'tsi.service_area_hdr_id')
      .select(
        'tsh.service_country',
        'tsi.service_state'
      )
      .where('tsh.transporter_id', id)
      .where('tsh.status', 'ACTIVE')
      .where('tsi.status', 'ACTIVE');

    // Transform transport modes
    const transportModes = [];
    if (transporter.trans_mode_road) transportModes.push('R');
    if (transporter.trans_mode_air) transportModes.push('A');
    if (transporter.trans_mode_rail) transportModes.push('RL');
    if (transporter.trans_mode_sea) transportModes.push('S');

    // Group service areas by country
    const serviceAreasByCountry = serviceAreas.reduce((acc, item) => {
      if (!acc[item.service_country]) {
        acc[item.service_country] = [];
      }
      if (item.service_state) {
        acc[item.service_country].push(item.service_state);
      }
      return acc;
    }, {});

    // Transform data
    const transformedTransporter = {
      id: transporter.transporter_id,
      businessName: transporter.business_name,
      userType: 'TRANSPORTER',
      transportMode: {
        road: transporter.trans_mode_road,
        rail: transporter.trans_mode_rail,
        air: transporter.trans_mode_air,
        sea: transporter.trans_mode_sea
      },
      transportModeList: transportModes,
      activeFlag: transporter.active_flag,
      fromDate: transporter.created_at,
      toDate: null, // You can add this field to the database if needed
      avgRating: 4.2, // This would be calculated from actual ratings
      status: mapStatus(transporter.status, transporter.active_flag),
      
      // Addresses with contacts
      addresses: addresses.map(addr => ({
        id: addr.address_id,
        country: addr.country,
        vatNumber: addr.vat_number,
        street1: addr.street_1,
        street2: addr.street_2,
        city: addr.city,
        district: addr.district,
        state: addr.state,
        postalCode: addr.postal_code,
        isPrimary: addr.is_primary,
        addressType: addr.address_type_id,
        contacts: contacts.filter(contact => contact.address_id === addr.address_id).map(contact => ({
          id: contact.tcontact_id,
          name: contact.contact_person_name,
          role: contact.role,
          phoneNumber: contact.phone_number,
          alternatePhoneNumber: contact.alternate_phone_number,
          whatsAppNumber: contact.whats_app_number,
          emailId: contact.email_id,
          alternateEmailId: contact.alternate_email_id
        }))
      })),

      // All contacts (for general contact tab)
      contacts: contacts.map(contact => ({
        id: contact.tcontact_id,
        name: contact.contact_person_name,
        role: contact.role,
        phoneNumber: contact.phone_number,
        alternatePhoneNumber: contact.alternate_phone_number,
        whatsAppNumber: contact.whats_app_number,
        emailId: contact.email_id,
        alternateEmailId: contact.alternate_email_id,
        addressId: contact.address_id
      })),

      // Documents
      documents: documents.map(doc => ({
        id: doc.document_unique_id,
        documentType: doc.document_type_id,
        documentNumber: doc.document_number,
        referenceNumber: doc.reference_number,
        country: doc.country,
        validFrom: doc.valid_from,
        validTo: doc.valid_to,
        active: doc.active,
        userType: doc.user_type
      })),

      // Service areas
      serviceAreas: serviceAreasByCountry,

      // Audit info
      createdAt: transporter.created_at,
      updatedAt: transporter.updated_at,
      createdBy: transporter.created_by,
      updatedBy: transporter.updated_by
    };

    res.json({
      success: true,
      data: transformedTransporter,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching transporter:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Helper function to map database status to frontend status
 */
const mapStatus = (dbStatus, activeFlag) => {
  if (!activeFlag) return 'Inactive';
  
  switch (dbStatus) {
    case 'ACTIVE':
      return 'Active';
    case 'PENDING':
      return 'Pending';
    case 'APPROVED':
      return 'Approved';
    case 'REJECTED':
      return 'Rejected';
    default:
      return 'Pending';
  }
};

/**
 * Create sample data if tables are empty
 */
const createSampleData = async () => {
  try {
    // Check if data already exists
    const existingTransporters = await db('transporter_general_info').select('*').limit(1);
    
    if (existingTransporters.length > 0) {
      console.log('Sample transporter data already exists');
      return;
    }

    console.log('Creating sample transporter data...');

    // Sample transporter data
    const sampleTransporters = [
      {
        transporter_id: 'TR001',
        business_name: 'Express Logistics Pvt Ltd',
        trans_mode_road: true,
        trans_mode_rail: false,
        trans_mode_air: true,
        trans_mode_sea: false,
        active_flag: true,
        status: 'ACTIVE',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM'
      },
      {
        transporter_id: 'TR002',
        business_name: 'Swift Transport Solutions',
        trans_mode_road: true,
        trans_mode_rail: true,
        trans_mode_air: false,
        trans_mode_sea: false,
        active_flag: true,
        status: 'PENDING',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM'
      },
      {
        transporter_id: 'TR003',
        business_name: 'Global Shipping Corp',
        trans_mode_road: false,
        trans_mode_rail: false,
        trans_mode_air: true,
        trans_mode_sea: true,
        active_flag: true,
        status: 'APPROVED',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM'
      },
      {
        transporter_id: 'TR004',
        business_name: 'City Movers Ltd',
        trans_mode_road: true,
        trans_mode_rail: false,
        trans_mode_air: false,
        trans_mode_sea: false,
        active_flag: false,
        status: 'INACTIVE',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM'
      },
      {
        transporter_id: 'TR005',
        business_name: 'Multi Modal Transport',
        trans_mode_road: true,
        trans_mode_rail: true,
        trans_mode_air: true,
        trans_mode_sea: true,
        active_flag: true,
        status: 'REJECTED',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM'
      }
    ];

    // Insert transporter general info
    await db('transporter_general_info').insert(sampleTransporters);

    // Sample contact data
    const sampleContacts = [
      {
        tcontact_id: 'TC001',
        transporter_id: 'TR001',
        contact_person_name: 'John Smith',
        role: 'Manager',
        phone_number: '+91-9876543210',
        email_id: 'john.smith@expresslogistics.com',
        status: 'ACTIVE',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM'
      },
      {
        tcontact_id: 'TC002',
        transporter_id: 'TR002',
        contact_person_name: 'Sarah Johnson',
        role: 'Operations Head',
        phone_number: '+91-9876543211',
        email_id: 'sarah.johnson@swifttransport.com',
        status: 'ACTIVE',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM'
      },
      {
        tcontact_id: 'TC003',
        transporter_id: 'TR003',
        contact_person_name: 'Michael Brown',
        role: 'Director',
        phone_number: '+91-9876543212',
        email_id: 'michael.brown@globalshipping.com',
        status: 'ACTIVE',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM'
      },
      {
        tcontact_id: 'TC004',
        transporter_id: 'TR004',
        contact_person_name: 'Lisa Davis',
        role: 'Coordinator',
        phone_number: '+91-9876543213',
        email_id: 'lisa.davis@citymovers.com',
        status: 'ACTIVE',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM'
      },
      {
        tcontact_id: 'TC005',
        transporter_id: 'TR005',
        contact_person_name: 'Robert Wilson',
        role: 'General Manager',
        phone_number: '+91-9876543214',
        email_id: 'robert.wilson@multimodal.com',
        status: 'ACTIVE',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM'
      }
    ];

    // Insert contact data
    await db('transporter_contact').insert(sampleContacts);

    console.log('Sample transporter data created successfully');

  } catch (error) {
    console.error('Error creating sample data:', error);
  }
};

/**
 * Create comprehensive sample data for all transporter related tables
 */
const createComprehensiveSampleData = async () => {
  try {
    console.log('🚀 Creating comprehensive transporter sample data...');

    // Get existing transporters
    const existingTransporters = await db('transporter_general_info').select('transporter_id');
    
    if (existingTransporters.length === 0) {
      console.log('❌ No transporters found. Please run createSampleData first.');
      return;
    }

    const transporterIds = existingTransporters.map(t => t.transporter_id);
    console.log('📋 Found transporters:', transporterIds);

    // 1. Create TMS Address data
    console.log('📍 Creating address data...');
    const addressData = [
      // TR001 - Express Logistics Pvt Ltd
      {
        address_id: 'ADDR001',
        user_reference_id: 'TR001',
        user_type: 'TRANSPORTER',
        country: 'India',
        vat_number: 'GST29AABCE1234F1Z5',
        street_1: '123 Industrial Estate',
        street_2: 'Sector 18',
        city: 'Gurugram',
        district: 'Gurugram',
        state: 'Haryana',
        postal_code: '122015',
        is_primary: true,
        address_type_id: 'AT001',
        status: 'ACTIVE',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM'
      },
      {
        address_id: 'ADDR002',
        user_reference_id: 'TR001',
        user_type: 'TRANSPORTER',
        country: 'India',
        vat_number: 'GST07AABCE1234F1Z5',
        street_1: '456 Transport Hub',
        street_2: 'Industrial Area',
        city: 'Delhi',
        district: 'South Delhi',
        state: 'Delhi',
        postal_code: '110025',
        is_primary: false,
        address_type_id: 'AT002',
        status: 'ACTIVE',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM'
      },
      // TR002 - Swift Transport Solutions
      {
        address_id: 'ADDR003',
        user_reference_id: 'TR002',
        user_type: 'TRANSPORTER',
        country: 'India',
        vat_number: 'GST27AABCS2345G2X6',
        street_1: '789 Logistics Park',
        street_2: 'Phase 3',
        city: 'Mumbai',
        district: 'Thane',
        state: 'Maharashtra',
        postal_code: '400601',
        is_primary: true,
        address_type_id: 'AT001',
        status: 'ACTIVE',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM'
      },
      {
        address_id: 'ADDR004',
        user_reference_id: 'TR002',
        user_type: 'TRANSPORTER',
        country: 'India',
        vat_number: 'GST19AABCS2345G2X6',
        street_1: '321 Distribution Center',
        street_2: 'IT Park',
        city: 'Pune',
        district: 'Pune',
        state: 'Maharashtra',
        postal_code: '411057',
        is_primary: false,
        address_type_id: 'AT003',
        status: 'ACTIVE',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM'
      },
      // TR003 - Global Shipping Corp
      {
        address_id: 'ADDR005',
        user_reference_id: 'TR003',
        user_type: 'TRANSPORTER',
        country: 'India',
        vat_number: 'GST33AABCG3456H3Y7',
        street_1: '654 Port Area',
        street_2: 'Shipping Complex',
        city: 'Chennai',
        district: 'Chennai',
        state: 'Tamil Nadu',
        postal_code: '600001',
        is_primary: true,
        address_type_id: 'AT001',
        status: 'ACTIVE',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM'
      },
      // TR004 - City Movers Ltd
      {
        address_id: 'ADDR006',
        user_reference_id: 'TR004',
        user_type: 'TRANSPORTER',
        country: 'India',
        vat_number: 'GST24AABCC4567I4Z8',
        street_1: '987 City Center',
        street_2: 'Commercial District',
        city: 'Ahmedabad',
        district: 'Ahmedabad',
        state: 'Gujarat',
        postal_code: '380009',
        is_primary: true,
        address_type_id: 'AT001',
        status: 'ACTIVE',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM'
      },
      // TR005 - Multi Modal Transport
      {
        address_id: 'ADDR007',
        user_reference_id: 'TR005',
        user_type: 'TRANSPORTER',
        country: 'India',
        vat_number: 'GST29AABCM5678J5A9',
        street_1: '147 Multi Modal Hub',
        street_2: 'Transport Nagar',
        city: 'Bangalore',
        district: 'Bangalore Urban',
        state: 'Karnataka',
        postal_code: '560100',
        is_primary: true,
        address_type_id: 'AT001',
        status: 'ACTIVE',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM'
      },
      {
        address_id: 'ADDR008',
        user_reference_id: 'TR005',
        user_type: 'TRANSPORTER',
        country: 'India',
        vat_number: 'GST32AABCM5678J5A9',
        street_1: '258 Freight Terminal',
        street_2: 'Logistics Zone',
        city: 'Kochi',
        district: 'Ernakulam',
        state: 'Kerala',
        postal_code: '682011',
        is_primary: false,
        address_type_id: 'AT002',
        status: 'ACTIVE',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM'
      }
    ];

    // Check if address data already exists
    const existingAddress = await db('tms_address').where('user_type', 'TRANSPORTER').limit(1);
    if (existingAddress.length === 0) {
      await db('tms_address').insert(addressData);
      console.log('✅ Address data created successfully');
    } else {
      console.log('ℹ️ Address data already exists');
    }

    // 2. Create enhanced contact data
    console.log('👥 Creating enhanced contact data...');
    const enhancedContactData = [
      // TR001 contacts
      {
        tcontact_id: 'TC001',
        transporter_id: 'TR001',
        contact_person_name: 'Rajesh Kumar',
        role: 'General Manager',
        phone_number: '+91-9876543210',
        alternate_phone_number: '+91-9876543211',
        whats_app_number: '+91-9876543210',
        email_id: 'rajesh.kumar@expresslogistics.com',
        alternate_email_id: 'rajesh.k@expresslogistics.com',
        address_id: 'ADDR001',
        status: 'ACTIVE',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM'
      },
      {
        tcontact_id: 'TC002',
        transporter_id: 'TR001',
        contact_person_name: 'Priya Sharma',
        role: 'Operations Manager',
        phone_number: '+91-9876543220',
        alternate_phone_number: '+91-9876543221',
        whats_app_number: '+91-9876543220',
        email_id: 'priya.sharma@expresslogistics.com',
        alternate_email_id: 'priya.s@expresslogistics.com',
        address_id: 'ADDR002',
        status: 'ACTIVE',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM'
      },
      // TR002 contacts
      {
        tcontact_id: 'TC003',
        transporter_id: 'TR002',
        contact_person_name: 'Amit Patel',
        role: 'Managing Director',
        phone_number: '+91-9876543230',
        alternate_phone_number: '+91-9876543231',
        whats_app_number: '+91-9876543230',
        email_id: 'amit.patel@swifttransport.com',
        alternate_email_id: 'amit.p@swifttransport.com',
        address_id: 'ADDR003',
        status: 'ACTIVE',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM'
      },
      {
        tcontact_id: 'TC004',
        transporter_id: 'TR002',
        contact_person_name: 'Neha Gupta',
        role: 'Fleet Coordinator',
        phone_number: '+91-9876543240',
        alternate_phone_number: '+91-9876543241',
        whats_app_number: '+91-9876543240',
        email_id: 'neha.gupta@swifttransport.com',
        alternate_email_id: 'neha.g@swifttransport.com',
        address_id: 'ADDR004',
        status: 'ACTIVE',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM'
      },
      // TR003 contacts
      {
        tcontact_id: 'TC005',
        transporter_id: 'TR003',
        contact_person_name: 'Suresh Reddy',
        role: 'Vice President',
        phone_number: '+91-9876543250',
        alternate_phone_number: '+91-9876543251',
        whats_app_number: '+91-9876543250',
        email_id: 'suresh.reddy@globalshipping.com',
        alternate_email_id: 'suresh.r@globalshipping.com',
        address_id: 'ADDR005',
        status: 'ACTIVE',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM'
      },
      {
        tcontact_id: 'TC006',
        transporter_id: 'TR003',
        contact_person_name: 'Kavitha Nair',
        role: 'Port Operations Head',
        phone_number: '+91-9876543260',
        alternate_phone_number: '+91-9876543261',
        whats_app_number: '+91-9876543260',
        email_id: 'kavitha.nair@globalshipping.com',
        alternate_email_id: 'kavitha.n@globalshipping.com',
        address_id: 'ADDR005',
        status: 'ACTIVE',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM'
      },
      // TR004 contacts
      {
        tcontact_id: 'TC007',
        transporter_id: 'TR004',
        contact_person_name: 'Vikram Singh',
        role: 'Owner',
        phone_number: '+91-9876543270',
        alternate_phone_number: '+91-9876543271',
        whats_app_number: '+91-9876543270',
        email_id: 'vikram.singh@citymovers.com',
        alternate_email_id: 'vikram.s@citymovers.com',
        address_id: 'ADDR006',
        status: 'ACTIVE',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM'
      },
      // TR005 contacts
      {
        tcontact_id: 'TC008',
        transporter_id: 'TR005',
        contact_person_name: 'Arjun Krishnan',
        role: 'Chief Executive Officer',
        phone_number: '+91-9876543280',
        alternate_phone_number: '+91-9876543281',
        whats_app_number: '+91-9876543280',
        email_id: 'arjun.krishnan@multimodal.com',
        alternate_email_id: 'arjun.k@multimodal.com',
        address_id: 'ADDR007',
        status: 'ACTIVE',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM'
      },
      {
        tcontact_id: 'TC009',
        transporter_id: 'TR005',
        contact_person_name: 'Meera Menon',
        role: 'Regional Manager',
        phone_number: '+91-9876543290',
        alternate_phone_number: '+91-9876543291',
        whats_app_number: '+91-9876543290',
        email_id: 'meera.menon@multimodal.com',
        alternate_email_id: 'meera.m@multimodal.com',
        address_id: 'ADDR008',
        status: 'ACTIVE',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM'
      }
    ];

    // Delete existing contact data and insert new
    await db('transporter_contact').del();
    await db('transporter_contact').insert(enhancedContactData);
    console.log('✅ Enhanced contact data created successfully');

    // 3. Create document data
    console.log('📄 Creating document data...');
    const documentData = [
      // TR001 documents
      {
        document_unique_id: 'DOC001',
        document_id: 'TR001',
        document_type_id: 'DT001',
        document_number: 'TRANS/2024/001',
        reference_number: 'REF001',
        country: 'India',
        valid_from: '2024-01-01',
        valid_to: '2026-12-31',
        active: true,
        user_type: 'TRANSPORTER',
        status: 'ACTIVE',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM'
      },
      {
        document_unique_id: 'DOC002',
        document_id: 'TR001',
        document_type_id: 'DT002',
        document_number: 'PAN/AABCE1234F',
        reference_number: 'REF002',
        country: 'India',
        valid_from: '2024-01-01',
        valid_to: '2030-12-31',
        active: true,
        user_type: 'TRANSPORTER',
        status: 'ACTIVE',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM'
      },
      {
        document_unique_id: 'DOC003',
        document_id: 'TR001',
        document_type_id: 'DT003',
        document_number: 'INS/VEH/2024/001',
        reference_number: 'REF003',
        country: 'India',
        valid_from: '2024-08-01',
        valid_to: '2025-07-31',
        active: true,
        user_type: 'TRANSPORTER',
        status: 'ACTIVE',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM'
      },
      // TR002 documents
      {
        document_unique_id: 'DOC004',
        document_id: 'TR002',
        document_type_id: 'DT001',
        document_number: 'TRANS/2024/002',
        reference_number: 'REF004',
        country: 'India',
        valid_from: '2024-01-15',
        valid_to: '2027-01-14',
        active: true,
        user_type: 'TRANSPORTER',
        status: 'ACTIVE',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM'
      },
      {
        document_unique_id: 'DOC005',
        document_id: 'TR002',
        document_type_id: 'DT002',
        document_number: 'PAN/AABCS2345G',
        reference_number: 'REF005',
        country: 'India',
        valid_from: '2024-01-15',
        valid_to: '2030-12-31',
        active: true,
        user_type: 'TRANSPORTER',
        status: 'ACTIVE',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM'
      },
      // TR003 documents
      {
        document_unique_id: 'DOC006',
        document_id: 'TR003',
        document_type_id: 'DT001',
        document_number: 'TRANS/2024/003',
        reference_number: 'REF006',
        country: 'India',
        valid_from: '2024-02-01',
        valid_to: '2027-01-31',
        active: true,
        user_type: 'TRANSPORTER',
        status: 'ACTIVE',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM'
      },
      {
        document_unique_id: 'DOC007',
        document_id: 'TR003',
        document_type_id: 'DT004',
        document_number: 'PORT/LIC/2024/001',
        reference_number: 'REF007',
        country: 'India',
        valid_from: '2024-02-01',
        valid_to: '2026-01-31',
        active: true,
        user_type: 'TRANSPORTER',
        status: 'ACTIVE',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM'
      },
      // TR004 documents
      {
        document_unique_id: 'DOC008',
        document_id: 'TR004',
        document_type_id: 'DT001',
        document_number: 'TRANS/2024/004',
        reference_number: 'REF008',
        country: 'India',
        valid_from: '2024-03-01',
        valid_to: '2025-02-28',
        active: false,
        user_type: 'TRANSPORTER',
        status: 'EXPIRED',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM'
      },
      // TR005 documents
      {
        document_unique_id: 'DOC009',
        document_id: 'TR005',
        document_type_id: 'DT001',
        document_number: 'TRANS/2024/005',
        reference_number: 'REF009',
        country: 'India',
        valid_from: '2024-04-01',
        valid_to: '2027-03-31',
        active: true,
        user_type: 'TRANSPORTER',
        status: 'ACTIVE',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM'
      },
      {
        document_unique_id: 'DOC010',
        document_id: 'TR005',
        document_type_id: 'DT005',
        document_number: 'AIR/CARGO/2024/001',
        reference_number: 'REF010',
        country: 'India',
        valid_from: '2024-04-01',
        valid_to: '2026-03-31',
        active: true,
        user_type: 'TRANSPORTER',
        status: 'ACTIVE',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM'
      }
    ];

    // Check if document data already exists
    const existingDocs = await db('transporter_documents').where('user_type', 'TRANSPORTER').limit(1);
    if (existingDocs.length === 0) {
      await db('transporter_documents').insert(documentData);
      console.log('✅ Document data created successfully');
    } else {
      console.log('ℹ️ Document data already exists');
    }

    // 4. Create service area header data
    console.log('🌍 Creating service area data...');
    const serviceAreaHeaderData = [
      // TR001 service areas
      {
        service_area_hdr_id: 'SAH001',
        transporter_id: 'TR001',
        service_country: 'India',
        status: 'ACTIVE',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM'
      },
      // TR002 service areas
      {
        service_area_hdr_id: 'SAH002',
        transporter_id: 'TR002',
        service_country: 'India',
        status: 'ACTIVE',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM'
      },
      // TR003 service areas
      {
        service_area_hdr_id: 'SAH003',
        transporter_id: 'TR003',
        service_country: 'India',
        status: 'ACTIVE',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM'
      },
      {
        service_area_hdr_id: 'SAH004',
        transporter_id: 'TR003',
        service_country: 'UAE',
        status: 'ACTIVE',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM'
      },
      // TR004 service areas
      {
        service_area_hdr_id: 'SAH005',
        transporter_id: 'TR004',
        service_country: 'India',
        status: 'ACTIVE',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM'
      },
      // TR005 service areas
      {
        service_area_hdr_id: 'SAH006',
        transporter_id: 'TR005',
        service_country: 'India',
        status: 'ACTIVE',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM'
      },
      {
        service_area_hdr_id: 'SAH007',
        transporter_id: 'TR005',
        service_country: 'Singapore',
        status: 'ACTIVE',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM'
      }
    ];

    // Check if service area header data already exists
    const existingServiceHeaders = await db('transporter_service_area_hdr').limit(1);
    if (existingServiceHeaders.length === 0) {
      await db('transporter_service_area_hdr').insert(serviceAreaHeaderData);
      console.log('✅ Service area header data created successfully');
    } else {
      console.log('ℹ️ Service area header data already exists');
    }

    // 5. Create service area item data
    const serviceAreaItemData = [
      // SAH001 (TR001 - India) states
      { service_area_itm_id: 'SAI001', service_area_hdr_id: 'SAH001', service_state: 'Haryana', status: 'ACTIVE', created_by: 'SYSTEM', updated_by: 'SYSTEM' },
      { service_area_itm_id: 'SAI002', service_area_hdr_id: 'SAH001', service_state: 'Delhi', status: 'ACTIVE', created_by: 'SYSTEM', updated_by: 'SYSTEM' },
      { service_area_itm_id: 'SAI003', service_area_hdr_id: 'SAH001', service_state: 'Punjab', status: 'ACTIVE', created_by: 'SYSTEM', updated_by: 'SYSTEM' },
      { service_area_itm_id: 'SAI004', service_area_hdr_id: 'SAH001', service_state: 'Uttar Pradesh', status: 'ACTIVE', created_by: 'SYSTEM', updated_by: 'SYSTEM' },
      
      // SAH002 (TR002 - India) states
      { service_area_itm_id: 'SAI005', service_area_hdr_id: 'SAH002', service_state: 'Maharashtra', status: 'ACTIVE', created_by: 'SYSTEM', updated_by: 'SYSTEM' },
      { service_area_itm_id: 'SAI006', service_area_hdr_id: 'SAH002', service_state: 'Gujarat', status: 'ACTIVE', created_by: 'SYSTEM', updated_by: 'SYSTEM' },
      { service_area_itm_id: 'SAI007', service_area_hdr_id: 'SAH002', service_state: 'Rajasthan', status: 'ACTIVE', created_by: 'SYSTEM', updated_by: 'SYSTEM' },
      { service_area_itm_id: 'SAI008', service_area_hdr_id: 'SAH002', service_state: 'Madhya Pradesh', status: 'ACTIVE', created_by: 'SYSTEM', updated_by: 'SYSTEM' },
      
      // SAH003 (TR003 - India) states
      { service_area_itm_id: 'SAI009', service_area_hdr_id: 'SAH003', service_state: 'Tamil Nadu', status: 'ACTIVE', created_by: 'SYSTEM', updated_by: 'SYSTEM' },
      { service_area_itm_id: 'SAI010', service_area_hdr_id: 'SAH003', service_state: 'Kerala', status: 'ACTIVE', created_by: 'SYSTEM', updated_by: 'SYSTEM' },
      { service_area_itm_id: 'SAI011', service_area_hdr_id: 'SAH003', service_state: 'Karnataka', status: 'ACTIVE', created_by: 'SYSTEM', updated_by: 'SYSTEM' },
      { service_area_itm_id: 'SAI012', service_area_hdr_id: 'SAH003', service_state: 'Andhra Pradesh', status: 'ACTIVE', created_by: 'SYSTEM', updated_by: 'SYSTEM' },
      
      // SAH004 (TR003 - UAE) states
      { service_area_itm_id: 'SAI013', service_area_hdr_id: 'SAH004', service_state: 'Dubai', status: 'ACTIVE', created_by: 'SYSTEM', updated_by: 'SYSTEM' },
      { service_area_itm_id: 'SAI014', service_area_hdr_id: 'SAH004', service_state: 'Abu Dhabi', status: 'ACTIVE', created_by: 'SYSTEM', updated_by: 'SYSTEM' },
      
      // SAH005 (TR004 - India) states
      { service_area_itm_id: 'SAI015', service_area_hdr_id: 'SAH005', service_state: 'Gujarat', status: 'ACTIVE', created_by: 'SYSTEM', updated_by: 'SYSTEM' },
      { service_area_itm_id: 'SAI016', service_area_hdr_id: 'SAH005', service_state: 'Rajasthan', status: 'ACTIVE', created_by: 'SYSTEM', updated_by: 'SYSTEM' },
      
      // SAH006 (TR005 - India) states
      { service_area_itm_id: 'SAI017', service_area_hdr_id: 'SAH006', service_state: 'Karnataka', status: 'ACTIVE', created_by: 'SYSTEM', updated_by: 'SYSTEM' },
      { service_area_itm_id: 'SAI018', service_area_hdr_id: 'SAH006', service_state: 'Kerala', status: 'ACTIVE', created_by: 'SYSTEM', updated_by: 'SYSTEM' },
      { service_area_itm_id: 'SAI019', service_area_hdr_id: 'SAH006', service_state: 'Tamil Nadu', status: 'ACTIVE', created_by: 'SYSTEM', updated_by: 'SYSTEM' },
      { service_area_itm_id: 'SAI020', service_area_hdr_id: 'SAH006', service_state: 'Andhra Pradesh', status: 'ACTIVE', created_by: 'SYSTEM', updated_by: 'SYSTEM' },
      { service_area_itm_id: 'SAI021', service_area_hdr_id: 'SAH006', service_state: 'Telangana', status: 'ACTIVE', created_by: 'SYSTEM', updated_by: 'SYSTEM' },
      { service_area_itm_id: 'SAI022', service_area_hdr_id: 'SAH006', service_state: 'Maharashtra', status: 'ACTIVE', created_by: 'SYSTEM', updated_by: 'SYSTEM' },
      
      // SAH007 (TR005 - Singapore) states
      { service_area_itm_id: 'SAI023', service_area_hdr_id: 'SAH007', service_state: 'Central Region', status: 'ACTIVE', created_by: 'SYSTEM', updated_by: 'SYSTEM' },
      { service_area_itm_id: 'SAI024', service_area_hdr_id: 'SAH007', service_state: 'East Region', status: 'ACTIVE', created_by: 'SYSTEM', updated_by: 'SYSTEM' }
    ];

    // Check if service area item data already exists
    const existingServiceItems = await db('transporter_service_area_itm').limit(1);
    if (existingServiceItems.length === 0) {
      await db('transporter_service_area_itm').insert(serviceAreaItemData);
      console.log('✅ Service area item data created successfully');
    } else {
      console.log('ℹ️ Service area item data already exists');
    }

    console.log('🎉 Comprehensive transporter sample data creation completed successfully!');
    console.log('📊 Data Summary:');
    console.log(`   📍 Addresses: ${addressData.length} records`);
    console.log(`   👥 Contacts: ${enhancedContactData.length} records`);
    console.log(`   📄 Documents: ${documentData.length} records`);
    console.log(`   🌍 Service Areas (Headers): ${serviceAreaHeaderData.length} records`);
    console.log(`   🏛️ Service Areas (Items): ${serviceAreaItemData.length} records`);

  } catch (error) {
    console.error('❌ Error creating comprehensive sample data:', error);
    throw error;
  }
};

module.exports = {
  getTransporters,
  getTransporterById,
  createSampleData,
  createComprehensiveSampleData
};