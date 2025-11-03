import { io } from "socket.io-client";
import { store } from "../redux/store";
import {
  updateProgress,
  updateBatchStatus,
  setValidationResults,
} from "../redux/slices/bulkUploadSlice";

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect() {
    if (this.socket && this.isConnected) {
      console.log("Socket already connected");
      return;
    }

    const SOCKET_URL =
      import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

    console.log("Connecting to Socket.IO server:", SOCKET_URL);

    this.socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    // Connection events
    this.socket.on("connect", () => {
      console.log("✅ Socket.IO connected:", this.socket.id);
      this.isConnected = true;
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Socket.IO disconnected:", reason);
      this.isConnected = false;
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error);
      this.isConnected = false;
    });

    // Bulk upload progress events
    this.socket.on("bulkUploadProgress", (data) => {
      console.log("📊 Bulk upload progress:", data);
      store.dispatch(
        updateProgress({
          progress: data.progress,
          log: data.message,
          type: data.type || "info",
        })
      );
    });

    // Batch status updates
    this.socket.on("batchStatusUpdate", (data) => {
      console.log("🔄 Batch status update:", data);
      store.dispatch(updateBatchStatus(data));
    });

    // Validation results
    this.socket.on("validationComplete", (data) => {
      console.log("✅ Validation complete:", data);
      store.dispatch(setValidationResults(data.validationResults));
      store.dispatch(
        updateProgress({
          progress: 100,
          log: `Validation complete: ${data.validationResults.valid} valid, ${data.validationResults.invalid} invalid`,
          type: data.validationResults.invalid > 0 ? "warning" : "success",
        })
      );
    });

    // Processing complete
    this.socket.on("processingComplete", (data) => {
      console.log("✅ Processing complete:", data);
      store.dispatch(
        updateProgress({
          progress: 100,
          log: data.message,
          type: "success",
        })
      );
    });

    // Processing error
    this.socket.on("processingError", (data) => {
      console.error("❌ Processing error:", data);
      store.dispatch(
        updateProgress({
          progress: 0,
          log: `Error: ${data.error}`,
          type: "error",
        })
      );
    });
  }

  disconnect() {
    if (this.socket) {
      console.log("Disconnecting Socket.IO...");
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  joinBatchRoom(batchId) {
    if (this.socket && this.isConnected) {
      console.log(`Joining batch room: ${batchId}`);
      this.socket.emit("joinBatchRoom", { batchId });
    } else {
      console.warn("Socket not connected. Cannot join batch room.");
    }
  }

  leaveBatchRoom(batchId) {
    if (this.socket && this.isConnected) {
      console.log(`Leaving batch room: ${batchId}`);
      this.socket.emit("leaveBatchRoom", { batchId });
    }
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
