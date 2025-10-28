const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:5173", // Frontend URL
    credentials: true, // Allow cookies to be sent
  })
);
app.use(cookieParser());
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const warehouseRoutes = require("./routes/warehouse");
const consignorRoutes = require("./routes/consignor");
const authRoutes = require("./routes/auth");
const vehicleRoutes = require("./routes/vehicles");
const userRoutes = require("./routes/users");
const materialRoutes = require("./routes/materials");
const transporterRoutes = require("./routes/transporter");

// Routes
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/consignors", consignorRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/users", userRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/transporters", transporterRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/transporter", transporterRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Initialize sample data
const { createSampleData, createComprehensiveSampleData } = require('./controllers/transporterController');

app.listen(PORT, async () => {
  console.log(`🚀 TMS Backend server running on port ${PORT}`);
  
  // Create sample transporter data if not exists
  try {
    await createSampleData();
    // Create comprehensive sample data for all related tables
    await createComprehensiveSampleData();
  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
});
