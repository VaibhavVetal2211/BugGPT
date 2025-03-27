import { io } from "socket.io-client";
import { logger } from './utils/logger.js';

const socket = io("http://localhost:8000", {
  transports: ["websocket", "polling"],
});

socket.on("connect", () => {
  logger.info("✅ Connected to Socket.IO server");
});

socket.on("scan_progress", (data) => {
  logger.info("📡 Scan progress:", data);
});

socket.on("scan_complete", (data) => {
  logger.info("✅ Scan complete:", data);
});

socket.on("connect_error", (error) => {
  logger.error("🔴 Socket.IO connection error:", error);
});

socket.on("disconnect", (reason) => {
  logger.warn("⚠️ Socket.IO disconnected:", reason);
  if (reason === "io server disconnect") {
    socket.connect(); // Reconnect if the server disconnected
  }
});

export default socket;
