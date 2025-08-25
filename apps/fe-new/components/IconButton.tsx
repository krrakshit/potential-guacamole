import { ReactNode } from "react";

export function IconButton({
    icon, onClick, activated, theme = "dark"
}: {
    icon: ReactNode,
    onClick: () => void,
    activated: boolean,
    theme?: "light" | "dark"
}) {
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

    return <div 
        className={`m-1 cursor-pointer rounded-lg border p-2 transition-colors ${styles.bg} ${styles.text} ${styles.border}`} 
        onClick={onClick}
    >
        {icon}
    </div>
}
