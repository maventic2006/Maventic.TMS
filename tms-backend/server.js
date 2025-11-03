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
// Increase payload size limit to handle file uploads (default is 100kb)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Import routes
const warehouseRoutes = require("./routes/warehouse");
const consignorRoutes = require("./routes/consignor");
const authRoutes = require("./routes/auth");
const vehicleRoutes = require("./routes/vehicles");
const userRoutes = require("./routes/users");
const materialRoutes = require("./routes/materials");
const transporterRoutes = require("./routes/transporter");
const driverRoutes = require("./routes/driver");

// Routes
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/consignors", consignorRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/users", userRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/transporters", transporterRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/transporter", transporterRoutes);
app.use("/api/driver", driverRoutes);
app.use("/api/drivers", driverRoutes);

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

app.listen(PORT, () => {
  console.log(`🚀 TMS Backend server running on port ${PORT}`);
});
