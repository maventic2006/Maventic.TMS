const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const http = require("http");
const socketIO = require("socket.io");
const path = require("path");
const { comprehensiveHealthCheck } = require("./utils/databaseHealthCheck");
const knex = require("./config/database");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

// Define allowed origins (supports both development and production)
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://192.168.2.32:5173",
  "http://192.168.2.32:5174",
  "http://192.168.2.32:5175",
  // Add production server origins here when deployed
  // Example: "https://tms.yourdomain.com"
];

// If FRONTEND_URL is set in environment, add it to allowed origins
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
  console.log(
    "🌐 Added FRONTEND_URL to CORS origins:",
    process.env.FRONTEND_URL
  );
}

console.log("🔐 CORS Configuration - Allowed Origins:", allowedOrigins);

const io = socketIO(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

const PORT = process.env.PORT || 5000;

// Make io accessible to routes
app.set("io", io);

// Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow images to be loaded from different origins
  })
);
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, Postman, or same-origin)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from origin: ${origin}`;
        console.warn("⚠️ CORS blocked origin:", origin);
        return callback(new Error(msg), false);
      }
      console.log("✅ CORS allowed origin:", origin);
      return callback(null, true);
    },
    credentials: true, // Allow cookies to be sent
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Set-Cookie"], // Expose Set-Cookie header to frontend
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);
app.use(cookieParser());
app.use(morgan("combined"));
// Increase payload size limit to handle file uploads (default is 100kb)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Import routes
const warehouseRoutes = require("./routes/warehouse");
const consignorRoutes = require("./routes/consignor");
const authRoutes = require("./routes/auth");
const vehicleRoutes = require("./routes/vehicles");
const userRoutes = require("./routes/users");
const materialRoutes = require("./routes/materials");
const transporterRoutes = require("./routes/transporter");
const approvalRoutes = require("./routes/approval");
const bulkUploadRoutes = require("./routes/bulkUploadRoutes");
const bulkUploadQueue = require("./queues/bulkUploadQueue");
const { processBulkUpload } = require("./queues/bulkUploadProcessor");
const driverBulkUploadRoutes = require("./routes/driverBulkUploadRoutes");
const driverBulkUploadQueue = require("./queues/driverBulkUploadQueue");
const {
  processDriverBulkUpload,
} = require("./queues/driverBulkUploadProcessor");
const warehouseBulkUploadRoutes = require("./routes/warehouseBulkUploadRoutes");

// Setup bulk upload queue processor
bulkUploadQueue.process(async (job) => {
  return await processBulkUpload(job, io);
});

// Vehicle bulk upload (NO REDIS - uses setImmediate() like driver upload)
const vehicleBulkUploadRoutes = require("./routes/vehicleBulkUploadRoutes");

// Setup driver bulk upload queue processor
driverBulkUploadQueue.process(async (job) => {
  return await processDriverBulkUpload(job, io);
});
const driverRoutes = require("./routes/driver");
const configurationRoutes = require("./routes/configuration");
const consignorConfigurationRoutes = require("./routes/consignorConfiguration");
const transporterVehicleConfigRoutes = require("./routes/transporter-vehicle-config");

// Routes
app.use("/api/warehouse", warehouseRoutes);
app.use("/api/consignors", consignorRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/users", userRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/transporters", transporterRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/transporter", transporterRoutes);
app.use("/api/bulk-upload", bulkUploadRoutes);
app.use("/api/vehicle/bulk-upload", vehicleBulkUploadRoutes);
app.use("/api/driver-bulk-upload", driverBulkUploadRoutes);
app.use("/api/warehouse-bulk-upload", warehouseBulkUploadRoutes);
app.use("/api/driver", driverRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/approvals", approvalRoutes);
app.use("/api/configuration", configurationRoutes);
app.use("/api/consignor-configuration", consignorConfigurationRoutes);
app.use("/api/transporter-vehicle-config", transporterVehicleConfigRoutes);

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

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("✅ Client connected:", socket.id);

  // Handle joining batch rooms
  socket.on("joinBatchRoom", ({ batchId }) => {
    socket.join(`batch:${batchId}`);
    console.log(`Client ${socket.id} joined batch room: ${batchId}`);
  });

  // Handle leaving batch rooms
  socket.on("leaveBatchRoom", ({ batchId }) => {
    socket.leave(`batch:${batchId}`);
    console.log(`Client ${socket.id} left batch room: ${batchId}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// Start server with database health check
const startServer = async () => {
  try {
    // Check database connection before starting
    console.log("\n🚀 ===== STARTING TMS BACKEND SERVER =====\n");

    const healthCheck = await comprehensiveHealthCheck();

    if (!healthCheck.success) {
      console.error("\n❌ Failed to connect to database. Server cannot start.");
      console.error("   Please fix the database connection and try again.\n");
      process.exit(1);
    }

    // Start HTTP server
    server.listen(PORT, () => {
      console.log("✅ ========================================");
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`✅ Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`✅ Frontend URL: http://localhost:5173`);
      console.log(`✅ Backend URL: http://localhost:${PORT}`);
      console.log("✅ ========================================\n");
    });
  } catch (error) {
    console.error("\n❌ Server startup error:", error.message);
    process.exit(1);
  }
};

// Start the server
startServer();

// Error handling for server
server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error("");
    console.error("🔴 ========================================");
    console.error("🔴 PORT ALREADY IN USE ERROR");
    console.error("🔴 ========================================");
    console.error(`❌ Port ${PORT} is already in use by another process`);
    console.error("");
    console.error("💡 SOLUTIONS:");
    console.error("   Option 1: Kill the conflicting process");
    console.error(`     PowerShell: .\\kill-port.ps1`);
    console.error(`     Or: taskkill /F /PID <process-id>`);
    console.error("");
    console.error("   Option 2: Use a different port");
    console.error("     Update PORT in .env file");
    console.error("");
    console.error("   Option 3: Find what's using the port");
    console.error(`     PowerShell: Get-NetTCPConnection -LocalPort ${PORT}`);
    console.error(`     CMD: netstat -ano | findstr :${PORT}`);
    console.error("");
    console.error("🔴 ========================================");
    console.error("");
    process.exit(1);
  } else {
    console.error("❌ Server error:", error);
    process.exit(1);
  }
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log("");
  console.log(`⚠️  ${signal} received. Starting graceful shutdown...`);

  // Close server
  server.close(() => {
    console.log("✅ HTTP server closed");

    // Close Socket.IO connections
    io.close(() => {
      console.log("✅ Socket.IO connections closed");

      // Close database connections (if any)
      // knex.destroy() - uncomment if using knex

      console.log("✅ Graceful shutdown complete");
      process.exit(0);
    });
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error("⚠️  Forced shutdown after 10 seconds");
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("");
  console.error("🔴 ========================================");
  console.error("🔴 UNCAUGHT EXCEPTION");
  console.error("🔴 ========================================");
  console.error(error);
  console.error("🔴 ========================================");
  console.error("");
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("");
  console.error("🔴 ========================================");
  console.error("🔴 UNHANDLED PROMISE REJECTION");
  console.error("🔴 ========================================");
  console.error("Reason:", reason);
  console.error("Promise:", promise);
  console.error("🔴 ========================================");
  console.error("");
  process.exit(1);
});
