"use client"
import { useEffect, useRef, useState } from "react";
import { IconButton } from "./IconButton";
import { Circle, Pencil, RectangleHorizontalIcon, ArrowRight, Eraser, Minus, Diamond, Sun, Moon, Trash2, Download, Share2 } from "lucide-react";
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
    const [showShareModal, setShowShareModal] = useState(false);
    const [generatedRoomId, setGeneratedRoomId] = useState<string>("");

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

    // Generate random room ID
    const generateRoomId = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    // Share canvas functionality
    const shareCanvas = () => {
        if (game) {
            const newRoomId = generateRoomId();
            setGeneratedRoomId(newRoomId);
            setShowShareModal(true);
        }
    };

    // Handle share option selection
    const handleShareOption = (includeCurrentData: boolean) => {
        if (game && generatedRoomId) {
            if (includeCurrentData) {
                // Get current canvas data and send to WebSocket server for the new room
                const currentShapes = game.getCurrentShapes();
                game.sendShapesToRoom(generatedRoomId, currentShapes);
            }
            
            // Store the canvas data in localStorage for the new room
            const canvasData = game.exportCanvasData();
            const storageKey = `canvas_data_${generatedRoomId}`;
            localStorage.setItem(storageKey, canvasData);
            
            // Generate the sharing URL
            const baseUrl = window.location.origin;
            const shareUrl = `${baseUrl}/canvas/${generatedRoomId}`;
            
            // Copy to clipboard
            navigator.clipboard.writeText(shareUrl).then(() => {
                // Create a temporary notification
                const notification = document.createElement('div');
                notification.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: ${themeColors[theme].ui};
                    color: ${themeColors[theme].text};
                    border: 1px solid ${themeColors[theme].border};
                    border-radius: 8px;
                    padding: 16px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    z-index: 1000;
                    max-width: 300px;
                    font-size: 14px;
                `;
                notification.innerHTML = `
                    <div style="font-weight: 600; margin-bottom: 8px;">Canvas Shared!</div>
                    <div style="margin-bottom: 12px; word-break: break-all;">${shareUrl}</div>
                    <div style="color: ${themeColors[theme].text === '#ffffff' ? '#10b981' : '#059669'}; font-size: 12px;">
                        ✓ Link copied to clipboard
                    </div>
                    <div style="color: ${themeColors[theme].text === '#ffffff' ? '#fbbf24' : '#d97706'}; font-size: 12px; margin-top: 8px;">
                        ${includeCurrentData ? '📋 Canvas data included' : '🆕 Blank canvas'}
                    </div>
                `;
                document.body.appendChild(notification);
                
                // Remove notification after 4 seconds
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 4000);
            }).catch(() => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = shareUrl;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                
                // Show fallback notification
                const notification = document.createElement('div');
                notification.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: ${themeColors[theme].ui};
                    color: ${themeColors[theme].text};
                    border: 1px solid ${themeColors[theme].border};
                    border-radius: 8px;
                    padding: 16px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    z-index: 1000;
                    max-width: 300px;
                    font-size: 14px;
                `;
                notification.innerHTML = `
                    <div style="font-weight: 600; margin-bottom: 8px;">Canvas Shared!</div>
                    <div style="margin-bottom: 12px; word-break: break-all;">${shareUrl}</div>
                    <div style="color: ${themeColors[theme].text === '#ffffff' ? '#10b981' : '#059669'}; font-size: 12px;">
                        ✓ Link copied to clipboard
                    </div>
                    <div style="color: ${themeColors[theme].text === '#ffffff' ? '#fbbf24' : '#d97706'}; font-size: 12px; margin-top: 8px;">
                        ${includeCurrentData ? '📋 Canvas data included' : '🆕 Blank canvas'}
                    </div>
                `;
                document.body.appendChild(notification);
                
                // Remove notification after 4 seconds
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 4000);
            });
            
            // Navigate to the new room
            window.location.href = `/canvas/${generatedRoomId}`;
        }
        
        setShowShareModal(false);
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
            shareCanvas={shareCanvas}
        />
        
        {/* Share Modal */}
        {showShareModal && (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2000
            }}>
                <div style={{
                    background: themeColors[theme].ui,
                    border: `1px solid ${themeColors[theme].border}`,
                    borderRadius: '12px',
                    padding: '24px',
                    maxWidth: '400px',
                    width: '90%',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                }}>
                    <h3 style={{
                        margin: '0 0 16px 0',
                        color: themeColors[theme].text,
                        fontSize: '18px',
                        fontWeight: '600'
                    }}>
                        Share Canvas
                    </h3>
                    
                    <p style={{
                        margin: '0 0 20px 0',
                        color: themeColors[theme].text,
                        fontSize: '14px',
                        lineHeight: '1.5'
                    }}>
                        Do you want to include the current canvas data in the new room?
                    </p>
                    
                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        marginBottom: '20px'
                    }}>
                        <div style={{
                            flex: 1,
                            padding: '16px',
                            border: `2px solid ${themeColors[theme].border}`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            backgroundColor: themeColors[theme].background
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = themeColors[theme].text === '#ffffff' ? '#3b82f6' : '#1d4ed8';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = themeColors[theme].border;
                        }}
                        onClick={() => handleShareOption(true)}>
                            <div style={{
                                fontSize: '24px',
                                marginBottom: '8px'
                            }}>📋</div>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: themeColors[theme].text,
                                marginBottom: '4px'
                            }}>Include Data</div>
                            <div style={{
                                fontSize: '12px',
                                color: themeColors[theme].text === '#ffffff' ? '#a1a1aa' : '#6b7280'
                            }}>
                                Other users will see all current drawings
                            </div>
                        </div>
                        
                        <div style={{
                            flex: 1,
                            padding: '16px',
                            border: `2px solid ${themeColors[theme].border}`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            backgroundColor: themeColors[theme].background
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = themeColors[theme].text === '#ffffff' ? '#3b82f6' : '#1d4ed8';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = themeColors[theme].border;
                        }}
                        onClick={() => handleShareOption(false)}>
                            <div style={{
                                fontSize: '24px',
                                marginBottom: '8px'
                            }}>🆕</div>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: themeColors[theme].text,
                                marginBottom: '4px'
                            }}>Blank Canvas</div>
                            <div style={{
                                fontSize: '12px',
                                color: themeColors[theme].text === '#ffffff' ? '#a1a1aa' : '#6b7280'
                            }}>
                                Start with a clean slate
                            </div>
                        </div>
                    </div>
                    
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center'
                    }}>
                        <button
                            onClick={() => setShowShareModal(false)}
                            style={{
                                background: 'transparent',
                                border: `1px solid ${themeColors[theme].border}`,
                                color: themeColors[theme].text,
                                padding: '8px 16px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = themeColors[theme].border;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }}>
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
}

function Topbar({
    selectedTool, 
    setSelectedTool, 
    theme, 
    setTheme, 
    themeColors,
    clearCanvasAndStorage,
    exportCanvasAsImage,
    shareCanvas
}: {
    selectedTool: Tool,
    setSelectedTool: (s: Tool) => void,
    theme: Theme,
    setTheme: (t: Theme) => void,
    themeColors: ThemeColors,
    clearCanvasAndStorage: () => void,
    exportCanvasAsImage: () => void,
    shareCanvas: () => void
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
                
                {/* Share canvas */}
                <IconButton 
                    onClick={shareCanvas}
                    activated={false}
                    icon={<Share2 size={20} />}
                    theme={theme}
                    tooltip="Share Canvas"
                />
            </div>
        </div>
}