import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background to-muted py-20 lg:py-32">
      <div className="container px-4 mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-primary leading-tight">Sketch, Collaborate, Create</h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                The intuitive whiteboard tool that brings your ideas to life with hand-drawn style diagrams and seamless
                team collaboration.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                Try It Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
              >
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </Button>
            </div>

            <div className="flex items-center space-x-8 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Free to start</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>No downloads</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Real-time sync</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative bg-card rounded-2xl shadow-2xl p-8 border">
              <img
                src="/placeholder.svg?height=400&width=600"
                alt="SketchBoard collaborative whiteboard interface"
                className="w-full h-auto rounded-lg"
              />
              <div className="absolute -top-4 -right-4 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-medium">
                Live Demo
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
