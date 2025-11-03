const express = require("express");
const router = express.Router();
const db = require("../config/database");
const { authenticateToken } = require("../middleware/auth");

// GET all consignor configurations
router.get("/config", authenticateToken, async (req, res) => {
  try {
    const configs = await db("consignor_general_config_master").select("*");
    res.json(configs);
  } catch (error) {
    console.error("Error fetching consignor configs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET consignor material master information
router.get("/materials", authenticateToken, async (req, res) => {
  try {
    const materials = await db("consignor_material_master_information").select(
      "*"
    );
    res.json(materials);
  } catch (error) {
    console.error("Error fetching materials:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET e-bidding configurations
router.get("/ebidding-config", authenticateToken, async (req, res) => {
  try {
    const configs = await db("e_bidding_config").select("*");
    res.json(configs);
  } catch (error) {
    console.error("Error fetching e-bidding configs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST create new material
router.post("/materials", authenticateToken, async (req, res) => {
  try {
    const [id] = await db("consignor_material_master_information").insert(
      req.body
    );
    const newMaterial = await db("consignor_material_master_information")
      .where("c_material_master_id", id)
      .first();

    res.status(201).json(newMaterial);
  } catch (error) {
    console.error("Error creating material:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
