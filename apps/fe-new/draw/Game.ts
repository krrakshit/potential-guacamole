import { Tool } from "@/components/Canvas";
import { getExistingShapes } from "./http";

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
    };

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private existingShapes: Shape[];
  private roomId: string;
  private clicked: boolean;
  private startX = 0;
  private startY = 0;
  private selectedTool: Tool = "circle";
  private currentPencilPath: { x: number; y: number }[] = [];

  constructor(canvas: HTMLCanvasElement, roomId: string) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.existingShapes = [];
    this.roomId = roomId;
    this.clicked = false;
    this.init();
    this.initMouseHandlers();
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);

    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);

    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
  }

  setTool(tool: "circle" | "pencil" | "rect") {
    this.selectedTool = tool;
  }

  async init() {
    this.existingShapes = await getExistingShapes(this.roomId);
    console.log(this.existingShapes);
    this.clearCanvas();
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "rgba(0, 0, 0, 1)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.existingShapes.map((shape) => {
      if (shape.type === "rect") {
        this.ctx.strokeStyle = "rgba(255, 255, 255, 1)";
        this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type === "circle") {
        console.log(shape);
        this.ctx.strokeStyle = "rgba(255, 255, 255, 1)";
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
        this.ctx.strokeStyle = "rgba(255, 255, 255, 1)";
        this.ctx.beginPath();
        this.ctx.moveTo(shape.points[0].x, shape.points[0].y);
        for (let i = 1; i < shape.points.length; i++) {
          this.ctx.lineTo(shape.points[i].x, shape.points[i].y);
        }
        this.ctx.stroke();
        this.ctx.closePath();
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
    }

    if (!shape) {
      return;
    }

    this.existingShapes.push(shape);
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
        this.ctx.strokeStyle = "rgba(255, 255, 255, 1)";
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
        // Handle rect and circle preview
        const width = currentX - this.startX;
        const height = currentY - this.startY;
        this.clearCanvas();
        this.ctx.strokeStyle = "rgba(255, 255, 255, 1)";
        const selectedTool = this.selectedTool;
        console.log(selectedTool);
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
        }
      }
    }
  };

  initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);

    this.canvas.addEventListener("mouseup", this.mouseUpHandler);

    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
  }
}
