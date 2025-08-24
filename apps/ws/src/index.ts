import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

const canvasRooms = new Map();
const socketRoomMap = new Map();

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

console.log(`Canvas WebSocket server is running on port 8080`);
