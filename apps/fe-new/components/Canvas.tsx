"use client"
import { useEffect, useRef, useState } from "react";
import { IconButton } from "./IconButton";
import { Circle, Pencil, RectangleHorizontalIcon, ArrowRight, Eraser, Minus, Diamond, Sun, Moon, Trash2, Download } from "lucide-react";
import { Game } from "@/draw/Game";

export type Tool = "circle" | "rect" | "pencil" | "line" | "arrow" | "erase" | "diamond";
export type Theme = "light" | "dark";

export type ThemeColors = {
    dark: {
        background: string;
        canvas: string;
        ui: string;
        text: string;
        border: string;
    };
    light: {
        background: string;
        canvas: string;
        ui: string;
        text: string;
        border: string;
    };
};

export function Canvas({
    roomId,
}: {
    roomId: string | null;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [game, setGame] = useState<Game>();
    const [selectedTool, setSelectedTool] = useState<Tool>("pencil"); // Default to pencil
    const [theme, setTheme] = useState<Theme>("dark");
    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

    const themeColors = {
        dark: {
            background: "#000000",
            canvas: "#1a1a1a",
            ui: "#2a2a2a",
            text: "#ffffff",
            border: "#404040"
        },
        light: {
            background: "#ffffff",
            canvas: "#f8f9fa",
            ui: "#ffffff",
            text: "#000000",
            border: "#e0e0e0"
        }
    };

    // Local storage management functions
    const clearCanvasAndStorage = () => {
        if (game) {
            game.clearCanvasAndStorage();
        }
    };

    const exportCanvasAsImage = () => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            const link = document.createElement('a');
            link.download = `canvas_${roomId || 'default'}.png`;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };



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
        game?.setTheme(theme);
    }, [theme, game]);

    useEffect(() => {
        if (canvasRef.current && !game) {
            const g = new Game(canvasRef.current, roomId || "", selectedTool, theme);
            setGame(g);

            return () => {
                g.destroy();
            }
        }
    }, [canvasRef, roomId]); // Only recreate when canvas ref or roomId changes

    // Handle canvas resize without recreating Game
    useEffect(() => {
        if (game) {
            game.handleResize();
        }
    }, [canvasSize, game]); // Removed selectedTool from dependencies

    return <div style={{
        height: "100vh",
        overflow: "hidden",
        backgroundColor: themeColors[theme].background
    }}>
        <canvas 
            ref={canvasRef} 
            width={canvasSize.width} 
            height={canvasSize.height}
            style={{ backgroundColor: themeColors[theme].canvas }}
        ></canvas>
        <Topbar 
            setSelectedTool={setSelectedTool} 
            selectedTool={selectedTool}
            theme={theme}
            setTheme={setTheme}
            themeColors={themeColors}
            clearCanvasAndStorage={clearCanvasAndStorage}
            exportCanvasAsImage={exportCanvasAsImage}
        />
    </div>
}

function Topbar({
    selectedTool, 
    setSelectedTool, 
    theme, 
    setTheme, 
    themeColors,
    clearCanvasAndStorage,
    exportCanvasAsImage
}: {
    selectedTool: Tool,
    setSelectedTool: (s: Tool) => void,
    theme: Theme,
    setTheme: (t: Theme) => void,
    themeColors: ThemeColors,
    clearCanvasAndStorage: () => void,
    exportCanvasAsImage: () => void
}) {
    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    return <div style={{
            position: "fixed",
            top: 10,
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: themeColors[theme].ui,
            border: `1px solid ${themeColors[theme].border}`,
            borderRadius: "6px",
            padding: "8px 16px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
        }}>
            <div className="flex gap-1">
                <IconButton 
                    onClick={() => setSelectedTool("pencil")}
                    activated={selectedTool === "pencil"}
                    icon={<Pencil size={20} />}
                    theme={theme}
                    tooltip="Pencil"
                />
                <IconButton onClick={() => setSelectedTool("rect")}
                    activated={selectedTool === "rect"}
                    icon={<RectangleHorizontalIcon size={20} />}
                    theme={theme}
                    tooltip="Rectangle" />
                <IconButton onClick={() => setSelectedTool("circle")}
                    activated={selectedTool === "circle"}
                    icon={<Circle size={20} />}
                    theme={theme}
                    tooltip="Circle" />
                <IconButton onClick={() => setSelectedTool("diamond")}
                    activated={selectedTool === "diamond"}
                    icon={<Diamond size={20} />}
                    theme={theme}
                    tooltip="Diamond" />
                <IconButton onClick={() => setSelectedTool("line")}
                    activated={selectedTool === "line"}
                    icon={<Minus size={20} />}
                    theme={theme}
                    tooltip="Line" />
                <IconButton onClick={() => setSelectedTool("arrow")}
                    activated={selectedTool === "arrow"}
                    icon={<ArrowRight size={20} />}
                    theme={theme}
                    tooltip="Arrow" />
                <IconButton onClick={() => setSelectedTool("erase")}
                    activated={selectedTool === "erase"}
                    icon={<Eraser size={20} />}
                    theme={theme}
                    tooltip="Eraser" />
                
                {/* Theme toggle separator and button */}
                <div style={{
                    width: "1px",
                    height: "28px",
                    backgroundColor: themeColors[theme].border,
                    margin: "0 2px"
                }}></div>
                
                <IconButton 
                    onClick={toggleTheme}
                    activated={false}
                    icon={theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                    theme={theme}
                    tooltip={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                />
                
                {/* Local storage controls separator */}
                <div style={{
                    width: "1px",
                    height: "28px",
                    backgroundColor: themeColors[theme].border,
                    margin: "0 2px"
                }}></div>
                
                {/* Clear canvas and storage */}
                <IconButton 
                    onClick={clearCanvasAndStorage}
                    activated={false}
                    icon={<Trash2 size={20} />}
                    theme={theme}
                    tooltip="Clear Canvas"
                />
                
                {/* Export canvas as image */}
                <IconButton 
                    onClick={exportCanvasAsImage}
                    activated={false}
                    icon={<Download size={20} />}
                    theme={theme}
                    tooltip="Export as Image"
                />
            </div>
        </div>
}