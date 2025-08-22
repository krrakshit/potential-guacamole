import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

const canvasRooms = new Map();
const socketRoomMap = new Map();

wss.on("connection", (socket : any) => {
  console.log("New client connected");

  socket.on("message", (data : any) => {
    try {
      const message = JSON.parse(data.toString());
      console.log("Received message:", message);

      switch (message.type) {
        case "create":
          handleCreateRoom(socket, message);
          break;
        
        case "join":
          handleJoinRoom(socket, message);
          break;
        
        case "publish":
          handlePublishMessage(socket, message);
          break;
        
        default:
          wss.clients.forEach((client) => {
            if (client !== socket && client.readyState === client.OPEN) {
              client.send(JSON.stringify(message));
            }
          });
      }
    } catch (error) {
      console.error("Error parsing message:", error);
      socket.send(JSON.stringify({
        type: "error",
        message: "Invalid JSON format"
      }));
    }
  });

  socket.on("close", () => {
    console.log("Client disconnected");
    handleClientDisconnect(socket);
  });

  socket.on("error", (error : any) => {
    console.error("WebSocket error:", error);
  });

  socket.send(
    JSON.stringify({
      type: "welcome",
      message: "Connected to WebSocket server",
    })
  );
});

function handleCreateRoom(socket : any, message : any) {
  const roomId = message.content;
  
  if (!roomId) {
    socket.send(JSON.stringify({
      type: "error",
      message: "Room ID is required for creating a room"
    }));
    return;
  }

  if (canvasRooms.has(roomId)) {
    socket.send(JSON.stringify({
      type: "error",
      message: `Room ${roomId} already exists`
    }));
    return;
  }

  canvasRooms.set(roomId, new Set([socket]));
  socketRoomMap.set(socket, roomId);

  socket.send(JSON.stringify({
    type: "room_created",
    roomId: roomId,
    message: `Room ${roomId} created successfully`
  }));

  console.log(`Room ${roomId} created`);
}

function handleJoinRoom(socket : any, message : any) {
  const roomId = message.content;

  if (!roomId) {
    socket.send(JSON.stringify({
      type: "error",
      message: "Room ID is required for joining a room"
    }));
    return;
  }

  if (!canvasRooms.has(roomId)) {
    socket.send(JSON.stringify({
      type: "error",
      message: `Room ${roomId} does not exist`
    }));
    return;
  }

  const previousRoom = socketRoomMap.get(socket);
  if (previousRoom && canvasRooms.has(previousRoom)) {
    canvasRooms.get(previousRoom).delete(socket);
    if (canvasRooms.get(previousRoom).size === 0) {
      canvasRooms.delete(previousRoom);
      console.log(`Room ${previousRoom} deleted (empty)`);
    }
  }

  canvasRooms.get(roomId).add(socket);
  socketRoomMap.set(socket, roomId);

  socket.send(JSON.stringify({
    type: "room_joined",
    roomId: roomId,
    message: `Joined room ${roomId} successfully`
  }));

  const roomSockets = canvasRooms.get(roomId);
  roomSockets.forEach((client : any) => {
    if (client !== socket && client.readyState === client.OPEN) {
      client.send(JSON.stringify({
        type: "user_joined",
        roomId: roomId,
        message: "A new user joined the room"
      }));
    }
  });

  console.log(`Client joined room ${roomId}`);
}

function handlePublishMessage(socket : any, message : any) {
  const roomId = message.roomId;

  if (!roomId) {
    socket.send(JSON.stringify({
      type: "error",
      message: "Room ID is required for publishing messages"
    }));
    return;
  }

  if (!canvasRooms.has(roomId)) {
    socket.send(JSON.stringify({
      type: "error",
      message: `Room ${roomId} does not exist`
    }));
    return;
  }

  const roomSockets = canvasRooms.get(roomId);
  if (!roomSockets.has(socket)) {
    socket.send(JSON.stringify({
      type: "error",
      message: `You are not a member of room ${roomId}`
    }));
    return;
  }

  roomSockets.forEach((client : any) => {
    if (client !== socket && client.readyState === client.OPEN) {
      client.send(JSON.stringify(message));
    }
  });

  console.log(`Message published to room ${roomId}`);
}

function handleClientDisconnect(socket : any) {
  const roomId = socketRoomMap.get(socket);
  
  if (roomId && canvasRooms.has(roomId)) {
    const roomSockets = canvasRooms.get(roomId);
    roomSockets.delete(socket);
    
    roomSockets.forEach((client : any) => {
      if (client.readyState === client.OPEN) {
        client.send(JSON.stringify({
          type: "user_left",
          roomId: roomId,
          message: "A user left the room"
        }));
      }
    });


    if (roomSockets.size === 0) {
      canvasRooms.delete(roomId);
      console.log(`Room ${roomId} deleted (empty)`);
    }
  }
  
  socketRoomMap.delete(socket);
}

console.log(`WebSocket server is running on port 8080`);