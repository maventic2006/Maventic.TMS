const express = require("express");
const router = express.Router();
const knex = require("knex")(require("../knexfile").development);
const { authenticateToken } = require("../middleware/auth");

// Get all materials with packaging information
router.get("/", authenticateToken, async (req, res) => {
  try {
    const materials = await knex("material_master_information as m")
      .leftJoin(
        "packaging_type_master as p",
        "m.material_id",
        "p.packaging_type_id"
      )
      .select([
        "m.material_master_unique_id",
        "m.material_master_id",
        "m.material_id",
        "m.material_sector",
        "m.material_types",
        "m.description as material_description",
        "p.package_types",
        "p.description as packaging_description",
      ])
      .where("m.status", "ACTIVE");

    res.json({
      success: true,
      data: materials,
      count: materials.length,
    });
  } catch (error) {
    console.error("Error fetching materials:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching materials",
      error: error.message,
    });
  }
});

// Get materials by sector
router.get("/sector/:sector", authenticateToken, async (req, res) => {
  try {
    const { sector } = req.params;

    const materials = await knex("material_master_information")
      .where("material_sector", sector)
      .andWhere("status", "ACTIVE")
      .orderBy("material_types");

    res.json({
      success: true,
      data: materials,
      count: materials.length,
    });
  } catch (error) {
    console.error("Error fetching materials by sector:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching materials by sector",
      error: error.message,
    });
  }
});

// Get all packaging types
router.get("/packaging", authenticateToken, async (req, res) => {
  try {
    const packaging = await knex("packaging_type_master")
      .where("status", "ACTIVE")
      .orderBy("package_types");

    res.json({
      success: true,
      data: packaging,
      count: packaging.length,
    });
  } catch (error) {
    console.error("Error fetching packaging types:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching packaging types",
      error: error.message,
    });
  }
});

module.exports = router;
