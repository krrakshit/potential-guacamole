import { ReactNode, useState } from "react";

export function IconButton({
    icon, onClick, activated, theme = "dark", tooltip
}: {
    icon: ReactNode,
    onClick: () => void,
    activated: boolean,
    theme?: "light" | "dark",
    tooltip?: string
}) {
    const [showTooltip, setShowTooltip] = useState(false);
    
    const themeStyles = {
        dark: {
            bg: activated ? "bg-gray-700" : "bg-gray-800 hover:bg-gray-700",
            text: activated ? "text-blue-400" : "text-white",
            border: "border-gray-600"
        },
        light: {
            bg: activated ? "bg-blue-100" : "bg-white hover:bg-gray-100",
            text: activated ? "text-blue-600" : "text-gray-700",
            border: "border-gray-300"
        }
    };

    const styles = themeStyles[theme];

    return (
        <div 
            className="relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <div 
                className={`cursor-pointer rounded-md border p-2 transition-colors ${styles.bg} ${styles.text} ${styles.border}`} 
                onClick={onClick}
            >
                {icon}
            </div>
            
            {tooltip && showTooltip && (
                <div 
                    className="absolute z-50 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg whitespace-nowrap"
                    style={{
                        bottom: '-40px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        pointerEvents: 'none'
                    }}
                >
                    {tooltip}
                    <div 
                        className="absolute w-2 h-2 bg-gray-900 transform rotate-45"
                        style={{
                            bottom: '100%',
                            left: '50%',
                            marginLeft: '-4px',
                            marginBottom: '-2px'
                        }}
                    />
                </div>
            )}
        </div>
    );
}
