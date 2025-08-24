import { Canvas } from "@/components/Canvas";

export default async function CanvasPage() {
    const roomId = "default-canvas";

    return <Canvas roomId={roomId}/>
   
}