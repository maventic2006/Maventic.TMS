const express = require("express");
const router = express.Router();
const knex = require("knex")(require("../knexfile").development);
const { authenticateToken } = require("../middleware/auth");

// Get all vehicles with basic information
router.get("/", authenticateToken, async (req, res) => {
  try {
    const vehicles = await knex("vehicle_basic_information_hdr as vh")
      .leftJoin(
        "vehicle_type_master as vt",
        "vh.vehicle_type_id",
        "vt.vehicle_type_id"
      )
      .select([
        "vh.vehicle_unique_id",
        "vh.vehicle_id_code_hdr",
        "vh.maker_brand_description",
        "vh.maker_model",
        "vh.vin_chassis_no",
        "vt.vehicle_type_description",
        "vh.load_capacity_in_ton",
        "vh.fuel_type",
        "vh.vehicle_colour",
        "vh.gps_tracker_active_flag",
        "vh.status",
      ])
      .where("vh.status", "ACTIVE");

    res.json({
      success: true,
      data: vehicles,
      count: vehicles.length,
    });
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching vehicles",
      error: error.message,
    });
  }
});

// Get vehicle by ID with full details
router.get("/:vehicleId", authenticateToken, async (req, res) => {
  try {
    const { vehicleId } = req.params;

    // Get basic vehicle information
    const vehicle = await knex("vehicle_basic_information_hdr as vh")
      .leftJoin(
        "vehicle_type_master as vt",
        "vh.vehicle_type_id",
        "vt.vehicle_type_id"
      )
      .select("vh.*", "vt.vehicle_type_description")
      .where("vh.vehicle_id_code_hdr", vehicleId)
      .andWhere("vh.status", "ACTIVE")
      .first();

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    // Get insurance information
    const insurance = await knex("vehicle_basic_information_itm")
      .where("vehicle_id_code_hdr", vehicleId)
      .andWhere("status", "ACTIVE");

    // Get ownership details
    const ownership = await knex("vehicle_ownership_details")
      .where("vehicle_id_code", vehicleId)
      .andWhere("status", "ACTIVE")
      .first();

    // Get maintenance history
    const maintenance = await knex("vehicle_maintenance_service_history")
      .where("vehicle_id_code", vehicleId)
      .andWhere("status", "ACTIVE")
      .orderBy("service_date", "desc");

    // Get permits
    const permits = await knex("vehicle_special_permit")
      .where("vehicle_id_code_hdr", vehicleId)
      .andWhere("status", "ACTIVE");

    res.json({
      success: true,
      data: {
        vehicle,
        insurance,
        ownership,
        maintenance,
        permits,
      },
    });
  } catch (error) {
    console.error("Error fetching vehicle details:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching vehicle details",
      error: error.message,
    });
  }
});

// Get vehicle maintenance history
router.get("/:vehicleId/maintenance", authenticateToken, async (req, res) => {
  try {
    const { vehicleId } = req.params;

    const maintenance = await knex("vehicle_maintenance_service_history as vm")
      .join(
        "vehicle_basic_information_hdr as vh",
        "vm.vehicle_id_code",
        "vh.vehicle_id_code_hdr"
      )
      .select(["vm.*", "vh.maker_brand_description", "vh.maker_model"])
      .where("vm.vehicle_id_code", vehicleId)
      .andWhere("vm.status", "ACTIVE")
      .orderBy("vm.service_date", "desc");

    res.json({
      success: true,
      data: maintenance,
      count: maintenance.length,
    });
  } catch (error) {
    console.error("Error fetching maintenance history:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching maintenance history",
      error: error.message,
    });
  }
});

// Get vehicles due for maintenance
router.get("/maintenance/due", authenticateToken, async (req, res) => {
  try {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const vehiclesDue = await knex("vehicle_maintenance_service_history as vm")
      .join(
        "vehicle_basic_information_hdr as vh",
        "vm.vehicle_id_code",
        "vh.vehicle_id_code_hdr"
      )
      .select([
        "vh.vehicle_id_code_hdr",
        "vh.maker_brand_description",
        "vh.maker_model",
        "vm.upcoming_service_date",
        "vm.type_of_service",
      ])
      .where("vm.upcoming_service_date", "<=", thirtyDaysFromNow)
      .andWhere("vm.status", "ACTIVE")
      .andWhere("vh.status", "ACTIVE")
      .orderBy("vm.upcoming_service_date", "asc");

    res.json({
      success: true,
      data: vehiclesDue,
      count: vehiclesDue.length,
    });
  } catch (error) {
    console.error("Error fetching vehicles due for maintenance:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching vehicles due for maintenance",
      error: error.message,
    });
  }
});

module.exports = router;
