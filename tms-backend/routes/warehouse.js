const express = require("express");
const router = express.Router();
const db = require("../config/database");

// GET all warehouses
router.get("/", async (req, res) => {
  try {
    const warehouses = await db("warehouse_basic_information").select("*");
    res.json(warehouses);
  } catch (error) {
    console.error("Error fetching warehouses:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET warehouse by ID
router.get("/:id", async (req, res) => {
  try {
    const warehouse = await db("warehouse_basic_information")
      .where("warehouse_id", req.params.id)
      .first();

    if (!warehouse) {
      return res.status(404).json({ error: "Warehouse not found" });
    }

    res.json(warehouse);
  } catch (error) {
    console.error("Error fetching warehouse:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST create new warehouse
router.post("/", async (req, res) => {
  try {
    const [id] = await db("warehouse_basic_information").insert(req.body);
    const newWarehouse = await db("warehouse_basic_information")
      .where("warehouse_unique_id", id)
      .first();

    res.status(201).json(newWarehouse);
  } catch (error) {
    console.error("Error creating warehouse:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT update warehouse
router.put("/:id", async (req, res) => {
  try {
    const updated = await db("warehouse_basic_information")
      .where("warehouse_id", req.params.id)
      .update(req.body);

    if (!updated) {
      return res.status(404).json({ error: "Warehouse not found" });
    }

    const warehouse = await db("warehouse_basic_information")
      .where("warehouse_id", req.params.id)
      .first();

    res.json(warehouse);
  } catch (error) {
    console.error("Error updating warehouse:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE warehouse
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await db("warehouse_basic_information")
      .where("warehouse_id", req.params.id)
      .del();

    if (!deleted) {
      return res.status(404).json({ error: "Warehouse not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting warehouse:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
