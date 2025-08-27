import { Tool } from "@/components/Canvas";
import { getExistingShapes } from "./http";
import { WS_URL } from "@/config";

type Shape =
  | {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
    }
  | {
      type: "pencil";
      points: { x: number; y: number }[];
    }
  | {
      type: "line";
      startX: number;
      startY: number;
      endX: number;
      endY: number;
    }
  | {
      type: "arrow";
      startX: number;
      startY: number;
      endX: number;
      endY: number;
    }
  | {
      type: "diamond";
      centerX: number;
      centerY: number;
      width: number;
      height: number;
    };

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private existingShapes: Shape[];
  private roomId: string;
  private clicked: boolean;
  private startX = 0;
  private startY = 0;
  private selectedTool: Tool = "pencil"; // Default to pencil instead of circle
  private currentPencilPath: { x: number; y: number }[] = [];
  private socket: WebSocket | null = null;
  private theme: "light" | "dark" = "dark";

  constructor(
    canvas: HTMLCanvasElement,
    roomId: string,
    initialTool: Tool = "pencil",
    theme: "light" | "dark" = "dark"
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.existingShapes = [];
    this.roomId = roomId;
    this.clicked = false;
    this.selectedTool = initialTool; // Use the provided initial tool
    this.theme = theme; // Store theme for drawing colors
    this.init();
    this.initMouseHandlers();
    this.initWebSocket();
  }

  // Local storage methods
  private getStorageKey(): string {
    return `canvas_data_${this.roomId}`;
  }

  private saveToLocalStorage(): void {
    try {
      const storageKey = this.getStorageKey();
      const dataToSave = {
        shapes: this.existingShapes,
        timestamp: Date.now(),
        roomId: this.roomId
      };
      localStorage.setItem(storageKey, JSON.stringify(dataToSave));
      console.log('Canvas data saved to localStorage:', storageKey);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  private loadFromLocalStorage(): Shape[] {
    try {
      const storageKey = this.getStorageKey();
      const savedData = localStorage.getItem(storageKey);
      
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        console.log('Canvas data loaded from localStorage:', storageKey);
        return parsedData.shapes || [];
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
    return [];
  }

  private clearLocalStorage(): void {
    try {
      const storageKey = this.getStorageKey();
      localStorage.removeItem(storageKey);
      console.log('Canvas data cleared from localStorage:', storageKey);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  // Public method to clear canvas and localStorage
  clearCanvasAndStorage(): void {
    this.existingShapes = [];
    this.clearLocalStorage();
    this.clearCanvas();
  }

  // Public method to export canvas data
  exportCanvasData(): string {
    return JSON.stringify({
      shapes: this.existingShapes,
      timestamp: Date.now(),
      roomId: this.roomId
    });
  }

  // Public method to import canvas data
  importCanvasData(data: string): boolean {
    try {
      const parsedData = JSON.parse(data);
      if (parsedData.shapes && Array.isArray(parsedData.shapes)) {
        this.existingShapes = parsedData.shapes;
        this.saveToLocalStorage();
        this.clearCanvas();
        return true;
      }
    } catch (error) {
      console.error('Error importing canvas data:', error);
    }
    return false;
  }

  // Public method to get current shapes
  getCurrentShapes(): Shape[] {
    return [...this.existingShapes];
  }

  // Public method to send shapes to a specific room
  sendShapesToRoom(targetRoomId: string, shapes: Shape[]) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.sendMessage({
        type: "share-canvas-data",
        sourceRoomId: this.roomId,
        targetRoomId: targetRoomId,
        shapes: shapes,
      });
    }
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);

    // Close WebSocket connection
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  setTool(tool: Tool) {
    this.selectedTool = tool;
  }

  setTheme(theme: "light" | "dark") {
    this.theme = theme;
    this.clearCanvas(); // Redraw with new theme colors
  }

  handleResize() {
    // Redraw everything after canvas resize
    this.clearCanvas();
  }

  private getThemeColors() {
    return {
      background: this.theme === "dark" ? "#1a1a1a" : "#f8f9fa",
      stroke: this.theme === "dark" ? "#ffffff" : "#000000",
    };
  }

  async init() {
    // First try to load from localStorage
    const localShapes = this.loadFromLocalStorage();
    
    if (localShapes.length > 0) {
      // Use local storage data if available
      this.existingShapes = localShapes;
      console.log('Loaded shapes from localStorage:', this.existingShapes.length);
    } else {
      // Fall back to server data if no local storage
      this.existingShapes = await getExistingShapes(this.roomId);
      console.log('Loaded shapes from server:', this.existingShapes.length);
      // Save server data to localStorage
      this.saveToLocalStorage();
    }
    
    this.clearCanvas();
  }

  clearCanvas() {
    const colors = this.getThemeColors();

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // Set the background color based on theme
    this.ctx.fillStyle = colors.background;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.existingShapes.map((shape) => {
      this.ctx.strokeStyle = colors.stroke; // Use theme-appropriate stroke color
      this.ctx.lineWidth = 2; // Make sure all strokes are visible
      if (shape.type === "rect") {
        this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type === "circle") {
        this.ctx.beginPath();
        this.ctx.arc(
          shape.centerX,
          shape.centerY,
          Math.abs(shape.radius),
          0,
          Math.PI * 2
        );
        this.ctx.stroke();
        this.ctx.closePath();
      } else if (shape.type === "pencil" && shape.points.length > 0) {
        this.ctx.beginPath();
        this.ctx.moveTo(shape.points[0].x, shape.points[0].y);
        for (let i = 1; i < shape.points.length; i++) {
          this.ctx.lineTo(shape.points[i].x, shape.points[i].y);
        }
        this.ctx.stroke();
        this.ctx.closePath();
      } else if (shape.type === "line") {
        this.ctx.beginPath();
        this.ctx.moveTo(shape.startX, shape.startY);
        this.ctx.lineTo(shape.endX, shape.endY);
        this.ctx.stroke();
        this.ctx.closePath();
      } else if (shape.type === "arrow") {
        this.ctx.beginPath();
        this.ctx.moveTo(shape.startX, shape.startY);
        this.ctx.lineTo(shape.endX, shape.endY);
        // Draw arrowhead
        const headlen = 15; // length of arrow head
        const dx = shape.endX - shape.startX;
        const dy = shape.endY - shape.startY;
        const angle = Math.atan2(dy, dx);
        this.ctx.lineTo(shape.endX, shape.endY);
        this.ctx.moveTo(shape.endX, shape.endY);
        this.ctx.lineTo(
          shape.endX - headlen * Math.cos(angle - Math.PI / 6),
          shape.endY - headlen * Math.sin(angle - Math.PI / 6)
        );
        this.ctx.moveTo(shape.endX, shape.endY);
        this.ctx.lineTo(
          shape.endX - headlen * Math.cos(angle + Math.PI / 6),
          shape.endY - headlen * Math.sin(angle + Math.PI / 6)
        );
        this.ctx.stroke();
        this.ctx.closePath();
      } else if (shape.type === "diamond") {
        this.ctx.beginPath();
        const halfWidth = Math.abs(shape.width) / 2;
        const halfHeight = Math.abs(shape.height) / 2;
        // Draw diamond by connecting 4 points
        this.ctx.moveTo(shape.centerX, shape.centerY - halfHeight); // top
        this.ctx.lineTo(shape.centerX + halfWidth, shape.centerY); // right
        this.ctx.lineTo(shape.centerX, shape.centerY + halfHeight); // bottom
        this.ctx.lineTo(shape.centerX - halfWidth, shape.centerY); // left
        this.ctx.closePath();
        this.ctx.stroke();
      }
    });
  }

  mouseDownHandler = (e: MouseEvent) => {
    this.clicked = true;
    const rect = this.canvas.getBoundingClientRect();
    this.startX = e.clientX - rect.left;
    this.startY = e.clientY - rect.top;

    if (this.selectedTool === "pencil") {
      this.currentPencilPath = [{ x: this.startX, y: this.startY }];
    }
    if (this.selectedTool === "erase") {
      // Erase: find and remove shapes near click
      const threshold = 20;

      // Special handling for lines and arrows - remove ALL that match
      const linesToRemove: number[] = [];
      let shapeToRemoveIndex = -1; // First pass: find all lines and arrows to remove
      for (let i = 0; i < this.existingShapes.length; i++) {
        const shape = this.existingShapes[i];
        if (shape.type === "line" || shape.type === "arrow") {
          const dist = pointToLineDist(
            this.startX,
            this.startY,
            shape.startX,
            shape.startY,
            shape.endX,
            shape.endY
          );
          if (dist <= threshold) {
            linesToRemove.push(i);
          }
        }
      }

      // Remove all matching lines/arrows (in reverse order to maintain indices)
      for (let i = linesToRemove.length - 1; i >= 0; i--) {
        this.existingShapes.splice(linesToRemove[i], 1);
      }

      // If no lines were removed, check for other shapes (topmost only)
      if (linesToRemove.length === 0) {
        // Find the last (topmost) shape that matches the click for other shapes
        for (let i = this.existingShapes.length - 1; i >= 0; i--) {
          const shape = this.existingShapes[i];
          let shouldRemove = false;

          if (shape.type === "rect") {
            // Handle rectangles with potentially negative width/height
            const rectLeft = Math.min(shape.x, shape.x + shape.width);
            const rectRight = Math.max(shape.x, shape.x + shape.width);
            const rectTop = Math.min(shape.y, shape.y + shape.height);
            const rectBottom = Math.max(shape.y, shape.y + shape.height);

            shouldRemove =
              this.startX >= rectLeft - threshold &&
              this.startX <= rectRight + threshold &&
              this.startY >= rectTop - threshold &&
              this.startY <= rectBottom + threshold;
          } else if (shape.type === "circle") {
            const dist = Math.sqrt(
              Math.pow(this.startX - shape.centerX, 2) +
                Math.pow(this.startY - shape.centerY, 2)
            );
            shouldRemove = dist <= shape.radius + threshold;
          } else if (shape.type === "pencil") {
            // Check if any point in path is close
            shouldRemove = shape.points.some(
              (pt) =>
                Math.abs(pt.x - this.startX) < threshold &&
                Math.abs(pt.y - this.startY) < threshold
            );
          } else if (shape.type === "diamond") {
            // Check if click is inside diamond bounds
            const halfWidth = Math.abs(shape.width) / 2;
            const halfHeight = Math.abs(shape.height) / 2;
            shouldRemove =
              this.startX >= shape.centerX - halfWidth - threshold &&
              this.startX <= shape.centerX + halfWidth + threshold &&
              this.startY >= shape.centerY - halfHeight - threshold &&
              this.startY <= shape.centerY + halfHeight + threshold;
          }

          if (shouldRemove) {
            shapeToRemoveIndex = i;
            break; // Remove only the topmost matching shape for non-line shapes
          }
        }

        // Remove the found shape if any
        if (shapeToRemoveIndex !== -1) {
          this.existingShapes.splice(shapeToRemoveIndex, 1);
        }
      }

      // Broadcast the erasing event if any changes were made
      if (
        linesToRemove.length > 0 ||
        (linesToRemove.length === 0 && shapeToRemoveIndex !== -1)
      ) {
        this.saveToLocalStorage(); // Save to localStorage when shapes are erased
        this.broadcastErase();
      }

      this.clearCanvas();
    }
  };
  mouseUpHandler = (e: MouseEvent) => {
    this.clicked = false;
    const rect = this.canvas.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;
    const width = endX - this.startX;
    const height = endY - this.startY;

    const selectedTool = this.selectedTool;
    let shape: Shape | null = null;

    if (selectedTool === "rect") {
      shape = {
        type: "rect",
        x: this.startX,
        y: this.startY,
        height,
        width,
      };
    } else if (selectedTool === "circle") {
      const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
      shape = {
        type: "circle",
        radius: radius,
        centerX: this.startX + width / 2,
        centerY: this.startY + height / 2,
      };
    } else if (selectedTool === "pencil" && this.currentPencilPath.length > 0) {
      shape = {
        type: "pencil",
        points: [...this.currentPencilPath],
      };
      this.currentPencilPath = [];
    } else if (selectedTool === "line") {
      shape = {
        type: "line",
        startX: this.startX,
        startY: this.startY,
        endX: endX,
        endY: endY,
      };
    } else if (selectedTool === "arrow") {
      shape = {
        type: "arrow",
        startX: this.startX,
        startY: this.startY,
        endX: endX,
        endY: endY,
      };
    } else if (selectedTool === "diamond") {
      shape = {
        type: "diamond",
        centerX: this.startX + width / 2,
        centerY: this.startY + height / 2,
        width: width,
        height: height,
      };
    }

    if (!shape) {
      return;
    }

    this.existingShapes.push(shape);
    this.saveToLocalStorage(); // Save to localStorage when shape is added
    this.broadcastShape(shape);
    this.clearCanvas();
  };
  mouseMoveHandler = (e: MouseEvent) => {
    if (this.clicked) {
      const rect = this.canvas.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      if (this.selectedTool === "pencil") {
        // Add point to current path
        this.currentPencilPath.push({ x: currentX, y: currentY });

        // Draw the line segment
        const colors = this.getThemeColors();
        this.ctx.strokeStyle = colors.stroke; // Use theme-appropriate color
        this.ctx.lineWidth = 2; // Make sure line is visible
        this.ctx.beginPath();
        if (this.currentPencilPath.length > 1) {
          const prevPoint =
            this.currentPencilPath[this.currentPencilPath.length - 2];
          this.ctx.moveTo(prevPoint.x, prevPoint.y);
          this.ctx.lineTo(currentX, currentY);
        }
        this.ctx.stroke();
        this.ctx.closePath();
      } else {
        // Handle rect, circle, line, arrow preview
        const width = currentX - this.startX;
        const height = currentY - this.startY;
        this.clearCanvas();

        const colors = this.getThemeColors();
        this.ctx.strokeStyle = colors.stroke; // Use theme-appropriate color
        const selectedTool = this.selectedTool;
        if (selectedTool === "rect") {
          this.ctx.strokeRect(this.startX, this.startY, width, height);
        } else if (selectedTool === "circle") {
          const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
          const centerX = this.startX + width / 2;
          const centerY = this.startY + height / 2;
          this.ctx.beginPath();
          this.ctx.arc(centerX, centerY, Math.abs(radius), 0, Math.PI * 2);
          this.ctx.stroke();
          this.ctx.closePath();
        } else if (selectedTool === "line") {
          this.ctx.beginPath();
          this.ctx.moveTo(this.startX, this.startY);
          this.ctx.lineTo(currentX, currentY);
          this.ctx.stroke();
          this.ctx.closePath();
        } else if (selectedTool === "arrow") {
          this.ctx.beginPath();
          this.ctx.moveTo(this.startX, this.startY);
          this.ctx.lineTo(currentX, currentY);
          // Draw arrowhead
          const headlen = 15;
          const dx = currentX - this.startX;
          const dy = currentY - this.startY;
          const angle = Math.atan2(dy, dx);
          this.ctx.lineTo(currentX, currentY);
          this.ctx.moveTo(currentX, currentY);
          this.ctx.lineTo(
            currentX - headlen * Math.cos(angle - Math.PI / 6),
            currentY - headlen * Math.sin(angle - Math.PI / 6)
          );
          this.ctx.moveTo(currentX, currentY);
          this.ctx.lineTo(
            currentX - headlen * Math.cos(angle + Math.PI / 6),
            currentY - headlen * Math.sin(angle + Math.PI / 6)
          );
          this.ctx.stroke();
          this.ctx.closePath();
        } else if (selectedTool === "diamond") {
          this.ctx.beginPath();
          const centerX = this.startX + width / 2;
          const centerY = this.startY + height / 2;
          const halfWidth = Math.abs(width) / 2;
          const halfHeight = Math.abs(height) / 2;
          // Draw diamond preview
          this.ctx.moveTo(centerX, centerY - halfHeight); // top
          this.ctx.lineTo(centerX + halfWidth, centerY); // right
          this.ctx.lineTo(centerX, centerY + halfHeight); // bottom
          this.ctx.lineTo(centerX - halfWidth, centerY); // left
          this.ctx.closePath();
          this.ctx.stroke();
        }
      }
    }
  };

  initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);

    this.canvas.addEventListener("mouseup", this.mouseUpHandler);

    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
  }

  initWebSocket() {
    try {
      this.socket = new WebSocket(WS_URL);

      this.socket.onopen = () => {
        console.log("WebSocket connected for room:", this.roomId);
        // Join the room
        this.sendMessage({
          type: "join-room",
          roomId: this.roomId,
        });
      };

      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleWebSocketMessage(message);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      this.socket.onclose = () => {
        console.log("WebSocket disconnected");
        // Attempt to reconnect after 3 seconds
        setTimeout(() => {
          if (!this.socket || this.socket.readyState === WebSocket.CLOSED) {
            this.initWebSocket();
          }
        }, 3000);
      };

      this.socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    } catch (error) {
      console.error("Failed to initialize WebSocket:", error);
    }
  }

  handleWebSocketMessage(message: any) {
    if (message.type === "shape-added" && message.roomId === this.roomId) {
      // Add the shape from other users
      this.existingShapes.push(message.shape);
      this.saveToLocalStorage(); // Save to localStorage when shape is added from other users
      this.clearCanvas();
    } else if (
      message.type === "shapes-erased" &&
      message.roomId === this.roomId
    ) {
      // Handle erasing from other users
      this.existingShapes = message.shapes;
      this.saveToLocalStorage(); // Save to localStorage when shapes are erased by other users
      this.clearCanvas();
    } else if (
      message.type === "canvas-data-shared" &&
      message.targetRoomId === this.roomId
    ) {
      // Handle shared canvas data from another room
      if (message.shapes && Array.isArray(message.shapes)) {
        this.existingShapes = [...this.existingShapes, ...message.shapes];
        this.saveToLocalStorage();
        this.clearCanvas();
        console.log('Received shared canvas data:', message.shapes.length, 'shapes');
      }
    }
  }

  broadcastShape(shape: Shape) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.sendMessage({
        type: "shape-added",
        roomId: this.roomId,
        shape: shape,
      });
    }
  }

  broadcastErase() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.sendMessage({
        type: "shapes-erased",
        roomId: this.roomId,
        shapes: this.existingShapes,
      });
    }
  }

  private sendMessage(message: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }
}

// Helper for erase: distance from point to line segment
function pointToLineDist(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const len_sq = C * C + D * D;
  let param = -1;
  if (len_sq !== 0) param = dot / len_sq;

  let xx, yy;
  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = px - xx;
  const dy = py - yy;
  return Math.sqrt(dx * dx + dy * dy);
}
