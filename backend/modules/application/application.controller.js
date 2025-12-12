const applicationService = require('./application.service');

/**
 * @route GET /api/applications
 * @desc Get list of applications for dropdown
 * @access Protected
 */
const listApplications = async (req, res) => {
  try {
    console.log('\n📱 ===== LIST APPLICATIONS REQUEST =====');

    const filters = {
      isActive: req.query.isActive !== undefined ? req.query.isActive === '1' || req.query.isActive === 'true' : undefined
    };

    const applications = await applicationService.listApplications(filters);

    console.log(`✅ Retrieved ${applications.length} applications`);

    res.json({
      success: true,
      data: applications.map(app => ({
        id: app.app_unique_id,
        appId: app.application_id,
        name: app.application_name,
        description: app.application_description,
        appUrl: app.application_url,
        icon: app.application_icon,
        category: app.application_category,
        displayOrder: app.display_order,
        isActive: app.is_active,
        status: app.status,
        createdAt: app.created_at
      })),
      count: applications.length
    });
  } catch (error) {
    console.error('❌ List applications error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: {
        details: error.message
      }
    });
  }
};

/**
 * @route GET /api/applications/:id
 * @desc Get application by ID
 * @access Protected
 */
const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`\n🔍 ===== GET APPLICATION BY ID: ${id} =====`);

    const application = await applicationService.getApplicationById(parseInt(id));

    if (!application) {
      console.log('❌ Application not found');
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    console.log('✅ Application retrieved successfully');

    res.json({
      success: true,
      data: {
        id: application.app_unique_id,
        appId: application.application_id,
        name: application.application_name,
        description: application.application_description,
        appUrl: application.application_url,
        icon: application.application_icon,
        category: application.application_category,
        displayOrder: application.display_order,
        isActive: application.is_active,
        status: application.status,
        createdAt: application.created_at
      }
    });
  } catch (error) {
    console.error('❌ Get application error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching application',
      error: {
        details: error.message
      }
    });
  }
};

module.exports = {
  listApplications,
  getApplicationById
};
