import { Button } from "@/components/ui/button"
import { Pen } from "lucide-react"
import Link from "next/link"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
            <Pen className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-primary">SketchBoard</span>
        </div>

        <div className="flex items-center space-x-4">
          <Link href="/canvas">
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
