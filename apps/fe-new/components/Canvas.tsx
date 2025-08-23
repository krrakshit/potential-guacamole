"use client"
import { useEffect, useRef, useState } from "react";
import { IconButton } from "./IconButton";
import { Circle, Pencil, RectangleHorizontalIcon } from "lucide-react";
import { Game } from "@/draw/Game";

export type Tool = "circle" | "rect" | "pencil";

export function Canvas({
    roomId,
}: {
    roomId: string;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [game, setGame] = useState<Game>();
    const [selectedTool, setSelectedTool] = useState<Tool>("circle");
    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

    // Handle window resize and set initial canvas size
    useEffect(() => {
        const updateCanvasSize = () => {
            setCanvasSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        // Set initial size
        updateCanvasSize();

        // Add resize listener
        window.addEventListener('resize', updateCanvasSize);

        return () => {
            window.removeEventListener('resize', updateCanvasSize);
        };
    }, []);

    useEffect(() => {
        game?.setTool(selectedTool);
    }, [selectedTool, game]);

    useEffect(() => {
        if (canvasRef.current) {
            const g = new Game(canvasRef.current, roomId);
            setGame(g);

            // Set canvas background to black
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
            }

            return () => {
                g.destroy();
            }
        }
    }, [canvasRef, roomId, canvasSize]);

    return <div style={{
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "black"
    }}>
        <canvas 
            ref={canvasRef} 
            width={canvasSize.width} 
            height={canvasSize.height}
            style={{ backgroundColor: "black" }}
        ></canvas>
        <Topbar setSelectedTool={setSelectedTool} selectedTool={selectedTool} />
    </div>
}

function Topbar({selectedTool, setSelectedTool}: {
    selectedTool: Tool,
    setSelectedTool: (s: Tool) => void
}) {
    return <div style={{
            position: "fixed",
            top: 10,
            left: 10
        }}>
            <div className="flex gap-t">
                <IconButton 
                    onClick={() => {
                        setSelectedTool("pencil")
                    }}
                    activated={selectedTool === "pencil"}
                    icon={<Pencil />}
                />
                <IconButton onClick={() => {
                    setSelectedTool("rect")
                }} activated={selectedTool === "rect"} icon={<RectangleHorizontalIcon />} ></IconButton>
                <IconButton onClick={() => {
                    setSelectedTool("circle")
                }} activated={selectedTool === "circle"} icon={<Circle />}></IconButton>
            </div>
        </div>
}