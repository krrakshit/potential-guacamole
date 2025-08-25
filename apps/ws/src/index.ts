import { WebSocketServer } from "ws";
import * as https from "https";
import * as http from "http";
import * as fs from "fs";
import * as path from "path";

// SSL Configuration
const SSL_CONFIG = {
  enabled: process.env.SSL_ENABLED === "true" || false,
  keyPath: process.env.SSL_KEY_PATH || "./certs/private-key.pem",
  certPath: process.env.SSL_CERT_PATH || "./certs/certificate.pem",
  port: process.env.SSL_PORT ? parseInt(process.env.SSL_PORT) : 8443,
  httpPort: process.env.HTTP_PORT ? parseInt(process.env.HTTP_PORT) : 8080,
};

// Create HTTP/HTTPS server based on SSL configuration
function createServer(): {
  server: http.Server | https.Server;
  wss: WebSocketServer;
  isSSL: boolean;
} {
  let server: http.Server | https.Server;
  let wss: WebSocketServer;

  if (SSL_CONFIG.enabled) {
    try {
      // Check if SSL certificate files exist
      if (
        !fs.existsSync(SSL_CONFIG.keyPath) ||
        !fs.existsSync(SSL_CONFIG.certPath)
      ) {
        console.error(
          "SSL certificate files not found. Please ensure the following files exist:"
        );
        console.error(`- Private Key: ${SSL_CONFIG.keyPath}`);
        console.error(`- Certificate: ${SSL_CONFIG.certPath}`);
        console.error("Falling back to HTTP server...");
      } else {
        // Read SSL certificate files
        const privateKey = fs.readFileSync(SSL_CONFIG.keyPath, "utf8");
        const certificate = fs.readFileSync(SSL_CONFIG.certPath, "utf8");

        const credentials = { key: privateKey, cert: certificate };

        // Create HTTPS server
        server = https.createServer(credentials);
        wss = new WebSocketServer({ server });

        console.log(
          `🔒 SSL WebSocket server starting on port ${SSL_CONFIG.port}`
        );
        return { server, wss, isSSL: true };
      }
    } catch (error) {
      console.error("Error setting up SSL:", error);
      console.error("Falling back to HTTP server...");
    }
  }

  // Fallback to HTTP server if SSL is not enabled or failed
  server = http.createServer();
  wss = new WebSocketServer({ server });
  console.log(
    `🔓 HTTP WebSocket server starting on port ${SSL_CONFIG.httpPort}`
  );
  return { server, wss, isSSL: false };
}

// Initialize server
const { server, wss, isSSL } = createServer();

const canvasRooms = new Map();
const socketRoomMap = new Map();

function setupWebSocketHandlers() {
  wss.on("connection", (socket: any) => {
    console.log("New client connected");

    socket.on("message", (data: any) => {
      try {
        const message = JSON.parse(data.toString());
        console.log("Received message:", message);

        switch (message.type) {
          case "join-room":
            handleJoinDrawingRoom(socket, message);
            break;

          case "shape-added":
          case "shapes-erased":
            handleDrawingMessage(socket, message);
            break;

          default:
            console.log("Unknown message type:", message.type);
        }
      } catch (error) {
        console.error("Error parsing message:", error);
        socket.send(
          JSON.stringify({
            type: "error",
            message: "Invalid JSON format",
          })
        );
      }
    });

    socket.on("close", () => {
      console.log("Client disconnected");
      handleClientDisconnect(socket);
    });

    socket.on("error", (error: any) => {
      console.error("WebSocket error:", error);
    });

    socket.send(
      JSON.stringify({
        type: "welcome",
        message: "Connected to Canvas WebSocket server",
      })
    );
  });
}

// Setup WebSocket handlers
setupWebSocketHandlers();

function handleJoinDrawingRoom(socket: any, message: any) {
  const roomId = message.roomId;

  if (!roomId) {
    socket.send(
      JSON.stringify({
        type: "error",
        message: "Room ID is required",
      })
    );
    return;
  }

  // Remove socket from previous room if any
  const previousRoom = socketRoomMap.get(socket);
  if (previousRoom && canvasRooms.has(previousRoom)) {
    canvasRooms.get(previousRoom).delete(socket);

    // Clean up empty rooms
    if (canvasRooms.get(previousRoom).size === 0) {
      canvasRooms.delete(previousRoom);
      console.log(`Room ${previousRoom} deleted (empty)`);
    }
  }

  // Add socket to new room
  if (!canvasRooms.has(roomId)) {
    canvasRooms.set(roomId, new Set());
  }

  canvasRooms.get(roomId).add(socket);
  socketRoomMap.set(socket, roomId);

  console.log(`Client joined drawing room: ${roomId}`);

  // Notify other users in the room
  const roomSockets = canvasRooms.get(roomId);
  roomSockets.forEach((client: any) => {
    if (client !== socket && client.readyState === client.OPEN) {
      client.send(
        JSON.stringify({
          type: "user_joined",
          roomId: roomId,
          message: "A new user joined the drawing room",
        })
      );
    }
  });

  socket.send(
    JSON.stringify({
      type: "room_joined",
      roomId: roomId,
      message: `Successfully joined drawing room: ${roomId}`,
    })
  );
}

function handleDrawingMessage(socket: any, message: any) {
  const roomId = message.roomId;

  if (!roomId) {
    socket.send(
      JSON.stringify({
        type: "error",
        message: "Room ID is required for drawing messages",
      })
    );
    return;
  }

  if (!canvasRooms.has(roomId)) {
    console.log(`Drawing room ${roomId} not found`);
    return;
  }

  const roomSockets = canvasRooms.get(roomId);

  // Check if socket is in the room
  if (!roomSockets.has(socket)) {
    socket.send(
      JSON.stringify({
        type: "error",
        message: "You are not in this drawing room",
      })
    );
    return;
  }

  // Broadcast the drawing message to all other users in the room
  roomSockets.forEach((client: any) => {
    if (client !== socket && client.readyState === client.OPEN) {
      client.send(JSON.stringify(message));
    }
  });

  console.log(`Drawing message broadcasted to room ${roomId}:`, message.type);
}

function handleClientDisconnect(socket: any) {
  const roomId = socketRoomMap.get(socket);

  if (roomId && canvasRooms.has(roomId)) {
    const roomSockets = canvasRooms.get(roomId);
    roomSockets.delete(socket);

    // Notify other users about disconnection
    roomSockets.forEach((client: any) => {
      if (client.readyState === client.OPEN) {
        client.send(
          JSON.stringify({
            type: "user_left",
            roomId: roomId,
            message: "A user left the drawing room",
          })
        );
      }
    });

    // Clean up empty rooms
    if (roomSockets.size === 0) {
      canvasRooms.delete(roomId);
      console.log(`Drawing room ${roomId} deleted (empty)`);
    }
  }

  socketRoomMap.delete(socket);
}

// Start the server
const port = isSSL ? SSL_CONFIG.port : SSL_CONFIG.httpPort;
const protocol = isSSL ? "wss" : "ws";

server.listen(port, () => {
  console.log(
    `🚀 Canvas WebSocket server is running on ${protocol}://localhost:${port}`
  );

  if (isSSL) {
    console.log("🔒 SSL/TLS encryption enabled");
    console.log(`📜 Using certificate: ${SSL_CONFIG.certPath}`);
    console.log(`🔑 Using private key: ${SSL_CONFIG.keyPath}`);
  } else {
    console.log("⚠️  Running in HTTP mode (not encrypted)");
    console.log(
      "💡 To enable SSL, set SSL_ENABLED=true and provide certificate files"
    );
  }

  console.log("\n📋 Environment Variables:");
  console.log(`   SSL_ENABLED: ${SSL_CONFIG.enabled}`);
  console.log(`   SSL_PORT: ${SSL_CONFIG.port}`);
  console.log(`   HTTP_PORT: ${SSL_CONFIG.httpPort}`);
  console.log(`   SSL_KEY_PATH: ${SSL_CONFIG.keyPath}`);
  console.log(`   SSL_CERT_PATH: ${SSL_CONFIG.certPath}`);
});

// Handle server errors
server.on("error", (error) => {
  console.error("Server error:", error);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down WebSocket server...");

  // Close all WebSocket connections
  wss.clients.forEach((client) => {
    client.terminate();
  });

  server.close(() => {
    console.log("✅ Server closed successfully");
    process.exit(0);
  });
});
