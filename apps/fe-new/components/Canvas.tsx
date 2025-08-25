"use client"
import { useEffect, useRef, useState } from "react";
import { IconButton } from "./IconButton";
import { Circle, Pencil, RectangleHorizontalIcon, ArrowRight, Eraser, Minus, Diamond, Sun, Moon } from "lucide-react";
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
    roomId: string;
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
            const g = new Game(canvasRef.current, roomId, selectedTool, theme);
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
        />
    </div>
}

function Topbar({
    selectedTool, 
    setSelectedTool, 
    theme, 
    setTheme, 
    themeColors
}: {
    selectedTool: Tool,
    setSelectedTool: (s: Tool) => void,
    theme: Theme,
    setTheme: (t: Theme) => void,
    themeColors: ThemeColors
}) {
    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    return <div style={{
            position: "fixed",
            top: 10,
            left: 10,
            backgroundColor: themeColors[theme].ui,
            border: `1px solid ${themeColors[theme].border}`,
            borderRadius: "8px",
            padding: "8px"
        }}>
            <div className="flex gap-1">
                <IconButton 
                    onClick={() => setSelectedTool("pencil")}
                    activated={selectedTool === "pencil"}
                    icon={<Pencil />}
                    theme={theme}
                />
                <IconButton onClick={() => setSelectedTool("rect")}
                    activated={selectedTool === "rect"}
                    icon={<RectangleHorizontalIcon />}
                    theme={theme} />
                <IconButton onClick={() => setSelectedTool("circle")}
                    activated={selectedTool === "circle"}
                    icon={<Circle />}
                    theme={theme} />
                <IconButton onClick={() => setSelectedTool("diamond")}
                    activated={selectedTool === "diamond"}
                    icon={<Diamond />}
                    theme={theme} />
                <IconButton onClick={() => setSelectedTool("line")}
                    activated={selectedTool === "line"}
                    icon={<Minus />}
                    theme={theme} />
                <IconButton onClick={() => setSelectedTool("arrow")}
                    activated={selectedTool === "arrow"}
                    icon={<ArrowRight />}
                    theme={theme} />
                <IconButton onClick={() => setSelectedTool("erase")}
                    activated={selectedTool === "erase"}
                    icon={<Eraser />}
                    theme={theme} />
                
                {/* Theme toggle separator and button */}
                <div style={{
                    width: "1px",
                    height: "32px",
                    backgroundColor: themeColors[theme].border,
                    margin: "0 4px"
                }}></div>
                
                <IconButton 
                    onClick={toggleTheme}
                    activated={false}
                    icon={theme === "dark" ? <Sun /> : <Moon />}
                    theme={theme}
                />
            </div>
        </div>
}